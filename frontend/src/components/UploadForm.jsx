import { useState } from "react";
import client from "../api/client.js";

export default function UploadForm({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setMessage(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await client.post("/api/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(`Upload started — document ${data.documentId} is ${data.status}`);
      setFile(null);
      e.target.reset();
      onUploaded?.();
    } catch (err) {
      setError(
        err.response?.data?.error || "Upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-border rounded-lg p-6 card-hover"
    >
      <h2 className="font-display text-lg font-semibold mb-4">Upload Document</h2>
      <div className="flex flex-wrap items-end gap-4">
        <input
          type="file"
          accept=".pdf,.txt"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-accent file:text-white file:cursor-pointer hover:file:bg-accent-hover"
        />
        <button
          type="submit"
          disabled={!file || loading}
          className="px-5 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Uploading…" : "Upload Document"}
        </button>
      </div>
      {message && (
        <p className="mt-3 text-sm text-success">{message}</p>
      )}
      {error && <p className="mt-3 text-sm text-error">{error}</p>}
    </form>
  );
}
