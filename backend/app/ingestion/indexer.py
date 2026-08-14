from uuid import uuid4
from qdrant_client.models import PointStruct
from app.embeddings.service import EmbeddingService
from app.search.vector_store import VectorStore

class DocumentIndexer:
    def __init__(self):
        self.embeddings = EmbeddingService()
        self.store = VectorStore()

    def index(self, documents: list[dict]):
        texts = [d["text"] for d in documents]
        vectors = self.embeddings.encode(texts)

        self.store.ensure_collection(len(vectors[0]))

        points = [
            PointStruct(
                id=str(uuid4()),
                vector=vector,
                payload={
                    "title": document.get("title", "Untitled"),
                    "text": document["text"],
                    "source": document.get("source", "local"),
                },
            )
            for document, vector in zip(documents, vectors)
        ]

        self.store.upsert(points)
        return len(points)
