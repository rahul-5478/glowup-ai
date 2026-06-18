import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login, register } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Email and password are required!");
      triggerShake();
      return;
    }
    if (mode === "register" && !form.name) {
      setError("Please enter your name!");
      triggerShake();
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        (mode === "login"
          ? "Incorrect email or password."
          : "Could not create account. Try again.")
      );
      triggerShake();
    }
    setLoading(false);
  };

  const switchMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError("");
    setForm({ name: "", email: "", password: "" });
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1.5px solid var(--border2)",
    borderRadius: 14,
    padding: "13px 16px",
    color: "var(--text)",
    fontFamily: "var(--font-body)",
    fontSize: 15,
    outline: "none",
    marginBottom: 11,
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  };

  return (
    <div
      className="mesh-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow blobs */}
      <div style={{ position: "absolute", top: -120, left: -80, width: 320, height: 320, borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(circle, rgba(255,77,109,0.12) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: -120, right: -80, width: 320, height: 320, borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(circle, rgba(67,97,238,0.1) 0%, transparent 70%)" }} />

      <div style={{
        width: "100%", maxWidth: 390,
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0px)" : "translateY(20px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 68, height: 68, borderRadius: 20,
            background: "var(--grad1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, margin: "0 auto 14px",
            boxShadow: "0 8px 28px rgba(255,77,109,0.35)",
            animation: "glowPulse 2.5s ease-in-out infinite",
          }}>✨</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800, lineHeight: 1, letterSpacing: -0.5 }}>
            Glow<span className="text-gradient-1">Up</span>
            <span className="text-gradient-2"> AI</span>
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
            Your AI beauty & fitness coach
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--card)",
          borderRadius: 24, padding: "26px 22px",
          border: "1px solid var(--border2)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          animation: shake ? "shakeX 0.4s ease" : "none",
        }}>

          {/* Tabs */}
          <div className="tab-bar" style={{ marginBottom: 22 }}>
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); setForm({ name: "", email: "", password: "" }); }}
                className={`tab-btn ${mode === m ? "active" : ""}`}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, color: "var(--text)" }}>
              {mode === "login" ? "Welcome back! 👋" : "Create your account ✨"}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
              {mode === "login"
                ? "Sign in and continue your glow journey"
                : "Join free and start glowing with AI"}
            </div>
          </div>

          {/* Inputs */}
          {mode === "register" && (
            <input
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border2)"; e.target.style.boxShadow = "none"; }}
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--border2)"; e.target.style.boxShadow = "none"; }}
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            style={{ ...inputStyle, marginBottom: 0 }}
            onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--border2)"; e.target.style.boxShadow = "none"; }}
          />

          {/* Error */}
          {error && (
            <div style={{
              marginTop: 10, padding: "10px 14px",
              background: "rgba(255,77,109,0.1)",
              border: "1px solid rgba(255,77,109,0.3)",
              borderRadius: 11,
              fontFamily: "var(--font-body)", fontSize: 13, color: "var(--accent)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
            style={{ marginTop: 16 }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span style={{
                  width: 16, height: 16,
                  border: "2.5px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.75s linear infinite",
                }} />
                {mode === "login" ? "Signing in..." : "Creating account..."}
              </span>
            ) : (
              mode === "login" ? "✨ Sign In" : "🚀 Create Account"
            )}
          </button>

          {/* Switch */}
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)" }}>
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            </span>
            <span
              onClick={switchMode}
              style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--accent)", fontWeight: 700, cursor: "pointer" }}
            >
              {mode === "login" ? "Sign Up" : "Sign In"}
            </span>
          </div>
        </div>

        {/* Feature chips */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 22 }}>
          {[["✨", "Face AI"], ["💪", "Fitness"], ["👗", "Fashion"], ["🧴", "Skin"]].map(([icon, label]) => (
            <div key={label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: "5px 12px", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 13 }}>{icon}</span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shakeX {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}