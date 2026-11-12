import { ArrowDown, ArrowRight, Check, Minus } from "lucide-react";
import { useTranslations } from "next-intl";
import { evConfig } from "@/config/ev";
import { chargingTime } from "@/lib/calc/chargingTime";
import { useFormat } from "@/lib/format/useFormat";
import { formatDuration } from "./duration";
import { cn } from "@/lib/utils";
import type { EvDiagram } from "@/types";
import { ScrollArea } from "@/components/ui/ScrollArea";

/**
 * Article diagrams, built as HTML/SVG with localised labels so they stay
 * sharp, translatable and readable by screen readers.
 */
export function Diagram({ diagram }: { diagram: EvDiagram }) {
  switch (diagram) {
    case "powertrainSpectrum":
      return <PowertrainSpectrum />;
    case "drivetrain":
      return <Drivetrain />;
    case "batteryPack":
      return <BatteryPack />;
    case "chargingLevels":
      return <ChargingLevels />;
    case "chargingCurve":
      return <ChargingCurve />;
  }
}

/* ── Petrol → EV: what each powertrain has ── */
function PowertrainSpectrum() {
  const t = useTranslations("ev.diagrams.spectrum");
  const cols = ["petrol", "hybrid", "phev", "ev"] as const;
  const battery = { petrol: "0", hybrid: "1", phev: "2", ev: "4" } as const;
  const has = {
    engine: { petrol: true, hybrid: true, phev: true, ev: false },
    plug: { petrol: false, hybrid: false, phev: true, ev: true },
    electricOnly: { petrol: "no", hybrid: "brief", phev: "short", ev: "always" },
  } as const;
  const Mark = ({ on, label }: { on: boolean; label: string }) =>
    on ? <Check aria-label={label} className="mx-auto size-5 text-success" /> : <Minus aria-label={label} className="mx-auto size-5 text-muted/60" />;

  return (
    <ScrollArea label={t("label")}>
      <table className="w-full min-w-[32rem] text-center text-sm">
        <thead>
          <tr>
            <td />
            {cols.map((c) => (
              <th key={c} scope="col" className={cn("px-2 pb-3 font-medium", c === "ev" && "text-ev")}>
                {t(`cols.${c}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          <tr>
            <th scope="row" className="py-3 pr-3 text-left font-normal text-muted">{t("rows.engine")}</th>
            {cols.map((c) => (
              <td key={c} className="py-3"><Mark on={has.engine[c]} label={has.engine[c] ? t("yes") : t("no")} /></td>
            ))}
          </tr>
          <tr>
            <th scope="row" className="py-3 pr-3 text-left font-normal text-muted">{t("rows.battery")}</th>
            {cols.map((c) => (
              <td key={c} className="py-3">
                <span className="sr-only">{t(`battery.${battery[c]}`)}</span>
                <span aria-hidden className="mx-auto flex h-3 w-20 overflow-hidden rounded-full bg-ink/[0.07]">
                  <span className="h-full rounded-full bg-ev" style={{ width: `${Number(battery[c]) * 25}%` }} />
                </span>
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row" className="py-3 pr-3 text-left font-normal text-muted">{t("rows.plug")}</th>
            {cols.map((c) => (
              <td key={c} className="py-3"><Mark on={has.plug[c]} label={has.plug[c] ? t("yes") : t("no")} /></td>
            ))}
          </tr>
          <tr>
            <th scope="row" className="py-3 pr-3 text-left font-normal text-muted">{t("rows.electricOnly")}</th>
            {cols.map((c) => (
              <td key={c} className="px-2 py-3">{t(`electricOnly.${has.electricOnly[c]}`)}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </ScrollArea>
  );
}

/* ── Charger → battery → inverter → motor → wheels ── */
function Drivetrain() {
  const t = useTranslations("ev.diagrams.drivetrain");
  const steps = ["charger", "obc", "battery", "inverter", "motor", "wheels"] as const;
  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
        {steps.map((s, i) => (
          <li key={s} className="flex flex-col items-center gap-2 md:flex-1 md:flex-row">
            <div
              className={cn(
                "w-full rounded-2xl border px-3 py-3 text-center",
                s === "battery" ? "border-ev bg-ev-soft" : "border-line-strong bg-bg",
              )}
            >
              <p className="text-sm font-medium">{t(`${s}.name`)}</p>
              <p className="mt-0.5 text-xs text-muted">{t(`${s}.note`)}</p>
            </div>
            {i < steps.length - 1 ? (
              <>
                <ArrowRight aria-hidden className="hidden size-4 shrink-0 text-muted md:block" />
                <ArrowDown aria-hidden className="size-4 text-muted md:hidden" />
              </>
            ) : null}
          </li>
        ))}
      </ol>
      <ul className="grid gap-2 text-sm sm:grid-cols-2">
        <li className="flex items-start gap-2 rounded-2xl border border-dashed border-line-strong px-4 py-3">
          <span aria-hidden className="mt-1.5 h-0.5 w-5 shrink-0 bg-ink" />
          {t("dcPath")}
        </li>
        <li className="flex items-start gap-2 rounded-2xl border border-dashed border-ev/50 px-4 py-3">
          <span aria-hidden className="mt-1.5 h-0.5 w-5 shrink-0 bg-ev" />
          {t("regenPath")}
        </li>
      </ul>
    </div>
  );
}

/* ── Cells → modules → pack ── */
function BatteryPack() {
  const t = useTranslations("ev.diagrams.pack");
  const cell = (key: string, x: number, y: number, w = 10, h = 22) => (
    <rect key={key} x={x} y={y} width={w} height={h} rx={2.5} fill="var(--ev)" fillOpacity={0.85} />
  );
  return (
    <div className="flex flex-col gap-4">
      <ol className="grid gap-4 sm:grid-cols-3">
        <li className="flex flex-col items-center gap-3 rounded-2xl border border-line-strong bg-bg p-4 text-center">
          <svg viewBox="0 0 40 40" aria-hidden className="h-16 w-16">
            {cell("c", 14, 6, 12, 28)}
          </svg>
          <p className="text-sm font-medium">{t("cell.name")}</p>
          <p className="text-xs text-muted">{t("cell.note")}</p>
        </li>
        <li className="flex flex-col items-center gap-3 rounded-2xl border border-line-strong bg-bg p-4 text-center">
          <svg viewBox="0 0 80 40" aria-hidden className="h-16 w-32">
            <rect x={2} y={4} width={76} height={32} rx={5} fill="none" stroke="var(--line-strong)" strokeWidth={1.5} />
            {Array.from({ length: 6 }, (_, i) => cell(`m${i}`, 8 + i * 11.5, 9))}
          </svg>
          <p className="text-sm font-medium">{t("module.name")}</p>
          <p className="text-xs text-muted">{t("module.note")}</p>
        </li>
        <li className="flex flex-col items-center gap-3 rounded-2xl border border-ev bg-ev-soft p-4 text-center">
          <svg viewBox="0 0 120 40" aria-hidden className="h-16 w-40">
            <rect x={2} y={2} width={116} height={36} rx={6} fill="none" stroke="var(--ev)" strokeWidth={1.5} />
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={i} x={8 + (i % 4) * 27} y={i < 4 ? 7 : 22} width={23} height={11} rx={2} fill="var(--ev)" fillOpacity={0.7} />
            ))}
          </svg>
          <p className="text-sm font-medium">{t("pack.name")}</p>
          <p className="text-xs text-muted">{t("pack.note")}</p>
        </li>
      </ol>
      <ul className="flex flex-wrap gap-2 text-xs">
        <li className="rounded-full border border-line-strong bg-bg px-3 py-1.5">{t("bms")}</li>
        <li className="rounded-full border border-line-strong bg-bg px-3 py-1.5">{t("cooling")}</li>
        <li className="rounded-full border border-line-strong bg-bg px-3 py-1.5">{t("casing")}</li>
      </ul>
    </div>
  );
}

/* ── How long each charger takes (computed with the explainer's model) ── */
function ChargingLevels() {
  const t = useTranslations("ev");
  const f = useFormat();
  const d = evConfig.levelsDiagram;
  const rows = evConfig.chargers.map((c) => ({
    ...c,
    hours: chargingTime({ batteryKwh: d.batteryKwh, chargerKw: c.kw, kind: c.kind, fromPct: d.fromPct, toPct: d.toPct, onboardAcKw: d.onboardAcKw }).hours,
  }));
  const max = Math.max(...rows.map((r) => r.hours));
  return (
    <div className="flex flex-col gap-3">
      <table className="w-full text-sm">
        <caption className="sr-only">{t("diagrams.levels.caption")}</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">{t("diagrams.levels.charger")}</th>
            <th scope="col">{t("diagrams.levels.time")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <th scope="row" className="w-2/5 py-2 pr-3 text-left align-middle font-normal">
                <span className="font-medium">{t(`chargers.${r.id}`)}</span>
                <span className="ml-1.5 text-xs text-muted">
                  {r.kind.toUpperCase()} · {f.unit("kW", r.kw)}
                </span>
              </th>
              <td className="py-2 align-middle">
                <div className="flex items-center gap-3">
                  <span aria-hidden className="h-2.5 rounded-full bg-accent" style={{ width: `${Math.max(2, (r.hours / max) * 70)}%` }} />
                  <span className="shrink-0 tabular">{formatDuration(r.hours, f, t)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-muted">
        {t("diagrams.levels.note", { kwh: f.number(d.batteryKwh), onboard: f.unit("kW", d.onboardAcKw) })}
      </p>
    </div>
  );
}

/* ── DC charging curve (simplified) ── */
function ChargingCurve() {
  const t = useTranslations("ev.diagrams.curve");
  const f = useFormat();
  const W = 600, H = 260, L = 56, R = 16, T = 20, B = 44;
  const x = (soc: number) => L + (soc / 100) * (W - L - R);
  const y = (p: number) => T + (1 - p / 100) * (H - T - B);
  // Ramp up, hold near full power, then taper above ~80%.
  const pts: [number, number][] = [[0, 70], [5, 100], [55, 100], [80, 88], [88, 55], [95, 34], [100, 22]];
  const d = pts.map(([s, p], i) => `${i ? "L" : "M"}${x(s).toFixed(1)} ${y(p).toFixed(1)}`).join(" ");
  const area = `${d} L${x(100)} ${y(0)} L${x(0)} ${y(0)} Z`;
  return (
    <figure className="flex flex-col gap-2">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("alt")} className="h-auto w-full">
        {[0, 50, 100].map((p) => (
          <g key={p}>
            <line x1={L} x2={W - R} y1={y(p)} y2={y(p)} stroke="var(--line)" />
            <text x={L - 10} y={y(p) + 4} textAnchor="end" fontSize="12" fill="var(--muted)">
              {f.number(p)}%
            </text>
          </g>
        ))}
        {[0, 20, 40, 60, 80, 100].map((s) => (
          <text key={s} x={x(s)} y={H - B + 20} textAnchor="middle" fontSize="12" fill="var(--muted)">
            {f.number(s)}%
          </text>
        ))}
        <rect x={x(80)} y={T} width={x(100) - x(80)} height={y(0) - T} fill="var(--accent)" fillOpacity={0.08} />
        <path d={area} fill="var(--ev)" fillOpacity={0.1} />
        <path d={d} fill="none" stroke="var(--ev)" strokeWidth={2.5} strokeLinejoin="round" />
        <line x1={x(80)} x2={x(80)} y1={T} y2={y(0)} stroke="var(--accent-ink)" strokeDasharray="4 4" />
        <text x={x(80) - 8} y={y(12)} textAnchor="end" fontSize="12" fill="var(--accent-ink)">
          {t("slows")}
        </text>
        <text x={(L + W - R) / 2} y={H - 6} textAnchor="middle" fontSize="12" fill="var(--ink)">
          {t("xAxis")}
        </text>
        <text x={14} y={(T + H - B) / 2} textAnchor="middle" fontSize="12" fill="var(--ink)" transform={`rotate(-90 14 ${(T + H - B) / 2})`}>
          {t("yAxis")}
        </text>
      </svg>
      <p className="text-xs text-muted">{t("note")}</p>
    </figure>
  );
}
