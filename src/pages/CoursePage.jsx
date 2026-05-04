import { useState, useEffect } from "react";
import { CourseOgBookmark } from "../components/CourseOgBookmark.jsx";
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
    {
      key: "tp",
      titleKey: "courseTaipei",
      subKey: "courseCitySubTaipei",
      href: taipeiUrl,
    },
    {
      key: "tc",
      titleKey: "courseTaichung",
      subKey: "courseCitySubTaichung",
      href: taichungUrl,
    },
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
            <h3 className="cp-city">
              <span className="cp-city-primary">{t(c.titleKey)}</span>
              {t(c.subKey) ? (
                <span className="cp-city-sub" lang="zh-TW">
                  {t(c.subKey)}
                </span>
              ) : null}
            </h3>
            {c.href ? (
              <CourseOgBookmark href={c.href} ctaLabel={t("courseGoLink")} />
            ) : (
              <span className="cp-link-pending">{t("courseLinkPending")}</span>
            )}
          </article>
        ))}

        <article className="cp-card cp-card--tainan">
          <div className="cp-tainan-head">
            <h3 className="cp-city">
              <span className="cp-city-primary">{t("courseTainan")}</span>
              {t("courseCitySubTainan") ? (
                <span className="cp-city-sub" lang="zh-TW">
                  {t("courseCitySubTainan")}
                </span>
              ) : null}
            </h3>
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
                className="vp-admin-add"
                style={{ width: "fit-content" }}
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

