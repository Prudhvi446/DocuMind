import { useCallback, useEffect, useState } from "react";
import client from "../api/client.js";
import UploadForm from "../components/UploadForm.jsx";
import DocumentList from "../components/DocumentList.jsx";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      const { data } = await client.get("/api/documents");
      setDocuments(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    const needsPoll = documents.some(
      (d) => d.status === "pending" || d.status === "processing"
    );
    if (!needsPoll) return;

    const interval = setInterval(fetchDocuments, 5000);
    return () => clearInterval(interval);
  }, [documents, fetchDocuments]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document and all its chunks?")) return;
    try {
      await client.delete(`/api/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold">Documents</h1>
        <p className="text-text-muted text-sm mt-1">
          Upload PDF or text files for RAG indexing
        </p>
      </div>

      <UploadForm onUploaded={fetchDocuments} />

      {loading ? (
        <p className="text-text-muted text-sm">Loading documents…</p>
      ) : (
        <DocumentList documents={documents} onDelete={handleDelete} />
      )}
    </div>
  );
}
