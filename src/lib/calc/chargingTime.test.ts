import { describe, expect, it } from "vitest";
import { chargingTime } from "./chargingTime";

const base = { batteryKwh: 60, fromPct: 20, toPct: 80, onboardAcKw: 7.4 };

describe("chargingTime", () => {
  it("AC charging is energy ÷ effective power", () => {
    const r = chargingTime({ ...base, chargerKw: 7.4, kind: "ac" });
    // 36 kWh at 7.4 × 0.9 = 6.66 kW → 5.405 h
    expect(r.batteryKwh).toBe(36);
    expect(r.hours).toBeCloseTo(36 / 6.66, 6);
    expect(r.gridKwh).toBeCloseTo(40, 6);
    expect(r.rangeKm).toBeCloseTo(240, 6);
  });

  it("the car's on-board charger caps AC power", () => {
    const capped = chargingTime({ ...base, chargerKw: 11, kind: "ac", onboardAcKw: 6.6 });
    expect(capped.effectiveKw).toBeCloseTo(6.6 * 0.9, 6);
  });

  it("DC charging slows above 80%", () => {
    const to80 = chargingTime({ ...base, chargerKw: 50, kind: "dc" });
    const to100 = chargingTime({ ...base, toPct: 100, chargerKw: 50, kind: "dc" });
    expect(to80.hours).toBeCloseTo(36 / 46.5, 6);
    // the last 20% (12 kWh) runs at 35% power: nearly as long as 20→80% (36 kWh)
    const lastLeg = to100.hours - to80.hours;
    expect(lastLeg).toBeCloseTo(12 / (46.5 * 0.35), 6);
    expect(lastLeg / 12).toBeGreaterThan((to80.hours / 36) * 2.5);
  });

  it("returns zero when there is nothing to add", () => {
    expect(chargingTime({ ...base, fromPct: 80, toPct: 60, chargerKw: 7.4, kind: "ac" }).hours).toBe(0);
  });
});
