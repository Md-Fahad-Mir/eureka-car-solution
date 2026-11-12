import type { LocalizedText } from "@/types";

/** Shorthand for bilingual content. */
export const L = (en: string, bn: string): LocalizedText => ({ en, bn });

/** Date of the last content review for the EV guides. */
export const REVIEWED = "2026-11-12";
