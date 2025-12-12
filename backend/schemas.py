"""
Pydantic schemas for request/response validation.

Follows OpenAI Constitution: validates all inputs to ensure harmlessness.
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class ChatRequest(BaseModel):
    """
    Request schema for /chat endpoint.

    Attributes:
        message: User's question or query (max 2000 chars)
        selected_text: Optional text selected from book (max 2000 chars)
        session_id: Unique session identifier for conversation history
        language: Language preference ('en' or 'ur-roman')
    """
    message: str = Field(..., min_length=1, max_length=2000, description="User query")
    selected_text: Optional[str] = Field(None, max_length=2000, description="Selected book text")
    session_id: str = Field(..., min_length=1, max_length=100, description="Session ID")
    language: str = Field(default="en", description="Language preference")

    @field_validator('message', 'selected_text')
    @classmethod
    def strip_whitespace(cls, v: Optional[str]) -> Optional[str]:
        """Remove leading/trailing whitespace from text fields."""
        return v.strip() if v else v

    @field_validator('language')
    @classmethod
    def validate_language(cls, v: str) -> str:
        """Validate language is either 'en' or 'ur-roman'."""
        allowed = ["en", "ur-roman"]
        if v not in allowed:
            raise ValueError(f"language must be one of {allowed}, got '{v}'")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "message": "What are the key components of a humanoid robot?",
                "selected_text": "Humanoid robots typically consist of...",
                "session_id": "session_12345"
            }
        }


class ChatResponse(BaseModel):
    """
    Response schema for non-streaming /chat responses.

    Attributes:
        response: Agent's answer grounded in retrieved content
        session_id: Session identifier for tracking
        timestamp: ISO 8601 timestamp of response
    """
    response: str = Field(..., description="Agent's grounded response")
    session_id: str = Field(..., description="Session ID")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "response": "Based on the book content, humanoid robots consist of...",
                "session_id": "session_12345",
                "timestamp": "2025-12-08T10:30:00Z"
            }
        }


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")

    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "version": "1.0.0"
            }
        }
