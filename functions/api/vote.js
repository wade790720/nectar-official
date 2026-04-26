const DATA = "data.json";
const EMPTY_ARTIST = { portrait: "", signature: "" };

function j(body, s = 200) {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status: s,
    headers: { "Content-Type": "application/json" },
  });
}

function normalizeArtist(a) {
  if (!a || typeof a !== "object" || Array.isArray(a))
    return { ...EMPTY_ARTIST };
  return {
    portrait: typeof a.portrait === "string" ? a.portrait : "",
    signature: typeof a.signature === "string" ? a.signature : "",
  };
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

export async function onRequestPost({ request, env }) {
  if (request.method !== "POST") return j({ error: "Method not allowed" }, 405);
  let body;
  try {
    body = await request.json();
  } catch {
    return j({ error: "Bad JSON" }, 400);
  }
  const id = body?.id != null ? String(body.id) : "";
  if (!id) return j({ error: "id is required" }, 400);

  let existing = {
    works: [],
    votes: [],
    wishes: [],
    artist: { ...EMPTY_ARTIST },
    courses: [],
  };
  const prev = await env.BUCKET.get(DATA);
  if (prev) {
    try {
      existing = normalizeStored(JSON.parse(await prev.text()));
    } catch {
      /* ignore */
    }
  }

  let nextVoteCount = null;
  const votes = (existing.votes || []).map((v) => {
    if (!v || String(v.id) !== id) return v;
    const next = Math.max(0, Math.floor((Number(v.votes) || 0) + 1));
    nextVoteCount = next;
    return { ...v, votes: next };
  });
  if (nextVoteCount == null) return j({ error: "Vote option not found" }, 404);

  const merged = { ...existing, votes };
  await env.BUCKET.put(DATA, JSON.stringify(merged), {
    httpMetadata: { contentType: "application/json" },
  });
  return j({ ok: true, id, votes: nextVoteCount });
}
