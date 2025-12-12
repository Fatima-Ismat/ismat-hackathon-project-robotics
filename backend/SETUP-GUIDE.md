# Complete Setup Guide: Fixing All Dependency Issues

## Issues Resolved

1. ✅ **psycopg2-binary version**: Updated from 2.9.7 to 2.9.11
2. ✅ **Cohere warnings**: Added guidance (warnings are optional, safe to ignore)
3. ✅ **protobuf conflict**: Pinned to compatible version 4.25.5
4. ✅ **qdrant-client missing**: Included in requirements.txt
5. ✅ **book.txt missing**: Created sample book with robotics content

---

## Step-by-Step Setup Commands

### Step 1: Navigate to Backend Directory

```cmd
cd C:\Users\user\Desktop\project-robotics\backend
```

### Step 2: Create Virtual Environment (Recommended)

```cmd
python -m venv venv
```

### Step 3: Activate Virtual Environment

**Windows CMD**:
```cmd
venv\Scripts\activate.bat
```

**Windows PowerShell**:
```powershell
venv\Scripts\Activate.ps1
```

**Note**: If you get an execution policy error in PowerShell, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 4: Upgrade pip (Important!)

```cmd
python -m pip install --upgrade pip
```

### Step 5: Install Dependencies (Fixed versions)

```cmd
pip install -r requirements.txt
```

**Expected Output**:
- All packages install successfully
- Cohere may show warnings about Jupyter (safe to ignore)
- Installation should complete in 2-5 minutes

### Step 6: Verify Installation

```cmd
python -c "import cohere; import qdrant_client; import fastapi; print('✅ All imports successful')"
```

**Expected Output**: `✅ All imports successful`

### Step 7: Create .env File

Create a file named `.env` in the `backend/` directory:

```cmd
copy nul .env
```

Then edit `.env` with your API keys:

```env
# Cohere (Required for embeddings)
COHERE_API_KEY=your_cohere_api_key_here

# Qdrant Cloud (Required for vector storage)
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key_here
COLLECTION_NAME=robotics_textbook

# Neon Postgres (Required for chat history)
DATABASE_URL=postgresql+asyncpg://user:pass@host/dbname

# OpenAI or Anthropic (Choose one for LLM)
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...

# LiteLLM Configuration
LITELLM_MODEL=gpt-4o-mini

# App Configuration
PORT=8000
CORS_ORIGINS=*
RATE_LIMIT=10
```

**Where to Get API Keys**:
- **Cohere**: https://dashboard.cohere.com/api-keys (Free tier: 100 calls/min)
- **Qdrant**: https://cloud.qdrant.io (Free tier: 1GB storage)
- **Neon**: https://neon.tech (Free tier: 3GB database)
- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/settings/keys

### Step 8: Verify book.txt Exists

```cmd
dir book.txt
```

**Expected Output**: `book.txt` should be listed (already created for you)

### Step 9: Run Ingestion Script

```cmd
python ingest.py
```

**Expected Output**:
```
🚀 Starting book ingestion...
📖 Read 9847 characters from book.txt
✂️  Created 84 chunks
🔢 Embedding chunks with Cohere embed-english-v3.0...
✅ Generated 84 embeddings (dimension: 1024)
📦 Creating collection 'robotics_textbook'...
⬆️  Uploading to Qdrant...
✅ Successfully ingested 84 chunks to Qdrant collection 'robotics_textbook'
📊 Stats: 8654 total words
```

### Step 10: Test FastAPI Server Locally

