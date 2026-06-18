import { useState, useRef, useEffect } from "react";
import { fitnessAPI } from "../utils/api";
import api from "../utils/api";

// ─── Local Storage Helpers ────────────────────────────────────────────────────
const getProfile = () => JSON.parse(localStorage.getItem("glowup_fitness_profile") || "null");
const saveProfile = (p) => localStorage.setItem("glowup_fitness_profile", JSON.stringify(p));
const getProgress = () => JSON.parse(localStorage.getItem("glowup_daily_progress") || "{}");
const saveProgress = (p) => localStorage.setItem("glowup_daily_progress", JSON.stringify(p));
const getTodayKey = () => new Date().toISOString().split("T")[0];
const getMyPlan = () => JSON.parse(localStorage.getItem("glowup_my_plan") || "null");
const saveMyPlan = (p) => localStorage.setItem("glowup_my_plan", JSON.stringify(p));

// ─── Calorie Calculator ───────────────────────────────────────────────────────
const calculateNutrition = (profile) => {
  const w = parseFloat(profile.currentWeight) || 70;
  const h = parseFloat(profile.height) || 170;
  const a = parseFloat(profile.age) || 25;
  const bmr = profile.gender === "female"
    ? 10 * w + 6.25 * h - 5 * a - 161
    : 10 * w + 6.25 * h - 5 * a + 5;
  const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
  const tdee = Math.round(bmr * (multipliers[profile.lifestyle] || 1.2));
  let calories = tdee;
  if (profile.goal === "weight_loss") calories = tdee - 500;
  else if (profile.goal === "muscle_gain") calories = tdee + 300;
  else if (profile.goal === "weight_gain") calories = tdee + 500;
  calories = Math.max(1200, calories);
  const protein = Math.round(w * 1.8);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
  const bmi = (w / ((h / 100) ** 2)).toFixed(1);
  const bmiStatus = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
  return { calories, protein, carbs, fat, tdee, bmi, bmiStatus };
};

// ─── Notification Helper ─────────────────────────────────────────────────────
const requestNotificationPermission = async () => {
  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
};

// ─── FOOD DATABASE ────────────────────────────────────────────────────────────
const FOOD_DB = [
  { name: "Dal Tadka", cal: 180, protein: 10, carbs: 28, fat: 4, serving: "1 bowl (200g)" },
  { name: "Chapati", cal: 120, protein: 3, carbs: 22, fat: 3, serving: "1 piece (40g)" },
  { name: "White Rice", cal: 206, protein: 4, carbs: 45, fat: 0.4, serving: "1 cup (186g)" },
  { name: "Paneer Butter Masala", cal: 320, protein: 14, carbs: 12, fat: 24, serving: "1 bowl (200g)" },
  { name: "Chicken Curry", cal: 250, protein: 28, carbs: 8, fat: 12, serving: "1 bowl (200g)" },
  { name: "Egg Bhurji", cal: 190, protein: 14, carbs: 4, fat: 13, serving: "2 eggs" },
  { name: "Aloo Paratha", cal: 280, protein: 6, carbs: 45, fat: 9, serving: "1 piece (100g)" },
  { name: "Chole Bhature", cal: 450, protein: 15, carbs: 65, fat: 16, serving: "1 plate" },
  { name: "Idli", cal: 80, protein: 3, carbs: 15, fat: 0.5, serving: "2 pieces" },
  { name: "Dosa", cal: 168, protein: 4, carbs: 30, fat: 3, serving: "1 piece" },
  { name: "Sambar", cal: 90, protein: 5, carbs: 14, fat: 2, serving: "1 bowl (200g)" },
  { name: "Poha", cal: 158, protein: 3, carbs: 32, fat: 2, serving: "1 plate (150g)" },
  { name: "Upma", cal: 200, protein: 5, carbs: 35, fat: 5, serving: "1 plate (200g)" },
  { name: "Biryani Chicken", cal: 380, protein: 22, carbs: 48, fat: 10, serving: "1 plate (300g)" },
  { name: "Rajma Chawal", cal: 420, protein: 18, carbs: 70, fat: 6, serving: "1 plate" },
  { name: "Palak Paneer", cal: 240, protein: 12, carbs: 10, fat: 18, serving: "1 bowl (200g)" },
  { name: "Lassi Sweet", cal: 240, protein: 8, carbs: 38, fat: 7, serving: "1 glass (300ml)" },
  { name: "Banana", cal: 89, protein: 1, carbs: 23, fat: 0.3, serving: "1 medium" },
  { name: "Apple", cal: 95, protein: 0.5, carbs: 25, fat: 0.3, serving: "1 medium" },
  { name: "Boiled Egg", cal: 78, protein: 6, carbs: 0.6, fat: 5, serving: "1 large" },
  { name: "Milk Full Fat", cal: 150, protein: 8, carbs: 12, fat: 8, serving: "1 glass (240ml)" },
  { name: "Curd Dahi", cal: 100, protein: 6, carbs: 8, fat: 4, serving: "1 bowl (200g)" },
  { name: "Peanut Butter", cal: 190, protein: 8, carbs: 7, fat: 16, serving: "2 tbsp" },
  { name: "Oats", cal: 150, protein: 5, carbs: 27, fat: 3, serving: "1/2 cup" },
  { name: "Moong Dal", cal: 130, protein: 9, carbs: 22, fat: 1, serving: "1 bowl" },
  { name: "Almonds", cal: 164, protein: 6, carbs: 6, fat: 14, serving: "1 oz (28g)" },
  { name: "Whey Protein", cal: 130, protein: 25, carbs: 5, fat: 2, serving: "1 scoop (30g)" },
  { name: "Pav Bhaji", cal: 380, protein: 10, carbs: 58, fat: 12, serving: "1 plate" },
  { name: "Mango", cal: 135, protein: 1, carbs: 35, fat: 0.6, serving: "1 cup" },
  { name: "Sabudana Khichdi", cal: 280, protein: 4, carbs: 54, fat: 6, serving: "1 plate" },
  { name: "Besan Chilla", cal: 180, protein: 9, carbs: 24, fat: 5, serving: "2 pieces" },
  { name: "Sprouts Salad", cal: 120, protein: 8, carbs: 18, fat: 2, serving: "1 bowl" },
  { name: "Grilled Chicken", cal: 165, protein: 31, carbs: 0, fat: 4, serving: "100g" },
  { name: "Fish Curry", cal: 220, protein: 26, carbs: 6, fat: 10, serving: "1 bowl" },
  { name: "Khichdi", cal: 200, protein: 7, carbs: 38, fat: 4, serving: "1 bowl" },
];

