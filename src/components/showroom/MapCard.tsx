import { ArrowUpRight, MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useFormat } from "@/lib/format/useFormat";
import { cn } from "@/lib/utils";
import type { Showroom } from "@/types";
import { directionsUrl } from "./ShowroomCard";

/** Stable pseudo-random street layout per location, so each card looks different but never changes. */
function streets(lat: number, lng: number) {
  let seed = Math.floor(Math.abs(lat * 1e4) + Math.abs(lng * 1e4));
  const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const lines: { x1: number; y1: number; x2: number; y2: number; w: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const y = 20 + i * 36 + rand() * 18;
    lines.push({ x1: 0, y1: y, x2: 400, y2: y + (rand() - 0.5) * 40, w: i % 3 === 0 ? 7 : 3 });
  }
  for (let i = 0; i < 7; i++) {
    const x = 18 + i * 60 + rand() * 24;
    lines.push({ x1: x, y1: 0, x2: x + (rand() - 0.5) * 50, y2: 240, w: i % 3 === 1 ? 7 : 3 });
  }
  return lines;
}

/**
 * Styled static map card: no map provider or API key. The pin marks the
 * neighbourhood; the link opens Google Maps at the exact coordinates.
 * To embed a live map later, swap this component; its props stay the same.
 */
export function MapCard({ showroom: s, className }: { showroom: Showroom; className?: string }) {
  const t = useTranslations("showroomCard");
  const tA11y = useTranslations("a11y");
  const locale = useLocale();
  const f = useFormat();
  return (
    <figure className={cn("overflow-hidden rounded-card border border-line bg-bg-alt", className)}>
      <div className="relative aspect-[5/3] bg-[#e9ebe3]">
        <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden className="absolute inset-0 size-full">
          <path d="M-10 190 C 90 150 160 230 260 180 S 380 140 420 160 L420 260 L-10 260Z" fill="#cfdcd6" />
          {streets(s.geo.lat, s.geo.lng).map((l, i) => (
            <line key={i} {...l} stroke="#fbfaf6" strokeWidth={l.w} strokeLinecap="round" />
          ))}
          <circle cx="200" cy="112" r="34" fill="var(--accent)" fillOpacity="0.16" />
        </svg>
        <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center">
          <MapPin aria-hidden className="size-9 fill-ink text-bg-alt drop-shadow" strokeWidth={1.5} />
        </div>
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
        <span>
          <span className="font-medium">{s.name[locale]}</span>
          <span className="ml-2 text-xs text-muted tabular">
            {f.number(s.geo.lat, { maximumFractionDigits: 4 })}, {f.number(s.geo.lng, { maximumFractionDigits: 4 })}
          </span>
        </span>
        <a
          href={directionsUrl(s)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-accent-ink underline-offset-4 hover:underline"
        >
          {t("openMap")}
          <ArrowUpRight aria-hidden className="size-4" />
          <span className="sr-only">{tA11y("opensInNewTab")}</span>
        </a>
      </figcaption>
    </figure>
  );
}
