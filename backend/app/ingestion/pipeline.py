from uuid import uuid4

from qdrant_client.models import PointStruct

from app.embeddings.service import EmbeddingService
from app.ingestion.document_loader import load_directory
from app.ingestion.chunker import chunk_text
from app.search.vector_store import VectorStore


class IngestionPipeline:

    def __init__(self):
        self.embeddings = EmbeddingService()
        self.store = VectorStore()

    def ingest_directory(self, directory: str):
        documents = load_directory(directory)

        records = []

        for document in documents:
            chunks = chunk_text(document["text"])

            for index, chunk in enumerate(chunks):
                records.append({
                    "title": document["title"],
                    "text": chunk,
                    "source": document["source"],
                    "chunk_index": index,
                })

        if not records:
            return {
                "documents": 0,
                "chunks": 0,
            }

        vectors = self.embeddings.encode(
            [record["text"] for record in records]
        )

        self.store.ensure_collection(len(vectors[0]))

        points = []

        for record, vector in zip(records, vectors):
            points.append(
                PointStruct(
                    id=str(uuid4()),
                    vector=vector,
                    payload=record,
                )
            )

        self.store.upsert(points)

        return {
            "documents": len(documents),
            "chunks": len(records),
        }
