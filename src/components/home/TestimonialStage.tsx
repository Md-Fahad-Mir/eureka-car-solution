"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Quote, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

type Item = { id: string; quote: string; name: string; city: string; vehicle: string; rating: number };

/**
 * One large quote at a time. Choosing a customer (or stepping with the
 * arrows) cross-fades the quote; all quotes share one grid cell, so the panel
 * never changes height. No autoplay: the visitor sets the pace.
 */
export function TestimonialStage({
  quotes,
  labels,
}: {
  quotes: Item[];
  labels: { sample: string; previous: string; next: string; ratings: string[]; positions: string[]; region: string };
}) {
  const [active, setActive] = useState(0);
  const go = (d: 1 | -1) => setActive((i) => (i + d + quotes.length) % quotes.length);
  const arrow =
    "grid size-11 place-items-center rounded-full border border-line-strong transition-[background-color,border-color,color] duration-300 hover:border-ink hover:bg-ink hover:text-bg-alt";

  return (
    <div role="region" aria-roledescription="carousel" aria-label={labels.region} className="grid gap-10 rounded-[28px] border border-line bg-bg-alt p-6 sm:p-10 lg:grid-cols-12 lg:gap-14 lg:p-14">
      <div className="lg:col-span-8">
        <Quote aria-hidden className="size-10 text-accent/50" />
        <div aria-live="polite" className="mt-6 grid">
          {quotes.map((q, i) => {
            const on = i === active;
            return (
              <figure
                key={q.id}
                aria-hidden={!on}
                inert={!on}
                className={cn(
                  "flex flex-col gap-6 [grid-area:1/1] transition-[opacity,transform] duration-700 ease-(--ease-cinema)",
                  on ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
                )}
              >
                <blockquote className="text-2xl leading-snug font-light tracking-tight sm:text-3xl">{q.quote}</blockquote>
                <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <span className="flex gap-0.5 text-accent" role="img" aria-label={labels.ratings[i]}>
                    {Array.from({ length: 5 }, (_, s) => (
                      <Star key={s} aria-hidden className={s < q.rating ? "size-4 fill-current" : "size-4 text-line-strong"} />
                    ))}
                  </span>
                  <span>
                    <span className="font-medium">{q.name}</span>
                    <span className="text-muted"> · {q.city} · {q.vehicle}</span>
                  </span>
                  <Badge tone="neutral">{labels.sample}</Badge>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col justify-between gap-8 lg:col-span-4">
        <ul className="flex flex-col">
          {quotes.map((q, i) => {
            const on = i === active;
            return (
              <li key={q.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActive(i)}
                  className="group relative w-full border-b border-line py-4 text-left"
                >
                  <span className={cn("block font-medium transition-colors duration-300", on ? "text-ink" : "text-muted group-hover:text-ink")}>{q.name}</span>
                  <span className="block text-sm text-muted">{q.city}</span>
                  <span
                    aria-hidden
                    className={cn("absolute -bottom-px left-0 h-px w-full origin-left bg-accent-ink transition-transform duration-700 ease-(--ease-cinema)", on ? "scale-x-100" : "scale-x-0")}
                  />
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted tabular" aria-hidden>
            {labels.positions[active]}
          </span>
          <div className="flex gap-2">
            <button type="button" className={arrow} onClick={() => go(-1)} aria-label={labels.previous}>
              <ArrowLeft aria-hidden className="size-4" />
            </button>
            <button type="button" className={arrow} onClick={() => go(1)} aria-label={labels.next}>
              <ArrowRight aria-hidden className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
