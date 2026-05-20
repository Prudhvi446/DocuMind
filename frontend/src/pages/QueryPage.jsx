import { useState, useEffect } from "react";
import client from "../api/client.js";
import QueryResult from "../components/QueryResult.jsx";

export default function QueryPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [rateLimitError, setRateLimitError] = useState(null);
  const [history, setHistory] = useState([]);
  const [expandedIdx, setExpandedIdx] = useState(null);

  useEffect(() => {
    client.get("/api/query/history")
      .then((res) => setHistory(res.data))
      .catch((err) => console.error("Failed to load history:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setRateLimitError(null);
    setResult(null);

    try {
      const { data } = await client.post("/api/query", {
        question: question.trim(),
      });
      setResult(data);
      setHistory((prev) => {
        const next = [
          { question: question.trim(), ...data },
          ...prev,
        ].slice(0, 5);
        return next;
      });
    } catch (err) {
      if (err.response?.status === 429) {
        const d = err.response.data;
        setRateLimitError({
          limit: d.limit,
          used: d.used,
          resetsAt: d.resetsAt,
        });
      } else {
        setResult({
          answer: err.response?.data?.error || "Query failed",
          belowThreshold: false,
          cached: false,
          tokensUsed: { input: 0, output: 0, total: 0 },
          similarityScore: null,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Query Playground</h1>
        <p className="text-text-muted text-sm mt-1">
          Ask questions about your uploaded documentation
        </p>
      </div>

      {rateLimitError && (
        <div className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          Monthly query limit reached ({rateLimitError.used} /{" "}
          {rateLimitError.limit}). Resets on{" "}
          {new Date(rateLimitError.resetsAt).toLocaleDateString()}.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything about your documentation..."
          className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-text-primary text-sm resize-none"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {loading ? "Thinking…" : "Ask"}
        </button>
      </form>

      <QueryResult result={result} />

      {history.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-text-muted">Session history</h2>
          {history.map((item, idx) => (
            <div
              key={idx}
              className="border border-border rounded-lg overflow-hidden card-hover"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedIdx(expandedIdx === idx ? null : idx)
                }
                className="w-full text-left px-4 py-3 text-sm text-text-primary hover:bg-surface/50 flex justify-between"
              >
                <span className="truncate pr-4">{item.question}</span>
                <span className="text-text-muted shrink-0">
                  {expandedIdx === idx ? "▼" : "▶"}
                </span>
              </button>
              {expandedIdx === idx && (
                <div className="px-4 pb-4 border-t border-border">
                  <p className="text-sm text-text-muted mt-3 whitespace-pre-wrap">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
