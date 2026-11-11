import type { Metadata } from "next";
import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { ActiveFilters, ClearFiltersButton } from "@/components/vehicle/ActiveFilters";
import { FilterPanel } from "@/components/vehicle/FilterPanel";
import { ListingResults, ListingStateProvider } from "@/components/vehicle/ListingState";
import { ListingToolbar } from "@/components/vehicle/ListingToolbar";
import { RetryButton } from "@/components/vehicle/RetryButton";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { financeConfig } from "@/config/finance";
import { Link } from "@/i18n/navigation";
import { getVehicles } from "@/lib/api/vehicles";
import { getFormat } from "@/lib/format/getFormat";
import { listingHref, parseListingParams } from "@/lib/search/vehicleQuery";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import type { VehicleListResult } from "@/types";

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations("listing"), getLocale()]);
  return pageMetadata({ locale, path: "/vehicles", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function VehiclesPage({ searchParams }: PageProps<"/[locale]/vehicles">) {
  const t = await getTranslations("listing");
  return (
    <div className="container-page pt-8 pb-20">
      <Breadcrumbs items={[{ label: t("breadcrumb") }]} />
      <header className="mt-6 mb-8 max-w-3xl">
        <p className="eyebrow text-accent-ink">{t("eyebrow")}</p>
        <h1 className="display-lg mt-3">{t("title")}</h1>
        <p className="mt-4 text-muted">{t("lead")}</p>
      </header>
      {/* Search params are request-time data: the shell above prerenders, the listing streams in. */}
      <Suspense fallback={<ListingSkeleton />}>
        <Listing searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Listing({ searchParams }: { searchParams: PageProps<"/[locale]/vehicles">["searchParams"] }) {
  const state = parseListingParams(await searchParams);
  const t = await getTranslations("listing");

  let result: VehicleListResult;
  try {
    result = await getVehicles(state.filters);
  } catch {
    return (
      <ErrorState
        title={t("errorTitle")}
        body={t("errorBody")}
        action={
          <>
            <RetryButton />
            <Link href="/vehicles" className="inline-flex h-11 items-center rounded-full border border-line-strong px-5 text-sm font-medium">
              {t("resetListing")}
            </Link>
          </>
        }
      />
    );
  }

  const f = await getFormat();
  const isList = state.view === "list";

  return (
    <ListingStateProvider state={state} facets={result.facets} total={result.total}>
      <div className="grid gap-10 lg:grid-cols-[17.5rem_1fr]">
        <aside aria-label={t("filters")} className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-h-compact)+1.5rem)] max-h-[calc(100dvh-var(--header-h-compact)-3rem)] overflow-y-auto pr-2 [scrollbar-width:thin]">
            <h2 className="eyebrow mb-1 text-muted">{t("filters")}</h2>
            <FilterPanel />
          </div>
        </aside>

        <section aria-label={t("results")} className="flex min-w-0 flex-col gap-6">
          <ListingToolbar />
          <ActiveFilters />
          <ListingResults>
            {result.items.length === 0 ? (
              <EmptyState title={t("emptyTitle")} body={t("emptyBody")} action={<ClearFiltersButton />} />
            ) : (
              <ul className={cn("grid gap-5", isList ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-3")}>
                {result.items.map((v, i) => (
                  <li key={v.id} className="flex">
                    <VehicleCard vehicle={v} view={state.view} priority={i < 3} headingLevel={2} />
                  </li>
                ))}
              </ul>
            )}
          </ListingResults>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            hrefFor={(page) => listingHref({ ...state, filters: { ...state.filters, page } })}
            className="mt-4"
          />
          <p className="text-xs text-muted">
            {t("emiFootnote", {
              down: f.number(financeConfig.emiFrom.downPaymentPercent),
              months: f.number(financeConfig.emiFrom.tenureMonths),
              rate: f.number(financeConfig.emiFrom.annualRate),
            })}{" "}
            {t("priceFootnote")}
          </p>
        </section>
      </div>
    </ListingStateProvider>
  );
}

function ListingSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[17.5rem_1fr]" aria-hidden>
      <div className="hidden flex-col gap-4 lg:flex">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-12 rounded-full" />
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="rounded-card border border-line bg-bg-alt p-2">
              <Skeleton className="aspect-[16/10]" />
              <div className="flex flex-col gap-2 p-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-12" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
