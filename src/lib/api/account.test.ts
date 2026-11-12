import { describe, expect, it } from "vitest";
import { calculateEmi } from "@/lib/calc/emi";
import { getCustomerDashboard } from "./account";
import { getFinanceApplicationStatus } from "./finance";
import { trackServiceBooking } from "./service";

describe("demo customer dashboard", () => {
  it("builds an EMI schedule with paid, one due and upcoming instalments", async () => {
    const { emiSchedule } = await getCustomerDashboard();
    expect(emiSchedule.payments).toHaveLength(48);
    expect(emiSchedule.monthlyPayment).toBeCloseTo(calculateEmi(2_200_000, 13, 48), 8);
    const paid = emiSchedule.payments.filter((p) => p.status === "paid").length;
    // First EMI fell due on the 10th, 14 months before this month: 14 paid, or 15 once this month's 10th has passed.
    expect([14, 15]).toContain(paid);
    expect(emiSchedule.payments.filter((p) => p.status === "due")).toHaveLength(1);
    const firstUnpaid = emiSchedule.payments.findIndex((p) => p.status !== "paid");
    expect(emiSchedule.payments[firstUnpaid].status).toBe("due");
  });

  it("joins vehicles onto bookings and applications", async () => {
    const d = await getCustomerDashboard();
    expect(d.testDrives.every((t) => t.vehicle?.id === t.vehicleId)).toBe(true);
    expect(d.financeApplications[0].vehicle?.brand.name.en).toBe("BYD");
    expect(d.favouriteIds).toHaveLength(3);
  });
});

describe("reference lookups", () => {
  it("finds seeded demo records case-insensitively", async () => {
    expect((await getFinanceApplicationStatus(" demo-fa-2417 "))?.status).toBe("documentsVerified");
    expect((await trackServiceBooking("DEMO-SB-2981"))?.status).toBe("inService");
    expect(await trackServiceBooking("DEMO-SB-0000")).toBeNull();
  });
});

describe("demo sign-in", () => {
  it("starts a demo session and merges the demo customer's saved vehicles", async () => {
    const { useFavoritesStore } = await import("@/stores/favorites");
    const { useDemoSessionStore } = await import("@/stores/demoSession");
    const { signInDemo, signOut } = await import("./account");
    useFavoritesStore.setState({ ids: ["already-saved"] });
    const session = await signInDemo();
    expect(session.method).toBe("demo");
    expect(useDemoSessionStore.getState().session?.customerId).toBe("demo-customer");
    const ids = useFavoritesStore.getState().ids;
    expect(ids[0]).toBe("already-saved");
    expect(ids).toHaveLength(4);
    await signInDemo();
    expect(useFavoritesStore.getState().ids).toHaveLength(4);
    await signOut();
    expect(useDemoSessionStore.getState().session).toBeNull();
  });

  it("rejects a wrong one-time code", async () => {
    const { verifySignInCode } = await import("./account");
    await expect(verifySignInCode("a@example.com", "000000")).rejects.toMatchObject({ field: "code", messageKey: "otp" });
  });
});
