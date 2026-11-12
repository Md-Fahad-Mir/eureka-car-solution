import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getBrands } from "@/lib/api/vehicles";
import { getFormat } from "@/lib/format/getFormat";
import { SectionHeading } from "./SectionHeading";

/** Popular brands as text tiles (no trademarked logos). */
export async function PopularBrands() {
  const [t, f, locale, brands] = await Promise.all([getTranslations("home.brands"), getFormat(), getLocale(), getBrands()]);
  const shown = brands.filter((b) => b.vehicleCount > 0).sort((a, b) => Number(b.isPopular) - Number(a.isPopular) || b.vehicleCount - a.vehicleCount);
  return (
    <section aria-labelledby="brands" className="container-page mt-20">
      <SectionHeading id="brands" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {shown.map((b) => (
          <li key={b.id}>
            <Link href={`/vehicles?brand=${b.id}`} className="flex h-full flex-col gap-1 rounded-card border border-line bg-bg-alt px-5 py-4 transition-colors hover:border-ink/40">
              <span className="text-lg font-medium tracking-tight">{b.name[locale]}</span>
              <span className="text-xs text-muted">
                {b.country[locale]} · {t("count", { count: b.vehicleCount, n: f.number(b.vehicleCount) })}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
