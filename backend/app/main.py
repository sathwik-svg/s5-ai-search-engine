from fastapi import FastAPI
from pydantic import BaseModel
from app.ingestion.indexer import DocumentIndexer
from app.search.engine import SearchEngine
from app.search.hybrid import HybridSearch
from app.api.ingestion import router as ingestion_router
from app.api.rag import router as rag_router

app = FastAPI(
    title="S5 AI Search Engine",
    description="Production-grade semantic AI search API",
    version="1.0.0",
)

class Document(BaseModel):
    title: str
    text: str
    source: str = "local"

class SearchRequest(BaseModel):
    query: str
    limit: int = 10

@app.get("/health")
def health():
    return {"status": "healthy", "service": "s5-ai-search-engine"}

@app.post("/api/v1/index")
def index_document(document: Document):
    count = DocumentIndexer().index([document.model_dump()])
    return {"indexed": count}

@app.post("/api/v1/search")
def search(request: SearchRequest):
    return {
        "query": request.query,
        "mode": "semantic",
        "results": SearchEngine().search(request.query, request.limit),
    }

@app.post("/api/v1/search/hybrid")
def hybrid_search(request: SearchRequest):
    return {
        "query": request.query,
        "mode": "hybrid",
        "results": HybridSearch().hybrid_search(
            request.query,
            request.limit
        ),
    }


app.include_router(ingestion_router)

app.include_router(rag_router)
