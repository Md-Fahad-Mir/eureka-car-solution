import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { SignInPanel } from "@/components/account/SignInPanel";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { Skeleton } from "@/components/ui/Skeleton";
import { getFormat } from "@/lib/format/getFormat";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [t, f] = await Promise.all([getTranslations("signIn"), getFormat()]);
  return pageMetadata({ locale: f.locale, path: "/sign-in", title: t("metaTitle"), noIndex: true });
}

export default async function SignInPage() {
  const t = await getTranslations("signIn");
  return (
    <div className="container-page pt-8 pb-20">
      <Breadcrumbs items={[{ label: t("breadcrumb") }]} />
      <header className="mt-6 mb-10 grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="eyebrow text-accent-ink">{t("eyebrow")}</p>
          <h1 className="display-lg mt-3">{t("title")}</h1>
          <p className="mt-4 text-muted">{t("lead")}</p>
        </div>
        <div className="lg:col-span-5">
          <DemoNotice message={t("demoNotice")} />
        </div>
      </header>
      {/* Reads ?next= and the demo session, so it renders on the client. */}
      <Suspense fallback={<Skeleton className="h-96 rounded-card" />}>
        <SignInPanel />
      </Suspense>
    </div>
  );
}
