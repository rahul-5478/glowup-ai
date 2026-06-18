import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "https://glowup-ai-backend-1.onrender.com/api";

const BADGES = {
  "Skin Star": "🌟",
  "Fitness Beast": "💪",
  "Fashion Icon": "👑",
  "Glow Getter": "✨",
  "Consistency King": "🔥",
  "Perfect Week": "💯",
};

export default function GlowTracker() {
  const [scores, setScores] = useState([]);
  const [latest, setLatest] = useState(null);
  const [trend, setTrend] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({ skinScore: 70, fitnessScore: 70, fashionScore: 70, notes: "" });

  const token = localStorage.getItem("glowup_token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [histRes, latestRes] = await Promise.all([
        axios.get(`${API}/glow/history`, { headers }),
        axios.get(`${API}/glow/latest`, { headers }),
      ]);
      setScores(histRes.data.scores || []);
      setLatest(latestRes.data.latest);
      setTrend(latestRes.data.trend || 0);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const saveScore = async () => {
    setSaving(true);
    try {
      const res = await axios.post(`${API}/glow/score`, form, { headers });
      setResult(res.data.weekData);
      setShowForm(false);
      fetchData();
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const getColor = (score) => score >= 90 ? "#51CF66" : score >= 75 ? "#4D96FF" : score >= 60 ? "#FFD93D" : "#FF6B6B";

  const ScoreBar = ({ score }) => {
    const color = getColor(score);
    return (
      <div style={{ background: "var(--surface)", borderRadius: 6, height: 6, overflow: "hidden", marginTop: 4 }}>
        <div style={{ width: `${score}%`, height: "100%", background: `linear-gradient(90deg, ${color}, ${color}99)`, borderRadius: 6, transition: "width 1s ease" }} />
      </div>
    );
  };

  return (
    <div style={{ padding: "0 16px 100px" }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: -0.5 }}>
          ✨ Glow <span style={{ background: "linear-gradient(135deg,#FF4D6D,#C77DFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Tracker</span>
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", marginTop: 3 }}>
          Track your weekly beauty & fitness progress
        </div>
      </div>

      {/* Latest Score Card */}
      {latest ? (
        <div style={{
          background: "linear-gradient(135deg, #FF4D6D, #C77DFF, #4361EE)",
          borderRadius: 24, padding: 24, marginBottom: 16,
          position: "relative", overflow: "hidden",
          boxShadow: "0 12px 40px rgba(255,77,109,0.3)",
        }}>
          <div style={{ position: "absolute", top: -30, right: -30, fontSize: 120, opacity: 0.07, lineHeight: 1 }}>✨</div>
          <div style={{ position: "absolute", bottom: -20, left: -20, width: 120, height: 120, background: "rgba(255,255,255,0.05)", borderRadius: "50%", pointerEvents: "none" }} />

          <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "rgba(255,255,255,0.65)", marginBottom: 6, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>
            This Week's Glow Score
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 10 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 72, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
              {latest.overallScore}
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "rgba(255,255,255,0.9)", fontWeight: 800, lineHeight: 1 }}>
                {latest.grade || "B+"}
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                <span>{trend > 0 ? "▲" : trend < 0 ? "▼" : "→"}</span>
                <span>{trend > 0 ? `+${trend}` : trend < 0 ? trend : "Stable"} from last week</span>
              </div>
            </div>
          </div>

          <div style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "#fff", fontWeight: 700, marginBottom: 6 }}>
            {latest.title || "Keep Glowing!"}
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.55 }}>
            {latest.insight}
          </div>

          {/* Mini score bars */}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {[
              { label: "Skin", score: latest.skinScore, emoji: "💅" },
              { label: "Fit", score: latest.fitnessScore, emoji: "💪" },
              { label: "Fashion", score: latest.fashionScore, emoji: "👗" },
            ].map(item => (
              <div key={item.label} style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "8px 10px", backdropFilter: "blur(4px)" }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "rgba(255,255,255,0.7)", marginBottom: 3 }}>{item.emoji} {item.label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "#fff" }}>{item.score}</div>
              </div>
            ))}
          </div>

          {latest.badges && latest.badges.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
              {latest.badges.map((badge, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", borderRadius: 20, padding: "4px 12px", fontFamily: "var(--font-body)", fontSize: 11, color: "#fff", fontWeight: 700 }}>
                  {BADGES[badge] || "🏅"} {badge}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: "var(--card)", borderRadius: 20, padding: 28, marginBottom: 16, textAlign: "center", border: "2px dashed var(--border)" }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>✨</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--text)", fontWeight: 700 }}>No scores yet!</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Log your first weekly glow score</div>
        </div>
      )}

      {/* Breakdown */}
      {latest && (
        <div style={{ background: "var(--card)", borderRadius: 20, padding: 20, marginBottom: 14, border: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>📊 Score Breakdown</div>
          {[
            { label: "💅 Skin", score: latest.skinScore, feedback: latest.skinFeedback, color: "#FF6B9D" },
            { label: "💪 Fitness", score: latest.fitnessScore, feedback: latest.fitnessFeedback, color: "#4D96FF" },
            { label: "👗 Fashion", score: latest.fashionScore, feedback: latest.fashionFeedback, color: "#C77DFF" },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: i < 2 ? 16 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{item.label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: item.color }}>{item.score}</div>
              </div>
              <div style={{ background: "var(--surface)", borderRadius: 8, height: 8, overflow: "hidden", marginBottom: 5 }}>
                <div style={{ width: `${item.score}%`, height: "100%", background: `linear-gradient(90deg, ${item.color}, ${item.color}80)`, borderRadius: 8, transition: "width 1s ease" }} />
              </div>
              {item.feedback && <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>{item.feedback}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Win / Focus */}
      {latest && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div style={{ background: "rgba(81,207,102,0.08)", border: "1px solid rgba(81,207,102,0.25)", borderRadius: 18, padding: 14 }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>🏆</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "#51CF66", fontWeight: 700, marginBottom: 5, letterSpacing: 0.8, textTransform: "uppercase" }}>Top Win</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text)", lineHeight: 1.5 }}>{latest.topWin}</div>
          </div>
          <div style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.25)", borderRadius: 18, padding: 14 }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>🎯</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "#FF4D6D", fontWeight: 700, marginBottom: 5, letterSpacing: 0.8, textTransform: "uppercase" }}>Focus Next</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text)", lineHeight: 1.5 }}>{latest.focusNext}</div>
          </div>
        </div>
      )}

      {/* History Chart */}
      {scores.length > 1 && (
        <div style={{ background: "var(--card)", borderRadius: 20, padding: 20, marginBottom: 14, border: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>📈 Progress History</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80, paddingBottom: 4 }}>
            {scores.slice(0, 8).reverse().map((s, i, arr) => {
              const isLatest = i === arr.length - 1;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <div style={{
                    width: "100%",
                    background: isLatest ? "linear-gradient(to top, #FF4D6D, #C77DFF)" : "linear-gradient(to top, rgba(255,77,109,0.3), rgba(199,125,255,0.3))",
                    borderRadius: "5px 5px 0 0",
                    height: `${Math.max(6, s.overallScore * 0.8)}%`,
                    minHeight: 8,
                    transition: "height 0.8s ease",
                    boxShadow: isLatest ? "0 0 10px rgba(255,77,109,0.3)" : "none",
                  }} />
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 8, color: isLatest ? "var(--accent)" : "var(--muted)", fontWeight: isLatest ? 700 : 400 }}>W{s.week}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Motivational Quote */}
      {latest?.motivationalQuote && (
        <div style={{ background: "linear-gradient(135deg, rgba(255,77,109,0.06), rgba(199,125,255,0.06))", border: "1px solid rgba(199,125,255,0.15)", borderRadius: 18, padding: 18, marginBottom: 14, textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>💫</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--text)", fontStyle: "italic", lineHeight: 1.6 }}>
            "{latest.motivationalQuote}"
          </div>
        </div>
      )}

      {/* Gemini badge */}
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: "6px 14px" }}>
          <span style={{ fontSize: 12 }}>🤖</span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>
            Insights powered by{" "}
            <span style={{ background: "linear-gradient(90deg,#4285F4,#EA4335,#FBBC05,#34A853)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 700 }}>
              Gemini AI
            </span>
          </span>
        </div>
      </div>

      {/* Log Button */}
      <button onClick={() => setShowForm(true)} style={{
        width: "100%", padding: "16px", border: "none", borderRadius: 18,
        background: "linear-gradient(135deg, #FF4D6D, #C77DFF)",
        color: "#fff", fontFamily: "var(--font-body)", fontWeight: 700,
        fontSize: 15, cursor: "pointer", marginBottom: 12,
        boxShadow: "0 8px 28px rgba(255,77,109,0.35)",
        transition: "all 0.2s",
      }}>
        ✨ Log This Week's Score
      </button>

      {/* Score Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "flex-end", backdropFilter: "blur(4px)" }}>
          <div style={{
            background: "var(--card)", borderRadius: "28px 28px 0 0",
            padding: 24, width: "100%", maxHeight: "80vh", overflowY: "auto",
            border: "1px solid var(--border)",
          }}>
            <div style={{ width: 36, height: 4, background: "var(--border)", borderRadius: 4, margin: "0 auto 20px" }} />
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 20 }}>
              📝 Log Weekly Scores
            </div>

            {[
              { key: "skinScore", label: "💅 Skin", color: "#FF6B9D" },
              { key: "fitnessScore", label: "💪 Fitness", color: "#4D96FF" },
              { key: "fashionScore", label: "👗 Fashion", color: "#C77DFF" },
            ].map(item => (
              <div key={item.key} style={{ marginBottom: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{item.label}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: item.color }}>{form[item.key]}</div>
                </div>
                <input
                  type="range" min="0" max="100" value={form[item.key]}
                  onChange={e => setForm(prev => ({ ...prev, [item.key]: parseInt(e.target.value) }))}
                  style={{ width: "100%", accentColor: item.color }}
                />
                <div style={{ background: "var(--surface)", borderRadius: 6, height: 6, overflow: "hidden", marginTop: 4 }}>
                  <div style={{ width: `${form[item.key]}%`, height: "100%", background: `linear-gradient(90deg, ${item.color}, ${item.color}80)`, borderRadius: 6 }} />
                </div>
              </div>
            ))}

            <textarea
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes about this week (optional)..."
              style={{ width: "100%", padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 13, outline: "none", resize: "none", height: 72, boxSizing: "border-box", marginBottom: 16 }}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 14, border: "1px solid var(--border)", borderRadius: 14, background: "transparent", color: "var(--muted)", fontFamily: "var(--font-body)", fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={saveScore} disabled={saving} style={{ flex: 2, padding: 14, border: "none", borderRadius: 14, background: "linear-gradient(135deg,#FF4D6D,#C77DFF)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving..." : "✨ Get Gemini Insight"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {result && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(6px)" }}>
          <div style={{ background: "var(--card)", borderRadius: 28, padding: 28, width: "100%", maxWidth: 360, border: "1px solid var(--border)", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 80, fontWeight: 900, background: "linear-gradient(135deg,#FF4D6D,#C77DFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>
                {result.overallScore}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--text)", marginTop: 4 }}>{result.title}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", marginTop: 8, lineHeight: 1.6 }}>{result.insight}</div>
            </div>

            {result.badges && result.badges.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
                {result.badges.map((badge, i) => (
                  <div key={i} style={{ background: "linear-gradient(135deg,#FFD93D,#FF4D6D)", borderRadius: 20, padding: "6px 14px", fontFamily: "var(--font-body)", fontSize: 12, color: "#fff", fontWeight: 700 }}>
                    {BADGES[badge] || "🏅"} {badge}
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: "var(--surface)", borderRadius: 16, padding: 14, marginBottom: 20, textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--text)", fontStyle: "italic", lineHeight: 1.5 }}>
                "{result.motivationalQuote}"
              </div>
            </div>

            <button onClick={() => setResult(null)} style={{ width: "100%", padding: 16, border: "none", borderRadius: 16, background: "linear-gradient(135deg,#FF4D6D,#C77DFF)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: "0 8px 24px rgba(255,77,109,0.3)" }}>
              🚀 Keep Glowing!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}