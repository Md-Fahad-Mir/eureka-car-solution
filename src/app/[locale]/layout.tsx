import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ClientShell } from "@/components/layout/ClientShell";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { hindSiliguri, montserrat } from "../fonts";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: t("defaultTitle"), template: t("titleTemplate") },
    description: t("defaultDescription"),
    applicationName: t("siteName"),
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#e4e7df",
  colorScheme: "light",
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations("a11y");

  // Only the active locale's fonts are rendered, so only they are preloaded.
  // Bangla pages also load Montserrat for Latin words (EMI, SUV, brand names).
  const fontClasses = locale === "bn" ? cn(montserrat.variable, hindSiliguri.variable) : montserrat.variable;

  return (
    <html lang={locale === "bn" ? "bn-BD" : "en"} className={fontClasses}>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-bg-alt"
          >
            {t("skipToContent")}
          </a>
          <Header />
          <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <Footer />
          <ClientShell />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
