import { useState, useCallback, useEffect, useRef } from "react";

const LS = {
  get: async (k) => {
    try {
      const v = localStorage.getItem(k);
      return v ? { value: v } : null;
    } catch {
      return null;
    }
  },
  set: async (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch (e) {
      console.warn(
        "[nectar-official] localStorage 寫入失敗：",
        e?.message || e,
      );
    }
  },
};

function pickStore() {
  if (typeof window === "undefined") return LS;
  const s = window.storage;
  if (s && typeof s.get === "function" && typeof s.set === "function") return s;
  return LS;
}
const LOCAL_STORE = pickStore();

/**
 * 是否將作品同步到 Cloudflare R2（/api/data、/api/upload）。
 * - 設 VITE_USE_REMOTE=false 強制只用 localStorage（本機或特殊部署）
 * - 設 VITE_USE_REMOTE=true 強制走遠端
 * - 未設定時：production build 預設走遠端（Pages 同網域即有 API）；開發模式預設 localStorage
 */
export function isRemoteSync() {
  const v = import.meta.env.VITE_USE_REMOTE;
  if (v === "false") return false;
  if (v === "true") return true;
  return import.meta.env.PROD;
}

function notifySaveFailed(message) {
  try {
    window.dispatchEvent(
      new CustomEvent("nectar-save-failed", { detail: { message } }),
    );
  } catch {
    /* ignore */
  }
}

export function apiPath(path) {
  const base = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

const ADMIN_SESSION_KEY = "nectar_admin_session";

let adminToken = null;

/** 開發時可於 .env 設 VITE_ADMIN_KEY 略過登入；正式站請勿設定，以免金鑰被打包 */
export function getAdminToken() {
  try {
    if (typeof window !== "undefined") {
      const ss = sessionStorage.getItem(ADMIN_SESSION_KEY);
      if (ss) return ss;
    }
  } catch {
    /* ignore */
  }
  if (import.meta.env.DEV && import.meta.env.VITE_ADMIN_KEY) {
    return import.meta.env.VITE_ADMIN_KEY;
  }
  return adminToken || "";
}

export function setAdminToken(t) {
  adminToken = t || null;
  try {
    if (typeof window === "undefined") return;
    if (t) sessionStorage.setItem(ADMIN_SESSION_KEY, t);
    else sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function clearAdminSession() {
  adminToken = null;
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

function authHeader() {
  const t = getAdminToken();
  if (!t) return {};
  return { Authorization: `Bearer ${t}` };
}

function notifyAdminUnauthorized() {
  try {
    clearAdminSession();
    window.dispatchEvent(new CustomEvent("nectar-admin-unauthorized"));
  } catch {
    /* ignore */
  }
}

/* ─── 雲端：data.json = { works, votes, wishes }；圖在 images/* ─── */
const LEGACY_V_KEY = "nectar-v3";
const LEGACY_WI_KEY = "nectar-wi3";

let memCloudData = null;
let loadPromise = null;

function normalizeArtist(a, fallback) {
  const fb = fallback || { portrait: "", signature: "" };
  if (!a || typeof a !== "object" || Array.isArray(a)) return { ...fb };
  return {
    portrait: typeof a.portrait === "string" ? a.portrait : fb.portrait || "",
    signature:
      typeof a.signature === "string" ? a.signature : fb.signature || "",
  };
}

function normalizeBundle(parsed, fallback) {
  const fbArtist = fallback.artist || { portrait: "", signature: "" };
  const fbCourses = Array.isArray(fallback.courses) ? fallback.courses : [];
  if (Array.isArray(parsed)) {
    return {
      works: parsed,
      votes: fallback.votes,
      wishes: fallback.wishes,
      artist: { ...fbArtist },
      courses: [...fbCourses],
    };
  }
  if (!parsed || typeof parsed !== "object") {
    return { ...fallback, artist: { ...fbArtist }, courses: [...fbCourses] };
  }
  return {
    works: Array.isArray(parsed.works) ? parsed.works : fallback.works,
    votes: Array.isArray(parsed.votes) ? parsed.votes : fallback.votes,
    wishes: Array.isArray(parsed.wishes) ? parsed.wishes : fallback.wishes,
    artist: normalizeArtist(parsed.artist, fbArtist),
    courses: Array.isArray(parsed.courses) ? parsed.courses : fbCourses,
  };
}

async function loadCloudBundleFromApi(fallback) {
  const r = await fetch(apiPath("/api/data"), { method: "GET" });
  if (r.status === 404) return { ...fallback };
  if (!r.ok) throw new Error(`GET /api/data ${r.status}`);
  const o = await r.json();
  return normalizeBundle(o, fallback);
}

function getInitBundle(k, initial) {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      if (!isRemoteSync()) {
        let b = { ...initial };
        const rw = await LOCAL_STORE.get(k);
        if (rw?.value) {
          try {
            b = normalizeBundle(JSON.parse(rw.value), b);
          } catch {
            /* ignore */
          }
        }
        const rv = await LOCAL_STORE.get(LEGACY_V_KEY);
        if (rv?.value) {
          try {
            const v = JSON.parse(rv.value);
            if (Array.isArray(v)) b.votes = v;
          } catch {
            /* ignore */
          }
        }
        const rwi = await LOCAL_STORE.get(LEGACY_WI_KEY);
        if (rwi?.value) {
          try {
            const wi = JSON.parse(rwi.value);
            if (Array.isArray(wi)) b.wishes = wi;
          } catch {
            /* ignore */
          }
        }
        return b;
      }
      return await loadCloudBundleFromApi(initial);
    } catch (e) {
      console.warn(
        "[nectar-official] 讀取雲端失敗，使用預設：",
        e?.message || e,
      );
      return { ...initial };
    } finally {
      loadPromise = null;
    }
  })();
  return loadPromise;
}

let saveT = 0;
const SAVE_DEBOUNCE_MS = 280;
let hasPendingChanges = false;
let lastVisitorWishesBody = "";

function scheduleSaveBundle(k) {
  hasPendingChanges = true;
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    void flushSaveBundle(k);
  }, SAVE_DEBOUNCE_MS);
}

