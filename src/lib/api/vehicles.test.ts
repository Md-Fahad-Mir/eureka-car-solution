import { describe, expect, it } from "vitest";
import { ApiError } from "./client";
import { getSimilarVehicles, getVehicleBySlug, getVehicles, getVehiclesByIds, MOCK_ERROR_QUERY, searchVehicles } from "./vehicles";

describe("getVehicles", () => {
  it("lists in-market vehicles (sold hidden) with pagination", async () => {
    const r = await getVehicles();
    expect(r.total).toBe(29);
    expect(r.items).toHaveLength(12);
    expect(r.totalPages).toBe(3);
    expect(r.items.every((v) => v.availability !== "sold" && v.brand.id === v.brandId)).toBe(true);
  });

  it("filters by fuel and price together", async () => {
    const r = await getVehicles({ fuel: ["ev"], priceMax: 5_000_000 });
    expect(r.items.length).toBeGreaterThan(0);
    expect(r.items.every((v) => v.fuelType === "ev" && v.price.amount <= 5_000_000)).toBe(true);
  });

  it("filters by category, condition and year range", async () => {
    const tractors = await getVehicles({ category: ["tractor"] });
    expect(tractors.total).toBe(2);
    const recon = await getVehicles({ condition: ["reconditioned"], yearMin: 2021, yearMax: 2022 });
    expect(recon.items.every((v) => v.condition === "reconditioned" && v.year >= 2021 && v.year <= 2022)).toBe(true);
  });

  it("applies the EV range filter to EVs only", async () => {
    const r = await getVehicles({ fuel: ["ev"], rangeMin: 400 });
    expect(r.items.every((v) => (v.battery?.rangeKm ?? 0) >= 400)).toBe(true);
    expect(r.total).toBe(2);
  });

  it("searches brand, model and variant in English and Bangla", async () => {
    expect((await getVehicles({ q: "corolla cross" })).items.map((v) => v.slug)).toEqual(["toyota-corolla-cross-hybrid-z-2021"]);
    const bn = await getVehicles({ q: "টয়োটা" });
    expect(bn.total).toBeGreaterThan(0);
    expect(bn.items.every((v) => v.brandId === "toyota")).toBe(true);
  });

  it("counts facets independently of their own selection", async () => {
    const r = await getVehicles({ fuel: ["ev"] });
    const petrol = r.facets.fuel.find((f) => f.value === "petrol")!;
    expect(petrol.count).toBe(6);
    const evCondition = r.facets.condition.reduce((a, f) => a + f.count, 0);
    expect(evCondition).toBe(r.total);
  });

  it("makes models depend on the selected brand", async () => {
    const r = await getVehicles({ brand: ["honda"] });
    expect(r.facets.model.every((m) => m.brandId === "honda")).toBe(true);
    expect(r.facets.model.map((m) => m.value)).toContain("Vezel");
  });

  it("sorts by price and clamps out-of-range pages", async () => {
    const asc = await getVehicles({ sort: "price-asc", pageSize: 48 });
    const prices = asc.items.map((v) => v.price.amount);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    const clamped = await getVehicles({ page: 99 });
    expect(clamped.page).toBe(3);
  });

  it("shows sold vehicles only when asked", async () => {
    const r = await getVehicles({ availability: ["sold"] });
    expect(r.items.map((v) => v.slug)).toEqual(["honda-grace-hybrid-ex-2017"]);
  });

  it("returns empty results without throwing", async () => {
    const r = await getVehicles({ q: "no such vehicle anywhere" });
    expect(r.total).toBe(0);
    expect(r.items).toEqual([]);
    expect(r.totalPages).toBe(1);
  });

  it("can simulate a server error", async () => {
    await expect(getVehicles({ q: MOCK_ERROR_QUERY })).rejects.toBeInstanceOf(ApiError);
  });
});

describe("vehicle lookups", () => {
  it("finds by slug and returns null for unknown slugs", async () => {
    expect((await getVehicleBySlug("byd-atto-3-extended-2024"))?.brand.name.en).toBe("BYD");
    expect(await getVehicleBySlug("nope")).toBeNull();
  });

  it("keeps the requested order for ids", async () => {
    expect((await getVehiclesByIds(["v19", "v02", "missing"])).map((v) => v.id)).toEqual(["v19", "v02"]);
  });

  it("suggests similar vehicles, excluding itself and sold ones", async () => {
    const similar = await getSimilarVehicles("v19");
    expect(similar).toHaveLength(4);
    expect(similar.some((v) => v.id === "v19" || v.availability === "sold")).toBe(false);
    expect(similar[0].category).toBe("suv");
  });

  it("typeahead search matches all tokens", async () => {
    const r = await searchVehicles("hyundai ioniq");
    expect(r.map((v) => v.slug)).toEqual(["hyundai-ioniq-5-long-range-2024"]);
  });
});
