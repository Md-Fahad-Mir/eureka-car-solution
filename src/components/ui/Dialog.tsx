"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type Placement = "center" | "right" | "left" | "bottom" | "full";

const placements: Record<Placement, string> = {
  center:
    "m-auto w-[min(100%-2rem,36rem)] max-h-[min(90dvh,48rem)] rounded-[24px] data-[open=true]:animate-[toast-in_.25s_var(--ease-out-soft)]",
  right: "ml-auto mr-0 my-0 h-dvh max-h-dvh w-[min(100%,28rem)] rounded-l-[24px]",
  left: "mr-auto ml-0 my-0 h-dvh max-h-dvh w-[min(100%,28rem)] rounded-r-[24px]",
  bottom: "mx-auto mb-0 mt-auto max-h-[85dvh] w-full max-w-3xl rounded-t-[24px]",
  full: "m-0 h-dvh max-h-dvh w-full max-w-none",
};

/**
 * Modal overlay built on the native <dialog> element: the rest of the page
 * becomes inert (focus is trapped), Esc closes, and focus returns to the
 * opener on close. `Sheet` is the same component with an edge placement.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  hideTitle,
  placement = "center",
  tone = "light",
  children,
  footer,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** Keep the title for screen readers only. */
  hideTitle?: boolean;
  placement?: Placement;
  tone?: "light" | "dark";
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const t = useTranslations("a11y");
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
    }
    return () => {
      if (!open) return;
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      data-open={open}
      onCancel={(e) => {
        e.preventDefault();
        onOpenChange(false);
      }}
      onClose={() => {
        document.documentElement.style.overflow = "";
        if (open) onOpenChange(false);
      }}
      onClick={(e) => {
        // A click on the <dialog> itself (not its content) is a backdrop click.
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
      className={cn(
        "p-0 backdrop:bg-transparent",
        tone === "light" ? "bg-bg-alt text-ink" : "on-dark bg-graphite text-on-dark",
        placements[placement],
        className,
      )}
    >
      {open ? (
        <div className="flex h-full max-h-[inherit] flex-col">
          <header
            className={cn(
              "flex items-start justify-between gap-4 px-5 pt-5 pb-3 sm:px-6",
              hideTitle && "absolute top-0 right-0 z-10",
            )}
          >
            <div className={cn("flex flex-col gap-1", hideTitle && "sr-only")}>
              <h2 id={titleId} className="text-lg font-medium leading-snug">
                {title}
              </h2>
              {description ? (
                <p id={descId} className={cn("text-sm", tone === "light" ? "text-muted" : "text-muted-on-dark")}>
                  {description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label={t("close")}
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-full transition-colors",
                tone === "light" ? "hover:bg-ink/[0.06]" : "hover:bg-white/10",
              )}
            >
              <X aria-hidden className="size-5" />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 sm:px-6">{children}</div>
          {footer ? (
            <footer
              className={cn(
                "border-t px-5 py-4 sm:px-6",
                tone === "light" ? "border-line" : "border-line-on-dark",
              )}
            >
              {footer}
            </footer>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}

/** Edge-anchored drawer (filters, mobile nav, compare tray). */
export function Sheet({
  side = "right",
  ...props
}: Omit<Parameters<typeof Dialog>[0], "placement"> & { side?: "right" | "left" | "bottom" | "full" }) {
  return <Dialog placement={side} {...props} />;
}
