import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";
import { WEEKDAYS, type EvArticle, type Showroom, type VehicleWithBrand, type Weekday } from "@/types";

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

/** Serialises JSON-LD for a <script> tag, escaping "<" so content can never close the tag. */
export const toJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

const SCHEMA_DAY: Record<Weekday, string> = {
  sat: "Saturday",
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
};

/** schema.org AutoDealer for one showroom (brief §10.N). */
export function showroomJsonLd(s: Showroom, locale: Locale) {
  const url = absoluteUrl(locale, "/showrooms");
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": `${url}#${s.slug}`,
    name: s.name[locale],
    url,
    telephone: s.phone.href.replace(/^tel:/, ""),
    email: s.email,
    address: { "@type": "PostalAddress", streetAddress: s.address[locale], addressLocality: s.city[locale], addressCountry: "BD" },
    geo: { "@type": "GeoCoordinates", latitude: s.geo.lat, longitude: s.geo.lng },
    openingHoursSpecification: WEEKDAYS.flatMap((d) => {
      const h = s.hours[d];
      return h ? [{ "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${SCHEMA_DAY[d]}`, opens: h.open, closes: h.close }] : [];
    }),
    parentOrganization: { "@type": "Organization", name: siteConfig.name, url: absoluteUrl(locale, "/") },
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

/** schema.org Article + FAQPage for an EV guide. */
export function evArticleJsonLd(a: EvArticle, locale: Locale) {
  const url = absoluteUrl(locale, `/ev/${a.slug}`);
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: a.title[locale],
      description: a.summary[locale],
      inLanguage: locale === "bn" ? "bn-BD" : "en",
      dateModified: a.updatedAt,
      mainEntityOfPage: url,
      url,
      author: { "@type": "Organization", name: siteConfig.name },
      publisher: { "@type": "Organization", name: siteConfig.name },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: a.faqs.map((f) => ({
        "@type": "Question",
        name: f.q[locale],
        acceptedAnswer: { "@type": "Answer", text: f.a[locale] },
      })),
    },
  ];
}
