export async function onRequestGet({ request, env }) {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }
  const u = new URL(request.url);
  const m = u.pathname.match(/^\/api\/file\/(.+)$/);
  if (!m) {
    return new Response("Not found", { status: 404 });
  }
  const key = decodeURIComponent(m[1]);
  if (!key || key.startsWith("/") || key.includes("..")) {
    return new Response("Bad key", { status: 400 });
  }
  const obj = await env.BUCKET.get(key);
  if (!obj) {
    return new Response("Not found", { status: 404 });
  }
  const ct = obj.httpMetadata?.contentType || "application/octet-stream";
  return new Response(obj.body, {
    headers: {
      "Content-Type": ct,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
