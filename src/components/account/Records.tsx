"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { toDhakaDateKey } from "@/lib/format/date";
import { useFormat } from "@/lib/format/useFormat";
import { vehicleFullName } from "@/lib/vehicle";
import { useAccount } from "./AccountData";
import { Field, RecordCard, SectionHeader, StatusBadge, TONES } from "./parts";

/* ── Test drives ── */
export function TestDrives() {
  const t = useTranslations("account.testDrives");
  const tStatus = useTranslations("account.status");
  const locale = useLocale();
  const f = useFormat();
  const { data, refs } = useAccount();
  const [today] = useState(() => toDhakaDateKey(new Date()));

  return (
    <div>
      <SectionHeader title={t("title")} lead={t("lead")} action={<ButtonLink href="/test-drive">{t("book")}</ButtonLink>} />
      {data.testDrives.length ? (
        <div className="flex flex-col gap-4">
          {data.testDrives.map((b) => {
            const upcoming = (b.status === "requested" || b.status === "confirmed") && b.date >= today;
            const name = b.vehicle ? vehicleFullName(b.vehicle, locale) : "—";
            return (
              <RecordCard
                key={b.reference}
                title={name}
                meta={b.reference}
                badge={<StatusBadge tone={TONES.testDrive[b.status]}>{tStatus(`testDrive.${b.status}`)}</StatusBadge>}
                actions={
                  upcoming ? (
                    <>
                      <ButtonLink href={`/test-drive/confirmation?ref=${b.reference}`} size="sm" variant="outline">
                        {t("details")}
                      </ButtonLink>
                      <WhatsAppButton size="sm" tone="outline" display="short" context={{ kind: "testDrive", vehicle: { name }, reference: b.reference }} />
                    </>
                  ) : b.status === "completed" && b.vehicle ? (
                    <ButtonLink href={`/inquiry?vehicle=${b.vehicle.slug}`} size="sm" variant="outline">
                      {t("enquire")}
                    </ButtonLink>
                  ) : null
                }
              >
                <Field label={t("when")} value={`${f.date(b.date, "medium")}, ${f.time(b.slot)}`} />
                <Field label={t("where")} value={refs.showrooms.find((s) => s.id === b.showroomId)?.name[locale] ?? "—"} />
                <Field label={t("booked")} value={f.date(b.createdAt, "medium")} />
              </RecordCard>
            );
          })}
        </div>
      ) : (
        <EmptyState title={t("empty")} action={<ButtonLink href="/test-drive">{t("book")}</ButtonLink>} />
      )}
    </div>
  );
}

/* ── Purchase inquiries ── */
export function Inquiries() {
  const t = useTranslations("account.inquiries");
  const tInq = useTranslations("inquiry");
  const tStatus = useTranslations("account.status");
  const locale = useLocale();
  const f = useFormat();
  const { data } = useAccount();
  return (
    <div>
      <SectionHeader title={t("title")} lead={t("lead")} action={<ButtonLink href="/inquiry">{t("new")}</ButtonLink>} />
      {data.inquiries.length ? (
        <div className="flex flex-col gap-4">
          {data.inquiries.map((i) => (
            <RecordCard
              key={i.reference}
              title={i.vehicle ? vehicleFullName(i.vehicle, locale) : "—"}
              meta={i.reference}
              badge={<StatusBadge tone={TONES.inquiry[i.status]}>{tStatus(`inquiry.${i.status}`)}</StatusBadge>}
            >
              <Field label={tInq("paymentPreference")} value={tInq(`payment.${i.paymentPreference}`)} />
              <Field label={tInq("channel")} value={`${tInq(`channels.${i.contact.channel}`)} · ${tInq(`times.${i.contact.time}`)}`} />
              <Field label={t("sent")} value={f.date(i.createdAt, "medium")} />
            </RecordCard>
          ))}
        </div>
      ) : (
        <EmptyState title={t("empty")} action={<ButtonLink href="/inquiry">{t("new")}</ButtonLink>} />
      )}
    </div>
  );
}

