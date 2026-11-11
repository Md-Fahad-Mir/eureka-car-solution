import type { Locale } from "next-intl";
import { numberLocale } from "./number";

/**
 * Bangladeshi taka formatting with South Asian (lakh/crore) grouping:
 * ৳45,00,000 (en) / ৳৪৫,০০,০০০ (bn). Amounts are rounded here, at display
 * time only.
 */

const SYMBOL = "৳";
const MINUS = "−";
const LAKH = 100_000;
const CRORE = 10_000_000;

const UNIT_WORDS: Record<Locale, { lakh: string; crore: string }> = {
  en: { lakh: "lakh", crore: "crore" },
  bn: { lakh: "লাখ", crore: "কোটি" },
};

/** Full amount, e.g. ৳45,00,000. `decimals` defaults to 0 (whole taka). */
export function formatBDT(amount: number, locale: Locale, { decimals = 0 }: { decimals?: number } = {}): string {
  const rounded = Number(Math.abs(amount).toFixed(decimals));
  const formatted = new Intl.NumberFormat(numberLocale(locale), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(rounded);
  return `${amount < 0 && rounded !== 0 ? MINUS : ""}${SYMBOL}${formatted}`;
}

/**
 * Compact amount in lakh/crore, e.g. ৳45 lakh, ৳1.2 crore, ৳৪৫ লাখ, ৳১.২ কোটি.
 * Below one lakh the full amount is shown.
 */
export function formatBDTCompact(amount: number, locale: Locale, { maxDecimals = 2 }: { maxDecimals?: number } = {}): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? MINUS : "";
  const nf = new Intl.NumberFormat(numberLocale(locale), { maximumFractionDigits: maxDecimals });
  const round = (v: number) => Math.round(v * 10 ** maxDecimals) / 10 ** maxDecimals;

  // Decide the unit on the rounded value, so ৳99,99,999 reads "1 crore", not "100 lakh".
  const inLakh = round(abs / LAKH);
  if (abs >= CRORE || inLakh >= 100) {
    return `${sign}${SYMBOL}${nf.format(round(abs / CRORE))} ${UNIT_WORDS[locale].crore}`;
  }
  if (abs >= LAKH) {
    return `${sign}${SYMBOL}${nf.format(inLakh)} ${UNIT_WORDS[locale].lakh}`;
  }
  return formatBDT(amount, locale);
}
