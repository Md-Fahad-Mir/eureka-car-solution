import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getVehicleSlugs } from "@/lib/api/vehicles";
import { absoluteUrl } from "@/lib/seo";
import { EV_TOPICS } from "@/types";

/** Indexable pages only: confirmations, status lookups, sign-in and the account are `noindex`. */
const STATIC_PATHS = [
  "/",
  "/vehicles",
  "/compare",
  "/finance",
  "/finance/apply",
  "/savings-calculator",
  "/test-drive",
  "/inquiry",
  "/service",
  "/service/book",
  "/ev",
  "/showrooms",
  "/privacy",
  "/terms",
];

/** One entry per path and locale, each listing every language version (hreflang). */
function entries(path: string, extra: Partial<MetadataRoute.Sitemap[number]> = {}): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(routing.locales.map((l) => [l === "bn" ? "bn-BD" : "en", absoluteUrl(l, path)]));
  return routing.locales.map((locale) => ({ url: absoluteUrl(locale, path), alternates: { languages }, ...extra }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await getVehicleSlugs();
  return [
    ...STATIC_PATHS.flatMap((p) => entries(p, { changeFrequency: p === "/" || p === "/vehicles" ? "daily" : "monthly", priority: p === "/" ? 1 : 0.7 })),
    ...EV_TOPICS.flatMap((t) => entries(`/ev/${t}`, { changeFrequency: "monthly", priority: 0.6 })),
    ...vehicles.flatMap((v) => entries(`/vehicles/${v.slug}`, { lastModified: v.updatedAt, changeFrequency: "weekly", priority: 0.8 })),
  ];
}
