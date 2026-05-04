/**
 * GET /api/og-preview?url=https%3A%2F%2F...
 * 伺服端擷取目標頁首段 HTML，解析 og:title / og:image / og:description（及常見 fallback），
 * 供課程頁書籤卡預覽。瀏覽器無法直接跨網域讀取 HTML meta。
 *
 * 限制：僅 https、阻擋常見內網 hostname，僅讀取前 ~512KB HTML，逾時中止。
 */

const MAX_HTML_BYTES = 512 * 1024;
const FETCH_MS = 10000;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function isLikelyPrivateHost(hostname) {
  const h = String(hostname).toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local"))
    return true;
  if (h === "0.0.0.0") return true;
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
  }
  return false;
}

function isUrlAllowed(urlString) {
  try {
    const u = new URL(urlString);
    if (u.protocol !== "https:") return false;
    if (isLikelyPrivateHost(u.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

function decodeBasicEntities(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .trim();
}

/** 由 content 在前、property 在後 或相反 兩種順序擷取 meta content */
function metaContent(html, attrName, attrValue) {
  const esc = attrValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re1 = new RegExp(
    `<meta[^>]+${attrName}=["']${esc}["'][^>]*content=["']([^"']*)["'][^>]*>`,
    "i",
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*${attrName}=["']${esc}["'][^>]*>`,
    "i",
  );
  const m = html.match(re1) || html.match(re2);
  return m ? decodeBasicEntities(m[1]) : "";
}

function parseOg(html, baseHref) {
  let title =
    metaContent(html, "property", "og:title") ||
    metaContent(html, "name", "twitter:title");
  if (!title) {
    const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    title = t ? decodeBasicEntities(t[1].replace(/<[^>]+>/g, " ")) : "";
  }

  let image =
    metaContent(html, "property", "og:image") ||
    metaContent(html, "name", "twitter:image") ||
    metaContent(html, "name", "twitter:image:src");
  let description =
    metaContent(html, "property", "og:description") ||
    metaContent(html, "name", "twitter:description") ||
    metaContent(html, "name", "description");

  const siteName =
    metaContent(html, "property", "og:site_name") ||
    metaContent(html, "name", "application-name");

  try {
    const base = new URL(baseHref);
    if (image) {
      if (image.startsWith("//")) image = `https:${image}`;
      image = new URL(image, base.href).href;
    }
  } catch {
    /* keep raw */
  }

  return {
    title: title || "",
    description: description || "",
    image: image || "",
    siteName: siteName || "",
  };
}

function concatUint8(chunks) {
  const n = chunks.reduce((a, c) => a + c.length, 0);
  const out = new Uint8Array(n);
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.length;
  }
  return out;
}

export async function onRequestGet({ request }) {
  const reqUrl = new URL(request.url);
  const target = reqUrl.searchParams.get("url");
  if (!target || !isUrlAllowed(target)) {
    return json({ error: "invalid_url" }, 400);
  }

  const ac = new AbortController();
  const tid = setTimeout(() => ac.abort(), FETCH_MS);

  try {
    const res = await fetch(target, {
      redirect: "follow",
      signal: ac.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    clearTimeout(tid);

    if (!res.ok) {
      return json(
        { error: "fetch_failed", status: res.status },
        res.status >= 500 ? 502 : 404,
      );
    }

    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (!ct.includes("text/html") && !ct.includes("application/xhtml")) {
      return json({ error: "not_html" }, 415);
    }

    const reader = res.body?.getReader();
    if (!reader) return json({ error: "no_body" }, 502);

    const chunks = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value && value.length) {
        chunks.push(value);
        total += value.length;
        if (total >= MAX_HTML_BYTES) break;
      }
    }

    const bytes = concatUint8(chunks);
    const html = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    const finalHref = res.url || target;
    const parsed = parseOg(html, finalHref);

    let hostname = "";
    try {
      hostname = new URL(finalHref).hostname.replace(/^www\./, "");
    } catch {
      /* ignore */
    }

    return json({
      url: finalHref,
      hostname,
      ...parsed,
    });
  } catch (e) {
    clearTimeout(tid);
    const aborted = e?.name === "AbortError";
    return json(
      {
        error: aborted ? "timeout" : "fetch_error",
        message: String(e?.message || e),
      },
      502,
    );
  }
}
