import { useState, useEffect } from "react";

/**
 * VoteAdminRow — inline editor for a single poll option.
 * Styled in the editorial hairline language (.vp-edit-*).
 */
export function VoteAdminRow({
  item,
  t,
  onSaveNames,
  onToggleHidden,
  onDelete,
  onUploadImage,
}) {
  const [name, setName] = useState(item.name || "");
  const [en, setEn] = useState(item.en || "");

  useEffect(() => {
    setName(item.name || "");
    setEn(item.en || "");
  }, [item.id, item.name, item.en]);

  return (
    <div className={`vp-edit ${item.hidden ? "is-hidden" : ""}`}>
      <div className="vp-edit-head">
        <div className="vp-edit-thumb">
          {item.image ? (
            <img src={item.image} alt="" />
          ) : (
            <span className="vp-edit-thumb-emoji" aria-hidden="true">
              {item.emoji}
            </span>
          )}
        </div>
        <div className="vp-edit-fields">
          {item.hidden ? (
            <span className="vp-edit-hidden-badge">
              {t("voteHiddenBadge")}
            </span>
          ) : null}
          <label className="vp-edit-label">{t("voteNameZh")}</label>
          <input
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
          className="vp-edit-btn"
          onClick={() => onToggleHidden(item.id)}
        >
          {item.hidden ? t("voteShowInPoll") : t("voteHideFromPoll")}
        </button>
        <label className="vp-edit-btn" style={{ cursor: "pointer" }}>
          {t("modalUploadHint")}
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
