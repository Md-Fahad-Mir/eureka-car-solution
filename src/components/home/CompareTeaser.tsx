import { getLocale, getTranslations } from "next-intl/server";
import { VehicleImage } from "@/components/media/VehicleImage";
import { ButtonLink } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { costConfig } from "@/config/costs";
import { getVehicleBySlug } from "@/lib/api/vehicles";
import { getFormat } from "@/lib/format/getFormat";
import { stagger } from "@/lib/motion";
import { brandInitial, headlineEfficiency, powerHp, vehicleFullName } from "@/lib/vehicle";
import { SectionHeading } from "./SectionHeading";

/**
 * Compare teaser: an EV and a hybrid head to head. Each column opens on the
 * vehicle's studio image with a "vs" mark between them; the spec rows fade in
 * one by one and highlight on hover. Still a real table for screen readers.
 */
export async function CompareTeaser({ index }: { index: number }) {
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
  type V = (typeof pair)[number];
  const rows = [
    { label: t("price"), value: (v: V) => f.bdtCompact(v.price.amount) },
    { label: t("fuel"), value: (v: V) => tTax(`fuel.${v.fuelType}`) },
    {
      label: t("efficiency"),
      value: (v: V) => {
        const e = headlineEfficiency(v);
        return e ? (e.unit === "km" ? t("range", { km: f.unit("km", e.value, 0) }) : f.unit(e.unit, e.value)) : "—";
      },
    },
    { label: t("power"), value: (v: V) => (powerHp(v) ? f.unit("hp", powerHp(v) ?? 0, 0) : "—") },
    { label: t("seats"), value: (v: V) => f.number(v.seats) },
  ];
  return (
    <section aria-labelledby="compare-teaser" className="container-page section-gap">
      <SectionHeading id="compare-teaser" index={index} eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <div data-reveal>
        <ScrollArea label={t("title")} className="rounded-[28px] border border-line bg-bg-alt">
          <table className="w-full min-w-[36rem] text-sm">
            <caption className="sr-only">{t("title")}</caption>
            <thead>
              <tr>
                <td className="w-1/4 px-5 pt-5 align-bottom sm:px-8">
                  <span aria-hidden className="eyebrow text-muted">{t("eyebrow")}</span>
                </td>
                {pair.map((v, i) => (
                  <th key={v.id} scope="col" className="relative px-5 pt-5 pb-5 text-left align-bottom font-medium sm:px-8">
                    {/* Decorative here: the header's name is the vehicle name, not the image description. */}
                    <div aria-hidden>
                      <VehicleImage
                        media={v.images[0]}
                        placeholder={{ bodyType: v.bodyType, paint: v.colors[0]?.hex ?? "#cfd0c9", initial: brandInitial(v) }}
                        sizes="(min-width: 1024px) 30vw, 60vw"
                        className="mb-4 max-h-56"
                      />
                    </div>
                    {i === 0 ? (
                      <span
                        aria-hidden
                        className="absolute top-1/2 -right-6 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-ink text-xs font-semibold tracking-wide text-bg-alt shadow-(--shadow-soft) sm:grid"
                      >
                        {t("vs")}
                      </span>
                    ) : null}
                    <span className="block text-xs font-normal text-muted">
                      {tTax(`condition.${v.condition}`)} · {f.number(v.year, { useGrouping: false })}
                    </span>
                    <span className="mt-1 block text-lg">{vehicleFullName(v, locale)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="border-t border-line">
              {rows.map((r, i) => (
                <tr key={r.label} data-reveal="fade" style={stagger(i, 200)} className="border-b border-line transition-colors duration-300 last:border-b-0 hover:bg-bg/60">
                  <th scope="row" className="px-5 py-4 text-left font-normal text-muted sm:px-8">{r.label}</th>
                  {pair.map((v) => (
                    <td key={v.id} className="px-5 py-4 text-[0.9375rem] font-medium tabular sm:px-8">{r.value(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </div>
      <div data-reveal style={stagger(0, 200)} className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href={`/compare?ids=${pair.map((v) => v.id).join(",")}`} className="sheen">{t("cta")}</ButtonLink>
        <ButtonLink href="/vehicles" variant="outline">{t("pick")}</ButtonLink>
      </div>
    </section>
  );
}
