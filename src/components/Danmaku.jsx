import { useState, useRef, useEffect, useCallback } from "react";

const DM = "dm";
const MAX_DANMU = 10;
const ADD_MS = 3200;

/**
 * 橫向飄字（願望池隨機顯示）。舊版在 `its` 上綁了每秒級的 setTimeout/Effect，
 * 與 2.4s 的 setInterval 重疊，容易造成頻繁重渲染與卡頓。
 * 改為單一 interval + 以 animation 結束時才移除一筆，減少排程與狀態抖動。
 */
export function Danmaku({ wishes }) {
  const [its, setIts] = useState([]);
  const c = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const removeId = useCallback((id) => {
    setIts((p) => p.filter((x) => x.id !== id));
  }, []);

  useEffect(() => {
    if (!wishes.length || reducedMotion) return;
    const iv = setInterval(() => {
      const w = wishes[Math.floor(Math.random() * wishes.length)];
      setIts((p) => [
        ...p.slice(-(MAX_DANMU - 1)),
        {
          id: c.current++,
          text: w.text,
          top: 5 + Math.random() * 78,
          dur: 10 + Math.random() * 6,
          sz: Math.random() > 0.7 ? 16 : 13,
        },
      ]);
    }, ADD_MS);
    return () => clearInterval(iv);
  }, [wishes, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      className="danmaku-root"
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 5,
        contain: "paint",
        isolation: "isolate",
      }}
    >
      {its.map((d) => (
        <div
          key={d.id}
          className="danmaku-line"
          style={{
            position: "absolute",
            top: `${d.top}%`,
            right: "-340px",
            whiteSpace: "nowrap",
            fontSize: d.sz,
            color: "rgba(201,169,110,0.4)",
            textShadow: "0 1px 12px rgba(0,0,0,0.8)",
            fontWeight: 400,
            letterSpacing: "0.08em",
            fontFamily: "'Instrument Serif',serif",
            fontStyle: "italic",
            animation: `dm ${d.dur}s linear forwards`,
          }}
          onAnimationEnd={(e) => {
            if (e.animationName === DM) removeId(d.id);
          }}
        >
          ✿ {d.text}
        </div>
      ))}
    </div>
  );
}
