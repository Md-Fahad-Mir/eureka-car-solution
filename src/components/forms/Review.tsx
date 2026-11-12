import type { ReactNode } from "react";
import { Pencil } from "lucide-react";

/** A titled block on a stepper's review step, with an "Edit" link back to that step. */
export function ReviewSection({ title, onEdit, editLabel, children }: { title: string; onEdit: () => void; editLabel: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-bg p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1 text-xs font-medium text-accent-ink hover:underline">
          <Pencil aria-hidden className="size-3" />
          {editLabel}
          <span className="sr-only"> {title}</span>
        </button>
      </div>
      <dl className="grid gap-1.5 text-sm">{children}</dl>
    </section>
  );
}

export function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium break-words">{value}</dd>
    </div>
  );
}
