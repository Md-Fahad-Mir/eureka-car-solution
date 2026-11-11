import { brands } from "@/data/mock/brands";
import { vehicles } from "@/data/mock/vehicles";
import type {
  Brand,
  FacetCount,
  Vehicle,
  VehicleFacets,
  VehicleFilters,
  VehicleListResult,
  VehicleWithBrand,
} from "@/types";
import {
  AVAILABILITIES,
  BODY_TYPES,
  CONDITIONS,
  FUEL_TYPES,
  TRANSMISSIONS,
  VEHICLE_CATEGORIES,
} from "@/types";
import { ApiError, simulateLatency } from "./client";

export const DEFAULT_PAGE_SIZE = 12;
/** Searching for this exact text makes `getVehicles` fail, to exercise error states. */
export const MOCK_ERROR_QUERY = "mock:error";

const brandById = new Map(brands.map((b) => [b.id, b]));
const withBrand = (v: Vehicle): VehicleWithBrand => ({ ...v, brand: brandById.get(v.brandId)! });

const searchText = (v: Vehicle) => {
  const b = brandById.get(v.brandId)!;
  return `${b.name.en} ${b.name.bn} ${v.model} ${v.variant} ${v.year}`.toLowerCase();
};

type FacetKey = "brand" | "model" | "fuel" | "condition" | "category" | "body" | "transmission" | "availability" | "seats";

const inList = <T>(list: T[] | undefined, value: T) => !list || list.length === 0 || list.includes(value);

/** Does `v` satisfy `f`? `skip` ignores one facet, for facet counting. */
function matches(v: Vehicle, f: VehicleFilters, skip?: FacetKey): boolean {
  if (f.q) {
    const text = searchText(v);
    if (!f.q.toLowerCase().split(/\s+/).filter(Boolean).every((token) => text.includes(token))) return false;
  }
  if (skip !== "brand" && !inList(f.brand, v.brandId)) return false;
  if (skip !== "model" && !inList(f.model, v.model)) return false;
  if (skip !== "fuel" && !inList(f.fuel, v.fuelType)) return false;
  if (skip !== "condition" && !inList(f.condition, v.condition)) return false;
  if (skip !== "category" && !inList(f.category, v.category)) return false;
  if (skip !== "body" && !inList(f.body, v.bodyType)) return false;
  if (skip !== "transmission" && !inList(f.transmission, v.transmission)) return false;
  if (skip !== "seats" && !inList(f.seats, v.seats)) return false;
  if (skip !== "availability") {
    // Sold vehicles stay reachable by URL but are hidden unless asked for.
    if (f.availability?.length ? !f.availability.includes(v.availability) : v.availability === "sold") return false;
  }
  if (f.priceMin !== undefined && v.price.amount < f.priceMin) return false;
  if (f.priceMax !== undefined && v.price.amount > f.priceMax) return false;
  if (f.yearMin !== undefined && v.year < f.yearMin) return false;
  if (f.yearMax !== undefined && v.year > f.yearMax) return false;
  if (f.mileageMax !== undefined && v.mileageKm > f.mileageMax) return false;
  if (f.rangeMin !== undefined && v.fuelType === "ev" && (v.battery?.rangeKm ?? 0) < f.rangeMin) return false;
  return true;
}

function count<T extends string | number>(items: Vehicle[], pick: (v: Vehicle) => T, order: readonly T[]): FacetCount<T>[] {
  const counts = new Map<T, number>();
  for (const v of items) counts.set(pick(v), (counts.get(pick(v)) ?? 0) + 1);
  return order.map((value) => ({ value, count: counts.get(value) ?? 0 }));
}

const minMax = (values: number[]): [number, number] =>
  values.length ? [Math.min(...values), Math.max(...values)] : [0, 0];

