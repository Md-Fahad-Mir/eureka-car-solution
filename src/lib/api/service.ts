import { buildDemoCustomer } from "@/data/mock/customer";
import { maintenanceGuides, servicePackages } from "@/data/mock/services";
import { showrooms } from "@/data/mock/showrooms";
import { toDhakaDateKey } from "@/lib/format/date";
import type { DateKey, MaintenanceGuide, ServiceBooking, ServicePackage } from "@/types";
import { SERVICE_STATUSES } from "@/types";
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

const SALT = "service";
const canService = (id: string) =>
  showrooms.some((s) => s.id === id && (s.services.includes("service") || s.services.includes("tractorService")));

export async function getServicePackages(): Promise<ServicePackage[]> {
  // TODO(api): GET /service/packages → ServicePackage[]
  await simulateLatency();
  return servicePackages;
}

export async function getMaintenanceGuides(): Promise<MaintenanceGuide[]> {
  // TODO(api): GET /service/maintenance-guides → MaintenanceGuide[]
  await simulateLatency();
  return maintenanceGuides;
}

/** Service-bay slots for one service centre and day. */
export async function getServiceAvailability(showroomId: string, date: DateKey): Promise<DaySlots> {
  // TODO(api): GET /service/availability?centre=&date= → DaySlots
  await simulateLatency();
  const showroom = showrooms.find((s) => s.id === showroomId);
  if (!showroom || !canService(showroomId)) return { date, closed: true, slots: [] };
  return buildSlots(showroom, date, SALT);
}

export type ServiceBookingInput = Omit<ServiceBooking, "reference" | "createdAt" | "isDemo" | "status" | "timeline">;

export async function createServiceBooking(input: ServiceBookingInput): Promise<ServiceBooking> {
  // TODO(api): POST /service/bookings → ServiceBooking
  await simulateLatency();
  assertMockPhoneAccepted(input.customer.phone);
  if (input.packageIds.length === 0 || !input.packageIds.every((id) => servicePackages.some((p) => p.id === id))) {
    throw new ApiFieldError("packageIds", "select");
  }
  const showroom = showrooms.find((s) => s.id === input.showroomId);
  if (!showroom || !canService(showroom.id)) throw new ApiFieldError("showroomId", "select");
  if (!isSlotAvailable(showroom, input.date, input.slot, SALT)) throw new ApiFieldError("slot", "slotTaken");

  const createdAt = nowIso();
  const booking: ServiceBooking = {
    ...input,
    reference: demoReference("SB"),
    createdAt,
    isDemo: true,
    status: "booked",
    timeline: SERVICE_STATUSES.map((status) => ({ status, at: status === "booked" ? createdAt : null })),
  };
  mockDb().add("serviceBookings", booking);
  return booking;
}

/** Tracking lookup by reference (this browser's bookings, then the demo customer's). */
export async function trackServiceBooking(reference: string): Promise<ServiceBooking | null> {
  // TODO(api): GET /service/bookings/:reference → ServiceBooking | 404
  await simulateLatency();
  const ref = normalizeReference(reference);
  return (
    mockDb().serviceBookings.find((b) => b.reference === ref) ??
    buildDemoCustomer(toDhakaDateKey(new Date())).serviceBookings.find((b) => b.reference === ref) ??
    null
  );
}
