"use client";

import { CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useToastStore, type ToastTone } from "@/stores/toast";

const icons: Record<ToastTone, typeof Info> = {
  success: CircleCheck,
  error: TriangleAlert,
  info: Info,
};

/** Renders toasts pushed via `toast()` in a polite live region. */
export function Toaster() {
  const t = useTranslations("a11y");
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
    >
      {toasts.map((toast) => {
        const Icon = icons[toast.tone];
        return (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className="pointer-events-auto flex w-full max-w-sm animate-[toast-in_.3s_var(--ease-out-soft)] items-start gap-3 rounded-2xl border border-line bg-bg-alt p-4 shadow-[0_24px_48px_-24px_rgba(22,26,22,0.45)]"
          >
            <Icon
              aria-hidden
              className={cn(
                "mt-0.5 size-5 shrink-0",
                toast.tone === "success" && "text-success",
                toast.tone === "error" && "text-danger",
                toast.tone === "info" && "text-info",
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{toast.title}</p>
              {toast.body ? <p className="mt-0.5 text-sm text-muted">{toast.body}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label={t("dismiss")}
              className="-m-1 grid size-8 place-items-center rounded-full text-muted hover:bg-ink/[0.06] hover:text-ink"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
