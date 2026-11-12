"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { getPurchaseInquiry } from "@/lib/api/inquiries";
import { getVehiclesByIds } from "@/lib/api/vehicles";
import { absoluteUrl } from "@/lib/seo";
import { vehicleFullName, vehiclePath } from "@/lib/vehicle";
import type { PurchaseInquiry, VehicleWithBrand } from "@/types";
import { Confirmation } from "./Confirmation";

type State = { status: "loading" } | { status: "notFound" } | { status: "found"; inquiry: PurchaseInquiry; vehicle: VehicleWithBrand | null };

/** `/inquiry/confirmation?ref=`: the inquiry recorded in this browser (demo). No payment is ever taken. */
export function InquiryConfirmation() {
  const t = useTranslations("inquiry");
  const tPage = useTranslations("inquiryPage");
  const tConfirm = useTranslations("confirmation");
  const locale = useLocale();
  const ref = useSearchParams().get("ref") ?? "";
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const inquiry = ref ? await getPurchaseInquiry(ref) : null;
      const vehicles = inquiry?.vehicleId ? await getVehiclesByIds([inquiry.vehicleId]) : [];
      if (cancelled) return;
      setState(inquiry ? { status: "found", inquiry, vehicle: vehicles[0] ?? null } : { status: "notFound" });
    })();
    return () => {
      cancelled = true;
    };
  }, [ref]);

  if (state.status === "loading") return <Skeleton className="h-96 rounded-card" />;
  if (state.status === "notFound") {
    return (
      <div role="alert" className="max-w-2xl rounded-card border border-line bg-bg-alt p-8">
        <h1 className="text-xl font-medium">{tConfirm("notFoundTitle")}</h1>
        <p className="mt-2 text-sm text-muted">{tConfirm("notFoundBody")}</p>
        <ButtonLink href="/inquiry" className="mt-6">
          {tPage("startNew")}
        </ButtonLink>
      </div>
    );
  }

  const { inquiry, vehicle } = state;
  const name = vehicle ? vehicleFullName(vehicle, locale) : null;
  return (
    <div className="max-w-3xl">
      <Confirmation
        headingLevel={1}
        title={t("successTitle")}
        body={t("successBody")}
        reference={inquiry.reference}
        actions={
          <>
            {name && vehicle ? (
              <WhatsAppButton
                size="lg"
                context={{ kind: "vehicleInquiry", vehicle: { name, reference: inquiry.reference, url: absoluteUrl(locale, vehiclePath(vehicle)) } }}
              />
            ) : (
              <WhatsAppButton size="lg" context={{ kind: "general", reference: inquiry.reference }} />
            )}
            {vehicle ? (
              <ButtonLink href={`/test-drive?vehicle=${vehicle.slug}`} size="lg" variant="outline">
                {tPage("bookTestDrive")}
              </ButtonLink>
            ) : null}
          </>
        }
      >
        <dl className="grid gap-4 rounded-card border border-line bg-bg-alt p-5 text-sm sm:grid-cols-2">
          <Item label={t("vehicle")} value={name ?? "—"} />
          <Item label={t("paymentPreference")} value={t(`payment.${inquiry.paymentPreference}`)} />
          <Item label={t("channel")} value={`${t(`channels.${inquiry.contact.channel}`)} · ${t(`times.${inquiry.contact.time}`)}`} />
          <Item label={tPage("status")} value={tPage("statusReceived")} />
        </dl>
        <p className="text-sm text-muted">{t("noPayment")}</p>
      </Confirmation>
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
