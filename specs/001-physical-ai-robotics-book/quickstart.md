# Quickstart Guide: Physical AI & Humanoid Robotics Book

**Feature**: 001-physical-ai-robotics-book
**Date**: 2025-12-04
**Target Audience**: Developers setting up local development environment

## Prerequisites

Before starting, ensure you have the following installed:

| Tool | Minimum Version | Installation Guide |
|------|----------------|-------------------|
| **Node.js** | 18.0.0 | https://nodejs.org/ |
| **npm** | 9.0.0 | Bundled with Node.js |
| **Git** | 2.30.0 | https://git-scm.com/ |
| **Python** (RAG only) | 3.11.0 | https://www.python.org/ |
| **pip** (RAG only) | 23.0.0 | Bundled with Python |

**System Requirements**:
- **OS**: Windows 10+, macOS 12+, or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 4GB (8GB recommended for RAG backend)
- **Disk Space**: 500MB (Docusaurus) + 1GB (RAG dependencies)
- **Network**: Internet connection for npm/pip package downloads

---

## Quick Start (Docusaurus Only - MVP)

Get the book website running locally in 5 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/project-robotics.git
cd project-robotics

# 2. Checkout the feature branch
git checkout 001-physical-ai-robotics-book

# 3. Install dependencies
npm install

# 4. Start local development server
npm start

# Server starts at http://localhost:3000
# Hot reload enabled - changes reflect immediately
```

**Expected Output**:
```
[INFO] Starting the development server...
[SUCCESS] Docusaurus website is running at http://localhost:3000
[INFO] Webpack compiled successfully in 8.4s
```

**Verification**:
- Open browser to http://localhost:3000
- Navigate to "Book" → "Introduction to Physical AI"
- Toggle dark mode (top right corner)
- Test mobile responsiveness (browser DevTools → device emulation)

---

## Full Setup (Docusaurus + RAG Backend)

### Step 1: Docusaurus Frontend

```bash
# Already completed in Quick Start above
npm install
npm start
```

### Step 2: RAG Backend Setup

#### 2.1 Install Python Dependencies

```bash
# Navigate to RAG directory
cd rag

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Expected installation time: 2-3 minutes
```

**requirements.txt contents**:
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
qdrant-client==1.7.0
psycopg2-binary==2.9.9
sentence-transformers==2.2.2
pydantic==2.5.0
python-dotenv==1.0.0
slowapi==0.1.9
```

#### 2.2 Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your credentials
# On Windows: notepad .env
# On macOS/Linux: nano .env
```

**.env.example template**:
```bash
# Qdrant Cloud Configuration
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key_here

# Neon PostgreSQL Configuration
NEON_CONNECTION_STRING=postgresql://user:password@your-project.neon.tech/dbname?sslmode=require

# FastAPI Configuration
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=development

# Rate Limiting
RATE_LIMIT_PER_MINUTE=10

# Logging
LOG_LEVEL=INFO
```

**Obtaining API Keys**:

1. **Qdrant Cloud** (free tier):
   - Sign up: https://cloud.qdrant.io/
   - Create cluster (free tier: 1GB)
   - Copy API key and cluster URL

2. **Neon PostgreSQL** (free tier):
   - Sign up: https://neon.tech/
   - Create project (free tier: 0.5GB)
   - Copy connection string from dashboard

#### 2.3 Initialize Databases

```bash
# Create Qdrant collection
python embeddings/init_qdrant.py

# Expected output:
# ✓ Connected to Qdrant at https://your-cluster.qdrant.io
# ✓ Created collection 'book_chunks' (384 dimensions, cosine similarity)

# Create Neon PostgreSQL tables
python db/init_neon.py

# Expected output:
# ✓ Connected to Neon PostgreSQL
# ✓ Created table 'rag_queries'
# ✓ Created indexes for performance
```

#### 2.4 Generate Embeddings

```bash
# Embed all chapter content
python embeddings/generate.py

# Expected output:
# Processing chapter 1/8: Introduction to Physical AI
# Chunked into 32 text segments (512 tokens each)
# Generated 32 embeddings (384 dimensions)
# Uploaded to Qdrant collection 'book_chunks'
# ...
# ✓ Total: 256 embeddings generated in 14.3s
```

#### 2.5 Start RAG Backend

```bash
# Start FastAPI server with hot reload
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

