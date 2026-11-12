import { getTranslations } from "next-intl/server";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { getFeaturedVehicles, getNewArrivals } from "@/lib/api/vehicles";
import { SectionHeading } from "./SectionHeading";

/** Featured vehicles (grid) and new arrivals (scroll-snap row). */
export async function VehicleShelves() {
  const [t, featured, arrivals] = await Promise.all([getTranslations("home.shelves"), getFeaturedVehicles(4), getNewArrivals(8)]);
  return (
    <>
      <section aria-labelledby="featured" className="container-page mt-20">
        <SectionHeading id="featured" eyebrow={t("featuredEyebrow")} title={t("featuredTitle")} link={{ href: "/vehicles", label: t("viewAll") }} />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((v) => (
            <li key={v.id}>
              <VehicleCard vehicle={v} />
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="arrivals" className="mt-20">
        <div className="container-page">
          <SectionHeading id="arrivals" eyebrow={t("arrivalsEyebrow")} title={t("arrivalsTitle")} link={{ href: "/vehicles?sort=newest", label: t("viewAll") }} />
        </div>
        {/* scroll-padding matches the container's inline padding, so snapping never hides the first card's gutter. */}
        <ul className="container-page flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto pb-4 [scrollbar-width:thin] sm:scroll-px-8 xl:scroll-px-14" aria-label={t("arrivalsTitle")}>
          {arrivals.map((v) => (
            <li key={v.id} className="w-[min(18rem,80vw)] shrink-0 snap-start">
              <VehicleCard vehicle={v} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
