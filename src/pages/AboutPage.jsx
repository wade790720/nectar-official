import { useI18n } from "../i18n.jsx";
import { Arr, Cam } from "../components/icons/Icons.jsx";

/**
 * AboutPage — editorial "colophon" for the atelier.
 *
 *   ① Masthead       kicker + display line + lead paragraph
 *   ② Philosophy     caption left, prose right
 *   ③ Process        numbered movements, hairline rows
 *   ④ Artist         nameplate + portrait + signature + bio
 *                    (portrait & signature uploadable by admin)
 *   ⑤ Studio / CTA   appointment note + email / instagram links
 */
export function AboutPage({
  socialIg,
  contactMail,
  artist = { portrait: "", signature: "" },
  admin = false,
  onUploadPortrait,
  onUploadSignature,
  onRemovePortrait,
  onRemoveSignature,
}) {
  const { t } = useI18n();

  const processItems = [1, 2, 3, 4].map((n) => ({
    n: t(`aboutProcess${n}N`),
    title: t(`aboutProcess${n}T`),
    body: t(`aboutProcess${n}B`),
  }));

  const mailHref = contactMail
    ? `mailto:${contactMail}?subject=${encodeURIComponent(t("aboutCtaNote"))}`
    : null;

  const portrait = artist?.portrait || "";
  const signature = artist?.signature || "";

  return (
    <div className="ab-page">
      {/* ── Masthead ─────────────────────────── */}
      <header className="ab-mast">
        <div className="ab-eyebrow">
          <span className="ab-eyebrow-rule" aria-hidden="true" />
          {t("aboutKicker")}
        </div>
        <h1 className="ab-display">{t("aboutTitle")}</h1>
        <p className="ab-lead">{t("aboutLead")}</p>
      </header>

      {/* ── § 01 Philosophy ─────────────────── */}
      <section className="ab-section">
        <div className="ab-section-caption">
          <div className="ab-section-n">§ 01</div>
          <div className="ab-section-kicker">{t("aboutPhilosophyKicker")}</div>
          <h2 className="ab-section-title">{t("aboutPhilosophyTitle")}</h2>
        </div>
        <div className="ab-section-body">
          <p className="ab-body">{t("aboutPhilosophyBody1")}</p>
          <p className="ab-body">{t("aboutPhilosophyBody2")}</p>
        </div>
      </section>

      {/* ── § 02 Process ────────────────────── */}
      <section className="ab-section">
        <div className="ab-section-caption">
          <div className="ab-section-n">§ 02</div>
          <div className="ab-section-kicker">{t("aboutProcessKicker")}</div>
          <h2 className="ab-section-title">{t("aboutProcessTitle")}</h2>
        </div>
        <ol className="ab-process">
          {processItems.map((p, i) => (
            <li key={i} className="ab-process-row">
              <span className="ab-process-n">{p.n}</span>
              <span className="ab-process-title">{p.title}</span>
              <span className="ab-process-body">{p.body}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ── § 03 Artist ─────────────────────── */}
      <section className="ab-section ab-artist">
        <header className="ab-artist-head">
          <div className="ab-section-n">§ 03</div>
          <div className="ab-section-kicker">{t("aboutArtistKicker")}</div>
          <h2 className="ab-artist-name">{t("aboutArtistName")}</h2>
        </header>

        <div
          className={`ab-artist-grid ${portrait ? "" : "ab-artist-grid--noportrait"}`}
        >
          {(portrait || admin) && (
            <figure className="ab-artist-figure">
              {portrait ? (
                <>
                  <img
                    className="ab-artist-portrait"
                    src={portrait}
                    alt={t("aboutArtistName")}
                  />
                  {signature && (
                    <img
                      className="ab-artist-signature"
                      src={signature}
                      alt=""
                      aria-hidden="true"
                    />
                  )}
                </>
              ) : (
                <div className="ab-artist-empty">
                  {t("aboutArtistUploadPortrait")}
                </div>
              )}

              {admin && (
                <div className="ab-artist-admin">
                  <label className="ab-artist-admin-btn">
                    <Cam s={12} />
                    <span>
                      {portrait
                        ? t("aboutArtistReplacePortrait")
                        : t("aboutArtistUploadPortrait")}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onUploadPortrait?.(f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {portrait && (
                    <button
                      type="button"
                      className="ab-artist-admin-btn ab-artist-admin-btn--ghost"
                      onClick={onRemovePortrait}
                    >
                      {t("aboutArtistRemovePortrait")}
                    </button>
                  )}
                  <label className="ab-artist-admin-btn">
                    <Cam s={12} />
                    <span>
                      {signature
                        ? t("aboutArtistReplaceSignature")
                        : t("aboutArtistUploadSignature")}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onUploadSignature?.(f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {signature && (
                    <button
                      type="button"
                      className="ab-artist-admin-btn ab-artist-admin-btn--ghost"
                      onClick={onRemoveSignature}
                    >
                      {t("aboutArtistRemoveSignature")}
                    </button>
                  )}
                </div>
              )}
            </figure>
          )}

          <div className="ab-artist-text">
            <div className="ab-artist-title">{t("aboutArtistTitle")}</div>
            <p className="ab-artist-sub">{t("aboutArtistSubtitle")}</p>

            <ul className="ab-artist-facts">
              <li>{t("aboutArtistFact1")}</li>
              <li>{t("aboutArtistFact2")}</li>
              <li>{t("aboutArtistFact3")}</li>
              <li>{t("aboutArtistFact4")}</li>
            </ul>

            <p className="ab-body">{t("aboutArtistBody1")}</p>
            <p className="ab-body">{t("aboutArtistBody2")}</p>
            <p className="ab-body">{t("aboutArtistBody3")}</p>
            <p className="ab-body ab-artist-closing">
              {t("aboutArtistBody4")}
            </p>

            {admin && (
              <p className="ab-artist-hint">{t("aboutArtistPortraitHint")}</p>
            )}
          </div>
        </div>
      </section>

      {/* ── § 04 Studio & CTA ───────────────── */}
      <section className="ab-section ab-section--last">
        <div className="ab-section-caption">
          <div className="ab-section-n">§ 04</div>
          <div className="ab-section-kicker">{t("aboutStudioKicker")}</div>
          <h2 className="ab-section-title">{t("aboutStudioTitle")}</h2>
        </div>
        <div className="ab-section-body">
          <p className="ab-body">{t("aboutStudioBody")}</p>

          <div className="ab-cta-note">{t("aboutCtaNote")}</div>
          <ul className="ab-cta-list">
            {mailHref ? (
              <li>
                <a className="ab-cta" href={mailHref}>
                  <span>{t("aboutCtaEmail")}</span>
                  <span className="ab-cta-arr" aria-hidden="true">
                    <Arr s={14} d="right" />
                  </span>
                </a>
              </li>
            ) : null}
            {socialIg ? (
              <li>
                <a
                  className="ab-cta"
                  href={socialIg}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>{t("aboutCtaInstagram")}</span>
                  <span className="ab-cta-arr" aria-hidden="true">
                    <Arr s={14} d="right" />
                  </span>
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </section>
    </div>
  );
}
