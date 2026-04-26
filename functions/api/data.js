const DATA = "data.json";

function j(body, s = 200) {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status: s,
    headers: { "Content-Type": "application/json" },
  });
}

const EMPTY_ARTIST = { portrait: "", signature: "" };

function normalizeArtist(a) {
  if (!a || typeof a !== "object" || Array.isArray(a))
    return { ...EMPTY_ARTIST };
  return {
    portrait: typeof a.portrait === "string" ? a.portrait : "",
    signature: typeof a.signature === "string" ? a.signature : "",
  };
}

/** 與前端一致：舊檔僅 { works }、或誤存成純陣列 */
/**
 * 訪客寫入時，禁止用其 JSON 的整份 `votes` 覆蓋 R2，否則常見情況是：
 * - 管理員剛「新增選項 / 更換圖片」，訪客分頁仍握有舊陣列，一投票就把伺服器
 *   的選項或新圖 URL 沖回舊的或整段遺失。
 * 以 existing（伺服器）為權威結構，只從客戶端合併 **票數**（依 id 對齊）。
 */
function mergeVisitorVoteCounts(existingVotes, bodyVotes) {
  if (!Array.isArray(bodyVotes) || !Array.isArray(existingVotes)) {
    return Array.isArray(existingVotes) ? existingVotes : [];
  }
  const byId = new Map();
  for (const v of bodyVotes) {
    if (v && v.id != null) byId.set(String(v.id), v);
  }
  return existingVotes.map((ex) => {
    if (!ex || ex.id == null) return ex;
    const cl = byId.get(String(ex.id));
    if (!cl || typeof cl.votes !== "number" || !Number.isFinite(cl.votes)) {
      return ex;
    }
    return { ...ex, votes: Math.max(0, Math.floor(cl.votes)) };
  });
}

function normalizeStored(parsed) {
  if (Array.isArray(parsed)) {
    return {
      works: parsed,
      votes: [],
      wishes: [],
      artist: { ...EMPTY_ARTIST },
      courses: [],
    };
  }
  if (!parsed || typeof parsed !== "object") {
    return {
      works: [],
      votes: [],
      wishes: [],
      artist: { ...EMPTY_ARTIST },
      courses: [],
    };
  }
  return {
    works: Array.isArray(parsed.works) ? parsed.works : [],
    votes: Array.isArray(parsed.votes) ? parsed.votes : [],
    wishes: Array.isArray(parsed.wishes) ? parsed.wishes : [],
    artist: normalizeArtist(parsed.artist),
    courses: Array.isArray(parsed.courses) ? parsed.courses : [],
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

  let existing = {
    works: [],
    votes: [],
    wishes: [],
    artist: { ...EMPTY_ARTIST },
    courses: [],
  };
  let prevRawText = null;
  const prev = await env.BUCKET.get(DATA);
  if (prev) {
    try {
      prevRawText = await prev.text();
      existing = normalizeStored(JSON.parse(prevRawText));
    } catch {
      prevRawText = null;
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
      artist: Object.prototype.hasOwnProperty.call(body, "artist")
        ? normalizeArtist(body.artist)
        : existing.artist,
      courses: Object.prototype.hasOwnProperty.call(body, "courses")
        ? Array.isArray(body.courses)
          ? body.courses
          : existing.courses
        : existing.courses,
    };
  } else {
    /** 訪客可更新投票／許願；不可改 works/artist/courses（避免未授權竄改作品、師資、課程資訊） */
    if (
      Object.prototype.hasOwnProperty.call(body, "works") ||
      Object.prototype.hasOwnProperty.call(body, "artist") ||
      Object.prototype.hasOwnProperty.call(body, "courses")
    ) {
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
          ? mergeVisitorVoteCounts(existing.votes, body.votes)
          : existing.votes
        : existing.votes,
      wishes: hasWishes
        ? Array.isArray(body.wishes)
          ? body.wishes
          : existing.wishes
        : existing.wishes,
      artist: existing.artist,
      courses: existing.courses,
    };
  }

  if (authenticated && prevRawText) {
    try {
      await env.BUCKET.put("data-prev.json", prevRawText, {
        httpMetadata: { contentType: "application/json" },
      });
    } catch { /* 備份失敗不中斷主流程 */ }
  }

  await env.BUCKET.put(DATA, JSON.stringify(merged), {
    httpMetadata: { contentType: "application/json" },
  });
  return j({ ok: true });
}
