"""
Database models and session management for Neon Serverless Postgres.
Handles chat history persistence with async SQLAlchemy.
"""
import os
import ssl
from datetime import datetime
from typing import List, Optional
from pathlib import Path
from sqlalchemy import Column, Integer, String, Text, DateTime, Index
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv
import logging

# Load .env file with explicit path
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

# Create async engine with connection pooling
# SSL is required for Neon.tech connections
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_recycle=3600,
    connect_args={
        "ssl": ssl.create_default_context(),  # SSL context for Neon
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
    """Chat history table for storing conversation messages."""
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(100), nullable=False, index=True)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index('idx_session_timestamp', 'session_id', 'timestamp'),
    )


async def init_db():
    """Initialize database tables."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


async def get_session() -> AsyncSession:
    """Dependency for getting async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def save_message(
    session_id: str,
    role: str,
    content: str,
    db: AsyncSession
) -> ChatHistory:
    """Save a single message to chat history."""
    try:
        message = ChatHistory(
            session_id=session_id,
            role=role,
            content=content,
            timestamp=datetime.utcnow()
        )
        db.add(message)
        await db.commit()
        await db.refresh(message)
        logger.info(f"Saved {role} message for session {session_id}")
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
    """Load conversation history for a session."""
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
