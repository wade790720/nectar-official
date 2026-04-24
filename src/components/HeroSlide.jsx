import { useEffect, useState } from "react";
import { useI18n } from "../i18n.jsx";

/**
 * Hero — the cover page of the portfolio book.
 * Editorial composition: top eyebrow, huge quiet display line, bottom tagline + scroll mark.
 * No imagery, no buttons — negative space is the subject.
 */
export function HeroSlide() {
  const { t } = useI18n();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className="hero-slide" aria-label={t("navBrand")}>
      <div className="hero-frame">
        <div
          className={`hero-eyebrow ws-reveal ${ready ? "is-in" : ""}`}
          style={{ transitionDelay: "120ms" }}
        >
          <span className="hero-eyebrow-rule" />
          {t("heroEyebrow")}
        </div>

        <h1
          className={`hero-display ws-reveal ${ready ? "is-in" : ""}`}
          style={{ transitionDelay: "260ms", whiteSpace: "pre-line" }}
        >
          {t("heroDisplay")}
        </h1>

        <div
          className={`hero-footer ws-reveal ${ready ? "is-in" : ""}`}
          style={{ transitionDelay: "460ms" }}
        >
          <p className="hero-tagline">{t("heroTagline")}</p>
          <div className="hero-scroll" aria-hidden="true">
            <span className="hero-scroll-line" />
            {t("heroScroll")}
          </div>
        </div>
      </div>
    </section>
  );
}
