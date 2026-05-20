import StatusBadge from "./StatusBadge.jsx";

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

export default function DocumentList({ documents, onDelete }) {
  if (!documents.length) {
    return (
      <div className="bg-surface border border-border rounded-lg p-8 text-center text-text-muted">
        No documents yet. Upload a PDF or text file to get started.
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden card-hover">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-text-muted">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Chunks</th>
            <th className="px-4 py-3 font-medium">Uploaded</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr
              key={doc.id}
              className="border-b border-border/50 last:border-0 hover:bg-base/30"
            >
              <td className="px-4 py-3 text-text-primary">{doc.filename}</td>
              <td className="px-4 py-3">
                <StatusBadge status={doc.status} />
              </td>
              <td className="px-4 py-3 text-text-muted">{doc.chunkCount}</td>
              <td className="px-4 py-3 text-text-muted">
                {formatDate(doc.createdAt)}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onDelete(doc.id)}
                  className="text-error hover:text-error/80 text-xs font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
