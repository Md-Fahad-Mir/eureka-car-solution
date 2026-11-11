import type { Brand } from "@/types";

/** Brand names are shown as text tiles only: no trademarked logos in mock data. */
export const brands: Brand[] = [
  { id: "toyota", slug: "toyota", name: { en: "Toyota", bn: "টয়োটা" }, country: { en: "Japan", bn: "জাপান" }, isPopular: true },
  { id: "honda", slug: "honda", name: { en: "Honda", bn: "হোন্ডা" }, country: { en: "Japan", bn: "জাপান" }, isPopular: true },
  { id: "nissan", slug: "nissan", name: { en: "Nissan", bn: "নিসান" }, country: { en: "Japan", bn: "জাপান" }, isPopular: true },
  { id: "mitsubishi", slug: "mitsubishi", name: { en: "Mitsubishi", bn: "মিতসুবিশি" }, country: { en: "Japan", bn: "জাপান" }, isPopular: true },
  { id: "hyundai", slug: "hyundai", name: { en: "Hyundai", bn: "হুন্দাই" }, country: { en: "South Korea", bn: "দক্ষিণ কোরিয়া" }, isPopular: true },
  { id: "byd", slug: "byd", name: { en: "BYD", bn: "BYD" }, country: { en: "China", bn: "চীন" }, isPopular: true },
  { id: "mg", slug: "mg", name: { en: "MG", bn: "MG" }, country: { en: "United Kingdom / China", bn: "যুক্তরাজ্য / চীন" }, isPopular: true },
  { id: "suzuki", slug: "suzuki", name: { en: "Suzuki", bn: "সুজুকি" }, country: { en: "Japan", bn: "জাপান" }, isPopular: true },
  { id: "tata", slug: "tata", name: { en: "Tata", bn: "টাটা" }, country: { en: "India", bn: "ভারত" }, isPopular: false },
  { id: "isuzu", slug: "isuzu", name: { en: "Isuzu", bn: "ইসুজু" }, country: { en: "Japan", bn: "জাপান" }, isPopular: false },
  { id: "mahindra", slug: "mahindra", name: { en: "Mahindra", bn: "মাহিন্দ্রা" }, country: { en: "India", bn: "ভারত" }, isPopular: false },
  { id: "kubota", slug: "kubota", name: { en: "Kubota", bn: "কুবোটা" }, country: { en: "Japan", bn: "জাপান" }, isPopular: false },
];
