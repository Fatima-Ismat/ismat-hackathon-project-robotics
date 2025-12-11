<!--
Sync Impact Report:
Version Change: 1.0.0 → 2.0.0
Modified Principles:
  - I. Simplicity First (kept, refined for RAG focus)
  - II. Accuracy Over Speed → Grounded Responses & No Hallucinations
  - III. Mobile-First UI → removed (backend-focused project)
  - IV. Spec-Driven Workflow (kept, non-negotiable)
  - V. Free-Tier Architecture (kept, updated stack)
  - VI. Fast Builds → removed (not applicable to backend)
  - VII. Four-Page Architecture → removed (not applicable)
  - VIII. Content Quality Standards → removed (not applicable)
  + IX. OpenAI Constitution Compliance (NEW - HHH principle)
  + X. Streaming & User Experience (NEW)
  + XI. Chat History & Context Management (NEW)
Added Sections:
  - RAG System Principles
  - OpenAI Agents/ChatKit Integration Guidelines
  - Production Readiness Requirements
Removed Sections:
  - Docusaurus-specific guidance
  - Content creation standards
  - GitHub Pages deployment
Templates Requiring Updates:
  ✅ constitution.md - updated for RAG backend focus
  ⚠ spec-template.md - may need RAG-specific sections
  ⚠ plan-template.md - may need backend deployment considerations
  ⚠ tasks-template.md - alignment verified
Follow-up TODOs: Review dependent templates for RAG-specific workflow alignment
-->

# Physical AI & Humanoid Robotics RAG Chatbot — Production Constitution

## Core Principles

### I. Simplicity First

MUST keep all implementations minimal and direct. MUST NOT add features, abstractions, or dependencies beyond explicit requirements. Every component MUST have a single, clear purpose. Configuration MUST use environment variables (.env) with sensible defaults. MUST use only the specified SDKs: OpenAI Agents/ChatKit for LLM orchestration.

**Rationale**: Complex RAG systems are difficult to debug and deploy. Minimal dependencies ensure reliability on free-tier infrastructure and rapid iteration during hackathons.

### II. Grounded Responses & No Hallucinations

RAG chatbot responses MUST be grounded exclusively in retrieved book content from Qdrant. Agent MUST call retrieve_chunks() before answering every query. MUST NOT generate responses without retrieved context. If no relevant chunks found, MUST explicitly state "I cannot find information about this in the book." Chunk IDs MUST be tracked internally for debugging (not shown to users).

**Rationale**: Educational content requires absolute factual accuracy. Hallucinations damage trust and learning outcomes. Grounding ensures verifiable, traceable responses.

### III. OpenAI Constitution Compliance (Helpful, Honest, Harmless)

All agent behaviors MUST follow the OpenAI Constitution principles:
- **Helpful**: Provide clear, actionable answers. Prioritize user-selected text when provided. Structure responses for easy comprehension.
- **Honest**: Never fabricate information. Admit when book content doesn't cover a topic. Cite retrieved chunks accurately.
- **Harmless**: Validate all inputs. Implement rate limiting (10 req/min). Sanitize outputs. Never expose internal system details or keys.

**Rationale**: These principles ensure ethical AI behavior, user trust, and system safety in production environments.

### IV. Spec-Driven Workflow (NON-NEGOTIABLE)

Every feature MUST follow: specification → planning → tasks → implementation. MUST NOT write code before completing spec.md and plan.md. MUST use Spec-Kit Plus templates for all artifacts. Each task MUST reference specific file paths and be independently testable.

**Rationale**: RAG systems are complex. Spec-driven development prevents architectural drift, ensures traceability, and maintains alignment with requirements.

### V. Free-Tier Architecture

MUST use free-tier services exclusively:
- **Vector DB**: Qdrant Cloud (1GB free tier)
- **SQL DB**: Neon Serverless Postgres (1 project, 3GB storage free tier)
- **Embeddings**: Cohere embed-english-v3.0 (100 calls/min free tier)
- **LLM**: OpenAI Agents/ChatKit with gpt-4o-mini or claude-3.5-sonnet via litellm
- **Backend**: FastAPI (Python 3.11+) deployed to Render.com or Railway (free tier)

MUST NOT require GPU. MUST stay within free-tier limits: storage, compute, bandwidth, API calls.

**Rationale**: Project must remain accessible and cost-free to reproduce, deploy, and maintain long-term.

