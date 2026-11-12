import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Progress indicator for multi-step flows. `current` is zero-based.
 * Completed steps can be revisited through `onStepClick` (state is kept by the parent).
 */
export function Stepper({
  steps,
  current,
  onStepClick,
  className,
}: {
  steps: string[];
  current: number;
  onStepClick?: (index: number) => void;
  className?: string;
}) {
  const t = useTranslations("a11y");
  const progress = steps.length > 1 ? (current / (steps.length - 1)) * 100 : 100;

  return (
    <nav aria-label={t("stepOf", { current: current + 1, total: steps.length })} className={className}>
      <p className="mb-3 text-sm text-muted sm:hidden">
        {t("stepOf", { current: current + 1, total: steps.length })}:{" "}
        <span className="font-medium text-ink">{steps[current]}</span>
      </p>
      <div className="h-[3px] overflow-hidden rounded-full bg-line-strong sm:hidden" aria-hidden>
        <div className="h-full bg-ink transition-[width] duration-500" style={{ width: `${progress}%` }} />
      </div>
      <ol className="hidden items-center gap-2 sm:flex">
        {steps.map((label, i) => {
          const done = i < current;
          const isCurrent = i === current;
          const clickable = done && onStepClick;
          const content = (
            <>
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold tabular",
                  done && "border-ink bg-ink text-bg-alt",
                  isCurrent && "border-ink text-ink",
                  !done && !isCurrent && "border-line-strong text-muted",
                )}
              >
                {done ? <Check aria-hidden className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              {/* Inactive labels shrink with an ellipsis so long flows (7 steps) never overlap. */}
              <span
                title={isCurrent ? undefined : label}
                className={cn("text-sm whitespace-nowrap", isCurrent ? "shrink-0 font-medium text-ink" : "min-w-0 truncate text-muted")}
              >
                {label}
                {done ? <span className="sr-only"> ({t("completed")})</span> : null}
              </span>
            </>
          );
          return (
            <li key={label} className={cn("flex flex-1 items-center gap-2 last:flex-none", isCurrent ? "min-w-fit" : "min-w-0")}>
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onStepClick(i)}
                  className="flex min-w-0 items-center gap-2 rounded-full pr-1 hover:opacity-80"
                >
                  {content}
                </button>
              ) : (
                <span className={cn("flex items-center gap-2", !isCurrent && "min-w-0")} aria-current={isCurrent ? "step" : undefined}>
                  {content}
                </span>
              )}
              {i < steps.length - 1 ? (
                <span aria-hidden className={cn("h-px min-w-4 flex-1", done ? "bg-ink" : "bg-line-strong")} />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
