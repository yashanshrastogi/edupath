"use client";

import { useEffect, useState } from "react";
import {
  BarChart2,
  CheckCircle,
  FileText,
  Flag,
  MoreHorizontal,
  Search,
  Shield,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";

const tabs = ["Overview", "Users", "Resources", "Moderation", "Analytics"] as const;
type Tab = (typeof tabs)[number];

const signupData = [
  { day: "Mon", new: 120 },
  { day: "Tue", new: 180 },
  { day: "Wed", new: 145 },
  { day: "Thu", new: 210 },
  { day: "Fri", new: 265 },
  { day: "Sat", new: 189 },
  { day: "Sun", new: 234 },
];

const retentionData = [
  { month: "Oct", rate: 62 },
  { month: "Nov", rate: 68 },
  { month: "Dec", rate: 72 },
  { month: "Jan", rate: 76 },
  { month: "Feb", rate: 81 },
  { month: "Mar", rate: 84 },
];

const demoUsers = [
  { id: "1", name: "Sarah Kimani", email: "sarah@example.com", joined: "Jan 5", roadmaps: 3, status: "active", role: "USER" },
  { id: "2", name: "Alex Rivera", email: "alex@example.com", joined: "Jan 12", roadmaps: 2, status: "active", role: "USER" },
  { id: "3", name: "Priya Mehta", email: "priya@example.com", joined: "Feb 3", roadmaps: 5, status: "active", role: "ADMIN" },
  { id: "4", name: "Mark Wilson", email: "mark@example.com", joined: "Feb 18", roadmaps: 1, status: "suspended", role: "USER" },
  { id: "5", name: "Emma Chen", email: "emma@example.com", joined: "Mar 1", roadmaps: 4, status: "active", role: "USER" },
];

const reports = [
  { id: "1", type: "Spam Post", reporter: "user_234", target: "Post #4821", time: "2h ago", status: "pending" },
  { id: "2", type: "Inappropriate Content", reporter: "user_118", target: "Post #4790", time: "4h ago", status: "resolved" },
  { id: "3", type: "Misleading Resource", reporter: "user_567", target: "Resource #221", time: "1d ago", status: "pending" },
];

const resources = [
  { name: "React Official Docs", type: "Documentation", visits: 8420, approved: true },
  { name: "freeCodeCamp — Full Stack", type: "Course", visits: 6234, approved: true },
  { name: "Mysterious ML Guide", type: "Article", visits: 143, approved: false },
  { name: "Traversy Media Playlist", type: "YouTube", visits: 9871, approved: true },
];

const analyticsMetrics = [
  { label: "Roadmaps Created", value: "186,420", change: "+12%", color: "#8b5cf6" },
  { label: "Quizzes Taken", value: "43,200", change: "+24%", color: "#f59e0b" },
  { label: "Resumes Exported", value: "8,760", change: "+8%", color: "#10b981" },
  { label: "Community Posts", value: "94,200", change: "+31%", color: "#06b6d4" },
  { label: "Daily Active Users", value: "12,400", change: "+5%", color: "#a855f7" },
  { label: "Study Hours/User", value: "2.4h", change: "+0.3h", color: "#f43f5e" },
  { label: "Referral Signups", value: "4,280", change: "+18%", color: "#06b6d4" },
  { label: "Pro Conversion Rate", value: "14.2%", change: "+1.4%", color: "#10b981" },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [search, setSearch] = useState("");
  const [dbMetrics, setDbMetrics] = useState<{
    users: number; roadmaps: number; posts: number; applications: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data) setDbMetrics(data); })
      .catch(() => {});
  }, []);

  const filteredUsers = demoUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5 fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(244,63,94,0.15)", border: "1px solid rgba(244,63,94,0.3)" }}
        >
          <Shield size={20} style={{ color: "#f43f5e" }} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold font-display">Admin Panel</h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Platform management and analytics
          </p>
        </div>
        <div
          className="ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{
            background: "rgba(244,63,94,0.12)",
            color: "#fda4af",
            border: "1px solid rgba(244,63,94,0.25)",
          }}
        >
          Admin Access
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl overflow-x-auto scroll-x"
        style={{ background: "rgba(22,22,31,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
            style={{
              background: activeTab === tab ? "rgba(244,63,94,0.18)" : "transparent",
              color: activeTab === tab ? "#fda4af" : "var(--text-muted)",
              border: activeTab === tab ? "1px solid rgba(244,63,94,0.3)" : "1px solid transparent",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === "Overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Users",
                value: dbMetrics ? dbMetrics.users.toLocaleString() : "—",
                icon: Users,
                color: "#8b5cf6",
                sub: "Platform accounts",
              },
              {
                label: "Active Roadmaps",
                value: dbMetrics ? dbMetrics.roadmaps.toLocaleString() : "—",
                icon: BarChart2,
                color: "#10b981",
                sub: "Personalised plans",
              },
              {
                label: "Community Posts",
                value: dbMetrics ? dbMetrics.posts.toLocaleString() : "—",
                icon: FileText,
                color: "#06b6d4",
                sub: "Posts and questions",
              },
              {
                label: "Applications",
                value: dbMetrics ? dbMetrics.applications.toLocaleString() : "—",
                icon: Flag,
                color: "#f43f5e",
                sub: "Job applications",
              },
            ].map(({ label, value, icon: Icon, color, sub }) => (
              <div key={label} className="card">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
                  <Icon size={15} style={{ color }} />
                </div>
                <div className="text-2xl font-extrabold font-display mb-0.5" style={{ color }}>
                  {value}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card">
              <h2 className="section-title mb-4">New Signups (Last 7 Days)</h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={signupData} barSize={24}>
                  <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--bg-card)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 8, color: "#f1f0ff", fontSize: 12 }}
                  />
                  <Bar dataKey="new" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h2 className="section-title mb-4">User Retention Rate (%)</h2>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={retentionData}>
                  <defs>
                    <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--bg-card)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, color: "#f1f0ff", fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} fill="url(#retGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── Users ── */}
      {activeTab === "Users" && (
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="input-field pl-9 py-2 text-xs"
              />
            </div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>{filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}</div>
          </div>
          <div className="overflow-x-auto scroll-x">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  {["User", "Email", "Joined", "Roadmaps", "Role", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", color: "white" }}
                        >
                          {u.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="text-sm font-semibold">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-xs" style={{ color: "var(--text-muted)" }}>{u.email}</td>
                    <td className="py-3 px-3 text-xs" style={{ color: "var(--text-muted)" }}>{u.joined}</td>
                    <td className="py-3 px-3 text-sm text-center">{u.roadmaps}</td>
                    <td className="py-3 px-3">
                      <span className={`badge text-xs ${u.role === "ADMIN" ? "badge-rose" : "badge-violet"}`}>{u.role}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`badge text-xs ${u.status === "active" ? "badge-emerald" : "badge-rose"}`}>
                        {u.status === "active" ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button className="btn-ghost text-xs px-2 py-1">
                        <MoreHorizontal size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Resources ── */}
      {activeTab === "Resources" && (
        <div className="card">
          <h2 className="section-title mb-4">Resource Management</h2>
          <div className="space-y-2">
            {resources.map(({ name, type, visits, approved }) => (
              <div
                key={name}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{name}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {type} · {visits.toLocaleString()} visits
                  </div>
                </div>
                {approved ? (
                  <span className="badge badge-emerald text-xs">
                    <CheckCircle size={10} /> Approved
                  </span>
                ) : (
                  <span className="badge badge-rose text-xs">
                    <XCircle size={10} /> Pending
                  </span>
                )}
                <div className="flex gap-1">
                  {!approved && <button className="btn-primary text-xs px-3 py-1">Approve</button>}
                  <button className="btn-ghost text-xs px-2 py-1">
                    <MoreHorizontal size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Moderation ── */}
      {activeTab === "Moderation" && (
        <div className="card">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Flag size={16} style={{ color: "#f43f5e" }} /> Community Reports
          </h2>
          <div className="space-y-3">
            {reports.map(({ id, type, reporter, target, time, status }) => (
              <div
                key={id}
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge badge-rose text-xs">{type}</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      by {reporter}
                    </span>
                  </div>
                  <div className="text-sm font-semibold">{target}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{time}</div>
                </div>
                {status === "resolved" ? (
                  <span className="badge badge-emerald text-xs">Resolved</span>
                ) : (
                  <div className="flex gap-2">
                    <button className="btn-primary text-xs px-3 py-1">Resolve</button>
                    <button className="btn-ghost text-xs px-3 py-1">Dismiss</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Analytics ── */}
      {activeTab === "Analytics" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {analyticsMetrics.map(({ label, value, change, color }) => (
            <div key={label} className="card glass-hover">
              <div className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{label}</div>
              <div className="text-2xl font-extrabold font-display mb-1" style={{ color }}>{value}</div>
              <div className="flex items-center gap-1">
                <TrendingUp size={11} style={{ color: "#10b981" }} />
                <span className="text-xs font-semibold" style={{ color: "#6ee7b7" }}>
                  {change} this month
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
