import { useTranslations } from "next-intl";
import { costConfig } from "@/config/costs";
import { evConfig } from "@/config/ev";
import { useFormat } from "@/lib/format/useFormat";
import { cn } from "@/lib/utils";

/** Energy cost per km for typical vehicles, from the same sample prices the calculators use. */
export function CostPerKm() {
  const t = useTranslations("ev.costPerKm");
  const f = useFormat();
  const c = costConfig;
  const rows = [
    { key: "ev", perKm: (evConfig.consumptionKwhPer100Km / 100) * c.electricityPerKwh, basis: t("basis.ev", { kwh: f.number(evConfig.consumptionKwhPer100Km) }) },
    { key: "hybrid", perKm: c.fuelPricePerLitre.petrol / c.comparisonBaseline.hybrid.kmPerLitre, basis: t("basis.fuel", { kmpl: f.number(c.comparisonBaseline.hybrid.kmPerLitre) }) },
    { key: "diesel", perKm: c.fuelPricePerLitre.diesel / evConfig.dieselKmPerLitre, basis: t("basis.fuel", { kmpl: f.number(evConfig.dieselKmPerLitre) }) },
    { key: "petrol", perKm: c.fuelPricePerLitre.petrol / c.comparisonBaseline.petrol.kmPerLitre, basis: t("basis.fuel", { kmpl: f.number(c.comparisonBaseline.petrol.kmPerLitre) }) },
  ] as const;
  const max = Math.max(...rows.map((r) => r.perKm));
  return (
    <div className="flex flex-col gap-3 rounded-card border border-line bg-bg-alt p-5">
      <table className="w-full text-sm">
        <caption className="sr-only">{t("caption")}</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">{t("vehicle")}</th>
            <th scope="col">{t("perKm")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <th scope="row" className="w-2/5 py-2 pr-3 text-left align-middle font-normal">
                <span className="font-medium">{t(`types.${r.key}`)}</span>
                <span className="block text-xs text-muted">{r.basis}</span>
              </th>
              <td className="py-2 align-middle">
                <div className="flex items-center gap-3">
                  <span aria-hidden className={cn("h-2.5 rounded-full", r.key === "ev" ? "bg-ev" : "bg-ink/70")} style={{ width: `${(r.perKm / max) * 70}%` }} />
                  <span className="shrink-0 font-medium tabular">{t("value", { amount: f.bdt(r.perKm, 1) })}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-muted">
        {t("note", { petrol: f.bdt(c.fuelPricePerLitre.petrol), diesel: f.bdt(c.fuelPricePerLitre.diesel), electricity: f.bdt(c.electricityPerKwh) })}
      </p>
    </div>
  );
}
