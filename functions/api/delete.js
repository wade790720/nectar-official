/**
 * POST /api/delete
 *
 * Body: { urls: string[] }
 * Header: Authorization: Bearer <ADMIN_SECRET>
 *
 * Removes R2 objects referenced by same-origin /api/file/images/* URLs.
 * Silently ignores external URLs, data URLs, and malformed entries —
 * this endpoint is intentionally lenient because image cleanup is a
 * best-effort background task (never block the user flow on failure).
 */

function j(body, s = 200) {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status: s,
    headers: { "Content-Type": "application/json" },
  });
}

const KEY_RE =
  /^\/api\/file\/(images\/[A-Za-z0-9-]+\.(?:jpg|jpeg|png|webp|gif))$/;

function extractOwnKey(url, origin) {
  if (!url || typeof url !== "string") return null;
  try {
    const u = new URL(url, origin);
    if (u.origin !== origin) return null;
    const m = u.pathname.match(KEY_RE);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export async function onRequestPost({ request, env }) {
  if (request.method !== "POST") return j({ error: "Method not allowed" }, 405);

  const auth = request.headers.get("Authorization") || "";
  const secret = env.ADMIN_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return j({ error: "Unauthorized" }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return j({ error: "Bad JSON" }, 400);
  }

  const urls = Array.isArray(body?.urls) ? body.urls : [];
  const origin = new URL(request.url).origin;
  const keys = [
    ...new Set(urls.map((u) => extractOwnKey(u, origin)).filter(Boolean)),
  ];

  let deleted = 0;
  for (const key of keys) {
    try {
      await env.BUCKET.delete(key);
      deleted += 1;
    } catch {
      /* ignore per-key failures; the GC job can catch stragglers later */
    }
  }

  return j({ deleted, requested: urls.length, resolved: keys.length });
}
