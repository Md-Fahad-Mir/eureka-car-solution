"use client";

import { Suspense, useEffect, useRef, type ComponentProps } from "react";
import { Link, usePathname } from "@/i18n/navigation";

/*
 * With Cache Components, `usePathname()` suspends while Next prerenders the
 * static shell of routes with not-yet-known params. These leaves keep the
 * pathname read as small as possible so the surrounding chrome still
 * prerenders (see node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md).
 */

function RouteChangeWatcher({ onChange }: { onChange: () => void }) {
  const pathname = usePathname();
  const previous = useRef(pathname);
  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    onChange();
  }, [pathname, onChange]);
  return null;
}

/** Calls `onChange` after client-side navigation to a different pathname. */
export function OnRouteChange({ onChange }: { onChange: () => void }) {
  return (
    <Suspense fallback={null}>
      <RouteChangeWatcher onChange={onChange} />
    </Suspense>
  );
}

type NavItemLinkProps = ComponentProps<typeof Link> & {
  href: string;
  /** Classes added when the link matches the current section. */
  activeClassName?: string;
  /** Match only this exact path, not its sub-pages (e.g. an overview page). */
  exact?: boolean;
};

function ActiveLink({ href, activeClassName, exact, className, ...props }: NavItemLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || (!exact && pathname.startsWith(`${href}/`));
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[className, active ? activeClassName : null].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

/** Link that marks itself `aria-current="page"` within its section. */
export function NavItemLink({ activeClassName, exact, ...props }: NavItemLinkProps) {
  return (
    <Suspense fallback={<Link {...props} />}>
      <ActiveLink activeClassName={activeClassName} exact={exact} {...props} />
    </Suspense>
  );
}
