"use client";

import { Suspense } from "react";
import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Props = {
  display?: "short" | "long";
  tone?: "ink" | "light";
  className?: string;
};

/**
 * Switches between English and Bangla, keeping the current page and query
 * string. The <html lang> change re-applies the right font automatically.
 */
export function LanguageSwitcher(props: Props) {
  // While the static shell of a route with unknown params is prerendered, the
  // fallback links to the other locale's home; the real link streams in.
  return (
    <Suspense fallback={<SwitcherLink {...props} pathname="/" />}>
      <PathAwareSwitcher {...props} />
    </Suspense>
  );
}

function PathAwareSwitcher(props: Props) {
  return <SwitcherLink {...props} pathname={usePathname()} />;
}

function SwitcherLink({ display = "short", tone = "ink", className, pathname }: Props & { pathname: string }) {
  const t = useTranslations("language");
  const locale = useLocale();
  const router = useRouter();
  const target = locale === "en" ? "bn" : "en";

  return (
    <Link
      href={pathname}
      locale={target}
      lang={target}
      hrefLang={target === "bn" ? "bn-BD" : "en"}
      aria-label={t("switchToLong")}
      onClick={(e) => {
        // Keep the query string (filters, references) when switching language.
        const search = window.location.search;
        if (!search) return;
        e.preventDefault();
        const query = Object.fromEntries(new URLSearchParams(search));
        router.replace({ pathname, query }, { locale: target, scroll: false });
      }}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors",
        tone === "ink" ? "hover:bg-ink/[0.06]" : "text-on-dark hover:bg-white/10",
        className,
      )}
    >
      <Languages aria-hidden className="size-4" />
      <span>{display === "long" ? t(target) : t("switchTo")}</span>
    </Link>
  );
}
