import { useState, useRef, useCallback } from "react";

// ─── Subscription Check ───────────────────────────────────────────────────────
const hasPro = () => localStorage.getItem("glowup_skin_pro") === "true";
const setPro = () => localStorage.setItem("glowup_skin_pro", "true");

// ─── Dermiq Skin Analyzer — Canvas real metrics ───────────────────────────
const analyzeSkinWithDermiq = (imageBase64) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const w = img.width, h = img.height;
      // Sample face center region
      const x1 = Math.floor(w * 0.25), y1 = Math.floor(h * 0.15);
      const sw = Math.floor(w * 0.5), sh = Math.floor(h * 0.6);
      const data = ctx.getImageData(x1, y1, sw, sh).data;

      let r = 0, g = 0, b = 0, count = 0;
      let darkPixels = 0, redPixels = 0, brightPixels = 0, unevenPixels = 0;
      const pixelCount = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        const pr = data[i], pg = data[i+1], pb = data[i+2];
        r += pr; g += pg; b += pb; count++;
        const brightness = (pr * 0.299 + pg * 0.587 + pb * 0.114);
        if (brightness < 80) darkPixels++;
        if (pr > 160 && pg < 120 && pb < 120) redPixels++;
        if (brightness > 210) brightPixels++;
        const variation = Math.abs(pr - pg) + Math.abs(pg - pb);
        if (variation > 40) unevenPixels++;
      }

      r = r / count; g = g / count; b = b / count;
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114);

      // Skin tone
      const skinTone = brightness > 180 ? "fair" : brightness > 130 ? "medium" : brightness > 90 ? "wheatish" : "dark";

      // Metrics (0–100)
      const acneScore = Math.min(100, Math.round((redPixels / pixelCount) * 800));
      const darkSpotScore = Math.min(100, Math.round((darkPixels / pixelCount) * 400));
      const oilinessScore = Math.min(100, Math.round((brightPixels / pixelCount) * 500));
      const unevenScore = Math.min(100, Math.round((unevenPixels / pixelCount) * 300));
      const poreScore = Math.min(100, Math.round(unevenScore * 0.7 + acneScore * 0.3));

      // Overall skin score
      const skinScore = Math.max(20, Math.min(99,
        100 - Math.round(acneScore * 0.3 + darkSpotScore * 0.2 + oilinessScore * 0.2 + unevenScore * 0.15 + poreScore * 0.15)
      ));

      const grade = skinScore >= 80 ? "A" : skinScore >= 65 ? "B" : skinScore >= 50 ? "C" : "D";

      resolve({
        skinTone, skinScore, grade,
        metrics: {
          acne: acneScore,
          darkSpots: darkSpotScore,
          oiliness: oilinessScore,
          uneven: unevenScore,
          pores: poreScore,
        },
        avgColor: { r: Math.round(r), g: Math.round(g), b: Math.round(b) },
      });
    };
    img.onerror = () => resolve({ skinTone: "medium", skinScore: 65, grade: "B", metrics: { acne: 30, darkSpots: 25, oiliness: 40, uneven: 35, pores: 30 }, avgColor: { r: 180, g: 150, b: 130 } });
    img.src = `data:image/jpeg;base64,${imageBase64}`;
  });
};

