import { useState, useRef, useCallback } from "react";

// ─── Pexels API ───────────────────────────────────────────────────────────────
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const pexelsCache = {};

const fetchPexelsImage = async (query) => {
  if (pexelsCache[query]) return pexelsCache[query];
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=portrait`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    const data = await res.json();
    if (data.photos?.length > 0) {
      pexelsCache[query] = data.photos[0].src.medium;
      return pexelsCache[query];
    }
  } catch (e) { console.warn("Pexels failed:", query); }
  return null;
};

// ─── Occasions ────────────────────────────────────────────────────────────────
const OCCASIONS = ["Casual", "Work/Office", "Party", "Wedding", "Date Night", "Gym", "Festival", "Formal"];

// ─── Outfit Database ──────────────────────────────────────────────────────────
const MALE_OUTFITS = {
  casual: {
    fair:    [{ name: "Navy Blue Slim Fit Chinos + White Tee", pexels: "men casual navy chinos white tshirt outfit", why: "Navy contrasts beautifully with fair skin", items: ["Slim chinos", "White tee", "White sneakers", "Minimalist watch"] },
              { name: "Olive Joggers + Grey Hoodie", pexels: "men olive joggers grey hoodie casual", why: "Earth tones complement fair complexion", items: ["Olive joggers", "Grey hoodie", "White shoes"] },
              { name: "Light Blue Denim Shirt + Khaki Pants", pexels: "men light blue denim shirt khaki pants", why: "Light blue enhances fair skin glow", items: ["Denim shirt", "Khaki trousers", "Brown loafers"] }],
    medium:  [{ name: "Rust Polo Shirt + Dark Jeans", pexels: "men rust polo dark jeans outfit", why: "Warm tones bring out medium skin beautifully", items: ["Rust polo", "Dark jeans", "Brown boots"] },
              { name: "Olive Green Kurta + White Pajama", pexels: "men olive green kurta white pajama", why: "Earthy tones look stunning on medium skin", items: ["Olive kurta", "White pajama", "Kolhapuri sandals"] },
              { name: "Mustard Tee + Grey Joggers", pexels: "men mustard yellow tshirt grey joggers", why: "Mustard pops on medium skin tone", items: ["Mustard tee", "Grey joggers", "White sneakers"] }],
    dark:    [{ name: "White Linen Shirt + Beige Chinos", pexels: "men white linen shirt beige chinos outfit", why: "White and beige create stunning contrast on dark skin", items: ["White linen shirt", "Beige chinos", "White sneakers"] },
              { name: "Bright Yellow Tee + Black Jeans", pexels: "men yellow tshirt black jeans outfit", why: "Bold bright colors look amazing on dark skin", items: ["Yellow tee", "Black jeans", "Black boots"] },
              { name: "Royal Blue Shirt + White Pants", pexels: "men royal blue shirt white pants", why: "Royal blue is perfect for dark complexion", items: ["Royal blue shirt", "White trousers", "Tan shoes"] }],
  },
  "work/office": {
    fair:    [{ name: "Navy Suit + Light Blue Shirt", pexels: "men navy blue suit light blue shirt office", why: "Classic combo for fair skin — very professional", items: ["Navy suit", "Light blue shirt", "Oxford shoes", "Silver tie"] },
              { name: "Grey Blazer + White Shirt + Black Trousers", pexels: "men grey blazer white shirt black trousers", why: "Neutral tones work perfectly for fair complexion", items: ["Grey blazer", "White shirt", "Black trousers", "Black shoes"] }],
    medium:  [{ name: "Charcoal Suit + Cream Shirt", pexels: "men charcoal suit cream shirt office", why: "Charcoal is universally flattering on medium skin", items: ["Charcoal suit", "Cream shirt", "Brown shoes", "Brown belt"] },
              { name: "Brown Blazer + Beige Chinos + White Shirt", pexels: "men brown blazer beige chinos office look", why: "Warm browns complement medium skin perfectly", items: ["Brown blazer", "White shirt", "Beige chinos", "Loafers"] }],
    dark:    [{ name: "White Suit + Black Shirt", pexels: "men white suit black shirt formal", why: "White suit creates bold contrast on dark skin", items: ["White suit", "Black shirt", "Black shoes", "Silver watch"] },
              { name: "Light Grey Suit + White Shirt", pexels: "men light grey suit white shirt office", why: "Light grey creates elegant contrast on dark skin", items: ["Light grey suit", "White shirt", "Black shoes"] }],
  },
  party:     {
    fair:    [{ name: "All Black + Gold Chain", pexels: "men all black party outfit gold chain", why: "All black makes fair skin look sharp and edgy", items: ["Black shirt", "Black jeans", "Black boots", "Gold chain"] }],
    medium:  [{ name: "Maroon Velvet Blazer + Black Tee", pexels: "men maroon velvet blazer black tee party", why: "Rich maroon looks luxurious on medium skin", items: ["Maroon blazer", "Black tee", "Black jeans", "Chelsea boots"] }],
    dark:    [{ name: "Bright Red Shirt + White Pants", pexels: "men red shirt white pants party outfit", why: "Bold red is electrifying on dark skin", items: ["Red shirt", "White pants", "White shoes"] }],
  },
  wedding:   {
    fair:    [{ name: "Ivory Sherwani + Gold Dupatta", pexels: "men ivory sherwani wedding indian", why: "Ivory and gold complement fair skin elegantly", items: ["Ivory sherwani", "Gold dupatta", "Mojari shoes"] }],
    medium:  [{ name: "Royal Blue Sherwani + Silver Accessories", pexels: "men royal blue sherwani wedding", why: "Royal blue is regal on medium skin tone", items: ["Blue sherwani", "Silver buttons", "Mojari"] }],
    dark:    [{ name: "White Sherwani + Red Dupatta", pexels: "men white sherwani red dupatta wedding", why: "White sherwani creates stunning look on dark skin", items: ["White sherwani", "Red dupatta", "Gold mojari"] }],
  },
  "date night": {
    fair:    [{ name: "Dark Green Shirt + Black Jeans", pexels: "men dark green shirt black jeans date night", why: "Dark green is romantic and flattering on fair skin", items: ["Dark green shirt", "Black slim jeans", "Chelsea boots", "Watch"] }],
    medium:  [{ name: "Burgundy Shirt + Dark Jeans", pexels: "men burgundy shirt dark jeans date night", why: "Burgundy is passionate and suits medium skin perfectly", items: ["Burgundy shirt", "Dark jeans", "Brown boots"] }],
    dark:    [{ name: "All White Outfit", pexels: "men all white outfit date night", why: "All white is strikingly attractive on dark skin", items: ["White shirt", "White trousers", "White shoes", "Silver watch"] }],
  },
  gym:       {
    fair:    [{ name: "Grey Gym Set + White Shoes", pexels: "men grey gym outfit athletic", why: "Grey is versatile and looks great on fair skin", items: ["Grey tee", "Grey shorts", "White trainers"] }],
    medium:  [{ name: "Black + Orange Gym Wear", pexels: "men black orange gym workout outfit", why: "Orange accent pops on medium skin tone", items: ["Black tee", "Orange shorts", "Black trainers"] }],
    dark:    [{ name: "Neon Green + Black Gym Set", pexels: "men neon green black gym workout", why: "Neon colors are electrifying on dark skin", items: ["Neon green tee", "Black shorts", "Black trainers"] }],
  },
  festival:  {
    fair:    [{ name: "White Kurta + Blue Printed Pajama", pexels: "men white kurta festival indian outfit", why: "White kurta is classic and elegant for fair skin", items: ["White kurta", "Printed pajama", "Kolhapuri"] }],
    medium:  [{ name: "Saffron Kurta + White Pajama", pexels: "men saffron orange kurta festival", why: "Saffron is festive and vibrant on medium skin", items: ["Saffron kurta", "White pajama", "Sandals"] }],
    dark:    [{ name: "Bright Pink Kurta + White Pajama", pexels: "men pink kurta white pajama festival", why: "Bold bright kurta looks amazing on dark skin", items: ["Pink kurta", "White pajama", "Golden jutis"] }],
  },
  formal:    {
    fair:    [{ name: "Classic Black Tuxedo", pexels: "men black tuxedo formal event", why: "Black tux is timeless and sharp on fair skin", items: ["Black tuxedo", "White shirt", "Black bow tie", "Oxford shoes"] }],
    medium:  [{ name: "Midnight Blue Tuxedo", pexels: "men midnight blue tuxedo formal", why: "Midnight blue is sophisticated on medium skin", items: ["Blue tuxedo", "White shirt", "Black bow tie", "Black shoes"] }],
    dark:    [{ name: "White Tuxedo + Black Shirt", pexels: "men white tuxedo black shirt formal", why: "White tux is bold and stunning on dark skin", items: ["White tuxedo", "Black shirt", "White shoes"] }],
  },
};

const FEMALE_OUTFITS = {
  casual:    {
    fair:    [{ name: "Pastel Pink Co-ord Set", pexels: "women pastel pink coord set casual outfit", why: "Soft pastels look dreamy on fair skin", items: ["Pastel pink crop top", "Matching pants", "White sneakers"] },
              { name: "Light Blue Denim Jacket + White Dress", pexels: "women light blue denim jacket white dress casual", why: "Cool blues complement fair complexion beautifully", items: ["White sundress", "Denim jacket", "White shoes"] }],
    medium:  [{ name: "Mustard Yellow Kurti + Leggings", pexels: "women mustard yellow kurti casual indian", why: "Warm mustard is gorgeous on medium skin tone", items: ["Mustard kurti", "Black leggings", "Flat sandals"] },
              { name: "Terracotta Midi Dress", pexels: "women terracotta midi dress casual", why: "Earthy terracotta enhances medium skin glow", items: ["Terracotta dress", "Brown sandals", "Minimal jewelry"] }],
    dark:    [{ name: "Bright Orange Co-ord Set", pexels: "women bright orange coord set outfit", why: "Vibrant orange looks stunning on dark skin", items: ["Orange crop top", "Orange pants", "White sneakers"] },
              { name: "White Linen Dress", pexels: "women white linen dress casual summer", why: "White creates beautiful contrast on dark skin", items: ["White linen dress", "Gold sandals", "Gold hoops"] }],
  },
  "work/office": {
    fair:    [{ name: "Navy Blazer + White Blouse + Trousers", pexels: "women navy blazer white blouse office outfit", why: "Navy is professional and flattering on fair skin", items: ["Navy blazer", "White blouse", "Grey trousers", "Heels"] },
              { name: "Light Grey Formal Suit", pexels: "women light grey formal suit office", why: "Light grey is elegant for fair complexion", items: ["Grey blazer", "Grey trousers", "White shirt", "Black heels"] }],
    medium:  [{ name: "Burgundy Formal Dress", pexels: "women burgundy formal office dress", why: "Rich burgundy is powerful on medium skin", items: ["Burgundy dress", "Black belt", "Black heels"] },
              { name: "Camel Blazer + Black Pants", pexels: "women camel blazer black pants office", why: "Camel tones complement medium skin beautifully", items: ["Camel blazer", "Black pants", "White blouse", "Heels"] }],
    dark:    [{ name: "White Formal Blazer Set", pexels: "women white formal blazer set office", why: "White creates stunning professional look on dark skin", items: ["White blazer", "White pants", "Black shirt", "Black heels"] },
              { name: "Cobalt Blue Power Suit", pexels: "women cobalt blue suit office power", why: "Bold cobalt is commanding on dark skin", items: ["Cobalt blazer", "Matching pants", "White shirt"] }],
  },
  party:     {
    fair:    [{ name: "Icy Blue Sequin Dress", pexels: "women icy blue sequin party dress", why: "Cool metallics shimmer on fair skin", items: ["Sequin dress", "Silver heels", "Clutch"] }],
    medium:  [{ name: "Gold Bodycon Dress", pexels: "women gold bodycon party dress", why: "Gold is electrifying on medium skin tone", items: ["Gold dress", "Nude heels", "Gold jewelry"] }],
    dark:    [{ name: "Hot Pink Mini Dress", pexels: "women hot pink mini dress party", why: "Hot pink is stunning and bold on dark skin", items: ["Pink dress", "Silver heels", "Statement earrings"] }],
  },
  wedding:   {
    fair:    [{ name: "Peach Anarkali + Golden Dupatta", pexels: "women peach anarkali wedding indian", why: "Peach is romantic and lovely on fair skin", items: ["Peach anarkali", "Golden dupatta", "Heels", "Bangles"] }],
    medium:  [{ name: "Royal Blue Lehenga + Silver Work", pexels: "women royal blue lehenga wedding", why: "Royal blue is regal on medium skin tone", items: ["Blue lehenga", "Blouse", "Silver jewelry", "Heels"] }],
    dark:    [{ name: "Bright Red Saree + Gold Blouse", pexels: "women red saree gold blouse wedding indian", why: "Red saree is timeless and stunning on dark skin", items: ["Red silk saree", "Gold blouse", "Gold jewelry"] }],
  },
  "date night": {
    fair:    [{ name: "Dusty Rose Slip Dress", pexels: "women dusty rose slip dress date night", why: "Romantic dusty rose is perfect for fair skin", items: ["Rose slip dress", "Strappy heels", "Delicate necklace"] }],
    medium:  [{ name: "Deep Red Wrap Dress", pexels: "women deep red wrap dress date night", why: "Deep red is passionate and flattering on medium skin", items: ["Red wrap dress", "Nude heels", "Gold earrings"] }],
    dark:    [{ name: "All White Bodycon Dress", pexels: "women white bodycon dress date night", why: "White is breathtaking on dark skin for a date", items: ["White dress", "Gold heels", "Gold jewelry"] }],
  },
  gym:       {
    fair:    [{ name: "Lavender Gym Set", pexels: "women lavender purple gym outfit athletic", why: "Soft lavender looks fresh on fair skin", items: ["Lavender sports bra", "Matching leggings", "White trainers"] }],
    medium:  [{ name: "Coral + Black Gym Set", pexels: "women coral pink black gym workout outfit", why: "Coral pops beautifully on medium skin", items: ["Coral top", "Black leggings", "White shoes"] }],
    dark:    [{ name: "Neon Yellow + Black Set", pexels: "women neon yellow black gym outfit", why: "Neon yellow is electrifying on dark skin", items: ["Neon top", "Black leggings", "Black trainers"] }],
  },
  festival:  {
    fair:    [{ name: "White Chikankari Suit", pexels: "women white chikankari festival indian", why: "White chikankari is elegant for fair skin", items: ["White kurti", "White palazzo", "Silver jewelry"] }],
    medium:  [{ name: "Fuchsia Pink Lehenga Choli", pexels: "women fuchsia pink lehenga festival indian", why: "Hot pink is festive and vibrant on medium skin", items: ["Pink lehenga", "Pink choli", "Pink dupatta", "Bangles"] }],
    dark:    [{ name: "Electric Blue Gharara Set", pexels: "women electric blue gharara festival", why: "Electric blue is stunning on dark skin at festivals", items: ["Blue gharara", "Matching top", "Silver jewelry"] }],
  },
  formal:    {
    fair:    [{ name: "Champagne Gown", pexels: "women champagne gown formal event", why: "Champagne is ultra-elegant for fair complexion", items: ["Champagne gown", "Silver heels", "Diamond jewelry"] }],
    medium:  [{ name: "Emerald Green Evening Gown", pexels: "women emerald green gown formal", why: "Emerald is luxurious and rich on medium skin", items: ["Green gown", "Gold heels", "Gold jewelry"] }],
    dark:    [{ name: "Pure White Ball Gown", pexels: "women white ball gown formal event", why: "White gown is breathtakingly gorgeous on dark skin", items: ["White gown", "Silver heels", "Diamond accessories"] }],
  },
};

// ─── Skin Tone Detection from image ─────────────────────────────────────────
const detectSkinTone = (imageBase64) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      // Sample center region of image
      const cx = Math.floor(img.width / 2);
      const cy = Math.floor(img.height / 3); // upper third — face/chest area
      const sampleSize = Math.min(40, Math.floor(img.width / 4));
      const data = ctx.getImageData(cx - sampleSize/2, cy - sampleSize/2, sampleSize, sampleSize).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i]; g += data[i+1]; b += data[i+2]; count++;
      }
      r = r/count; g = g/count; b = b/count;
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
      if (brightness > 180) resolve("fair");
      else if (brightness > 110) resolve("medium");
      else resolve("dark");
    };
    img.onerror = () => resolve("medium");
    img.src = `data:image/jpeg;base64,${imageBase64}`;
  });
};

const SKIN_TONE_LABELS = {
  fair: { label: "Fair / Light", emoji: "🌸", color: "#FFD6CC" },
  medium: { label: "Medium / Wheatish", emoji: "🌻", color: "#D4A574" },
  dark: { label: "Dark / Deep", emoji: "🌟", color: "#8B5E3C" },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FashionAdvisor() {
  const [gender, setGender] = useState(null); // "male" | "female"
  const [occasion, setOccasion] = useState("");
  const [imageBase64, setImageBase64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [skinTone, setSkinTone] = useState(null);
  const [outfitImages, setOutfitImages] = useState({});
  const [camMode, setCamMode] = useState(false);
  const [camActive, setCamActive] = useState(false);
  const [camError, setCamError] = useState("");

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
      setCamError("Camera permission denied. Please allow camera access.");
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
    const base64 = dataUrl.split(",")[1];
    stopCamera();
    setCamMode(false);
    setImageBase64(base64);
    setImagePreview(dataUrl);
  }, [stopCamera]);

  const handleLiveCamera = async () => {
    setCamMode(true);
    setImageBase64(null);
    setImagePreview(null);
    setResult(null);
    setSkinTone(null);
    await startCamera();
  };

  // ─── Gallery Upload ────────────────────────────────────────────────────────
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
        const base64 = dataUrl.split(",")[1];
        setImageBase64(base64);
        setImagePreview(dataUrl);
        setResult(null);
        setSkinTone(null);
        setCamMode(false);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // ─── Load Pexels outfit images ─────────────────────────────────────────────
  const loadOutfitImages = async (outfits) => {
    const imgs = {};
    await Promise.all(outfits.map(async (o) => {
      const url = await fetchPexelsImage(o.pexels);
      if (url) imgs[o.name] = url;
    }));
    setOutfitImages(imgs);
  };

  // ─── Analyze ──────────────────────────────────────────────────────────────
  const analyze = async () => {
    if (!gender) return setError("Please select Male or Female first!");
    if (!occasion) return setError("Please select an occasion!");
    if (!imageBase64) return setError("Please take or upload a photo first!");

    setAnalyzing(true);
    setError("");
    setResult(null);
    setOutfitImages({});

    // Skin tone detect karo image se
    const detected = await detectSkinTone(imageBase64);
    setSkinTone(detected);

    // Outfits get karo
    const db = gender === "male" ? MALE_OUTFITS : FEMALE_OUTFITS;
    const occasionKey = occasion.toLowerCase();
    const occasionData = db[occasionKey] || db["casual"];
    const outfits = occasionData[detected] || occasionData["medium"];

    setResult({ outfits, skinTone: detected, gender, occasion });

    // Pexels images load karo
    await loadOutfitImages(outfits);

    setAnalyzing(false);
  };

  const reset = () => {
    setResult(null);
    setOccasion("");
    setGender(null);
    setImageBase64(null);
    setImagePreview(null);
    setSkinTone(null);
    setOutfitImages({});
    setCamMode(false);
    stopCamera();
    setError("");
  };

  const skinInfo = skinTone ? SKIN_TONE_LABELS[skinTone] : null;

  return (
    <div style={{ padding: "0 16px 100px" }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--text)" }}>
          👗 Fashion{" "}
          <span style={{ background: "linear-gradient(135deg,#845EF7,#FF6B9D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Advisor
          </span>
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
          AI analyzes your photo → detects skin tone → suggests best outfit
        </div>
      </div>

      {/* ─── Step 1: Gender Select ─────────────────────────────────────────── */}
      <div style={{ background: "var(--card)", borderRadius: 20, padding: 18, border: "1px solid var(--border)", marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
          Step 1 — Who are you?
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { id: "male", icon: "👨", label: "Male", color: "#4D96FF" },
            { id: "female", icon: "👩", label: "Female", color: "#FF6B9D" },
          ].map((g) => (
            <div key={g.id} onClick={() => { setGender(g.id); setResult(null); }}
              style={{
                flex: 1, padding: "16px 8px", borderRadius: 16, cursor: "pointer", textAlign: "center",
                background: gender === g.id ? `${g.color}18` : "var(--surface)",
                border: `2px solid ${gender === g.id ? g.color : "var(--border)"}`,
                transition: "all 0.2s",
              }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{g.icon}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: gender === g.id ? g.color : "var(--muted)" }}>
                {g.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Step 2: Photo ────────────────────────────────────────────────── */}
      <div style={{ background: "var(--card)", borderRadius: 20, padding: 18, border: "1px solid var(--border)", marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
          Step 2 — Take a full body photo
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted)", marginBottom: 14, padding: "8px 12px", background: "rgba(132,94,247,0.06)", borderRadius: 10, border: "1px solid rgba(132,94,247,0.15)" }}>
          💡 AI will detect your skin tone and suggest the best outfit for you
        </div>

        {/* Camera Mode */}
        {camMode && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "#000", minHeight: 260 }}>
              <video ref={videoRef} autoPlay playsInline muted
                style={{ width: "100%", maxHeight: 340, objectFit: "cover", display: "block" }} />
              {!camActive && !camError && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, background: "rgba(0,0,0,0.8)" }}>
                  <div style={{ fontSize: 28 }}>📷</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#fff" }}>Starting camera...</div>
                </div>
              )}
              {camActive && (
                <div style={{ position: "absolute", bottom: 10, left: 10, right: 10, padding: "8px 12px", background: "rgba(0,0,0,0.7)", borderRadius: 10, fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.8)", textAlign: "center" }}>
                  📏 Keep full body in frame — head to toe
                </div>
              )}
            </div>
            {camActive && (
              <button onClick={capturePhoto}
                style={{ width: "100%", marginTop: 10, padding: "13px", border: "none", borderRadius: 14, background: "linear-gradient(135deg,#845EF7,#FF6B9D)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                📸 Capture Photo
              </button>
            )}
            {camError && (
              <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 12, fontFamily: "var(--font-body)", fontSize: 13, color: "#FF6B6B", textAlign: "center" }}>
                ⚠️ {camError}
              </div>
            )}
          </div>
        )}

        {/* Photo Preview */}
        {imagePreview && !camMode && (
          <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
            <img src={imagePreview} alt="full body"
              style={{ width: "100%", maxHeight: 340, objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)" }} />
            <div style={{ position: "absolute", bottom: 12, left: 14, right: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "#fff" }}>✅ Photo ready!</div>
              <button onClick={() => { setImageBase64(null); setImagePreview(null); setSkinTone(null); setResult(null); }}
                style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.4)", background: "rgba(0,0,0,0.4)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 12, cursor: "pointer" }}>
                ✕ Remove
              </button>
            </div>
          </div>
        )}

        {/* Buttons */}
        {!camMode && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button onClick={handleLiveCamera}
              style={{ padding: "12px", border: "none", borderRadius: 14, background: "linear-gradient(135deg,#51CF66,#20C997)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              🔴 Live Camera
            </button>
            <button onClick={handleGallery}
              style={{ padding: "12px", border: "1.5px solid var(--border)", borderRadius: 14, background: "var(--surface)", color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              🖼️ Gallery
            </button>
          </div>
        )}
      </div>

      {/* ─── Step 3: Occasion ─────────────────────────────────────────────── */}
      <div style={{ background: "var(--card)", borderRadius: 20, padding: 18, border: "1px solid var(--border)", marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
          Step 3 — Select an occasion
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {OCCASIONS.map((o) => (
            <div key={o} onClick={() => { setOccasion(o); setError(""); }}
              style={{
                padding: "9px 16px", borderRadius: 20, cursor: "pointer",
                background: occasion === o ? "rgba(132,94,247,0.15)" : "var(--surface)",
                color: occasion === o ? "#845EF7" : "var(--muted)",
                fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
                border: `1.5px solid ${occasion === o ? "#845EF7" : "var(--border)"}`,
                transition: "all 0.2s",
              }}>
              {o}
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 14, padding: 12, marginBottom: 14, fontFamily: "var(--font-body)", fontSize: 13, color: "#FF6B6B" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Analyze Button */}
      <button onClick={analyze} disabled={analyzing}
        style={{
          width: "100%", padding: "16px", border: "none", borderRadius: 16,
          cursor: analyzing ? "not-allowed" : "pointer",
          background: "linear-gradient(135deg, #845EF7, #FF6B9D)",
          color: "#fff", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700,
          boxShadow: "0 8px 24px rgba(132,94,247,0.4)",
          transition: "all 0.2s", marginBottom: 20,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          opacity: analyzing ? 0.7 : 1,
        }}>
        {analyzing ? (
          <>
            <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.75s linear infinite" }} />
            Detecting skin tone...
          </>
        ) : "✨ Analyze & Get Outfits"}
      </button>

      {/* ─── Results ──────────────────────────────────────────────────────── */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Skin Tone Result Card */}
          <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: 24, padding: 20, border: "1px solid rgba(132,94,247,0.3)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: "radial-gradient(circle, rgba(132,94,247,0.2), transparent 70%)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: skinInfo?.color, border: "3px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                {skinInfo?.emoji}
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Detected Skin Tone</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "#fff" }}>{skinInfo?.label}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                  {result.gender === "male" ? "👨 Male" : "👩 Female"} · {result.occasion}
                </div>
              </div>
            </div>
          </div>

          {/* Section Header */}
          <div style={{ background: result.gender === "male" ? "linear-gradient(135deg, rgba(77,150,255,0.1), rgba(132,94,247,0.1))" : "linear-gradient(135deg, rgba(255,107,157,0.1), rgba(132,94,247,0.1))", border: `1px solid ${result.gender === "male" ? "rgba(77,150,255,0.2)" : "rgba(255,107,157,0.2)"}`, borderRadius: 18, padding: 16 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>
              {result.gender === "male" ? "👨 Male Outfits" : "👩 Female Outfits"} for {result.occasion}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)" }}>
              {result.outfits.length} outfits — {skinInfo?.label} skin tone for
              <span style={{ color: "#51CF66", marginLeft: 6 }}>✅ Pexels real photos</span>
            </div>
          </div>

          {/* Outfit Cards */}
          {result.outfits.map((outfit, i) => {
            const imgSrc = outfitImages[outfit.name];
            const isPexels = !!imgSrc;
            return (
              <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>

                {/* Image */}
                <div style={{ position: "relative", height: 200, background: "#111", overflow: "hidden" }}>
                  {imgSrc ? (
                    <img src={imgSrc} alt={outfit.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => { e.target.style.display = "none"; }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}>
                      <div style={{ fontSize: 48 }}>{result.gender === "male" ? "👔" : "👗"}</div>
                    </div>
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)" }} />

                  {/* Number badge */}
                  <div style={{ position: "absolute", top: 12, left: 12, width: 32, height: 32, borderRadius: 10, background: result.gender === "male" ? "linear-gradient(135deg,#4D96FF,#845EF7)" : "linear-gradient(135deg,#FF6B9D,#845EF7)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 800, color: "#fff" }}>
                    {i + 1}
                  </div>

                  {/* Skin tone badge */}
                  <div style={{ position: "absolute", top: 12, right: 12, padding: "4px 10px", borderRadius: 20, background: `${skinInfo?.color}cc`, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "#000" }}>
                    {skinInfo?.emoji} {skinInfo?.label}
                  </div>

                  {/* Pexels badge */}
                  {isPexels && (
                    <div style={{ position: "absolute", top: 46, right: 12, padding: "3px 8px", borderRadius: 20, background: "rgba(81,207,102,0.85)", fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                      📸 Pexels Live
                    </div>
                  )}

                  {/* Loading badge */}
                  {!isPexels && Object.keys(outfitImages).length < result.outfits.length && (
                    <div style={{ position: "absolute", top: 46, right: 12, padding: "3px 8px", borderRadius: 20, background: "rgba(255,211,61,0.85)", fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, color: "#000" }}>
                      ⏳ Loading...
                    </div>
                  )}

                  {/* Outfit name */}
                  <div style={{ position: "absolute", bottom: 12, left: 14, right: 14 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: "#fff" }}>{outfit.name}</div>
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: "14px 16px" }}>
                  {/* Why this outfit */}
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", lineHeight: 1.6, padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 12, borderLeft: `3px solid ${result.gender === "male" ? "#4D96FF" : "#FF6B9D"}`, marginBottom: 12 }}>
                    💡 {outfit.why}
                  </div>

                  {/* Items */}
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
                    🛍️ Outfit Items:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {outfit.items.map((item, j) => (
                      <div key={j} style={{ padding: "5px 12px", borderRadius: 20, background: "var(--surface)", fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text)", border: "1px solid var(--border)" }}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Skin Tone Tips */}
          <div style={{ background: `${skinInfo?.color}15`, border: `1px solid ${skinInfo?.color}40`, borderRadius: 18, padding: 16 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
              {skinInfo?.emoji} {skinInfo?.label} skin for color tips
            </div>
            {(skinTone === "fair" ? [
              "Pastels aur soft tones tumhare liye are best",
              "Navy, deep blue, forest green suits very well",
              "Avoid very pale yellow ya neon — looks washed out",
              "Jewel tones — emerald, sapphire — look stunning",
              "Black aur white dono are great options",
            ] : skinTone === "medium" ? [
              "Warm earth tones — rust, mustard, olive — are best",
              "Rich jewel tones — burgundy, teal, royal blue suit well",
              "Avoid very pale pastels — woh blend in",
              "Orange aur terracotta shades look gorgeous",
              "Bold prints aur patterns tumhare skin pe pop beautifully",
            ] : [
              "Bold bright colors — neon, electric blue, hot pink — look stunning",
              "White aur ivory create stunning contrast",
              "Avoid very dark colors without contrast",
              "Gold aur silver jewelry looks beautiful",
              "Rich jewel tones — emerald, purple — look regal",
            ]).map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0" }}>
                <span style={{ color: "#845EF7", flexShrink: 0 }}>✓</span>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{tip}</div>
              </div>
            ))}
          </div>

          {/* Reset */}
          <button onClick={reset}
            style={{ width: "100%", padding: "13px", border: "1px solid var(--border)", borderRadius: 14, background: "transparent", color: "var(--muted)", fontFamily: "var(--font-body)", fontSize: 13, cursor: "pointer" }}>
            🔄 Try Again
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}