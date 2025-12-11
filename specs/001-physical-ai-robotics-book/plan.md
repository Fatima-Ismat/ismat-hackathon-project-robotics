# Implementation Plan: Physical AI & Humanoid Robotics Book

**Branch**: `001-physical-ai-robotics-book` | **Date**: 2025-12-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-physical-ai-robotics-book/spec.md`

## Summary

Build an AI-native educational textbook on Physical AI and Humanoid Robotics using Docusaurus 3.x, deployed to GitHub Pages. The book consists of 8 comprehensive chapters (Physical AI intro → ROS 2 → Digital Twins → NVIDIA Isaac → VLA → Humanoid Development → Conversational Robotics → Capstone). The system includes an optional RAG Q&A feature using Qdrant + Neon + FastAPI for select-text-to-ask-AI functionality. All content will be AI-generated following spec-driven workflow with human review for technical accuracy.

**Technical Approach**: Static site generation with Docusaurus for zero-cost hosting on GitHub Pages, mobile-first responsive design with glassmorphism CSS, and optional free-tier RAG backend for interactive learning. Build targets: <2 min Docusaurus build, <5 min GitHub Actions deployment, Lighthouse ≥90 across all metrics.

## Technical Context

**Language/Version**: JavaScript/TypeScript (Docusaurus 3.x) + Python 3.11+ (RAG backend)
**Primary Dependencies**:
- Frontend: @docusaurus/core@3.x, @docusaurus/preset-classic, React 18+
- RAG Backend (optional): FastAPI, qdrant-client, psycopg2-binary, sentence-transformers, uvicorn

**Storage**:
- Content: Markdown files in `docs/` directory (git-tracked)
- User preferences: Browser localStorage (theme, last chapter)
- Contact forms: Browser localStorage (no backend persistence)
- RAG: Qdrant Cloud (1GB vectors), Neon PostgreSQL (0.5GB metadata)

**Testing**:
- Build validation: `npm run build` (zero errors required)
- Link validation: Docusaurus built-in broken link checker
- Lighthouse CI: Performance, Accessibility, Best Practices, SEO ≥90
- RAG testing (if implemented): pytest for backend, manual query validation

**Target Platform**:
- Frontend: GitHub Pages (static hosting), modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- RAG Backend (optional): Render.com free tier (750 hrs/month) or Railway/Fly.io

**Project Type**: Web (static site + optional backend)

**Performance Goals**:
- FCP <1.5s, LCP <2.5s on 3G network
- Docusaurus build <2 minutes on GitHub Actions runner (2-core CPU, 7GB RAM)
- GitHub Pages deployment <5 minutes end-to-end
- RAG p95 latency <3 seconds

**Constraints**:
- Free-tier only: no paid services
- No external CSS frameworks (Tailwind, Bootstrap) - CSS Modules + custom properties only
- No GPU requirements for embeddings
- Exactly 4 main pages: Home, Book, About, Contact
- Each chapter: 1500-2500 words
- Qdrant free tier: 1GB vectors (~500K embeddings with 384-dim)
- Neon free tier: 1 project, 0.5GB storage

**Scale/Scope**:
- 8 chapters + 4 main pages = ~12 total routes
- Expected content size: ~16K words (8 chapters × 2K avg) ≈ 100KB markdown
- Target audience: 1000 concurrent readers (GitHub Pages limit)
- RAG concurrent queries: 10 users simultaneously

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gates (Phase 0)

- [x] **Simplicity First**: Docusaurus provides zero-config setup; RAG optional; no unnecessary abstractions
- [x] **Accuracy Over Speed**: Spec mandates human review of AI-generated chapters before publication
- [x] **Mobile-First UI**: Responsive design requirement explicit in FR-006; 44x44px touch targets
- [x] **Spec-Driven Workflow**: Following spec → plan → tasks → implementation (current stage: planning)
- [x] **Free-Tier Architecture**: GitHub Pages + Qdrant + Neon + Render all free-tier; no paid services
- [x] **Fast Builds**: Target <2 min build time specified; using minimal Docusaurus plugins
- [x] **Four-Page Architecture**: Exactly 4 pages specified (Home, Book, About, Contact) - matches requirement
- [x] **Content Quality**: 1500-2500 words/chapter, H2/H3 headings, code syntax highlighting required

**Pre-Research Status**: ✅ PASS - All constitution principles satisfied in initial design.

### Post-Design Gates (Phase 1)

*To be evaluated after data-model.md and contracts/ are complete.*

- [ ] No unnecessary dependencies added beyond Docusaurus core + optional RAG stack
- [ ] File structure follows constitution's prescribed layout (docs/, src/, static/)
- [ ] Performance budgets measurable (Lighthouse CI config, build time monitoring)
- [ ] All configuration via environment variables with documented defaults

## Project Structure

### Documentation (this feature)

```text
specs/001-physical-ai-robotics-book/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (technology choices, best practices)
├── data-model.md        # Phase 1 output (entities: Chapter, RAGQuery, UserPreference)
├── quickstart.md        # Phase 1 output (local development setup guide)
├── contracts/           # Phase 1 output (RAG API endpoints if implemented)
│   └── rag-api.yaml     # OpenAPI spec for FastAPI backend
├── checklists/
│   └── requirements.md  # Quality validation checklist
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
project-robotics/
├── docs/                    # Docusaurus content (markdown files)
│   ├── intro.md             # Landing page content
│   ├── chapter-01/
│   │   └── index.md         # Chapter 1: Introduction to Physical AI
│   ├── chapter-02/
│   │   └── index.md         # Chapter 2: ROS 2 Fundamentals
│   ├── chapter-03/
│   │   └── index.md         # Chapter 3: Digital Twin Simulation
│   ├── chapter-04/
│   │   └── index.md         # Chapter 4: NVIDIA Isaac AI Platform
│   ├── chapter-05/
│   │   └── index.md         # Chapter 5: Vision-Language-Action (VLA)
│   ├── chapter-06/
│   │   └── index.md         # Chapter 6: Humanoid Robot Development
│   ├── chapter-07/
│   │   └── index.md         # Chapter 7: Conversational Robotics
│   └── chapter-08/
│       └── index.md         # Chapter 8: Capstone Project
│
├── src/
│   ├── components/          # React components
│   │   ├── HomepageFeatures/
│   │   │   └── index.tsx    # Hero section, book preview
│   │   ├── AskAIButton/
│   │   │   └── index.tsx    # Select-text → Ask AI component
│   │   ├── ContactForm/
│   │   │   └── index.tsx    # Waitlist form (localStorage)
│   │   └── ProgressIndicator/
│   │       └── index.tsx    # Chapter reading progress bar
│   ├── css/
│   │   ├── custom.css       # Glassmorphism, gradients, light/dark mode
│   │   └── mobile.css       # Mobile-first responsive overrides
│   └── pages/
│       ├── index.tsx        # Home page
│       ├── about.md         # About page
│       └── contact.tsx      # Contact page with form
│
├── static/
│   ├── img/                 # Images, diagrams (optimized/compressed)
│   └── fonts/               # Web fonts (if needed)
│
├── rag/                     # Optional RAG backend (separate deployment)
│   ├── api/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── routers/
│   │   │   └── query.py     # /query endpoint
│   │   └── models.py        # Pydantic models for request/response
│   ├── embeddings/
│   │   ├── generate.py      # Script to embed all chapter content
│   │   └── chunker.py       # Text chunking logic (512 tokens)
│   ├── db/
│   │   ├── qdrant_client.py # Qdrant connection/search
│   │   └── neon_client.py   # Neon PostgreSQL metadata queries
│   ├── requirements.txt
│   └── .env.example
│
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions: build + deploy to Pages
│
├── docusaurus.config.js     # Main Docusaurus configuration
├── sidebars.js              # Auto-generated sidebar from chapter structure
├── package.json
├── .gitignore
└── README.md
```

**Structure Decision**: Web application structure (frontend + optional backend). Frontend uses Docusaurus standard layout (`docs/`, `src/`, `static/`) with custom pages for Home/About/Contact. RAG backend kept separate in `rag/` directory for independent deployment to Render.com. This separation allows MVP deployment (book only) without RAG complexity.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | No constitution violations | All requirements align with principles |

---

## Phase 0: Research & Technology Decisions

### Research Scope

**Unknowns to Resolve**:
1. Docusaurus 3.x best practices for educational content (sidebar navigation, progress tracking)
2. GitHub Actions deployment workflow for GitHub Pages with Docusaurus
3. Sentence-transformers optimal model for free-tier RAG (384-dim vs 768-dim trade-offs)
4. Qdrant Cloud + Neon integration patterns for FastAPI
5. CSS glassmorphism implementation with light/dark mode support
6. Mobile-first responsive breakpoints for book reading experience
7. localStorage patterns for user preferences and form data
8. React component patterns for text selection + AI query UI

### Research Methodology

**Sources** (in order of priority):

1. **Docusaurus Official Documentation** (High Authority)
   - Context7 MCP: `/websites/docusaurus_io`
   - Topics: configuration, deployment, theming, sidebar navigation
   - Citation format: Facebook Open Source. (2024). *Docusaurus* (Version 3.x) [Documentation]. https://docusaurus.io/docs

2. **sentence-transformers Documentation** (High Authority)
   - HuggingFace Model Hub: https://huggingface.co/sentence-transformers
   - Focus: all-MiniLM-L6-v2 (384-dim, 80MB model) performance benchmarks
   - Citation format: Reimers, N., & Gurevych, I. (2019). sentence-transformers [Software]. https://www.sbert.net

3. **Qdrant Documentation** (High Authority)
   - Official docs: https://qdrant.tech/documentation/
   - Topics: free-tier limits, Python client, vector search optimization
   - Citation format: Qdrant Solutions GmbH. (2024). *Qdrant vector database* [Documentation]. https://qdrant.tech/documentation/

4. **FastAPI Documentation** (High Authority)
   - Official docs: https://fastapi.tiangolo.com
   - Topics: structured logging, CORS, rate limiting, deployment
   - Citation format: Tiangolo, S. (2024). *FastAPI* (Version 0.100+) [Documentation]. https://fastapi.tiangolo.com

5. **Neon PostgreSQL Documentation** (Medium Authority)
   - Official docs: https://neon.tech/docs
   - Topics: free-tier limits, psycopg2 connection, serverless SQL
   - Citation format: Neon, Inc. (2024). *Neon serverless PostgreSQL* [Documentation]. https://neon.tech/docs

6. **GitHub Actions for Docusaurus** (High Authority)
   - GitHub Docs: https://docs.github.com/en/actions
   - Docusaurus deployment guide (retrieved via Context7)
   - Citation format: GitHub, Inc. (2024). *GitHub Actions documentation*. https://docs.github.com/en/actions

**Research Approach**: Concurrent research while writing. Each technical decision in this plan includes inline citations. Full bibliography in research.md.

### Quality Validation

**Technical Accuracy Verification**:

1. **Docusaurus Build Test**:
   - Initialize Docusaurus project: `npx create-docusaurus@latest test-project classic`
   - Verify build time <2 min on local machine (baseline for CI)
   - Validate sidebar auto-generation from `docs/` structure

2. **Lighthouse Audit Baseline**:
   - Run Lighthouse on fresh Docusaurus classic template
   - Confirm ≥90/100 achievable without optimization (baseline)
   - Identify performance budget headroom for custom CSS

3. **RAG Backend Prototype**:
   - Test sentence-transformers/all-MiniLM-L6-v2 embedding generation speed (local CPU)
   - Validate Qdrant Cloud free tier sign-up and API access
   - Confirm Neon PostgreSQL free tier database creation

4. **GitHub Pages Deployment Test**:
   - Deploy Docusaurus classic template to GitHub Pages
   - Measure end-to-end deployment time via GitHub Actions
   - Verify `baseUrl` and `url` configuration for custom domain support

**Acceptance Criteria Checks**:
- FR-019: Build completes in <2 min (measured with `time npm run build`)
- FR-022: Lighthouse ≥90 across all 4 metrics (CI integration required)
- SC-003: FCP <1.5s, LCP <2.5s (measured via Lighthouse on 3G throttling)

**Peer Review Strategy**:
- Technical accuracy review by domain experts (ROS 2, NVIDIA Isaac, VLA)
- All code examples tested in local environments before publication
- Citations verified against official documentation sources

---

## Phase 1: Design Artifacts

### Data Model

**Entity Definitions** (full details in `data-model.md`):

1. **Chapter**
   - Fields: `id`, `number`, `title`, `slug`, `content_md`, `word_count`, `sections[]`, `code_examples[]`
   - Storage: Markdown files in `docs/chapter-{number}/index.md`
   - Relationships: Contains Sections (H2/H3 headings)

2. **Section**
   - Fields: `id`, `chapter_id`, `level` (2 or 3), `title`, `slug`, `content`
   - Storage: Extracted from markdown headings via Docusaurus
   - Relationships: Belongs to Chapter

3. **RAGQuery** (optional, if RAG implemented)
   - Fields: `id`, `timestamp`, `user_ip`, `selected_text`, `query`, `response`, `latency_ms`, `chapter_context`
   - Storage: Neon PostgreSQL (metadata), response generated on-the-fly
   - Relationships: References Chapter(s) for context

4. **ContactSubmission**
   - Fields: `id`, `name`, `email`, `message`, `timestamp`, `status`
   - Storage: Browser localStorage (key: `contact_submissions`)
   - Relationships: None (client-side only)

5. **UserPreference**
   - Fields: `theme` (light/dark), `language` (en), `last_chapter_slug`, `bookmarks[]`
   - Storage: Browser localStorage (key: `user_prefs`)
   - Relationships: None

### API Contracts

**RAG Backend API** (if implemented) - OpenAPI 3.0 spec in `contracts/rag-api.yaml`:

**POST /api/v1/query**
- Request: `{ "selected_text": string, "query": string, "chapter_id": string }`
- Response: `{ "answer": string, "sources": [{ "chapter": string, "section": string }], "latency_ms": number }`
- Rate limit: 10 req/min per IP (429 if exceeded)
- Errors: 400 (invalid input), 429 (rate limit), 503 (backend unavailable)

**GET /api/v1/health**
- Response: `{ "status": "healthy", "qdrant": "connected", "neon": "connected" }`
- Used for uptime monitoring and graceful degradation checks

### Quickstart Guide

**Developer Setup** (full guide in `quickstart.md`):

```bash
# Prerequisites: Node.js 18+, npm 9+, Python 3.11+ (if RAG)

