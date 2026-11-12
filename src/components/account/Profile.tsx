"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { applyApiError } from "@/components/forms/applyApiError";
import { ContactFields } from "@/components/forms/ContactFields";
import { fieldA11y, FormField } from "@/components/forms/FormField";
import { useErrorText } from "@/components/forms/useErrorText";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { updateProfile } from "@/lib/api/account";
import { useFormat } from "@/lib/format/useFormat";
import { PREFERRED_CONTACTS, profileSchema, type ProfileFormInput, type ProfileFormOutput } from "@/lib/validation/account";
import { formatBdPhone } from "@/lib/validation/phone";
import { toast } from "@/stores/toast";
import { useAccount } from "./AccountData";
import { SectionHeader } from "./parts";

/** Editable profile, saved in this browser (demo). */
export function Profile() {
  const t = useTranslations("account.profile");
  const tToast = useTranslations("toast");
  const tInq = useTranslations("inquiry");
  const f = useFormat();
  const errorText = useErrorText();
  const { data, update } = useAccount();
  const p = data.profile;

  const form = useForm<ProfileFormInput, unknown, ProfileFormOutput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: p.name,
      email: p.email,
      phone: formatBdPhone(p.phone),
      city: p.city,
      address: p.address,
      preferredLanguage: p.preferredLanguage,
      preferredContact: p.preferredContact === "email" || p.preferredContact === "call" ? p.preferredContact : "whatsapp",
    },
  });
  const { register, handleSubmit, setError, formState } = form;
  const { errors, isSubmitting, isDirty } = formState;
  const err = (name: keyof ProfileFormInput) => errorText(errors[name]);

  const onSubmit = handleSubmit(async (v) => {
    try {
      const profile = await updateProfile(v);
      update((d) => ({ ...d, profile }));
      form.reset({ ...v, phone: formatBdPhone(v.phone) });
      toast({ tone: "success", title: t("saved"), body: t("savedBody") });
    } catch (error) {
      if (!applyApiError(error, setError, { phone: "phone" })) toast({ tone: "error", title: tToast("errorTitle"), body: tToast("errorBody") });
    }
  });

  return (
    <div>
      <SectionHeader title={t("title")} lead={t("lead", { date: f.date(p.memberSince, "long") })} />
      <form onSubmit={onSubmit} noValidate className="flex max-w-3xl flex-col gap-6 rounded-card border border-line bg-bg-alt p-5 sm:p-8">
        <ContactFields form={form} idPrefix="profile" emailRequired />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="profile-city" label={t("city")} error={err("city")}>
            <Input autoComplete="address-level2" {...fieldA11y("profile-city", err("city"))} {...register("city")} />
          </FormField>
          <FormField id="profile-lang" label={t("language")}>
            <Select {...fieldA11y("profile-lang")} {...register("preferredLanguage")}>
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
            </Select>
          </FormField>
          <FormField id="profile-address" label={t("address")} error={err("address")} className="sm:col-span-2">
            <Textarea rows={2} autoComplete="street-address" {...fieldA11y("profile-address", err("address"))} {...register("address")} />
          </FormField>
          <FormField id="profile-contact" label={t("contact")}>
            <Select {...fieldA11y("profile-contact")} {...register("preferredContact")}>
              {PREFERRED_CONTACTS.map((c) => (
                <option key={c} value={c}>
                  {tInq(`channels.${c}`)}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
        <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">{t("localNote")}</p>
          <Button type="submit" loading={isSubmitting} loadingLabel={t("saving")} disabled={!isDirty}>
            {t("save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
