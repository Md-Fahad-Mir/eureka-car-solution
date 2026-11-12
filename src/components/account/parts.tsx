import type { ReactNode } from "react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { EmiPaymentStatus, FinanceStatus, PurchaseInquiry, ReferralStatus, ServiceStatus, TestDriveStatus } from "@/types";

/** Status → badge tone. Every badge also carries its text label (never colour alone). */
export const TONES = {
  testDrive: { requested: "info", confirmed: "success", completed: "neutral", cancelled: "danger" } satisfies Record<TestDriveStatus, BadgeTone>,
  inquiry: { received: "info", contacted: "success", closed: "neutral" } satisfies Record<PurchaseInquiry["status"], BadgeTone>,
  finance: { submitted: "info", underReview: "warning", documentsVerified: "accent", decision: "success" } satisfies Record<FinanceStatus, BadgeTone>,
  service: { booked: "info", received: "warning", inService: "warning", qualityCheck: "warning", ready: "success", delivered: "neutral" } satisfies Record<ServiceStatus, BadgeTone>,
  emi: { paid: "success", due: "warning", overdue: "danger", upcoming: "neutral" } satisfies Record<EmiPaymentStatus, BadgeTone>,
  referral: { invited: "neutral", testDriven: "info", purchased: "success" } satisfies Record<ReferralStatus, BadgeTone>,
} as const;

export function StatusBadge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return <Badge tone={tone}>{children}</Badge>;
}

export function SectionHeader({ title, lead, action }: { title: string; lead?: string; action?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="display-md">{title}</h1>
        {lead ? <p className="mt-2 max-w-2xl text-muted">{lead}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-3">{action}</div> : null}
    </header>
  );
}

/** A record (booking, inquiry, application) as a card with a details grid. */
export function RecordCard({ title, badge, meta, children, actions }: { title: string; badge?: ReactNode; meta?: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <article className="flex flex-col gap-4 rounded-card border border-line bg-bg-alt p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-medium">{title}</h2>
          {meta ? <p className="mt-0.5 text-xs text-muted tabular">{meta}</p> : null}
        </div>
        {badge}
      </div>
      {children ? <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-3">{children}</dl> : null}
      {actions ? <div className="flex flex-wrap gap-3 border-t border-line pt-4">{actions}</div> : null}
    </article>
  );
}

export function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
