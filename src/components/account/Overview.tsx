"use client";

import { useState } from "react";
import { ArrowRight, Bell, CalendarClock, FileText, Wallet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { Link } from "@/i18n/navigation";
import { toDhakaDateKey } from "@/lib/format/date";
import { useFormat } from "@/lib/format/useFormat";
import { vehicleFullName } from "@/lib/vehicle";
import { useAccount } from "./AccountData";
import { StatusBadge, TONES } from "./parts";

/** Account overview: next booking, active applications, EMI due and notifications. */
export function Overview() {
  const t = useTranslations("account.overview");
  const tFin = useTranslations("financeApply");
  const tAcc = useTranslations("account");
  const locale = useLocale();
  const f = useFormat();
  const { data, refs } = useAccount();
  const [today] = useState(() => toDhakaDateKey(new Date()));

  const upcoming = [
    ...data.testDrives
      .filter((b) => (b.status === "requested" || b.status === "confirmed") && b.date >= today)
      .map((b) => ({
        key: b.reference,
        kind: t("testDrive"),
        what: b.vehicle ? vehicleFullName(b.vehicle, locale) : b.reference,
        where: refs.showrooms.find((s) => s.id === b.showroomId)?.name[locale] ?? "",
        date: b.date,
        slot: b.slot,
        href: "/account/test-drives",
      })),
    ...data.serviceBookings
      .filter((b) => b.status === "booked" && b.date >= today)
      .map((b) => ({
        key: b.reference,
        kind: t("service"),
        what: `${b.vehicle.brand} ${b.vehicle.model}`,
        where: refs.showrooms.find((s) => s.id === b.showroomId)?.name[locale] ?? "",
        date: b.date,
        slot: b.slot,
        href: "/account/service",
      })),
  ].sort((a, b) => `${a.date}${a.slot}`.localeCompare(`${b.date}${b.slot}`));
  const next = upcoming[0];

  const active = data.financeApplications.filter((a) => a.status !== "decision");
  const pay = data.emiSchedule.payments;
  const due = pay.find((p) => p.status === "due" || p.status === "overdue");
  const paid = pay.filter((p) => p.status === "paid").length;
  const unread = data.notifications.filter((n) => !n.read);
  const firstName = data.profile.name.split(" ")[0];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="eyebrow text-accent-ink">{tAcc("eyebrow")}</p>
        <h1 className="display-md mt-2">{t("greeting", { name: firstName })}</h1>
        <p className="mt-2 text-muted">{t("memberSince", { date: f.date(data.profile.memberSince, "long") })}</p>
      </header>
      <DemoNotice message={tAcc("demoNotice")} />

      <div className="grid gap-5 md:grid-cols-2">
        <Card icon={<CalendarClock aria-hidden className="size-5" />} title={t("nextBooking")} href={next?.href ?? "/test-drive"} linkLabel={next ? t("viewBookings") : t("bookTestDrive")}>
          {next ? (
            <>
              <p className="text-xs text-muted">{next.kind}</p>
              <p className="mt-1 font-medium">{next.what}</p>
              <p className="mt-1 text-sm">
                {f.date(next.date, "weekday")}, {f.time(next.slot)}
              </p>
              <p className="text-sm text-muted">{next.where}</p>
            </>
          ) : (
            <p className="text-sm text-muted">{t("noBooking")}</p>
          )}
        </Card>

        <Card icon={<FileText aria-hidden className="size-5" />} title={t("applications")} href="/account/finance" linkLabel={t("viewApplications")}>
          {active.length ? (
            <ul className="flex flex-col gap-2">
              {active.slice(0, 2).map((a) => (
                <li key={a.reference} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm">
                    <span className="font-medium">{a.vehicle ? vehicleFullName(a.vehicle, locale) : tFin("fields.customVehicle")}</span>
                    <span className="block text-xs text-muted tabular">{a.reference}</span>
                  </span>
                  <StatusBadge tone={TONES.finance[a.status]}>{tFin(`status.${a.status}`)}</StatusBadge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">{t("noApplications")}</p>
          )}
        </Card>

        <Card icon={<Wallet aria-hidden className="size-5" />} title={t("emiDue")} href="/account/emi" linkLabel={t("viewSchedule")}>
          {due ? (
            <>
              <p className="text-3xl font-light tabular">{f.bdt(due.amount)}</p>
              <p className="mt-1 text-sm">{t("dueOn", { date: f.date(due.dueDate, "long") })}</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink/[0.07]" aria-hidden>
                <div className="h-full rounded-full bg-success" style={{ width: `${(paid / pay.length) * 100}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-muted">{t("emiProgress", { paid: f.number(paid), total: f.number(pay.length) })}</p>
            </>
          ) : (
            <p className="text-sm text-muted">{t("noEmi")}</p>
          )}
        </Card>

        <Card icon={<Bell aria-hidden className="size-5" />} title={t("notifications", { count: unread.length })} href="/account/notifications" linkLabel={t("viewNotifications")}>
          {unread.length ? (
            <ul className="flex flex-col gap-2 text-sm">
              {unread.slice(0, 3).map((n) => (
                <li key={n.id} className="flex gap-2">
                  <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                  {n.title[locale]}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">{t("allRead")}</p>
          )}
        </Card>
      </div>

      <section aria-labelledby="quick" className="flex flex-col gap-3">
        <h2 id="quick" className="text-sm font-medium text-muted">
          {t("quickActions")}
        </h2>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/service/book" variant="outline">{t("bookService")}</ButtonLink>
          <ButtonLink href="/test-drive" variant="outline">{t("bookTestDrive")}</ButtonLink>
          <ButtonLink href="/vehicles" variant="outline">{t("browse")}</ButtonLink>
        </div>
      </section>
    </div>
  );
}

function Card({ icon, title, href, linkLabel, children }: { icon: React.ReactNode; title: string; href: string; linkLabel: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col rounded-card border border-line bg-bg-alt p-5">
      <h2 className="flex items-center gap-2 text-sm font-medium text-muted">
        <span className="grid size-8 place-items-center rounded-full bg-ink/[0.05] text-ink">{icon}</span>
        {title}
      </h2>
      <div className="mt-4 flex-1">{children}</div>
      <Link href={href} className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-medium text-accent-ink underline-offset-4 hover:underline">
        {linkLabel}
        <ArrowRight aria-hidden className="size-4" />
      </Link>
    </section>
  );
}
