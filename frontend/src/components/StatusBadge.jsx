const STATUS_STYLES = {
  pending: "bg-warning/20 text-warning border-warning/30",
  processing: "bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse-badge",
  done: "bg-success/20 text-success border-success/30",
  failed: "bg-error/20 text-error border-error/30",
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${style}`}
    >
      {status}
    </span>
  );
}
