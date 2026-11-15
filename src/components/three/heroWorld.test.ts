import { describe, expect, it } from "vitest";
import { HERO_CHAPTER_KEYFRAMES, HERO_CHAPTERS, HERO_FINALE, HERO_KEYFRAME_COUNT } from "@/config/hero";
import { KEYFRAME_CAPS } from "./heroWorld";

describe("hero keyframes", () => {
  it("match the chapter config used by the chapter index", () => {
    expect(KEYFRAME_CAPS).toHaveLength(HERO_KEYFRAME_COUNT);
    expect(HERO_CHAPTER_KEYFRAMES).toHaveLength(HERO_CHAPTERS.length);
    HERO_CHAPTER_KEYFRAMES.forEach((k, i) => expect(KEYFRAME_CAPS[k]).toBe(i));
  });

  it("run intro → every chapter in order → finale", () => {
    expect(KEYFRAME_CAPS[0]).toBe(-1);
    expect(KEYFRAME_CAPS.at(-1)).toBe(HERO_FINALE);
    KEYFRAME_CAPS.slice(1).forEach((c, i) => expect(c).toBeGreaterThanOrEqual(KEYFRAME_CAPS[i]));
  });
});
