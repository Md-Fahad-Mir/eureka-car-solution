import { describe, expect, it } from "vitest";
import { HERO_CHAPTER_KEYFRAMES, HERO_CHAPTERS, HERO_EXPLORE, HERO_KEYFRAME_COUNT } from "@/config/hero";
import { arcLength, INTRO, introPose, KEYFRAME_CAPS, KEYS, PATH, pathPose, pitchFor, rollFor, scrollPose, spinFor, steerFor } from "./choreography";

describe("hero keyframes", () => {
  it("match the chapter config used by the chapter index", () => {
    expect(KEYFRAME_CAPS).toHaveLength(HERO_KEYFRAME_COUNT);
    expect(HERO_CHAPTER_KEYFRAMES).toHaveLength(HERO_CHAPTERS.length);
    HERO_CHAPTER_KEYFRAMES.forEach((k, i) => expect(KEYFRAME_CAPS[k]).toBe(i));
  });

  it("run hero → every chapter in order → explore", () => {
    expect(KEYFRAME_CAPS[0]).toBe(-1);
    expect(KEYFRAME_CAPS.at(-1)).toBe(HERO_EXPLORE);
    KEYFRAME_CAPS.slice(1).forEach((c, i) => expect(c).toBeGreaterThanOrEqual(KEYFRAME_CAPS[i]));
  });
});

describe("drive path", () => {
  it("is straight before and after the lane change, and turns left then straightens through it", () => {
    const start = pathPose(0);
    expect(start.z).toBeCloseTo(0);
    expect(start.yaw).toBeCloseTo(0);
    expect(start.curvature).toBeCloseTo(0);
    const after = pathPose(PATH.bendEnd + 1);
    expect(after.z).toBeCloseTo(PATH.laneShift);
    expect(after.yaw).toBeCloseTo(0);
    const mid = pathPose((PATH.bendStart + PATH.bendEnd) / 2);
    expect(mid.yaw).toBeGreaterThan(0); // heading left (towards -z)
    expect(pathPose(PATH.bendStart + 2).curvature).toBeGreaterThan(0); // turning in
    expect(pathPose(PATH.bendEnd - 2).curvature).toBeLessThan(0); // straightening out
  });

  it("measures the distance actually travelled (longer than x through the bend)", () => {
    expect(arcLength(0)).toBeCloseTo(0, 6);
    expect(arcLength(5)).toBeCloseTo(5, 3);
    expect(arcLength(PATH.introStart)).toBeCloseTo(PATH.introStart, 3);
    const end = arcLength(PATH.end);
    expect(end).toBeGreaterThan(PATH.end);
    expect(end).toBeLessThan(PATH.end * 1.05);
    for (let s = PATH.introStart; s < PATH.end; s += 0.5) expect(arcLength(s + 0.5)).toBeGreaterThan(arcLength(s));
  });
});

describe("vehicle dynamics", () => {
  it("rolls the wheels without slipping: one turn per circumference travelled", () => {
    expect(spinFor(2 * Math.PI * 0.36, 0.36)).toBeCloseTo(-2 * Math.PI);
    expect(spinFor(0, 0.36)).toBe(-0);
  });

  it("steers into the curve (bicycle model) and leans out of it", () => {
    expect(steerFor(2.7, 0)).toBe(0);
    expect(steerFor(2.7, 0.05)).toBeCloseTo(Math.atan(0.135));
    expect(steerFor(2.7, -0.05)).toBeLessThan(0);
    expect(rollFor(10, 0.05)).toBeGreaterThan(0);
    expect(rollFor(100, 1)).toBe(0.016); // capped: the arches stay round the tyres
  });

  it("squats when accelerating and dives when braking, within limits", () => {
    expect(pitchFor(2)).toBeGreaterThan(0);
    expect(pitchFor(-2)).toBeLessThan(0);
    expect(pitchFor(1000)).toBe(0.01);
  });
});

describe("choreography timing", () => {
  it("ends the intro exactly on the hero composition, with the car stopped at the start", () => {
    const end = introPose(INTRO.end);
    expect(end.cam[0]).toBeCloseTo(KEYS[0].cam[0]);
    expect(end.cam[2]).toBeCloseTo(KEYS[0].cam[2]);
    expect(end.s).toBeCloseTo(0);
    expect(end.head).toBe(1);
    expect(introPose(0)).toMatchObject({ s: PATH.introStart, head: 0, lights: 0 });
  });

  it("keeps the car rolling through the drive keyframes (no stop at each one) and stops at the end", () => {
    expect(scrollPose(3).s).toBe(0);
    const s4 = scrollPose(4).s, s5 = scrollPose(5).s;
    expect(s4).toBeGreaterThan(0);
    expect(s5).toBeGreaterThan(s4);
    expect(scrollPose(4.02).s).toBeGreaterThan(s4);
    expect(scrollPose(6).s).toBeCloseTo(PATH.end);
    expect(scrollPose(8).s).toBeCloseTo(PATH.end);
  });
});
