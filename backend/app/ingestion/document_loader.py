from pathlib import Path
from pypdf import PdfReader
import frontmatter

SUPPORTED = {".pdf", ".txt", ".md", ".markdown"}

def load_document(path: str) -> dict:
    file = Path(path)

    if file.suffix.lower() not in SUPPORTED:
        raise ValueError(f"Unsupported file type: {file.suffix}")

    if file.suffix.lower() == ".pdf":
        reader = PdfReader(str(file))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)

    elif file.suffix.lower() in {".md", ".markdown"}:
        post = frontmatter.load(str(file))
        text = post.content

    else:
        text = file.read_text(encoding="utf-8", errors="ignore")

    return {
        "title": file.stem,
        "text": text.strip(),
        "source": str(file),
    }


def load_directory(directory: str) -> list[dict]:
    root = Path(directory)
    documents = []

    for path in root.rglob("*"):
        if path.is_file() and path.suffix.lower() in SUPPORTED:
            document = load_document(str(path))
            if document["text"]:
                documents.append(document)

    return documents
