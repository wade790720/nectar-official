import { useEffect, useRef, useState } from "react";
import {
  COURSE_LICENSE_COVER_SRC,
  licenseContentFor,
} from "../config/courseLicenseContent.js";
import { useI18n } from "../i18n.jsx";
import { Cam } from "./icons/Icons.jsx";

/**
 * 證照分頁：站內文稿；cover 來自後台上傳、環境變數或設定常數（見 courseLicenseContent.js）。
 */
export function CourseLicenseBody({
  locale,
  admin = false,
  licenseCoverImage = "",
  onUploadCover,
}) {
  const { t } = useI18n();
  const data = licenseContentFor(locale === "zh-TW" ? "zh-TW" : "en");
  const langClass = locale === "zh-TW" ? "cp-license-article--zh" : "cp-license-article--en";
  const persisted = String(licenseCoverImage || "").trim();
  const envCover = String(import.meta.env.VITE_COURSE_LICENSE_COVER || "").trim();
  const fallbackStatic = COURSE_LICENSE_COVER_SRC.trim();
  const coverSrc = persisted || envCover || fallbackStatic;
  const [imgErr, setImgErr] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    setImgErr(false);
  }, [coverSrc]);

  const showImg = Boolean(coverSrc) && !imgErr;
  const showCoverRegion = admin || showImg;

  const pickFile = () => fileRef.current?.click();

  return (
    <>
      <article
        className={`cp-license-article ${langClass}`}
        lang={locale === "zh-TW" ? "zh-TW" : "en"}
      >
        {showCoverRegion ? (
          <div className="cp-license-cover-wrap">
            {admin ? (
              <div
                className={`cp-license-cover-upload gl-cover-upload ${showImg ? "" : "is-empty"}`}
                role="button"
                tabIndex={0}
                onClick={pickFile}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    pickFile();
                  }
                }}
              >
                {showImg ? (
                  <img
                    className="cp-license-cover"
                    src={coverSrc}
                    alt={data.titleLine}
                    decoding="async"
                    onError={() => setImgErr(true)}
                  />
                ) : (
                  <span className="gl-cover-empty">—</span>
                )}
                <div className="gl-cover-overlay" aria-hidden="true">
                  <Cam s={22} />
                  <span>
                    {showImg ? t("galleryCourseReplace") : t("galleryCourseUpload")}
                  </span>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUploadCover?.(f);
                    e.target.value = "";
                  }}
                />
              </div>
            ) : (
              <img
                className="cp-license-cover"
                src={coverSrc}
                alt={data.titleLine}
                decoding="async"
                onError={() => setImgErr(true)}
              />
            )}
          </div>
        ) : null}

        <div className="cp-license-inner">
          <section
            className="cp-license-section cp-license-section--foliage"
            aria-labelledby="cp-license-foliage-headline"
          >
            <header className="cp-license-header">
              <p className="cp-license-eyebrow">{data.eyebrow}</p>
              <p className="cp-license-title-line">{data.titleLine}</p>
              <h3 id="cp-license-foliage-headline" className="cp-license-headline">
                {data.headline}
              </h3>
            </header>

            <ul className="cp-license-bullets">
              {data.bullets.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </section>
        </div>
      </article>

      <section
        className={`cp-license-section cp-license-section--madoka ${langClass}`}
        aria-labelledby="cp-license-madoka-headline"
        lang={locale === "zh-TW" ? "zh-TW" : "en"}
      >
        <header className="cp-license-header cp-license-header--madoka">
          <p className="cp-license-eyebrow">{data.madokaEyebrow}</p>
          <p className="cp-license-title-line">{data.madokaTitleLine}</p>
          <h3 id="cp-license-madoka-headline" className="cp-license-headline">
            {locale === "zh-TW" && /^\s*Madoka\s+/i.test(data.madokaHeadline) ? (
              <>
                <span className="cp-license-headline-wordmark" lang="en">
                  Madoka
                </span>{" "}
                {data.madokaHeadline.replace(/^\s*Madoka\s+/i, "")}
              </>
            ) : (
              data.madokaHeadline
            )}
          </h3>
        </header>
        {data.madokaRule ? (
          <p className="cp-license-madoka-sub">{data.madokaRule}</p>
        ) : null}
        {data.levelsIntro ? (
          <p className="cp-license-levels-intro">{data.levelsIntro}</p>
        ) : null}
        <ul className="cp-license-levels" aria-label={data.madokaHeadline}>
          {data.levels.map((row) => (
            <li key={row.label}>
              <span className="cp-license-level-name">{row.label}</span>
              <span className="cp-license-level-desc">{row.body}</span>
            </li>
          ))}
        </ul>
        <p className="cp-license-closing">{data.closing}</p>
      </section>
    </>
  );
}
