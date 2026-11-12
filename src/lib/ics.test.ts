import { describe, expect, it } from "vitest";
import { buildIcs, dhakaToIcsUtc, escapeIcsText, foldIcsLine } from "./ics";

const unfold = (text: string) => text.replace(/\r\n /g, "");
const octets = (s: string) => new TextEncoder().encode(s).length;

describe("ics", () => {
  it("converts Dhaka local time to UTC (UTC+6, no DST)", () => {
    expect(dhakaToIcsUtc("2026-11-15", "10:30")).toBe("20261115T043000Z");
    expect(dhakaToIcsUtc("2026-01-01", "03:00")).toBe("20251231T210000Z");
  });

  it("escapes text values", () => {
    expect(escapeIcsText("Plot 00, Road 1; Dhaka\nNote \\ end")).toBe("Plot 00\\, Road 1\\; Dhaka\\nNote \\\\ end");
  });

  it("folds long lines at 75 octets without breaking UTF-8 characters", () => {
    const line = `SUMMARY:${"টেস্ট ড্রাইভ ".repeat(12)}`;
    const folded = foldIcsLine(line);
    for (const part of folded.split("\r\n")) expect(octets(part)).toBeLessThanOrEqual(75);
    expect(unfold(folded)).toBe(line);
    expect(foldIcsLine("SHORT:ok")).toBe("SHORT:ok");
  });

  it("builds a calendar with start, end and escaped fields", () => {
    const ics = buildIcs({
      uid: "DEMO-TD-1234@eureka",
      date: "2026-11-15",
      time: "10:30",
      durationMinutes: 45,
      title: "Test drive, demo",
      location: "Tejgaon, Dhaka",
      geo: { lat: 23.76, lng: 90.39 },
      stamp: "2026-11-12T08:00:00.000Z",
    });
    const text = unfold(ics);
    expect(text).toContain("DTSTART:20261115T043000Z");
    expect(text).toContain("DTEND:20261115T051500Z");
    expect(text).toContain("DTSTAMP:20261112T080000Z");
    expect(text).toContain("SUMMARY:Test drive\\, demo");
    expect(text).toContain("GEO:23.76;90.39");
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
});
