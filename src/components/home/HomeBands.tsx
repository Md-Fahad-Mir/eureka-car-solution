import { CalendarCheck, ClipboardList, Quote, Star, Truck, Wrench, Zap } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { OpenNow } from "@/components/showroom/OpenNow";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { Link } from "@/i18n/navigation";
import { getTestimonials } from "@/lib/api/content";
import { getServicePackages } from "@/lib/api/service";
import { getShowrooms } from "@/lib/api/showrooms";
import { getFormat } from "@/lib/format/getFormat";
import { SectionHeading } from "./SectionHeading";

/** Test-drive call to action band. */
export async function TestDriveBand() {
  const t = await getTranslations("home.testDrive");
  return (
    <section aria-labelledby="td-band" className="on-dark mt-24 bg-graphite text-on-dark">
      <div className="container-page grid gap-8 py-16 lg:grid-cols-12 lg:items-center lg:py-20">
        <div className="lg:col-span-7">
          <p className="eyebrow text-accent-2">{t("eyebrow")}</p>
          <h2 id="td-band" className="display-lg mt-3">{t("title")}</h2>
          <p className="mt-4 max-w-xl text-muted-on-dark">{t("lead")}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
          <ButtonLink href="/test-drive" variant="light" size="lg" icon={<CalendarCheck aria-hidden className="size-4" />}>
            {t("cta")}
          </ButtonLink>
          <WhatsAppButton size="lg" context={{ kind: "testDrive" }} />
        </div>
      </div>
    </section>
  );
}

/** After-sales highlights. */
export async function AfterSales() {
  const [t, f, packages] = await Promise.all([getTranslations("home.afterSales"), getFormat(), getServicePackages()]);
  const from = Math.min(...packages.map((p) => p.price.amount));
  const items = [
    { key: "packages", Icon: Wrench, href: "/service", values: { count: f.number(packages.length), from: f.bdt(from) } },
    { key: "pickup", Icon: Truck, href: "/service/book", values: {} },
    { key: "battery", Icon: Zap, href: "/service/book?package=ev-battery", values: {} },
    { key: "tracking", Icon: ClipboardList, href: "/service/track", values: {} },
  ] as const;
  return (
    <section aria-labelledby="after-sales" className="container-page mt-24">
      <SectionHeading id="after-sales" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} link={{ href: "/service", label: t("all") }} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ key, Icon, href, values }) => (
          <li key={key}>
            <Link href={href} className="flex h-full flex-col gap-3 rounded-card border border-line bg-bg-alt p-6 transition-colors hover:border-ink/40">
              <Icon aria-hidden className="size-6 text-accent-ink" />
              <span className="font-medium">{t(`items.${key}.title`, values)}</span>
              <span className="text-sm text-muted">{t(`items.${key}.body`, values)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Sample testimonials (fictional, clearly labelled). */
export async function Testimonials() {
  const [t, locale, items] = await Promise.all([getTranslations("home.testimonials"), getLocale(), getTestimonials()]);
  return (
    <section aria-labelledby="testimonials" className="container-page mt-24">
      <SectionHeading id="testimonials" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <ul className="grid gap-5 md:grid-cols-3">
        {items.slice(0, 3).map((q) => (
          <li key={q.id}>
            <figure className="flex h-full flex-col gap-4 rounded-card border border-line bg-bg-alt p-6">
              <div className="flex items-center justify-between">
                <span className="flex gap-0.5 text-accent" role="img" aria-label={t("rating", { rating: q.rating })}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} aria-hidden className={i < q.rating ? "size-4 fill-current" : "size-4 text-line-strong"} />
                  ))}
                </span>
                <Badge tone="neutral">{t("sample")}</Badge>
              </div>
              <Quote aria-hidden className="size-6 text-accent/60" />
              <blockquote className="flex-1 leading-relaxed">{q.quote[locale]}</blockquote>
              <figcaption className="text-sm">
                <span className="font-medium">{q.name[locale]}</span>
                <span className="text-muted"> · {q.city[locale]} · {q.vehicleLabel}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted">{t("note")}</p>
    </section>
  );
}

/** Showroom strip with open-now status. */
export async function ShowroomStrip() {
  const [t, locale, showrooms] = await Promise.all([getTranslations("home.showrooms"), getLocale(), getShowrooms()]);
  return (
    <section aria-labelledby="showroom-strip" className="container-page mt-24 mb-24">
      <SectionHeading id="showroom-strip" eyebrow={t("eyebrow")} title={t("title")} link={{ href: "/showrooms", label: t("all") }} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {showrooms.map((s) => (
          <li key={s.id}>
            <Link href={`/showrooms#${s.slug}`} className="flex h-full flex-col gap-2 rounded-card border border-line bg-bg-alt p-5 transition-colors hover:border-ink/40">
              <span className="eyebrow text-muted">{s.city[locale]}</span>
              <span className="font-medium">{s.name[locale]}</span>
              <span className="mt-auto pt-2">
                <OpenNow hours={s.hours} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