/* ── Finance applications ── */
export function FinanceApplications() {
  const t = useTranslations("account.finance");
  const tFin = useTranslations("financeApply");
  const locale = useLocale();
  const f = useFormat();
  const { data, refs } = useAccount();
  return (
    <div>
      <SectionHeader title={t("title")} lead={t("lead")} action={<ButtonLink href="/finance/apply">{t("apply")}</ButtonLink>} />
      {data.financeApplications.length ? (
        <div className="flex flex-col gap-4">
          {data.financeApplications.map((a) => (
            <RecordCard
              key={a.reference}
              title={a.vehicle ? vehicleFullName(a.vehicle, locale) : tFin("fields.customVehicle")}
              meta={a.reference}
              badge={<StatusBadge tone={TONES.finance[a.status]}>{tFin(`status.${a.status}`)}</StatusBadge>}
              actions={
                <ButtonLink href={`/finance/status?ref=${a.reference}`} size="sm" variant="outline">
                  {t("track")}
                </ButtonLink>
              }
            >
              <Field label={t("financed")} value={f.bdt(a.vehiclePrice - a.downPayment)} />
              <Field label={t("tenure")} value={f.unit("months", a.tenureMonths, 0)} />
              <Field
                label={t("type")}
                value={`${tFin(`financeTypes.${a.financeType}.label`)}${a.partnerId ? ` · ${refs.partners.find((p) => p.id === a.partnerId)?.name[locale] ?? ""}` : ""}`}
              />
            </RecordCard>
          ))}
        </div>
      ) : (
        <EmptyState title={t("empty")} action={<ButtonLink href="/finance/apply">{t("apply")}</ButtonLink>} />
      )}
      <p className="mt-4 text-xs text-muted">{t("note")}</p>
    </div>
  );
}

