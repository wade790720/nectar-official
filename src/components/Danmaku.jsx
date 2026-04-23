import { useState, useRef, useEffect } from "react";

export function Danmaku({ wishes }) {
  const [its, setIts] = useState([]);
  const c = useRef(0);
  useEffect(() => {
    if (!wishes.length) return;
    const iv = setInterval(() => {
      const w = wishes[Math.floor(Math.random() * wishes.length)];
      setIts((p) => [
        ...p.slice(-22),
        {
          id: c.current++,
          text: w.text,
          top: 5 + Math.random() * 78,
          dur: 10 + Math.random() * 6,
          sz: Math.random() > 0.7 ? 16 : 13,
        },
      ]);
    }, 2400);
    return () => clearInterval(iv);
  }, [wishes]);
  useEffect(() => {
    if (its.length) {
      const t = setTimeout(() => setIts((p) => p.slice(1)), 17000);
      return () => clearTimeout(t);
    }
  }, [its]);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      {its.map((d) => (
        <div
          key={d.id}
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
        >
          ✿ {d.text}
        </div>
      ))}
    </div>
  );
}
