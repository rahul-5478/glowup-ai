import { useState } from "react";
import api from "../utils/api";

const PLANS = [
  {
    name: "Pro",
    price: 299,
    features: ["Unlimited AI Analysis", "Skin Analysis", "AI Style Chat", "Priority Support"],
    color: "#FF6B6B",
    icon: "⭐",
    badge: "Popular",
  },
  {
    name: "Premium",
    price: 599,
    features: ["Everything in Pro", "Wardrobe Manager", "Personal Style Coach", "Exclusive Trends"],
    color: "#845EF7",
    icon: "👑",
    badge: "Best Value",
  },
];

export default function PaymentPage({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (plan) => {
    setLoading(true);
    setLoadingPlan(plan.name);
    setError("");
    setSuccess("");

    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        setError("Razorpay load nahi hua. Internet check karo!");
        setLoading(false);
        setLoadingPlan(null);
        return;
      }

      // ✅ FIX: planName use karo (plan nahi)
      const { data } = await api.post("/payment/create-order", {
        amount: plan.price,
        planName: plan.name,
      });

      if (!data.success || !data.order) {
        setError("Order create nahi hua. Please try again.");
        setLoading(false);
        setLoadingPlan(null);
        return;
      }

      const options = {
        key: data.key || process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: "INR",
        name: "GlowUp AI",
        description: `${plan.name} Plan - ₹${plan.price}/month`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await api.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planName: plan.name, // ✅ FIX: planName use karo
            });
            setSuccess(`🎉 ${plan.name} Plan activated! Welcome to GlowUp AI Premium!`);
            // Save premium status locally
            localStorage.setItem("glowup_premium", plan.name);
            localStorage.setItem("glowup_premium_since", new Date().toISOString());
          } catch {
            setError("Payment verification failed. Support se contact karo.");
          }
          setLoading(false);
          setLoadingPlan(null);
        },
        prefill: {
          name: "GlowUp User",
          email: "user@glowupai.com",
          contact: "9999999999",
        },
        theme: { color: plan.color },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setLoadingPlan(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
        setLoadingPlan(null);
      });
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.response?.data?.error || "Payment failed. Try again!");
      setLoading(false);
      setLoadingPlan(null);
    }
  };

  const isPremium = localStorage.getItem("glowup_premium");

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.88)",
      zIndex: 9999,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      backdropFilter: "blur(4px)",
    }}>
      <div style={{
        background: "var(--bg)",
        borderRadius: "28px 28px 0 0",
        padding: "28px 20px 48px",
        width: "100%", maxWidth: 430,
        maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 -20px 60px rgba(0,0,0,0.5)",
      }}>

        {/* Drag handle */}
        <div style={{ width: 40, height: 4, background: "var(--border)", borderRadius: 4, margin: "0 auto 20px" }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
              👑 Upgrade Plan
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Unlock all AI features
            </div>
          </div>
          <div
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--surface)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 16, color: "var(--muted)",
            }}
          >✕</div>
        </div>

        {/* Already premium banner */}
        {isPremium && (
          <div style={{
            background: "rgba(81,207,102,0.12)",
            border: "1px solid rgba(81,207,102,0.3)",
            borderRadius: 14, padding: 14, marginBottom: 16,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#51CF66" }}>
              You're on <strong>{isPremium}</strong> plan! Enjoy unlimited access.
            </div>
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{
            background: "rgba(81,207,102,0.12)",
            border: "1px solid rgba(81,207,102,0.3)",
            borderRadius: 14, padding: 16, marginBottom: 16,
            fontFamily: "var(--font-body)", fontSize: 14,
            color: "#51CF66", textAlign: "center",
          }}>
            {success}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(255,107,107,0.1)",
            border: "1px solid rgba(255,107,107,0.3)",
            borderRadius: 14, padding: 14, marginBottom: 16,
            fontFamily: "var(--font-body)", fontSize: 13, color: "#FF6B6B",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span>❌</span> {error}
          </div>
        )}

        {/* Plans */}
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            style={{
              background: "var(--card)",
              borderRadius: 20,
              padding: 20,
              border: `1.5px solid ${plan.color}40`,
              marginBottom: 16,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Badge */}
            <div style={{
              position: "absolute", top: 14, right: 14,
              background: `${plan.color}20`,
              border: `1px solid ${plan.color}50`,
              borderRadius: 20,
              padding: "3px 10px",
              fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700,
              color: plan.color,
            }}>
              {plan.badge}
            </div>

            {/* Glow decoration */}
            <div style={{
              position: "absolute", bottom: -30, right: -30,
              width: 100, height: 100,
              background: `radial-gradient(circle, ${plan.color}15, transparent 70%)`,
              pointerEvents: "none",
            }} />

            {/* Plan header */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                {plan.icon} {plan.name}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: plan.color }}>₹{plan.price}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)" }}>/month</span>
              </div>
            </div>

            {/* Features */}
            <div style={{ marginBottom: 16 }}>
              {plan.features.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: `${plan.color}18`,
                    border: `1px solid ${plan.color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: plan.color, fontWeight: 700, flexShrink: 0,
                  }}>✓</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text)" }}>{f}</div>
                </div>
              ))}
            </div>

            {/* Pay button */}
            <button
              onClick={() => handlePayment(plan)}
              disabled={loading}
              style={{
                width: "100%", padding: "15px",
                borderRadius: 14, border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                background: loading && loadingPlan === plan.name
                  ? "var(--surface)"
                  : `linear-gradient(135deg, ${plan.color}, ${plan.color}bb)`,
                color: "#fff",
                fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700,
                boxShadow: loading ? "none" : `0 6px 24px ${plan.color}40`,
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {loading && loadingPlan === plan.name ? (
                <>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    animation: "spin 0.8s linear infinite",
                  }} />
                  Processing...
                </>
              ) : (
                `Pay ₹${plan.price} →`
              )}
            </button>
          </div>
        ))}

        {/* Security note */}
        <div style={{
          textAlign: "center",
          fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)",
          marginTop: 8, lineHeight: 1.6,
        }}>
          🔒 256-bit SSL encrypted • Powered by Razorpay<br />
          Cancel anytime • Instant activation
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}