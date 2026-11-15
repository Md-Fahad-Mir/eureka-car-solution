import type { CSSProperties } from "react";

/** Inline style for a staggered reveal: item `i` of a group, plus an optional extra delay (ms). */
export function stagger(i: number, delayMs = 0): CSSProperties {
  return { ["--i" as string]: i, ...(delayMs ? { ["--delay" as string]: `${delayMs}ms` } : {}) };
}

/** Ease-out quart: fast start, long settle (count-ups and number tweens). */
export const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

/** Value at progress `t` (0..1) between `from` and `to`, eased. */
export function tweenAt(from: number, to: number, t: number) {
  return from + (to - from) * easeOutQuart(Math.min(1, Math.max(0, t)));
}
