"""
Database models and session management for Neon Serverless Postgres.

Handles chat history persistence with async SQLAlchemy.
Follows OpenAI Constitution: ensures reliable data persistence.
"""
import os
from datetime import datetime
from typing import List, Optional
from pathlib import Path
from sqlalchemy import Column, Integer, String, Text, DateTime, Index
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv
import logging
from typing import AsyncGenerator

# Load .env file from the same directory as this file
# This ensures .env is ALWAYS found regardless of working directory
ENV_PATH = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError(
        f"DATABASE_URL environment variable is required\n"
        f"Checked .env at: {ENV_PATH}\n"
        f"File exists: {ENV_PATH.exists()}"
    )

# Ensure asyncpg driver for async operations
if DATABASE_URL.startswith("postgresql://"):
    # Remove any query parameters that asyncpg doesn't support
    base_url = DATABASE_URL.split("?")[0]
    DATABASE_URL = base_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Create async engine with connection pooling for serverless
# SSL is required for Neon.tech connections
import ssl as ssl_module

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,  # Verify connections before use
    pool_size=5,
    max_overflow=10,
    pool_recycle=3600,  # Recycle connections hourly
    connect_args={
        "ssl": ssl_module.create_default_context(),  # Neon requires SSL
        "server_settings": {
            "application_name": "rag_chatbot"
        }
    }
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


class ChatHistory(Base):
    """
    Chat history table for storing conversation messages.

    Columns:
        id: Auto-incrementing primary key
        session_id: Groups messages by conversation session
        role: Message role (user, assistant, system)
        content: Message text content
        timestamp: When message was created
        language_pref: Language preference (en, ur-roman)
        selected_text: Optional user-selected text from book (max 2000 chars)
    """
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(100), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    language_pref = Column(String(10), default="en", nullable=False)  # en, ur-roman
    selected_text = Column(Text, nullable=True)  # Optional, max 2000 chars

    # Indexes for efficient queries
    __table_args__ = (
        Index('idx_session_timestamp', 'session_id', 'timestamp'),
        Index('idx_timestamp', 'timestamp'),
    )


async def init_db():
    """
    Initialize database tables.

    Creates all tables defined in Base metadata if they don't exist.
    Safe to call multiple times (idempotent).
    """
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting async database session.

    Yields:
        AsyncSession: Database session with automatic cleanup

    Usage:
        @app.post("/endpoint")
        async def endpoint(db: AsyncSession = Depends(get_session)):
            # Use db session
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def save_message(
    session_id: str,
    role: str,
    content: str,
    db: AsyncSession,
    language_pref: str = "en",
    selected_text: Optional[str] = None
) -> ChatHistory:
    """
    Save a single message to chat history.

    Args:
        session_id: Conversation session identifier
        role: Message role (user, assistant, system)
        content: Message text content
        db: Database session
        language_pref: Language preference (en, ur-roman), defaults to "en"
        selected_text: Optional user-selected text from book (max 2000 chars)

    Returns:
        ChatHistory: Saved message record

    Raises:
        Exception: If database write fails
    """
    try:
        message = ChatHistory(
            session_id=session_id,
            role=role,
            content=content,
            timestamp=datetime.utcnow(),
            language_pref=language_pref,
            selected_text=selected_text
        )
        db.add(message)
        await db.commit()
        await db.refresh(message)
        logger.info(f"Saved {role} message for session {session_id} (lang: {language_pref})")
        return message
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to save message: {e}")
        raise


async def load_history(
    session_id: str,
    db: AsyncSession,
    limit: Optional[int] = 50
) -> List[dict]:
    """
    Load conversation history for a session.

    Args:
        session_id: Conversation session identifier
        db: Database session
        limit: Maximum number of messages to retrieve (default 50)

    Returns:
        List[dict]: List of messages with role and content, ordered by timestamp

    Example:
        [
            {"role": "user", "content": "What is...?"},
            {"role": "assistant", "content": "Based on the book..."}
        ]
    """
    try:
        from sqlalchemy import select

        query = (
            select(ChatHistory)
            .where(ChatHistory.session_id == session_id)
            .order_by(ChatHistory.timestamp.asc())
            .limit(limit)
        )

        result = await db.execute(query)
        messages = result.scalars().all()

        history = [
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]

        logger.info(f"Loaded {len(history)} messages for session {session_id}")
        return history
    except Exception as e:
        logger.error(f"Failed to load history: {e}")
        return []


async def get_language_preference(
    session_id: str,
    db: AsyncSession
) -> str:
    """
    Get the most recent language preference for a session.

    Args:
        session_id: Conversation session identifier
        db: Database session

    Returns:
        str: Language preference ('en' or 'ur-roman'), defaults to 'en' if no history

    Example:
        language = await get_language_preference("session_123", db)
        # Returns "en" or "ur-roman"
    """
    try:
        from sqlalchemy import select

        query = (
            select(ChatHistory.language_pref)
            .where(ChatHistory.session_id == session_id)
            .order_by(ChatHistory.timestamp.desc())
            .limit(1)
        )

        result = await db.execute(query)
        language_pref = result.scalar()

        if language_pref:
            logger.info(f"Retrieved language preference '{language_pref}' for session {session_id}")
            return language_pref
        else:
            logger.info(f"No history found for session {session_id}, defaulting to 'en'")
            return "en"
    except Exception as e:
        logger.error(f"Failed to get language preference: {e}")
        return "en"


async def cleanup_old_sessions(db: AsyncSession, days: int = 30):
    """
    Clean up chat history older than specified days.

    Args:
        db: Database session
        days: Delete sessions older than this many days (default 30)

    Note:
        Should be run periodically (e.g., daily cron job) to manage storage.
    """
    try:
        from sqlalchemy import delete
        from datetime import timedelta

        cutoff_date = datetime.utcnow() - timedelta(days=days)

        query = delete(ChatHistory).where(ChatHistory.timestamp < cutoff_date)
        result = await db.execute(query)
        await db.commit()

        logger.info(f"Deleted {result.rowcount} old messages (>{days} days)")
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to cleanup old sessions: {e}")
        raise
