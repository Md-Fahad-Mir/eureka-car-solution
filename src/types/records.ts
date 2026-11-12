import type { DateKey, IsoDateTime, LocalizedText, TimeKey } from "./common";
import type { FinanceType } from "./finance";

/**
 * Records created by customer actions. In mock mode they live in this browser
 * only and every reference starts with `DEMO-`.
 */

export type ContactDetails = {
  name: string;
  /** E.164, e.g. +8801712345678. */
  phone: string;
  email?: string;
};

export type ContactChannel = "call" | "whatsapp" | "email";
export type ContactTime = "morning" | "afternoon" | "evening" | "anytime";

export type StatusEvent<S extends string> = {
  status: S;
  /** When the step completed; null = not reached yet. */
  at: IsoDateTime | null;
  note?: LocalizedText;
};

type RecordBase = { reference: string; createdAt: IsoDateTime; isDemo: boolean };

export type TestDriveStatus = "requested" | "confirmed" | "completed" | "cancelled";
export type TestDriveBooking = RecordBase & {
  vehicleId: string;
  showroomId: string;
  date: DateKey;
  slot: TimeKey;
  customer: ContactDetails;
  notes?: string;
  status: TestDriveStatus;
};

export type PaymentPreference = "full" | "emi" | "islamic" | "tradeIn";
export type PurchaseInquiry = RecordBase & {
  vehicleId?: string;
  paymentPreference: PaymentPreference;
  financingPreference?: string;
  contact: { channel: ContactChannel; time: ContactTime };
  message?: string;
  customer: ContactDetails;
  consent: boolean;
  status: "received" | "contacted" | "closed";
};

export const FINANCE_STATUSES = ["submitted", "underReview", "documentsVerified", "decision"] as const;
export type FinanceStatus = (typeof FINANCE_STATUSES)[number];
export const EMPLOYMENT_TYPES = ["salaried", "business", "professional"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export type FinanceApplication = RecordBase & {
  vehicleId?: string;
  vehiclePrice: number;
  downPayment: number;
  tenureMonths: number;
  financeType: FinanceType;
  partnerId?: string;
  applicant: ContactDetails & {
    nidLast4?: string;
    city: string;
    employment: EmploymentType;
    employer?: string;
    monthlyIncome: number;
    existingEmi?: number;
  };
  /** File names only. Files are never uploaded in this frontend. */
  documents: string[];
  status: FinanceStatus;
  timeline: StatusEvent<FinanceStatus>[];
};

export const SERVICE_STATUSES = ["booked", "received", "inService", "qualityCheck", "ready", "delivered"] as const;
export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

export type ServiceVehicle = {
  /** Set when booked from "My vehicles". */
  ownedVehicleId?: string;
  brand: string;
  model: string;
  year: number;
  registrationNo: string;
};

export type ServiceBooking = RecordBase & {
  vehicle: ServiceVehicle;
  packageIds: string[];
  showroomId: string;
  date: DateKey;
  slot: TimeKey;
  pickup: { required: boolean; address?: string };
  customer: ContactDetails;
  notes?: string;
  status: ServiceStatus;
  timeline: StatusEvent<ServiceStatus>[];
};

export type ContactMessage = RecordBase & {
  showroomId?: string;
  topic: string;
  message: string;
  customer: ContactDetails;
  consent: boolean;
};
