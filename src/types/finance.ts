import type { DateKey, LocalizedText } from "./common";

export type FinanceType = "conventional" | "islamic";

export type FinancePartner = {
  id: string;
  /** Fictional institution name. Never a real bank. */
  name: LocalizedText;
  type: FinanceType;
  /** Islamic structures offered, e.g. HPSM / Ijarah. */
  structures?: ("hpsm" | "ijarah" | "murabaha")[];
  /** Illustrative annual interest (conventional) or profit (Islamic) rate range, in %. */
  rateRange: { min: number; max: number };
  maxTenureMonths: number;
  /** Illustrative maximum share of the price that can be financed, in %. */
  maxFinancePercent: number;
  processingFeePercent: number;
  highlights: LocalizedText[];
  isSample: true;
};

/** One row of a reducing-balance amortisation schedule (all amounts unrounded). */
export type AmortizationRow = {
  month: number;
  opening: number;
  payment: number;
  interest: number;
  principal: number;
  closing: number;
};

export type EmiPaymentStatus = "paid" | "due" | "upcoming" | "overdue";

/** A customer's running loan/finance schedule, as shown in the dashboard. */
export type EmiSchedule = {
  loanReference: string;
  vehicleLabel: string;
  partnerId: string;
  financeType: FinanceType;
  principal: number;
  annualRate: number;
  tenureMonths: number;
  startDate: DateKey;
  monthlyPayment: number;
  payments: { installment: number; dueDate: DateKey; amount: number; status: EmiPaymentStatus }[];
};
