import { describe, expect, it } from "vitest";
import { EV_TOPICS, type LocalizedText } from "@/types";
import { evArticles } from "./index";

/** Every LocalizedText inside a value. */
function texts(value: unknown): LocalizedText[] {
  if (!value || typeof value !== "object") return [];
  if ("en" in value && "bn" in value && typeof (value as LocalizedText).en === "string") return [value as LocalizedText];
  return Object.values(value).flatMap(texts);
}

describe("EV articles", () => {
  it("covers every topic once, in reading order", () => {
    expect(evArticles.map((a) => a.slug)).toEqual([...EV_TOPICS]);
  });

  it("has English and Bangla for every text, with Bangla digits", () => {
    for (const a of evArticles) {
      for (const t of texts(a)) {
        expect(t.en.trim(), a.slug).not.toBe("");
        expect(t.bn.trim(), `${a.slug}: ${t.en}`).not.toBe("");
        // Latin technical tokens (kWh, V6, 4WD…) may contain digits; Bangla prose uses Bangla digits.
        const prose = t.bn.replace(/[A-Za-z][A-Za-z0-9/.-]*|\d+[A-Za-z]+/g, "");
        expect(prose, `${a.slug}: ${t.bn}`).not.toMatch(/[0-9]/);
      }
    }
  });

  it("has unique section ids, valid related links and at least three FAQs", () => {
    for (const a of evArticles) {
      const ids = a.sections.map((s) => s.id);
      expect(new Set(ids).size, a.slug).toBe(ids.length);
      expect(a.related.every((r) => r !== a.slug && EV_TOPICS.includes(r)), a.slug).toBe(true);
      expect(a.faqs.length, a.slug).toBeGreaterThanOrEqual(3);
    }
  });

  it("puts the interactive pieces where the guides need them", () => {
    const blocks = (slug: string) => evArticles.find((a) => a.slug === slug)!.sections.flatMap((s) => s.blocks.map((b) => b.type));
    expect(blocks("charging")).toContain("chargingExplainer");
    expect(blocks("compare-powertrains")).toEqual(expect.arrayContaining(["table", "costPerKm"]));
  });
});
