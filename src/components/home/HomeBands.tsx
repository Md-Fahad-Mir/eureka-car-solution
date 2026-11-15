import { ArrowUpRight, CalendarCheck, ClipboardList, MapPin, Truck, Wrench, Zap } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { OpenNow } from "@/components/showroom/OpenNow";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { Link } from "@/i18n/navigation";
import { getTestimonials } from "@/lib/api/content";
import { getServicePackages } from "@/lib/api/service";
import { getShowrooms } from "@/lib/api/showrooms";
import { getFormat } from "@/lib/format/getFormat";
import { stagger } from "@/lib/motion";
import { SectionHeading } from "./SectionHeading";
import { TestimonialStage } from "./TestimonialStage";

const TEST_DRIVE_STEPS = ["choose", "time", "drive"] as const;

/**
 * Test-drive call to action: a dark, cinematic band. Lane lines rush towards
 * the viewer on a tilted road (compositor-only transforms), a gold light
 * drifts behind the headline, and the three booking steps are joined by a
 * line that draws in with the scroll.
 */
export async function TestDriveBand({ index }: { index: number }) {
  const [t, f] = await Promise.all([getTranslations("home.testDrive"), getFormat()]);
  return (
    <section aria-labelledby="td-band" className="on-dark section-gap relative isolate overflow-hidden bg-dark text-on-dark">
      <div aria-hidden className="road-stage">
        <div className="road" />
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute -top-1/4 left-[10%] -z-10 h-[90%] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgb(200_176_124/0.2),transparent)] motion-safe:animate-[light-drift_18s_var(--ease-in-out-soft)_infinite]"
      />
      <div className="container-page py-20 lg:py-28">
        <SectionHeading id="td-band" index={index} tone="dark" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} className="[&_h2]:display-xl" />
        <ol className="relative grid gap-8 sm:grid-cols-3 sm:gap-6">
          <span aria-hidden className="scroll-grow-x absolute top-5 right-[16%] left-5 hidden h-px bg-(image:--gold) sm:block" />
          {TEST_DRIVE_STEPS.map((step, i) => (
            <li key={step} data-reveal style={stagger(i, 200)} className="relative flex gap-4 sm:flex-col">
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-accent-2/60 bg-dark text-sm text-accent-2 tabular">
                {f.number(i + 1)}
              </span>
              <span>
                <span className="block text-lg font-medium">{t(`steps.${step}.title`)}</span>
                <span className="mt-1 block max-w-xs text-sm leading-relaxed text-muted-on-dark">{t(`steps.${step}.body`)}</span>
              </span>
            </li>
          ))}
        </ol>
        <div data-reveal style={stagger(0, 450)} className="mt-14 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/test-drive" variant="light" size="lg" className="sheen group" icon={<CalendarCheck aria-hidden className="size-4 transition-transform duration-500 group-hover:-rotate-12" />}>
            {t("cta")}
          </ButtonLink>
          <WhatsAppButton size="lg" context={{ kind: "testDrive" }} />
        </div>
      </div>
    </section>
  );
}

/**
 * After-sales care as a short story: the heading stays in view while the four
 * services pass beside it, joined by a line that fills with the scroll. Each
 * icon acts out its service on hover.
 */
