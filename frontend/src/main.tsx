import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

type Result = {
  title: string;
  text: string;
  source: string;
  score: number;
};

const API = "";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");

  async function search() {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(`/api/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query,
          limit: 10
        })
      });

      if (!response.ok) {
        throw new Error("Search API request failed");
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function upload(file: File) {
    setUploading(true);
    setMessage("");

    const form = new FormData();
    form.append("file", file);

    try {
      const response = await fetch(`${API}/api/v1/ingest/file`, {
        method: "POST",
        body: form
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      setMessage(`Indexed ${data.chunks} document chunks`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    search();
  }

  return (
    <main>
      <div className="grid" />

      <nav>
        <div className="brand">
          <span className="logo">S5</span>
          <span>AI Search</span>
        </div>
        <span className="status">
          <i /> SYSTEM ONLINE
        </span>
      </nav>

      <section className={`hero ${searched ? "compact" : ""}`}>
        <div className="badge">INTELLIGENT INFORMATION RETRIEVAL</div>

        {!searched && (
          <>
            <h1>
              Search smarter.
              <br />
              <span>Understand faster.</span>
            </h1>

            <p>
              Semantic document search powered by lightweight retrieval,
              intelligent ranking and AI-ready architecture.
            </p>
          </>
        )}

        <form onSubmit={submit} className="search">
          <span className="searchIcon">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about your knowledge base..."
          />
          <button disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        <div className="upload">
          <label>
            {uploading ? "Indexing document..." : "＋ Upload PDF / TXT / MD"}
            <input
              type="file"
              accept=".pdf,.txt,.md,.markdown"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload(file);
              }}
            />
          </label>
          {message && <span>{message}</span>}
        </div>

        {!searched && (
          <div className="chips">
            {["Cloud architecture", "Kubernetes", "DevOps", "AI systems"].map(
              (item) => (
                <button
                  key={item}
                  onClick={() => {
                    setQuery(item);
                  }}
                >
                  {item}
                </button>
              )
            )}
          </div>
        )}
      </section>

      {searched && (
        <section className="results">
          {searched && answer && (
            <div className="answer">
              <span className="eyebrow">S5 AI ANSWER</span>
              <h2>Grounded search summary</h2>
              <p>{answer}</p>
              <div className="citationRow">
                {results.slice(0, 4).map((r, i) => (
                  <span key={r.source}>
                    [{i + 1}] {r.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="resultHeader">
            <div>
              <span className="eyebrow">SEARCH RESULTS</span>
              <h2>
                {results.length} relevant {results.length === 1 ? "result" : "results"}
              </h2>
            </div>
            <span className="query">“{query}”</span>
          </div>

          {loading ? (
            <div className="loading">
              <div className="loader" />
              <span>Searching your knowledge base...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="empty">
              <div>⌁</div>
              <h3>No results found</h3>
              <p>Try a different query or ingest more documents.</p>
            </div>
          ) : (
            <div className="cards">
              {results.map((result, index) => (
                <article className="card" key={`${result.source}-${index}`}>
                  <div className="cardTop">
                    <span className="number">0{index + 1}</span>
                    <span className="score">
                      {Math.round(result.score * 100)}% match
                    </span>
                  </div>

                  <h3>{result.title}</h3>
                  <p>{result.text}</p>

                  <div className="source">
                    <span>↗</span>
                    {result.source}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <footer>
        <span>S5 AI SEARCH ENGINE</span>
        <span>HYBRID RETRIEVAL • RAG READY • CLOUD NATIVE</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
