import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CalendarCheck } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { EmiCalculator } from "@/components/calculators/EmiCalculator";
import { RunningCostCalculator } from "@/components/calculators/RunningCostCalculator";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ShowroomCard } from "@/components/showroom/ShowroomCard";
import { ButtonLink } from "@/components/ui/Button";
import { FeatureLists } from "@/components/vehicle/FeatureLists";
import { Gallery } from "@/components/vehicle/Gallery";
import { InquiryDrawer } from "@/components/vehicle/InquiryDrawer";
import { KeySpecs } from "@/components/vehicle/KeySpecs";
import { PriceBreakdown } from "@/components/vehicle/PriceBreakdown";
import { SpecTable } from "@/components/vehicle/SpecTable";
import { CompareButton, FavoriteButton } from "@/components/vehicle/VehicleActions";
import { AvailabilityBadge, ConditionBadge, FuelBadge } from "@/components/vehicle/VehicleBadges";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { RegisterWhatsAppContext } from "@/components/whatsapp/RegisterWhatsAppContext";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { routing } from "@/i18n/routing";
import { getFinancePartners } from "@/lib/api/finance";
import { getShowroomsByIds } from "@/lib/api/showrooms";
import { getSimilarVehicles, getVehicleBySlug, getVehicleSlugs } from "@/lib/api/vehicles";
import { emiFrom } from "@/lib/calc/emi";
import { getFormat } from "@/lib/format/getFormat";
import { absoluteUrl, pageMetadata, toJsonLd, vehicleJsonLd } from "@/lib/seo";
import { brandInitial, vehicleFullName, vehiclePath } from "@/lib/vehicle";
import type { WhatsAppVehicle } from "@/lib/whatsapp";

export async function generateStaticParams() {
  return (await getVehicleSlugs()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/vehicles/[slug]">): Promise<Metadata> {
  const { slug, locale } = await params;
  const v = await getVehicleBySlug(slug);
  const t = await getTranslations("vehicleDetail");
  if (!v || !hasLocale(routing.locales, locale)) return { title: t("notFoundTitle"), robots: { index: false } };
  const f = await getFormat();
  return pageMetadata({
    locale,
    path: vehiclePath(v),
    title: t("metaTitle", { name: vehicleFullName(v, locale), year: f.number(v.year, { useGrouping: false }) }),
    description: `${v.summary[locale]} ${t("metaPrice", { price: f.bdtCompact(v.price.amount) })}`,
  });
}

const SECTIONS = ["overview", "specs", "features", "price", "finance", "running", "showrooms"] as const;

/**
 * The page shell doesn't read params, so client navigation can show it
 * instantly (Partial Prefetching); the vehicle streams in. Every slug is still
 * prerendered at build time via generateStaticParams.
 */
export default function VehicleDetailPage({ params }: PageProps<"/[locale]/vehicles/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <VehicleDetail params={params} />
    </Suspense>
  );
}

