import json
from pathlib import Path
from app.search.lightweight import LightweightSearch

class SearchEngine:
    def __init__(self):
        self.documents = self._load_documents()
        self.engine = LightweightSearch(self.documents)

    def _load_documents(self):
        path = Path("backend/data/index.json")

        if not path.exists():
            return []

        return json.loads(path.read_text())

    def search(self, query: str, limit: int = 10):
        return self.engine.search(query, limit)