// ─── CircularProgress ────────────────────────────────────────────────────────
function CircularProgress({ value, max, size = 80, color = "#FF6B6B", label, sublabel }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.min((value / max) * circ, circ);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
            strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
            style={{ transition: "stroke-dasharray 0.8s ease", filter: `drop-shadow(0 0 4px ${color})` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: size > 70 ? 15 : 12, fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>{value}</div>
          {sublabel && <div style={{ fontFamily: "var(--font-body)", fontSize: 8, color: "var(--muted)", marginTop: 1 }}>{sublabel}</div>}
        </div>
      </div>
      {label && <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--muted)", textAlign: "center" }}>{label}</div>}
    </div>
  );
}

// ─── CALORIE PROGRESS BAR ────────────────────────────────────────────────────
function CalorieBar({ consumed, target }) {
  const pct = Math.min((consumed / target) * 100, 100);
  const remaining = target - consumed;
  const over = consumed > target;
  const color = over ? "#FF4D6D" : pct > 80 ? "#FFD93D" : "#51CF66";
  return (
    <div style={{ background: "var(--card)", border: `1px solid ${over ? "rgba(255,77,109,0.3)" : "var(--border)"}`, borderRadius: 20, padding: 16, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 800, color: color, lineHeight: 1 }}>{consumed}</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>calories consumed</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>{target}</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>daily target</div>
        </div>
      </div>
      <div style={{ background: "var(--surface)", borderRadius: 6, height: 10, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${color}, ${color}99)`, borderRadius: 6, transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>{Math.round(pct)}% of daily goal</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: over ? "#FF4D6D" : "#51CF66", fontWeight: 700 }}>
          {over ? `${Math.abs(remaining)} cal over!` : `${remaining} cal remaining`}
        </div>
      </div>
    </div>
  );
}

// ─── FOOD SEARCH ─────────────────────────────────────────────────────────────
function FoodSearch({ onAdd, onBack }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [qty, setQty] = useState({});
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const search = (q) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    const local = FOOD_DB.filter(f =>
      f.name.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 3);
    setResults(local);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.post("/fitness/search-food", { query: q });
        const groqResults = res.data.results || [];
        const localNames = local.map(f => f.name.toLowerCase());
        const newItems = groqResults.filter(f => !localNames.includes(f.name.toLowerCase()));
        setResults([...local, ...newItems].slice(0, 10));
      } catch {
        // local results hi dikhao
      }
      setLoading(false);
    }, 600);
  };

  const getM = (name) => parseFloat(qty[name] || 1);

  return (
    <div>
      {onBack && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 }}>‹</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--text)" }}>🔍 Food Search</div>
        </div>
      )}
      <input
        placeholder="Search any food... (Dal, Maggi, Pizza, Shake)"
        value={query}
        onChange={e => search(e.target.value)}
        style={{ width: "100%", background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "13px 16px", color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 8 }}
        autoFocus
      />
      {loading && (
        <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", padding: "6px 4px", marginBottom: 8 }}>
          🔍 Searching more foods...
        </div>
      )}
      {!query && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {["Dal", "Chapati", "Rice", "Egg", "Chicken", "Paneer", "Dosa", "Oats", "Maggi", "Banana"].map(tag => (
            <div key={tag} onClick={() => search(tag)}
              style={{ padding: "6px 14px", borderRadius: 20, background: "var(--card)", border: "1px solid var(--border)", fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", cursor: "pointer" }}>
              {tag}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {results.map(food => {
          const m = getM(food.name);
          return (
            <div key={food.name} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "11px 13px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{food.name}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#FF6B6B" }}>{Math.round(food.cal * m)} cal</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>P:{Math.round(food.protein * m)}g C:{Math.round(food.carbs * m)}g F:{Math.round(food.fat * m)}g</span>
                </div>
                {food.serving && <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{food.serving}</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div onClick={() => setQty(q => ({ ...q, [food.name]: Math.max(0.5, parseFloat(q[food.name] || 1) - 0.5).toString() }))}
                  style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>−</div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, minWidth: 20, textAlign: "center", color: "var(--text)" }}>{qty[food.name] || 1}x</span>
                <div onClick={() => setQty(q => ({ ...q, [food.name]: (parseFloat(q[food.name] || 1) + 0.5).toString() }))}
                  style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>+</div>
              </div>
              <div onClick={() => onAdd({ ...food, calories: Math.round(food.cal * m), foodName: food.name, protein: Math.round(food.protein * m), carbs: Math.round(food.carbs * m), fat: Math.round(food.fat * m) })}
                style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(81,207,102,0.15)", border: "1px solid rgba(81,207,102,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}>✓</div>
            </div>
          );
        })}
        {query && !loading && results.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px 0", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)" }}>
            No results found for "{query}"
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FOOD PICKER MODAL ───────────────────────────────────────────────────────
function FoodPickerModal({ mealSlot, onAdd, onClose, calorieLimit }) {
  const [mode, setMode] = useState("options");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [qty, setQty] = useState({});
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const fileRef = useRef();
  const videoRef = useRef();
  const debounceRef = useRef(null);

  const search = (q) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    const local = FOOD_DB.filter(f => f.name.toLowerCase().includes(q.toLowerCase())).slice(0, 3);
    setResults(local);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.post("/fitness/search-food", { query: q });
        const groqResults = res.data.results || [];
        const localNames = local.map(f => f.name.toLowerCase());
        const newItems = groqResults.filter(f => !localNames.includes(f.name.toLowerCase()));
        setResults([...local, ...newItems].slice(0, 10));
      } catch {}
      setLoading(false);
    }, 600);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setPreview(reader.result); setImage(reader.result.split(",")[1]); setMode("preview"); };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) { videoRef.current.srcObject = stream; setMode("camera"); }
    } catch { alert("Camera access denied. Please use photo upload."); }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setPreview(dataUrl); setImage(dataUrl.split(",")[1]);
    if (video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
    setMode("preview");
  };

  const scanFood = async () => {
    setLoading(true);
    try {
      const res = await api.post("/fitness/scan-food", { imageBase64: image });
      setScanResult(res.data.result); setMode("result");
    } catch {
      setScanResult({ foodName: "Mixed Meal", calories: 350, protein: 12, carbs: 48, fat: 10, serving: "1 plate (estimated)", tip: "Add more protein for better results." });
      setMode("result");
    }
    setLoading(false);
  };

  const getMultiplier = (name) => parseFloat(qty[name] || 1);
  const mealColors = { breakfast: "#FFD93D", lunch: "#FF6B6B", snacks: "#51CF66", dinner: "#845EF7" };
  const color = mealColors[mealSlot] || "#FF6B6B";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 2000, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div style={{ background: "var(--card)", borderRadius: "24px 24px 0 0", padding: 20, maxHeight: "85vh", overflowY: "auto", border: "1px solid var(--border2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
              Add to {mealSlot.charAt(0).toUpperCase() + mealSlot.slice(1)}
            </div>
            {calorieLimit > 0 && (
              <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>~{calorieLimit} cal remaining</div>
            )}
          </div>
          <div onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "var(--muted)" }}>✕</div>
        </div>

        {mode === "options" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { icon: "🔍", label: "Search", action: () => setMode("search"), color: "#4D96FF" },
              { icon: "📷", label: "Photo", action: () => fileRef.current.click(), color: "#FF6B6B" },
              { icon: "📸", label: "Camera", action: startCamera, color: "#845EF7" },
            ].map(opt => (
              <div key={opt.label} onClick={opt.action} style={{ background: "var(--surface)", border: `1px solid ${opt.color}25`, borderRadius: 16, padding: "14px 8px", cursor: "pointer", textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{opt.icon}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{opt.label}</div>
              </div>
            ))}
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />

        {mode === "camera" && (
          <div>
            <video ref={videoRef} autoPlay playsInline style={{ width: "100%", borderRadius: 16, marginBottom: 12 }} />
            <button onClick={capturePhoto} style={{ width: "100%", padding: 14, border: "none", borderRadius: 14, background: "var(--grad1)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>📸 Capture</button>
          </div>
        )}

        {mode === "preview" && preview && (
          <div>
            <img src={preview} alt="food" style={{ width: "100%", borderRadius: 16, marginBottom: 12, maxHeight: 200, objectFit: "cover" }} />
            <button onClick={scanFood} disabled={loading} style={{ width: "100%", padding: 14, border: "none", borderRadius: 14, background: loading ? "var(--surface)" : "var(--grad1)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 8 }}>
              {loading ? "🔍 Scanning..." : "🔍 Scan Calories"}
            </button>
            <button onClick={() => { setMode("options"); setPreview(null); }} style={{ width: "100%", padding: 10, border: "none", borderRadius: 12, background: "transparent", color: "var(--muted)", fontFamily: "var(--font-body)", fontSize: 12, cursor: "pointer" }}>Retake</button>
          </div>
        )}

        {mode === "result" && scanResult && (
          <div>
            <div style={{ background: "var(--surface)", borderRadius: 16, padding: 16, marginBottom: 14 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>{scanResult.foodName}</div>
              <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 10 }}>
                {[{ l: "Cal", v: scanResult.calories, c: "#FF6B6B" }, { l: "Protein", v: scanResult.protein + "g", c: "#4D96FF" }, { l: "Carbs", v: scanResult.carbs + "g", c: "#FFD93D" }, { l: "Fat", v: scanResult.fat + "g", c: "#51CF66" }].map(m => (
                  <div key={m.l} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 800, color: m.c }}>{m.v}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--muted)" }}>{m.l}</div>
                  </div>
                ))}
              </div>
              {scanResult.tip && <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#4D96FF", padding: "8px 12px", background: "rgba(77,150,255,0.08)", borderRadius: 10 }}>💡 {scanResult.tip}</div>}
            </div>
            <button onClick={() => { onAdd(mealSlot, { name: scanResult.foodName, calories: scanResult.calories, protein: scanResult.protein, carbs: scanResult.carbs, fat: scanResult.fat }); onClose(); }}
              style={{ width: "100%", padding: 14, border: "none", borderRadius: 14, background: `linear-gradient(135deg, ${color}, ${color}99)`, color: "#fff", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 8 }}>
              ✅ Add to {mealSlot.charAt(0).toUpperCase() + mealSlot.slice(1)}
            </button>
            <button onClick={() => setMode("options")} style={{ width: "100%", padding: 10, border: "none", borderRadius: 12, background: "transparent", color: "var(--muted)", fontFamily: "var(--font-body)", fontSize: 12, cursor: "pointer" }}>Scan Another</button>
          </div>
        )}

        {mode === "search" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div onClick={() => setMode("options")} style={{ width: 32, height: 32, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>‹</div>
              <input placeholder="Search any food..." value={query} onChange={e => search(e.target.value)}
                style={{ flex: 1, background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "10px 14px", color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 14, outline: "none" }} autoFocus />
            </div>
            {loading && <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", padding: "4px 0", marginBottom: 8 }}>🔍 Searching...</div>}
            {!query && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {["Dal", "Rice", "Chapati", "Egg", "Chicken", "Paneer", "Dosa", "Oats", "Banana"].map(tag => (
                  <div key={tag} onClick={() => search(tag)} style={{ padding: "5px 12px", borderRadius: 20, background: "var(--surface)", border: "1px solid var(--border)", fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", cursor: "pointer" }}>{tag}</div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {results.map(food => {
                const m = getMultiplier(food.name);
                return (
                  <div key={food.name} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{food.name}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: color }}>{Math.round(food.cal * m)} cal</span>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>P:{Math.round(food.protein * m)}g</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div onClick={() => setQty(q => ({ ...q, [food.name]: Math.max(0.5, parseFloat(q[food.name] || 1) - 0.5).toString() }))}
                        style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>−</div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, minWidth: 20, textAlign: "center" }}>{qty[food.name] || 1}x</span>
                      <div onClick={() => setQty(q => ({ ...q, [food.name]: (parseFloat(q[food.name] || 1) + 0.5).toString() }))}
                        style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>+</div>
                    </div>
                    <div onClick={() => { onAdd(mealSlot, { name: food.name, calories: Math.round(food.cal * m), protein: Math.round(food.protein * m), carbs: Math.round(food.carbs * m), fat: Math.round(food.fat * m) }); onClose(); }}
                      style={{ width: 32, height: 32, borderRadius: 10, background: `${color}20`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}>✓</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CREATE YOUR PLAN ────────────────────────────────────────────────────────
function CreateYourPlan({ profile, onBack }) {
  const nutrition = calculateNutrition(profile);
  const targetCalories = nutrition.calories;

  const MEAL_SLOTS = [
    { id: "breakfast", label: "Breakfast", icon: "🌅", time: "7-9 AM", targetPct: 0.25, color: "#FFD93D" },
    { id: "lunch", label: "Lunch", icon: "☀️", time: "12-2 PM", targetPct: 0.35, color: "#FF6B6B" },
    { id: "snacks", label: "Snacks", icon: "🍎", time: "4-5 PM", targetPct: 0.10, color: "#51CF66" },
    { id: "dinner", label: "Dinner", icon: "🌙", time: "7-9 PM", targetPct: 0.30, color: "#845EF7" },
  ];

  const [plan, setPlan] = useState(() => {
    const saved = getMyPlan();
    if (saved && saved.date === getTodayKey()) return saved.meals;
    return { breakfast: [], lunch: [], snacks: [], dinner: [] };
  });
  const [activePicker, setActivePicker] = useState(null);
  const [saved, setSaved] = useState(false);

  const totalConsumed = Object.values(plan).flat().reduce((s, f) => s + (f.calories || 0), 0);
  const totalProtein = Object.values(plan).flat().reduce((s, f) => s + (f.protein || 0), 0);
  const totalCarbs = Object.values(plan).flat().reduce((s, f) => s + (f.carbs || 0), 0);
  const totalFat = Object.values(plan).flat().reduce((s, f) => s + (f.fat || 0), 0);

  const addFood = (slot, food) => { setPlan(prev => ({ ...prev, [slot]: [...prev[slot], food] })); setSaved(false); };
  const removeFood = (slot, idx) => { setPlan(prev => ({ ...prev, [slot]: prev[slot].filter((_, i) => i !== idx) })); setSaved(false); };

  const savePlan = () => {
    saveMyPlan({ date: getTodayKey(), meals: plan });
    const prog = getProgress();
    const key = getTodayKey();
    if (!prog[key]) prog[key] = { meals: {}, water: 0, weight: "", foodLog: [] };
    prog[key].myPlan = plan;
    prog[key].planCalories = totalConsumed;
    saveProgress(prog);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getMealCalories = (slot) => plan[slot].reduce((s, f) => s + (f.calories || 0), 0);
  const getMealTarget = (slot) => { const s = MEAL_SLOTS.find(m => m.id === slot); return Math.round(targetCalories * (s?.targetPct || 0.25)); };

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 }}>‹</div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>📋 Create Your Plan</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)" }}>Target: {targetCalories} cal/day</div>
        </div>
      </div>

      <CalorieBar consumed={totalConsumed} target={targetCalories} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Protein", consumed: totalProtein, target: nutrition.protein, unit: "g", color: "#4D96FF" },
          { label: "Carbs", consumed: totalCarbs, target: nutrition.carbs, unit: "g", color: "#FFD93D" },
          { label: "Fat", consumed: totalFat, target: nutrition.fat, unit: "g", color: "#51CF66" },
        ].map(m => {
          const pct = Math.min((m.consumed / m.target) * 100, 100);
          return (
            <div key={m.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "10px 10px 8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>{m.label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: m.color, fontWeight: 700 }}>{m.consumed}/{m.target}{m.unit}</div>
              </div>
              <div style={{ background: "var(--surface)", borderRadius: 3, height: 4, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: m.color, borderRadius: 3, transition: "width 0.6s ease" }} />
              </div>
            </div>
          );
        })}
      </div>

      {MEAL_SLOTS.map(slot => {
        const foods = plan[slot.id];
        const slotCals = getMealCalories(slot.id);
        const slotTarget = getMealTarget(slot.id);
        const slotPct = Math.min((slotCals / slotTarget) * 100, 100);
        return (
          <div key={slot.id} style={{ background: "var(--card)", border: `1px solid ${slot.color}20`, borderRadius: 20, marginBottom: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: foods.length > 0 ? "1px solid var(--border)" : "none" }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: `${slot.color}15`, border: `1px solid ${slot.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{slot.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{slot.label}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>{slot.time} • Target: ~{slotTarget} cal</div>
                {slotCals > 0 && (
                  <div style={{ background: "var(--surface)", borderRadius: 3, height: 3, marginTop: 5, overflow: "hidden" }}>
                    <div style={{ width: `${slotPct}%`, height: "100%", background: slot.color, borderRadius: 3, transition: "width 0.6s" }} />
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                {slotCals > 0 && <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 800, color: slot.color, marginBottom: 4 }}>{slotCals} cal</div>}
                <div onClick={() => setActivePicker(slot.id)} style={{ padding: "6px 12px", borderRadius: 20, background: `${slot.color}15`, border: `1px solid ${slot.color}30`, fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: slot.color, cursor: "pointer", whiteSpace: "nowrap" }}>+ Add</div>
              </div>
            </div>
            {foods.length > 0 && (
              <div style={{ padding: "8px 16px 12px" }}>
                {foods.map((food, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: idx < foods.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: slot.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text)" }}>{food.name}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: slot.color, fontWeight: 700 }}>{food.calories} cal</div>
                    <div onClick={() => removeFood(slot.id, idx)} style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,107,107,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, color: "#FF4D6D" }}>✕</div>
                  </div>
                ))}
              </div>
            )}
            {foods.length === 0 && (
              <div onClick={() => setActivePicker(slot.id)} style={{ padding: "12px 16px 14px", cursor: "pointer" }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted2)" }}>Tap to add {slot.label.toLowerCase()} items...</div>
              </div>
            )}
          </div>
        );
      })}

      <div style={{ background: "linear-gradient(135deg, rgba(77,150,255,0.08), rgba(132,94,247,0.08))", border: "1px solid rgba(77,150,255,0.15)", borderRadius: 20, padding: 16, marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>📊 Plan Summary</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {MEAL_SLOTS.map(slot => (
            <div key={slot.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)" }}>{slot.icon} {slot.label}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: slot.color }}>{getMealCalories(slot.id)} cal</div>
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: "var(--border)", marginBottom: 12 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Total Planned</div>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 800, color: totalConsumed > targetCalories ? "#FF4D6D" : "#51CF66" }}>{totalConsumed} cal</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--muted)", textAlign: "right" }}>of {targetCalories} target</div>
          </div>
        </div>
      </div>

      <button onClick={savePlan} style={{ width: "100%", padding: 16, border: "none", borderRadius: 16, background: saved ? "linear-gradient(135deg,#51CF66,#20C997)" : "linear-gradient(135deg,#4D96FF,#845EF7)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>
        {saved ? "✅ Plan Saved!" : "💾 Save Today's Plan"}
      </button>

      {activePicker && (
        <FoodPickerModal mealSlot={activePicker} onAdd={addFood} onClose={() => setActivePicker(null)} calorieLimit={getMealTarget(activePicker) - getMealCalories(activePicker)} />
      )}
    </div>
  );
}

// ─── FITNESS LANDING ──────────────────────────────────────────────────────────
function FitnessLanding({ onSelect, profile }) {
  const nutrition = profile ? calculateNutrition(profile) : null;
  const options = [
    { id: "create_plan", icon: "📋", label: "Create Your Plan", desc: "Build daily meals within calorie target", color: "#06D6A0", glow: "rgba(6,214,160,0.2)", badge: "FREE" },
    { id: "scanner", icon: "📷", label: "Calorie Scanner", desc: "Photo → instant calories", color: "#FF6B6B", glow: "rgba(255,107,107,0.2)" },
    { id: "search", icon: "🔍", label: "Food Search", desc: "Search & log Indian foods", color: "#4D96FF", glow: "rgba(77,150,255,0.2)" },
    { id: "ai_plan", icon: "🤖", label: "AI Diet Plan", desc: "Full personalized plan — ₹20", color: "#845EF7", glow: "rgba(132,94,247,0.2)", badge: "₹20" },
    { id: "progress", icon: "📊", label: "Daily Progress", desc: "Track meals, water & streaks", color: "#51CF66", glow: "rgba(81,207,102,0.2)" },
  ];

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--text)", lineHeight: 1.2 }}>
          💪 Fitness <span style={{ background: "linear-gradient(135deg,#4D96FF,#845EF7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Coach</span>
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", marginTop: 4 }}>AI-powered nutrition & workout planning</div>
      </div>

      {nutrition && (
        <div style={{ background: "linear-gradient(135deg, rgba(77,150,255,0.1), rgba(132,94,247,0.1))", border: "1px solid rgba(77,150,255,0.2)", borderRadius: 22, padding: 20, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Your Daily Targets</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>BMI: {nutrition.bmi} ({nutrition.bmiStatus})</div>
            </div>
            <div onClick={() => onSelect("profile_setup")} style={{ padding: "5px 12px", borderRadius: 20, background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", cursor: "pointer" }}>Edit</div>
          </div>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 44, fontWeight: 800, background: "linear-gradient(135deg,#4D96FF,#845EF7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>{nutrition.calories}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginTop: 4 }}>calories / day</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[{ l: "Protein", v: nutrition.protein + "g", c: "#4D96FF", i: "🥩" }, { l: "Carbs", v: nutrition.carbs + "g", c: "#FFD93D", i: "🍚" }, { l: "Fat", v: nutrition.fat + "g", c: "#51CF66", i: "🥑" }].map(m => (
              <div key={m.l} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "8px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 16, marginBottom: 3 }}>{m.i}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: m.c }}>{m.v}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--muted)", marginTop: 1 }}>{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!profile && (
        <div onClick={() => onSelect("profile_setup")} style={{ background: "linear-gradient(135deg, rgba(255,107,107,0.08), rgba(132,94,247,0.08))", border: "1.5px dashed rgba(255,107,107,0.4)", borderRadius: 20, padding: 18, marginBottom: 16, cursor: "pointer", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚙️</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Setup Your Profile First</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Get personalized calorie & macro targets</div>
          <div style={{ marginTop: 12, padding: "10px 20px", borderRadius: 12, background: "var(--grad1)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, display: "inline-block" }}>Setup Now →</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map(opt => (
          <div key={opt.id} onClick={() => onSelect(opt.id)}
            style={{ background: "var(--card)", border: `1px solid ${opt.color}25`, borderRadius: 20, padding: "15px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, background: `radial-gradient(circle, ${opt.glow}, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ width: 46, height: 46, borderRadius: 14, background: `${opt.color}15`, border: `1px solid ${opt.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, flexShrink: 0 }}>{opt.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{opt.label}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{opt.desc}</div>
            </div>
            {opt.badge && (
              <div style={{ background: opt.badge === "FREE" ? "linear-gradient(135deg,#06D6A0,#4361EE)" : "linear-gradient(135deg,#845EF7,#4D96FF)", borderRadius: 20, padding: "4px 10px", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "#fff" }}>{opt.badge}</div>
            )}
            <div style={{ color: "var(--muted)", fontSize: 18 }}>›</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROFILE SETUP ────────────────────────────────────────────────────────────
function ProfileSetup({ onSave, existing }) {
  const [form, setForm] = useState(existing || { age: "", gender: "male", height: "", currentWeight: "", targetWeight: "", goal: "weight_loss", lifestyle: "sedentary", stomachIssue: "none", targetDays: "30", waterGoal: "8" });
  const [preview, setPreview] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (form.age && form.height && form.currentWeight) setPreview(calculateNutrition(form));
  }, [form]);

  const inputStyle = { width: "100%", background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "11px 14px", color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 14, outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--text)" }}>⚙️ Fitness Profile</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Fill once — AI personalizes everything</div>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>Basic Info</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          {[{ k: "age", l: "Age", p: "25" }, { k: "height", l: "Height (cm)", p: "170" }, { k: "currentWeight", l: "Current Weight (kg)", p: "70" }, { k: "targetWeight", l: "Target Weight (kg)", p: "65" }].map(f => (
            <div key={f.k}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginBottom: 5 }}>{f.l}</div>
              <input type="number" placeholder={f.p} value={form[f.k]} onChange={e => set(f.k, e.target.value)} style={inputStyle} />
            </div>
          ))}
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>Gender</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["male", "female", "other"].map(g => (
            <div key={g} onClick={() => set("gender", g)} style={{ flex: 1, padding: "9px 6px", borderRadius: 12, cursor: "pointer", textAlign: "center", background: form.gender === g ? "rgba(77,150,255,0.15)" : "var(--surface)", border: `1.5px solid ${form.gender === g ? "#4D96FF" : "var(--border)"}`, fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: form.gender === g ? "#4D96FF" : "var(--muted)" }}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>Your Goal</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[{ id: "weight_loss", icon: "🔥", label: "Lose Weight", desc: "-500 cal" }, { id: "muscle_gain", icon: "💪", label: "Build Muscle", desc: "+300 cal" }, { id: "weight_gain", icon: "⬆️", label: "Gain Weight", desc: "+500 cal" }, { id: "maintain", icon: "⚖️", label: "Maintain", desc: "TDEE" }].map(g => (
            <div key={g.id} onClick={() => set("goal", g.id)} style={{ padding: "12px 10px", borderRadius: 14, cursor: "pointer", textAlign: "center", background: form.goal === g.id ? "rgba(255,107,107,0.12)" : "var(--surface)", border: `1.5px solid ${form.goal === g.id ? "#FF6B6B" : "var(--border)"}` }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{g.icon}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: form.goal === g.id ? "#FF6B6B" : "var(--text)" }}>{g.label}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{g.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>Lifestyle</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[{ id: "sedentary", label: "Desk Job", icon: "🪑" }, { id: "light", label: "Light Active", icon: "🚶" }, { id: "moderate", label: "Moderate", icon: "🏃" }, { id: "active", label: "Very Active", icon: "🏋️" }].map(l => (
            <div key={l.id} onClick={() => set("lifestyle", l.id)} style={{ padding: "10px", borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, background: form.lifestyle === l.id ? "rgba(132,94,247,0.12)" : "var(--surface)", border: `1.5px solid ${form.lifestyle === l.id ? "#845EF7" : "var(--border)"}` }}>
              <span style={{ fontSize: 18 }}>{l.icon}</span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: form.lifestyle === l.id ? "#845EF7" : "var(--text)" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>Additional</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>Stomach issues?</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          {["none", "acidity", "ibs", "lactose", "gluten"].map(s => (
            <div key={s} onClick={() => set("stomachIssue", s)} style={{ padding: "7px 14px", borderRadius: 20, cursor: "pointer", background: form.stomachIssue === s ? "rgba(255,107,107,0.12)" : "var(--surface)", border: `1.5px solid ${form.stomachIssue === s ? "#FF6B6B" : "var(--border)"}`, fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: form.stomachIssue === s ? "#FF6B6B" : "var(--muted)" }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginBottom: 5 }}>Target Days</div>
            <input type="number" placeholder="30" value={form.targetDays} onChange={e => set("targetDays", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginBottom: 5 }}>Water Goal (glasses)</div>
            <input type="number" placeholder="8" value={form.waterGoal} onChange={e => set("waterGoal", e.target.value)} style={inputStyle} />
          </div>
        </div>
      </div>

      {preview && (
        <div style={{ background: "linear-gradient(135deg, rgba(77,150,255,0.08), rgba(132,94,247,0.08))", border: "1px solid rgba(77,150,255,0.2)", borderRadius: 20, padding: 16, marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#4D96FF", fontWeight: 700, marginBottom: 10 }}>✨ Your Estimated Targets</div>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            {[{ l: "Calories", v: preview.calories, c: "#FF6B6B" }, { l: "Protein", v: preview.protein + "g", c: "#4D96FF" }, { l: "Carbs", v: preview.carbs + "g", c: "#FFD93D" }, { l: "Fat", v: preview.fat + "g", c: "#51CF66" }].map(m => (
              <div key={m.l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 800, color: m.c }}>{m.v}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--muted)" }}>{m.l}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 8, fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>BMI: {preview.bmi} ({preview.bmiStatus}) • TDEE: {preview.tdee} kcal</div>
        </div>
      )}

      <button onClick={() => { saveProfile(form); onSave(form); }} style={{ width: "100%", padding: 16, border: "none", borderRadius: 16, background: "linear-gradient(135deg,#4D96FF,#845EF7)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(77,150,255,0.3)" }}>
        Save & See My Targets →
      </button>
    </div>
  );
}

// ─── CALORIE SCANNER ─────────────────────────────────────────────────────────
function CalorieScanner({ onBack }) {
  const [mode, setMode] = useState("options");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [todayLog, setTodayLog] = useState(() => getProgress()[getTodayKey()]?.foodLog || []);
  const fileRef = useRef();
  const videoRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setPreview(reader.result); setImage(reader.result.split(",")[1]); setMode("preview"); };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); if (videoRef.current) { videoRef.current.srcObject = stream; setMode("camera"); } } catch { alert("Camera access denied."); }
  };

  const capturePhoto = () => {
    const video = videoRef.current; const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setPreview(dataUrl); setImage(dataUrl.split(",")[1]);
    if (video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
    setMode("preview");
  };

  const scanCalories = async () => {
    setLoading(true);
    try {
      const res = await api.post("/fitness/scan-food", { imageBase64: image });
      setResult(res.data.result); setMode("result");
    } catch {
      setResult({ foodName: "Mixed Indian Meal", calories: 380, protein: 15, carbs: 52, fat: 12, serving: "1 plate (estimated)", tip: "Good balanced meal!" });
      setMode("result");
    }
    setLoading(false);
  };

  const addToLog = (food) => {
    const key = getTodayKey(); const prog = getProgress();
    if (!prog[key]) prog[key] = { foodLog: [], water: 0, meals: {} };
    prog[key].foodLog = [...(prog[key].foodLog || []), { ...food, time: new Date().toLocaleTimeString() }];
    saveProgress(prog); setTodayLog(prog[key].foodLog);
    setMode("options"); setResult(null); setPreview(null); setImage(null);
  };

  const totalCals = todayLog.reduce((s, f) => s + (f.calories || 0), 0);

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 }}>‹</div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>📷 Calorie Scanner</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)" }}>Today: {totalCals} cal logged</div>
        </div>
      </div>

      {mode === "options" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[{ icon: "📤", label: "Upload Photo", action: () => fileRef.current.click(), color: "#FF6B6B" }, { icon: "📸", label: "Take Photo", action: startCamera, color: "#4D96FF" }, { icon: "🔍", label: "Search Food", action: () => setMode("search"), color: "#845EF7" }, { icon: "🏷️", label: "Barcode Soon", action: () => {}, color: "#888" }].map(opt => (
              <div key={opt.label} onClick={opt.action} style={{ background: "var(--card)", border: `1px solid ${opt.color}25`, borderRadius: 18, padding: 16, cursor: "pointer", textAlign: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: `${opt.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 8px" }}>{opt.icon}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{opt.label}</div>
              </div>
            ))}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
          {todayLog.length > 0 && (
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 16 }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>🍽️ Today's Log</div>
              {todayLog.map((food, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < todayLog.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text)" }}>{food.foodName || food.name}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#FF6B6B" }}>{food.calories} cal</div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Total</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 800, color: "#FF6B6B" }}>{totalCals} cal</div>
              </div>
            </div>
          )}
        </>
      )}

      {mode === "camera" && (
        <div>
          <video ref={videoRef} autoPlay playsInline style={{ width: "100%", borderRadius: 20, marginBottom: 16 }} />
          <button onClick={capturePhoto} style={{ width: "100%", padding: 16, border: "none", borderRadius: 16, background: "var(--grad1)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>📸 Capture</button>
        </div>
      )}

      {mode === "preview" && preview && (
        <div>
          <img src={preview} alt="food" style={{ width: "100%", borderRadius: 20, marginBottom: 16, maxHeight: 280, objectFit: "cover" }} />
          <button onClick={scanCalories} disabled={loading} style={{ width: "100%", padding: 16, border: "none", borderRadius: 16, background: loading ? "var(--surface)" : "var(--grad1)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>
            {loading ? "🔍 Scanning..." : "🔍 Scan Calories"}
          </button>
          <button onClick={() => { setMode("options"); setPreview(null); }} style={{ width: "100%", padding: 12, border: "none", borderRadius: 14, background: "transparent", color: "var(--muted)", fontFamily: "var(--font-body)", fontSize: 13, cursor: "pointer" }}>Retake</button>
        </div>
      )}

      {mode === "result" && result && (
        <div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 20, marginBottom: 14 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 16 }}>{result.foodName}</div>
            <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 12 }}>
              {[{ l: "Cal", v: result.calories, c: "#FF6B6B" }, { l: "Protein", v: result.protein + "g", c: "#4D96FF" }, { l: "Carbs", v: result.carbs + "g", c: "#FFD93D" }, { l: "Fat", v: result.fat + "g", c: "#51CF66" }].map(m => (
                <div key={m.l} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 800, color: m.c }}>{m.v}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{m.l}</div>
                </div>
              ))}
            </div>
            {result.tip && <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#4D96FF", padding: "8px 12px", background: "rgba(77,150,255,0.08)", borderRadius: 10 }}>💡 {result.tip}</div>}
          </div>
          <button onClick={() => addToLog(result)} style={{ width: "100%", padding: 16, border: "none", borderRadius: 16, background: "linear-gradient(135deg,#51CF66,#20C997)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>✅ Add to Today's Log</button>
          <button onClick={() => setMode("options")} style={{ width: "100%", padding: 12, border: "none", borderRadius: 14, background: "transparent", color: "var(--muted)", fontFamily: "var(--font-body)", fontSize: 13, cursor: "pointer" }}>Scan Another</button>
        </div>
      )}

      {mode === "search" && <FoodSearch onAdd={addToLog} onBack={() => setMode("options")} />}
    </div>
  );
}

// ─── AI DIET PLAN ─────────────────────────────────────────────────────────────
function AIDietPlan({ profile, onBack }) {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(() => { try { return JSON.parse(localStorage.getItem("glowup_diet_plan") || "null"); } catch { return null; } });
  const [payStep, setPayStep] = useState("prompt");
  const [error, setError] = useState("");
  const nutrition = profile ? calculateNutrition(profile) : null;

  const loadRazorpay = () => new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script"); s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true); s.onerror = () => resolve(false); document.body.appendChild(s);
  });

  const handlePayAndGenerate = async () => {
    setError(""); setPayStep("paying");
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { setError("Payment failed."); setPayStep("prompt"); return; }
      const { data } = await api.post("/payment/create-order", { amount: 20, planName: "AI Diet Plan" });
      new window.Razorpay({ key: data.key, amount: data.order.amount, currency: "INR", name: "GlowUp AI", description: "AI Diet Plan", order_id: data.order.id, handler: async () => { setPayStep("done"); await generatePlan(); }, theme: { color: "#845EF7" }, modal: { ondismiss: () => setPayStep("prompt") } }).open();
    } catch { setError("Payment error."); setPayStep("prompt"); }
  };

  const generatePlan = async () => {
    setLoading(true);
    try {
      const res = await fitnessAPI.plan({ age: profile.age, gender: profile.gender, height: profile.height, weight: profile.currentWeight, goal: profile.goal, lifestyle: profile.lifestyle, stomachIssue: profile.stomachIssue, targetDays: profile.targetDays });
      setPlan(res.data.result);
      localStorage.setItem("glowup_diet_plan", JSON.stringify(res.data.result));
    } catch { setError("Could not generate. Try again."); }
    setLoading(false);
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div><div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--text)" }}>Creating Your Plan...</div></div>;

  if (!plan) return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 }}>‹</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>🤖 AI Diet Plan</div>
      </div>
      <div style={{ background: "linear-gradient(135deg, rgba(132,94,247,0.1), rgba(77,150,255,0.1))", border: "1px solid rgba(132,94,247,0.3)", borderRadius: 24, padding: 24, marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🥗</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 16 }}>Full AI-Personalized Diet Plan</div>
        {nutrition && (
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 14, marginBottom: 16 }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>Plan will be built for your targets:</div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              {[{ l: "Cal", v: nutrition.calories, c: "#FF6B6B" }, { l: "Protein", v: nutrition.protein + "g", c: "#4D96FF" }, { l: "Carbs", v: nutrition.carbs + "g", c: "#FFD93D" }, { l: "Fat", v: nutrition.fat + "g", c: "#51CF66" }].map(m => (
                <div key={m.l} style={{ textAlign: "center" }}><div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 800, color: m.c }}>{m.v}</div><div style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--muted)" }}>{m.l}</div></div>
              ))}
            </div>
          </div>
        )}
        {["📅 7-day rotating meal plan", "🥗 Only Indian foods", "💧 Water & supplements", "⚠️ Foods to avoid", "📊 Matches your calorie target exactly"].map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, textAlign: "left" }}>
            <span style={{ color: "#51CF66" }}>✓</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text)" }}>{f}</span>
          </div>
        ))}
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 40, fontWeight: 800, color: "#845EF7", marginTop: 16 }}>₹20</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>One-time • Instant access</div>
      </div>
      {error && <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 12, padding: 12, marginBottom: 12, fontFamily: "var(--font-body)", fontSize: 13, color: "#FF6B6B" }}>⚠️ {error}</div>}
      <button onClick={handlePayAndGenerate} disabled={payStep === "paying"} style={{ width: "100%", padding: 16, border: "none", borderRadius: 16, background: "linear-gradient(135deg,#845EF7,#4D96FF)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>
        {payStep === "paying" ? "Opening Payment..." : "💳 Pay ₹20 & Get My Plan"}
      </button>
      <div style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>🔒 Secure via Razorpay</div>
    </div>
  );

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 }}>‹</div>
        <div><div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>Your AI Plan ✅</div><div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#51CF66" }}>Personalized for you</div></div>
      </div>
      {plan.dailyCalories && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 18, marginBottom: 14 }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>📊 Daily Targets</div>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            {[{ l: "Calories", v: plan.dailyCalories, c: "#FF6B6B" }, { l: "Protein", v: plan.macros?.protein || "-", c: "#4D96FF" }, { l: "Carbs", v: plan.macros?.carbs || "-", c: "#FFD93D" }, { l: "Fat", v: plan.macros?.fat || "-", c: "#51CF66" }].map(m => (
              <div key={m.l} style={{ textAlign: "center" }}><div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 800, color: m.c }}>{m.v}</div><div style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{m.l}</div></div>
            ))}
          </div>
        </div>
      )}
      {plan.weeklyPlan?.map((day, i) => (
        <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 16, marginBottom: 10 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800, color: "var(--accent)", marginBottom: 10 }}>{day.day}</div>
          {day.meals?.map((meal, j) => <div key={j} style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>• {meal}</div>)}
          {day.workout && <div style={{ marginTop: 8, padding: "7px 12px", background: "rgba(77,150,255,0.08)", borderRadius: 10, fontFamily: "var(--font-body)", fontSize: 11, color: "#4D96FF", fontWeight: 700 }}>💪 {day.workout}</div>}
        </div>
      ))}
      <button onClick={() => { localStorage.removeItem("glowup_diet_plan"); setPlan(null); setPayStep("prompt"); }} style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 14, background: "transparent", color: "var(--muted)", fontFamily: "var(--font-body)", fontSize: 13, cursor: "pointer", marginTop: 8 }}>🔄 Regenerate</button>
    </div>
  );
}

// ─── DAILY PROGRESS ──────────────────────────────────────────────────────────
function DailyProgress({ profile, onBack }) {
  const todayKey = getTodayKey();
  const [prog, setProg] = useState(() => { const p = getProgress(); if (!p[todayKey]) p[todayKey] = { meals: {}, water: 0, weight: "", foodLog: [] }; return p; });
  const [weightInput, setWeightInput] = useState(prog[todayKey]?.weight || "");
  const today = prog[todayKey];
  const waterGoal = parseInt(profile?.waterGoal || 8);
  const nutrition = profile ? calculateNutrition(profile) : { calories: 2000 };
  const foodLogCals = (today.foodLog || []).reduce((s, f) => s + (f.calories || 0), 0);
  const planCals = today.planCalories || 0;
  const totalTracked = Math.max(foodLogCals, planCals);
  const mealsDoneToday = Object.values(today.meals || {}).filter(Boolean).length;

  const updateProg = (updater) => {
    setProg(prev => { const next = { ...prev }; if (!next[todayKey]) next[todayKey] = { meals: {}, water: 0, weight: "", foodLog: [] }; updater(next[todayKey]); saveProgress(next); return { ...next }; });
  };

  const toggleMeal = (meal) => {
    updateProg(d => { d.meals = { ...d.meals, [meal]: !d.meals[meal] }; });
    requestNotificationPermission();
    try { if (!today.meals?.[meal] && "Notification" in window && Notification.permission === "granted") new Notification("✅ GlowUp AI", { body: `${meal} done! Great job!` }); } catch (e) {}
  };

  const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); const key = d.toISOString().split("T")[0]; const p = getProgress()[key]; return { label: d.toLocaleDateString("en", { weekday: "short" }), mealsDone: p ? Object.values(p.meals || {}).filter(Boolean).length : 0, isToday: i === 0 }; }).reverse();

  const meals = [
    { id: "breakfast", label: "Breakfast", icon: "🌅", time: "8:00 AM", cal: Math.round(nutrition.calories * 0.25) },
    { id: "lunch", label: "Lunch", icon: "☀️", time: "1:00 PM", cal: Math.round(nutrition.calories * 0.35) },
    { id: "snacks", label: "Snacks", icon: "🍎", time: "4:00 PM", cal: Math.round(nutrition.calories * 0.1) },
    { id: "dinner", label: "Dinner", icon: "🌙", time: "8:00 PM", cal: Math.round(nutrition.calories * 0.3) },
  ];

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 }}>‹</div>
        <div><div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>📊 Daily Progress</div><div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)" }}>{new Date().toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}</div></div>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 20, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <CircularProgress value={mealsDoneToday} max={4} size={80} color="#51CF66" label="Meals" sublabel="/4" />
          <CircularProgress value={today.water || 0} max={waterGoal} size={80} color="#4D96FF" label="Water" sublabel={`/${waterGoal}`} />
          <CircularProgress value={Math.min(totalTracked, nutrition.calories)} max={nutrition.calories} size={80} color="#FF6B6B" label="Calories" sublabel="kcal" />
        </div>
        <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(255,107,107,0.05)", borderRadius: 10, display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>Calorie Target</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "#FF6B6B" }}>{totalTracked} / {nutrition.calories} cal</div>
        </div>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>🍽️ Meals</div>
        {meals.map((meal, idx) => {
          const done = today.meals?.[meal.id];
          return (
            <div key={meal.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: idx < 3 ? "1px solid var(--border)" : "none" }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: done ? "rgba(81,207,102,0.15)" : "var(--surface)", border: `1.5px solid ${done ? "#51CF66" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{meal.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{meal.label}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>{meal.time} • ~{meal.cal} cal</div>
              </div>
              <div onClick={() => toggleMeal(meal.id)} style={{ padding: "8px 12px", borderRadius: 20, cursor: "pointer", background: done ? "rgba(81,207,102,0.15)" : "var(--surface)", border: `1.5px solid ${done ? "#51CF66" : "var(--border)"}`, fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: done ? "#51CF66" : "var(--muted)" }}>
                {done ? "✅ Done" : "Mark Done"}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 16, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>💧 Water</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#4D96FF" }}>{today.water || 0}/{waterGoal}</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {Array.from({ length: waterGoal }, (_, i) => (
            <div key={i} onClick={() => updateProg(d => { d.water = i + 1; })} style={{ width: 36, height: 36, borderRadius: 10, background: i < (today.water || 0) ? "rgba(77,150,255,0.2)" : "var(--surface)", border: `1.5px solid ${i < (today.water || 0) ? "#4D96FF" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer" }}>💧</div>
          ))}
        </div>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>⚖️ Today's Weight</div>
        <div style={{ display: "flex", gap: 10 }}>
          <input type="number" placeholder="kg" value={weightInput} onChange={e => setWeightInput(e.target.value)} style={{ flex: 1, background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "11px 14px", color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 14, outline: "none" }} />
          <button onClick={() => updateProg(d => { d.weight = weightInput; })} style={{ padding: "11px 18px", border: "none", borderRadius: 12, background: "var(--grad1)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save</button>
        </div>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 16 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>🔥 7-Day Streak</div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {last7.map((d, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: d.mealsDone >= 3 ? "linear-gradient(135deg,#51CF66,#20C997)" : d.isToday ? "rgba(255,107,107,0.2)" : "var(--surface)", border: `1.5px solid ${d.mealsDone >= 3 ? "#51CF66" : d.isToday ? "#FF6B6B" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                {d.mealsDone >= 3 ? "✅" : d.isToday ? "📍" : "○"}
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 9, color: d.isToday ? "var(--accent)" : "var(--muted)", fontWeight: d.isToday ? 700 : 400 }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function FitnessCoach() {
  const [screen, setScreen] = useState("landing");
  const [profile, setProfile] = useState(getProfile);

  const handleSelect = (id) => {
    if (!profile && id !== "profile_setup") { setScreen("profile_setup"); return; }
    setScreen(id);
  };

  if (screen === "landing") return <FitnessLanding onSelect={handleSelect} profile={profile} />;
  if (screen === "profile_setup") return <ProfileSetup onSave={(p) => { setProfile(p); setScreen("landing"); }} existing={profile} />;
  if (screen === "create_plan") return <CreateYourPlan profile={profile} onBack={() => setScreen("landing")} />;
  if (screen === "scanner") return <CalorieScanner onBack={() => setScreen("landing")} />;
  if (screen === "search") return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div onClick={() => setScreen("landing")} style={{ width: 36, height: 36, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 }}>‹</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>🔍 Food Search</div>
      </div>
      <FoodSearch onAdd={(food) => {
        const key = getTodayKey();
        const p = getProgress();
        if (!p[key]) p[key] = { foodLog: [], water: 0, meals: {} };
        p[key].foodLog = [...(p[key].foodLog || []), { ...food, time: new Date().toLocaleTimeString() }];
        saveProgress(p);
        setScreen("landing");
      }} />
    </div>
  );
  if (screen === "ai_plan") return <AIDietPlan profile={profile} onBack={() => setScreen("landing")} />;
  if (screen === "progress") return <DailyProgress profile={profile} onBack={() => setScreen("landing")} />;
  return <FitnessLanding onSelect={handleSelect} profile={profile} />;
}