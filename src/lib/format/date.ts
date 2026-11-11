import type { Locale } from "next-intl";
import type { DateKey, TimeKey } from "@/types/common";
import type { Weekday } from "@/types/showroom";

/** All customer-facing dates and times are shown in Bangladesh time. */
export const TIME_ZONE = "Asia/Dhaka";
/** Bangladesh has no daylight saving: always UTC+06:00. */
const DHAKA_OFFSET = "+06:00";

const dateLocale = (locale: Locale) => (locale === "bn" ? "bn-BD" : "en-GB");

type DateInput = Date | string | number;
const toDate = (d: DateInput) => (d instanceof Date ? d : new Date(d));

/** Midnight in Dhaka for a "YYYY-MM-DD" key. */
export function dateKeyToDate(key: DateKey): Date {
  return new Date(`${key}T00:00:00${DHAKA_OFFSET}`);
}

/** "YYYY-MM-DD" for the Dhaka calendar day containing `date`. */
export function toDhakaDateKey(date: DateInput): DateKey {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(toDate(date));
}

/** Adds whole days to a date key (calendar arithmetic, timezone-safe). */
export function addDaysToKey(key: DateKey, days: number): DateKey {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Adds calendar months to a date key, clamping the day (31 Jan + 1 month → 28/29 Feb). */
export function addMonthsToKey(key: DateKey, months: number): DateKey {
  const [y, m, d] = key.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1, 12));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0, 12)).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));
  return target.toISOString().slice(0, 10);
}

const WEEKDAY_BY_SHORT: Record<string, Weekday> = {
  Sat: "sat",
  Sun: "sun",
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
};

/** Weekday in Dhaka for a date or date key. */
export function dhakaWeekday(date: DateInput | DateKey): Weekday {
  const d = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? dateKeyToDate(date) : toDate(date);
  const short = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, weekday: "short" }).format(d);
  return WEEKDAY_BY_SHORT[short];
}

/** Minutes since midnight in Dhaka (for open-now checks and slot cut-offs). */
export function dhakaMinutes(date: DateInput): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(toDate(date));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return get("hour") * 60 + get("minute");
}

/** "HH:mm" → minutes since midnight. */
export const timeKeyToMinutes = (time: TimeKey) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export type DateStyle = "short" | "medium" | "long" | "weekday";

const DATE_OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  short: { day: "numeric", month: "short" },
  medium: { day: "numeric", month: "short", year: "numeric" },
  long: { day: "numeric", month: "long", year: "numeric" },
  weekday: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
};

/** Localised date in Dhaka time, e.g. "11 Nov 2026" / "১১ নভে, ২০২৬". Accepts dates, ISO strings or date keys. */
export function formatDate(date: DateInput | DateKey, locale: Locale, style: DateStyle = "medium"): string {
  const d = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? dateKeyToDate(date) : toDate(date);
  return new Intl.DateTimeFormat(dateLocale(locale), { ...DATE_OPTIONS[style], timeZone: TIME_ZONE }).format(d);
}

/** Localised time in Dhaka, e.g. "10:30 am" / "১০:৩০ AM". Accepts a Date/ISO or an "HH:mm" key. */
export function formatTime(time: DateInput | TimeKey, locale: Locale): string {
  const d =
    typeof time === "string" && /^\d{2}:\d{2}$/.test(time)
      ? new Date(`2000-01-01T${time}:00${DHAKA_OFFSET}`)
      : toDate(time);
  return new Intl.DateTimeFormat(dateLocale(locale), {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TIME_ZONE,
  }).format(d);
}

export function formatDateTime(date: DateInput, locale: Locale): string {
  return `${formatDate(date, locale, "medium")}, ${formatTime(date, locale)}`;
}
