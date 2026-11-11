"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Dialog";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { primaryLinks, servicesMenu, vehicleMenu } from "@/config/nav";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

/** Full-screen navigation sheet for small screens. */
export function MobileNav({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations("nav");
  const tHeader = useTranslations("header");
  const tA11y = useTranslations("a11y");

  const sections = [
    { id: "vehicles" as const, groups: vehicleMenu, all: { key: "links.allVehicles" as const, href: "/vehicles" } },
    { id: "services" as const, groups: servicesMenu, all: null },
  ];

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      side="full"
      title={tHeader("menu")}
      footer={
        <div className="flex flex-col gap-3">
          <ButtonLink href="/test-drive" size="lg" className="w-full">
            {tHeader("bookTestDrive")}
          </ButtonLink>
          <WhatsAppButton context={{ kind: "general" }} size="lg" tone="outline" className="w-full" />
        </div>
      }
    >
      <nav aria-label={tA11y("mainNav")} className="flex flex-col">
        {sections.map((section) => (
          <details key={section.id} className="group border-b border-line">
            <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-2xl font-light [&::-webkit-details-marker]:hidden">
              {t(section.id)}
              <ChevronDown aria-hidden className="size-5 text-muted transition-transform group-open:rotate-180" />
            </summary>
            <div className="grid gap-6 pb-6 xs:grid-cols-2">
              {section.all ? (
                <Link href={section.all.href} className="font-medium text-accent-ink xs:col-span-2">
                  {t(section.all.key)}
                </Link>
              ) : null}
              {section.groups.map((group) => (
                <div key={group.key}>
                  <p className="eyebrow text-muted">{t(group.key)}</p>
                  <ul className="mt-2">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="block py-1.5 text-[0.9375rem]">
                          {t(link.key)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        ))}
        <ul>
          {primaryLinks.map((link) => (
            <li key={link.href} className="border-b border-line">
              <Link href={link.href} className="block py-4 text-2xl font-light">
                {t(link.key)}
              </Link>
            </li>
          ))}
          <li className="border-b border-line">
            <Link href="/account" className="block py-4 text-2xl font-light">
              {t("links.account")}
            </Link>
          </li>
        </ul>
        <LanguageSwitcher display="long" className="mt-6 self-start px-0" />
      </nav>
    </Sheet>
  );
}
