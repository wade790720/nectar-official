import { useState, useEffect, useMemo, useCallback } from "react";
import {
  useP,
  fileToImageRef,
  getAdminToken,
  setAdminToken,
  clearAdminSession,
  apiPath,
  forceFlushWorks,
} from "./persist.js";
import { useI18n } from "./i18n.jsx";
import { SK, DW, DV } from "./config/content.js";
import { normalizeSocialUrl } from "./utils/social.js";
import { removeWorkImageAtThumbIndex } from "./utils/workGallery.js";
import { VoteAdminRow } from "./components/VoteAdminRow.jsx";
import { Danmaku } from "./components/Danmaku.jsx";
import { SocialContactChips } from "./components/SocialContactChips.jsx";
import { Detail } from "./components/DetailLightbox.jsx";
import { WS } from "./components/WorkSlide.jsx";
import { HeroSlide } from "./components/HeroSlide.jsx";
import { Fld, FldArea, lb } from "./components/FormFields.jsx";
import { Plus, Cam, Crown, Send } from "./components/icons/Icons.jsx";

export default function App() {
  const { t, locale, setLocale, flowerName } = useI18n();
  const [pg, setPg] = useState("portfolio");
  const bundleInit = useMemo(() => ({ works: DW, votes: DV, wishes: [] }), []);
  const [bundle, setBundle] = useP(SK.w, bundleInit, { cloud: true });
  const works = bundle.works;
  const votes = bundle.votes;
  const wishes = bundle.wishes;
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
  const [ed, setEd] = useState(null);
  const [modal, setMo] = useState(false);
  const [detail, setDt] = useState(null);
  const [wiIn, setWiIn] = useState("");
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [loginPwd, setLoginPwd] = useState("");
  const [loginErr, setLoginErr] = useState(false);
  const [voted, setVd] = useState({});
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
    if (pg === "portfolio") root.classList.add("portfolio-scroll-snap");
    else root.classList.remove("portfolio-scroll-snap");
    return () => root.classList.remove("portfolio-scroll-snap");
  }, [pg]);

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

  const publicVotes = useMemo(() => votes.filter((v) => !v.hidden), [votes]);
  const sorted = useMemo(
    () => [...publicVotes].sort((a, b) => b.votes - a.votes),
    [publicVotes],
  );
  const mx = useMemo(
    () => Math.max(1, ...publicVotes.map((f) => f.votes)),
    [publicVotes],
  );

  const doV = (id) => {
    if (voted[id]) return;
    setVotes((p) =>
      p.map((f) => (f.id === id ? { ...f, votes: f.votes + 1 } : f)),
    );
    setVd((p) => ({ ...p, [id]: true }));
  };
  const doWi = () => {
    if (!wiIn.trim()) return;
    setWishes((p) => [...p, { id: Date.now().toString(), text: wiIn.trim() }]);
    setWiIn("");
  };
  const doVoteImg = async (id, file) => {
    if (!file) return;
    try {
      const ref = await fileToImageRef(file);
      setVotes((p) => p.map((x) => (x.id === id ? { ...x, image: ref } : x)));
    } catch (e) {
      console.error(e);
      window.alert((e && e.message) || "圖片上傳失敗");
    }
  };
  const saveVoteNames = (id, { name, en }) => {
    setVotes((p) => p.map((x) => (x.id === id ? { ...x, name, en } : x)));
  };
  const toggleVoteHidden = (id) => {
    setVotes((p) =>
      p.map((x) => (x.id === id ? { ...x, hidden: !x.hidden } : x)),
    );
  };
  const deleteVoteOption = (id) => {
    if (!window.confirm(t("voteRemoveOptionConfirm"))) return;
    setVotes((p) => p.filter((x) => x.id !== id));
    setVd((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
  };
  const doSv = (w) => {
    const next =
      w.id && works.find((x) => x.id === w.id)
        ? works.map((x) => (x.id === w.id ? w : x))
        : [...works, { ...w, id: Date.now().toString() }];
    setW(next);
    setMo(false);
    setEd(null);
    void forceFlushWorks(SK.w, next);
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
  const doDl = (id) => {
    const next = works.filter((x) => x.id !== id);
    setW(next);
    void forceFlushWorks(SK.w, next);
  };
  const doUp = async (wid, f) => {
    try {
      const ref = await fileToImageRef(f);
      setW((p) => {
        const next = p.map((w) => (w.id === wid ? { ...w, image: ref } : w));
        void forceFlushWorks(SK.w, next);
        return next;
      });
    } catch (e) {
      console.error(e);
      window.alert((e && e.message) || "主圖上傳失敗");
    }
  };
  const doGal = async (wid, files) => {
    for (const f of files) {
      try {
        const ref = await fileToImageRef(f);
        setW((p) => {
          const next = p.map((w) =>
            w.id === wid ? { ...w, gallery: [...(w.gallery || []), ref] } : w,
          );
          void forceFlushWorks(SK.w, next);
          return next;
        });
      } catch (e) {
        console.error(e);
        window.alert((e && e.message) || "圖庫上傳失敗");
      }
    }
  };
  const doRmGal = (wid, thumbIdx) => {
    const w = works.find((x) => x.id === wid);
    if (!w) return;
    const nextW = removeWorkImageAtThumbIndex(w, thumbIdx);
    const next = works.map((x) => (x.id === wid ? nextW : x));
    setW(next);
    setDt((d) => (d && d.id === wid ? nextW : d));
    void forceFlushWorks(SK.w, next);
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
              setPg("portfolio");
              setDt(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
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
              className={`nb ${pg === "portfolio" ? "on" : ""}`}
              onClick={() => setPg("portfolio")}
            >
              {t("navCollection")}
            </button>
            <button
              type="button"
              className={`nb ${pg === "vote" ? "on" : ""}`}
              onClick={() => setPg("vote")}
            >
              {t("navVote")}
            </button>
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
        </div>
      </nav>

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

      {/* ═══ PORTFOLIO ═══ */}
      {pg === "portfolio" && (
        <div>
          {adminAuthed && (
            <div className="fab-add" style={{ position: "fixed", zIndex: 40 }}>
              <button
                onClick={() => {
                  setEd({
                    title: "",
                    en: "",
                    price: 0,
                    soldOut: false,
                    image: "",
                    cat: "",
                    desc: "",
                    descEn: "",
                    dim: "",
                    dimEn: "",
                    material: "",
                    materialEn: "",
                    weight: "",
                    weightEn: "",
                    gallery: [],
                  });
                  setMo(true);
                }}
                style={{
                  background: "#C9A96E",
                  color: "#080706",
                  border: "none",
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 8px 40px rgba(201,169,110,0.3)",
                }}
              >
                <Plus s={22} />
              </button>
            </div>
          )}

          <HeroSlide />
          {works.map((w, i) => (
            <WS
              key={w.id}
              work={w}
              index={i}
              total={works.length}
              admin={adminAuthed}
              onEdit={(w) => {
                setEd(w);
                setMo(true);
              }}
              onDelete={doDl}
              onUpload={doUp}
              onOpen={setDt}
            />
          ))}

          <div
            className="portfolio-end"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 1,
                height: 48,
                background:
                  "linear-gradient(180deg, rgba(201,169,110,0.35), transparent)",
              }}
            />
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 13,
                fontStyle: "italic",
                letterSpacing: "0.22em",
                color: "rgba(212,184,122,0.72)",
                textShadow: "0 1px 16px rgba(0,0,0,0.45)",
              }}
            >
              {t("portfolioEnd")}
            </div>
          </div>
        </div>
      )}

      {/* ═══ VOTE ═══ */}
      {pg === "vote" && (
        <div className="page-pad">
          <Danmaku wishes={wishes} />

          <div
            style={{
              textAlign: "center",
              marginBottom: 56,
              opacity: ho ? 1 : 0,
              transform: ho ? "translateY(0)" : "translateY(24px)",
              transition: "all 1s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, rgba(201,169,110,0.25), transparent)",
                margin: "0 auto 24px",
              }}
            />
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 12,
                fontStyle: "italic",
                letterSpacing: "0.2em",
                color: "rgba(201,169,110,0.3)",
                marginBottom: 20,
              }}
            >
              {t("voteKicker")}
            </div>
            <h2
              style={{
                fontFamily: "'Noto Serif TC',serif",
                fontSize: "clamp(32px,5.5vw,50px)",
                fontWeight: 300,
                letterSpacing: "0.04em",
                marginBottom: 12,
              }}
            >
              {t("voteTitle")}
            </h2>
            <p
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 16,
                fontStyle: "italic",
                color: "rgba(201,169,110,0.25)",
                letterSpacing: "0.1em",
              }}
            >
              {t("voteSub")}
            </p>
            <div
              style={{
                width: 40,
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, rgba(201,169,110,0.25), transparent)",
                margin: "24px auto 0",
              }}
            />
          </div>

          {sorted[0]?.votes > 0 && (
            <div
              style={{
                textAlign: "center",
                marginBottom: 48,
                padding: "36px",
                background: "rgba(201,169,110,0.02)",
                border: "1px solid rgba(201,169,110,0.08)",
                borderRadius: 8,
                animation: "breathe 4s infinite",
                backdropFilter: "blur(8px)",
              }}
            >
              <Crown
                s={24}
                style={{
                  color: "#C9A96E",
                  margin: "0 auto 12px",
                  display: "block",
                }}
              />
              <div
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 11,
                  fontStyle: "italic",
                  letterSpacing: "0.25em",
                  color: "rgba(201,169,110,0.35)",
                  marginBottom: 10,
                }}
              >
                {t("voteLeading")}
              </div>
              <div
                style={{
                  marginBottom: 10,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {sorted[0].image ? (
                  <img
                    src={sorted[0].image}
                    alt=""
                    className="vote-leading-img"
                  />
                ) : (
                  <span style={{ fontSize: "clamp(52px,14vw,72px)" }}>
                    {sorted[0].emoji}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontFamily: "'Noto Serif TC',serif",
                  fontSize: 26,
                  color: "#C9A96E",
                  fontWeight: 300,
                }}
              >
                {flowerName(sorted[0])}
              </div>
              <div
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 13,
                  fontStyle: "italic",
                  color: "rgba(201,169,110,0.35)",
                  marginTop: 6,
                }}
              >
                {locale === "en" ? sorted[0].name : sorted[0].en} —{" "}
                {sorted[0].votes} {t("voteVotes")}
              </div>
            </div>
          )}

          <div className="vote-card-grid">
            {sorted.map((f, i) => (
              <div
                key={f.id}
                className={`vc vote-card ${voted[f.id] ? "vd" : ""}`}
                onClick={() => doV(f.id)}
                style={{
                  opacity: co ? 1 : 0,
                  transform: co ? "translateY(0)" : "translateY(16px)",
                  transition: `all 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s`,
                }}
              >
                <div
                  className="vote-card-thumb"
                  style={{
                    animation: voted[f.id] ? "float 2.5s infinite" : "none",
                  }}
                >
                  {f.image ? (
                    <img src={f.image} alt="" />
                  ) : (
                    <span style={{ fontSize: "clamp(32px,10vw,44px)" }}>
                      {f.emoji}
                    </span>
                  )}
                </div>
                <div className="vote-card-body">
                  <div className="vote-card-names">
                    <span
                      style={{
                        fontFamily: "'Noto Serif TC',serif",
                        fontSize: 15,
                        fontWeight: 400,
                        color: voted[f.id] ? "#C9A96E" : "#F5F0EB",
                        lineHeight: 1.35,
                      }}
                    >
                      {flowerName(f)}
                    </span>
                    {(locale === "en" ? f.name : f.en) ? (
                      <span
                        style={{
                          fontFamily: "'Instrument Serif',serif",
                          fontSize: 12,
                          fontStyle: "italic",
                          color: "rgba(201,169,110,0.35)",
                          lineHeight: 1.35,
                        }}
                      >
                        {locale === "en" ? f.name : f.en}
                      </span>
                    ) : null}
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: "rgba(201,169,110,0.08)",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(f.votes / mx) * 100}%`,
                        background:
                          "linear-gradient(90deg, rgba(201,169,110,0.6), #C9A96E)",
                        borderRadius: 2,
                        transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
                      }}
                    />
                  </div>
                  <div className="vote-card-footer">
                    <span
                      style={{
                        fontFamily: "'Instrument Serif',serif",
                        fontSize: 12,
                        fontStyle: "italic",
                        color: "rgba(245,240,235,0.45)",
                      }}
                    >
                      {f.votes} {t("voteVotes")}
                    </span>
                    {voted[f.id] ? (
                      <span
                        style={{
                          fontFamily: "'Instrument Serif',serif",
                          fontSize: 10,
                          fontStyle: "italic",
                          color: "rgba(201,169,110,0.55)",
                          letterSpacing: "0.12em",
                        }}
                      >
                        {t("voteVoted")}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {adminAuthed && (
            <div
              style={{
                marginBottom: 48,
                padding: 28,
                background: "rgba(201,169,110,0.03)",
                border: "1px solid rgba(201,169,110,0.1)",
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 14,
                  fontStyle: "italic",
                  color: "#C9A96E",
                  marginBottom: 8,
                }}
              >
                {t("voteEditOption")}
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(245,240,235,0.35)",
                  marginBottom: 20,
                  lineHeight: 1.55,
                  fontFamily: "'Noto Serif TC',serif",
                }}
              >
                {t("voteCoursePhotosSub")}
              </p>
              <div className="vote-admin-grid">
                {votes.map((f) => (
                  <VoteAdminRow
                    key={f.id}
                    item={f}
                    t={t}
                    onSaveNames={saveVoteNames}
                    onToggleHidden={toggleVoteHidden}
                    onDelete={deleteVoteOption}
                    onUploadImage={doVoteImg}
                  />
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(201,169,110,0.08), transparent)",
              marginBottom: 56,
            }}
          />

          {/* Wish Pool */}
          <div style={{ position: "relative", zIndex: 10 }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 11,
                  fontStyle: "italic",
                  letterSpacing: "0.2em",
                  color: "rgba(201,169,110,0.3)",
                  marginBottom: 16,
                }}
              >
                {t("wishKicker")}
              </div>
              <h3
                style={{
                  fontFamily: "'Noto Serif TC',serif",
                  fontSize: 28,
                  fontWeight: 300,
                  letterSpacing: "0.04em",
                  marginBottom: 8,
                }}
              >
                {t("wishTitle")}
              </h3>
              <p
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 14,
                  fontStyle: "italic",
                  color: "rgba(201,169,110,0.2)",
                }}
              >
                {t("wishSub")}
              </p>
            </div>
            <div className="wish-bar">
              <input
                className="fi"
                placeholder={t("wishPlaceholder")}
                value={wiIn}
                onChange={(e) => setWiIn(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doWi()}
                style={{ flex: 1, width: "100%" }}
                enterKeyHint="send"
                autoComplete="off"
              />
              <button
                type="button"
                className="wish-send"
                onClick={doWi}
                style={{
                  background: "rgba(201,169,110,0.12)",
                  color: "#C9A96E",
                  border: "1px solid rgba(201,169,110,0.15)",
                  padding: "12px 22px",
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 13,
                  fontStyle: "italic",
                  cursor: "pointer",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  whiteSpace: "nowrap",
                  backdropFilter: "blur(8px)",
                  transition: "all 0.3s",
                }}
              >
                <Send /> {t("wishSend")}
              </button>
            </div>
            {wishes.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  justifyContent: "center",
                }}
              >
                {wishes.slice(-30).map((w) => (
                  <span
                    key={w.id}
                    style={{
                      display: "inline-block",
                      background: "rgba(201,169,110,0.03)",
                      border: "1px solid rgba(201,169,110,0.08)",
                      color: "rgba(245,240,235,0.5)",
                      padding: "7px 16px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontFamily: "'Instrument Serif',serif",
                      fontStyle: "italic",
                      animation: "fu 0.4s",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    ✿ {w.text}
                  </span>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: 48,
                  color: "rgba(201,169,110,0.15)",
                  fontSize: 13,
                  fontFamily: "'Instrument Serif',serif",
                  fontStyle: "italic",
                }}
              >
                {t("wishEmpty")}
              </div>
            )}
            {adminAuthed && (
              <div style={{ marginTop: 48, textAlign: "center" }}>
                <button
                  onClick={() => {
                    setVotes((p) => p.map((x) => ({ ...x, votes: 0 })));
                    setVd({});
                  }}
                  style={{
                    background: "none",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "rgba(239,68,68,0.6)",
                    padding: "8px 22px",
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: 11,
                    fontStyle: "italic",
                    cursor: "pointer",
                    borderRadius: 20,
                  }}
                >
                  {t("wishReset")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
                          const ref = await fileToImageRef(f);
                          setEd((p) => ({ ...p, image: ref }));
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
                  setMo(false);
                  setEd(null);
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
