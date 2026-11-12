"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import type { DaySlots } from "@/lib/api/slots";
import { addDaysToKey, toDhakaDateKey } from "@/lib/format/date";
import { useFormat } from "@/lib/format/useFormat";
import { isOpenOn } from "@/lib/showroomHours";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/stores/hydration";
import type { DateKey, OpeningHours, TimeKey, Weekday } from "@/types";

/** How many days ahead the picker offers (the API accepts up to 30). */
const DAYS_SHOWN = 14;

const chip =
  "relative flex cursor-pointer flex-col items-center rounded-2xl border border-line-strong bg-bg-alt px-3 py-2.5 text-center transition-colors hover:border-ink/50 " +
  "has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-bg-alt has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-ink " +
  "has-[:disabled]:cursor-not-allowed has-[:disabled]:border-dashed has-[:disabled]:text-muted has-[:disabled]:hover:border-line-strong";

/** Day chips for the next two weeks. Past days never appear; days the showroom is closed are disabled. */
export function DatePicker({
  name,
  hours,
  value,
  onChange,
  error,
}: {
  name: string;
  hours: Record<Weekday, OpeningHours>;
  value: DateKey | undefined;
  onChange: (date: DateKey) => void;
  error?: string;
}) {
  const t = useTranslations("booking");
  const f = useFormat();
  const hydrated = useHydrated();
  if (!hydrated) return <Skeleton className="h-20 rounded-2xl" />;

  const today = toDhakaDateKey(new Date());
  const days = Array.from({ length: DAYS_SHOWN }, (_, i) => addDaysToKey(today, i));
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="mb-3 text-sm font-medium">{t("dateLegend")}</legend>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {days.map((d, i) => {
          const open = isOpenOn(hours, d);
          return (
            <label key={d} className={chip}>
              <input
                type="radio"
                name={name}
                value={d}
                checked={value === d}
                disabled={!open}
                onChange={() => onChange(d)}
                className="sr-only"
              />
              <span className="text-xs opacity-75">{i === 0 ? t("today") : f.date(d, "weekdayShort")}</span>
              <span className="text-lg leading-tight font-medium tabular">{f.date(d, "day")}</span>
              <span className="text-xs opacity-75">{open ? f.date(d, "monthShort") : t("closed")}</span>
              <span className="sr-only">{f.date(d, "weekday")}</span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p id={`${name}-error`} className="mt-2 text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

type SlotState = { key: string; status: "loading" } | { key: string; status: "ready"; day: DaySlots } | { key: string; status: "error" };

/** Time slots for one showroom and day, loaded from the (mock) availability API. Taken slots are disabled. */
export function SlotPicker({
  name,
  showroomId,
  date,
  value,
  onChange,
  load,
  error,
}: {
  name: string;
  showroomId: string;
  date: DateKey;
  value: TimeKey | undefined;
  onChange: (slot: TimeKey) => void;
  load: (showroomId: string, date: DateKey) => Promise<DaySlots>;
  error?: string;
}) {
  const t = useTranslations("booking");
  const tCommon = useTranslations("common");
  const f = useFormat();
  const key = `${showroomId}|${date}`;
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<SlotState>({ key, status: "loading" });
  if (state.key !== key) setState({ key, status: "loading" });

  useEffect(() => {
    let cancelled = false;
    load(showroomId, date).then(
      (day) => !cancelled && setState({ key, status: "ready", day }),
      () => !cancelled && setState({ key, status: "error" }),
    );
    return () => {
      cancelled = true;
    };
  }, [key, showroomId, date, load, attempt]);

  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined} aria-busy={state.status === "loading"}>
      <legend className="mb-3 text-sm font-medium">{t("timeLegend", { date: f.date(date, "weekday") })}</legend>
      {state.status === "loading" ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton key={i} className="h-11 rounded-full" />
          ))}
          <span className="sr-only">{t("loadingSlots")}</span>
        </div>
      ) : state.status === "error" ? (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-bg p-4 text-sm">
          {t("slotsError")}
          <Button size="sm" variant="outline" onClick={() => setAttempt((a) => a + 1)}>
            {tCommon("retry")}
          </Button>
        </div>
      ) : state.day.closed ? (
        <p className="rounded-2xl border border-line bg-bg p-4 text-sm text-muted">{t("closedDay")}</p>
      ) : !state.day.slots.some((s) => s.available) ? (
        <p className="rounded-2xl border border-line bg-bg p-4 text-sm text-muted">{t("noSlots")}</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {state.day.slots.map((s) => (
            <label key={s.time} className={cn(chip, "rounded-full py-2.5")}>
              <input
                type="radio"
                name={name}
                value={s.time}
                checked={value === s.time}
                disabled={!s.available}
                onChange={() => onChange(s.time)}
                className="sr-only"
              />
              <span className={cn("text-sm font-medium tabular", !s.available && "line-through")}>{f.time(s.time)}</span>
              {!s.available ? <span className="sr-only">{t("unavailable")}</span> : null}
            </label>
          ))}
        </div>
      )}
      {error ? (
        <p id={`${name}-error`} className="mt-2 text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
