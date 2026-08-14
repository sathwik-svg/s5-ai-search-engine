import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

type Result = {
  title: string;
  text: string;
  source: string;
  score: number;
};

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function search() {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(`${API}/api/v1/search`, {
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
