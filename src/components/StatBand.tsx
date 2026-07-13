"use client";
import { useEffect, useRef, useState } from "react";

type Stat = { value: number; suffix?: string; label: string; emoji: string };

const STATS: Stat[] = [
  { value: 120000, suffix: "+", label: "Verified members", emoji: "🐾" },
  { value: 38000, suffix: "+", label: "Happy matches made", emoji: "💚" },
  { value: 12, suffix: "", label: "Cities across India", emoji: "📍" },
  { value: 98, suffix: "%", label: "Feel safer meeting", emoji: "🛡️" },
];

function format(n: number) {
  if (n >= 100000) return (n / 1000).toFixed(0) + "K";
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K";
  return String(n);
}

function Counter({ stat }: { stat: Stat }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setN(stat.value); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true;
        const dur = 1400;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
          setN(Math.round(stat.value * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [stat.value]);

  return (
    <div className="statband__item" ref={ref}>
      <div className="statband__emoji" aria-hidden>{stat.emoji}</div>
      <div className="statband__num">{format(n)}{stat.suffix}</div>
      <div className="statband__label">{stat.label}</div>
    </div>
  );
}

export default function StatBand() {
  return (
    <div className="statband">
      {STATS.map((s) => <Counter key={s.label} stat={s} />)}
    </div>
  );
}
