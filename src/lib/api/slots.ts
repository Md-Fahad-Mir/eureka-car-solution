import { dhakaMinutes, dhakaWeekday, timeKeyToMinutes, toDhakaDateKey } from "@/lib/format/date";
import type { DateKey, Showroom, TimeKey } from "@/types";

export type Slot = { time: TimeKey; available: boolean };
export type DaySlots = { date: DateKey; closed: boolean; slots: Slot[] };

/** Bookings open up to this many days ahead. */
export const BOOKING_HORIZON_DAYS = 30;
const SLOT_MINUTES = 30;
/** Last slot starts this long before closing. */
const LAST_SLOT_BEFORE_CLOSE = 60;
/** Same-day slots need this much notice. */
const MIN_NOTICE_MINUTES = 60;

/** FNV-1a hash, so mock availability is stable for a given showroom/date/slot. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const toTime = (minutes: number): TimeKey =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/**
 * Mock availability: 30-minute slots within opening hours, roughly one in
 * four already taken, none in the past or within an hour of now.
 * `salt` separates test-drive and service calendars.
 */
export function buildSlots(showroom: Showroom, date: DateKey, salt: string, now: Date = new Date()): DaySlots {
  const hours = showroom.hours[dhakaWeekday(date)];
  if (!hours) return { date, closed: true, slots: [] };

  const today = toDhakaDateKey(now);
  const nowMinutes = dhakaMinutes(now);
  const slots: Slot[] = [];
  for (let m = timeKeyToMinutes(hours.open); m <= timeKeyToMinutes(hours.close) - LAST_SLOT_BEFORE_CLOSE; m += SLOT_MINUTES) {
    const time = toTime(m);
    const past = date < today || (date === today && m < nowMinutes + MIN_NOTICE_MINUTES);
    const taken = hash(`${salt}|${showroom.id}|${date}|${time}`) % 4 === 0;
    slots.push({ time, available: !past && !taken });
  }
  return { date, closed: false, slots };
}

export function isSlotAvailable(showroom: Showroom, date: DateKey, time: TimeKey, salt: string, now?: Date): boolean {
  return buildSlots(showroom, date, salt, now).slots.some((s) => s.time === time && s.available);
}