export async function AfterSales({ index }: { index: number }) {
  const [t, f, packages] = await Promise.all([getTranslations("home.afterSales"), getFormat(), getServicePackages()]);
  const from = Math.min(...packages.map((p) => p.price.amount));
  const items = [
    { key: "packages", Icon: Wrench, hover: "group-hover:rotate-[-30deg]", href: "/service", values: { count: f.number(packages.length), from: f.bdt(from) } },
    { key: "pickup", Icon: Truck, hover: "group-hover:translate-x-1.5", href: "/service/book", values: {} },
    { key: "battery", Icon: Zap, hover: "group-hover:scale-125", href: "/service/book?package=ev-battery", values: {} },
    { key: "tracking", Icon: ClipboardList, hover: "group-hover:-translate-y-1", href: "/service/track", values: {} },
  ] as const;
  return (
    <section aria-labelledby="after-sales" className="container-page section-gap">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h-compact)+3rem)]">
            <SectionHeading id="after-sales" index={index} eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} link={{ href: "/service", label: t("all") }} layout="stack" className="mb-0 md:mb-0" />
          </div>
        </div>
        <ol className="relative flex flex-col lg:col-span-7">
          <span aria-hidden className="absolute top-2 bottom-2 left-[1.375rem] w-px bg-line" />
          <span aria-hidden className="scroll-grow-y absolute top-2 bottom-2 left-[1.375rem] w-px bg-accent" />
          {items.map(({ key, Icon, hover, href, values }, i) => (
            <li key={key} data-reveal style={stagger(i)}>
              <Link href={href} className="group relative flex gap-6 rounded-card py-6 pr-4 transition-colors duration-300 hover:bg-bg-alt/70 sm:gap-8">
                <span className="relative grid size-11 shrink-0 place-items-center rounded-full border border-line bg-bg-alt text-accent-ink shadow-(--shadow-soft) transition-[border-color] duration-300 group-hover:border-accent">
                  <Icon aria-hidden className={`size-5 transition-transform duration-500 ease-(--ease-cinema) ${hover}`} />
                </span>
                <span className="flex-1 pt-1.5">
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-xl font-medium">{t(`items.${key}.title`, values)}</span>
                    <ArrowUpRight aria-hidden className="size-5 shrink-0 text-muted opacity-0 transition-[opacity,transform] duration-500 ease-(--ease-cinema) group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </span>
                  <span className="mt-1.5 block max-w-md leading-relaxed text-muted">{t(`items.${key}.body`, values)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Sample testimonials (fictional, clearly labelled), presented one at a time. */
export async function Testimonials({ index }: { index: number }) {
  const [t, locale, items] = await Promise.all([getTranslations("home.testimonials"), getLocale(), getTestimonials()]);
  const quotes = items.slice(0, 3).map((q) => ({ id: q.id, quote: q.quote[locale], name: q.name[locale], city: q.city[locale], vehicle: q.vehicleLabel, rating: q.rating }));
  return (
    <section aria-labelledby="testimonials" className="container-page section-gap">
      <SectionHeading id="testimonials" index={index} eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <div data-reveal>
        <TestimonialStage
          quotes={quotes}
          labels={{
            sample: t("sample"),
            previous: t("previous"),
            next: t("next"),
            ratings: quotes.map((q) => t("rating", { rating: q.rating })),
            positions: quotes.map((_, i) => t("position", { n: i + 1, total: quotes.length })),
            region: t("title"),
          }}
        />
      </div>
      <p className="mt-5 text-xs text-muted">{t("note")}</p>
    </section>
  );
}

/** Showrooms with open-now status; pins drop in on hover. */
export async function ShowroomStrip({ index }: { index: number }) {
  const [t, locale, showrooms] = await Promise.all([getTranslations("home.showrooms"), getLocale(), getShowrooms()]);
  return (
    <section aria-labelledby="showroom-strip" className="container-page section-gap mb-28">
      <SectionHeading id="showroom-strip" index={index} eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} link={{ href: "/showrooms", label: t("all") }} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {showrooms.map((s, i) => (
          <li key={s.id} data-reveal style={stagger(i)}>
            <Link
              href={`/showrooms#${s.slug}`}
              className="group flex h-full flex-col gap-3 rounded-card border border-line bg-bg-alt p-5 transition-[transform,box-shadow,border-color] duration-500 ease-(--ease-cinema) hover:-translate-y-1 hover:border-transparent hover:shadow-(--shadow-lift)"
            >
              <span className="flex items-center justify-between">
                <span className="eyebrow text-muted">{s.city[locale]}</span>
                <MapPin aria-hidden className="size-4 text-accent-ink transition-transform duration-500 ease-(--ease-cinema) group-hover:-translate-y-1" />
              </span>
              <span className="text-lg leading-snug font-medium">{s.name[locale]}</span>
              <span className="mt-auto pt-3">
                <OpenNow hours={s.hours} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
