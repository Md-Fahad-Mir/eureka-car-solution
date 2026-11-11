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
  /** Total height of the scroll story (brief: 350–450vh), then normal sections continue. */
  scrollLengthVh: 450,
  /** Selectable finishes (labels in messages `hero.finishes.*`). */
  finishes: [
    { key: "crimson", hex: "#8c1428" },
    { key: "sapphire", hex: "#1d3a8f" },
    { key: "graphite", hex: "#3a3d42" },
    { key: "teal", hex: "#0e8a8f" },
    { key: "pearl", hex: "#e9e6de" },
    { key: "champagne", hex: "#a8875a" },
  ],
  /** Matte studio clay used in the engineering chapter (ref. images 1 & 4). */
  clayHex: "#e9e8e3",
  /** Rendering budget. */
  maxDpr: 1.75,
  minDpr: 1,
} as const;

export type HeroChapter = "awakening" | "finish" | "engineering" | "drive";
export const HERO_CHAPTERS: HeroChapter[] = ["awakening", "finish", "engineering", "drive"];
