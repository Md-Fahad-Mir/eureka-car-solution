import { buildDemoCustomer } from "@/data/mock/customer";
import { showrooms } from "@/data/mock/showrooms";
import { vehicles } from "@/data/mock/vehicles";
import { toDhakaDateKey } from "@/lib/format/date";
import type { ContactDetails, DateKey, TestDriveBooking, TimeKey } from "@/types";
import {
  ApiFieldError,
  assertMockPhoneAccepted,
  demoReference,
  mockDb,
  normalizeReference,
  nowIso,
  simulateLatency,
} from "./client";
import { buildSlots, isSlotAvailable, type DaySlots } from "./slots";

const SALT = "test-drive";

export type TestDriveInput = {
  vehicleId: string;
  showroomId: string;
  date: DateKey;
  slot: TimeKey;
  customer: ContactDetails;
  notes?: string;
};

/** Test-drive slots for one showroom and day. */
export async function getTestDriveAvailability(showroomId: string, date: DateKey): Promise<DaySlots> {
  // TODO(api): GET /test-drives/availability?showroom=&date= → DaySlots
  await simulateLatency();
  const showroom = showrooms.find((s) => s.id === showroomId);
  if (!showroom) return { date, closed: true, slots: [] };
  return buildSlots(showroom, date, SALT);
}

export async function createTestDriveBooking(input: TestDriveInput): Promise<TestDriveBooking> {
  // TODO(api): POST /test-drives → TestDriveBooking
  await simulateLatency();
  assertMockPhoneAccepted(input.customer.phone);
  const vehicle = vehicles.find((v) => v.id === input.vehicleId);
  if (!vehicle || vehicle.availability === "sold") throw new ApiFieldError("vehicleId", "vehicleUnavailable");
  const showroom = showrooms.find((s) => s.id === input.showroomId);
  if (!showroom || !vehicle.showroomIds.includes(showroom.id)) throw new ApiFieldError("showroomId", "select");
  if (!isSlotAvailable(showroom, input.date, input.slot, SALT)) throw new ApiFieldError("slot", "slotTaken");

  const booking: TestDriveBooking = {
    ...input,
    reference: demoReference("TD"),
    createdAt: nowIso(),
    isDemo: true,
    status: "requested",
  };
  mockDb().add("testDrives", booking);
  return booking;
}

/** Looks up a booking by reference (this browser's records, then the demo customer's). */
export async function getTestDriveBooking(reference: string): Promise<TestDriveBooking | null> {
  // TODO(api): GET /test-drives/:reference → TestDriveBooking | 404
  await simulateLatency();
  const ref = normalizeReference(reference);
  return (
    mockDb().testDrives.find((b) => b.reference === ref) ??
    buildDemoCustomer(toDhakaDateKey(new Date())).testDrives.find((b) => b.reference === ref) ??
    null
  );
}
