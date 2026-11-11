"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, GitCompareArrows, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { VehicleImage } from "@/components/media/VehicleImage";
import { buttonVariants } from "@/components/ui/Button";
import { Link, usePathname } from "@/i18n/navigation";
import { getVehiclesByIds } from "@/lib/api/vehicles";
import { useFormat } from "@/lib/format/useFormat";
import { cn } from "@/lib/utils";
import { brandInitial, vehicleName } from "@/lib/vehicle";
import { MAX_COMPARE, useCompareStore } from "@/stores/compare";
import { useHydrated } from "@/stores/hydration";
import type { VehicleWithBrand } from "@/types";

/**
 * Persistent compare tray (bottom sheet). Visible whenever vehicles are
 * queued for comparison, except on /compare itself.
 */
export function CompareTray() {
  const t = useTranslations("compareTray");
  const locale = useLocale();
  const f = useFormat();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const ids = useCompareStore((s) => s.ids);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const [cache, setCache] = useState<Record<string, VehicleWithBrand>>({});
  // null = default: collapsed on phones, expanded from `sm` up (CSS-driven, no layout shift).
  const [collapsed, setCollapsed] = useState<boolean | null>(null);
  const trayRef = useRef<HTMLElement>(null);

  // Publish the tray's height so page padding and the floating WhatsApp button can clear it.
  const visible = hydrated && ids.length > 0 && !pathname.startsWith("/compare");
  useEffect(() => {
    const el = trayRef.current;
    const root = document.documentElement;
    if (!visible || !el) {
      root.style.removeProperty("--compare-tray-h");
      return;
    }
    const observer = new ResizeObserver(() => root.style.setProperty("--compare-tray-h", `${el.offsetHeight}px`));
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--compare-tray-h");
    };
  }, [visible]);

  const missing = ids.filter((id) => !cache[id]);
  const missingKey = missing.join(",");
  useEffect(() => {
    if (!missingKey) return;
    let cancelled = false;
    getVehiclesByIds(missingKey.split(",")).then((list) => {
      if (!cancelled) setCache((c) => ({ ...c, ...Object.fromEntries(list.map((v) => [v.id, v])) }));
    });
    return () => {
      cancelled = true;
    };
  }, [missingKey]);

  if (!visible) return null;

  const canCompare = ids.length >= 2;

  return (
    <section
      ref={trayRef}
      data-compare-tray
      aria-label={t("label")}
      className="fixed inset-x-0 bottom-0 z-[55] px-3 pb-3 sm:px-6 sm:pb-4"
    >
      <div className="mx-auto max-w-5xl rounded-[22px] border border-line bg-bg-alt/95 shadow-[0_-12px_48px_-20px_rgba(14,14,16,0.45)] backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
          <GitCompareArrows aria-hidden className="size-5 shrink-0 text-accent-ink" />
          <p className="text-sm font-medium">
            {t("count", { count: f.number(ids.length), max: f.number(MAX_COMPARE) })}
          </p>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !(c ?? window.matchMedia("(max-width: 639px)").matches))}
            aria-expanded={collapsed === null ? undefined : !collapsed}
            aria-controls="compare-tray-items"
            className="ml-1 grid size-8 place-items-center rounded-full text-muted hover:bg-ink/[0.06] hover:text-ink"
          >
            <ChevronDown
              aria-hidden
              className={cn("size-4 transition-transform", collapsed === null ? "max-sm:rotate-180" : collapsed && "rotate-180")}
            />
            <span className="sr-only">{t("toggle")}</span>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={clear} className="hidden px-2 text-sm text-muted underline-offset-4 hover:text-ink hover:underline sm:block">
              {t("clear")}
            </button>
            {canCompare ? (
              <Link href={`/compare?ids=${ids.join(",")}`} className={buttonVariants({ size: "sm" })}>
                {t("compareNow")}
              </Link>
            ) : (
              <span className="text-xs text-muted">{t("addOneMore")}</span>
            )}
          </div>
        </div>

        <ul
          id="compare-tray-items"
          hidden={collapsed === true}
          className={cn("grid grid-cols-2 gap-2 border-t border-line p-3 sm:grid-cols-4 sm:p-4", collapsed === null && "max-sm:hidden")}
        >
          {ids.map((id) => {
            const v = cache[id];
            return (
              <li key={id} className="relative flex items-center gap-3 rounded-2xl bg-bg p-2">
                {v ? (
                  <>
                    <div className="w-16 shrink-0">
                      <VehicleImage
                        media={v.images[0]}
                        placeholder={{ bodyType: v.bodyType, paint: v.colors[0]?.hex ?? "#cfd0c9", initial: brandInitial(v) }}
                        sizes="64px"
                        className="rounded-lg"
                      />
                    </div>
                    <p className="min-w-0 truncate pr-6 text-xs font-medium">{vehicleName(v, locale)}</p>
                    <button
                      type="button"
                      onClick={() => remove(id)}
                      aria-label={t("remove", { name: vehicleName(v, locale) })}
                      className="absolute top-1 right-1 grid size-7 place-items-center rounded-full text-muted hover:bg-ink/[0.06] hover:text-ink"
                    >
                      <X aria-hidden className="size-3.5" />
                    </button>
                  </>
                ) : (
                  <span className="h-10 w-full animate-pulse rounded-lg bg-ink/[0.06]" />
                )}
              </li>
            );
          })}
          {Array.from({ length: MAX_COMPARE - ids.length }, (_, i) => (
            <li key={`empty-${i}`} className="hidden items-center justify-center rounded-2xl border border-dashed border-line-strong p-2 text-xs text-muted sm:flex">
              {t("emptySlot")}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
