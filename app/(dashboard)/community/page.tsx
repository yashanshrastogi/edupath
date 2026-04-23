"use client";

import { useEffect, useState } from "react";
import {
  Users, Plus, ThumbsUp, ThumbsDown, MessageSquare,
  Trophy, Star, Zap, Award, Hash, Globe, Flame,
  ChevronRight, Clock, Shield,
} from "lucide-react";

type Post = {
  id: string; title: string; content: string; type: string;
  tags: string[]; upvotes: number; isAnswered: boolean;
  user: { name: string | null }; comments: { id: string }[];
};
type Group = {
  id: string; name: string; description: string;
  tags: string[]; emoji: string; members: { id: string }[];
};
type Challenge = {
  id: string; title: string; prize: string; deadline: string;
  bannerColor: string; difficulty: string; entries: { id: string }[];
};
type CommunityData = { posts: Post[]; groups: Group[]; challenges: Challenge[] };

const tabs = ["Feed", "Q&A", "Groups", "Challenges", "Leaderboard"] as const;
type Tab = (typeof tabs)[number];

const leaderboard = [
  { rank: 1, name: "Sarah K.", initials: "SK", xp: 8420, projects: 14, answered: 89, badge: "⚡", color: "#f59e0b" },
  { rank: 2, name: "Alex R.", initials: "AR", xp: 7800, projects: 11, answered: 112, badge: "🏆", color: "#8b5cf6" },
  { rank: 3, name: "Priya M.", initials: "PM", xp: 7200, projects: 9, answered: 74, badge: "🎯", color: "#06b6d4" },
  { rank: 4, name: "Demo Learner", initials: "DL", xp: 6100, projects: 12, answered: 48, badge: "🔥", color: "#10b981" },
  { rank: 5, name: "Maria C.", initials: "MC", xp: 5800, projects: 7, answered: 201, badge: "🤝", color: "#f43f5e" },
];

/* Avatar bubble */
function Avatar({ name, size = 38, color }: { name: string; size?: number; color?: string }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const bg = color ?? "linear-gradient(135deg,#8b5cf6,#06b6d4)";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: size * 0.34, fontWeight: 700,
      color: "#fff", flexShrink: 0,
    }}>{initials}</div>
  );
}

