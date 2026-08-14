from pathlib import Path
from rank_bm25 import BM25Okapi

class LightweightSearch:
    def __init__(self, documents=None):
        self.documents = documents or []
        self.tokens = [
            d["text"].lower().split()
            for d in self.documents
        ]
        self.bm25 = BM25Okapi(self.tokens) if self.tokens else None

    def search(self, query: str, limit: int = 10):
        if not self.bm25:
            return []

        scores = self.bm25.get_scores(query.lower().split())
        ranked = sorted(
            zip(self.documents, scores),
            key=lambda x: x[1],
            reverse=True,
        )

        return [
            {
                "title": doc["title"],
                "text": doc["text"],
                "source": doc["source"],
                "score": round(float(score), 4),
            }
            for doc, score in ranked[:limit]
        ]