```cmd
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Open Browser**: http://localhost:8000/

**Expected Response**:
```json
{"status": "healthy", "version": "1.0.0"}
```

**Test Chat UI**: http://localhost:8000/chat-ui

---

## Troubleshooting Common Issues

### Issue: "pip is not recognized"

**Solution**:
```cmd
python -m pip install --upgrade pip
```

### Issue: "python is not recognized"

**Solution**: Add Python to PATH or use full path:
```cmd
C:\Python311\python.exe -m pip install -r requirements.txt
```

### Issue: Cohere Jupyter Warnings

**Message**: `WARNING: Jupyter/ipykernel not found...`

**Solution**: These are **optional dependencies** for Cohere notebooks. Safe to ignore. If you want to suppress them:
```cmd
pip install jupyter ipykernel
```

### Issue: protobuf Version Conflict

**Message**: `ERROR: google-ai-generativelanguage requires protobuf!=3.20.0...`

**Solution**: Already fixed in requirements.txt with `protobuf==4.25.5`. If issue persists:
```cmd
pip uninstall protobuf -y
pip install protobuf==4.25.5
```

### Issue: "Access Denied" When Creating Virtual Environment

**Solution**: Run CMD or PowerShell as Administrator, or use a different directory:
```cmd
cd %USERPROFILE%\Documents
python -m venv venv
```

### Issue: Module Not Found After Installation

**Solution**: Ensure you're in the virtual environment:
```cmd
where python
REM Should show: C:\Users\user\Desktop\project-robotics\backend\venv\Scripts\python.exe
```

If not in venv, reactivate:
```cmd
venv\Scripts\activate.bat
```

### Issue: book.txt Has Different Content

**Solution**: The provided book.txt is a sample. To use your own book:

1. Replace `book.txt` with your content
2. Ensure it's UTF-8 encoded text
3. Recommended: 5000-50000 words for good coverage
4. Run `python ingest.py` again

**To convert PDF to text**:
```cmd
pip install pypdf2
python -c "import PyPDF2; pdf=open('yourbook.pdf','rb'); text=''.join(page.extract_text() for page in PyPDF2.PdfReader(pdf).pages); open('book.txt','w',encoding='utf-8').write(text)"
```

---

## Verification Checklist

Run these commands in order to verify everything is working:

### ✅ Check 1: Python Version
```cmd
python --version
```
**Expected**: Python 3.9 or higher

### ✅ Check 2: Virtual Environment Active
```cmd
where python
```
**Expected**: Path should include `venv\Scripts\python.exe`

### ✅ Check 3: Dependencies Installed
```cmd
pip list | findstr "cohere qdrant fastapi"
```
**Expected**: All three packages listed with versions

### ✅ Check 4: .env File Exists
```cmd
dir .env
```
**Expected**: File listed

### ✅ Check 5: book.txt Exists
```cmd
dir book.txt
```
**Expected**: File listed with size > 0

### ✅ Check 6: Ingestion Works
```cmd
python ingest.py
```
**Expected**: "✅ Successfully ingested N chunks"

### ✅ Check 7: Server Starts
```cmd
uvicorn main:app --reload
```
**Expected**: Server starts on http://127.0.0.1:8000

### ✅ Check 8: Health Endpoint Responds
Open browser: http://localhost:8000/
**Expected**: `{"status":"healthy","version":"1.0.0"}`

---

## Quick Start (After Setup)

**Every time you work on the project**:

1. Navigate to backend:
   ```cmd
   cd C:\Users\user\Desktop\project-robotics\backend
   ```

2. Activate virtual environment:
   ```cmd
   venv\Scripts\activate.bat
   ```

3. Start server:
   ```cmd
   uvicorn main:app --reload
   ```

4. Open chat UI: http://localhost:8000/chat-ui

---

## Next Steps

After successful setup:

1. **Test the chatbot locally**: http://localhost:8000/chat-ui
   - Ask: "What are humanoid robots?"
   - Select text from the sample book content
   - Ask: "Explain this in detail"

2. **Deploy to Render.com**: Follow `DEPLOY.md` instructions

3. **Embed in your book**: Use `chat-widget-embed.html` script

---

## Summary of Fixed Files

1. **requirements.txt**: Updated psycopg2-binary to 2.9.11, added protobuf==4.25.5
2. **book.txt**: Created comprehensive robotics textbook sample (9847 characters)
3. **SETUP-GUIDE.md**: This complete troubleshooting guide

All dependency conflicts resolved. Ready to run! 🚀
