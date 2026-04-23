import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  useP,
  fileToImageRef,
  getAdminToken,
  setAdminToken,
  clearAdminSession,
  apiPath,
  forceFlushWorks,
} from "./persist.js";
import { useI18n } from "./i18n.jsx";

/* ═══════════════════════════════════════════════════════════════
   NECTAR ATELIER — Apple Minimalism × Editorial Magazine
   Instrument Serif · Gaussian Blur · Gradient Depth
   ═══════════════════════════════════════════════════════════════ */

/** 雲端 data.json 單一 key；votes / wishes 一併存在同檔 */
const SK = { w: "nectar-w3" };

function useInView(th = 0.15) {
  const r = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = r.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setV(true);
          o.unobserve(el);
        }
      },
      { threshold: th },
    );
    o.observe(el);
    return () => o.disconnect();
  }, [th]);
  return [r, v];
}

function usePx(sp = 0.3) {
  const r = useRef(null);
  const [o, setO] = useState(0);
  useEffect(() => {
    const h = () => {
      if (!r.current) return;
      const rc = r.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (vh - rc.top) / (vh + rc.height);
      setO((p - 0.5) * sp * rc.height);
    };
    window.addEventListener("scroll", h, { passive: true });
    h();
    return () => window.removeEventListener("scroll", h);
  }, [sp]);
  return [r, o];
}

