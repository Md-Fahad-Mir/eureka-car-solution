import type { ComponentProps, ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Checkbox with label. Uses a native input for keyboard and form semantics. */
export function Checkbox({
  label,
  description,
  className,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { label: ReactNode; description?: ReactNode }) {
  return (
    <label className={cn("group flex cursor-pointer items-start gap-3 text-sm", className)}>
      <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
        <input
          type="checkbox"
          className="peer absolute inset-0 cursor-pointer appearance-none rounded-md border border-line-strong bg-bg-alt transition-colors checked:border-ink checked:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink aria-[invalid=true]:border-danger"
          {...props}
        />
        <Check aria-hidden className="pointer-events-none relative size-3.5 text-bg-alt opacity-0 peer-checked:opacity-100" strokeWidth={3} />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="leading-snug">{label}</span>
        {description ? <span className="text-xs text-muted">{description}</span> : null}
      </span>
    </label>
  );
}

/**
 * Radio (or checkbox) rendered as a selectable card. Native input keeps
 * arrow-key navigation within a radio group.
 */
export function RadioCard({
  label,
  description,
  aside,
  type = "radio",
  className,
  ...props
}: Omit<ComponentProps<"input">, "type"> & {
  label: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  type?: "radio" | "checkbox";
}) {
  return (
    <label
      className={cn(
        "relative flex cursor-pointer items-start gap-3 rounded-2xl border border-line-strong bg-bg-alt p-4 transition-[border-color,box-shadow] duration-150",
        "hover:border-ink/50 has-[:checked]:border-ink has-[:checked]:shadow-[inset_0_0_0_1px_var(--ink)]",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-ink",
        "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        className,
      )}
    >
      <input type={type} className="peer sr-only" {...props} />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center border border-line-strong bg-bg-alt transition-colors peer-checked:border-ink peer-checked:bg-ink",
          type === "radio" ? "rounded-full" : "rounded-md",
        )}
      >
        <Check className="size-3 text-bg-alt" strokeWidth={3} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-medium leading-snug">{label}</span>
        {description ? <span className="text-sm text-muted">{description}</span> : null}
      </span>
      {aside ? <span className="shrink-0 text-sm font-medium">{aside}</span> : null}
    </label>
  );
}
