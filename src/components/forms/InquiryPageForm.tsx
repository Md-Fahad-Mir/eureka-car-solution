"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import type { VehicleOption } from "@/lib/vehicleOptions";
import type { FinancePartner } from "@/types";
import { InquiryForm } from "./InquiryForm";

/** `/inquiry`: the shared inquiry form with `?vehicle=<slug>` preselection and a confirmation page. */
export function InquiryPageForm({ vehicles, partners }: { vehicles: VehicleOption[]; partners: Pick<FinancePartner, "id" | "name" | "type">[] }) {
  const router = useRouter();
  const slug = useSearchParams().get("vehicle");
  const preselected = vehicles.find((v) => v.slug === slug);
  return (
    <InquiryForm
      vehicles={vehicles.map(({ id, label }) => ({ id, label }))}
      defaultVehicleId={preselected?.id}
      partners={partners}
      onSuccess={(inquiry) => router.push(`/inquiry/confirmation?ref=${inquiry.reference}`)}
    />
  );
}