/* Tag chip */
function Tag({ label }: { label: string }) {
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 99, fontSize: "0.72rem", fontWeight: 600,
      background: "rgba(139,92,246,0.12)", color: "#c4b5fd",
      border: "1px solid rgba(139,92,246,0.2)",
    }}>#{label}</span>
  );
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Feed");
  const [data, setData] = useState<CommunityData>({ posts: [], groups: [], challenges: [] });
  const [statusMsg, setStatusMsg] = useState("Loading community...");
  const [votedPosts, setVotedPosts] = useState<Record<string, "up" | "down">>({});
  const [postForm, setPostForm] = useState({ type: "POST", title: "", content: "", tags: "" });
  const [showPostForm, setShowPostForm] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: "", description: "", tags: "", emoji: "Study" });
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [entryForm, setEntryForm] = useState({ challengeId: "", githubUrl: "", description: "" });
  const [showEntryForm, setShowEntryForm] = useState(false);

  const loadCommunity = async () => {
    const response = await fetch("/api/community");
    if (!response.ok) { setStatusMsg("Sign in to use community features."); return; }
    const payload = await response.json() as CommunityData;
    setData(payload);
    setStatusMsg("");
    if (payload.challenges[0]) setEntryForm(c => ({ ...c, challengeId: payload.challenges[0].id }));
  };

  useEffect(() => { void loadCommunity(); }, []);

  const createPost = async () => {
    const res = await fetch("/api/community", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...postForm, tags: postForm.tags.split(",").map(t => t.trim()).filter(Boolean) }) });
    if (!res.ok) { setStatusMsg((await res.json()).error ?? "Error."); return; }
    setPostForm({ type: "POST", title: "", content: "", tags: "" }); setShowPostForm(false);
    await loadCommunity();
  };
  const createGroup = async () => {
    const res = await fetch("/api/community?action=group", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...groupForm, tags: groupForm.tags.split(",").map(t => t.trim()).filter(Boolean) }) });
    if (!res.ok) { setStatusMsg((await res.json()).error ?? "Error."); return; }
    setGroupForm({ name: "", description: "", tags: "", emoji: "Study" }); setShowGroupForm(false);
    await loadCommunity();
  };
  const submitEntry = async () => {
    const res = await fetch("/api/community?action=challenge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entryForm) });
    if (!res.ok) { setStatusMsg((await res.json()).error ?? "Error."); return; }
    setShowEntryForm(false); await loadCommunity();
  };

  const feedPosts = data.posts.filter(p => p.type === "POST");
  const questions = data.posts.filter(p => p.type === "QUESTION");

  return (
    <div className="fade-in-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "1.5rem", display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(244,63,94,0.15)", border: "1px solid rgba(244,63,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={18} style={{ color: "#f43f5e" }} />
            </div>
            Community Hub
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
            Learn together, grow together. Share, mentor, and compete.
          </p>
          {statusMsg && <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>{statusMsg}</p>}
        </div>
        <button
          onClick={() => { setShowPostForm(true); setActiveTab("Feed"); }}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 20px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
            color: "#fff", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer",
            boxShadow: "0 0 20px rgba(139,92,246,0.35)",
          }}
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      {/* ── TABS ── */}
      <div style={{ display: "flex", gap: 2, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 18px",
              fontSize: "0.85rem", fontWeight: 600,
              background: "transparent",
              color: activeTab === tab ? "#c4b5fd" : "var(--text-muted)",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid #8b5cf6" : "2px solid transparent",
              cursor: "pointer",
              marginBottom: -1,
              transition: "all 0.15s",
            }}
          >
            {tab}
          </button>
        ))}
        <div style={{ flex: 1 }} />
      </div>

      {/* ══ FEED TAB ══════════════════════════════════════════════════ */}
      {activeTab === "Feed" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* New post form */}
          {showPostForm && (
            <div style={{ background: "var(--bg-card)", border: "1px solid rgba(139,92,246,0.35)", borderRadius: 16, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              <h2 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: "1rem" }}>Create a Post</h2>
              <select className="input-field" value={postForm.type} onChange={e => setPostForm({ ...postForm, type: e.target.value })}>
                <option value="POST">Post</option>
                <option value="QUESTION">Question</option>
              </select>
              <input className="input-field" value={postForm.title} onChange={e => setPostForm({ ...postForm, title: e.target.value })} placeholder="Title" />
              <textarea className="input-field" rows={4} value={postForm.content} onChange={e => setPostForm({ ...postForm, content: e.target.value })} placeholder="Share your thoughts..." />
              <input className="input-field" value={postForm.tags} onChange={e => setPostForm({ ...postForm, tags: e.target.value })} placeholder="Tags, comma-separated (e.g. react, career)" />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-primary" onClick={() => void createPost()}>Publish</button>
                <button className="btn-ghost" onClick={() => setShowPostForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {feedPosts.length === 0 && !showPostForm && (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
              <MessageSquare size={36} style={{ color: "var(--text-muted)", margin: "0 auto 12px", opacity: 0.4 }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>No posts yet — be the first to share!</p>
            </div>
          )}

          {feedPosts.map(post => (
            <div
              key={post.id}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 16,
                padding: "20px 24px",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
            >
              {/* Author row */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <Avatar name={post.user.name ?? "?"} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{post.user.name ?? "Anonymous"}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Community Member</div>
                </div>
                <span style={{
                  padding: "3px 10px", borderRadius: 99, fontSize: "0.7rem", fontWeight: 700,
                  background: "rgba(139,92,246,0.15)", color: "#c4b5fd",
                  border: "1px solid rgba(139,92,246,0.3)",
                }}>{post.type}</span>
              </div>

              {/* Content */}
              <h3 style={{ fontWeight: 700, fontSize: "0.98rem", marginBottom: 8 }}>{post.title}</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: 14 }}>{post.content}</p>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  {post.tags.map(tag => <Tag key={tag} label={tag} />)}
                </div>
              )}

              {/* Action row */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 14 }}>
                <button
                  onClick={() => setVotedPosts(prev => ({ ...prev, [post.id]: prev[post.id] === "up" ? undefined as unknown as "up" : "up" }))}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: votedPosts[post.id] === "up" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
                    color: votedPosts[post.id] === "up" ? "#6ee7b7" : "var(--text-muted)",
                    fontSize: "0.8rem", fontWeight: 600,
                  }}
                >
                  <ThumbsUp size={13} /> {post.upvotes + (votedPosts[post.id] === "up" ? 1 : 0)}
                </button>
                <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.04)", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                  <ThumbsDown size={13} />
                </button>
                <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.04)", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                  <MessageSquare size={13} /> {post.comments.length} Comments
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ Q&A TAB ══════════════════════════════════════════════════ */}
      {activeTab === "Q&A" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <button className="btn-primary" style={{ alignSelf: "flex-start" }} onClick={() => { setPostForm({ ...postForm, type: "QUESTION" }); setShowPostForm(true); setActiveTab("Feed"); }}>
            <Plus size={14} /> Ask a Question
          </button>
          {questions.length === 0 && (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
              <MessageSquare size={36} style={{ color: "var(--text-muted)", margin: "0 auto 12px", opacity: 0.4 }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>No questions yet.</p>
            </div>
          )}
          {questions.map(q => (
            <div key={q.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 16, padding: "20px 24px" }}>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <ThumbsUp size={15} style={{ color: "var(--accent-violet)", cursor: "pointer" }} />
                  <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{q.upvotes}</span>
                </div>
                <div style={{ flex: 1 }}>
                  {q.isAnswered && <span style={{ display: "inline-block", marginBottom: 8, padding: "2px 10px", borderRadius: 99, fontSize: "0.7rem", fontWeight: 700, background: "rgba(16,185,129,0.15)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.25)" }}>✓ Answered</span>}
                  <h3 style={{ fontWeight: 700, marginBottom: 6 }}>{q.title}</h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{q.content}</p>
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    {q.tags.map(t => <Tag key={t} label={t} />)}
                  </div>
                  <div style={{ marginTop: 10, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {q.user.name ?? "Anonymous"} · <span style={{ color: "var(--accent-violet)" }}>{q.comments.length} answers</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ GROUPS TAB ════════════════════════════════════════════════ */}
      {activeTab === "Groups" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {showGroupForm && (
            <div style={{ background: "var(--bg-card)", border: "1px solid rgba(139,92,246,0.35)", borderRadius: 16, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              <h2 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: "1rem" }}>Create Study Group</h2>
              <input className="input-field" value={groupForm.name} onChange={e => setGroupForm({ ...groupForm, name: e.target.value })} placeholder="Group name" />
              <textarea className="input-field" rows={3} value={groupForm.description} onChange={e => setGroupForm({ ...groupForm, description: e.target.value })} placeholder="What will this group focus on?" />
              <input className="input-field" value={groupForm.tags} onChange={e => setGroupForm({ ...groupForm, tags: e.target.value })} placeholder="Tags (comma-separated)" />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-primary" onClick={() => void createGroup()}>Create Group</button>
                <button className="btn-ghost" onClick={() => setShowGroupForm(false)}>Cancel</button>
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
            {data.groups.map(group => (
              <div key={group.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 16, padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                    {group.emoji.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{group.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}><Users size={10} style={{ display: "inline", marginRight: 3 }} />{group.members.length} members</div>
                  </div>
                </div>
                <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>{group.description}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                  {group.tags.map(t => <Tag key={t} label={t} />)}
                </div>
                <button style={{ width: "100%", padding: "8px 0", borderRadius: 9, border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.08)", color: "#c4b5fd", fontWeight: 600, fontSize: "0.84rem", cursor: "pointer" }}>Join Group</button>
              </div>
            ))}
            {!showGroupForm && (
              <button onClick={() => setShowGroupForm(true)} style={{ padding: 20, borderRadius: 16, border: "1px dashed rgba(255,255,255,0.12)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 160 }}>
                <Plus size={22} />
                <span style={{ fontSize: "0.84rem" }}>Create Study Group</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ══ CHALLENGES TAB ════════════════════════════════════════════ */}
      {activeTab === "Challenges" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {showEntryForm && (
            <div style={{ background: "var(--bg-card)", border: "1px solid rgba(139,92,246,0.35)", borderRadius: 16, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              <h2 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: "1rem" }}>Submit Entry</h2>
              <select className="input-field" value={entryForm.challengeId} onChange={e => setEntryForm({ ...entryForm, challengeId: e.target.value })}>
                {data.challenges.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <input className="input-field" value={entryForm.githubUrl} onChange={e => setEntryForm({ ...entryForm, githubUrl: e.target.value })} placeholder="GitHub repo URL" />
              <textarea className="input-field" rows={3} value={entryForm.description} onChange={e => setEntryForm({ ...entryForm, description: e.target.value })} placeholder="Describe your submission" />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-primary" onClick={() => void submitEntry()}>Submit</button>
                <button className="btn-ghost" onClick={() => setShowEntryForm(false)}>Cancel</button>
              </div>
            </div>
          )}
          {data.challenges.length === 0 && (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
              <Trophy size={36} style={{ color: "var(--text-muted)", margin: "0 auto 12px", opacity: 0.4 }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>No active challenges yet.</p>
            </div>
          )}
          {data.challenges.map(challenge => (
            <div key={challenge.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderLeft: `3px solid ${challenge.bannerColor ?? "#8b5cf6"}`, borderRadius: 16, padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 6 }}>{challenge.title}</h3>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", gap: 14 }}>
                    <span><Users size={11} style={{ display: "inline", marginRight: 4 }} />{challenge.entries.length} entries</span>
                    <span><Clock size={11} style={{ display: "inline", marginRight: 4 }} />Deadline: {new Date(challenge.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, fontFamily: "Outfit,sans-serif", color: challenge.bannerColor ?? "#8b5cf6" }}>{challenge.prize}</div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: `${challenge.bannerColor ?? "#8b5cf6"}18`, color: challenge.bannerColor ?? "#8b5cf6", border: `1px solid ${challenge.bannerColor ?? "#8b5cf6"}30` }}>{challenge.difficulty}</span>
                </div>
              </div>
              <button className="btn-primary" style={{ marginTop: 16, fontSize: "0.82rem" }} onClick={() => { setShowEntryForm(true); setEntryForm(c => ({ ...c, challengeId: challenge.id })); }}>
                Submit Entry <Award size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ══ LEADERBOARD TAB ═══════════════════════════════════════════ */}
      {activeTab === "Leaderboard" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
              <Trophy size={16} style={{ color: "#f59e0b" }} /> Top Contributors
            </h2>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Updates daily</span>
          </div>

          {/* Top 3 podium */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", padding: "20px 0" }}>
            {[leaderboard[1], leaderboard[0], leaderboard[2]].map((p, idx) => {
              const heights = ["80px", "100px", "70px"];
              const labels = ["2nd", "1st", "3rd"];
              const colors = ["#94a3b8", "#f59e0b", "#cd7f32"];
              return (
                <div key={p.rank} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <Avatar name={p.name} size={idx === 1 ? 52 : 42} color={`linear-gradient(135deg,${p.color},${p.color}80)`} />
                  <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>{p.name.split(" ")[0]}</span>
                  <div style={{ width: 64, height: heights[idx], background: `${colors[idx]}20`, border: `1px solid ${colors[idx]}40`, borderRadius: "8px 8px 0 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: colors[idx] }}>{labels[idx]}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full table */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 16, overflow: "hidden" }}>
            {leaderboard.map((p, i) => (
              <div
                key={p.rank}
                style={{
                  display: "flex", alignItems: "center", padding: "14px 20px", gap: 16,
                  borderBottom: i < leaderboard.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  background: p.name === "Demo Learner" ? "rgba(139,92,246,0.06)" : "transparent",
                }}
              >
                <div style={{ width: 28, fontWeight: 700, fontSize: "0.88rem", color: p.rank <= 3 ? "#f59e0b" : "var(--text-muted)", textAlign: "center" }}>#{p.rank}</div>
                <Avatar name={p.name} size={34} color={`linear-gradient(135deg,${p.color},${p.color}80)`} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{p.name}</div>
                </div>
                <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 700, color: "var(--accent-violet)", fontSize: "0.9rem" }}>{p.xp.toLocaleString()}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>XP</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{p.projects}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Projects</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{p.answered}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Answered</div>
                  </div>
                  <span style={{ fontSize: "1.3rem" }}>{p.badge}</span>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center" }}>
            <Star size={10} style={{ display: "inline", marginRight: 4 }} />
            Earn XP by completing projects, quizzes, and answering questions.
          </p>
        </div>
      )}
    </div>
  );
}
