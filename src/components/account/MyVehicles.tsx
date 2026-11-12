"use client";

import { Car } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";
import { addDaysToKey, toDhakaDateKey } from "@/lib/format/date";
import { useFormat } from "@/lib/format/useFormat";
import { useAccount } from "./AccountData";
import { Field, RecordCard, SectionHeader, StatusBadge } from "./parts";

/** Vehicles the demo customer owns, with service due dates. */
export function MyVehicles() {
  const t = useTranslations("account.vehicles");
  const tTax = useTranslations("taxonomy");
  const f = useFormat();
  const { data } = useAccount();
  const [today] = useState(() => toDhakaDateKey(new Date()));
  const soon = addDaysToKey(today, 30);

  return (
    <div>
      <SectionHeader title={t("title")} lead={t("lead")} />
      <div className="flex flex-col gap-4">
        {data.ownedVehicles.map((v) => {
          const status = v.nextServiceDue < today ? "overdue" : v.nextServiceDue <= soon ? "soon" : "ok";
          return (
            <RecordCard
              key={v.id}
              title={v.label}
              meta={v.registrationNo}
              badge={
                status === "ok" ? null : (
                  <StatusBadge tone={status === "overdue" ? "danger" : "warning"}>{t(status === "overdue" ? "serviceOverdue" : "serviceSoon")}</StatusBadge>
                )
              }
              actions={
                <>
                  <ButtonLink href="/service/book" size="sm" icon={<Car aria-hidden className="size-4" />}>
                    {t("bookService")}
                  </ButtonLink>
                  {data.emiSchedule.vehicleLabel === v.label ? (
                    <ButtonLink href="/account/emi" size="sm" variant="outline">
                      {t("viewEmi")}
                    </ButtonLink>
                  ) : null}
                </>
              }
            >
              <Field label={t("fuel")} value={tTax(`fuel.${v.fuelType}`)} />
              <Field label={t("odometer")} value={f.unit("km", v.odometerKm, 0)} />
              <Field label={t("nextService")} value={f.date(v.nextServiceDue, "long")} />
              <Field label={t("purchased")} value={f.date(v.purchasedAt, "long")} />
              <Field label={t("year")} value={f.number(v.year, { useGrouping: false })} />
            </RecordCard>
          );
        })}
      </div>
    </div>
  );
}