### VI. Streaming & User Experience

Chat responses MUST stream in real-time using Server-Sent Events (SSE). MUST NOT wait for full response before displaying. UI MUST show typing indicators and markdown formatting (bold, italics, lists, code blocks). MUST handle network failures gracefully with retry logic.

**Rationale**: Streaming provides immediate feedback, improving perceived performance. LLM responses can take 5-10 seconds; streaming prevents user frustration.

### VII. Chat History & Context Management

MUST persist full conversation history in Neon Postgres (session_id, role, content, timestamp). MUST load previous messages on session resume. MUST support multi-turn conversations with context continuity. MUST implement session expiration (30 days) to manage storage.

**Rationale**: Educational conversations require context. Users expect to continue discussions across sessions. History enables learning continuity and debugging.

### VIII. Retrieval Quality

Query embeddings MUST use Cohere with input_type="search_query" for optimal retrieval. MUST retrieve top 5 chunks with minimum similarity threshold (0.7). MUST handle empty results gracefully. MUST log retrieval metrics (latency, similarity scores) for quality monitoring.

**Rationale**: High-quality retrieval is the foundation of RAG accuracy. Poor retrieval leads to irrelevant answers regardless of LLM quality.

### IX. Text Selection Support

MUST support answering questions about user-selected book text. Selected text MUST be included in retrieval context. MUST prioritize selected text over general retrieval when both present. MUST handle selections up to 2000 characters.

**Rationale**: Readers want to ask questions about specific passages. Selection support enables precise, contextual learning.

### X. Production Readiness

MUST include comprehensive error handling with user-friendly messages. MUST implement request validation (Pydantic schemas). MUST log all errors with stack traces. MUST implement CORS for cross-origin requests. MUST document all environment variables. MUST provide clear setup instructions in README.

**Rationale**: Production systems must handle failures gracefully. Poor error handling leads to user confusion and debugging nightmares.

## Architectural Constraints

### Technology Stack (MANDATORY)

- **LLM Orchestration**: OpenAI Agents/ChatKit SDK (latest version)
- **Backend Framework**: FastAPI (Python 3.11+)
- **Vector Database**: Qdrant Cloud (collection: "robotics_textbook", 84 chunks)
- **SQL Database**: Neon Serverless Postgres (table: chat_history)
- **Embeddings**: Cohere embed-english-v3.0 (1024 dimensions)
- **Hosting**: Render.com or Railway (free tier with auto-deploy)
- **Frontend Integration**: postMessage API for text selection from book pages

### Data Flow

```
User Query + Optional Selection
         ↓
FastAPI POST /chat (validate, load history)
         ↓
Cohere Embedding (input_type="search_query")
         ↓
Qdrant Search (top 5 chunks, min_score=0.7)
         ↓
OpenAI Agent retrieve_chunks() tool
         ↓
ChatKit Agent (streaming response via SSE)
         ↓
Save to Neon Postgres
         ↓
Stream to client (text/event-stream)
```

### Required Backend Files

```
backend/
├── main.py               # FastAPI app, CORS, /chat endpoint, /chat-ui
├── database.py           # SQLAlchemy models, async session, save/load
├── schemas.py            # Pydantic request/response models
├── requirements.txt      # Minimal dependencies only
└── .env.example          # Template for required keys
```

### Environment Variables (REQUIRED)

```bash
# OpenAI / LiteLLM
OPENAI_API_KEY=sk-...
LITELLM_API_KEY=...  # if using claude via litellm

# Cohere
COHERE_API_KEY=...

# Qdrant
QDRANT_URL=https://...
QDRANT_API_KEY=...
COLLECTION_NAME=robotics_textbook

# Neon Postgres
DATABASE_URL=postgresql://...

# App Config
PORT=8000
CORS_ORIGINS=*
RATE_LIMIT=10  # requests per minute per IP
```

### Security Requirements

- MUST load all keys from .env (never hardcode)
- MUST validate all inputs with Pydantic schemas
- MUST implement rate limiting (10 req/min per IP)
- MUST sanitize all rendered markdown to prevent XSS
- MUST use parameterized SQL queries (SQLAlchemy ORM)
- MUST NOT expose internal errors or stack traces to users
- MUST implement CORS with explicit allowed origins (or * for development)

### Performance Budgets

