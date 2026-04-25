import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  useP,
  fileToImageRef,
  deleteImageRefs,
  getAdminToken,
  setAdminToken,
  clearAdminSession,
  apiPath,
  forceFlushWorks,
  forceFlushBundle,
} from "./persist.js";
import { useI18n } from "./i18n.jsx";
import { SK, DW, DV, DC } from "./config/content.js";
import { normalizeSocialUrl } from "./utils/social.js";
import {
  collectWorkImageRefs,
  diffImageRefs,
  removeWorkImageAtThumbIndex,
} from "./utils/workGallery.js";
import { SocialContactChips } from "./components/SocialContactChips.jsx";
import { Detail } from "./components/DetailLightbox.jsx";
import { Fld, FldArea, lb } from "./components/FormFields.jsx";
import { Cam } from "./components/icons/Icons.jsx";
import { useConfirm } from "./components/ConfirmDialog.jsx";
import { EMPTY_WORK, HomePage } from "./pages/HomePage.jsx";
import { VotePage } from "./pages/VotePage.jsx";
import { AboutPage } from "./pages/AboutPage.jsx";
import { GalleryPage } from "./pages/GalleryPage.jsx";

/**
 * NectarApp — site shell: persisted bundle, navigation, admin tools, and routing.
 * Pages: home → HomePage, about → AboutPage, gallery → GalleryPage, vote → VotePage.
 */
/**
 * Path ↔ pg 映射：集中在這裡，避免散落。
 * 不存在的路徑一律視為 home，由下方 <Route path="*"> 做 redirect。
 */
const PATH_TO_PG = {
  "/": "home",
  "/about": "about",
  "/gallery": "gallery",
  "/vote": "vote",
};
function pathToPg(pathname) {
  if (!pathname || pathname === "/" || pathname === "") return "home";
  const base = pathname.replace(/\/+$/, "") || "/";
  return PATH_TO_PG[base] || "home";
}

