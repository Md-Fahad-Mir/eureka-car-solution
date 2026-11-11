import { addDaysToKey, addMonthsToKey } from "@/lib/format/date";
import type {
  CustomerProfile,
  DateKey,
  FinanceApplication,
  Notification,
  OwnedVehicle,
  PurchaseInquiry,
  Referral,
  ServiceBooking,
  ServiceHistoryEntry,
  TestDriveBooking,
} from "@/types";

/**
 * The seeded DEMO customer. Dates are computed relative to "today" (Dhaka) so
 * the demo always has an upcoming booking, a current EMI and recent activity.
 * Every reference is DEMO- prefixed; this is not a real person.
 */
export type DemoCustomerSeed = {
  profile: CustomerProfile;
  ownedVehicles: OwnedVehicle[];
  testDrives: TestDriveBooking[];
  inquiries: PurchaseInquiry[];
  financeApplications: FinanceApplication[];
  loan: {
    loanReference: string;
    ownedVehicleId: string;
    vehicleLabel: string;
    partnerId: string;
    financeType: "conventional";
    principal: number;
    annualRate: number;
    tenureMonths: number;
    firstDueDate: DateKey;
  };
  serviceBookings: ServiceBooking[];
  serviceHistory: ServiceHistoryEntry[];
  referral: { code: string; items: Referral[] };
  notifications: Notification[];
  favouriteIds: string[];
};

export const DEMO_CUSTOMER_ID = "demo-customer";

