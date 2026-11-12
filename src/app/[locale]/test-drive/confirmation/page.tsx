import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { TestDriveConfirmation } from "@/components/booking/TestDriveConfirmation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Skeleton } from "@/components/ui/Skeleton";
import { getFormat } from "@/lib/format/getFormat";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [t, f] = await Promise.all([getTranslations("testDrive"), getFormat()]);
  return pageMetadata({ locale: f.locale, path: "/test-drive/confirmation", title: t("done.metaTitle"), noIndex: true });
}

export default async function TestDriveConfirmationPage() {
  const t = await getTranslations("testDrive");
  return (
    <div className="container-page pt-8 pb-20">
      <Breadcrumbs items={[{ label: t("breadcrumb"), href: "/test-drive" }, { label: t("done.breadcrumb") }]} />
      <div className="mt-8">
        {/* The booking lives in this browser (demo), so it's looked up client-side by ?ref=. */}
        <Suspense fallback={<Skeleton className="h-[32rem] rounded-card" />}>
          <TestDriveConfirmation />
        </Suspense>
      </div>
    </div>
  );
}
