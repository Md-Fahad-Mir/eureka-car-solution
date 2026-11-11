import Image from "next/image";
import { useId } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import type { BodyType, Media, MediaView } from "@/types";
import { bodyPath, GROUND_Y, SILHOUETTES } from "./silhouettes";

const ASPECT_CLASS: Record<Media["aspect"], string> = {
  "16/10": "aspect-[16/10]",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
};

type PlaceholderInfo = {
  bodyType: BodyType;
  /** Paint colour (hex) for the silhouette. */
  paint: string;
  /** Brand initial shown as a watermark. */
  initial: string;
};

/**
 * Renders a vehicle image. Real photos (`media.src`) go through next/image
 * (AVIF/WebP, responsive `sizes`); otherwise an original SVG placeholder:
 * the body-type silhouette in the vehicle's paint on a clay studio backdrop.
 */
export function VehicleImage({
  media,
  placeholder,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  priority,
  className,
  rounded = true,
}: {
  media: Media;
  placeholder: PlaceholderInfo;
  sizes?: string;
  priority?: boolean;
  className?: string;
  rounded?: boolean;
}) {
  const locale = useLocale();
  const alt = media.alt[locale];
  const frame = cn("relative overflow-hidden bg-clay", ASPECT_CLASS[media.aspect], rounded && "rounded-2xl", className);

  if (media.src) {
    return (
      <div className={frame}>
        <Image src={media.src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }

  return (
    <div className={frame}>
      <PlaceholderArt view={media.view ?? "side"} alt={alt} {...placeholder} />
    </div>
  );
}

function PlaceholderArt({ bodyType, paint, initial, view, alt }: PlaceholderInfo & { view: MediaView; alt: string }) {
  const id = useId().replace(/:/g, "");
  const s = SILHOUETTES[bodyType];

  return (
    <svg viewBox="0 0 480 300" role="img" aria-label={alt} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3f2ee" />
          <stop offset="0.68" stopColor="#e6e8e1" />
          <stop offset="1" stopColor="#d8dbd2" />
        </linearGradient>
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </linearGradient>
        <radialGradient id={`${id}-floor`}>
          <stop offset="0" stopColor="#161a16" stopOpacity="0.32" />
          <stop offset="1" stopColor="#161a16" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="480" height="300" fill={`url(#${id}-bg)`} />
      <path d="M0 236 C 140 226 340 226 480 236" fill="none" stroke="rgba(22,26,22,0.08)" />
      <text
        x="452"
        y="64"
        textAnchor="end"
        fontSize="64"
        fontWeight="300"
        fill="rgba(22,26,22,0.07)"
        style={{ fontFamily: "var(--font-body)" }}
        aria-hidden
      >
        {initial}
      </text>

      {view === "interior" ? (
        <Interior paint={paint} />
      ) : view === "detail" ? (
        <WheelDetail paint={paint} />
      ) : (
        <g transform={viewTransform(view)}>
          <ellipse cx="240" cy={GROUND_Y + 2} rx="215" ry="12" fill={`url(#${id}-floor)`} />
          <path d={bodyPath(s)} fill={paint} />
          <path d={bodyPath(s)} fill={`url(#${id}-shade)`} stroke="rgba(22,26,22,0.25)" strokeWidth="1" />
          <path d={s.windows} fill="#2a2d31" opacity="0.88" />
          {s.extras ? <path d={s.extras} fill="none" stroke="rgba(22,26,22,0.22)" strokeWidth="1.5" /> : null}
          {s.wheels.map(([cx, cy, r]) => (
            <g key={cx}>
              <circle cx={cx} cy={cy} r={r} fill="#202226" />
              <circle cx={cx} cy={cy} r={r * 0.6} fill="#c9cac4" />
              <circle cx={cx} cy={cy} r={r * 0.18} fill="#9c8150" />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

/** Lifts the side profile into the frame; ¾ views add a gentle skew (front ¾ is mirrored). */
function viewTransform(view: MediaView): string {
  const lift = "translate(0 34)";
  if (view === "front34") return `${lift} translate(480 0) scale(-0.94 1) skewY(-3) translate(10 0)`;
  if (view === "rear34") return `${lift} scale(0.94 1) skewY(3) translate(14 -14)`;
  return lift;
}

function Interior({ paint }: { paint: string }) {
  return (
    <g>
      <path d="M0 150 C 120 112 360 112 480 150 L480 300 L0 300 Z" fill="#2a2d31" />
      <path d="M0 150 C 120 112 360 112 480 150" fill="none" stroke={paint} strokeWidth="6" opacity="0.8" />
      <rect x="196" y="124" width="120" height="58" rx="10" fill="#111214" stroke="#4a4f55" />
      <rect x="206" y="134" width="100" height="38" rx="4" fill="#1f3b46" opacity="0.9" />
      <circle cx="132" cy="210" r="62" fill="none" stroke="#16181b" strokeWidth="14" />
      <circle cx="132" cy="210" r="18" fill="#16181b" />
      <path d="M132 210 L84 206 M132 210 L180 206 M132 210 L132 262" stroke="#16181b" strokeWidth="10" />
    </g>
  );
}

function WheelDetail({ paint }: { paint: string }) {
  return (
    <g transform="translate(240 168)">
      <path d="M-240 -40 L240 -60 L240 132 L-240 132 Z" fill={paint} opacity="0.9" />
      <circle r="104" fill="#1b1d20" />
      <circle r="66" fill="#c9cac4" />
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i * 72 * Math.PI) / 180;
        return <line key={i} x1="0" y1="0" x2={Math.cos(a) * 60} y2={Math.sin(a) * 60} stroke="#9fa19b" strokeWidth="14" strokeLinecap="round" />;
      })}
      <circle r="14" fill="#9c8150" />
    </g>
  );
}
