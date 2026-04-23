import { useState, useCallback, useEffect } from "react";

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
      console.warn("[nectar-official] localStorage 寫入失敗：", e?.message || e);
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

/** 僅在 build 時設為 "true" 才會在正式站走 Cloudflare R2 + Functions */
export function isRemoteSync() {
  return import.meta.env.VITE_USE_REMOTE === "true";
}

function apiPath(path) {
  const base = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

let adminToken = null;
export function setAdminToken(t) {
  adminToken = t;
}

function authHeader() {
  const t = adminToken || import.meta.env.VITE_ADMIN_KEY || "";
  if (!t) return {};
  return { Authorization: `Bearer ${t}` };
}

/* ─── 雲端：作品、主 JSON 存在 R2 data.json，圖在 images/*，GET /api/file/... 讀取 ─── */
let memWorks = null;
let loadPromise = null;

async function loadWorksDefault(fallback) {
  const r = await fetch(apiPath("/api/data"), { method: "GET" });
  if (r.status === 404) return fallback;
  if (!r.ok) throw new Error(`GET /api/data ${r.status}`);
  const o = await r.json();
  if (o && o.works && Array.isArray(o.works)) return o.works;
  return fallback;
}

function getInitWorks(k, initial) {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      if (!isRemoteSync()) {
        const r = await LOCAL_STORE.get(k);
        if (r?.value) {
          try {
            return JSON.parse(r.value);
          } catch {
            return initial;
          }
        }
        return initial;
      }
      return await loadWorksDefault(initial);
    } catch (e) {
      console.warn("[nectar-official] 讀取雲端失敗，使用預設：", e?.message || e);
      return initial;
    } finally {
      loadPromise = null;
    }
  })();
  return loadPromise;
}

let saveT = 0;
function scheduleSaveWorks(k) {
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    void flushSaveWorks(k);
  }, 650);
}

async function flushSaveWorks(worksKey) {
  if (!isRemoteSync()) {
    const j = memWorks;
    if (j === null) return;
    try {
      const r = LOCAL_STORE.set(worksKey, JSON.stringify(j));
      if (r && typeof r.catch === "function") r.catch(() => {});
    } catch {}
    return;
  }
  if (memWorks === null) return;
  const body = JSON.stringify({ works: memWorks });
  try {
    const r = await fetch(apiPath("/api/data"), {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body,
    });
    if (r.status === 401) {
      console.warn("[nectar-official] 儲存失敗：未授權（檢查 VITE_ADMIN_KEY 與 Cloudflare ADMIN_SECRET 是否一致）");
      return;
    }
    if (!r.ok) {
      const t = await r.text();
      console.warn("[nectar-official] 儲存失敗：", r.status, t);
    }
  } catch (e) {
    console.warn("[nectar-official] 儲存失敗：", e?.message || e);
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
  const token = import.meta.env.VITE_ADMIN_KEY || adminToken;
  if (!token) {
    throw new Error("需設定 VITE_ADMIN_KEY 與佈署端 ADMIN_SECRET 才能上傳圖");
  }
  const fd = new FormData();
  fd.append("file", file, file.name || "image.jpg");
  const r = await fetch(apiPath("/api/upload"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (r.status === 401) throw new Error("上傳未授權");
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `upload ${r.status}`);
  }
  const { url } = await r.json();
  return url;
}

/**
 * 僅用於作品列表（cloud storage key）：雲端 = R2；其餘 = localStorage
 */
export function useP(k, initial, options = {}) {
  const cloud = options.cloud === true;
  const [s, setS] = useState(initial);

  useEffect(() => {
    if (cloud) {
      void (async () => {
        const w = await getInitWorks(k, initial);
        memWorks = w;
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

  const set = useCallback(
    (fn) => {
      setS((p) => {
        const n = typeof fn === "function" ? fn(p) : fn;
        if (cloud) {
          memWorks = n;
          scheduleSaveWorks(k);
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
    [k, cloud]
  );
  return [s, set];
}
