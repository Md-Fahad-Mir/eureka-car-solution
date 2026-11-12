"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useForm, useWatch, type Path } from "react-hook-form";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { applyApiError } from "@/components/forms/applyApiError";
import { Confirmation } from "@/components/forms/Confirmation";
import { ContactFields } from "@/components/forms/ContactFields";
import { fieldA11y, FormField } from "@/components/forms/FormField";
import { ReviewRow, ReviewSection } from "@/components/forms/Review";
import { useErrorText } from "@/components/forms/useErrorText";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Checkbox, RadioCard } from "@/components/ui/Choice";
import { Input, Textarea } from "@/components/ui/Input";
import { Stepper } from "@/components/ui/Stepper";
import { Timeline } from "@/components/ui/Timeline";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { getCustomerDashboard } from "@/lib/api/account";
import { createServiceBooking, getServiceAvailability } from "@/lib/api/service";
import { useFormat } from "@/lib/format/useFormat";
import {
  MIN_SERVICE_YEAR,
  SERVICE_STEP_FIELDS,
  SERVICE_STEPS,
  serviceBookingSchema,
  type ServiceBookingFormInput,
  type ServiceBookingFormOutput,
  type ServiceStep,
} from "@/lib/validation/booking";
import { useDemoSessionStore } from "@/stores/demoSession";
import { toast } from "@/stores/toast";
import type { OwnedVehicle, ServiceBooking, ServicePackage, Showroom } from "@/types";
import { DatePicker, SlotPicker } from "./DateSlotPicker";

const FIELD_STEP: Record<string, ServiceStep> = { packageIds: "packages", showroomId: "centre", slot: "when", phone: "details" };

