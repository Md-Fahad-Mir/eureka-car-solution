import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Homepage section heading: eyebrow, title, optional lead and a "view all" link. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  link,
  tone = "light",
}: {
  id: string;
  eyebrow?: string;
  title: ReactNode;
  lead?: string;
  link?: { href: string; label: string };
  tone?: "light" | "dark";
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <p className={cn("eyebrow", tone === "dark" ? "text-accent-2" : "text-accent-ink")}>{eyebrow}</p> : null}
        <h2 id={id} className="display-md mt-2">
          {title}
        </h2>
        {lead ? <p className={cn("mt-3", tone === "dark" ? "text-muted-on-dark" : "text-muted")}>{lead}</p> : null}
      </div>
      {link ? (
        <Link
          href={link.href}
          className={cn(
            "group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline",
            tone === "dark" ? "text-accent-2" : "text-accent-ink",
          )}
        >
          {link.label}
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}
