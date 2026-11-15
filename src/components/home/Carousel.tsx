"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Horizontal scroll-snap row with previous/next buttons and a progress line.
 * The list stays a native scroller (touch, trackpad, keyboard all work); the
 * buttons glide one card at a time and disable at either end.
 */
export function Carousel({
  label,
  prevLabel,
  nextLabel,
  children,
}: {
  label: string;
  prevLabel: string;
  nextLabel: string;
  children: ReactNode;
}) {
  const list = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState({ start: true, end: false, progress: 0, visible: 1 });

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = el.scrollWidth - el.clientWidth;
        setPos({
          start: el.scrollLeft <= 4,
          end: el.scrollLeft >= max - 4,
          progress: max > 0 ? el.scrollLeft / max : 1,
          visible: el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1,
        });
      });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const go = (dir: 1 | -1) => {
    const el = list.current;
    if (!el) return;
    const card = el.querySelector("li");
    const gap = parseFloat(getComputedStyle(el).columnGap) || 20;
    const step = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.8;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * step, behavior: smooth ? "smooth" : "auto" });
  };

  const button =
    "grid size-11 place-items-center rounded-full border border-line-strong bg-bg-alt transition-[background-color,border-color,color,opacity] duration-300 hover:border-ink hover:bg-ink hover:text-bg-alt disabled:pointer-events-none disabled:opacity-35";
  // The thumb is as wide as the visible share of the row and slides along the track.
  const thumb = Math.max(0.12, Math.min(1, pos.visible));

  return (
    <div>
      <ul
        ref={list}
        aria-label={label}
        className="container-page flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto pb-6 [scrollbar-width:none] sm:scroll-px-8 xl:scroll-px-14 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
      <div className="container-page mt-2 flex items-center gap-6">
        <div aria-hidden className="relative h-px flex-1 overflow-hidden bg-line">
          <span
            className="absolute inset-y-0 left-0 bg-ink transition-transform duration-300 ease-out-soft"
            style={{ width: `${thumb * 100}%`, transform: `translateX(${pos.progress * ((1 - thumb) / thumb) * 100}%)` }}
          />
        </div>
        <div className="flex gap-2">
          <button type="button" className={button} onClick={() => go(-1)} disabled={pos.start} aria-label={prevLabel}>
            <ArrowLeft aria-hidden className="size-4" />
          </button>
          <button type="button" className={cn(button, "group")} onClick={() => go(1)} disabled={pos.end} aria-label={nextLabel}>
            <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
