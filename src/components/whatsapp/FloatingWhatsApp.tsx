"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { whatsAppHref, type WhatsAppContext, type WhatsAppKind } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { useWhatsAppContextStore } from "@/stores/whatsappContext";
import { WhatsAppIcon } from "./WhatsAppButton";

type GenericKind = Exclude<WhatsAppKind, "vehicleInquiry" | "savings">;
const GENERIC: Record<GenericKind, WhatsAppContext> = {
  emiInquiry: { kind: "emiInquiry" },
  testDrive: { kind: "testDrive" },
  service: { kind: "service" },
  corporate: { kind: "corporate" },
  general: { kind: "general" },
};

/** Topic order depends on where the customer is, so the likeliest question comes first. */
function topicOrder(pathname: string): GenericKind[] {
  const first: GenericKind | null = pathname.startsWith("/service")
    ? "service"
    : pathname.startsWith("/finance") || pathname.startsWith("/savings")
      ? "emiInquiry"
      : pathname.startsWith("/test-drive")
        ? "testDrive"
        : null;
  const base: GenericKind[] = ["testDrive", "emiInquiry", "service", "corporate", "general"];
  return first ? [first, ...base.filter((k) => k !== first)] : base;
}

/**
 * Floating WhatsApp launcher on every page. Opens a small panel of
 * context-aware quick topics; each is a plain wa.me link with a prefilled
 * message. Hidden on mobile while a form field has focus (keyboard open).
 */
export function FloatingWhatsApp() {
  const t = useTranslations("whatsapp");
  const tA11y = useTranslations("a11y");
  const pathname = usePathname();
  const page = useWhatsAppContextStore((s) => s.page);
  const [open, setOpen] = useState(false);
  const [formFocused, setFormFocused] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close when the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Hide while typing in a form on small screens.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement && el.matches("input:not([type=checkbox]):not([type=radio]):not([type=range]), textarea, select");
    const onIn = (e: FocusEvent) => setFormFocused(mq.matches && isField(e.target));
    const onOut = () => setFormFocused(false);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, []);

  // Esc and outside click close the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const options: { key: string; label: string; href: string }[] = [
    ...(page ? [{ key: "page", label: page.label, href: whatsAppHref(t, page.context) }] : []),
    ...topicOrder(pathname).map((k) => ({
      key: k,
      label: t(`options.${k}`),
      href: whatsAppHref(t, GENERIC[k]),
    })),
  ];

  return (
    <div
      ref={rootRef}
      className={cn(
        "fixed right-4 z-[60] flex flex-col items-end gap-3 transition-[opacity,transform,bottom] duration-200 sm:right-6",
        // Sits above the compare tray when it's open (height published as --compare-tray-h).
        "bottom-[calc(var(--compare-tray-h,0px)+1rem)] sm:bottom-[calc(var(--compare-tray-h,0px)+1.5rem)]",
        formFocused && "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${panelId}-title`}
          className="w-[min(calc(100vw-2rem),22rem)] animate-[toast-in_.25s_var(--ease-out-soft)] overflow-hidden rounded-[24px] border border-line bg-bg-alt shadow-[0_32px_64px_-28px_rgba(14,14,16,0.5)]"
        >
          <div className="on-dark flex items-start justify-between gap-3 bg-graphite px-5 pt-5 pb-4 text-on-dark">
            <div>
              <h2 id={`${panelId}-title`} className="text-base font-medium">
                {t("panelTitle")}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-on-dark">{t("panelLead")}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={tA11y("close")}
              className="-m-1 grid size-9 shrink-0 place-items-center rounded-full hover:bg-white/10"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
          <ul className="p-2">
            {options.map((o, i) => (
              <li key={o.key}>
                <a
                  href={o.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  autoFocus={i === 0}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between gap-3 rounded-2xl px-3.5 py-3 text-sm transition-colors hover:bg-ink/[0.05]"
                >
                  <span className={cn(o.key === "page" && "font-medium")}>{o.label}</span>
                  <ArrowUpRight aria-hidden className="size-4 shrink-0 text-muted" />
                  <span className="sr-only">{tA11y("opensInNewTab")}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={t("floatingLabel")}
        className="grid size-14 place-items-center rounded-full bg-whatsapp text-white shadow-[0_16px_32px_-12px_rgba(31,122,77,0.65)] transition-transform duration-200 hover:scale-105 active:scale-95"
      >
        {open ? <X aria-hidden className="size-6" /> : <WhatsAppIcon className="size-7" />}
      </button>
    </div>
  );
}
