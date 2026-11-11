"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Segmented } from "@/components/ui/Segmented";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { financeConfig } from "@/config/finance";
import { Link } from "@/i18n/navigation";
import { downPaymentFromPercent, downPaymentPercent, summarizeLoan } from "@/lib/calc/emi";
import { useFormat } from "@/lib/format/useFormat";
import type { WhatsAppVehicle } from "@/lib/whatsapp";
import type { FinanceType } from "@/types";
import { SliderField } from "./SliderField";

type DownPaymentMode = "percent" | "amount";

const defaultRate = (type: FinanceType) =>
  type === "islamic" ? financeConfig.islamic.defaultProfitRate : financeConfig.conventional.defaultAnnualRate;

/**
 * Loan state shared by the embedded calculator (vehicle pages) and the full
 * finance calculator. All maths comes from `lib/calc/emi` (unrounded); values
 * are rounded only for display.
 */
export function useLoanCalculator(initialPrice: number, initialType: FinanceType = "conventional") {
  const [price, setPriceState] = useState(initialPrice);
  const [mode, setMode] = useState<DownPaymentMode>("percent");
  const [dpPercent, setDpPercent] = useState<number>(financeConfig.downPayment.defaultPercent);
  const [tenure, setTenure] = useState<number>(financeConfig.tenure.default);
  const [financeType, setFinanceTypeState] = useState<FinanceType>(initialType);
  const [rate, setRate] = useState<number>(defaultRate(initialType));

  const downPayment = downPaymentFromPercent(price, dpPercent);
  const loan = summarizeLoan({ price, downPayment, annualRatePct: rate, months: tenure });

  return {
    price,
    setPrice: (value: number) => setPriceState(value),
    mode,
    setMode,
    dpPercent,
    setDpPercent,
    tenure,
    setTenure,
    rate,
    setRate,
    financeType,
    /** Switching conventional ↔ Islamic resets the rate to that type's sample default. */
    setFinanceType: (type: FinanceType) => {
      setFinanceTypeState(type);
      setRate(defaultRate(type));
    },
    downPayment,
    loan,
  };
}

export type LoanCalculator = ReturnType<typeof useLoanCalculator>;

/** Input panel: price, down payment (% or ৳), tenure, rate (or profit rate). */
export function EmiInputs({ calc, priceMax }: { calc: LoanCalculator; priceMax?: number }) {
  const t = useTranslations("emi");
  const f = useFormat();
  const cfg = financeConfig;
  const islamic = calc.financeType === "islamic";
  const maxPrice = priceMax ?? Math.max(calc.price * 2, 1_000_000);

  return (
    <div className="flex flex-col gap-6">
      <SliderField
        label={t("price")}
        value={calc.price}
        min={100_000}
        max={maxPrice}
        step={50_000}
        onChange={calc.setPrice}
        display={f.bdt(calc.price)}
        inputWidth="w-36"
      />
      <SliderField
        label={t("downPayment")}
        aside={
          <Segmented
            label={t("downPaymentMode")}
            value={calc.mode}
            onValueChange={calc.setMode}
            options={[
              { value: "percent", label: "%" },
              { value: "amount", label: "৳" },
            ]}
          />
        }
        {...(calc.mode === "percent"
          ? {
              value: calc.dpPercent,
              min: cfg.downPayment.minPercent,
              max: cfg.downPayment.maxPercent,
              step: 1,
              onChange: calc.setDpPercent,
              suffix: "%",
            }
          : {
              value: Math.round(calc.downPayment),
              min: Math.round((calc.price * cfg.downPayment.minPercent) / 100),
              max: Math.round((calc.price * cfg.downPayment.maxPercent) / 100),
              step: 10_000,
              onChange: (amount: number) => calc.setDpPercent(downPaymentPercent(calc.price, amount)),
              inputWidth: "w-36",
            })}
        display={t("downPaymentDisplay", {
          amount: f.bdt(calc.downPayment),
          percent: f.number(calc.dpPercent, { maximumFractionDigits: 1 }),
        })}
      />
      <SliderField
        label={t("tenure")}
        value={calc.tenure}
        min={cfg.tenure.min}
        max={cfg.tenure.max}
        step={cfg.tenure.step}
        onChange={(v) => calc.setTenure(Math.round(v))}
        suffix={t("monthsShort")}
        display={t("tenureDisplay", {
          months: f.number(calc.tenure),
          years: f.number(calc.tenure / 12, { maximumFractionDigits: 1 }),
        })}
      />
      <SliderField
        label={islamic ? t("islamic.rate") : t("rate")}
        value={calc.rate}
        min={cfg.conventional.minRate}
        max={cfg.conventional.maxRate}
        step={0.25}
        onChange={calc.setRate}
        suffix="%"
        display={
          islamic
            ? t("islamic.rateDisplay", { rate: f.number(calc.rate, { maximumFractionDigits: 2 }) })
            : t("rateDisplay", { rate: f.number(calc.rate, { maximumFractionDigits: 2 }) })
        }
      />
    </div>
  );
}

