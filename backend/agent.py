# backend/agent.py
"""
RAG Agent functions for retrieving and processing book content.
Follows OpenAI Constitution: provides grounded, factual responses.
"""
import os
import logging
import time
from typing import Optional, Dict
from pathlib import Path

from dotenv import load_dotenv
import cohere
from qdrant_client import QdrantClient

# Load .env
ENV_PATH = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

logger = logging.getLogger(__name__)

# Initialize clients
cohere_client = cohere.ClientV2(api_key=os.getenv("COHERE_API_KEY"))

qdrant_url = os.getenv("QDRANT_URL")
qdrant_api_key = os.getenv("QDRANT_API_KEY")
if qdrant_api_key:
    qdrant_client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
else:
    qdrant_client = QdrantClient(url=qdrant_url)

COLLECTION_NAME = os.getenv("COLLECTION_NAME", "robotics_textbook")


def retrieve_chunks(
    query: str,
    selected_text: Optional[str] = None,
    limit: int = 5
) -> Dict[str, any]:
    """
    Retrieve relevant chunks from Qdrant using semantic search.

    Args:
        query: User's question or query
        selected_text: Optional text selected by user from the book
        limit: Maximum number of chunks to retrieve (default: 5)

    Returns:
        Dict containing:
            - context: Concatenated string of relevant chunks
            - chunks_count: Number of chunks retrieved
            - embedding_time: Time taken for embedding (ms)
            - search_time: Time taken for search (ms)

    Example:
        result = retrieve_chunks("What are humanoid robots?", limit=5)
        # Returns: {"context": "...", "chunks_count": 5, "embedding_time": 120, "search_time": 80}
    """
    try:
        logger.info(f"Retrieving chunks for query: {query[:100]}")

        # Step 1: Generate embedding with performance timing
        embedding_start = time.time()
        embed_response = cohere_client.embed(
            texts=[query],
            model="embed-english-v3.0",
            input_type="search_query",
            embedding_types=["float"]
        )
        query_vector = embed_response.embeddings.float_[0]
        embedding_time = int((time.time() - embedding_start) * 1000)  # Convert to ms
        logger.info(f"Embedding generated in {embedding_time}ms")

        # Step 2: Search Qdrant with performance timing
        search_start = time.time()
        search_results = qdrant_client.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_vector,
            limit=limit,
            score_threshold=0.5,
        )
        search_time = int((time.time() - search_start) * 1000)  # Convert to ms
        logger.info(f"Search completed in {search_time}ms, found {len(search_results)} chunks")

        # Step 3: Handle empty results
        if not search_results:
            logger.warning("No relevant chunks found for query")
            return {
                "context": "I cannot find information about this in the book.",
                "chunks_count": 0,
                "embedding_time": embedding_time,
                "search_time": search_time
            }

        # Step 4: Format chunks
        chunks = []
        for idx, result in enumerate(search_results, 1):
            chunk_id = result.id
            score = result.score
            content = result.payload.get("text", "")
            chunks.append(f"[Chunk {chunk_id} | Score: {score:.2f}]\n{content}")

        retrieved_context = "\n\n".join(chunks)

        # Step 5: Prepend selected text if provided
        if selected_text and selected_text.strip():
            retrieved_context = (
                f"USER SELECTED TEXT (prioritize this in your answer):\n{selected_text}\n\n"
                f"ADDITIONAL CONTEXT FROM BOOK:\n{retrieved_context}"
            )
            logger.info("Selected text prepended to context")

        logger.info(f"Retrieved {len(search_results)} chunks successfully")
        return {
            "context": retrieved_context,
            "chunks_count": len(search_results),
            "embedding_time": embedding_time,
            "search_time": search_time
        }

    except Exception as e:
        logger.error(f"Error retrieving chunks: {e}", exc_info=True)
        return {
            "context": f"Error retrieving book content: {str(e)}",
            "chunks_count": 0,
            "embedding_time": 0,
            "search_time": 0
        }
