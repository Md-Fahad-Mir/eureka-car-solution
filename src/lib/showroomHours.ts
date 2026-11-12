import { dhakaMinutes, dhakaWeekday, timeKeyToMinutes } from "@/lib/format/date";
import { WEEKDAYS, type DateKey, type OpeningHours, type TimeKey, type Weekday } from "@/types";

type WeekHours = Record<Weekday, OpeningHours>;

export type OpenStatus =
  | { open: true; closesAt: TimeKey }
  | { open: false; next: { day: Weekday; time: TimeKey; when: "today" | "tomorrow" | "later" } | null };

/** Open/closed right now in Asia/Dhaka, with the closing time or the next opening. */
export function openStatus(hours: WeekHours, now: Date): OpenStatus {
  const day = dhakaWeekday(now);
  const minutes = dhakaMinutes(now);
  const today = hours[day];
  if (today && minutes >= timeKeyToMinutes(today.open) && minutes < timeKeyToMinutes(today.close)) {
    return { open: true, closesAt: today.close };
  }
  if (today && minutes < timeKeyToMinutes(today.open)) return { open: false, next: { day, time: today.open, when: "today" } };
  const start = WEEKDAYS.indexOf(day);
  for (let k = 1; k <= WEEKDAYS.length; k++) {
    const d = WEEKDAYS[(start + k) % WEEKDAYS.length];
    const h = hours[d];
    if (h) return { open: false, next: { day: d, time: h.open, when: k === 1 ? "tomorrow" : "later" } };
  }
  return { open: false, next: null };
}

/** Whether a showroom opens at all on a given Dhaka calendar day. */
export const isOpenOn = (hours: WeekHours, date: DateKey) => hours[dhakaWeekday(date)] !== null;
