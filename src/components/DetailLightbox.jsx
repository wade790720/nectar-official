import { useState, useEffect, useMemo } from "react";
import { useI18n } from "../i18n.jsx";
import { GR } from "../config/content.js";
import { X, Plus, Arr } from "./icons/Icons.jsx";
import { SocialContactChips } from "./SocialContactChips.jsx";
import { WorkSpecLines } from "./WorkSpecLines.jsx";
import { useConfirm } from "./ConfirmDialog.jsx";

/**
 * DetailLightbox — the work's extended reading page.
 *
 * Composition (desktop):
 *   ┌──────────────────────────┬─────────────────────┐
 *   │ [ image plate ]          │ kicker              │
 *   │   ← chev     chev →      │ H2 title            │
 *   │                          │ italic subtitle     │
 *   │ 01 / 06  thumbs          │ description         │
 *   │                          │ specs (dl)          │
 *   │ admin tools              │ ─── PRICE           │
 *   │                          │ Inquire →           │
 *   │                          │ ─── social          │
 *   └──────────────────────────┴─────────────────────┘
 *
 * Mobile: stacked single column, image first.
 * Keyboard: Esc to close, ←/→ to navigate images.
 */
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
  const confirm = useConfirm();
  const [idx, setIdx] = useState(0);
  const [ready, setReady] = useState(false);
  /** 圖庫上傳：'loading' | ok:n */
  const [uploadNote, setUploadNote] = useState(null);

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

  const title = workTitle(work);
  const subtitle = workSubtitle(work);
  const desc = workDesc(work);
  const categoryLabel = workCat(work);
  const priceLabel = workPriceLabel(work);
  const inquirySubject = `${t("detailInquirySubjectPrefix")} ${title}`.trim();
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

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    setUploadNote(null);
  }, [work.id]);

  const runUploadGallery = async (fileList) => {
    if (!fileList?.length || !onUploadGallery) return;
    setUploadNote("loading");
    try {
      await onUploadGallery(work.id, [...fileList]);
      setUploadNote(`ok:${fileList.length}`);
      window.setTimeout(() => setUploadNote(null), 2200);
    } catch {
      setUploadNote(null);
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (allImgs.length <= 1) return;
      if (e.key === "ArrowLeft") {
        setIdx((i) => (i - 1 + allImgs.length) % allImgs.length);
      } else if (e.key === "ArrowRight") {
        setIdx((i) => (i + 1) % allImgs.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, allImgs.length]);

  const hasMultiple = allImgs.length > 1;
  const gradient = GR[work.cat] || GR["鮮花"];

  return (
    <div className="dl-overlay" onClick={onClose}>
      <div
        className="dl-veil"
        style={{
          background: cur
            ? `url(${cur}) center 42% / cover no-repeat`
            : gradient,
        }}
      />
      <div className="dl-dim" />

      <button
        type="button"
        onClick={onClose}
        className="dl-close"
        aria-label="Close"
      >
        <span className="dl-close-rule" />
        <span>{t("detailClose")}</span>
        <span className="dl-close-x">
          <X s={14} />
        </span>
      </button>

      <div className="dl-inner" onClick={(e) => e.stopPropagation()}>
        <div className="dl-shell">
          {/* ══ LEFT — image plate ══ */}
          <div
            className={`dl-image-col dl-reveal ${ready ? "is-in" : ""}`}
            style={{ transitionDelay: "120ms" }}
          >
            {allImgs.length > 0 ? (
              <div className="dl-image-wrap">
                <img src={allImgs[idx]} alt="" className="dl-main-img" />
                {hasMultiple && (
                  <>
                    <button
                      type="button"
                      className="dl-chev dl-chev--prev"
                      onClick={() =>
                        setIdx((i) => (i - 1 + allImgs.length) % allImgs.length)
                      }
                      aria-label="Previous image"
                    >
                      <Arr s={18} d="left" />
                    </button>
                    <button
                      type="button"
                      className="dl-chev dl-chev--next"
                      onClick={() => setIdx((i) => (i + 1) % allImgs.length)}
                      aria-label="Next image"
                    >
                      <Arr s={18} d="right" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4/3",
                  background: gradient,
                }}
              />
            )}

            {hasMultiple ? (
              <div className="dl-counter" aria-hidden="true">
                <span>{String(idx + 1).padStart(2, "0")}</span>
                <span className="dl-counter-sep" />
                <span className="dl-counter-total">
                  {String(allImgs.length).padStart(2, "0")}
                </span>
              </div>
            ) : null}

            {hasMultiple && (
              <div className="dl-thumbs">
                {allImgs.map((img, i) => (
                  <div key={`${img}-${i}`} style={{ position: "relative" }}>
                    <button
                      type="button"
                      className={`dl-thumb ${i === idx ? "is-on" : ""}`}
                      onClick={() => setIdx(i)}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img src={img} alt="" />
                    </button>
                    {admin && onRemoveImage && (
                      <button
                        type="button"
                        className="dl-thumb-del"
                        title={t("detailRemoveCover")}
                        onClick={async (e) => {
                          e.stopPropagation();
                          const ok = await confirm({
                            title: t("confirmTitleDestructive"),
                            message: t("detailRemovePhotoConfirm"),
                            confirmLabel: t("confirmDelete"),
                            cancelLabel: t("confirmCancel"),
                            tone: "danger",
                          });
                          if (ok) onRemoveImage(work.id, i);
                        }}
                      >
                        <X s={10} />
                      </button>
                    )}
                  </div>
                ))}
                {admin && (
                  <label className="dl-thumb-add" title={t("detailAddAngles")}>
                    <Plus s={16} />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const f = e.target.files;
                        if (f) void runUploadGallery(f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
            )}

            {allImgs.length <= 1 && admin && (
              <div className="dl-admin-solo">
                {allImgs.length === 1 && onRemoveImage && (
                  <button
                    type="button"
                    className="dl-admin-btn is-danger"
                    onClick={async () => {
                      const ok = await confirm({
                        title: t("confirmTitleDestructive"),
                        message: t("detailRemovePhotoConfirm"),
                        confirmLabel: t("confirmDelete"),
                        cancelLabel: t("confirmCancel"),
                        tone: "danger",
                      });
                      if (!ok) return;
                      onRemoveImage(work.id, 0);
                      setIdx(0);
                    }}
                  >
                    {t("detailRemoveCover")}
                  </button>
                )}
                <label className="dl-admin-btn">
                  <Plus s={14} /> {t("detailAddAngles")}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files;
                      if (f) void runUploadGallery(f);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            )}

            {admin && uploadNote && (
              <p
                className={`dl-gal-status ${uploadNote === "loading" ? "is-busy" : "is-ok"}`}
                role="status"
                aria-live="polite"
              >
                {uploadNote === "loading"
                  ? t("detailUploading")
                  : t("detailUploadAdded").replace(
                      "{n}",
                      String((uploadNote.split(":")[1] || "0").trim()),
                    )}
              </p>
            )}

            {admin && (
              <p className="dl-tip">
                <span className="dl-tip-label">{t("photoTipTitle")}</span>
                {t("photoTipBody")}
              </p>
            )}
          </div>

          {/* ══ RIGHT — editorial text column ══ */}
          <div
            className={`dl-text-col dl-reveal ${ready ? "is-in" : ""}`}
            style={{ transitionDelay: "280ms" }}
          >
            {categoryLabel ? (
              <div className="dl-kicker">{categoryLabel}</div>
            ) : null}
            <h2 className="dl-title">{title}</h2>
            {subtitle ? <div className="dl-subtitle">{subtitle}</div> : null}
            {desc ? <p className="dl-desc">{desc}</p> : null}

            <WorkSpecLines work={work} variant="detail" />

            <div className="dl-price-row">
              <span className="dl-price-label">{t("detailPriceLabel")}</span>
              <span className="dl-price">{priceLabel}</span>
            </div>

            {ctaHref ? (
              <a
                href={ctaHref}
                className="dl-cta"
                onClick={(e) => e.stopPropagation()}
                {...(ctaHref.startsWith("mailto:")
                  ? {}
                  : { target: "_blank", rel: "noopener noreferrer" })}
              >
                <span>{t("detailCtaInquire")}</span>
                <span className="dl-cta-arrow" aria-hidden="true">
                  <Arr s={16} d="right" />
                </span>
              </a>
            ) : (
              <span
                className="dl-cta dl-cta--disabled"
                title={t("contactPendingHint")}
              >
                <span>{t("detailCtaInquire")}</span>
                <span className="dl-cta-arrow" aria-hidden="true">
                  <Arr s={16} d="right" />
                </span>
              </span>
            )}

            <div className="dl-social">
              <div className="dl-social-kicker">{t("socialKicker")}</div>
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
    </div>
  );
}