export function buildDemoCustomer(today: DateKey): DemoCustomerSeed {
  const day = (offset: number) => addDaysToKey(today, offset);
  const at = (offset: number, time: string) => `${day(offset)}T${time}:00+06:00`;
  const contact = { name: "Ayesha Rahman", phone: "+8801711000001", email: "ayesha.demo@example.com" };

  // First EMI was due on the 10th, 14 months ago.
  const thisMonth10 = `${today.slice(0, 7)}-10`;
  const firstDueDate = addMonthsToKey(thisMonth10, -14);

  return {
    profile: {
      id: DEMO_CUSTOMER_ID,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      city: "Dhaka",
      address: "House 00, Road 00 (demo address), Dhanmondi, Dhaka 1209",
      preferredLanguage: "en",
      preferredContact: "whatsapp",
      memberSince: addMonthsToKey(today, -32),
    },
    ownedVehicles: [
      {
        id: "ov-axio",
        label: "Toyota Axio Hybrid 2018",
        brand: "Toyota",
        model: "Axio Hybrid",
        year: 2018,
        registrationNo: "Dhaka Metro-Ga 00-0001 (demo)",
        fuelType: "hybrid",
        purchasedAt: addMonthsToKey(today, -32),
        odometerKm: 64_200,
        nextServiceDue: day(5),
      },
      {
        id: "ov-vezel",
        label: "Honda Vezel e:HEV 2021",
        brand: "Honda",
        model: "Vezel e:HEV",
        year: 2021,
        registrationNo: "Dhaka Metro-Gha 00-0002 (demo)",
        fuelType: "hybrid",
        purchasedAt: addMonthsToKey(firstDueDate, -1),
        odometerKm: 18_900,
        nextServiceDue: day(64),
      },
    ],
    testDrives: [
      {
        reference: "DEMO-TD-1186",
        createdAt: at(-2, "21:14"),
        isDemo: true,
        vehicleId: "v16",
        showroomId: "gulshan",
        date: day(3),
        slot: "11:00",
        customer: contact,
        status: "confirmed",
      },
      {
        reference: "DEMO-TD-0973",
        createdAt: at(-24, "10:02"),
        isDemo: true,
        vehicleId: "v19",
        showroomId: "tejgaon",
        date: day(-20),
        slot: "16:30",
        customer: contact,
        status: "completed",
      },
    ],
    inquiries: [
      {
        reference: "DEMO-PI-2044",
        createdAt: at(-19, "12:40"),
        isDemo: true,
        vehicleId: "v19",
        paymentPreference: "emi",
        contact: { channel: "whatsapp", time: "evening" },
        message: "Interested after the test drive. Please share EMI options for 60 months.",
        customer: contact,
        consent: true,
        status: "contacted",
      },
    ],
    financeApplications: [
      {
        reference: "DEMO-FA-2417",
        createdAt: at(-9, "11:20"),
        isDemo: true,
        vehicleId: "v19",
        vehiclePrice: 4_990_000,
        downPayment: 1_500_000,
        tenureMonths: 60,
        financeType: "conventional",
        partnerId: "partner-bank-a",
        applicant: {
          ...contact,
          nidLast4: "0000",
          city: "Dhaka",
          employment: "salaried",
          employer: "Demo Company Ltd.",
          monthlyIncome: 320_000,
          existingEmi: 59_000,
        },
        documents: ["nid-front.jpg", "salary-certificate.pdf", "bank-statement-6m.pdf"],
        status: "documentsVerified",
        timeline: [
          { status: "submitted", at: at(-9, "11:20") },
          { status: "underReview", at: at(-7, "15:05") },
          { status: "documentsVerified", at: at(-2, "12:30") },
          { status: "decision", at: null },
        ],
      },
    ],
    loan: {
      loanReference: "DEMO-LN-5530",
      ownedVehicleId: "ov-vezel",
      vehicleLabel: "Honda Vezel e:HEV 2021",
      partnerId: "partner-bank-b",
      financeType: "conventional",
      principal: 2_200_000,
      annualRate: 13,
      tenureMonths: 48,
      firstDueDate,
    },
    serviceBookings: [
      {
        reference: "DEMO-SB-3108",
        createdAt: at(-3, "09:45"),
        isDemo: true,
        vehicle: { ownedVehicleId: "ov-axio", brand: "Toyota", model: "Axio Hybrid", year: 2018, registrationNo: "Dhaka Metro-Ga 00-0001 (demo)" },
        packageIds: ["comprehensive", "hybrid-check"],
        showroomId: "tejgaon",
        date: day(5),
        slot: "10:00",
        pickup: { required: true, address: "House 00, Road 00 (demo address), Dhanmondi, Dhaka 1209" },
        customer: contact,
        status: "booked",
        timeline: [
          { status: "booked", at: at(-3, "09:45") },
          { status: "received", at: null },
          { status: "inService", at: null },
          { status: "qualityCheck", at: null },
          { status: "ready", at: null },
          { status: "delivered", at: null },
        ],
      },
      {
        reference: "DEMO-SB-2981",
        createdAt: at(-2, "18:10"),
        isDemo: true,
        vehicle: { ownedVehicleId: "ov-vezel", brand: "Honda", model: "Vezel e:HEV", year: 2021, registrationNo: "Dhaka Metro-Gha 00-0002 (demo)" },
        packageIds: ["ac-care"],
        showroomId: "tejgaon",
        date: day(0),
        slot: "09:30",
        pickup: { required: false },
        customer: contact,
        status: "inService",
        timeline: [
          { status: "booked", at: at(-2, "18:10") },
          { status: "received", at: at(0, "09:42") },
          { status: "inService", at: at(0, "10:15") },
          { status: "qualityCheck", at: null },
          { status: "ready", at: null },
          { status: "delivered", at: null },
        ],
      },
    ],
    serviceHistory: [
      {
        id: "sh-1",
        ownedVehicleId: "ov-axio",
        date: addMonthsToKey(today, -6),
        packageIds: ["essential"],
        showroomId: "tejgaon",
        odometerKm: 59_800,
        amount: 6_500,
        summary: { en: "Oil and filter change; front brake pads at 40% (advised).", bn: "অয়েল ও ফিল্টার পরিবর্তন; সামনের ব্রেক প্যাড ৪০% (পরামর্শ দেওয়া হয়েছে)।" },
      },
      {
        id: "sh-2",
        ownedVehicleId: "ov-vezel",
        date: addMonthsToKey(today, -4),
        packageIds: ["essential", "hybrid-check"],
        showroomId: "gulshan",
        odometerKm: 12_400,
        amount: 14_000,
        summary: { en: "First service; hybrid battery state of health 97%.", bn: "প্রথম সার্ভিস; হাইব্রিড ব্যাটারির স্টেট অব হেলথ ৯৭%।" },
      },
      {
        id: "sh-3",
        ownedVehicleId: "ov-axio",
        date: addMonthsToKey(today, -13),
        packageIds: ["comprehensive"],
        showroomId: "tejgaon",
        odometerKm: 52_100,
        amount: 18_500,
        summary: { en: "Annual service, alignment and AC filter replacement.", bn: "বার্ষিক সার্ভিস, অ্যালাইনমেন্ট ও এসি ফিল্টার পরিবর্তন।" },
      },
    ],
    referral: {
      code: "AYESHA-EU24",
      items: [
        { id: "r1", name: "Karim U.", status: "purchased", invitedAt: addMonthsToKey(today, -5), reward: 10_000 },
        { id: "r2", name: "Mitu S.", status: "testDriven", invitedAt: day(-21) },
        { id: "r3", name: "Rony D.", status: "invited", invitedAt: day(-4) },
      ],
    },
    notifications: [
      {
        id: "n1",
        kind: "finance",
        title: { en: "Documents verified (demo)", bn: "কাগজপত্র যাচাই সম্পন্ন (ডেমো)" },
        body: {
          en: "Application DEMO-FA-2417 moved to “Documents verified”. The partner institution makes the final decision.",
          bn: "আবেদন DEMO-FA-2417 এখন “কাগজপত্র যাচাই সম্পন্ন” ধাপে। চূড়ান্ত সিদ্ধান্ত দেবে পার্টনার প্রতিষ্ঠান।",
        },
        createdAt: at(-2, "12:31"),
        read: false,
        href: "/finance/status?ref=DEMO-FA-2417",
      },
      {
        id: "n2",
        kind: "service",
        title: { en: "Your Vezel is in service (demo)", bn: "আপনার ভেজেল সার্ভিসে আছে (ডেমো)" },
        body: { en: "Track DEMO-SB-2981 for live progress.", bn: "চলমান অগ্রগতি দেখতে DEMO-SB-2981 ট্র্যাক করুন।" },
        createdAt: at(0, "10:16"),
        read: false,
        href: "/service/track?ref=DEMO-SB-2981",
      },
      {
        id: "n3",
        kind: "booking",
        title: { en: "Test drive confirmed (demo)", bn: "টেস্ট ড্রাইভ নিশ্চিত (ডেমো)" },
        body: { en: "IONIQ 5 at Gulshan Studio, 11:00 am.", bn: "গুলশান স্টুডিওতে IONIQ 5, সকাল ১১টা।" },
        createdAt: at(-1, "10:00"),
        read: true,
        href: "/account/test-drives",
      },
      {
        id: "n4",
        kind: "offer",
        title: { en: "Sample offer: battery health check", bn: "নমুনা অফার: ব্যাটারি হেলথ চেক" },
        body: {
          en: "An example of the kind of offer customers might receive. Not a real promotion.",
          bn: "গ্রাহকরা কেমন অফার পেতে পারেন তার একটি উদাহরণ। এটি আসল প্রমোশন নয়।",
        },
        createdAt: at(-6, "09:00"),
        read: true,
        href: "/service",
      },
      {
        id: "n5",
        kind: "account",
        title: { en: "Welcome to your demo account", bn: "আপনার ডেমো অ্যাকাউন্টে স্বাগতম" },
        body: {
          en: "Everything here is sample data, saved only in this browser.",
          bn: "এখানের সবকিছু নমুনা তথ্য, শুধু এই ব্রাউজারে সংরক্ষিত।",
        },
        createdAt: at(-30, "09:00"),
        read: true,
      },
    ],
    favouriteIds: ["v16", "v20", "v12"],
  };
}