# 1. Clone and install
git clone <repo-url>
cd project-robotics
npm install

# 2. Run local dev server
npm start
# Opens http://localhost:3000

# 3. Build for production
npm run build
# Output: build/ directory

# 4. Optional: RAG backend setup
cd rag
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Fill in QDRANT_API_KEY, NEON_CONNECTION_STRING
uvicorn api.main:app --reload
# Opens http://localhost:8000
```

**Testing Workflow**:
```bash
# Validate build
npm run build

# Check for broken links
npm run build && npm run serve

# Lighthouse audit
npm install -g @lhci/cli
lhci autorun --config=lighthouserc.json

# RAG backend tests (if implemented)
cd rag && pytest tests/
```

---

## Architecture Decisions Requiring Documentation

### Decision 1: Docusaurus vs Custom Static Site Generator

**Options Considered**:
- A. Docusaurus 3.x
- B. Next.js + MDX
- C. Gatsby
- D. Custom Hugo/Jekyll

**Trade-offs**:
| Option | Pros | Cons | Build Time | GitHub Pages Support |
|--------|------|------|-----------|---------------------|
| A. Docusaurus | Zero config, built-in sidebar, versioning, i18n | React dependency (heavier) | <2 min | Native |
| B. Next.js + MDX | Full control, modern React, API routes | Manual sidebar/nav setup | 3-5 min | Requires adapter |
| C. Gatsby | GraphQL data layer, plugins | Slower builds, deprecated GraphQL | 5-8 min | Native |
| D. Hugo/Jekyll | Fastest builds, minimal JS | No interactive features, Go/Ruby | <30 sec | Native |

**Chosen**: A. Docusaurus 3.x

**Rationale**:
- Meets constitution "Simplicity First" (zero config, official deployment docs)
- Built-in features match requirements: auto-sidebar (FR-003), dark mode (FR-007), mobile-responsive
- Active maintenance (Facebook Open Source), high community adoption
- Build time <2 min achievable with minimal plugins (validated via Context7 docs)
- Native GitHub Pages deployment via official GitHub Action (Docusaurus, 2024)

**Reference**: Facebook Open Source. (2024). *Docusaurus deployment*. https://docusaurus.io/docs/deployment

---

### Decision 2: RAG Embedding Model Selection

**Options Considered**:
- A. all-MiniLM-L6-v2 (384-dim, 80MB)
- B. all-mpnet-base-v2 (768-dim, 420MB)
- C. OpenAI text-embedding-ada-002 (API-based)

**Trade-offs**:
| Model | Dimensions | Model Size | Inference Speed (CPU) | Quality (MTEB) | Cost |
|-------|-----------|-----------|---------------------|---------------|------|
| A. all-MiniLM-L6-v2 | 384 | 80MB | ~60ms/query | 58.8 | Free (local) |
| B. all-mpnet-base-v2 | 768 | 420MB | ~150ms/query | 63.3 | Free (local) |
| C. OpenAI ada-002 | 1536 | N/A (API) | ~200ms/query | 61.0 | $0.0001/1K tokens |

**Chosen**: A. all-MiniLM-L6-v2

**Rationale**:
- Constitution "Free-Tier Architecture" mandates no paid API costs
- Fits Qdrant free tier (1GB = ~2.6M vectors at 384-dim vs ~1.3M at 768-dim)
- Inference speed <100ms critical for <3s p95 latency (includes network + Qdrant search)
- Quality delta (58.8 vs 63.3 MTEB) acceptable for book Q&A use case
- No GPU required (CPU inference <100ms per sentence-transformers benchmarks)

**Reference**: Reimers, N., & Gurevych, I. (2019). sentence-transformers: Sentence embeddings using Siamese BERT-networks. *arXiv*. https://arxiv.org/abs/1908.10084

---

### Decision 3: GitHub Actions vs Alternative CI/CD

**Options Considered**:
- A. GitHub Actions (native)
- B. Netlify
- C. Vercel
- D. Travis CI

**Trade-offs**:
| Platform | Free Tier | Build Minutes/Month | Deploy Time | Custom Domain | Cost After Limit |
|----------|-----------|-------------------|------------|---------------|-----------------|
| A. GitHub Actions | 2000 min | 2000 | 3-5 min | Yes (GitHub Pages) | $0.008/min |
| B. Netlify | 300 min | 300 | 2-4 min | Yes | $0.10/min |
| C. Vercel | Unlimited builds | Unlimited | 1-3 min | Yes | $20/mo (Team) |
| D. Travis CI | 1000 credits | ~100 | 4-6 min | No (GitHub Pages manual) | $69/mo |

**Chosen**: A. GitHub Actions + GitHub Pages

**Rationale**:
- Constitution "Free-Tier Architecture" + "Fast Builds" requirements
- 2000 minutes/month sufficient (5 min/deploy × 400 deploys/month)
- Native integration with GitHub Pages (no third-party account)
- Official Docusaurus deployment action available (Facebook Open Source, 2024)
- Build time <5 min achievable (validated via Context7 deployment docs)

**Reference**: GitHub, Inc. (2024). *GitHub Actions pricing*. https://docs.github.com/en/billing/managing-billing-for-github-actions

---

### Decision 4: Contact Form: localStorage vs Backend

**Options Considered**:
- A. localStorage (client-side only)
- B. Formspree/Form Backend (free tier: 50 submissions/month)
- C. Custom FastAPI endpoint + Neon PostgreSQL
- D. GitHub Issues API (submissions as issues)

**Trade-offs**:
| Option | Cost | User Privacy | Data Persistence | Retrieval Method | Spam Prevention |
|--------|------|--------------|-----------------|-----------------|----------------|
| A. localStorage | Free | Full (local) | Browser-dependent | Browser console/export | None |
| B. Formspree | Free (50/mo) | Third-party | Permanent | Email/dashboard | ReCAPTCHA |
| C. Custom backend | Free (Neon tier) | Full control | Permanent | API/database | Rate limiting |
| D. GitHub Issues | Free | Public | Permanent | GitHub UI | Auth required |

**Chosen**: A. localStorage (client-side only)

**Rationale**:
- Constitution "Simplicity First" (no backend dependency for contact form)
- Spec FR-016 explicitly requires localStorage storage
- No sensitive data collected (name, email, message only)
- MVP deployment viable without backend infrastructure
- Author can export submissions via browser console: `localStorage.getItem('contact_submissions')`
- Future enhancement: Add export button for CSV download (optional FR-024)

**Reference**: N/A (implementation detail, follows spec requirement)

---

### Decision 5: CSS Framework: None vs Tailwind/Bootstrap

**Options Considered**:
- A. CSS Modules + CSS Custom Properties (no framework)
- B. Tailwind CSS
- C. Bootstrap 5
- D. Styled Components

**Trade-offs**:
| Option | Bundle Size | Learning Curve | Dark Mode Support | Glassmorphism | Constitution Compliance |
|--------|------------|---------------|------------------|---------------|----------------------|
| A. CSS Modules | ~5KB (custom) | Low | Manual (CSS vars) | Full control | ✅ REQUIRED |
| B. Tailwind | ~15KB (purged) | Medium | Built-in | Utility-first | ❌ Violates |
| C. Bootstrap | ~50KB | Low | Built-in | Limited | ❌ Violates |
| D. Styled Components | ~16KB | Medium | Manual | Full control | ❌ Violates |

**Chosen**: A. CSS Modules + CSS Custom Properties

**Rationale**:
- Constitution "Mobile-First UI" explicitly prohibits Tailwind, Bootstrap, heavy libraries
- FR-008 mandates: "use glassmorphism and gradient styling via CSS custom properties (no external CSS frameworks)"
- Dark mode via CSS custom properties (prefers-color-scheme media query)
- Smallest bundle size aligns with <1MB page weight target (SC-004)
- Docusaurus native support for CSS Modules (Facebook Open Source, 2024)

**Reference**: Facebook Open Source. (2024). *Docusaurus styling and layout*. https://docusaurus.io/docs/styling-layout

---

## Testing Strategy

### Functional Testing

**Build Validation**:
```bash
# Automated in GitHub Actions (.github/workflows/deploy.yml)
npm run build
# Expected: Zero errors, build/ directory created, <2 min duration
```

**Link Validation**:
```bash
# Docusaurus built-in broken link checker
npm run build
# Expected: No broken links reported, all internal links resolve
```

**Mobile Responsiveness**:
- Manual testing on real devices: iOS (Safari), Android (Chrome)
- Chrome DevTools device emulation: iPhone 12 (375×667), iPad (768×1024)
- Acceptance: All pages render without horizontal scroll, touch targets ≥44px

**RAG Backend (if implemented)**:
```python
# pytest tests in rag/tests/test_query.py
def test_query_endpoint_returns_within_3s():
    response = client.post("/api/v1/query", json={
        "selected_text": "ROS 2 uses DDS for communication",
        "query": "What protocol does ROS 2 use?",
        "chapter_id": "chapter-02"
    })
    assert response.status_code == 200
    assert response.elapsed.total_seconds() < 3.0
    assert "DDS" in response.json()["answer"]

