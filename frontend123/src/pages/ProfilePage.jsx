import { useAuth } from "../hooks/useAuth";
import { SectionTitle } from "../components/UI";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const stats = [
    { label: "Face Analyses", value: user?.analyses?.filter(a => a.type === "face").length || 0, icon: "✨" },
    { label: "Fitness Plans", value: user?.analyses?.filter(a => a.type === "fitness").length || 0, icon: "💪" },
    { label: "Fashion Looks", value: user?.analyses?.filter(a => a.type === "fashion").length || 0, icon: "👗" },
  ];

  return (
    <div style={{ padding: "0 16px 100px" }} className="tab-content">
      <SectionTitle icon="👤" title="Profile" subtitle="Your GlowUp AI account" />

      {/* Avatar + Info */}
      <div style={{
        background: "linear-gradient(135deg,#1C1C28,#23233A)",
        borderRadius: 24, padding: 24, marginBottom: 16,
        border: "1px solid var(--border)", textAlign: "center",
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%", margin: "0 auto 14px",
          background: "var(--grad1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32,
          boxShadow: "0 4px 20px rgba(255,107,107,0.4)",
        }}>
          {user?.name?.[0]?.toUpperCase() || "G"}
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--text)", fontWeight: 700 }}>{user?.name}</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--muted)", marginTop: 4 }}>{user?.email}</div>
        <div style={{
          display: "inline-block", marginTop: 10,
          background: "rgba(255,107,107,0.15)", borderRadius: 20,
          padding: "4px 14px",
          fontFamily: "var(--font-body)", fontSize: 12, color: "var(--accent)",
        }}>✨ GlowUp Member</div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 16, padding: "16px 12px", textAlign: "center",
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 700, color: "var(--text)" }}>{s.value}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Profile Info */}
      {user?.profile && Object.values(user.profile).some(v => v) && (
        <div style={{ background: "var(--card)", borderRadius: 20, padding: 20, border: "1px solid var(--border)", marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--text)", fontWeight: 700, marginBottom: 14 }}>
            📊 Fitness Profile
          </div>
          {[
            { label: "Age", value: user.profile.age ? `${user.profile.age} years` : null },
            { label: "Weight", value: user.profile.weight ? `${user.profile.weight} ${user.profile.weightUnit || "kg"}` : null },
            { label: "Height", value: user.profile.height ? `${user.profile.height} cm` : null },
            { label: "Goal", value: user.profile.goal?.replace("_", " ") || null },
          ].filter(r => r.value).map((row, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: i < 3 ? "1px solid var(--border)" : "none",
            }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--muted)" }}>{row.label}</span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text)", fontWeight: 600, textTransform: "capitalize" }}>{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Logout */}
      <button
        onClick={logout}
        style={{
          width: "100%", padding: 16, border: "1px solid rgba(255,107,107,0.3)",
          borderRadius: 14, background: "rgba(255,107,107,0.08)",
          color: "var(--accent)", fontFamily: "var(--font-body)", fontWeight: 700,
          fontSize: 15, cursor: "pointer", transition: "all 0.2s",
        }}
      >
        🚪 Sign Out
      </button>
    </div>
  );
}
