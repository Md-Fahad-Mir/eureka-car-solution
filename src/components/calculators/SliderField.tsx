"use client";

import { useId, useState, type ReactNode } from "react";
import { Slider } from "@/components/ui/Slider";
import { cn } from "@/lib/utils";

/**
 * Label + slider + exact numeric input, kept in sync. The input accepts
 * typed values (clamped on blur); the slider is for quick adjustment.
 */
export function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  suffix,
  aside,
  tone = "light",
  inputWidth = "w-28",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Formatted current value for screen readers and the hint line. */
  display: string;
  suffix?: string;
  aside?: ReactNode;
  tone?: "light" | "dark";
  inputWidth?: string;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={`${id}-input`} className="text-sm font-medium">
          {label}
        </label>
        {aside}
      </div>
      <div className="flex items-center gap-3">
        <Slider
          id={`${id}-slider`}
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={clamp(value)}
          onValueChange={(v) => {
            setDraft(null);
            onChange(v);
          }}
          valueText={display}
          className="flex-1"
        />
        <div className="relative">
          <input
            id={`${id}-input`}
            inputMode="decimal"
            value={draft ?? String(Math.round(value * 100) / 100)}
            onChange={(e) => {
              setDraft(e.target.value);
              const n = Number(e.target.value.replace(/[^\d.]/g, ""));
              if (e.target.value.trim() !== "" && Number.isFinite(n)) onChange(clamp(n));
            }}
            onBlur={() => setDraft(null)}
            aria-describedby={`${id}-display`}
            className={cn(
              "h-10 rounded-xl border px-3 text-right text-sm tabular focus:ring-2 focus:ring-accent/35 focus:outline-none",
              suffix && "pr-9",
              tone === "light" ? "border-line-strong bg-bg-alt focus:border-ink" : "border-line-on-dark bg-white/5 text-on-dark",
              inputWidth,
            )}
          />
          {suffix ? (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted">{suffix}</span>
          ) : null}
        </div>
      </div>
      <p id={`${id}-display`} className="text-xs text-muted tabular">
        {display}
      </p>
    </div>
  );
}