// Icons
const X = ({ s = 20, ...p }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const Plus = ({ s = 20, ...p }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    {...p}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const Edit = ({ s = 16, ...p }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const Trash = ({ s = 16, ...p }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const Cam = ({ s = 16, ...p }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const Send = ({ s = 14, ...p }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const Arr = ({ s = 16, d = "down", ...p }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    {d === "down" ? (
      <polyline points="6 9 12 15 18 9" />
    ) : d === "left" ? (
      <polyline points="15 18 9 12 15 6" />
    ) : (
      <polyline points="9 6 15 12 9 18" />
    )}
  </svg>
);
const Crown = ({ s = 24, ...p }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M2.5 18.5l2-10 5 4 2.5-6 2.5 6 5-4 2 10z" />
  </svg>
);

const GR = {
  永生花:
    "linear-gradient(145deg,#1a0a1e 0%,#3d1548 35%,#5c2268 70%,#2a1030 100%)",
  乾燥花:
    "linear-gradient(145deg,#1a1008 0%,#4a2e14 35%,#6b4422 70%,#2a1a0a 100%)",
  鮮花: "linear-gradient(145deg,#081a10 0%,#143a28 35%,#1e5a3c 70%,#0a2a16 100%)",
  多肉: "linear-gradient(145deg,#0e1a0e 0%,#1e3a1e 35%,#2e5a2e 70%,#142a14 100%)",
  花圈: "linear-gradient(145deg,#1a1508 0%,#4a3a10 35%,#6b5820 70%,#2a2008 100%)",
  捧花: "linear-gradient(145deg,#1a1414 0%,#3a2828 35%,#5a3e3e 70%,#2a1e1e 100%)",
  水晶花:
    "linear-gradient(145deg,#0a1522 0%,#1a3550 38%,#2a5070 72%,#0c1828 100%)",
};

const DW = [
  {
    id: "1",
    title: "永生花・粉霧玫瑰",
    en: "Preserved Rose — Blush Mist",
    price: 1280,
    image: "",
    cat: "永生花",
    desc: "淡粉色永生玫瑰搭配滿天星，封存最美的瞬間",
    descEn:
      "Blush preserved roses with baby's breath — a fleeting moment, held still.",
    gallery: [],
  },
  {
    id: "2",
    title: "乾燥花束・秋日暖陽",
    en: "Dried Bouquet — Autumn Glow",
    price: 980,
    image: "",
    cat: "乾燥花",
    desc: "暖色系乾燥花束，秋冬限定的溫柔",
    descEn:
      "Warm-toned dried blooms — autumn and winter softness, in one bundle.",
    gallery: [],
  },
  {
    id: "3",
    title: "鮮花花藝・白綠森林",
    en: "Fresh Arrangement — White Forest",
    price: 1680,
    image: "",
    cat: "鮮花",
    desc: "白綠色系歐式花藝，純淨的呼吸感",
    descEn:
      "European-style white and green fresh florals — quiet, airy clarity.",
    gallery: [],
  },
  {
    id: "4",
    title: "多肉組盆・石蓮集",
    en: "Succulent Planter — Stone Lotus",
    price: 780,
    image: "",
    cat: "多肉",
    desc: "多款石蓮花精緻組盆，小巧的療癒世界",
    descEn: "A miniature garden of echeveria — small pots, big calm.",
    gallery: [],
  },
  {
    id: "5",
    title: "花圈・松果聖誕",
    en: "Wreath — Pinecone Noël",
    price: 1480,
    image: "",
    cat: "花圈",
    desc: "松果與乾燥果實交織的冬日花圈",
    descEn: "Pinecones and dried botanicals woven into a winter wreath.",
    gallery: [],
  },
  {
    id: "6",
    title: "新娘捧花・白紗",
    en: "Bridal Bouquet — White Veil",
    price: 2580,
    image: "",
    cat: "捧花",
    desc: "經典白色系新娘捧花，為幸福加冕",
    descEn: "Classic white bridal bouquet — a quiet crown for the big day.",
    gallery: [],
  },
];
const DV = [
  {
    id: "v1",
    name: "玫瑰",
    en: "Rose",
    emoji: "🌹",
    votes: 0,
    image: "",
  },
  {
    id: "v2",
    name: "向日葵",
    en: "Sunflower",
    emoji: "🌻",
    votes: 0,
    image: "",
  },
  {
    id: "v3",
    name: "繡球花",
    en: "Hydrangea",
    emoji: "💠",
    votes: 0,
    image: "",
  },
  {
    id: "v4",
    name: "鬱金香",
    en: "Tulip",
    emoji: "🌷",
    votes: 0,
    image: "",
  },
  {
    id: "v5",
    name: "百合",
    en: "Lily",
    emoji: "🤍",
    votes: 0,
    image: "",
  },
  {
    id: "v6",
    name: "桔梗",
    en: "Lisianthus",
    emoji: "💜",
    votes: 0,
    image: "",
  },
  {
    id: "v7",
    name: "滿天星",
    en: "Gypsophila",
    emoji: "✨",
    votes: 0,
    image: "",
  },
  {
    id: "v8",
    name: "芍藥",
    en: "Peony",
    emoji: "🩷",
    votes: 0,
    image: "",
  },
];

function normalizeSocialUrl(u) {
  if (!u || typeof u !== "string") return "";
  const s = u.trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

// Danmaku
function Danmaku({ wishes }) {
  const [its, setIts] = useState([]);
  const c = useRef(0);
  useEffect(() => {
    if (!wishes.length) return;
    const iv = setInterval(() => {
      const w = wishes[Math.floor(Math.random() * wishes.length)];
      setIts((p) => [
        ...p.slice(-22),
        {
          id: c.current++,
          text: w.text,
          top: 5 + Math.random() * 78,
          dur: 10 + Math.random() * 6,
          sz: Math.random() > 0.7 ? 16 : 13,
        },
      ]);
    }, 2400);
    return () => clearInterval(iv);
  }, [wishes]);
  useEffect(() => {
    if (its.length) {
      const t = setTimeout(() => setIts((p) => p.slice(1)), 17000);
      return () => clearTimeout(t);
    }
  }, [its]);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      {its.map((d) => (
        <div
          key={d.id}
          style={{
            position: "absolute",
            top: `${d.top}%`,
            right: "-340px",
            whiteSpace: "nowrap",
            fontSize: d.sz,
            color: "rgba(201,169,110,0.4)",
            textShadow: "0 1px 12px rgba(0,0,0,0.8)",
            fontWeight: 400,
            letterSpacing: "0.08em",
            fontFamily: "'Instrument Serif',serif",
            fontStyle: "italic",
            animation: `dm ${d.dur}s linear forwards`,
          }}
        >
          ✿ {d.text}
        </div>
      ))}
    </div>
  );
}

/** 依縮圖列索引刪除：0=主圖（會由圖庫第一張遞補，無則清空） */
function removeWorkImageAtThumbIndex(work, thumbIdx) {
  const g = [...(work.gallery || [])];
  const hasMain = !!work.image;
  if (hasMain) {
    if (thumbIdx === 0) {
      const nextMain = g.length > 0 ? g[0] : "";
      const nextGallery = g.slice(1);
      return { ...work, image: nextMain, gallery: nextGallery };
    }
    const gi = thumbIdx - 1;
    if (gi >= 0 && gi < g.length) {
      return { ...work, gallery: g.filter((_, j) => j !== gi) };
    }
    return work;
  }
  if (thumbIdx >= 0 && thumbIdx < g.length) {
    return { ...work, gallery: g.filter((_, j) => j !== thumbIdx) };
  }
  return work;
}

// Detail Lightbox
function Detail({ work, onClose, admin, onUploadGallery, onRemoveImage }) {
  const { workTitle, workSubtitle, workDesc, workCat, t, workPriceLabel } =
    useI18n();
  const [idx, setIdx] = useState(0);
  const allImgs = useMemo(() => {
    const a = [];
    if (work.image) a.push(work.image);
    if (work.gallery) a.push(...work.gallery);
    return a;
  }, [work]);
  const cur = allImgs[idx] || null;

  useEffect(() => {
    if (idx >= allImgs.length) {
      setIdx(Math.max(0, allImgs.length - 1));
    }
  }, [allImgs.length, idx]);
  const mainT = workTitle(work);
  const subT = workSubtitle(work);
  const dsc = workDesc(work);
  const catL = workCat(work);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        animation: "fadeIn 0.3s",
      }}
      onClick={onClose}
    >
      {/* Blurred bg */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: cur
            ? `url(${cur}) center 42% / cover no-repeat`
            : GR[work.cat] || GR["鮮花"],
          filter: "blur(40px) brightness(0.25) saturate(1.3)",
          transform: "scale(1.15)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
        }}
      />

      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#fff",
          width: 44,
          height: 44,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10,
          transition: "all 0.3s",
        }}
      >
        <X s={18} />
      </button>

      <div
        style={{
          position: "relative",
          zIndex: 5,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 24px 40px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main image */}
        {allImgs.length > 0 ? (
          <div
            style={{
              position: "relative",
              maxWidth: 900,
              width: "100%",
              flex: "1 1 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 0,
            }}
          >
            <img
              src={allImgs[idx]}
              alt=""
              style={{
                maxWidth: "100%",
                maxHeight: "65vh",
                objectFit: "contain",
                borderRadius: 6,
                boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
              }}
            />
            {allImgs.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setIdx((i) => (i - 1 + allImgs.length) % allImgs.length)
                  }
                  style={{ ...navBtn, left: -20 }}
                >
                  <Arr s={20} d="left" />
                </button>
                <button
                  onClick={() => setIdx((i) => (i + 1) % allImgs.length)}
                  style={{ ...navBtn, right: -20 }}
                >
                  <Arr s={20} d="right" />
                </button>
              </>
            )}
          </div>
        ) : (
          <div
            style={{
              width: 400,
              height: 300,
              background: GR[work.cat] || GR["鮮花"],
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 80, opacity: 0.1, color: "#C9A96E" }}>
              ✿
            </span>
          </div>
        )}

        {/* Thumbnails */}
        {allImgs.length > 1 && (
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 20,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {allImgs.map((img, i) => (
              <div
                key={i}
                style={{
                  position: "relative",
                  width: 56,
                  height: 56,
                }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIdx(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setIdx(i);
                  }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 4,
                    overflow: "hidden",
                    border:
                      i === idx
                        ? "2px solid #C9A96E"
                        : "2px solid transparent",
                    cursor: "pointer",
                    opacity: i === idx ? 1 : 0.5,
                    transition: "all 0.3s",
                  }}
                >
                  <img
                    src={img}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                {admin && onRemoveImage && (
                  <button
                    type="button"
                    title={t("detailRemoveCover")}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(t("detailRemovePhotoConfirm"))) {
                        onRemoveImage(work.id, i);
                      }
                    }}
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: "none",
                      background: "rgba(185,28,28,0.92)",
                      color: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                      zIndex: 2,
                    }}
                  >
                    <X s={12} />
                  </button>
                )}
              </div>
            ))}
            {admin && (
              <label
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 4,
                  border: "1px dashed rgba(201,169,110,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "rgba(201,169,110,0.5)",
                }}
              >
                <Plus s={18} />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files)
                      onUploadGallery(work.id, [...e.target.files]);
                  }}
                />
              </label>
            )}
          </div>
        )}
        {allImgs.length <= 1 && admin && (
          <div
            style={{
              marginTop: 16,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            {allImgs.length === 1 && onRemoveImage && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t("detailRemovePhotoConfirm"))) {
                    onRemoveImage(work.id, 0);
                    setIdx(0);
                  }
                }}
                style={{
                  background: "rgba(185,28,28,0.15)",
                  border: "1px solid rgba(239,68,68,0.35)",
                  color: "rgba(252,165,165,0.95)",
                  padding: "8px 16px",
                  fontSize: 12,
                  fontFamily: "'Instrument Serif',serif",
                  fontStyle: "italic",
                  cursor: "pointer",
                  borderRadius: 20,
                }}
              >
                {t("detailRemoveCover")}
              </button>
            )}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "rgba(201,169,110,0.4)",
                fontSize: 12,
                fontFamily: "'Instrument Serif',serif",
                fontStyle: "italic",
                cursor: "pointer",
                padding: "8px 16px",
                border: "1px dashed rgba(201,169,110,0.2)",
                borderRadius: 20,
              }}
            >
              <Plus s={14} /> {t("detailAddAngles")}
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files)
                    onUploadGallery(work.id, [...e.target.files]);
                }}
              />
            </label>
          </div>
        )}

        {admin && (
          <p
            style={{
              fontSize: 10,
              color: "rgba(201,169,110,0.28)",
              maxWidth: 420,
              marginTop: 14,
              lineHeight: 1.55,
              textAlign: "center",
              fontFamily: "'Instrument Serif',serif",
              fontStyle: "italic",
            }}
          >
            <span style={{ display: "block", marginBottom: 6, letterSpacing: "0.12em" }}>
              {t("photoTipTitle")}
            </span>
            {t("photoTipBody")}
          </p>
        )}

        {/* Info */}
        <div style={{ textAlign: "center", marginTop: 24, maxWidth: 600 }}>
          <div
            style={{
              display: "inline-block",
              fontFamily: "'Instrument Serif',serif",
              fontSize: 11,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(248,242,232,0.92)",
              marginBottom: 12,
              padding: "5px 16px",
              border: "1px solid rgba(201,169,110,0.45)",
              background: "rgba(0,0,0,0.35)",
              borderRadius: 2,
            }}
          >
            {catL}
          </div>
          <h2
            style={{
              fontFamily: "'Noto Serif TC',serif",
              fontSize: "clamp(24px,4vw,36px)",
              fontWeight: 400,
              color: "#FAF7F2",
              letterSpacing: "0.04em",
              marginBottom: 6,
              textShadow: "0 2px 12px rgba(0,0,0,0.5)",
            }}
          >
            {mainT}
          </h2>
          {subT ? (
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 14,
                fontStyle: "italic",
                color: "rgba(255,248,238,0.88)",
                letterSpacing: "0.14em",
                marginBottom: 12,
                lineHeight: 1.45,
              }}
            >
              {subT}
            </div>
          ) : null}
          <p
            style={{
              fontFamily: "'Noto Serif TC',serif",
              fontSize: 13,
              color: "rgba(245,240,235,0.55)",
              lineHeight: 1.9,
              marginBottom: 16,
            }}
          >
            {dsc}
          </p>
          <div
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 28,
              fontWeight: 400,
              color: "#C9A96E",
              letterSpacing: "0.04em",
            }}
          >
            {workPriceLabel(work)}
          </div>
        </div>
      </div>
    </div>
  );
}
const navBtn = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#fff",
  width: 44,
  height: 44,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.3s",
  zIndex: 10,
};

