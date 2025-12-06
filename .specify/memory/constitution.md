/<!--
Sync Impact Report:
Version Change: INITIAL → 1.0.0
Modified Principles: None (initial creation)
Added Sections: All core principles, architectural constraints, deployment workflow, governance
Removed Sections: None
Templates Requiring Updates:
  ✅ spec-template.md - aligned with AI-native workflow
  ✅ plan-template.md - constitution check updated
  ✅ tasks-template.md - task categorization aligned
Follow-up TODOs: None
-->

# AI-Native Book Creation — Docusaurus + Spec-Kit Plus Constitution

## Core Principles

### I. Simplicity First

MUST keep all implementations minimal and direct. MUST NOT add features, abstractions, or dependencies beyond explicit requirements. Every component MUST have a single, clear purpose. Configuration MUST use environment variables with sensible defaults.

**Rationale**: Complexity is the enemy of maintainability, especially in AI-generated content systems. Simple code is easier to regenerate, debug, and deploy on free-tier infrastructure.

### II. Accuracy Over Speed

Content MUST be factually correct and well-researched. RAG chatbot responses MUST be grounded in book text only—no hallucinations allowed. All claims MUST be verifiable. MUST prefer small, accurate iterations over large, unverified outputs.

**Rationale**: Educational content requires trust. Inaccurate AI-generated material damages credibility and user learning outcomes.

### III. Mobile-First UI

All pages MUST be fully responsive and optimized for mobile screens first. MUST use modern CSS (glassmorphism, gradients) without heavy libraries. MUST support both light and dark modes with smooth transitions. Touch targets MUST be minimum 44x44px.

**Rationale**: Most readers consume content on mobile devices. Free-tier hosting requires lightweight frontend code for fast loading.

### IV. Spec-Driven Workflow (NON-NEGOTIABLE)

Every feature MUST follow: specification → planning → tasks → implementation. MUST NOT write code before completing spec.md and plan.md. MUST use Spec-Kit Plus templates for all artifacts. Each task MUST reference specific file paths and be independently testable.

**Rationale**: AI-generated code requires clear specifications to avoid drift and hallucinations. Spec-driven development ensures traceability and correctness.

### V. Free-Tier Architecture

MUST use free-tier services exclusively: GitHub Pages (hosting), Qdrant Cloud (vectors), Neon (PostgreSQL), FastAPI (backend). MUST NOT require GPU. Embeddings MUST use lightweight models (sentence-transformers). MUST stay within free-tier limits: storage, compute, bandwidth.

**Rationale**: Project must remain accessible and cost-free to reproduce and maintain long-term.

### VI. Fast Builds

Docusaurus build MUST complete in under 2 minutes. MUST NOT include unnecessary plugins. Static assets MUST be optimized (images compressed, CSS minified). GitHub Actions deployment MUST be under 5 minutes total.

**Rationale**: Slow builds block iteration and waste CI/CD minutes on free-tier GitHub Actions.

### VII. Four-Page Architecture

Website MUST have exactly 4 main pages:
1. **Home**: Welcome, overview, call-to-action
2. **Book**: Full content organized by chapters (5-6 chapters)
3. **About**: Author/project information
4. **Contact**: Feedback form or contact method

MUST NOT add blog, news, or other sections unless explicitly specified.

**Rationale**: Minimalism maintains focus on core content and reduces maintenance burden.

### VIII. Content Quality Standards

Each chapter MUST be concise (1500-2500 words). MUST use clear headings (H2 for sections, H3 for subsections). Code examples MUST include syntax highlighting and be runnable. MUST include diagrams or visuals where they aid understanding.

**Rationale**: Educational content requires structure and clarity. Length constraints prevent AI-generated verbosity.

## Architectural Constraints

### Technology Stack (MANDATORY)

- **Frontend Framework**: Docusaurus 3.x
- **Styling**: CSS Modules + CSS custom properties (no Tailwind, Bootstrap, or similar)
- **Hosting**: GitHub Pages
- **RAG Stack (Optional)**:
  - Vector DB: Qdrant Cloud (free tier: 1GB)
  - SQL DB: Neon PostgreSQL (free tier: 1 project)
  - Backend: FastAPI (Python 3.11+)
  - Embeddings: sentence-transformers/all-MiniLM-L6-v2
