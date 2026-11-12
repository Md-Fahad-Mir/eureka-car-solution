import type { Metadata } from "next";
import { ArrowRight, BadgePercent, Check, Headset, Landmark, Wrench } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CorporateInquiryForm } from "@/components/forms/CorporateInquiryForm";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { Link } from "@/i18n/navigation";
import { getFormat } from "@/lib/format/getFormat";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [t, f] = await Promise.all([getTranslations("fleet"), getFormat()]);
  return pageMetadata({ locale: f.locale, path: "/fleet", title: t("metaTitle"), description: t("metaDescription") });
}

const VALUES = [
  { key: "pricing", Icon: BadgePercent },
  { key: "contact", Icon: Headset },
  { key: "finance", Icon: Landmark },
  { key: "uptime", Icon: Wrench },
] as const;
const MANAGEMENT = ["maintenance", "pickup", "replacement", "invoicing", "handover", "reports"] as const;
const RANGES = [
  { key: "commercial", href: "/vehicles?category=commercial" },
  { key: "pickup", href: "/vehicles?category=pickup" },
  { key: "tractor", href: "/vehicles?category=tractor" },
  { key: "ev", href: "/vehicles?fuel=ev" },
] as const;
const PROCESS = ["brief", "proposal", "trial", "paperwork", "delivery"] as const;

export default async function FleetPage() {
  const [t, f] = await Promise.all([getTranslations("fleet"), getFormat()]);

  return (
    <div className="pb-20">
      <section className="container-page pt-8">
        <Breadcrumbs items={[{ label: t("breadcrumb") }]} />
        <header className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow text-accent-ink">{t("eyebrow")}</p>
            <h1 className="display-lg mt-3">{t("title")}</h1>
            <p className="mt-4 max-w-2xl text-muted">{t("lead")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col">
            <ButtonLink href="#enquire" size="lg">
              {t("cta")}
            </ButtonLink>
            <WhatsAppButton size="lg" tone="outline" context={{ kind: "corporate" }} />
          </div>
        </header>
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ key, Icon }) => (
            <li key={key} className="rounded-card border border-line bg-bg-alt p-6">
              <Icon aria-hidden className="size-6 text-accent-ink" />
              <h2 className="mt-4 font-medium">{t(`values.${key}.title`)}</h2>
              <p className="mt-1.5 text-sm text-muted">{t(`values.${key}.body`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="management" className="container-page mt-20 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 id="management" className="display-md">
            {t("managementTitle")}
          </h2>
          <p className="mt-3 text-muted">{t("managementLead")}</p>
        </div>
        <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:col-span-7">
          {MANAGEMENT.map((m) => (
            <li key={m} className="flex gap-3">
              <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />
              <span>
                <span className="font-medium">{t(`management.${m}.title`)}</span>
                <span className="mt-0.5 block text-sm text-muted">{t(`management.${m}.body`)}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="ranges" className="container-page mt-20">
        <h2 id="ranges" className="display-md">
          {t("rangesTitle")}
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RANGES.map((r) => (
            <li key={r.key}>
              <Link href={r.href} className="group flex h-full flex-col gap-2 rounded-card border border-line bg-bg-alt p-6 transition-colors hover:border-ink/40">
                <span className="font-medium">{t(`ranges.${r.key}.title`)}</span>
                <span className="text-sm text-muted">{t(`ranges.${r.key}.body`)}</span>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-medium text-accent-ink">
                  {t("browse")}
                  <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="finance" className="container-page mt-20">
        <div className="on-dark grid gap-8 rounded-card bg-graphite p-8 text-on-dark sm:p-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <h2 id="finance" className="display-md">
              {t("financeTitle")}
            </h2>
            <p className="mt-3 text-muted-on-dark">{t("financeLead")}</p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <ButtonLink href="/finance" variant="light" size="lg">
              {t("financeCta")}
            </ButtonLink>
          </div>
        </div>
      </section>

      <section aria-labelledby="process" className="container-page mt-20">
        <h2 id="process" className="display-md">
          {t("processTitle")}
        </h2>
        <p className="mt-3 max-w-2xl text-muted">{t("processLead")}</p>
        <ol className="mt-8 grid gap-6 md:grid-cols-5">
          {PROCESS.map((p, i) => (
            <li key={p} className="border-t-2 border-ink pt-4">
              <p className="text-sm text-muted tabular">{f.number(i + 1, { minimumIntegerDigits: 2 })}</p>
              <p className="mt-1 font-medium">{t(`process.${p}.title`)}</p>
              <p className="mt-1 text-sm text-muted">{t(`process.${p}.body`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="enquire" aria-labelledby="enquire-title" className="container-page mt-20 scroll-mt-24">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="enquire-title" className="display-md">
              {t("formTitle")}
            </h2>
            <p className="mt-3 text-muted">{t("formLead")}</p>
            <DemoNotice message={t("demoNotice")} className="mt-6" />
          </div>
          <div className="rounded-card border border-line bg-bg-alt p-5 sm:p-8 lg:col-span-8">
            <CorporateInquiryForm />
          </div>
        </div>
      </section>
    </div>
  );
}
