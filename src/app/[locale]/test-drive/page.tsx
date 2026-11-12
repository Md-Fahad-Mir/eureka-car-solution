import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { TestDriveForm } from "@/components/booking/TestDriveForm";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { Skeleton } from "@/components/ui/Skeleton";
import { getShowrooms } from "@/lib/api/showrooms";
import { getAllVehicles } from "@/lib/api/vehicles";
import { getFormat } from "@/lib/format/getFormat";
import { pageMetadata } from "@/lib/seo";
import { toVehicleOptions } from "@/lib/vehicleOptions";

export async function generateMetadata(): Promise<Metadata> {
  const [t, f] = await Promise.all([getTranslations("testDrive"), getFormat()]);
  return pageMetadata({ locale: f.locale, path: "/test-drive", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function TestDrivePage() {
  const [t, tTax, f, vehicles, showrooms] = await Promise.all([
    getTranslations("testDrive"),
    getTranslations("taxonomy"),
    getFormat(),
    getAllVehicles(),
    getShowrooms(),
  ]);
  // Sold vehicles and arrivals that aren't in a showroom yet can't be test-driven.
  const bookable = vehicles.filter((v) => v.availability === "in_stock" || v.availability === "reserved");
  const options = toVehicleOptions(bookable, f.locale, f, (c) => tTax(`condition.${c}`));

  return (
    <div className="container-page pt-8 pb-20">
      <Breadcrumbs items={[{ label: t("breadcrumb") }]} />
      <header className="mt-6 mb-10 grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="eyebrow text-accent-ink">{t("eyebrow")}</p>
          <h1 className="display-lg mt-3">{t("title")}</h1>
          <p className="mt-4 max-w-2xl text-muted">{t("lead")}</p>
        </div>
        <div className="lg:col-span-4">
          <DemoNotice message={t("demoNotice")} />
        </div>
      </header>
      {/* Reads ?vehicle= to preselect, so it streams in after the shell. */}
      <Suspense fallback={<Skeleton className="h-[36rem] rounded-card" />}>
        <TestDriveForm vehicles={options} showrooms={showrooms} />
      </Suspense>
    </div>
  );
}
