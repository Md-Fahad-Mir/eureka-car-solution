import type { DateKey, IsoDateTime, LocalizedText } from "./common";
import type { EmiSchedule } from "./finance";
import type {
  ContactChannel,
  FinanceApplication,
  PurchaseInquiry,
  ServiceBooking,
  TestDriveBooking,
} from "./records";
import type { VehicleWithBrand } from "./vehicle";

export type CustomerProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  preferredLanguage: "en" | "bn";
  preferredContact: ContactChannel;
  memberSince: DateKey;
};

/** A vehicle the customer owns (bought from Eureka or registered for service). */
export type OwnedVehicle = {
  id: string;
  label: string;
  brand: string;
  model: string;
  year: number;
  registrationNo: string;
  fuelType: VehicleWithBrand["fuelType"];
  purchasedAt: DateKey;
  odometerKm: number;
  nextServiceDue: DateKey;
};

export type ServiceHistoryEntry = {
  id: string;
  ownedVehicleId: string;
  date: DateKey;
  packageIds: string[];
  showroomId: string;
  odometerKm: number;
  amount: number;
  summary: LocalizedText;
};

export type NotificationKind = "booking" | "finance" | "service" | "offer" | "account";
export type Notification = {
  id: string;
  kind: NotificationKind;
  title: LocalizedText;
  body: LocalizedText;
  createdAt: IsoDateTime;
  read: boolean;
  href?: string;
};

export type ReferralStatus = "invited" | "testDriven" | "purchased";
export type Referral = {
  id: string;
  name: string;
  status: ReferralStatus;
  invitedAt: DateKey;
  /** Illustrative reward in BDT once the referral purchases. */
  reward?: number;
};

export type CustomerDashboard = {
  profile: CustomerProfile;
  ownedVehicles: OwnedVehicle[];
  testDrives: (TestDriveBooking & { vehicle: VehicleWithBrand | null })[];
  inquiries: (PurchaseInquiry & { vehicle: VehicleWithBrand | null })[];
  financeApplications: (FinanceApplication & { vehicle: VehicleWithBrand | null })[];
  emiSchedule: EmiSchedule;
  serviceBookings: ServiceBooking[];
  serviceHistory: ServiceHistoryEntry[];
  referral: { code: string; items: Referral[] };
  notifications: Notification[];
  /** Saved vehicles seeded for the demo customer. */
  favouriteIds: string[];
};
