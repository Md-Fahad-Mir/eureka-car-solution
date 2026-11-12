import type { DateKey, LocalizedText } from "./common";

/** Placeholder testimonial. Always `isSample: true` until real, consented quotes exist. */
export type Testimonial = {
  id: string;
  name: LocalizedText;
  city: LocalizedText;
  vehicleLabel: string;
  quote: LocalizedText;
  rating: 1 | 2 | 3 | 4 | 5;
  isSample: true;
};

/* ── EV Education Centre ── */

export const EV_TOPICS = [
  "what-is-an-ev",
  "how-evs-work",
  "compare-powertrains",
  "battery-technology",
  "charging",
  "maintenance",
  "benefits-and-limitations",
  "ownership-guide-bangladesh",
] as const;
export type EvTopic = (typeof EV_TOPICS)[number];

/** Diagrams are components (SVG/HTML) with localised labels. */
export const EV_DIAGRAMS = ["powertrainSpectrum", "drivetrain", "batteryPack", "chargingLevels", "chargingCurve"] as const;
export type EvDiagram = (typeof EV_DIAGRAMS)[number];

export type ArticleBlock =
  | { type: "p"; text: LocalizedText }
  | { type: "list"; items: LocalizedText[]; ordered?: boolean }
  | { type: "callout"; tone: "tip" | "caution" | "local"; text: LocalizedText }
  | { type: "diagram"; diagram: EvDiagram; caption: LocalizedText }
  | { type: "table"; caption: LocalizedText; columns: LocalizedText[]; rows: { label: LocalizedText; cells: LocalizedText[] }[] }
  /** Interactive charging-time explainer. */
  | { type: "chargingExplainer" }
  /** Energy cost per km, computed from the calculator's sample prices. */
  | { type: "costPerKm" };

export type ArticleSection = { id: string; title: LocalizedText; blocks: ArticleBlock[] };

export type EvArticle = {
  slug: EvTopic;
  title: LocalizedText;
  summary: LocalizedText;
  /** Last content review (shown on the page). */
  updatedAt: DateKey;
  sections: ArticleSection[];
  faqs: { q: LocalizedText; a: LocalizedText }[];
  related: EvTopic[];
  /** Extra call to action next to the savings calculator and EV listings. */
  cta?: "service" | "testDrive";
};

/** An article with fields derived by the API (reading time). */
export type EvArticleWithMeta = EvArticle & { readingMinutes: number };