/**
 * 取消 debounce、立刻寫回 R2 / localStorage（整包 { works, votes, wishes }）。
 * @param {string} worksKey
 * @param {unknown} [snapshotWorks] 若傳入，只更新 works（與 mem 合併，避免 setState 競態）
 */
export function forceFlushWorks(worksKey, snapshotWorks) {
  clearTimeout(saveT);
  if (snapshotWorks !== undefined) {
    memCloudData =
      memCloudData != null &&
      typeof memCloudData === "object" &&
      !Array.isArray(memCloudData)
        ? { ...memCloudData, works: snapshotWorks }
        : { works: snapshotWorks };
  }
  return flushSaveBundle(worksKey);
}

/**
 * 取消 debounce、立刻寫回當前 memCloudData（整包）。
 * 適用於非作品欄位的即時寫入（如 artist 肖像／簽名上傳），
 * 避免使用者上傳後馬上重新整理，造成 debounce 尚未 flush 的遺失。
 */
export function forceFlushBundle(bundleKey) {
  clearTimeout(saveT);
  return flushSaveBundle(bundleKey);
}

async function flushSaveBundle(worksKey) {
  if (!isRemoteSync()) {
    if (memCloudData === null) return;
    try {
      const r = LOCAL_STORE.set(worksKey, JSON.stringify(memCloudData));
      if (r && typeof r.catch === "function") r.catch(() => {});
      hasPendingChanges = false;
    } catch {
      /* ignore */
    }
    return;
  }
  if (memCloudData === null) return;
  const authed = Boolean(getAdminToken());
  /**
   * 訪客僅回寫 wishes。
   * votes 改走 /api/vote 的原子 delta 更新，避免「整包絕對值覆蓋」在併發下掉票。
   */
  const payload =
    authed || !memCloudData
      ? memCloudData
      : { wishes: memCloudData.wishes };
  const body = JSON.stringify(payload);
  if (!authed) {
    // 訪客模式下，投票已改走 /api/vote。若 wishes 無變更，直接略過 PUT /api/data。
    if (body === lastVisitorWishesBody) return;
  }
  try {
    const r = await fetch(apiPath("/api/data"), {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body,
      /** keepalive 讓 pagehide / 重整時的未完成寫入仍能送達（payload 需 <64KB） */
      keepalive: body.length < 60000,
    });
    if (r.status === 401) {
      console.warn("[nectar-official] 儲存失敗：未授權");
      if (authed) notifyAdminUnauthorized();
      return;
    }
    if (!r.ok) {
      const t = await r.text();
      console.warn("[nectar-official] 儲存失敗：", r.status, t);
      notifySaveFailed(
        `儲存失敗（HTTP ${r.status}）。${t ? t.slice(0, 240) : "請檢查 Network 與 Functions 日誌。"}`,
      );
      return;
    }
    if (!authed) lastVisitorWishesBody = body;
    hasPendingChanges = false;
  } catch (e) {
    console.warn("[nectar-official] 儲存失敗：", e?.message || e);
    notifySaveFailed(
      `無法連線儲存：${e?.message || e}。若為本機預覽請設 VITE_USE_REMOTE=false。`,
    );
  }
}

