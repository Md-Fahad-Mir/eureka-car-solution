"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Checkbox, RadioCard } from "@/components/ui/Choice";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { submitInquiry } from "@/lib/api/inquiries";
import {
  CONTACT_CHANNELS,
  CONTACT_TIMES,
  inquirySchema,
  PAYMENT_PREFERENCES,
  type InquiryFormInput,
  type InquiryFormOutput,
} from "@/lib/validation/inquiry";
import { toast } from "@/stores/toast";
import type { FinancePartner, PurchaseInquiry } from "@/types";
import { applyApiError } from "./applyApiError";
import { fieldA11y, FormField } from "./FormField";
import { useErrorText } from "./useErrorText";

export type InquiryVehicleOption = { id: string; label: string };

/**
 * Purchase inquiry form (brief §10.I). Submits to the mock service and hands
 * the created record to `onSuccess`. No payment is ever taken.
 */
export function InquiryForm({
  vehicles,
  defaultVehicleId,
  partners,
  idPrefix = "inquiry",
  onSuccess,
}: {
  /** Vehicles to choose from. A single option renders as fixed text. */
  vehicles: InquiryVehicleOption[];
  defaultVehicleId?: string;
  partners: Pick<FinancePartner, "id" | "name" | "type">[];
  idPrefix?: string;
  onSuccess: (inquiry: PurchaseInquiry) => void;
}) {
  const t = useTranslations("inquiry");
  const tCommon = useTranslations("common");
  const tToast = useTranslations("toast");
  const locale = useLocale();
  const errorText = useErrorText();
  const id = (name: string) => `${idPrefix}-${name}`;

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormInput, unknown, InquiryFormOutput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      vehicleId: defaultVehicleId ?? (vehicles.length === 1 ? vehicles[0].id : ""),
      name: "",
      phone: "",
      email: "",
      paymentPreference: undefined,
      financingPreference: "",
      contactChannel: "whatsapp",
      contactTime: "anytime",
      message: "",
      consent: false,
    },
  });

  const payment = useWatch({ control, name: "paymentPreference" });
  const channel = useWatch({ control, name: "contactChannel" });
  const partnerType = payment === "islamic" ? "islamic" : payment === "emi" ? "conventional" : null;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const inquiry = await submitInquiry({
        vehicleId: values.vehicleId,
        paymentPreference: values.paymentPreference,
        financingPreference: partnerType ? values.financingPreference || undefined : undefined,
        contact: { channel: values.contactChannel, time: values.contactTime },
        message: values.message || undefined,
        customer: { name: values.name, phone: values.phone, email: values.email },
        consent: values.consent,
      });
      onSuccess(inquiry);
    } catch (error) {
      if (!applyApiError(error, setError, { phone: "phone", vehicleId: "vehicleId" })) {
        toast({ tone: "error", title: tToast("errorTitle"), body: tToast("errorBody") });
      }
    }
  });

  const err = {
    vehicleId: errorText(errors.vehicleId),
    name: errorText(errors.name),
    phone: errorText(errors.phone),
    email: errorText(errors.email),
    paymentPreference: errorText(errors.paymentPreference),
    consent: errorText(errors.consent),
    message: errorText(errors.message),
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {vehicles.length === 1 ? (
        <div className="rounded-2xl bg-ink/[0.04] px-4 py-3 text-sm">
          <span className="text-muted">{t("vehicle")}: </span>
          <span className="font-medium">{vehicles[0].label}</span>
          <input type="hidden" {...register("vehicleId")} />
        </div>
      ) : (
        <FormField id={id("vehicle")} label={t("vehicle")} error={err.vehicleId}>
          <Select {...fieldA11y(id("vehicle"), err.vehicleId)} {...register("vehicleId")}>
            <option value="">{t("chooseVehicle")}</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </Select>
        </FormField>
      )}

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-sm font-medium">{t("yourDetails")}</legend>
        <FormField id={id("name")} label={t("name")} error={err.name} className="sm:col-span-2">
          <Input autoComplete="name" {...fieldA11y(id("name"), err.name)} {...register("name")} />
        </FormField>
        <FormField id={id("phone")} label={t("phone")} hint={t("phoneHint")} error={err.phone}>
          <Input type="tel" autoComplete="tel" inputMode="tel" placeholder="01XXXXXXXXX" {...fieldA11y(id("phone"), err.phone, t("phoneHint"))} {...register("phone")} />
        </FormField>
        <FormField
          id={id("email")}
          label={t("email")}
          optionalLabel={channel === "email" ? undefined : tCommon("optional")}
          error={err.email}
        >
          <Input type="email" autoComplete="email" inputMode="email" {...fieldA11y(id("email"), err.email)} {...register("email")} />
        </FormField>
      </fieldset>

      <fieldset aria-describedby={err.paymentPreference ? id("payment-error") : undefined}>
        <legend className="mb-3 text-sm font-medium">{t("paymentPreference")}</legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {PAYMENT_PREFERENCES.map((p) => (
            <RadioCard
              key={p}
              value={p}
              label={t(`payment.${p}`)}
              description={t(`paymentHint.${p}`)}
              aria-invalid={err.paymentPreference ? true : undefined}
              {...register("paymentPreference")}
            />
          ))}
        </div>
        {err.paymentPreference ? (
          <p id={id("payment-error")} className="mt-2 text-xs font-medium text-danger">
            {err.paymentPreference}
          </p>
        ) : null}
      </fieldset>

      {partnerType ? (
        <FormField id={id("partner")} label={t("financingPreference")} optionalLabel={tCommon("optional")} hint={t("partnerHint")}>
          <Select {...fieldA11y(id("partner"), undefined, t("partnerHint"))} {...register("financingPreference")}>
            <option value="">{t("noPreference")}</option>
            {partners
              .filter((p) => p.type === partnerType)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name[locale]}
                </option>
              ))}
          </Select>
        </FormField>
      ) : null}

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-sm font-medium">{t("contactPreference")}</legend>
        <FormField id={id("channel")} label={t("channel")}>
          <Select {...fieldA11y(id("channel"))} {...register("contactChannel")}>
            {CONTACT_CHANNELS.map((c) => (
              <option key={c} value={c}>
                {t(`channels.${c}`)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField id={id("time")} label={t("time")}>
          <Select {...fieldA11y(id("time"))} {...register("contactTime")}>
            {CONTACT_TIMES.map((c) => (
              <option key={c} value={c}>
                {t(`times.${c}`)}
              </option>
            ))}
          </Select>
        </FormField>
      </fieldset>

      <FormField id={id("message")} label={t("message")} optionalLabel={tCommon("optional")} error={err.message}>
        <Textarea rows={3} placeholder={t("messagePlaceholder")} {...fieldA11y(id("message"), err.message)} {...register("message")} />
      </FormField>

      <div>
        <Checkbox
          label={t("consent")}
          aria-invalid={err.consent ? true : undefined}
          aria-describedby={err.consent ? id("consent-error") : undefined}
          {...register("consent")}
        />
        {err.consent ? (
          <p id={id("consent-error")} className="mt-2 text-xs font-medium text-danger">
            {err.consent}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <Button type="submit" size="lg" loading={isSubmitting} loadingLabel={t("sending")}>
          {t("submit")}
        </Button>
        <p className="text-xs text-muted">{t("noPayment")}</p>
      </div>
    </form>
  );
}
