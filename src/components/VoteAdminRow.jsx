import { useState, useEffect } from "react";

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 14,
        background: "rgba(0,0,0,0.2)",
        borderRadius: 8,
        border: item.hidden
          ? "1px solid rgba(201,169,110,0.18)"
          : "1px solid rgba(201,169,110,0.06)",
        borderLeft: item.hidden ? "3px solid rgba(201,169,110,0.35)" : undefined,
        opacity: item.hidden ? 0.88 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="vote-admin-thumb">
          {item.image ? (
            <img
              src={item.image}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: 28 }}>{item.emoji}</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {item.hidden ? (
            <span
              style={{
                fontSize: 10,
                letterSpacing: "0.2em",
                color: "rgba(201,169,110,0.5)",
                fontFamily: "'Instrument Serif',serif",
                fontStyle: "italic",
                textTransform: "uppercase",
              }}
            >
              {t("voteHiddenBadge")}
            </span>
          ) : null}
          <label
            style={{
              display: "block",
              fontSize: 10,
              color: "rgba(201,169,110,0.35)",
              marginBottom: 4,
              fontFamily: "'Instrument Serif',serif",
              fontStyle: "italic",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
            }}
          >
            {t("voteNameZh")}
          </label>
          <input
            className="fi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <label
            style={{
              display: "block",
              fontSize: 10,
              color: "rgba(201,169,110,0.35)",
              marginBottom: 4,
              fontFamily: "'Instrument Serif',serif",
              fontStyle: "italic",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
            }}
          >
            {t("voteNameEn")}
          </label>
          <input className="fi" value={en} onChange={(e) => setEn(e.target.value)} />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={() => onSaveNames(item.id, { name: name.trim(), en: en.trim() })}
          style={{
            background: "rgba(201,169,110,0.15)",
            border: "1px solid rgba(201,169,110,0.25)",
            color: "#C9A96E",
            padding: "8px 14px",
            fontFamily: "'Instrument Serif',serif",
            fontSize: 12,
            fontStyle: "italic",
            cursor: "pointer",
            borderRadius: 4,
            touchAction: "manipulation",
          }}
        >
          {t("voteSaveNames")}
        </button>
        <button
          type="button"
          onClick={() => onToggleHidden(item.id)}
          style={{
            background: "none",
            border: "1px solid rgba(201,169,110,0.2)",
            color: "rgba(245,240,235,0.55)",
            padding: "8px 14px",
            fontFamily: "'Instrument Serif',serif",
            fontSize: 12,
            fontStyle: "italic",
            cursor: "pointer",
            borderRadius: 4,
            touchAction: "manipulation",
          }}
        >
          {item.hidden ? t("voteShowInPoll") : t("voteHideFromPoll")}
        </button>
        <label
          style={{
            fontSize: 11,
            color: "rgba(201,169,110,0.45)",
            fontFamily: "'Instrument Serif',serif",
            fontStyle: "italic",
            cursor: "pointer",
            padding: "8px 10px",
            border: "1px dashed rgba(201,169,110,0.2)",
            borderRadius: 4,
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
              if (file) void onUploadImage(item.id, file);
            }}
          />
        </label>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          style={{
            marginLeft: "auto",
            background: "rgba(185,28,28,0.12)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "rgba(252,165,165,0.9)",
            padding: "8px 14px",
            fontFamily: "'Instrument Serif',serif",
            fontSize: 12,
            fontStyle: "italic",
            cursor: "pointer",
            borderRadius: 4,
            touchAction: "manipulation",
          }}
        >
          {t("voteRemoveOption")}
        </button>
      </div>
    </div>
  );
}
