import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n.jsx";
import { GR } from "../config/content.js";
import { Cam, Plus, X } from "../components/icons/Icons.jsx";

/**
 * GalleryPage — an editorial catalogue of works and courses.
 *
 *   ① Masthead            kicker + display line + lead
 *   ② § 01 Works         4:5 tile grid, synced with Portfolio data.
 *                         Tap a tile to open DetailLightbox (same as Portfolio).
 *   ③ § 02 Courses       4:5 tile grid of courses (image + name only).
 *                         Admin: inline add / rename / replace image / delete.
 *
 * Purely presentational; state lives in App (Portfolio.jsx).
 */
export function GalleryPage({
  works = [],
  courses = [],
  admin = false,
  onOpenDetail,
  onAddCourse,
  onSaveCourseNames,
  onUploadCourseImage,
  onDeleteCourse,
  onAddArtwork,
  newlyAddedCourseId = null,
}) {
  const { t, locale } = useI18n();

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

        {works.length === 0 && !admin ? (
          <p className="gl-empty">{t("galleryWorksEmpty")}</p>
        ) : (
          <ul className="gl-grid" role="list">
            {works.map((w) => (
              <WorkTile
                key={w.id}
                work={w}
                locale={locale}
                onOpen={() => onOpenDetail && onOpenDetail(w)}
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

      {/* ── § 02 Courses ─────────────────────── */}
      <section className="gl-section">
        <div className="gl-section-head">
          <span className="gl-section-n">§ 02</span>
          <h2 className="gl-section-title">{t("gallerySectionCourses")}</h2>
        </div>

        {courses.length === 0 && !admin ? (
          <p className="gl-empty">{t("galleryCoursesEmpty")}</p>
        ) : (
          <ul className="gl-grid" role="list">
            {courses.map((c) => (
              <CourseTile
                key={c.id}
                course={c}
                locale={locale}
                admin={admin}
                pulse={c.id === newlyAddedCourseId}
                onSaveNames={onSaveCourseNames}
                onUploadImage={onUploadCourseImage}
                onDelete={onDeleteCourse}
              />
            ))}
            {admin && (
              <li className="gl-tile gl-tile-add">
                <button
                  type="button"
                  className="gl-add-btn"
                  onClick={onAddCourse}
                >
                  <Plus s={22} />
                  <span>{t("galleryAddCourse")}</span>
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

function WorkTile({ work, locale, onOpen }) {
  const title =
    locale === "en"
      ? work.en || work.title || ""
      : work.title || work.en || "";
  const cat = locale === "en" ? work.catEn || work.cat || "" : work.cat || "";
  const gradient = GR[work.cat] || GR["鮮花"];
  const hasImg = Boolean(work.image);

  return (
    <li className="gl-tile">
      <button
        type="button"
        className="gl-tile-btn"
        onClick={onOpen}
        aria-label={title}
      >
        <div
          className={`gl-cover ${hasImg ? "" : "is-empty"}`}
          style={{
            backgroundImage: hasImg
              ? `url(${work.image})`
              : gradient,
          }}
        >
          {!hasImg && <span className="gl-cover-empty">—</span>}
        </div>
        <div className="gl-caption">
          <span className="gl-caption-title">{title}</span>
          {cat && <span className="gl-caption-meta">{cat}</span>}
        </div>
      </button>
    </li>
  );
}

/* ─── Course tile (optional admin CRUD) ───────────────────────────────── */

function CourseTile({
  course,
  locale,
  admin,
  pulse,
  onSaveNames,
  onUploadImage,
  onDelete,
}) {
  const { t } = useI18n();
  const [nameZh, setNameZh] = useState(course.name || "");
  const [nameEn, setNameEn] = useState(course.en || "");
  const fileRef = useRef(null);
  const firstInputRef = useRef(null);
  const tileRef = useRef(null);

  useEffect(() => {
    setNameZh(course.name || "");
    setNameEn(course.en || "");
  }, [course.name, course.en]);

  useEffect(() => {
    if (!pulse) return;
    const el = tileRef.current;
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (firstInputRef.current) {
      window.setTimeout(() => {
        try {
          firstInputRef.current?.focus({ preventScroll: true });
        } catch {
          firstInputRef.current?.focus();
        }
      }, 320);
    }
  }, [pulse]);

  const displayName =
    locale === "en"
      ? course.en || course.name || ""
      : course.name || course.en || "";
  const hasImg = Boolean(course.image);
  const dirty = nameZh !== (course.name || "") || nameEn !== (course.en || "");

  if (!admin) {
    /* 訪客：圖片＋名稱，沒有多餘點綴 */
    return (
      <li className="gl-tile">
        <div className="gl-tile-static">
          <div
            className={`gl-cover ${hasImg ? "" : "is-empty"}`}
            style={{
              backgroundImage: hasImg ? `url(${course.image})` : undefined,
            }}
          >
            {!hasImg && <span className="gl-cover-empty">—</span>}
          </div>
          <div className="gl-caption">
            <span className="gl-caption-title">{displayName || "—"}</span>
          </div>
        </div>
      </li>
    );
  }

  /* ─── 編輯態：hover 覆蓋上傳 + 下方 name 輸入 + save/remove ─── */
  return (
    <li
      ref={tileRef}
      className={`gl-tile gl-tile-edit ${pulse ? "is-pulsing" : ""}`}
    >
      <div
        className={`gl-cover gl-cover-upload ${hasImg ? "" : "is-empty"}`}
        role="button"
        tabIndex={0}
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileRef.current?.click();
          }
        }}
        style={{
          backgroundImage: hasImg ? `url(${course.image})` : undefined,
        }}
      >
        {!hasImg && <span className="gl-cover-empty">—</span>}
        <div className="gl-cover-overlay" aria-hidden="true">
          <Cam s={22} />
          <span>
            {hasImg
              ? t("galleryCourseReplace")
              : t("galleryCourseUpload")}
          </span>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUploadImage && onUploadImage(course.id, f);
            e.target.value = "";
          }}
        />
      </div>

      <div className="gl-edit-body">
        <input
          ref={firstInputRef}
          className="gl-edit-input"
          placeholder={t("galleryCourseNameZh")}
          value={nameZh}
          onChange={(e) => setNameZh(e.target.value)}
        />
        <input
          className="gl-edit-input"
          placeholder={t("galleryCourseNameEn")}
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
        />
        <div className="gl-edit-actions">
          <button
            type="button"
            className="gl-edit-btn"
            disabled={!dirty}
            onClick={() =>
              onSaveNames &&
              onSaveNames(course.id, { name: nameZh, en: nameEn })
            }
          >
            {t("galleryCourseSave")}
          </button>
          <button
            type="button"
            className="gl-edit-btn is-danger"
            onClick={() => onDelete && onDelete(course.id)}
            aria-label={t("galleryCourseRemove")}
          >
            <X s={14} />
            <span>{t("galleryCourseRemove")}</span>
          </button>
        </div>
      </div>
    </li>
  );
}
