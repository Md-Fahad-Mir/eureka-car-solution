"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ChevronDown, GitCompareArrows, Heart, Menu, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";
import { primaryLinks, servicesMenu, vehicleMenu, type NavGroup } from "@/config/nav";
import { Link } from "@/i18n/navigation";
import { formatNumber } from "@/lib/format/number";
import { cn } from "@/lib/utils";
import { useCompareStore } from "@/stores/compare";
import { useFavoritesStore } from "@/stores/favorites";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { NavItemLink, OnRouteChange } from "./RouteAware";

type MenuId = "vehicles" | "services";

const MENUS: Record<MenuId, { groups: NavGroup[]; lead: "megaVehiclesLead" | "megaServicesLead"; cta: { key: "megaVehiclesCta" | "megaServicesCta"; href: string } }> = {
  vehicles: { groups: vehicleMenu, lead: "megaVehiclesLead", cta: { key: "megaVehiclesCta", href: "/vehicles" } },
  services: { groups: servicesMenu, lead: "megaServicesLead", cta: { key: "megaServicesCta", href: "/service" } },
};

/**
 * Sticky site header: logo, mega-menus (Vehicles, Services), primary links,
 * language switcher, compare/saved/account shortcuts and the test-drive CTA.
 * Compacts on scroll; below `lg` everything moves into the MobileNav sheet.
 */
export function Header() {
  const t = useTranslations("nav");
  const tHeader = useTranslations("header");
  const tA11y = useTranslations("a11y");
  const locale = useLocale();
  const menuBaseId = useId();

  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const triggerRefs = useRef<Partial<Record<MenuId, HTMLButtonElement | null>>>({});
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const compareCount = useCompareStore((s) => s.ids.length);
  const favouriteCount = useFavoritesStore((s) => s.ids.length);

  const closeAll = useCallback(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        triggerRefs.current[openMenu]?.focus();
        setOpenMenu(null);
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [openMenu]);

  const hoverOpen = (id: MenuId) => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpenMenu(id), 90);
  };
  const hoverClose = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpenMenu(null), 160);
  };

  const count = (n: number) => formatNumber(n, locale);

  return (
    <header
      ref={headerRef}
      onMouseLeave={hoverClose}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpenMenu(null);
      }}
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled || openMenu
          ? "border-line bg-bg/90 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/75"
          : "border-transparent bg-bg",
      )}
    >
      <div
        className={cn(
          "container-page flex items-center gap-4 transition-[height] duration-300 ease-out-soft",
          scrolled ? "h-[var(--header-h-compact)]" : "h-[var(--header-h)]",
        )}
      >
        <Logo className="mr-2 xl:mr-6" />

        <nav aria-label={tA11y("mainNav")} className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {(Object.keys(MENUS) as MenuId[]).map((id) => (
              <li key={id} onMouseEnter={() => hoverOpen(id)}>
                <button
                  ref={(el) => {
                    triggerRefs.current[id] = el;
                  }}
                  type="button"
                  aria-expanded={openMenu === id}
                  aria-controls={`${menuBaseId}-${id}`}
                  onClick={() => setOpenMenu((m) => (m === id ? null : id))}
                  className={cn(
                    "inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors hover:bg-ink/[0.05]",
                    openMenu === id && "bg-ink/[0.06]",
                  )}
                >
                  {t(id)}
                  <ChevronDown
                    aria-hidden
                    className={cn("size-3.5 transition-transform duration-200", openMenu === id && "rotate-180")}
                  />
                </button>
              </li>
            ))}
            {primaryLinks.map((link) => (
              <li key={link.href} onMouseEnter={hoverClose}>
                <NavItemLink
                  href={link.href}
                  className="inline-flex h-10 items-center rounded-full px-3.5 text-sm font-medium transition-colors hover:bg-ink/[0.05]"
                  activeClassName="text-accent-ink"
                >
                  {t(link.key)}
                </NavItemLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <IconLink href="/compare" label={tHeader("compareCount", { count: compareCount })} badge={compareCount ? count(compareCount) : null}>
            <GitCompareArrows aria-hidden className="size-[18px]" />
          </IconLink>
          <IconLink href="/account/saved" label={tHeader("favouritesCount", { count: favouriteCount })} badge={favouriteCount ? count(favouriteCount) : null}>
            <Heart aria-hidden className="size-[18px]" />
          </IconLink>
          <IconLink href="/account" label={tHeader("account")} className="hidden sm:grid">
            <User aria-hidden className="size-[18px]" />
          </IconLink>
          <ButtonLink href="/test-drive" size="sm" className="ml-2 hidden md:inline-flex">
            {tHeader("bookTestDrive")}
          </ButtonLink>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={mobileOpen}
            className="ml-1 inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium hover:bg-ink/[0.06] lg:hidden"
          >
            <Menu aria-hidden className="size-5" />
            <span className="sr-only sm:not-sr-only">{tHeader("menu")}</span>
          </button>
        </div>
      </div>

      {(Object.keys(MENUS) as MenuId[]).map((id) => (
        <MegaPanel
          key={id}
          id={`${menuBaseId}-${id}`}
          menuId={id}
          open={openMenu === id}
          onMouseEnter={() => hoverOpen(id)}
        />
      ))}

      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
      <OnRouteChange onChange={closeAll} />
    </header>
  );
}

function IconLink({
  href,
  label,
  badge,
  className,
  children,
}: {
  href: string;
  label: string;
  badge?: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn("relative grid size-10 place-items-center rounded-full transition-colors hover:bg-ink/[0.06]", className)}
    >
      {children}
      {badge ? (
        <span
          aria-hidden
          className="absolute top-0.5 right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent-ink px-1 text-[10px] font-semibold text-white tabular"
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

/** Full-width mega-menu panel with numbered, hairline-separated columns. */
function MegaPanel({
  id,
  menuId,
  open,
  onMouseEnter,
}: {
  id: string;
  menuId: MenuId;
  open: boolean;
  onMouseEnter: () => void;
}) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const { groups, lead, cta } = MENUS[menuId];

  return (
    <div
      id={id}
      hidden={!open}
      onMouseEnter={onMouseEnter}
      className={cn(
        "absolute inset-x-0 top-full border-b border-line bg-bg-alt shadow-[0_40px_60px_-40px_rgba(22,26,22,0.35)]",
        open ? "hidden lg:block" : "hidden",
      )}
    >
      <div className="container-page grid grid-cols-12 gap-8 py-10">
        <div className="col-span-3 flex flex-col justify-between gap-6 border-r border-line pr-8">
          <div>
            <p className="eyebrow text-accent-ink">{t(menuId)}</p>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{t(lead)}</p>
          </div>
          <Link href={cta.href} className="group inline-flex items-center gap-2 text-sm font-medium">
            {t(cta.key)}
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        {groups.map((group, gi) => (
          <div key={group.key} className="col-span-3">
            <p className="flex items-center gap-3 text-xs text-muted">
              <span className="tabular">{formatNumber(gi + 1, locale, { minimumIntegerDigits: 2 })}</span>
              <span aria-hidden className="h-px w-6 bg-line-strong" />
              <span className="eyebrow">{t(group.key)}</span>
            </p>
            <ul className="mt-4 flex flex-col">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between gap-2 border-b border-line py-2.5 text-[0.9375rem] transition-colors hover:text-accent-ink"
                  >
                    {t(link.key)}
                    <ArrowRight aria-hidden className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
