import type { DistanceUnit } from "@/config/costs";
import type { FuelType } from "@/types";

/**
 * Running-cost and ownership-cost maths for the savings calculator, the
 * vehicle-detail calculator and the compare table. Pure and unrounded.
 */

export type EnergyPrices = {
  /** BDT per litre of petrol/octane (also used by hybrids and PHEVs in fuel mode). */
  petrolPerLitre: number;
  dieselPerLitre: number;
  electricityPerKwh: number;
};

export type CostOption = {
  id: string;
  fuelType: FuelType;
  /** Required for petrol, diesel, hybrid and PHEV (fuel mode). */
  kmPerLitre?: number;
  /** Required for EV and PHEV (electric mode). */
  kWhPer100km?: number;
  annualMaintenance: number;
  /** Only used for break-even and cumulative ownership cost. */
  purchasePrice?: number;
  /** PHEV only: share of distance driven on electricity, 0–1. */
  electricShare?: number;
};

export type CostResult = {
  id: string;
  /** Energy (fuel/electricity) cost per km, BDT. */
  energyPerKm: number;
  /** Energy + maintenance per km, BDT. */
  costPerKm: number;
  annualEnergy: number;
  annualMaintenance: number;
  annualTotal: number;
  monthlyTotal: number;
  /** Running cost over the ownership period (excludes purchase price). */
  periodTotal: number;
  /** Period running-cost saving vs the most expensive option (0 for that option). */
  savingsVsMostExpensive: number;
  /**
   * Years until this option's purchase + running cost drops below the most
   * expensive-to-run option. 0 = cheaper from day one, null = never or unknown
   * (no purchase prices, or it costs more to run).
   */
  breakEvenYears: number | null;
  /** Cumulative cost at the end of years 0…N (year 0 = purchase price, or 0 without prices). */
  cumulative: number[];
};

export type CostComparison = {
  annualKm: number;
  years: number;
  results: CostResult[];
  /** id of the option with the highest annual running cost. */
  mostExpensiveId: string | null;
  /** id of the option with the lowest annual running cost. */
  cheapestId: string | null;
};

const DAYS_PER_YEAR = 365;
const MONTHS_PER_YEAR = 12;

/** Converts a distance entered per day/month/year to km per year. */
export function toAnnualKm(value: number, unit: DistanceUnit): number {
  const v = Math.max(0, value);
  if (unit === "day") return v * DAYS_PER_YEAR;
  if (unit === "month") return v * MONTHS_PER_YEAR;
  return v;
}

const fuelCostPerKm = (pricePerLitre: number, kmPerLitre?: number) =>
  kmPerLitre && kmPerLitre > 0 ? pricePerLitre / kmPerLitre : null;
const electricCostPerKm = (pricePerKwh: number, kWhPer100km?: number) =>
  kWhPer100km && kWhPer100km > 0 ? (kWhPer100km / 100) * pricePerKwh : null;

/** Energy cost per km for one option, or null when its efficiency is missing. */
export function energyCostPerKm(option: CostOption, prices: EnergyPrices): number | null {
  switch (option.fuelType) {
    case "ev":
      return electricCostPerKm(prices.electricityPerKwh, option.kWhPer100km);
    case "diesel":
      return fuelCostPerKm(prices.dieselPerLitre, option.kmPerLitre);
    case "petrol":
    case "hybrid":
      return fuelCostPerKm(prices.petrolPerLitre, option.kmPerLitre);
    case "phev": {
      const share = Math.min(Math.max(option.electricShare ?? 0, 0), 1);
      const fuel = fuelCostPerKm(prices.petrolPerLitre, option.kmPerLitre);
      const electric = electricCostPerKm(prices.electricityPerKwh, option.kWhPer100km);
      if (share === 0) return fuel;
      if (share === 1) return electric;
      if (fuel === null || electric === null) return null;
      return share * electric + (1 - share) * fuel;
    }
  }
}

/**
 * Compares options over an ownership period. Options whose efficiency is
 * missing are skipped (they can't be costed honestly).
 */
export function compareRunningCosts(input: {
  options: CostOption[];
  prices: EnergyPrices;
  annualKm: number;
  years: number;
  includePurchase?: boolean;
}): CostComparison {
  const annualKm = Math.max(0, input.annualKm);
  const years = Math.max(1, Math.round(input.years));

  const base = input.options.flatMap((option) => {
    const energyPerKm = energyCostPerKm(option, input.prices);
    if (energyPerKm === null) return [];
    const annualEnergy = energyPerKm * annualKm;
    const annualMaintenance = Math.max(0, option.annualMaintenance);
    const annualTotal = annualEnergy + annualMaintenance;
    return [{ option, energyPerKm, annualEnergy, annualMaintenance, annualTotal }];
  });

  if (base.length === 0) return { annualKm, years, results: [], mostExpensiveId: null, cheapestId: null };

  const mostExpensive = base.reduce((a, b) => (b.annualTotal > a.annualTotal ? b : a));
  const cheapest = base.reduce((a, b) => (b.annualTotal < a.annualTotal ? b : a));
  const withPrices = input.includePurchase !== false && base.every((b) => typeof b.option.purchasePrice === "number");

  const results: CostResult[] = base.map(({ option, energyPerKm, annualEnergy, annualMaintenance, annualTotal }) => {
    const purchase = withPrices ? (option.purchasePrice ?? 0) : 0;
    const cumulative = Array.from({ length: years + 1 }, (_, y) => purchase + annualTotal * y);

    let breakEvenYears: number | null = null;
    if (withPrices) {
      const priceGap = purchase - (mostExpensive.option.purchasePrice ?? 0);
      const annualSaving = mostExpensive.annualTotal - annualTotal;
      if (option.id === mostExpensive.option.id) breakEvenYears = null;
      else if (priceGap <= 0 && annualSaving >= 0) breakEvenYears = 0;
      else if (annualSaving > 0) breakEvenYears = priceGap / annualSaving;
    }

    return {
      id: option.id,
      energyPerKm,
      costPerKm: annualKm > 0 ? annualTotal / annualKm : energyPerKm,
      annualEnergy,
      annualMaintenance,
      annualTotal,
      monthlyTotal: annualTotal / 12,
      periodTotal: annualTotal * years,
      savingsVsMostExpensive: (mostExpensive.annualTotal - annualTotal) * years,
      breakEvenYears,
      cumulative,
    };
  });

  return { annualKm, years, results, mostExpensiveId: mostExpensive.option.id, cheapestId: cheapest.option.id };
}
