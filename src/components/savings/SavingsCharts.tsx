"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_AXIS_TEXT, CHART_GRID, CHART_PAIR, CHART_SURFACE } from "@/lib/chartColors";
import { useFormat } from "@/lib/format/useFormat";

export type ChartOption = {
  id: string;
  label: string;
  /** Short axis label (model only), so category ticks never collide. */
  tickLabel: string;
  color: string;
  annualEnergy: number;
  annualMaintenance: number;
  cumulative: number[];
};

const tooltipStyle = { borderRadius: 12, border: "1px solid rgba(22,26,22,0.12)", fontSize: 12, background: CHART_SURFACE };
const tick = { fill: CHART_AXIS_TEXT, fontSize: 12 };
/** Legend text stays in the text colour; the swatch carries series identity. */
const legendText = (value: string) => <span style={{ color: CHART_AXIS_TEXT }}>{value}</span>;

/**
 * Annual cost breakdown (stacked columns) and cumulative cost over the
 * ownership period (lines). Numbers are also in the results table, which is
 * the accessible table view for both charts.
 */
export default function SavingsCharts({ options, includePurchase }: { options: ChartOption[]; includePurchase: boolean }) {
  const t = useTranslations("savings.charts");
  const f = useFormat();
  const years = options[0]?.cumulative.length ?? 0;

  const barData = options.map((o) => ({ name: o.tickLabel, energy: o.annualEnergy, maintenance: o.annualMaintenance }));
  const lineData = Array.from({ length: years }, (_, y) => ({
    year: y,
    ...Object.fromEntries(options.map((o) => [o.id, o.cumulative[y]])),
  }));
  const money = (v: number) => f.bdtCompact(v);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <figure className="rounded-card border border-line bg-bg-alt p-5">
        <figcaption>
          <p className="text-sm font-medium">{t("annualTitle")}</p>
          <p className="mt-0.5 text-xs text-muted">{t("annualLead")}</p>
        </figcaption>
        <div className="mt-4 h-72" role="img" aria-label={t("annualAria")}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }} barSize={24}>
              <CartesianGrid vertical={false} stroke={CHART_GRID} />
              <XAxis dataKey="name" tick={tick} tickLine={false} axisLine={{ stroke: CHART_GRID }} interval={0} />
              <YAxis tickFormatter={money} tick={tick} tickLine={false} axisLine={false} width={72} />
              <Tooltip formatter={(v, name) => [f.bdt(Number(v)), name]} contentStyle={tooltipStyle} cursor={{ fill: "rgba(22,26,22,0.04)" }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} formatter={legendText} />
              <Bar dataKey="energy" name={t("energy")} stackId="cost" fill={CHART_PAIR.primary} stroke={CHART_SURFACE} strokeWidth={2} isAnimationActive={false} />
              <Bar
                dataKey="maintenance"
                name={t("maintenance")}
                stackId="cost"
                fill={CHART_PAIR.secondary}
                stroke={CHART_SURFACE}
                strokeWidth={2}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </figure>

      <figure className="rounded-card border border-line bg-bg-alt p-5">
        <figcaption>
          <p className="text-sm font-medium">{t("cumulativeTitle")}</p>
          <p className="mt-0.5 text-xs text-muted">{includePurchase ? t("cumulativeLeadPurchase") : t("cumulativeLead")}</p>
        </figcaption>
        <div className="mt-4 h-72" role="img" aria-label={t("cumulativeAria")}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
              <CartesianGrid vertical={false} stroke={CHART_GRID} />
              <XAxis
                dataKey="year"
                tickFormatter={(y: number) => t("yearTick", { n: f.number(y) })}
                tick={tick}
                tickLine={false}
                axisLine={{ stroke: CHART_GRID }}
              />
              <YAxis tickFormatter={money} tick={tick} tickLine={false} axisLine={false} width={72} />
              <Tooltip
                formatter={(v, name) => [f.bdt(Number(v)), name]}
                labelFormatter={(y) => t("afterYears", { n: f.number(Number(y)) })}
                contentStyle={tooltipStyle}
              />
              <Legend iconType="plainline" iconSize={14} wrapperStyle={{ fontSize: 12 }} formatter={legendText} />
              {options.map((o) => (
                <Line
                  key={o.id}
                  type="linear"
                  dataKey={o.id}
                  name={o.label}
                  stroke={o.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  dot={{ r: 4, fill: o.color, stroke: CHART_SURFACE, strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: o.color, stroke: CHART_SURFACE, strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </figure>
    </div>
  );
}