async function VehicleDetail({ params }: { params: PageProps<"/[locale]/vehicles/[slug]">["params"] }) {
  const { slug } = await params;
  const v = await getVehicleBySlug(slug);
  if (!v) notFound();

  const [t, tTax, f, similar, showrooms, partners] = await Promise.all([
    getTranslations("vehicleDetail"),
    getTranslations("taxonomy"),
    getFormat(),
    getSimilarVehicles(v.id),
    getShowroomsByIds(v.showroomIds),
    getFinancePartners(),
  ]);
  const locale = f.locale;
  const fullName = vehicleFullName(v, locale);
  const year = f.number(v.year, { useGrouping: false });
  const whatsappVehicle: WhatsAppVehicle = {
    name: fullName,
    year: String(v.year),
    condition: tTax(`condition.${v.condition}`),
    reference: v.reference,
    url: absoluteUrl(locale, vehiclePath(v)),
  };
  const placeholder = { bodyType: v.bodyType, paint: v.colors[0]?.hex ?? "#cfd0c9", initial: brandInitial(v) };
  const isSold = v.availability === "sold";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(vehicleJsonLd(v, locale)) }} />
      <RegisterWhatsAppContext label={t("whatsappAbout", { name: v.model })} context={{ kind: "vehicleInquiry", vehicle: whatsappVehicle }} />

      <div className="container-page pt-8">
        <Breadcrumbs
          items={[
            { label: t("breadcrumbVehicles"), href: "/vehicles" },
            { label: v.brand.name[locale], href: `/vehicles?brand=${v.brandId}` },
            { label: `${v.model} ${v.variant}` },
          ]}
        />
      </div>

      <section className="container-page grid gap-10 pt-6 pb-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Gallery images={v.images} placeholder={placeholder} title={fullName} />
        </div>

        <div className="lg:col-span-5">
          <div className="flex flex-col gap-6 lg:sticky lg:top-[calc(var(--header-h-compact)+1.5rem)]">
            <div className="flex flex-wrap gap-2">
              <ConditionBadge condition={v.condition} />
              <FuelBadge fuel={v.fuelType} />
              <AvailabilityBadge availability={v.availability} />
            </div>
            <div>
              <p className="eyebrow text-muted">{v.brand.name[locale]}</p>
              <h1 className="display-md mt-2">
                {v.model} <span className="text-muted">{v.variant}</span>
              </h1>
              <p className="mt-2 text-sm text-muted">
                {year} · {f.unit("km", v.mileageKm, 0)} · {t("stockRef", { ref: v.reference })}
              </p>
            </div>
            <p className="text-[0.9375rem] leading-relaxed text-ink/85">{v.summary[locale]}</p>

            <div className="rounded-card border border-line bg-bg-alt p-5">
              <p className="text-3xl font-semibold tracking-tight tabular">{f.bdt(v.price.amount)}</p>
              <p className="mt-1 text-sm text-muted">
                {f.bdtCompact(v.price.amount)}
                {v.price.negotiable ? ` · ${t("negotiable")}` : ""}
              </p>
              <a href="#finance" className="mt-3 inline-block text-sm font-medium text-accent-ink underline-offset-4 hover:underline">
                {t("emiFrom", { amount: f.bdt(emiFrom(v.price.amount)) })}
              </a>
            </div>

            {isSold ? (
              <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">{t("soldNote")}</p>
            ) : null}

            <div className="flex flex-col gap-3">
              {!isSold ? (
                <ButtonLink
                  href={`/test-drive?vehicle=${v.slug}`}
                  size="lg"
                  className="w-full"
                  icon={<CalendarCheck aria-hidden className="size-4" />}
                >
                  {t("bookTestDrive")}
                </ButtonLink>
              ) : null}
              <InquiryDrawer vehicle={{ id: v.id, label: `${fullName} (${year})` }} whatsappVehicle={whatsappVehicle} partners={partners} />
              <WhatsAppButton size="lg" className="w-full" context={{ kind: "vehicleInquiry", vehicle: whatsappVehicle }} />
              <div className="grid grid-cols-2 gap-3">
                <CompareButton vehicleId={v.id} name={fullName} display="labelled" className="justify-center" />
                <FavoriteButton vehicleId={v.id} name={fullName} display="labelled" className="justify-center" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <nav aria-label={t("sectionsNav")} className="sticky top-[var(--header-h-compact)] z-30 border-y border-line bg-bg/90 backdrop-blur">
        <ul className="container-page flex gap-1 overflow-x-auto py-2 text-sm [scrollbar-width:none]">
          {SECTIONS.filter((s) => s !== "showrooms" || showrooms.length > 0).map((s) => (
            <li key={s} className="shrink-0">
              <a href={`#${s}`} className="inline-flex h-9 items-center rounded-full px-3.5 text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink">
                {t(`sections.${s}`)}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container-page flex flex-col gap-20 py-16">
        <Section id="overview" title={t("sections.overview")}>
          <KeySpecs vehicle={v} />
        </Section>
        <Section id="specs" title={t("fullSpecs")}>
          <SpecTable vehicle={v} />
        </Section>
        <Section id="features" title={t("sections.features")}>
          <FeatureLists vehicle={v} />
        </Section>
        <Section id="price" title={t("priceTitle")} lead={t("priceLead")}>
          <PriceBreakdown vehicle={v} />
        </Section>
        <Section id="finance" title={t("financeTitle")} lead={t("financeLead")}>
          <EmiCalculator initialPrice={v.price.amount} vehicle={whatsappVehicle} financeHref={`/finance?vehicle=${v.slug}`} />
        </Section>
        <Section id="running" title={t("runningTitle")} lead={t("runningLead")}>
          <RunningCostCalculator fuelType={v.fuelType} efficiency={v.efficiency} savingsHref={`/savings-calculator?vehicle=${v.slug}`} />
        </Section>
        {showrooms.length > 0 ? (
          <Section id="showrooms" title={t("showroomsTitle")} lead={t("showroomsLead")}>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {showrooms.map((s) => (
                <li key={s.id}>
                  <ShowroomCard showroom={s} />
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
        {similar.length > 0 ? (
          <Section id="similar" title={t("similarTitle")}>
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {similar.map((s) => (
                <li key={s.id} className="flex">
                  <VehicleCard vehicle={s} />
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
      </div>
    </>
  );
}

function Section({ id, title, lead, children }: { id: string; title: string; lead?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-32">
      <div className="mb-8 max-w-2xl">
        <h2 id={`${id}-title`} className="display-md">
          {title}
        </h2>
        {lead ? <p className="mt-3 text-muted">{lead}</p> : null}
      </div>
      {children}
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="container-page grid gap-10 pt-16 pb-14 lg:grid-cols-12" aria-hidden>
      <div className="flex flex-col gap-3 lg:col-span-7">
        <Skeleton className="aspect-[16/10] rounded-2xl" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="aspect-[16/10]" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 lg:col-span-5">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-20" />
        <Skeleton className="h-28 rounded-card" />
        <Skeleton className="h-13 rounded-full" />
        <Skeleton className="h-13 rounded-full" />
      </div>
    </div>
  );
}
