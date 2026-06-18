import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { userAPI } from "../utils/api";

// ─── LANGUAGES ───────────────────────────────────────────────────────────────
const LANGUAGES = [
  { id: "en", flag: "🇬🇧", name: "English", native: "English" },
  { id: "hi", flag: "🇮🇳", name: "Hindi", native: "हिन्दी" },
  { id: "ur", flag: "🇵🇰", name: "Urdu", native: "اردو" },
  { id: "ar", flag: "🇸🇦", name: "Arabic", native: "العربية" },
  { id: "fr", flag: "🇫🇷", name: "French", native: "Français" },
  { id: "es", flag: "🇪🇸", name: "Spanish", native: "Español" },
  { id: "de", flag: "🇩🇪", name: "German", native: "Deutsch" },
  { id: "pt", flag: "🇧🇷", name: "Portuguese", native: "Português" },
  { id: "ru", flag: "🇷🇺", name: "Russian", native: "Русский" },
  { id: "zh", flag: "🇨🇳", name: "Chinese", native: "中文" },
  { id: "ja", flag: "🇯🇵", name: "Japanese", native: "日本語" },
  { id: "ko", flag: "🇰🇷", name: "Korean", native: "한국어" },
  { id: "tr", flag: "🇹🇷", name: "Turkish", native: "Türkçe" },
  { id: "it", flag: "🇮🇹", name: "Italian", native: "Italiano" },
  { id: "nl", flag: "🇳🇱", name: "Dutch", native: "Nederlands" },
  { id: "pl", flag: "🇵🇱", name: "Polish", native: "Polski" },
  { id: "bn", flag: "🇧🇩", name: "Bengali", native: "বাংলা" },
  { id: "pa", flag: "🇮🇳", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { id: "ta", flag: "🇮🇳", name: "Tamil", native: "தமிழ்" },
  { id: "te", flag: "🇮🇳", name: "Telugu", native: "తెలుగు" },
  { id: "mr", flag: "🇮🇳", name: "Marathi", native: "मराठी" },
  { id: "gu", flag: "🇮🇳", name: "Gujarati", native: "ગુજરાતી" },
  { id: "ml", flag: "🇮🇳", name: "Malayalam", native: "മലയാളം" },
  { id: "kn", flag: "🇮🇳", name: "Kannada", native: "ಕನ್ನಡ" },
  { id: "th", flag: "🇹🇭", name: "Thai", native: "ภาษาไทย" },
  { id: "vi", flag: "🇻🇳", name: "Vietnamese", native: "Tiếng Việt" },
  { id: "id", flag: "🇮🇩", name: "Indonesian", native: "Bahasa Indonesia" },
  { id: "ms", flag: "🇲🇾", name: "Malay", native: "Bahasa Melayu" },
  { id: "fa", flag: "🇮🇷", name: "Persian", native: "فارسی" },
  { id: "sw", flag: "🇰🇪", name: "Swahili", native: "Kiswahili" },
];

const GOALS = [
  { id: "weight_loss", icon: "🔥", label: "Weight Loss", desc: "Lose body fat" },
  { id: "muscle_building", icon: "💪", label: "Muscle Build", desc: "Build a strong body" },
  { id: "weight_gain", icon: "⬆️", label: "Weight Gain", desc: "Healthy weight gain" },
  { id: "skin_glow", icon: "✨", label: "Skin Glow", desc: "Improve skin health" },
  { id: "style_upgrade", icon: "👗", label: "Style Upgrade", desc: "Upgrade your fashion sense" },
  { id: "maintenance", icon: "⚖️", label: "Maintenance", desc: "Maintain current level" },
];

const SKIN_TYPES = [
  { id: "oily", icon: "💧", label: "Oily", desc: "Shiny, prone to acne" },
  { id: "dry", icon: "🏜️", label: "Dry", desc: "Tight, flaky skin" },
  { id: "normal", icon: "✅", label: "Normal", desc: "Balanced skin" },
  { id: "combination", icon: "☯️", label: "Combination", desc: "Oily T-zone, dry cheeks" },
  { id: "sensitive", icon: "🌸", label: "Sensitive", desc: "Easily irritated" },
];

const FEATURES = [
  { icon: "✨", label: "Face Analysis", desc: "AI face shape & hairstyle recommendations", color: "#FF6B6B", bg: "rgba(255,107,107,0.12)" },
  { icon: "💪", label: "Fitness Coach", desc: "Custom workout & diet plan", color: "#4D96FF", bg: "rgba(77,150,255,0.12)" },
  { icon: "👗", label: "Fashion Advisor", desc: "Outfit ideas for any occasion", color: "#845EF7", bg: "rgba(132,94,247,0.12)" },
  { icon: "🧴", label: "Skin Analysis", desc: "Personalized skincare routine", color: "#51CF66", bg: "rgba(81,207,102,0.12)" },
];

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState("en");
  const [langSearch, setLangSearch] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [skinType, setSkinType] = useState("");
  const [goal, setGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { user, refreshUser } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "there";
  const totalSteps = 8;

  const filteredLangs = LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.native.toLowerCase().includes(langSearch.toLowerCase())
  );

  const canNext = () => {
    if (step === 1) return !!language;
    if (step === 2) return !!gender;
    if (step === 3) return !!age && parseInt(age) > 0 && parseInt(age) < 120;
    if (step === 4) return !!height && !!weight;
    if (step === 5) return !!skinType;
    if (step === 6) return !!goal;
    return true;
  };

  const handleNext = async () => {
    if (!canNext()) return;

    if (step === totalSteps - 1) {
      setSaving(true);
      setError("");
      try {
        const profileData = {};
        if (language) profileData.language = language;
        if (gender) profileData.gender = gender;
        if (age && parseInt(age) > 0) profileData.age = parseInt(age);
        if (height && parseFloat(height) > 0) profileData.height = parseFloat(height);
        if (weight && parseFloat(weight) > 0) profileData.weight = parseFloat(weight);
        if (skinType) profileData.skinType = skinType;
        if (goal) profileData.goal = goal;

        await userAPI.updateProfile({ profile: profileData });
        await refreshUser();

        localStorage.setItem("glowup_onboarded", "true");
        localStorage.setItem("glowup_user_gender", gender);
        localStorage.setItem("glowup_language", language);

        onComplete();
      } catch (e) {
        console.error("Profile save error:", e.response?.data || e.message);
        setError("Could not save profile. Please try again.");
      }
      setSaving(false);
      return;
    }

    setStep(s => s + 1);
  };

  const inputStyle = {
    width: "100%",
    background: "var(--surface)",
    border: "1.5px solid var(--border)",
    borderRadius: 14,
    padding: "14px 16px",
    color: "var(--text)",
    fontFamily: "var(--font-body)",
    fontSize: 16,
    outline: "none",
    boxSizing: "border-box",
    textAlign: "center",
  };

  const bmiValue = height && weight
    ? (parseFloat(weight) / ((parseFloat(height) / 100) ** 2)).toFixed(1)
    : null;

  const bmiCategory = () => {
    const bmi = parseFloat(bmiValue);
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal ✅";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "var(--bg)",
      zIndex: 2000, display: "flex", flexDirection: "column", overflow: "hidden",
    }}>

      {/* Progress bar */}
      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{
          height: "100%",
          width: `${((step + 1) / totalSteps) * 100}%`,
          background: "linear-gradient(90deg, #FF6B6B, #845EF7, #4D96FF)",
          transition: "width 0.5s cubic-bezier(0.34,1.56,0.64,1)",
          borderRadius: 2
        }} />
      </div>

      {/* Step dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "12px 0 0" }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} style={{
            height: 5, borderRadius: 3,
            width: i === step ? 20 : 5,
            background: i <= step
              ? "linear-gradient(90deg, #FF6B6B, #845EF7)"
              : "rgba(255,255,255,0.1)",
            transition: "all 0.3s ease"
          }} />
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 0" }}>

        {/* STEP 0: Welcome */}
        {step === 0 && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{
                width: 90, height: 90, borderRadius: 28,
                background: "linear-gradient(135deg, #FF6B6B, #845EF7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 42, margin: "0 auto 20px",
                boxShadow: "0 16px 48px rgba(132,94,247,0.35)"
              }}>✨</div>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800,
                color: "var(--text)", lineHeight: 1.2, marginBottom: 10
              }}>
                Welcome to{" "}
                <span style={{
                  background: "linear-gradient(135deg, #FF6B6B, #845EF7)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>GlowUp AI</span>
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
                Set up your profile in just 2 minutes<br />and get 100% personalized results!
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {FEATURES.map((f, i) => (
                <div key={i} style={{
                  background: "var(--card)", border: "1px solid var(--border)",
                  borderRadius: 18, padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 14
                }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                    background: f.bg, border: `1px solid ${f.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
                  }}>{f.icon}</div>
                  <div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{f.label}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)" }}>{f.desc}</div>
                  </div>
                  <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: f.color, flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1: Language Selection */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{
                width: 70, height: 70, borderRadius: 22,
                background: "linear-gradient(135deg, #4D96FF, #845EF7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, margin: "0 auto 16px"
              }}>🌍</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>
                Choose Your Language
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)" }}>
                Select the language you're most comfortable with
              </div>
            </div>

            <input
              type="text"
              placeholder="🔍 Search language..."
              value={langSearch}
              onChange={e => setLangSearch(e.target.value)}
              style={{ ...inputStyle, textAlign: "left", marginBottom: 12, fontSize: 14, padding: "12px 16px" }}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 380, overflowY: "auto" }}>
              {filteredLangs.map(l => (
                <div key={l.id} onClick={() => setLanguage(l.id)}
                  style={{
                    padding: "12px 16px", borderRadius: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 12,
                    background: language === l.id
                      ? "linear-gradient(135deg, rgba(77,150,255,0.12), rgba(132,94,247,0.12))"
                      : "var(--card)",
                    border: `2px solid ${language === l.id ? "#845EF7" : "var(--border)"}`,
                    transition: "all 0.2s",
                  }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{l.flag}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700,
                      color: language === l.id ? "#845EF7" : "var(--text)"
                    }}>{l.native}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>{l.name}</div>
                  </div>
                  {language === l.id && (
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", background: "#845EF7",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, color: "#fff", flexShrink: 0
                    }}>✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Gender */}
        {step === 2 && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{
                width: 70, height: 70, borderRadius: 22,
                background: "linear-gradient(135deg, #4D96FF, #845EF7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, margin: "0 auto 16px"
              }}>👤</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>
                Who are you?
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)" }}>
                Required for hairstyle & fashion recommendations
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { id: "male", icon: "👨", label: "Male", color: "#4D96FF" },
                { id: "female", icon: "👩", label: "Female", color: "#FF6B9D" },
                { id: "other", icon: "🧑", label: "Other", color: "#845EF7" },
              ].map(g => (
                <div key={g.id} onClick={() => setGender(g.id)}
                  style={{
                    flex: 1, padding: "22px 10px", borderRadius: 20,
                    cursor: "pointer", textAlign: "center",
                    background: gender === g.id ? `${g.color}15` : "var(--card)",
                    border: `2px solid ${gender === g.id ? g.color : "var(--border)"}`,
                    transition: "all 0.2s",
                    transform: gender === g.id ? "scale(1.04)" : "scale(1)"
                  }}>
                  <div style={{ fontSize: 38, marginBottom: 10 }}>{g.icon}</div>
                  <div style={{
                    fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700,
                    color: gender === g.id ? g.color : "var(--text)"
                  }}>{g.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Age */}
        {step === 3 && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{
                width: 70, height: 70, borderRadius: 22,
                background: "linear-gradient(135deg, #FFD93D, #FF6B6B)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, margin: "0 auto 16px"
              }}>🎂</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>
                How old are you?
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)" }}>
                For age-appropriate recommendations
              </div>
            </div>
            <input
              type="number" placeholder="25" value={age}
              onChange={e => setAge(e.target.value)}
              style={{ ...inputStyle, fontSize: 32, fontWeight: 800, padding: "20px" }}
            />
            <div style={{ textAlign: "center", marginTop: 8, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)" }}>
              years old
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap", justifyContent: "center" }}>
              {[18, 20, 22, 25, 28, 30, 35].map(a => (
                <div key={a} onClick={() => setAge(String(a))}
                  style={{
                    padding: "8px 16px", borderRadius: 20, cursor: "pointer",
                    background: age === String(a) ? "rgba(255,107,107,0.15)" : "var(--card)",
                    border: `1.5px solid ${age === String(a) ? "#FF6B6B" : "var(--border)"}`,
                    fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700,
                    color: age === String(a) ? "#FF6B6B" : "var(--muted)"
                  }}>{a}</div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Height & Weight */}
        {step === 4 && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{
                width: 70, height: 70, borderRadius: 22,
                background: "linear-gradient(135deg, #51CF66, #20C997)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, margin: "0 auto 16px"
              }}>📏</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>
                Height & Weight
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)" }}>
                Required for BMI and fitness plan
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", marginBottom: 8, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>
                Height (cm)
              </div>
              <input type="number" placeholder="170" value={height}
                onChange={e => setHeight(e.target.value)}
                style={{ ...inputStyle, fontSize: 28, fontWeight: 800 }} />
              <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "center", flexWrap: "wrap" }}>
                {[155, 160, 165, 170, 175, 180, 185].map(h => (
                  <div key={h} onClick={() => setHeight(String(h))}
                    style={{
                      padding: "6px 10px", borderRadius: 12, cursor: "pointer",
                      background: height === String(h) ? "rgba(81,207,102,0.15)" : "var(--card)",
                      border: `1.5px solid ${height === String(h) ? "#51CF66" : "var(--border)"}`,
                      fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                      color: height === String(h) ? "#51CF66" : "var(--muted)"
                    }}>{h}</div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", marginBottom: 8, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>
                Weight (kg)
              </div>
              <input type="number" placeholder="70" value={weight}
                onChange={e => setWeight(e.target.value)}
                style={{ ...inputStyle, fontSize: 28, fontWeight: 800 }} />
              <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "center", flexWrap: "wrap" }}>
                {[50, 55, 60, 65, 70, 75, 80].map(w => (
                  <div key={w} onClick={() => setWeight(String(w))}
                    style={{
                      padding: "6px 10px", borderRadius: 12, cursor: "pointer",
                      background: weight === String(w) ? "rgba(81,207,102,0.15)" : "var(--card)",
                      border: `1.5px solid ${weight === String(w) ? "#51CF66" : "var(--border)"}`,
                      fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                      color: weight === String(w) ? "#51CF66" : "var(--muted)"
                    }}>{w}</div>
                ))}
              </div>
            </div>

            {height && weight && (
              <div style={{
                marginTop: 16, padding: "12px 16px",
                background: "rgba(77,150,255,0.08)", borderRadius: 14,
                border: "1px solid rgba(77,150,255,0.2)", textAlign: "center"
              }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)" }}>Your BMI</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 800, color: "#4D96FF" }}>
                  {bmiValue}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>
                  {bmiCategory()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Skin Type */}
        {step === 5 && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{
                width: 70, height: 70, borderRadius: 22,
                background: "linear-gradient(135deg, #FF6B9D, #845EF7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, margin: "0 auto 16px"
              }}>🧴</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>
                What's your skin type?
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)" }}>
                We'll personalize your skincare recommendations
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SKIN_TYPES.map(s => (
                <div key={s.id} onClick={() => setSkinType(s.id)}
                  style={{
                    padding: "16px 18px", borderRadius: 16, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 14,
                    background: skinType === s.id
                      ? "linear-gradient(135deg, rgba(255,107,157,0.1), rgba(132,94,247,0.1))"
                      : "var(--card)",
                    border: `2px solid ${skinType === s.id ? "#845EF7" : "var(--border)"}`,
                    transition: "all 0.2s",
                    transform: skinType === s.id ? "scale(1.02)" : "scale(1)"
                  }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                    background: skinType === s.id ? "rgba(132,94,247,0.15)" : "var(--surface)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
                  }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700,
                      color: skinType === s.id ? "#845EF7" : "var(--text)"
                    }}>{s.label}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{s.desc}</div>
                  </div>
                  {skinType === s.id && (
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", background: "#845EF7",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, color: "#fff", flexShrink: 0
                    }}>✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: Goal */}
        {step === 6 && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{
                width: 70, height: 70, borderRadius: 22,
                background: "linear-gradient(135deg, #FF6B6B, #FFD93D)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, margin: "0 auto 16px"
              }}>🎯</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>
                What's your main goal?
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)" }}>
                Personalize your GlowUp journey
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {GOALS.map(g => (
                <div key={g.id} onClick={() => setGoal(g.id)}
                  style={{
                    padding: "18px 14px", borderRadius: 18, cursor: "pointer", textAlign: "center",
                    background: goal === g.id
                      ? "linear-gradient(135deg, rgba(255,107,107,0.15), rgba(132,94,247,0.15))"
                      : "var(--card)",
                    border: `2px solid ${goal === g.id ? "#845EF7" : "var(--border)"}`,
                    transition: "all 0.2s",
                    transform: goal === g.id ? "scale(1.04)" : "scale(1)"
                  }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{g.icon}</div>
                  <div style={{
                    fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700,
                    color: goal === g.id ? "#845EF7" : "var(--text)", marginBottom: 4
                  }}>{g.label}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>{g.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: Ready */}
        {step === 7 && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{
                width: 90, height: 90, borderRadius: 28,
                background: "linear-gradient(135deg, #51CF66, #20C997)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 42, margin: "0 auto 20px",
                boxShadow: "0 16px 48px rgba(81,207,102,0.35)"
              }}>🚀</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>
                All set,{" "}
                <span style={{
                  background: "linear-gradient(135deg, #51CF66, #20C997)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>{firstName}!</span>
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--muted)" }}>
                Your profile is complete ✨
              </div>
            </div>

            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 20, marginBottom: 14 }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", marginBottom: 14, letterSpacing: 1, textTransform: "uppercase" }}>
                Your Profile
              </div>
              {[
                { icon: "🌍", label: "Language", value: LANGUAGES.find(l => l.id === language)?.native, color: "#4D96FF" },
                { icon: gender === "male" ? "👨" : gender === "female" ? "👩" : "🧑", label: "Gender", value: gender === "male" ? "Male" : gender === "female" ? "Female" : "Other", color: "#4D96FF" },
                { icon: "🎂", label: "Age", value: `${age} years`, color: "#FFD93D" },
                { icon: "📏", label: "Height", value: `${height} cm`, color: "#51CF66" },
                { icon: "⚖️", label: "Weight", value: `${weight} kg`, color: "#FF6B6B" },
                { icon: "🧴", label: "Skin Type", value: SKIN_TYPES.find(s => s.id === skinType)?.label, color: "#845EF7" },
                { icon: GOALS.find(g => g.id === goal)?.icon || "🎯", label: "Goal", value: GOALS.find(g => g.id === goal)?.label, color: "#FF6B9D" },
              ].map((item, i, arr) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "8px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none"
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `${item.color}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, flexShrink: 0
                  }}>{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>{item.label}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{item.value}</div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                </div>
              ))}
            </div>

            <div style={{
              background: "linear-gradient(135deg, rgba(255,107,107,0.08), rgba(132,94,247,0.08))",
              border: "1px solid rgba(132,94,247,0.2)", borderRadius: 16, padding: "14px 16px"
            }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#845EF7", fontWeight: 700, marginBottom: 8 }}>
                ✨ Here's what you'll get
              </div>
              {[
                "Face shape & gender-accurate hairstyle suggestions",
                "Age-appropriate skincare routine",
                "BMI-based fitness & diet plan",
                "Personalized fashion recommendations",
                "Skin type specific product suggestions",
              ].map((item, i) => (
                <div key={i} style={{
                  fontFamily: "var(--font-body)", fontSize: 12,
                  color: "var(--muted)", marginBottom: 4, display: "flex", gap: 8
                }}>
                  <span style={{ color: "#51CF66" }}>✓</span> {item}
                </div>
              ))}
            </div>

            {error && (
              <div style={{
                marginTop: 12, padding: "10px 14px",
                background: "rgba(255,107,107,0.1)",
                border: "1px solid rgba(255,107,107,0.3)",
                borderRadius: 12, fontFamily: "var(--font-body)",
                fontSize: 13, color: "#FF6B6B", textAlign: "center"
              }}>
                ⚠️ {error}
              </div>
            )}
          </div>
        )}

        <div style={{ height: 20 }} />
      </div>

      {/* Bottom Button */}
      <div style={{
        padding: "16px 20px 32px", flexShrink: 0,
        background: "linear-gradient(to top, var(--bg) 80%, transparent)"
      }}>
        <button
          onClick={handleNext}
          disabled={!canNext() || saving}
          style={{
            width: "100%", padding: "16px", border: "none", borderRadius: 16,
            cursor: canNext() && !saving ? "pointer" : "not-allowed",
            background: canNext() && !saving
              ? "linear-gradient(135deg, #FF6B6B, #845EF7)"
              : "var(--surface)",
            color: "#fff",
            fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 700,
            boxShadow: canNext() ? "0 8px 28px rgba(132,94,247,0.4)" : "none",
            transition: "all 0.2s",
            opacity: canNext() && !saving ? 1 : 0.5,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8
          }}>
          {saving ? (
            <>
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "#fff",
                animation: "spin 0.75s linear infinite"
              }} />
              Saving...
            </>
          ) : step === 0 ? "Get Started →"
            : step === totalSteps - 1 ? "🚀 Start My GlowUp!"
            : "Next →"}
        </button>

        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={saving}
            style={{
              width: "100%", marginTop: 10, padding: "12px", border: "none",
              background: "transparent", fontFamily: "var(--font-body)",
              fontSize: 13, color: "var(--muted)", cursor: "pointer"
            }}>
            ← Go Back
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}