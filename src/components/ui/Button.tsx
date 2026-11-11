import type { ComponentProps, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "accent"
  | "outline"
  | "ghost"
  | "whatsapp"
  | "light"
  | "outline-light";
export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none " +
  "transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-out-soft " +
  "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 " +
  "active:translate-y-px";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-bg-alt hover:bg-ink/85",
  accent: "bg-accent-ink text-white hover:bg-[#6a5530]",
  outline: "border border-line-strong text-ink hover:border-ink hover:bg-ink/[0.04]",
  ghost: "text-ink hover:bg-ink/[0.06]",
  whatsapp: "bg-whatsapp text-white hover:bg-[#19663f]",
  light: "on-dark bg-on-dark text-ink hover:bg-white",
  "outline-light": "on-dark border border-line-on-dark text-on-dark hover:border-on-dark hover:bg-white/5",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[0.8125rem]",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-[0.9375rem]",
  icon: "size-11",
  "icon-sm": "size-9",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonOwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Accessible text announced while loading (visually the spinner shows). */
  loadingLabel?: string;
  icon?: ReactNode;
};

export function Button({
  variant,
  size,
  loading,
  loadingLabel,
  icon,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ComponentProps<"button"> & ButtonOwnProps) {
  return (
    <button
      type={type}
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <LoaderCircle aria-hidden className="size-4 animate-spin" />
      ) : (
        icon
      )}
      {loading && loadingLabel ? <span className="sr-only">{loadingLabel}</span> : null}
      {children}
    </button>
  );
}

/** Internal, locale-aware link styled as a button. */
export function ButtonLink({
  variant,
  size,
  icon,
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & Omit<ButtonOwnProps, "loading" | "loadingLabel">) {
  return (
    <Link className={buttonVariants({ variant, size, className })} {...props}>
      {icon}
      {children}
    </Link>
  );
}
