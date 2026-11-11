import { describe, expect, it } from "vitest";
import { compareRunningCosts, energyCostPerKm, toAnnualKm, tractorFuelCost, type CostOption, type EnergyPrices } from "./runningCost";

const prices: EnergyPrices = { petrolPerLitre: 130, dieselPerLitre: 105, electricityPerKwh: 10 };

const ev: CostOption = { id: "ev", fuelType: "ev", kWhPer100km: 16, annualMaintenance: 15_000, purchasePrice: 4_500_000 };
const petrol: CostOption = { id: "petrol", fuelType: "petrol", kmPerLitre: 13, annualMaintenance: 35_000, purchasePrice: 3_800_000 };
const diesel: CostOption = { id: "diesel", fuelType: "diesel", kmPerLitre: 10.5, annualMaintenance: 42_000, purchasePrice: 7_500_000 };
const hybrid: CostOption = { id: "hybrid", fuelType: "hybrid", kmPerLitre: 20, annualMaintenance: 30_000, purchasePrice: 4_200_000 };

describe("toAnnualKm", () => {
  it("converts per day / month / year", () => {
    expect(toAnnualKm(40, "day")).toBe(14_600);
    expect(toAnnualKm(1_200, "month")).toBe(14_400);
    expect(toAnnualKm(15_000, "year")).toBe(15_000);
    expect(toAnnualKm(-5, "day")).toBe(0);
  });
});

describe("energyCostPerKm", () => {
  it("prices each powertrain with the right energy source", () => {
    expect(energyCostPerKm(ev, prices)).toBeCloseTo(1.6, 10); // 16 kWh/100km × ৳10
    expect(energyCostPerKm(petrol, prices)).toBeCloseTo(10, 10); // ৳130 / 13 km/L
    expect(energyCostPerKm(diesel, prices)).toBeCloseTo(10, 10); // ৳105 / 10.5 km/L
    expect(energyCostPerKm(hybrid, prices)).toBeCloseTo(6.5, 10); // ৳130 / 20 km/L
  });

  it("blends PHEV fuel and electric costs by electric share", () => {
    const phev: CostOption = { id: "phev", fuelType: "phev", kmPerLitre: 16, kWhPer100km: 20, annualMaintenance: 0, electricShare: 0.6 };
    // 0.6 × (0.2 × 10) + 0.4 × (130 / 16) = 1.2 + 3.25
    expect(energyCostPerKm(phev, prices)).toBeCloseTo(4.45, 10);
    expect(energyCostPerKm({ ...phev, electricShare: 0 }, prices)).toBeCloseTo(8.125, 10);
    expect(energyCostPerKm({ ...phev, electricShare: 1 }, prices)).toBeCloseTo(2, 10);
    expect(energyCostPerKm({ ...phev, electricShare: 7 }, prices)).toBeCloseTo(2, 10); // clamped
  });

  it("returns null when efficiency is missing or invalid", () => {
    expect(energyCostPerKm({ id: "x", fuelType: "petrol", annualMaintenance: 0 }, prices)).toBeNull();
    expect(energyCostPerKm({ id: "x", fuelType: "ev", kWhPer100km: 0, annualMaintenance: 0 }, prices)).toBeNull();
  });
});

describe("compareRunningCosts", () => {
  const result = compareRunningCosts({ options: [ev, petrol, diesel, hybrid], prices, annualKm: 14_600, years: 5 });
  const byId = Object.fromEntries(result.results.map((r) => [r.id, r]));

  it("computes annual, monthly, per-km and period costs", () => {
    // EV: 1.6 × 14,600 = 23,360 energy + 15,000 maintenance
    expect(byId.ev.annualEnergy).toBeCloseTo(23_360, 6);
    expect(byId.ev.annualTotal).toBeCloseTo(38_360, 6);
    expect(byId.ev.monthlyTotal).toBeCloseTo(38_360 / 12, 6);
    expect(byId.ev.costPerKm).toBeCloseTo(38_360 / 14_600, 10);
    expect(byId.ev.periodTotal).toBeCloseTo(38_360 * 5, 6);
    // Diesel: 10 × 14,600 + 42,000
    expect(byId.diesel.annualTotal).toBeCloseTo(188_000, 6);
  });

  it("identifies the most and least expensive options to run", () => {
    expect(result.mostExpensiveId).toBe("diesel");
    expect(result.cheapestId).toBe("ev");
  });

  it("reports savings vs the most expensive option over the period", () => {
    expect(byId.diesel.savingsVsMostExpensive).toBe(0);
    expect(byId.ev.savingsVsMostExpensive).toBeCloseTo((188_000 - 38_360) * 5, 6);
  });

  it("break-even: cheaper to buy and run → 0; dearer to buy → gap / annual saving; baseline → null", () => {
    expect(byId.ev.breakEvenYears).toBe(0); // ৳45L < ৳75L and cheaper to run
    expect(byId.diesel.breakEvenYears).toBeNull();
    const pricey = compareRunningCosts({
      options: [{ ...ev, purchasePrice: 5_000_000 }, petrol],
      prices,
      annualKm: 14_600,
      years: 5,
    });
    const evR = pricey.results.find((r) => r.id === "ev")!;
    const petrolR = pricey.results.find((r) => r.id === "petrol")!;
    // gap 12,00,000 / (181,000 − 38,360)
    expect(evR.breakEvenYears).toBeCloseTo(1_200_000 / (petrolR.annualTotal - evR.annualTotal), 10);
  });

  it("cumulative series starts at the purchase price and grows by the annual total", () => {
    expect(byId.ev.cumulative).toHaveLength(6);
    expect(byId.ev.cumulative[0]).toBe(4_500_000);
    expect(byId.ev.cumulative[5]).toBeCloseTo(4_500_000 + 38_360 * 5, 6);
  });

  it("without purchase prices, break-even is unknown and cumulative starts at 0", () => {
    const noPrice = compareRunningCosts({
      options: [{ ...ev, purchasePrice: undefined }, petrol],
      prices,
      annualKm: 10_000,
      years: 3,
    });
    expect(noPrice.results.every((r) => r.breakEvenYears === null && r.cumulative[0] === 0)).toBe(true);
  });

  it("skips options that cannot be costed and handles empty input", () => {
    const partial = compareRunningCosts({
      options: [ev, { id: "bad", fuelType: "petrol", annualMaintenance: 1 }],
      prices,
      annualKm: 1,
      years: 1,
    });
    expect(partial.results.map((r) => r.id)).toEqual(["ev"]);
    expect(compareRunningCosts({ options: [], prices, annualKm: 1, years: 1 }).mostExpensiveId).toBeNull();
  });

  it("zero distance leaves only maintenance", () => {
    const zero = compareRunningCosts({ options: [ev], prices, annualKm: 0, years: 2 });
    expect(zero.results[0].annualTotal).toBe(15_000);
  });
});

describe("tractorFuelCost", () => {
  it("costs per working hour, month and year", () => {
    const c = tractorFuelCost({ litresPerHour: 2.6, dieselPerLitre: 105, hoursPerDay: 6, daysPerMonth: 20 });
    expect(c.perHour).toBeCloseTo(273, 10);
    expect(c.monthly).toBeCloseTo(273 * 120, 8);
    expect(c.annual).toBeCloseTo(273 * 120 * 12, 6);
  });

  it("clamps negative inputs to zero", () => {
    expect(tractorFuelCost({ litresPerHour: -1, dieselPerLitre: 105, hoursPerDay: 6, daysPerMonth: 20 }).annual).toBe(0);
  });
});