- **Embedding Latency**: < 200ms (Cohere API)
- **Vector Search Latency**: < 300ms (Qdrant Cloud)
- **Agent Response Time**: < 5 seconds (p95, excluding LLM time)
- **Total Response Time**: < 10 seconds (p95, end-to-end)
- **Database Query Time**: < 100ms (Neon with proper indexes)

### OpenAI Agents/ChatKit Integration

**Agent Definition**:
```python
@agent(name="robotics_tutor")
def create_agent():
    """
    Instructions: You are a precise tutor for the Physical AI & Humanoid
    Robotics book. Always call retrieve_chunks first. Answer ONLY from
    retrieved content. If selected text is provided, prioritize it.
    Cite chunk IDs internally for debugging.
    """
```

**Function Tool**:
```python
@function_tool
def retrieve_chunks(query: str) -> str:
    """
    1. Embed query with Cohere (input_type="search_query")
    2. Search Qdrant (limit=5, min_score=0.7)
    3. Return concatenated chunks with IDs as string
    """
```

**Streaming**:
- Use ChatKit's built-in streaming support
- Yield SSE events: `data: {content}\n\n`
- Handle final message with [DONE] marker

## Deployment Workflow

### Local Development

1. Clone repository
2. Create `.env` from `.env.example` with all required keys
3. Install dependencies: `pip install -r backend/requirements.txt`
4. Run server: `uvicorn backend.main:app --reload`
5. Test at `http://localhost:8000/chat-ui`

### Production Deployment (Render.com / Railway)

1. Connect GitHub repository
2. Set root directory to `/backend` (if monorepo)
3. Configure environment variables in platform UI
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Deployment MUST complete in under 5 minutes
7. MUST verify health check endpoint responds

### Database Migrations

1. Neon auto-creates databases, no manual setup required
2. SQLAlchemy MUST create tables on first run (`Base.metadata.create_all()`)
3. MUST handle connection pooling for serverless environments
4. MUST implement graceful reconnection on connection loss

## Development Standards

### Code Quality

- MUST include docstrings for all functions (Google style)
- MUST use type hints for all function signatures
- MUST implement comprehensive error handling with try/except
- MUST log all significant events (requests, errors, retrievals)
- MUST keep functions under 50 lines (split if larger)
- MUST use descriptive variable names (no single letters except i, j in loops)

### Testing Requirements

- MUST test /chat endpoint with sample queries
- MUST verify streaming output format
- MUST test error cases (missing keys, invalid inputs, Qdrant failures)
- MUST verify chat history persistence and retrieval
- MUST test selected text handling
- MUST verify rate limiting works

### Commit Standards

- Format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- Examples:
  - `feat(agent): add retrieve_chunks function tool`
  - `fix(database): handle Neon connection timeouts`
  - `docs(readme): add deployment instructions`

## Governance

This constitution supersedes all other practices and guidelines. All development work MUST comply with these principles.

### Amendment Process

1. Propose change via issue with rationale
2. Discuss tradeoffs and alternatives
3. Update constitution with new version number (semantic versioning)
4. Update dependent templates (spec, plan, tasks)
5. Document decision in ADR if architecturally significant

### Version Bumps

- **MAJOR**: Remove/redefine core principles (e.g., switch from free-tier to paid, change RAG architecture)
- **MINOR**: Add new principles or expand guidance (e.g., add observability requirements)
- **PATCH**: Clarify wording, fix typos, refine non-semantic details

### Compliance Review

All pull requests MUST verify:
- [ ] Follows spec-driven workflow (spec → plan → tasks → implementation)
- [ ] Maintains simplicity (no unnecessary dependencies)
- [ ] Passes performance budgets
- [ ] Uses only free-tier services
- [ ] Implements OpenAI Constitution principles (HHH)
- [ ] Includes grounded responses with no hallucinations
- [ ] Implements proper error handling and validation
- [ ] Deploys successfully to Render.com or Railway

### PHR and ADR Requirements

- **PHR (Prompt History Record)**: MUST create after every AI-assisted development session
- **ADR (Architecture Decision Record)**: MUST create when making significant architectural choices (LLM provider, RAG architecture, database schema, deployment platform)

See `.specify/commands/sp.phr.md` and `.specify/commands/sp.adr.md` for workflows.

**Version**: 2.0.0 | **Ratified**: 2025-12-04 | **Last Amended**: 2025-12-08
