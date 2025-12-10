import cohere
from qdrant_client import QdrantClient

cohere_client = cohere.Client("nxXj9Nat4kh5hmsrWmLv0igdyWa8g1mD5LgiCnT5")

qdrant = QdrantClient(
    url="https://1136ec4a-56aa-4c6e-aa74-8c47b4fb146c.europe-west3-0.gcp.cloud.qdrant.io:6333",
    api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.-RH52ZBpCXWrQiXkG3R79Rue5T_PFVcJFIJPDKx-WQs"
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



print(retrieve("What data do you have"))