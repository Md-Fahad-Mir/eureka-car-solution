import { financeConfig } from "@/config/finance";
import type { AmortizationRow } from "@/types";

/**
 * Reducing-balance EMI maths. Everything here is unrounded; round only when
 * formatting for display, so totals and schedules always reconcile.
 *
 *   EMI = P · r · (1 + r)^n / ((1 + r)^n − 1),   r = annual rate / 12 / 100
 *
 * With r = 0 the EMI is simply P / n. The same formula gives the monthly
 * rental for the illustrative Islamic (HPSM / Ijarah) view, where the rate is
 * a profit rate; real Islamic structures differ by institution.
 */

function assertValid(principal: number, annualRatePct: number, months: number) {
  if (!Number.isFinite(principal) || principal < 0) throw new RangeError("principal must be ≥ 0");
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) throw new RangeError("rate must be ≥ 0");
  if (!Number.isInteger(months) || months < 1) throw new RangeError("months must be a positive integer");
}

/** Monthly rate as a fraction, e.g. 12% → 0.01. */
export const monthlyRate = (annualRatePct: number) => annualRatePct / 12 / 100;

/** Monthly instalment for a reducing-balance loan. */
export function calculateEmi(principal: number, annualRatePct: number, months: number): number {
  assertValid(principal, annualRatePct, months);
  if (principal === 0) return 0;
  const r = monthlyRate(annualRatePct);
  if (r === 0) return principal / months;
  const growth = (1 + r) ** months;
  return (principal * r * growth) / (growth - 1);
}

export type LoanInput = {
  /** Vehicle price (BDT). */
  price: number;
  /** Down payment (BDT). Clamped to [0, price]. */
  downPayment: number;
  annualRatePct: number;
  months: number;
};

export type LoanSummary = {
  price: number;
  downPayment: number;
  principal: number;
  monthlyPayment: number;
  totalInterest: number;
  /** Sum of all instalments (excludes the down payment). */
  totalOfPayments: number;
  /** Down payment + all instalments. */
  totalCost: number;
};

export function summarizeLoan({ price, downPayment, annualRatePct, months }: LoanInput): LoanSummary {
  const dp = Math.min(Math.max(downPayment, 0), Math.max(price, 0));
  const principal = Math.max(price - dp, 0);
  const monthlyPayment = calculateEmi(principal, annualRatePct, months);
  const totalOfPayments = monthlyPayment * months;
  return {
    price,
    downPayment: dp,
    principal,
    monthlyPayment,
    totalInterest: totalOfPayments - principal,
    totalOfPayments,
    totalCost: dp + totalOfPayments,
  };
}

/** Converts a down-payment percentage to an amount, and back. */
export const downPaymentFromPercent = (price: number, percent: number) => (price * percent) / 100;
export const downPaymentPercent = (price: number, amount: number) => (price > 0 ? (amount / price) * 100 : 0);

/**
 * Month-by-month schedule. The final row absorbs floating-point residue so
 * the closing balance is exactly 0 and principal portions sum to the loan.
 */
export function amortizationSchedule(principal: number, annualRatePct: number, months: number): AmortizationRow[] {
  const payment = calculateEmi(principal, annualRatePct, months);
  const r = monthlyRate(annualRatePct);
  const rows: AmortizationRow[] = [];
  let balance = principal;
  for (let month = 1; month <= months; month++) {
    const interest = balance * r;
    const isLast = month === months;
    const principalPart = isLast ? balance : payment - interest;
    const closing = isLast ? 0 : balance - principalPart;
    rows.push({
      month,
      opening: balance,
      payment: isLast ? principalPart + interest : payment,
      interest,
      principal: principalPart,
      closing,
    });
    balance = closing;
  }
  return rows;
}

export type YearTotals = { year: number; payment: number; interest: number; principal: number; closing: number };

/** Groups a schedule into loan years (months 1–12 = year 1, …). */
export function yearlyTotals(schedule: AmortizationRow[]): YearTotals[] {
  const years: YearTotals[] = [];
  for (const row of schedule) {
    const year = Math.ceil(row.month / 12);
    let bucket = years[year - 1];
    if (!bucket) {
      bucket = { year, payment: 0, interest: 0, principal: 0, closing: row.closing };
      years.push(bucket);
    }
    bucket.payment += row.payment;
    bucket.interest += row.interest;
    bucket.principal += row.principal;
    bucket.closing = row.closing;
  }
  return years;
}

/** "EMI from" estimate for listings, using the configured default assumptions. */
export function emiFrom(price: number, assumptions = financeConfig.emiFrom): number {
  const downPayment = downPaymentFromPercent(price, assumptions.downPaymentPercent);
  return calculateEmi(price - downPayment, assumptions.annualRate, assumptions.tenureMonths);
}