// ─── AI Analysis via Backend Gemini API ─────────────────────────────────────
const getAIAnalysis = async (dermiqData, imageBase64) => {
  const token = localStorage.getItem("glowup_token");
  const apiUrl = import.meta.env.VITE_API_URL || "";

  const response = await fetch(`${apiUrl}/api/skin/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ imageBase64 }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Skin analysis failed");
  }

  const data = await response.json();
  return data.result;
};


// ─── Grade Config ─────────────────────────────────────────────────────────────
const GRADE_CONFIG = {
  A: { color: "#4ade80", label: "Excellent", emoji: "✨", msg: "Your skin is very healthy!" },
  B: { color: "#60a5fa", label: "Good", emoji: "👍", msg: "A little care can make it even better" },
  C: { color: "#facc15", label: "Fair", emoji: "⚠️", msg: "Start a regular routine now" },
  D: { color: "#f87171", label: "Needs Care", emoji: "🔴", msg: "Needs immediate attention" },
};

const METRIC_LABELS = {
  acne: { label: "Acne / Pimples", icon: "🔴", good: "low" },
  darkSpots: { label: "Dark Spots", icon: "🟤", good: "low" },
  oiliness: { label: "Oiliness", icon: "💧", good: "low" },
  uneven: { label: "Uneven Texture", icon: "🌊", good: "low" },
  pores: { label: "Pore Visibility", icon: "🔬", good: "low" },
};

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, grade }) {
  const cfg = GRADE_CONFIG[grade] || GRADE_CONFIG["B"];
  const r = 52, c = 2 * Math.PI * r, fill = (score / 100) * c;
  return (
    <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto" }}>
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={cfg.color} strokeWidth="10"
          strokeDasharray={`${fill} ${c - fill}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${cfg.color}80)` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: cfg.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2, letterSpacing: 2 }}>SKIN SCORE</div>
        <div style={{ marginTop: 6, background: `${cfg.color}18`, border: `1px solid ${cfg.color}40`, borderRadius: 20, padding: "2px 10px", fontSize: 11, color: cfg.color, fontWeight: 700 }}>
          {cfg.emoji} {cfg.label}
        </div>
      </div>
    </div>
  );
}

// ─── Subscription Paywall ─────────────────────────────────────────────────────
function PaywallModal({ onSubscribe, onClose }) {
  const [paying, setPaying] = useState(false);

  const handlePay = () => {
    setPaying(true);
    // Simulate payment — integrate Razorpay for real payments
    setTimeout(() => {
      setPro();
      setPaying(false);
      onSubscribe();
    }, 1500);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: "24px 24px 0 0", padding: 28, width: "100%", maxWidth: 430, border: "1px solid rgba(248,113,113,0.2)" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🧴</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
            Unlock Skin Pro
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
            For AI detailed analysis, home remedies & personalized skincare plan
          </div>
        </div>

        {/* Features */}
        {[
          { icon: "🔬", text: "Dermiq AI full skin scan — acne, pores, dark spots" },
          { icon: "🧴", text: "Indian products with exact prices — Nykaa, Amazon" },
          { icon: "🌿", text: "3 home remedies — natural DIY treatment" },
          { icon: "📅", text: "4-week personalized skincare plan" },
          { icon: "🥗", text: "Diet tips for glowing skin" },
          { icon: "♾️", text: "Unlimited scans — kabhi bhi" },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 0", borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{f.text}</div>
          </div>
        ))}

        {/* Price */}
        <div style={{ marginTop: 20, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 16, padding: 16, textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Only</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 900, color: "#f87171" }}>₹20
            <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.4)" }}>/month</span>
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Cancel anytime · No hidden charges</div>
        </div>

        <button onClick={handlePay} disabled={paying}
          style={{ width: "100%", padding: "16px", border: "none", borderRadius: 16, background: "linear-gradient(135deg, #f87171, #fb923c)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 800, cursor: paying ? "not-allowed" : "pointer", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {paying ? (
            <>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.75s linear infinite" }} />
              Processing...
            </>
          ) : "🔓 Subscribe for ₹20/month"}
        </button>

        <button onClick={onClose}
          style={{ width: "100%", padding: "12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, background: "transparent", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)", fontSize: 13, cursor: "pointer" }}>
          Later
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SkinAnalysis() {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [dermiqData, setDermiqData] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPro, setIsPro] = useState(hasPro());
  const [camMode, setCamMode] = useState(false);
  const [camActive, setCamActive] = useState(false);
  const [camError, setCamError] = useState("");
  const [expandedRemedy, setExpandedRemedy] = useState(null);
  const [expandedWeek, setExpandedWeek] = useState("week1");

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // ─── Camera ────────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamActive(true);
    } catch (e) {
      setCamError("Camera permission denied.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCamActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    stopCamera();
    setCamMode(false);
    setImageBase64(dataUrl.split(",")[1]);
    setImagePreview(dataUrl);
    setDermiqData(null);
    setAiResult(null);
  }, [stopCamera]);

  const handleGallery = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        setImageBase64(dataUrl.split(",")[1]);
        setImagePreview(dataUrl);
        setDermiqData(null);
        setAiResult(null);
        setCamMode(false);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // ─── Analyze ──────────────────────────────────────────────────────────────
  const analyze = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setError("");
    setDermiqData(null);
    setAiResult(null);

    try {
      // Step 1: Dermiq scan
      setLoadingStep("🔬 Dermiq AI scanning your skin metrics...");
      const dermiq = await analyzeSkinWithDermiq(imageBase64);
      setDermiqData(dermiq);

      // Step 2: Check subscription for AI analysis
      if (!isPro) {
        setLoading(false);
        setLoadingStep("");
        setShowPaywall(true);
        return;
      }

      // Step 3: AI analysis
      setLoadingStep("🤖 AI performing detailed analysis...");
      const ai = await getAIAnalysis(dermiq);
      setAiResult(ai);
      setActiveTab("overview");

      const prev = parseInt(localStorage.getItem("glowup_skin_count") || "0");
      localStorage.setItem("glowup_skin_count", prev + 1);

    } catch (err) {
      setError("Analysis failed. Please try again.");
      console.error(err);
    }

    setLoading(false);
    setLoadingStep("");
  };

  const handleSubscribe = async () => {
    setIsPro(true);
    setShowPaywall(false);
    // Continue with AI analysis after subscribe
    if (dermiqData) {
      setLoading(true);
      setLoadingStep("🤖 AI performing detailed analysis...");
      try {
        const ai = await getAIAnalysis(dermiqData);
        setAiResult(ai);
        setActiveTab("overview");
      } catch (e) {
        setError("AI analysis failed.");
      }
      setLoading(false);
      setLoadingStep("");
    }
  };

  const cfg = dermiqData ? GRADE_CONFIG[dermiqData.grade] : null;

  const TABS = [
    { id: "overview", icon: "🏠", label: "Overview" },
    { id: "routine", icon: "🧴", label: "Routine" },
    { id: "remedies", icon: "🌿", label: "Remedies" },
    { id: "plan", icon: "📅", label: "4-Week" },
    { id: "diet", icon: "🥗", label: "Diet" },
  ];

  const SKIN_TONE_LABELS = { fair: "🌸 Fair", medium: "🌻 Medium", wheatish: "🌾 Wheatish", dark: "🌟 Dark" };

  return (
    <div style={{ padding: "0 16px 100px" }}>

      {/* Paywall */}
      {showPaywall && (
        <PaywallModal
          onSubscribe={handleSubscribe}
          onClose={() => setShowPaywall(false)}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#f0f0ff", fontFamily: "var(--font-display)" }}>
              Skin{" "}
              <span style={{ background: "linear-gradient(135deg,#f87171,#fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Analyzer
              </span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              Dermiq AI scan · Products · Home Remedies · 4-Week Plan
            </div>
          </div>
          {isPro ? (
            <div style={{ padding: "5px 12px", borderRadius: 20, background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", fontSize: 11, fontWeight: 700, color: "#f87171" }}>
              ✅ PRO
            </div>
          ) : (
            <div onClick={() => setShowPaywall(true)}
              style={{ padding: "5px 12px", borderRadius: 20, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", fontSize: 11, fontWeight: 700, color: "#f87171", cursor: "pointer" }}>
              ₹20/mo 👑
            </div>
          )}
        </div>
      </div>

      {/* Camera Mode */}
      {camMode && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", background: "#000", minHeight: 280 }}>
            <video ref={videoRef} autoPlay playsInline muted
              style={{ width: "100%", maxHeight: 360, objectFit: "cover", display: "block" }} />
            {!camActive && !camError && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: "rgba(0,0,0,0.85)" }}>
                <div style={{ fontSize: 32 }}>📸</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#fff" }}>Starting camera...</div>
              </div>
            )}
            {camActive && (
              <>
                {/* Dermiq scan overlay */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                  <div style={{ position: "absolute", top: "20%", left: "25%", right: "25%", bottom: "15%", border: "2px solid rgba(248,113,113,0.6)", borderRadius: 100, boxShadow: "0 0 20px rgba(248,113,113,0.2)" }} />
                  <div style={{ position: "absolute", top: "20%", left: "25%", width: 20, height: 20, borderTop: "3px solid #f87171", borderLeft: "3px solid #f87171", borderRadius: "4px 0 0 0" }} />
                  <div style={{ position: "absolute", top: "20%", right: "25%", width: 20, height: 20, borderTop: "3px solid #f87171", borderRight: "3px solid #f87171", borderRadius: "0 4px 0 0" }} />
                  <div style={{ position: "absolute", bottom: "15%", left: "25%", width: 20, height: 20, borderBottom: "3px solid #f87171", borderLeft: "3px solid #f87171", borderRadius: "0 0 0 4px" }} />
                  <div style={{ position: "absolute", bottom: "15%", right: "25%", width: 20, height: 20, borderBottom: "3px solid #f87171", borderRight: "3px solid #f87171", borderRadius: "0 0 4px 0" }} />
                </div>
                <div style={{ position: "absolute", top: 12, left: 12, padding: "5px 12px", borderRadius: 20, background: "rgba(248,113,113,0.85)", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "#fff" }}>
                  🔬 Dermiq AI Ready
                </div>
                <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, padding: "8px 14px", background: "rgba(0,0,0,0.75)", borderRadius: 12, fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.8)", textAlign: "center" }}>
                  😊 Keep face inside frame — in good lighting
                </div>
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            {camActive && (
              <button onClick={capturePhoto}
                style={{ flex: 1, padding: "13px", border: "none", borderRadius: 14, background: "linear-gradient(135deg,#f87171,#fb923c)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                📸 Capture for Scan
              </button>
            )}
            <button onClick={() => { stopCamera(); setCamMode(false); }}
              style={{ padding: "13px 18px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, background: "transparent", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body)", fontSize: 13, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
          {camError && (
            <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 12, fontFamily: "var(--font-body)", fontSize: 13, color: "#f87171", textAlign: "center" }}>
              ⚠️ {camError}
            </div>
          )}
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && !camMode && (
        <div style={{ position: "relative", marginBottom: 14, borderRadius: 20, overflow: "hidden" }}>
          <img src={imagePreview} alt="skin" style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)" }} />
          <div style={{ position: "absolute", bottom: 12, left: 14, right: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "#fff" }}>✅ Photo ready for Dermiq scan</div>
            <button onClick={() => { setImageBase64(null); setImagePreview(null); setDermiqData(null); setAiResult(null); }}
              style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(0,0,0,0.4)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 12, cursor: "pointer" }}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!imagePreview && !camMode && (
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1.5px dashed rgba(248,113,113,0.2)", borderRadius: 20, marginBottom: 16, minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", padding: 24 }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>🔬</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "#f0f0ff", marginBottom: 6 }}>Dermiq Skin Scan</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>
              Take a live scan or upload from gallery<br />
              AI detects skin tone, acne, dark spots & pores
            </div>
          </div>
        </div>
      )}

      {/* Buttons */}
      {!camMode && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <button onClick={() => { setCamMode(true); setImageBase64(null); setImagePreview(null); startCamera(); }}
            style={{ padding: "13px 10px", border: "none", borderRadius: 14, background: "linear-gradient(135deg,#f87171,#fb923c)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            🔴 Live Camera
          </button>
          <button onClick={handleGallery}
            style={{ padding: "13px 10px", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 14, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.65)", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            🖼️ Gallery
          </button>
        </div>
      )}

      {/* Analyze Button */}
      {imageBase64 && !loading && !camMode && (
        <button onClick={analyze}
          style={{ width: "100%", padding: "16px", border: "none", borderRadius: 16, background: "linear-gradient(135deg,#f87171,#fb923c)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", marginBottom: 16, boxShadow: "0 8px 24px rgba(248,113,113,0.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          🔬 Analyze with Dermiq AI
        </button>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 28, textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔬</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700, color: "#f0f0ff", marginBottom: 8 }}>
            {loadingStep || "Analyzing..."}
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 6, justifyContent: "center" }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171", animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 14, padding: 14, marginBottom: 16, fontFamily: "var(--font-body)", fontSize: 13, color: "#f87171" }}>
          ⚠️ {error}
        </div>
      )}

      {/* ─── Dermiq Results ─────────────────────────────────────────────────── */}
      {dermiqData && (
        <div>
          {/* Score Card */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 24, marginBottom: 16 }}>
            <ScoreRing score={dermiqData.skinScore} grade={dermiqData.grade} />

            {/* Dermiq badge */}
            <div style={{ margin: "14px auto 0", width: "fit-content", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 20, padding: "5px 14px", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>🔬</span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#f87171", fontWeight: 700 }}>
                Dermiq AI Scan Complete · {SKIN_TONE_LABELS[dermiqData.skinTone]}
              </span>
            </div>

            {/* Grade message */}
            <div style={{ marginTop: 14, padding: "10px 14px", background: `${cfg?.color}10`, borderRadius: 12, textAlign: "center", fontFamily: "var(--font-body)", fontSize: 13, color: cfg?.color, fontWeight: 600 }}>
              {cfg?.msg}
            </div>

            {/* Metrics */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 12, letterSpacing: 1 }}>
                DERMIQ METRICS
              </div>
              {Object.entries(dermiqData.metrics).map(([key, val]) => {
                const m = METRIC_LABELS[key];
                const barColor = val < 30 ? "#4ade80" : val < 60 ? "#facc15" : "#f87171";
                return (
                  <div key={key} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                        {m?.icon} {m?.label}
                      </div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: barColor, fontWeight: 700 }}>
                        {val}/100
                      </div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 6, overflow: "hidden" }}>
                      <div style={{ width: `${val}%`, height: "100%", background: barColor, borderRadius: 6, transition: "width 1s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pro locked message if not subscribed */}
          {!isPro && !aiResult && (
            <div onClick={() => setShowPaywall(true)}
              style={{ background: "linear-gradient(135deg, rgba(248,113,113,0.1), rgba(251,146,60,0.1))", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 20, padding: 20, marginBottom: 16, cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: "#f87171", marginBottom: 6 }}>
                Unlock Full Analysis
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>
                Products · Home Remedies · 4-Week Plan · Diet Tips
              </div>
              <div style={{ display: "inline-block", padding: "10px 24px", borderRadius: 14, background: "linear-gradient(135deg,#f87171,#fb923c)", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "#fff" }}>
                Subscribe for ₹20/month 👑
              </div>
            </div>
          )}

          {/* AI Results */}
          {aiResult && (
            <div>
              {/* Skin Type + Dermat Note */}
              <div style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)", borderRadius: 16, padding: 16, marginBottom: 14 }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#60a5fa", fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>
                  👨‍⚕️ AI DERMATOLOGIST ANALYSIS
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "#f0f0ff", marginBottom: 6 }}>
                  {aiResult.skinType?.toUpperCase()} SKIN
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, fontStyle: "italic" }}>
                  "{aiResult.dermatologistNote}"
                </div>
                {aiResult.mainProblems?.length > 0 && (
                  <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {aiResult.mainProblems.map((p, i) => (
                      <div key={i} style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", fontFamily: "var(--font-body)", fontSize: 11, color: "#f87171" }}>
                        🎯 {p}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", overflowX: "auto", gap: 6, marginBottom: 16, paddingBottom: 4 }}>
                {TABS.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    style={{ flexShrink: 0, padding: "8px 14px", border: "1px solid", borderColor: activeTab === tab.id ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.07)", borderRadius: 12, background: activeTab === tab.id ? "rgba(248,113,113,0.1)" : "rgba(255,255,255,0.03)", color: activeTab === tab.id ? "#f87171" : "rgba(255,255,255,0.45)", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <div>
                  {aiResult.estimatedImprovement && (
                    <div style={{ background: "rgba(251,146,60,0.06)", border: "1px solid rgba(251,146,60,0.15)", borderRadius: 14, padding: 14, marginBottom: 14 }}>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#fb923c", fontWeight: 700, marginBottom: 4 }}>⏱ EXPECTED IMPROVEMENT</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(251,146,60,0.8)" }}>{aiResult.estimatedImprovement}</div>
                    </div>
                  )}
                  {aiResult.avoid?.length > 0 && (
                    <div style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 14, padding: 14 }}>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#f87171", fontWeight: 700, marginBottom: 8 }}>❌ AVOID THESE</div>
                      {aiResult.avoid.map((a, i) => (
                        <div key={i} style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(248,113,113,0.7)", padding: "3px 0" }}>• {a}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ROUTINE TAB */}
              {activeTab === "routine" && (
                <div>
                  {/* Morning */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#facc15", fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>☀️ MORNING ROUTINE</div>
                    {aiResult.morningRoutine?.map((step, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 14, marginBottom: 10 }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(250,204,21,0.1)", border: "1px solid rgba(250,204,21,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: "#facc15", flexShrink: 0 }}>
                            {step.step}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "#f0f0ff" }}>{step.product}</div>
                            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                              {step.brand} · <span style={{ color: "#4ade80" }}>{step.price}</span>
                            </div>
                            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 6, lineHeight: 1.5 }}>
                              <span style={{ color: "#60a5fa" }}>How: </span>{step.howTo}
                            </div>
                            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4, lineHeight: 1.5 }}>
                              <span style={{ color: "#a78bfa" }}>Why: </span>{step.why}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Night */}
                  <div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#818cf8", fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>🌙 NIGHT ROUTINE</div>
                    {aiResult.nightRoutine?.map((step, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 14, marginBottom: 10 }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: "#818cf8", flexShrink: 0 }}>
                            {step.step}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "#f0f0ff" }}>{step.product}</div>
                            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                              {step.brand} · <span style={{ color: "#4ade80" }}>{step.price}</span>
                            </div>
                            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 6, lineHeight: 1.5 }}>
                              <span style={{ color: "#60a5fa" }}>How: </span>{step.howTo}
                            </div>
                            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4, lineHeight: 1.5 }}>
                              <span style={{ color: "#a78bfa" }}>Why: </span>{step.why}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HOME REMEDIES TAB */}
              {activeTab === "remedies" && (
                <div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
                    🌿 Natural DIY remedies — ingredients available at home
                  </div>
                  {aiResult.homeRemedies?.map((remedy, i) => (
                    <div key={i} style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.12)", borderRadius: 18, marginBottom: 12, overflow: "hidden" }}>
                      <div onClick={() => setExpandedRemedy(expandedRemedy === i ? null : i)}
                        style={{ padding: 16, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700, color: "#4ade80" }}>
                            🌿 {remedy.name}
                          </div>
                          <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                            {remedy.benefit}
                          </div>
                        </div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#4ade80", fontWeight: 700 }}>
                          {expandedRemedy === i ? "▲" : "▼"}
                        </div>
                      </div>
                      {expandedRemedy === i && (
                        <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(74,222,128,0.1)" }}>
                          <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px" }}>
                              <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#facc15", fontWeight: 700, marginBottom: 4 }}>🛒 INGREDIENTS</div>
                              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{remedy.ingredients}</div>
                            </div>
                            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px" }}>
                              <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#60a5fa", fontWeight: 700, marginBottom: 4 }}>📋 HOW TO MAKE & APPLY</div>
                              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{remedy.howTo}</div>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <div style={{ flex: 1, background: "rgba(74,222,128,0.06)", borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
                                <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>FREQUENCY</div>
                                <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#4ade80", fontWeight: 700 }}>{remedy.frequency}</div>
                              </div>
                              <div style={{ flex: 2, background: "rgba(74,222,128,0.06)", borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
                                <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>BENEFIT</div>
                                <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#4ade80", fontWeight: 700 }}>{remedy.benefit}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 4-WEEK PLAN TAB */}
              {activeTab === "plan" && (
                <div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
                    Follow consistently — tap to expand
                  </div>
                  {["week1","week2","week3","week4"].map((w, idx) => {
                    const weekData = aiResult.weeklyPlan?.[w];
                    if (!weekData) return null;
                    const colors = ["#60a5fa","#a78bfa","#4ade80","#fb923c"];
                    const col = colors[idx];
                    const isOpen = expandedWeek === w;
                    return (
                      <div key={w} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${col}30`, borderRadius: 18, marginBottom: 10, overflow: "hidden" }}>
                        <div onClick={() => setExpandedWeek(isOpen ? null : w)}
                          style={{ padding: 16, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 10, background: `${col}20`, border: `1px solid ${col}40`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: col, fontWeight: 700 }}>
                              W{idx+1}
                            </div>
                            <div>
                              <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "#f0f0ff" }}>Week {idx+1}</div>
                              <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: col }}>{weekData.focus}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>{isOpen ? "▲" : "▼"}</div>
                        </div>
                        {isOpen && (
                          <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                              {weekData.morning?.length > 0 && (
                                <div>
                                  <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#facc15", fontWeight: 700, marginBottom: 6 }}>☀️ MORNING</div>
                                  {weekData.morning.map((s, i) => (
                                    <div key={i} style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,0.6)", padding: "3px 0 3px 10px", borderLeft: "2px solid rgba(250,204,21,0.3)" }}>{s}</div>
                                  ))}
                                </div>
                              )}
                              {weekData.night?.length > 0 && (
                                <div>
                                  <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#818cf8", fontWeight: 700, marginBottom: 6 }}>🌙 NIGHT</div>
                                  {weekData.night.map((s, i) => (
                                    <div key={i} style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,0.6)", padding: "3px 0 3px 10px", borderLeft: "2px solid rgba(129,140,248,0.3)" }}>{s}</div>
                                  ))}
                                </div>
                              )}
                              {weekData.result && (
                                <div style={{ background: "rgba(74,222,128,0.06)", borderRadius: 10, padding: "10px 12px" }}>
                                  <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#4ade80", fontWeight: 700, marginBottom: 4 }}>🎯 EXPECTED RESULT</div>
                                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(74,222,128,0.8)" }}>{weekData.result}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* DIET TAB */}
              {activeTab === "diet" && (
                <div>
                  {aiResult.dietTips?.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#facc15", fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>🥗 DIET FOR HEALTHY SKIN</div>
                      {aiResult.dietTips.map((tip, i) => (
                        <div key={i} style={{ background: "rgba(250,204,21,0.05)", border: "1px solid rgba(250,204,21,0.1)", borderRadius: 12, padding: "10px 14px", marginBottom: 8, fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(250,204,21,0.8)" }}>
                          🍽️ {tip}
                        </div>
                      ))}
                    </div>
                  )}
                  {aiResult.avoid?.length > 0 && (
                    <div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#f87171", fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>❌ AVOID THESE</div>
                      {aiResult.avoid.map((a, i) => (
                        <div key={i} style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.1)", borderRadius: 12, padding: "10px 14px", marginBottom: 8, fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(248,113,113,0.7)" }}>
                          🚫 {a}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Rescan Button */}
              <button onClick={() => { setDermiqData(null); setAiResult(null); setImageBase64(null); setImagePreview(null); }}
                style={{ width: "100%", marginTop: 8, padding: "13px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, background: "transparent", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)", fontSize: 13, cursor: "pointer" }}>
                🔄 Scan Again
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      
    </div>
  );
}