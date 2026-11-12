"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useForm, useWatch, type Path } from "react-hook-form";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { applyApiError } from "@/components/forms/applyApiError";
import { ContactFields } from "@/components/forms/ContactFields";
import { fieldA11y, FormField } from "@/components/forms/FormField";
import { ReviewRow, ReviewSection } from "@/components/forms/Review";
import { useErrorText } from "@/components/forms/useErrorText";
import { Button } from "@/components/ui/Button";
import { Checkbox, RadioCard } from "@/components/ui/Choice";
import { Combobox } from "@/components/ui/Combobox";
import { Textarea } from "@/components/ui/Input";
import { Stepper } from "@/components/ui/Stepper";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { useRouter } from "@/i18n/navigation";
import { createTestDriveBooking, getTestDriveAvailability } from "@/lib/api/bookings";
import { useFormat } from "@/lib/format/useFormat";
import {
  TEST_DRIVE_STEP_FIELDS,
  TEST_DRIVE_STEPS,
  testDriveSchema,
  type TestDriveInput,
  type TestDriveOutput,
  type TestDriveStep,
} from "@/lib/validation/booking";
import type { VehicleOption } from "@/lib/vehicleOptions";
import { toast } from "@/stores/toast";
import type { Showroom } from "@/types";
import { DatePicker, SlotPicker } from "./DateSlotPicker";

/** Server field errors → the step that owns the field. */
const FIELD_STEP: Record<string, TestDriveStep> = { vehicleId: "vehicle", showroomId: "showroom", slot: "time", phone: "details" };

