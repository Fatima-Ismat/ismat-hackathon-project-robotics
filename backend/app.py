import os
from dotenv import load_dotenv
import requests
import xml.etree.ElementTree as ET
import trafilatura
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
import cohere
import time
from urllib3.util import Retry
from requests.adapters import HTTPAdapter

# =====================================
# Load environment variables from .env
# =====================================
load_dotenv()

SITEMAP_URL = "https://fatima-ismat.github.io/ismat-hackathon-project-robotics/sitemap.xml"
COLLECTION_NAME = "robotics_textbook"

COHERE_API_KEY = os.getenv("COHERE_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

# =====================================
# Initialize clients
# =====================================
cohere_client = cohere.Client(COHERE_API_KEY)
EMBED_MODEL = "embed-english-v3.0"

qdrant_client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
)

# Safe session for requests
session = requests.Session()
retry = Retry(total=4, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
adapter = HTTPAdapter(max_retries=retry)
session.mount("http://", adapter)
session.mount("https://", adapter)

# =====================================
# Functions
# =====================================
def get_all_urls(sitemap_url):
    xml = session.get(sitemap_url, timeout=20).text
    root = ET.fromstring(xml)
    urls = [child.find("{http://www.sitemaps.org/schemas/sitemap/0.9}loc").text
            for child in root if child.find("{http://www.sitemaps.org/schemas/sitemap/0.9}loc") is not None]
    print(f"\nFound {len(urls)} URLs")
    return urls

def extract_text_from_url(url):
    print(f"   → Fetching: {url}")
    try:
        response = session.get(url, timeout=30, headers={"User-Agent": "Mozilla/5.0"})
        response.raise_for_status()
        text = trafilatura.extract(response.text, include_images=False)
        if not text or len(text.strip()) < 50:
            print("   → Empty or too short, skipping...")
            return None
        print(f"   → Extracted {len(text):,} chars")
        return text.strip()
    except Exception as e:
        print(f"   → Failed: {e}")
        return None

def chunk_text(text, max_chars=1200):
    chunks = []
    start = 0
    while start < len(text):
        end = start + max_chars
        split_pos = text.rfind(". ", start, end)
        if split_pos == -1:
            split_pos = end
        else:
            split_pos += 1
        chunks.append(text[start:split_pos])
        start = split_pos
    return [c.strip() for c in chunks if len(c.strip()) > 50]

def embed(text):
    resp = cohere_client.embed(model=EMBED_MODEL, input_type="search_document", texts=[text])
    return resp.embeddings[0]

def create_collection():
    print("\nCreating collection...")
    if qdrant_client.collection_exists(COLLECTION_NAME):
        qdrant_client.delete_collection(COLLECTION_NAME)
    qdrant_client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=1024, distance=Distance.COSINE)
    )

def save_chunk_to_qdrant(chunk, chunk_id, url):
    vector = embed(chunk)
    time.sleep(1.2)  # Rate limit safe
    qdrant_client.upsert(
        collection_name=COLLECTION_NAME,
        points=[PointStruct(id=chunk_id, vector=vector, payload={"url": url, "text": chunk})]
    )

# =====================================
# Main Pipeline
# =====================================
def ingest_book():
    urls = get_all_urls(SITEMAP_URL)
    create_collection()
    global_id = 1
    for url in urls:
        print(f"\nProcessing → {url}")
        text = extract_text_from_url(url)
        if not text:
            continue
        chunks = chunk_text(text)
        for chunk in chunks:
            save_chunk_to_qdrant(chunk, global_id, url)
            print(f"   Saved chunk {global_id}")
            global_id += 1
        time.sleep(1)
    print(f"\nINGESTION COMPLETE! Total chunks stored: {global_id - 1} chunks")

if __name__ == "__main__":
    ingest_book()
