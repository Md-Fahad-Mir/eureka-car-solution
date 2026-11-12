import type { Metadata } from "next";
import { CalendarCheck, Check, ClipboardList, Truck } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { getMaintenanceGuides, getServicePackages } from "@/lib/api/service";
import { getFormat } from "@/lib/format/getFormat";
import { pageMetadata } from "@/lib/seo";
import { ScrollArea } from "@/components/ui/ScrollArea";

export async function generateMetadata(): Promise<Metadata> {
  const [t, f] = await Promise.all([getTranslations("service"), getFormat()]);
  return pageMetadata({ locale: f.locale, path: "/service", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function ServicePage() {
  const [t, tTax, f, locale, packages, guides] = await Promise.all([
    getTranslations("service"),
    getTranslations("taxonomy"),
    getFormat(),
    getLocale(),
    getServicePackages(),
    getMaintenanceGuides(),
  ]);
  const pickupSteps = ["book", "collect", "service", "return"] as const;

  return (
    <div className="pb-20">
      <section className="container-page pt-8">
        <Breadcrumbs items={[{ label: t("breadcrumb") }]} />
        <header className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow text-accent-ink">{t("eyebrow")}</p>
            <h1 className="display-lg mt-3">{t("title")}</h1>
            <p className="mt-4 max-w-2xl text-muted">{t("lead")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col">
            <ButtonLink href="/service/book" size="lg" icon={<CalendarCheck aria-hidden className="size-4" />}>
              {t("book")}
            </ButtonLink>
            <ButtonLink href="/service/track" size="lg" variant="outline" icon={<ClipboardList aria-hidden className="size-4" />}>
              {t("track")}
            </ButtonLink>
          </div>
        </header>
      </section>

      <section aria-labelledby="packages" className="container-page mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="packages" className="display-md">
            {t("packagesTitle")}
          </h2>
          <p className="max-w-md text-sm text-muted">{t("pricesNote")}</p>
        </div>
        <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((p) => (
            <li key={p.id} className="flex flex-col gap-4 rounded-card border border-line bg-bg-alt p-6">
              <div className="flex flex-wrap gap-1.5">
                {p.fuelTypes.map((fuel) => (
                  <Badge key={fuel} tone={fuel === "ev" ? "ev" : "neutral"}>
                    {tTax(`fuel.${fuel}`)}
                  </Badge>
                ))}
                {p.forCommercial ? <Badge tone="accent">{t("commercial")}</Badge> : null}
              </div>
              <div>
                <h3 className="text-lg font-medium">{p.name[locale]}</h3>
                <p className="mt-1 text-sm text-muted">{p.summary[locale]}</p>
              </div>
              <ul className="flex flex-col gap-2 text-sm">
                {p.includes.map((item) => (
                  <li key={item.en} className="flex gap-2">
                    <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
                    {item[locale]}
                  </li>
                ))}
              </ul>
              <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
                <div>
                  <dt className="text-xs text-muted">{t("from")}</dt>
                  <dd className="text-lg font-medium tabular">{f.bdt(p.price.amount)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">{t("time")}</dt>
                  <dd className="font-medium">{t("duration", { hours: f.number(p.durationHours) })}</dd>
                </div>
                {p.interval ? (
                  <div className="col-span-2">
                    <dt className="text-xs text-muted">{t("interval")}</dt>
                    <dd>
                      {t("intervalValue", {
                        km: f.unit("km", p.interval.km ?? 0, 0),
                        months: f.unit("months", p.interval.months ?? 0, 0),
                      })}
                    </dd>
                  </div>
                ) : null}
              </dl>
              <ButtonLink href={`/service/book?package=${p.id}`} variant="outline">
                {t("bookPackage")}
              </ButtonLink>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="guide" className="container-page mt-20">
        <h2 id="guide" className="display-md">
          {t("guideTitle")}
        </h2>
        <p className="mt-3 max-w-2xl text-muted">{t("guideLead")}</p>
        <ScrollArea label={t("guideTitle")} className="mt-8 rounded-card border border-line">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <caption className="sr-only">{t("guideTitle")}</caption>
            <thead className="bg-bg-alt text-xs text-muted">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">{t("guideFuel")}</th>
                <th scope="col" className="px-5 py-3 font-medium">{t("guideEvery")}</th>
                <th scope="col" className="px-5 py-3 font-medium">{t("guideFocus")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {guides.map((g) => (
                <tr key={g.fuelType} className="align-top">
                  <th scope="row" className="px-5 py-4 font-medium">{tTax(`fuel.${g.fuelType}`)}</th>
                  <td className="px-5 py-4 tabular">
                    {t("intervalValue", { km: f.unit("km", g.intervalKm, 0), months: f.unit("months", g.intervalMonths, 0) })}
                  </td>
                  <td className="px-5 py-4">
                    <ul className="flex flex-col gap-1">
                      {g.focus.map((item) => (
                        <li key={item.en}>{item[locale]}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
        <p className="mt-3 text-xs text-muted">{t("guideNote")}</p>
      </section>

      <section aria-labelledby="pickup" className="container-page mt-20">
        <div className="on-dark grid gap-10 rounded-card bg-graphite p-8 text-on-dark sm:p-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Truck aria-hidden className="size-8 text-accent-2" />
            <h2 id="pickup" className="display-md mt-4">
              {t("pickupTitle")}
            </h2>
            <p className="mt-3 text-muted-on-dark">{t("pickupLead")}</p>
            <p className="mt-4 text-sm text-muted-on-dark">{t("pickupFee")}</p>
          </div>
          <ol className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
            {pickupSteps.map((s, i) => (
              <li key={s} className="flex gap-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line-on-dark text-sm tabular">
                  {f.number(i + 1)}
                </span>
                <div>
                  <p className="font-medium">{t(`pickupSteps.${s}.title`)}</p>
                  <p className="mt-1 text-sm text-muted-on-dark">{t(`pickupSteps.${s}.body`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DemoNotice message={t("demoNotice")} className="max-w-2xl" />
        <WhatsAppButton context={{ kind: "service" }} />
      </section>
    </div>
  );
}
