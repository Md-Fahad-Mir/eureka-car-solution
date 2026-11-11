import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";
import type { VehicleWithBrand } from "@/types";

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

const SCHEMA_FUEL: Record<VehicleWithBrand["fuelType"], string> = {
  ev: "Electric",
  petrol: "Gasoline",
  diesel: "Diesel",
  hybrid: "Hybrid",
  phev: "Plug-in hybrid",
};
const SCHEMA_AVAILABILITY: Record<VehicleWithBrand["availability"], string> = {
  in_stock: "https://schema.org/InStock",
  incoming: "https://schema.org/PreOrder",
  reserved: "https://schema.org/LimitedAvailability",
  sold: "https://schema.org/SoldOut",
};

/** schema.org Car + Offer for a vehicle detail page. */
export function vehicleJsonLd(v: VehicleWithBrand, locale: Locale) {
  const url = absoluteUrl(locale, `/vehicles/${v.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${v.brand.name.en} ${v.model} ${v.variant}`,
    description: v.summary[locale],
    url,
    sku: v.reference,
    brand: { "@type": "Brand", name: v.brand.name.en },
    model: v.model,
    vehicleConfiguration: v.variant,
    vehicleModelDate: String(v.year),
    itemCondition: v.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    mileageFromOdometer: { "@type": "QuantitativeValue", value: v.mileageKm, unitCode: "KMT" },
    fuelType: SCHEMA_FUEL[v.fuelType],
    vehicleTransmission: v.transmission,
    driveWheelConfiguration: v.drivetrain,
    vehicleSeatingCapacity: v.seats,
    color: v.colors[0]?.name.en,
    offers: {
      "@type": "Offer",
      price: v.price.amount,
      priceCurrency: "BDT",
      availability: SCHEMA_AVAILABILITY[v.availability],
      url,
      seller: { "@type": "AutoDealer", name: siteConfig.name },
    },
  };
}
