import React from "react";

// ── GlowButton ────────────────────────────────────────────────────────────────
export function GlowButton({ children, onClick, gradient = "var(--grad1)", style = {}, disabled, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#333" : gradient,
        border: "none",
        borderRadius: 14,
        color: "#fff",
        fontFamily: "var(--font-body)",
        fontWeight: 700,
        fontSize: 15,
        padding: "14px 24px",
        cursor: disabled ? "not-allowed" : "pointer",
        width: "100%",
        letterSpacing: 0.5,
        boxShadow: disabled ? "none" : "0 4px 20px rgba(255,107,107,0.3)",
        transition: "all 0.2s",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 20,
      padding: 20,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── SectionTitle ──────────────────────────────────────────────────────────────
export function SectionTitle({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--text)", fontWeight: 700 }}>{title}</span>
      </div>
      {subtitle && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", margin: 0, paddingLeft: 32 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ── LoadingDots ───────────────────────────────────────────────────────────────
export function LoadingDots() {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center", padding: "10px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "var(--accent)",
          animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

// ── ImageUploader ─────────────────────────────────────────────────────────────
export function ImageUploader({ label, preview, onUpload, icon = "📸" }) {
  const ref = React.useRef();

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64Full = ev.target.result;
      const base64Data = base64Full.split(",")[1];
      const mediaType = file.type;
      onUpload(base64Full, base64Data, mediaType);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      onClick={() => ref.current.click()}
      style={{
        border: `2px dashed ${preview ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 18,
        minHeight: 180,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        background: preview ? "transparent" : "rgba(255,107,107,0.03)",
        overflow: "hidden",
        position: "relative",
        transition: "all 0.3s",
      }}
    >
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={handleChange} />
      {preview ? (
        <>
          <img src={preview} alt="upload" style={{ width: "100%", height: 220, objectFit: "cover" }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
            padding: "20px 12px 10px",
            fontFamily: "var(--font-body)", color: "#fff", fontSize: 12, textAlign: "center",
          }}>Tap to change photo</div>
        </>
      ) : (
        <>
          <span style={{ fontSize: 36, marginBottom: 10 }}>{icon}</span>
          <span style={{ fontFamily: "var(--font-body)", color: "var(--muted)", fontSize: 14 }}>{label}</span>
          <span style={{ fontFamily: "var(--font-body)", color: "var(--accent)", fontSize: 12, marginTop: 4 }}>Tap to upload</span>
        </>
      )}
    </div>
  );
}

// ── ResultCard ────────────────────────────────────────────────────────────────
export function ResultCard({ title, items, gradient, icon }) {
  return (
    <div style={{
      background: "var(--card)",
      borderRadius: 18,
      border: "1px solid var(--border)",
      overflow: "hidden",
      marginBottom: 12,
    }}>
      <div style={{ background: gradient, padding: "14px 18px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "#fff", fontWeight: 700 }}>{title}</span>
      </div>
      <div style={{ padding: "14px 18px" }}>
        {(items || []).map((item, i) => (
          <div key={i} style={{
            padding: "8px 0",
            borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none",
            fontFamily: "var(--font-body)", color: "var(--text)", fontSize: 14, lineHeight: 1.6,
          }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ErrorMessage ──────────────────────────────────────────────────────────────
export function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div style={{
      background: "rgba(255,107,107,0.1)",
      border: "1px solid rgba(255,107,107,0.3)",
      borderRadius: 12,
      padding: "12px 16px",
      fontFamily: "var(--font-body)",
      color: "var(--accent)",
      fontSize: 14,
      marginBottom: 12,
    }}>
      ⚠️ {message}
    </div>
  );
}
