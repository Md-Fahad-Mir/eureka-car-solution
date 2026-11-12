"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Checkbox, RadioCard } from "@/components/ui/Choice";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { submitCorporateInquiry } from "@/lib/api/inquiries";
import {
  corporateInquirySchema,
  FLEET_SIZES,
  FLEET_TIMELINES,
  INDUSTRIES,
  type CorporateInquiryFormInput,
  type CorporateInquiryFormOutput,
} from "@/lib/validation/enquiries";
import { toast } from "@/stores/toast";
import { VEHICLE_CATEGORIES, type CorporateInquiry } from "@/types";
import { applyApiError } from "./applyApiError";
import { Confirmation } from "./Confirmation";
import { ContactFields } from "./ContactFields";
import { fieldA11y, FormField } from "./FormField";
import { useErrorText } from "./useErrorText";

/** Corporate fleet inquiry (brief §10.K). Confirms inline: demo notice + WhatsApp. */
export function CorporateInquiryForm() {
  const t = useTranslations("fleet.form");
  const tCommon = useTranslations("common");
  const tTax = useTranslations("taxonomy");
  const tToast = useTranslations("toast");
  const errorText = useErrorText();
  const [submitted, setSubmitted] = useState<CorporateInquiry | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const form = useForm<CorporateInquiryFormInput, unknown, CorporateInquiryFormOutput>({
    resolver: zodResolver(corporateInquirySchema),
    defaultValues: {
      company: "",
      industry: undefined,
      fleetSize: undefined,
      vehicleTypes: [],
      timeline: undefined,
      financingInterest: false,
      name: "",
      designation: "",
      phone: "",
      email: "",
      message: "",
      consent: false,
    },
  });
  const { register, handleSubmit, setError, formState } = form;
  const { errors, isSubmitting } = formState;
  const id = (name: string) => `fleet-${name}`;
  const err = (name: keyof CorporateInquiryFormInput) => errorText(errors[name] as { message?: string } | undefined);

  useEffect(() => {
    if (submitted) headingRef.current?.focus();
  }, [submitted]);

  const onSubmit = handleSubmit(async (v) => {
    try {
      setSubmitted(
        await submitCorporateInquiry({
          company: v.company,
          industry: v.industry,
          fleetSize: v.fleetSize,
          vehicleTypes: v.vehicleTypes,
          timeline: v.timeline,
          financingInterest: v.financingInterest,
          customer: { name: v.name, phone: v.phone, email: v.email, designation: v.designation || undefined },
          message: v.message || undefined,
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
        body={t("done.body", { company: submitted.company })}
        reference={submitted.reference}
        actions={<WhatsAppButton size="lg" context={{ kind: "corporate", reference: submitted.reference }} />}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id={id("company")} label={t("company")} error={err("company")} className="sm:col-span-2">
          <Input autoComplete="organization" {...fieldA11y(id("company"), err("company"))} {...register("company")} />
        </FormField>
        <FormField id={id("industry")} label={t("industry")} error={err("industry")}>
          <Select defaultValue="" {...fieldA11y(id("industry"), err("industry"))} {...register("industry")}>
            <option value="" disabled>
              {t("choose")}
            </option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {t(`industries.${i}`)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField id={id("timeline")} label={t("timeline")} error={err("timeline")}>
          <Select defaultValue="" {...fieldA11y(id("timeline"), err("timeline"))} {...register("timeline")}>
            <option value="" disabled>
              {t("choose")}
            </option>
            {FLEET_TIMELINES.map((i) => (
              <option key={i} value={i}>
                {t(`timelines.${i}`)}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <fieldset aria-describedby={errors.fleetSize ? id("size-error") : undefined}>
        <legend className="mb-3 text-sm font-medium">{t("fleetSize")}</legend>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {FLEET_SIZES.map((s) => (
            <RadioCard key={s} value={s} label={t(`sizes.${s}`)} aria-invalid={errors.fleetSize ? true : undefined} {...register("fleetSize")} />
          ))}
        </div>
        {errors.fleetSize ? (
          <p id={id("size-error")} className="mt-2 text-xs font-medium text-danger">
            {err("fleetSize")}
          </p>
        ) : null}
      </fieldset>

      <fieldset aria-describedby={errors.vehicleTypes ? id("types-error") : undefined}>
        <legend className="mb-3 text-sm font-medium">{t("vehicleTypes")}</legend>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {VEHICLE_CATEGORIES.map((c) => (
            <RadioCard key={c} type="checkbox" value={c} label={tTax(`category.${c}`)} aria-invalid={errors.vehicleTypes ? true : undefined} {...register("vehicleTypes")} />
          ))}
        </div>
        {errors.vehicleTypes ? (
          <p id={id("types-error")} className="mt-2 text-xs font-medium text-danger">
            {err("vehicleTypes")}
          </p>
        ) : null}
      </fieldset>

      <Checkbox label={t("financing")} description={t("financingHint")} {...register("financingInterest")} />

      <fieldset className="flex flex-col gap-5">
        <legend className="mb-3 text-sm font-medium">{t("contact")}</legend>
        <ContactFields form={form} idPrefix="fleet" emailRequired />
        <FormField id={id("designation")} label={t("designation")} optionalLabel={tCommon("optional")} error={err("designation")}>
          <Input autoComplete="organization-title" {...fieldA11y(id("designation"), err("designation"))} {...register("designation")} />
        </FormField>
      </fieldset>

      <FormField id={id("message")} label={t("message")} optionalLabel={tCommon("optional")} error={err("message")}>
        <Textarea rows={3} placeholder={t("messagePlaceholder")} {...fieldA11y(id("message"), err("message"))} {...register("message")} />
      </FormField>

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
