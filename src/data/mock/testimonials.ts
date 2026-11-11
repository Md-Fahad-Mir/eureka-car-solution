import type { Testimonial } from "@/types";

/**
 * SAMPLE testimonials with fictional people. Every item is `isSample: true`
 * and must be labelled "Sample" in the UI. Replace only with real customers'
 * words, with their written permission.
 */
export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: { en: "Tanvir A.", bn: "তানভীর এ." },
    city: { en: "Dhaka", bn: "ঢাকা" },
    vehicleLabel: "Toyota Corolla Cross Hybrid",
    quote: {
      en: "They showed me the auction sheet before I even asked, and walked me through every mark on it.",
      bn: "আমি চাওয়ার আগেই অকশন শিট দেখিয়েছে, আর তাতে থাকা প্রতিটি দাগের ব্যাখ্যা দিয়েছে।",
    },
    rating: 5,
    isSample: true,
  },
  {
    id: "t2",
    name: { en: "Nusrat J.", bn: "নুসরাত জে." },
    city: { en: "Chattogram", bn: "চট্টগ্রাম" },
    vehicleLabel: "BYD Atto 3",
    quote: {
      en: "The savings calculator convinced my father that an EV made sense for our daily commute.",
      bn: "সাশ্রয় ক্যালকুলেটর দেখে বাবা বুঝলেন, আমাদের দৈনন্দিন যাতায়াতে EV-টাই যুক্তিসংগত।",
    },
    rating: 5,
    isSample: true,
  },
  {
    id: "t3",
    name: { en: "Rafiq H.", bn: "রফিক এইচ." },
    city: { en: "Bogura", bn: "বগুড়া" },
    vehicleLabel: "Mahindra 575 DI",
    quote: {
      en: "The seasonal repayment plan matched our harvest cycle. Service came to the farm.",
      bn: "মৌসুমভিত্তিক কিস্তি আমাদের ফসল তোলার সময়ের সঙ্গে মিলে গেছে। সার্ভিসের লোক খামারেই এসেছে।",
    },
    rating: 4,
    isSample: true,
  },
  {
    id: "t4",
    name: { en: "Shaila M.", bn: "শায়লা এম." },
    city: { en: "Sylhet", bn: "সিলেট" },
    vehicleLabel: "Toyota Axio Hybrid",
    quote: {
      en: "I booked the test drive on WhatsApp and the car was ready, cleaned and fuelled, when I arrived.",
      bn: "WhatsApp-এ টেস্ট ড্রাইভ বুক করেছিলাম; পৌঁছে দেখি গাড়ি পরিষ্কার করে, তেল ভরে তৈরি রাখা।",
    },
    rating: 5,
    isSample: true,
  },
  {
    id: "t5",
    name: { en: "Imran K.", bn: "ইমরান কে." },
    city: { en: "Dhaka", bn: "ঢাকা" },
    vehicleLabel: "Isuzu NPR 71",
    quote: {
      en: "We added six trucks to our fleet with one point of contact for finance, registration and servicing.",
      bn: "ফাইন্যান্স, রেজিস্ট্রেশন আর সার্ভিসিং, সব এক জায়গায় সামলে আমাদের ফ্লিটে ছয়টি ট্রাক যোগ করেছি।",
    },
    rating: 5,
    isSample: true,
  },
  {
    id: "t6",
    name: { en: "Farhana S.", bn: "ফারহানা এস." },
    city: { en: "Dhaka", bn: "ঢাকা" },
    vehicleLabel: "Hyundai IONIQ 5",
    quote: {
      en: "The EV Centre answered questions I didn't know to ask, especially about charging at home.",
      bn: "EV সেন্টার এমন সব প্রশ্নের উত্তর দিয়েছে যা জিজ্ঞেস করার কথা মাথায়ই আসেনি, বিশেষ করে বাসায় চার্জ দেওয়া নিয়ে।",
    },
    rating: 5,
    isSample: true,
  },
];
