import { useState } from "react";
import { useI18n } from "../i18n.jsx";
import { GR } from "../config/content.js";
import { useParallaxScroll } from "../hooks/useParallaxScroll.js";
import { useInView } from "../hooks/useInView.js";
import { Cam, Edit, Trash } from "./icons/Icons.jsx";
import { WorkSpecLines } from "./WorkSpecLines.jsx";

/**
 * WorkSlide — one full-bleed plate in the book.
 *
 * Editorial composition (no card, no blur box):
 *   top-left    : sequence     01 — 06
 *   bottom-left : kicker       PRESERVED · 2026
 *                 H2 (ZH)      永生花・粉霧玫瑰
 *                 subtitle (EN, italic)
 *   bottom-right: hairline + category / price / view-hint
 *
 * Image carries the frame; typography carries the hierarchy.
 * Motion is slow and intentional — parallax + hairline extension on hover.
 */
const adminBtn = {
  background: "rgba(6,5,4,0.55)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(201,169,110,0.14)",
  color: "#F5F0EB",
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  borderRadius: "50%",
  transition: "all var(--dur-short) var(--ease-editorial)",
};

export function WS({
  work,
  index,
  total,
  admin,
  onEdit,
  onDelete,
  onUpload,
  onOpen,
}) {
  const { t, workTitle, workSubtitle, workCat, workPriceLabel } = useI18n();
  const [parallaxRef, parallaxY] = useParallaxScroll(0.18);
  const [revealRef, revealIn] = useInView(0.22);
  const [hover, setHover] = useState(false);

  const gradient = GR[work.cat] || GR["鮮花"];
  const hasImg = !!work.image;

  const title = workTitle(work);
  const subtitle = workSubtitle(work);
  const categoryLabel = workCat(work);
  const priceLabel = workPriceLabel(work);
  const isInteractive = work.soldOut !== true && Number(work.price) > 0;

  // Subtle contrast lift only — no heavy saturation grading
  const imgFilter = hasImg
    ? hover
      ? "contrast(1.04) saturate(1.02)"
      : "contrast(1.02) saturate(1)"
    : hover
      ? "brightness(0.6)"
      : "brightness(0.45)";

  return (
    <article
      ref={parallaxRef}
      className="ws-slide"
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onOpen(work)}
    >
      {/* Plate — the image fills the page, with slow parallax + Ken-Burns breath */}
      <div
        style={{
          position: "absolute",
          inset: "-14% 0",
          transform: `translateY(${parallaxY}px) scale(${hover ? 1.018 : 1})`,
          transition:
            "transform var(--dur-stretch) var(--ease-out-curve), filter var(--dur-slow) var(--ease-editorial)",
          background: hasImg
            ? `url(${work.image}) center 44% / cover no-repeat`
            : gradient,
          filter: imgFilter,
          willChange: "transform, filter",
        }}
      />

      {/* Veil — bottom-heavy gradient only; legibility without a visible box */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(6,5,4,0.36) 0%, rgba(6,5,4,0) 22%, rgba(6,5,4,0) 48%, rgba(6,5,4,0.62) 86%, rgba(6,5,4,0.82) 100%)",
          pointerEvents: "none",
          transition: "opacity var(--dur-med) var(--ease-editorial)",
          opacity: hover ? 0.94 : 1,
        }}
      />
      {/* Left-anchored soft wash so the headline reads cleanly regardless of image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(4,3,3,0.55) 0%, rgba(4,3,3,0.22) 24%, rgba(4,3,3,0.04) 44%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Editorial frame — asymmetric anchors, no card */}
      <div className="ws-frame" ref={revealRef}>
        <div
          className={`ws-sequence ws-reveal ${revealIn ? "is-in" : ""}`}
          style={{ transitionDelay: "80ms" }}
        >
          <span className="ws-sequence-num">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="ws-sequence-sep" />
          <span className="ws-sequence-total">
            {String(total).padStart(2, "0")}
          </span>
        </div>

        <div
          className={`ws-headline ws-reveal ${revealIn ? "is-in" : ""}`}
          style={{ transitionDelay: "240ms" }}
        >
          {categoryLabel ? (
            <div className="ws-kicker">{categoryLabel}</div>
          ) : null}
          <h2 className="ws-title">{title}</h2>
          {subtitle ? <div className="ws-subtitle">{subtitle}</div> : null}
          <WorkSpecLines work={work} variant="compact" />
        </div>

        <div
          className={`ws-colophon ws-reveal ${revealIn ? "is-in" : ""}`}
          style={{ transitionDelay: "420ms" }}
        >
          <span className="ws-colophon-rule" aria-hidden="true" />
          <div className="ws-colophon-text">
            <span className="ws-price">{priceLabel}</span>
            {isInteractive ? (
              <span className="ws-hint">{t("workViewDetails")}</span>
            ) : null}
          </div>
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
          <label style={{ ...adminBtn }}>
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
          <button type="button" style={adminBtn} onClick={() => onEdit(work)}>
            <Edit />
          </button>
          <button
            type="button"
            style={{ ...adminBtn, color: "#EF4444" }}
            onClick={() => onDelete(work.id)}
          >
            <Trash />
          </button>
        </div>
      )}
    </article>
  );
}
