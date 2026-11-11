import type { LocalizedText, Money } from "./common";
import type { FuelType } from "./vehicle";

export type ServicePackage = {
  id: string;
  slug: string;
  name: LocalizedText;
  summary: LocalizedText;
  includes: LocalizedText[];
  /** Illustrative "from" price. */
  price: Money;
  durationHours: number;
  fuelTypes: FuelType[];
  /** Suggested interval, shown as guidance only. */
  interval?: { km?: number; months?: number };
  forCommercial?: boolean;
};

/** Maintenance interval guidance by fuel type (illustrative). */
export type MaintenanceGuide = {
  fuelType: FuelType;
  intervalKm: number;
  intervalMonths: number;
  focus: LocalizedText[];
};
