import { CircleAlert, Lightbulb, MapPinned } from "lucide-react";
import type { Locale } from "next-intl";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ArticleBlock, ArticleSection } from "@/types";
import { ChargingExplainer } from "./ChargingExplainer";
import { CostPerKm } from "./CostPerKm";
import { Diagram } from "./Diagrams";
import { ScrollArea } from "@/components/ui/ScrollArea";

const CALLOUT = {
  tip: { Icon: Lightbulb, className: "border-ev/25 bg-ev-soft text-ink" },
  caution: { Icon: CircleAlert, className: "border-warning/30 bg-warning/10 text-warning-ink" },
  local: { Icon: MapPinned, className: "border-info/25 bg-info/[0.06] text-info" },
} as const;

/** Renders an article's sections and content blocks. */
export function ArticleBody({ sections, locale }: { sections: ArticleSection[]; locale: Locale }) {
  return (
    <div className="flex flex-col gap-14">
      {sections.map((s) => (
        <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-28">
          <h2 id={`${s.id}-title`} className="text-2xl font-medium tracking-tight">
            {s.title[locale]}
          </h2>
          <div className="mt-5 flex flex-col gap-5">
            {s.blocks.map((b, i) => (
              <Block key={i} block={b} locale={locale} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Block({ block: b, locale }: { block: ArticleBlock; locale: Locale }) {
  const t = useTranslations("ev.callout");
  switch (b.type) {
    case "p":
      return <p className="text-[1.0625rem] leading-relaxed text-ink/90">{b.text[locale]}</p>;
    case "list": {
      const List = b.ordered ? "ol" : "ul";
      return (
        <List className={cn("flex flex-col gap-2.5 pl-5 text-[1.0625rem] leading-relaxed text-ink/90", b.ordered ? "list-decimal" : "list-disc marker:text-accent")}>
          {b.items.map((item) => (
            <li key={item.en} className="pl-1">
              {item[locale]}
            </li>
          ))}
        </List>
      );
    }
    case "callout": {
      const { Icon, className } = CALLOUT[b.tone];
      return (
        <aside className={cn("flex gap-3 rounded-2xl border px-5 py-4", className)}>
          <Icon aria-hidden className="mt-0.5 size-5 shrink-0" />
          <p className="text-[0.9375rem] leading-relaxed">
            <span className="font-semibold">{t(b.tone)}: </span>
            {b.text[locale]}
          </p>
        </aside>
      );
    }
    case "diagram":
      return (
        <figure className="flex min-w-0 flex-col gap-3 rounded-card border border-line bg-bg-alt p-5">
          <Diagram diagram={b.diagram} />
          <figcaption className="border-t border-line pt-3 text-sm text-muted">{b.caption[locale]}</figcaption>
        </figure>
      );
    case "table":
      return (
        <ScrollArea label={b.caption[locale]} className="rounded-card border border-line">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <caption className="px-5 pt-4 text-left text-sm font-medium">{b.caption[locale]}</caption>
            <thead className="text-xs text-muted">
              <tr>
                <td className="px-4 py-3" />
                {b.columns.map((c) => (
                  <th key={c.en} scope="col" className={cn("px-4 py-3 font-medium", c.en === "EV" && "text-ev")}>
                    {c[locale]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {b.rows.map((r) => (
                <tr key={r.label.en} className="align-top">
                  <th scope="row" className="bg-bg-alt px-4 py-3 font-medium">{r.label[locale]}</th>
                  {r.cells.map((c, i) => (
                    <td key={i} className="px-4 py-3">{c[locale]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      );
    case "chargingExplainer":
      return <ChargingExplainer />;
    case "costPerKm":
      return <CostPerKm />;
  }
}