export default function NectarApp() {
  const { t, locale, setLocale } = useI18n();
  const confirm = useConfirm();
  const location = useLocation();
  const navigate = useNavigate();
  const pg = useMemo(() => pathToPg(location.pathname), [location.pathname]);
  const goto = useCallback(
    (path) => {
      if (location.pathname !== path) navigate(path);
    },
    [navigate, location.pathname],
  );
  const bundleInit = useMemo(
    () => ({
      works: DW,
      votes: DV,
      wishes: [],
      artist: { portrait: "", signature: "" },
      courses: DC,
    }),
    [],
  );
  const [bundle, setBundle] = useP(SK.w, bundleInit, { cloud: true });
  const works = bundle.works;
  const votes = bundle.votes;
  const wishes = bundle.wishes;
  const artist = bundle.artist || { portrait: "", signature: "" };
  const courses = useMemo(
    () => (Array.isArray(bundle.courses) ? bundle.courses : []),
    [bundle.courses],
  );
  const setW = useCallback(
    (u) =>
      setBundle((d) => ({
        ...d,
        works: typeof u === "function" ? u(d.works) : u,
      })),
    [setBundle],
  );
  const setVotes = useCallback(
    (u) =>
      setBundle((d) => ({
        ...d,
        votes: typeof u === "function" ? u(d.votes) : u,
      })),
    [setBundle],
  );
  const setWishes = useCallback(
    (u) =>
      setBundle((d) => ({
        ...d,
        wishes: typeof u === "function" ? u(d.wishes) : u,
      })),
    [setBundle],
  );
  const setArtist = useCallback(
    (u) =>
      setBundle((d) => {
        const prev = d.artist || { portrait: "", signature: "" };
        return {
          ...d,
          artist: typeof u === "function" ? u(prev) : u,
        };
      }),
    [setBundle],
  );
  const setCourses = useCallback(
    (u) =>
      setBundle((d) => {
        const prev = Array.isArray(d.courses) ? d.courses : [];
        return {
          ...d,
          courses: typeof u === "function" ? u(prev) : u,
        };
      }),
    [setBundle],
  );
  const [ed, setEd] = useState(null);
  const [modal, setMo] = useState(false);
  const [detail, setDt] = useState(null);
  const [wiIn, setWiIn] = useState("");
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [loginPwd, setLoginPwd] = useState("");
  const [loginErr, setLoginErr] = useState(false);
  /**
   * 裝置級「已投」記錄：持久化到 localStorage，避免重整後重投。
   * - key 僅存 voteOption.id → true 的 map
   * - 換裝置／清 cookies／無痕視窗仍能再投，這不是防刷票機制，
   *   僅防誠實訪客刷新後重複投同一選項
   * - admin 重設全票時會連同清掉本地記錄（見 onResetVotes）
   */
  const [voted, setVd] = useState(() => {
    try {
      if (typeof window === "undefined") return {};
      const raw = localStorage.getItem("nectar_voted_v1");
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("nectar_voted_v1", JSON.stringify(voted));
    } catch {
      /* quota 滿就吞掉，不阻斷投票流程 */
    }
  }, [voted]);
  const [newlyAddedVoteId, setNewlyAddedVoteId] = useState(null);
  const [newlyAddedCourseId, setNewlyAddedCourseId] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [ho, setHo] = useState(false);
  const [co, setCo] = useState(false);
  const socialIg = normalizeSocialUrl(
    import.meta.env.VITE_SOCIAL_INSTAGRAM || "",
  );
  const socialFb = normalizeSocialUrl(
    import.meta.env.VITE_SOCIAL_FACEBOOK || "",
  );
  const contactMail = (import.meta.env.VITE_CONTACT_EMAIL || "").trim();

  useEffect(() => {
    const root = document.documentElement;
    if (pg === "home") root.classList.add("home-scroll-snap");
    else root.classList.remove("home-scroll-snap");
    return () => root.classList.remove("home-scroll-snap");
  }, [pg]);

  /**
   * Route-change side effects：
   *  - scroll 回頁首（instant，避免使用者切頁後還在上一頁位置）
   *  - 收合行動選單、關閉 DetailLightbox，避免浮層殘留
   */
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setMobileNavOpen(false);
    setDt(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const raw = window.location.hash.replace(/^#\/?/, "");
    if (raw === "nectar-admin") {
      setLoginErr(false);
      setAdminLoginOpen(true);
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }, []);

  useEffect(() => {
    setAdminAuthed(!!getAdminToken());
  }, []);
  useEffect(() => {
    const onUnauth = () => {
      setAdminAuthed(false);
    };
    window.addEventListener("nectar-admin-unauthorized", onUnauth);
    return () =>
      window.removeEventListener("nectar-admin-unauthorized", onUnauth);
  }, []);
  useEffect(() => {
    const onSaveFail = (e) => {
      const msg = e.detail?.message;
      if (msg) window.alert(msg);
    };
    window.addEventListener("nectar-save-failed", onSaveFail);
    return () => window.removeEventListener("nectar-save-failed", onSaveFail);
  }, []);
  useEffect(() => {
    setTimeout(() => setHo(true), 200);
    setTimeout(() => setCo(true), 600);
  }, []);
  useEffect(() => {
    setCo(false);
    setTimeout(() => setCo(true), 250);
  }, [pg]);

  const doV = (id) => {
    /** Toggle: first click casts the vote, a second click retracts it. */
    const already = !!voted[id];
    setVotes((p) =>
      p.map((f) => {
        if (f.id !== id) return f;
        const next = already ? f.votes - 1 : f.votes + 1;
        return { ...f, votes: Math.max(0, next) };
      }),
    );
    setVd((p) => {
      const n = { ...p };
      if (already) delete n[id];
      else n[id] = true;
      return n;
    });
  };
  const doWi = () => {
    if (!wiIn.trim()) return;
    setWishes((p) => {
      const next = [...p, { id: Date.now().toString(), text: wiIn.trim() }];
      queueMicrotask(() => void forceFlushBundle(SK.w));
      return next;
    });
    setWiIn("");
  };
  const deleteWish = async (id) => {
    const ok = await confirm({
      title: t("confirmTitleDestructive"),
      message: t("wishDeleteConfirm"),
      confirmLabel: t("confirmDelete"),
      cancelLabel: t("confirmCancel"),
      tone: "danger",
    });
    if (!ok) return;
    setWishes((p) => {
      const next = p.filter((w) => w.id !== id);
      queueMicrotask(() => void forceFlushBundle(SK.w));
      return next;
    });
  };
  const doVoteImg = async (id, file) => {
    if (!file) return;
    try {
      const prev = votes.find((x) => x.id === id)?.image || "";
      const ref = await fileToImageRef(file);
      setVotes((p) => {
        const next = p.map((x) => (x.id === id ? { ...x, image: ref } : x));
        /** 上傳是 admin 明確動作，若等 280ms debounce 再寫回，admin 馬上重整／切頁會遺失 */
        queueMicrotask(() => void forceFlushBundle(SK.w));
        return next;
      });
      if (prev && prev !== ref) void deleteImageRefs([prev]);
    } catch (e) {
      console.error(e);
      window.alert((e && e.message) || "圖片上傳失敗");
    }
  };
  const saveVoteNames = (id, { name, en }) => {
    setVotes((p) => {
      const next = p.map((x) => (x.id === id ? { ...x, name, en } : x));
      queueMicrotask(() => void forceFlushBundle(SK.w));
      return next;
    });
  };
  const toggleVoteHidden = (id) => {
    setVotes((p) => {
      const next = p.map((x) =>
        x.id === id ? { ...x, hidden: !x.hidden } : x,
      );
      queueMicrotask(() => void forceFlushBundle(SK.w));
      return next;
    });
  };
  const deleteVoteOption = async (id) => {
    const ok = await confirm({
      title: t("confirmTitleDestructive"),
      message: t("voteRemoveOptionConfirm"),
      confirmLabel: t("confirmDelete"),
      cancelLabel: t("confirmCancel"),
      tone: "danger",
    });
    if (!ok) return;
    const orphan = votes.find((x) => x.id === id)?.image || "";
    setVotes((p) => {
      const next = p.filter((x) => x.id !== id);
      queueMicrotask(() => void forceFlushBundle(SK.w));
      return next;
    });
    setVd((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
    if (orphan) void deleteImageRefs([orphan]);
  };
  const addVoteOption = () => {
    /** 預設 hidden=true，強制 admin 填入名稱／圖片後才會對訪客顯示 */
    const id = Date.now().toString();
    setVotes((p) => {
      const next = [
        ...p,
        {
          id,
          name: "",
          en: "",
          emoji: "✿",
          votes: 0,
          image: "",
          hidden: true,
        },
      ];
      queueMicrotask(() => void forceFlushBundle(SK.w));
      return next;
    });
    setNewlyAddedVoteId(id);
    window.setTimeout(() => {
      setNewlyAddedVoteId((cur) => (cur === id ? null : cur));
    }, 2200);
  };

  /* ─── 課程影像集（課程 Gallery）CRUD ─── */
  const addCourse = () => {
    const id = `c${Date.now()}`;
    setCourses((p) => {
      const next = [...p, { id, name: "", en: "", image: "" }];
      queueMicrotask(() => void forceFlushBundle(SK.w));
      return next;
    });
    setNewlyAddedCourseId(id);
    window.setTimeout(() => {
      setNewlyAddedCourseId((cur) => (cur === id ? null : cur));
    }, 2200);
  };
  const saveCourseNames = (id, { name, en }) => {
    setCourses((p) => {
      const next = p.map((x) => (x.id === id ? { ...x, name, en } : x));
      queueMicrotask(() => void forceFlushBundle(SK.w));
      return next;
    });
  };
  const uploadCourseImage = async (id, file) => {
    if (!file) return;
    try {
      const prev = courses.find((x) => x.id === id)?.image || "";
      const ref = await fileToImageRef(file);
      setCourses((p) => {
        const next = p.map((x) => (x.id === id ? { ...x, image: ref } : x));
        queueMicrotask(() => void forceFlushBundle(SK.w));
        return next;
      });
      if (prev && prev !== ref) void deleteImageRefs([prev]);
    } catch (e) {
      console.error(e);
      window.alert((e && e.message) || "圖片上傳失敗");
    }
  };
  const deleteCourse = async (id) => {
    const ok = await confirm({
      title: t("confirmTitleDestructive"),
      message: t("galleryCourseDeleteConfirm"),
      confirmLabel: t("confirmDelete"),
      cancelLabel: t("confirmCancel"),
      tone: "danger",
    });
    if (!ok) return;
    const orphan = courses.find((x) => x.id === id)?.image || "";
    setCourses((p) => {
      const next = p.filter((x) => x.id !== id);
      queueMicrotask(() => void forceFlushBundle(SK.w));
      return next;
    });
    if (orphan) void deleteImageRefs([orphan]);
  };
  const doSv = (w) => {
    const prevWork = w.id ? works.find((x) => x.id === w.id) : null;
    const orphans = prevWork
      ? diffImageRefs(collectWorkImageRefs(prevWork), collectWorkImageRefs(w))
      : [];
    const next = prevWork
      ? works.map((x) => (x.id === w.id ? w : x))
      : [...works, { ...w, id: Date.now().toString() }];
    setW(next);
    setMo(false);
    setEd(null);
    void forceFlushWorks(SK.w, next);
    if (orphans.length) void deleteImageRefs(orphans);
  };
  const tryAdminLogin = async () => {
    if (!loginPwd.trim()) return;
    try {
      const r = await fetch(apiPath("/api/admin/verify"), {
        method: "POST",
        headers: { Authorization: `Bearer ${loginPwd.trim()}` },
      });
      if (r.ok) {
        setAdminToken(loginPwd.trim());
        setAdminAuthed(true);
        setAdminLoginOpen(false);
        setLoginPwd("");
        setLoginErr(false);
      } else {
        setLoginErr(true);
      }
    } catch {
      setLoginErr(true);
    }
  };
  const doDl = async (id) => {
    const ok = await confirm({
      title: t("confirmTitleDestructive"),
      message: t("workDeleteConfirm"),
      confirmLabel: t("confirmDelete"),
      cancelLabel: t("confirmCancel"),
      tone: "danger",
    });
    if (!ok) return;
    const work = works.find((x) => x.id === id);
    const orphans = work ? collectWorkImageRefs(work) : [];
    const next = works.filter((x) => x.id !== id);
    setW(next);
    void forceFlushWorks(SK.w, next);
    if (orphans.length) void deleteImageRefs(orphans);
  };
  const doUp = async (wid, f) => {
    try {
      const prev = works.find((x) => x.id === wid)?.image || "";
      const ref = await fileToImageRef(f);
      setW((p) => {
        const next = p.map((w) => (w.id === wid ? { ...w, image: ref } : w));
        void forceFlushWorks(SK.w, next);
        return next;
      });
      if (prev && prev !== ref) void deleteImageRefs([prev]);
    } catch (e) {
      console.error(e);
      window.alert((e && e.message) || "主圖上傳失敗");
    }
  };
  /**
   * 圖庫一次可多檔。舊版在迴圈內多次 setW + await，React 佇列的 updater 之間
   * 讀到舊的 gallery，導致只保留最後一張。改為上傳完**一次**寫入，並同步
   * lightbox 的 detail，否則彈窗內 work 是舊物件，不重整看不到新圖。
   */
  const doGal = async (wid, files) => {
    const fileArr = [...(files || [])].filter(Boolean);
    if (fileArr.length === 0) return;
    const refs = [];
    for (const f of fileArr) {
      try {
        refs.push(await fileToImageRef(f));
      } catch (e) {
        console.error(e);
        window.alert((e && e.message) || "圖庫上傳失敗");
        throw e;
      }
    }
    setW((p) => {
      const next = p.map((w) =>
        w.id === wid
          ? { ...w, gallery: [...(w.gallery || []), ...refs] }
          : w,
      );
      queueMicrotask(() => void forceFlushWorks(SK.w, next));
      return next;
    });
    setDt((d) => {
      if (!d || d.id !== wid) return d;
      return { ...d, gallery: [...(d.gallery || []), ...refs] };
    });
  };
  const moveWork = (id, direction) => {
    setW((p) => {
      const i = p.findIndex((w) => w.id === id);
      if (i < 0) return p;
      const j = i + direction;
      if (j < 0 || j >= p.length) return p;
      const next = [...p];
      [next[i], next[j]] = [next[j], next[i]];
      queueMicrotask(() => void forceFlushWorks(SK.w, next));
      return next;
    });
  };
  const doRmGal = (wid, thumbIdx) => {
    const w = works.find((x) => x.id === wid);
    if (!w) return;
    const nextW = removeWorkImageAtThumbIndex(w, thumbIdx);
    const orphans = diffImageRefs(
      collectWorkImageRefs(w),
      collectWorkImageRefs(nextW),
    );
    const next = works.map((x) => (x.id === wid ? nextW : x));
    setW(next);
    setDt((d) => (d && d.id === wid ? nextW : d));
    void forceFlushWorks(SK.w, next);
    if (orphans.length) void deleteImageRefs(orphans);
  };

  const doArtistImg = async (field, file) => {
    if (!file) return;
    try {
      const prev = artist[field] || "";
      const ref = await fileToImageRef(file);
      setArtist((p) => {
        const next = { ...p, [field]: ref };
        /** flush 內層更新後的完整 bundle（用 updater 回傳值同步到 memCloudData 後再觸發） */
        queueMicrotask(() => void forceFlushBundle(SK.w));
        return next;
      });
      if (prev && prev !== ref) void deleteImageRefs([prev]);
    } catch (e) {
      console.error(e);
      window.alert((e && e.message) || "上傳失敗");
    }
  };
  const doArtistPortrait = (f) => doArtistImg("portrait", f);
  const doArtistSignature = (f) => doArtistImg("signature", f);
  const removeArtistPortrait = async () => {
    const prev = artist.portrait || "";
    if (!prev) return;
    const ok = await confirm({
      title: t("confirmTitleDestructive"),
      message: t("aboutArtistRemovePortraitConfirm"),
      confirmLabel: t("confirmDelete"),
      cancelLabel: t("confirmCancel"),
      tone: "danger",
    });
    if (!ok) return;
    setArtist((p) => {
      const next = { ...p, portrait: "" };
      queueMicrotask(() => void forceFlushBundle(SK.w));
      return next;
    });
    void deleteImageRefs([prev]);
  };
  const removeArtistSignature = async () => {
    const prev = artist.signature || "";
    if (!prev) return;
    const ok = await confirm({
      title: t("confirmTitleDestructive"),
      message: t("aboutArtistRemoveSignatureConfirm"),
      confirmLabel: t("confirmDelete"),
      cancelLabel: t("confirmCancel"),
      tone: "danger",
    });
    if (!ok) return;
    setArtist((p) => {
      const next = { ...p, signature: "" };
      queueMicrotask(() => void forceFlushBundle(SK.w));
      return next;
    });
    void deleteImageRefs([prev]);
  };

  return (
    <div
      className="app-root"
      style={{
        background: "#080706",
        color: "#F5F0EB",
        fontFamily: "'Noto Serif TC','Instrument Serif',Georgia,serif",
      }}
    >
      {/* NAV — quiet, hairline-bottomed, lets the work breathe above it */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background:
            "linear-gradient(180deg, rgba(6,5,4,0.72) 0%, rgba(6,5,4,0.32) 70%, rgba(6,5,4,0) 100%)",
          backdropFilter: "blur(18px) saturate(1.1)",
          WebkitBackdropFilter: "blur(18px) saturate(1.1)",
          borderBottom: "1px solid rgba(201,169,110,0.04)",
        }}
      >
        <div className="nav-row">
          <button
            type="button"
            className="nav-brand-hit"
            onClick={() => {
              setMobileNavOpen(false);
              setDt(null);
              if (location.pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                navigate("/");
              }
            }}
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 13,
              fontStyle: "italic",
              color: "rgba(250,247,242,0.92)",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "color var(--dur-short) var(--ease-editorial)",
            }}
            title={t("navCollection")}
          >
            {t("navBrand")}
          </button>
          <div className="nav-links">
            <button
              type="button"
              className={`nb ${pg === "about" ? "on" : ""}`}
              onClick={() => goto("/about")}
            >
              {t("navAbout")}
            </button>
            <button
              type="button"
              className={`nb ${pg === "gallery" ? "on" : ""}`}
              onClick={() => goto("/gallery")}
            >
              {t("navGallery")}
            </button>
            <button
              type="button"
              className={`nb ${pg === "vote" ? "on" : ""}`}
              onClick={() => goto("/vote")}
            >
              {t("navVote")}
            </button>
            <a
              className="nb nb-ext"
              href="https://yellow510.kaik.io/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{t("navCourse")}</span>
              <span className="nb-ext-arr" aria-hidden="true">
                ↗
              </span>
            </a>
            <div
              className="nav-lang-btns"
              style={{ display: "flex", gap: 8, alignItems: "center" }}
            >
              <button
                type="button"
                onClick={() => setLocale("en")}
                style={{
                  background:
                    locale === "en" ? "rgba(201,169,110,0.15)" : "none",
                  border: "1px solid rgba(201,169,110,0.12)",
                  color: locale === "en" ? "#C9A96E" : "rgba(245,240,235,0.35)",
                  padding: "4px 10px",
                  fontSize: 11,
                  fontFamily: "'Instrument Serif',serif",
                  cursor: "pointer",
                  borderRadius: 6,
                }}
              >
                {t("langEn")}
              </button>
              <button
                type="button"
                onClick={() => setLocale("zh-TW")}
                style={{
                  background:
                    locale === "zh-TW" ? "rgba(201,169,110,0.15)" : "none",
                  border: "1px solid rgba(201,169,110,0.12)",
                  color:
                    locale === "zh-TW" ? "#C9A96E" : "rgba(245,240,235,0.35)",
                  padding: "4px 10px",
                  fontSize: 11,
                  fontFamily: "'Instrument Serif',serif",
                  cursor: "pointer",
                  borderRadius: 6,
                }}
              >
                {t("langZh")}
              </button>
            </div>
          </div>
          <button
            type="button"
            className={`nav-menu-btn ${mobileNavOpen ? "is-open" : ""}`}
            aria-label={mobileNavOpen ? t("navCloseMenu") : t("navOpenMenu")}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            <span className="nav-menu-line" />
            <span className="nav-menu-line" />
          </button>
        </div>
      </nav>

      <div
        className={`nav-overlay ${mobileNavOpen ? "is-open" : ""}`}
        aria-hidden={!mobileNavOpen}
      >
        <div className="nav-overlay-panel">
          <button
            type="button"
            className="nav-overlay-link"
            onClick={() => goto("/about")}
          >
            {t("navAbout")}
          </button>
          <button
            type="button"
            className="nav-overlay-link"
            onClick={() => goto("/gallery")}
          >
            {t("navGallery")}
          </button>
          <button
            type="button"
            className="nav-overlay-link"
            onClick={() => goto("/vote")}
          >
            {t("navVote")}
          </button>
          <a
            className="nav-overlay-link nav-overlay-ext"
            href="https://yellow510.kaik.io/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileNavOpen(false)}
          >
            <span>{t("navCourse")}</span>
            <span aria-hidden="true">↗</span>
          </a>
          <div className="nav-overlay-lang">
            <span className="nav-overlay-lang-label">{t("navLanguage")}</span>
            <div className="nav-overlay-lang-btns">
              <button
                type="button"
                className={`nav-overlay-lang-btn ${locale === "en" ? "is-active" : ""}`}
                onClick={() => setLocale("en")}
              >
                {t("langEn")}
              </button>
              <span className="nav-overlay-lang-sep" aria-hidden="true">
                /
              </span>
              <button
                type="button"
                className={`nav-overlay-lang-btn ${locale === "zh-TW" ? "is-active" : ""}`}
                onClick={() => setLocale("zh-TW")}
              >
                {t("langZh")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 訪客不可見：右下角隱藏區開啟後台登入；已登入則顯示登出 */}
      {!adminAuthed ? (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => {
            setLoginErr(false);
            setAdminLoginOpen(true);
          }}
          style={{
            position: "fixed",
            right: 0,
            bottom: 0,
            width: 56,
            height: 56,
            padding: 0,
            margin: 0,
            border: "none",
            background: "transparent",
            opacity: 0,
            zIndex: 60,
            cursor: "pointer",
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            clearAdminSession();
            setAdminAuthed(false);
          }}
          className="admin-out"
          style={{
            position: "fixed",
            zIndex: 60,
            background: "rgba(8,7,6,0.75)",
            border: "1px solid rgba(201,169,110,0.25)",
            color: "rgba(201,169,110,0.85)",
            padding: "6px 12px",
            fontSize: 10,
            letterSpacing: "0.12em",
            fontFamily: "'Instrument Serif',serif",
            fontStyle: "italic",
            cursor: "pointer",
            borderRadius: 20,
            backdropFilter: "blur(8px)",
          }}
        >
          {t("navExitAdmin")}
        </button>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              works={works}
              admin={adminAuthed}
              onOpenEditor={(w) => {
                setEd(w);
                setMo(true);
              }}
              onDeleteWork={doDl}
              onUploadCover={doUp}
              onOpenDetail={setDt}
            />
          }
        />
        <Route
          path="/about"
          element={
            <AboutPage
              socialIg={socialIg}
              contactMail={contactMail}
              artist={artist}
              admin={adminAuthed}
              onUploadPortrait={doArtistPortrait}
              onUploadSignature={doArtistSignature}
              onRemovePortrait={removeArtistPortrait}
              onRemoveSignature={removeArtistSignature}
            />
          }
        />
        <Route
          path="/gallery"
          element={
            <GalleryPage
              works={works}
              courses={courses}
              admin={adminAuthed}
              onOpenDetail={setDt}
              onMoveWork={moveWork}
              onAddCourse={addCourse}
              onSaveCourseNames={saveCourseNames}
              onUploadCourseImage={uploadCourseImage}
              onDeleteCourse={deleteCourse}
              onAddArtwork={() => {
                setEd({ ...EMPTY_WORK });
                setMo(true);
              }}
              newlyAddedCourseId={newlyAddedCourseId}
            />
          }
        />
        <Route
          path="/vote"
          element={
            <VotePage
              votes={votes}
              wishes={wishes}
              voted={voted}
              voteFor={doV}
              onVoteImg={doVoteImg}
              onSaveNames={saveVoteNames}
              onToggleHidden={toggleVoteHidden}
              onDeleteOption={deleteVoteOption}
              onAddOption={addVoteOption}
              newlyAddedVoteId={newlyAddedVoteId}
              onResetVotes={async () => {
                const ok = await confirm({
                  title: t("confirmTitleDestructive"),
                  message: t("wishResetConfirm"),
                  confirmLabel: t("confirmReset"),
                  cancelLabel: t("confirmCancel"),
                  tone: "danger",
                });
                if (!ok) return;
                setVotes((p) => p.map((x) => ({ ...x, votes: 0 })));
                setVd({});
              }}
              wiIn={wiIn}
              onWiInChange={setWiIn}
              onSubmitWish={doWi}
              onDeleteWish={deleteWish}
              headerIn={ho}
              cardsIn={co}
              admin={adminAuthed}
            />
          }
        />
        {/* 404：任何未知路徑一律 301-like 導回首頁，避免死連結 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Detail Lightbox */}
      {detail && (
        <Detail
          work={detail}
          onClose={() => setDt(null)}
          admin={adminAuthed}
          onUploadGallery={doGal}
          onRemoveImage={doRmGal}
          socialIg={socialIg}
          socialFb={socialFb}
          contactMail={contactMail}
        />
      )}

      {/* Edit Modal */}
      {modal && ed && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(20px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 0.2s",
          }}
        >
          <div
            className="modal-sheet"
            style={{
              background: "rgba(28,25,23,0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(201,169,110,0.1)",
              borderRadius: 8,
              animation: "fu 0.3s",
              overflowY: "auto",
            }}
          >
            <div style={{ marginBottom: 36 }}>
              <h3
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 24,
                  fontStyle: "italic",
                  fontWeight: 400,
                }}
              >
                {ed.id && works.find((x) => x.id === ed.id)
                  ? t("modalEdit")
                  : t("modalNew")}
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <Fld
                l={t("modalName")}
                v={ed.title}
                c={(v) => setEd({ ...ed, title: v })}
                ph="永生花・粉霧玫瑰"
              />
              <Fld
                l={t("modalNameEn")}
                v={ed.en || ""}
                c={(v) => setEd({ ...ed, en: v })}
                ph="Preserved Rose — Blush Mist"
              />
              <div className="modal-grid-2">
                <Fld
                  l={t("modalPrice")}
                  v={ed.price}
                  c={(v) => setEd({ ...ed, price: Number(v) })}
                  tp="number"
                />
                <Fld
                  l={t("modalCat")}
                  v={ed.cat}
                  c={(v) => setEd({ ...ed, cat: v })}
                  ph="永生花"
                />
              </div>
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    fontSize: 13,
                    color: "rgba(245,240,235,0.75)",
                    fontFamily: "'Noto Serif TC',serif",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!ed.soldOut}
                    onChange={(e) =>
                      setEd({ ...ed, soldOut: e.target.checked })
                    }
                    style={{ width: 18, height: 18, accentColor: "#C9A96E" }}
                  />
                  {t("modalSoldOut")}
                </label>
                <p
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: "rgba(201,169,110,0.35)",
                    lineHeight: 1.5,
                    fontFamily: "'Instrument Serif',serif",
                    fontStyle: "italic",
                  }}
                >
                  {t("modalSoldOutHint")}
                </p>
              </div>
              <FldArea
                l={t("modalDesc")}
                v={ed.desc}
                c={(v) => setEd({ ...ed, desc: v })}
                ph="…"
              />
              <FldArea
                l={t("modalDescEn")}
                v={ed.descEn || ""}
                c={(v) => setEd({ ...ed, descEn: v })}
                ph="Short description…"
              />
              <div
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 11,
                  fontStyle: "italic",
                  letterSpacing: "0.18em",
                  color: "rgba(201,169,110,0.45)",
                  marginTop: 4,
                  textTransform: "uppercase",
                }}
              >
                {t("workSpecKicker")}
              </div>
              <div className="modal-grid-2">
                <Fld
                  l={t("modalSpecWeight")}
                  v={ed.weight || ""}
                  c={(v) => setEd({ ...ed, weight: v })}
                  ph="約 380 g"
                />
                <Fld
                  l={t("modalSpecWeightEn")}
                  v={ed.weightEn || ""}
                  c={(v) => setEd({ ...ed, weightEn: v })}
                  ph="Approx. 380 g"
                />
                <Fld
                  l={t("modalSpecDim")}
                  v={ed.dim || ""}
                  c={(v) => setEd({ ...ed, dim: v })}
                  ph="約 Ø12×H18 cm"
                />
                <Fld
                  l={t("modalSpecDimEn")}
                  v={ed.dimEn || ""}
                  c={(v) => setEd({ ...ed, dimEn: v })}
                  ph="Approx. Ø12 × H18 cm"
                />
                <Fld
                  l={t("modalSpecMaterial")}
                  v={ed.material || ""}
                  c={(v) => setEd({ ...ed, material: v })}
                  ph="永生玫瑰、玻璃罩"
                />
                <Fld
                  l={t("modalSpecMaterialEn")}
                  v={ed.materialEn || ""}
                  c={(v) => setEd({ ...ed, materialEn: v })}
                  ph="Preserved rose, glass cloche"
                />
              </div>
              <div>
                <label style={lb}>{t("modalCover")}</label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    padding: 28,
                    border: "1px dashed rgba(201,169,110,0.12)",
                    borderRadius: 6,
                    cursor: "pointer",
                    color: "rgba(201,169,110,0.3)",
                    fontSize: 13,
                    fontFamily: "'Instrument Serif',serif",
                    fontStyle: "italic",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Cam />
                  {ed.image ? t("modalUploaded") : t("modalUploadHint")}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files[0];
                      if (!f) return;
                      void (async () => {
                        try {
                          const prevEd = ed?.image || "";
                          const origRef = ed?.id
                            ? works.find((x) => x.id === ed.id)?.image || ""
                            : "";
                          const ref = await fileToImageRef(f);
                          setEd((p) => ({ ...p, image: ref }));
                          if (prevEd && prevEd !== ref && prevEd !== origRef) {
                            void deleteImageRefs([prevEd]);
                          }
                        } catch (err) {
                          console.error(err);
                          window.alert((err && err.message) || "圖片讀取失敗");
                        }
                      })();
                    }}
                  />
                </label>
                {ed.image && (
                  <img
                    src={ed.image}
                    alt=""
                    style={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                      marginTop: 12,
                      borderRadius: 6,
                      border: "1px solid rgba(201,169,110,0.08)",
                    }}
                  />
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 36,
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  const prevWork = ed?.id
                    ? works.find((x) => x.id === ed.id)
                    : null;
                  const orphans = diffImageRefs(
                    collectWorkImageRefs(ed),
                    prevWork ? collectWorkImageRefs(prevWork) : [],
                  );
                  setMo(false);
                  setEd(null);
                  if (orphans.length) void deleteImageRefs(orphans);
                }}
                style={{
                  background: "none",
                  border: "1px solid rgba(201,169,110,0.1)",
                  color: "rgba(245,240,235,0.4)",
                  padding: "10px 24px",
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 13,
                  fontStyle: "italic",
                  cursor: "pointer",
                  borderRadius: 4,
                }}
              >
                {t("modalCancel")}
              </button>
              <button
                type="button"
                onClick={() => doSv(ed)}
                style={{
                  background: "rgba(201,169,110,0.15)",
                  color: "#C9A96E",
                  border: "1px solid rgba(201,169,110,0.2)",
                  padding: "10px 30px",
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 13,
                  fontStyle: "italic",
                  fontWeight: 400,
                  cursor: "pointer",
                  borderRadius: 4,
                  backdropFilter: "blur(8px)",
                }}
              >
                {t("modalSave")}
              </button>
            </div>
          </div>
        </div>
      )}

      {adminLoginOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.82)",
            backdropFilter: "blur(18px)",
            zIndex: 250,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 0.2s",
          }}
          onClick={() => {
            setAdminLoginOpen(false);
            setLoginPwd("");
            setLoginErr(false);
          }}
        >
          <div
            className="admin-login-panel"
            style={{
              background: "rgba(28,25,23,0.96)",
              border: "1px solid rgba(201,169,110,0.12)",
              borderRadius: 8,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 22,
                fontStyle: "italic",
                marginBottom: 20,
                color: "#F5F0EB",
              }}
            >
              {t("adminLoginTitle")}
            </h3>
            <label style={lb}>{t("adminPassword")}</label>
            <input
              className="fi"
              type="password"
              autoComplete="current-password"
              value={loginPwd}
              onChange={(e) => {
                setLoginPwd(e.target.value);
                setLoginErr(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && tryAdminLogin()}
              style={{ width: "100%", marginBottom: 12 }}
            />
            {loginErr && (
              <div
                style={{
                  color: "#f87171",
                  fontSize: 13,
                  marginBottom: 12,
                  fontFamily: "'Instrument Serif',serif",
                  fontStyle: "italic",
                }}
              >
                {t("adminInvalid")}
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setAdminLoginOpen(false);
                  setLoginPwd("");
                  setLoginErr(false);
                }}
                style={{
                  background: "none",
                  border: "1px solid rgba(201,169,110,0.15)",
                  color: "rgba(245,240,235,0.45)",
                  padding: "10px 20px",
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 13,
                  fontStyle: "italic",
                  cursor: "pointer",
                  borderRadius: 4,
                }}
              >
                {t("adminCancel")}
              </button>
              <button
                type="button"
                onClick={() => void tryAdminLogin()}
                style={{
                  background: "rgba(201,169,110,0.18)",
                  border: "1px solid rgba(201,169,110,0.25)",
                  color: "#C9A96E",
                  padding: "10px 22px",
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 13,
                  fontStyle: "italic",
                  cursor: "pointer",
                  borderRadius: 4,
                }}
              >
                {t("adminSubmit")}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer
        className="ft-safe"
        style={{
          borderTop: "1px solid rgba(201,169,110,0.12)",
          paddingTop: 48,
          textAlign: "center",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(201,169,110,0.04) 100%)",
        }}
      >
        <div
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 12,
            fontStyle: "italic",
            letterSpacing: "0.18em",
            color: "rgba(232,220,200,0.82)",
            marginBottom: 8,
          }}
        >
          {t("footer")}
        </div>
        <div style={{ marginTop: 28 }}>
          <div
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 11,
              fontStyle: "italic",
              letterSpacing: "0.24em",
              color: "rgba(201,169,110,0.55)",
              marginBottom: 16,
              textTransform: "uppercase",
            }}
          >
            {t("socialKicker")}
          </div>
          <SocialContactChips
            socialIg={socialIg}
            socialFb={socialFb}
            contactMail={contactMail}
            t={t}
          />
        </div>
      </footer>
    </div>
  );
}
