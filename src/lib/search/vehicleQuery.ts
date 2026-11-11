import {
  AVAILABILITIES,
  BODY_TYPES,
  CONDITIONS,
  FUEL_TYPES,
  SORT_KEYS,
  TRANSMISSIONS,
  VEHICLE_CATEGORIES,
  type VehicleFilters,
} from "@/types";

/**
 * The marketplace URL is the source of truth for filters, sort, search, page
 * and view. Multi-value params are comma-separated (`fuel=ev,hybrid`), invalid
 * values are dropped, and defaults are omitted so URLs stay short and
 * shareable.
 */

export type ListingView = "grid" | "list";
export type ListingState = { filters: VehicleFilters; view: ListingView };

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

const LIST_KEYS = ["brand", "model", "fuel", "condition", "category", "body", "transmission", "availability"] as const;
const NUMBER_KEYS = ["priceMin", "priceMax", "yearMin", "yearMax", "mileageMax", "rangeMin"] as const;

const ALLOWED: Partial<Record<(typeof LIST_KEYS)[number], readonly string[]>> = {
  fuel: FUEL_TYPES,
  condition: CONDITIONS,
  category: VEHICLE_CATEGORIES,
  body: BODY_TYPES,
  transmission: TRANSMISSIONS,
  availability: AVAILABILITIES,
};

/** Filter keys that count as "applied filters" (chips, counts, clear-all). */
export const FILTER_KEYS = [...LIST_KEYS, "seats", ...NUMBER_KEYS, "q"] as const;

function get(params: RawParams, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const v = params[key];
  return Array.isArray(v) ? v.join(",") : v;
}

const splitList = (value: string | undefined) =>
  value
    ? [...new Set(value.split(",").map((s) => s.trim()).filter(Boolean))]
    : [];

function toNumber(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined;
}

export function parseListingParams(params: RawParams): ListingState {
  const filters: VehicleFilters = {};

  const q = get(params, "q")?.trim();
  if (q) filters.q = q.slice(0, 80);

  for (const key of LIST_KEYS) {
    const allowed = ALLOWED[key];
    const values = splitList(get(params, key)).filter((v) => !allowed || allowed.includes(v));
    // The typed cast is safe: values were validated against the allowed enum above.
    if (values.length) (filters as Record<string, string[]>)[key] = values;
  }

  const seats = splitList(get(params, "seats"))
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0 && n < 100)
    .sort((a, b) => a - b);
  if (seats.length) filters.seats = seats;

  for (const key of NUMBER_KEYS) {
    const n = toNumber(get(params, key));
    if (n !== undefined) filters[key] = n;
  }
  // Swap inverted ranges instead of returning nothing.
  if (filters.priceMin !== undefined && filters.priceMax !== undefined && filters.priceMin > filters.priceMax) {
    [filters.priceMin, filters.priceMax] = [filters.priceMax, filters.priceMin];
  }
  if (filters.yearMin !== undefined && filters.yearMax !== undefined && filters.yearMin > filters.yearMax) {
    [filters.yearMin, filters.yearMax] = [filters.yearMax, filters.yearMin];
  }

  const sort = get(params, "sort");
  if (sort && (SORT_KEYS as readonly string[]).includes(sort) && sort !== "featured") {
    filters.sort = sort as VehicleFilters["sort"];
  }

  const page = toNumber(get(params, "page"));
  if (page && page > 1) filters.page = page;

  const view: ListingView = get(params, "view") === "list" ? "list" : "grid";
  return { filters, view };
}

/** Serialises listing state into a query object (defaults omitted, stable key order). */
export function serializeListingParams({ filters, view }: ListingState): Record<string, string> {
  const out: Record<string, string> = {};
  if (filters.q?.trim()) out.q = filters.q.trim();
  for (const key of LIST_KEYS) {
    const values = filters[key];
    if (values?.length) out[key] = values.join(",");
  }
  if (filters.seats?.length) out.seats = [...filters.seats].sort((a, b) => a - b).join(",");
  for (const key of NUMBER_KEYS) {
    const n = filters[key];
    if (n !== undefined) out[key] = String(n);
  }
  if (filters.sort && filters.sort !== "featured") out.sort = filters.sort;
  if (filters.page && filters.page > 1) out.page = String(filters.page);
  if (view === "list") out.view = "list";
  return out;
}

/** "/vehicles?fuel=ev&sort=price-asc" style href. */
export function listingHref(state: ListingState): string {
  const query = new URLSearchParams(serializeListingParams(state)).toString();
  return query ? `/vehicles?${query}` : "/vehicles";
}

/** Number of applied filters (search counts as one; each list value counts). */
export function countActiveFilters(filters: VehicleFilters): number {
  let n = filters.q ? 1 : 0;
  for (const key of LIST_KEYS) n += filters[key]?.length ?? 0;
  n += filters.seats?.length ?? 0;
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) n += 1;
  if (filters.yearMin !== undefined || filters.yearMax !== undefined) n += 1;
  if (filters.mileageMax !== undefined) n += 1;
  if (filters.rangeMin !== undefined) n += 1;
  return n;
}

/** Filters with everything cleared except sort (and view, kept by the caller). */
export const clearedFilters = (filters: VehicleFilters): VehicleFilters => (filters.sort ? { sort: filters.sort } : {});
