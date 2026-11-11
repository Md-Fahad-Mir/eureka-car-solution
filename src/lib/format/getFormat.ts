import { getLocale, getTranslations } from "next-intl/server";
import { createFormat, type Format } from "./useFormat";

/** Locale-bound formatters for async server components and metadata. */
export async function getFormat(): Promise<Format> {
  const [locale, tUnits] = await Promise.all([getLocale(), getTranslations("units")]);
  return createFormat(locale, tUnits);
}
