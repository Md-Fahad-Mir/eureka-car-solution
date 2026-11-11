import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatNumber } from "@/lib/format/number";
import { cn } from "@/lib/utils";

/** Page numbers to show: first, last, current ±1, with gaps as null. */
export function pageWindow(page: number, total: number): (number | null)[] {
  const pages = new Set([1, total, page - 1, page, page + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(null);
    out.push(p);
  });
  return out;
}

/** Link-based pagination: every page is a real, shareable URL. */
export function Pagination({
  page,
  totalPages,
  hrefFor,
  className,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  className?: string;
}) {
  const t = useTranslations("a11y");
  const locale = useLocale();
  if (totalPages <= 1) return null;

  const item = "grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm tabular transition-colors";

  return (
    <nav aria-label={t("pagination")} className={cn("flex items-center justify-center gap-1", className)}>
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={cn(item, "hover:bg-ink/[0.06]")} aria-label={t("previous")}>
          <ChevronLeft aria-hidden className="size-4" />
        </Link>
      ) : null}
      {pageWindow(page, totalPages).map((p, i) =>
        p === null ? (
          <span key={`gap-${i}`} aria-hidden className="px-1 text-muted">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={p === page ? t("currentPage", { page: p }) : t("page", { page: p })}
            className={cn(item, p === page ? "bg-ink text-bg-alt" : "hover:bg-ink/[0.06]")}
          >
            {formatNumber(p, locale)}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={cn(item, "hover:bg-ink/[0.06]")} aria-label={t("next")}>
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      ) : null}
    </nav>
  );
}
