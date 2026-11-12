import { Calculator, CalendarCheck, Car, Wrench } from "lucide-react";
import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";

/** Next steps from any EV guide: savings calculator and EV listings, plus an optional extra. */
export function EvCtas({ extra }: { extra?: "service" | "testDrive" }) {
  const t = useTranslations("ev.cta");
  return (
    <section aria-labelledby="ev-cta" className="on-dark rounded-card bg-graphite p-7 text-on-dark sm:p-9">
      <h2 id="ev-cta" className="display-md">
        {t("title")}
      </h2>
      <p className="mt-3 max-w-xl text-muted-on-dark">{t("lead")}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <ButtonLink href="/savings-calculator" variant="light" size="lg" icon={<Calculator aria-hidden className="size-4" />}>
          {t("savings")}
        </ButtonLink>
        <ButtonLink href="/vehicles?fuel=ev" variant="outline-light" size="lg" icon={<Car aria-hidden className="size-4" />}>
          {t("listings")}
        </ButtonLink>
        {extra === "service" ? (
          <ButtonLink href="/service/book?package=ev-battery" variant="outline-light" size="lg" icon={<Wrench aria-hidden className="size-4" />}>
            {t("service")}
          </ButtonLink>
        ) : null}
        {extra === "testDrive" ? (
          <ButtonLink href="/test-drive" variant="outline-light" size="lg" icon={<CalendarCheck aria-hidden className="size-4" />}>
            {t("testDrive")}
          </ButtonLink>
        ) : null}
      </div>
    </section>
  );
}
