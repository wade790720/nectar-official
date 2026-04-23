import { useState, useEffect, useRef } from "react";

export function useInView(th = 0.15) {
  const r = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = r.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setV(true);
          o.unobserve(el);
        }
      },
      { threshold: th },
    );
    o.observe(el);
    return () => o.disconnect();
  }, [th]);
  return [r, v];
}
