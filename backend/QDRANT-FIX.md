# Qdrant Connection Error - Complete Fix Guide

## Problem
```
httpx.ConnectError: [WinError 10061] No connection could be made because the target machine actively refused it
```

**Cause**: Your `ingest.py` tried to connect to a Qdrant server that isn't running.

---

## ✅ SOLUTION 1: Qdrant Cloud (Recommended - Easiest)

### Why This Solution?
- ✅ No Docker required
- ✅ Free tier (1GB storage)
- ✅ Works on any Windows version
- ✅ Takes 5 minutes to set up
- ✅ Accessible from anywhere

### Step-by-Step Setup

#### 1. Create Qdrant Cloud Account

Go to: https://cloud.qdrant.io

- Click "Sign Up" (free)
- Use GitHub or email
- Verify your email

#### 2. Create a Cluster

1. Click **"Create Cluster"**
2. Configure:
   - **Name**: `robotics-chatbot`
   - **Region**: AWS us-east-1 (or closest to you)
   - **Tier**: **Free** (1GB storage, 1 cluster)
3. Click **"Create"**
4. Wait 1-2 minutes for deployment

#### 3. Get Your Credentials

After cluster is created:

1. Click on your cluster name: `robotics-chatbot`
2. You'll see:
   - **Cluster URL**: `https://abc123xyz.aws.cloud.qdrant.io:6333`
   - **API Key**: Click "Show API Key" to reveal

**Copy both values!**

#### 4. Update Your .env File

Open `C:\Users\user\Desktop\project-robotics\backend\.env` in Notepad:

```env
# Qdrant Cloud Configuration
QDRANT_URL=https://your-cluster-id.aws.cloud.qdrant.io:6333
QDRANT_API_KEY=your_api_key_here_from_qdrant_dashboard
COLLECTION_NAME=robotics_textbook

# Cohere (you should already have this)
COHERE_API_KEY=your_cohere_key_here
```

**Replace**:
- `https://your-cluster-id.aws.cloud.qdrant.io:6333` with your actual Cluster URL
- `your_api_key_here_from_qdrant_dashboard` with your actual API Key

#### 5. Test Connection

```cmd
cd C:\Users\user\Desktop\project-robotics\backend
venv\Scripts\activate.bat
python -c "from qdrant_client import QdrantClient; import os; from dotenv import load_dotenv; load_dotenv(); client = QdrantClient(url=os.getenv('QDRANT_URL'), api_key=os.getenv('QDRANT_API_KEY')); print('✅ Connected to Qdrant Cloud successfully!')"
```

**Expected Output**: `✅ Connected to Qdrant Cloud successfully!`

#### 6. Run Ingestion

```cmd
python ingest.py
```

**Expected Output**:
```
🚀 Starting book ingestion...
🔗 Connecting to Qdrant Cloud: https://your-cluster.qdrant.io:6333
📖 Read 11264 characters from book.txt
✂️  Created 84 chunks
🔢 Embedding chunks with Cohere embed-english-v3.0...
✅ Generated 84 embeddings (dimension: 1024)
📦 Creating collection 'robotics_textbook'...
⬆️  Uploading to Qdrant...
✅ Successfully ingested 84 chunks to Qdrant collection 'robotics_textbook'
📊 Stats: 8654 total words
```

✅ **Done! Your data is now in Qdrant Cloud.**

---

## SOLUTION 2: Local Qdrant with Docker (Alternative)

### Why This Solution?
- ✅ Full control over data
- ✅ Works offline
- ❌ Requires Docker Desktop (large download ~500MB)
- ❌ More setup required

### Step-by-Step Setup

#### 1. Install Docker Desktop

1. Download: https://www.docker.com/products/docker-desktop/
2. Run installer (requires admin privileges)
3. Restart your computer
4. Open Docker Desktop
5. Wait for Docker Engine to start (shows green icon)

#### 2. Pull Qdrant Image

Open Command Prompt:

```cmd
docker pull qdrant/qdrant
```

This downloads the Qdrant Docker image (~200MB).

#### 3. Run Qdrant Container

```cmd
docker run -d -p 6333:6333 -p 6334:6334 -v %USERPROFILE%\qdrant_storage:/qdrant/storage --name qdrant qdrant/qdrant
```

**Explanation**:
- `-d`: Run in background
- `-p 6333:6333`: Expose API port
- `-v %USERPROFILE%\qdrant_storage:/qdrant/storage`: Store data in your user folder
- `--name qdrant`: Name the container for easy management

**Verify it's running**:
```cmd
docker ps
```

You should see a container named `qdrant` with status `Up`.

#### 4. Update Your .env File

```env
# Local Qdrant Configuration
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
COLLECTION_NAME=robotics_textbook

# Cohere (you should already have this)
COHERE_API_KEY=your_cohere_key_here
```

