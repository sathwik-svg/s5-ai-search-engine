import json
from app.ingestion.indexer import DocumentIndexer

with open("backend/data/sample.json") as f:
    documents = json.load(f)

count = DocumentIndexer().index(documents)
print(f"Indexed {count} documents")
