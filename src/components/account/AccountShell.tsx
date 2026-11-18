"use client";

import { useEffect, type ReactNode } from "react";
import { FlaskConical, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { NavItemLink } from "@/components/layout/RouteAware";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { accountNav } from "@/config/nav";
import { usePathname, useRouter } from "@/i18n/navigation";
import { signOut } from "@/lib/api/account";
import { useHydrated, useDemoSession } from "@/stores/hydration";
import { AccountDataProvider, useAccount } from "./AccountData";

/**
 * Demo account frame: a client-side guard (demo session, not real auth),
 * sidebar navigation on desktop and a scrolling tab bar on mobile.
 */
export function AccountShell({ children }: { children: ReactNode }) {
  const { ready, session } = useDemoSession();
  const hydrated = useHydrated();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !session) router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
  }, [ready, session, router, pathname]);

  if (!hydrated || !ready || !session) {
    return (
      <div className="grid gap-8 lg:grid-cols-12" aria-busy>
        <Skeleton className="hidden h-[28rem] rounded-card lg:col-span-3 lg:block" />
        <div className="flex flex-col gap-4 lg:col-span-9">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-56 rounded-card" />
        </div>
      </div>
    );
  }

  return (
    <AccountDataProvider>
      <Frame>{children}</Frame>
    </AccountDataProvider>
  );
}

function Frame({ children }: { children: ReactNode }) {
  const t = useTranslations("account");
  const router = useRouter();
  const { data } = useAccount();
  const unread = data.notifications.filter((n) => !n.read).length;

  const links = (variant: "side" | "tabs") =>
    accountNav.map((item) => (
      <li key={item.key} className={variant === "tabs" ? "shrink-0" : undefined}>
        <NavItemLink
          href={item.href}
          exact={"exact" in item ? item.exact : undefined}
          className={
            variant === "side"
              ? "flex items-center justify-between rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink"
              : "block rounded-full border border-line-strong px-4 py-2 text-sm whitespace-nowrap text-muted"
          }
          activeClassName={variant === "side" ? "bg-ink/[0.06] font-medium text-ink" : "border-ink bg-ink text-bg-alt"}
        >
          {t(`nav.${item.key}`)}
          {item.key === "notifications" && unread ? (
            <span className="ml-2 grid min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[0.6875rem] font-semibold text-ink tabular">
              {unread}
              <span className="sr-only"> {t("unread")}</span>
            </span>
          ) : null}
        </NavItemLink>
      </li>
    ));

  const signOutButton = (
    <Button
      variant="ghost"
      size="sm"
      icon={<LogOut aria-hidden className="size-4" />}
      onClick={async () => {
        await signOut();
        router.push("/");
      }}
    >
      {t("signOut")}
    </Button>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <aside className="hidden lg:col-span-3 lg:block">
        <div className="sticky top-[calc(var(--header-h-compact)+1.5rem)] flex flex-col gap-4 rounded-card border border-line bg-bg-alt p-4">
          <div className="px-3 pt-1">
            <p className="font-medium">{data.profile.name}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-info">
              <FlaskConical aria-hidden className="size-3.5" />
              {t("demoBadge")}
            </p>
          </div>
          <nav aria-label={t("navLabel")}>
            <ul className="flex flex-col gap-0.5">{links("side")}</ul>
          </nav>
          <div className="border-t border-line pt-3">{signOutButton}</div>
        </div>
      </aside>

      <div className="min-w-0 lg:col-span-9">
        <div className="mb-6 flex flex-col gap-3 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-sm text-info">
              <FlaskConical aria-hidden className="size-4" />
              {t("demoBadge")}
            </p>
            {signOutButton}
          </div>
          {/* `relative`: the unread count's sr-only text is absolutely positioned and would
              otherwise escape the scroller and widen the page. */}
          <nav aria-label={t("navLabel")} className="relative -mx-4 overflow-x-auto px-4 pb-1">
            <ul className="flex gap-2">{links("tabs")}</ul>
          </nav>
        </div>
        {children}
      </div>
    </div>
  );
}
