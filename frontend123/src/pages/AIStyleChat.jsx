import { useState, useRef, useEffect } from "react";
import { chatAPI } from "../utils/api"; // ✅ use centralized api.js — no raw axios

const SUGGESTIONS = [
  { text: "Best hairstyle for round face?", emoji: "💇" },
  { text: "Skincare for oily skin?", emoji: "🧴" },
  { text: "Outfit for job interview?", emoji: "👔" },
  { text: "Capsule wardrobe tips?", emoji: "👗" },
  { text: "Best colors for dark skin?", emoji: "🎨" },
];

export default function AIStyleChat() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hey! I'm your personal AI Style Coach ✨\nAsk me anything about fashion, skincare, fitness, or beauty — I've got you!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [backendReady, setBackendReady] = useState(false);
  const bottomRef = useRef();
  const inputRef = useRef();

  // Wake up Render backend on mount
  useEffect(() => {
    const wakeUp = async () => {
      try {
        await fetch("https://glowup-ai-backend-1.onrender.com/api/health");
        setBackendReady(true);
      } catch {
        setBackendReady(true); // allow usage even if ping fails
      }
    };
    wakeUp();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const getErrorMessage = (err) => {
    if (!navigator.onLine) return "No internet connection 📡 Please check your network.";
    if (err.code === "ECONNABORTED") return "Request timed out ⏱️ Please try again.";
    if (err.response?.status === 401) return "Session expired 🔐 Please log in again.";
    if (err.response?.status === 429) return "AI is busy right now 🙏 Try again in a moment!";
    if (err.response?.status === 404) return "Chat service not found 😅 Please contact support.";
    if (err.response?.status >= 500) return "Server error 😅 Please try again in a moment.";
    return "Oops, kuch ho gaya 😅 Please try again!";
  };

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setLoading(true);
    setIsTyping(true);

    // Build history array for context (last 10 messages)
    const history = messages.slice(-10).map(m => ({
      role: m.role,
      content: m.text,
    }));

    try {
      // ✅ Uses api.js which has correct baseURL + auth token interceptor
      const res = await chatAPI.message(msg, history);

      setIsTyping(false);

      const reply = res.data?.reply;
      if (!reply) throw new Error("Empty response from server");

      setMessages(prev => [...prev, { role: "assistant", text: reply }]);

    } catch (err) {
      console.error("Chat error:", err.response?.status, err.response?.data);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: "assistant",
        text: getErrorMessage(err),
      }]);
    }

    setLoading(false);
  };

  const formatTime = () =>
    new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", background: "var(--bg)" }}>

      {/* Header */}
      <div style={{ padding: "0 16px 14px", flexShrink: 0 }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(255,77,109,0.08), rgba(199,125,255,0.06))",
          border: "1px solid rgba(199,125,255,0.15)",
          borderRadius: 20, padding: "14px 16px",
          display: "flex", alignItems: "center", gap: 12,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -10, right: -10, width: 70, height: 70, background: "radial-gradient(circle, rgba(199,125,255,0.1), transparent 70%)" }} />
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            background: "linear-gradient(135deg, #FF4D6D, #C77DFF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, boxShadow: "0 6px 20px rgba(255,77,109,0.3)", flexShrink: 0,
          }}>💅</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: "var(--text)" }}>AI Style Coach</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
              <div style={{
                width: 7, height: 7, borderRadius: "50%",
                background: backendReady ? "#51CF66" : "#FFB347",
                boxShadow: backendReady ? "0 0 6px #51CF66" : "0 0 6px #FFB347",
                transition: "all 0.5s",
              }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: backendReady ? "#51CF66" : "#FFB347", fontWeight: 600 }}>
                {backendReady ? "Online · Powered by Gemini" : "Waking up..."}
              </span>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "5px 10px", fontFamily: "var(--font-body)", fontSize: 10, color: "var(--muted)" }}>
            {messages.length - 1} msgs
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>

        {/* Suggestions */}
        {messages.length <= 2 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginBottom: 8, textAlign: "center", letterSpacing: 0.5 }}>
              💡 Try asking...
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SUGGESTIONS.map((s, i) => (
                <div key={i} onClick={() => sendMessage(s.text)} style={{
                  padding: "10px 14px", borderRadius: 14, cursor: "pointer",
                  background: "var(--card)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", gap: 10,
                  transition: "all 0.15s",
                  animation: `fadeSlideUp 0.4s ease ${i * 0.07}s both`,
                }}>
                  <span style={{ fontSize: 16 }}>{s.emoji}</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{s.text}</span>
                  <span style={{ marginLeft: "auto", color: "var(--muted)", fontSize: 14 }}>›</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            marginBottom: 12, gap: 8,
            animation: "fadeSlideUp 0.25s ease both",
          }}>
            {msg.role === "assistant" && (
              <div style={{
                width: 34, height: 34, borderRadius: 11,
                background: "linear-gradient(135deg, #FF4D6D, #C77DFF)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, flexShrink: 0, alignSelf: "flex-end",
                boxShadow: "0 3px 10px rgba(255,77,109,0.25)",
              }}>💅</div>
            )}

            <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", gap: 3, alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                padding: "11px 15px",
                borderRadius: msg.role === "user" ? "18px 18px 5px 18px" : "18px 18px 18px 5px",
                background: msg.role === "user" ? "linear-gradient(135deg, #FF4D6D, #C77DFF)" : "var(--card)",
                border: msg.role === "user" ? "none" : "1px solid var(--border)",
                fontFamily: "var(--font-body)", fontSize: 14,
                color: msg.role === "user" ? "#fff" : "var(--text)",
                lineHeight: 1.55,
                boxShadow: msg.role === "user" ? "0 4px 14px rgba(255,77,109,0.25)" : "none",
                whiteSpace: "pre-wrap",
              }}>
                {msg.text}
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--muted)", padding: "0 4px" }}>
                {formatTime()}
              </div>
            </div>

            {msg.role === "user" && (
              <div style={{
                width: 34, height: 34, borderRadius: 11,
                background: "linear-gradient(135deg, #4361EE, #7B2FBE)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, flexShrink: 0, alignSelf: "flex-end",
              }}>👤</div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 11, background: "linear-gradient(135deg, #FF4D6D, #C77DFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>💅</div>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "18px 18px 18px 5px", padding: "12px 16px" }}>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: "linear-gradient(135deg, #FF4D6D, #C77DFF)",
                    animation: `typingDot 1.2s ease ${i * 0.25}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px 8px", borderTop: "1px solid var(--border)", background: "var(--bg)", flexShrink: 0 }}>
        <div style={{
          display: "flex", gap: 10, alignItems: "flex-end",
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: 22, padding: "6px 6px 6px 16px",
          transition: "border-color 0.2s",
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === "Enter" && !e.shiftKey && !loading && sendMessage()}
            placeholder="Ask your style coach..."
            disabled={loading}
            style={{
              flex: 1, background: "transparent", border: "none",
              color: "var(--text)", fontFamily: "var(--font-body)",
              fontSize: 14, outline: "none", padding: "8px 0",
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 42, height: 42, borderRadius: 16,
              background: input.trim() && !loading ? "linear-gradient(135deg, #FF4D6D, #C77DFF)" : "var(--surface)",
              border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
              fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", flexShrink: 0,
              boxShadow: input.trim() && !loading ? "0 4px 14px rgba(255,77,109,0.3)" : "none",
              opacity: loading ? 0.5 : 1,
            }}
          >
            🚀
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 6, fontFamily: "var(--font-body)", fontSize: 10, color: "var(--muted)" }}>
          Powered by Gemini AI ✨
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes typingDot { 0%,60%,100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-6px); opacity: 1; } }
      `}</style>
    </div>
  );
}