import { describe, expect, it } from "vitest";
import {
  addDaysToKey,
  addMonthsToKey,
  dateKeyToDate,
  dhakaMinutes,
  dhakaWeekday,
  formatDate,
  formatTime,
  timeKeyToMinutes,
  toDhakaDateKey,
} from "./date";

describe("Dhaka time helpers", () => {
  it("rolls over to the next calendar day in Dhaka (UTC+6)", () => {
    expect(toDhakaDateKey("2026-11-11T19:30:00Z")).toBe("2026-11-12");
    expect(toDhakaDateKey("2026-11-11T17:59:00Z")).toBe("2026-11-11");
  });

  it("converts keys to Dhaka midnight", () => {
    expect(dateKeyToDate("2026-11-13").toISOString()).toBe("2026-11-12T18:00:00.000Z");
  });

  it("adds days across month and year ends", () => {
    expect(addDaysToKey("2026-12-30", 3)).toBe("2027-01-02");
    expect(addDaysToKey("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("adds months with day clamping", () => {
    expect(addMonthsToKey("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonthsToKey("2028-01-31", 1)).toBe("2028-02-29");
    expect(addMonthsToKey("2026-11-10", 14)).toBe("2028-01-10");
    expect(addMonthsToKey("2026-11-10", -14)).toBe("2025-09-10");
  });

  it("gets the Dhaka weekday (13 Nov 2026 is a Friday)", () => {
    expect(dhakaWeekday("2026-11-13")).toBe("fri");
    expect(dhakaWeekday(new Date("2026-11-13T20:00:00Z"))).toBe("sat");
  });

  it("gets minutes since midnight in Dhaka", () => {
    expect(dhakaMinutes("2026-11-11T04:30:00Z")).toBe(10 * 60 + 30);
    expect(timeKeyToMinutes("19:00")).toBe(1140);
  });
});

describe("formatDate / formatTime", () => {
  it("formats in English day-month-year order", () => {
    expect(formatDate("2026-11-13", "en")).toBe("13 Nov 2026");
    expect(formatDate("2026-11-13", "en", "long")).toBe("13 November 2026");
  });

  it("formats with Bangla digits and month names", () => {
    const text = formatDate("2026-11-13", "bn", "long");
    expect(text).toContain("১৩");
    expect(text).toContain("নভেম্বর");
    expect(text).toContain("২০২৬");
    expect(text).not.toMatch(/[0-9]/);
  });

  it("formats time keys as Dhaka local time", () => {
    expect(formatTime("10:30", "en").toLowerCase()).toBe("10:30 am");
    expect(formatTime("15:00", "bn")).toMatch(/৩:০০/);
  });
});
