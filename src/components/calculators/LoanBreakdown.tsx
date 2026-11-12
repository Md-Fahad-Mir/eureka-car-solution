"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { amortizationSchedule, yearlyTotals } from "@/lib/calc/emi";
import { CHART_PAIR, CHART_SURFACE } from "@/lib/chartColors";
import { useFormat } from "@/lib/format/useFormat";
import { cn } from "@/lib/utils";
import type { FinanceType } from "@/types";
import { ScrollArea } from "@/components/ui/ScrollArea";

/**
 * Principal vs interest/profit donut and the full amortisation schedule
 * (year-by-year totals, each expandable to its months). Loaded lazily so
 * Recharts only ships to pages that show it.
 */
export default function LoanBreakdown({
  principal,
  rate,
  tenure,
  downPayment,
  financeType,
}: {
  principal: number;
  rate: number;
  tenure: number;
  downPayment: number;
  financeType: FinanceType;
}) {
  const t = useTranslations("emi");
  const f = useFormat();
  const [openYears, setOpenYears] = useState<number[]>([]);
  const islamic = financeType === "islamic";
  const schedule = amortizationSchedule(principal, rate, tenure);
  const years = yearlyTotals(schedule);
  const totalInterest = schedule.reduce((a, r) => a + r.interest, 0);
  const interestLabel = islamic ? t("islamic.profit") : t("interest");

  const slices = [
    { name: t("principal"), value: principal, color: CHART_PAIR.primary },
    { name: interestLabel, value: totalInterest, color: CHART_PAIR.secondary },
  ];
  const total = principal + totalInterest;
  const pct = (v: number) => f.number(total > 0 ? (v / total) * 100 : 0, { maximumFractionDigits: 1 });

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_1fr]">
      <figure className="rounded-card border border-line bg-bg-alt p-5">
        <figcaption className="text-sm font-medium">{t("breakdownTitle")}</figcaption>
        <div
          className="relative mx-auto mt-3 aspect-square w-full max-w-60"
          role="img"
          aria-label={t("breakdownAria", {
            principal: f.bdt(principal),
            interestLabel,
            interest: f.bdt(totalInterest),
          })}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                innerRadius="64%"
                outerRadius="96%"
                startAngle={90}
                endAngle={-270}
                stroke={CHART_SURFACE}
                strokeWidth={2}
                isAnimationActive={false}
              >
                {slices.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => f.bdt(Number(value))}
                contentStyle={{ borderRadius: 12, border: "1px solid rgba(22,26,22,0.12)", fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-muted">{t("totalRepayable")}</span>
            <span className="text-lg font-semibold tabular">{f.bdtCompact(total)}</span>
          </div>
        </div>
        <ul className="mt-4 flex flex-col gap-2 text-sm">
          {slices.map((s) => (
            <li key={s.name} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <span aria-hidden className="size-2.5 rounded-full" style={{ background: s.color }} />
                {s.name}
              </span>
              <span className="tabular">
                {f.bdt(s.value)} <span className="text-muted">({pct(s.value)}%)</span>
              </span>
            </li>
          ))}
          <li className="flex items-center justify-between gap-3 border-t border-line pt-2 text-muted">
            <span>{t("downPayment")}</span>
            <span className="tabular">{f.bdt(downPayment)}</span>
          </li>
        </ul>
      </figure>

      <div className="min-w-0">
        <h3 className="text-sm font-medium">{t("scheduleTitle")}</h3>
        <p className="mt-1 text-xs text-muted">{t("scheduleLead")}</p>
        <ScrollArea label={t("scheduleTitle")} className="mt-4 rounded-card border border-line bg-bg-alt">
          <table className="w-full min-w-[34rem] text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b border-line">
                <th scope="col" className="px-4 py-3 text-left font-medium">{t("year")}</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">{islamic ? t("islamic.rentalsPaid") : t("paid")}</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">{t("principal")}</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">{interestLabel}</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">{t("balance")}</th>
              </tr>
            </thead>
            {years.map((y) => {
              const open = openYears.includes(y.year);
              const months = open ? schedule.filter((r) => Math.ceil(r.month / 12) === y.year) : [];
              return (
                <tbody key={y.year} className="border-b border-line last:border-0">
                  <tr>
                    <th scope="row" className="px-2 py-1.5 text-left font-medium">
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpenYears((ys) => (open ? ys.filter((x) => x !== y.year) : [...ys, y.year]))}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-ink/[0.04]"
                      >
                        <ChevronDown aria-hidden className={cn("size-4 text-muted transition-transform", open && "rotate-180")} />
                        {t("yearN", { n: f.number(y.year) })}
                        <span className="sr-only">{t(open ? "hideMonths" : "showMonths")}</span>
                      </button>
                    </th>
                    <td className="px-4 py-3 text-right tabular">{f.bdt(y.payment)}</td>
                    <td className="px-4 py-3 text-right tabular">{f.bdt(y.principal)}</td>
                    <td className="px-4 py-3 text-right tabular">{f.bdt(y.interest)}</td>
                    <td className="px-4 py-3 text-right tabular">{f.bdt(y.closing)}</td>
                  </tr>
                  {months.map((m) => (
                    <tr key={m.month} className="text-xs text-muted">
                      <th scope="row" className="py-1.5 pr-2 pl-12 text-left font-normal">
                        {t("monthN", { n: f.number(m.month) })}
                      </th>
                      <td className="px-4 py-1.5 text-right tabular">{f.bdt(m.payment)}</td>
                      <td className="px-4 py-1.5 text-right tabular">{f.bdt(m.principal)}</td>
                      <td className="px-4 py-1.5 text-right tabular">{f.bdt(m.interest)}</td>
                      <td className="px-4 py-1.5 text-right tabular">{f.bdt(m.closing)}</td>
                    </tr>
                  ))}
                </tbody>
              );
            })}
          </table>
        </ScrollArea>
      </div>
    </div>
  );
}
