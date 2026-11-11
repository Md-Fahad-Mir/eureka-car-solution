import type { ComponentProps, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const fieldBase =
  "w-full rounded-xl border border-line-strong bg-bg-alt px-3.5 text-[0.9375rem] text-ink placeholder:text-muted/80 " +
  "transition-[border-color,box-shadow] duration-150 " +
  "hover:border-ink/40 focus:border-ink focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-accent/35 " +
  "disabled:cursor-not-allowed disabled:opacity-60 " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/25";

export function Input({
  className,
  prefix,
  suffix,
  ...props
}: Omit<ComponentProps<"input">, "prefix"> & { prefix?: ReactNode; suffix?: ReactNode }) {
  if (!prefix && !suffix) {
    return <input className={cn(fieldBase, "h-12", className)} {...props} />;
  }
  return (
    <div className="relative">
      {prefix ? (
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-muted">
          {prefix}
        </span>
      ) : null}
      <input
        className={cn(fieldBase, "h-12", prefix && "pl-9", suffix && "pr-14", className)}
        {...props}
      />
      {suffix ? (
        <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-muted">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(fieldBase, "min-h-28 py-3 leading-relaxed", className)} {...props} />;
}

/** Native select (best on mobile and for assistive tech), styled to match. */
export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select className={cn(fieldBase, "h-12 appearance-none pr-10", className)} {...props}>
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted"
      />
    </div>
  );
}
