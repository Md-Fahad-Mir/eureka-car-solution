import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { InquiryPageForm } from "@/components/forms/InquiryPageForm";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { Skeleton } from "@/components/ui/Skeleton";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { getFinancePartners } from "@/lib/api/finance";
import { getAllVehicles } from "@/lib/api/vehicles";
import { getFormat } from "@/lib/format/getFormat";
import { pageMetadata } from "@/lib/seo";
import { toVehicleOptions } from "@/lib/vehicleOptions";

export async function generateMetadata(): Promise<Metadata> {
  const [t, f] = await Promise.all([getTranslations("inquiryPage"), getFormat()]);
  return pageMetadata({ locale: f.locale, path: "/inquiry", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function InquiryPage() {
  const [t, tTax, f, vehicles, partners] = await Promise.all([
    getTranslations("inquiryPage"),
    getTranslations("taxonomy"),
    getFormat(),
    getAllVehicles(),
    getFinancePartners(),
  ]);
  const options = toVehicleOptions(
    vehicles.filter((v) => v.availability !== "sold"),
    f.locale,
    f,
    (c) => tTax(`condition.${c}`),
  );
  const steps = ["one", "two", "three"] as const;

  return (
    <div className="container-page pt-8 pb-20">
      <Breadcrumbs items={[{ label: t("breadcrumb") }]} />
      <div className="mt-6 grid gap-12 lg:grid-cols-12">
        <header className="lg:col-span-5">
          <p className="eyebrow text-accent-ink">{t("eyebrow")}</p>
          <h1 className="display-lg mt-3">{t("title")}</h1>
          <p className="mt-4 text-muted">{t("lead")}</p>
          <ol className="mt-8 flex flex-col gap-5">
            {steps.map((s, i) => (
              <li key={s} className="flex gap-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line-strong text-sm font-medium tabular">
                  {f.number(i + 1)}
                </span>
                <div>
                  <p className="font-medium">{t(`steps.${s}.title`)}</p>
                  <p className="mt-0.5 text-sm text-muted">{t(`steps.${s}.body`)}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-col gap-4">
            <DemoNotice message={t("demoNotice")} />
            <WhatsAppButton tone="outline" context={{ kind: "general" }} className="self-start" />
          </div>
        </header>
        <div className="rounded-card border border-line bg-bg-alt p-5 sm:p-8 lg:col-span-7">
          <Suspense fallback={<Skeleton className="h-[40rem] rounded-card" />}>
            <InquiryPageForm vehicles={options} partners={partners.map(({ id, name, type }) => ({ id, name, type }))} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
