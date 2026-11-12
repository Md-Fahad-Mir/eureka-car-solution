import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ServiceBookingForm } from "@/components/booking/ServiceBookingForm";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { Skeleton } from "@/components/ui/Skeleton";
import { getServicePackages } from "@/lib/api/service";
import { getShowrooms } from "@/lib/api/showrooms";
import { getBrands } from "@/lib/api/vehicles";
import { getFormat } from "@/lib/format/getFormat";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [t, f] = await Promise.all([getTranslations("serviceBook"), getFormat()]);
  return pageMetadata({ locale: f.locale, path: "/service/book", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function ServiceBookPage() {
  const [t, tService, packages, showrooms, brands] = await Promise.all([
    getTranslations("serviceBook"),
    getTranslations("service"),
    getServicePackages(),
    getShowrooms(),
    getBrands(),
  ]);
  const centres = showrooms.filter((s) => s.services.includes("service") || s.services.includes("tractorService"));

  return (
    <div className="container-page pt-8 pb-20">
      <Breadcrumbs items={[{ label: tService("breadcrumb"), href: "/service" }, { label: t("breadcrumb") }]} />
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
      {/* Reads ?package= and the demo session, so it streams in after the shell. */}
      <Suspense fallback={<Skeleton className="h-[36rem] rounded-card" />}>
        <ServiceBookingForm packages={packages} centres={centres} brandNames={brands.map((b) => b.name.en)} />
      </Suspense>
    </div>
  );
}
