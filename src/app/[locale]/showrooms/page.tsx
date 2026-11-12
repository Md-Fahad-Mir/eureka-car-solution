import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/forms/ContactForm";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { MapCard } from "@/components/showroom/MapCard";
import { ShowroomCard } from "@/components/showroom/ShowroomCard";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { siteConfig } from "@/config/site";
import { getShowrooms } from "@/lib/api/showrooms";
import { getFormat } from "@/lib/format/getFormat";
import { pageMetadata, showroomJsonLd, toJsonLd } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [t, f] = await Promise.all([getTranslations("showrooms"), getFormat()]);
  return pageMetadata({ locale: f.locale, path: "/showrooms", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function ShowroomsPage() {
  const [t, f, showrooms] = await Promise.all([getTranslations("showrooms"), getFormat(), getShowrooms()]);

  return (
    <div className="container-page pt-8 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(showrooms.map((s) => showroomJsonLd(s, f.locale))) }} />
      <Breadcrumbs items={[{ label: t("breadcrumb") }]} />
      <header className="mt-6 max-w-3xl">
        <p className="eyebrow text-accent-ink">{t("eyebrow")}</p>
        <h1 className="display-lg mt-3">{t("title")}</h1>
        <p className="mt-4 text-muted">{t("lead")}</p>
        <p className="mt-2 text-sm text-muted">{t("timezone")}</p>
      </header>

      <ul className="mt-12 flex flex-col gap-10">
        {showrooms.map((s) => (
          <li key={s.id} id={s.slug} className="grid scroll-mt-24 gap-5 lg:grid-cols-12">
            <MapCard showroom={s} className="lg:col-span-7" />
            <div className="lg:col-span-5">
              <ShowroomCard showroom={s} headingLevel={2} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-muted">{t("placeholderNote")}</p>

      <section aria-labelledby="contact" className="mt-20 grid gap-10 lg:grid-cols-12">
        <div className="flex flex-col gap-5 lg:col-span-4">
          <h2 id="contact" className="display-md">
            {t("contactTitle")}
          </h2>
          <p className="text-muted">{t("contactLead")}</p>
          <a href={siteConfig.phone.href} className="flex items-center gap-2.5 hover:text-accent-ink">
            <Phone aria-hidden className="size-4 text-muted" />
            <span className="tabular">{f.digits(siteConfig.phone.display)}</span>
          </a>
          <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2.5 break-all hover:text-accent-ink">
            <Mail aria-hidden className="size-4 shrink-0 text-muted" />
            {siteConfig.email}
          </a>
          <WhatsAppButton context={{ kind: "general" }} className="self-start" />
          <DemoNotice message={t("demoNotice")} />
        </div>
        <div className="rounded-card border border-line bg-bg-alt p-5 sm:p-8 lg:col-span-8">
          <ContactForm showrooms={showrooms.map(({ id, name }) => ({ id, name }))} />
        </div>
      </section>
    </div>
  );
}
