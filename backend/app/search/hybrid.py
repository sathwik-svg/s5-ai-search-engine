from rank_bm25 import BM25Okapi
from app.embeddings.service import EmbeddingService
from app.search.vector_store import VectorStore

class HybridSearch:
    def __init__(self):
        self.embeddings = EmbeddingService()
        self.store = VectorStore()

    def vector_search(self, query, limit=20):
        vector = self.embeddings.encode_query(query)
        return self.store.search(vector, limit)

    def hybrid_search(self, query, limit=10):
        vector_results = self.vector_search(query, 20)

        documents = [
            r.payload.get("text", "")
            for r in vector_results
        ]

        if not documents:
            return []

        tokenized = [doc.lower().split() for doc in documents]
        bm25 = BM25Okapi(tokenized)
        keyword_scores = bm25.get_scores(query.lower().split())

        ranked = []

        for i, result in enumerate(vector_results):
            vector_score = float(result.score)
            keyword_score = float(keyword_scores[i])

            final_score = (
                0.65 * vector_score +
                0.35 * (keyword_score / (keyword_score + 1))
            )

            ranked.append({
                "title": result.payload.get("title"),
                "text": result.payload.get("text"),
                "source": result.payload.get("source"),
                "vector_score": round(vector_score, 4),
                "keyword_score": round(keyword_score, 4),
                "score": round(final_score, 4),
            })

        ranked.sort(key=lambda x: x["score"], reverse=True)

        return ranked[:limit]
