import { useState, useEffect, useRef } from "react";

/** 視差位移（依區塊在視窗中的位置） */
export function useParallaxScroll(sp = 0.3) {
  const r = useRef(null);
  const [o, setO] = useState(0);
  useEffect(() => {
    const h = () => {
      if (!r.current) return;
      const rc = r.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (vh - rc.top) / (vh + rc.height);
      setO((p - 0.5) * sp * rc.height);
    };
    window.addEventListener("scroll", h, { passive: true });
    h();
    return () => window.removeEventListener("scroll", h);
  }, [sp]);
  return [r, o];
}
