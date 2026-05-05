/**
 * 日本水晶花證照課 — 由原 Jimdo 頁摘錄，於站內直接呈現。
 * 更新內文改此檔後重新部署。
 *
 * Cover 顯示順序：後台上傳（`data.json` → `coursePage.licenseCoverImage`，與「課程影像」同 R2）
 * ＞ `.env` 的 `VITE_COURSE_LICENSE_COVER` ＞ 下方常數。
 * 無後台圖時亦可將檔放 `public/images/` 後填入常數（例：`/images/course-license-cover.jpg`）。
 */
export const COURSE_LICENSE_COVER_SRC = "";

/** @typedef {{ eyebrow: string, titleLine: string, headline: string, bullets: string[], levelsTitle: string, levels: { label: string, body: string }[], closing: string }} LicenseLocale */

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
    levelsTitle: "花藝證照班（不可跳級）",
    levels: [
      { label: "初級", body: "12 項花，約 6–7 天完成" },
      { label: "中級", body: "12 項花，約 6–7 天完成" },
      { label: "高級", body: "12 項花，約 8 天完成" },
      { label: "師資", body: "12 項花，約 8 天完成" },
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
    levelsTitle: "Flower-craft certification tracks (no skipping levels)",
    levels: [
      { label: "Beginner", body: "12 flower projects, ~6–7 days" },
      { label: "Intermediate", body: "12 flower projects, ~6–7 days" },
      { label: "Advanced", body: "12 flower projects, ~8 days" },
      { label: "Instructor", body: "12 flower projects, ~8 days" },
    ],
    closing:
      "Session days need not run back-to-back. After completion you may apply for the corresponding Japanese certificate for each tier.",
  },
};

export function licenseContentFor(locale) {
  return LICENSE_BY_LOCALE[locale] ?? LICENSE_BY_LOCALE.en;
}
