import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden className="bg-studio-grid absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="container-page flex min-h-[70dvh] flex-col items-start justify-center gap-6 py-24">
        <p className="eyebrow text-accent-ink">{t("eyebrow")}</p>
        <h1 className="display-xl max-w-4xl">
          {t("title")} <em className="text-accent-ink">{t("titleAccent")}</em>
        </h1>
        <p className="max-w-xl text-lg text-muted">{t("body")}</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/" size="lg">
            {t("home")}
          </ButtonLink>
          <ButtonLink href="/vehicles" size="lg" variant="outline">
            {t("vehicles")}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
