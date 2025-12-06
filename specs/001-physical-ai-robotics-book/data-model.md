# Data Model: Physical AI & Humanoid Robotics Book

**Feature**: 001-physical-ai-robotics-book
**Date**: 2025-12-04
**Phase**: 1 (Design)

## Overview

This document defines all data entities, their attributes, relationships, validation rules, and lifecycle states for the Physical AI & Humanoid Robotics Book platform. The system uses three storage layers:

1. **Git-tracked Content**: Markdown files for book chapters (immutable after publication)
2. **Browser localStorage**: User preferences and contact form submissions (ephemeral, client-side)
3. **RAG Backend** (optional): Qdrant (vectors) + Neon PostgreSQL (metadata)

---

## Entity 1: Chapter

### Description
Represents a single chapter of the book with markdown content, metadata, and structural information.

### Storage
- **Location**: `docs/chapter-{number}/index.md` (git-tracked)
- **Format**: Markdown with YAML frontmatter

### Attributes

| Field | Type | Required | Validation | Default | Description |
|-------|------|----------|------------|---------|-------------|
| `id` | string | Yes | UUID v4 | Auto-generated | Unique identifier |
| `number` | integer | Yes | 1-8 | N/A | Chapter sequence number |
| `title` | string | Yes | 5-100 chars | N/A | Chapter title (e.g., "Introduction to Physical AI") |
| `slug` | string | Yes | Kebab-case, unique | Auto from title | URL-friendly identifier (e.g., "introduction-to-physical-ai") |
| `content_md` | string | Yes | 1500-2500 words | N/A | Markdown content body |
| `word_count` | integer | Yes | 1500-2500 | Auto-calculated | Total words (excluding code blocks) |
| `sections` | array<Section> | Yes | 3-10 sections | Auto-extracted | H2/H3 headings within chapter |
| `code_examples` | array<CodeExample> | No | 0-15 | [] | Embedded code snippets |
| `created_at` | datetime | Yes | ISO 8601 | Auto | Git commit timestamp |
| `updated_at` | datetime | Yes | ISO 8601 | Auto | Last git commit timestamp |
| `status` | enum | Yes | draft/published | draft | Publication status |

### Example (YAML frontmatter)

```yaml
---
id: "550e8400-e29b-41d4-a716-446655440001"
number: 1
title: "Introduction to Physical AI"
slug: "introduction-to-physical-ai"
word_count: 2134
status: published
created_at: "2025-12-04T10:00:00Z"
updated_at: "2025-12-04T15:30:00Z"
---

# Introduction to Physical AI

Physical AI represents the convergence of artificial intelligence and robotics...
```

### Relationships
- **Has Many**: Sections (1 chapter → 3-10 sections)
- **Has Many**: CodeExamples (1 chapter → 0-15 code snippets)
- **Referenced By**: RAGQuery (for context sourcing)

### Validation Rules
1. Word count MUST be 1500-2500 (excluding code blocks, YAML frontmatter)
2. Chapter numbers MUST be sequential 1-8 with no gaps
3. Slug MUST be unique across all chapters
4. Status transition: `draft` → `published` only (no reversal without new version)
5. Sections MUST have proper heading hierarchy (H2 followed by H3, no H4)

### Lifecycle States
- **draft**: Chapter written, under review
- **published**: Merged to `main` branch, live on GitHub Pages

---

## Entity 2: Section

### Description
Represents a section within a chapter, extracted from H2/H3 markdown headings.

### Storage
- **Location**: Derived from markdown headings in Chapter content
- **Format**: Extracted programmatically by Docusaurus

### Attributes

| Field | Type | Required | Validation | Default | Description |
|-------|------|----------|------------|---------|-------------|
| `id` | string | Yes | UUID v4 | Auto-generated | Unique identifier |
| `chapter_id` | string | Yes | Valid Chapter.id | N/A | Parent chapter reference |
| `level` | integer | Yes | 2 or 3 | N/A | Heading level (H2=2, H3=3) |
| `title` | string | Yes | 3-80 chars | N/A | Section heading text |
| `slug` | string | Yes | Kebab-case | Auto from title | Anchor link (e.g., "#ros-2-topics") |
| `content` | string | Yes | 50-800 words | N/A | Text content between this heading and next |
| `parent_section_id` | string | No | Valid Section.id | null | Parent section (for H3 under H2) |
| `order` | integer | Yes | 0-99 | Sequential | Display order within chapter |

### Example