def test_rate_limit_enforced():
    # Send 11 requests within 1 minute
    for i in range(11):
        response = client.post("/api/v1/query", json={...})
    assert response.status_code == 429
```

### Integration Testing

**GitHub Actions Deployment Flow**:
1. Push to `main` branch triggers workflow
2. Workflow installs Node.js 18, runs `npm install`
3. Runs `npm run build` (must complete in <2 min)
4. Deploys to `gh-pages` branch
5. GitHub Pages serves updated site (must complete <5 min total)

**Acceptance**: End-to-end deployment <5 min (SC-006)

**RAG End-to-End Flow** (if implemented):
1. User selects text from Chapter 4: "Isaac Sim provides photorealistic rendering"
2. Clicks "Ask AI" button
3. Chat panel opens with selected text pre-filled
4. User submits query: "What are Isaac Sim's key features?"
5. FastAPI receives request, embeds query, searches Qdrant
6. Returns answer with citations to Chapter 4 sections
7. Response displays in <3 seconds (SC-007)

**Acceptance**: User completes query flow, answer accurate, latency <3s

### Performance Testing

**Lighthouse CI Configuration** (lighthouserc.json):
```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/", "http://localhost:3000/docs/chapter-01"],
      "numberOfRuns": 3,
      "settings": {
        "throttlingMethod": "devtools",
        "throttling": {
          "rttMs": 150,
          "throughputKbps": 1638,
          "requestLatencyMs": 562.5,
          "downloadThroughputKbps": 1474.5,
          "uploadThroughputKbps": 675
        }
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}],
        "first-contentful-paint": ["error", {"maxNumericValue": 1500}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}]
      }
    }
  }
}
```

**Build Time Monitoring**:
```bash
# In GitHub Actions workflow
- name: Build website with timing
  run: |
    start_time=$(date +%s)
    npm run build
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    echo "Build completed in ${duration}s"
    if [ $duration -gt 120 ]; then
      echo "ERROR: Build exceeded 2 minute limit"
      exit 1
    fi
