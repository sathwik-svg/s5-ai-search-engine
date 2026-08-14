from sentence_transformers import SentenceTransformer
from app.core.config import settings

class EmbeddingService:
    def __init__(self):
        self.model = SentenceTransformer(settings.embedding_model)

    def encode(self, texts: list[str]):
        return self.model.encode(texts, normalize_embeddings=True).tolist()

    def encode_query(self, text: str):
        return self.encode([text])[0]
