import { FlaskConical } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Honest demo-mode notice. Shown on every confirmation so nobody believes a
 * booking, approval, payment or save happened on a real server.
 */
export function DemoNotice({
  reference,
  message,
  className,
}: {
  /** When set, renders the standard "not sent to Eureka. Reference …" text. */
  reference?: string;
  /** Overrides the default text. */
  message?: string;
  className?: string;
}) {
  const t = useTranslations("demo");
  const text = message ?? (reference ? t("notice", { reference }) : t("noticeGeneric"));
  return (
    <p
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border border-info/25 bg-info/[0.06] px-4 py-3 text-sm text-info",
        className,
      )}
    >
      <FlaskConical aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>{text}</span>
    </p>
  );
}
