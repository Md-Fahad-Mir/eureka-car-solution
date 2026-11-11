import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Hero3D } from "@/components/home/Hero3D";
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
      <Hero3D />

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
