import { useI18n } from "../i18n.jsx";

/**
 * WorkSpecLines — Weight → Size → Materials.
 * Two variants:
 *  - "compact"  : frameless, sits inside the editorial headline on a work slide.
 *  - "detail"   : inside the lightbox, with a kicker label and hairline rule.
 */
export function WorkSpecLines({ work, variant = "detail" }) {
  const { t, workSpecDim, workSpecMaterial, workSpecWeight } = useI18n();
  const rows = [
    [t("workSpecWeight"), workSpecWeight(work)],
    [t("workSpecDim"), workSpecDim(work)],
    [t("workSpecMaterial"), workSpecMaterial(work)],
  ].filter(([, v]) => v);
  if (!rows.length) return null;

  const compact = variant === "compact";

  if (compact) {
    return (
      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          columnGap: 14,
          rowGap: 4,
          margin: "6px 0 0",
          padding: 0,
          fontFamily: "'Instrument Serif', serif",
        }}
      >
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: "contents" }}>
            <dt
              style={{
                color: "rgba(250,247,242,0.42)",
                fontStyle: "italic",
                fontSize: 10,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                alignSelf: "baseline",
              }}
            >
              {label}
            </dt>
            <dd
              style={{
                margin: 0,
                color: "rgba(250,247,242,0.78)",
                fontStyle: "italic",
                fontFamily: "'Noto Serif TC', serif",
                fontSize: 10,
                letterSpacing: "0.22em",
                lineHeight: 1.55,
                alignSelf: "baseline",
              }}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <section
      style={{
        marginTop: 10,
        paddingTop: 20,
        borderTop: "1px solid rgba(250,247,242,0.08)",
        textAlign: "left",
      }}
    >
      <div
        style={{
          marginBottom: 14,
          color: "rgba(201,169,110,0.55)",
          fontStyle: "italic",
          fontFamily: "'Instrument Serif', serif",
          fontSize: 11,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          opacity: 0.85,
        }}
      >
        {t("workSpecKicker")}
      </div>
      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          columnGap: 22,
          rowGap: 10,
          margin: 0,
          padding: 0,
        }}
      >
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: "contents" }}>
            <dt
              style={{
                alignSelf: "baseline",
                color: "rgba(250,247,242,0.44)",
                fontStyle: "italic",
                fontFamily: "'Instrument Serif', serif",
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              {label}
            </dt>
            <dd
              style={{
                alignSelf: "baseline",
                margin: 0,
                color: "rgba(250,247,242,0.82)",
                fontStyle: "italic",
                fontFamily: "'Noto Serif TC', serif",
                fontSize: 11,
                letterSpacing: "0.22em",
                lineHeight: 1.65,
              }}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
