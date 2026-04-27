import { useState, useEffect } from "react";
import { useI18n } from "../i18n.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";

export function CoursePage({
  admin,
  tainanSchedule,
  onSaveTainanSchedule,
  taipeiUrl,
  taichungUrl,
  mainUrl,
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(tainanSchedule || "");

  usePageMeta({
    title: t("metaCourseTitle"),
    description: t("metaCourseDesc"),
    pathname: "/course",
  });

  useEffect(() => {
    setDraft(tainanSchedule || "");
  }, [tainanSchedule]);

  const cards = [
    { key: "tp", title: t("courseTaipei"), href: taipeiUrl },
    { key: "tc", title: t("courseTaichung"), href: taichungUrl },
  ];

  return (
    <section className="gl-page cp-page">
      <header className="vp-head gl-mast cp-mast">
        <div className="vp-eyebrow">
          <span className="vp-eyebrow-rule" aria-hidden="true" />
          {t("courseKicker")}
        </div>
        <h2 className="vp-title">{t("courseTitle")}</h2>
        <p className="vp-sub">{t("courseSub")}</p>
        {mainUrl ? (
          <a
            href={mainUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="vp-admin-add"
            style={{ width: "fit-content", textDecoration: "none" }}
          >
            {t("courseMainSite")}
          </a>
        ) : null}
      </header>

      <div className="cp-grid">
        {cards.map((c) => (
          <article key={c.key} className="cp-card">
            <h3 className="cp-city">{c.title}</h3>
            {c.href ? (
              <a href={c.href} target="_blank" rel="noopener noreferrer" className="cp-link">
                {t("courseGoLink")}
              </a>
            ) : (
              <span className="cp-link-pending">{t("courseLinkPending")}</span>
            )}
          </article>
        ))}

        <article className="cp-card cp-card--tainan">
          <div className="cp-tainan-head">
            <h3 className="cp-city">{t("courseTainan")}</h3>
            <div className="cp-date-kicker">{t("courseDateTitle")}</div>
          </div>
          <div className="cp-tainan-body">
            {admin ? (
              <>
                <textarea
                  className="fi"
                  style={{ minHeight: 190 }}
                  value={draft}
                  placeholder={t("courseDatePlaceholder")}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button
                  type="button"
                  className="cp-save"
                  onClick={() => onSaveTainanSchedule?.(draft)}
                >
                  {t("courseDateSave")}
                </button>
              </>
            ) : (
              <div className="cp-schedule">{tainanSchedule || t("courseLinkPending")}</div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

