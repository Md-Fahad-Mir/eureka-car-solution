import { describe, expect, it } from "vitest";
import type { OpeningHours, Weekday } from "@/types";
import { isOpenOn, openStatus } from "./showroomHours";

const day = { open: "10:00", close: "19:00" } as const;
const hours: Record<Weekday, OpeningHours> = { sat: day, sun: day, mon: day, tue: day, wed: day, thu: day, fri: { open: "15:00", close: "19:00" } };
const closedFriday: Record<Weekday, OpeningHours> = { ...hours, fri: null };
// 2026-11-14 is a Saturday; 2026-11-13 is a Friday (Dhaka). Times below are Dhaka local (+06:00).
const at = (iso: string) => new Date(`${iso}+06:00`);

describe("openStatus (Asia/Dhaka)", () => {
  it("is open inside opening hours", () => {
    expect(openStatus(hours, at("2026-11-14T12:00:00"))).toEqual({ open: true, closesAt: "19:00" });
  });

  it("closes exactly at closing time", () => {
    expect(openStatus(hours, at("2026-11-14T19:00:00"))).toEqual({ open: false, next: { day: "sun", time: "10:00", when: "tomorrow" } });
  });

  it("reports a later opening the same day", () => {
    expect(openStatus(hours, at("2026-11-13T11:00:00"))).toEqual({ open: false, next: { day: "fri", time: "15:00", when: "today" } });
  });

  it("skips closed days", () => {
    expect(openStatus(closedFriday, at("2026-11-12T20:00:00"))).toEqual({ open: false, next: { day: "sat", time: "10:00", when: "later" } });
  });

  it("uses Dhaka time, not UTC", () => {
    // 04:30 UTC = 10:30 in Dhaka.
    expect(openStatus(hours, new Date("2026-11-14T04:30:00Z")).open).toBe(true);
  });

  it("knows which days a showroom opens", () => {
    expect(isOpenOn(closedFriday, "2026-11-13")).toBe(false);
    expect(isOpenOn(closedFriday, "2026-11-14")).toBe(true);
  });
});
