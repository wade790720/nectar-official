import { useEffect } from "react";

const SITE_ORIGIN = "https://www.lustreyellow.com";

/**
 * usePageMeta — 輕量 SPA meta 更新器。
 *
 * 為什麼不用 react-helmet-async：
 *  - 只有 4 頁，不需要 meta 堆疊 / 併發管理
 *  - 少一個 runtime 相依
 *  - Cloudflare Zaraz 在 SPA 路由切換時會讀 document.title，
 *    只要保證切頁瞬間 title 已更新即可
 *
 * 做的事：
 *  - document.title
 *  - <meta name="description">
 *  - <meta property="og:title"> / <meta property="og:description">
 *  - <meta name="twitter:title"> / <meta name="twitter:description">
 *  - <link rel="canonical">（依目前 pathname 動態帶）
 *
 * 不做的事：
 *  - og:image 仍沿用 index.html 的站預設圖；若日後要每頁獨立圖，
 *    在此加一個 image 參數即可
 *  - og:locale 由 I18nProvider 在切語系時自行更新（見 i18n.jsx）
 */
function setMetaByName(name, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setMetaByProperty(property, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(pathname) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  const path = pathname && pathname !== "/" ? pathname : "/";
  el.setAttribute("href", `${SITE_ORIGIN}${path}`);
}

/**
 * @param {Object} meta
 * @param {string} meta.title        分頁完整標題（含品牌尾碼）
 * @param {string} meta.description  60–160 字摘要
 * @param {string} [meta.pathname]   手動指定 canonical 路徑（預設抓目前）
 */
export function usePageMeta({ title, description, pathname }) {
  useEffect(() => {
    if (title) document.title = title;
    setMetaByName("description", description);
    setMetaByProperty("og:title", title);
    setMetaByProperty("og:description", description);
    setMetaByName("twitter:title", title);
    setMetaByName("twitter:description", description);
    setCanonical(
      pathname ??
        (typeof window !== "undefined" ? window.location.pathname : "/"),
    );
  }, [title, description, pathname]);
}
