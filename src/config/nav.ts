import type { MessageKeys, Messages, NestedKeyOf } from "next-intl";

/**
 * Navigation structure. Labels are message keys under the `nav` namespace,
 * so this file stays locale-neutral (and keys are type-checked).
 */

export type NavKey = MessageKeys<Messages["nav"], NestedKeyOf<Messages["nav"]>>;
export type NavLink = { key: NavKey; href: string };
export type NavGroup = { key: NavKey; links: NavLink[] };

const v = (query: string) => `/vehicles?${query}`;

export const vehicleMenu: NavGroup[] = [
  {
    key: "byFuel",
    links: [
      { key: "fuel.ev", href: v("fuel=ev") },
      { key: "fuel.hybrid", href: v("fuel=hybrid") },
      { key: "fuel.phev", href: v("fuel=phev") },
      { key: "fuel.petrol", href: v("fuel=petrol") },
      { key: "fuel.diesel", href: v("fuel=diesel") },
    ],
  },
  {
    key: "byCondition",
    links: [
      { key: "condition.new", href: v("condition=new") },
      { key: "condition.reconditioned", href: v("condition=reconditioned") },
      { key: "condition.used", href: v("condition=used") },
    ],
  },
  {
    key: "byCategory",
    links: [
      { key: "category.car", href: v("category=car") },
      { key: "category.suv", href: v("category=suv") },
      { key: "category.mpv", href: v("category=mpv") },
      { key: "category.pickup", href: v("category=pickup") },
      { key: "category.commercial", href: v("category=commercial") },
      { key: "category.tractor", href: v("category=tractor") },
      { key: "category.utility", href: v("category=utility") },
    ],
  },
];

export const servicesMenu: NavGroup[] = [
  {
    key: "buy",
    links: [
      { key: "links.testDrive", href: "/test-drive" },
      { key: "links.inquiry", href: "/inquiry" },
      { key: "links.compare", href: "/compare" },
    ],
  },
  {
    key: "finance",
    links: [
      { key: "links.emi", href: "/finance" },
      { key: "links.financeApply", href: "/finance/apply" },
      { key: "links.financeStatus", href: "/finance/status" },
      { key: "links.savings", href: "/savings-calculator" },
    ],
  },
  {
    key: "ownership",
    links: [
      { key: "links.service", href: "/service" },
      { key: "links.serviceBook", href: "/service/book" },
      { key: "links.serviceTrack", href: "/service/track" },
    ],
  },
];

export const primaryLinks: NavLink[] = [
  { key: "links.ev", href: "/ev" },
  { key: "links.finance", href: "/finance" },
  { key: "links.fleet", href: "/fleet" },
  { key: "links.showrooms", href: "/showrooms" },
];

export const footerColumns: NavGroup[] = [
  {
    key: "shop",
    links: [
      { key: "links.allVehicles", href: "/vehicles" },
      { key: "fuel.ev", href: v("fuel=ev") },
      { key: "condition.new", href: v("condition=new") },
      { key: "condition.reconditioned", href: v("condition=reconditioned") },
      { key: "condition.used", href: v("condition=used") },
      { key: "links.commercial", href: v("category=commercial,tractor") },
    ],
  },
  {
    key: "own",
    links: [
      { key: "links.emi", href: "/finance" },
      { key: "links.savings", href: "/savings-calculator" },
      { key: "links.testDrive", href: "/test-drive" },
      { key: "links.service", href: "/service" },
      { key: "links.serviceTrack", href: "/service/track" },
    ],
  },
  {
    key: "learn",
    links: [
      { key: "links.ev", href: "/ev" },
      { key: "links.compare", href: "/compare" },
      { key: "links.inquiry", href: "/inquiry" },
      { key: "links.fleet", href: "/fleet" },
    ],
  },
  {
    key: "company",
    links: [
      { key: "links.showrooms", href: "/showrooms" },
      { key: "links.account", href: "/account" },
      { key: "links.privacy", href: "/privacy" },
      { key: "links.terms", href: "/terms" },
    ],
  },
];
