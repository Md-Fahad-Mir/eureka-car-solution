"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * "On this page" navigation. Desktop: sticky list that highlights the section
 * being read. Mobile: a collapsible list above the article.
 */
export function TableOfContents({ items }: { items: { id: string; title: string }[] }) {
  const t = useTranslations("ev.article");
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  const list = (
    <ol className="flex flex-col gap-1 text-sm">
      {items.map((i) => (
        <li key={i.id}>
          <a
            href={`#${i.id}`}
            aria-current={active === i.id ? "location" : undefined}
            className={cn(
              "block border-l-2 py-1.5 pl-3 transition-colors",
              active === i.id ? "border-accent font-medium text-ink" : "border-line text-muted hover:border-ink/40 hover:text-ink",
            )}
          >
            {i.title}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <details className="group rounded-2xl border border-line bg-bg-alt lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
          {t("onThisPage")}
          <ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <nav aria-label={t("onThisPage")} className="px-4 pb-4">
          {list}
        </nav>
      </details>
      <nav aria-label={t("onThisPage")} className="hidden lg:block">
        <p className="eyebrow mb-3 text-muted">{t("onThisPage")}</p>
        {list}
      </nav>
    </>
  );
}
