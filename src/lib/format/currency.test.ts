import { describe, expect, it } from "vitest";
import { formatBDT, formatBDTCompact } from "./currency";

describe("formatBDT", () => {
  it("uses lakh/crore grouping in English", () => {
    expect(formatBDT(4_500_000, "en")).toBe("৳45,00,000");
    expect(formatBDT(12_500_000, "en")).toBe("৳1,25,00,000");
    expect(formatBDT(95_000, "en")).toBe("৳95,000");
    expect(formatBDT(999, "en")).toBe("৳999");
    expect(formatBDT(0, "en")).toBe("৳0");
  });

  it("uses Bangla digits with the same grouping in Bangla", () => {
    expect(formatBDT(4_500_000, "bn")).toBe("৳৪৫,০০,০০০");
    expect(formatBDT(12_500_000, "bn")).toBe("৳১,২৫,০০,০০০");
  });

  it("rounds only at display time", () => {
    expect(formatBDT(63_708.6045, "en")).toBe("৳63,709");
    expect(formatBDT(63_708.6045, "en", { decimals: 2 })).toBe("৳63,708.60");
  });

  it("formats negatives with a true minus and never shows −৳0", () => {
    expect(formatBDT(-1_200, "en")).toBe("−৳1,200");
    expect(formatBDT(-0.2, "en")).toBe("৳0");
  });
});

describe("formatBDTCompact", () => {
  it("shows lakh and crore in English", () => {
    expect(formatBDTCompact(4_500_000, "en")).toBe("৳45 lakh");
    expect(formatBDTCompact(4_250_000, "en")).toBe("৳42.5 lakh");
    expect(formatBDTCompact(12_000_000, "en")).toBe("৳1.2 crore");
    expect(formatBDTCompact(24_000_000, "en")).toBe("৳2.4 crore");
    expect(formatBDTCompact(100_000, "en")).toBe("৳1 lakh");
  });

  it("shows লাখ and কোটি with Bangla digits in Bangla", () => {
    expect(formatBDTCompact(4_500_000, "bn")).toBe("৳৪৫ লাখ");
    expect(formatBDTCompact(12_000_000, "bn")).toBe("৳১.২ কোটি");
  });

  it("falls back to the full amount below one lakh", () => {
    expect(formatBDTCompact(95_000, "en")).toBe("৳95,000");
    expect(formatBDTCompact(95_000, "bn")).toBe("৳৯৫,০০০");
  });

  it("promotes to crore when rounding reaches 100 lakh", () => {
    expect(formatBDTCompact(9_999_999, "en")).toBe("৳1 crore");
  });

  it("limits decimals", () => {
    expect(formatBDTCompact(4_567_890, "en")).toBe("৳45.68 lakh");
    expect(formatBDTCompact(4_567_890, "en", { maxDecimals: 1 })).toBe("৳45.7 lakh");
  });
});
