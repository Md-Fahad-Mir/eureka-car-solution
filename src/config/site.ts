/**
 * Brand and contact configuration.
 *
 * REPLACE BEFORE LAUNCH: every number, address and email below is a
 * deliberately non-working placeholder (see README "Replace before launch").
 */
export const siteConfig = {
  name: "Eureka Car Solution",
  shortName: "Eureka",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  /**
   * WhatsApp Business number in E.164 digits only (no "+", spaces or dashes).
   * The placeholder uses an invalid operator prefix (`10`) so it can never
   * reach a real person. Replace it before launch, or set
   * NEXT_PUBLIC_WHATSAPP_NUMBER.
   */
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "8801000000000",

  /** Placeholder hotline (invalid prefix on purpose). */
  phone: { display: "+880 1000-000000", href: "tel:+8801000000000" },
  /** `.example` is a reserved domain, so this can't deliver mail by accident. */
  email: "hello@eureka-cars.example",

  /** Head-office hours. Showroom-specific hours live in showroom data. */
  hours: { open: "10:00", close: "19:00", closedDay: "friday" },

  social: [] as { label: string; href: string }[],
} as const;

export type SiteConfig = typeof siteConfig;
