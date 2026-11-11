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
import { SliderField } from "./SliderField";

type DownPaymentMode = "percent" | "amount";

/**
 * Reducing-balance EMI calculator. All maths comes from `lib/calc/emi`
 * (unrounded); values are rounded only for display.
 */
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
  const f = useFormat();
  const cfg = financeConfig;

  const [price, setPrice] = useState(initialPrice);
  const [mode, setMode] = useState<DownPaymentMode>("percent");
  const [dpPercent, setDpPercent] = useState<number>(cfg.downPayment.defaultPercent);
  const [tenure, setTenure] = useState<number>(cfg.tenure.default);
  const [rate, setRate] = useState<number>(cfg.conventional.defaultAnnualRate);

  const downPayment = downPaymentFromPercent(price, dpPercent);
  const loan = summarizeLoan({ price, downPayment, annualRatePct: rate, months: tenure });
  const maxPrice = Math.max(initialPrice * 2, 1_000_000);

  return (
    <div className="grid overflow-hidden rounded-card border border-line lg:grid-cols-[1.25fr_1fr]">
      <div className="flex flex-col gap-6 bg-bg-alt p-5 sm:p-7">
        <SliderField
          label={t("price")}
          value={price}
          min={100_000}
          max={maxPrice}
          step={50_000}
          onChange={setPrice}
          display={f.bdt(price)}
          inputWidth="w-36"
        />
        <SliderField
          label={t("downPayment")}
          aside={
            <Segmented
              label={t("downPaymentMode")}
              value={mode}
              onValueChange={setMode}
              options={[
                { value: "percent", label: "%" },
                { value: "amount", label: "৳" },
              ]}
            />
          }
          {...(mode === "percent"
            ? {
                value: dpPercent,
                min: cfg.downPayment.minPercent,
                max: cfg.downPayment.maxPercent,
                step: 1,
                onChange: setDpPercent,
                suffix: "%",
              }
            : {
                value: Math.round(downPayment),
                min: Math.round((price * cfg.downPayment.minPercent) / 100),
                max: Math.round((price * cfg.downPayment.maxPercent) / 100),
                step: 10_000,
                onChange: (amount: number) => setDpPercent(downPaymentPercent(price, amount)),
                inputWidth: "w-36",
              })}
          display={t("downPaymentDisplay", { amount: f.bdt(downPayment), percent: f.number(dpPercent, { maximumFractionDigits: 1 }) })}
        />
        <SliderField
          label={t("tenure")}
          value={tenure}
          min={cfg.tenure.min}
          max={cfg.tenure.max}
          step={cfg.tenure.step}
          onChange={(v) => setTenure(Math.round(v))}
          suffix={t("monthsShort")}
          display={t("tenureDisplay", { months: f.number(tenure), years: f.number(tenure / 12, { maximumFractionDigits: 1 }) })}
        />
        <SliderField
          label={t("rate")}
          value={rate}
          min={cfg.conventional.minRate}
          max={cfg.conventional.maxRate}
          step={0.25}
          onChange={setRate}
          suffix="%"
          display={t("rateDisplay", { rate: f.number(rate, { maximumFractionDigits: 2 }) })}
        />
      </div>

      <div className="on-dark flex flex-col gap-6 bg-graphite p-5 text-on-dark sm:p-7">
        <div aria-live="polite" aria-atomic>
          <p className="eyebrow text-accent-2">{t("monthly")}</p>
          <p className="mt-2 text-4xl font-light tracking-tight tabular sm:text-5xl">{f.bdt(loan.monthlyPayment)}</p>
          <p className="mt-1 text-sm text-muted-on-dark">{t("perMonthFor", { months: f.number(tenure) })}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-line-on-dark pt-5 text-sm">
          <Row label={t("loanAmount")} value={f.bdt(loan.principal)} />
          <Row label={t("totalInterest")} value={f.bdt(loan.totalInterest)} />
          <Row label={t("totalOfPayments")} value={f.bdt(loan.totalOfPayments)} />
          <Row label={t("totalCost")} value={f.bdt(loan.totalCost)} />
        </dl>
        <p className="text-xs leading-relaxed text-muted-on-dark">{t("disclaimer")}</p>
        <div className="mt-auto flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <WhatsAppButton
            className="flex-1"
            context={{
              kind: "emiInquiry",
              vehicle,
              emi: f.bdt(loan.monthlyPayment),
              tenureMonths: f.number(tenure),
              downPayment: f.bdt(downPayment),
            }}
          />
          <Link
            href={financeHref}
            className="group inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line-on-dark px-5 text-sm font-medium hover:border-on-dark"
          >
            {t("fullOptions")}
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
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
