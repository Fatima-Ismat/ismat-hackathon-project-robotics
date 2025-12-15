# SSE Testing Checklist

## Prerequisites
- Backend running on `http://localhost:8000`
- `.env` configured with all required API keys

## Test 1: Basic SSE Stream (curl)
```bash
curl -N -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is a humanoid robot?",
    "selected_text": "",
    "session_id": "test_session_123",
    "language": "en"
  }'
```

**Expected Output:**
```
data: {"reply":"Based"}
data: {"reply":" on"}
data: {"reply":" the"}
data: {"reply":" book"}
...
```

## Test 2: Verify Headers
```bash
curl -I -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "test",
    "selected_text": "",
    "session_id": "test_456",
    "language": "en"
  }'
```

**Expected Headers:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Embedding-Time: <number>
X-Search-Time: <number>
X-Chunks-Retrieved: <number>
```

## Test 3: Web UI
1. Start backend: `cd backend && python main.py`
2. Open browser: `http://localhost:8000/chat-ui`
3. Send message: "What are humanoid robots?"
4. Verify streaming appears word-by-word

## Test 4: Frontend Integration
1. Update `BACKEND_URL` in `src/components/ChatWidget/index.tsx` to `http://localhost:8000`
2. Start frontend: `npm run start`
3. Open page with ChatWidget
4. Select text on page
5. Click AI button
6. Verify streaming response appears

## Troubleshooting

### No streaming (full response at once)
- Check nginx/proxy buffering disabled
- Verify `X-Accel-Buffering: no` header present

### JSON parse errors in console
- Verify backend sends: `data: {"reply":"text"}\n\n`
- NOT: `data: text\n\n`

### Empty responses
- Check backend logs for errors
- Verify API keys in `.env`
- Test Qdrant connection
- Test LiteLLM model availability