function buildFacets(f: VehicleFilters): VehicleFacets {
  const pool = (skip: FacetKey) => vehicles.filter((v) => matches(v, f, skip));
  const listed = vehicles.filter((v) => v.availability !== "sold");

  const modelPool = pool("model");
  const models = [...new Map(modelPool.map((v) => [v.model, v.brandId])).entries()]
    .map(([model, brandId]) => ({ value: model, brandId, count: modelPool.filter((v) => v.model === model).length }))
    .sort((a, b) => a.value.localeCompare(b.value));

  const brandPool = pool("brand");
  const seatOptions = [...new Set(vehicles.map((v) => v.seats))].sort((a, b) => a - b);

  return {
    brand: brands.map((b) => ({
      value: b.id,
      label: b.name,
      count: brandPool.filter((v) => v.brandId === b.id).length,
    })),
    model: models,
    fuel: count(pool("fuel"), (v) => v.fuelType, FUEL_TYPES),
    condition: count(pool("condition"), (v) => v.condition, CONDITIONS),
    category: count(pool("category"), (v) => v.category, VEHICLE_CATEGORIES),
    body: count(pool("body"), (v) => v.bodyType, BODY_TYPES),
    transmission: count(pool("transmission"), (v) => v.transmission, TRANSMISSIONS),
    availability: count(pool("availability"), (v) => v.availability, AVAILABILITIES),
    seats: count(pool("seats"), (v) => v.seats, seatOptions),
    bounds: {
      price: minMax(listed.map((v) => v.price.amount)),
      year: minMax(listed.map((v) => v.year)),
      mileage: minMax(listed.map((v) => v.mileageKm)),
      range: minMax(listed.flatMap((v) => (v.fuelType === "ev" && v.battery ? [v.battery.rangeKm] : []))),
    },
  };
}

const AVAILABILITY_RANK = { in_stock: 0, incoming: 1, reserved: 2, sold: 3 } as const;

function sortVehicles(items: Vehicle[], sort: VehicleFilters["sort"] = "featured"): Vehicle[] {
  const byNewest = (a: Vehicle, b: Vehicle) => b.createdAt.localeCompare(a.createdAt);
  const sorted = [...items];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price.amount - b.price.amount);
    case "price-desc":
      return sorted.sort((a, b) => b.price.amount - a.price.amount);
    case "year-desc":
      return sorted.sort((a, b) => b.year - a.year || byNewest(a, b));
    case "mileage-asc":
      return sorted.sort((a, b) => a.mileageKm - b.mileageKm);
    case "newest":
      return sorted.sort(byNewest);
    case "featured":
    default:
      return sorted.sort(
        (a, b) =>
          Number(b.isFeatured) - Number(a.isFeatured) ||
          AVAILABILITY_RANK[a.availability] - AVAILABILITY_RANK[b.availability] ||
          Number(b.isNewArrival) - Number(a.isNewArrival) ||
          byNewest(a, b),
      );
  }
}

/** Marketplace listing: filtered, sorted, paginated, with facet counts. */
export async function getVehicles(filters: VehicleFilters = {}): Promise<VehicleListResult> {
  // TODO(api): GET /vehicles?<filters> → VehicleListResult
  await simulateLatency();
  if (filters.q?.trim() === MOCK_ERROR_QUERY) throw new ApiError("Simulated listing failure");

  const matched = sortVehicles(
    vehicles.filter((v) => matches(v, filters)),
    filters.sort,
  );
  const pageSize = Math.max(1, Math.min(filters.pageSize ?? DEFAULT_PAGE_SIZE, 48));
  const totalPages = Math.max(1, Math.ceil(matched.length / pageSize));
  const page = Math.min(Math.max(1, Math.floor(filters.page ?? 1)), totalPages);

  return {
    items: matched.slice((page - 1) * pageSize, page * pageSize).map(withBrand),
    total: matched.length,
    page,
    pageSize,
    totalPages,
    facets: buildFacets(filters),
  };
}

