import { describe, expect, it } from "vitest";
import { costConfig } from "@/config/costs";
import { CONDITIONS, FUEL_TYPES, VEHICLE_CATEGORIES, WEEKDAYS, type LocalizedText } from "@/types";
import { brands } from "./brands";
import { buildDemoCustomer } from "./customer";
import { financePartners } from "./partners";
import { servicePackages } from "./services";
import { showrooms } from "./showrooms";
import { testimonials } from "./testimonials";
import { vehicles } from "./vehicles";

const filled = (t: LocalizedText) => t.en.trim().length > 0 && t.bn.trim().length > 0;
const unique = (values: string[]) => new Set(values).size === values.length;

describe("vehicle inventory: a complete multi-brand marketplace", () => {
  it("has about 30 vehicles with unique ids, slugs and stock references", () => {
    expect(vehicles.length).toBe(30);
    expect(unique(vehicles.map((v) => v.id))).toBe(true);
    expect(unique(vehicles.map((v) => v.slug))).toBe(true);
    expect(unique(vehicles.map((v) => v.reference))).toBe(true);
    for (const v of vehicles) expect(v.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("spans 10–12 brands, uses every brand, and no single brand dominates", () => {
    expect(brands.length).toBeGreaterThanOrEqual(10);
    expect(brands.length).toBeLessThanOrEqual(12);
    for (const b of brands) expect(vehicles.some((v) => v.brandId === b.id), b.id).toBe(true);
    for (const v of vehicles) expect(brands.some((b) => b.id === v.brandId), v.slug).toBe(true);
    const maxShare = Math.max(...brands.map((b) => vehicles.filter((v) => v.brandId === b.id).length)) / vehicles.length;
    expect(maxShare).toBeLessThanOrEqual(0.3);
  });

  it("covers every fuel type, condition and category", () => {
    for (const f of FUEL_TYPES) expect(vehicles.filter((v) => v.fuelType === f).length, f).toBeGreaterThanOrEqual(2);
    for (const c of CONDITIONS) expect(vehicles.filter((v) => v.condition === c).length, c).toBeGreaterThanOrEqual(3);
    for (const c of VEHICLE_CATEGORIES) expect(vehicles.some((v) => v.category === c), c).toBe(true);
    expect(vehicles.filter((v) => v.category === "commercial").length).toBeGreaterThanOrEqual(2);
    expect(vehicles.filter((v) => v.category === "tractor").length).toBeGreaterThanOrEqual(2);
  });

  it("has condition-appropriate history", () => {
    for (const v of vehicles) {
      if (v.condition === "reconditioned") expect(v.auctionGrade, v.slug).toMatch(/^(3\.5|4|4\.5|5|6|S|R)$/);
      if (v.condition === "used") expect(v.history?.owners, v.slug).toBeGreaterThan(0);
      if (v.condition === "new") {
        expect(v.auctionGrade, v.slug).toBeUndefined();
        expect(v.mileageKm, v.slug).toBeLessThan(100);
      }
    }
  });

  it("has powertrain data consistent with fuel type", () => {
    for (const v of vehicles) {
      if (v.fuelType === "ev") {
        expect(v.engine, v.slug).toBeUndefined();
        expect(v.battery?.rangeKm, v.slug).toBeGreaterThan(0);
        expect(v.efficiency.kWhPer100km, v.slug).toBeGreaterThan(0);
      } else if (v.fuelType === "phev") {
        expect(v.engine && v.motor && v.battery, v.slug).toBeTruthy();
        expect(v.efficiency.kmPerLitre && v.efficiency.kWhPer100km, v.slug).toBeTruthy();
      } else {
        expect(v.engine?.displacementCc, v.slug).toBeGreaterThan(0);
        if (v.category === "tractor") expect(v.efficiency.litresPerHour, v.slug).toBeGreaterThan(0);
        else expect(v.efficiency.kmPerLitre, v.slug).toBeGreaterThan(0);
      }
      if (v.fuelType === "hybrid") expect(v.motor, v.slug).toBeDefined();
    }
  });

  it("has plausible BDT prices as whole taka", () => {
    for (const v of vehicles) {
      expect(Number.isInteger(v.price.amount), v.slug).toBe(true);
      expect(v.price.amount, v.slug).toBeGreaterThanOrEqual(500_000);
      expect(v.price.amount, v.slug).toBeLessThanOrEqual(50_000_000);
      expect(v.price.currency).toBe("BDT");
    }
  });

  it("has complete bilingual content", () => {
    for (const v of vehicles) {
      expect(filled(v.summary), v.slug).toBe(true);
      // Numbers in Bangla copy use Bangla digits; Latin terms like "4WD" or "V2L" are exempt.
      const bnWithoutLatinTerms = v.summary.bn.replace(/[A-Za-z0-9-]*[A-Za-z][A-Za-z0-9-]*/g, "");
      expect(bnWithoutLatinTerms, `${v.slug} bn summary uses Bangla digits`).not.toMatch(/[0-9]/);
      expect(v.features.length, v.slug).toBeGreaterThan(0);
      expect(v.safety.length, v.slug).toBeGreaterThan(0);
      expect([...v.features, ...v.safety].every(filled), v.slug).toBe(true);
      expect(v.colors.every((c) => filled(c.name) && /^#[0-9a-f]{6}$/i.test(c.hex)), v.slug).toBe(true);
      expect(v.images.length, v.slug).toBeGreaterThanOrEqual(4);
      expect(v.images.every((m) => filled(m.alt)), v.slug).toBe(true);
      expect(v.specs.every((g) => g.items.length > 0), v.slug).toBe(true);
    }
  });

  it("is held only at showrooms that exist and sell vehicles", () => {
    for (const v of vehicles) {
      expect(v.showroomIds.length, v.slug).toBeGreaterThan(0);
      for (const id of v.showroomIds) {
        const s = showrooms.find((x) => x.id === id);
        expect(s?.services.includes("sales"), `${v.slug} @ ${id}`).toBe(true);
      }
    }
  });

  it("has valid, chronological createdAt timestamps", () => {
    for (const v of vehicles) expect(Number.isNaN(Date.parse(v.createdAt)), v.slug).toBe(false);
  });

  it("references real vehicles of the right fuel type in the savings calculator config", () => {
    for (const [fuel, slug] of Object.entries(costConfig.representativeVehicles)) {
      expect(vehicles.find((v) => v.slug === slug)?.fuelType, slug).toBe(fuel);
    }
  });
});

describe("supporting mock data", () => {
  it("has 4–5 showrooms with valid hours", () => {
    expect(showrooms.length).toBeGreaterThanOrEqual(4);
    expect(showrooms.length).toBeLessThanOrEqual(5);
    for (const s of showrooms) {
      expect(filled(s.name) && filled(s.address) && filled(s.city)).toBe(true);
      for (const d of WEEKDAYS) {
        const h = s.hours[d];
        if (h) expect(h.open < h.close, `${s.id} ${d}`).toBe(true);
      }
      expect(s.email.endsWith(".example")).toBe(true);
    }
  });

  it("has 6 service packages including an EV battery health check", () => {
    expect(servicePackages).toHaveLength(6);
    expect(servicePackages.some((p) => p.fuelTypes.includes("ev") && p.id === "ev-battery")).toBe(true);
    expect(unique(servicePackages.map((p) => p.id))).toBe(true);
  });

  it("has 6 fictional sample finance partners: 4 conventional, 2 Islamic", () => {
    expect(financePartners).toHaveLength(6);
    expect(financePartners.filter((p) => p.type === "conventional")).toHaveLength(4);
    expect(financePartners.filter((p) => p.type === "islamic")).toHaveLength(2);
    for (const p of financePartners) {
      expect(p.isSample).toBe(true);
      expect(p.rateRange.min).toBeLessThanOrEqual(p.rateRange.max);
    }
  });

  it("has 6 testimonials, all marked as samples", () => {
    expect(testimonials).toHaveLength(6);
    expect(testimonials.every((t) => t.isSample)).toBe(true);
  });
});

describe("demo customer", () => {
  const c = buildDemoCustomer("2026-11-11");

  it("only uses DEMO- references", () => {
    const refs = [
      ...c.testDrives.map((r) => r.reference),
      ...c.inquiries.map((r) => r.reference),
      ...c.financeApplications.map((r) => r.reference),
      ...c.serviceBookings.map((r) => r.reference),
      c.loan.loanReference,
    ];
    expect(refs.every((r) => r.startsWith("DEMO-"))).toBe(true);
  });

  it("references vehicles, showrooms, packages and partners that exist", () => {
    const vehicleIds = [...c.testDrives.map((t) => t.vehicleId), ...c.favouriteIds, ...c.financeApplications.map((a) => a.vehicleId!)];
    for (const id of vehicleIds) expect(vehicles.some((v) => v.id === id), id).toBe(true);
    const showroomIds = [...c.testDrives.map((t) => t.showroomId), ...c.serviceBookings.map((b) => b.showroomId), ...c.serviceHistory.map((h) => h.showroomId)];
    for (const id of showroomIds) expect(showrooms.some((s) => s.id === id), id).toBe(true);
    const packageIds = [...c.serviceBookings, ...c.serviceHistory].flatMap((b) => b.packageIds);
    for (const id of packageIds) expect(servicePackages.some((p) => p.id === id), id).toBe(true);
    for (const id of [c.loan.partnerId, ...c.financeApplications.map((a) => a.partnerId!)]) {
      expect(financePartners.some((p) => p.id === id), id).toBe(true);
    }
  });

  it("has an upcoming booking and an active application, relative to today", () => {
    expect(c.testDrives.some((t) => t.date > "2026-11-11" && t.status === "confirmed")).toBe(true);
    expect(c.financeApplications.some((a) => a.status !== "decision")).toBe(true);
    expect(c.ownedVehicles).toHaveLength(2);
  });
});
