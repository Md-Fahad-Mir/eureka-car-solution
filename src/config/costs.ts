import type { FuelType } from "@/types";

/**
 * Running-cost calculator defaults.
 *
 * SAMPLE VALUES, UPDATE BEFORE LAUNCH. Fuel and electricity prices in
 * Bangladesh are set by the government and change; maintenance estimates are
 * illustrative averages. The calculator UI shows these as editable inputs with
 * an "Estimates only" note and a "Reset to sample values" button.
 */
export const costConfig = {
  /** BDT per litre. "petrol" here means octane, which most private cars use. */
  fuelPricePerLitre: { petrol: 130, diesel: 105 },
  /** BDT per kWh for home/AC charging. */
  electricityPerKwh: 10,
  /** BDT per year, routine servicing + wear items. */
  annualMaintenance: { ev: 15_000, petrol: 35_000, diesel: 42_000, hybrid: 30_000, phev: 28_000 } satisfies Record<
    FuelType,
    number
  >,
  /** Share of a PHEV's distance driven on electricity when charged daily. */
  phevElectricShare: 0.6,
  distance: { defaultValue: 40, defaultUnit: "day" as const },
  ownershipYears: { min: 1, max: 10, default: 5 },
  /**
   * "Typical" vehicles used as a comparison line in the vehicle-page
   * calculator, e.g. "vs a typical petrol car". Illustrative.
   */
  comparisonBaseline: {
    petrol: { kmPerLitre: 12, annualMaintenance: 35_000 },
    hybrid: { kmPerLitre: 22, annualMaintenance: 30_000 },
  },
  /** Tractor work-pattern defaults for the per-hour fuel calculator. */
  tractorUsage: { hoursPerDay: 6, daysPerMonth: 20 },
  /** Representative vehicles pre-loaded into the savings calculator (by slug). */
  representativeVehicles: {
    ev: "byd-atto-3-extended-2024",
    petrol: "toyota-premio-f-ex-2019",
    diesel: "mitsubishi-pajero-sport-gls-2024",
    hybrid: "toyota-corolla-cross-hybrid-z-2021",
  } satisfies Partial<Record<FuelType, string>>,
} as const;

export type DistanceUnit = "day" | "month" | "year";
