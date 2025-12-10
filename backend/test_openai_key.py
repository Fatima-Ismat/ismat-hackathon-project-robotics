# backend/test_openai_key.py
"""
Test script to validate all API keys are working correctly.
Run this before starting the server to ensure configuration is valid.
"""
from pathlib import Path
from dotenv import load_dotenv
import os

# Load .env
ENV_PATH = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

print("=" * 60)
print("API KEY VALIDATION TEST")
print("=" * 60)

# Test 1: Groq API
print("\n[1/3] Testing Groq API...")
try:
    from litellm import completion

    model = os.getenv("LITELLM_MODEL", "groq/llama-3.3-70b-versatile")
    response = completion(
        model=model,
        messages=[{"role": "user", "content": "Say 'API key works!'"}],
        max_tokens=10
    )

    # Extract content from response
    if hasattr(response, 'choices') and len(response.choices) > 0:
        content = response.choices[0].message.content
        print(f"✅ Groq API: WORKING - Response: {content}")
    else:
        print("✅ Groq API: WORKING (response format different)")
except Exception as e:
    print(f"❌ Groq API: FAILED - {type(e).__name__}: {str(e)[:100]}")

# Test 2: Qdrant Vector Database
print("\n[2/3] Testing Qdrant Vector Database...")
try:
    from qdrant_client import QdrantClient

    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")
    COLLECTION_NAME = os.getenv("COLLECTION_NAME", "robotics_textbook")

    qdrant_client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
    count = qdrant_client.count(collection_name=COLLECTION_NAME)
    print(f"✅ Qdrant: WORKING - {count.count} chunks in '{COLLECTION_NAME}' collection")
except Exception as e:
    print(f"❌ Qdrant: FAILED - {type(e).__name__}: {str(e)[:100]}")

# Test 3: Cohere Embeddings
print("\n[3/3] Testing Cohere Embeddings...")
try:
    import cohere

    cohere_api_key = os.getenv("COHERE_API_KEY")
    cohere_client = cohere.ClientV2(api_key=cohere_api_key)

    embed_response = cohere_client.embed(
        texts=["test"],
        model="embed-english-v3.0",
        input_type="search_query",
        embedding_types=["float"]
    )

    vector_dim = len(embed_response.embeddings.float_[0])
    print(f"✅ Cohere: WORKING - Generated {vector_dim}-dimensional embedding")
except Exception as e:
    print(f"❌ Cohere: FAILED - {type(e).__name__}: {str(e)[:100]}")

print("\n" + "=" * 60)
print("VALIDATION COMPLETE")
print("=" * 60)
