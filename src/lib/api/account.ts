import { brands } from "@/data/mock/brands";
import { buildDemoCustomer, DEMO_CUSTOMER_ID } from "@/data/mock/customer";
import { vehicles } from "@/data/mock/vehicles";
import { calculateEmi } from "@/lib/calc/emi";
import { addMonthsToKey, toDhakaDateKey } from "@/lib/format/date";
import { useDemoSessionStore, type DemoSession } from "@/stores/demoSession";
import { useFavoritesStore } from "@/stores/favorites";
import { ensureHydrated } from "@/stores/persist";
import type { CustomerDashboard, CustomerProfile, DateKey, EmiSchedule, VehicleWithBrand } from "@/types";
import { ApiFieldError, mockDb, nowIso, simulateLatency } from "./client";

/**
 * DEMO account. There is no real authentication: "signing in" only stores a
 * client-side demo session in this browser. Everything shown is sample data
 * plus records created in this browser.
 */

/** The one-time code accepted by the demo email sign-in (shown on screen; no email is sent). */
export const DEMO_SIGN_IN_CODE = "123456";

function joinVehicle(id: string | undefined): VehicleWithBrand | null {
  const v = id ? vehicles.find((x) => x.id === id) : undefined;
  if (!v) return null;
  return { ...v, brand: brands.find((b) => b.id === v.brandId)! };
}

function buildEmiSchedule(seed: ReturnType<typeof buildDemoCustomer>["loan"], today: DateKey): EmiSchedule {
  const monthlyPayment = calculateEmi(seed.principal, seed.annualRate, seed.tenureMonths);
  let dueAssigned = false;
  const payments = Array.from({ length: seed.tenureMonths }, (_, i) => {
    const dueDate = addMonthsToKey(seed.firstDueDate, i);
    let status: EmiSchedule["payments"][number]["status"] = "upcoming";
    if (dueDate < today) status = "paid";
    else if (!dueAssigned) {
      status = "due";
      dueAssigned = true;
    }
    return { installment: i + 1, dueDate, amount: monthlyPayment, status };
  });
  return {
    loanReference: seed.loanReference,
    vehicleLabel: seed.vehicleLabel,
    partnerId: seed.partnerId,
    financeType: seed.financeType,
    principal: seed.principal,
    annualRate: seed.annualRate,
    tenureMonths: seed.tenureMonths,
    startDate: seed.firstDueDate,
    monthlyPayment,
    payments,
  };
}

const byNewest = <T extends { createdAt: string }>(a: T, b: T) => b.createdAt.localeCompare(a.createdAt);

/** Dashboard for the demo customer: seeded data + records created in this browser. Client-side only. */
export async function getCustomerDashboard(): Promise<CustomerDashboard> {
  // TODO(api): GET /me/dashboard (authenticated) → CustomerDashboard
  await simulateLatency();
  const today = toDhakaDateKey(new Date());
  const seed = buildDemoCustomer(today);
  const db = mockDb();
  const read = new Set(db.readNotificationIds);

  return {
    profile: { ...seed.profile, ...db.profile },
    ownedVehicles: seed.ownedVehicles,
    testDrives: [...db.testDrives, ...seed.testDrives].sort(byNewest).map((b) => ({ ...b, vehicle: joinVehicle(b.vehicleId) })),
    inquiries: [...db.inquiries, ...seed.inquiries].sort(byNewest).map((i) => ({ ...i, vehicle: joinVehicle(i.vehicleId) })),
    financeApplications: [...db.financeApplications, ...seed.financeApplications]
      .sort(byNewest)
      .map((a) => ({ ...a, vehicle: joinVehicle(a.vehicleId) })),
    emiSchedule: buildEmiSchedule(seed.loan, today),
    serviceBookings: [...db.serviceBookings, ...seed.serviceBookings].sort(byNewest),
    serviceHistory: seed.serviceHistory,
    referral: seed.referral,
    notifications: seed.notifications.map((n) => ({ ...n, read: n.read || read.has(n.id) })),
    favouriteIds: seed.favouriteIds,
  };
}

export type ProfilePatch = Partial<Pick<CustomerProfile, "name" | "email" | "phone" | "city" | "address" | "preferredLanguage" | "preferredContact">>;

export async function updateProfile(patch: ProfilePatch): Promise<CustomerProfile> {
  // TODO(api): PATCH /me/profile → CustomerProfile
  await simulateLatency();
  if (patch.phone && patch.phone.replace(/\D/g, "").endsWith("0000")) throw new ApiFieldError("phone", "phoneServer");
  const db = mockDb();
  db.patchProfile(patch);
  return { ...buildDemoCustomer(toDhakaDateKey(new Date())).profile, ...db.profile, ...patch };
}

export async function markNotificationsRead(ids: string[]): Promise<void> {
  // TODO(api): POST /me/notifications/read { ids }
  await simulateLatency();
  mockDb().markRead(ids);
}

function startSession(session: Omit<DemoSession, "customerId" | "signedInAt">): DemoSession {
  ensureHydrated(useDemoSessionStore);
  const full: DemoSession = { customerId: DEMO_CUSTOMER_ID, signedInAt: nowIso(), ...session };
  useDemoSessionStore.getState().setSession(full);
  // The demo customer's saved vehicles join any the visitor saved before signing in.
  ensureHydrated(useFavoritesStore);
  const favourites = useFavoritesStore.getState();
  const seeded = buildDemoCustomer(toDhakaDateKey(new Date())).favouriteIds;
  useFavoritesStore.setState({ ids: [...new Set([...favourites.ids, ...seeded])] });
  return full;
}

/** "Continue as demo customer". */
export async function signInDemo(): Promise<DemoSession> {
  // TODO(api): replace with real authentication (this is a demo session, not auth)
  await simulateLatency();
  return startSession({ method: "demo" });
}

/** Demo email sign-in, step 1. No email is sent; the UI shows the demo code. */
export async function requestSignInCode(email: string): Promise<{ sentTo: string; demoCode: string }> {
  // TODO(api): POST /auth/otp { email } → { sentTo }
  await simulateLatency();
  return { sentTo: email, demoCode: DEMO_SIGN_IN_CODE };
}

/** Demo email sign-in, step 2. */
export async function verifySignInCode(email: string, code: string): Promise<DemoSession> {
  // TODO(api): POST /auth/otp/verify { email, code } → session
  await simulateLatency();
  if (code.trim() !== DEMO_SIGN_IN_CODE) throw new ApiFieldError("code", "otp");
  return startSession({ method: "otp", email });
}

export async function signOut(): Promise<void> {
  // TODO(api): POST /auth/sign-out
  await simulateLatency();
  ensureHydrated(useDemoSessionStore);
  useDemoSessionStore.getState().setSession(null);
}
