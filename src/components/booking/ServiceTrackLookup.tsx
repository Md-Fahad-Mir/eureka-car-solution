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
import { getServicePackages, trackServiceBooking } from "@/lib/api/service";
import { getShowroomsByIds } from "@/lib/api/showrooms";
import { useFormat } from "@/lib/format/useFormat";
import type { ServiceBooking } from "@/types";

type Result =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "notFound"; reference: string }
  | { state: "found"; booking: ServiceBooking; centre: string; packages: string[] };

/** A sample booking from the demo customer, so visitors can see a booking mid-service. */
const DEMO_REFERENCE = "DEMO-SB-2981";

/** `/service/track`: status timeline by reference (Booked → Received → In service → Quality check → Ready → Delivered). */
export function ServiceTrackLookup() {
  const t = useTranslations("serviceTrack");
  const locale = useLocale();
  const f = useFormat();
  const router = useRouter();
  const ref = useSearchParams().get("ref") ?? "";
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
      const booking = await trackServiceBooking(ref);
      if (!booking) return !cancelled && setResult({ state: "notFound", reference: ref });
      const [centres, packages] = await Promise.all([getShowroomsByIds([booking.showroomId]), getServicePackages()]);
      if (cancelled) return;
      setResult({
        state: "found",
        booking,
        centre: centres[0]?.name[locale] ?? "",
        packages: booking.packageIds.flatMap((pid) => packages.filter((p) => p.id === pid).map((p) => p.name[locale])),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [ref, locale]);

  const go = (value: string) => router.replace(`/service/track?ref=${encodeURIComponent(value)}`, { scroll: false });

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <ReferenceSearch
          id="track-ref"
          label={t("referenceLabel")}
          placeholder="DEMO-SB-0000"
          submitLabel={t("check")}
          value={ref}
          onSearch={go}
          hint={t.rich("hint", {
            demo: () => (
              <button type="button" className="font-medium text-accent-ink underline" onClick={() => go(DEMO_REFERENCE)}>
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
        {result.state === "loading" ? <Skeleton className="h-96 rounded-card" /> : null}
        {result.state === "notFound" ? (
          <div role="alert" className="rounded-card border border-line bg-bg-alt p-8">
            <h2 className="text-lg font-medium">{t("notFoundTitle")}</h2>
            <p className="mt-2 text-sm text-muted">{t("notFoundBody", { reference: result.reference })}</p>
          </div>
        ) : null}
        {result.state === "found" ? (
          <div className="flex flex-col gap-6 rounded-card border border-line bg-bg-alt p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-xl font-medium tabular">{result.booking.reference}</h2>
              <p className="text-sm text-muted">{t("bookedFor", { date: f.date(result.booking.date, "long"), time: f.time(result.booking.slot) })}</p>
            </div>
            <dl className="grid gap-4 border-y border-line py-5 text-sm sm:grid-cols-2">
              <Item
                label={t("vehicle")}
                value={`${result.booking.vehicle.brand} ${result.booking.vehicle.model} ${f.number(result.booking.vehicle.year, { useGrouping: false })} · ${result.booking.vehicle.registrationNo}`}
              />
              <Item label={t("centre")} value={result.centre} />
              <Item label={t("packages")} value={result.packages.join(", ")} />
              <Item label={t("pickup")} value={result.booking.pickup.required ? t("pickupYes") : t("pickupNo")} />
            </dl>
            <Timeline
              currentKey={result.booking.status}
              steps={result.booking.timeline.map((s) => ({ key: s.status, label: t(`status.${s.status}`), at: s.at ? f.dateTime(s.at) : null }))}
            />
            <DemoNotice message={t("demoNotice")} />
            <WhatsAppButton
              tone="outline"
              context={{
                kind: "service",
                vehicle: `${result.booking.vehicle.brand} ${result.booking.vehicle.model}`,
                registration: result.booking.vehicle.registrationNo,
                reference: result.booking.reference,
              }}
            />
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