// Work Section
function WS({ work, index, total, admin, onEdit, onDelete, onUpload, onOpen }) {
  const { t, workTitle, workSubtitle, workDesc, workCat, workPriceLabel } =
    useI18n();
  const [pr, po] = usePx(0.22);
  const [tr, tv] = useInView();
  const [h, setH] = useState(false);
  const gr = GR[work.cat] || GR["鮮花"];
  const hasImg = !!work.image;
  const imgFilter = hasImg
    ? h
      ? "brightness(0.92) saturate(1.06)"
      : "brightness(0.78) saturate(1.04)"
    : h
      ? "blur(1px) brightness(0.5)"
      : "blur(0px) brightness(0.35)";
  const overlayBg = hasImg
    ? "linear-gradient(0deg, rgba(6,8,10,0.62) 0%, rgba(6,8,10,0.18) 30%, rgba(6,8,10,0) 50%, rgba(6,8,10,0.35) 100%)"
    : "linear-gradient(0deg, rgba(8,7,6,0.92) 0%, rgba(8,7,6,0.2) 28%, rgba(8,7,6,0) 50%, rgba(8,7,6,0.5) 100%)";
  const mainT = workTitle(work);
  const subT = workSubtitle(work);
  const dsc = workDesc(work);
  const catL = workCat(work);
  return (
    <div
      ref={pr}
      style={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        cursor: "pointer",
      }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onClick={() => onOpen(work)}
    >
      {/* BG parallax */}
      <div
        style={{
          position: "absolute",
          inset: "-18% 0",
          transform: `translateY(${po}px) scale(${h ? 1.04 : 1})`,
          transition: "transform 1.4s cubic-bezier(0.16,1,0.3,1)",
          background: hasImg
            ? `url(${work.image}) center 42% / cover no-repeat`
            : gr,
          filter: imgFilter,
          willChange: "transform",
        }}
      >
        {!hasImg && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 160, opacity: 0.04, color: "#C9A96E" }}>
              ✿
            </span>
          </div>
        )}
      </div>

      {/* Gradient overlays — depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: overlayBg,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 70% 30%, rgba(201,169,110,0.03) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
      {/* 左側暗角：文字疊在亮部花瓣上時仍可讀 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(4,6,10,0.88) 0%, rgba(4,6,10,0.45) 22%, rgba(4,6,10,0.12) 42%, transparent 62%)",
          pointerEvents: "none",
        }}
      />

      {/* Bottom edge gradient line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "8%",
          right: "8%",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(201,169,110,0.12), transparent)",
        }}
      />

      {/* Editorial text — bottom left */}
      <div
        ref={tr}
        style={{
          position: "absolute",
          bottom: "clamp(52px,9vh,96px)",
          left: "clamp(28px,5.5vw,72px)",
          right: "clamp(28px,5.5vw,72px)",
          zIndex: 2,
          opacity: tv ? 1 : 0,
          transform: tv ? "translateY(0)" : "translateY(55px)",
          transition: "all 1.2s cubic-bezier(0.16,1,0.3,1) 0.1s",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            maxWidth: "min(540px, 100%)",
            padding: "clamp(18px,2.8vw,32px) clamp(20px,3.2vw,36px)",
            borderRadius: 3,
            background:
              "linear-gradient(145deg, rgba(6,8,12,0.72) 0%, rgba(6,8,12,0.38) 55%, rgba(6,8,12,0.22) 100%)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow:
              "0 28px 64px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Sequence */}
          <div
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 12,
              color: "rgba(201,169,110,0.55)",
              letterSpacing: "0.28em",
              marginBottom: 16,
              fontStyle: "italic",
              textShadow: "0 1px 8px rgba(0,0,0,0.6)",
            }}
          >
            {String(index + 1).padStart(2, "0")}
            <span style={{ margin: "0 8px", opacity: 0.35 }}>/</span>
            {String(total).padStart(2, "0")}
          </div>

          {/* Category */}
          <div
            style={{
              display: "inline-block",
              border: "1px solid rgba(201,169,110,0.5)",
              padding: "6px 18px",
              fontSize: 11,
              letterSpacing: "0.32em",
              color: "rgba(248,242,232,0.95)",
              fontFamily: "'Instrument Serif',serif",
              textTransform: "uppercase",
              marginBottom: 20,
              backdropFilter: "blur(10px)",
              background: "rgba(0,0,0,0.42)",
              borderRadius: 2,
              boxShadow: "0 2px 16px rgba(0,0,0,0.35)",
              textShadow: "0 1px 3px rgba(0,0,0,0.85)",
            }}
          >
            {catL}
          </div>

          {/* Title */}
          <h2
            style={{
              fontFamily: "'Noto Serif TC',serif",
              fontSize: "clamp(26px,4vw,54px)",
              fontWeight: 400,
              letterSpacing: "0.04em",
              lineHeight: 1.18,
              color: "#FAF7F2",
              marginBottom: 8,
              textShadow:
                "0 2px 4px rgba(0,0,0,0.9), 0 12px 48px rgba(0,0,0,0.55)",
            }}
          >
            {mainT}
          </h2>

          {/* 副標（點綴句）：提高對比，避免與暖色花瓣融在一起 */}
          {subT ? (
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: "clamp(12px,1.45vw,17px)",
                fontStyle: "italic",
                fontWeight: 400,
                letterSpacing: "0.14em",
                color: "rgba(255,248,238,0.9)",
                marginBottom: 18,
                lineHeight: 1.45,
                textShadow:
                  "0 1px 2px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.65)",
              }}
            >
              {subT}
            </div>
          ) : null}

          {/* Description */}
          <p
            style={{
              fontFamily: "'Noto Serif TC',serif",
              fontSize: 14,
              color: "rgba(245,240,235,0.72)",
              lineHeight: 1.85,
              maxWidth: 500,
              marginBottom: 22,
              letterSpacing: "0.03em",
              textShadow: "0 1px 12px rgba(0,0,0,0.75)",
            }}
          >
            {dsc}
          </p>

          {/* Price + CTA */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}>
            <span
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: "clamp(22px,2.8vw,32px)",
                fontWeight: 400,
                color: "#D4B87A",
                letterSpacing: "0.03em",
                textShadow: "0 2px 16px rgba(0,0,0,0.5)",
              }}
            >
              {workPriceLabel(work)}
            </span>
            {work.soldOut !== true && Number(work.price) > 0 ? (
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(212,184,122,0.72)",
                  letterSpacing: "0.26em",
                  fontFamily: "'Instrument Serif',serif",
                  textTransform: "uppercase",
                  fontStyle: "italic",
                  borderBottom: "1px solid rgba(201,169,110,0.35)",
                  paddingBottom: 2,
                  textShadow: "0 1px 8px rgba(0,0,0,0.6)",
                }}
              >
                {t("workViewDetails")}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Hover — vertical text right */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "clamp(32px,5vw,72px)",
          transform: `translateY(-50%) translateX(${h ? 0 : 14}px)`,
          opacity: h ? 1 : 0,
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
          textAlign: "right",
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 1,
            height: 44,
            background: "rgba(201,169,110,0.2)",
            marginLeft: "auto",
            marginBottom: 14,
          }}
        />
        <div
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 10,
            letterSpacing: "0.3em",
            color: "rgba(201,169,110,0.25)",
            textTransform: "uppercase",
            writingMode: "vertical-rl",
            fontStyle: "italic",
          }}
        >
          {t("verticalArt")}
        </div>
      </div>

      {/* Admin */}
      {admin && (
        <div
          style={{
            position: "absolute",
            top: 76,
            right: 24,
            display: "flex",
            gap: 8,
            zIndex: 10,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <label style={{ ...ab }}>
            <Cam />
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) =>
                e.target.files[0] && onUpload(work.id, e.target.files[0])
              }
            />
          </label>
          <button style={ab} onClick={() => onEdit(work)}>
            <Edit />
          </button>
          <button
            style={{ ...ab, color: "#EF4444" }}
            onClick={() => onDelete(work.id)}
          >
            <Trash />
          </button>
        </div>
      )}
    </div>
  );
}
const ab = {
  background: "rgba(0,0,0,0.5)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(201,169,110,0.12)",
  color: "#F5F0EB",
  width: 42,
  height: 42,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  borderRadius: "50%",
  transition: "all 0.3s",
};

