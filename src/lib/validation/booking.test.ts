import { describe, expect, it } from "vitest";
import { serviceBookingSchema, testDriveSchema } from "./booking";
import { contactSchema, corporateInquirySchema } from "./enquiries";

const contact = { name: "Rahim Uddin", phone: "01712 345678", email: "", consent: true };
const errorsOf = (r: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) =>
  Object.fromEntries((r.error?.issues ?? []).map((i) => [i.path.join("."), i.message]));

describe("testDriveSchema", () => {
  const valid = { vehicleId: "v1", showroomId: "tejgaon", date: "2026-11-15", slot: "10:30", notes: "", hasLicence: true, ...contact };

  it("accepts a complete booking and normalises the phone", () => {
    const r = testDriveSchema.safeParse(valid);
    expect(r.success).toBe(true);
    expect(r.data?.phone).toBe("+8801712345678");
    expect(r.data?.email).toBeUndefined();
  });

  it("requires a licence, consent, a slot and a date", () => {
    const r = testDriveSchema.safeParse({ ...valid, hasLicence: false, consent: false, slot: "", date: "15/11" });
    expect(errorsOf(r)).toMatchObject({ hasLicence: "licence", consent: "consent", slot: "slot", date: "date" });
  });
});

describe("serviceBookingSchema", () => {
  const base = { packageIds: ["essential"], showroomId: "tejgaon", date: "2026-11-15", slot: "11:00", pickup: false, notes: "", ...contact };

  it("accepts an owned vehicle", () => {
    expect(serviceBookingSchema.safeParse({ ...base, vehicleSource: "owned", ownedVehicleId: "ov-1" }).success).toBe(true);
  });

  it("requires brand, model, a plausible year and a registration number when entered manually", () => {
    const r = serviceBookingSchema.safeParse({ ...base, vehicleSource: "manual", brand: "", model: "", year: 1900, registrationNo: "x" });
    expect(errorsOf(r)).toMatchObject({ brand: "required", model: "required", year: "year", registrationNo: "registration" });
    const ok = serviceBookingSchema.safeParse({ ...base, vehicleSource: "manual", brand: "Toyota", model: "Axio", year: 2016, registrationNo: "Dhaka Metro-GA 11-2345" });
    expect(ok.success).toBe(true);
  });

  it("needs at least one package and a pickup address when pickup is chosen", () => {
    const r = serviceBookingSchema.safeParse({ ...base, vehicleSource: "owned", ownedVehicleId: "ov-1", packageIds: [], pickup: true, pickupAddress: "Gulshan" });
    expect(errorsOf(r)).toMatchObject({ packageIds: "selectPackage", pickupAddress: "address" });
  });
});

describe("corporate and contact schemas", () => {
  it("requires company details, a vehicle type and an email for corporate inquiries", () => {
    const r = corporateInquirySchema.safeParse({ company: "A", industry: "logistics", fleetSize: "upTo20", vehicleTypes: [], timeline: "quarter", financingInterest: false, ...contact });
    expect(errorsOf(r)).toMatchObject({ company: "company", vehicleTypes: "selectOne", email: "email" });
  });

  it("needs a real message on the contact form", () => {
    const r = contactSchema.safeParse({ topic: "sales", message: "hi", ...contact });
    expect(errorsOf(r)).toMatchObject({ message: "messageShort" });
    expect(contactSchema.safeParse({ topic: "sales", message: "Is the Axio still available?", ...contact }).success).toBe(true);
  });
});
