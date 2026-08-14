from fastapi import APIRouter
from pydantic import BaseModel
from app.rag.engine import RAGEngine

router = APIRouter(prefix="/api/v1/rag", tags=["rag"])

class RAGRequest(BaseModel):
    query: str
    limit: int = 5

@router.post("/answer")
def generate_answer(request: RAGRequest):
    return RAGEngine().answer(
        request.query,
        request.limit,
    )
