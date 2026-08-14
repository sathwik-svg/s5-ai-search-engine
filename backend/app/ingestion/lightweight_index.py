import json
from pathlib import Path
from app.ingestion.document_loader import load_directory
from app.ingestion.chunker import chunk_text

INDEX = Path("backend/data/index.json")

def build_index(directory="backend/data/uploads"):
    documents = load_directory(directory)
    records = []

    for document in documents:
        chunks = chunk_text(document["text"])

        for i, chunk in enumerate(chunks):
            records.append({
                "title": document["title"],
                "text": chunk,
                "source": document["source"],
                "chunk_index": i,
            })

    INDEX.parent.mkdir(parents=True, exist_ok=True)
    INDEX.write_text(json.dumps(records, indent=2))

    return {
        "documents": len(documents),
        "chunks": len(records),
    }

if __name__ == "__main__":
    print(build_index())
