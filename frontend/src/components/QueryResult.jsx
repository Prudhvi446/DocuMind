export default function QueryResult({ result }) {
  if (!result) return null;

  if (result.belowThreshold) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6 card-hover">
        <div className="rounded-md bg-warning/10 border border-warning/30 px-4 py-3 text-warning text-sm mb-4">
          No relevant documentation found
        </div>
        <p className="text-text-primary leading-relaxed">{result.answer}</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-6 card-hover">
      <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
        {result.answer}
      </p>
      <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-3 text-xs text-text-muted">
        {result.cached && (
          <span className="px-2 py-0.5 rounded bg-accent/20 text-accent font-medium">
            Cached
          </span>
        )}
        <span>Input: {result.tokensUsed?.input ?? 0}</span>
        <span>Output: {result.tokensUsed?.output ?? 0}</span>
        <span>Total: {result.tokensUsed?.total ?? 0} tokens</span>
        {result.similarityScore != null && (
          <span>Score: {Number(result.similarityScore).toFixed(2)}</span>
        )}
      </div>
    </div>
  );
}
