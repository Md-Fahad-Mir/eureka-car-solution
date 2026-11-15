"use client";

import { useLayoutEffect, useRef } from "react";
import { useFormat, type Format } from "@/lib/format/useFormat";
import { tweenAt } from "@/lib/motion";

type Kind = "number" | "bdt";

function formatAs(f: Format, kind: Kind, n: number, decimals: number) {
  return kind === "bdt" ? f.bdt(n, decimals) : f.number(n, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/**
 * A number that rolls to its new value when it changes (calculators) and,
 * with `countUp`, counts up from zero the first time it scrolls into view
 * (stats). The animation writes to the DOM directly (no re-renders); screen
 * readers only ever get the final value. Reduced motion shows values as is.
 */
export function AnimatedNumber({
  value,
  kind = "number",
  decimals = 0,
  countUp = false,
  durationMs = 700,
  className,
}: {
  value: number;
  kind?: Kind;
  decimals?: number;
  countUp?: boolean;
  durationMs?: number;
  className?: string;
}) {
  const f = useFormat();
  const ref = useRef<HTMLSpanElement>(null);
  const current = useRef(value);
  const frame = useRef(0);
  const fmt = useRef((n: number) => formatAs(f, kind, n, decimals));
  // Keep the formatter current (locale, kind) for the animation frames; declared first so it runs first.
  useLayoutEffect(() => {
    fmt.current = (n: number) => formatAs(f, kind, n, decimals);
  });

  const run = (from: number, to: number, ms: number) => {
    cancelAnimationFrame(frame.current);
    const el = ref.current;
    if (!el) return;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = (now - t0) / ms;
      current.current = tweenAt(from, to, t);
      el.textContent = fmt.current(t >= 1 ? to : current.current);
      if (t < 1) frame.current = requestAnimationFrame(step);
    };
    el.textContent = fmt.current(from);
    frame.current = requestAnimationFrame(step);
  };

  // Roll to each new value.
  useLayoutEffect(() => {
    const from = current.current;
    current.current = value;
    if (from === value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    run(from, value, durationMs);
    return () => cancelAnimationFrame(frame.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Count up from zero on first view.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!countUp || !el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;
    el.textContent = fmt.current(0);
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      run(0, current.current, 1600);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame.current);
    };
  }, [countUp]);

  const final = formatAs(f, kind, value, decimals);
  return (
    <span className={className}>
      <span ref={ref} aria-hidden className="tabular">
        {final}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}