```

**RAG Latency Testing** (if implemented):
```python
# Load testing with Locust (rag/tests/load_test.py)
from locust import HttpUser, task, between

class RAGUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def query_rag(self):
        self.client.post("/api/v1/query", json={
            "selected_text": "ROS 2 nodes communicate via topics",
            "query": "How do ROS 2 nodes communicate?",
            "chapter_id": "chapter-02"
        })

# Run: locust -f load_test.py --users 10 --spawn-rate 2 --host http://localhost:8000
# Acceptance: p95 latency <3s at 10 concurrent users
```

### Acceptance Criteria Validation

**Constitution Compliance**:
- [ ] Simplicity: Docusaurus core + optional RAG, no unnecessary deps
- [ ] Accuracy: All AI-generated chapters reviewed by domain experts
- [ ] Mobile-first: Tested on iOS/Android, touch targets ≥44px
- [ ] Free-tier: No paid services used (verified via infrastructure audit)
- [ ] Fast builds: <2 min Docusaurus, <5 min GitHub Actions
- [ ] Four pages: Home, Book, About, Contact (exact count verified)
- [ ] Content quality: Each chapter 1500-2500 words, code syntax highlighting works

**Functional Requirements**:
- [ ] FR-001: All 8 chapters present and accessible
- [ ] FR-006: Mobile responsive on 375×667 (iPhone) and 768×1024 (iPad)
- [ ] FR-007: Light/dark mode toggle works, preference persists
- [ ] FR-014: RAG p95 latency <3s (if implemented)
- [ ] FR-022: Lighthouse ≥90 (all 4 metrics)

**Success Criteria**:
- [ ] SC-003: FCP <1.5s, LCP <2.5s (Lighthouse on 3G)
- [ ] SC-005: Build <2 min (GitHub Actions logs)
- [ ] SC-006: Deployment <5 min (GitHub Actions logs)
- [ ] SC-010: Full reading session (Home → Ch1 → Ch8) no broken links

---

## Assumptions and Limitations

### Assumptions

1. **Content Creation**: Book chapters will be generated via separate AI workflows (one `/sp.specify` per chapter) and reviewed by human experts before merge
2. **GitHub Repository**: Public repository required for GitHub Pages free tier
3. **Node.js Version**: GitHub Actions runner provides Node.js 18+ (current LTS)
4. **Browser Support**: Modern browsers only (Chrome 90+, Firefox 88+, Safari 14+); no IE11 polyfills
5. **RAG Deployment**: If implemented, deployer has access to Render.com/Railway free tier and can configure environment variables
6. **API Keys**: Free-tier API keys for Qdrant Cloud and Neon PostgreSQL obtainable by any developer
7. **Traffic**: Initial traffic <1000 concurrent users (GitHub Pages limit); no CDN required
8. **Content Stability**: Chapter content updates infrequent (<1/week); no need for CMS or dynamic content
9. **Analytics**: GitHub Pages basic stats sufficient; no Google Analytics or third-party tracking
10. **Internationalization**: English-only in MVP; Urdu translation deferred to future (FR-023)

### Limitations

1. **RAG Accuracy**: Responses limited to book content; cannot answer questions about external topics
2. **Contact Form Persistence**: localStorage data lost if user clears browser cache/cookies
3. **Concurrent RAG Users**: Free-tier Qdrant/Neon may degrade beyond 10 concurrent users
4. **Search Functionality**: No full-text search index; users rely on browser Ctrl+F or RAG semantic search
5. **Content Versioning**: No built-in versioning; use git branches for major content revisions
6. **Mobile Performance**: 3G network testing simulated; real-world mobile networks vary
7. **Accessibility**: WCAG 2.1 AA target, not AAA (color contrast, keyboard nav only)
8. **Security**: No user authentication; all content public; no protection against scraping
9. **Scalability**: Horizontal scaling limited to GitHub Pages CDN capabilities
10. **Build Caching**: Limited npm cache in GitHub Actions; repeated builds may approach 2 min limit

---

## Next Steps

**Phase 0 Complete**: Research.md with full technology stack decisions and citations

**Phase 1 Next**:
1. Generate `data-model.md` with full entity schemas
2. Create `contracts/rag-api.yaml` (OpenAPI 3.0 spec)
3. Write `quickstart.md` with developer setup instructions
4. Validate constitution check post-design

**Phase 2** (via `/sp.tasks`):
- Generate task breakdown from this plan
- Include MVP milestone (Docusaurus book only)
- Optional RAG milestone (if desired)

---

## References

Facebook Open Source. (2024). *Docusaurus* (Version 3.x) [Documentation]. https://docusaurus.io/docs

Facebook Open Source. (2024). *Docusaurus deployment*. https://docusaurus.io/docs/deployment

GitHub, Inc. (2024). *GitHub Actions documentation*. https://docs.github.com/en/actions

GitHub, Inc. (2024). *GitHub Actions pricing*. https://docs.github.com/en/billing/managing-billing-for-github-actions

Neon, Inc. (2024). *Neon serverless PostgreSQL* [Documentation]. https://neon.tech/docs

Qdrant Solutions GmbH. (2024). *Qdrant vector database* [Documentation]. https://qdrant.tech/documentation/

Reimers, N., & Gurevych, I. (2019). sentence-transformers: Sentence embeddings using Siamese BERT-networks. *arXiv*. https://arxiv.org/abs/1908.10084

Tiangolo, S. (2024). *FastAPI* (Version 0.100+) [Documentation]. https://fastapi.tiangolo.com
