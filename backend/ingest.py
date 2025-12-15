# backend/ingest.py
"""
One-time ingestion script: Embed book content and upload to Qdrant.
Reads book.txt, chunks intelligently, embeds with Cohere, stores in Qdrant.
"""
import os
import re
from typing import List, Dict
from pathlib import Path
from dotenv import load_dotenv
import cohere
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, Distance, VectorParams

# Load .env with explicit path
ENV_PATH = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

# Initialize clients
co = cohere.ClientV2(api_key=os.getenv("COHERE_API_KEY"))

# Initialize Qdrant (works with both cloud and local)
qdrant_url = os.getenv("QDRANT_URL")
qdrant_api_key = os.getenv("QDRANT_API_KEY")

if not qdrant_url:
    print("❌ Error: QDRANT_URL not set in .env file")
    print("Please add: QDRANT_URL=https://your-cluster.qdrant.io:6333 (for cloud)")
    print("         OR: QDRANT_URL=http://localhost:6333 (for local Docker)")
    exit(1)

if qdrant_api_key:
    # Qdrant Cloud with API key
    qdrant = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
    print(f"[*] Connecting to Qdrant Cloud: {qdrant_url}")
else:
    # Local Qdrant without API key
    qdrant = QdrantClient(url=qdrant_url)
    print(f"[*] Connecting to local Qdrant: {qdrant_url}")

COLLECTION_NAME = os.getenv("COLLECTION_NAME", "robotics_textbook")


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """Split text into overlapping chunks by sentences."""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current_chunk = []
    current_size = 0

    for sentence in sentences:
        sentence_size = len(sentence.split())
        if current_size + sentence_size > chunk_size and current_chunk:
            chunks.append(' '.join(current_chunk))
            current_chunk = current_chunk[-overlap:] if overlap > 0 else []
            current_size = sum(len(s.split()) for s in current_chunk)

        current_chunk.append(sentence)
        current_size += sentence_size

    if current_chunk:
        chunks.append(' '.join(current_chunk))

    return chunks


def main():
    print("[*] Starting book ingestion...")

    # Read book content
    book_path = "book.txt"
    if not os.path.exists(book_path):
        print(f"[ERROR] {book_path} not found. Please ensure book.txt exists in the current directory.")
        return

    with open(book_path, 'r', encoding='utf-8') as f:
        book_text = f.read()

    print(f"[*] Read {len(book_text)} characters from {book_path}")

    # Chunk the text
    chunks = chunk_text(book_text, chunk_size=500, overlap=50)
    print(f"[*] Created {len(chunks)} chunks")

    # Embed chunks with Cohere (batched to respect API limits)
    print("[*] Embedding chunks with Cohere embed-english-v3.0...")
    BATCH_SIZE = 96  # Cohere free tier limit
    embeddings = []

    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i:i + BATCH_SIZE]
        batch_num = (i // BATCH_SIZE) + 1
        total_batches = (len(chunks) + BATCH_SIZE - 1) // BATCH_SIZE
        print(f"[*] Embedding batch {batch_num}/{total_batches} ({len(batch)} chunks)...")

        response = co.embed(
            texts=batch,
            model="embed-english-v3.0",
            input_type="search_document",
            embedding_types=["float"]
        )
        embeddings.extend(response.embeddings.float_)

    print(f"[OK] Generated {len(embeddings)} embeddings (dimension: {len(embeddings[0])})")

    # Create collection if it doesn't exist
    try:
        qdrant.get_collection(COLLECTION_NAME)
        print(f"[*] Collection '{COLLECTION_NAME}' already exists")
    except Exception as e:
        if "Connection" in str(e) or "refused" in str(e):
            print("\n[ERROR] Cannot connect to Qdrant server!")
            print("\nTroubleshooting:")
            print("1. For Qdrant Cloud: Check QDRANT_URL and QDRANT_API_KEY in .env")
            print("2. For Local Docker: Ensure Docker is running and Qdrant container is started")
            print("   Run: docker run -p 6333:6333 qdrant/qdrant")
            print(f"\nDetailed error: {e}")
            return

        print(f"[*] Creating collection '{COLLECTION_NAME}'...")
        try:
            qdrant.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=len(embeddings[0]),
                    distance=Distance.COSINE
                )
            )
        except Exception as create_error:
            print(f"[ERROR] Failed to create collection: {create_error}")
            return

    # Upsert to Qdrant (batched to avoid timeouts)
    print("[*] Uploading to Qdrant...")
    points = [
        PointStruct(
            id=i + 1,
            vector=embedding,
            payload={
                "text": chunk,
                "chunk_id": i + 1,
                "word_count": len(chunk.split())
            }
        )
        for i, (embedding, chunk) in enumerate(zip(embeddings, chunks))
    ]

    # Batch upload to avoid timeout
    UPLOAD_BATCH_SIZE = 50
    for i in range(0, len(points), UPLOAD_BATCH_SIZE):
        batch_points = points[i:i + UPLOAD_BATCH_SIZE]
        batch_num = (i // UPLOAD_BATCH_SIZE) + 1
        total_batches = (len(points) + UPLOAD_BATCH_SIZE - 1) // UPLOAD_BATCH_SIZE
        print(f"[*] Uploading batch {batch_num}/{total_batches} ({len(batch_points)} points)...")

        qdrant.upsert(
            collection_name=COLLECTION_NAME,
            points=batch_points
        )

    print(f"[OK] Successfully ingested {len(points)} chunks to Qdrant collection '{COLLECTION_NAME}'")
    print(f"[STATS] {sum(p.payload['word_count'] for p in points)} total words")


if __name__ == "__main__":
    main()
