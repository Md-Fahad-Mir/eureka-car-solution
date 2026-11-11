"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function RouteError({ error, retry }: { error: unknown; retry: () => void }) {
  const t = useTranslations("error");

  useEffect(() => {
    // TODO(api): forward to an error-reporting service once one is chosen.
    console.error(error);
  }, [error]);

  return (
    <section className="container-page flex min-h-[60dvh] flex-col items-start justify-center gap-6 py-24" role="alert">
      <p className="eyebrow text-danger">{t("eyebrow")}</p>
      <h1 className="display-lg">{t("title")}</h1>
      <p className="max-w-xl text-lg text-muted">{t("body")}</p>
      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={() => retry()}>
          {t("retry")}
        </Button>
        <ButtonLink href="/" size="lg" variant="outline">
          {t("home")}
        </ButtonLink>
      </div>
    </section>
  );
}
