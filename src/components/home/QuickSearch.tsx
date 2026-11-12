import { Search } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Select } from "@/components/ui/Input";
import { getBrands } from "@/lib/api/vehicles";
import { getFormat } from "@/lib/format/getFormat";
import { CONDITIONS, FUEL_TYPES } from "@/types";

/** Budget ceilings offered in the quick search (BDT). */
const BUDGETS = [1_500_000, 3_000_000, 5_000_000, 10_000_000];

/**
 * Structured quick search (condition, fuel, brand, budget). A plain GET form
 * to the marketplace, so it works before (and without) JavaScript; empty
 * fields are ignored by the listing's URL parser.
 */
export async function QuickSearch() {
  const [t, tTax, f, locale, brands] = await Promise.all([getTranslations("home.quickSearch"), getTranslations("taxonomy"), getFormat(), getLocale(), getBrands()]);
  const field = "flex flex-col gap-1.5 text-sm font-medium";
  return (
    <section aria-labelledby="quick-search" className="container-page relative z-10 -mt-px pt-10 lg:pt-14">
      <form action={`/${locale}/vehicles`} method="get" className="grid gap-4 rounded-card border border-line bg-bg-alt p-5 shadow-[0_20px_60px_-30px_rgba(22,26,22,0.35)] sm:p-6 md:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end">
        <h2 id="quick-search" className="text-lg font-medium md:col-span-2 lg:col-span-5">
          {t("title")}
        </h2>
        <label className={field}>
          {t("condition")}
          <Select name="condition" defaultValue="">
            <option value="">{t("any")}</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{tTax(`condition.${c}`)}</option>
            ))}
          </Select>
        </label>
        <label className={field}>
          {t("fuel")}
          <Select name="fuel" defaultValue="">
            <option value="">{t("any")}</option>
            {FUEL_TYPES.map((c) => (
              <option key={c} value={c}>{tTax(`fuel.${c}`)}</option>
            ))}
          </Select>
        </label>
        <label className={field}>
          {t("brand")}
          <Select name="brand" defaultValue="">
            <option value="">{t("anyBrand")}</option>
            {brands.filter((b) => b.vehicleCount > 0).map((b) => (
              <option key={b.id} value={b.id}>{b.name[locale]}</option>
            ))}
          </Select>
        </label>
        <label className={field}>
          {t("budget")}
          <Select name="priceMax" defaultValue="">
            <option value="">{t("anyBudget")}</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>{t("upTo", { amount: f.bdtCompact(b) })}</option>
            ))}
          </Select>
        </label>
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-bg-alt transition-colors hover:bg-ink/90 md:col-span-2 lg:col-span-1"
        >
          <Search aria-hidden className="size-4" />
          {t("submit")}
        </button>
      </form>
    </section>
  );
}
