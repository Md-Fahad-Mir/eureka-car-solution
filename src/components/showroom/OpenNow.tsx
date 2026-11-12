"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { useFormat } from "@/lib/format/useFormat";
import { openStatus } from "@/lib/showroomHours";
import type { OpeningHours, Weekday } from "@/types";

/** A clock that ticks once a minute on the client and is absent during server rendering. */
const subscribe = (onTick: () => void) => {
  const id = window.setInterval(onTick, 30_000);
  return () => window.clearInterval(id);
};
const minuteNow = () => Math.floor(Date.now() / 60_000);
const noClock = () => null;

/** "Open now · closes 7:00 pm" / "Closed · opens 10:00 am tomorrow", in Asia/Dhaka time. */
export function OpenNow({ hours }: { hours: Record<Weekday, OpeningHours> }) {
  const t = useTranslations("showroomCard");
  const tTax = useTranslations("taxonomy");
  const f = useFormat();
  const minute = useSyncExternalStore(subscribe, minuteNow, noClock);
  if (minute === null) return <span aria-hidden className="inline-block h-6 w-40 rounded-full bg-ink/[0.05]" />;

  const status = openStatus(hours, new Date(minute * 60_000));
  if (status.open) {
    return (
      <Badge tone="success">
        <span aria-hidden className="size-1.5 rounded-full bg-current" />
        {t("openNow", { time: f.time(status.closesAt) })}
      </Badge>
    );
  }
  const next = status.next;
  return (
    <Badge tone="neutral">
      {next
        ? t(`closedNow.${next.when}`, { time: f.time(next.time), day: tTax(`weekday.${next.day}`) })
        : t("closed")}
    </Badge>
  );
}
