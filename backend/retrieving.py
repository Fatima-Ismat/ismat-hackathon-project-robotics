import os
import cohere
from qdrant_client import QdrantClient
from dotenv import load_dotenv
from pathlib import Path

# Load .env
ENV_PATH = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

# Get keys from environment
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

# Initialize clients
cohere_client = cohere.Client(COHERE_API_KEY)

qdrant = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY
)

def get_embedding(text):
    """Get embedding vector from Cohere Embed v3"""
    response = cohere_client.embed(
        model="embed-english-v3.0",
        input_type="search_query",  # Use search_query for queries
        texts=[text],
    )
    return response.embeddings[0]

def retrieve(query):
    embedding = get_embedding(query)
    result = qdrant.query_points(
        collection_name="robotics_textbook",
        query=embedding,
        limit=5
    )
    return [point.payload["text"] for point in result.points]


# Example usage
if __name__ == "__main__":
    print(retrieve("What data do you have"))
