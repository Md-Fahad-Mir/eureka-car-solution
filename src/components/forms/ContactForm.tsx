"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Choice";
import { Select, Textarea } from "@/components/ui/Input";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { submitContactMessage } from "@/lib/api/inquiries";
import { CONTACT_TOPICS, contactSchema, type ContactFormInput, type ContactFormOutput } from "@/lib/validation/contact";
import { toast } from "@/stores/toast";
import type { ContactMessage, Showroom } from "@/types";
import { applyApiError } from "./applyApiError";
import { Confirmation } from "./Confirmation";
import { ContactFields } from "./ContactFields";
import { fieldA11y, FormField } from "./FormField";
import { useErrorText } from "./useErrorText";

/** Showroom contact form (brief §10.N). Mock submit with an honest confirmation and WhatsApp. */
export function ContactForm({ showrooms }: { showrooms: Pick<Showroom, "id" | "name">[] }) {
  const t = useTranslations("showrooms.form");
  const tCommon = useTranslations("common");
  const tToast = useTranslations("toast");
  const locale = useLocale();
  const errorText = useErrorText();
  const [submitted, setSubmitted] = useState<ContactMessage | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const form = useForm<ContactFormInput, unknown, ContactFormOutput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { showroomId: "", topic: "sales", message: "", name: "", phone: "", email: "", consent: false },
  });
  const { register, handleSubmit, setError, formState } = form;
  const { errors, isSubmitting } = formState;
  const id = (name: string) => `contact-${name}`;
  const err = (name: keyof ContactFormInput) => errorText(errors[name] as { message?: string } | undefined);

  useEffect(() => {
    if (submitted) headingRef.current?.focus();
  }, [submitted]);

  const onSubmit = handleSubmit(async (v) => {
    try {
      setSubmitted(
        await submitContactMessage({
          showroomId: v.showroomId || undefined,
          topic: v.topic,
          message: v.message,
          customer: { name: v.name, phone: v.phone, email: v.email },
          consent: v.consent,
        }),
      );
    } catch (error) {
      if (!applyApiError(error, setError, { phone: "phone" })) toast({ tone: "error", title: tToast("errorTitle"), body: tToast("errorBody") });
    }
  });

  if (submitted) {
    return (
      <Confirmation
        headingRef={headingRef}
        title={t("done.title")}
        body={t("done.body")}
        reference={submitted.reference}
        actions={<WhatsAppButton size="lg" context={{ kind: "general", reference: submitted.reference }} />}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id={id("topic")} label={t("topic")} error={err("topic")}>
          <Select {...fieldA11y(id("topic"), err("topic"))} {...register("topic")}>
            {CONTACT_TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {t(`topics.${topic}`)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField id={id("showroom")} label={t("showroom")} optionalLabel={tCommon("optional")}>
          <Select {...fieldA11y(id("showroom"))} {...register("showroomId")}>
            <option value="">{t("anyShowroom")}</option>
            {showrooms.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name[locale]}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      <FormField id={id("message")} label={t("message")} error={err("message")}>
        <Textarea rows={4} {...fieldA11y(id("message"), err("message"))} {...register("message")} />
      </FormField>
      <ContactFields form={form} idPrefix="contact" />
      <div>
        <Checkbox
          label={t("consent")}
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? id("consent-error") : undefined}
          {...register("consent")}
        />
        {errors.consent ? (
          <p id={id("consent-error")} className="mt-2 text-xs font-medium text-danger">
            {err("consent")}
          </p>
        ) : null}
      </div>
      <Button type="submit" size="lg" loading={isSubmitting} loadingLabel={t("sending")} className="self-start">
        {t("submit")}
      </Button>
    </form>
  );
}
