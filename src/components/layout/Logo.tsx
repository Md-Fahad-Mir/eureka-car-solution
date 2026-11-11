import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Monogram + "EUREKA / CAR SOLUTION" wordmark. The mark's three bars echo the
 * light-bar sequence of the 3D hero. The wordmark is a brand mark, so it
 * stays in Latin script (lang="en") in both locales.
 */
export function Logo({ tone = "ink", className }: { tone?: "ink" | "light"; className?: string }) {
  const t = useTranslations("meta");
  return (
    <Link
      href="/"
      aria-label={t("siteName")}
      className={cn("group flex items-center gap-3", tone === "light" ? "text-on-dark" : "text-ink", className)}
    >
      <svg viewBox="0 0 40 40" aria-hidden className="size-9 shrink-0">
        <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="11" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
        <rect x="12" y="11" width="17" height="2.6" rx="1.3" fill="currentColor" />
        <rect x="12" y="18.7" width="12.5" height="2.6" rx="1.3" fill="var(--accent)" className="transition-[width] duration-300 group-hover:[width:17px]" />
        <rect x="12" y="26.4" width="17" height="2.6" rx="1.3" fill="currentColor" />
        <rect x="12" y="11" width="2.6" height="18" rx="1.3" fill="currentColor" />
      </svg>
      <span lang="en" className="flex flex-col leading-none">
        <span className="text-[0.95rem] font-semibold tracking-[0.32em]">EUREKA</span>
        <span
          className={cn(
            "mt-1 text-[0.55rem] font-medium tracking-[0.36em]",
            tone === "light" ? "text-muted-on-dark" : "text-muted",
          )}
        >
          CAR SOLUTION
        </span>
      </span>
    </Link>
  );
}
