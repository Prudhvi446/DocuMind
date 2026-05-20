import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import client from "../api/client.js";

function StatCard({ label, value, loading }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-5 card-hover">
      <p className="text-text-muted text-xs uppercase tracking-wide">{label}</p>
      {loading ? (
        <div className="h-8 mt-2 bg-border/50 rounded animate-pulse" />
      ) : (
        <p className="font-display text-2xl font-bold mt-1">{value}</p>
      )}
    </div>
  );
}

function truncate(str, len = 60) {
  if (!str) return "";
  return str.length > len ? `${str.slice(0, len)}…` : str;
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get("/api/analytics")
      .then(({ data: d }) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    if (!data?.recentQueries?.length) return [];
    const byDay = {};
    for (const q of data.recentQueries) {
      const day = new Date(q.createdAt).toLocaleDateString();
      byDay[day] = (byDay[day] || 0) + 1;
    }
    return Object.entries(byDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data]);

  const monthlyPct =
    data && data.queryLimit > 0
      ? Math.round((data.monthlyQueries / data.queryLimit) * 100)
      : 0;

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="font-display text-2xl font-bold">Analytics</h1>
        <p className="text-text-muted text-sm mt-1">
          Usage metrics and query history
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Queries"
          value={data?.totalQueries ?? 0}
          loading={loading}
        />
        <StatCard
          label="This Month"
          value={data?.monthlyQueries ?? 0}
          loading={loading}
        />
        <StatCard
          label="Cache Hit Rate"
          value={data?.cacheHitRate ?? "0.0%"}
          loading={loading}
        />
        <StatCard
          label="Total Tokens"
          value={data?.totalTokens ?? 0}
          loading={loading}
        />
      </div>

      <div className="bg-surface border border-border rounded-lg p-6 card-hover">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-medium">Monthly quota</h2>
          <span className="text-sm text-text-muted">{monthlyPct}%</span>
        </div>
        <p className="text-sm text-text-muted mb-2">
          {data?.monthlyQueries ?? 0} of {data?.queryLimit ?? 0} queries
        </p>
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all"
            style={{ width: `${Math.min(monthlyPct, 100)}%` }}
          />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6 card-hover h-72">
        <h2 className="font-medium mb-4">Queries per day</h2>
        {loading ? (
          <div className="h-48 bg-border/30 rounded animate-pulse" />
        ) : chartData.length === 0 ? (
          <p className="text-text-muted text-sm">No query data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="#2a2d3a" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "#1a1d27",
                  border: "1px solid #2a2d3a",
                  borderRadius: 8,
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: "#6366f1" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden card-hover">
        <h2 className="font-medium px-4 py-4 border-b border-border">
          Recent queries
        </h2>
        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-border/30 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-muted border-b border-border">
                <th className="px-4 py-3">Question</th>
                <th className="px-4 py-3">Cached</th>
                <th className="px-4 py-3">Tokens</th>
                <th className="px-4 py-3">Similarity</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentQueries ?? []).map((q) => (
                <tr
                  key={q.id}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="px-4 py-3">{truncate(q.question)}</td>
                  <td className="px-4 py-3 text-text-muted">
                    {q.cached ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{q.totalTokens}</td>
                  <td className="px-4 py-3 text-text-muted">
                    {q.similarityScore != null
                      ? Number(q.similarityScore).toFixed(2)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {new Date(q.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
