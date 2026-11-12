"use client";

import type { FieldError, FieldValues, Path, UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";
import { fieldA11y, FormField } from "./FormField";
import { useErrorText } from "./useErrorText";

type ContactShape = { name: string; phone: string; email?: string };

/** Name, Bangladeshi mobile and email fields shared by the booking and enquiry forms. */
export function ContactFields<T extends FieldValues & ContactShape, TOut extends FieldValues>({
  form,
  idPrefix,
  emailRequired = false,
}: {
  form: UseFormReturn<T, unknown, TOut>;
  idPrefix: string;
  emailRequired?: boolean;
}) {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");
  const errorText = useErrorText();
  const { register, formState } = form;
  const id = (name: string) => `${idPrefix}-${name}`;
  const err = (name: keyof ContactShape) => errorText(formState.errors[name] as FieldError | undefined);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <FormField id={id("name")} label={t("name")} error={err("name")} className="sm:col-span-2">
        <Input autoComplete="name" {...fieldA11y(id("name"), err("name"))} {...register("name" as Path<T>)} />
      </FormField>
      <FormField id={id("phone")} label={t("phone")} hint={t("phoneHint")} error={err("phone")}>
        <Input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="01XXXXXXXXX"
          {...fieldA11y(id("phone"), err("phone"), t("phoneHint"))}
          {...register("phone" as Path<T>)}
        />
      </FormField>
      <FormField id={id("email")} label={t("email")} optionalLabel={emailRequired ? undefined : tCommon("optional")} error={err("email")}>
        <Input type="email" inputMode="email" autoComplete="email" {...fieldA11y(id("email"), err("email"))} {...register("email" as Path<T>)} />
      </FormField>
    </div>
  );
}
