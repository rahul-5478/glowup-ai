import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";

const DAILY_TIPS = [
  { icon: "💧", tip: "Drink 3L water today — skin becomes 40% clearer in just 2 weeks!", category: "Skin" },
  { icon: "🌅", tip: "Apply SPF 30+ every morning — it's the #1 anti-aging product!", category: "Skincare" },
  { icon: "💪", tip: "10 mins morning stretching increases energy by 20% all day!", category: "Fitness" },
  { icon: "🥗", tip: "Include turmeric in your diet — natural anti-inflammatory for glowing skin!", category: "Nutrition" },
  { icon: "😴", tip: "7-8 hours sleep = natural face lift. Collagen repairs at night!", category: "Recovery" },
  { icon: "🚿", tip: "Cold water face wash in the morning tightens pores instantly!", category: "Grooming" },
  { icon: "🧴", tip: "Vitamin C serum in morning + Retinol at night = perfect anti-aging combo!", category: "Skincare" },
  { icon: "🏃", tip: "20 mins cardio daily boosts skin blood flow — natural glow guaranteed!", category: "Fitness" },
  { icon: "✂️", tip: "Trim hair every 6-8 weeks — prevents split ends and looks 10x fresher!", category: "Hair" },
  { icon: "🍳", tip: "Eggs for breakfast = biotin boost. Best natural food for strong hair!", category: "Hair" },
  { icon: "🧘", tip: "Stress shows on face first. 5 min meditation = visible skin improvement!", category: "Wellness" },
  { icon: "🌙", tip: "Never sleep with makeup on — it ages skin 3x faster overnight!", category: "Skincare" },
  { icon: "👟", tip: "Compound exercises (squats, deadlifts) burn fat 3x more than cardio!", category: "Fitness" },
  { icon: "🫧", tip: "Clean your phone screen daily — it has more bacteria than a toilet seat!", category: "Skincare" },
];

const QUICK_ACTIONS = [
  { icon: "✨", label: "Face Scan", sub: "AI analysis", tab: 1, color: "#FF6B6B", glow: "rgba(255,107,107,0.25)" },
  { icon: "💪", label: "Fitness", sub: "Workout plan", tab: 2, color: "#4D96FF", glow: "rgba(77,150,255,0.25)" },
  { icon: "👗", label: "Fashion", sub: "Outfit ideas", tab: 3, color: "#845EF7", glow: "rgba(132,94,247,0.25)" },
  { icon: "🧴", label: "Skin", sub: "Skincare", tab: 4, color: "#51CF66", glow: "rgba(81,207,102,0.25)" },
  { icon: "💅", label: "AI Chat", sub: "Style coach", tab: 5, color: "#FFD93D", glow: "rgba(255,217,61,0.25)" },
  { icon: "👚", label: "Wardrobe", sub: "My outfits", tab: 6, color: "#FF6B9D", glow: "rgba(255,107,157,0.25)" },
];

function AnimatedNumber({ target, duration = 1000 }) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current || target === 0) { setCount(target); return; }
    started.current = true;
    const steps = 20;
    const inc = target / steps;
    let cur = 0;
    const timer = setInterval(() => {
      cur += inc;
      if (cur >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(cur));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}</span>;
}

function GlowRing({ score }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const [anim, setAnim] = useState(0);
  useEffect(() => { setTimeout(() => setAnim(score), 300); }, [score]);
  const dash = (anim / 100) * circ;
  const grade = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B+" : score >= 60 ? "B" : "C";

  return (
    <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
      <svg width={100} height={100} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF4D6D" />
            <stop offset="50%" stopColor="#C77DFF" />
            <stop offset="100%" stopColor="#4361EE" />
          </linearGradient>
        </defs>
        <circle cx={50} cy={50} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
        <circle cx={50} cy={50} r={r} fill="none" stroke="url(#ringGrad)" strokeWidth={8}
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 1.4s cubic-bezier(0.34,1.56,0.64,1)", filter: "drop-shadow(0 0 6px rgba(199,125,255,0.5))" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg,#FF4D6D,#C77DFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>{score}</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 800, color: "#C77DFF", lineHeight: 1, marginTop: 2 }}>{grade}</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 7, color: "var(--muted)", marginTop: 2, letterSpacing: 1, textTransform: "uppercase" }}>Glow</div>
      </div>
    </div>
  );
}