export async function getVehicleBySlug(slug: string): Promise<VehicleWithBrand | null> {
  // TODO(api): GET /vehicles/:slug → VehicleWithBrand | 404
  await simulateLatency();
  const v = vehicles.find((x) => x.slug === slug);
  return v ? withBrand(v) : null;
}

/** Vehicles by id, in the order requested (unknown ids are dropped). */
export async function getVehiclesByIds(ids: string[]): Promise<VehicleWithBrand[]> {
  // TODO(api): GET /vehicles?ids=a,b,c → VehicleWithBrand[]
  await simulateLatency();
  return ids.flatMap((id) => {
    const v = vehicles.find((x) => x.id === id);
    return v ? [withBrand(v)] : [];
  });
}

/** Same category / price band first, then shared body or fuel type. Excludes sold vehicles. */
export async function getSimilarVehicles(vehicleId: string, limit = 4): Promise<VehicleWithBrand[]> {
  // TODO(api): GET /vehicles/:id/similar?limit= → VehicleWithBrand[]
  await simulateLatency();
  const base = vehicles.find((v) => v.id === vehicleId);
  if (!base) return [];
  const score = (v: Vehicle) => {
    const priceGap = Math.abs(v.price.amount - base.price.amount) / base.price.amount;
    return (
      (v.category === base.category ? 3 : 0) +
      (v.bodyType === base.bodyType ? 1 : 0) +
      (v.fuelType === base.fuelType ? 1 : 0) +
      Math.max(0, 2 - priceGap * 4)
    );
  };
  return vehicles
    .filter((v) => v.id !== base.id && v.availability !== "sold")
    .map((v) => ({ v, s: score(v) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ v }) => withBrand(v));
}

/** Lightweight typeahead over brand, model and variant (for compare/vehicle pickers). */
export async function searchVehicles(query: string, limit = 8): Promise<VehicleWithBrand[]> {
  // TODO(api): GET /vehicles/search?q=&limit= → VehicleWithBrand[]
  await simulateLatency();
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  return vehicles
    .filter((v) => v.availability !== "sold" && tokens.every((t) => searchText(v).includes(t)))
    .slice(0, limit)
    .map(withBrand);
}

/** Every vehicle, for pickers that list the whole inventory (savings calculator, finance). */
export async function getAllVehicles(): Promise<VehicleWithBrand[]> {
  // TODO(api): GET /vehicles?fields=summary&all=1 → VehicleWithBrand[]
  await simulateLatency();
  return sortVehicles(vehicles.filter((v) => v.availability !== "sold")).map(withBrand);
}

export async function getFeaturedVehicles(limit = 8): Promise<VehicleWithBrand[]> {
  // TODO(api): GET /vehicles/featured?limit= → VehicleWithBrand[]
  await simulateLatency();
  return sortVehicles(vehicles.filter((v) => v.isFeatured && v.availability !== "sold")).slice(0, limit).map(withBrand);
}

export async function getNewArrivals(limit = 8): Promise<VehicleWithBrand[]> {
  // TODO(api): GET /vehicles/new-arrivals?limit= → VehicleWithBrand[]
  await simulateLatency();
  return sortVehicles(vehicles.filter((v) => v.isNewArrival && v.availability !== "sold"), "newest")
    .slice(0, limit)
    .map(withBrand);
}

export async function getBrands(): Promise<(Brand & { vehicleCount: number })[]> {
  // TODO(api): GET /brands → (Brand & { vehicleCount })[]
  await simulateLatency();
  return brands.map((b) => ({
    ...b,
    vehicleCount: vehicles.filter((v) => v.brandId === b.id && v.availability !== "sold").length,
  }));
}

/** All slugs, for `generateStaticParams` and the sitemap. */
export async function getVehicleSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  // TODO(api): GET /vehicles/slugs → { slug, updatedAt }[]
  await simulateLatency();
  return vehicles.map((v) => ({ slug: v.slug, updatedAt: v.createdAt }));
}
