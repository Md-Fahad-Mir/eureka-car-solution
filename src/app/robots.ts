import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Personal or per-visitor pages (also marked noindex in their metadata).
      disallow: ["/*/account", "/*/sign-in", "/*/test-drive/confirmation", "/*/inquiry/confirmation", "/*/finance/status", "/*/service/track"],
    },
    sitemap: new URL("/sitemap.xml", siteConfig.url).toString(),
    host: siteConfig.url,
  };
}
