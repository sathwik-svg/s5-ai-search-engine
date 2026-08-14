from fastapi import FastAPI
from pydantic import BaseModel
from app.search.engine import SearchEngine
from app.api.ingestion import router as ingestion_router

app = FastAPI(
    title="S5 AI Search Engine",
    description="Lightweight AI-ready document search platform",
    version="1.0.0",
)

class SearchRequest(BaseModel):
    query: str
    limit: int = 10

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "s5-ai-search-engine"
    }

@app.post("/api/v1/search")
def search(request: SearchRequest):
    return {
        "query": request.query,
        "mode": "lightweight-bm25",
        "results": SearchEngine().search(
            request.query,
            request.limit
        )
    }

app.include_router(ingestion_router)
