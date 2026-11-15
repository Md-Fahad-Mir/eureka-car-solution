/**
 * Homepage 3D hero configuration.
 *
 * The hero car is the "CarConcept" model from the Khronos glTF Sample Assets,
 * CC BY 4.0, © 2024 Darmstadt Graphics Group GmbH, model and textures by Eric
 * Chadwick. Khronos / 3D Commerce logos were removed and geometry compressed
 * (see scripts/prepare-hero-car.mjs). To use a different car, replace
 * public/models/hero-car.glb (Draco and Meshopt compression are supported) and
 * update `credit` and `paintMaterialPattern` below.
 */
export const heroConfig = {
  modelUrl: "/models/hero-car.glb",
  /** Self-hosted Draco decoder (only fetched for Draco-compressed models). */
  dracoPath: "/draco/",
  /** Which model materials take the selectable finish. null = detect by name heuristics. */
  paintMaterialPattern: /^paint 1\b/i as RegExp | null,
  /** Credit shown under the hero (CC BY requires attribution and noting changes). */
  credit: {
    title: "Car Concept",
    author: "Eric Chadwick",
    holder: "Darmstadt Graphics Group GmbH",
    year: 2024,
    licence: "CC BY 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0/",
    sourceUrl: "https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept",
  },
  /**
   * Total height of the scroll story, matching the reference showcase (1400vh:
   * about one screen of scrolling per keyframe), then the normal sections continue.
   */
  scrollLengthVh: 1400,
  /** Selectable finishes, as in the reference (labels in messages `hero.finishes.*`). */
  finishes: [
    { key: "crimson", hex: "#8c1428" },
    { key: "sapphire", hex: "#1d3a8f" },
    { key: "orange", hex: "#e2571e" },
    { key: "teal", hex: "#0e8a8f" },
    { key: "lime", hex: "#8fc31f" },
    { key: "champagne", hex: "#a8875a" },
  ],
  /**
   * Chroma chapter: a line of light repaints the body in this finish (index into
   * `finishes`), or in `chromaAltFinish` if the visitor already chose that one.
   */
  chromaFinish: 2,
  chromaAltFinish: 3,
  /** Rendering budget. */
  maxDpr: 1.75,
  minDpr: 1,
} as const;

/** The reference's seven chapters (copy in messages `hero.chapters.*`). */
export const HERO_CHAPTERS = ["awakening", "form", "finish", "chroma", "engineering", "deconstructed", "drive"] as const;
export type HeroChapter = (typeof HERO_CHAPTERS)[number];
/** Keyframe at which each chapter settles (chapter index links scroll here), out of `HERO_KEYFRAME_COUNT`. */
export const HERO_CHAPTER_KEYFRAMES = [1, 2, 4, 5, 7, 8, 11] as const;
export const HERO_KEYFRAME_COUNT = 13;
/** World caption state after the last chapter: the finale over the tunnel. */
export const HERO_FINALE = HERO_CHAPTERS.length;