```json
{
  "id": "660e9500-f39c-51e5-b827-557766551112",
  "chapter_id": "550e8400-e29b-41d4-a716-446655440001",
  "level": 2,
  "title": "Embodied Intelligence",
  "slug": "embodied-intelligence",
  "content": "Embodied intelligence refers to AI systems that interact with the physical world...",
  "parent_section_id": null,
  "order": 0
}
```

### Relationships
- **Belongs To**: Chapter (many sections → 1 chapter)
- **Has Many**: Sections (H2 can have multiple H3 children)
- **Belongs To**: Section (optional, for H3 → H2 parent relationship)

### Validation Rules
1. Level 2 (H2) sections MUST NOT have `parent_section_id`
2. Level 3 (H3) sections MUST have `parent_section_id` pointing to H2
3. Slug MUST be unique within chapter (but can repeat across chapters)
4. Order MUST be sequential starting from 0

---

## Entity 3: RAGQuery (Optional - if RAG implemented)

### Description
Represents a user query to the RAG system, including selected context, question, and response metadata.

### Storage
- **Location**: Neon PostgreSQL table `rag_queries`
- **Retention**: 90 days (auto-delete older records)

### Attributes

| Field | Type | Required | Validation | Default | Description |
|-------|------|----------|------------|---------|-------------|
| `id` | string | Yes | UUID v4 | Auto-generated | Unique query identifier |
| `timestamp` | datetime | Yes | ISO 8601 | Auto | Query submission time |
| `user_ip` | string | Yes | IPv4/IPv6 | Hashed | User IP (hashed for privacy) |
| `selected_text` | string | No | 0-500 chars | null | Text selected by user before asking |
| `query` | string | Yes | 5-500 chars | N/A | User's question |
| `response` | string | Yes | 10-2000 chars | N/A | AI-generated answer |
| `latency_ms` | integer | Yes | 0-10000 | Measured | Total response time (ms) |
| `chapter_context` | string | Yes | Valid Chapter.slug | N/A | Chapter user was reading |
| `sources` | array<object> | Yes | 1-5 sources | N/A | Chapters/sections used for answer |
| `embedding_time_ms` | integer | Yes | 0-1000 | Measured | sentence-transformers inference time |
| `qdrant_time_ms` | integer | Yes | 0-1000 | Measured | Qdrant vector search time |
| `status` | enum | Yes | success/error | N/A | Query completion status |
| `error_message` | string | No | 0-200 chars | null | Error details if status=error |

### Example (Neon PostgreSQL row)

```sql
CREATE TABLE rag_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_ip VARCHAR(64) NOT NULL,  -- SHA-256 hash
  selected_text TEXT,
  query TEXT NOT NULL CHECK (length(query) BETWEEN 5 AND 500),
  response TEXT NOT NULL,
  latency_ms INTEGER NOT NULL,
  chapter_context VARCHAR(100) NOT NULL,
  sources JSONB NOT NULL,
  embedding_time_ms INTEGER NOT NULL,
  qdrant_time_ms INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'success',
  error_message TEXT,
  CONSTRAINT valid_latency CHECK (latency_ms >= 0 AND latency_ms <= 10000)
);

-- Example row
INSERT INTO rag_queries VALUES (
  '770f0611-043d-62f6-c938-668877662223',
  '2025-12-04 16:45:23+00',
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  'ROS 2 uses DDS for communication',
  'What protocol does ROS 2 use for inter-process communication?',
  'ROS 2 uses DDS (Data Distribution Service) as its middleware communication protocol. DDS provides real-time, peer-to-peer communication...',
  285,
  'ros-2-fundamentals',
  '[{"chapter": "ros-2-fundamentals", "section": "communication-middleware"}]'::jsonb,
  58,
  102,
  'success',
  NULL
);
```

### Relationships
- **References**: Chapter (via `chapter_context`)
- **References**: Sections (via `sources` JSONB array)

### Validation Rules
1. Query length MUST be 5-500 characters
2. Latency MUST be <10000ms (10 seconds max before timeout)
3. User IP MUST be hashed with SHA-256 before storage (privacy)
4. Sources array MUST contain 1-5 chapter/section references
5. Status MUST be 'success' OR 'error' (if error, `error_message` required)

### Lifecycle States
- **pending**: Query submitted, processing
- **success**: Response generated, returned to user
- **error**: Processing failed (rate limit, timeout, Qdrant unavailable)

---

## Entity 4: ContactSubmission

### Description
Represents a user submission from the Contact page waitlist form.

### Storage
- **Location**: Browser localStorage (key: `contact_submissions`)
- **Format**: JSON array
- **Persistence**: Browser-dependent (cleared on cache clear)

