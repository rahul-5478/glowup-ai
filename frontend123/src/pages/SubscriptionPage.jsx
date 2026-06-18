import { useState } from "react";

const plans = [
  {
    id: "free", name: "Free", price: "₹0", priceNum: 0, period: "forever", icon: "🌱",
    gradient: "linear-gradient(135deg, #555 0%, #333 100%)",
    features: ["✅ 3 Face Analyses / month","✅ 3 Fitness Plans / month","✅ 3 Fashion Analyses / month","✅ Basic recommendations","✅ Dark/Light mode","❌ PDF Download","❌ Progress Charts","❌ Indian Diet Plans","❌ Priority AI"],
    cta: "Current Plan", active: true,
  },
  {
    id: "pro", name: "Pro", price: "₹299", priceNum: 299, period: "per month", icon: "⚡",
    gradient: "linear-gradient(135deg, #4D96FF 0%, #845EF7 100%)", badge: "Popular",
    features: ["✅ Unlimited Face Analyses","✅ Unlimited Fitness Plans","✅ Unlimited Fashion Analyses","✅ Indian food diet plans","✅ Calorie count per meal","✅ PDF Download","✅ Progress Charts","✅ Shopping list","❌ Priority AI (faster)"],
    cta: "Upgrade to Pro", active: false,
  },
  {
    id: "premium", name: "Premium", price: "₹599", priceNum: 599, period: "per month", icon: "👑",
    gradient: "linear-gradient(135deg, #FFD93D 0%, #FF6B6B 100%)", badge: "Best Value",
    features: ["✅ Everything in Pro","✅ Priority AI (fastest)","✅ Recipes for each meal","✅ Weekly progress report","✅ Personal stylist chat","✅ Hairstyle preview images","✅ Skin analysis","✅ Wardrobe manager","✅ 24/7 AI support"],
    cta: "Upgrade to Premium", active: false,
  },
];

export default function SubscriptionPage({ onClose }) {
  const [selected, setSelected] = useState("free");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handlePayment = async (plan) => {
    if (plan.priceNum === 0) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("glowup_token");

      // Step 1: Order banao backend pe
      const orderRes = await fetch(
        `${process.env.REACT_APP_API_URL}/payment/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: plan.priceNum, planName: plan.name }),
        }
      );

      const { order } = await orderRes.json();
      if (!order) throw new Error("Order creation failed");

      // Step 2: Razorpay checkout open karo
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "GlowUp AI",
        description: `${plan.name} Plan - ${plan.period}`,
        image: "https://glowup-ai.vercel.app/logo192.png",
        order_id: order.id,
        handler: async (response) => {
          // Step 3: Payment verify karo
          const verifyRes = await fetch(
            `${process.env.REACT_APP_API_URL}/payment/verify`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planName: plan.name,
              }),
            }
          );
          const data = await verifyRes.json();
          if (data.success) {
            setSuccess(plan.name);
          }
        },
        prefill: {
          name: "GlowUp User",
          email: "user@glowup.ai",
          contact: "9999999999",
        },
        theme: { color: "#FF6B6B" },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        alert("Payment failed: " + response.error.description);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Please try again.");
    }
    setLoading(false);
  };

  // Success Screen
  if (success) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "var(--card)", borderRadius: 24, padding: 32, width: "100%", maxWidth: 360, textAlign: "center", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--text)", fontWeight: 700, marginBottom: 8 }}>Payment Successful!</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>
            Welcome to GlowUp AI <span style={{ color: "var(--accent)", fontWeight: 700 }}>{success}</span> Plan! 🚀
          </div>
          <button onClick={onClose} style={{ width: "100%", padding: 14, border: "none", borderRadius: 14, background: "var(--grad1)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
            Start Glowing Up! ✨
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, overflowY: "auto", padding: "20px 16px 40px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#fff", fontWeight: 700 }}>
            ✨ GlowUp <span style={{ background: "linear-gradient(135deg, #FFD93D, #FF6B6B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Plans</span>
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)" }}>Choose your perfect plan</div>
        </div>
        <button onClick={onClose} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--muted)", fontSize: 20, width: 40, height: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>

      {/* Plan Cards */}
      {plans.map(plan => (
        <div key={plan.id} onClick={() => setSelected(plan.id)} style={{
          background: "var(--card)",
          border: `2px solid ${selected === plan.id ? "#FF6B6B" : "var(--border)"}`,
          borderRadius: 20, marginBottom: 14, overflow: "hidden",
          transform: selected === plan.id ? "scale(1.01)" : "scale(1)",
          transition: "all 0.2s", cursor: "pointer",
          boxShadow: selected === plan.id ? "0 8px 30px rgba(255,107,107,0.25)" : "none",
        }}>
          {/* Plan Header */}
          <div style={{ background: plan.gradient, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 28 }}>{plan.icon}</span>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "#fff", fontWeight: 700 }}>{plan.name}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, color: "#fff", fontWeight: 700 }}>
                  {plan.price} <span style={{ fontSize: 12, fontFamily: "var(--font-body)", opacity: 0.8 }}>{plan.period}</span>
                </div>
              </div>
            </div>
            {plan.badge && (
              <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 20, padding: "4px 12px", fontFamily: "var(--font-body)", fontSize: 11, color: "#fff", fontWeight: 700 }}>
                {plan.badge}
              </div>
            )}
          </div>

          {/* Features */}
          <div style={{ padding: "16px 20px" }}>
            {plan.features.map((f, i) => (
              <div key={i} style={{ fontFamily: "var(--font-body)", fontSize: 13, color: f.startsWith("❌") ? "var(--muted)" : "var(--text)", padding: "4px 0", lineHeight: 1.5 }}>
                {f}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div style={{ padding: "0 16px 16px" }}>
            <button
              disabled={loading}
              style={{
                width: "100%", padding: "12px", border: "none", borderRadius: 14,
                background: plan.active ? "var(--surface)" : plan.gradient,
                color: plan.active ? "var(--muted)" : "#fff",
                fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14,
                cursor: plan.active || loading ? "default" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
              onClick={e => {
                e.stopPropagation();
                if (!plan.active && plan.priceNum > 0) handlePayment(plan);
              }}
            >
              {loading ? "Processing..." : plan.cta}
            </button>
          </div>
        </div>
      ))}

      {/* Secure Badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 }}>
        <span style={{ fontSize: 14 }}>🔒</span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)" }}>Secured by Razorpay — UPI, Card, NetBanking supported</span>
      </div>
    </div>
  );
}