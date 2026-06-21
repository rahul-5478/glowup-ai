const axios = require("axios");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const callGroq = async (prompt, userContext = {}) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set");

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: "You are GlowUp AI - a beauty and fitness assistant for Indian users. Return ONLY valid JSON when asked. No markdown.",
          },
          { role: "user", content: String(prompt) },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 30000,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content || "";
    console.log("✅ Groq OK, length:", text.length);
    return text;
  } catch (err) {
    console.error("❌ Groq error:", err.response?.data || err.message);
    throw err;
  }
};

const parseGroqJSON = (text) => {
  let clean = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try { return JSON.parse(clean); } catch (_) {}
  let depth = 0, start = -1, end = -1;
  for (let i = 0; i < clean.length; i++) {
    if (clean[i] === "{") { if (start === -1) start = i; depth++; }
    else if (clean[i] === "}") { depth--; if (depth === 0 && start !== -1) { end = i; break; } }
  }
  if (start !== -1 && end !== -1) { try { return JSON.parse(clean.slice(start, end + 1)); } catch (_) {} }
  throw new Error("Invalid JSON from Groq");
};

module.exports = { callGroq, parseGroqJSON };