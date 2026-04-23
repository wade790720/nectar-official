const DATA = "data.json";

function j(body, s = 200) {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status: s,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestGet({ request, env }) {
  if (request.method !== "GET") return j({ error: "Method not allowed" }, 405);
  const o = await env.BUCKET.get(DATA);
  // 尚無 data.json 時回 404，前端才會用預設作品列表；勿回 works:[] 否則會覆蓋本地預設並讓首次編輯像「消失」
  if (!o) {
    return new Response(JSON.stringify({ error: "No data yet" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, no-store",
      },
    });
  }
  return new Response(o.body, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
    },
  });
}

export async function onRequestPut({ request, env }) {
  if (request.method !== "PUT") return j({ error: "Method not allowed" }, 405);
  const auth = request.headers.get("Authorization") || "";
  const secret = env.ADMIN_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return j({ error: "Unauthorized" }, 401);
  }
  const text = await request.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return j({ error: "Invalid JSON" }, 400);
  }
  if (!body || !Array.isArray(body.works)) {
    return j({ error: "Body must include { works: array }" }, 400);
  }
  await env.BUCKET.put(DATA, JSON.stringify({ works: body.works }), {
    httpMetadata: { contentType: "application/json" },
  });
  return j({ ok: true });
}
