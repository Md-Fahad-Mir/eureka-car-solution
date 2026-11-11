import type { ReactNode } from "react";
import { Inbox, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type StateProps = {
  title: string;
  body?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

function StateBlock({ title, body, icon, action, className, role }: StateProps & { role?: "alert" }) {
  return (
    <div
      role={role}
      className={cn(
        "flex flex-col items-center gap-3 rounded-card border border-dashed border-line-strong px-6 py-14 text-center",
        className,
      )}
    >
      <span className="grid size-12 place-items-center rounded-full bg-ink/[0.05] text-muted">{icon}</span>
      <h2 className="text-lg font-medium">{title}</h2>
      {body ? <p className="max-w-md text-sm text-muted">{body}</p> : null}
      {action ? <div className="mt-2 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}

export function EmptyState(props: StateProps) {
  return <StateBlock icon={<Inbox aria-hidden className="size-5" />} {...props} />;
}

export function ErrorState(props: StateProps) {
  return (
    <StateBlock role="alert" icon={<TriangleAlert aria-hidden className="size-5 text-danger" />} {...props} />
  );
}