/** 圖片：雲端走 /api/upload；本機用 data URL */
export async function fileToImageRef(file) {
  if (!isRemoteSync()) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = () => rej(new Error("read fail"));
      r.readAsDataURL(file);
    });
  }
  const token = getAdminToken();
  if (!token) {
    throw new Error("請先以管理員身分登入後再上傳");
  }
  const fd = new FormData();
  fd.append("file", file, file.name || "image.jpg");
  const r = await fetch(apiPath("/api/upload"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (r.status === 401) {
    notifyAdminUnauthorized();
    throw new Error("上傳未授權，請重新登入");
  }
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `upload ${r.status}`);
  }
  const { url } = await r.json();
  return url;
}

/**
 * 訪客投票專用：以 delta（+1 / -1）原子更新單一選項票數，避免併發掉票。
 * 回傳最新票數，供前端與 UI 對齊。
 */
export async function voteDelta(id, delta) {
  const r = await fetch(apiPath("/api/vote"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, delta }),
    keepalive: true,
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `vote ${r.status}`);
  }
  return r.json();
}

/**
 * 盡力刪除 R2 中的舊圖（best-effort）。
 * - 本機模式（data URL）直接 return
 * - 後端只會刪同源 /api/file/images/* 的 key；外部 URL 會被忽略
 * - 刪除失敗不拋錯、不打擾主流程（孤兒圖可由未來 GC 清）
 */
export async function deleteImageRefs(urls) {
  if (!isRemoteSync()) return;
  const list = (Array.isArray(urls) ? urls : [urls]).filter(
    (u) => typeof u === "string" && u.length > 0,
  );
  if (list.length === 0) return;
  const token = getAdminToken();
  if (!token) return;
  try {
    await fetch(apiPath("/api/delete"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urls: list }),
    });
  } catch {
    /* 吞錯：圖片清理屬背景維運，不得中斷編輯流程 */
  }
}

/**
 * cloud: true 時同步整包 { works, votes, wishes } 至 R2 data.json（或單一 localStorage key）
 */
export function useP(k, initial, options = {}) {
  const cloud = options.cloud === true;
  const [s, setS] = useState(initial);
  /** 避免「遠端 GET 较慢」回來時覆蓋使用者已上傳／已編輯的 state */
  const remoteLoadGen = useRef(0);

  useEffect(() => {
    if (cloud) {
      const genAtFetchStart = remoteLoadGen.current;
      void (async () => {
        const w = await getInitBundle(k, initial);
        if (remoteLoadGen.current !== genAtFetchStart) return;
        memCloudData = w;
        setS(w);
      })();
    } else {
      void (async () => {
        try {
          const r = await LOCAL_STORE.get(k);
          if (r?.value) setS(JSON.parse(r.value));
        } catch {
          /* 忽略 */
        }
      })();
    }
  }, [k, cloud, initial]);

  useEffect(() => {
    if (!cloud || typeof window === "undefined" || !isRemoteSync()) return;
    const flush = () => {
      if (!hasPendingChanges) return;
      clearTimeout(saveT);
      void flushSaveBundle(k);
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [k, cloud]);

  const set = useCallback(
    (fn) => {
      if (cloud) remoteLoadGen.current += 1;
      setS((p) => {
        const n = typeof fn === "function" ? fn(p) : fn;
        if (cloud) {
          memCloudData = n;
          scheduleSaveBundle(k);
        } else {
          try {
            const r = LOCAL_STORE.set(k, JSON.stringify(n));
            if (r && typeof r.catch === "function") r.catch(() => {});
          } catch {
            /* 忽略 */
          }
        }
        return n;
      });
    },
    [k, cloud],
  );
  return [s, set];
}
