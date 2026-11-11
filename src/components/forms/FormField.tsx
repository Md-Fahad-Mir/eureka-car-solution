import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Label + control + hint + error wrapper. Pass the same `id` to the control and
 * use `fieldA11y(id, error, hint)` for its aria attributes.
 */
export function FormField({
  id,
  label,
  hint,
  error,
  optionalLabel,
  children,
  className,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  /** Already-translated error message. */
  error?: string;
  /** Translated "optional" marker; omit for required fields. */
  optionalLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {optionalLabel ? <span className="ml-1.5 font-normal text-muted">({optionalLabel})</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Aria attributes linking a control to its FormField hint/error. */
export function fieldA11y(id: string, error?: string, hint?: ReactNode) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  } as const;
}
