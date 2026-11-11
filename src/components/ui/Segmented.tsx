"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/** Compact single-choice toggle built on native radios (arrow keys move between options). */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onValueChange,
  tone = "light",
  className,
}: {
  /** Accessible name of the group. */
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onValueChange: (value: T) => void;
  tone?: "light" | "dark";
  className?: string;
}) {
  const name = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex rounded-full p-0.5",
        tone === "light" ? "bg-ink/[0.06]" : "bg-white/10",
        className,
      )}
    >
      {options.map((o) => {
        const checked = o.value === value;
        return (
          <label
            key={o.value}
            className={cn(
              "cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-accent-ink",
              checked
                ? tone === "light"
                  ? "bg-bg-alt text-ink shadow-sm"
                  : "bg-on-dark text-ink"
                : tone === "light"
                  ? "text-muted hover:text-ink"
                  : "text-muted-on-dark hover:text-on-dark",
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={checked}
              onChange={() => onValueChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        );
      })}
    </div>
  );
}
