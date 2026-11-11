import { ArrowUpRight, MapPin, Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { useFormat } from "@/lib/format/useFormat";
import { WEEKDAYS, type OpeningHours, type Showroom, type Weekday } from "@/types";

/** Google Maps search link: works without an API key. */
export const directionsUrl = (s: Showroom) =>
  `https://www.google.com/maps/search/?api=1&query=${s.geo.lat},${s.geo.lng}`;

/** Groups consecutive weekdays with identical hours: "Saturday – Thursday 10:00 – 19:00". */
export function groupHours(hours: Record<Weekday, OpeningHours>) {
  const groups: { from: Weekday; to: Weekday; hours: OpeningHours }[] = [];
  for (const day of WEEKDAYS) {
    const last = groups.at(-1);
    const h = hours[day];
    if (last && JSON.stringify(last.hours) === JSON.stringify(h)) last.to = day;
    else groups.push({ from: day, to: day, hours: h });
  }
  return groups;
}

/** Showroom summary card: address, phone, weekly hours, services and directions. */
export function ShowroomCard({ showroom: s, headingLevel = 3 }: { showroom: Showroom; headingLevel?: 2 | 3 }) {
  const t = useTranslations("showroomCard");
  const tTax = useTranslations("taxonomy");
  const tA11y = useTranslations("a11y");
  const locale = useLocale();
  const f = useFormat();
  const Heading = `h${headingLevel}` as const;

  return (
    <article className="flex h-full flex-col gap-4 rounded-card border border-line bg-bg-alt p-5">
      <div>
        <p className="eyebrow text-muted">{s.city[locale]}</p>
        <Heading className="mt-1.5 text-lg font-medium">{s.name[locale]}</Heading>
      </div>
      <p className="flex items-start gap-2.5 text-sm">
        <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
        {s.address[locale]}
      </p>
      <a href={s.phone.href} className="flex items-center gap-2.5 text-sm hover:text-accent-ink">
        <Phone aria-hidden className="size-4 text-muted" />
        <span className="tabular">{f.digits(s.phone.display)}</span>
      </a>
      <dl className="text-sm">
        {groupHours(s.hours).map((g) => (
          <div key={g.from} className="flex justify-between gap-3 py-0.5">
            <dt className="text-muted">
              {g.from === g.to ? tTax(`weekday.${g.from}`) : t("dayRange", { from: tTax(`weekday.${g.from}`), to: tTax(`weekday.${g.to}`) })}
            </dt>
            <dd className="tabular">
              {g.hours ? `${f.time(g.hours.open)} – ${f.time(g.hours.close)}` : t("closed")}
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap gap-1.5">
        {s.services.map((service) => (
          <Badge key={service} tone="neutral">
            {tTax(`showroomService.${service}`)}
          </Badge>
        ))}
      </div>
      <a
        href={directionsUrl(s)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-accent-ink underline-offset-4 hover:underline"
      >
        {t("directions")}
        <ArrowUpRight aria-hidden className="size-4" />
        <span className="sr-only">{tA11y("opensInNewTab")}</span>
      </a>
    </article>
  );
}
