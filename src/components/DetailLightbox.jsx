import { useState, useEffect, useMemo } from "react";
import { useI18n } from "../i18n.jsx";
import { GR } from "../config/content.js";
import { X, Plus, Arr } from "./icons/Icons.jsx";
import { SocialContactChips } from "./SocialContactChips.jsx";
import { WorkSpecLines } from "./WorkSpecLines.jsx";

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

export function Detail({
  work,
  onClose,
  admin,
  onUploadGallery,
  onRemoveImage,
  socialIg,
  socialFb,
  contactMail,
}) {
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
  const inquirySubject = `${t("detailInquirySubjectPrefix")} ${mainT}`.trim();
  const mailtoHref = contactMail
    ? `mailto:${contactMail}?subject=${encodeURIComponent(inquirySubject)}`
    : null;
  const ctaHref = mailtoHref || socialIg || socialFb || null;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

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

      <button
        type="button"
        onClick={onClose}
        className="detail-close"
        style={{
          position: "absolute",
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
        className="detail-inner"
        style={{
          position: "relative",
          zIndex: 5,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {allImgs.length > 0 ? (
          <div
            style={{
              position: "relative",
              zIndex: 10,
              maxWidth: 900,
              width: "100%",
              flex: "1 1 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minHeight: 0,
            }}
          >
            <div
              style={{
                position: "relative",
                flex: "1 1 auto",
                width: "100%",
                minHeight: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  flex: "1 1 auto",
                  width: "100%",
                  minHeight: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <img
                  src={allImgs[idx]}
                  alt=""
                  className="detail-main-img"
                  style={{
                    maxWidth: "100%",
                    objectFit: "contain",
                    borderRadius: 6,
                    boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
                  }}
                />
              </div>
              {allImgs.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setIdx((i) => (i - 1 + allImgs.length) % allImgs.length)
                    }
                    className="detail-nav detail-nav--prev"
                    style={navBtn}
                    aria-label="Previous image"
                  >
                    <Arr s={20} d="left" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIdx((i) => (i + 1) % allImgs.length)}
                    className="detail-nav detail-nav--next"
                    style={navBtn}
                    aria-label="Next image"
                  >
                    <Arr s={20} d="right" />
                  </button>
                </>
              )}
            </div>
            {allImgs.length <= 1 && admin && (
              <div
                style={{
                  flexShrink: 0,
                  position: "relative",
                  zIndex: 30,
                  width: "100%",
                  marginTop: 14,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  pointerEvents: "auto",
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

        {allImgs.length > 1 && (
          <div
            style={{
              display: "flex",
              gap: admin ? 12 : 8,
              marginTop: 20,
              justifyContent: "center",
              flexWrap: "wrap",
              position: "relative",
              zIndex: 25,
              isolation: "isolate",
            }}
          >
            {allImgs.map((img, i) => (
              <div
                key={i}
                style={{
                  position: "relative",
                  zIndex: 1,
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
                      top: -8,
                      right: -8,
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
                      zIndex: 40,
                      pointerEvents: "auto",
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
                  position: "relative",
                  zIndex: 25,
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
            <span
              style={{ display: "block", marginBottom: 6, letterSpacing: "0.12em" }}
            >
              {t("photoTipTitle")}
            </span>
            {t("photoTipBody")}
          </p>
        )}

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
          <WorkSpecLines work={work} variant="detail" />
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
          {ctaHref ? (
            <a
              href={ctaHref}
              className="detail-cta"
              onClick={(e) => e.stopPropagation()}
              {...(ctaHref.startsWith("mailto:")
                ? {}
                : { target: "_blank", rel: "noopener noreferrer" })}
            >
              {t("detailCtaInquire")}
            </a>
          ) : (
            <span
              className="detail-cta detail-cta--disabled"
              title={t("contactPendingHint")}
            >
              {t("detailCtaInquire")}
            </span>
          )}
          <div
            style={{
              marginTop: 28,
              paddingTop: 24,
              borderTop: "1px solid rgba(201,169,110,0.18)",
            }}
          >
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 10,
                fontStyle: "italic",
                letterSpacing: "0.22em",
                color: "rgba(201,169,110,0.45)",
                marginBottom: 14,
                textTransform: "uppercase",
              }}
            >
              {t("socialKicker")}
            </div>
            <SocialContactChips
              socialIg={socialIg}
              socialFb={socialFb}
              contactMail={contactMail}
              t={t}
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
}