/** Test-drive booking stepper (brief §10.H). Confirms on its own page with the DEMO- reference. */
export function TestDriveForm({ vehicles, showrooms }: { vehicles: VehicleOption[]; showrooms: Showroom[] }) {
  const t = useTranslations("testDrive");
  const tCommon = useTranslations("common");
  const tForms = useTranslations("forms");
  const tToast = useTranslations("toast");
  const locale = useLocale();
  const f = useFormat();
  const router = useRouter();
  const errorText = useErrorText();
  const params = useSearchParams();

  const preselected = vehicles.find((v) => v.slug === params.get("vehicle"));
  const [step, setStep] = useState(preselected ? 1 : 0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const form = useForm<TestDriveInput, unknown, TestDriveOutput>({
    resolver: zodResolver(testDriveSchema),
    mode: "onTouched",
    defaultValues: {
      vehicleId: preselected?.id ?? "",
      showroomId: preselected?.showroomIds.length === 1 ? preselected.showroomIds[0] : "",
      date: "",
      slot: "",
      name: "",
      phone: "",
      email: "",
      notes: "",
      hasLicence: false,
      consent: false,
    },
  });
  const { register, handleSubmit, trigger, setValue, setError, control, formState } = form;
  const { errors, isSubmitting } = formState;
  const values = useWatch({ control }) as TestDriveInput;
  const current = TEST_DRIVE_STEPS[step];
  const id = (name: string) => `td-${name}`;
  const err = (name: keyof TestDriveInput) => errorText(errors[name] as { message?: string } | undefined);

  const vehicle = vehicles.find((v) => v.id === values.vehicleId);
  const choices = showrooms.filter((s) => vehicle?.showroomIds.includes(s.id));
  const showroom = showrooms.find((s) => s.id === values.showroomId);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const next = async () => {
    const ok = await trigger(TEST_DRIVE_STEP_FIELDS[current] as Path<TestDriveInput>[], { shouldFocus: true });
    if (ok) setStep((s) => Math.min(s + 1, TEST_DRIVE_STEPS.length - 1));
  };

  const onSubmit = handleSubmit(
    async (v) => {
      try {
        const booking = await createTestDriveBooking({
          vehicleId: v.vehicleId,
          showroomId: v.showroomId,
          date: v.date,
          slot: v.slot,
          customer: { name: v.name, phone: v.phone, email: v.email },
          notes: v.notes || undefined,
        });
        router.push(`/test-drive/confirmation?ref=${booking.reference}`);
      } catch (error) {
        if (applyApiError(error, setError, { vehicleId: "vehicleId", showroomId: "showroomId", slot: "slot", phone: "phone" })) {
          const field = (error as { field: string }).field;
          // Show the step first (its effect focuses the heading), then move focus to the field.
          flushSync(() => setStep(TEST_DRIVE_STEPS.indexOf(FIELD_STEP[field] ?? "details")));
          form.setFocus(field as Path<TestDriveInput>);
        } else {
          toast({ tone: "error", title: tToast("errorTitle"), body: tToast("errorBody") });
        }
      }
    },
    (formErrors) => {
      const first = TEST_DRIVE_STEPS.findIndex((s) => TEST_DRIVE_STEP_FIELDS[s].some((field) => field in formErrors));
      if (first >= 0) setStep(first);
    },
  );

  const when = values.date && values.slot ? `${f.date(values.date, "weekday")}, ${f.time(values.slot)}` : null;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-10 lg:grid-cols-12">
      <div className="min-w-0 lg:col-span-8">
        <Stepper steps={TEST_DRIVE_STEPS.map((s) => t(`steps.${s}`))} current={step} onStepClick={setStep} />

        <div className="mt-8 rounded-card border border-line bg-bg-alt p-5 sm:p-8">
          <h2 ref={headingRef} tabIndex={-1} className="text-xl font-medium focus:outline-none">
            {t(`headings.${current}`)}
          </h2>
          <p className="mt-1 text-sm text-muted">{t(`leads.${current}`)}</p>

          <div className="mt-8 flex flex-col gap-6">
            {current === "vehicle" ? (
              <FormField id={id("vehicle")} label={t("fields.vehicle")} error={err("vehicleId")} hint={t("hints.vehicle")}>
                <Combobox
                  id={id("vehicle")}
                  value={values.vehicleId || null}
                  placeholder={t("fields.vehiclePlaceholder")}
                  invalid={Boolean(errors.vehicleId)}
                  describedBy={errors.vehicleId ? `${id("vehicle")}-error` : `${id("vehicle")}-hint`}
                  onValueChange={(vid) => {
                    setValue("vehicleId", vid, { shouldValidate: true });
                    const chosen = vehicles.find((v) => v.id === vid);
                    if (!chosen?.showroomIds.includes(values.showroomId ?? "")) {
                      setValue("showroomId", chosen?.showroomIds.length === 1 ? chosen.showroomIds[0] : "");
                      setValue("date", "");
                      setValue("slot", "");
                    }
                  }}
                  options={vehicles.map((v) => ({ value: v.id, label: v.label, hint: v.hint }))}
                />
              </FormField>
            ) : null}

            {current === "showroom" ? (
              <fieldset aria-describedby={errors.showroomId ? `${id("showroom")}-error` : undefined}>
                <legend className="sr-only">{t("fields.showroom")}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {choices.map((s) => (
                    <RadioCard
                      key={s.id}
                      value={s.id}
                      label={s.name[locale]}
                      description={s.address[locale]}
                      aria-invalid={errors.showroomId ? true : undefined}
                      {...register("showroomId", {
                        onChange: () => {
                          setValue("date", "");
                          setValue("slot", "");
                        },
                      })}
                    />
                  ))}
                </div>
                {errors.showroomId ? (
                  <p id={`${id("showroom")}-error`} className="mt-2 text-xs font-medium text-danger">
                    {err("showroomId")}
                  </p>
                ) : null}
              </fieldset>
            ) : null}

            {current === "date" && showroom ? (
              <DatePicker
                name={id("date")}
                hours={showroom.hours}
                value={values.date || undefined}
                error={err("date")}
                onChange={(d) => {
                  setValue("date", d, { shouldValidate: true });
                  setValue("slot", "");
                }}
              />
            ) : null}

            {current === "time" && showroom && values.date ? (
              <SlotPicker
                name={id("slot")}
                showroomId={showroom.id}
                date={values.date}
                value={values.slot || undefined}
                error={err("slot")}
                load={getTestDriveAvailability}
                onChange={(slot) => setValue("slot", slot, { shouldValidate: true })}
              />
            ) : null}

            {current === "details" ? (
              <>
                <ContactFields form={form} idPrefix="td" />
                <FormField id={id("notes")} label={t("fields.notes")} optionalLabel={tCommon("optional")} error={err("notes")}>
                  <Textarea rows={3} placeholder={t("fields.notesPlaceholder")} {...fieldA11y(id("notes"), err("notes"))} {...register("notes")} />
                </FormField>
                <div>
                  <Checkbox
                    label={t("fields.licence")}
                    aria-invalid={errors.hasLicence ? true : undefined}
                    aria-describedby={errors.hasLicence ? id("licence-error") : undefined}
                    {...register("hasLicence")}
                  />
                  {errors.hasLicence ? (
                    <p id={id("licence-error")} className="mt-2 text-xs font-medium text-danger">
                      {err("hasLicence")}
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}

            {current === "review" ? (
              <>
                <ReviewSection title={t("steps.vehicle")} onEdit={() => setStep(0)} editLabel={t("edit")}>
                  <ReviewRow label={t("fields.vehicle")} value={vehicle?.label ?? ""} />
                </ReviewSection>
                <ReviewSection title={t("summary.where")} onEdit={() => setStep(1)} editLabel={t("edit")}>
                  <ReviewRow label={t("fields.showroom")} value={showroom?.name[locale] ?? ""} />
                  <ReviewRow label={t("summary.when")} value={when ?? ""} />
                </ReviewSection>
                <ReviewSection title={t("steps.details")} onEdit={() => setStep(4)} editLabel={t("edit")}>
                  <ReviewRow label={tForms("name")} value={values.name ?? ""} />
                  <ReviewRow label={tForms("phone")} value={values.phone ?? ""} />
                  <ReviewRow label={tForms("email")} value={values.email || "—"} />
                </ReviewSection>
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
              </>
            ) : null}
          </div>

          <div className="mt-10 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-between">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)} icon={<ArrowLeft aria-hidden className="size-4" />}>
                {tCommon("back")}
              </Button>
            ) : (
              <span />
            )}
            {/* Distinct keys: a reused button flipped to type="submit" would submit on the Continue click (D28). */}
            {current === "review" ? (
              <Button key="submit" type="submit" size="lg" loading={isSubmitting} loadingLabel={t("submitting")}>
                {t("submit")}
              </Button>
            ) : (
              <Button key="continue" size="lg" onClick={next}>
                {tCommon("continue")}
                <ArrowRight aria-hidden className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <aside className="lg:col-span-4">
        <div className="on-dark flex flex-col gap-5 rounded-card bg-graphite p-6 text-on-dark lg:sticky lg:top-[calc(var(--header-h-compact)+1.5rem)]">
          <p className="eyebrow text-accent-2">{t("summary.title")}</p>
          <dl className="grid gap-4 text-sm" aria-live="polite">
            <SummaryItem label={t("fields.vehicle")} value={vehicle?.label} empty={t("summary.notChosen")} />
            <SummaryItem label={t("fields.showroom")} value={showroom?.name[locale]} empty={t("summary.notChosen")} />
            <SummaryItem label={t("summary.when")} value={when ?? undefined} empty={t("summary.notChosen")} />
          </dl>
          <p className="border-t border-line-on-dark pt-4 text-xs leading-relaxed text-muted-on-dark">{t("summary.note")}</p>
          <WhatsAppButton tone="outline" size="sm" context={{ kind: "testDrive", vehicle: vehicle?.whatsapp }} className="border-line-on-dark text-on-dark" />
        </div>
      </aside>
    </form>
  );
}

function SummaryItem({ label, value, empty }: { label: string; value: string | undefined; empty: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-on-dark">{label}</dt>
      <dd className={value ? "mt-0.5 font-medium" : "mt-0.5 text-muted-on-dark"}>{value ?? empty}</dd>
    </div>
  );
}
