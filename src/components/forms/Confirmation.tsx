import type { ReactNode, Ref } from "react";
import { CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { DemoNotice } from "@/components/ui/DemoNotice";

/**
 * Honest confirmation for any demo submission: what happened, the DEMO-
 * reference, the demo notice, an optional summary and follow-up actions.
 */
export function Confirmation({
  title,
  body,
  reference,
  headingLevel = 2,
  headingRef,
  children,
  actions,
}: {
  title: string;
  body: string;
  reference: string;
  /** 1 on a dedicated confirmation page, 2 when it replaces a form inline. */
  headingLevel?: 1 | 2;
  headingRef?: Ref<HTMLHeadingElement>;
  /** Booking/inquiry summary. */
  children?: ReactNode;
  actions?: ReactNode;
}) {
  const t = useTranslations("confirmation");
  const Heading = `h${headingLevel}` as const;
  return (
    <section aria-labelledby="confirmation-title" className="flex flex-col gap-6">
      <CircleCheck aria-hidden className="size-10 text-success" />
      <div role="status">
        <Heading id="confirmation-title" ref={headingRef} tabIndex={-1} className="display-md focus:outline-none">
          {title}
        </Heading>
        <p className="mt-3 text-muted">{body}</p>
      </div>
      <p className="rounded-2xl border border-line bg-bg-alt px-5 py-4">
        {t("reference")}: <span className="text-lg font-semibold tabular">{reference}</span>
      </p>
      <DemoNotice reference={reference} />
      {children}
      {actions ? <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div> : null}
    </section>
  );
}