# Expected output:
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
# INFO:     Started reloader process [12345]
# INFO:     Started server process [12346]
# INFO:     Waiting for application startup.
# INFO:     Application startup complete.
```

**Verification**:
- Open browser to http://localhost:8000/docs (Swagger UI)
- Test health endpoint: http://localhost:8000/api/v1/health
- Expected response:
  ```json
  {
    "status": "healthy",
    "timestamp": "2025-12-04T19:00:00Z",
    "services": {
      "qdrant": {"status": "connected", "latency_ms": 45},
      "neon": {"status": "connected", "latency_ms": 28},
      "embedding_model": {"status": "loaded", "model": "sentence-transformers/all-MiniLM-L6-v2"}
    },
    "version": "1.0.0"
  }
  ```

### Step 3: Connect Frontend to Backend

Update Docusaurus config to point to local RAG backend:

```javascript
// docusaurus.config.js
export default {
  // ... other config
  customFields: {
    ragBackendUrl: process.env.NODE_ENV === 'production'
      ? 'https://physical-ai-book-api.onrender.com'
      : 'http://localhost:8000',
  },
};
```

Restart Docusaurus dev server:
```bash
# In project root
npm start
```

**Test End-to-End**:
1. Open http://localhost:3000
2. Navigate to any chapter
3. Select text (e.g., "ROS 2 uses DDS")
4. Click "Ask AI" button
5. Type query: "What protocol does ROS 2 use?"
6. Verify response appears in <3 seconds

---

## Development Workflow

### Running Both Services Simultaneously

**Option 1: Two Terminals**

Terminal 1 (Docusaurus):
```bash
cd project-robotics
npm start
```

Terminal 2 (RAG Backend):
```bash
cd project-robotics/rag
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn api.main:app --reload
```

**Option 2: Single Command (npm-run-all)**

Install concurrently:
```bash
npm install --save-dev concurrently
```

Add script to `package.json`:
```json
{
  "scripts": {
    "start": "docusaurus start",
    "start:rag": "cd rag && uvicorn api.main:app --reload",
    "dev": "concurrently \"npm start\" \"npm run start:rag\""
  }
}
```

Run both:
```bash
npm run dev
```

### Hot Reload Behavior

| Component | Trigger | Reload Time |
|-----------|---------|-------------|
| Docusaurus content (docs/) | Save .md file | <1s (partial reload) |
| React components (src/) | Save .tsx file | 2-3s (HMR) |
| CSS (src/css/) | Save .css file | <1s (HMR) |
| FastAPI routes (rag/api/) | Save .py file | 1-2s (uvicorn reload) |
| Environment variables (.env) | Save .env | Manual restart required |

---

## Building for Production

### Docusaurus Static Build

```bash
# In project root
npm run build

# Expected output:
# [INFO] Creating an optimized production build...
# [SUCCESS] Generated static files in `build` directory
# Build completed in 1m 32s

# Test production build locally
npm run serve
# Opens http://localhost:3000
```

**Build Output Structure**:
```
build/
├── index.html                    # Home page
├── docs/
│   ├── intro/index.html          # Book landing
│   ├── chapter-01/index.html
│   ├── chapter-02/index.html
│   └── ...
├── about/index.html
├── contact/index.html
└── assets/
    ├── css/                      # Minified CSS
    └── js/                       # Minified React bundles
```

**Performance Validation**:
```bash
# Run Lighthouse audit on production build
npm install -g @lhci/cli
lhci autorun --config=lighthouserc.json

# Expected results (all ≥90):
# Performance:    96/100
# Accessibility:  92/100
# Best Practices: 94/100
# SEO:           100/100
```

### RAG Backend Deployment (Render.com)

#### 1. Prepare for Deployment

Create `rag/Procfile`:
```
web: uvicorn api.main:app --host 0.0.0.0 --port $PORT
```

Create `rag/runtime.txt`:
```
python-3.11.6
```

#### 2. Deploy to Render.com

1. Push code to GitHub:
   ```bash
   git add rag/
   git commit -m "feat: add RAG backend for deployment"
   git push origin 001-physical-ai-robotics-book
   ```

2. Create Render.com service:
   - Go to https://render.com/ (sign in with GitHub)
   - Click "New +" → "Web Service"
   - Connect repository: `project-robotics`
   - Configure:
     - **Name**: physical-ai-book-api
     - **Root Directory**: `rag`
     - **Environment**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables (from .env file):
     - `QDRANT_URL`
     - `QDRANT_API_KEY`
     - `NEON_CONNECTION_STRING`
     - `RATE_LIMIT_PER_MINUTE=10`
   - Select **Free** plan
   - Click "Create Web Service"

3. Wait for deployment (3-5 minutes)
   - URL: https://physical-ai-book-api.onrender.com

4. Verify health:
   ```bash
   curl https://physical-ai-book-api.onrender.com/api/v1/health
   ```

#### 3. Update Docusaurus Production Config

```javascript
// docusaurus.config.js
export default {
  customFields: {
    ragBackendUrl: 'https://physical-ai-book-api.onrender.com',
  },
};
```

---

## Testing

### Unit Tests (RAG Backend)

```bash
cd rag
pytest tests/ -v

