"use client";

import { useEffect, useState } from "react";
import { Bell, CalendarCheck, Check, Copy, FileText, Gift, Share2, User, Wrench } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button, ButtonLink, buttonVariants } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { WhatsAppIcon } from "@/components/whatsapp/WhatsAppButton";
import { Link } from "@/i18n/navigation";
import { markNotificationsRead } from "@/lib/api/account";
import { getVehiclesByIds } from "@/lib/api/vehicles";
import { useFormat } from "@/lib/format/useFormat";
import { absoluteUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { buildWhatsAppShareLink } from "@/lib/whatsapp";
import { useFavoritesStore } from "@/stores/favorites";
import { toast } from "@/stores/toast";
import type { NotificationKind, VehicleWithBrand } from "@/types";
import { useAccount } from "./AccountData";
import { SectionHeader, StatusBadge, TONES } from "./parts";

/* ── Saved vehicles (the favourites store; the heart on each card removes it) ── */
export function SavedVehicles() {
  const t = useTranslations("account.saved");
  const ids = useFavoritesStore((s) => s.ids);
  const key = ids.join(",");
  const [loaded, setLoaded] = useState<{ key: string; vehicles: VehicleWithBrand[] } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getVehiclesByIds(key ? key.split(",") : []).then((vehicles) => !cancelled && setLoaded({ key, vehicles }));
    return () => {
      cancelled = true;
    };
  }, [key]);

  // Keep showing the previous list while a removal re-fetches, minus anything no longer saved.
  const vehicles = loaded ? loaded.vehicles.filter((v) => ids.includes(v.id)) : null;
  return (
    <div>
      <SectionHeader title={t("title")} lead={t("lead")} />
      {vehicles === null ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-96 rounded-card" />
          ))}
        </div>
      ) : vehicles.length ? (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((v) => (
            <li key={v.id}>
              <VehicleCard vehicle={v} headingLevel={2} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={t("empty")} body={t("emptyBody")} action={<ButtonLink href="/vehicles">{t("browse")}</ButtonLink>} />
      )}
    </div>
  );
}

/* ── Referral programme ── */
export function Referrals() {
  const t = useTranslations("account.referrals");
  const locale = useLocale();
  const f = useFormat();
  const { data } = useAccount();
  const { code, items } = data.referral;
  const [copied, setCopied] = useState(false);
  const message = t("shareMessage", { code, url: absoluteUrl(locale, "/") });
  const earned = items.reduce((n, r) => n + (r.status === "purchased" ? (r.reward ?? 0) : 0), 0);
  const steps = ["share", "drive", "reward"] as const;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ tone: "error", title: t("copyFailed") });
    }
  };
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={t("title")} lead={t("lead")} />
      <section className="on-dark flex flex-col gap-5 rounded-card bg-graphite p-6 text-on-dark sm:p-8">
        <p className="eyebrow text-accent-2">{t("yourCode")}</p>
        <p className="text-3xl font-light tracking-wider tabular sm:text-4xl">{code}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button variant="light" onClick={copy} icon={copied ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />}>
            {copied ? t("copied") : t("copy")}
          </Button>
          <a
            href={buildWhatsAppShareLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "whatsapp" })}
          >
            <WhatsAppIcon />
            {t("shareWhatsApp")}
            <span className="sr-only">{t("newTab")}</span>
          </a>
          {canShare ? (
            <Button variant="outline-light" onClick={() => navigator.share({ text: message }).catch(() => undefined)} icon={<Share2 aria-hidden className="size-4" />}>
              {t("share")}
            </Button>
          ) : null}
        </div>
        <p role="status" className="sr-only">
          {copied ? t("copied") : ""}
        </p>
      </section>

      <ol className="grid gap-4 sm:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s} className="rounded-card border border-line bg-bg-alt p-5">
            <p className="text-sm text-muted tabular">{f.number(i + 1, { minimumIntegerDigits: 2 })}</p>
            <p className="mt-1 font-medium">{t(`steps.${s}.title`)}</p>
            <p className="mt-1 text-sm text-muted">{t(`steps.${s}.body`)}</p>
          </li>
        ))}
      </ol>

      <section aria-labelledby="ref-list">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="ref-list" className="text-xl font-medium">
            {t("listTitle")}
          </h2>
          <p className="text-sm text-muted">{t("earned", { amount: f.bdt(earned) })}</p>
        </div>
        <ul className="mt-4 divide-y divide-line rounded-card border border-line bg-bg-alt">
          {items.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <span>
                <span className="font-medium">{r.name}</span>
                <span className="block text-xs text-muted">{t("invited", { date: f.date(r.invitedAt, "medium") })}</span>
              </span>
              <span className="flex items-center gap-3">
                {r.reward && r.status === "purchased" ? <span className="text-sm tabular">{f.bdt(r.reward)}</span> : null}
                <StatusBadge tone={TONES.referral[r.status]}>{t(`status.${r.status}`)}</StatusBadge>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">{t("note")}</p>
      </section>
    </div>
  );
}

/* ── Notifications ── */
const KIND_ICON: Record<NotificationKind, typeof Bell> = {
  booking: CalendarCheck,
  finance: FileText,
  service: Wrench,
  offer: Gift,
  account: User,
};

export function Notifications() {
  const t = useTranslations("account.notifications");
  const locale = useLocale();
  const f = useFormat();
  const { data, update } = useAccount();
  const [busy, setBusy] = useState(false);
  const unread = data.notifications.filter((n) => !n.read);

  const markRead = async (ids: string[]) => {
    setBusy(true);
    try {
      await markNotificationsRead(ids);
      update((d) => ({ ...d, notifications: d.notifications.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)) }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <SectionHeader
        title={t("title")}
        lead={t("lead", { count: unread.length })}
        action={
          unread.length ? (
            <Button variant="outline" loading={busy} onClick={() => markRead(unread.map((n) => n.id))}>
              {t("markAll")}
            </Button>
          ) : null
        }
      />
      <ul className="flex flex-col gap-3" aria-live="polite">
        {data.notifications.map((n) => {
          const Icon = KIND_ICON[n.kind];
          return (
            <li key={n.id} className={cn("flex gap-4 rounded-card border p-5", n.read ? "border-line bg-bg" : "border-accent/40 bg-bg-alt")}>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink/[0.05]">
                <Icon aria-hidden className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {n.title[locale]}
                  {!n.read ? <StatusBadge tone="accent">{t("new")}</StatusBadge> : null}
                </p>
                <p className="mt-1 text-sm text-muted">{n.body[locale]}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                  <span className="text-xs text-muted">{f.dateTime(n.createdAt)}</span>
                  {n.href ? (
                    <Link href={n.href} onClick={() => !n.read && markRead([n.id])} className="font-medium text-accent-ink underline-offset-4 hover:underline">
                      {t("view")}
                    </Link>
                  ) : null}
                  {!n.read ? (
                    <button type="button" disabled={busy} onClick={() => markRead([n.id])} className="font-medium text-muted underline-offset-4 hover:text-ink hover:underline">
                      {t("markRead")}
                      <span className="sr-only">: {n.title[locale]}</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

