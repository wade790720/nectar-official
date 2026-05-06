/**
 * 日本水晶花證照課 — 由原 Jimdo 頁摘錄，於站內直接呈現。
 * 更新內文改此檔後重新部署。
 *
 * Cover 顯示順序：後台上傳（`data.json` → `coursePage.licenseCoverImage`，與「課程影像」同 R2）
 * ＞ `.env` 的 `VITE_COURSE_LICENSE_COVER` ＞ 下方常數。
 * 無後台圖時亦可將檔放 `public/images/` 後填入常數（例：`/images/course-license-cover.jpg`）。
 */
export const COURSE_LICENSE_COVER_SRC = "";

/**
 * @typedef {{
 *   eyebrow: string,
 *   titleLine: string,
 *   headline: string,
 *   bullets: string[],
 *   madokaEyebrow: string,
 *   madokaTitleLine: string,
 *   madokaHeadline: string,
 *   madokaRule?: string,
 *   levelsIntro?: string,
 *   levels: { label: string, body: string }[],
 *   closing: string,
 * }} LicenseLocale
 */

/** @type {Record<string, LicenseLocale>} */
export const LICENSE_BY_LOCALE = {
  "zh-TW": {
    eyebrow: "獨家課程",
    titleLine: "日本水晶花證照課",
    headline: "觀葉植物日本證照",
    bullets: [
      "課程天數約 6–7 日（不需連續）；作品包含 12 項植物：生態瓶 ×1、植栽盆 ×2、觀葉植物日本證書 ×1。",
      "因浮木為大自然物件，每人製作與擺放皆會有所不同，這非常值得珍惜；也因此能培養更多美感與技巧。",
    ],
    madokaEyebrow: "官方課程",
    madokaTitleLine: "日本水晶花證照課",
    madokaHeadline: "Madoka 證書課程",
    madokaRule: "（不可跳級）",
    levelsIntro: "四級皆須完成 12 項花藝作品。下列為各級建議天數。",
    levels: [
      { label: "初級", body: "約 6–7 天" },
      { label: "中級", body: "約 6–7 天" },
      { label: "高級", body: "約 8 天" },
      { label: "師資", body: "約 8 天" },
    ],
    closing: "課程日皆不需連續。完成後可依級別申請日本證書。",
  },
  en: {
    eyebrow: "Exclusive program",
    titleLine: "Japan crystal-flower license track",
    headline: "Foliage plant certification (Japan)",
    bullets: [
      "Roughly 6–7 session days (non-consecutive). Includes 12 plant projects: one terrarium, two potted foliage pieces, plus a Japan foliage-plant certification.",
      "Driftwood is natural—every arrangement differs. That variance is intentional: it trains eye and composition with real materials.",
    ],
    madokaEyebrow: "Official program",
    madokaTitleLine: "Japan crystal-flower license track",
    madokaHeadline: "Madoka certificate program",
    madokaRule: "(no skipping levels)",
    levelsIntro:
      "Each tier: 12 floral projects. Estimated time to complete:",
    levels: [
      { label: "Beginner", body: "~6–7 days" },
      { label: "Intermediate", body: "~6–7 days" },
      { label: "Advanced", body: "~8 days" },
      { label: "Instructor", body: "~8 days" },
    ],
    closing:
      "Days need not be consecutive. After completion, apply for the Japanese certificate that matches your tier.",
  },
};

export function licenseContentFor(locale) {
  return LICENSE_BY_LOCALE[locale] ?? LICENSE_BY_LOCALE.en;
}
