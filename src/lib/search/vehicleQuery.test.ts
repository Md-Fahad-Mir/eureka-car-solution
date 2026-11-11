import { describe, expect, it } from "vitest";
import { countActiveFilters, listingHref, parseListingParams, serializeListingParams } from "./vehicleQuery";

describe("parseListingParams", () => {
  it("parses lists, numbers, sort, page and view", () => {
    const { filters, view } = parseListingParams({
      fuel: "ev,hybrid",
      brand: "toyota",
      priceMin: "1000000",
      priceMax: "5000000",
      seats: "5,7",
      sort: "price-asc",
      page: "2",
      view: "list",
      q: "  corolla  ",
    });
    expect(filters).toEqual({
      q: "corolla",
      brand: ["toyota"],
      fuel: ["ev", "hybrid"],
      seats: [5, 7],
      priceMin: 1_000_000,
      priceMax: 5_000_000,
      sort: "price-asc",
      page: 2,
    });
    expect(view).toBe("list");
  });

  it("drops invalid enum values, numbers and defaults", () => {
    const { filters, view } = parseListingParams({
      fuel: "ev,rocket",
      condition: "mint",
      priceMin: "abc",
      yearMin: "-5",
      sort: "featured",
      page: "1",
      view: "table",
    });
    expect(filters).toEqual({ fuel: ["ev"] });
    expect(view).toBe("grid");
  });

  it("swaps inverted ranges and dedupes values", () => {
    const { filters } = parseListingParams({ priceMin: "9", priceMax: "3", fuel: "ev,ev", yearMin: "2024", yearMax: "2019" });
    expect(filters).toMatchObject({ priceMin: 3, priceMax: 9, fuel: ["ev"], yearMin: 2019, yearMax: 2024 });
  });

  it("accepts URLSearchParams and repeated params", () => {
    expect(parseListingParams(new URLSearchParams("fuel=ev&body=suv")).filters).toEqual({ fuel: ["ev"], body: ["suv"] });
    expect(parseListingParams({ fuel: ["ev", "diesel"] }).filters.fuel).toEqual(["ev", "diesel"]);
  });
});

describe("serializeListingParams / listingHref", () => {
  it("round-trips through the parser", () => {
    const state = parseListingParams({ fuel: "ev", priceMax: "4000000", sort: "newest", page: "3", view: "list", seats: "7,5" });
    expect(parseListingParams(serializeListingParams(state))).toEqual(state);
  });

  it("omits defaults so the bare listing URL stays clean", () => {
    expect(listingHref({ filters: { sort: "featured", page: 1 }, view: "grid" })).toBe("/vehicles");
    expect(listingHref({ filters: { category: ["commercial", "tractor"] }, view: "grid" })).toBe(
      "/vehicles?category=commercial%2Ctractor",
    );
  });
});

describe("countActiveFilters", () => {
  it("counts each value, and each range once", () => {
    expect(countActiveFilters({ fuel: ["ev", "hybrid"], priceMin: 1, priceMax: 2, q: "x", sort: "newest" })).toBe(4);
    expect(countActiveFilters({})).toBe(0);
  });
});
