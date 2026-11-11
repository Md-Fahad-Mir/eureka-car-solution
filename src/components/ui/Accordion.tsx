import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccordionItem = { id: string; title: ReactNode; content: ReactNode; defaultOpen?: boolean };

/**
 * Disclosure list on native <details>/<summary>: keyboard and screen-reader
 * support for free, works without JavaScript, and content stays findable
 * with in-page search.
 */
export function Accordion({
  items,
  className,
  headingLevel = 3,
}: {
  items: AccordionItem[];
  className?: string;
  headingLevel?: 2 | 3 | 4;
}) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((item) => (
        <details key={item.id} id={item.id} open={item.defaultOpen} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
            <Heading className="text-base font-medium">{item.title}</Heading>
            <ChevronDown
              aria-hidden
              className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <div className="pb-6 text-[0.9375rem] leading-relaxed text-ink/85">{item.content}</div>
        </details>
      ))}
    </div>
  );
}
