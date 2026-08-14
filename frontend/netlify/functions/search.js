const fs = require("fs");
const path = require("path");

function tokenize(text) {
  return text.toLowerCase().match(/[a-z0-9]+/g) || [];
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const query = (body.query || "").trim();

    if (!query) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Query is required" })
      };
    }

    const indexPath = path.join(process.cwd(), "data/index.json");

    if (!fs.existsSync(indexPath)) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          query,
          results: []
        })
      };
    }

    const documents = JSON.parse(
      fs.readFileSync(indexPath, "utf8")
    );

    const queryTokens = tokenize(query);

    const results = documents.map((doc) => {
      const tokens = tokenize(doc.text);

      let score = 0;

      for (const token of queryTokens) {
        score += tokens.filter(t => t === token).length;
      }

      return {
        title: doc.title,
        text: doc.text,
        source: doc.source,
        score
      };
    });

    results.sort((a, b) => b.score - a.score);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        query,
        mode: "netlify-search",
        results: results.slice(0, body.limit || 10)
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Search failed"
      })
    };
  }
};
