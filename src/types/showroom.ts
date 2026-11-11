import type { GeoPoint, LocalizedText, TimeKey } from "./common";

export const WEEKDAYS = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export type OpeningHours = { open: TimeKey; close: TimeKey } | null;

export const SHOWROOM_SERVICES = [
  "sales",
  "testDrive",
  "service",
  "evCharging",
  "financeDesk",
  "bodyShop",
  "commercial",
  "tractorService",
] as const;
export type ShowroomService = (typeof SHOWROOM_SERVICES)[number];

export type Showroom = {
  id: string;
  slug: string;
  name: LocalizedText;
  city: LocalizedText;
  address: LocalizedText;
  geo: GeoPoint;
  phone: { display: string; href: string };
  email: string;
  /** Asia/Dhaka local opening hours per weekday; null = closed. */
  hours: Record<Weekday, OpeningHours>;
  services: ShowroomService[];
};