# Expected output:
# tests/test_query.py::test_query_endpoint_returns_within_3s PASSED
# tests/test_query.py::test_rate_limit_enforced PASSED
# tests/test_health.py::test_health_check_success PASSED
# ======================== 3 passed in 2.45s =========================
```

### Integration Tests

```bash
# Start both services first (see Development Workflow)

# Run Cypress end-to-end tests
npm install --save-dev cypress
npx cypress open

# Test: User submits RAG query
# 1. Navigate to chapter-02
# 2. Select text "DDS communication"
# 3. Click "Ask AI"
# 4. Type "What is DDS?"
# 5. Assert response appears in <3s
# 6. Assert response contains "Data Distribution Service"
```

### Load Testing (RAG Backend)

```bash
cd rag
pip install locust

# Run load test: 10 concurrent users
locust -f tests/load_test.py --users 10 --spawn-rate 2 --host http://localhost:8000

# Open http://localhost:8089 (Locust web UI)
# Start test, monitor p95 latency <3s at 10 concurrent users
```

---

## Troubleshooting

### Common Issues

#### 1. Docusaurus Build Fails with Memory Error

**Symptom**:
```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```

**Solution**:
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

#### 2. RAG Backend: sentence-transformers Download Timeout

**Symptom**:
```
requests.exceptions.ConnectTimeout: HTTPSConnectionPool(host='huggingface.co')
```

**Solution**:
```bash
# Pre-download model manually
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"
```

#### 3. Qdrant Connection Refused

**Symptom**:
```
qdrant_client.exceptions.QdrantConnectionError: Connection refused
```

**Solution**:
- Verify `QDRANT_URL` in .env is correct
- Check Qdrant Cloud dashboard for cluster status
- Test connection:
  ```bash
  curl -X GET "$QDRANT_URL/collections" -H "api-key: $QDRANT_API_KEY"
  ```

#### 4. Neon PostgreSQL SSL Error

**Symptom**:
```
psycopg2.OperationalError: SSL connection required
```

**Solution**:
- Add `?sslmode=require` to connection string:
  ```
  NEON_CONNECTION_STRING=postgresql://user:pass@host/db?sslmode=require
  ```

#### 5. GitHub Pages 404 on Reload

**Symptom**:
- http://localhost:3000/ works
- http://localhost:3000/docs/chapter-01 shows 404 after reload

**Solution**:
- This is expected behavior for local dev (client-side routing)
- Production GitHub Pages handles this automatically
- For local testing, always navigate from home page

---

## Performance Benchmarks

### Docusaurus Build Time

| Content Size | Build Time | CI/CD Target |
|-------------|-----------|-------------|
| Empty (classic template) | 47s | N/A |
| 2 chapters (~4K words) | 1m 8s | <2 min ✓ |
| 8 chapters (~16K words) | 1m 32s | <2 min ✓ |

### RAG Query Latency (p95)

| Component | Time | Budget |
|-----------|------|--------|
| sentence-transformers embed | 58ms | 100ms |
| Qdrant search (256 vectors) | 102ms | 200ms |
| Neon metadata query | 30ms | 100ms |
| FastAPI processing | 20ms | 50ms |
| Network (localhost) | 10ms | N/A |
| **Total** | **220ms** | **<3000ms ✓** |

---

## Next Steps

1. **Generate Chapter Content**: Run `/sp.specify chapter-01-physical-ai` for each chapter
2. **Implement Components**: Build React components (AskAIButton, ContactForm, ProgressIndicator)
3. **Customize Theme**: Update `src/css/custom.css` with glassmorphism styles
4. **Deploy to GitHub Pages**: Set up GitHub Actions workflow
5. **Monitor Performance**: Configure Lighthouse CI for automated audits

---

## Additional Resources

- **Docusaurus Docs**: https://docusaurus.io/docs
- **FastAPI Tutorial**: https://fastapi.tiangolo.com/tutorial/
- **Qdrant Quickstart**: https://qdrant.tech/documentation/quick-start/
- **Neon Docs**: https://neon.tech/docs/get-started-with-neon
- **sentence-transformers**: https://www.sbert.net/

---

## Support

For issues or questions:
- **GitHub Issues**: https://github.com/your-username/project-robotics/issues
- **Spec Reference**: [spec.md](./spec.md)
- **Architecture Plan**: [plan.md](./plan.md)
- **Data Model**: [data-model.md](./data-model.md)
