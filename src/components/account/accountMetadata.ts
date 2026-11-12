import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { AccountSectionKey } from "@/config/nav";
import { getFormat } from "@/lib/format/getFormat";
import { pageMetadata } from "@/lib/seo";

/** Account pages are personal (and demo): titled per section, never indexed. */
export async function accountMetadata(section: AccountSectionKey, path: string): Promise<Metadata> {
  const [t, f] = await Promise.all([getTranslations("account"), getFormat()]);
  return pageMetadata({ locale: f.locale, path, title: t("metaTitle", { section: t(`nav.${section}`) }), noIndex: true });
}
