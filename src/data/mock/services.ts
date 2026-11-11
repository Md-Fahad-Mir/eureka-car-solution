import type { MaintenanceGuide, ServicePackage } from "@/types";

/** ILLUSTRATIVE service packages and "from" prices. Replace before launch. */
export const servicePackages: ServicePackage[] = [
  {
    id: "essential",
    slug: "essential-service",
    name: { en: "Essential Service", bn: "এসেনশিয়াল সার্ভিস" },
    summary: {
      en: "The routine visit that keeps an engine healthy between major services.",
      bn: "বড় সার্ভিসের মাঝখানে ইঞ্জিন ভালো রাখার নিয়মিত সার্ভিস।",
    },
    includes: [
      { en: "Engine oil and oil filter change", bn: "ইঞ্জিন অয়েল ও অয়েল ফিল্টার পরিবর্তন" },
      { en: "25-point safety inspection", bn: "২৫-পয়েন্ট নিরাপত্তা পরিদর্শন" },
      { en: "Fluid top-ups (coolant, brake, washer)", bn: "ফ্লুইড টপ-আপ (কুল্যান্ট, ব্রেক, ওয়াশার)" },
      { en: "Tyre pressure and tread check", bn: "টায়ারের প্রেশার ও ট্রেড পরীক্ষা" },
    ],
    price: { amount: 6_500, currency: "BDT" },
    durationHours: 2,
    fuelTypes: ["petrol", "diesel", "hybrid", "phev"],
    interval: { km: 5_000, months: 6 },
  },
  {
    id: "comprehensive",
    slug: "comprehensive-service",
    name: { en: "Comprehensive Service", bn: "কমপ্রিহেনসিভ সার্ভিস" },
    summary: {
      en: "Our full annual service, with filters, brakes, alignment and a diagnostic scan.",
      bn: "আমাদের পূর্ণাঙ্গ বার্ষিক সার্ভিস: ফিল্টার, ব্রেক, অ্যালাইনমেন্ট আর ডায়াগনস্টিক স্ক্যানসহ।",
    },
    includes: [
      { en: "Everything in Essential Service", bn: "এসেনশিয়াল সার্ভিসের সবকিছু" },
      { en: "Air and cabin filter replacement", bn: "এয়ার ও কেবিন ফিল্টার পরিবর্তন" },
      { en: "Brake inspection and cleaning", bn: "ব্রেক পরিদর্শন ও পরিষ্কার" },
      { en: "Wheel alignment and balancing", bn: "হুইল অ্যালাইনমেন্ট ও ব্যালান্সিং" },
      { en: "Computer diagnostic scan with report", bn: "রিপোর্টসহ কম্পিউটার ডায়াগনস্টিক স্ক্যান" },
    ],
    price: { amount: 18_500, currency: "BDT" },
    durationHours: 5,
    fuelTypes: ["petrol", "diesel", "hybrid", "phev", "ev"],
    interval: { km: 20_000, months: 12 },
  },
  {
    id: "hybrid-check",
    slug: "hybrid-system-check",
    name: { en: "Hybrid System Health Check", bn: "হাইব্রিড সিস্টেম হেলথ চেক" },
    summary: {
      en: "Peace of mind for older hybrids: a clear report on the hybrid battery and its cooling.",
      bn: "পুরোনো হাইব্রিডের জন্য নিশ্চিন্ত থাকার উপায়: হাইব্রিড ব্যাটারি ও এর কুলিং নিয়ে পরিষ্কার রিপোর্ট।",
    },
    includes: [
      { en: "Hybrid battery state-of-health test", bn: "হাইব্রিড ব্যাটারির স্টেট-অব-হেলথ পরীক্ষা" },
      { en: "Battery cooling fan and duct cleaning", bn: "ব্যাটারি কুলিং ফ্যান ও ডাক্ট পরিষ্কার" },
      { en: "Inverter coolant check", bn: "ইনভার্টার কুল্যান্ট পরীক্ষা" },
      { en: "Regenerative braking check", bn: "রিজেনারেটিভ ব্রেকিং পরীক্ষা" },
    ],
    price: { amount: 7_500, currency: "BDT" },
    durationHours: 2,
    fuelTypes: ["hybrid", "phev"],
    interval: { km: 20_000, months: 12 },
  },
  {
    id: "ev-battery",
    slug: "ev-battery-health-check",
    name: { en: "EV Battery Health Check", bn: "EV ব্যাটারি হেলথ চেক" },
    summary: {
      en: "A documented battery and charging-system check for EVs and plug-in hybrids, useful before buying or selling too.",
      bn: "EV ও প্লাগ-ইন হাইব্রিডের ব্যাটারি ও চার্জিং সিস্টেমের লিখিত রিপোর্টসহ পরীক্ষা, কেনাবেচার আগেও কাজে লাগে।",
    },
    includes: [
      { en: "State-of-health (SOH) report", bn: "স্টেট-অব-হেলথ (SOH) রিপোর্ট" },
      { en: "Cell balance and voltage check", bn: "সেল ব্যালান্স ও ভোল্টেজ পরীক্ষা" },
      { en: "Thermal system and coolant check", bn: "থার্মাল সিস্টেম ও কুল্যান্ট পরীক্ষা" },
      { en: "Charging port and on-board charger test", bn: "চার্জিং পোর্ট ও অন-বোর্ড চার্জার পরীক্ষা" },
      { en: "Software update check", bn: "সফটওয়্যার আপডেট পরীক্ষা" },
    ],
    price: { amount: 5_500, currency: "BDT" },
    durationHours: 1.5,
    fuelTypes: ["ev", "phev"],
    interval: { km: 15_000, months: 12 },
  },
  {
    id: "ac-care",
    slug: "ac-cooling-care",
    name: { en: "AC & Cooling Care", bn: "এসি ও কুলিং কেয়ার" },
    summary: {
      en: "Get ready for summer: a colder AC and a healthier cooling system.",
      bn: "গরমের প্রস্তুতি: আরও ঠান্ডা এসি আর সুস্থ কুলিং সিস্টেম।",
    },
    includes: [
      { en: "AC gas pressure check and recharge", bn: "এসি গ্যাস প্রেশার পরীক্ষা ও রিচার্জ" },
      { en: "Condenser and evaporator cleaning", bn: "কনডেন্সার ও ইভাপোরেটর পরিষ্কার" },
      { en: "Cabin filter replacement", bn: "কেবিন ফিল্টার পরিবর্তন" },
      { en: "Radiator and coolant check", bn: "রেডিয়েটর ও কুল্যান্ট পরীক্ষা" },
    ],
    price: { amount: 8_500, currency: "BDT" },
    durationHours: 3,
    fuelTypes: ["petrol", "diesel", "hybrid", "phev", "ev"],
  },
  {
    id: "commercial",
    slug: "commercial-tractor-service",
    name: { en: "Commercial & Tractor Service", bn: "বাণিজ্যিক গাড়ি ও ট্রাক্টর সার্ভিস" },
    summary: {
      en: "Built around uptime for trucks, vans and tractors, with on-site service available for fleets and farms.",
      bn: "ট্রাক, ভ্যান ও ট্রাক্টর সচল রাখার জন্য সাজানো; ফ্লিট ও খামারের জন্য অন-সাইট সার্ভিসের সুবিধা।",
    },
    includes: [
      { en: "Engine oil, fuel filter and water separator", bn: "ইঞ্জিন অয়েল, ফুয়েল ফিল্টার ও ওয়াটার সেপারেটর" },
      { en: "Greasing of all lubrication points", bn: "সব লুব্রিকেশন পয়েন্টে গ্রিজিং" },
      { en: "Clutch, PTO and hydraulics check", bn: "ক্লাচ, PTO ও হাইড্রলিক পরীক্ষা" },
      { en: "Brake and steering inspection", bn: "ব্রেক ও স্টিয়ারিং পরিদর্শন" },
    ],
    price: { amount: 12_000, currency: "BDT" },
    durationHours: 4,
    fuelTypes: ["diesel"],
    interval: { km: 5_000, months: 6 },
    forCommercial: true,
  },
];

