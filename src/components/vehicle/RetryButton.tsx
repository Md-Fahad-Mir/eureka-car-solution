"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { useRouter } from "@/i18n/navigation";

/** Re-runs the server render of the current route (for listing error states). */
export function RetryButton() {
  const t = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button onClick={() => startTransition(() => router.refresh())} loading={pending}>
      {t("retry")}
    </Button>
  );
}
