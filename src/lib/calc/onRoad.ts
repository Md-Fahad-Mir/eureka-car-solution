import { onRoadConfig } from "@/config/finance";
import type { Vehicle } from "@/types";

export type OnRoadEstimate = {
  vehiclePrice: number;
  registration: number;
  /** True when the vehicle is already registered (used) and only transfer applies. */
  isTransfer: boolean;
  insurance: number;
  documentation: number;
  total: number;
};

type OnRoadInput = Pick<Vehicle, "fuelType" | "category" | "condition" | "engine" | "history"> & {
  price: Pick<Vehicle["price"], "amount">;
};

/** Registration component: transfer for registered used vehicles, else by type or engine size. */
export function registrationEstimate(v: OnRoadInput, config = onRoadConfig): { amount: number; isTransfer: boolean } {
  if (v.condition === "used" && v.history?.registrationYear) {
    return { amount: config.ownershipTransfer, isTransfer: true };
  }
  if (v.category === "tractor") return { amount: config.registrationByType.tractor, isTransfer: false };
  if (v.category === "commercial") return { amount: config.registrationByType.commercial, isTransfer: false };
  if (v.fuelType === "ev" || !v.engine) return { amount: config.registrationByType.ev, isTransfer: false };
  const band = config.registrationByCc.find((b) => v.engine!.displacementCc <= b.maxCc);
  return { amount: band?.amount ?? 0, isTransfer: false };
}

/** Illustrative on-road estimate: price + registration + first-year insurance + documentation. */
export function onRoadEstimate(v: OnRoadInput, config = onRoadConfig): OnRoadEstimate {
  const vehiclePrice = v.price.amount;
  const { amount: registration, isTransfer } = registrationEstimate(v, config);
  const insurance = (vehiclePrice * config.insurancePercent) / 100;
  const documentation = config.documentationFee;
  return {
    vehiclePrice,
    registration,
    isTransfer,
    insurance,
    documentation,
    total: vehiclePrice + registration + insurance + documentation,
  };
}
