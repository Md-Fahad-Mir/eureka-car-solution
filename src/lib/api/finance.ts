import { buildDemoCustomer } from "@/data/mock/customer";
import { financePartners } from "@/data/mock/partners";
import { toDhakaDateKey } from "@/lib/format/date";
import type { FinanceApplication, FinancePartner, FinanceType } from "@/types";
import { FINANCE_STATUSES } from "@/types";
import { assertMockPhoneAccepted, demoReference, mockDb, normalizeReference, nowIso, simulateLatency } from "./client";

/** Fictional sample partners, optionally filtered by conventional / Islamic. */
export async function getFinancePartners(type?: FinanceType): Promise<FinancePartner[]> {
  // TODO(api): GET /finance/partners?type= → FinancePartner[]
  await simulateLatency();
  return type ? financePartners.filter((p) => p.type === type) : financePartners;
}

export type FinanceApplicationInput = Omit<FinanceApplication, "reference" | "createdAt" | "isDemo" | "status" | "timeline">;

/**
 * Submits an application. In mock mode it is only saved in this browser and
 * stays at "Submitted": nothing is reviewed, and no decision is ever implied.
 */
export async function submitFinanceApplication(input: FinanceApplicationInput): Promise<FinanceApplication> {
  // TODO(api): POST /finance/applications → FinanceApplication
  await simulateLatency();
  assertMockPhoneAccepted(input.applicant.phone);
  const createdAt = nowIso();
  const application: FinanceApplication = {
    ...input,
    reference: demoReference("FA"),
    createdAt,
    isDemo: true,
    status: "submitted",
    timeline: FINANCE_STATUSES.map((status) => ({ status, at: status === "submitted" ? createdAt : null })),
  };
  mockDb().add("financeApplications", application);
  return application;
}

/** Status lookup by reference (this browser's applications, then the demo customer's). */
export async function getFinanceApplicationStatus(reference: string): Promise<FinanceApplication | null> {
  // TODO(api): GET /finance/applications/:reference → FinanceApplication | 404
  await simulateLatency();
  const ref = normalizeReference(reference);
  return (
    mockDb().financeApplications.find((a) => a.reference === ref) ??
    buildDemoCustomer(toDhakaDateKey(new Date())).financeApplications.find((a) => a.reference === ref) ??
    null
  );
}
