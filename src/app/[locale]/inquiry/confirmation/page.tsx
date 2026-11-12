import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { InquiryConfirmation } from "@/components/forms/InquiryConfirmation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Skeleton } from "@/components/ui/Skeleton";
import { getFormat } from "@/lib/format/getFormat";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [t, f] = await Promise.all([getTranslations("inquiryPage"), getFormat()]);
  return pageMetadata({ locale: f.locale, path: "/inquiry/confirmation", title: t("confirmTitle"), noIndex: true });
}

export default async function InquiryConfirmationPage() {
  const t = await getTranslations("inquiryPage");
  return (
    <div className="container-page pt-8 pb-20">
      <Breadcrumbs items={[{ label: t("breadcrumb"), href: "/inquiry" }, { label: t("confirmBreadcrumb") }]} />
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-96 rounded-card" />}>
          <InquiryConfirmation />
        </Suspense>
      </div>
    </div>
  );
}