### Attributes

| Field | Type | Required | Validation | Default | Description |
|-------|------|----------|------------|---------|-------------|
| `id` | string | Yes | UUID v4 | Auto-generated | Unique submission identifier |
| `name` | string | Yes | 2-100 chars | N/A | User's full name |
| `email` | string | Yes | Valid email format | N/A | User's email address |
| `message` | string | Yes | 10-1000 chars | N/A | Feedback or inquiry message |
| `timestamp` | datetime | Yes | ISO 8601 | Auto | Submission time |
| `status` | enum | Yes | pending/reviewed | pending | Review status |

### Example (localStorage JSON)

```json
[
  {
    "id": "880g1722-154e-73g7-d049-779988773334",
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "message": "Excited to learn about humanoid robotics! When will the full course be available?",
    "timestamp": "2025-12-04T17:30:15Z",
    "status": "pending"
  },
  {
    "id": "990h2833-265f-84h8-e150-880099884445",
    "name": "John Smith",
    "email": "john.smith@robotics.com",
    "message": "Excellent chapter on ROS 2. Would love to see more examples on URDF modeling.",
    "timestamp": "2025-12-04T18:45:00Z",
    "status": "pending"
  }
]
```

### Relationships
- **None** (client-side only, no backend persistence)

### Validation Rules
1. Email MUST match regex: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
2. Name MUST NOT contain special characters (alphanumeric + spaces/hyphens only)
3. Message MUST be 10-1000 characters
4. Timestamp MUST be ISO 8601 format with timezone

### Lifecycle States
- **pending**: Submitted, awaiting author review
- **reviewed**: Author has read the submission (manual status update via browser console)

### Export Method (for author)

```javascript
// Browser console command to export submissions as CSV
function exportSubmissions() {
  const data = JSON.parse(localStorage.getItem('contact_submissions') || '[]');
  const csv = 'Name,Email,Message,Timestamp,Status\n' +
    data.map(row =>
      `"${row.name}","${row.email}","${row.message}","${row.timestamp}","${row.status}"`
    ).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `contact-submissions-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

exportSubmissions();
```

---

## Entity 5: UserPreference

### Description
Stores user-specific settings like theme, language, reading progress, and bookmarks.

### Storage
- **Location**: Browser localStorage (key: `user_preferences`)
- **Format**: JSON object (single object, not array)
- **Persistence**: Browser-dependent

### Attributes

| Field | Type | Required | Validation | Default | Description |
|-------|------|----------|------------|---------|-------------|
| `theme` | enum | Yes | 'light' or 'dark' | 'light' | Color theme preference |
| `language` | enum | Yes | 'en' or 'ur' | 'en' | Content language (Urdu optional future feature) |
| `last_chapter_slug` | string | No | Valid Chapter.slug | null | Last chapter visited |
| `bookmarks` | array<string> | No | Array of Chapter.slug | [] | User-saved chapters |
| `reading_progress` | object | No | Chapter slug → % complete | {} | Scroll position per chapter |
| `consent_analytics` | boolean | No | true/false | false | User consent for future analytics (not used in MVP) |

### Example (localStorage JSON)

```json
{
  "theme": "dark",
  "language": "en",
  "last_chapter_slug": "nvidia-isaac-ai-platform",
  "bookmarks": [
    "introduction-to-physical-ai",
    "ros-2-fundamentals",
    "humanoid-robot-development"
  ],
  "reading_progress": {
    "introduction-to-physical-ai": 100,
    "ros-2-fundamentals": 65,
    "digital-twin-simulation": 20,
    "nvidia-isaac-ai-platform": 10
  },
  "consent_analytics": false
}
```

### Relationships
- **References**: Chapter (via `last_chapter_slug` and `bookmarks`)

### Validation Rules
1. Theme MUST be 'light' OR 'dark'
2. Language MUST be 'en' (or 'ur' if Urdu feature enabled)
3. Last chapter slug MUST exist in published chapters
4. Bookmarks MUST be array of valid chapter slugs (duplicates removed)
5. Reading progress percentages MUST be 0-100

### Lifecycle States
- **Active**: User has set preferences (localStorage populated)
- **Default**: User has never modified preferences (use system defaults)

---

## Validation Summary

### Data Integrity Rules

| Rule | Entity | Enforcement | Error Handling |
|------|--------|-------------|---------------|
| Unique chapter numbers | Chapter | Git pre-commit hook | Block commit if duplicate |
| Word count 1500-2500 | Chapter | CI/CD pipeline | Fail build if out of range |
| Email format | ContactSubmission | Client-side (HTML5 validation) | Inline error message |
| Query length 5-500 chars | RAGQuery | FastAPI Pydantic validation | 400 Bad Request |
| Latency <3000ms | RAGQuery | Backend timeout | 503 Service Unavailable |
| Rate limit 10 req/min | RAGQuery | FastAPI middleware | 429 Too Many Requests |

### Indexing Strategy (Neon PostgreSQL)

```sql
-- Index for RAG query lookups by chapter
CREATE INDEX idx_rag_queries_chapter ON rag_queries(chapter_context);

