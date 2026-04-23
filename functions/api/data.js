const DATA = "data.json";

function j(body, s = 200) {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status: s,
    headers: { "Content-Type": "application/json" },
  });
}

/** 與前端一致：舊檔僅 { works }、或誤存成純陣列 */
function normalizeStored(parsed) {
  if (Array.isArray(parsed)) {
    return { works: parsed, votes: [], wishes: [] };
  }
  if (!parsed || typeof parsed !== "object") {
    return { works: [], votes: [], wishes: [] };
  }
  return {
    works: Array.isArray(parsed.works) ? parsed.works : [],
    votes: Array.isArray(parsed.votes) ? parsed.votes : [],
    wishes: Array.isArray(parsed.wishes) ? parsed.wishes : [],
  };
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
  const secret = env.ADMIN_SECRET || "";
  const authenticated = Boolean(secret && auth === `Bearer ${secret}`);

  const text = await request.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return j({ error: "Invalid JSON" }, 400);
  }
  if (!body || typeof body !== "object") {
    return j({ error: "Invalid body" }, 400);
  }

  let existing = { works: [], votes: [], wishes: [] };
  const prev = await env.BUCKET.get(DATA);
  if (prev) {
    try {
      existing = normalizeStored(JSON.parse(await prev.text()));
    } catch {
      /* ignore */
    }
  }

  let merged;

  if (authenticated) {
    if (!Array.isArray(body.works)) {
      return j({ error: "Body must include { works: array }" }, 400);
    }
    merged = {
      works: body.works,
      votes: Object.prototype.hasOwnProperty.call(body, "votes")
        ? Array.isArray(body.votes)
          ? body.votes
          : existing.votes
        : existing.votes,
      wishes: Object.prototype.hasOwnProperty.call(body, "wishes")
        ? Array.isArray(body.wishes)
          ? body.wishes
          : existing.wishes
        : existing.wishes,
    };
  } else {
    /** 訪客可更新投票／許願；不可改 works（避免未授權竄改作品） */
    if (Object.prototype.hasOwnProperty.call(body, "works")) {
      return j({ error: "Unauthorized" }, 401);
    }
    const hasVotes = Object.prototype.hasOwnProperty.call(body, "votes");
    const hasWishes = Object.prototype.hasOwnProperty.call(body, "wishes");
    if (!hasVotes && !hasWishes) {
      return j({ error: "Body must include votes and/or wishes" }, 400);
    }
    merged = {
      works: existing.works,
      votes: hasVotes
        ? Array.isArray(body.votes)
          ? body.votes
          : existing.votes
        : existing.votes,
      wishes: hasWishes
        ? Array.isArray(body.wishes)
          ? body.wishes
          : existing.wishes
        : existing.wishes,
    };
  }

  await env.BUCKET.put(DATA, JSON.stringify(merged), {
    httpMetadata: { contentType: "application/json" },
  });
  return j({ ok: true });
}
