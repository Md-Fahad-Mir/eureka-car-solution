"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const thumb =
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none " +
  "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-bg-alt " +
  "[&::-webkit-slider-thumb]:bg-ink [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:cursor-grab " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full " +
  "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-bg-alt [&::-moz-range-thumb]:bg-ink [&::-moz-range-thumb]:cursor-grab " +
  "focus-visible:outline-none focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-accent/40 " +
  "focus-visible:[&::-moz-range-thumb]:ring-4 focus-visible:[&::-moz-range-thumb]:ring-accent/40";

function pct(value: number, min: number, max: number) {
  return max === min ? 0 : ((value - min) / (max - min)) * 100;
}

type SliderProps = Omit<ComponentProps<"input">, "type" | "value" | "onChange" | "min" | "max"> & {
  value: number;
  min: number;
  max: number;
  onValueChange: (value: number) => void;
  /** Human-readable value for screen readers, e.g. "৳45 lakh". */
  valueText?: string;
};

/** Single-value range slider (native input for keyboard + screen reader support). */
export function Slider({ value, min, max, onValueChange, valueText, className, ...props }: SliderProps) {
  const fill = pct(value, min, max);
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      aria-valuetext={valueText}
      onChange={(e) => onValueChange(Number(e.target.value))}
      className={cn("h-6 w-full cursor-pointer appearance-none bg-transparent", thumb, className)}
      style={{
        background: `linear-gradient(to right, var(--ink) ${fill}%, var(--line-strong) ${fill}%) center / 100% 3px no-repeat`,
      }}
      {...props}
    />
  );
}

/** Two-thumb range slider built from two overlapping native inputs. */
export function RangeSlider({
  value,
  min,
  max,
  step = 1,
  onValueChange,
  labels,
  valueTexts,
  className,
}: {
  value: [number, number];
  min: number;
  max: number;
  step?: number;
  onValueChange: (value: [number, number]) => void;
  /** Accessible names for the lower and upper thumbs. */
  labels: [string, string];
  valueTexts?: [string, string];
  className?: string;
}) {
  const [lo, hi] = value;
  const a = pct(lo, min, max);
  const b = pct(hi, min, max);
  const input = cn(
    "pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent",
    thumb,
  );
  return (
    <div className={cn("relative h-6", className)}>
      <div
        aria-hidden
        className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full"
        style={{
          background: `linear-gradient(to right, var(--line-strong) ${a}%, var(--ink) ${a}%, var(--ink) ${b}%, var(--line-strong) ${b}%)`,
        }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={lo}
        aria-label={labels[0]}
        aria-valuetext={valueTexts?.[0]}
        onChange={(e) => onValueChange([Math.min(Number(e.target.value), hi), hi])}
        className={cn(input, lo > max - (max - min) * 0.05 && "z-10")}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={hi}
        aria-label={labels[1]}
        aria-valuetext={valueTexts?.[1]}
        onChange={(e) => onValueChange([lo, Math.max(Number(e.target.value), lo)])}
        className={input}
      />
    </div>
  );
}
