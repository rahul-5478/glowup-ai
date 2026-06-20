import { useState, useRef, useCallback, useEffect } from "react";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 50%, #0a0a1a 100%)",
    padding: "24px 16px 80px",
    fontFamily: "'Segoe UI', sans-serif",
    color: "#fff",
  },
  header: {
    textAlign: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    background: "linear-gradient(90deg, #FF6B6B, #FF8E53, #FF6B6B)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },
  captureBox: {
    background: "rgba(255,255,255,0.04)",
    border: "1.5px dashed rgba(255,107,107,0.3)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    position: "relative",
    overflow: "hidden",
  },
  videoEl: {
    width: "100%",
    borderRadius: 14,
    maxHeight: 300,
    objectFit: "cover",
    background: "#111",
    display: "block",
  },
  previewImg: {
    width: "100%",
    borderRadius: 14,
    maxHeight: 300,
    objectFit: "cover",
    display: "block",
  },
  placeholderBox: {
    height: 200,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    cursor: "pointer",
  },
  placeholderIcon: {
    fontSize: 48,
    opacity: 0.4,
  },
  placeholderText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
  },
  btnRow: {
    display: "flex",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  },
  btn: (variant = "primary") => ({
    flex: 1,
    minWidth: 100,
    padding: "12px 16px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transition: "all 0.2s",
    background:
      variant === "primary"
        ? "linear-gradient(135deg, #FF6B6B, #FF8E53)"
        : variant === "secondary"
        ? "rgba(255,255,255,0.08)"
        : "rgba(255,107,107,0.15)",
    color: variant === "secondary" ? "rgba(255,255,255,0.8)" : "#fff",
    border: variant === "outline" ? "1px solid rgba(255,107,107,0.4)" : "none",
  }),
  analyzeBtn: {
    width: "100%",
    padding: "16px",
    borderRadius: 16,
    border: "none",
    background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 50%, #FF6B6B 100%)",
    backgroundSize: "200% auto",
    color: "#fff",
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
    letterSpacing: 0.5,
    marginBottom: 24,
    transition: "all 0.3s",
  },
  loadingCard: {
    background: "rgba(255,107,107,0.08)",
    border: "1px solid rgba(255,107,107,0.2)",
    borderRadius: 20,
    padding: 32,
    textAlign: "center",
    marginBottom: 20,
  },
  loadingSpinner: {
    width: 48,
    height: 48,
    border: "3px solid rgba(255,107,107,0.2)",
    borderTop: "3px solid #FF6B6B",
    borderRadius: "50%",
    margin: "0 auto 16px",
    animation: "spin 1s linear infinite",
  },
  scoreCard: {
    background: "linear-gradient(135deg, rgba(255,107,107,0.15), rgba(255,142,83,0.1))",
    border: "1px solid rgba(255,107,107,0.25)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: "50%",
    border: "4px solid #FF6B6B",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    background: "rgba(255,107,107,0.1)",
  },
  scoreNum: {
    fontSize: 30,
    fontWeight: 900,
    color: "#FF6B6B",
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tabRow: {
    display: "flex",
    gap: 6,
    marginBottom: 16,
    overflowX: "auto",
    paddingBottom: 4,
  },
  tab: (active) => ({
    padding: "8px 14px",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
    background: active
      ? "linear-gradient(135deg, #FF6B6B, #FF8E53)"
      : "rgba(255,255,255,0.06)",
    color: active ? "#fff" : "rgba(255,255,255,0.5)",
    transition: "all 0.2s",
  }),
  resultCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  issueHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  issueName: {
    fontSize: 15,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  badge: (severity) => ({
    fontSize: 10,
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 20,
    background:
      severity === "Low"
        ? "rgba(255,200,0,0.15)"
        : severity === "Moderate"
        ? "rgba(255,107,107,0.15)"
        : severity === "High"
        ? "rgba(255,50,50,0.18)"
        : "rgba(255,255,255,0.1)",
    color:
      severity === "Low"
        ? "#FFD700"
        : severity === "Moderate"
        ? "#FF6B6B"
        : severity === "High"
        ? "#FF3232"
        : "rgba(255,255,255,0.6)",
    border: `1px solid ${
      severity === "Low"
        ? "rgba(255,200,0,0.3)"
        : severity === "Moderate"
        ? "rgba(255,107,107,0.3)"
        : severity === "High"
        ? "rgba(255,50,50,0.3)"
        : "rgba(255,255,255,0.1)"
    }`,
  }),
  issueDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 1.6,
  },
  productCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productName: { fontSize: 14, fontWeight: 700, marginBottom: 3 },
  productBrand: { fontSize: 12, color: "rgba(255,255,255,0.4)" },
  productPrice: {
    fontSize: 15,
    fontWeight: 800,
    color: "#FF6B6B",
    whiteSpace: "nowrap",
  },
  faceShapeBox: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: 16,
    background: "rgba(255,107,107,0.08)",
    borderRadius: 14,
    marginBottom: 20,
    border: "1px solid rgba(255,107,107,0.2)",
  },
  faceShapeIcon: { fontSize: 40 },
  routineRow: {
    display: "flex",
    gap: 10,
    marginBottom: 12,
  },
  routineIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    flexShrink: 0,
  },
  routineText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 1.6,
  },
  errorBox: {
    background: "rgba(255,50,50,0.1)",
    border: "1px solid rgba(255,50,50,0.3)",
    borderRadius: 14,
    padding: 16,
    textAlign: "center",
    color: "#FF6B6B",
    fontSize: 14,
    marginBottom: 16,
  },
};

