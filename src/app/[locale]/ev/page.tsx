import type { Metadata } from "next";
import { ArrowRight, Calculator } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ArticleCard } from "@/components/ev/ArticleCard";
import { EvCtas } from "@/components/ev/EvCtas";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { getEvArticles } from "@/lib/api/ev";
import { getFormat } from "@/lib/format/getFormat";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [t, f] = await Promise.all([getTranslations("ev.hub"), getFormat()]);
  return pageMetadata({ locale: f.locale, path: "/ev", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function EvHubPage() {
  const [t, f, articles] = await Promise.all([getTranslations("ev.hub"), getFormat(), getEvArticles()]);
  const totalMinutes = articles.reduce((n, a) => n + a.readingMinutes, 0);

  return (
    <div className="container-page pt-8 pb-20">
      <Breadcrumbs items={[{ label: t("breadcrumb") }]} />
      <header className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="eyebrow text-ev">{t("eyebrow")}</p>
          <h1 className="display-lg mt-3">{t("title")}</h1>
          <p className="mt-4 max-w-2xl text-muted">{t("lead")}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col">
          <ButtonLink href={`/ev/${articles[0].slug}`} size="lg" icon={<ArrowRight aria-hidden className="size-4" />}>
            {t("start")}
          </ButtonLink>
          <ButtonLink href="/savings-calculator" size="lg" variant="outline" icon={<Calculator aria-hidden className="size-4" />}>
            {t("savings")}
          </ButtonLink>
        </div>
      </header>

      <section aria-labelledby="guides" className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="guides" className="display-md">
            {t("guidesTitle")}
          </h2>
          <p className="text-sm text-muted">{t("guidesMeta", { count: f.number(articles.length), minutes: f.number(totalMinutes) })}</p>
        </div>
        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {articles.map((a, i) => (
            <li key={a.slug}>
              <ArticleCard article={a} index={i + 1} locale={f.locale} />
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-10 max-w-3xl text-sm text-muted">{t("accuracy")}</p>
      <div className="mt-12">
        <EvCtas />
      </div>
    </div>
  );
}
