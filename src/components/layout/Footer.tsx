import { Clock, Mail, Phone } from "lucide-react";
import { cacheLife } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { footerColumns } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { formatNumber, localizeDigits } from "@/lib/format/number";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { NewsletterForm } from "./NewsletterForm";

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function Footer() {
  const [t, tNav, tA11y, locale, year] = await Promise.all([
    getTranslations("footer"),
    getTranslations("nav"),
    getTranslations("a11y"),
    getLocale(),
    currentYear(),
  ]);
  const tNewsletter = await getTranslations("newsletter");

  return (
    <footer className="on-dark bg-dark text-on-dark">
      <div className="container-page">
        {/* Newsletter band */}
        <div className="grid gap-8 border-b border-line-on-dark py-14 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <h2 className="display-md">{tNewsletter("title")}</h2>
            <p className="mt-3 max-w-md text-muted-on-dark">{tNewsletter("lead")}</p>
          </div>
          <div className="md:col-span-6">
            <NewsletterForm />
          </div>
        </div>

        {/* Sitemap + contact */}
        <div className="grid gap-12 py-14 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-4">
            <Logo tone="light" />
            <p className="max-w-sm text-sm leading-relaxed text-muted-on-dark">{t("tagline")}</p>
            <div className="flex flex-wrap gap-3">
              <WhatsAppButton context={{ kind: "general" }} size="md" />
              <LanguageSwitcher tone="light" display="long" />
            </div>
          </div>

          <nav aria-label={tA11y("footerNav")} className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-5">
            {footerColumns.map((col) => (
              <div key={col.key}>
                <h3 className="eyebrow text-accent-2">{tNav(col.key)}</h3>
                <ul className="mt-4 flex flex-col gap-2.5 text-sm">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-on-dark/85 transition-colors hover:text-on-dark">
                        {tNav(link.key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="flex flex-col gap-6 text-sm lg:col-span-3">
            <div>
              <h3 className="eyebrow text-accent-2">{t("contact")}</h3>
              <ul className="mt-4 flex flex-col gap-3">
                <li>
                  <a href={siteConfig.phone.href} className="inline-flex items-center gap-2.5 hover:text-accent-2">
                    <Phone aria-hidden className="size-4 text-muted-on-dark" />
                    <span className="tabular">{localizeDigits(siteConfig.phone.display, locale)}</span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${siteConfig.email}`} className="inline-flex items-center gap-2.5 break-all hover:text-accent-2">
                    <Mail aria-hidden className="size-4 shrink-0 text-muted-on-dark" />
                    {siteConfig.email}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="eyebrow text-accent-2">{t("hours")}</h3>
              <p className="mt-4 flex items-start gap-2.5">
                <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-on-dark" />
                <span>
                  {t("hoursValue", {
                    open: localizeDigits(siteConfig.hours.open, locale),
                    close: localizeDigits(siteConfig.hours.close, locale),
                  })}
                  <br />
                  <span className="text-muted-on-dark">{t("closedDay")}</span>
                </span>
              </p>
            </div>
            <div>
              <h3 className="eyebrow text-accent-2">{t("showrooms")}</h3>
              <Link href="/showrooms" className="mt-4 inline-block underline-offset-4 hover:underline">
                {t("allShowrooms")}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-line-on-dark py-8 text-xs text-muted-on-dark md:flex-row md:justify-between">
          <p>{t("rights", { year: formatNumber(year, locale, { useGrouping: false }) })}</p>
          <p className="max-w-2xl md:text-right">
            {t("illustrative")} {t("placeholderContact")}
          </p>
        </div>
      </div>
    </footer>
  );
}
