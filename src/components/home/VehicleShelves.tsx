import { getTranslations } from "next-intl/server";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { getFeaturedVehicles, getNewArrivals } from "@/lib/api/vehicles";
import { stagger } from "@/lib/motion";
import { Carousel } from "./Carousel";
import { FeaturedSpotlight } from "./FeaturedSpotlight";
import { SectionHeading } from "./SectionHeading";

/**
 * Featured vehicles as an editorial spread (one spotlight, four cards that
 * rise in after it) and new arrivals as a glide-and-snap carousel.
 */
export async function VehicleShelves({ index }: { index: number }) {
  const [t, featured, arrivals] = await Promise.all([getTranslations("home.shelves"), getFeaturedVehicles(5), getNewArrivals(8)]);
  const [lead, ...rest] = featured;
  return (
    <>
      <section aria-labelledby="featured" className="container-page section-gap">
        <SectionHeading id="featured" index={index} eyebrow={t("featuredEyebrow")} title={t("featuredTitle")} lead={t("featuredLead")} link={{ href: "/vehicles", label: t("viewAll") }} />
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {lead ? (
            <li data-reveal="wipe" className="md:col-span-2 lg:row-span-2">
              <FeaturedSpotlight vehicle={lead} />
            </li>
          ) : null}
          {rest.map((v, i) => (
            <li key={v.id} data-reveal style={stagger(i, 250)}>
              <VehicleCard vehicle={v} />
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="arrivals" className="section-gap">
        <div className="container-page">
          <SectionHeading id="arrivals" index={index + 1} eyebrow={t("arrivalsEyebrow")} title={t("arrivalsTitle")} lead={t("arrivalsLead")} link={{ href: "/vehicles?sort=newest", label: t("viewAll") }} />
        </div>
        <Carousel label={t("arrivalsTitle")} prevLabel={t("previous")} nextLabel={t("next")}>
          {arrivals.map((v, i) => (
            <li key={v.id} data-reveal style={stagger(i)} className="w-[min(19rem,82vw)] shrink-0 snap-start">
              <VehicleCard vehicle={v} />
            </li>
          ))}
        </Carousel>
      </section>
    </>
  );
}
