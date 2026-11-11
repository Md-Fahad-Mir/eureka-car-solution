"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, CalendarCheck, Check, Link2, Minus, Plus, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { VehicleImage } from "@/components/media/VehicleImage";
import { buttonVariants } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { Select } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { costConfig } from "@/config/costs";
import { financeConfig } from "@/config/finance";
import { Link, useRouter } from "@/i18n/navigation";
import { getAllVehicles, getVehiclesByIds } from "@/lib/api/vehicles";
import { downPaymentFromPercent, summarizeLoan } from "@/lib/calc/emi";
import { onRoadEstimate } from "@/lib/calc/onRoad";
import { compareRunningCosts } from "@/lib/calc/runningCost";
import { useFormat, type Format } from "@/lib/format/useFormat";
import { absoluteUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { brandInitial, powerHp, vehicleFullName, vehicleName, vehiclePath } from "@/lib/vehicle";
import { MAX_COMPARE, useCompareStore } from "@/stores/compare";
import { useHydrated } from "@/stores/hydration";
import { toast } from "@/stores/toast";
import type { VehicleWithBrand } from "@/types";

type Cell = { text: string; num?: number } | null;
type Row = { id: string; label: string; cells: Cell[]; best?: "min" | "max" };
type Section = { id: string; title: string; rows: Row[] };

const parseIds = (raw: string | null) => [...new Set((raw ?? "").split(",").map((s) => s.trim()).filter(Boolean))].slice(0, MAX_COMPARE);

/**
 * Side-by-side comparison of 2–4 vehicles. `/compare?ids=a,b,c` is the
 * shareable source of truth; the compare store mirrors it.
 */
export function CompareView() {
  const t = useTranslations("compare");
  const tTax = useTranslations("taxonomy");
  const locale = useLocale();
  const f = useFormat();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useHydrated();
  const storeIds = useCompareStore((s) => s.ids);
  const setAll = useCompareStore((s) => s.setAll);

  const urlIds = parseIds(searchParams.get("ids"));
  const ids = urlIds.length ? urlIds : hydrated ? storeIds : [];
  const idsKey = ids.join(",");

  const [vehicles, setVehicles] = useState<VehicleWithBrand[] | null>(null);
  const [options, setOptions] = useState<VehicleWithBrand[]>([]);
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [downPercent, setDownPercent] = useState<number>(financeConfig.emiFrom.downPaymentPercent);
  const [tenure, setTenure] = useState<number>(financeConfig.emiFrom.tenureMonths);
  const [annualKm, setAnnualKm] = useState(15_000);

  const replaceIds = (next: string[]) => {
    setAll(next);
    router.replace(next.length ? `/compare?ids=${next.join(",")}` : "/compare", { scroll: false });
  };

  // Shared links adopt into this browser's compare list; otherwise the stored list fills the URL.
  useEffect(() => {
    if (!hydrated) return;
    if (urlIds.length) setAll(urlIds);
    else if (storeIds.length) router.replace(`/compare?ids=${storeIds.join(",")}`, { scroll: false });
    // Only on hydration: later changes go through replaceIds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    let cancelled = false;
    getVehiclesByIds(idsKey ? idsKey.split(",") : []).then((list) => !cancelled && setVehicles(list));
    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  useEffect(() => {
    getAllVehicles().then(setOptions);
  }, []);

  const sections = useMemo(
    () => (vehicles && vehicles.length ? buildSections(vehicles, { t, tTax, f, locale, downPercent, tenure, annualKm }) : []),
    [vehicles, t, tTax, f, locale, downPercent, tenure, annualKm],
  );

  const addOptions = options
    .filter((v) => !ids.includes(v.id))
    .map((v) => ({ value: v.id, label: vehicleFullName(v, locale), hint: `${f.number(v.year, { useGrouping: false })} · ${f.bdtCompact(v.price.amount)}` }));

  const adder =
    ids.length < MAX_COMPARE ? (
      <div className="w-full max-w-md">
        <label htmlFor="compare-add" className="mb-1.5 block text-sm font-medium">
          {t("add", { count: f.number(ids.length), max: f.number(MAX_COMPARE) })}
        </label>
        <Combobox
          id="compare-add"
          options={addOptions}
          value={null}
          onValueChange={(id) => replaceIds([...ids, id])}
          placeholder={t("addPlaceholder")}
          leading={<Plus aria-hidden className="size-4" />}
        />
      </div>
    ) : (
      <p className="text-sm text-muted">{t("full", { max: f.number(MAX_COMPARE) })}</p>
    );

  if (!hydrated || vehicles === null) {
    return (
      <div aria-busy className="flex flex-col gap-4">
        <Skeleton className="h-12 max-w-md rounded-xl" />
        <Skeleton className="h-96 rounded-card" />
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <EmptyState
          title={t("emptyTitle")}
          body={t("emptyBody")}
          action={
            <Link href="/vehicles" className={buttonVariants()}>
              {t("browse")}
            </Link>
          }
        />
        {adder}
      </div>
    );
  }

  const visible = sections.map((s) => ({
    ...s,
    rows: onlyDifferences ? s.rows.filter((r) => new Set(r.cells.map((c) => c?.text ?? "—")).size > 1) : s.rows,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        {adder}
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium">
            <input
              type="checkbox"
              role="switch"
              checked={onlyDifferences}
              onChange={(e) => setOnlyDifferences(e.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className="relative h-6 w-11 rounded-full bg-ink/20 transition-colors peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-ink after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-bg-alt after:transition-transform peer-checked:after:translate-x-5"
            />
            {t("highlightDifferences")}
          </label>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                toast({ tone: "success", title: t("linkCopied") });
              } catch {
                toast({ tone: "error", title: t("linkCopyFailed") });
              }
            }}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Link2 aria-hidden className="size-4" />
            {t("copyLink")}
          </button>
        </div>
      </div>

      {vehicles.length < 2 ? <p className="rounded-2xl bg-info/[0.07] px-4 py-3 text-sm text-info">{t("needTwo")}</p> : null}

      <fieldset className="flex flex-wrap items-end gap-4 rounded-card border border-line bg-bg-alt p-4">
        <legend className="sr-only">{t("assumptions")}</legend>
        <p className="w-full text-sm font-medium sm:w-auto sm:self-center">{t("assumptions")}</p>
        <SmallSelect id="cmp-down" label={t("downPayment")} value={downPercent} onChange={setDownPercent} options={[10, 20, 30, 40, 50].map((p) => ({ value: p, label: `${f.number(p)}%` }))} />
        <SmallSelect id="cmp-tenure" label={t("tenure")} value={tenure} onChange={setTenure} options={[12, 24, 36, 48, 60, 72, 84].map((m) => ({ value: m, label: f.unit("months", m, 0) }))} />
        <SmallSelect id="cmp-km" label={t("annualKm")} value={annualKm} onChange={setAnnualKm} options={[5_000, 10_000, 15_000, 20_000, 30_000, 40_000].map((km) => ({ value: km, label: f.unit("km", km, 0) }))} />
        <p className="w-full text-xs text-muted">
          {t("assumptionsNote", {
            rate: f.number(financeConfig.emiFrom.annualRate),
            petrol: f.bdt(costConfig.fuelPricePerLitre.petrol),
            diesel: f.bdt(costConfig.fuelPricePerLitre.diesel),
            electricity: f.bdt(costConfig.electricityPerKwh),
          })}
        </p>
      </fieldset>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 lg:overflow-visible">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
          <caption className="sr-only">{t("caption")}</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-20 w-40 bg-bg align-bottom lg:top-[var(--header-h-compact)] lg:z-30">
                <span className="sr-only">{t("specColumn")}</span>
              </th>
              {vehicles.map((v) => (
                <th
                  key={v.id}
                  scope="col"
                  className="min-w-52 border-b border-line bg-bg px-3 pt-2 pb-4 text-left align-bottom font-normal lg:sticky lg:top-[var(--header-h-compact)] lg:z-20"
                >
                  <div className="relative">
                    <VehicleImage
                      media={v.images[0]}
                      placeholder={{ bodyType: v.bodyType, paint: v.colors[0]?.hex ?? "#cfd0c9", initial: brandInitial(v) }}
                      sizes="220px"
                      className="hidden sm:block"
                    />
                    <button
                      type="button"
                      onClick={() => replaceIds(ids.filter((x) => x !== v.id))}
                      aria-label={t("remove", { name: vehicleName(v, locale) })}
                      className="absolute top-2 right-2 grid size-8 place-items-center rounded-full border border-line bg-bg-alt/90 hover:border-ink max-sm:static max-sm:float-right"
                    >
                      <X aria-hidden className="size-4" />
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-muted">{v.brand.name[locale]}</p>
                  <Link href={vehiclePath(v)} className="block text-base leading-snug font-medium hover:underline">
                    {v.model} <span className="text-muted">{v.variant}</span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          {visible.map((section) =>
            section.rows.length === 0 ? null : (
              <tbody key={section.id}>
                <tr>
                  <th
                    scope="colgroup"
                    colSpan={vehicles.length + 1}
                    className="sticky left-0 bg-bg pt-8 pb-3 text-left text-xs font-semibold tracking-[0.18em] text-accent-ink uppercase"
                  >
                    {section.title}
                  </th>
                </tr>
                {section.rows.map((row) => {
                  const best = bestIndexes(row);
                  return (
                    <tr key={row.id}>
                      <th scope="row" className="sticky left-0 z-10 border-b border-line bg-bg py-3 pr-4 text-left align-top font-normal text-muted">
                        {row.label}
                      </th>
                      {row.cells.map((cell, i) => (
                        <td
                          key={vehicles[i].id}
                          className={cn(
                            "border-b border-line px-3 py-3 align-top tabular",
                            onlyDifferences && best.has(i) && "bg-accent/12",
                          )}
                        >
                          <CellValue cell={cell} best={onlyDifferences && best.has(i)} bestLabel={t("best")} />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            ),
          )}
          <tfoot>
            <tr>
              <th scope="row" className="sticky left-0 z-10 bg-bg pt-6 text-left align-top text-sm font-normal text-muted">
                {t("nextSteps")}
              </th>
              {vehicles.map((v) => (
                <td key={v.id} className="px-3 pt-6 align-top">
                  <div className="flex flex-col gap-2">
                    {v.availability !== "sold" ? (
                      <Link href={`/test-drive?vehicle=${v.slug}`} className={buttonVariants({ size: "sm", className: "w-full" })}>
                        <CalendarCheck aria-hidden className="size-4" />
                        {t("testDrive")}
                      </Link>
                    ) : null}
                    <WhatsAppButton
                      size="sm"
                      tone="outline"
                      display="short"
                      className="w-full"
                      context={{
                        kind: "vehicleInquiry",
                        vehicle: { name: vehicleFullName(v, locale), year: String(v.year), reference: v.reference, url: absoluteUrl(locale, vehiclePath(v)) },
                      }}
                    />
                    <Link href={vehiclePath(v)} className={buttonVariants({ variant: "ghost", size: "sm", className: "w-full" })}>
                      {t("details")}
                    </Link>
                  </div>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-xs text-muted">{t("footnote")}</p>
    </div>
  );
}

function CellValue({ cell, best, bestLabel }: { cell: Cell; best: boolean; bestLabel: string }) {
  if (!cell) return <Minus aria-label="—" className="size-4 text-muted/60" />;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {cell.text === "✓" ? <Check aria-label="✓" className="size-4 text-success" /> : <span>{cell.text}</span>}
      {best ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-accent-ink px-1.5 py-0.5 text-[10px] font-semibold text-white">
          <Award aria-hidden className="size-3" />
          {bestLabel}
        </span>
      ) : null}
    </span>
  );
}

function SmallSelect<T extends number>({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="min-w-36">
      <label htmlFor={id} className="mb-1 block text-xs text-muted">
        {label}
      </label>
      <Select id={id} value={value} onChange={(e) => onChange(Number(e.target.value) as T)} className="h-10 text-sm">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

/** Indexes of the best value(s) in a row, only when "best" is meaningful and values differ. */
function bestIndexes(row: Row): Set<number> {
  if (!row.best) return new Set();
  const nums = row.cells.map((c) => c?.num);
  const present = nums.filter((n): n is number => typeof n === "number");
  if (present.length < 2 || new Set(present).size < 2) return new Set();
  const target = row.best === "min" ? Math.min(...present) : Math.max(...present);
  return new Set(nums.flatMap((n, i) => (n === target ? [i] : [])));
}

function buildSections(
  vehicles: VehicleWithBrand[],
  {
    t,
    tTax,
    f,
    locale,
    downPercent,
    tenure,
    annualKm,
  }: {
    t: ReturnType<typeof useTranslations<"compare">>;
    tTax: ReturnType<typeof useTranslations<"taxonomy">>;
    f: Format;
    locale: "en" | "bn";
    downPercent: number;
    tenure: number;
    annualKm: number;
  },
): Section[] {
  const money = (n: number): Cell => ({ text: f.bdt(n), num: n });
  const unit = (u: Parameters<Format["unit"]>[0], n: number | undefined, digits = 1): Cell =>
    typeof n === "number" ? { text: f.unit(u, n, digits), num: n } : null;

  const running = compareRunningCosts({
    options: vehicles.map((v) => ({
      id: v.id,
      fuelType: v.fuelType,
      kmPerLitre: v.efficiency.kmPerLitre,
      kWhPer100km: v.efficiency.kWhPer100km,
      annualMaintenance: costConfig.annualMaintenance[v.fuelType],
      electricShare: costConfig.phevElectricShare,
    })),
    prices: {
      petrolPerLitre: costConfig.fuelPricePerLitre.petrol,
      dieselPerLitre: costConfig.fuelPricePerLitre.diesel,
      electricityPerKwh: costConfig.electricityPerKwh,
    },
    annualKm,
    years: 1,
    includePurchase: false,
  });
  const runFor = (id: string) => running.results.find((r) => r.id === id);

  const row = (id: string, label: string, cell: (v: VehicleWithBrand) => Cell, best?: Row["best"]): Row => ({
    id,
    label,
    cells: vehicles.map(cell),
    best,
  });
  const nonEmpty = (rows: Row[]) => rows.filter((r) => r.cells.some(Boolean));

  const featureUnion = (pick: (v: VehicleWithBrand) => { en: string; bn: string }[]) => {
    const all = new Map<string, string>();
    vehicles.forEach((v) => pick(v).forEach((x) => all.set(x.en, x[locale])));
    return [...all.entries()].map(([en, label]) =>
      row(`f-${en}`, label, (v) => (pick(v).some((x) => x.en === en) ? { text: "✓" } : null)),
    );
  };

  return [
    {
      id: "price",
      title: t("sections.price"),
      rows: [
        row("price", t("rows.price"), (v) => money(v.price.amount), "min"),
        row("emi", t("rows.emi"), (v) => {
          const loan = summarizeLoan({
            price: v.price.amount,
            downPayment: downPaymentFromPercent(v.price.amount, downPercent),
            annualRatePct: financeConfig.emiFrom.annualRate,
            months: tenure,
          });
          return { text: `${f.bdt(loan.monthlyPayment)}${t("perMonth")}`, num: loan.monthlyPayment };
        }, "min"),
        row("onRoad", t("rows.onRoad"), (v) => money(onRoadEstimate(v).total), "min"),
      ],
    },
    {
      id: "overview",
      title: t("sections.overview"),
      rows: nonEmpty([
        row("year", t("rows.year"), (v) => ({ text: f.number(v.year, { useGrouping: false }), num: v.year }), "max"),
        row("condition", t("rows.condition"), (v) => ({ text: tTax(`condition.${v.condition}`) })),
        row("mileage", t("rows.mileage"), (v) => unit("km", v.mileageKm, 0), "min"),
        row("grade", t("rows.auctionGrade"), (v) => (v.auctionGrade ? { text: f.digits(v.auctionGrade) } : null)),
        row("availability", t("rows.availability"), (v) => ({ text: tTax(`availability.${v.availability}`) })),
      ]),
    },
    {
      id: "specs",
      title: t("sections.specs"),
      rows: nonEmpty([
        row("fuel", t("rows.fuel"), (v) => ({ text: tTax(`fuel.${v.fuelType}`) })),
        row("transmission", t("rows.transmission"), (v) => ({ text: tTax(`transmission.${v.transmission}`) })),
        row("drivetrain", t("rows.drivetrain"), (v) => ({ text: tTax(`drivetrain.${v.drivetrain}`) })),
        row("seats", t("rows.seats"), (v) => ({ text: f.number(v.seats) })),
        row("power", t("rows.power"), (v) => {
          const hp = powerHp(v);
          return hp ? { text: f.unit("hp", hp, 0), num: hp } : null;
        }, "max"),
        row("torque", t("rows.torque"), (v) => {
          const nm = Math.max(v.engine?.torqueNm ?? 0, v.motor?.torqueNm ?? 0);
          return nm ? unit("Nm", nm, 0) : null;
        }, "max"),
        row("battery", t("rows.battery"), (v) => unit("kWh", v.battery?.capacityKwh), "max"),
        row("range", t("rows.range"), (v) => (v.fuelType === "ev" ? unit("km", v.battery?.rangeKm, 0) : null), "max"),
        row("electricRange", t("rows.electricRange"), (v) => (v.fuelType === "phev" ? unit("km", v.battery?.rangeKm, 0) : null), "max"),
        row("length", t("rows.length"), (v) => specNumber(v, "length", (n) => unit("mm", n, 0))),
        row("ground", t("rows.groundClearance"), (v) => specNumber(v, "groundClearance", (n) => unit("mm", n, 0)), "max"),
        row("boot", t("rows.boot"), (v) => specNumber(v, "bootSpace", (n) => unit("L", n, 0)), "max"),
        row("payload", t("rows.payload"), (v) => specNumber(v, "payload", (n) => unit("kg", n, 0)), "max"),
        row("towing", t("rows.towing"), (v) => specNumber(v, "towing", (n) => unit("kg", n, 0)), "max"),
      ]),
    },
    {
      id: "efficiency",
      title: t("sections.efficiency"),
      rows: nonEmpty([
        row("kmpl", t("rows.kmPerL"), (v) => unit("kmPerL", v.efficiency.kmPerLitre), "max"),
        row("kwh", t("rows.kWhPer100km"), (v) => unit("kWhPer100km", v.efficiency.kWhPer100km), "min"),
        row("lph", t("rows.lPerHour"), (v) => unit("lPerHour", v.efficiency.litresPerHour), "min"),
      ]),
    },
    {
      id: "running",
      title: t("sections.running", { km: f.unit("km", annualKm, 0) }),
      rows: nonEmpty([
        row("runningAnnual", t("rows.runningAnnual"), (v) => {
          const r = runFor(v.id);
          return r ? money(r.annualTotal) : null;
        }, "min"),
        row("perKm", t("rows.costPerKm"), (v) => {
          const r = runFor(v.id);
          return r ? { text: f.bdt(r.costPerKm, 2), num: r.costPerKm } : null;
        }, "min"),
      ]),
    },
    { id: "features", title: t("sections.features"), rows: featureUnion((v) => v.features) },
    { id: "safety", title: t("sections.safety"), rows: featureUnion((v) => v.safety) },
  ];
}

function specNumber(v: VehicleWithBrand, key: string, make: (n: number) => Cell): Cell {
  for (const g of v.specs) {
    const item = g.items.find((i) => i.key === key);
    if (item && typeof item.value === "number") return make(item.value);
  }
  return null;
}
