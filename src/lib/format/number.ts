import type { Locale } from "next-intl";

/** Intl locale used for numbers: Indian grouping for English, Bangla digits for bn. */
export function numberLocale(locale: Locale): string {
  return locale === "bn" ? "bn-BD" : "en-IN";
}

export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(numberLocale(locale), options).format(value);
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Replace ASCII digits in an already-formatted string (times, references, phone numbers). */
export function localizeDigits(text: string, locale: Locale): string {
  if (locale !== "bn") return text;
  return text.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}
