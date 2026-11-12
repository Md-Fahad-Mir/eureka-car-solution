import { evConfig } from "@/config/ev";

export type ChargingInput = {
  batteryKwh: number;
  chargerKw: number;
  kind: "ac" | "dc";
  /** State of charge, 0–100. */
  fromPct: number;
  toPct: number;
  /** On-board charger limit for AC charging (kW). */
  onboardAcKw: number;
};

export type ChargingResult = {
  /** Hours from `fromPct` to `toPct`. */
  hours: number;
  /** Energy stored in the battery (kWh). */
  batteryKwh: number;
  /** Energy drawn from the grid, including losses (kWh). */
  gridKwh: number;
  /** Effective charging power in the fast part of the session (kW). */
  effectiveKw: number;
  /** Approximate driving range added (km). */
  rangeKm: number;
};

/**
 * Simplified charging-time model for the explainer.
 * AC: constant power, limited by the car's on-board charger.
 * DC: full power up to `dcTaperFromSoc`, then a reduced rate (the "charging curve").
 */
export function chargingTime(input: ChargingInput, cfg = evConfig): ChargingResult {
  const from = Math.max(0, Math.min(100, input.fromPct));
  const to = Math.max(0, Math.min(100, input.toPct));
  const added = to > from ? (input.batteryKwh * (to - from)) / 100 : 0;
  const eff = cfg.efficiency[input.kind];
  const rangeKm = (added / cfg.consumptionKwhPer100Km) * 100;

  if (input.kind === "ac") {
    const effectiveKw = Math.min(input.chargerKw, input.onboardAcKw) * eff;
    return { hours: added / effectiveKw, batteryKwh: added, gridKwh: added / eff, effectiveKw, rangeKm };
  }
  const effectiveKw = input.chargerKw * eff;
  const taper = cfg.dcTaperFromSoc;
  const fastKwh = to > from ? (input.batteryKwh * Math.max(0, Math.min(to, taper) - from)) / 100 : 0;
  const slowKwh = added - fastKwh;
  const hours = fastKwh / effectiveKw + slowKwh / (effectiveKw * cfg.dcTaperFactor);
  return { hours, batteryKwh: added, gridKwh: added / eff, effectiveKw, rangeKm };
}
