import { useState } from "react";
import { useI18n } from "../i18n.jsx";
import { GR } from "../config/content.js";
import { useParallaxScroll } from "../hooks/useParallaxScroll.js";
import { useInView } from "../hooks/useInView.js";
import { Cam, Edit, Trash } from "./icons/Icons.jsx";
import { WorkSpecLines } from "./WorkSpecLines.jsx";

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

export function WS({ work, index, total, admin, onEdit, onDelete, onUpload, onOpen }) {
  const { t, workTitle, workSubtitle, workCat, workPriceLabel } = useI18n();
  const [pr, po] = useParallaxScroll(0.22);
  const [tr, tv] = useInView();
  const [h, setH] = useState(false);
  const gr = GR[work.cat] || GR["鮮花"];
  const hasImg = !!work.image;
  const imgFilter = hasImg
    ? h
      ? "contrast(1.06) saturate(1.02)"
      : "contrast(1.03) saturate(1.01)"
    : h
      ? "brightness(0.62) contrast(1.04) saturate(1)"
      : "brightness(0.45) contrast(1.02) saturate(1)";
  const overlayBg = hasImg
    ? h
      ? "linear-gradient(0deg, rgba(6,8,10,0.42) 0%, rgba(6,8,10,0.08) 34%, rgba(6,8,10,0) 52%, rgba(6,8,10,0.22) 100%)"
      : "linear-gradient(0deg, rgba(6,8,10,0.54) 0%, rgba(6,8,10,0.12) 32%, rgba(6,8,10,0) 50%, rgba(6,8,10,0.3) 100%)"
    : h
      ? "linear-gradient(0deg, rgba(8,8,10,0.76) 0%, rgba(8,8,10,0.12) 30%, rgba(8,8,10,0) 50%, rgba(8,8,10,0.34) 100%)"
      : "linear-gradient(0deg, rgba(8,8,10,0.9) 0%, rgba(8,8,10,0.2) 28%, rgba(8,8,10,0) 50%, rgba(8,8,10,0.48) 100%)";
  const mainT = workTitle(work);
  const subT = workSubtitle(work);
  const catL = workCat(work);
  return (
    <div
      ref={pr}
      className="ws-slide"
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
      }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onClick={() => onOpen(work)}
    >
      <div
        style={{
          position: "absolute",
          inset: "-18% 0",
          transform: `translateY(${po}px) scale(${h ? 1.04 : 1})`,
          transition:
            "transform 1.4s cubic-bezier(0.16,1,0.3,1), filter 0.75s cubic-bezier(0.16,1,0.3,1)",
          background: hasImg
            ? `url(${work.image}) center 42% / cover no-repeat`
            : gr,
          filter: imgFilter,
          willChange: "transform, filter",
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

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: overlayBg,
          pointerEvents: "none",
          transition: "background 0.75s cubic-bezier(0.16,1,0.3,1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: h
            ? "linear-gradient(90deg, rgba(4,6,10,0.62) 0%, rgba(4,6,10,0.26) 26%, rgba(4,6,10,0.06) 46%, transparent 66%)"
            : "linear-gradient(90deg, rgba(4,6,10,0.82) 0%, rgba(4,6,10,0.4) 22%, rgba(4,6,10,0.1) 42%, transparent 62%)",
          pointerEvents: "none",
          transition: "background 0.75s cubic-bezier(0.16,1,0.3,1)",
        }}
      />

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

      <div
        ref={tr}
        className="ws-meta"
        style={{
          position: "absolute",
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

          <WorkSpecLines work={work} variant="compact" />

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
            background: "rgba(245,240,235,0.28)",
            marginLeft: "auto",
            marginBottom: 14,
          }}
        />
        <div
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 10,
            letterSpacing: "0.3em",
            color: "rgba(245,240,235,0.42)",
            textTransform: "uppercase",
            writingMode: "vertical-rl",
            fontStyle: "italic",
          }}
        >
          {t("verticalArt")}
        </div>
      </div>

      {admin && (
        <div
          className="ws-admin-tools"
          style={{
            position: "absolute",
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
          <button type="button" style={ab} onClick={() => onEdit(work)}>
            <Edit />
          </button>
          <button
            type="button"
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
