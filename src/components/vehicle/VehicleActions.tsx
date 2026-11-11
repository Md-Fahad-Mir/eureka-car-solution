"use client";

import { GitCompareArrows, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { MAX_COMPARE, useCompareStore } from "@/stores/compare";
import { useFavoritesStore } from "@/stores/favorites";
import { useHydrated } from "@/stores/hydration";
import { toast } from "@/stores/toast";

type ActionProps = {
  vehicleId: string;
  /** Vehicle name for accessible labels and toasts. */
  name: string;
  /** `icon`: round icon button (cards); `labelled`: icon + text (detail page). */
  display?: "icon" | "labelled";
  className?: string;
};

const iconButton =
  "grid size-10 place-items-center rounded-full border border-line bg-bg-alt/90 text-ink shadow-sm backdrop-blur transition-colors hover:border-ink";
const labelledButton =
  "inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-4 text-sm font-medium transition-colors hover:border-ink";

/** Heart toggle; saved vehicles are kept in this browser and listed in the account dashboard. */
export function FavoriteButton({ vehicleId, name, display = "icon", className }: ActionProps) {
  const t = useTranslations("vehicleActions");
  const hydrated = useHydrated();
  const saved = useFavoritesStore((s) => s.ids.includes(vehicleId)) && hydrated;
  const toggle = useFavoritesStore((s) => s.toggle);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={display === "icon" ? t(saved ? "unsaveNamed" : "saveNamed", { name }) : undefined}
      onClick={() => {
        toggle(vehicleId);
        toast({ tone: "info", title: t(saved ? "removedFromSaved" : "addedToSaved", { name }), body: t("savedHint") });
      }}
      className={cn(display === "icon" ? iconButton : labelledButton, saved && "border-accent text-accent-ink", className)}
    >
      <Heart aria-hidden className={cn("size-[18px]", saved && "fill-current")} />
      {display === "labelled" ? <span>{t(saved ? "saved" : "save")}</span> : null}
    </button>
  );
}

/** Adds/removes the vehicle from the compare list (max 4). */
export function CompareButton({ vehicleId, name, display = "icon", className }: ActionProps) {
  const t = useTranslations("vehicleActions");
  const hydrated = useHydrated();
  const inCompare = useCompareStore((s) => s.ids.includes(vehicleId)) && hydrated;
  const toggle = useCompareStore((s) => s.toggle);

  return (
    <button
      type="button"
      aria-pressed={inCompare}
      aria-label={display === "icon" ? t(inCompare ? "removeCompareNamed" : "addCompareNamed", { name }) : undefined}
      onClick={() => {
        const ok = toggle(vehicleId);
        if (!ok) toast({ tone: "error", title: t("compareFull", { max: MAX_COMPARE }), body: t("compareFullHint") });
      }}
      className={cn(display === "icon" ? iconButton : labelledButton, inCompare && "border-ink bg-ink text-bg-alt hover:bg-ink/90", className)}
    >
      <GitCompareArrows aria-hidden className="size-[18px]" />
      {display === "labelled" ? <span>{t(inCompare ? "inCompare" : "compare")}</span> : null}
    </button>
  );
}
