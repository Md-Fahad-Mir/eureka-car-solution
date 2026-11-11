import { cn } from "@/lib/utils";

type Callout = { n: string; label: string };

/**
 * Static hero poster: the art direction of the 3D hero in a single SVG.
 * Clay-white studio car (ref. images 1 & 4), parts drawn apart for inspection,
 * an x-ray battery floor (ref. image 2) and numbered leader-line callouts
 * (ref. image 3). It's the LCP-safe poster and the no-WebGL / reduced-motion /
 * small-screen fallback for the 3D hero.
 */
export function HeroPoster({
  label,
  callouts,
  className,
}: {
  /** Accessible description of the illustration. */
  label: string;
  /** Three callouts: localised number ("01" / "০১") and label. */
  callouts: [Callout, Callout, Callout];
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 1200 640"
      role="img"
      aria-label={label}
      className={cn("h-auto w-full select-none", className)}
    >
      <defs>
        <radialGradient id="hp-floor" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#161a16" stopOpacity="0.28" />
          <stop offset="70%" stopColor="#161a16" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#161a16" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hp-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbfaf7" />
          <stop offset="55%" stopColor="#ecebe6" />
          <stop offset="100%" stopColor="#cfd0c9" />
        </linearGradient>
        <linearGradient id="hp-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a2d31" />
          <stop offset="100%" stopColor="#4a4f55" />
        </linearGradient>
        <linearGradient id="hp-part" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f7f6f2" />
          <stop offset="100%" stopColor="#d9dad3" />
        </linearGradient>
        <linearGradient id="hp-bar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c8b07c" stopOpacity="0" />
          <stop offset="50%" stopColor="#f3e2b8" />
          <stop offset="100%" stopColor="#c8b07c" stopOpacity="0" />
        </linearGradient>
        <filter id="hp-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Cyclorama: floor/wall seam */}
      <path d="M0 470 C 300 452 900 452 1200 470" fill="none" stroke="rgba(22,26,22,0.10)" />

      {/* Floor contact shadow */}
      <ellipse cx="585" cy="482" rx="470" ry="26" fill="url(#hp-floor)" />

      {/* X-ray battery floor, lowered out of the car */}
      <g transform="translate(0 92)">
        <rect x="300" y="438" width="520" height="34" rx="10" fill="rgba(138,216,204,0.10)" stroke="#5fb3a6" strokeWidth="1.2" />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={300 + (i + 1) * 40} y1="442" x2={300 + (i + 1) * 40} y2="468" stroke="#5fb3a6" strokeOpacity="0.55" />
        ))}
        <line x1="300" y1="455" x2="820" y2="455" stroke="#5fb3a6" strokeOpacity="0.35" strokeDasharray="3 5" />
      </g>
      {/* Drop guides from car to battery */}
      <g stroke="#5fb3a6" strokeOpacity="0.5" strokeDasharray="2 6">
        <line x1="310" y1="420" x2="310" y2="528" />
        <line x1="810" y1="420" x2="810" y2="528" />
      </g>

      {/* Body */}
      <path
        d="M150 410 L142 360 C140 330 160 310 202 300 C282 282 362 240 472 218 C562 202 642 206 702 230 C752 250 792 270 862 284 C932 296 987 308 1010 338 C1020 354 1018 392 1002 410 L912 410 A82 82 0 0 0 748 410 L412 410 A82 82 0 0 0 248 410 Z"
        fill="url(#hp-body)"
        stroke="rgba(22,26,22,0.18)"
        strokeWidth="1.2"
      />
      {/* Greenhouse */}
      <path d="M486 232 C566 214 646 216 696 238 L742 272 L474 272 C470 256 474 242 486 232 Z" fill="url(#hp-glass)" />
      <path d="M612 222 L606 272" stroke="#e9e8e3" strokeWidth="5" />
      {/* Shoulder line and sill */}
      <path d="M176 330 C420 316 760 318 1000 340" fill="none" stroke="rgba(22,26,22,0.16)" />
      <path d="M420 392 L740 392" stroke="rgba(22,26,22,0.18)" />
      {/* Door seam: the door has been lifted out */}
      <path d="M470 276 L462 392 M742 276 L736 392" stroke="rgba(22,26,22,0.22)" />
      {/* Light-bar signatures */}
      <rect x="944" y="316" width="62" height="3.5" rx="1.75" fill="url(#hp-bar)" />
      <rect x="940" y="310" width="70" height="16" rx="8" fill="#f3e2b8" opacity="0.35" filter="url(#hp-soft)" />
      <rect x="140" y="334" width="40" height="3.5" rx="1.75" fill="#b9463f" opacity="0.85" />

      {/* Wheels */}
      {[330, 830].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="414" r="66" fill="#232529" />
          <circle cx={cx} cy="414" r="46" fill="#e2e2dc" stroke="#c4c5bf" />
          {Array.from({ length: 5 }, (_, i) => {
            const a = (i * 72 * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={cx}
                y1={414}
                x2={cx + Math.cos(a) * 42}
                y2={414 + Math.sin(a) * 42}
                stroke="#b9bab3"
                strokeWidth="7"
                strokeLinecap="round"
              />
            );
          })}
          <circle cx={cx} cy="414" r="9" fill="#9c8150" />
        </g>
      ))}

      {/* Exploded parts */}
      {/* Door, lifted and tilted */}
      <g transform="translate(470 74) rotate(-8)">
        <path d="M0 40 L262 20 L276 132 L18 150 Z" fill="url(#hp-part)" stroke="rgba(22,26,22,0.16)" />
        <path d="M24 46 L232 30 L240 74 L28 88 Z" fill="url(#hp-glass)" opacity="0.85" />
        <rect x="196" y="100" width="34" height="5" rx="2.5" fill="rgba(22,26,22,0.25)" />
      </g>
      {/* Spare wheel, rotated in perspective */}
      <g transform="translate(1060 170)">
        <ellipse cx="0" cy="0" rx="30" ry="64" fill="#232529" />
        <ellipse cx="6" cy="0" rx="20" ry="44" fill="#e2e2dc" stroke="#c4c5bf" />
        <ellipse cx="8" cy="0" rx="6" ry="12" fill="#9c8150" />
      </g>
      {/* Seat */}
      <g transform="translate(250 150) rotate(6)">
        <path d="M10 70 C6 30 14 6 34 2 C48 0 54 12 52 34 L48 70 Z" fill="url(#hp-part)" stroke="rgba(22,26,22,0.16)" />
        <path d="M10 70 L92 70 C98 70 100 78 96 84 L18 90 C10 90 8 80 10 70 Z" fill="url(#hp-part)" stroke="rgba(22,26,22,0.16)" />
      </g>
      {/* Mirror */}
      <g transform="translate(820 150) rotate(-14)">
        <path d="M0 18 C0 6 12 0 30 0 L48 2 C56 4 56 22 48 26 L12 30 C4 30 0 26 0 18 Z" fill="url(#hp-part)" stroke="rgba(22,26,22,0.16)" />
      </g>
      {/* Small fixings */}
      <g fill="#cfd0c9" stroke="rgba(22,26,22,0.15)">
        <circle cx="400" cy="112" r="5" />
        <circle cx="780" cy="96" r="4" />
        <rect x="960" y="88" width="14" height="6" rx="2" transform="rotate(20 967 91)" />
      </g>

      {/* Numbered leader-line callouts */}
      <g style={{ fontFamily: "var(--font-body)" }} fontSize="15" fill="#161a16">
        <g>
          <circle cx="975" cy="318" r="4" fill="#9c8150" />
          <polyline points="975,318 1050,540 1190,540" fill="none" stroke="#161a16" strokeOpacity="0.5" />
          <text x="1190" y="530" textAnchor="end">
            <tspan fontSize="12" fill="#7a6236">{callouts[0].n}</tspan>
            <tspan dx="8">{callouts[0].label}</tspan>
          </text>
        </g>
        <g>
          <circle cx="560" cy="556" r="4" fill="#5fb3a6" />
          <polyline points="560,556 600,604 760,604" fill="none" stroke="#161a16" strokeOpacity="0.5" />
          <text x="608" y="596">
            <tspan fontSize="12" fill="#7a6236">{callouts[1].n}</tspan>
            <tspan dx="8">{callouts[1].label}</tspan>
          </text>
        </g>
        <g>
          <circle cx="600" cy="140" r="4" fill="#9c8150" />
          <polyline points="600,140 560,40 400,40" fill="none" stroke="#161a16" strokeOpacity="0.5" />
          <text x="400" y="30">
            <tspan fontSize="12" fill="#7a6236">{callouts[2].n}</tspan>
            <tspan dx="8">{callouts[2].label}</tspan>
          </text>
        </g>
      </g>
    </svg>
  );
}
