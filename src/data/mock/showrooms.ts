import type { OpeningHours, Showroom, Weekday } from "@/types";

/**
 * ILLUSTRATIVE showrooms. Addresses, phone numbers and emails are
 * placeholders (phones use the invalid 10xx prefix, emails use .example).
 * Map coordinates point at the neighbourhood only.
 */

const week = (open: string, close: string, friday: OpeningHours = null): Record<Weekday, OpeningHours> => ({
  sat: { open, close },
  sun: { open, close },
  mon: { open, close },
  tue: { open, close },
  wed: { open, close },
  thu: { open, close },
  fri: friday,
});

const phone = (n: string) => ({ display: `+880 1000-000${n}`, href: `tel:+8801000000${n}` });

export const showrooms: Showroom[] = [
  {
    id: "tejgaon",
    slug: "dhaka-tejgaon",
    name: { en: "Eureka Tejgaon Flagship", bn: "ইউরেকা তেজগাঁও ফ্ল্যাগশিপ" },
    city: { en: "Dhaka", bn: "ঢাকা" },
    address: {
      en: "Plot 00 (illustrative), Tejgaon Industrial Area, Dhaka 1208",
      bn: "প্লট ০০ (নমুনা ঠিকানা), তেজগাঁও শিল্প এলাকা, ঢাকা ১২০৮",
    },
    geo: { lat: 23.7639, lng: 90.3935 },
    phone: phone("101"),
    email: "tejgaon@eureka-cars.example",
    hours: week("10:00", "19:00", { open: "15:00", close: "19:00" }),
    services: ["sales", "testDrive", "service", "evCharging", "financeDesk", "bodyShop", "commercial"],
  },
  {
    id: "gulshan",
    slug: "dhaka-gulshan",
    name: { en: "Eureka Gulshan Studio", bn: "ইউরেকা গুলশান স্টুডিও" },
    city: { en: "Dhaka", bn: "ঢাকা" },
    address: {
      en: "House 00, Road 00 (illustrative), Gulshan 2, Dhaka 1212",
      bn: "বাড়ি ০০, রোড ০০ (নমুনা ঠিকানা), গুলশান ২, ঢাকা ১২১২",
    },
    geo: { lat: 23.7925, lng: 90.4078 },
    phone: phone("102"),
    email: "gulshan@eureka-cars.example",
    hours: week("11:00", "20:00", { open: "15:00", close: "20:00" }),
    services: ["sales", "testDrive", "evCharging", "financeDesk"],
  },
  {
    id: "chattogram",
    slug: "chattogram-agrabad",
    name: { en: "Eureka Chattogram", bn: "ইউরেকা চট্টগ্রাম" },
    city: { en: "Chattogram", bn: "চট্টগ্রাম" },
    address: {
      en: "Holding 00 (illustrative), Agrabad Commercial Area, Chattogram 4100",
      bn: "হোল্ডিং ০০ (নমুনা ঠিকানা), আগ্রাবাদ বাণিজ্যিক এলাকা, চট্টগ্রাম ৪১০০",
    },
    geo: { lat: 22.3302, lng: 91.8122 },
    phone: phone("103"),
    email: "chattogram@eureka-cars.example",
    hours: week("10:00", "19:00"),
    services: ["sales", "testDrive", "service", "financeDesk", "commercial", "bodyShop"],
  },
  {
    id: "sylhet",
    slug: "sylhet-upashahar",
    name: { en: "Eureka Sylhet", bn: "ইউরেকা সিলেট" },
    city: { en: "Sylhet", bn: "সিলেট" },
    address: {
      en: "Block 00 (illustrative), Upashahar, Sylhet 3100",
      bn: "ব্লক ০০ (নমুনা ঠিকানা), উপশহর, সিলেট ৩১০০",
    },
    geo: { lat: 24.8949, lng: 91.8687 },
    phone: phone("104"),
    email: "sylhet@eureka-cars.example",
    hours: week("10:00", "18:30"),
    services: ["sales", "testDrive", "service"],
  },
  {
    id: "bogura",
    slug: "bogura-commercial-agri",
    name: { en: "Eureka Bogura Commercial & Agri Centre", bn: "ইউরেকা বগুড়া বাণিজ্যিক ও কৃষি সেন্টার" },
    city: { en: "Bogura", bn: "বগুড়া" },
    address: {
      en: "Plot 00 (illustrative), Dhaka–Bogura Highway, Bogura 5800",
      bn: "প্লট ০০ (নমুনা ঠিকানা), ঢাকা–বগুড়া মহাসড়ক, বগুড়া ৫৮০০",
    },
    geo: { lat: 24.8465, lng: 89.3773 },
    phone: phone("105"),
    email: "bogura@eureka-cars.example",
    hours: week("09:00", "18:00"),
    services: ["sales", "testDrive", "service", "commercial", "tractorService", "financeDesk"],
  },
];
