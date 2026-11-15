import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useFormat } from "@/lib/format/useFormat";
import { stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Homepage section heading: a numbered eyebrow on a gold hairline (the page
 * reads as one numbered journey), a headline that rises out of a clip, an
 * optional lead and a round-arrow "view all" link.
 */
export function SectionHeading({
  id,
  index,
  eyebrow,
  title,
  lead,
  link,
  tone = "light",
  layout = "split",
  className,
}: {
  id: string;
  /** Position in the homepage journey (1-based), shown as "01". */
  index?: number;
  eyebrow?: string;
  title: ReactNode;
  lead?: string;
  link?: { href: string; label: string };
  /** `ev`: the teal of the EV panel for the eyebrow. */
  tone?: "light" | "dark" | "ev";
  /** `split`: text left, link right (full-width sections); `stack`: one column (inside panels). */
  layout?: "split" | "stack";
  className?: string;
}) {
  const f = useFormat();
  const dark = tone === "dark";
  const split = layout === "split";
  return (
    <div className={cn("mb-10 grid gap-6 md:mb-14", split && "lg:grid-cols-12 lg:items-end", className)}>
      <div className={cn(split && "lg:col-span-8")}>
        {eyebrow ? (
          <p data-reveal="fade" className={cn("eyebrow flex items-center gap-3", dark ? "text-accent-2" : tone === "ev" ? "text-ev" : "text-accent-ink")}>
            {index ? <span className="tabular">{f.number(index, { minimumIntegerDigits: 2 })}</span> : null}
            <span aria-hidden className={cn("scroll-grow-x h-px w-10", dark ? "bg-accent-2/70" : tone === "ev" ? "bg-ev/60" : "bg-accent")} />
            {eyebrow}
          </p>
        ) : null}
        <h2 id={id} data-reveal="mask" style={stagger(0, 80)} className="display-lg mt-4 max-w-3xl">
          {title}
        </h2>
        {lead ? (
          <p data-reveal style={stagger(0, 200)} className={cn("mt-5 max-w-xl text-[1.0625rem] leading-relaxed", dark ? "text-muted-on-dark" : "text-muted")}>
            {lead}
          </p>
        ) : null}
      </div>
      {link ? (
        <div data-reveal="fade" style={stagger(0, 320)} className={cn(split && "lg:col-span-4 lg:justify-self-end")}>
          <Link
            href={link.href}
            className={cn("group inline-flex items-center gap-3 text-sm font-medium", dark ? "text-accent-2" : "text-accent-ink")}
          >
            <span className="link-sweep pb-0.5">{link.label}</span>
            <span
              aria-hidden
              className={cn(
                "grid size-11 place-items-center rounded-full border transition-[background-color,border-color,color] duration-300",
                dark ? "border-line-on-dark group-hover:border-accent-2 group-hover:bg-accent-2 group-hover:text-ink" : "border-line-strong group-hover:border-ink group-hover:bg-ink group-hover:text-bg-alt",
              )}
            >
              <ArrowRight className="size-4 transition-transform duration-300 ease-(--ease-cinema) group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