**Note**: Leave `QDRANT_API_KEY` empty for local Docker.

#### 5. Test Connection

```cmd
cd C:\Users\user\Desktop\project-robotics\backend
venv\Scripts\activate.bat
python -c "from qdrant_client import QdrantClient; client = QdrantClient(url='http://localhost:6333'); print('✅ Connected to local Qdrant successfully!')"
```

**Expected Output**: `✅ Connected to local Qdrant successfully!`

#### 6. Run Ingestion

```cmd
python ingest.py
```

**Expected Output**:
```
🚀 Starting book ingestion...
🔗 Connecting to local Qdrant: http://localhost:6333
📖 Read 11264 characters from book.txt
✂️  Created 84 chunks
🔢 Embedding chunks with Cohere embed-english-v3.0...
✅ Generated 84 embeddings (dimension: 1024)
📦 Creating collection 'robotics_textbook'...
⬆️  Uploading to Qdrant...
✅ Successfully ingested 84 chunks to Qdrant collection 'robotics_textbook'
📊 Stats: 8654 total words
```

#### 7. Managing Docker Container

**Stop Qdrant**:
```cmd
docker stop qdrant
```

**Start Qdrant** (after stopping):
```cmd
docker start qdrant
```

**Remove Qdrant** (to start fresh):
```cmd
docker stop qdrant
docker rm qdrant
```

---

## What Changed in ingest.py?

The updated `ingest.py` now:

1. ✅ Checks if `QDRANT_URL` is set
2. ✅ Handles both cloud (with API key) and local (no API key) connections
3. ✅ Shows which Qdrant it's connecting to
4. ✅ Provides clear error messages if connection fails
5. ✅ Better error handling for collection creation

**Key Changes**:

```python
# Before (always required API key):
qdrant = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")  # Failed if empty
)

# After (works with or without API key):
qdrant_url = os.getenv("QDRANT_URL")
qdrant_api_key = os.getenv("QDRANT_API_KEY")

if qdrant_api_key:
    # Qdrant Cloud with API key
    qdrant = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
else:
    # Local Qdrant without API key
    qdrant = QdrantClient(url=qdrant_url)
```

---

## Troubleshooting

### Error: "QDRANT_URL not set in .env file"

**Fix**: Make sure your `.env` file exists in `backend/` folder and contains:
```env
QDRANT_URL=https://your-cluster.qdrant.io:6333
```

### Error: "Cannot connect to Qdrant server"

**For Cloud**:
- Verify Cluster URL is correct (copy from dashboard)
- Verify API Key is correct (click "Show API Key")
- Check your internet connection

**For Local Docker**:
- Verify Docker Desktop is running
- Check container status: `docker ps`
- If container stopped, start it: `docker start qdrant`
- Try accessing http://localhost:6333 in browser (should see Qdrant UI)

### Error: "Authentication failed"

**Fix**: Your API key is incorrect. In Qdrant Cloud dashboard:
1. Go to your cluster
2. Click "Show API Key"
3. Copy the ENTIRE key (it's long!)
4. Paste into `.env` file

### Docker: "Cannot connect to Docker daemon"

**Fix**:
1. Open Docker Desktop application
2. Wait for green "Engine running" status
3. Try command again

---

## Recommendation: Which Solution to Choose?

### Choose **Qdrant Cloud** if:
- ✅ You want quick setup (5 minutes)
- ✅ You don't want to install Docker
- ✅ You want to access from multiple devices
- ✅ You're deploying to production (Render/Railway)

### Choose **Local Docker** if:
- ✅ You want full control over data
- ✅ You're comfortable with Docker
- ✅ You need offline access
- ✅ You're developing/testing extensively

**For this project, I recommend Qdrant Cloud** because:
1. No Docker installation needed
2. Works perfectly with Render.com deployment
3. Free tier is sufficient for your use case
4. Easier to share with team members

---

## Next Steps After Ingestion

Once ingestion succeeds:

1. ✅ **Verify collection in Qdrant**:
   - For Cloud: Go to dashboard → Your cluster → Collections
   - For Local: Open http://localhost:6333/dashboard

2. ✅ **Test retrieval** (optional):
   ```python
   from qdrant_client import QdrantClient
   import os
   from dotenv import load_dotenv

   load_dotenv()
   client = QdrantClient(url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY"))

   results = client.search(
       collection_name="robotics_textbook",
       query_vector=[0.1] * 1024,  # dummy vector
       limit=3
   )
   print(f"Found {len(results)} chunks")
   ```

3. ✅ **Start FastAPI server**:
   ```cmd
   uvicorn main:app --reload
   ```

4. ✅ **Test chat at**: http://localhost:8000/chat-ui

---

## Summary

**Problem**: Qdrant server not running
**Solution**: Use Qdrant Cloud (easiest) or local Docker
**Result**: Ingestion script now works with both options
**Status**: ✅ Fixed!
