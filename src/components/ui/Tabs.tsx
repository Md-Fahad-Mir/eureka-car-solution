"use client";

import { useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TabItem = { value: string; label: ReactNode; content?: ReactNode };

/**
 * WAI-ARIA tabs with automatic activation and roving tabindex (←/→/Home/End).
 * Controlled: the parent owns `value` (so it can live in the URL when needed).
 */
export function Tabs({
  items,
  value,
  onValueChange,
  label,
  variant = "underline",
  className,
  listClassName,
}: {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  /** Accessible name of the tab list. */
  label: string;
  variant?: "underline" | "pill";
  className?: string;
  listClassName?: string;
}) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(0, items.findIndex((i) => i.value === value));

  const focusAt = (i: number) => {
    const next = (i + items.length) % items.length;
    onValueChange(items[next].value);
    refs.current[next]?.focus();
  };

  const active = items[index];

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={label}
        className={cn(
          "flex gap-1 overflow-x-auto [scrollbar-width:none]",
          variant === "underline" ? "border-b border-line" : "inline-flex rounded-full bg-ink/[0.06] p-1",
          listClassName,
        )}
        onKeyDown={(e) => {
          const target = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: items.length - 1 }[e.key];
          if (target === undefined) return;
          e.preventDefault();
          focusAt(target);
        }}
      >
        {items.map((item, i) => {
          const selected = i === index;
          return (
            <button
              key={item.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              id={`${id}-tab-${item.value}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={item.content !== undefined ? `${id}-panel-${item.value}` : undefined}
              tabIndex={selected ? 0 : -1}
              onClick={() => onValueChange(item.value)}
              className={cn(
                "shrink-0 text-sm font-medium whitespace-nowrap transition-colors",
                variant === "underline"
                  ? cn(
                      "-mb-px border-b-2 px-3 py-3",
                      selected ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink",
                    )
                  : cn(
                      "rounded-full px-4 py-2",
                      selected ? "bg-bg-alt text-ink shadow-sm" : "text-muted hover:text-ink",
                    ),
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {active?.content !== undefined ? (
        <div
          role="tabpanel"
          id={`${id}-panel-${active.value}`}
          aria-labelledby={`${id}-tab-${active.value}`}
          tabIndex={0}
          className="pt-6 focus-visible:outline-offset-4"
        >
          {active.content}
        </div>
      ) : null}
    </div>
  );
}