// Main
export default function App() {
  const { t, locale, setLocale, flowerName } = useI18n();
  const [pg, setPg] = useState("portfolio");
  const bundleInit = useMemo(
    () => ({ works: DW, votes: DV, wishes: [] }),
    [],
  );
  const [bundle, setBundle] = useP(SK.w, bundleInit, { cloud: true });
  const works = bundle.works;
  const votes = bundle.votes;
  const wishes = bundle.wishes;
  const setW = useCallback(
    (u) =>
      setBundle((d) => ({
        ...d,
        works: typeof u === "function" ? u(d.works) : u,
      })),
    [setBundle],
  );
  const setVotes = useCallback(
    (u) =>
      setBundle((d) => ({
        ...d,
        votes: typeof u === "function" ? u(d.votes) : u,
      })),
    [setBundle],
  );
  const setWishes = useCallback(
    (u) =>
      setBundle((d) => ({
        ...d,
        wishes: typeof u === "function" ? u(d.wishes) : u,
      })),
    [setBundle],
  );
  const [ed, setEd] = useState(null);
  const [modal, setMo] = useState(false);
  const [detail, setDt] = useState(null);
  const [wiIn, setWiIn] = useState("");
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [loginPwd, setLoginPwd] = useState("");
  const [loginErr, setLoginErr] = useState(false);
  const [voted, setVd] = useState({});
  const [ho, setHo] = useState(false);
  const [co, setCo] = useState(false);
  const socialIg = normalizeSocialUrl(
    import.meta.env.VITE_SOCIAL_INSTAGRAM || "",
  );
  const socialFb = normalizeSocialUrl(
    import.meta.env.VITE_SOCIAL_FACEBOOK || "",
  );

  useEffect(() => {
    setAdminAuthed(!!getAdminToken());
  }, []);
  useEffect(() => {
    const onUnauth = () => {
      setAdminAuthed(false);
    };
    window.addEventListener("nectar-admin-unauthorized", onUnauth);
    return () =>
      window.removeEventListener("nectar-admin-unauthorized", onUnauth);
  }, []);
  useEffect(() => {
    const onSaveFail = (e) => {
      const msg = e.detail?.message;
      if (msg) window.alert(msg);
    };
    window.addEventListener("nectar-save-failed", onSaveFail);
    return () => window.removeEventListener("nectar-save-failed", onSaveFail);
  }, []);
  useEffect(() => {
    setTimeout(() => setHo(true), 200);
    setTimeout(() => setCo(true), 600);
  }, []);
  useEffect(() => {
    setCo(false);
    setTimeout(() => setCo(true), 250);
  }, [pg]);

  const sorted = useMemo(
    () => [...votes].sort((a, b) => b.votes - a.votes),
    [votes],
  );
  const mx = useMemo(() => Math.max(1, ...votes.map((f) => f.votes)), [votes]);

  const doV = (id) => {
    if (voted[id]) return;
    setVotes((p) =>
      p.map((f) => (f.id === id ? { ...f, votes: f.votes + 1 } : f)),
    );
    setVd((p) => ({ ...p, [id]: true }));
  };
  const doWi = () => {
    if (!wiIn.trim()) return;
    setWishes((p) => [...p, { id: Date.now().toString(), text: wiIn.trim() }]);
    setWiIn("");
  };
  const doVoteImg = async (id, file) => {
    if (!file) return;
    try {
      const ref = await fileToImageRef(file);
      setVotes((p) => p.map((x) => (x.id === id ? { ...x, image: ref } : x)));
    } catch (e) {
      console.error(e);
      window.alert((e && e.message) || "圖片上傳失敗");
    }
  };
  const doSv = (w) => {
    const next =
      w.id && works.find((x) => x.id === w.id)
        ? works.map((x) => (x.id === w.id ? w : x))
        : [...works, { ...w, id: Date.now().toString() }];
    setW(next);
    setMo(false);
    setEd(null);
    void forceFlushWorks(SK.w, next);
  };
  const tryAdminLogin = async () => {
    if (!loginPwd.trim()) return;
    try {
      const r = await fetch(apiPath("/api/admin/verify"), {
        method: "POST",
        headers: { Authorization: `Bearer ${loginPwd.trim()}` },
      });
      if (r.ok) {
        setAdminToken(loginPwd.trim());
        setAdminAuthed(true);
        setAdminLoginOpen(false);
        setLoginPwd("");
        setLoginErr(false);
      } else {
        setLoginErr(true);
      }
    } catch {
      setLoginErr(true);
    }
  };
  const doDl = (id) => {
    const next = works.filter((x) => x.id !== id);
    setW(next);
    void forceFlushWorks(SK.w, next);
  };
  const doUp = async (wid, f) => {
    try {
      const ref = await fileToImageRef(f);
      setW((p) => {
        const next = p.map((w) =>
          w.id === wid ? { ...w, image: ref } : w,
        );
        void forceFlushWorks(SK.w, next);
        return next;
      });
    } catch (e) {
      console.error(e);
      window.alert((e && e.message) || "主圖上傳失敗");
    }
  };
  const doGal = async (wid, files) => {
    for (const f of files) {
      try {
        const ref = await fileToImageRef(f);
        setW((p) => {
          const next = p.map((w) =>
            w.id === wid
              ? { ...w, gallery: [...(w.gallery || []), ref] }
              : w,
          );
          void forceFlushWorks(SK.w, next);
          return next;
        });
      } catch (e) {
        console.error(e);
        window.alert((e && e.message) || "圖庫上傳失敗");
      }
    }
  };
  const doRmGal = (wid, thumbIdx) => {
    const w = works.find((x) => x.id === wid);
    if (!w) return;
    const nextW = removeWorkImageAtThumbIndex(w, thumbIdx);
    const next = works.map((x) => (x.id === wid ? nextW : x));
    setW(next);
    setDt((d) => (d && d.id === wid ? nextW : d));
    void forceFlushWorks(SK.w, next);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080706",
        color: "#F5F0EB",
        fontFamily: "'Noto Serif TC','Instrument Serif',Georgia,serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Noto+Serif+TC:wght@300;400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        @keyframes dm{from{transform:translateX(0)}to{transform:translateX(calc(-100vw - 360px))}}
        @keyframes fu{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes breathe{0%,100%{box-shadow:0 0 0 0 rgba(201,169,110,0.12)}50%{box-shadow:0 0 50px 8px rgba(201,169,110,0.06)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes sc{0%,100%{opacity:0.2;transform:translateY(0)}50%{opacity:0.6;transform:translateY(7px)}}
        @keyframes glow{0%,100%{opacity:0.4}50%{opacity:0.8}}
        .nb{position:relative;padding:8px 0;color:rgba(245,240,235,0.4);background:none;border:none;cursor:pointer;font-size:13px;letter-spacing:0.06em;font-family:'Instrument Serif',serif;font-style:italic;transition:color 0.3s}
        .nb:hover,.nb.on{color:#C9A96E}
        .nb.on::after{content:'';position:absolute;bottom:-2px;left:0;right:0;height:1px;background:#C9A96E}
        .fi{width:100%;background:rgba(255,255,255,0.03);border:1px solid rgba(201,169,110,0.1);color:#F5F0EB;padding:13px 18px;font-family:'Noto Serif TC',serif;font-size:14px;border-radius:4px;outline:none;transition:all 0.3s;backdrop-filter:blur(4px)}
        .fi:focus{border-color:rgba(201,169,110,0.35);background:rgba(255,255,255,0.05)}
        .fi::placeholder{color:rgba(245,240,235,0.2)}
        textarea.fi{min-height:100px;resize:vertical;line-height:1.65;padding-top:14px;padding-bottom:14px}
        .vc{background:rgba(255,255,255,0.02);border:1px solid rgba(201,169,110,0.08);border-radius:6px;padding:20px 24px;display:flex;align-items:center;gap:18px;transition:all 0.4s cubic-bezier(0.16,1,0.3,1);cursor:pointer;backdrop-filter:blur(4px)}
        .vc:hover{border-color:rgba(201,169,110,0.25);background:rgba(201,169,110,0.03);box-shadow:0 0 60px -15px rgba(201,169,110,0.06)}
        .vc.vd{border-color:rgba(201,169,110,0.3);background:rgba(201,169,110,0.04)}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#080706}::-webkit-scrollbar-thumb{background:rgba(201,169,110,0.15);border-radius:2px}
      `}</style>

      {/* NAV */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "rgba(8,7,6,0.6)",
          backdropFilter: "blur(32px) saturate(1.5)",
          borderBottom: "1px solid rgba(201,169,110,0.06)",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "0 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 54,
          }}
        >
          <span
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 18,
              fontStyle: "italic",
              color: "#C9A96E",
              letterSpacing: "0.06em",
            }}
          >
            {t("navBrand")}
          </span>
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            <button
              className={`nb ${pg === "portfolio" ? "on" : ""}`}
              onClick={() => setPg("portfolio")}
            >
              {t("navCollection")}
            </button>
            <button
              className={`nb ${pg === "vote" ? "on" : ""}`}
              onClick={() => setPg("vote")}
            >
              {t("navVote")}
            </button>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setLocale("en")}
                style={{
                  background:
                    locale === "en" ? "rgba(201,169,110,0.15)" : "none",
                  border: "1px solid rgba(201,169,110,0.12)",
                  color: locale === "en" ? "#C9A96E" : "rgba(245,240,235,0.35)",
                  padding: "4px 10px",
                  fontSize: 11,
                  fontFamily: "'Instrument Serif',serif",
                  cursor: "pointer",
                  borderRadius: 6,
                }}
              >
                {t("langEn")}
              </button>
              <button
                type="button"
                onClick={() => setLocale("zh-TW")}
                style={{
                  background:
                    locale === "zh-TW" ? "rgba(201,169,110,0.15)" : "none",
                  border: "1px solid rgba(201,169,110,0.12)",
                  color:
                    locale === "zh-TW" ? "#C9A96E" : "rgba(245,240,235,0.35)",
                  padding: "4px 10px",
                  fontSize: 11,
                  fontFamily: "'Instrument Serif',serif",
                  cursor: "pointer",
                  borderRadius: 6,
                }}
              >
                {t("langZh")}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                if (adminAuthed) {
                  clearAdminSession();
                  setAdminAuthed(false);
                } else {
                  setLoginErr(false);
                  setAdminLoginOpen(true);
                }
              }}
              style={{
                background: "none",
                border: "1px solid rgba(201,169,110,0.1)",
                color: adminAuthed ? "#C9A96E" : "rgba(245,240,235,0.25)",
                padding: "5px 14px",
                fontSize: 11,
                letterSpacing: "0.08em",
                fontFamily: "'Instrument Serif',serif",
                fontStyle: "italic",
                cursor: "pointer",
                borderRadius: 20,
                transition: "all 0.3s",
              }}
            >
              {adminAuthed ? t("navExitAdmin") : t("navAdmin")}
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ PORTFOLIO ═══ */}
      {pg === "portfolio" && (
        <div>
          {adminAuthed && (
            <div
              style={{ position: "fixed", bottom: 32, right: 32, zIndex: 40 }}
            >
              <button
                onClick={() => {
                  setEd({
                    title: "",
                    en: "",
                    price: 0,
                    soldOut: false,
                    image: "",
                    cat: "",
                    desc: "",
                    descEn: "",
                    gallery: [],
                  });
                  setMo(true);
                }}
                style={{
                  background: "#C9A96E",
                  color: "#080706",
                  border: "none",
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 8px 40px rgba(201,169,110,0.3)",
                }}
              >
                <Plus s={22} />
              </button>
            </div>
          )}

          {works.map((w, i) => (
            <WS
              key={w.id}
              work={w}
              index={i}
              total={works.length}
              admin={adminAuthed}
              onEdit={(w) => {
                setEd(w);
                setMo(true);
              }}
              onDelete={doDl}
              onUpload={doUp}
              onOpen={setDt}
            />
          ))}

          <div
            style={{
              height: "30vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 1,
                height: 40,
                background:
                  "linear-gradient(180deg, rgba(201,169,110,0.15), transparent)",
              }}
            />
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 11,
                fontStyle: "italic",
                letterSpacing: "0.3em",
                color: "rgba(201,169,110,0.12)",
              }}
            >
              {t("portfolioEnd")}
            </div>
          </div>
        </div>
      )}

      {/* ═══ VOTE ═══ */}
      {pg === "vote" && (
        <div
          style={{
            maxWidth: 840,
            margin: "0 auto",
            padding: "96px 32px 80px",
            position: "relative",
          }}
        >
          <Danmaku wishes={wishes} />

          <div
            style={{
              textAlign: "center",
              marginBottom: 56,
              opacity: ho ? 1 : 0,
              transform: ho ? "translateY(0)" : "translateY(24px)",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, rgba(201,169,110,0.25), transparent)",
                margin: "0 auto 24px",
              }}
            />
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 12,
                fontStyle: "italic",
                letterSpacing: "0.2em",
                color: "rgba(201,169,110,0.3)",
                marginBottom: 20,
              }}
            >
              {t("voteKicker")}
            </div>
            <h2
              style={{
                fontFamily: "'Noto Serif TC',serif",
                fontSize: "clamp(32px,5.5vw,50px)",
                fontWeight: 300,
                letterSpacing: "0.04em",
                marginBottom: 12,
              }}
            >
              {t("voteTitle")}
            </h2>
            <p
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 16,
                fontStyle: "italic",
                color: "rgba(201,169,110,0.25)",
                letterSpacing: "0.1em",
              }}
            >
              {t("voteSub")}
            </p>
            <div
              style={{
                width: 40,
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, rgba(201,169,110,0.25), transparent)",
                margin: "24px auto 0",
              }}
            />
          </div>

          {sorted[0]?.votes > 0 && (
            <div
              style={{
                textAlign: "center",
                marginBottom: 48,
                padding: "36px",
                background: "rgba(201,169,110,0.02)",
                border: "1px solid rgba(201,169,110,0.08)",
                borderRadius: 8,
                animation: "breathe 4s infinite",
                backdropFilter: "blur(8px)",
              }}
            >
              <Crown
                s={24}
                style={{
                  color: "#C9A96E",
                  margin: "0 auto 12px",
                  display: "block",
                }}
              />
              <div
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 11,
                  fontStyle: "italic",
                  letterSpacing: "0.25em",
                  color: "rgba(201,169,110,0.35)",
                  marginBottom: 10,
                }}
              >
                {t("voteLeading")}
              </div>
              <div
                style={{
                  marginBottom: 10,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {sorted[0].image ? (
                  <img
                    src={sorted[0].image}
                    alt=""
                    style={{
                      width: 140,
                      height: 92,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: "1px solid rgba(201,169,110,0.15)",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 44 }}>{sorted[0].emoji}</span>
                )}
              </div>
              <div
                style={{
                  fontFamily: "'Noto Serif TC',serif",
                  fontSize: 26,
                  color: "#C9A96E",
                  fontWeight: 300,
                }}
              >
                {flowerName(sorted[0])}
              </div>
              <div
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 13,
                  fontStyle: "italic",
                  color: "rgba(201,169,110,0.35)",
                  marginTop: 6,
                }}
              >
                {locale === "en" ? sorted[0].name : sorted[0].en} —{" "}
                {sorted[0].votes} {t("voteVotes")}
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 64,
            }}
          >
            {sorted.map((f, i) => (
              <div
                key={f.id}
                className={`vc ${voted[f.id] ? "vd" : ""}`}
                onClick={() => doV(f.id)}
                style={{
                  opacity: co ? 1 : 0,
                  transform: co ? "translateY(0)" : "translateY(16px)",
                  transition: `all 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s`,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    overflow: "hidden",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(201,169,110,0.06)",
                    border: "1px solid rgba(201,169,110,0.08)",
                    animation: voted[f.id] ? "float 2.5s infinite" : "none",
                  }}
                >
                  {f.image ? (
                    <img
                      src={f.image}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 26 }}>{f.emoji}</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontFamily: "'Noto Serif TC',serif",
                          fontSize: 15,
                          fontWeight: 400,
                          color: voted[f.id] ? "#C9A96E" : "#F5F0EB",
                        }}
                      >
                        {flowerName(f)}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Instrument Serif',serif",
                          fontSize: 12,
                          fontStyle: "italic",
                          color: "rgba(201,169,110,0.25)",
                          marginLeft: 10,
                        }}
                      >
                        {locale === "en" ? f.name : f.en}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: "'Instrument Serif',serif",
                        fontSize: 13,
                        fontStyle: "italic",
                        color: "rgba(245,240,235,0.2)",
                      }}
                    >
                      {f.votes}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 3,
                      background: "rgba(201,169,110,0.06)",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(f.votes / mx) * 100}%`,
                        background:
                          "linear-gradient(90deg, rgba(201,169,110,0.6), #C9A96E)",
                        borderRadius: 2,
                        transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
                      }}
                    />
                  </div>
                </div>
                {voted[f.id] ? (
                  <span
                    style={{
                      fontFamily: "'Instrument Serif',serif",
                      fontSize: 10,
                      fontStyle: "italic",
                      color: "rgba(201,169,110,0.5)",
                    }}
                  >
                    {t("voteVoted")}
                  </span>
                ) : (
                  <Arr
                    s={14}
                    d="down"
                    style={{
                      color: "rgba(245,240,235,0.15)",
                      transform: "rotate(180deg)",
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {adminAuthed && (
            <div
              style={{
                marginBottom: 48,
                padding: 28,
                background: "rgba(201,169,110,0.03)",
                border: "1px solid rgba(201,169,110,0.1)",
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 14,
                  fontStyle: "italic",
                  color: "#C9A96E",
                  marginBottom: 8,
                }}
              >
                {t("voteCoursePhotos")}
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(245,240,235,0.35)",
                  marginBottom: 20,
                  lineHeight: 1.55,
                  fontFamily: "'Noto Serif TC',serif",
                }}
              >
                {t("voteCoursePhotosSub")}
              </p>
              <div
                style={{
                  display: "grid",
                  gap: 14,
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                }}
              >
                {votes.map((f) => (
                  <div
                    key={f.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 12,
                      background: "rgba(0,0,0,0.2)",
                      borderRadius: 6,
                      border: "1px solid rgba(201,169,110,0.06)",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 6,
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "rgba(201,169,110,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {f.image ? (
                        <img
                          src={f.image}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: 22 }}>{f.emoji}</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#F5F0EB",
                          fontFamily: "'Noto Serif TC',serif",
                        }}
                      >
                        {flowerName(f)}
                      </div>
                      <label
                        style={{
                          display: "inline-block",
                          marginTop: 6,
                          fontSize: 11,
                          color: "rgba(201,169,110,0.5)",
                          fontFamily: "'Instrument Serif',serif",
                          fontStyle: "italic",
                          cursor: "pointer",
                        }}
                      >
                        {t("modalUploadHint")}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (file) void doVoteImg(f.id, file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(201,169,110,0.08), transparent)",
              marginBottom: 56,
            }}
          />

          {/* Wish Pool */}
          <div style={{ position: "relative", zIndex: 10 }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 11,
                  fontStyle: "italic",
                  letterSpacing: "0.2em",
                  color: "rgba(201,169,110,0.3)",
                  marginBottom: 16,
                }}
              >
                {t("wishKicker")}
              </div>
              <h3
                style={{
                  fontFamily: "'Noto Serif TC',serif",
                  fontSize: 28,
                  fontWeight: 300,
                  letterSpacing: "0.04em",
                  marginBottom: 8,
                }}
              >
                {t("wishTitle")}
              </h3>
              <p
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 14,
                  fontStyle: "italic",
                  color: "rgba(201,169,110,0.2)",
                }}
              >
                {t("wishSub")}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
              <input
                className="fi"
                placeholder={t("wishPlaceholder")}
                value={wiIn}
                onChange={(e) => setWiIn(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doWi()}
                style={{ flex: 1 }}
              />
              <button
                onClick={doWi}
                style={{
                  background: "rgba(201,169,110,0.12)",
                  color: "#C9A96E",
                  border: "1px solid rgba(201,169,110,0.15)",
                  padding: "12px 22px",
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 13,
                  fontStyle: "italic",
                  cursor: "pointer",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  whiteSpace: "nowrap",
                  backdropFilter: "blur(8px)",
                  transition: "all 0.3s",
                }}
              >
                <Send /> {t("wishSend")}
              </button>
            </div>
            {wishes.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  justifyContent: "center",
                }}
              >
                {wishes.slice(-30).map((w) => (
                  <span
                    key={w.id}
                    style={{
                      display: "inline-block",
                      background: "rgba(201,169,110,0.03)",
                      border: "1px solid rgba(201,169,110,0.08)",
                      color: "rgba(245,240,235,0.5)",
                      padding: "7px 16px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontFamily: "'Instrument Serif',serif",
                      fontStyle: "italic",
                      animation: "fu 0.4s",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    ✿ {w.text}
                  </span>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: 48,
                  color: "rgba(201,169,110,0.15)",
                  fontSize: 13,
                  fontFamily: "'Instrument Serif',serif",
                  fontStyle: "italic",
                }}
              >
                {t("wishEmpty")}
              </div>
            )}
            {adminAuthed && (
              <div style={{ marginTop: 48, textAlign: "center" }}>
                <button
                  onClick={() => {
                    setVotes((p) => p.map((x) => ({ ...x, votes: 0 })));
                    setVd({});
                  }}
                  style={{
                    background: "none",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "rgba(239,68,68,0.6)",
                    padding: "8px 22px",
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: 11,
                    fontStyle: "italic",
                    cursor: "pointer",
                    borderRadius: 20,
                  }}
                >
                  {t("wishReset")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Lightbox */}
      {detail && (
        <Detail
          work={detail}
          onClose={() => setDt(null)}
          admin={adminAuthed}
          onUploadGallery={doGal}
          onRemoveImage={doRmGal}
        />
      )}

      {/* Edit Modal */}
      {modal && ed && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(20px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 0.2s",
          }}
        >
          <div
            style={{
              background: "rgba(28,25,23,0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(201,169,110,0.1)",
              borderRadius: 8,
              width: "90%",
              maxWidth: 520,
              padding: 40,
              animation: "fu 0.3s",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ marginBottom: 36 }}>
              <h3
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 24,
                  fontStyle: "italic",
                  fontWeight: 400,
                }}
              >
                {ed.id && works.find((x) => x.id === ed.id)
                  ? t("modalEdit")
                  : t("modalNew")}
              </h3>
            </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <Fld
                l={t("modalName")}
                v={ed.title}
                c={(v) => setEd({ ...ed, title: v })}
                ph="永生花・粉霧玫瑰"
              />
              <Fld
                l={t("modalNameEn")}
                v={ed.en || ""}
                c={(v) => setEd({ ...ed, en: v })}
                ph="Preserved Rose — Blush Mist"
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <Fld
                  l={t("modalPrice")}
                  v={ed.price}
                  c={(v) => setEd({ ...ed, price: Number(v) })}
                  tp="number"
                />
                <Fld
                  l={t("modalCat")}
                  v={ed.cat}
                  c={(v) => setEd({ ...ed, cat: v })}
                  ph="永生花"
                />
              </div>
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    fontSize: 13,
                    color: "rgba(245,240,235,0.75)",
                    fontFamily: "'Noto Serif TC',serif",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!ed.soldOut}
                    onChange={(e) =>
                      setEd({ ...ed, soldOut: e.target.checked })
                    }
                    style={{ width: 18, height: 18, accentColor: "#C9A96E" }}
                  />
                  {t("modalSoldOut")}
                </label>
                <p
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: "rgba(201,169,110,0.35)",
                    lineHeight: 1.5,
                    fontFamily: "'Instrument Serif',serif",
                    fontStyle: "italic",
                  }}
                >
                  {t("modalSoldOutHint")}
                </p>
              </div>
              <FldArea
                l={t("modalDesc")}
                v={ed.desc}
                c={(v) => setEd({ ...ed, desc: v })}
                ph="…"
              />
              <FldArea
                l={t("modalDescEn")}
                v={ed.descEn || ""}
                c={(v) => setEd({ ...ed, descEn: v })}
                ph="Short description…"
              />
              <div>
                <label style={lb}>{t("modalCover")}</label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    padding: 28,
                    border: "1px dashed rgba(201,169,110,0.12)",
                    borderRadius: 6,
                    cursor: "pointer",
                    color: "rgba(201,169,110,0.3)",
                    fontSize: 13,
                    fontFamily: "'Instrument Serif',serif",
                    fontStyle: "italic",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Cam />
                  {ed.image ? t("modalUploaded") : t("modalUploadHint")}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files[0];
                      if (!f) return;
                      void (async () => {
                        try {
                          const ref = await fileToImageRef(f);
                          setEd((p) => ({ ...p, image: ref }));
                        } catch (err) {
                          console.error(err);
                          window.alert((err && err.message) || "圖片讀取失敗");
                        }
                      })();
                    }}
                  />
                </label>
                {ed.image && (
                  <img
                    src={ed.image}
                    alt=""
                    style={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                      marginTop: 12,
                      borderRadius: 6,
                      border: "1px solid rgba(201,169,110,0.08)",
                    }}
                  />
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 36,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setMo(false);
                  setEd(null);
                }}
                style={{
                  background: "none",
                  border: "1px solid rgba(201,169,110,0.1)",
                  color: "rgba(245,240,235,0.4)",
                  padding: "10px 24px",
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 13,
                  fontStyle: "italic",
                  cursor: "pointer",
                  borderRadius: 4,
                }}
              >
                {t("modalCancel")}
              </button>
              <button
                onClick={() => doSv(ed)}
                style={{
                  background: "rgba(201,169,110,0.15)",
                  color: "#C9A96E",
                  border: "1px solid rgba(201,169,110,0.2)",
                  padding: "10px 30px",
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 13,
                  fontStyle: "italic",
                  fontWeight: 400,
                  cursor: "pointer",
                  borderRadius: 4,
                  backdropFilter: "blur(8px)",
                }}
              >
                {t("modalSave")}
              </button>
            </div>
          </div>
        </div>
      )}

      {adminLoginOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.82)",
            backdropFilter: "blur(18px)",
            zIndex: 250,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 0.2s",
          }}
          onClick={() => {
            setAdminLoginOpen(false);
            setLoginPwd("");
            setLoginErr(false);
          }}
        >
          <div
            style={{
              background: "rgba(28,25,23,0.96)",
              border: "1px solid rgba(201,169,110,0.12)",
              borderRadius: 8,
              width: "90%",
              maxWidth: 400,
              padding: 36,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 22,
                fontStyle: "italic",
                marginBottom: 20,
                color: "#F5F0EB",
              }}
            >
              {t("adminLoginTitle")}
            </h3>
            <label style={lb}>{t("adminPassword")}</label>
            <input
              className="fi"
              type="password"
              autoComplete="current-password"
              value={loginPwd}
              onChange={(e) => {
                setLoginPwd(e.target.value);
                setLoginErr(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && tryAdminLogin()}
              style={{ width: "100%", marginBottom: 12 }}
            />
            {loginErr && (
              <div
                style={{
                  color: "#f87171",
                  fontSize: 13,
                  marginBottom: 12,
                  fontFamily: "'Instrument Serif',serif",
                  fontStyle: "italic",
                }}
              >
                {t("adminInvalid")}
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setAdminLoginOpen(false);
                  setLoginPwd("");
                  setLoginErr(false);
                }}
                style={{
                  background: "none",
                  border: "1px solid rgba(201,169,110,0.15)",
                  color: "rgba(245,240,235,0.45)",
                  padding: "10px 20px",
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 13,
                  fontStyle: "italic",
                  cursor: "pointer",
                  borderRadius: 4,
                }}
              >
                {t("adminCancel")}
              </button>
              <button
                type="button"
                onClick={() => void tryAdminLogin()}
                style={{
                  background: "rgba(201,169,110,0.18)",
                  border: "1px solid rgba(201,169,110,0.25)",
                  color: "#C9A96E",
                  padding: "10px 22px",
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 13,
                  fontStyle: "italic",
                  cursor: "pointer",
                  borderRadius: 4,
                }}
              >
                {t("adminSubmit")}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer
        style={{
          borderTop: "1px solid rgba(201,169,110,0.04)",
          padding: "44px 32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 10,
            fontStyle: "italic",
            letterSpacing: "0.25em",
            color: "rgba(201,169,110,0.1)",
          }}
        >
          {t("footer")}
        </div>
        {(socialIg || socialFb) && (
          <div style={{ marginTop: 22 }}>
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 10,
                fontStyle: "italic",
                letterSpacing: "0.28em",
                color: "rgba(201,169,110,0.22)",
                marginBottom: 12,
              }}
            >
              {t("socialKicker")}
            </div>
            <div
              style={{
                display: "flex",
                gap: 28,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {socialIg ? (
                <a
                  href={socialIg}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: 12,
                    fontStyle: "italic",
                    color: "rgba(201,169,110,0.55)",
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(201,169,110,0.2)",
                    paddingBottom: 2,
                  }}
                >
                  {t("socialInstagram")}
                </a>
              ) : null}
              {socialFb ? (
                <a
                  href={socialFb}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: 12,
                    fontStyle: "italic",
                    color: "rgba(201,169,110,0.55)",
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(201,169,110,0.2)",
                    paddingBottom: 2,
                  }}
                >
                  {t("socialFacebook")}
                </a>
              ) : null}
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}

function Fld({ l, v, c, ph, tp }) {
  return (
    <div>
      <label style={lb}>{l}</label>
      <input
        className="fi"
        type={tp || "text"}
        value={v}
        onChange={(e) => c(e.target.value)}
        placeholder={ph || ""}
      />
    </div>
  );
}
function FldArea({ l, v, c, ph, rows = 4 }) {
  return (
    <div>
      <label style={lb}>{l}</label>
      <textarea
        className="fi"
        rows={rows}
        value={v}
        onChange={(e) => c(e.target.value)}
        placeholder={ph || ""}
      />
    </div>
  );
}
const lb = {
  display: "block",
  fontSize: 10,
  color: "rgba(201,169,110,0.3)",
  letterSpacing: "0.2em",
  marginBottom: 8,
  textTransform: "uppercase",
  fontFamily: "'Instrument Serif',serif",
  fontStyle: "italic",
};
