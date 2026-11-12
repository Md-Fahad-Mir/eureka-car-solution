import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  ContactMessage,
  CustomerProfile,
  FinanceApplication,
  PurchaseInquiry,
  ServiceBooking,
  TestDriveBooking,
} from "@/types";

/**
 * MOCK-MODE "SERVER" STORAGE. Records created during the session live in this
 * browser only (localStorage). Only `src/lib/api/*` may import this store
 * (ESLint-enforced), so swapping in a real API removes it without UI changes.
 */
export type DemoRecordCollections = {
  testDrives: TestDriveBooking[];
  inquiries: PurchaseInquiry[];
  financeApplications: FinanceApplication[];
  serviceBookings: ServiceBooking[];
  contactMessages: ContactMessage[];
};

type DemoRecordsState = DemoRecordCollections & {
  profile: Partial<Omit<CustomerProfile, "id">>;
  readNotificationIds: string[];
  add: <K extends keyof DemoRecordCollections>(key: K, record: DemoRecordCollections[K][number]) => void;
  patchProfile: (patch: DemoRecordsState["profile"]) => void;
  markRead: (ids: string[]) => void;
};

const empty: DemoRecordCollections = {
  testDrives: [],
  inquiries: [],
  financeApplications: [],
  serviceBookings: [],
  contactMessages: [],
};

export const useDemoRecordsStore = create<DemoRecordsState>()(
  persist(
    (set, get) => ({
      ...empty,
      profile: {},
      readNotificationIds: [],
      add: (key, record) => set({ [key]: [record, ...get()[key]] } as Partial<DemoRecordsState>),
      patchProfile: (patch) => set({ profile: { ...get().profile, ...patch } }),
      markRead: (ids) => set({ readNotificationIds: [...new Set([...get().readNotificationIds, ...ids])] }),
    }),
    {
      name: "eureka-demo-records",
      version: 1,
      storage: createJSONStorage(() => window.localStorage),
      skipHydration: true,
    },
  ),
);
