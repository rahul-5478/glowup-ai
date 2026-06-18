import { useState } from "react";
import { useTheme } from "../hooks/useTheme";
import { useLang, translations } from "../hooks/useLanguage";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../hooks/useAuth";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { lang, t, changeLang } = useLang();
  const { notifications, toggle, requestPermission } = useNotifications();
  const { user, logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  const languages = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "hi", label: "हिंदी", flag: "🇮🇳" },
    { code: "pa", label: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
    { code: "ur", label: "اردو", flag: "🇵🇰" },
  ];

  const Toggle = ({ value, onToggle }) => (
    <div onClick={onToggle} style={{
      width: 50, height: 28, borderRadius: 14, cursor: "pointer",
      background: value ? "linear-gradient(135deg,#FF4D6D,#C77DFF)" : "var(--border)",
      position: "relative", transition: "background 0.3s",
      boxShadow: value ? "0 2px 12px rgba(255,77,109,0.35)" : "none",
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: "50%", background: "#fff",
        position: "absolute", top: 3,
        left: value ? 25 : 3,
        transition: "left 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }} />
    </div>
  );

  const Section = ({ children, title }) => (
    <div style={{ background: "var(--card)", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 14 }}>
      {title && (
        <div style={{ padding: "12px 18px 10px", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-body)", fontSize: 10, color: "var(--muted)", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );

  const Row = ({ icon, label, sub, right, onClick, danger }) => (
    <div onClick={onClick} style={{
      padding: "15px 18px", display: "flex", alignItems: "center", gap: 14,
      cursor: onClick ? "pointer" : "default",
      borderBottom: "1px solid var(--border)",
      transition: "background 0.15s",
    }}
      onMouseEnter={e => onClick && (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ width: 40, height: 40, borderRadius: 12, background: danger ? "rgba(255,77,109,0.1)" : "rgba(255,255,255,0.05)", border: `1px solid ${danger ? "rgba(255,77,109,0.2)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: danger ? "#FF4D6D" : "var(--text)" }}>{label}</div>
        {sub && <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );

  return (
    <div style={{ padding: "0 16px 100px" }} className="tab-content">

      {/* Header */}
      <div style={{ marginBottom: 20, paddingTop: 4 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: -0.5 }}>
          ⚙️ Settings
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", marginTop: 3 }}>
          Customize your GlowUp experience
        </div>
      </div>

      {/* Account Card */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,77,109,0.08), rgba(199,125,255,0.08))",
        border: "1px solid rgba(199,125,255,0.2)",
        borderRadius: 22, padding: "18px 18px", marginBottom: 14,
        display: "flex", alignItems: "center", gap: 14,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: "radial-gradient(circle, rgba(199,125,255,0.1), transparent 70%)", pointerEvents: "none" }} />
        <div style={{
          width: 54, height: 54, borderRadius: 16,
          background: "linear-gradient(135deg, #FF4D6D, #C77DFF)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, fontWeight: 800, color: "#fff",
          fontFamily: "var(--font-display)",
          boxShadow: "0 6px 20px rgba(255,77,109,0.3)",
          flexShrink: 0,
        }}>
          {user?.name?.charAt(0)?.toUpperCase() || "G"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text)", fontWeight: 700 }}>
            {user?.name || "User"}
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
            {user?.email || ""}
          </div>
          <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.2)", borderRadius: 20, padding: "3px 10px" }}>
            <span style={{ fontSize: 10 }}>✨</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "#FF4D6D", fontWeight: 700 }}>GlowUp Member</span>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <Section title="Appearance">
        <Row
          icon={theme === "dark" ? "🌙" : "☀️"}
          label={theme === "dark" ? "Dark Mode" : "Light Mode"}
          sub={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          right={<Toggle value={theme === "dark"} onToggle={toggleTheme} />}
        />
        <div style={{ padding: 0, borderBottom: "none" }}>
          <div style={{ padding: "14px 18px", display: "flex", gap: 6 }}>
            {["Dark", "Amoled", "Light"].map((t, i) => (
              <div key={t} style={{
                flex: 1, padding: "10px 6px", borderRadius: 12, cursor: "pointer", textAlign: "center",
                background: (i === 0 && theme === "dark") ? "rgba(199,125,255,0.12)" : "var(--surface)",
                border: `1.5px solid ${(i === 0 && theme === "dark") ? "#C77DFF" : "var(--border)"}`,
              }}>
                <div style={{ fontSize: 16, marginBottom: 3 }}>{i === 0 ? "🌙" : i === 1 ? "⚫" : "☀️"}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>{t}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Language */}
      <Section title="Language">
        <div style={{ padding: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {languages.map(l => (
              <div key={l.code} onClick={() => changeLang(l.code)} style={{
                padding: "12px 14px", borderRadius: 14, cursor: "pointer",
                background: lang === l.code ? "rgba(255,77,109,0.1)" : "var(--surface)",
                border: `1.5px solid ${lang === l.code ? "#FF4D6D" : "var(--border)"}`,
                display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s",
              }}>
                <span style={{ fontSize: 22 }}>{l.flag}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: lang === l.code ? "#FF4D6D" : "var(--text)" }}>{l.label}</span>
                {lang === l.code && <span style={{ marginLeft: "auto", color: "#FF4D6D", fontSize: 14 }}>✓</span>}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        {!notifications.permission && (
          <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
            <button onClick={requestPermission} style={{
              width: "100%", padding: "12px", border: "none", borderRadius: 12,
              background: "linear-gradient(135deg,#FF4D6D,#C77DFF)", color: "#fff",
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>🔔 Enable Push Notifications</button>
          </div>
        )}
        {[
          { key: "workout", icon: "💪", label: "Workout Reminder", sub: "Daily at 8:00 AM" },
          { key: "water", icon: "💧", label: "Water Reminder", sub: "Every 2 hours" },
          { key: "progress", icon: "📊", label: "Weekly Progress Report", sub: "Every Sunday" },
        ].map((item, i, arr) => (
          <div key={item.key} style={{
            padding: "14px 18px",
            borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text)", fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>{item.sub}</div>
              </div>
            </div>
            <Toggle value={notifications[item.key]} onToggle={() => toggle(item.key)} />
          </div>
        ))}
      </Section>

      {/* App Info — GEMINI branding */}
      <div style={{
        background: "linear-gradient(135deg, #0D0A1E, #0A1628)",
        border: "1px solid rgba(199,125,255,0.15)",
        borderRadius: 20, padding: "20px 18px", marginBottom: 14,
        display: "flex", alignItems: "center", gap: 16, position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -15, right: -5, width: 80, height: 80, background: "radial-gradient(circle, rgba(199,125,255,0.12), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ width: 50, height: 50, borderRadius: 16, background: "linear-gradient(135deg, #FF4D6D, #C77DFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, boxShadow: "0 6px 20px rgba(255,77,109,0.3)" }}>✨</div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "#fff", fontWeight: 800 }}>GlowUp AI</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
            Version 2.1.0 · Powered by{" "}
            <span style={{ background: "linear-gradient(90deg,#4285F4,#EA4335,#FBBC05,#34A853)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 700 }}>
              Gemini AI
            </span>
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>Made with ❤️ for your GlowUp journey</div>
        </div>
      </div>

      {/* Logout */}
      <Section title="Session">
        {!showConfirm ? (
          <div onClick={() => setShowConfirm(true)} style={{
            padding: "15px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🚪</div>
            <div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "#FF4D6D" }}>Sign Out</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>Sign out from your account</div>
            </div>
          </div>
        ) : (
          <div style={{ padding: "16px 18px" }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text)", marginBottom: 14, textAlign: "center" }}>Logout karna chahte ho? 🤔</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: "12px", border: "1.5px solid var(--border)", borderRadius: 12, background: "transparent", color: "var(--muted)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Cancel</button>
              <button onClick={logout} style={{ flex: 1, padding: "12px", border: "none", borderRadius: 12, background: "linear-gradient(135deg,#FF4D6D,#FF4444)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(255,77,109,0.35)" }}>🚪 Logout</button>
            </div>
          </div>
        )}
      </Section>

    </div>
  );
}