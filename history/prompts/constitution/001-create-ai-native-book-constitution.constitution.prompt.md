---
id: 001
title: Create AI-Native Book Constitution
stage: constitution
date: 2025-12-04
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: Ismat Fatima
command: /sp.constitution
labels: ["constitution", "initial-setup", "docusaurus", "ai-native", "spec-kit-plus"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - None
---

## Prompt

```text
Project Name:
AI-Native Book Creation — Docusaurus + Spec-Kit Plus

Purpose:
Create a clean, modern, AI-driven textbook using Docusaurus and Claude Code + Spec-Kit Plus. The book should be simple, fast, accurate, and fully deployable on GitHub Pages.

Scope:
- Write a complete book with AI/Spec-driven workflow.
- ~5–6 concise chapters covering the full topic with clarity.
- Use Docusaurus for UI and GitHub Pages for hosting.
- Include optional free-tier RAG chatbot (select-text → ask AI).
- Full Claude Code workflow: specification → planning → tasks → implementation.

Core Principles:
- Simplicity
- Accuracy
- Minimalism
- Fast builds
- Free-tier friendly design
- Mobile-first UI (glassmorphism + gradients)
- Light + Dark mode
- High clarity → no unnecessary complexity

Key Features:
- Docusaurus-based book
- GitHub Pages deployment
- Optional RAG chatbot (Qdrant + Neon + FastAPI)
- Select-text → Ask AI
- Optional Urdu or personalization features
- Content fully AI-spec generated

Constraints:
- No heavy GPU usage
- Lightweight embeddings only
- Free-tier architecture preferred
- Clean UI only (no bloated libraries)
- Exactly 4 main pages: Home, Book, About, Contact

Success Criteria:
- Fast and error-free Docusaurus build
- Smooth GitHub Pages deployment
- Accurate chatbot responses (book-text only)
- Clean, simple, mobile-friendly UI
- Full AI-native, spec-driven workflow working end-to-end

Generate the full constitution.
```

## Response snapshot

Created comprehensive project constitution (v1.0.0) for AI-Native Book Creation project with 8 core principles:

**Core Principles:**
1. Simplicity First - minimal implementations, single-purpose components
2. Accuracy Over Speed - factually correct, RAG grounded in book text only
3. Mobile-First UI - responsive, glassmorphism, light/dark mode
4. Spec-Driven Workflow (NON-NEGOTIABLE) - spec → plan → tasks → implementation
5. Free-Tier Architecture - GitHub Pages, Qdrant, Neon, FastAPI (all free tiers)
6. Fast Builds - <2 min Docusaurus builds, <5 min deployments
7. Four-Page Architecture - Home, Book, About, Contact only
8. Content Quality Standards - 1500-2500 words/chapter, clear structure

**Additional Sections:**
- Architectural Constraints (mandatory tech stack, data flow, security, performance budgets)
- Deployment Workflow (build requirements, GitHub Pages, optional RAG)
- Development Standards (file organization, commit standards, testing)
- Governance (amendment process, version bumps, compliance review, PHR/ADR requirements)

**Technology Stack:**
- Frontend: Docusaurus 3.x, CSS Modules
- Hosting: GitHub Pages
- Optional RAG: Qdrant Cloud, Neon PostgreSQL, FastAPI, sentence-transformers
- CI/CD: GitHub Actions

**Performance Budgets:**
- Lighthouse Score: ≥90/100
- FCP: <1.5s, LCP: <2.5s
- Page Weight: <1MB
- RAG Response: <3s (p95)

Constitution ratified 2025-12-04 with no template conflicts or deferred items.

## Outcome

- ✅ Impact: Established foundational governance document defining all architectural, technical, and workflow standards for AI-native book creation project
- 🧪 Tests: None (constitution document)
- 📁 Files: Created .specify/memory/constitution.md (v1.0.0, 224 lines)
- 🔁 Next prompts: `/sp.specify <feature-name>` to create first feature specification following constitution principles
- 🧠 Reflection: Constitution successfully balances simplicity, free-tier constraints, and AI-native workflow requirements. All principles are testable and measurable.

## Evaluation notes (flywheel)

- Failure modes observed: None - clean initial creation with all placeholders filled
- Graders run and results (PASS/FAIL): PASS - no unresolved placeholders, version coherent, dates valid, principles declarative
- Prompt variant (if applicable): Standard sp.constitution template with complete user requirements
- Next experiment (smallest change to try): Create first feature spec (e.g., Docusaurus setup) to validate constitution principles in practice
