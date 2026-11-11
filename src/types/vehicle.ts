import type { IsoDateTime, LocalizedText, Media, Money } from "./common";

export const FUEL_TYPES = ["ev", "petrol", "diesel", "hybrid", "phev"] as const;
export type FuelType = (typeof FUEL_TYPES)[number];

export const CONDITIONS = ["new", "reconditioned", "used"] as const;
export type Condition = (typeof CONDITIONS)[number];

export const VEHICLE_CATEGORIES = ["car", "suv", "mpv", "pickup", "commercial", "tractor", "utility"] as const;
export type VehicleCategory = (typeof VEHICLE_CATEGORIES)[number];

export const BODY_TYPES = [
  "sedan",
  "hatchback",
  "crossover",
  "suv",
  "mpv",
  "pickup",
  "van",
  "truck",
  "tractor",
] as const;
export type BodyType = (typeof BODY_TYPES)[number];

export const TRANSMISSIONS = ["automatic", "cvt", "dct", "manual", "single-speed"] as const;
export type Transmission = (typeof TRANSMISSIONS)[number];

export const DRIVETRAINS = ["fwd", "rwd", "awd", "4wd", "2wd"] as const;
export type Drivetrain = (typeof DRIVETRAINS)[number];

export const AVAILABILITIES = ["in_stock", "incoming", "reserved", "sold"] as const;
export type Availability = (typeof AVAILABILITIES)[number];

export type VehicleColor = { name: LocalizedText; hex: string };

/** Units understood by the formatters (labels live in messages `units.*`). */
export type Unit =
  | "mm"
  | "m"
  | "kg"
  | "L"
  | "cc"
  | "hp"
  | "kW"
  | "Nm"
  | "kmh"
  | "s"
  | "km"
  | "kWh"
  | "kmPerL"
  | "kWhPer100km"
  | "lPerHour"
  | "min"
  | "seats";

export const SPEC_GROUPS = ["powertrain", "performance", "battery", "dimensions", "capacity", "chassis", "work"] as const;
export type SpecGroupId = (typeof SPEC_GROUPS)[number];

/** Spec labels live in messages `specs.keys.*`; values are numbers (with a unit) or language-neutral strings. */
export type SpecKey =
  | "engineType"
  | "displacement"
  | "cylinders"
  | "enginePower"
  | "engineTorque"
  | "motorPower"
  | "motorTorque"
  | "systemPower"
  | "topSpeed"
  | "acceleration"
  | "fuelEconomy"
  | "energyConsumption"
  | "fuelPerHour"
  | "batteryCapacity"
  | "range"
  | "electricRange"
  | "acCharge"
  | "dcCharge"
  | "dcChargeTime"
  | "batteryWarranty"
  | "length"
  | "width"
  | "height"
  | "wheelbase"
  | "groundClearance"
  | "kerbWeight"
  | "seats"
  | "fuelTank"
  | "bootSpace"
  | "payload"
  | "grossWeight"
  | "towing"
  | "tyres"
  | "turningRadius"
  | "emissions"
  | "ptoPower"
  | "liftCapacity"
  | "forwardGears";

export type SpecValue = number | string | LocalizedText;
export type SpecItem = { key: SpecKey; value: SpecValue; unit?: Unit };
export type SpecGroup = { group: SpecGroupId; items: SpecItem[] };

export type Vehicle = {
  // Identity
  id: string;
  slug: string;
  /** Stock reference shown to customers and carried into WhatsApp messages. */
  reference: string;
  brandId: string;
  model: string;
  variant: string;
  year: number;
  condition: Condition;
  category: VehicleCategory;
  bodyType: BodyType;
  fuelType: FuelType;
  transmission: Transmission;
  drivetrain: Drivetrain;
  seats: number;
  colors: VehicleColor[];
  summary: LocalizedText;

  // Price
  price: Money;

  // Usage
  mileageKm: number;
  /** Japanese auction sheet grade for reconditioned imports, e.g. "4.5". */
  auctionGrade?: string;
  /** Ownership history for used vehicles. */
  history?: { owners: number; registrationYear: number; serviceRecords: boolean };
  warranty?: { months: number; km?: number };

  // Powertrain
  engine?: { displacementCc: number; powerHp: number; torqueNm: number };
  motor?: { powerKw: number; torqueNm: number };
  battery?: { capacityKwh: number; rangeKm: number; dcFastChargeKw?: number; warrantyYears?: number };

  // Efficiency. Tractors are measured per working hour, not per km.
  efficiency: { kmPerLitre?: number; kWhPer100km?: number; litresPerHour?: number };

  // Content
  features: LocalizedText[];
  safety: LocalizedText[];
  specs: SpecGroup[];
  images: Media[];

  // Availability
  availability: Availability;
  showroomIds: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  createdAt: IsoDateTime;
};

export type Brand = {
  id: string;
  slug: string;
  name: LocalizedText;
  country: LocalizedText;
  isPopular: boolean;
};

/** A vehicle joined with its brand: what listing and detail UIs render. */
export type VehicleWithBrand = Vehicle & { brand: Brand };

export const SORT_KEYS = ["featured", "price-asc", "price-desc", "year-desc", "mileage-asc", "newest"] as const;
export type VehicleSort = (typeof SORT_KEYS)[number];

/** Marketplace query. Mirrors the URL search params 1:1 (see Phase 3 query parser). */
export type VehicleFilters = {
  q?: string;
  brand?: string[];
  model?: string[];
  fuel?: FuelType[];
  condition?: Condition[];
  category?: VehicleCategory[];
  body?: BodyType[];
  transmission?: Transmission[];
  availability?: Availability[];
  seats?: number[];
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  mileageMax?: number;
  /** Minimum EV range (km). Applies to EVs only. */
  rangeMin?: number;
  sort?: VehicleSort;
  page?: number;
  pageSize?: number;
};

export type FacetCount<T extends string | number = string> = { value: T; count: number };

export type VehicleFacets = {
  brand: (FacetCount & { label: LocalizedText })[];
  model: (FacetCount & { brandId: string })[];
  fuel: FacetCount<FuelType>[];
  condition: FacetCount<Condition>[];
  category: FacetCount<VehicleCategory>[];
  body: FacetCount<BodyType>[];
  transmission: FacetCount<Transmission>[];
  availability: FacetCount<Availability>[];
  seats: FacetCount<number>[];
  /** Bounds across the whole inventory, for sliders. */
  bounds: {
    price: [number, number];
    year: [number, number];
    mileage: [number, number];
    range: [number, number];
  };
};

export type VehicleListResult = {
  items: VehicleWithBrand[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets: VehicleFacets;
};
