import type { Locale } from "next-intl";
import { useLocale, useTranslations } from "next-intl";
import type { Unit } from "@/types/vehicle";
import { formatBDT, formatBDTCompact } from "./currency";
import { formatDate, formatDateTime, formatTime, type DateStyle } from "./date";
import { formatNumber, localizeDigits } from "./number";

export type UnitKey = Unit | "months" | "years";
type UnitTranslator = (key: UnitKey, values: { value: string }) => string;

/** Locale-bound formatters, so components never pass the locale around by hand. */
export function createFormat(locale: Locale, tUnits: UnitTranslator) {
  return {
    locale,
    bdt: (amount: number, decimals?: number) => formatBDT(amount, locale, { decimals }),
    bdtCompact: (amount: number) => formatBDTCompact(amount, locale),
    number: (value: number, options?: Intl.NumberFormatOptions) => formatNumber(value, locale, options),
    /** Value with a localised unit, e.g. "22 km/L" / "২২ কিমি/লিটার". */
    unit: (unit: UnitKey, value: number, maxDecimals = 1) =>
      tUnits(unit, { value: formatNumber(value, locale, { maximumFractionDigits: maxDecimals }) }),
    digits: (text: string) => localizeDigits(text, locale),
    date: (date: Parameters<typeof formatDate>[0], style?: DateStyle) => formatDate(date, locale, style),
    time: (time: Parameters<typeof formatTime>[0]) => formatTime(time, locale),
    dateTime: (date: Parameters<typeof formatDateTime>[0]) => formatDateTime(date, locale),
  };
}

export type Format = ReturnType<typeof createFormat>;

/** For client components and non-async server components. */
export function useFormat(): Format {
  return createFormat(useLocale(), useTranslations("units"));
}
