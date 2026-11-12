"use client";

import { useEffect, useState } from "react";
import { CalendarPlus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Confirmation } from "@/components/forms/Confirmation";
import { MapCard } from "@/components/showroom/MapCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { getTestDriveBooking } from "@/lib/api/bookings";
import { getShowroomsByIds } from "@/lib/api/showrooms";
import { getVehiclesByIds } from "@/lib/api/vehicles";
import { useFormat } from "@/lib/format/useFormat";
import { buildIcs } from "@/lib/ics";
import { absoluteUrl } from "@/lib/seo";
import { vehicleFullName, vehiclePath } from "@/lib/vehicle";
import type { Showroom, TestDriveBooking } from "@/types";

/** Test drives are booked as 45-minute appointments. */
const DURATION_MINUTES = 45;

type State =
  | { status: "loading" }
  | { status: "notFound" }
  | { status: "found"; booking: TestDriveBooking; vehicleName: string; vehicleUrl: string; showroom: Showroom };

/** Saves a file in the browser (nothing is uploaded). */
function download(filename: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function TestDriveConfirmation() {
  const t = useTranslations("testDrive");
  const tConfirm = useTranslations("confirmation");
  const locale = useLocale();
  const f = useFormat();
  const ref = useSearchParams().get("ref") ?? "";
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const booking = ref ? await getTestDriveBooking(ref) : null;
      const [vehicles, showrooms] = booking
        ? await Promise.all([getVehiclesByIds([booking.vehicleId]), getShowroomsByIds([booking.showroomId])])
        : [[], []];
      if (cancelled) return;
      if (!booking || !vehicles[0] || !showrooms[0]) return setState({ status: "notFound" });
      setState({
        status: "found",
        booking,
        vehicleName: vehicleFullName(vehicles[0], locale),
        vehicleUrl: absoluteUrl(locale, vehiclePath(vehicles[0])),
        showroom: showrooms[0],
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [ref, locale]);

  if (state.status === "loading") return <Skeleton className="h-[32rem] rounded-card" />;
  if (state.status === "notFound") {
    return (
      <div role="alert" className="max-w-2xl rounded-card border border-line bg-bg-alt p-8">
        <h1 className="text-xl font-medium">{tConfirm("notFoundTitle")}</h1>
        <p className="mt-2 text-sm text-muted">{tConfirm("notFoundBody")}</p>
        <ButtonLink href="/test-drive" className="mt-6">
          {t("bookAnother")}
        </ButtonLink>
      </div>
    );
  }

  const { booking, vehicleName, vehicleUrl, showroom } = state;
  const when = `${f.date(booking.date, "weekday")}, ${f.time(booking.slot)}`;
  const saveToCalendar = () =>
    download(
      `eureka-test-drive-${booking.reference}.ics`,
      buildIcs({
        uid: `${booking.reference}@eureka-car-solution`,
        date: booking.date,
        time: booking.slot,
        durationMinutes: DURATION_MINUTES,
        title: t("calendar.title", { vehicle: vehicleName }),
        description: t("calendar.description", { reference: booking.reference, url: vehicleUrl }),
        location: `${showroom.name[locale]}, ${showroom.address[locale]}`,
        geo: showroom.geo,
        stamp: booking.createdAt,
      }),
      "text/calendar;charset=utf-8",
    );

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <Confirmation
          headingLevel={1}
          title={t("done.title")}
          body={t("done.body")}
          reference={booking.reference}
          actions={
            <>
              <Button size="lg" onClick={saveToCalendar} icon={<CalendarPlus aria-hidden className="size-4" />}>
                {t("done.calendar")}
              </Button>
              <WhatsAppButton
                size="lg"
                tone="outline"
                context={{ kind: "testDrive", vehicle: { name: vehicleName, url: vehicleUrl }, reference: booking.reference }}
              />
            </>
          }
        >
          <dl className="grid gap-4 rounded-card border border-line bg-bg-alt p-5 text-sm sm:grid-cols-2">
            <Item label={t("fields.vehicle")} value={vehicleName} />
            <Item label={t("summary.when")} value={when} />
            <Item label={t("fields.showroom")} value={showroom.name[locale]} />
            <Item label={t("done.status")} value={t("done.statusRequested")} />
          </dl>
          <p className="text-sm text-muted">{t("done.next")}</p>
        </Confirmation>
      </div>
      <div className="flex flex-col gap-4 lg:col-span-5">
        <MapCard showroom={showroom} />
        <p className="text-sm">{showroom.address[locale]}</p>
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
