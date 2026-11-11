"use client";

import { useState } from "react";
import { MessageSquareText } from "lucide-react";
import { useTranslations } from "next-intl";
import { InquiryForm, type InquiryVehicleOption } from "@/components/forms/InquiryForm";
import { Button } from "@/components/ui/Button";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { Sheet } from "@/components/ui/Dialog";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import type { WhatsAppVehicle } from "@/lib/whatsapp";
import type { FinancePartner, PurchaseInquiry } from "@/types";

/** "Enquire to buy" button + drawer with the purchase inquiry form and an honest demo confirmation. */
export function InquiryDrawer({
  vehicle,
  whatsappVehicle,
  partners,
}: {
  vehicle: InquiryVehicleOption;
  whatsappVehicle: WhatsAppVehicle;
  partners: Pick<FinancePartner, "id" | "name" | "type">[];
}) {
  const t = useTranslations("inquiry");
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState<PurchaseInquiry | null>(null);

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        icon={<MessageSquareText aria-hidden className="size-4" />}
      >
        {t("enquire")}
      </Button>
      <Sheet
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setSubmitted(null);
        }}
        side="right"
        title={submitted ? t("successTitle") : t("drawerTitle")}
        description={submitted ? undefined : vehicle.label}
      >
        {submitted ? (
          <div className="flex flex-col gap-5" role="status">
            <p className="text-sm text-muted">{t("successBody")}</p>
            <p className="rounded-2xl border border-line bg-bg px-4 py-3 text-sm">
              {t("reference")}: <span className="font-semibold tabular">{submitted.reference}</span>
            </p>
            <DemoNotice reference={submitted.reference} />
            <WhatsAppButton
              size="lg"
              className="w-full"
              context={{ kind: "vehicleInquiry", vehicle: { ...whatsappVehicle, reference: submitted.reference } }}
            />
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t("done")}
            </Button>
          </div>
        ) : (
          <InquiryForm vehicles={[vehicle]} partners={partners} idPrefix="drawer-inquiry" onSuccess={setSubmitted} />
        )}
      </Sheet>
    </>
  );
}
