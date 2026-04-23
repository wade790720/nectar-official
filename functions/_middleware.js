/**
 * 允許從本機 Vite（localhost）以 VITE_API_BASE 直連正式 API 時的 CORS。
 * 若使用 vite proxy（/api → Pages），瀏覽器為同網域，通常不會觸發此需求。
 */
function isLocalDevOrigin(origin) {
  if (!origin) return false;
  try {
    const u = new URL(origin);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, HEAD, PUT, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export async function onRequest(context) {
  const { request, next } = context;
  const origin = request.headers.get("Origin");
  const allow = isLocalDevOrigin(origin);

  if (request.method === "OPTIONS" && allow) {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  const response = await next();
  if (!allow || !origin) return response;

  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders(origin))) {
    headers.set(k, v);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
