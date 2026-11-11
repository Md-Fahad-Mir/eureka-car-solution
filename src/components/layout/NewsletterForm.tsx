"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useErrorText } from "@/components/forms/useErrorText";
import { Button } from "@/components/ui/Button";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { subscribeNewsletter } from "@/lib/api/inquiries";
import { newsletterSchema, type NewsletterInput } from "@/lib/validation/common";
import { toast } from "@/stores/toast";

/** Footer newsletter sign-up against the mock service, with an honest demo confirmation. */
export function NewsletterForm() {
  const t = useTranslations("newsletter");
  const errorText = useErrorText();
  const tToast = useTranslations("toast");
  const [reference, setReference] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterInput>({ resolver: zodResolver(newsletterSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await subscribeNewsletter(values);
      setReference(result.reference);
      reset();
      toast({ tone: "success", title: t("successTitle"), body: t("successBody", { reference: result.reference }) });
    } catch {
      toast({ tone: "error", title: tToast("errorTitle"), body: tToast("errorBody") });
    }
  });

  const error = errorText(errors.email);

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
      <label htmlFor="newsletter-email" className="sr-only">
        {t("emailLabel")}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder={t("emailPlaceholder")}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "newsletter-email-error" : undefined}
          className="h-12 flex-1 rounded-full border border-line-on-dark bg-white/[0.04] px-5 text-[0.9375rem] text-on-dark placeholder:text-muted-on-dark focus:border-on-dark focus:outline-none focus:ring-2 focus:ring-accent/40 aria-[invalid=true]:border-[#e58a8a]"
          {...register("email")}
        />
        <Button type="submit" variant="light" size="lg" loading={isSubmitting}>
          {t("submit")}
        </Button>
      </div>
      {error ? (
        <p id="newsletter-email-error" className="text-xs font-medium text-[#f0a3a3]">
          {error}
        </p>
      ) : null}
      <div aria-live="polite">
        {reference ? (
          <DemoNotice
            reference={reference}
            className="border-white/15 bg-white/[0.04] text-on-dark"
          />
        ) : null}
      </div>
    </form>
  );
}
