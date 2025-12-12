
# Physical AI & Humanoid Robotics RAG Chatbot Backend

Production-ready RAG chatbot backend following OpenAI Constitution principles (Helpful, Honest, Harmless).

## Architecture

```
User Query → FastAPI → Cohere Embed → Qdrant Search → OpenAI Agent → Stream Response
                ↓                                              ↓
          Load History                                  Save to Neon
```

## Technology Stack

- **Framework**: FastAPI + Uvicorn
- **LLM Orchestration**: OpenAI Agents/ChatKit SDK
- **Vector Database**: Qdrant Cloud (collection: robotics_textbook, 84 chunks)
- **SQL Database**: Neon Serverless Postgres
- **Embeddings**: Cohere embed-english-v3.0 (1024 dimensions)
- **Rate Limiting**: slowapi (10 req/min per IP)

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create `.env` file from template:

```bash
cp .env.example .env
```

Fill in all required keys:

```bash
# OpenAI API
OPENAI_API_KEY=sk-...

# Cohere API
COHERE_API_KEY=...

# Qdrant Cloud
QDRANT_URL=https://...qdrant.io
QDRANT_API_KEY=...
COLLECTION_NAME=robotics_textbook

# Neon Serverless Postgres
DATABASE_URL=postgresql+asyncpg://user:password@host/dbname

# App Configuration
PORT=8000
CORS_ORIGINS=*
RATE_LIMIT=10
```

### 3. Run Locally

```bash
uvicorn main:app --reload
```

Access chat UI at: `http://localhost:8000/chat-ui`

## API Endpoints

### `GET /`
Health check endpoint.

**Response**:
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

### `POST /chat`
Main chat endpoint with streaming support.

**Request**:
```json
{
  "message": "What are the key components of a humanoid robot?",
  "selected_text": "Optional selected text from book",
  "session_id": "session_12345"
}
```

**Response**: Server-Sent Events (SSE) stream
```
data: Based on the book content...
data: humanoid robots consist of...
data: [DONE]
```

### `GET /chat-ui`
Beautiful floating chat bubble UI for testing.

## Features

### 1. Grounded Responses (No Hallucinations)
- Agent MUST call `retrieve_chunks()` before answering
- Responses grounded exclusively in retrieved book content
- Admits when information not found in book

### 2. Text Selection Support
- Users can select text from book and ask questions
- Selected text prioritized in retrieval context
- Supports selections up to 2000 characters

### 3. Chat History Persistence
- Full conversation history stored in Neon Postgres
- Multi-turn conversations with context continuity
- Automatic session expiration (30 days)

### 4. Streaming Responses
- Real-time streaming using Server-Sent Events
- Markdown rendering with syntax highlighting
- Typing indicators for better UX

### 5. Rate Limiting & Security
- 10 requests/minute per IP address
- Input validation with Pydantic schemas
- Environment-based configuration (no hardcoded secrets)
- Comprehensive error handling

## OpenAI Agent Configuration

### Agent Instructions
```python
"""You are a precise tutor for the Physical AI & Humanoid Robotics book.

CRITICAL RULES:
1. ALWAYS call retrieve_chunks() first before answering
2. Answer ONLY from retrieved book content
3. If selected text provided, prioritize it
4. If no relevant info found: "I cannot find information about this in the book."
5. Cite chunk IDs internally for debugging
"""
```

### Function Tool: `retrieve_chunks(query: str)`
1. Embeds query with Cohere (`input_type="search_query"`)
2. Searches Qdrant (limit=5, score_threshold=0.7)
3. Returns concatenated chunks with IDs

## Deployment

### Option 1: Render.com

1. Create new Web Service
2. Connect GitHub repository
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables in Render dashboard
5. Deploy

### Option 2: Railway

1. Create new project
2. Add GitHub repository
3. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables in Railway dashboard
5. Deploy

## Database Schema

### `chat_history` Table

| Column      | Type      | Description                |
|-------------|-----------|----------------------------|
| id          | Integer   | Auto-incrementing primary key |
| session_id  | String    | Conversation session ID     |
| role        | String    | user / assistant / system   |
| content     | Text      | Message content             |
| timestamp   | DateTime  | Message timestamp (UTC)     |

**Indexes**:
- `idx_session_timestamp` on `(session_id, timestamp)` for efficient history queries

## Troubleshooting

### Database Connection Errors
```python
# Ensure DATABASE_URL uses asyncpg driver
DATABASE_URL=postgresql+asyncpg://...
```

### Qdrant Search Returns Empty
- Check collection name matches: `robotics_textbook`
- Verify 84 chunks were ingested successfully
- Lower score_threshold if needed (default: 0.7)

### Cohere Embedding Errors
- Verify API key is valid
- Check rate limits (100 calls/min on free tier)
- Ensure query length < 512 tokens

### OpenAI Agent Errors
- Verify OPENAI_API_KEY is valid
- Check model availability (gpt-4o-mini)
- Review agent logs for tool call failures

## Performance Metrics

- **Embedding Latency**: ~150ms (Cohere)
- **Vector Search**: ~250ms (Qdrant Cloud)
- **Agent Response**: 3-8 seconds (depends on LLM)
- **Total End-to-End**: < 10 seconds (p95)

## Contributing

Follow Spec-Driven Development workflow:
1. Create `spec.md` for new features
2. Generate `plan.md` with architecture decisions
3. Break down into `tasks.md`
4. Implement with test coverage
5. Create PHR (Prompt History Record) after completion

## License

MIT License - See LICENSE file for details
