function j(body, s = 200) {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status: s,
    headers: { "Content-Type": "application/json" },
  });
}

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function onRequestPost({ request, env }) {
  if (request.method !== "POST") return j({ error: "Method not allowed" }, 405);
  const auth = request.headers.get("Authorization") || "";
  const secret = env.ADMIN_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return j({ error: "Unauthorized" }, 401);
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file !== "object" || !file.arrayBuffer) {
    return j({ error: "Missing file" }, 400);
  }
  const ct = file.type || "image/jpeg";
  if (ct && !ALLOWED.has(ct)) {
    return j({ error: "Unsupported file type" }, 400);
  }
  const name = (file.name || "upload").toLowerCase();
  const last = name.includes(".") ? name.split(".").pop() : "jpg";
  const ext = ["jpg", "jpeg", "png", "webp", "gif"].includes(last)
    ? last === "jpeg"
      ? "jpg"
      : last
    : "jpg";
  const key = `images/${crypto.randomUUID()}.${ext}`;
  await env.BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: ct },
  });
  const u = new URL(request.url);
  const base = u.origin;
  return j({ url: `${base}/api/file/${key}` });
}
