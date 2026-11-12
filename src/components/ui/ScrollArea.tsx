import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Horizontally scrollable region (wide tables on phones). Focusable and
 * labelled so keyboard users can scroll it (WCAG 2.1.1); `relative` keeps
 * absolutely positioned descendants, such as `sr-only` text, inside the
 * scroll box so they can't widen the page.
 */
export function ScrollArea({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cn("relative overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink", className)}
    >
      {children}
    </div>
  );
}
