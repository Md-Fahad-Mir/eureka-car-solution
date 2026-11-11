import { useTranslations } from "next-intl";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { Availability, Condition, FuelType } from "@/types";

const CONDITION_TONE: Record<Condition, BadgeTone> = { new: "dark", reconditioned: "accent", used: "outline" };
const FUEL_TONE: Record<FuelType, BadgeTone> = { ev: "ev", phev: "info", hybrid: "success", petrol: "neutral", diesel: "neutral" };
const AVAILABILITY_TONE: Record<Availability, BadgeTone> = {
  in_stock: "success",
  incoming: "info",
  reserved: "warning",
  sold: "danger",
};

export function ConditionBadge({ condition }: { condition: Condition }) {
  const t = useTranslations("taxonomy.condition");
  return <Badge tone={CONDITION_TONE[condition]}>{t(condition)}</Badge>;
}

/** Fuel chip. The teal EV tone is reserved for EV content only. */
export function FuelBadge({ fuel }: { fuel: FuelType }) {
  const t = useTranslations("taxonomy.fuel");
  return <Badge tone={FUEL_TONE[fuel]}>{t(fuel)}</Badge>;
}

export function AvailabilityBadge({ availability, hideInStock }: { availability: Availability; hideInStock?: boolean }) {
  const t = useTranslations("taxonomy.availability");
  if (hideInStock && availability === "in_stock") return null;
  return (
    <Badge tone={AVAILABILITY_TONE[availability]}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {t(availability)}
    </Badge>
  );
}
