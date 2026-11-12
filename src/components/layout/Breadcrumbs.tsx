import { ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { absoluteUrl, toJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

/** Breadcrumb trail with BreadcrumbList JSON-LD. The home crumb is added automatically. */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const all: Crumb[] = [{ label: t("common.home"), href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: absoluteUrl(locale, c.href) } : {}),
    })),
  };

  return (
    <nav aria-label={t("a11y.breadcrumb")} className={cn("text-xs text-muted", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
              {c.href && !last ? (
                <Link href={c.href} className="underline-offset-4 hover:text-ink hover:underline">
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? "text-ink" : undefined}>
                  {c.label}
                </span>
              )}
              {!last ? <ChevronRight aria-hidden className="size-3" /> : null}
            </li>
          );
        })}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }} />
    </nav>
  );
}
