import { useLocale, useTranslations } from "next-intl";
import { Accordion } from "@/components/ui/Accordion";
import { useFormat } from "@/lib/format/useFormat";
import type { SpecItem, VehicleWithBrand } from "@/types";

/** Full specification, grouped and collapsible (first group open). */
export function SpecTable({ vehicle }: { vehicle: VehicleWithBrand }) {
  const t = useTranslations("specs");
  const locale = useLocale();
  const f = useFormat();

  const value = (item: SpecItem) => {
    if (typeof item.value === "number") return item.unit ? f.unit(item.unit, item.value, 2) : f.number(item.value);
    if (typeof item.value === "string") return item.value;
    return item.value[locale];
  };

  return (
    <Accordion
      headingLevel={3}
      items={vehicle.specs.map((group, i) => ({
        id: `spec-${group.group}`,
        defaultOpen: i === 0,
        title: t(`groups.${group.group}`),
        content: (
          <dl className="grid sm:grid-cols-2 sm:gap-x-10">
            {group.items.map((item) => (
              <div key={item.key} className="flex justify-between gap-4 border-b border-line py-2.5 text-sm last:border-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-0">
                <dt className="text-muted">{t(`keys.${item.key}`)}</dt>
                <dd className="text-right font-medium tabular">{value(item)}</dd>
              </div>
            ))}
          </dl>
        ),
      }))}
    />
  );
}