/** Results panel (dark): monthly EMI / rental, totals, disclaimer and next steps. */
export function EmiResults({
  calc,
  vehicle,
  actions,
}: {
  calc: LoanCalculator;
  vehicle?: WhatsAppVehicle;
  /** Extra action next to the WhatsApp button (e.g. "See all finance options"). */
  actions?: React.ReactNode;
}) {
  const t = useTranslations("emi");
  const f = useFormat();
  const islamic = calc.financeType === "islamic";
  const { loan } = calc;

  return (
    <div className="flex h-full flex-col gap-6">
      <div aria-live="polite" aria-atomic>
        <p className="eyebrow text-accent-2">{islamic ? t("islamic.monthly") : t("monthly")}</p>
        <p className="mt-2 text-4xl font-light tracking-tight tabular sm:text-5xl">{f.bdt(loan.monthlyPayment)}</p>
        <p className="mt-1 text-sm text-muted-on-dark">{t("perMonthFor", { months: f.number(calc.tenure) })}</p>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-line-on-dark pt-5 text-sm">
        <Row label={islamic ? t("islamic.financed") : t("loanAmount")} value={f.bdt(loan.principal)} />
        <Row label={islamic ? t("islamic.totalProfit") : t("totalInterest")} value={f.bdt(loan.totalInterest)} />
        <Row label={islamic ? t("islamic.totalRentals") : t("totalOfPayments")} value={f.bdt(loan.totalOfPayments)} />
        <Row label={t("totalCost")} value={f.bdt(loan.totalCost)} />
      </dl>
      <p className="text-xs leading-relaxed text-muted-on-dark">{islamic ? t("islamic.disclaimer") : t("disclaimer")}</p>
      <div className="mt-auto flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
        <WhatsAppButton
          className="flex-1"
          context={{
            kind: "emiInquiry",
            vehicle,
            emi: f.bdt(loan.monthlyPayment),
            tenureMonths: f.number(calc.tenure),
            downPayment: f.bdt(calc.downPayment),
          }}
        />
        {actions}
      </div>
    </div>
  );
}

/** Embedded calculator for vehicle pages: inputs + results side by side. */
export function EmiCalculator({
  initialPrice,
  vehicle,
  financeHref = "/finance",
}: {
  initialPrice: number;
  /** When set, the WhatsApp message names the vehicle. */
  vehicle?: WhatsAppVehicle;
  financeHref?: string;
}) {
  const t = useTranslations("emi");
  const calc = useLoanCalculator(initialPrice);
  return (
    <div className="grid overflow-hidden rounded-card border border-line lg:grid-cols-[1.25fr_1fr]">
      <div className="bg-bg-alt p-5 sm:p-7">
        <EmiInputs calc={calc} />
      </div>
      <div className="on-dark bg-graphite p-5 text-on-dark sm:p-7">
        <EmiResults
          calc={calc}
          vehicle={vehicle}
          actions={
            <Link
              href={financeHref}
              className="group inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line-on-dark px-5 text-sm font-medium hover:border-on-dark"
            >
              {t("fullOptions")}
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          }
        />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-on-dark">{label}</dt>
      <dd className="mt-0.5 font-medium tabular">{value}</dd>
    </div>
  );
}
