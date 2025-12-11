# backend/main.py
"""
Production RAG Chatbot Backend using LiteLLM + OpenAI SDK.
Follows OpenAI Constitution: Helpful, Honest, Harmless.
"""
import os
import logging
from contextlib import asynccontextmanager
from typing import Optional
from pathlib import Path

# Load .env FIRST before any other imports
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

from database import init_db, get_session, save_message, load_history, get_language_preference
from schemas import ChatRequest, HealthResponse
from agent import retrieve_chunks

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Validate required environment variables
REQUIRED_ENV_VARS = ["COHERE_API_KEY", "QDRANT_URL", "DATABASE_URL"]
for var in REQUIRED_ENV_VARS:
    if not os.getenv(var):
        raise ValueError(f"Missing required environment variable: {var}")

# LiteLLM configuration
LITELLM_MODEL = os.getenv("LITELLM_MODEL", "groq/llama-3.3-70b-versatile")
os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY", "")

# Rate limiter
limiter = Limiter(key_func=get_remote_address)
RATE_LIMIT = os.getenv("RATE_LIMIT", "10")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="healthy", version="1.0.0")

@app.post("/chat")
# @limiter.limit(f"{RATE_LIMIT}/minute")
async def chat_endpoint(
    request_obj: Request,
    chat_request: ChatRequest,
    db: AsyncSession = Depends(get_session),
):
    """
    Main chat endpoint with streaming support using LiteLLM.

    Args:
        request_obj: FastAPI request object (for rate limiting)
        chat_request: ChatRequest with message, selected_text, session_id, language
        db: Database session

    Returns:
        StreamingResponse: SSE stream of agent response with performance headers
    """
    import time

    try:
        logger.info(f"Chat request from session {chat_request.session_id} (language: {chat_request.language})")

        # Load conversation history
        history = await load_history(chat_request.session_id, db, limit=10)

        # Save user message with language preference and selected text
        await save_message(
            session_id=chat_request.session_id,
            role="user",
            content=chat_request.message,
            db=db,
            language_pref=chat_request.language,
            selected_text=chat_request.selected_text
        )

        # Retrieve relevant chunks (with performance timing)
        retrieval_result = retrieve_chunks(
            query=chat_request.message,
            selected_text=chat_request.selected_text,
            limit=5
        )

        context = retrieval_result["context"]
        embedding_time = retrieval_result["embedding_time"]
        search_time = retrieval_result["search_time"]
        chunks_count = retrieval_result["chunks_count"]

        # Build language-specific instruction
        language_instruction = ""
        if chat_request.language == "ur-roman":
            language_instruction = "IMPORTANT: Answer ONLY in Roman Urdu (Romanized Urdu). Do not use English.\n"
        elif chat_request.language == "en":
            language_instruction = "IMPORTANT: Answer ONLY in English. Do not include translations.\n"

        # Build system prompt
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

        # Add conversation history (last 5 messages for context)
        for msg in history[-5:]:
            messages.append({"role": msg["role"], "content": msg["content"]})

        # Add current message
        messages.append({"role": "user", "content": chat_request.message})

        # Store LLM timing for headers
        llm_start_time = None
        llm_time = 0

        # Stream response generator
        async def generate_response():
            """Generate SSE stream from LiteLLM with performance tracking."""
            nonlocal llm_start_time, llm_time

            try:
                full_response = ""
                llm_start_time = time.time()

                # Call LiteLLM with streaming
                response = completion(
                    model=LITELLM_MODEL,
                    messages=messages,
                    stream=True,
                    max_tokens=2000,
                    temperature=0.7
                )

                for chunk in response:
                    if hasattr(chunk, 'choices') and len(chunk.choices) > 0:
                        delta = chunk.choices[0].delta
                        if hasattr(delta, 'content') and delta.content:
                            content = delta.content
                            full_response += content
                            yield f"data: {content}\n\n"

                # Calculate LLM time
                llm_time = int((time.time() - llm_start_time) * 1000)  # ms

                # Save assistant response with language preference
                await save_message(
                    session_id=chat_request.session_id,
                    role="assistant",
                    content=full_response,
                    db=db,
                    language_pref=chat_request.language
                )

                logger.info(f"Response completed - Embedding: {embedding_time}ms, Search: {search_time}ms, LLM: {llm_time}ms")
                yield "data: [DONE]\n\n"

            except Exception as e:
                logger.error(f"Error generating response: {e}", exc_info=True)
                error_msg = "I encountered an error. Please try again."
                yield f"data: {error_msg}\n\n"
                yield "data: [DONE]\n\n"

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
        raise HTTPException(
            status_code=500,
            detail="Failed to process chat request"
        )

@app.get("/chat-ui", response_class=HTMLResponse)
async def chat_ui():
    """Simple chat UI for testing."""
    html = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Robotics Book Chat</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .container { width: 100%; max-width: 600px; height: 80vh; background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); display: flex; flex-direction: column; overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; font-size: 1.2em; font-weight: 600; }
        .messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
        .message { max-width: 80%; padding: 12px 16px; border-radius: 12px; word-wrap: break-word; }
        .message.user { align-self: flex-end; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .message.assistant { align-self: flex-start; background: #f0f0f0; color: #333; }
        .input-area { padding: 20px; background: white; border-top: 1px solid #e0e0e0; }
        input { width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 12px; font-size: 1em; outline: none; }
        input:focus { border-color: #667eea; }
        button { width: 100%; margin-top: 10px; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; font-size: 1em; font-weight: 600; cursor: pointer; }
        button:hover { opacity: 0.9; }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Robotics Book Assistant</div>
        <div class="messages" id="messages">
            <div class="message assistant">Hi! Ask me anything about Physical AI & Humanoid Robotics.</div>
        </div>
        <div class="input-area">
            <input id="input" placeholder="Ask a question..." />
            <button id="send">Send</button>
        </div>
    </div>
    <script>
        const sessionId = 'session_' + Date.now();
        const messages = document.getElementById('messages');
        const input = document.getElementById('input');
        const sendBtn = document.getElementById('send');

        function addMessage(role, content) {
            const div = document.createElement('div');
            div.className = 'message ' + role;
            div.textContent = content;
            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
        }

        async function sendMessage() {
            const message = input.value.trim();
            if (!message) return;

            addMessage('user', message);
            input.value = '';
            sendBtn.disabled = true;

            try {
                const response = await fetch('/chat', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({message, selected_text: '', session_id: sessionId})
                });

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let assistantMsg = '';
                let msgDiv = null;

                while (true) {
                    const {done, value} = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.substring(6);
                            if (data === '[DONE]') break;
                            if (!data) continue;

                            assistantMsg += data;
                            if (!msgDiv) {
                                msgDiv = document.createElement('div');
                                msgDiv.className = 'message assistant';
                                messages.appendChild(msgDiv);
                            }
                            msgDiv.textContent = assistantMsg;
                            messages.scrollTop = messages.scrollHeight;
                        }
                    }
                }
            } catch (err) {
                addMessage('assistant', 'Error: ' + err.message);
            } finally {
                sendBtn.disabled = false;
            }
        }

        sendBtn.onclick = sendMessage;
        input.onkeydown = (e) => { if (e.key === 'Enter') sendMessage(); };
    </script>
</body>
</html>
    """
    return HTMLResponse(content=html)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