export default function Dashboard({ setTab }) {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "there";

  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Good night" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Good night";
  const greetingEmoji = hour < 5 ? "🌙" : hour < 12 ? "🌅" : hour < 17 ? "☀️" : hour < 21 ? "🌆" : "🌙";

  const faceScans = parseInt(localStorage.getItem("glowup_face_count") || "0");
  const workouts = parseInt(localStorage.getItem("glowup_fitness_count") || "0");
  const styles = parseInt(localStorage.getItem("glowup_fashion_count") || "0");
  const skinChecks = parseInt(localStorage.getItem("glowup_skin_count") || "0");
  const totalActivity = faceScans + workouts + styles + skinChecks;
  const glowScore = Math.min(100, Math.max(10, 20 + totalActivity * 8 + (user ? 10 : 0)));

  const dayIndex = new Date().getDate() % DAILY_TIPS.length;
  const [currentTip, setCurrentTip] = useState(dayIndex);
  const [tipVisible, setTipVisible] = useState(false);
  useEffect(() => { setTimeout(() => setTipVisible(true), 500); }, []);

  const nextTip = () => {
    setTipVisible(false);
    setTimeout(() => { setCurrentTip(p => (p + 1) % DAILY_TIPS.length); setTipVisible(true); }, 250);
  };
  const tip = DAILY_TIPS[currentTip];
  const journeyDone = [faceScans > 0, workouts > 0, styles > 0, skinChecks > 0, false];
  const journeyProgress = journeyDone.filter(Boolean).length;

  return (
    <div style={{ padding: "0 16px 100px" }}>

      {/* ── Hero Card ── */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,77,109,0.08), rgba(199,125,255,0.08), rgba(67,97,238,0.05))",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 24, padding: "18px 16px", marginBottom: 12,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -20, right: 70, width: 100, height: 100, background: "radial-gradient(circle, rgba(199,125,255,0.1), transparent 70%)", pointerEvents: "none" }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>
            <span>{greetingEmoji}</span><span>{greeting}</span>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--text)", lineHeight: 1.2, marginBottom: 5 }}>
            {firstName}! <span style={{ background: "var(--grad1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>✨</span>
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
            {totalActivity === 0 ? "Start your glow journey today 🚀" : `${totalActivity} analyses done — keep glowing! 🔥`}
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,190,11,0.1)", border: "1px solid rgba(255,190,11,0.2)", borderRadius: 20, padding: "4px 10px" }}>
            <span style={{ fontSize: 12 }}>🔥</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "#FFB800" }}>
              {Math.max(1, Math.ceil(totalActivity / 2))} day streak
            </span>
          </div>
        </div>

        <GlowRing score={glowScore} />
      </div>

      {/* ── Stats Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        {[
          { label: "Face", count: faceScans, icon: "✨", color: "#FF4D6D", tab: 1 },
          { label: "Fitness", count: workouts, icon: "💪", color: "#4361EE", tab: 2 },
          { label: "Style", count: styles, icon: "👗", color: "#C77DFF", tab: 3 },
          { label: "Skin", count: skinChecks, icon: "🧴", color: "#06D6A0", tab: 4 },
        ].map(stat => (
          <div key={stat.label} onClick={() => setTab(stat.tab)}
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "12px 6px", textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 800, color: stat.color, lineHeight: 1 }}>
              <AnimatedNumber target={stat.count} />
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 8, color: "var(--muted)", marginTop: 3, letterSpacing: 0.3, textTransform: "uppercase" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>⚡ Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {QUICK_ACTIONS.map(action => (
            <div key={action.tab} onClick={() => setTab(action.tab)}
              style={{
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: 18, padding: "14px 8px", cursor: "pointer", textAlign: "center",
                position: "relative", overflow: "hidden",
                transition: "transform 0.15s",
                WebkitTapHighlightColor: "transparent",
              }}
              onTouchStart={e => e.currentTarget.style.transform = "scale(0.94)"}
              onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <div style={{ position: "absolute", top: -8, right: -8, width: 40, height: 40, background: `radial-gradient(circle, ${action.glow}, transparent 70%)`, pointerEvents: "none" }} />
              <div style={{
                width: 40, height: 40, borderRadius: 13,
                background: `${action.color}18`, border: `1px solid ${action.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, margin: "0 auto 8px",
              }}>{action.icon}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "var(--text)" }}>{action.label}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--muted)", marginTop: 1 }}>{action.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Journey Progress ── */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>🏆 GlowUp Journey</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#C77DFF", fontWeight: 700 }}>{journeyProgress}/5</div>
        </div>
        <div style={{ height: 4, background: "var(--border)", borderRadius: 3, marginBottom: 14, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(journeyProgress / 5) * 100}%`, background: "linear-gradient(90deg, #FF4D6D, #C77DFF, #4361EE)", borderRadius: 3, transition: "width 1.2s cubic-bezier(0.34,1.56,0.64,1)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {[
            { icon: "📸", label: "Face", done: faceScans > 0, tab: 1 },
            { icon: "💪", label: "Fit", done: workouts > 0, tab: 2 },
            { icon: "👗", label: "Style", done: styles > 0, tab: 3 },
            { icon: "🧴", label: "Skin", done: skinChecks > 0, tab: 4 },
            { icon: "👑", label: "Pro", done: false, tab: 7 },
          ].map((step, i) => (
            <div key={i} onClick={() => setTab(step.tab)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: step.done ? "linear-gradient(135deg,#06D6A0,#4361EE)" : i === journeyProgress ? "linear-gradient(135deg,#FF4D6D,#C77DFF)" : "var(--surface)",
                border: `2px solid ${step.done ? "#06D6A0" : i === journeyProgress ? "#C77DFF" : "var(--border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                boxShadow: step.done ? "0 3px 10px rgba(6,214,160,0.3)" : i === journeyProgress ? "0 3px 10px rgba(199,125,255,0.3)" : "none",
              }}>
                {step.done ? "✓" : step.icon}
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 8, color: step.done ? "#06D6A0" : "var(--muted)", fontWeight: step.done ? 700 : 400 }}>{step.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Daily Tip ── */}
      <div onClick={nextTip} style={{
        background: "linear-gradient(135deg, rgba(255,190,11,0.06), rgba(255,77,109,0.04))",
        border: "1px solid rgba(255,190,11,0.15)",
        borderRadius: 20, padding: 16, marginBottom: 12, cursor: "pointer",
        opacity: tipVisible ? 1 : 0, transform: tipVisible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.3s, transform 0.3s",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>{tip.icon}</span>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, color: "#FFB800", letterSpacing: 0.8, textTransform: "uppercase" }}>{tip.category} Tip</div>
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--muted2)" }}>tap →</div>
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{tip.tip}</div>
      </div>

      {/* ── CTA or Activity ── */}
      {totalActivity === 0 ? (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 24, textAlign: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌟</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>
            Start Your Transformation
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", marginBottom: 18, lineHeight: 1.6 }}>
            Upload a selfie to get AI-powered face shape analysis, skincare routine & hairstyle recommendations!
          </div>
          <div onClick={() => setTab(1)} style={{
            display: "inline-block", background: "var(--grad1)", color: "#fff",
            fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700,
            padding: "13px 28px", borderRadius: 14, cursor: "pointer",
            boxShadow: "0 8px 24px rgba(255,77,109,0.35)"
          }}>
            ✨ Analyze My Face
          </div>
        </div>
      ) : (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 16, marginBottom: 12 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>📋 Recent Activity</div>
          {[
            faceScans > 0 && { icon: "✨", label: "Face Analysis", detail: `${faceScans} scans done`, color: "#FF4D6D", tab: 1 },
            workouts > 0 && { icon: "💪", label: "Fitness Plans", detail: `${workouts} plans created`, color: "#4361EE", tab: 2 },
            styles > 0 && { icon: "👗", label: "Fashion Advice", detail: `${styles} looks styled`, color: "#C77DFF", tab: 3 },
            skinChecks > 0 && { icon: "🧴", label: "Skin Analysis", detail: `${skinChecks} checks done`, color: "#06D6A0", tab: 4 },
          ].filter(Boolean).slice(0, 4).map((item, i, arr) => (
            <div key={i} onClick={() => setTab(item.tab)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer" }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: `${item.color}15`, border: `1px solid ${item.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{item.label}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{item.detail}</div>
              </div>
              <div style={{ color: "var(--muted2)", fontSize: 16 }}>›</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Premium Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #0D0A1E, #0A1628)",
        border: "1px solid rgba(199,125,255,0.2)",
        borderRadius: 20, padding: "16px 16px",
        display: "flex", alignItems: "center", gap: 14,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -15, right: -5, width: 80, height: 80, background: "radial-gradient(circle, rgba(199,125,255,0.12), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ fontSize: 32 }}>👑</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 3 }}>Unlock GlowUp Premium</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>Unlimited AI scans + Priority AI + All features</div>
        </div>
        <div onClick={() => setTab(7)} style={{
          background: "linear-gradient(135deg,#C77DFF,#4361EE)", color: "#fff",
          fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700,
          padding: "9px 14px", borderRadius: 12, cursor: "pointer",
          whiteSpace: "nowrap", flexShrink: 0,
          boxShadow: "0 4px 14px rgba(199,125,255,0.3)"
        }}>
          ₹299/mo
        </div>
      </div>

    </div>
  );
}