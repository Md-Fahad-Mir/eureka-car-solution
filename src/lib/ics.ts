import type { DateKey, TimeKey } from "@/types";

/**
 * Minimal iCalendar (RFC 5545) builder for "Add to calendar" downloads.
 * Booking times are Dhaka local time (UTC+06:00, no daylight saving) and are
 * written as UTC so every calendar app places them correctly.
 */

export type IcsEvent = {
  uid: string;
  date: DateKey;
  time: TimeKey;
  durationMinutes: number;
  title: string;
  description?: string;
  location?: string;
  geo?: { lat: number; lng: number };
  url?: string;
  /** When the record was created (ISO 8601), used as DTSTAMP. */
  stamp: string;
};

const utc = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Dhaka local date + time → `YYYYMMDDTHHMMSSZ`. */
export const dhakaToIcsUtc = (date: DateKey, time: TimeKey) => utc(new Date(`${date}T${time}:00+06:00`));

/** Escapes TEXT values: backslash, semicolon, comma and newlines. */
export const escapeIcsText = (text: string) =>
  text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

const encoder = new TextEncoder();

/** Folds a content line at 75 octets without splitting a UTF-8 character (Bangla is 3 octets per letter). */
export function foldIcsLine(line: string): string {
  if (encoder.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  let limit = 75;
  for (const ch of line) {
    const n = encoder.encode(ch).length;
    if (bytes + n > limit) {
      parts.push(current);
      current = "";
      bytes = 0;
      limit = 74; // continuation lines start with one space
    }
    current += ch;
    bytes += n;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

export function buildIcs(e: IcsEvent): string {
  const start = new Date(`${e.date}T${e.time}:00+06:00`);
  const end = new Date(start.getTime() + e.durationMinutes * 60_000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eureka Car Solution//Bookings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `DTSTAMP:${utc(new Date(e.stamp))}`,
    `DTSTART:${utc(start)}`,
    `DTEND:${utc(end)}`,
    `SUMMARY:${escapeIcsText(e.title)}`,
    e.description ? `DESCRIPTION:${escapeIcsText(e.description)}` : null,
    e.location ? `LOCATION:${escapeIcsText(e.location)}` : null,
    e.geo ? `GEO:${e.geo.lat};${e.geo.lng}` : null,
    e.url ? `URL:${e.url}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((l): l is string => l !== null);
  return `${lines.map(foldIcsLine).join("\r\n")}\r\n`;
}
