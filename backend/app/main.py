from fastapi import FastAPI

app = FastAPI(title="S5 AI Search Engine", version="1.0.0")

@app.get("/health")
def health():
    return {"status": "healthy", "service": "s5-ai-search-engine"}

@app.get("/api/v1/search")
def search(q: str, limit: int = 10):
    return {"query": q, "results": [], "limit": limit}
