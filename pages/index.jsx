import Head from "next/head";
import { useState, useEffect } from "react";

const C = {
  black: "#1C2B25", primary: "#2A5C45", accent: "#3D8B6B",
  mid: "#52B788", lightMint: "#D8F3DC", paleMint: "#F2FAF5",
  muted: "#6B7C74", white: "#FFFFFF", dark: "#152218",
};

const COURSES = [
  { level: "0 → A2", title: "Beginner Vietnamese", desc: "Start from zero and build a solid foundation. Tones, the alphabet, greetings, and everyday phrases — structured lessons that give you real confidence fast.", icon: "🌱", tag: "Most popular" },
  { level: "B1 → B2", title: "Intermediate Vietnamese", desc: "Break through your plateau. Deepen your grammar, expand your vocabulary, and tackle the nuances that make Vietnamese rich and expressive.", icon: "🌿", tag: null },
  { level: "All levels", title: "Conversation & Fluency", desc: "Stop translating in your head and start speaking naturally. Focused on real-life situations — from casual chats to navigating Vietnam confidently.", icon: "💬", tag: null },
  { level: "Ages 5–12", title: "Kids Vietnamese", desc: "Fun, engaging lessons designed for young learners. Games, songs, and stories make learning Vietnamese feel like play — while building real language skills.", icon: "🧒", tag: "Ages 5–12" },
];

const PILLARS = [
  { title: "Native speaker", body: "Born and raised in Vietnam, Tâm brings authentic pronunciation, real cultural context, and lived experience to every lesson." },
  { title: "Tailored for you", body: "Whether you're a heritage speaker reconnecting with roots or a complete beginner, every lesson adapts to exactly where you are right now." },
  { title: "Practical first", body: "No rote memorisation. Every session focuses on language you'll actually use — in conversation, at family gatherings, or in Vietnam." },
];

const PRODUCTS = [
  {
    icon: "🎬", badge: "Video course",
    title: "Vietnamese Tones Masterclass",
    desc: "A complete video series on mastering all 6 Vietnamese tones — the single most important skill for being understood. Includes exercises and quizzes.",
    price: "$29", originalPrice: null,
    chips: ["Video lessons", "Exercises", "Quizzes"],
    featured: false,
    gumroadUrl: "https://gumroad.com/l/your-tones-masterclass", // ← replace with your link
  },
  {
    icon: "🎧", badge: "Audio pack",
    title: '"Speak Like a Native" Audio Pack',
    desc: "50+ audio clips covering all 6 tones, essential phrases, and real conversation snippets recorded by a native speaker. Download and practise anywhere.",
    price: "$15", originalPrice: null,
    chips: ["50+ audio clips", "Native speaker", "MP3 download"],
    featured: false,
    gumroadUrl: "https://gumroad.com/l/your-audio-pack", // ← replace with your link
  },
  {
    icon: "📦", badge: "Bundle",
    title: "Complete Beginner Bundle",
    desc: "Everything you need to get started: Tones Masterclass videos + Native Audio Pack + bonus PDF study guide with exercises. Save 30% vs buying separately.",
    price: "$49", originalPrice: "$64",
    chips: ["Videos + Audio", "PDF study guide", "Save 30%"],
    featured: true,
    gumroadUrl: "https://gumroad.com/l/your-beginner-bundle", // ← replace with your link
  },
];

const LEVELS = ["Complete beginner", "Beginner (A1–A2)", "Intermediate (B1–B2)", "Conversation & Fluency", "Heritage speaker", "1-on-1 tutoring"];
const ADMIN_PASS = "vietwithtam2025"; // ← change this to your own password

// ── HELPERS ──
const getStorage = (key) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : []; }
  catch { return []; }
};
const setStorage = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

const Stars = ({ rating, onSet }) => (
  <div style={{ display: "flex", gap: 3 }}>
    {[1,2,3,4,5].map(i => (
      <span key={i} onClick={() => onSet?.(i)}
        style={{ fontSize: onSet ? 28 : 16, cursor: onSet ? "pointer" : "default", color: i <= rating ? "#F59E0B" : onSet ? "#D1D5DB" : "#4A6456", transition: "color 0.15s" }}>★</span>
    ))}
  </div>
);

