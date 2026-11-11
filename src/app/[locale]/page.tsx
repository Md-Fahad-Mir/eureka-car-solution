import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { HeroPoster } from "@/components/home/HeroPoster";
import { ButtonLink } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { formatNumber } from "@/lib/format/number";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations("meta"), getLocale()]);
  return pageMetadata({ locale, path: "/", title: t("homeTitle"), description: t("defaultDescription") });
}

const JOURNEY = [
  { key: "discover", href: "/vehicles" },
  { key: "learn", href: "/ev" },
  { key: "calculate", href: "/savings-calculator" },
  { key: "compare", href: "/compare" },
  { key: "testDrive", href: "/test-drive" },
  { key: "finance", href: "/finance" },
  { key: "purchase", href: "/inquiry" },
  { key: "service", href: "/service" },
] as const;

export default async function HomePage() {
  const [t, locale] = await Promise.all([getTranslations("home"), getLocale()]);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="bg-studio-grid absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(ellipse_70%_60%_at_60%_45%,black,transparent)]"
        />
        <div className="container-page grid items-center gap-10 pt-12 pb-16 lg:grid-cols-12 lg:pt-20 lg:pb-24">
          <div className="lg:col-span-5">
            <p className="eyebrow text-accent-ink">{t("eyebrow")}</p>
            <h1 className="display-xl mt-5">
              {t("title")} <em className="font-light text-accent-ink">{t("titleAccent")}</em>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">{t("lead")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/vehicles" size="lg">
                {t("ctaBrowse")}
              </ButtonLink>
              <ButtonLink href="/test-drive" size="lg" variant="outline">
                {t("ctaTestDrive")}
              </ButtonLink>
            </div>
          </div>
          <div className="lg:col-span-7">
            <HeroPoster
              label={t("poster.alt")}
              callouts={[
                { n: formatNumber(1, locale, { minimumIntegerDigits: 2 }), label: t("poster.callout1") },
                { n: formatNumber(2, locale, { minimumIntegerDigits: 2 }), label: t("poster.callout2") },
                { n: formatNumber(3, locale, { minimumIntegerDigits: 2 }), label: t("poster.callout3") },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="on-dark bg-graphite text-on-dark">
        <div className="container-page py-16 lg:py-20">
          <h2 className="display-md max-w-xl">{t("journeyTitle")}</h2>
          <ol className="mt-10 grid grid-cols-2 border-t border-line-on-dark sm:grid-cols-4 lg:grid-cols-8">
            {JOURNEY.map((step, i) => (
              <li key={step.key} className="border-b border-line-on-dark sm:border-r sm:last:border-r-0">
                <Link
                  href={step.href}
                  className="group flex h-full flex-col gap-6 px-1 py-6 transition-colors hover:bg-white/[0.03] sm:px-4"
                >
                  <span className="text-xs text-accent-2 tabular">
                    {formatNumber(i + 1, locale, { minimumIntegerDigits: 2 })}
                  </span>
                  <span className="flex items-center justify-between gap-2 text-[0.9375rem] font-medium">
                    {t(`journey.${step.key}`)}
                    <ArrowRight aria-hidden className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
