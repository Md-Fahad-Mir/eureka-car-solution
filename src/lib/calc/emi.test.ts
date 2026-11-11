import { describe, expect, it } from "vitest";
import {
  amortizationSchedule,
  calculateEmi,
  downPaymentFromPercent,
  downPaymentPercent,
  emiFrom,
  summarizeLoan,
  yearlyTotals,
} from "./emi";

// Reference values computed independently (Python, same textbook formula).
describe("calculateEmi", () => {
  it.each([
    [1_000_000, 12, 12, 88_848.7887],
    [500_000, 10, 60, 10_623.5224],
    [2_800_000, 13, 60, 63_708.6045],
    [3_150_000, 12.5, 84, 56_451.901],
  ])("P=%i at %f%% for %i months → %f", (p, rate, n, expected) => {
    expect(calculateEmi(p, rate, n)).toBeCloseTo(expected, 3);
  });

  it("handles a zero rate as straight division", () => {
    expect(calculateEmi(100_000, 0, 10)).toBe(10_000);
    expect(calculateEmi(1_000_000, 0, 7)).toBeCloseTo(142_857.142857, 5);
  });

  it("returns 0 for a zero principal", () => {
    expect(calculateEmi(0, 12, 60)).toBe(0);
  });

  it("does not round internally", () => {
    expect(Number.isInteger(calculateEmi(1_000_000, 12, 12))).toBe(false);
  });

  it("rejects invalid input", () => {
    expect(() => calculateEmi(-1, 12, 12)).toThrow(RangeError);
    expect(() => calculateEmi(1000, -1, 12)).toThrow(RangeError);
    expect(() => calculateEmi(1000, 12, 0)).toThrow(RangeError);
    expect(() => calculateEmi(1000, 12, 12.5)).toThrow(RangeError);
    expect(() => calculateEmi(Number.NaN, 12, 12)).toThrow(RangeError);
  });
});

describe("summarizeLoan", () => {
  it("computes principal, totals and interest", () => {
    const s = summarizeLoan({ price: 4_000_000, downPayment: 1_200_000, annualRatePct: 13, months: 60 });
    expect(s.principal).toBe(2_800_000);
    expect(s.monthlyPayment).toBeCloseTo(63_708.6045, 3);
    expect(s.totalInterest).toBeCloseTo(1_022_516.2714, 2);
    expect(s.totalOfPayments).toBeCloseTo(2_800_000 + 1_022_516.2714, 2);
    expect(s.totalCost).toBeCloseTo(s.downPayment + s.totalOfPayments, 6);
  });

  it("clamps the down payment to [0, price]", () => {
    expect(summarizeLoan({ price: 1_000_000, downPayment: 2_000_000, annualRatePct: 12, months: 12 }).principal).toBe(0);
    expect(summarizeLoan({ price: 1_000_000, downPayment: -5, annualRatePct: 12, months: 12 }).principal).toBe(1_000_000);
  });

  it("has zero interest at a zero rate", () => {
    const s = summarizeLoan({ price: 1_200_000, downPayment: 0, annualRatePct: 0, months: 12 });
    expect(s.monthlyPayment).toBe(100_000);
    expect(s.totalInterest).toBe(0);
  });
});

describe("down payment helpers", () => {
  it("converts between percent and amount", () => {
    expect(downPaymentFromPercent(4_500_000, 30)).toBe(1_350_000);
    expect(downPaymentPercent(4_500_000, 1_350_000)).toBe(30);
    expect(downPaymentPercent(0, 100)).toBe(0);
  });
});

describe("amortizationSchedule", () => {
  const P = 2_800_000;
  const schedule = amortizationSchedule(P, 13, 60);

  it("has one row per month and ends at exactly zero", () => {
    expect(schedule).toHaveLength(60);
    expect(schedule.at(-1)!.closing).toBe(0);
  });

  it("principal portions sum to the loan amount", () => {
    const sum = schedule.reduce((acc, r) => acc + r.principal, 0);
    expect(sum).toBeCloseTo(P, 6);
  });

  it("interest portions sum to the total interest", () => {
    const interest = schedule.reduce((acc, r) => acc + r.interest, 0);
    expect(interest).toBeCloseTo(summarizeLoan({ price: P, downPayment: 0, annualRatePct: 13, months: 60 }).totalInterest, 4);
  });

  it("first month splits the instalment correctly", () => {
    const first = schedule[0];
    expect(first.interest).toBeCloseTo(P * (0.13 / 12), 6);
    expect(first.principal + first.interest).toBeCloseTo(63_708.6045, 3);
    expect(first.closing).toBeCloseTo(P - first.principal, 6);
  });

  it("each row's closing is the next row's opening, and balances fall monotonically", () => {
    for (let i = 1; i < schedule.length; i++) {
      expect(schedule[i].opening).toBe(schedule[i - 1].closing);
      expect(schedule[i].closing).toBeLessThan(schedule[i].opening);
    }
  });

  it("works at a zero rate", () => {
    const zero = amortizationSchedule(120_000, 0, 12);
    expect(zero.every((r) => r.interest === 0 && r.payment === 10_000)).toBe(true);
    expect(zero.at(-1)!.closing).toBe(0);
  });
});

describe("yearlyTotals", () => {
  it("groups months into years and reconciles with the schedule", () => {
    const schedule = amortizationSchedule(3_150_000, 12.5, 84);
    const years = yearlyTotals(schedule);
    expect(years).toHaveLength(7);
    expect(years.reduce((a, y) => a + y.principal, 0)).toBeCloseTo(3_150_000, 6);
    expect(years.at(-1)!.closing).toBe(0);
    expect(years[0].payment).toBeCloseTo(56_451.901 * 12, 2);
  });

  it("handles a partial final year", () => {
    const years = yearlyTotals(amortizationSchedule(1_000_000, 10, 18));
    expect(years.map((y) => y.year)).toEqual([1, 2]);
  });
});

describe("emiFrom", () => {
  it("uses the configured listing assumptions (30% down, 13%, 60 months)", () => {
    expect(emiFrom(4_500_000)).toBeCloseTo(71_672.1801, 3);
  });
});
