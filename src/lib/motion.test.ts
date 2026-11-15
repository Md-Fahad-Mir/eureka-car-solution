import { describe, expect, it } from "vitest";
import { easeOutQuart, stagger, tweenAt } from "./motion";

describe("motion helpers", () => {
  it("stagger sets the index and an optional delay", () => {
    expect(stagger(3)).toEqual({ "--i": 3 });
    expect(stagger(1, 120)).toEqual({ "--i": 1, "--delay": "120ms" });
  });

  it("eases from start to end and clamps outside 0..1", () => {
    expect(easeOutQuart(0)).toBe(0);
    expect(easeOutQuart(1)).toBe(1);
    expect(easeOutQuart(0.5)).toBeGreaterThan(0.5);
    expect(tweenAt(10, 20, -1)).toBe(10);
    expect(tweenAt(10, 20, 2)).toBe(20);
    expect(tweenAt(20, 10, 1)).toBe(10);
  });
});
