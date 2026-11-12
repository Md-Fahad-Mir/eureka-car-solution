import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ServiceTrackLookup } from "@/components/booking/ServiceTrackLookup";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Skeleton } from "@/components/ui/Skeleton";
import { getFormat } from "@/lib/format/getFormat";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [t, f] = await Promise.all([getTranslations("serviceTrack"), getFormat()]);
  return pageMetadata({ locale: f.locale, path: "/service/track", title: t("metaTitle"), description: t("metaDescription"), noIndex: true });
}

export default async function ServiceTrackPage() {
  const [t, tService] = await Promise.all([getTranslations("serviceTrack"), getTranslations("service")]);
  return (
    <div className="container-page pt-8 pb-20">
      <Breadcrumbs items={[{ label: tService("breadcrumb"), href: "/service" }, { label: t("breadcrumb") }]} />
      <header className="mt-6 mb-10 max-w-3xl">
        <p className="eyebrow text-accent-ink">{t("eyebrow")}</p>
        <h1 className="display-lg mt-3">{t("title")}</h1>
        <p className="mt-4 text-muted">{t("lead")}</p>
      </header>
      <Suspense fallback={<Skeleton className="h-80 rounded-card" />}>
        <ServiceTrackLookup />
      </Suspense>
    </div>
  );
}
