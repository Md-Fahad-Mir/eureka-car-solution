import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Locale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useFormat } from "@/lib/format/useFormat";
import type { EvArticleWithMeta } from "@/types";

/** Guide card for the EV hub and "keep reading" lists. */
export function ArticleCard({ article: a, index, locale, headingLevel = 3 }: { article: EvArticleWithMeta; index: number; locale: Locale; headingLevel?: 2 | 3 }) {
  const t = useTranslations("ev");
  const f = useFormat();
  const Heading = `h${headingLevel}` as const;
  return (
    <Link
      href={`/ev/${a.slug}`}
      className="group flex h-full flex-col gap-3 rounded-card border border-line bg-bg-alt p-6 transition-colors hover:border-ink/40"
    >
      <p className="flex items-center justify-between text-xs text-muted">
        <span className="tabular">{f.number(index, { minimumIntegerDigits: 2 })}</span>
        <span>{t("readTime", { minutes: f.number(a.readingMinutes) })}</span>
      </p>
      <Heading className="text-lg font-medium">{a.title[locale]}</Heading>
      <p className="text-sm text-muted">{a.summary[locale]}</p>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-accent-ink">
        {t("read")}
        <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
