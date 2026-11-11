import { describe, expect, it } from "vitest";
import { onRoadEstimate, registrationEstimate } from "./onRoad";

const base = { fuelType: "petrol", category: "car", condition: "new", price: { amount: 4_000_000 } } as const;

describe("on-road estimate", () => {
  it("bands registration by engine size", () => {
    expect(registrationEstimate({ ...base, engine: { displacementCc: 1496, powerHp: 1, torqueNm: 1 } }).amount).toBe(140_000);
    expect(registrationEstimate({ ...base, engine: { displacementCc: 1500, powerHp: 1, torqueNm: 1 } }).amount).toBe(140_000);
    expect(registrationEstimate({ ...base, engine: { displacementCc: 1998, powerHp: 1, torqueNm: 1 } }).amount).toBe(195_000);
    expect(registrationEstimate({ ...base, engine: { displacementCc: 2755, powerHp: 1, torqueNm: 1 } }).amount).toBe(320_000);
    expect(registrationEstimate({ ...base, engine: { displacementCc: 3500, powerHp: 1, torqueNm: 1 } }).amount).toBe(450_000);
  });

  it("uses flat amounts for EVs, commercial vehicles and tractors, and transfer for registered used cars", () => {
    expect(registrationEstimate({ ...base, fuelType: "ev" }).amount).toBe(120_000);
    expect(registrationEstimate({ ...base, category: "commercial", fuelType: "diesel" }).amount).toBe(95_000);
    expect(registrationEstimate({ ...base, category: "tractor", fuelType: "diesel" }).amount).toBe(35_000);
    expect(
      registrationEstimate({ ...base, condition: "used", history: { owners: 1, registrationYear: 2019, serviceRecords: true } }),
    ).toEqual({ amount: 25_000, isTransfer: true });
  });

  it("adds registration, 1.5% insurance and documentation to the price", () => {
    const e = onRoadEstimate({ ...base, engine: { displacementCc: 1798, powerHp: 1, torqueNm: 1 } });
    expect(e.insurance).toBe(60_000);
    expect(e.total).toBe(4_000_000 + 195_000 + 60_000 + 15_000);
  });
});
