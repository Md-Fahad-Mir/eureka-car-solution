import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowRight, CircleCheck, FileSearch } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { DocumentsChecklist } from "@/components/finance/DocumentsChecklist";
import { FinanceCalculator } from "@/components/finance/FinanceCalculator";
import { PartnerCard } from "@/components/finance/PartnerCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { Skeleton } from "@/components/ui/Skeleton";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { EMPLOYMENT_TYPES } from "@/types";
import { getFinancePartners } from "@/lib/api/finance";
import { getAllVehicles } from "@/lib/api/vehicles";
import { toVehicleOptions } from "@/lib/vehicleOptions";
import { getFormat } from "@/lib/format/getFormat";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [t, f] = await Promise.all([getTranslations("finance"), getFormat()]);
  return pageMetadata({ locale: f.locale, path: "/finance", title: t("metaTitle"), description: t("metaDescription") });
}

const ELIGIBILITY_ITEMS = ["item1", "item2", "item3", "item4"] as const;
const ISLAMIC_STEPS = ["step1", "step2", "step3"] as const;

export default async function FinancePage() {
  const [t, tTax, f, partners, vehicles] = await Promise.all([
    getTranslations("finance"),
    getTranslations("taxonomy"),
    getFormat(),
    getFinancePartners(),
    getAllVehicles(),
  ]);
  const options = toVehicleOptions(
    vehicles.filter((v) => v.availability !== "sold"),
    f.locale,
    f,
    (c) => tTax(`condition.${c}`),
  );

  return (
    <>
      <div className="container-page pt-8">
        <Breadcrumbs items={[{ label: t("breadcrumb") }]} />
        <header className="mt-6 mb-10 grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow text-accent-ink">{t("eyebrow")}</p>
            <h1 className="display-lg mt-3">
              {t("title")} <em className="font-light text-accent-ink">{t("titleAccent")}</em>
            </h1>
            <p className="mt-4 max-w-2xl text-muted">{t("lead")}</p>
          </div>
          <div className="lg:col-span-5">
            <DemoNotice message={t("sampleNotice")} />
          </div>
        </header>
      </div>

      <section aria-labelledby="calc-title" className="container-page pb-20">
        <h2 id="calc-title" className="sr-only">
          {t("calculator.title")}
        </h2>
        <Suspense fallback={<Skeleton className="h-[34rem] rounded-card" />}>
          <FinanceCalculator vehicles={options} defaultPrice={4_000_000} />
        </Suspense>
      </section>

      <section aria-labelledby="islamic-title" className="on-dark bg-graphite text-on-dark">
        <div className="container-page grid gap-12 py-20 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow text-accent-2">{t("islamic.eyebrow")}</p>
            <h2 id="islamic-title" className="display-md mt-3">
              {t("islamic.title")}
            </h2>
            <p className="mt-4 text-muted-on-dark">{t("islamic.lead")}</p>
            <dl className="mt-8 grid gap-4 text-sm">
              {(["rate", "instalment", "ownership"] as const).map((k) => (
                <div key={k} className="border-t border-line-on-dark pt-4">
                  <dt className="font-medium">{t(`islamic.terms.${k}.term`)}</dt>
                  <dd className="mt-1 text-muted-on-dark">{t(`islamic.terms.${k}.meaning`)}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:col-span-8">
            {(["hpsm", "ijarah"] as const).map((s) => (
              <article key={s} className="rounded-card border border-line-on-dark bg-white/[0.03] p-6">
                <h3 className="text-lg font-medium">{t(`islamic.${s}.title`)}</h3>
                <p className="mt-2 text-sm text-muted-on-dark">{t(`islamic.${s}.summary`)}</p>
                <ol className="mt-6 flex flex-col">
                  {ISLAMIC_STEPS.map((step, i) => (
                    <li key={step} className="relative flex gap-4 pb-6 last:pb-0">
                      {i < ISLAMIC_STEPS.length - 1 ? (
                        <span aria-hidden className="absolute top-8 left-[15px] h-[calc(100%-2rem)] w-px bg-line-on-dark" />
                      ) : null}
                      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-accent-2/60 text-xs text-accent-2 tabular">
                        {f.number(i + 1, { minimumIntegerDigits: 2 })}
                      </span>
                      <p className="pt-1 text-sm leading-relaxed">{t(`islamic.${s}.${step}`)}</p>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
            <p className="text-xs leading-relaxed text-muted-on-dark md:col-span-2">{t("islamic.note")}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="partners-title" className="container-page py-20">
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow text-accent-ink">{t("partners.eyebrow")}</p>
          <h2 id="partners-title" className="display-md mt-3">
            {t("partners.title")}
          </h2>
          <p className="mt-3 text-muted">{t("partners.lead")}</p>
        </div>
        {(["conventional", "islamic"] as const).map((type) => (
          <div key={type} className="mb-10 last:mb-0">
            <h3 className="mb-4 text-sm font-medium text-muted">{tTax(`financeType.${type}`)}</h3>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {partners
                .filter((p) => p.type === type)
                .map((p) => (
                  <li key={p.id}>
                    <PartnerCard partner={p} />
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </section>

      <section aria-labelledby="eligibility-title" className="bg-bg-alt">
        <div className="container-page py-20">
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow text-accent-ink">{t("eligibility.eyebrow")}</p>
            <h2 id="eligibility-title" className="display-md mt-3">
              {t("eligibility.title")}
            </h2>
            <p className="mt-3 text-muted">{t("eligibility.lead")}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {EMPLOYMENT_TYPES.map((type) => (
              <article key={type} className="rounded-card border border-line bg-bg p-6">
                <h3 className="text-lg font-medium">{t(`documents.types.${type}`)}</h3>
                <p className="mt-1 text-sm text-muted">{t(`eligibility.${type}.who`)}</p>
                <ul className="mt-5 flex flex-col gap-3">
                  {ELIGIBILITY_ITEMS.map((item) => (
                    <li key={item} className="flex gap-3 text-sm">
                      <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
                      {t(`eligibility.${type}.${item}`)}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted">{t("eligibility.note")}</p>

          <div className="mt-16 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="display-md">{t("documents.title")}</h2>
              <p className="mt-3 text-muted">{t("documents.lead")}</p>
            </div>
            <div className="lg:col-span-8">
              <DocumentsChecklist />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="next-title" className="container-page py-20">
        <div className="grid gap-6 rounded-card border border-line bg-bg-alt p-6 sm:p-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <h2 id="next-title" className="display-md">
              {t("next.title")}
            </h2>
            <p className="mt-3 text-muted">{t("next.lead")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:col-span-7 lg:justify-end">
            <ButtonLink href="/finance/apply" size="lg" icon={<ArrowRight aria-hidden className="size-4" />}>
              {t("next.apply")}
            </ButtonLink>
            <ButtonLink href="/finance/status" size="lg" variant="outline" icon={<FileSearch aria-hidden className="size-4" />}>
              {t("next.status")}
            </ButtonLink>
            <WhatsAppButton size="lg" tone="outline" context={{ kind: "emiInquiry" }} />
          </div>
        </div>
      </section>
    </>
  );
}
