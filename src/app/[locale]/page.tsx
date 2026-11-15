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
 * Homepage (brief §10.A) as one numbered journey: the 3D story hands over to
 * the search console, then browse, vehicles, brands, EV, savings, compare,
 * EMI, test drive, after-sales, testimonials and showrooms. The newsletter
 * sits in the footer. (No fleet band: D38; no category tiles: user request.)
 */
export default async function HomePage() {
  const t = await getTranslations("home.emi");
  return (
    <>
      <Hero3D />
      <QuickSearch index={1} />
      <BrowseBy index={2} />
      <VehicleShelves index={3} />
      <PopularBrands index={5} />
      <EvTeaser index={6} />
      <SavingsTeaser index={7} />
      <CompareTeaser index={8} />
      <section aria-labelledby="emi-highlight" className="container-page section-gap">
        <SectionHeading id="emi-highlight" index={9} eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} link={{ href: "/finance", label: t("all") }} />
        <div data-reveal>
          <EmiCalculator initialPrice={financeConfig.samplePrice} />
        </div>
      </section>
      <TestDriveBand index={10} />
      <AfterSales index={11} />
      <Testimonials index={12} />
      <ShowroomStrip index={13} />
    </>
  );
}
