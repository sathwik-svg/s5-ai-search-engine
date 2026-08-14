from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil
import uuid

from app.ingestion.lightweight_index import build_index

router = APIRouter(
    prefix="/api/v1/ingest",
    tags=["ingestion"]
)

UPLOAD_DIR = Path("backend/data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/file")
async def ingest_file(file: UploadFile = File(...)):
    extension = Path(file.filename or "").suffix.lower()

    if extension not in {".pdf", ".txt", ".md", ".markdown"}:
        raise HTTPException(
            status_code=400,
            detail="Supported formats: PDF, TXT, Markdown"
        )

    filename = f"{uuid.uuid4()}{extension}"
    destination = UPLOAD_DIR / filename

    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = build_index(str(UPLOAD_DIR))

    return {
        "status": "indexed",
        "filename": file.filename,
        **result
    }
