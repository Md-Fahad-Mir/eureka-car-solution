import type { BodyType, EmploymentType, VehicleCategory } from "@/types";

/**
 * Finance and on-road cost assumptions.
 *
 * SAMPLE VALUES, UPDATE BEFORE LAUNCH. Rates, tenures, down-payment rules and
 * registration costs below are illustrative only. Real figures depend on the
 * partner institution, Bangladesh Bank guidelines and BRTA fees at the time.
 */
export const financeConfig = {
  conventional: { defaultAnnualRate: 13, minRate: 0, maxRate: 25 },
  islamic: { defaultProfitRate: 12.5, minRate: 0, maxRate: 25 },
  tenure: { min: 12, max: 84, step: 6, default: 60 },
  downPayment: { minPercent: 10, maxPercent: 90, defaultPercent: 30 },
  /** Example vehicle price for calculators that start without a vehicle (BDT). */
  samplePrice: 4_000_000,

  /** Assumptions behind the "EMI from" estimate on vehicle cards. */
  emiFrom: { downPaymentPercent: 30, tenureMonths: 60, annualRate: 13 },
} as const;

/** Illustrative on-road cost components (BDT). Shown with an "estimate" label. */
export const onRoadConfig = {
  /** First registration incl. advance tax, by engine size. Check current BRTA/NBR rates. */
  registrationByCc: [
    { maxCc: 1500, amount: 140_000 },
    { maxCc: 2000, amount: 195_000 },
    { maxCc: 3000, amount: 320_000 },
    { maxCc: Number.POSITIVE_INFINITY, amount: 450_000 },
  ],
  /** Flat illustrative registration for EVs, commercial vehicles and tractors. */
  registrationByType: { ev: 120_000, commercial: 95_000, tractor: 35_000 } satisfies Partial<
    Record<"ev" | VehicleCategory, number>
  >,
  /** Already-registered used vehicles only pay ownership transfer. */
  ownershipTransfer: 25_000,
  /** First-year comprehensive insurance as a share of the price. */
  insurancePercent: 1.5,
  /** Eureka documentation & handover fee. */
  documentationFee: 15_000,
  /** Body types that commonly need a commercial route permit (informational). */
  commercialBodies: ["van", "truck"] satisfies BodyType[],
} as const;

/**
 * Typical documents partners ask for, by applicant type (labels in messages
 * `finance.documents.items.*`). Illustrative; each institution has its own list.
 */
export const financeDocuments = {
  common: ["nid", "photos", "tin", "bankStatement", "utilityBill"],
  salaried: ["salaryCertificate", "payslips"],
  business: ["tradeLicence", "businessStatements", "taxReturn"],
  professional: ["professionalCertificate", "incomeProof", "taxReturn"],
} as const;

export type FinanceDocumentKey =
  | (typeof financeDocuments)["common"][number]
  | (typeof financeDocuments)["salaried"][number]
  | (typeof financeDocuments)["business"][number]
  | (typeof financeDocuments)["professional"][number];

/** Documents for an applicant type: common ones first. */
export const documentsFor = (type: EmploymentType): FinanceDocumentKey[] => [
  ...financeDocuments.common,
  ...financeDocuments[type],
];
