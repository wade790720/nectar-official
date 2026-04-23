export function SocialContactChips({ socialIg, socialFb, contactMail, t, compact }) {
  const gap = compact ? 10 : 14;
  const minW = compact ? 92 : 108;
  const pad = compact ? "10px 16px" : "11px 22px";
  const fs = compact ? 12 : 13;
  const link = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: minW,
    padding: pad,
    borderRadius: 999,
    border: "1px solid rgba(201,169,110,0.45)",
    background: "rgba(201,169,110,0.12)",
    fontFamily: "'Instrument Serif',serif",
    fontSize: fs,
    fontStyle: "italic",
    color: "#E8D5B0",
    textDecoration: "none",
    transition: "background 0.2s, border-color 0.2s",
  };
  const dis = {
    ...link,
    border: "1px solid rgba(201,169,110,0.22)",
    background: "rgba(201,169,110,0.04)",
    color: "rgba(201,169,110,0.42)",
    cursor: "help",
  };
  return (
    <div
      style={{
        display: "flex",
        gap,
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      {socialIg ? (
        <a
          className="sf"
          href={socialIg}
          target="_blank"
          rel="noopener noreferrer"
          style={link}
        >
          {t("socialInstagram")}
        </a>
      ) : (
        <span title={t("socialPendingHint")} style={dis}>
          {t("socialInstagram")}
        </span>
      )}
      {socialFb ? (
        <a
          className="sf"
          href={socialFb}
          target="_blank"
          rel="noopener noreferrer"
          style={link}
        >
          {t("socialFacebook")}
        </a>
      ) : (
        <span title={t("socialPendingHint")} style={dis}>
          {t("socialFacebook")}
        </span>
      )}
      {contactMail ? (
        <a className="sf" href={`mailto:${contactMail}`} style={link}>
          {t("footerContact")}
        </a>
      ) : (
        <span title={t("contactPendingHint")} style={dis}>
          {t("footerContact")}
        </span>
      )}
    </div>
  );
}
