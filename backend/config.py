# backend/config.py
"""
Environment configuration management with validation.
Loads and validates all required API keys and settings on startup.
"""
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Load .env file
ENV_PATH = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)


class Config:
    """Application configuration loaded from environment variables."""

    # Cohere (Embeddings)
    COHERE_API_KEY: str = os.getenv("COHERE_API_KEY", "")

    # Qdrant Cloud (Vector Database)
    QDRANT_URL: str = os.getenv("QDRANT_URL", "")
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", "")
    COLLECTION_NAME: str = os.getenv("COLLECTION_NAME", "robotics_textbook")

    # LiteLLM / Groq (Primary LLM)
    LITELLM_MODEL: str = os.getenv("LITELLM_MODEL", "groq/llama-3.3-70b-versatile")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

    # Gemini (Fallback LLM)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Neon Postgres (Database)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # App Configuration
    PORT: int = int(os.getenv("PORT", "8000"))
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")
    RATE_LIMIT: int = int(os.getenv("RATE_LIMIT", "10"))

    @classmethod
    def validate(cls) -> None:
        """
        Validate that all required environment variables are set.

        Raises:
            ValueError: If any required variable is missing
        """
        required_vars = {
            "COHERE_API_KEY": cls.COHERE_API_KEY,
            "QDRANT_URL": cls.QDRANT_URL,
            "QDRANT_API_KEY": cls.QDRANT_API_KEY,
            "GROQ_API_KEY": cls.GROQ_API_KEY,
            "DATABASE_URL": cls.DATABASE_URL,
        }

        missing = [key for key, value in required_vars.items() if not value]

        if missing:
            raise ValueError(
                f"Missing required environment variables: {', '.join(missing)}\n"
                f"Please set them in backend/.env file"
            )

    @classmethod
    def get_cors_origins(cls) -> list:
        """Get CORS origins as a list."""
        if cls.CORS_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in cls.CORS_ORIGINS.split(",")]


# Singleton instance
config = Config()
