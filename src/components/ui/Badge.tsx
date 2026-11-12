import type { ComponentProps } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutral"
  | "accent"
  | "ev"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "dark"
  | "outline";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-ink/[0.06] text-ink",
  accent: "bg-accent/15 text-accent-ink",
  ev: "bg-ev-soft text-ev",
  success: "bg-success/12 text-success-ink",
  warning: "bg-warning/15 text-warning-ink",
  danger: "bg-danger/10 text-danger",
  info: "bg-info/10 text-info",
  dark: "bg-ink text-bg-alt",
  outline: "border border-line-strong text-ink",
};

/** Small status/label pill. Pair colour with text or an icon: never colour alone. */
export function Badge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium leading-5 whitespace-nowrap",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

/** Removable filter chip. `removeLabel` is the accessible name of the remove button. */
export function Chip({
  children,
  onRemove,
  removeLabel,
  className,
}: {
  children: React.ReactNode;
  onRemove: () => void;
  removeLabel: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-line-strong bg-bg-alt py-1 pr-1 pl-3 text-xs font-medium",
        className,
      )}
    >
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="grid size-6 place-items-center rounded-full text-muted transition-colors hover:bg-ink/[0.08] hover:text-ink"
      >
        <X aria-hidden className="size-3.5" />
      </button>
    </span>
  );
}
