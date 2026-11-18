import { Clock, Mail, Phone } from "lucide-react";
import { cacheLife } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { footerColumns } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { getShowrooms } from "@/lib/api/showrooms";
import { formatNumber, localizeDigits } from "@/lib/format/number";
import { stagger } from "@/lib/motion";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { NewsletterForm } from "./NewsletterForm";

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function Footer() {
  const [t, tNav, tA11y, locale, year, showrooms] = await Promise.all([
    getTranslations("footer"),
    getTranslations("nav"),
    getTranslations("a11y"),
    getLocale(),
    currentYear(),
    getShowrooms(),
  ]);
  const [tNewsletter, tHero] = await Promise.all([getTranslations("newsletter"), getTranslations("hero")]);
  const linkClass = "link-sweep text-on-dark/85 transition-colors duration-300 hover:text-on-dark";

  return (
    <footer className="on-dark relative overflow-hidden bg-dark text-on-dark">
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-(image:--gold) opacity-60" />
      <div className="container-page">
        {/* Newsletter band */}
        <div className="grid gap-8 border-b border-line-on-dark py-14 md:grid-cols-12 md:items-end">
          <div data-reveal className="md:col-span-6">
            <h2 className="display-md">{tNewsletter("title")}</h2>
            <p className="mt-3 max-w-md text-muted-on-dark">{tNewsletter("lead")}</p>
          </div>
          <div data-reveal style={stagger(1)} className="md:col-span-6">
            <NewsletterForm />
          </div>
        </div>

        {/* Sitemap + contact. From 1280 px: brand | links | contact. From 1024 to 1279 px the four
            link columns would be too narrow for their headings, so contact moves to a row below. */}
        <div className="grid gap-12 py-14 lg:grid-cols-12">
          <div data-reveal className="flex flex-col gap-6 lg:col-span-4">
            <Logo tone="light" className="h-14 self-start" />
            <p className="max-w-sm text-sm leading-relaxed text-muted-on-dark">{t("tagline")}</p>
            <div className="flex flex-wrap gap-3">
              <WhatsAppButton context={{ kind: "general" }} size="md" />
              <LanguageSwitcher tone="light" display="long" />
            </div>
          </div>

          <nav aria-label={tA11y("footerNav")} className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8 xl:col-span-5">
            {footerColumns.map((col, i) => (
              <div key={col.key} data-reveal style={stagger(i + 1)}>
                <h3 className="eyebrow text-accent-2">{tNav(col.key)}</h3>
                <ul className="mt-4 flex flex-col gap-2.5 text-sm">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={linkClass}>
                        {tNav(link.key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div data-reveal style={stagger(5)} className="flex flex-col gap-6 text-sm md:grid md:grid-cols-2 md:gap-8 lg:col-span-12 lg:grid-cols-3 xl:col-span-3 xl:flex xl:gap-6">
            <div>
              <h3 className="eyebrow text-accent-2">{t("contact")}</h3>
              <ul className="mt-4 flex flex-col gap-3">
                <li>
                  <a href={siteConfig.phone.href} className="inline-flex items-center gap-2.5 transition-colors duration-300 hover:text-accent-2">
                    <Phone aria-hidden className="size-4 text-muted-on-dark" />
                    <span className="tabular">{localizeDigits(siteConfig.phone.display, locale)}</span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${siteConfig.email}`} className="inline-flex items-center gap-2.5 break-all transition-colors duration-300 hover:text-accent-2">
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
            {/* Tablets: contact and hours stack on the left, showrooms on the right. */}
            <div className="md:col-start-2 md:row-span-2 md:row-start-1 lg:col-start-3 lg:row-span-1">
              <h3 className="eyebrow text-accent-2">{t("showrooms")}</h3>
              <ul className="mt-4 flex flex-col gap-1.5">
                {showrooms.map((s) => (
                  <li key={s.id} className="flex justify-between gap-3">
                    <span>{s.name[locale]}</span>
                    <span className="shrink-0 text-muted-on-dark">{s.city[locale]}</span>
                  </li>
                ))}
              </ul>
              <Link href="/showrooms" className="link-sweep mt-3 inline-block text-accent-2">
                {t("allShowrooms")}
              </Link>
            </div>
          </div>
        </div>

        {/* The wordmark rises out of the bottom edge as the page ends. Drawn from a data
            attribute (pseudo-element), so this purely decorative, near-invisible text isn't
            treated as content by assistive tech or contrast checks. */}
        <div
          aria-hidden
          data-reveal="mask"
          data-word={tHero("stageWord")}
          className="pointer-events-none pt-4 text-center text-[clamp(4rem,17vw,16rem)] leading-[0.74] font-light tracking-[0.12em] whitespace-nowrap text-on-dark/[0.06] select-none before:content-[attr(data-word)]"
        />

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
