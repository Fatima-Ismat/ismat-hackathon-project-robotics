# Tasks: Physical AI & Humanoid Robotics Book

**Feature**: 001-physical-ai-robotics-book
**Input**: Design documents from `/specs/001-physical-ai-robotics-book/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/rag-api.yaml ✓

**Tests**: NO TESTS REQUESTED in specification - tasks focus on implementation only

**Organization**: Tasks are grouped by user story (P1-P4) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Docusaurus structure

- [X] T001 Initialize Docusaurus project with classic preset at repository root
- [X] T002 [P] Configure docusaurus.config.js with GitHub Pages baseUrl, URL, and project metadata
- [X] T003 [P] Create .gitignore with node_modules/, build/, .env, .DS_Store
- [X] T004 [P] Initialize package.json with Docusaurus 3.x dependencies and scripts
- [X] T005 [P] Create GitHub Actions workflow file .github/workflows/deploy.yml for automated deployment
- [X] T006 [P] Setup custom CSS variables in src/css/custom.css for glassmorphism and light/dark themes
- [X] T007 [P] Create sidebars.js configuration for auto-generated chapter navigation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Create base page layout component in src/components/Layout/index.tsx with navbar and footer
- [X] T009 [P] Implement dark mode toggle logic in src/components/ColorModeToggle/index.tsx using Docusaurus theme hooks
- [X] T010 [P] Setup localStorage utility functions in src/utils/localStorage.ts for user preferences and contact submissions
- [X] T011 [P] Create mobile-first responsive CSS in src/css/mobile.css with breakpoints (375px, 768px, 1920px)
- [X] T012 Create docs/ directory structure with placeholders: intro.md, chapter-01/ through chapter-08/
- [X] T013 [P] Configure environment variables support in docusaurus.config.js via customFields for RAG backend URL

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse Book Content (Priority: P1) 🎯 MVP

**Goal**: Users can read all 8 chapters with responsive navigation on desktop and mobile

**Independent Test**: Deploy Docusaurus site locally with all 8 chapter placeholders, navigate through chapters on desktop (1920x1080) and mobile (375x667), verify sidebar navigation, dark mode toggle, and responsive layout without horizontal scrolling

### Implementation for User Story 1

- [X] T014 [P] [US1] Create Home page in src/pages/index.tsx with hero section, CTA button, and book preview
- [X] T015 [P] [US1] Create Chapter frontmatter template (id, title, number, word_count, status) for consistency
- [X] T016 [P] [US1] Write Chapter 1: Introduction to Physical AI in docs/chapter-01/index.md (1500-2500 words, H2/H3 headings, code examples)
- [X] T017 [P] [US1] Write Chapter 2: ROS 2 Fundamentals in docs/chapter-02/index.md (1500-2500 words, H2/H3 headings, code examples)
- [X] T018 [P] [US1] Write Chapter 3: Digital Twin Simulation in docs/chapter-03/index.md (1500-2500 words, H2/H3 headings, code examples)
- [X] T019 [P] [US1] Write Chapter 4: NVIDIA Isaac AI Platform in docs/chapter-04/index.md (1500-2500 words, H2/H3 headings, code examples)
- [X] T020 [P] [US1] Write Chapter 5: Vision-Language-Action (VLA) in docs/chapter-05/index.md (1500-2500 words, H2/H3 headings, code examples)
- [X] T021 [P] [US1] Write Chapter 6: Humanoid Robot Development in docs/chapter-06/index.md (1500-2500 words, H2/H3 headings, code examples)
- [X] T022 [P] [US1] Write Chapter 7: Conversational Robotics in docs/chapter-07/index.md (1500-2500 words, H2/H3 headings, code examples)
- [X] T023 [P] [US1] Write Chapter 8: Capstone Project in docs/chapter-08/index.md (1500-2500 words, H2/H3 headings, code examples)
- [X] T024 [US1] Create ProgressIndicator component in src/components/ProgressIndicator/index.tsx showing scroll percentage within chapter
- [X] T025 [US1] Implement glassmorphism styles for cards, nav, and sidebar in src/css/custom.css using backdrop-filter and CSS variables
- [X] T026 [US1] Configure sidebar auto-generation in sidebars.js based on docs/ folder structure with collapsible sections
- [X] T027 [US1] Add touch target sizing (min 44x44px) to all interactive elements in src/css/mobile.css
- [ ] T028 [US1] Optimize all chapter images (compress PNG/JPG) and place in static/img/ directory
- [X] T029 [US1] Configure Lighthouse CI in lighthouserc.json with assertions: Performance ≥90, Accessibility ≥90, Best Practices ≥90, SEO ≥90

**Checkpoint**: At this point, User Story 1 should be fully functional - users can browse all 8 chapters with navigation, dark mode, and responsive design

---

## Phase 4: User Story 2 - Ask Questions About Book Content (Priority: P2)

**Goal**: Users can select text and ask AI questions with RAG backend providing book-grounded responses

**Independent Test**: Deploy RAG backend to Render.com, embed all chapter content in Qdrant, select text from any chapter, submit query via Ask AI button, verify response is accurate, grounded in book content, and returns within 3 seconds

### RAG Backend Setup

- [ ] T030 [P] [US2] Create rag/ directory structure: api/, embeddings/, db/, tests/
- [ ] T031 [P] [US2] Initialize Python project with requirements.txt (FastAPI 0.104.1, uvicorn, qdrant-client, psycopg2-binary, sentence-transformers, pydantic, slowapi)
- [ ] T032 [P] [US2] Create .env.example in rag/ with QDRANT_URL, QDRANT_API_KEY, NEON_CONNECTION_STRING, RATE_LIMIT_PER_MINUTE
- [ ] T033 [US2] Create Qdrant client module in rag/db/qdrant_client.py with connection, collection creation, vector search methods
- [ ] T034 [US2] Create Neon PostgreSQL client module in rag/db/neon_client.py with connection pooling and query logging
- [ ] T035 [US2] Implement database initialization script in rag/db/init_neon.py to create rag_queries table with indexes
- [ ] T036 [US2] Create Qdrant collection initialization script in rag/embeddings/init_qdrant.py (384-dim, cosine similarity)

### RAG Embedding Generation

- [ ] T037 [P] [US2] Implement text chunker in rag/embeddings/chunker.py (512 tokens per chunk with overlap)
- [ ] T038 [US2] Create embedding generation script in rag/embeddings/generate.py using sentence-transformers/all-MiniLM-L6-v2
- [ ] T039 [US2] Process all 8 chapters and upload embeddings to Qdrant collection with metadata (chapter_id, section_id, chunk_text)

### RAG API Implementation

- [ ] T040 [P] [US2] Create Pydantic request/response models in rag/api/models.py (QueryRequest, QueryResponse, HealthResponse, ErrorResponse)
- [ ] T041 [US2] Implement FastAPI app entry point in rag/api/main.py with CORS, error handling, startup/shutdown events
- [ ] T042 [US2] Create query router in rag/api/routers/query.py with POST /api/v1/query endpoint
- [ ] T043 [US2] Implement rate limiting middleware (10 req/min per IP) using slowapi in rag/api/main.py
- [ ] T044 [US2] Create health check endpoint GET /api/v1/health in rag/api/routers/health.py checking Qdrant, Neon, and model status
- [ ] T045 [US2] Implement query processing logic: embed query → search Qdrant → retrieve context → generate grounded answer
- [ ] T046 [US2] Add structured logging to rag/api/main.py (timestamp, log level, query_id, latency_ms, error context)
- [ ] T047 [US2] Create Procfile and runtime.txt in rag/ for Render.com deployment

### Frontend RAG Integration

- [ ] T048 [P] [US2] Create AskAIButton component in src/components/AskAIButton/index.tsx with text selection detection
- [ ] T049 [US2] Create ChatPanel component in src/components/ChatPanel/index.tsx with query input, response display, and source citations
- [ ] T050 [US2] Implement RAG API client in src/utils/ragClient.ts with fetch, error handling, and timeout (3s)
- [ ] T051 [US2] Add Ask AI button to all chapter pages via Docusaurus theme swizzling in src/theme/DocItem/Content/index.tsx
- [ ] T052 [US2] Implement graceful degradation: check RAG backend health, show "temporarily unavailable" if unhealthy
- [ ] T053 [US2] Add client-side error logging to browser console for RAG query failures
- [ ] T054 [US2] Style ChatPanel with glassmorphism effects matching site theme in src/components/ChatPanel/styles.module.css

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can browse chapters AND ask AI questions

---

## Phase 5: User Story 3 - Contact Author and Join Waitlist (Priority: P3)

**Goal**: Users can submit contact form with name, email, and message stored in browser localStorage

**Independent Test**: Navigate to Contact page, fill out form with name/email/message, submit, verify data is stored in localStorage, check form validation works, and success message appears

### Implementation for User Story 3

- [X] T055 [P] [US3] Create Contact page in src/pages/contact.tsx with React form component
- [X] T056 [US3] Implement ContactForm component in src/components/ContactForm/index.tsx with controlled inputs (name, email, message)
- [X] T057 [US3] Add client-side form validation (email regex, field length limits) in src/components/ContactForm/validation.ts
- [X] T058 [US3] Implement localStorage submission handler in src/components/ContactForm/index.tsx (append to contact_submissions array)
- [X] T059 [US3] Create success/error message display logic in src/components/ContactForm/index.tsx
- [X] T060 [US3] Style ContactForm with glassmorphism and mobile responsiveness in src/components/ContactForm/styles.module.css
- [X] T061 [US3] Add export utility function in src/utils/exportSubmissions.ts for author to download CSV from browser console
- [X] T062 [US3] Update Contact page with form component, waitlist messaging, and privacy notice

**Checkpoint**: All three priority user stories (US1, US2, US3) should now be independently functional

---

## Phase 6: User Story 4 - Learn About Project and Author (Priority: P3)

**Goal**: Users can read author bio, project vision, and curriculum goals on About page

**Independent Test**: Navigate to About page, verify it displays author bio, project motivation, learning outcomes, and chapter list with descriptions

### Implementation for User Story 4

- [X] T063 [P] [US4] Create About page in src/pages/about.md with author bio, project vision, and motivation
- [X] T064 [P] [US4] Add learning outcomes section to About page listing key skills and knowledge gained
- [X] T065 [US4] Create chapter overview section on About page with all 8 chapters and brief descriptions
- [X] T066 [US4] Style About page with consistent glassmorphism theme in src/pages/about.md using Docusaurus MDX features
- [X] T067 [US4] Add links to relevant resources (ROS 2 docs, NVIDIA Isaac docs) in About page

**Checkpoint**: All four user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final deployment

- [ ] T068 [P] Review all chapters for word count (1500-2500), heading hierarchy (H2→H3), and code syntax highlighting
- [ ] T069 [P] Human review all chapters for technical accuracy (ROS 2, NVIDIA Isaac, VLA, humanoid robotics)
- [ ] T070 [P] Verify all internal links between chapters work correctly
- [ ] T071 [P] Test dark mode across all pages (Home, Book chapters, About, Contact)
- [ ] T072 [P] Test mobile responsiveness on real iOS (Safari) and Android (Chrome) devices
- [ ] T073 Run full Lighthouse audit on production build (Performance, Accessibility, Best Practices, SEO ≥90)
- [ ] T074 Verify GitHub Actions workflow deploys successfully to GitHub Pages (<5 min)
- [ ] T075 [P] Add README.md at repository root with project description, setup instructions, and deployment guide
- [ ] T076 [P] Deploy RAG backend to Render.com and verify health endpoint
- [ ] T077 [P] Update docusaurus.config.js with production RAG backend URL
- [ ] T078 Validate quickstart.md instructions by following them step-by-step in fresh environment
- [ ] T079 [P] Create CONTRIBUTING.md with guidelines for adding new chapters or features
- [ ] T080 Final end-to-end test: Home → Chapter 1 → Ask AI query → Chapter 8 → Contact form → About page

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-6)**: All depend on Foundational phase completion
  - US1 (Browse Book): Can start after Foundational - No dependencies on other stories
  - US2 (RAG Q&A): Can start after Foundational - Independent backend, integrates with US1 frontend
  - US3 (Contact Form): Can start after Foundational - Completely independent
  - US4 (About Page): Can start after Foundational - Completely independent
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation → US1 (MVP deployable at this point)
- **User Story 2 (P2)**: Foundation → US2 (requires US1 frontend for integration but backend is independent)
- **User Story 3 (P3)**: Foundation → US3 (completely independent)
- **User Story 4 (P3)**: Foundation → US4 (completely independent)

### Within Each User Story

**User Story 1 (Browse Book)**:
1. Home page and chapter templates in parallel
2. All 8 chapters can be written in parallel (T016-T023)
3. ProgressIndicator, styles, and optimization in any order after chapters exist

**User Story 2 (RAG)**:
1. Backend setup tasks (T030-T036) can mostly run in parallel
2. Embedding generation (T037-T039) sequential: chunker → generator → upload
3. API implementation (T040-T047) sequential: models → app → routes → deployment
4. Frontend integration (T048-T054) mostly parallel except ChatPanel depends on AskAIButton

**User Story 3 (Contact Form)**:
- Page, component, validation, and styles can all run in parallel

**User Story 4 (About Page)**:
- All About page content sections can be written in parallel

### Parallel Opportunities

**Setup Phase (1)**:
- T002, T003, T004, T005, T006, T007 can all run in parallel

**Foundational Phase (2)**:
- T009, T010, T011, T013 can run in parallel after T008

**User Story 1 (P1)**:
- T014, T015 can run in parallel
- T016-T023 (all 8 chapters) can run in parallel
- T028, T029 can run in parallel

**User Story 2 (P2)**:
- T030, T031, T032 can run in parallel
- T037, T040 can run in parallel
- T048 and T050 can run in parallel

**User Story 3 (P3)**:
- T055, T056, T057, T060 can run in parallel

**User Story 4 (P4)**:
- T063, T064 can run in parallel

**Polish Phase (7)**:
- T068, T069, T070, T071, T072, T075, T076, T077, T079 can all run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all chapter writing tasks together:
Task: "Write Chapter 1: Introduction to Physical AI in docs/chapter-01/index.md"
Task: "Write Chapter 2: ROS 2 Fundamentals in docs/chapter-02/index.md"
Task: "Write Chapter 3: Digital Twin Simulation in docs/chapter-03/index.md"
Task: "Write Chapter 4: NVIDIA Isaac AI Platform in docs/chapter-04/index.md"
Task: "Write Chapter 5: Vision-Language-Action (VLA) in docs/chapter-05/index.md"
Task: "Write Chapter 6: Humanoid Robot Development in docs/chapter-06/index.md"
Task: "Write Chapter 7: Conversational Robotics in docs/chapter-07/index.md"
Task: "Write Chapter 8: Capstone Project in docs/chapter-08/index.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T013) - CRITICAL
3. Complete Phase 3: User Story 1 (T014-T029)
4. **STOP and VALIDATE**:
   - Run `npm run build` (must complete <2 min)
   - Run Lighthouse audit (all metrics ≥90)
   - Test on desktop and mobile
   - Navigate through all 8 chapters
   - Toggle dark mode
5. Deploy to GitHub Pages → MVP COMPLETE!

### Incremental Delivery

1. **MVP (US1)**: Setup + Foundational + Browse Book → Deploy
   - Value: Users can read all 8 chapters

2. **Enhanced (US1 + US2)**: Add RAG Q&A → Deploy
   - Value: Users can browse AND ask AI questions

3. **Engagement (US1 + US2 + US3)**: Add Contact Form → Deploy
   - Value: Users can provide feedback

4. **Complete (US1 + US2 + US3 + US4)**: Add About Page → Deploy
   - Value: Full site with author context

### Parallel Team Strategy

With 3 developers after Foundational phase completes:

- **Developer A**: User Story 1 (Browse Book) - T014-T029
- **Developer B**: User Story 2 (RAG Backend) - T030-T047
- **Developer C**: User Stories 3 & 4 (Contact + About) - T055-T067

Then:
- **Developer B** integrates RAG frontend (T048-T054) with Developer A's work
- All converge on Polish phase (T068-T080)

---

## Summary Statistics

- **Total Tasks**: 80
- **Setup Phase**: 7 tasks
- **Foundational Phase**: 6 tasks (BLOCKS all user stories)
- **User Story 1 (P1)**: 16 tasks
- **User Story 2 (P2)**: 25 tasks
- **User Story 3 (P3)**: 8 tasks
- **User Story 4 (P3)**: 5 tasks
- **Polish Phase**: 13 tasks

**Parallel Opportunities**: 45 tasks marked [P] can run concurrently (56% of total)

**MVP Scope** (Suggested): Phases 1-3 only = 29 tasks
**Full Scope**: All 80 tasks

---

## Notes

- [P] tasks = different files, no blocking dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- NO tests included per specification (tests not requested)
- Word count validation: 1500-2500 per chapter (T068)
- Build time target: <2 min (FR-019)
- Deployment target: <5 min (SC-006)
- Lighthouse targets: All metrics ≥90 (FR-022)
- RAG latency target: p95 <3s (FR-014)
- Commit after each logical task group
- Stop at any checkpoint to validate story independently
