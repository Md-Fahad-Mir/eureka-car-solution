import type { useTranslations } from "next-intl";
import type { Format } from "@/lib/format/useFormat";

/** "5 hr 24 min" / "46 min", localised (hours as a decimal). */
export function formatDuration(hours: number, f: Format, t: ReturnType<typeof useTranslations<"ev">>) {
  const total = Math.round(hours * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? t("duration.hm", { h: f.number(h), m: f.number(m) }) : t("duration.m", { m: f.number(m) });
}
