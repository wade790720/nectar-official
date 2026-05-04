import { useEffect, useState } from "react";
import { apiPath } from "../persist.js";

function hostLabel(href) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * 外部課程連結：書籤式卡片；部署後由 /api/og-preview 帶入 OG 圖與標題。
 * 本機純 Vite 無 Function 時優雅降級為僅文字＋網域。
 */
export function CourseOgBookmark({ href, ctaLabel }) {
  const [preview, setPreview] = useState(null);
  const [phase, setPhase] = useState("loading");
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    if (!href) return;
    let cancel = false;
    setPhase("loading");
    setImgErr(false);

    (async () => {
      try {
        const api = apiPath(
          `/api/og-preview?url=${encodeURIComponent(href)}`,
        );
        const r = await fetch(api);
        if (!r.ok) throw new Error(String(r.status));
        const j = await r.json();
        if (cancel) return;
        if (j && j.error) throw new Error(j.error);
        setPreview({
          title: j.title || "",
          description: j.description || "",
          image: j.image || "",
          siteName: j.siteName || "",
          hostname: j.hostname || hostLabel(href),
        });
        setPhase("ready");
      } catch {
        if (!cancel) {
          setPreview(null);
          setPhase("fallback");
        }
      }
    })();

    return () => {
      cancel = true;
    };
  }, [href]);

  const domain =
    preview?.hostname || preview?.siteName || hostLabel(href) || "—";
  const title =
    (preview?.title && preview.title.trim()) ||
    hostLabel(href) ||
    href;
  const showImg = preview?.image && !imgErr && phase === "ready";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="cp-bookmark"
    >
      <div className="cp-bookmark-inner">
        <div className="cp-bookmark-thumb" aria-hidden="true">
          {phase === "loading" ? (
            <span className="cp-bookmark-skeleton" />
          ) : showImg ? (
            <img
              src={preview.image}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setImgErr(true)}
            />
          ) : (
            <span className="cp-bookmark-thumb-fallback" />
          )}
        </div>
        <div className="cp-bookmark-body">
          <span className="cp-bookmark-title">{title}</span>
          {preview?.description && phase === "ready" ? (
            <span className="cp-bookmark-desc">{preview.description}</span>
          ) : null}
          <span className="cp-bookmark-meta">
            <span className="cp-bookmark-domain">{domain}</span>
            <span className="cp-bookmark-cta">{ctaLabel}</span>
          </span>
        </div>
      </div>
    </a>
  );
}
