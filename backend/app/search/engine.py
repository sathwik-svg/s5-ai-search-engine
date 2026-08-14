from app.embeddings.service import EmbeddingService
from app.search.vector_store import VectorStore

class SearchEngine:
    def __init__(self):
        self.embeddings = EmbeddingService()
        self.store = VectorStore()

    def search(self, query: str, limit: int = 10):
        vector = self.embeddings.encode_query(query)
        results = self.store.search(vector, limit)

        return [
            {
                "score": round(float(result.score), 4),
                "title": result.payload.get("title"),
                "text": result.payload.get("text"),
                "source": result.payload.get("source"),
            }
            for result in results
        ]
