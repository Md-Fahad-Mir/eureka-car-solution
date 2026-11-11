import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type TimelineStep = {
  key: string;
  label: string;
  /** Formatted completion time; null/undefined = not reached. */
  at?: string | null;
  description?: string;
};

/**
 * Vertical status timeline (finance applications, service tracking).
 * Done / current / upcoming are conveyed by icon and text, not colour alone.
 */
export function Timeline({ steps, currentKey }: { steps: TimelineStep[]; currentKey: string }) {
  const t = useTranslations("timeline");
  const currentIndex = Math.max(0, steps.findIndex((s) => s.key === currentKey));

  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => {
        const state = i < currentIndex || (i === currentIndex && step.at) ? "done" : i === currentIndex ? "current" : "upcoming";
        const isCurrent = i === currentIndex;
        return (
          <li key={step.key} className="relative flex gap-4 pb-7 last:pb-0" aria-current={isCurrent ? "step" : undefined}>
            {i < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn("absolute top-9 left-[17px] h-[calc(100%-2.25rem)] w-0.5", i < currentIndex ? "bg-success" : "bg-line-strong")}
              />
            ) : null}
            <span
              aria-hidden
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-full border-2 text-xs font-semibold",
                state === "done" && "border-success bg-success text-white",
                state === "current" && "border-ink bg-bg-alt text-ink",
                state === "upcoming" && "border-line-strong bg-bg-alt text-muted",
              )}
            >
              {state === "done" ? <Check className="size-4" strokeWidth={3} /> : i + 1}
            </span>
            <div className="pt-1.5">
              <p className={cn("font-medium", state === "upcoming" && "text-muted")}>
                {step.label}
                <span className="sr-only"> ({t(state)})</span>
              </p>
              {step.at ? <p className="mt-0.5 text-sm text-muted tabular">{step.at}</p> : null}
              {step.description ? <p className="mt-1 text-sm text-muted">{step.description}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