// ─── BACKEND URL ──────────────────────────────────────────────────────────────
const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:5000";

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function FaceAnalysis() {
  const [mode, setMode] = useState("idle"); // idle | camera | preview | loading | result | error
  const [imageBase64, setImageBase64] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("problems");
  const [error, setError] = useState("");
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState("user");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const openCamera = async () => {
    try {
      setError("");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(mediaStream);
      setMode("camera");
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      setError("Camera access denied. Please allow camera permission.");
    }
  };

  const switchCamera = async () => {
    stopCamera();
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: next },
      });
      setStream(mediaStream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
    } catch {}
  };

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const base64 = dataUrl.split(",")[1];

    stopCamera();
    setPreviewUrl(dataUrl);
    setImageBase64(base64);
    setMode("preview");
  }, [stream]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const base64 = dataUrl.split(",")[1];
      stopCamera();
      setPreviewUrl(dataUrl);
      setImageBase64(base64);
      setMode("preview");
    };
    reader.readAsDataURL(file);
  };

  // ── Analyze Face ─────────────────────────────────────────────────────────
  const analyzeFace = async () => {
    if (!imageBase64) return;
    setMode("loading");
    setError("");

    try {
      const token = localStorage.getItem("token"); // adjust if you store it differently

      const response = await fetch(`${BACKEND_URL}/api/face-analysis/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          imageBase64, // ⚠️ backend route reads req.body.imageBase64, not "image"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || "Analysis failed");
      }

      // ⚠️ backend sends { success: true, result: {...} } — not data.analysis
      setResult(data.result);
      setActiveTab("problems");
      setMode("result");
    } catch (err) {
      console.error("Face analysis error:", err);
      setError(err.message || "Analysis failed. Please try again.");
      setMode("error");
    }
  };

  const reset = () => {
    setMode("idle");
    setImageBase64(null);
    setPreviewUrl(null);
    setResult(null);
    setError("");
    stopCamera();
  };

  const faceShapeIcon = {
    oval: "🥚",
    round: "🔵",
    square: "⬛",
    heart: "🩷",
    oblong: "📏",
    diamond: "💎",
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .analyze-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .analyze-btn:active { transform: translateY(0); }
        .glow-btn:hover { opacity: 0.85; }
      `}</style>

      <div style={styles.header}>
        <div style={styles.title}>✨ AI Face Analysis</div>
        <div style={styles.subtitle}>Camera se ya gallery se photo lo — AI analyze karega</div>
      </div>

      {mode === "idle" && (
        <>
          <div style={styles.captureBox}>
            <div style={styles.placeholderBox} onClick={() => fileInputRef.current?.click()}>
              <div style={styles.placeholderIcon}>📸</div>
              <div style={styles.placeholderText}>Tap to upload a photo</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
                or use camera below
              </div>
            </div>
          </div>

          <div style={styles.btnRow}>
            <button style={styles.btn("primary")} onClick={openCamera} className="glow-btn">
              📷 Open Camera
            </button>
            <button
              style={styles.btn("secondary")}
              onClick={() => fileInputRef.current?.click()}
              className="glow-btn"
            >
              🖼️ Upload Photo
            </button>
          </div>
        </>
      )}

      {mode === "camera" && (
        <>
          <div style={styles.captureBox}>
            <video ref={videoRef} style={styles.videoEl} autoPlay playsInline muted />
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
          <div style={styles.btnRow}>
            <button style={styles.btn("primary")} onClick={capturePhoto} className="glow-btn">
              📸 Capture
            </button>
            <button style={styles.btn("secondary")} onClick={switchCamera} className="glow-btn">
              🔄 Flip
            </button>
            <button style={styles.btn("outline")} onClick={reset} className="glow-btn">
              ✕ Cancel
            </button>
          </div>
        </>
      )}

      {mode === "preview" && (
        <>
          <div style={styles.captureBox}>
            <img src={previewUrl} alt="preview" style={styles.previewImg} />
          </div>
          <button style={styles.analyzeBtn} onClick={analyzeFace} className="analyze-btn">
            🔍 Analyze My Face
          </button>
          <div style={styles.btnRow}>
            <button style={styles.btn("secondary")} onClick={openCamera} className="glow-btn">
              📷 Retake
            </button>
            <button
              style={styles.btn("secondary")}
              onClick={() => fileInputRef.current?.click()}
              className="glow-btn"
            >
              🖼️ New Photo
            </button>
          </div>
        </>
      )}

      {mode === "loading" && (
        <div style={styles.loadingCard}>
          <div style={styles.loadingSpinner} />
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
            Analyzing your face...
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
            Detecting face shape, skin issues,{"\n"}
            and preparing recommendations
          </div>
        </div>
      )}

      {mode === "error" && (
        <>
          <div style={styles.errorBox}>❌ {error}</div>
          <div style={styles.btnRow}>
            <button style={styles.btn("primary")} onClick={analyzeFace} className="glow-btn">
              🔄 Retry
            </button>
            <button style={styles.btn("secondary")} onClick={reset} className="glow-btn">
              ↩ Start Over
            </button>
          </div>
        </>
      )}

      {mode === "result" && result && (
        <>
          {/* Score Card */}
          <div style={styles.scoreCard}>
            <div style={styles.scoreCircle}>
              <div style={styles.scoreNum}>{result.skinScore}</div>
              <div style={styles.scoreLabel}>score</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>
              Skin Grade: <span style={{ color: "#FF6B6B" }}>{result.skinGrade}</span>
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
              {result.skinToneHex ? `Skin Tone: ${result.skinTone}` : ""}
            </div>
          </div>

          {/* Face Shape */}
          <div style={styles.faceShapeBox}>
            <div style={styles.faceShapeIcon}>
              {faceShapeIcon[result.faceShape?.toLowerCase()] || "💆"}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, textTransform: "capitalize" }}>
                {result.faceShape} Face Shape
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                {result.faceShapeDetails}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={styles.tabRow}>
            {[
              { key: "problems", label: "🔍 Skin Issues" },
              { key: "hairstyles", label: "💇 Hairstyles" },
              { key: "routine", label: "📅 Routine" },
              { key: "products", label: "🛍️ Products" },
            ].map((t) => (
              <button key={t.key} style={styles.tab(activeTab === t.key)} onClick={() => setActiveTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab: Problems */}
          {activeTab === "problems" &&
            result.detectedProblems?.map((p, i) => (
              <div key={i} style={styles.resultCard}>
                <div style={styles.issueHeader}>
                  <div style={styles.issueName}>{p.name}</div>
                  <span style={styles.badge(p.severity)}>{p.severity}</span>
                </div>
                <div style={styles.issueDesc}>{p.description}</div>
                {p.cause && (
                  <div style={{ ...styles.issueDesc, marginTop: 6, opacity: 0.7 }}>
                    Cause: {p.cause}
                  </div>
                )}
              </div>
            ))}

          {/* Tab: Hairstyles */}
          {activeTab === "hairstyles" &&
            result.topHairstyles?.map((h, i) => (
              <div key={i} style={styles.resultCard}>
                {h.imageUrl && (
                  <img
                    src={h.imageUrl}
                    alt={h.name}
                    style={{ width: "100%", borderRadius: 12, marginBottom: 10, maxHeight: 180, objectFit: "cover" }}
                  />
                )}
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{h.name}</div>
                <div style={styles.issueDesc}>{h.reason}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
                  Maintenance: {h.maintenance}
                </div>
              </div>
            ))}

          {/* Tab: Routine */}
          {activeTab === "routine" && (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#FFD700", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                ☀️ Morning Routine
              </div>
              {result.treatmentPlan?.morningRoutine?.map((s, i) => (
                <div key={i} style={styles.routineRow}>
                  <div style={styles.routineIcon}>{i + 1}</div>
                  <div style={styles.routineText}>{s}</div>
                </div>
              ))}

              <div style={{ fontSize: 13, fontWeight: 700, color: "#9B8FFF", margin: "16px 0 10px", textTransform: "uppercase", letterSpacing: 1 }}>
                🌙 Night Routine
              </div>
              {result.treatmentPlan?.nightRoutine?.map((s, i) => (
                <div key={i} style={styles.routineRow}>
                  <div style={{ ...styles.routineIcon, background: "linear-gradient(135deg, #9B8FFF, #6B6BFF)" }}>
                    {i + 1}
                  </div>
                  <div style={styles.routineText}>{s}</div>
                </div>
              ))}

              {result.treatmentPlan?.doNot?.length > 0 && (
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#FF6B6B", margin: "16px 0 10px", textTransform: "uppercase", letterSpacing: 1 }}>
                    🚫 Avoid
                  </div>
                  {result.treatmentPlan.doNot.map((d, i) => (
                    <div key={i} style={styles.routineRow}>
                      <div style={{ ...styles.routineIcon, background: "rgba(255,80,80,0.3)" }}>✕</div>
                      <div style={styles.routineText}>{d}</div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {/* Tab: Products */}
          {activeTab === "products" &&
            result.skincareProducts?.map((p, i) => (
              <div key={i} style={styles.productCard}>
                <div>
                  <div style={styles.productName}>{p.productName || p.type}</div>
                  <div style={styles.productBrand}>
                    {p.brand} · {p.type}
                  </div>
                </div>
                <div style={styles.productPrice}>{p.price}</div>
              </div>
            ))}

          <div style={{ marginTop: 24 }}>
            <button
              style={{ ...styles.btn("secondary"), width: "100%", padding: 14 }}
              onClick={reset}
              className="glow-btn"
            >
              🔄 Analyze Again
            </button>
          </div>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
    </div>
  );
}