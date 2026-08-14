from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    qdrant_url: str = "http://localhost:6333"
    collection_name: str = "s5_documents"
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    llm_api_key: str = ""
    llm_model: str = "gpt-4o-mini"

    class Config:
        env_file = ".env"

settings = Settings()
