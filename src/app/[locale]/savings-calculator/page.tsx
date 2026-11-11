import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SavingsCalculator, type SavingsVehicle } from "@/components/savings/SavingsCalculator";
import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { getAllVehicles } from "@/lib/api/vehicles";
import { getFormat } from "@/lib/format/getFormat";
import { pageMetadata } from "@/lib/seo";
import { vehicleFullName } from "@/lib/vehicle";

export async function generateMetadata(): Promise<Metadata> {
  const [t, f] = await Promise.all([getTranslations("savings"), getFormat()]);
  return pageMetadata({ locale: f.locale, path: "/savings-calculator", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function SavingsCalculatorPage() {
  const [t, f, all] = await Promise.all([getTranslations("savings"), getFormat(), getAllVehicles()]);
  // Tractors are costed per working hour, so they're not part of the per-km comparison.
  const vehicles: SavingsVehicle[] = all
    .filter((v) => v.efficiency.kmPerLitre || v.efficiency.kWhPer100km)
    .map((v) => ({
      id: v.id,
      slug: v.slug,
      label: `${vehicleFullName(v, f.locale)} (${f.number(v.year, { useGrouping: false })})`,
      shortLabel: `${v.brand.name[f.locale]} ${v.model}`,
      tickLabel: v.model,
      fuelType: v.fuelType,
      kmPerLitre: v.efficiency.kmPerLitre,
      kWhPer100km: v.efficiency.kWhPer100km,
      price: v.price.amount,
    }));

  return (
    <div className="container-page pt-8 pb-20">
      <Breadcrumbs items={[{ label: t("breadcrumb") }]} />
      <header className="mt-6 mb-10 grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="eyebrow text-accent-ink">{t("eyebrow")}</p>
          <h1 className="display-lg mt-3">
            {t("title")} <em className="font-light text-accent-ink">{t("titleAccent")}</em>
          </h1>
          <p className="mt-4 max-w-2xl text-muted">{t("lead")}</p>
        </div>
        <div className="flex gap-3 lg:col-span-4 lg:justify-end">
          <ButtonLink href="/vehicles?fuel=ev" variant="outline" icon={<ArrowRight aria-hidden className="size-4" />}>
            {t("browseEvs")}
          </ButtonLink>
        </div>
      </header>
      {/* Reads ?vehicle= to prefill a column, so it streams in after the shell. */}
      <Suspense fallback={<Skeleton className="h-[40rem] rounded-card" />}>
        <SavingsCalculator vehicles={vehicles} />
      </Suspense>
    </div>
  );
}
