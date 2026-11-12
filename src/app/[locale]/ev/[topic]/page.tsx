import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArticleBody } from "@/components/ev/ArticleBody";
import { ArticleCard } from "@/components/ev/ArticleCard";
import { EvCtas } from "@/components/ev/EvCtas";
import { TableOfContents } from "@/components/ev/TableOfContents";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Accordion } from "@/components/ui/Accordion";
import { Skeleton } from "@/components/ui/Skeleton";
import { Link } from "@/i18n/navigation";
import { getEvArticle, getEvArticles } from "@/lib/api/ev";
import { getFormat } from "@/lib/format/getFormat";
import { evArticleJsonLd, pageMetadata, toJsonLd } from "@/lib/seo";
import { EV_TOPICS } from "@/types";

export function generateStaticParams() {
  return EV_TOPICS.map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/ev/[topic]">): Promise<Metadata> {
  const { topic } = await params;
  const [a, f] = await Promise.all([getEvArticle(topic), getFormat()]);
  if (!a) return { robots: { index: false } };
  return pageMetadata({ locale: f.locale, path: `/ev/${a.slug}`, title: a.title[f.locale], description: a.summary[f.locale] });
}

/** The shell doesn't read params (instant client navigation); the article streams in. */
export default function EvArticlePage({ params }: PageProps<"/[locale]/ev/[topic]">) {
  return (
    <Suspense
      fallback={
        <div className="container-page pt-8 pb-20">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-8 h-16 max-w-2xl" />
          <Skeleton className="mt-10 h-[40rem] rounded-card" />
        </div>
      }
    >
      <EvArticleView params={params} />
    </Suspense>
  );
}

async function EvArticleView({ params }: { params: PageProps<"/[locale]/ev/[topic]">["params"] }) {
  const { topic } = await params;
  const [a, all, t, tHub, f] = await Promise.all([
    getEvArticle(topic),
    getEvArticles(),
    getTranslations("ev.article"),
    getTranslations("ev.hub"),
    getFormat(),
  ]);
  if (!a) notFound();
  const locale = f.locale;
  const index = all.findIndex((x) => x.slug === a.slug);
  const prev = all[index - 1];
  const next = all[index + 1];
  const related = a.related.flatMap((slug) => all.filter((x) => x.slug === slug));
  const toc = [...a.sections.map((s) => ({ id: s.id, title: s.title[locale] })), { id: "faq", title: t("faqTitle") }];

  return (
    <article className="container-page pt-8 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(evArticleJsonLd(a, locale)) }} />
      <Breadcrumbs items={[{ label: tHub("breadcrumb"), href: "/ev" }, { label: a.title[locale] }]} />

      <header className="mt-6 max-w-3xl">
        <p className="eyebrow text-ev">{t("guideOf", { n: f.number(index + 1), total: f.number(all.length) })}</p>
        <h1 className="display-lg mt-3">{a.title[locale]}</h1>
        <p className="mt-4 text-lg text-muted">{a.summary[locale]}</p>
        <p className="mt-4 text-sm text-muted">
          {t("meta", { minutes: f.number(a.readingMinutes), date: f.date(a.updatedAt, "long") })}
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-[calc(var(--header-h-compact)+2rem)]">
            <TableOfContents items={toc} />
          </div>
        </div>

        <div className="min-w-0 lg:col-span-9 xl:col-span-8">
          <ArticleBody sections={a.sections} locale={locale} />

          <section id="faq" aria-labelledby="faq-title" className="mt-16 scroll-mt-28">
            <h2 id="faq-title" className="text-2xl font-medium tracking-tight">
              {t("faqTitle")}
            </h2>
            <Accordion
              className="mt-4"
              items={a.faqs.map((q, i) => ({
                id: `faq-${i}`,
                title: q.q[locale],
                content: <p className="leading-relaxed text-ink/85">{q.a[locale]}</p>,
              }))}
            />
          </section>

          <p className="mt-10 rounded-2xl border border-line bg-bg-alt px-5 py-4 text-sm text-muted">{t("disclaimer")}</p>

          <div className="mt-12">
            <EvCtas extra={a.cta} />
          </div>

          <nav aria-label={t("guideNav")} className="mt-12 grid gap-4 sm:grid-cols-2">
            {prev ? (
              <Link href={`/ev/${prev.slug}`} className="group flex flex-col gap-1 rounded-card border border-line p-5 hover:border-ink/40">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                  <ArrowLeft aria-hidden className="size-3.5" />
                  {t("previous")}
                </span>
                <span className="font-medium">{prev.title[locale]}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/ev/${next.slug}`} className="group flex flex-col items-end gap-1 rounded-card border border-line p-5 text-right hover:border-ink/40">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                  {t("next")}
                  <ArrowRight aria-hidden className="size-3.5" />
                </span>
                <span className="font-medium">{next.title[locale]}</span>
              </Link>
            ) : null}
          </nav>

          <section aria-labelledby="related" className="mt-14">
            <h2 id="related" className="text-xl font-medium">
              {t("relatedTitle")}
            </h2>
            <ul className="mt-5 grid gap-4 md:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <ArticleCard article={r} index={all.indexOf(r) + 1} locale={locale} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </article>
  );
}