const Modal = ({ onClose, children }) => (
  <div onClick={e => e.target === e.currentTarget && onClose()}
    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}>
    <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.muted, lineHeight: 1 }}>×</button>
      {children}
    </div>
  </div>
);

export default function VietWithTam() {
  const [scrolled, setScrolled]   = useState(false);
  const [approved, setApproved]   = useState(null);
  const [pending,  setPending]    = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [showAdmin,  setShowAdmin]  = useState(false);
  const [form, setForm]           = useState({ name: "", level: "", text: "", rating: 5 });
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminError, setAdminError]       = useState("");
  const [toast, setToast]         = useState("");

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setApproved(getStorage("vwt_approved"));
    setPending(getStorage("vwt_pending"));
  }, []);

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2800); };
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const inp = (f) => ({ value: form[f], onChange: e => setForm(p => ({ ...p, [f]: e.target.value })) });

  const handleSubmit = () => {
    if (!form.name.trim()) return setFormError("Please enter your name.");
    if (!form.level)       return setFormError("Please select your course level.");
    if (form.text.trim().length < 20) return setFormError("Please write at least 20 characters.");
    setFormError("");
    const list = [...getStorage("vwt_pending"), { id: Date.now(), ...form, text: form.text.trim(), name: form.name.trim(), date: new Date().toLocaleDateString("en-GB") }];
    setStorage("vwt_pending", list);
    setPending(list);
    setSubmitted(true);
  };

  const unlockAdmin = () => {
    if (adminPass === ADMIN_PASS) { setAdminUnlocked(true); setAdminError(""); }
    else setAdminError("Incorrect password.");
  };

  const approveReview = (review) => {
    const newPending  = pending.filter(r => r.id !== review.id);
    const newApproved = [...(approved || []), review];
    setStorage("vwt_pending", newPending);
    setStorage("vwt_approved", newApproved);
    setPending(newPending); setApproved(newApproved);
    notify("✅ Review approved and published!");
  };

  const removeReview = (review, fromPending) => {
    if (fromPending) {
      const updated = pending.filter(r => r.id !== review.id);
      setStorage("vwt_pending", updated); setPending(updated);
    } else {
      const updated = (approved || []).filter(r => r.id !== review.id);
      setStorage("vwt_approved", updated); setApproved(updated);
    }
    notify("🗑️ Review removed.");
  };

  const openReview = () => { setShowReview(true); setSubmitted(false); setForm({ name: "", level: "", text: "", rating: 5 }); setFormError(""); };

  let footerClicks = 0, footerTimer;
  const handleFooterClick = () => {
    footerClicks++;
    clearTimeout(footerTimer);
    footerTimer = setTimeout(() => { footerClicks = 0; }, 1200);
    if (footerClicks >= 3) { footerClicks = 0; setShowAdmin(true); }
  };

  return (
    <>
      <Head>
        <title>Tâm Nguyễn — Vietnamese Language Tutor</title>
        <meta name="description" content="Learn Vietnamese with a native speaker. Personalized online lessons for beginners, intermediate learners, and heritage speakers." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; color: #1C2B25; background: #fff; -webkit-font-smoothing: antialiased; }
        input, textarea, select { font-family: 'Inter', sans-serif; }

        .nav-btn { background: none; border: none; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; color: #1C2B25; padding: 6px 2px; transition: color 0.2s; }
        .nav-btn:hover { color: #3D8B6B; }
        .btn-p { background: #2A5C45; color: #fff; border: none; border-radius: 8px; padding: 13px 26px; font-size: 15px; font-weight: 500; font-family: 'Inter', sans-serif; cursor: pointer; transition: background 0.2s; display: inline-block; text-decoration: none; }
        .btn-p:hover { background: #3D8B6B; }
        .btn-p:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-o { background: transparent; color: #2A5C45; border: 1.5px solid #2A5C45; border-radius: 8px; padding: 12px 26px; font-size: 15px; font-weight: 500; font-family: 'Inter', sans-serif; cursor: pointer; transition: all 0.2s; }
        .btn-o:hover { background: #2A5C45; color: #fff; }
        .btn-sm { background: #52B788; color: #1C2B25; border: none; border-radius: 7px; padding: 9px 18px; font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer; }
        .btn-sm:hover { background: #3D8B6B; color: #fff; }
        .btn-danger { background: #FEE2E2; color: #991B1B; border: none; border-radius: 7px; padding: 7px 14px; font-size: 12px; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer; }
        .btn-danger:hover { background: #FECACA; }
        .cc { background: #fff; border: 1px solid #D8F3DC; border-radius: 14px; padding: 28px; transition: box-shadow 0.25s, transform 0.25s; }
        .cc:hover { box-shadow: 0 12px 32px rgba(42,92,69,0.1); transform: translateY(-3px); }
        .product-card { background: #fff; border: 1px solid #D8F3DC; border-radius: 16px; padding: 28px; display: flex; flex-direction: column; transition: box-shadow 0.25s, transform 0.25s; position: relative; }
        .product-card:hover { box-shadow: 0 16px 40px rgba(42,92,69,0.12); transform: translateY(-4px); }
        .product-card.featured { border: 2px solid #2A5C45; }
        .buy-btn { display: block; text-align: center; background: #2A5C45; color: #fff; border: none; border-radius: 8px; padding: 13px; font-size: 15px; font-weight: 500; font-family: 'Inter', sans-serif; cursor: pointer; text-decoration: none; transition: background 0.2s; margin-top: auto; }
        .buy-btn:hover { background: #3D8B6B; }
        .ribbon { position: absolute; top: -1px; right: 20px; background: #2A5C45; color: #fff; font-size: 11px; font-weight: 600; padding: 4px 14px; border-radius: 0 0 8px 8px; }
        .review-card { background: #243B2F; border-radius: 14px; padding: 24px; display: flex; flex-direction: column; gap: 14px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .lbl { font-size: 13px; font-weight: 600; color: #1C2B25; }
        .inp { border: 1.5px solid #D8F3DC; border-radius: 8px; padding: 11px 14px; font-size: 14px; color: #1C2B25; outline: none; transition: border-color 0.2s; background: #fff; width: 100%; }
        .inp:focus { border-color: #52B788; }
        textarea.inp { resize: vertical; min-height: 100px; line-height: 1.6; }
        .eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #3D8B6B; margin-bottom: 14px; display: block; }
        .hd { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; letter-spacing: -0.025em; line-height: 1.15; color: #1C2B25; }
        .section-heading { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 36px; font-weight: 700; line-height: 1.15; color: #1C2B25; margin-bottom: 48px; letter-spacing: -0.02em; }
        .badge { display: inline-block; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
        .badge-p { background: #FEF3C7; color: #92400E; }
        .badge-a { background: #D8F3DC; color: #2A5C45; }
        .toast-el { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #1C2B25; color: #fff; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 500; z-index: 300; white-space: nowrap; pointer-events: none; }
        @media (max-width: 768px) {
          .hero-deco { font-size: 72px !important; }
          .hero-h1 { font-size: 38px !important; }
          .two-col, .course-grid, .pillar-grid, .shop-grid, .testi-grid { grid-template-columns: 1fr !important; }
          .two-col { gap: 40px !important; }
          .nav-links { display: none !important; }
          .section-heading { font-size: 28px !important; margin-bottom: 32px !important; }
        }
      `}</style>

      {toast && <div className="toast-el">{toast}</div>}

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? "rgba(255,255,255,0.96)" : "transparent", backdropFilter: scrolled ? "blur(10px)" : "none", borderBottom: scrolled ? "1px solid #E4F3EB" : "none", transition: "all 0.3s", padding: "0 6%", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <span className="hd" style={{ fontSize: 20, color: C.primary }}>Tâm Nguyễn</span>
        </button>
        <div className="nav-links" style={{ display: "flex", gap: 36 }}>
          {[["About","about"],["Courses","courses"],["Shop","shop"],["Reviews","testimonials"],["Contact","contact"]].map(([l,id]) => (
            <button key={id} className="nav-btn" onClick={() => scrollTo(id)}>{l}</button>
          ))}
        </div>
        <button className="btn-p" style={{ padding: "9px 20px", fontSize: 14 }} onClick={() => scrollTo("contact")}>Book a lesson</button>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "100px 6% 80px", background: C.paleMint, position: "relative", overflow: "hidden" }}>
        <div className="hero-deco" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-46%,-50%)", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 200, fontWeight: 700, color: "#D0EDDA", userSelect: "none", whiteSpace: "nowrap", pointerEvents: "none", lineHeight: 1, letterSpacing: "-0.03em" }}>Xin chào</div>
        <div style={{ position: "relative", maxWidth: 660 }}>
          <span className="eyebrow">Vietnamese language tutor · Online & Hà Nội</span>
          <h1 className="hero-h1 hd" style={{ fontSize: 60, marginBottom: 24 }}>Speak Vietnamese<br /><span style={{ color: C.primary }}>with confidence.</span></h1>
          <p style={{ fontSize: 18, color: C.muted, lineHeight: 1.75, marginBottom: 40, maxWidth: 500 }}>From your very first words to natural, flowing conversations — personalized lessons with a native speaker who genuinely cares about your progress.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 48 }}>
            <button className="btn-p" onClick={() => scrollTo("contact")}>Book a free trial lesson</button>
            <button className="btn-o" onClick={() => scrollTo("courses")}>View courses</button>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["Native Vietnamese speaker","3+ years tutoring","Beginner to advanced"].map(t => (
              <span key={t} style={{ fontSize: 12, fontWeight: 600, color: C.primary, background: C.lightMint, padding: "5px 14px", borderRadius: 20 }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ padding: "96px 6%", background: C.white }}>
        <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: 300, height: 380, borderRadius: 20, overflow: "hidden", border: "1px solid #B7E4C7", position: "relative" }}>
              <img
                src="/photo.jpg"
                alt="Tâm Nguyễn — Vietnamese language tutor"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
              />
            </div>
          </div>
          <div>
            <span className="eyebrow">About Tâm</span>
            <h2 className="hd" style={{ fontSize: 36, marginBottom: 20 }}>A teacher who's been<br />in your shoes.</h2>
            <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.8, marginBottom: 16 }}>Hi, I'm Tâm — a native Vietnamese speaker and language tutor passionate about helping students of all backgrounds genuinely connect with Vietnamese.</p>
            <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.8, marginBottom: 32 }}>Whether you're a heritage speaker reconnecting with your roots, a complete beginner starting from zero, or an intermediate learner ready to push through your plateau — I'll build a plan that fits your life and goals.</p>
            <button className="btn-p" onClick={() => scrollTo("contact")}>Book your first lesson →</button>
          </div>
        </div>
      </section>

      {/* COURSES */}
      <section id="courses" style={{ padding: "96px 6%", background: C.paleMint }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <span className="eyebrow">Courses</span>
          <h2 className="section-heading">Find the right class for you.</h2>
          <div style={{ background: C.lightMint, borderRadius: 10, padding: "10px 18px", marginBottom: 28, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>👤</span>
            <p style={{ fontSize: 14, color: C.primary, fontWeight: 500 }}>All lessons are taught 1-on-1 — fully personalised to your level and goals</p>
          </div>
          <div className="course-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {COURSES.map(c => (
              <div key={c.title} className="cc">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <span style={{ fontSize: 32 }}>{c.icon}</span>
                  {c.tag && <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", background: C.lightMint, color: C.primary, borderRadius: 20 }}>{c.tag}</span>}
                </div>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.mid, marginBottom: 8 }}>{c.level}</p>
                <h3 className="hd" style={{ fontSize: 20, marginBottom: 12 }}>{c.title}</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY TÂM */}
      <section style={{ padding: "96px 6%", background: C.white }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <span className="eyebrow">Why Tâm</span>
          <h2 className="section-heading">Learning that actually sticks.</h2>
          <div className="pillar-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 40 }}>
            {PILLARS.map(p => (
              <div key={p.title}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: C.lightMint, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z" fill={C.primary} /></svg>
                </div>
                <h3 className="hd" style={{ fontSize: 20, marginBottom: 12 }}>{p.title}</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOP */}
      <section id="shop" style={{ padding: "96px 6%", background: C.paleMint }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 48 }}>
            <div>
              <span className="eyebrow">Digital products</span>
              <h2 className="hd" style={{ fontSize: 36 }}>Learn at your own pace.</h2>
            </div>
            <p style={{ fontSize: 14, color: C.muted, maxWidth: 280, textAlign: "right", lineHeight: 1.6 }}>Instant download after purchase. Secure checkout via Gumroad.</p>
          </div>
          <div className="shop-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, alignItems: "stretch" }}>
            {PRODUCTS.map(p => (
              <div key={p.title} className={`product-card${p.featured ? " featured" : ""}`}>
                {p.featured && <div className="ribbon">⭐ Best value</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                  <span style={{ fontSize: 36 }}>{p.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", background: p.featured ? C.lightMint : C.paleMint, color: p.featured ? C.primary : C.muted, borderRadius: 20 }}>{p.badge}</span>
                </div>
                <h3 className="hd" style={{ fontSize: 19, marginBottom: 12 }}>{p.title}</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, marginBottom: 20, flexGrow: 1 }}>{p.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                  {p.chips.map(t => (
                    <span key={t} style={{ fontSize: 11, fontWeight: 500, padding: "3px 10px", background: p.featured ? C.lightMint : C.paleMint, color: p.featured ? C.primary : C.accent, borderRadius: 20 }}>{t}</span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
                  <span className="hd" style={{ fontSize: 28 }}>{p.price}</span>
                  {p.originalPrice && <span style={{ fontSize: 15, color: C.muted, textDecoration: "line-through" }}>{p.originalPrice}</span>}
                </div>
                <a href={p.gumroadUrl} target="_blank" rel="noopener noreferrer" className="buy-btn">Buy now — instant download</a>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 28, fontSize: 13, color: C.muted }}>
            🔒 Secure checkout via Gumroad · Instant delivery by email · All major cards + PayPal accepted
          </p>
        </div>
      </section>

      {/* STUDENT STORIES */}
      <section id="testimonials" style={{ padding: "96px 6%", background: "#1C2B25" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 48 }}>
            <div>
              <span className="eyebrow" style={{ color: C.mid }}>Student stories</span>
              <h2 className="hd" style={{ fontSize: 36, color: "#fff" }}>Hear from past students.</h2>
            </div>
            <button onClick={openReview} className="btn-sm">✍️ Leave a review</button>
          </div>
          {approved === null ? (
            <div style={{ textAlign: "center", padding: 40, color: "#4A6456" }}>Loading…</div>
          ) : approved.length === 0 ? (
            <div style={{ background: "#243B2F", borderRadius: 14, padding: 48, textAlign: "center" }}>
              <p style={{ fontSize: 36, marginBottom: 12 }}>💬</p>
              <p style={{ fontWeight: 600, color: "#fff", marginBottom: 6, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>No reviews yet</p>
              <p style={{ fontSize: 14, color: "#7BB897", marginBottom: 20 }}>Be the first to share your experience!</p>
              <button onClick={openReview} className="btn-p" style={{ background: C.mid, color: "#1C2B25" }}>Leave the first review →</button>
            </div>
          ) : (
            <div className="testi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 }}>
              {approved.map(r => (
                <div key={r.id} className="review-card">
                  <svg width="28" height="20" viewBox="0 0 28 20" fill="none"><path d="M0 20V12C0 5.333 3.333 1.333 10 0L11.5 2.5C8.833 3.5 7.167 5.667 6.5 9H12V20H0ZM16 20V12C16 5.333 19.333 1.333 26 0L27.5 2.5C24.833 3.5 23.167 5.667 22.5 9H28V20H16Z" fill="#3D8B6B" opacity="0.6" /></svg>
                  <Stars rating={r.rating} />
                  <p style={{ fontSize: 14, color: "#9BB8A8", lineHeight: 1.75 }}>{r.text}</p>
                  <div>
                    <p className="hd" style={{ fontSize: 14, color: "#fff" }}>{r.name}</p>
                    <p style={{ fontSize: 12, color: C.mid, marginTop: 2 }}>{r.level} · {r.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: "96px 6%", background: C.paleMint }}>
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <span className="eyebrow">Get in touch</span>
          <h2 className="hd" style={{ fontSize: 40, marginBottom: 16 }}>Ready to start your journey?</h2>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.75, marginBottom: 40 }}>Book a free 30-minute trial lesson — no commitment, just a relaxed conversation about your goals.</p>
          <div style={{ background: C.white, border: "1px solid #D8F3DC", borderRadius: 16, padding: "36px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
            <a href="https://calendly.com/tamnguyen161814/30min" target="_blank" rel="noopener noreferrer" className="btn-p" style={{ textAlign: "center", fontSize: 16, padding: "15px 32px" }}>📅 Book a free trial on Calendly</a>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "#D8F3DC" }} />
              <span style={{ fontSize: 12, color: "#9BB8A8", fontWeight: 500 }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#D8F3DC" }} />
            </div>
            <a href="mailto:tam@vietwithtam.com" style={{ display: "block", textAlign: "center", fontSize: 15, color: C.accent, fontWeight: 500, textDecoration: "none", padding: 12, border: "1.5px solid #D8F3DC", borderRadius: 8 }}>✉️ tam@vietwithtam.com</a>
          </div>
          <p style={{ fontSize: 13, color: "#9BB8A8", marginTop: 24, lineHeight: 1.6 }}>I typically reply within 24 hours. Lessons run online via Zoom or Google Meet.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: C.dark, padding: "28px 6%", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span className="hd" style={{ fontSize: 17, color: C.mid }}>Tâm Nguyễn</span>
        <div style={{ display: "flex", gap: 24 }}>
          {[["About","about"],["Courses","courses"],["Shop","shop"],["Contact","contact"]].map(([l,id]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#4A6456", fontFamily: "'Inter',sans-serif" }}>{l}</button>
          ))}
        </div>
        <span onClick={handleFooterClick} style={{ fontSize: 12, color: "#3A5244", cursor: "default", userSelect: "none" }}>© 2025 vietwithtam.com</span>
      </footer>

      {/* REVIEW MODAL */}
      {showReview && (
        <Modal onClose={() => setShowReview(false)}>
          <div style={{ padding: "32px 28px" }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <p style={{ fontSize: 44, marginBottom: 14 }}>🎉</p>
                <h2 className="hd" style={{ fontSize: 24, marginBottom: 10 }}>Thank you!</h2>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, maxWidth: 340, margin: "0 auto 24px" }}>Your review has been submitted and will appear on the website once Tâm approves it.</p>
                <button className="btn-sm" style={{ background: C.lightMint, color: C.primary }} onClick={() => setShowReview(false)}>Close</button>
              </div>
            ) : (
              <>
                <h2 className="hd" style={{ fontSize: 24, marginBottom: 6 }}>Leave a review</h2>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Your review helps other students find Tâm. Takes 2 minutes.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div className="field"><span className="lbl">Your rating</span><Stars rating={form.rating} onSet={r => setForm(f => ({ ...f, rating: r }))} /></div>
                  <div className="field"><label className="lbl">Your name <span style={{ color: C.muted, fontWeight: 400 }}>(first name is fine)</span></label><input className="inp" placeholder="e.g. Sarah" {...inp("name")} /></div>
                  <div className="field"><label className="lbl">Which course did you take?</label>
                    <select className="inp" {...inp("level")}><option value="">Select a course…</option>{LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select>
                  </div>
                  <div className="field"><label className="lbl">Your review</label>
                    <textarea className="inp" placeholder="What did you enjoy? What improved? Would you recommend Tâm?" {...inp("text")} />
                    <p style={{ fontSize: 12, color: C.muted }}>{form.text.length} characters{form.text.length > 0 && form.text.length < 20 ? " — write a bit more" : ""}</p>
                  </div>
                  {formError && <p style={{ fontSize: 13, color: "#991B1B", background: "#FEE2E2", padding: "10px 14px", borderRadius: 8 }}>⚠️ {formError}</p>}
                  <button className="btn-p" onClick={handleSubmit}>Submit my review →</button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* ADMIN MODAL */}
      {showAdmin && (
        <Modal onClose={() => { setShowAdmin(false); setAdminUnlocked(false); setAdminPass(""); setAdminError(""); }}>
          <div style={{ padding: "28px" }}>
            {!adminUnlocked ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <p style={{ fontSize: 32, marginBottom: 10 }}>🔐</p>
                <h2 className="hd" style={{ fontSize: 22, marginBottom: 6 }}>Admin access</h2>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Enter your password to manage reviews.</p>
                <div style={{ display: "flex", gap: 8, maxWidth: 300, margin: "0 auto" }}>
                  <input className="inp" type="password" placeholder="Password" value={adminPass} onChange={e => setAdminPass(e.target.value)} onKeyDown={e => e.key === "Enter" && unlockAdmin()} />
                  <button className="btn-p" style={{ whiteSpace: "nowrap", padding: "11px 18px" }} onClick={unlockAdmin}>Enter</button>
                </div>
                {adminError && <p style={{ fontSize: 13, color: "#991B1B", marginTop: 10 }}>{adminError}</p>}
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div><h2 className="hd" style={{ fontSize: 22 }}>Manage reviews</h2><p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{pending.length} pending · {(approved||[]).length} published</p></div>
                  <button className="btn-sm" style={{ background: C.paleMint, color: C.muted, fontSize: 12 }} onClick={() => setAdminUnlocked(false)}>Lock</button>
                </div>
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600 }}>Awaiting approval</h3>
                    {pending.length > 0 && <span className="badge badge-p">{pending.length} new</span>}
                  </div>
                  {pending.length === 0 ? (
                    <div style={{ background: C.paleMint, borderRadius: 10, padding: 20, textAlign: "center", fontSize: 13, color: C.muted }}>No pending reviews 🎉</div>
                  ) : pending.map(r => (
                    <div key={r.id} style={{ border: "1px solid #D8F3DC", borderRadius: 10, padding: 16, marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><div><p style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</p><p style={{ fontSize: 12, color: C.muted }}>{r.level} · {r.date}</p></div><Stars rating={r.rating} /></div>
                      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, marginBottom: 12 }}>{r.text}</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn-p" style={{ fontSize: 13, padding: "8px 16px" }} onClick={() => approveReview(r)}>✅ Approve & publish</button>
                        <button className="btn-danger" onClick={() => removeReview(r, true)}>🗑️ Dismiss</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600 }}>Published</h3>
                    <span className="badge badge-a">{(approved||[]).length} live</span>
                  </div>
                  {(approved||[]).length === 0 ? (
                    <div style={{ background: C.paleMint, borderRadius: 10, padding: 20, textAlign: "center", fontSize: 13, color: C.muted }}>No published reviews yet.</div>
                  ) : (approved||[]).map(r => (
                    <div key={r.id} style={{ border: "1px solid #D8F3DC", borderRadius: 10, padding: 14, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ flex: 1 }}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}><p style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</p><Stars rating={r.rating} /></div><p style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{r.level} · {r.date}</p><p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{r.text}</p></div>
                      <button className="btn-danger" onClick={() => removeReview(r, false)}>Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
