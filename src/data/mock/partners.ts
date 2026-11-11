import type { FinancePartner } from "@/types";

/**
 * FICTIONAL, SAMPLE finance partners. Never use a real bank's name or logo
 * here. Replace only with real, signed partners before launch.
 */
export const financePartners: FinancePartner[] = [
  {
    id: "partner-bank-a",
    name: { en: "Partner Bank A", bn: "পার্টনার ব্যাংক এ" },
    type: "conventional",
    rateRange: { min: 12.5, max: 14.5 },
    maxTenureMonths: 72,
    maxFinancePercent: 60,
    processingFeePercent: 0.5,
    highlights: [
      { en: "Salaried and business applicants", bn: "চাকরিজীবী ও ব্যবসায়ী আবেদনকারী" },
      { en: "New and reconditioned vehicles", bn: "নতুন ও রিকন্ডিশন্ড গাড়ি" },
    ],
    isSample: true,
  },
  {
    id: "partner-bank-b",
    name: { en: "Partner Bank B", bn: "পার্টনার ব্যাংক বি" },
    type: "conventional",
    rateRange: { min: 12.75, max: 14.25 },
    maxTenureMonths: 60,
    maxFinancePercent: 50,
    processingFeePercent: 0.75,
    highlights: [
      { en: "Fast-track for existing account holders", bn: "বিদ্যমান অ্যাকাউন্টধারীদের জন্য দ্রুত প্রক্রিয়া" },
      { en: "Early settlement option", bn: "আগেভাগে পরিশোধের সুযোগ" },
    ],
    isSample: true,
  },
  {
    id: "meridian-finance",
    name: { en: "Meridian Finance", bn: "মেরিডিয়ান ফাইন্যান্স" },
    type: "conventional",
    rateRange: { min: 13.5, max: 15.5 },
    maxTenureMonths: 60,
    maxFinancePercent: 60,
    processingFeePercent: 1,
    highlights: [
      { en: "Flexible for self-employed professionals", bn: "স্বনিয়োজিত পেশাজীবীদের জন্য নমনীয়" },
      { en: "Used vehicles considered", bn: "ব্যবহৃত গাড়িও বিবেচনা করা হয়" },
    ],
    isSample: true,
  },
  {
    id: "northgate-leasing",
    name: { en: "Northgate Leasing", bn: "নর্থগেট লিজিং" },
    type: "conventional",
    rateRange: { min: 14, max: 16 },
    maxTenureMonths: 48,
    maxFinancePercent: 70,
    processingFeePercent: 1,
    highlights: [
      { en: "Commercial vehicles and tractors", bn: "বাণিজ্যিক গাড়ি ও ট্রাক্টর" },
      { en: "Seasonal repayment plans for farmers", bn: "কৃষকদের জন্য মৌসুমভিত্তিক কিস্তি" },
    ],
    isSample: true,
  },
  {
    id: "partner-islamic-bank-a",
    name: { en: "Partner Islamic Bank A", bn: "পার্টনার ইসলামী ব্যাংক এ" },
    type: "islamic",
    structures: ["hpsm"],
    rateRange: { min: 12, max: 14 },
    maxTenureMonths: 60,
    maxFinancePercent: 50,
    processingFeePercent: 0.5,
    highlights: [
      { en: "Hire Purchase under Shirkatul Melk (HPSM)", bn: "হায়ার পারচেজ আন্ডার শিরকাতুল মিলক (HPSM)" },
      { en: "Shariah supervisory board oversight", bn: "শরিয়াহ সুপারভাইজরি বোর্ডের তত্ত্বাবধান" },
    ],
    isSample: true,
  },
  {
    id: "partner-islamic-finance-b",
    name: { en: "Partner Islamic Finance B", bn: "পার্টনার ইসলামী ফাইন্যান্স বি" },
    type: "islamic",
    structures: ["ijarah", "murabaha"],
    rateRange: { min: 12.5, max: 14.5 },
    maxTenureMonths: 60,
    maxFinancePercent: 60,
    processingFeePercent: 0.75,
    highlights: [
      { en: "Ijarah (lease-to-own) and Murabaha options", bn: "ইজারা (লিজ থেকে মালিকানা) ও মুরাবাহা অপশন" },
      { en: "Fixed rental schedule", bn: "নির্দিষ্ট ভাড়ার কিস্তি" },
    ],
    isSample: true,
  },
];
