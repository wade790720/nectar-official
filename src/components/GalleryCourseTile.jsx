import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n.jsx";
import { Cam, X } from "./icons/Icons.jsx";

/**
 * 畫廊「課程影像」網格單卡：訪客僅顯示圖+名；管理員可編輯名稱、上傳圖、刪除。
 */
export function GalleryCourseTile({
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
            {hasImg ? t("galleryCourseReplace") : t("galleryCourseUpload")}
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
