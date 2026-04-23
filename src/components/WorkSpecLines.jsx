import { useI18n } from "../i18n.jsx";

/** 重量 → 尺寸 → 材質；有填寫的列才顯示 */
export function WorkSpecLines({ work, variant = "detail" }) {
  const { t, workSpecDim, workSpecMaterial, workSpecWeight } = useI18n();
  const rows = [
    [t("workSpecWeight"), workSpecWeight(work)],
    [t("workSpecDim"), workSpecDim(work)],
    [t("workSpecMaterial"), workSpecMaterial(work)],
  ].filter(([, v]) => v);
  if (!rows.length) return null;

  const compact = variant === "compact";
  return (
    <div
      style={{
        marginTop: 8,
        marginBottom: compact ? 12 : 20,
        paddingTop: compact ? 10 : 8,
        borderTop: compact
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(201,169,110,0.15)",
        textAlign: "left",
      }}
    >
      {!compact ? (
        <div
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 10,
            fontStyle: "italic",
            letterSpacing: "0.22em",
            color: "rgba(201,169,110,0.45)",
            marginBottom: 10,
            textTransform: "uppercase",
          }}
        >
          {t("workSpecKicker")}
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: compact ? 5 : 8,
        }}
      >
        {rows.map(([label, value]) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              gap: compact ? "6px 10px" : "8px 12px",
              fontFamily: "'Noto Serif TC',serif",
              fontSize: compact ? 11 : 13,
              lineHeight: 1.55,
            }}
          >
            <span
              style={{
                flex: "0 0 auto",
                minWidth: compact ? 40 : 48,
                color: "rgba(201,169,110,0.55)",
                letterSpacing: "0.06em",
                fontFamily: "'Instrument Serif',serif",
                fontSize: compact ? 10 : 11,
                fontStyle: "italic",
              }}
            >
              {label}
            </span>
            <span
              style={{
                color: compact
                  ? "rgba(248,242,232,0.82)"
                  : "rgba(245,240,235,0.75)",
                textShadow: compact ? "0 1px 6px rgba(0,0,0,0.5)" : undefined,
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
