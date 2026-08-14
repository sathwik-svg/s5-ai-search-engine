const fs = require("fs");
const path = require("path");

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z0-9+#.-]+/g) || []);
}

function scoreDocument(doc, query) {
  const queryTokens = tokenize(query);
  const textTokens = tokenize(
    `${doc.title} ${doc.text} ${doc.tags.join(" ")}`
  );

  const frequencies = {};

  for (const token of textTokens) {
    frequencies[token] = (frequencies[token] || 0) + 1;
  }

  let score = 0;
  const matched = [];

  for (const token of queryTokens) {
    if (frequencies[token]) {
      score += Math.min(frequencies[token], 5);
      matched.push(token);
    }
  }

  const phrase = query.toLowerCase().trim();

  if (
    doc.title.toLowerCase().includes(phrase) ||
    doc.text.toLowerCase().includes(phrase)
  ) {
    score += 8;
  }

  return {
    score,
    matched: [...new Set(matched)]
  };
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type"
        },
        body: ""
      };
    }

    const body = JSON.parse(event.body || "{}");
    const query = String(body.query || "").trim();

    if (!query) {
      return {
        statusCode: 400,
        headers: {"Access-Control-Allow-Origin":"*"},
        body: JSON.stringify({ error: "Query is required" })
      };
    }

    const dataPath = path.join(process.cwd(), "data", "knowledge.json");
    const documents = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    const ranked = documents
      .map((doc) => {
        const result = scoreDocument(doc, query);
        return {
          ...doc,
          score: result.score,
          matched: result.matched
        };
      })
      .filter((doc) => doc.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, Number(body.limit) || 6);

    const maxScore = ranked[0]?.score || 1;

    const results = ranked.map((doc) => ({
      title: doc.title,
      text: doc.text,
      source: doc.source,
      score: Number(Math.min(0.99, 0.55 + (doc.score / maxScore) * 0.44).toFixed(3)),
      matched: doc.matched
    }));

    const answer = results.length
      ? `S5 found ${results.length} relevant knowledge source${results.length === 1 ? "" : "s"} for "${query}". The strongest match is "${results[0].title}". The retrieved sources indicate that ${results[0].text}`
      : `S5 could not find relevant information for "${query}". Try terms such as Kubernetes, Docker, AWS, DevOps, Terraform or cloud architecture.`;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({
        query,
        answer,
        mode: "local-hybrid-search",
        results,
        citations: results.map((r, i) => ({
          id: i + 1,
          title: r.title,
          source: r.source
        }))
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {"Access-Control-Allow-Origin":"*"},
      body: JSON.stringify({
        error: "Search service failed"
      })
    };
  }
};
