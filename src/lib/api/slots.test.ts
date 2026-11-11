import { describe, expect, it } from "vitest";
import { showrooms } from "@/data/mock/showrooms";
import { buildSlots } from "./slots";

const tejgaon = showrooms.find((s) => s.id === "tejgaon")!;
const chattogram = showrooms.find((s) => s.id === "chattogram")!;
// 11 Nov 2026, 10:00 in Dhaka (a Wednesday)
const now = new Date("2026-11-11T04:00:00Z");

describe("buildSlots", () => {
  it("is closed on days without opening hours (Chattogram on Friday)", () => {
    expect(buildSlots(chattogram, "2026-11-13", "test-drive", now)).toEqual({ date: "2026-11-13", closed: true, slots: [] });
  });

  it("offers 30-minute slots from opening until an hour before closing", () => {
    const day = buildSlots(tejgaon, "2026-11-12", "test-drive", now);
    expect(day.slots[0].time).toBe("10:00");
    expect(day.slots.at(-1)!.time).toBe("18:00");
    expect(day.slots).toHaveLength(17);
  });

  it("is deterministic and leaves some slots taken", () => {
    const a = buildSlots(tejgaon, "2026-11-12", "test-drive", now);
    const b = buildSlots(tejgaon, "2026-11-12", "test-drive", now);
    expect(a).toEqual(b);
    expect(a.slots.some((s) => !s.available)).toBe(true);
    expect(a.slots.some((s) => s.available)).toBe(true);
  });

  it("never offers past dates or same-day slots within an hour", () => {
    expect(buildSlots(tejgaon, "2026-11-10", "test-drive", now).slots.every((s) => !s.available)).toBe(true);
    const today = buildSlots(tejgaon, "2026-11-11", "test-drive", now);
    expect(today.slots.filter((s) => s.time <= "10:30").every((s) => !s.available)).toBe(true);
  });

  it("uses Friday hours where a showroom opens on Friday", () => {
    const fri = buildSlots(tejgaon, "2026-11-13", "test-drive", now);
    expect(fri.closed).toBe(false);
    expect(fri.slots[0].time).toBe("15:00");
  });
});