-- Index for recent queries (90-day retention cleanup)
CREATE INDEX idx_rag_queries_timestamp ON rag_queries(timestamp DESC);

-- Index for latency analytics
CREATE INDEX idx_rag_queries_latency ON rag_queries(latency_ms);
```

---

## Entity Relationship Diagram

```
┌─────────────┐
│   Chapter   │
│ (git file)  │
└──────┬──────┘
       │
       │ 1:N
       ▼
┌─────────────┐
│   Section   │
│ (derived)   │
└──────┬──────┘
       │
       │ M:N
       ▼
┌─────────────┐       ┌──────────────────┐
│  RAGQuery   │◄─────►│ UserPreference   │
│ (Neon DB)   │       │ (localStorage)   │
└─────────────┘       └──────────────────┘
       ▲
       │ M:1
       │
┌──────┴────────────┐
│ ContactSubmission │
│  (localStorage)   │
└───────────────────┘
```

**Relationships**:
- Chapter → Section: 1:N (one chapter has many sections)
- RAGQuery → Chapter: M:N (query can reference multiple chapters, chapter referenced by many queries)
- UserPreference → Chapter: M:N (via bookmarks array)
- ContactSubmission: Standalone (no relationships)

---

## Data Migration & Evolution

### Chapter Content Updates
- **Strategy**: Git-based versioning
- **Process**: New branch → Edit markdown → PR → Review → Merge
- **Rollback**: Revert git commit

### RAG Schema Changes (if implemented)
- **Strategy**: Alembic migrations (SQLAlchemy)
- **Backward Compatibility**: Add columns only, never drop
- **Example**:

```python
# alembic/versions/001_add_rag_queries.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'rag_queries',
        sa.Column('id', sa.UUID(), primary_key=True),
        sa.Column('timestamp', sa.DateTime(timezone=True)),
        # ... (all columns from schema above)
    )

def downgrade():
    op.drop_table('rag_queries')
```

### localStorage Schema Evolution
- **Strategy**: Version field in localStorage objects
- **Process**: Check version on load, migrate if old version detected

```javascript
// Version migration example
function migrateUserPreferences() {
  const data = JSON.parse(localStorage.getItem('user_preferences') || '{}');

  if (!data.version || data.version < 2) {
    // Migrate v1 → v2: Add reading_progress field
    data.reading_progress = data.reading_progress || {};
    data.version = 2;
    localStorage.setItem('user_preferences', JSON.stringify(data));
  }

  return data;
}
```

---

## Performance Considerations

### Qdrant Vector Storage Optimization
- **Dimensions**: 384 (sentence-transformers/all-MiniLM-L6-v2)
- **Distance Metric**: Cosine similarity
- **HNSW Parameters**: `m=16`, `ef_construct=100` (Qdrant defaults)
- **Estimated Search Time**: <100ms for 300 vectors

### Neon PostgreSQL Query Optimization
- **Connection Pooling**: Not required (serverless Neon)
- **Query Timeout**: 5 seconds max
- **Prepared Statements**: Use for repeated queries

### localStorage Size Limits
- **Browser Limit**: Typically 5-10MB per origin
- **Estimated Usage**:
  - Contact submissions: ~500 bytes/submission × 100 = 50KB
  - User preferences: ~2KB
  - **Total**: <100KB (well under limit)

---

## Security & Privacy

### Personal Data Handling
1. **Contact Form**: Name, email stored client-side only (no server transmission)
2. **RAG Queries**: User IP hashed (SHA-256) before database storage
3. **No Cookies**: No third-party cookies, no tracking
4. **GDPR Compliance**: Right to erasure via localStorage.clear()

### Data Retention
- **localStorage**: User-controlled (manual clear)
- **RAG Queries (Neon)**: 90-day auto-deletion
- **Git History**: Permanent (chapter content)

### Access Control
- **Chapter Content**: Public (GitHub Pages)
- **RAG Backend**: Public API, rate-limited (no auth required)
- **Contact Submissions**: Client-side only (no backend access)
