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

### VI. Streaming & User Experience

Chat responses MUST stream in real-time using Server-Sent Events (SSE). MUST NOT wait for full response before displaying. UI MUST show typing indicators and markdown formatting (bold, italics, lists, code blocks). MUST handle network failures gracefully with retry logic.

### VII. Chat History & Context Management

MUST persist full conversation history in Neon Postgres (session_id, role, content, timestamp). MUST load previous messages on session resume. MUST support multi-turn conversations with context continuity. MUST implement session expiration (30 days) to manage storage.

### VIII. Retrieval Quality

Query embeddings MUST use Cohere with input_type="search_query" for optimal retrieval. MUST retrieve top 5 chunks with minimum similarity threshold (0.7). MUST handle empty results gracefully. MUST log retrieval metrics (latency, similarity scores) for quality monitoring.

### IX. Text Selection Support

MUST support answering questions about user-selected book text. Selected text MUST be included in retrieval context. MUST prioritize selected text over general retrieval when both present. MUST handle selections up to 2000 characters.

### X. Production Readiness

MUST include comprehensive error handling with user-friendly messages. MUST implement request validation (Pydantic schemas). MUST log all errors with stack traces. MUST implement CORS for cross-origin requests. MUST document all environment variables. MUST provide clear setup instructions in README.

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
- [ ] Implements OpenAI Constitution principles (HHH)
- [ ] Includes grounded responses with no hallucinations
- [ ] Implements proper error handling and validation
- [ ] Deploys successfully to Render.com or Railway

### PHR and ADR Requirements

- **PHR (Prompt History Record)**: MUST create after every AI-assisted development session
- **ADR (Architecture Decision Record)**: MUST create when making significant architectural choices (LLM provider, RAG architecture, database schema, deployment platform)

See `.specify/commands/sp.phr.md` and `.specify/commands/sp.adr.md` for workflows.

**Version**: 2.0.0 | **Ratified**: 2025-12-04 | **Last Amended**: 2025-12-08
