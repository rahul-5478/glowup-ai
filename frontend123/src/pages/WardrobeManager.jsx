import { useState } from "react";
import { GlowButton, SectionTitle, Card, LoadingDots } from "../components/UI";
import { fashionAPI } from "../utils/api";

const CATEGORIES = ["👕 Tops", "👖 Bottoms", "👗 Dresses", "🧥 Outerwear", "👟 Shoes", "👜 Accessories"];

export default function WardrobeManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [activeCategory, setActiveCategory] = useState("👕 Tops");
  const [occasion, setOccasion] = useState("Casual");
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", color: "", category: "👕 Tops" });

  const addItem = () => {
    if (!newItem.name) return;
    setItems([...items, { ...newItem, id: Date.now() }]);
    setNewItem({ name: "", color: "", category: activeCategory });
    setAddingItem(false);
  };

  const getOutfit = async () => {
    if (items.length < 2) return;
    setLoading(true); setSuggestion(null);
    try {
      const res = await fashionAPI.wardrobeOutfit({ items, occasion });
      setSuggestion(res.data.result);
    } catch {
      setSuggestion({ outfit: "Classic Combo", pieces: items.slice(0, 3).map(i => i.name), tip: "Pair your items with confidence!" });
    }
    setLoading(false);
  };

  const filteredItems = items.filter(i => i.category === activeCategory);

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <SectionTitle icon="👗" title="Wardrobe Manager" subtitle="Organize clothes, get AI outfit ideas" />

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
        {CATEGORIES.map(cat => (
          <div key={cat} onClick={() => setActiveCategory(cat)} style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 20, cursor: "pointer", background: activeCategory === cat ? "var(--accent)" : "var(--card)", border: `1px solid ${activeCategory === cat ? "var(--accent)" : "var(--border)"}`, fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: activeCategory === cat ? "#fff" : "var(--muted)", transition: "all 0.2s" }}>
            {cat}
          </div>
        ))}
      </div>

      {/* Items Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {filteredItems.map(item => (
          <div key={item.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 14, position: "relative" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: item.color || "#888", border: "2px solid var(--border)", marginBottom: 8 }} />
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{item.name}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{item.color}</div>
            <button onClick={() => setItems(items.filter(i => i.id !== item.id))} style={{ position: "absolute", top: 8, right: 8, background: "rgba(255,107,107,0.15)", border: "none", borderRadius: 8, width: 24, height: 24, cursor: "pointer", color: "var(--accent)", fontSize: 12 }}>✕</button>
          </div>
        ))}

        {/* Add Item Button */}
        <div onClick={() => setAddingItem(true)} style={{ background: "var(--card)", border: "2px dashed var(--border)", borderRadius: 16, padding: 14, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 80 }}>
          <div style={{ fontSize: 24, color: "var(--muted)" }}>+</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Add Item</div>
        </div>
      </div>

      {/* Add Item Modal */}
      {addingItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: "var(--card)", borderRadius: "24px 24px 0 0", padding: 24, width: "100%", maxWidth: 430 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Add Clothing Item</div>
            <input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="Item name (e.g. Blue Denim Jacket)" style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 14, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />
            <input value={newItem.color} onChange={e => setNewItem({ ...newItem, color: e.target.value })} placeholder="Color (e.g. Navy Blue)" style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setAddingItem(false)} style={{ flex: 1, padding: 14, border: "1px solid var(--border)", borderRadius: 14, background: "var(--surface)", color: "var(--muted)", fontFamily: "var(--font-body)", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={addItem} style={{ flex: 1, padding: 14, border: "none", borderRadius: 14, background: "var(--grad1)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 700, cursor: "pointer" }}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>{items.length}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>Total Items</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 700, color: "var(--accent3)" }}>{CATEGORIES.filter(c => items.some(i => i.category === c)).length}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>Categories</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 700, color: "var(--accent2)" }}>{Math.floor(items.length * 1.5)}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)" }}>Possible Outfits</div>
          </div>
        </div>
      </Card>

      {/* Occasion Select */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        {["Casual", "Office", "Party", "Wedding", "Gym", "Date"].map(occ => (
          <div key={occ} onClick={() => setOccasion(occ)} style={{ padding: "10px 8px", borderRadius: 12, cursor: "pointer", background: occasion === occ ? "rgba(255,107,107,0.15)" : "var(--card)", border: `1px solid ${occasion === occ ? "var(--accent)" : "var(--border)"}`, fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: occasion === occ ? "var(--accent)" : "var(--muted)", textAlign: "center", transition: "all 0.2s" }}>
            {occ}
          </div>
        ))}
      </div>

      <GlowButton onClick={getOutfit} disabled={items.length < 2} gradient="var(--grad2)">
        ✨ Generate Outfit from Wardrobe
      </GlowButton>

      {loading && <Card style={{ marginTop: 16, textAlign: "center" }}><LoadingDots /></Card>}

      {suggestion && (
        <Card style={{ marginTop: 16 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>✨ {suggestion.outfit || "Today's Outfit"}</div>
          {suggestion.pieces?.map((piece, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < suggestion.pieces.length - 1 ? "1px solid var(--border)" : "none" }}>
              <span style={{ fontSize: 16 }}>👔</span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text)" }}>{piece}</span>
            </div>
          ))}
          {suggestion.tip && (
            <div style={{ background: "rgba(77,150,255,0.1)", borderRadius: 12, padding: "10px 14px", marginTop: 12 }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--accent4)" }}>💡 {suggestion.tip}</div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}