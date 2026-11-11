import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";

const OG_LOCALE: Record<Locale, string> = { en: "en_US", bn: "bn_BD" };

/** Absolute URL for a locale-prefixed path, e.g. ("bn", "/vehicles") → https://…/bn/vehicles */
export function absoluteUrl(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path;
  return new URL(`/${locale}${clean}`, siteConfig.url).toString();
}

/**
 * Localised page metadata with canonical URL, hreflang alternates and Open Graph.
 * `path` is the locale-less pathname, e.g. "/vehicles".
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  noIndex,
}: {
  locale: Locale;
  path: string;
  title?: string;
  description?: string;
  noIndex?: boolean;
}): Metadata {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l === "bn" ? "bn-BD" : "en", absoluteUrl(l, path)]),
  );
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: {
      canonical: absoluteUrl(locale, path),
      languages: { ...languages, "x-default": absoluteUrl(routing.defaultLocale, path) },
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: OG_LOCALE[locale],
      url: absoluteUrl(locale, path),
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
