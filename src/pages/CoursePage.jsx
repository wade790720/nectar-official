import { useState, useEffect } from "react";
import { CourseOgBookmark } from "../components/CourseOgBookmark.jsx";
import { CourseLicenseBody } from "../components/CourseLicenseBody.jsx";
import { GalleryCourseTile } from "../components/GalleryCourseTile.jsx";
import { Plus } from "../components/icons/Icons.jsx";
import { useI18n } from "../i18n.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";

export function CoursePage({
  admin,
  tainanSchedule,
  onSaveTainanSchedule,
  licenseCoverImage = "",
  onUploadLicenseCover,
  taipeiUrl,
  taichungUrl,
  mainUrl,
  courses = [],
  onAddCourse,
  onSaveCourseNames,
  onUploadCourseImage,
  onDeleteCourse,
  newlyAddedCourseId = null,
}) {
  const { t, locale } = useI18n();
  const [draft, setDraft] = useState(tainanSchedule || "");
  const [journalTab, setJournalTab] = useState("courses");

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

      {/* ── § 02 課程影像 / 證照（分頁）──────────────── */}
      <section
        className="gl-section cp-course-journal"
        aria-labelledby="cp-course-journal-title"
      >
        <div className="gl-section-head">
          <span className="gl-section-n">§ 02</span>
          <h2 id="cp-course-journal-title" className="gl-section-title">
            {t("courseJournalSectionTitle")}
          </h2>
        </div>

        <div className="cp-journal-tablist" role="tablist" aria-label={t("courseJournalSectionTitle")}>
          <button
            type="button"
            role="tab"
            id="cp-journal-tab-courses"
            className={`cp-journal-tab ${journalTab === "courses" ? "is-active" : ""}`}
            aria-selected={journalTab === "courses"}
            aria-controls="cp-journal-panel-courses"
            onClick={() => setJournalTab("courses")}
          >
            {t("gallerySectionCourses")}
          </button>
          <button
            type="button"
            role="tab"
            id="cp-journal-tab-license"
            className={`cp-journal-tab ${journalTab === "license" ? "is-active" : ""}`}
            aria-selected={journalTab === "license"}
            aria-controls="cp-journal-panel-license"
            onClick={() => setJournalTab("license")}
          >
            {t("courseJournalTabLicense")}
          </button>
        </div>

        <div
          id="cp-journal-panel-courses"
          role="tabpanel"
          aria-labelledby="cp-journal-tab-courses"
          className="cp-journal-panel"
          hidden={journalTab !== "courses"}
        >
          {courses.length === 0 && !admin ? (
            <p className="gl-empty">{t("galleryCoursesEmpty")}</p>
          ) : (
            <ul className="gl-grid" role="list">
              {courses.map((c) => (
                <GalleryCourseTile
                  key={c.id}
                  course={c}
                  locale={locale}
                  admin={admin}
                  pulse={c.id === newlyAddedCourseId}
                  onSaveNames={onSaveCourseNames}
                  onUploadImage={onUploadCourseImage}
                  onDelete={onDeleteCourse}
                />
              ))}
              {admin && (
                <li className="gl-tile gl-tile-add">
                  <button
                    type="button"
                    className="gl-add-btn"
                    onClick={onAddCourse}
                  >
                    <Plus s={22} />
                    <span>{t("galleryAddCourse")}</span>
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>

        <div
          id="cp-journal-panel-license"
          role="tabpanel"
          aria-labelledby="cp-journal-tab-license"
          className="cp-journal-panel"
          hidden={journalTab !== "license"}
        >
          <CourseLicenseBody
            locale={locale}
            admin={admin}
            licenseCoverImage={licenseCoverImage}
            onUploadCover={onUploadLicenseCover}
          />
        </div>
      </section>
    </section>
  );
}

