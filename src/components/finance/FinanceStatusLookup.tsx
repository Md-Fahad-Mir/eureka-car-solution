"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ReferenceSearch } from "@/components/forms/ReferenceSearch";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { Skeleton } from "@/components/ui/Skeleton";
import { Timeline } from "@/components/ui/Timeline";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { useRouter } from "@/i18n/navigation";
import { getFinanceApplicationStatus, getFinancePartners } from "@/lib/api/finance";
import { getVehiclesByIds } from "@/lib/api/vehicles";
import { useFormat } from "@/lib/format/useFormat";
import { vehicleFullName } from "@/lib/vehicle";
import type { FinanceApplication } from "@/types";

type Result =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "notFound"; reference: string }
  | { state: "found"; application: FinanceApplication; vehicleName: string | null; partnerName: string | null };

const DEMO_REFERENCE = "DEMO-FA-2417";

/** Finance application status by reference (`?ref=` or the form). */
export function FinanceStatusLookup() {
  const t = useTranslations("financeStatus");
  const tApply = useTranslations("financeApply");
  const locale = useLocale();
  const f = useFormat();
  const router = useRouter();
  const params = useSearchParams();
  const ref = params.get("ref") ?? "";
  const [result, setResult] = useState<Result>({ state: ref ? "loading" : "idle" });

  const [lastRef, setLastRef] = useState(ref);
  if (lastRef !== ref) {
    setLastRef(ref);
    setResult({ state: ref ? "loading" : "idle" });
  }

  useEffect(() => {
    if (!ref) return;
    let cancelled = false;
    (async () => {
      const application = await getFinanceApplicationStatus(ref);
      if (cancelled) return;
      if (!application) return setResult({ state: "notFound", reference: ref });
      const [vehicles, partners] = await Promise.all([
        application.vehicleId ? getVehiclesByIds([application.vehicleId]) : Promise.resolve([]),
        getFinancePartners(),
      ]);
      if (cancelled) return;
      setResult({
        state: "found",
        application,
        vehicleName: vehicles[0] ? vehicleFullName(vehicles[0], locale) : null,
        partnerName: partners.find((p) => p.id === application.partnerId)?.name[locale] ?? null,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [ref, locale]);

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <ReferenceSearch
          id="status-ref"
          label={t("referenceLabel")}
          placeholder="DEMO-FA-0000"
          submitLabel={t("check")}
          value={ref}
          onSearch={(value) => router.replace(`/finance/status?ref=${encodeURIComponent(value)}`, { scroll: false })}
          hint={t.rich("hint", {
            demo: () => (
              <button type="button" className="font-medium text-accent-ink underline" onClick={() => router.replace(`/finance/status?ref=${DEMO_REFERENCE}`)}>
                {DEMO_REFERENCE}
              </button>
            ),
          })}
        />
      </div>

      <div className="lg:col-span-8" aria-live="polite">
        {result.state === "idle" ? (
          <p className="rounded-card border border-dashed border-line-strong p-8 text-center text-sm text-muted">{t("idle")}</p>
        ) : null}
        {result.state === "loading" ? <Skeleton className="h-80 rounded-card" /> : null}
        {result.state === "notFound" ? (
          <div role="alert" className="rounded-card border border-line bg-bg-alt p-8">
            <h2 className="text-lg font-medium">{t("notFoundTitle")}</h2>
            <p className="mt-2 text-sm text-muted">{t("notFoundBody", { reference: result.reference })}</p>
          </div>
        ) : null}
        {result.state === "found" ? (
          <div className="flex flex-col gap-6 rounded-card border border-line bg-bg-alt p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-xl font-medium tabular">{result.application.reference}</h2>
              <p className="text-sm text-muted">{t("submittedOn", { date: f.date(result.application.createdAt, "long") })}</p>
            </div>
            <dl className="grid gap-4 border-y border-line py-5 text-sm sm:grid-cols-2">
              <Item label={t("vehicle")} value={result.vehicleName ?? tApply("fields.customVehicle")} />
              <Item label={t("financed")} value={f.bdt(result.application.vehiclePrice - result.application.downPayment)} />
              <Item label={t("tenure")} value={f.unit("months", result.application.tenureMonths, 0)} />
              <Item
                label={t("type")}
                value={`${tApply(`financeTypes.${result.application.financeType}.label`)}${result.partnerName ? ` · ${result.partnerName}` : ""}`}
              />
            </dl>
            <Timeline
              currentKey={result.application.status}
              steps={result.application.timeline.map((s) => ({
                key: s.status,
                label: tApply(`status.${s.status}`),
                at: s.at ? f.dateTime(s.at) : null,
                description: s.status === "decision" && !s.at ? t("decisionNote") : undefined,
              }))}
            />
            <DemoNotice message={t("demoNotice")} />
            <WhatsAppButton tone="outline" context={{ kind: "emiInquiry", reference: result.application.reference }} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
