import { ArrowUpRight, Search } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Select } from "@/components/ui/Input";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { getAllVehicles, getBrands } from "@/lib/api/vehicles";
import { getShowrooms } from "@/lib/api/showrooms";
import { getFormat } from "@/lib/format/getFormat";
import { stagger } from "@/lib/motion";
import { CONDITIONS, FUEL_TYPES } from "@/types";

/** Budget ceilings offered in the quick search (BDT). */
const BUDGETS = [1_500_000, 3_000_000, 5_000_000, 10_000_000];

/**
 * "Find": the search console that rises over the end of the 3D story. A plain
 * GET form to the marketplace (works before and without JavaScript; empty
 * fields are ignored by the listing's URL parser), beside live inventory
 * counts taken from the data, which count up as the console arrives.
 */
export async function QuickSearch({ index }: { index: number }) {
  const [t, tTax, f, locale, brands, vehicles, showrooms] = await Promise.all([
    getTranslations("home.quickSearch"),
    getTranslations("taxonomy"),
    getFormat(),
    getLocale(),
    getBrands(),
    getAllVehicles(),
    getShowrooms(),
  ]);
  const stocked = brands.filter((b) => b.vehicleCount > 0);
  const stats = [
    { key: "vehicles", value: vehicles.filter((v) => v.availability !== "sold").length },
    { key: "brands", value: stocked.length },
    { key: "showrooms", value: showrooms.length },
  ] as const;
  const field = "flex flex-col gap-2 text-sm font-medium text-on-dark/85";
  const popular = [
    { href: "/vehicles?fuel=ev", label: tTax("fuel.ev") },
    { href: "/vehicles?fuel=hybrid", label: tTax("fuel.hybrid") },
    { href: "/vehicles?condition=reconditioned", label: tTax("condition.reconditioned") },
    { href: "/vehicles?category=suv", label: tTax("category.suv") },
    { href: `/vehicles?priceMax=${BUDGETS[1]}`, label: t("upTo", { amount: f.bdtCompact(BUDGETS[1]) }) },
  ];

  return (
    <section id="find" aria-labelledby="quick-search" className="relative z-10 -mt-12 scroll-mt-24 md:-mt-20">
      <div className="container-page">
        <div
          data-reveal="scale"
          className="on-dark relative isolate overflow-hidden rounded-[28px] bg-graphite text-on-dark shadow-(--shadow-lift)"
        >
          {/* Gold edge and a slow drifting studio light. */}
          <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-(image:--gold)" />
          <span
            aria-hidden
            className="pointer-events-none absolute -top-1/2 left-1/4 -z-10 h-[140%] w-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(200_176_124/0.16),transparent)] motion-safe:animate-[light-drift_14s_var(--ease-in-out-soft)_infinite]"
          />
          <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-12 lg:gap-12 lg:p-12">
            <div className="flex flex-col gap-8 lg:col-span-4">
              <div>
                <p className="eyebrow flex items-center gap-3 text-accent-2">
                  <span className="tabular">{f.number(index, { minimumIntegerDigits: 2 })}</span>
                  <span aria-hidden className="h-px w-10 bg-accent-2/70" />
                  {t("eyebrow")}
                </p>
                <h2 id="quick-search" className="display-md mt-4">
                  {t("title")}
                </h2>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-on-dark">{t("lead")}</p>
              </div>
              <dl className="grid grid-cols-3 gap-3 border-t sm:gap-4 border-line-on-dark pt-6">
                {stats.map((s, i) => (
                  <div key={s.key} data-reveal style={stagger(i, 250)} className="flex flex-col-reverse">
                    <dt className="mt-1 text-[0.6875rem] text-muted-on-dark min-[360px]:text-xs">{t(`stats.${s.key}`)}</dt>
                    <dd className="text-3xl font-light tracking-tight sm:text-4xl">
                      <AnimatedNumber value={s.value} countUp />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="flex flex-col justify-between gap-10 lg:col-span-8">
            <nav aria-labelledby="popular-searches" data-reveal style={stagger(0, 100)}>
              <p id="popular-searches" className="text-sm text-muted-on-dark">
                {t("popular")}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {popular.map((p) => (
                  <li key={p.href}>
                    <Link
                      href={p.href}
                      className="group inline-flex h-10 items-center gap-1.5 rounded-full border border-line-on-dark px-4 text-sm text-on-dark/85 transition-[border-color,color,background-color] duration-300 hover:border-accent-2 hover:bg-on-dark/[0.04] hover:text-on-dark"
                    >
                      {p.label}
                      <ArrowUpRight aria-hidden className="size-3.5 text-accent-2 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <form
              action={`/${locale}/vehicles`}
              method="get"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <label className={field} data-reveal style={stagger(0, 150)}>
                {t("condition")}
                <Select name="condition" defaultValue="">
                  <option value="">{t("any")}</option>
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>{tTax(`condition.${c}`)}</option>
                  ))}
                </Select>
              </label>
              <label className={field} data-reveal style={stagger(1, 150)}>
                {t("fuel")}
                <Select name="fuel" defaultValue="">
                  <option value="">{t("any")}</option>
                  {FUEL_TYPES.map((c) => (
                    <option key={c} value={c}>{tTax(`fuel.${c}`)}</option>
                  ))}
                </Select>
              </label>
              <label className={field} data-reveal style={stagger(2, 150)}>
                {t("brand")}
                <Select name="brand" defaultValue="">
                  <option value="">{t("anyBrand")}</option>
                  {stocked.map((b) => (
                    <option key={b.id} value={b.id}>{b.name[locale]}</option>
                  ))}
                </Select>
              </label>
              <label className={field} data-reveal style={stagger(3, 150)}>
                {t("budget")}
                <Select name="priceMax" defaultValue="">
                  <option value="">{t("anyBudget")}</option>
                  {BUDGETS.map((b) => (
                    <option key={b} value={b}>{t("upTo", { amount: f.bdtCompact(b) })}</option>
                  ))}
                </Select>
              </label>
              <div data-reveal style={stagger(4, 150)} className="flex flex-col gap-3 pt-2 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between lg:col-span-4">
                <p className="text-sm text-muted-on-dark">{t("hint")}</p>
                <button
                  type="submit"
                  className="sheen group inline-flex h-13 items-center justify-center gap-2.5 rounded-full bg-on-dark px-8 text-[0.9375rem] font-medium text-ink transition-[background-color,transform] duration-300 hover:bg-white active:translate-y-px"
                >
                  <Search aria-hidden className="size-4 transition-transform duration-500 ease-(--ease-cinema) group-hover:-rotate-12 group-hover:scale-110" />
                  {t("submit")}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
