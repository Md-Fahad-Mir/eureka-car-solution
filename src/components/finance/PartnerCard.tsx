import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { useFormat } from "@/lib/format/useFormat";
import type { FinancePartner } from "@/types";

/** Fictional sample partner with illustrative terms. Always labelled "Sample". */
export function PartnerCard({ partner: p }: { partner: FinancePartner }) {
  const t = useTranslations("finance.partners");
  const tTax = useTranslations("taxonomy.financeType");
  const locale = useLocale();
  const f = useFormat();
  const islamic = p.type === "islamic";

  return (
    <article className="flex h-full flex-col gap-4 rounded-card border border-line bg-bg-alt p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={islamic ? "success" : "info"}>{tTax(p.type)}</Badge>
        <Badge tone="outline">{t("sample")}</Badge>
      </div>
      <h3 className="text-lg font-medium">{p.name[locale]}</h3>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted">{islamic ? t("profitRate") : t("interestRate")}</dt>
          <dd className="mt-0.5 font-medium tabular">
            {t("rateRange", {
              min: f.number(p.rateRange.min, { maximumFractionDigits: 2 }),
              max: f.number(p.rateRange.max, { maximumFractionDigits: 2 }),
            })}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">{t("maxTenure")}</dt>
          <dd className="mt-0.5 font-medium tabular">{f.unit("months", p.maxTenureMonths, 0)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">{t("maxFinance")}</dt>
          <dd className="mt-0.5 font-medium tabular">{t("percentOfPrice", { value: f.number(p.maxFinancePercent) })}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">{t("processingFee")}</dt>
          <dd className="mt-0.5 font-medium tabular">{f.number(p.processingFeePercent, { maximumFractionDigits: 2 })}%</dd>
        </div>
      </dl>
      {p.structures?.length ? (
        <p className="text-xs text-muted">
          {t("structures")}: {p.structures.map((s) => t(`structure.${s}`)).join(" · ")}
        </p>
      ) : null}
      <ul className="mt-auto flex flex-col gap-1.5 border-t border-line pt-4 text-sm">
        {p.highlights.map((h) => (
          <li key={h.en} className="flex gap-2">
            <span aria-hidden className="text-accent-ink">·</span>
            {h[locale]}
          </li>
        ))}
      </ul>
    </article>
  );
}
