# backend/main.py
"""
Production RAG Chatbot Backend using LiteLLM + OpenAI SDK.
Handles Groq token limits safely.
"""
import os
import logging
import json
from contextlib import asynccontextmanager
from pathlib import Path

# Load .env FIRST
from dotenv import load_dotenv
ENV_PATH = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, HTMLResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.ext.asyncio import AsyncSession
from litellm import completion

from database import init_db, get_session, save_message, load_history
from schemas import ChatRequest, HealthResponse
from agent import retrieve_chunks

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Validate required environment variables
REQUIRED_ENV_VARS = ["COHERE_API_KEY", "QDRANT_URL", "DATABASE_URL", "GROQ_API_KEY"]
for var in REQUIRED_ENV_VARS:
    if not os.getenv(var):
        raise ValueError(f"Missing required environment variable: {var}")

# LiteLLM configuration
LITELLM_MODEL = os.getenv("LITELLM_MODEL", "groq/llama-3.3-70b-versatile")
os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY", "")

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting RAG chatbot backend...")
    await init_db()
    logger.info("Database initialized")
    yield
    logger.info("Shutting down...")

# Initialize FastAPI
app = FastAPI(
    title="Physical AI & Humanoid Robotics RAG Chatbot",
    description="Production RAG chatbot with LiteLLM",
    version="1.0.0",
    lifespan=lifespan,
)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
origins = [origin.strip() for origin in CORS_ORIGINS.split(",")]
origins.append("http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="healthy", version="1.0.0")

@app.post("/chat")
async def chat_endpoint(
    request_obj: Request,
    chat_request: ChatRequest,
    db: AsyncSession = Depends(get_session),
):
    import time
    try:
        logger.info(f"Chat request from session {chat_request.session_id} (language: {chat_request.language})")

        # Reduce history & chunks to prevent Groq limit
        history = await load_history(chat_request.session_id, db, limit=2)
        await save_message(
            session_id=chat_request.session_id,
            role="user",
            content=chat_request.message,
            db=db,
            language_pref=chat_request.language,
            selected_text=chat_request.selected_text
        )

        retrieval_result = retrieve_chunks(
            query=chat_request.message,
            selected_text=chat_request.selected_text,
            limit=2
        )

        context = retrieval_result["context"]
        embedding_time = retrieval_result["embedding_time"]
        search_time = retrieval_result["search_time"]
        chunks_count = retrieval_result["chunks_count"]

        language_instruction = ""
        if chat_request.language == "ur-roman":
            language_instruction = "IMPORTANT: Answer ONLY in Roman Urdu (Romanized Urdu). Do not use English.\n"
        elif chat_request.language == "en":
            language_instruction = "IMPORTANT: Answer ONLY in English. Do not include translations.\n"

        system_prompt = f"""You are a precise tutor for the Physical AI & Humanoid Robotics book.

{language_instruction}
CRITICAL RULES:
1. Answer ONLY from the provided book content below
2. If selected text is provided, prioritize it in your answer
3. If no relevant information found, say: "I cannot find information about this in the book."
4. Be helpful, honest, and harmless
5. Structure answers clearly with examples when appropriate

BOOK CONTENT:
{context}
"""
        messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": chat_request.message})

        async def generate_response():
            full_response = ""
            llm_start_time = time.time()
            try:
                response = completion(
                    model=LITELLM_MODEL,
                    messages=messages,
                    stream=True,
                    max_tokens=1200,  # Safe max tokens
                    temperature=0.7
                )
                for chunk in response:
                    if hasattr(chunk, 'choices') and len(chunk.choices) > 0:
                        delta = chunk.choices[0].delta
                        if hasattr(delta, 'content') and delta.content:
                            content = delta.content
                            full_response += content
                            yield f"data: {json.dumps({'reply': content})}\n\n"

                llm_time = int((time.time() - llm_start_time) * 1000)
                await save_message(
                    session_id=chat_request.session_id,
                    role="assistant",
                    content=full_response,
                    db=db,
                    language_pref=chat_request.language
                )
                logger.info(f"Response completed - Embedding: {embedding_time}ms, Search: {search_time}ms, LLM: {llm_time}ms")
            except Exception as e:
                logger.error(f"Error generating response: {e}", exc_info=True)
                yield f"data: {json.dumps({'reply': 'Error: Could not connect to AI backend.'})}\n\n"

        return StreamingResponse(
            generate_response(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
                "X-Embedding-Time": str(embedding_time),
                "X-Search-Time": str(search_time),
                "X-Chunks-Retrieved": str(chunks_count),
            }
        )

    except Exception as e:
        logger.error(f"Chat endpoint error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process chat request")

@app.get("/chat-ui", response_class=HTMLResponse)
async def chat_ui():
    html = "<!-- Simple chat UI placeholder -->"
    return HTMLResponse(content=html)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
