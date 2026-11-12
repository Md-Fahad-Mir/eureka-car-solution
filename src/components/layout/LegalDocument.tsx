import { Scale } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "./Breadcrumbs";

export const LEGAL_SECTIONS = {
  privacy: ["who", "collect", "use", "whatsapp", "storage", "sharing", "rights", "cookies", "children", "changes", "contact"],
  terms: ["about", "illustrative", "noOffer", "bookings", "finance", "whatsapp", "conduct", "content", "liability", "law", "contact"],
} as const;

type SectionKey = { [D in keyof typeof LEGAL_SECTIONS]: `${D}.sections.${(typeof LEGAL_SECTIONS)[D][number]}` }[keyof typeof LEGAL_SECTIONS];

/**
 * Placeholder legal page. The text is a sensible starting point, clearly
 * marked as a draft for legal review (brief §10 "Also required").
 */
export async function LegalDocument({ doc }: { doc: keyof typeof LEGAL_SECTIONS }) {
  const t = await getTranslations("legal");
  return (
    <article className="container-page pt-8 pb-20">
      <Breadcrumbs items={[{ label: t(`${doc}.title`) }]} />
      <header className="mt-6 max-w-3xl">
        <h1 className="display-lg">{t(`${doc}.title`)}</h1>
        <p className="mt-3 text-sm text-muted">{t("status")}</p>
      </header>
      <p className="mt-8 flex max-w-3xl items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 px-5 py-4 text-sm text-warning-ink">
        <Scale aria-hidden className="mt-0.5 size-4 shrink-0" />
        {t("reviewNotice")}
      </p>
      <p className="mt-10 max-w-3xl text-lg">{t(`${doc}.intro`)}</p>
      <div className="mt-10 flex max-w-3xl flex-col gap-9">
        {LEGAL_SECTIONS[doc].map((s, i) => {
          const key = `${doc}.sections.${s}` as SectionKey;
          return (
            <section key={s} aria-labelledby={`${doc}-${s}`}>
              <h2 id={`${doc}-${s}`} className="text-xl font-medium">
                <span className="mr-2 text-muted tabular">{t("number", { n: i + 1 })}</span>
                {t(`${key}.title`)}
              </h2>
              <p className="mt-3 leading-relaxed text-ink/85">{t(`${key}.body`)}</p>
            </section>
          );
        })}
      </div>
    </article>
  );
}
