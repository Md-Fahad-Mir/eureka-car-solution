import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { FinanceApplyForm } from "@/components/finance/FinanceApplyForm";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { Skeleton } from "@/components/ui/Skeleton";
import { getFinancePartners } from "@/lib/api/finance";
import { getAllVehicles } from "@/lib/api/vehicles";
import { toFinanceOptions } from "@/lib/financeOptions";
import { getFormat } from "@/lib/format/getFormat";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [t, f] = await Promise.all([getTranslations("financeApply"), getFormat()]);
  return pageMetadata({ locale: f.locale, path: "/finance/apply", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function FinanceApplyPage() {
  const [t, tFinance, tTax, f, partners, vehicles] = await Promise.all([
    getTranslations("financeApply"),
    getTranslations("finance"),
    getTranslations("taxonomy"),
    getFormat(),
    getFinancePartners(),
    getAllVehicles(),
  ]);
  const options = toFinanceOptions(vehicles, f.locale, f, (c) => tTax(`condition.${c}`));

  return (
    <div className="container-page pt-8 pb-20">
      <Breadcrumbs items={[{ label: tFinance("breadcrumb"), href: "/finance" }, { label: t("breadcrumb") }]} />
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
      {/* Reads prefill params (?vehicle=&down=&tenure=&type=), so it streams in after the shell. */}
      <Suspense fallback={<Skeleton className="h-[36rem] rounded-card" />}>
        <FinanceApplyForm
          vehicles={options}
          partners={partners.map(({ id, name, type, rateRange }) => ({ id, name, type, rateRange }))}
        />
      </Suspense>
    </div>
  );
}
