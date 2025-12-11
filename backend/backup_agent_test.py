# -------------------------
# Fix warnings and environment
# -------------------------
import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"  # TensorFlow oneDNN warning off

import warnings
warnings.filterwarnings("ignore", category=UserWarning, module="gym")  # Gym warning ignore

# -------------------------
# Original imports
# -------------------------
from agents import Agent, Runner, OpenAIChatCompletionsModel, AsyncOpenAI, function_tool, set_tracing_disabled
from dotenv import load_dotenv
import cohere
from qdrant_client import QdrantClient

# -------------------------
# Load environment variables
# -------------------------
load_dotenv()
set_tracing_disabled(True)

# -------------------------
# OpenAI LLM setup (free & working)
# -------------------------
openai_api_key = os.getenv("OPENAI_API_KEY")
provider = AsyncOpenAI(
    api_key=openai_api_key,
    base_url="https://api.openai.com/v1/"
)

model = OpenAIChatCompletionsModel(
    model="gpt-3.5-turbo",
    openai_client=provider
)

# -------------------------
# Cohere embeddings + Qdrant
# -------------------------
cohere_client = cohere.Client(os.getenv("COHERE_API_KEY"))

qdrant = QdrantClient(
    url="https://1136ec4a-56aa-4c6e-aa74-8c47b4fb146c.europe-west3-0.gcp.cloud.qdrant.io:6333",
    api_key=os.getenv("QDRANT_API_KEY")
)

def get_embedding(text):
    response = cohere_client.embed(
        model="embed-english-v3.0",
        input_type="search_query",
        texts=[text]
    )
    return response.embeddings[0]

@function_tool
def retrieve(query):
    embedding = get_embedding(query)
    result = qdrant.query_points(
        collection_name="robotics_textbook",
        query=embedding,
        limit=5
    )
    return [point.payload["text"] for point in result.points]

# -------------------------
# Agent setup
# -------------------------
agent = Agent(
    name="Assistant",
    instructions="""
You are an AI tutor for the Physical AI & Humanoid Robotics textbook.
To answer the user question, first call the tool `retrieve` with the user query.
Use ONLY the returned content from `retrieve` to answer.
If the answer is not in the retrieved content, say "I don't know".
""",
    model=model,
    tools=[retrieve]
)

# -------------------------
# Test run
# -------------------------
result = Runner.run_sync(
    agent,
    input="What is Physical AI?"
)

print(result.final_output)
