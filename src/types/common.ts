/** Every human-readable content field in data is bilingual. */
export type LocalizedText = { en: string; bn: string };

export type Money = {
  /** Whole Bangladeshi taka. Never pre-rounded for display. */
  amount: number;
  currency: "BDT";
  negotiable?: boolean;
};

export type MediaView = "front34" | "side" | "rear34" | "interior" | "detail";

export type Media = {
  /** Path under /public (e.g. /media/vehicles/<slug>/front.jpg). Missing → generated placeholder. */
  src?: string;
  alt: LocalizedText;
  aspect: "16/10" | "4/3" | "1/1";
  view?: MediaView;
};

export type GeoPoint = { lat: number; lng: number };

/** ISO 8601 timestamp, e.g. "2026-11-11T10:30:00+06:00". */
export type IsoDateTime = string;
/** Calendar date in Asia/Dhaka, "YYYY-MM-DD". */
export type DateKey = string;
/** Local time in Asia/Dhaka, "HH:mm". */
export type TimeKey = string;
