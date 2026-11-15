/**
 * Homepage 3D hero configuration.
 *
 * Everything model-specific lives in `heroModel`, so swapping the car (e.g.
 * for a licensed Toyota Land Cruiser Prado model) is: run
 * `npm run prepare:hero-car -- <source.gltf>` to write public/models/hero-car.glb,
 * then update `heroModel` (credit, paint material, colour, feature anchors) and
 * the matching `hero.features.*` copy. The choreography adapts to the model's
 * size (camera targets follow its height; framing is measured, not hard-coded).
 *
 * Current model: "CarConcept" from the Khronos glTF Sample Assets, CC BY 4.0,
 * © 2024 Darmstadt Graphics Group GmbH, model and textures by Eric Chadwick.
 * Khronos / 3D Commerce logos were removed and the geometry compressed.
 */

/** A point on the car, in fractions of its box: x along the length (-1 rear … 1 nose), y up the height (0 … 1), z across (-1 … 1, +1 = right side). */
export type CarAnchor = readonly [number, number, number];

export const heroModel = {
  url: "/models/hero-car.glb",
  /** Which model materials take the paint. null = detect by name heuristics. */
  paintMaterialPattern: /^paint 1\b/i as RegExp | null,
  /** Body colour (pearl white, as in the reference renders). */
  paint: { hex: "#e8e6e0", metalness: 0.28, roughness: 0.3, iridescence: 0.18 },
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
   * Technology chapter: features pointed out with numbered leader lines.
   * Labels in messages `hero.features.<key>`; they must describe what this model really shows.
   */
  features: [
    { key: "lamps", at: [0.93, 0.55, 0.62] },
    { key: "wheels", at: [0.58, 0.3, 1] },
    { key: "cabin", at: [-0.05, 0.62, -0.35] },
    { key: "tail", at: [-0.97, 0.78, 0.2] },
  ] as const satisfies readonly { key: string; at: CarAnchor }[],
} as const;

export const heroConfig = {
  /** Self-hosted Draco decoder (only fetched for Draco-compressed models). */
  dracoPath: "/draco/",
  /** Total height of the scroll story (about 1.25 screens per keyframe), then the page continues. */
  scrollLengthVh: 1000,
  /** Rendering budget. */
  maxDpr: 1.75,
  minDpr: 1,
} as const;

/** Story chapters after the intro (copy in messages `hero.chapters.*`). */
export const HERO_CHAPTERS = ["overview", "design", "performance", "technology", "interior", "explore"] as const;
export type HeroChapter = (typeof HERO_CHAPTERS)[number];
/** Keyframe at which each chapter settles (chapter index links scroll here), out of `HERO_KEYFRAME_COUNT`. */
export const HERO_CHAPTER_KEYFRAMES = [1, 2, 4, 6, 7, 8] as const;
export const HERO_KEYFRAME_COUNT = 9;
/** The last chapter: the camera is handed to the visitor (drag to look around, views, zoom). */
export const HERO_EXPLORE = HERO_CHAPTERS.indexOf("explore");
