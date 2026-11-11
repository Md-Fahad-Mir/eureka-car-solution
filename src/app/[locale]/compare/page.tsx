import type { Metadata } from "next";
import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Skeleton } from "@/components/ui/Skeleton";
import { CompareView } from "@/components/vehicle/CompareView";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations("compare"), getLocale()]);
  return pageMetadata({ locale, path: "/compare", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function ComparePage() {
  const t = await getTranslations("compare");
  return (
    <div className="container-page pt-8 pb-20">
      <Breadcrumbs items={[{ label: t("breadcrumb") }]} />
      <header className="mt-6 mb-10 max-w-3xl">
        <p className="eyebrow text-accent-ink">{t("eyebrow")}</p>
        <h1 className="display-lg mt-3">{t("title")}</h1>
        <p className="mt-4 text-muted">{t("lead")}</p>
      </header>
      {/* Reads ?ids= (request-time), so it streams in after the static shell. */}
      <Suspense fallback={<Skeleton className="h-96 rounded-card" />}>
        <CompareView />
      </Suspense>
    </div>
  );
}
