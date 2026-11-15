import { ArrowUpRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getBrands } from "@/lib/api/vehicles";
import { getFormat } from "@/lib/format/getFormat";
import { stagger } from "@/lib/motion";
import { SectionHeading } from "./SectionHeading";

/**
 * Popular brands as a typographic wall (names only, no trademarked logos):
 * a hairline grid that fades in cell by cell; on hover a dark fill rises
 * behind the name and the count and arrow come forward.
 */
export async function PopularBrands({ index }: { index: number }) {
  const [t, f, locale, brands] = await Promise.all([getTranslations("home.brands"), getFormat(), getLocale(), getBrands()]);
  const shown = brands.filter((b) => b.vehicleCount > 0).sort((a, b) => Number(b.isPopular) - Number(a.isPopular) || b.vehicleCount - a.vehicleCount);
  return (
    <section aria-labelledby="brands" className="container-page section-gap">
      <SectionHeading id="brands" index={index} eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <ul className="grid grid-cols-2 border-t border-l border-line sm:grid-cols-3 lg:grid-cols-6">
        {shown.map((b, i) => (
          <li key={b.id} data-reveal="fade" style={stagger(i)} className="border-r border-b border-line">
            <Link
              href={`/vehicles?brand=${b.id}`}
              className="group relative isolate flex h-full min-h-32 flex-col justify-between gap-6 overflow-hidden p-5 outline-offset-[-2px] sm:min-h-36"
            >
              <span aria-hidden className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-ink transition-transform duration-500 ease-(--ease-cinema) group-hover:scale-y-100 group-focus-visible:scale-y-100" />
              <span className="text-2xl font-light tracking-tight transition-colors duration-300 group-hover:text-on-dark group-focus-visible:text-on-dark">{b.name[locale]}</span>
              <span className="flex items-end justify-between gap-2 text-xs text-muted transition-colors duration-300 group-hover:text-muted-on-dark group-focus-visible:text-muted-on-dark">
                <span>
                  {b.country[locale]}
                  <br />
                  {t("count", { count: b.vehicleCount, n: f.number(b.vehicleCount) })}
                </span>
                <ArrowUpRight aria-hidden className="size-4 shrink-0 translate-y-1 opacity-0 transition-[opacity,transform] duration-500 ease-(--ease-cinema) group-hover:translate-y-0 group-hover:text-accent-2 group-hover:opacity-100" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