/* ── EMI schedule ── */
export function EmiSchedule() {
  const t = useTranslations("account.emi");
  const tFin = useTranslations("financeApply");
  const locale = useLocale();
  const f = useFormat();
  const { data, refs } = useAccount();
  const s = data.emiSchedule;
  const paid = s.payments.filter((p) => p.status === "paid");
  const due = s.payments.find((p) => p.status === "due" || p.status === "overdue");
  const paidTotal = paid.reduce((n, p) => n + p.amount, 0);
  const remaining = s.payments.reduce((n, p) => n + p.amount, 0) - paidTotal;
  const years = [...new Set(s.payments.map((p) => p.dueDate.slice(0, 4)))];
  const partner = refs.partners.find((p) => p.id === s.partnerId)?.name[locale];

  return (
    <div>
      <SectionHeader title={t("title")} lead={t("lead")} />
      <div className="grid gap-5 lg:grid-cols-5">
        <section className="on-dark flex flex-col gap-4 rounded-card bg-graphite p-6 text-on-dark lg:col-span-2" aria-live="polite">
          <p className="eyebrow text-accent-2">{t("nextDue")}</p>
          {due ? (
            <>
              <p className="text-4xl font-light tabular">{f.bdt(due.amount)}</p>
              <p className="text-sm text-muted-on-dark">{t("dueOn", { date: f.date(due.dueDate, "weekday"), n: f.number(due.installment) })}</p>
            </>
          ) : (
            <p className="text-sm text-muted-on-dark">{t("allPaid")}</p>
          )}
          <div className="mt-auto">
            <div className="h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={s.payments.length} aria-valuenow={paid.length} aria-label={t("progress", { paid: f.number(paid.length), total: f.number(s.payments.length) })}>
              <div className="h-full rounded-full bg-accent-2" style={{ width: `${(paid.length / s.payments.length) * 100}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-on-dark">{t("progress", { paid: f.number(paid.length), total: f.number(s.payments.length) })}</p>
          </div>
        </section>
        <section className="rounded-card border border-line bg-bg-alt p-6 lg:col-span-3">
          <h2 className="font-medium">{s.vehicleLabel}</h2>
          <p className="mt-0.5 text-xs text-muted tabular">{s.loanReference}</p>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <Field label={t("monthly")} value={f.bdt(s.monthlyPayment)} />
            <Field label={t("principal")} value={f.bdt(s.principal)} />
            <Field label={t("rate")} value={`${f.number(s.annualRate, { maximumFractionDigits: 2 })}%`} />
            <Field label={t("tenure")} value={f.unit("months", s.tenureMonths, 0)} />
            <Field label={t("paidSoFar")} value={f.bdt(paidTotal)} />
            <Field label={t("remaining")} value={f.bdt(remaining)} />
            <Field label={t("partner")} value={`${tFin(`financeTypes.${s.financeType}.label`)}${partner ? ` · ${partner}` : ""}`} />
          </dl>
        </section>
      </div>

      <section aria-labelledby="schedule" className="mt-8">
        <h2 id="schedule" className="text-lg font-medium">
          {t("schedule")}
        </h2>
        <div className="mt-4 divide-y divide-line rounded-card border border-line bg-bg-alt">
          {years.map((y) => {
            const rows = s.payments.filter((p) => p.dueDate.startsWith(y));
            const open = rows.some((p) => p.status === "due" || p.status === "overdue");
            return (
              <details key={y} open={open} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                  <span className="font-medium tabular">{f.number(Number(y), { useGrouping: false })}</span>
                  <span className="flex items-center gap-3 text-sm text-muted">
                    {t("yearSummary", { paid: f.number(rows.filter((p) => p.status === "paid").length), total: f.number(rows.length) })}
                    <ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" />
                  </span>
                </summary>
                <div className="overflow-x-auto px-5 pb-4">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs text-muted">
                      <tr>
                        <th scope="col" className="py-2 font-medium">{t("instalment")}</th>
                        <th scope="col" className="py-2 font-medium">{t("dueDate")}</th>
                        <th scope="col" className="py-2 text-right font-medium">{t("amount")}</th>
                        <th scope="col" className="py-2 text-right font-medium">{t("statusCol")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {rows.map((p) => (
                        <tr key={p.installment}>
                          <td className="py-2 tabular">{f.number(p.installment)}</td>
                          <td className="py-2">{f.date(p.dueDate, "medium")}</td>
                          <td className="py-2 text-right tabular">{f.bdt(p.amount)}</td>
                          <td className="py-2 text-right">
                            <StatusBadge tone={TONES.emi[p.status]}>{t(`status.${p.status}`)}</StatusBadge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            );
          })}
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">{t("note")}</p>
          <WhatsAppButton size="sm" tone="outline" context={{ kind: "emiInquiry", reference: s.loanReference }} />
        </div>
      </section>
    </div>
  );
}

/* ── Service bookings and history ── */
export function ServiceRecords() {
  const t = useTranslations("account.service");
  const tTrack = useTranslations("serviceTrack");
  const locale = useLocale();
  const f = useFormat();
  const { data, refs } = useAccount();
  const pkgNames = (ids: string[]) => ids.flatMap((id) => refs.packages.filter((p) => p.id === id).map((p) => p.name[locale])).join(", ");
  const centre = (id: string) => refs.showrooms.find((s) => s.id === id)?.name[locale] ?? "—";

  return (
    <div className="flex flex-col gap-10">
      <section>
        <SectionHeader title={t("title")} lead={t("lead")} action={<ButtonLink href="/service/book">{t("book")}</ButtonLink>} />
        {data.serviceBookings.length ? (
          <div className="flex flex-col gap-4">
            {data.serviceBookings.map((b) => (
              <RecordCard
                key={b.reference}
                title={`${b.vehicle.brand} ${b.vehicle.model}`}
                meta={`${b.reference} · ${b.vehicle.registrationNo}`}
                badge={<StatusBadge tone={TONES.service[b.status]}>{tTrack(`status.${b.status}`)}</StatusBadge>}
                actions={
                  <ButtonLink href={`/service/track?ref=${b.reference}`} size="sm" variant="outline">
                    {t("track")}
                  </ButtonLink>
                }
              >
                <Field label={t("when")} value={`${f.date(b.date, "medium")}, ${f.time(b.slot)}`} />
                <Field label={t("centre")} value={centre(b.showroomId)} />
                <Field label={t("packages")} value={pkgNames(b.packageIds)} />
              </RecordCard>
            ))}
          </div>
        ) : (
          <EmptyState title={t("empty")} action={<ButtonLink href="/service/book">{t("book")}</ButtonLink>} />
        )}
      </section>

      <section aria-labelledby="history">
        <h2 id="history" className="text-xl font-medium">
          {t("historyTitle")}
        </h2>
        <p className="mt-1 text-sm text-muted">{t("historyLead")}</p>
        <div className="mt-4 overflow-x-auto rounded-card border border-line">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-bg-alt text-xs text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">{t("date")}</th>
                <th scope="col" className="px-4 py-3 font-medium">{t("vehicle")}</th>
                <th scope="col" className="px-4 py-3 font-medium">{t("work")}</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">{t("odometer")}</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">{t("amount")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.serviceHistory.map((h) => (
                <tr key={h.id} className="align-top">
                  <td className="px-4 py-3 whitespace-nowrap">{f.date(h.date, "medium")}</td>
                  <td className="px-4 py-3">{data.ownedVehicles.find((v) => v.id === h.ownedVehicleId)?.label ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{pkgNames(h.packageIds)}</span>
                    <span className="block text-xs text-muted">{h.summary[locale]} · {centre(h.showroomId)}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular">{f.unit("km", h.odometerKm, 0)}</td>
                  <td className="px-4 py-3 text-right tabular">{f.bdt(h.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