- **Build Tool**: npm/yarn
- **CI/CD**: GitHub Actions

### Data Flow

```
Content (.md) → Docusaurus Build → Static Site → GitHub Pages
                     ↓
              [Optional RAG]
                     ↓
Content → Chunking → Embeddings → Qdrant
                                      ↓
User Query → FastAPI → Qdrant Search → Context → LLM → Response
```

### Security Requirements

- MUST use environment variables for all API keys
- MUST NOT commit secrets to repository
- MUST validate all user inputs (RAG queries)
- MUST rate-limit RAG API endpoints (10 requests/minute per IP)
- MUST sanitize all rendered content to prevent XSS

### Performance Budgets

- **Lighthouse Score**: Minimum 90/100 (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Total Page Weight**: < 1MB (excluding fonts)
- **RAG Response Time**: < 3 seconds (p95)

## Deployment Workflow

### Build Requirements

1. MUST pass `npm run build` with zero errors
2. MUST pass linting (`npm run lint`)
3. MUST validate all internal links
4. MUST optimize images before build

### GitHub Pages Deployment

1. Configure repository: Settings → Pages → Deploy from GitHub Actions
2. Use official Docusaurus deploy action
3. MUST set correct `baseUrl` in `docusaurus.config.js`
4. Deployment MUST complete in under 5 minutes

### RAG System Deployment (Optional)

1. Deploy FastAPI backend to free-tier service (Render, Railway, or Fly.io)
2. Configure Qdrant Cloud collection
3. Run initial embedding generation
4. Set environment variables in deployment platform
5. MUST document all setup steps in `docs/rag-setup.md`

## Development Standards

### File Organization

```
project/
├── docs/                    # Docusaurus content
│   ├── intro.md
│   ├── chapter-01/
│   ├── chapter-02/
│   └── ...
├── src/
│   ├── components/          # React components
│   ├── css/                 # Custom styles
│   └── pages/               # Home, About, Contact
├── static/                  # Images, fonts
├── docusaurus.config.js     # Main config
├── sidebars.js              # Book navigation
├── rag/                     # Optional RAG system
│   ├── api/
│   ├── embeddings/
│   └── scripts/
├── specs/                   # Spec-Kit Plus artifacts
│   └── [feature]/
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
├── history/
│   ├── prompts/             # PHR records
│   └── adr/                 # Architecture decisions
└── .specify/                # Templates and scripts
```

### Commit Standards

- Format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Examples:
  - `feat(chapter-03): add neural networks chapter`
  - `fix(rag): correct embedding dimension mismatch`
  - `docs(constitution): update deployment workflow`

### Testing Requirements

- MUST test all pages render correctly (visual regression optional)
- MUST validate all markdown links
- MUST test RAG system with sample queries (if implemented)
- MUST verify mobile responsiveness on iOS/Android simulators or devices

## Governance

This constitution supersedes all other practices and guidelines. All development work MUST comply with these principles.

### Amendment Process

1. Propose change via GitHub issue with rationale
2. Discuss tradeoffs and alternatives
3. Update constitution with new version number (semantic versioning)
4. Update dependent templates (spec, plan, tasks)
5. Document decision in ADR if architecturally significant

### Version Bumps

- **MAJOR**: Remove or redefine core principles (e.g., switch from free-tier to paid services)
- **MINOR**: Add new principles or expand guidance (e.g., add accessibility requirements)
- **PATCH**: Clarify wording, fix typos, refine non-semantic details

### Compliance Review

All pull requests MUST verify:
- [ ] Follows spec-driven workflow (spec → plan → tasks → implementation)
- [ ] Maintains simplicity (no unnecessary dependencies)
- [ ] Passes performance budgets
- [ ] Uses only free-tier services
- [ ] Includes accurate, well-researched content
- [ ] Works on mobile devices
- [ ] Deploys successfully to GitHub Pages

### PHR and ADR Requirements

- **PHR (Prompt History Record)**: MUST create after every AI-assisted development session
- **ADR (Architecture Decision Record)**: MUST create when making significant architectural choices (framework selection, RAG architecture, deployment platform)

See `.claude/commands/sp.phr.md` and `.claude/commands/sp.adr.md` for workflows.

**Version**: 1.0.0 | **Ratified**: 2025-12-04 | **Last Amended**: 2025-12-04
