import { useI18n } from "../i18n.jsx";
import { GR } from "../config/content.js";
import { Edit, Plus, Trash } from "../components/icons/Icons.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";

/**
 * GalleryPage — an editorial catalogue of works.
 *
 *   ① Masthead            kicker + display line + lead
 *   ② § 01 Works         4:5 tile grid, same works as Home.
 *                         Tap a tile to open DetailLightbox (same as Home).
 *
 * Course journal grid 已移至 Course 頁底部。
 *
 * Purely presentational; state lives in NectarApp.jsx.
 */
export function GalleryPage({
  works = [],
  admin = false,
  onOpenDetail,
  onMoveWork,
  onEditWork,
  onDeleteWork,
  onAddArtwork,
}) {
  const { t, locale } = useI18n();
  usePageMeta({
    title: t("metaGalleryTitle"),
    description: t("metaGalleryDesc"),
    pathname: "/gallery",
  });

  return (
    <div className="gl-page">
      {/* ── Masthead ─────────────────────────── */}
      <header className="gl-mast">
        <div className="gl-eyebrow">
          <span className="gl-eyebrow-rule" aria-hidden="true" />
          {t("galleryKicker")}
        </div>
        <h1 className="gl-display">{t("galleryTitle")}</h1>
        <p className="gl-lead">{t("gallerySub")}</p>
      </header>

      {/* ── § 01 Works ───────────────────────── */}
      <section className="gl-section">
        <div className="gl-section-head">
          <span className="gl-section-n">§ 01</span>
          <h2 className="gl-section-title">{t("gallerySectionWorks")}</h2>
        </div>
        {admin && works.length > 0 ? (
          <p className="gl-order-hint">{t("galleryOrderHint")}</p>
        ) : null}

        {works.length === 0 && !admin ? (
          <p className="gl-empty">{t("galleryWorksEmpty")}</p>
        ) : (
          <ul className="gl-grid" role="list">
            {works.map((w, i) => (
              <WorkTile
                key={w.id}
                work={w}
                index={i}
                locale={locale}
                admin={admin}
                onOpen={() => onOpenDetail && onOpenDetail(w)}
                onEdit={admin && onEditWork ? () => onEditWork(w) : undefined}
                onDelete={
                  admin && onDeleteWork ? () => onDeleteWork(w.id) : undefined
                }
                onMoveUp={
                  admin && onMoveWork && i > 0
                    ? () => onMoveWork(w.id, -1)
                    : undefined
                }
                onMoveDown={
                  admin && onMoveWork && i < works.length - 1
                    ? () => onMoveWork(w.id, 1)
                    : undefined
                }
              />
            ))}
            {admin && (
              <li className="gl-tile gl-tile-add">
                <button
                  type="button"
                  className="gl-add-btn"
                  onClick={onAddArtwork}
                >
                  <Plus s={22} />
                  <span>{t("galleryAddArtwork")}</span>
                </button>
              </li>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ─── Work tile (read-only; opens DetailLightbox) ─────────────────────── */

function WorkTile({
  work,
  locale,
  admin = false,
  index = 0,
  onOpen,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}) {
  const { t, workPriceLabel } = useI18n();
  const title =
    locale === "en" ? work.en || work.title || "" : work.title || work.en || "";
  const priceLabel = workPriceLabel(work);
  const gradient = GR[work.cat] || GR["鮮花"];
  const hasImg = Boolean(work.image);
  const showReorder = admin && (onMoveUp || onMoveDown);
  const showWorkTools = admin && (onEdit || onDelete);

  return (
    <li className={`gl-tile ${showReorder ? "gl-tile--reorder" : ""}`}>
      {showReorder ? (
        <div
          className="gl-reorder"
          aria-label={t("galleryReorderHint")}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="gl-reorder-btn"
            disabled={!onMoveUp}
            title={t("galleryMoveUp")}
            aria-label={t("galleryMoveUp")}
            onClick={(e) => {
              e.preventDefault();
              onMoveUp?.();
            }}
          >
            ↑
          </button>
          <button
            type="button"
            className="gl-reorder-btn"
            disabled={!onMoveDown}
            title={t("galleryMoveDown")}
            aria-label={t("galleryMoveDown")}
            onClick={(e) => {
              e.preventDefault();
              onMoveDown?.();
            }}
          >
            ↓
          </button>
          <span className="gl-reorder-idx" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      ) : null}
      {/* Shell keeps edit/delete anchored to the image card column (not stretched grid Li). */}
      <div className="gl-tile-card-shell">
        {showWorkTools ? (
          <div className="gl-work-tools" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="gl-work-tool"
              aria-label={t("modalEdit")}
              title={t("modalEdit")}
              onClick={(e) => {
                e.preventDefault();
                onEdit?.();
              }}
            >
              <Edit s={14} />
            </button>
            <button
              type="button"
              className="gl-work-tool is-danger"
              aria-label={t("confirmDelete")}
              title={t("confirmDelete")}
              onClick={(e) => {
                e.preventDefault();
                onDelete?.();
              }}
            >
              <Trash s={14} />
            </button>
          </div>
        ) : null}
        <button
          type="button"
          className="gl-tile-btn"
          onClick={onOpen}
          aria-label={title}
        >
          <div
            className={`gl-cover ${hasImg ? "" : "is-empty"}`}
            style={{
              backgroundImage: hasImg ? `url(${work.image})` : gradient,
            }}
          >
            {!hasImg && <span className="gl-cover-empty">—</span>}
          </div>
          <div className="gl-caption">
            <span className="gl-caption-title">{title}</span>
            {priceLabel && (
              <span className="gl-caption-meta">{priceLabel}</span>
            )}
          </div>
        </button>
      </div>
    </li>
  );
}
