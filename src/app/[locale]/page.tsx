import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { EmiCalculator } from "@/components/calculators/EmiCalculator";
import { BrowseBy } from "@/components/home/BrowseBy";
import { CompareTeaser } from "@/components/home/CompareTeaser";
import { EvTeaser } from "@/components/home/EvTeaser";
import { Hero3D } from "@/components/home/Hero3D";
import { AfterSales, ShowroomStrip, Testimonials, TestDriveBand } from "@/components/home/HomeBands";
import { PopularBrands } from "@/components/home/PopularBrands";
import { QuickSearch } from "@/components/home/QuickSearch";
import { SavingsTeaser } from "@/components/home/SavingsTeaser";
import { SectionHeading } from "@/components/home/SectionHeading";
import { VehicleShelves } from "@/components/home/VehicleShelves";
import { financeConfig } from "@/config/finance";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations("meta"), getLocale()]);
  return pageMetadata({ locale, path: "/", title: t("homeTitle"), description: t("defaultDescription") });
}

/**
 * Homepage (brief §10.A): 3D hero, then quick search, browse, vehicles,
 * brands, EV, savings, compare, EMI, test drive, after-sales, testimonials and
 * showrooms. The newsletter sits in the footer. (No fleet band: D38.)
 */
export default async function HomePage() {
  const t = await getTranslations("home.emi");
  return (
    <>
      <Hero3D />
      <QuickSearch />
      <BrowseBy />
      <VehicleShelves />
      <PopularBrands />
      <EvTeaser />
      <SavingsTeaser />
      <CompareTeaser />
      <section aria-labelledby="emi-highlight" className="container-page mt-24">
        <SectionHeading id="emi-highlight" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} link={{ href: "/finance", label: t("all") }} />
        <EmiCalculator initialPrice={financeConfig.samplePrice} />
      </section>
      <TestDriveBand />
      <AfterSales />
      <Testimonials />
      <ShowroomStrip />
    </>
  );
}
