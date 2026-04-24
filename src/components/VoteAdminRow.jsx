import { useEffect, useRef, useState } from "react";
import { Cam } from "./icons/Icons";

/**
 * VoteAdminRow — inline editor for a single poll option.
 *
 * Design:
 *  - The thumbnail itself is the upload target. Hovering reveals a
 *    "Click to replace" overlay with a camera glyph; clicking anywhere on
 *    the thumb opens the file picker.
 *  - Visibility is controlled by a hairline-styled toggle switch so the
 *    current state is always legible (on/off, not a button you have to click
 *    to discover what it does).
 *  - Only Save / Remove remain as text actions.
 *  - When `autoFocus` is true (i.e. this row was just added by the admin),
 *    the row scrolls itself into view and focuses the ZH name input so the
 *    admin immediately knows the option exists and can start typing.
 */
export function VoteAdminRow({
  item,
  t,
  autoFocus = false,
  onSaveNames,
  onToggleHidden,
  onDelete,
  onUploadImage,
}) {
  const [name, setName] = useState(item.name || "");
  const [en, setEn] = useState(item.en || "");
  const rowRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    setName(item.name || "");
    setEn(item.en || "");
  }, [item.id, item.name, item.en]);

  useEffect(() => {
    if (!autoFocus) return;
    const row = rowRef.current;
    const input = nameInputRef.current;
    if (row) {
      try {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch {
        row.scrollIntoView();
      }
    }
    const id = window.setTimeout(() => {
      input?.focus();
      input?.select?.();
    }, 260);
    return () => window.clearTimeout(id);
  }, [autoFocus]);

  const visible = !item.hidden;

  return (
    <div
      ref={rowRef}
      className={`vp-edit ${item.hidden ? "is-hidden" : ""} ${
        autoFocus ? "is-new" : ""
      }`}
    >
      <div className="vp-edit-head">
        <label
          className="vp-edit-thumb vp-edit-thumb--upload"
          title={t("voteReplaceImage")}
        >
          {item.image ? (
            <img src={item.image} alt="" />
          ) : (
            <span className="vp-edit-thumb-emoji" aria-hidden="true">
              {item.emoji}
            </span>
          )}
          <span className="vp-edit-thumb-overlay" aria-hidden="true">
            <Cam s={18} />
            <span className="vp-edit-thumb-overlay-text">
              {t("voteReplaceImage")}
            </span>
          </span>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void onUploadImage(item.id, file);
            }}
          />
        </label>
        <div className="vp-edit-fields">
          {item.hidden ? (
            <span className="vp-edit-hidden-badge">
              {t("voteHiddenBadge")}
            </span>
          ) : null}
          <label className="vp-edit-label">{t("voteNameZh")}</label>
          <input
            ref={nameInputRef}
            className="vp-edit-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className="vp-edit-label" style={{ marginTop: 6 }}>
            {t("voteNameEn")}
          </label>
          <input
            className="vp-edit-input"
            value={en}
            onChange={(e) => setEn(e.target.value)}
          />
        </div>
      </div>

      <div className="vp-edit-actions">
        <label className="vp-edit-toggle">
          <input
            type="checkbox"
            className="vp-edit-toggle-input"
            checked={visible}
            onChange={() => onToggleHidden(item.id)}
          />
          <span className="vp-edit-toggle-track" aria-hidden="true">
            <span className="vp-edit-toggle-dot" />
          </span>
          <span
            className={`vp-edit-toggle-label ${
              visible ? "is-on" : "is-off"
            }`}
          >
            {visible ? t("voteVisibilityOn") : t("voteVisibilityOff")}
          </span>
        </label>

        <button
          type="button"
          className="vp-edit-btn is-primary"
          onClick={() =>
            onSaveNames(item.id, { name: name.trim(), en: en.trim() })
          }
        >
          {t("voteSaveNames")}
        </button>
        <button
          type="button"
          className="vp-edit-btn is-danger"
          onClick={() => onDelete(item.id)}
        >
          {t("voteRemoveOption")}
        </button>
      </div>
    </div>
  );
}