/** Service booking stepper (brief §10.J). Confirms inline with the DEMO- reference and a tracking link. */
export function ServiceBookingForm({
  packages,
  centres,
  brandNames,
}: {
  packages: ServicePackage[];
  centres: Showroom[];
  /** Suggestions for manual entry. */
  brandNames: string[];
}) {
  const t = useTranslations("serviceBook");
  const tService = useTranslations("service");
  const tStatus = useTranslations("serviceTrack");
  const tCommon = useTranslations("common");
  const tForms = useTranslations("forms");
  const tTax = useTranslations("taxonomy");
  const tToast = useTranslations("toast");
  const locale = useLocale();
  const f = useFormat();
  const errorText = useErrorText();
  const params = useSearchParams();
  const session = useDemoSessionStore((s) => s.session);

  const [owned, setOwned] = useState<OwnedVehicle[]>([]);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState<ServiceBooking | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const prePackage = packages.find((p) => p.id === params.get("package"));
  const form = useForm<ServiceBookingFormInput, unknown, ServiceBookingFormOutput>({
    resolver: zodResolver(serviceBookingSchema),
    mode: "onTouched",
    defaultValues: {
      vehicleSource: "manual",
      ownedVehicleId: "",
      brand: "",
      model: "",
      year: undefined,
      registrationNo: "",
      packageIds: prePackage ? [prePackage.id] : [],
      showroomId: centres.length === 1 ? centres[0].id : "",
      date: "",
      slot: "",
      pickup: false,
      pickupAddress: "",
      name: "",
      phone: "",
      email: "",
      notes: "",
      consent: false,
    },
  });
  const { register, handleSubmit, trigger, setValue, setError, control, formState } = form;
  const { errors, isSubmitting } = formState;
  const values = useWatch({ control }) as ServiceBookingFormInput;
  const current = SERVICE_STEPS[step];
  const id = (name: string) => `sb-${name}`;
  const err = (name: keyof ServiceBookingFormInput) => errorText(errors[name] as { message?: string } | undefined);

  // Signed-in demo customers can pick from "My vehicles".
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    getCustomerDashboard().then((d) => {
      if (cancelled || !d.ownedVehicles.length) return;
      setOwned(d.ownedVehicles);
      setValue("vehicleSource", "owned");
      setValue("ownedVehicleId", d.ownedVehicles[0].id);
    });
    return () => {
      cancelled = true;
    };
  }, [session, setValue]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, submitted]);

  const centre = centres.find((c) => c.id === values.showroomId);
  const ownedVehicle = owned.find((v) => v.id === values.ownedVehicleId);
  const chosen = packages.filter((p) => values.packageIds?.includes(p.id));
  const estimate = chosen.reduce((sum, p) => sum + p.price.amount, 0);
  const vehicleLabel =
    values.vehicleSource === "owned" && ownedVehicle
      ? `${ownedVehicle.label} · ${ownedVehicle.registrationNo}`
      : [values.brand, values.model, values.year ? f.number(Number(values.year), { useGrouping: false }) : ""].filter(Boolean).join(" ") +
        (values.registrationNo ? ` · ${values.registrationNo}` : "");

  const next = async () => {
    const ok = await trigger(SERVICE_STEP_FIELDS[current] as Path<ServiceBookingFormInput>[], { shouldFocus: true });
    if (ok) setStep((s) => Math.min(s + 1, SERVICE_STEPS.length - 1));
  };

  const onSubmit = handleSubmit(
    async (v) => {
      const own = owned.find((o) => o.id === v.ownedVehicleId);
      try {
        const booking = await createServiceBooking({
          vehicle:
            v.vehicleSource === "owned" && own
              ? { ownedVehicleId: own.id, brand: own.brand, model: own.model, year: own.year, registrationNo: own.registrationNo }
              : { brand: v.brand ?? "", model: v.model ?? "", year: v.year ?? 0, registrationNo: v.registrationNo ?? "" },
          packageIds: v.packageIds,
          showroomId: v.showroomId,
          date: v.date,
          slot: v.slot,
          pickup: { required: v.pickup, address: v.pickup ? v.pickupAddress : undefined },
          customer: { name: v.name, phone: v.phone, email: v.email },
          notes: v.notes || undefined,
        });
        setSubmitted(booking);
      } catch (error) {
        if (applyApiError(error, setError, { packageIds: "packageIds", showroomId: "showroomId", slot: "slot", phone: "phone" })) {
          const field = (error as { field: string }).field;
          // Show the step first (its effect focuses the heading), then move focus to the field.
          flushSync(() => setStep(SERVICE_STEPS.indexOf(FIELD_STEP[field] ?? "details")));
          form.setFocus(field as Path<ServiceBookingFormInput>);
        } else {
          toast({ tone: "error", title: tToast("errorTitle"), body: tToast("errorBody") });
        }
      }
    },
    (formErrors) => {
      const first = SERVICE_STEPS.findIndex((s) => SERVICE_STEP_FIELDS[s].some((field) => field in formErrors));
      if (first >= 0) setStep(first);
    },
  );

  if (submitted) {
    return (
      <div className="max-w-2xl">
        <Confirmation
          headingRef={headingRef}
          title={t("done.title")}
          body={t("done.body")}
          reference={submitted.reference}
          actions={
            <>
              <ButtonLink href={`/service/track?ref=${submitted.reference}`} size="lg">
                {t("done.track")}
              </ButtonLink>
              <WhatsAppButton
                size="lg"
                tone="outline"
                context={{ kind: "service", vehicle: `${submitted.vehicle.brand} ${submitted.vehicle.model}`, registration: submitted.vehicle.registrationNo, reference: submitted.reference }}
              />
            </>
          }
        >
          <div className="rounded-card border border-line bg-bg-alt p-5">
            <Timeline
              currentKey={submitted.status}
              steps={submitted.timeline.map((s) => ({ key: s.status, label: tStatus(`status.${s.status}`), at: s.at ? f.dateTime(s.at) : null }))}
            />
          </div>
        </Confirmation>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-10 lg:grid-cols-12">
      <div className="min-w-0 lg:col-span-8">
        <Stepper steps={SERVICE_STEPS.map((s) => t(`steps.${s}`))} current={step} onStepClick={setStep} />

        <div className="mt-8 rounded-card border border-line bg-bg-alt p-5 sm:p-8">
          <h2 ref={headingRef} tabIndex={-1} className="text-xl font-medium focus:outline-none">
            {t(`headings.${current}`)}
          </h2>
          <p className="mt-1 text-sm text-muted">{t(`leads.${current}`)}</p>

          <div className="mt-8 flex flex-col gap-6">
            {current === "vehicle" ? (
              <>
                {owned.length ? (
                  <fieldset>
                    <legend className="mb-3 text-sm font-medium">{t("fields.myVehicles")}</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {owned.map((v) => (
                        <RadioCard
                          key={v.id}
                          name="sb-owned"
                          value={v.id}
                          checked={values.vehicleSource === "owned" && values.ownedVehicleId === v.id}
                          onChange={() => {
                            setValue("vehicleSource", "owned");
                            setValue("ownedVehicleId", v.id, { shouldValidate: true });
                          }}
                          label={v.label}
                          description={`${v.registrationNo} · ${tTax(`fuel.${v.fuelType}`)}`}
                        />
                      ))}
                      <RadioCard
                        name="sb-owned"
                        value="manual"
                        checked={values.vehicleSource === "manual"}
                        onChange={() => setValue("vehicleSource", "manual")}
                        label={t("fields.anotherVehicle")}
                        description={t("fields.anotherVehicleHint")}
                      />
                    </div>
                  </fieldset>
                ) : null}
                {values.vehicleSource === "manual" ? (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField id={id("brand")} label={t("fields.brand")} error={err("brand")}>
                      <Input list={id("brands")} autoComplete="off" {...fieldA11y(id("brand"), err("brand"))} {...register("brand")} />
                    </FormField>
                    <datalist id={id("brands")}>
                      {brandNames.map((b) => (
                        <option key={b} value={b} />
                      ))}
                    </datalist>
                    <FormField id={id("model")} label={t("fields.model")} error={err("model")}>
                      <Input autoComplete="off" {...fieldA11y(id("model"), err("model"))} {...register("model")} />
                    </FormField>
                    <FormField id={id("year")} label={t("fields.year")} error={err("year")}>
                      <Input
                        inputMode="numeric"
                        maxLength={4}
                        placeholder={String(MIN_SERVICE_YEAR + 36)}
                        {...fieldA11y(id("year"), err("year"))}
                        {...register("year", { setValueAs: (v) => (v === "" || v === undefined ? undefined : Number(v)) })}
                      />
                    </FormField>
                    <FormField id={id("reg")} label={t("fields.registration")} hint={t("hints.registration")} error={err("registrationNo")}>
                      <Input autoComplete="off" {...fieldA11y(id("reg"), err("registrationNo"), t("hints.registration"))} {...register("registrationNo")} />
                    </FormField>
                  </div>
                ) : null}
              </>
            ) : null}

            {current === "packages" ? (
              <fieldset aria-describedby={errors.packageIds ? `${id("packages")}-error` : undefined}>
                <legend className="sr-only">{t("steps.packages")}</legend>
                <div className="grid gap-3">
                  {packages.map((p) => (
                    <RadioCard
                      key={p.id}
                      type="checkbox"
                      value={p.id}
                      label={p.name[locale]}
                      description={p.summary[locale]}
                      aside={
                        <span className="text-right text-sm whitespace-nowrap">
                          <span className="block text-xs text-muted">{tService("from")}</span>
                          <span className="font-medium tabular">{f.bdt(p.price.amount)}</span>
                        </span>
                      }
                      aria-invalid={errors.packageIds ? true : undefined}
                      {...register("packageIds")}
                    />
                  ))}
                </div>
                {errors.packageIds ? (
                  <p id={`${id("packages")}-error`} className="mt-2 text-xs font-medium text-danger">
                    {err("packageIds")}
                  </p>
                ) : null}
              </fieldset>
            ) : null}

            {current === "centre" ? (
              <fieldset aria-describedby={errors.showroomId ? `${id("centre")}-error` : undefined}>
                <legend className="sr-only">{t("steps.centre")}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {centres.map((c) => (
                    <RadioCard
                      key={c.id}
                      value={c.id}
                      label={c.name[locale]}
                      description={c.address[locale]}
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
                  <p id={`${id("centre")}-error`} className="mt-2 text-xs font-medium text-danger">
                    {err("showroomId")}
                  </p>
                ) : null}
              </fieldset>
            ) : null}

            {current === "when" && centre ? (
              <>
                <DatePicker
                  name={id("date")}
                  hours={centre.hours}
                  value={values.date || undefined}
                  error={err("date")}
                  onChange={(d) => {
                    setValue("date", d, { shouldValidate: true });
                    setValue("slot", "");
                  }}
                />
                {values.date ? (
                  <SlotPicker
                    name={id("slot")}
                    showroomId={centre.id}
                    date={values.date}
                    value={values.slot || undefined}
                    error={err("slot")}
                    load={getServiceAvailability}
                    onChange={(slot) => setValue("slot", slot, { shouldValidate: true })}
                  />
                ) : null}
              </>
            ) : null}

            {current === "pickup" ? (
              <>
                <fieldset>
                  <legend className="sr-only">{t("steps.pickup")}</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <RadioCard
                      name="sb-pickup"
                      value="drop"
                      checked={!values.pickup}
                      onChange={() => setValue("pickup", false)}
                      label={t("fields.dropOff")}
                      description={t("fields.dropOffHint")}
                    />
                    <RadioCard
                      name="sb-pickup"
                      value="pickup"
                      checked={Boolean(values.pickup)}
                      onChange={() => setValue("pickup", true)}
                      label={t("fields.pickup")}
                      description={tService("pickupFee")}
                    />
                  </div>
                </fieldset>
                {values.pickup ? (
                  <FormField id={id("address")} label={t("fields.pickupAddress")} hint={t("hints.pickupAddress")} error={err("pickupAddress")}>
                    <Textarea rows={2} autoComplete="street-address" {...fieldA11y(id("address"), err("pickupAddress"), t("hints.pickupAddress"))} {...register("pickupAddress")} />
                  </FormField>
                ) : null}
              </>
            ) : null}

            {current === "details" ? (
              <>
                <ContactFields form={form} idPrefix="sb" />
                <FormField id={id("notes")} label={t("fields.notes")} optionalLabel={tCommon("optional")} error={err("notes")}>
                  <Textarea rows={3} placeholder={t("fields.notesPlaceholder")} {...fieldA11y(id("notes"), err("notes"))} {...register("notes")} />
                </FormField>
              </>
            ) : null}

            {current === "review" ? (
              <>
                <ReviewSection title={t("steps.vehicle")} onEdit={() => setStep(0)} editLabel={t("edit")}>
                  <ReviewRow label={t("steps.vehicle")} value={vehicleLabel} />
                </ReviewSection>
                <ReviewSection title={t("steps.packages")} onEdit={() => setStep(1)} editLabel={t("edit")}>
                  {chosen.map((p) => (
                    <ReviewRow key={p.id} label={p.name[locale]} value={f.bdt(p.price.amount)} />
                  ))}
                  <ReviewRow label={t("summary.estimate")} value={f.bdt(estimate)} />
                </ReviewSection>
                <ReviewSection title={t("summary.where")} onEdit={() => setStep(2)} editLabel={t("edit")}>
                  <ReviewRow label={t("steps.centre")} value={centre?.name[locale] ?? ""} />
                  <ReviewRow label={t("summary.when")} value={values.date && values.slot ? `${f.date(values.date, "weekday")}, ${f.time(values.slot)}` : ""} />
                  <ReviewRow label={t("steps.pickup")} value={values.pickup ? `${t("fields.pickup")}: ${values.pickupAddress ?? ""}` : t("fields.dropOff")} />
                </ReviewSection>
                <ReviewSection title={t("steps.details")} onEdit={() => setStep(5)} editLabel={t("edit")}>
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
          <div aria-live="polite">
            <p className="text-sm text-muted-on-dark">{t("summary.estimate")}</p>
            <p className="mt-1 text-3xl font-light tabular">{chosen.length ? f.bdt(estimate) : "—"}</p>
          </div>
          {chosen.length ? (
            <ul className="flex flex-col gap-1.5 border-t border-line-on-dark pt-4 text-sm">
              {chosen.map((p) => (
                <li key={p.id} className="flex justify-between gap-3">
                  <span>{p.name[locale]}</span>
                  <span className="tabular">{f.bdt(p.price.amount)}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="text-xs leading-relaxed text-muted-on-dark">{t("summary.note")}</p>
        </div>
      </aside>
    </form>
  );
}