/** Illustrative maintenance guidance by fuel type. Always defer to the owner's manual. */
export const maintenanceGuides: MaintenanceGuide[] = [
  {
    fuelType: "petrol",
    intervalKm: 5_000,
    intervalMonths: 6,
    focus: [
      { en: "Engine oil and filter", bn: "ইঞ্জিন অয়েল ও ফিল্টার" },
      { en: "Air filter (dusty roads shorten its life)", bn: "এয়ার ফিল্টার (ধুলোময় রাস্তায় দ্রুত নষ্ট হয়)" },
      { en: "Spark plugs at the interval in your manual", bn: "ম্যানুয়াল অনুযায়ী স্পার্ক প্লাগ" },
    ],
  },
  {
    fuelType: "diesel",
    intervalKm: 5_000,
    intervalMonths: 6,
    focus: [
      { en: "Engine oil and filter", bn: "ইঞ্জিন অয়েল ও ফিল্টার" },
      { en: "Fuel filter and water separator", bn: "ফুয়েল ফিল্টার ও ওয়াটার সেপারেটর" },
      { en: "Injector and turbo health", bn: "ইনজেক্টর ও টার্বোর অবস্থা" },
    ],
  },
  {
    fuelType: "hybrid",
    intervalKm: 10_000,
    intervalMonths: 12,
    focus: [
      { en: "Engine oil (the engine runs less, but still ages)", bn: "ইঞ্জিন অয়েল (ইঞ্জিন কম চলে, তবু পুরোনো হয়)" },
      { en: "Hybrid battery cooling fan", bn: "হাইব্রিড ব্যাটারির কুলিং ফ্যান" },
      { en: "Inverter coolant", bn: "ইনভার্টার কুল্যান্ট" },
    ],
  },
  {
    fuelType: "phev",
    intervalKm: 10_000,
    intervalMonths: 12,
    focus: [
      { en: "Engine oil, even if you mostly drive electric", bn: "ইঞ্জিন অয়েল, বেশিরভাগ সময় বিদ্যুতে চালালেও" },
      { en: "Battery state of health", bn: "ব্যাটারির স্টেট অব হেলথ" },
      { en: "Charging cable and port inspection", bn: "চার্জিং কেবল ও পোর্ট পরিদর্শন" },
    ],
  },
  {
    fuelType: "ev",
    intervalKm: 15_000,
    intervalMonths: 12,
    focus: [
      { en: "Tyres and rotation (EVs are heavier)", bn: "টায়ার ও রোটেশন (EV তুলনামূলক ভারী)" },
      { en: "Brake fluid and cabin filter", bn: "ব্রেক ফ্লুইড ও কেবিন ফিল্টার" },
      { en: "Battery coolant and state of health", bn: "ব্যাটারি কুল্যান্ট ও স্টেট অব হেলথ" },
    ],
  },
];
