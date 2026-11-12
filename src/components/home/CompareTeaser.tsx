import { getLocale, getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";
import { costConfig } from "@/config/costs";
import { getVehicleBySlug } from "@/lib/api/vehicles";
import { getFormat } from "@/lib/format/getFormat";
import { headlineEfficiency, powerHp, vehicleFullName } from "@/lib/vehicle";
import { SectionHeading } from "./SectionHeading";

/** Compare teaser: an EV and a hybrid side by side, opening the full comparison. */
export async function CompareTeaser() {
  const [t, tTax, f, locale, a, b] = await Promise.all([
    getTranslations("home.compare"),
    getTranslations("taxonomy"),
    getFormat(),
    getLocale(),
    getVehicleBySlug(costConfig.representativeVehicles.ev),
    getVehicleBySlug(costConfig.representativeVehicles.hybrid),
  ]);
  const pair = [a, b].filter((v) => v !== null);
  if (pair.length < 2) return null;
  const rows = [
    { label: t("price"), value: (v: (typeof pair)[number]) => f.bdtCompact(v.price.amount) },
    { label: t("fuel"), value: (v: (typeof pair)[number]) => tTax(`fuel.${v.fuelType}`) },
    {
      label: t("efficiency"),
      value: (v: (typeof pair)[number]) => {
        const e = headlineEfficiency(v);
        return e ? (e.unit === "km" ? t("range", { km: f.unit("km", e.value, 0) }) : f.unit(e.unit, e.value)) : "—";
      },
    },
    { label: t("power"), value: (v: (typeof pair)[number]) => (powerHp(v) ? f.unit("hp", powerHp(v) ?? 0, 0) : "—") },
    { label: t("seats"), value: (v: (typeof pair)[number]) => f.number(v.seats) },
  ];
  return (
    <section aria-labelledby="compare-teaser" className="container-page mt-24">
      <SectionHeading id="compare-teaser" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <div className="overflow-x-auto rounded-card border border-line bg-bg-alt">
        <table className="w-full min-w-[34rem] text-sm">
          <caption className="sr-only">{t("title")}</caption>
          <thead>
            <tr className="border-b border-line">
              <td className="w-1/4 px-5 py-4" />
              {pair.map((v) => (
                <th key={v.id} scope="col" className="px-5 py-4 text-left align-bottom font-medium">
                  <span className="block text-xs font-normal text-muted">{tTax(`condition.${v.condition}`)} · {f.number(v.year, { useGrouping: false })}</span>
                  {vehicleFullName(v, locale)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.label}>
                <th scope="row" className="px-5 py-3 text-left font-normal text-muted">{r.label}</th>
                {pair.map((v) => (
                  <td key={v.id} className="px-5 py-3 font-medium tabular">{r.value(v)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <ButtonLink href={`/compare?ids=${pair.map((v) => v.id).join(",")}`}>{t("cta")}</ButtonLink>
        <ButtonLink href="/vehicles" variant="outline">{t("pick")}</ButtonLink>
      </div>
    </section>
  );
}
