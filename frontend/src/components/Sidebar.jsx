import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-r-md border-l-2 transition-colors ${
    isActive
      ? "border-accent text-accent bg-accent/10"
      : "border-transparent text-text-muted hover:text-text-primary hover:bg-surface/50"
  }`;

function UsageBar({ monthlyCount, queryLimit }) {
  const remaining = queryLimit - monthlyCount;
  const pct = queryLimit > 0 ? (monthlyCount / queryLimit) * 100 : 0;

  let barColor = "bg-success";
  if (remaining <= 0) barColor = "bg-error";
  else if (remaining < 100) barColor = "bg-warning";

  return (
    <div className="px-4 py-3 border-t border-border">
      <p className="text-xs text-text-muted mb-2">
        {monthlyCount} / {queryLimit} queries
      </p>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function Sidebar({ me }) {
  const { tenant, logout } = useAuth();
  const monthlyCount = me?.monthlyCount ?? tenant?.monthlyCount ?? 0;
  const queryLimit = me?.queryLimit ?? tenant?.queryLimit ?? 1000;

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-surface border-r border-border flex flex-col z-10">
      <div className="px-4 py-6 border-b border-border">
        <h1 className="font-display text-xl font-bold text-text-primary">
          DocuMind
        </h1>
        <p className="text-xs text-text-muted mt-0.5">RAG Platform</p>
      </div>

      <nav className="flex-1 py-4 space-y-1">
        <NavLink to="/documents" className={navLinkClass}>
          Documents
        </NavLink>
        <NavLink to="/query" className={navLinkClass}>
          Query Playground
        </NavLink>
        <NavLink to="/analytics" className={navLinkClass}>
          Analytics
        </NavLink>
      </nav>

      <UsageBar monthlyCount={monthlyCount} queryLimit={queryLimit} />

      <div className="px-4 py-4 border-t border-border">
        <p className="text-xs text-text-muted truncate mb-2">
          {me?.email ?? tenant?.email}
        </p>
        <button
          type="button"
          onClick={logout}
          className="w-full text-sm py-2 px-3 rounded-md border border-border text-text-muted hover:text-text-primary hover:border-accent/50 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
