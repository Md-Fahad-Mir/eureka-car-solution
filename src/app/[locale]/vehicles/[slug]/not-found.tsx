import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";

/** Unknown or removed vehicle slug. */
export default function VehicleNotFound() {
  const t = useTranslations("vehicleDetail");
  return (
    <section className="container-page flex min-h-[60dvh] flex-col items-start justify-center gap-6 py-24">
      <p className="eyebrow text-accent-ink">{t("notFoundEyebrow")}</p>
      <h1 className="display-lg max-w-3xl">{t("notFoundTitle")}</h1>
      <p className="max-w-xl text-lg text-muted">{t("notFoundBody")}</p>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/vehicles" size="lg">
          {t("notFoundBrowse")}
        </ButtonLink>
        <WhatsAppButton size="lg" tone="outline" context={{ kind: "general" }} />
      </div>
    </section>
  );
}
