import type { BodyType } from "@/types";

/**
 * Original side-profile silhouettes (480×240 viewBox, nose to the right).
 * `top` runs from the rear-bottom corner over the roof to the front-bottom
 * corner; wheel arches are cut along the ground line by `bodyPath`.
 */
export type Silhouette = {
  top: string;
  windows: string;
  wheels: [cx: number, cy: number, r: number][];
  /** Draw the shape as-is (no arch cut-outs), e.g. tractors. */
  raw?: boolean;
  extras?: string;
};

export const GROUND_Y = 182;

export const SILHOUETTES: Record<BodyType, Silhouette> = {
  sedan: {
    top: "M36 182 L34 156 C34 142 46 136 70 132 L128 126 C160 100 196 84 246 82 C290 82 318 96 342 118 L404 126 C432 130 446 142 446 160 L446 182",
    windows: "M150 124 C176 102 204 92 244 91 C280 91 304 102 324 120 Z",
    wheels: [
      [118, 180, 28],
      [364, 180, 28],
    ],
    extras: "M236 92 L232 124",
  },
  hatchback: {
    top: "M60 182 L58 150 C58 126 70 104 92 96 C130 84 170 80 220 80 C262 80 292 94 318 116 L380 126 C406 130 420 142 420 160 L420 182",
    windows: "M98 116 C106 104 122 96 152 93 L220 91 C252 91 276 102 296 118 Z",
    wheels: [
      [130, 180, 28],
      [350, 180, 28],
    ],
    extras: "M206 92 L204 118",
  },
  crossover: {
    top: "M44 182 L42 148 C42 128 54 114 80 110 L120 106 C150 84 190 70 248 70 C292 70 322 84 346 106 L404 116 C430 120 440 134 440 156 L440 182",
    windows: "M128 104 C156 86 194 78 246 78 C284 78 308 90 328 106 Z",
    wheels: [
      [122, 180, 32],
      [360, 180, 32],
    ],
    extras: "M236 79 L232 106",
  },
  suv: {
    top: "M40 182 L38 120 C38 98 48 76 70 70 L280 64 C306 64 324 76 342 100 L410 110 C434 114 444 128 444 150 L444 182",
    windows: "M64 102 L72 80 L276 74 C296 74 310 84 324 102 Z",
    wheels: [
      [118, 180, 33],
      [366, 180, 33],
    ],
    extras: "M150 77 L148 102 M232 75 L230 102",
  },
  mpv: {
    top: "M40 182 L38 96 C38 72 50 58 76 56 L300 54 C334 54 356 70 380 98 L420 116 C438 122 444 134 444 152 L444 182",
    windows: "M60 100 L64 70 L298 66 C324 66 340 78 356 100 Z",
    wheels: [
      [120, 180, 30],
      [370, 180, 30],
    ],
    extras: "M150 68 L148 100 M246 66 L244 100 M150 108 L246 108",
  },
  pickup: {
    top: "M30 182 L30 118 L196 118 L198 80 C200 72 206 68 216 68 L300 66 C320 66 334 76 350 100 L416 112 C438 116 450 128 450 148 L450 182",
    windows: "M214 100 L218 78 L298 76 C314 76 324 84 334 100 Z",
    wheels: [
      [110, 180, 32],
      [370, 180, 32],
    ],
    extras: "M30 128 L196 128 M266 77 L264 100",
  },
  van: {
    top: "M26 182 L24 70 C24 56 34 46 50 46 L360 44 C384 44 398 56 412 80 L440 116 C450 128 454 140 454 156 L454 182",
    windows: "M60 92 L62 62 L350 60 C366 60 378 70 388 92 Z",
    wheels: [
      [104, 180, 28],
      [376, 180, 28],
    ],
    extras: "M130 61 L130 92 M200 61 L200 92 M270 60 L270 92 M300 100 L300 172",
  },
  truck: {
    top: "M20 182 L20 50 L298 50 L298 150 L318 150 L320 70 C320 58 328 52 342 52 L420 52 C436 52 444 60 448 76 L456 140 L456 182",
    windows: "M340 64 L424 64 C432 64 436 70 438 78 L444 110 L340 110 Z",
    wheels: [
      [96, 180, 30],
      [380, 180, 30],
    ],
    extras: "M20 140 L298 140 M90 50 L90 140 M160 50 L160 140 M230 50 L230 140",
  },
  tractor: {
    raw: true,
    top: "M84 150 L104 108 L150 102 L154 44 L170 38 L242 38 L246 102 L404 112 C424 114 436 126 436 142 L436 160 L84 160 Z",
    windows: "M162 50 L236 50 L238 100 L160 100 Z",
    wheels: [
      [150, 166, 56],
      [392, 178, 30],
    ],
    extras: "M300 112 L300 160 M330 112 L330 160 M360 112 L360 160",
  },
};

/** Body outline with wheel arches cut out of the ground line. */
export function bodyPath(s: Silhouette): string {
  if (s.raw) return s.top;
  const arches = [...s.wheels]
    .sort((a, b) => b[0] - a[0])
    .map(([cx, , r]) => {
      const a = r + 6;
      return `L${cx + a} ${GROUND_Y} A${a} ${a} 0 0 0 ${cx - a} ${GROUND_Y}`;
    })
    .join(" ");
  return `${s.top} ${arches} Z`;
}
