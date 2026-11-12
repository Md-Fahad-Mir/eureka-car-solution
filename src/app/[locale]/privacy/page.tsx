import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalDocument } from "@/components/layout/LegalDocument";
import { getFormat } from "@/lib/format/getFormat";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [t, f] = await Promise.all([getTranslations("legal"), getFormat()]);
  return pageMetadata({ locale: f.locale, path: "/privacy", title: t("privacy.title"), description: t("privacy.metaDescription") });
}

export default function Page() {
  return <LegalDocument doc="privacy" />;
}
