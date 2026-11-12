import { z } from "zod";
import { consentSchema, nameSchema, optionalEmailSchema, optionalMessageSchema } from "./common";
import { bdPhoneSchema } from "./phone";

/**
 * Test-drive and service bookings (brief §10.H, §10.J). Error messages are
 * `validation.*` keys. Each step validates only its own fields.
 */

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "date" });
const timeKey = z.string().regex(/^\d{2}:\d{2}$/, { error: "slot" });
const selected = z.string().min(1, { error: "select" });

/* ── Test drive ── */

export const TEST_DRIVE_STEPS = ["vehicle", "showroom", "date", "time", "details", "review"] as const;
export type TestDriveStep = (typeof TEST_DRIVE_STEPS)[number];

export const testDriveSchema = z.object({
  vehicleId: selected,
  showroomId: selected,
  date: dateKey,
  slot: timeKey,
  name: nameSchema,
  phone: bdPhoneSchema,
  email: optionalEmailSchema,
  notes: optionalMessageSchema,
  hasLicence: z.boolean().refine((v) => v, { error: "licence" }),
  consent: consentSchema,
});

export type TestDriveInput = z.input<typeof testDriveSchema>;
export type TestDriveOutput = z.output<typeof testDriveSchema>;

export const TEST_DRIVE_STEP_FIELDS: Record<TestDriveStep, (keyof TestDriveInput)[]> = {
  vehicle: ["vehicleId"],
  showroom: ["showroomId"],
  date: ["date"],
  time: ["slot"],
  details: ["name", "phone", "email", "notes", "hasLicence"],
  review: ["consent"],
};

/* ── Service booking ── */

export const SERVICE_STEPS = ["vehicle", "packages", "centre", "when", "pickup", "details", "review"] as const;
export type ServiceStep = (typeof SERVICE_STEPS)[number];
export const VEHICLE_SOURCES = ["owned", "manual"] as const;

/** Oldest model year accepted for servicing. */
export const MIN_SERVICE_YEAR = 1980;

export const serviceBookingSchema = z
  .object({
    vehicleSource: z.enum(VEHICLE_SOURCES),
    ownedVehicleId: z.string().optional(),
    brand: z.string().trim().optional(),
    model: z.string().trim().optional(),
    year: z.number({ error: "year" }).int({ error: "year" }).optional(),
    registrationNo: z.string().trim().optional(),
    packageIds: z.array(z.string()).min(1, { error: "selectPackage" }),
    showroomId: selected,
    date: dateKey,
    slot: timeKey,
    pickup: z.boolean(),
    pickupAddress: z.string().trim().optional(),
    name: nameSchema,
    phone: bdPhoneSchema,
    email: optionalEmailSchema,
    notes: optionalMessageSchema,
    consent: consentSchema,
  })
  .superRefine((d, ctx) => {
    if (d.vehicleSource === "owned") {
      if (!d.ownedVehicleId) ctx.addIssue({ code: "custom", path: ["ownedVehicleId"], message: "select" });
    } else {
      if (!d.brand) ctx.addIssue({ code: "custom", path: ["brand"], message: "required" });
      if (!d.model) ctx.addIssue({ code: "custom", path: ["model"], message: "required" });
      const maxYear = new Date().getFullYear() + 1;
      if (d.year === undefined || Number.isNaN(d.year) || d.year < MIN_SERVICE_YEAR || d.year > maxYear) {
        ctx.addIssue({ code: "custom", path: ["year"], message: "year" });
      }
      if (!d.registrationNo || d.registrationNo.length < 4) ctx.addIssue({ code: "custom", path: ["registrationNo"], message: "registration" });
    }
    if (d.pickup && (!d.pickupAddress || d.pickupAddress.length < 10)) {
      ctx.addIssue({ code: "custom", path: ["pickupAddress"], message: "address" });
    }
  });

export type ServiceBookingFormInput = z.input<typeof serviceBookingSchema>;
export type ServiceBookingFormOutput = z.output<typeof serviceBookingSchema>;

export const SERVICE_STEP_FIELDS: Record<ServiceStep, (keyof ServiceBookingFormInput)[]> = {
  vehicle: ["vehicleSource", "ownedVehicleId", "brand", "model", "year", "registrationNo"],
  packages: ["packageIds"],
  centre: ["showroomId"],
  when: ["date", "slot"],
  pickup: ["pickup", "pickupAddress"],
  details: ["name", "phone", "email", "notes"],
  review: ["consent"],
};
