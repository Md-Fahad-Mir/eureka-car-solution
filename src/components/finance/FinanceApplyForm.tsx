"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useForm, useWatch, type Path } from "react-hook-form";
import { ArrowLeft, ArrowRight, FileCheck2, Paperclip, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { applyApiError } from "@/components/forms/applyApiError";
import { ReviewRow, ReviewSection } from "@/components/forms/Review";
import { fieldA11y, FormField } from "@/components/forms/FormField";
import { useErrorText } from "@/components/forms/useErrorText";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Checkbox, RadioCard } from "@/components/ui/Choice";
import { Combobox } from "@/components/ui/Combobox";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { Input, Select } from "@/components/ui/Input";
import { Stepper } from "@/components/ui/Stepper";
import { Timeline } from "@/components/ui/Timeline";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { documentsFor, financeConfig } from "@/config/finance";
import { Link } from "@/i18n/navigation";
import { submitFinanceApplication } from "@/lib/api/finance";
import { summarizeLoan } from "@/lib/calc/emi";
import { useFormat } from "@/lib/format/useFormat";
import {
  APPLY_STEPS,
  financeApplicationSchema,
  STEP_FIELDS,
  type ApplyStep,
  type FinanceApplicationInput,
  type FinanceApplicationOutput,
} from "@/lib/validation/finance";
import { toast } from "@/stores/toast";
import { EMPLOYMENT_TYPES, type FinanceApplication, type FinancePartner } from "@/types";
import type { VehicleOption } from "@/lib/vehicleOptions";

const CUSTOM = "";
const TENURES = Array.from(
  { length: (financeConfig.tenure.max - financeConfig.tenure.min) / 12 + 1 },
  (_, i) => financeConfig.tenure.min + i * 12,
);
/** Illustrative affordability guide: total EMIs above this share of income get a warning. */
const AFFORDABILITY_WARN = 0.5;

export function FinanceApplyForm({
  vehicles,
  partners,
}: {
  vehicles: VehicleOption[];
  partners: Pick<FinancePartner, "id" | "name" | "type" | "rateRange">[];
}) {
  const t = useTranslations("financeApply");
  const tCommon = useTranslations("common");
  const tToast = useTranslations("toast");
  const locale = useLocale();
  const f = useFormat();
  const errorText = useErrorText();
  const params = useSearchParams();

  // Prefill from the finance calculator: ?vehicle=&price=&down=&tenure=&type=
  const preVehicle = vehicles.find((v) => v.slug === params.get("vehicle"));
  const prePrice = preVehicle?.price ?? (Number(params.get("price")) || 0);
  const preDown = Number(params.get("down")) || Math.round((prePrice * financeConfig.downPayment.defaultPercent) / 100);
  const preTenure = Number(params.get("tenure"));

  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [submitted, setSubmitted] = useState<FinanceApplication | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const form = useForm<FinanceApplicationInput, unknown, FinanceApplicationOutput>({
    resolver: zodResolver(financeApplicationSchema),
    mode: "onTouched",
    defaultValues: {
      vehicleId: preVehicle?.id ?? CUSTOM,
      vehiclePrice: prePrice || undefined,
      downPayment: prePrice ? preDown : undefined,
      tenureMonths: TENURES.includes(preTenure) ? preTenure : financeConfig.tenure.default,
      financeType: params.get("type") === "islamic" ? "islamic" : "conventional",
      partnerId: "",
      name: "",
      phone: "",
      email: "",
      nidLast4: "",
      city: "",
      address: "",
      employment: "salaried",
      employer: "",
      yearsInRole: undefined,
      monthlyIncome: undefined,
      existingEmi: 0,
      documents: [],
      consent: false,
    },
  });
  const { register, handleSubmit, trigger, setValue, setError, control, formState } = form;
  const { errors, isSubmitting } = formState;
  const values = useWatch({ control }) as FinanceApplicationInput;

  const current: ApplyStep = APPLY_STEPS[step];
  const id = (name: string) => `apply-${name}`;
  const err = (name: keyof FinanceApplicationInput) => errorText(errors[name] as { message?: string } | undefined, { min: f.bdt(((values.vehiclePrice ?? 0) * financeConfig.downPayment.minPercent) / 100) });

  // Move focus to the step heading after navigating between steps.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, submitted]);

  const partner = partners.find((p) => p.id === values.partnerId);
  const rate = partner
    ? (partner.rateRange.min + partner.rateRange.max) / 2
    : values.financeType === "islamic"
      ? financeConfig.islamic.defaultProfitRate
      : financeConfig.conventional.defaultAnnualRate;
  const price = Number(values.vehiclePrice) || 0;
  const down = Math.min(Number(values.downPayment) || 0, price);
  const estimate =
    price > 0 && values.tenureMonths ? summarizeLoan({ price, downPayment: down, annualRatePct: rate, months: Number(values.tenureMonths) }) : null;
  const income = Number(values.monthlyIncome) || 0;
  const priceHint = price ? f.bdtCompact(price) : undefined;
  const downHint = price ? t("hints.downPercent", { percent: f.number((down / price) * 100, { maximumFractionDigits: 1 }) }) : undefined;
  const burden = estimate && income > 0 ? (estimate.monthlyPayment + (Number(values.existingEmi) || 0)) / income : null;

  const next = async () => {
    const ok = await trigger(STEP_FIELDS[current] as Path<FinanceApplicationInput>[], { shouldFocus: true });
    if (ok) setStep((s) => Math.min(s + 1, APPLY_STEPS.length - 1));
  };

  const onSubmit = handleSubmit(async (v) => {
    try {
      const application = await submitFinanceApplication({
        vehicleId: v.vehicleId || undefined,
        vehiclePrice: v.vehiclePrice,
        downPayment: v.downPayment,
        tenureMonths: v.tenureMonths,
        financeType: v.financeType,
        partnerId: v.partnerId || undefined,
        applicant: {
          name: v.name,
          phone: v.phone,
          email: v.email,
          nidLast4: v.nidLast4,
          city: v.city,
          employment: v.employment,
          employer: v.employer,
          monthlyIncome: v.monthlyIncome,
          existingEmi: v.existingEmi,
        },
        documents: v.documents,
      });
      setSubmitted(application);
    } catch (error) {
      if (applyApiError(error, setError, { phone: "phone" })) {
        // Show the step first (its effect focuses the heading), then move focus to the field.
        flushSync(() => setStep(APPLY_STEPS.indexOf("personal")));
        form.setFocus("phone");
      } else {
        toast({ tone: "error", title: tToast("errorTitle"), body: tToast("errorBody") });
      }
    }
  }, (formErrors) => {
    // Jump to the first step that has an error.
    const first = APPLY_STEPS.findIndex((s) => STEP_FIELDS[s].some((field) => field in formErrors));
    if (first >= 0) setStep(first);
  });

  if (submitted) {
    const vehicle = vehicles.find((v) => v.id === submitted.vehicleId);
    return (
      <section aria-labelledby="apply-done" className="mx-auto flex max-w-2xl flex-col gap-6" role="status">
        <FileCheck2 aria-hidden className="size-10 text-success" />
        <h2 id="apply-done" ref={headingRef} tabIndex={-1} className="display-md focus:outline-none">
          {t("done.title")}
        </h2>
        <p className="text-muted">{t("done.body")}</p>
        <p className="rounded-2xl border border-line bg-bg-alt px-5 py-4">
          {t("done.reference")}: <span className="text-lg font-semibold tabular">{submitted.reference}</span>
        </p>
        <DemoNotice reference={submitted.reference} />
        <div className="rounded-card border border-line bg-bg-alt p-5">
          <Timeline
            currentKey={submitted.status}
            steps={submitted.timeline.map((s) => ({
              key: s.status,
              label: t(`status.${s.status}`),
              at: s.at ? f.dateTime(s.at) : null,
            }))}
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={`/finance/status?ref=${submitted.reference}`} className={buttonVariants({ size: "lg" })}>
            {t("done.track")}
          </Link>
          <WhatsAppButton
            size="lg"
            tone="outline"
            context={{ kind: "emiInquiry", vehicle: vehicle?.whatsapp, reference: submitted.reference }}
          />
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <Stepper steps={APPLY_STEPS.map((s) => t(`steps.${s}`))} current={step} onStepClick={setStep} />

        <div className="mt-8 rounded-card border border-line bg-bg-alt p-5 sm:p-8">
          <h2 ref={headingRef} tabIndex={-1} className="text-xl font-medium focus:outline-none">
            {t(`headings.${current}`)}
          </h2>
          <p className="mt-1 text-sm text-muted">{t(`leads.${current}`)}</p>

          <div className="mt-8 flex flex-col gap-6">
            {current === "vehicle" ? (
              <>
                <FormField id={id("vehicle")} label={t("fields.vehicle")} hint={t("hints.vehicle")}>
                  <Combobox
                    id={id("vehicle")}
                    value={values.vehicleId ?? CUSTOM}
                    onValueChange={(vid) => {
                      setValue("vehicleId", vid);
                      const v = vehicles.find((x) => x.id === vid);
                      if (v) {
                        setValue("vehiclePrice", v.price, { shouldValidate: true });
                        setValue("downPayment", Math.round((v.price * financeConfig.downPayment.defaultPercent) / 100), {
                          shouldValidate: true,
                        });
                      }
                    }}
                    options={[{ value: CUSTOM, label: t("fields.customVehicle") }, ...vehicles.map((v) => ({ value: v.id, label: v.label, hint: v.hint }))]}
                  />
                </FormField>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField id={id("price")} label={t("fields.price")} error={err("vehiclePrice")} hint={priceHint}>
                    <Input
                      inputMode="numeric"
                      prefix="৳"
                      {...fieldA11y(id("price"), err("vehiclePrice"), priceHint)}
                      {...register("vehiclePrice", { valueAsNumber: true, onChange: () => setValue("vehicleId", CUSTOM) })}
                    />
                  </FormField>
                  <FormField
                    id={id("down")}
                    label={t("fields.downPayment")}
                    error={err("downPayment")}
                    hint={downHint}
                  >
                    <Input inputMode="numeric" prefix="৳" {...fieldA11y(id("down"), err("downPayment"), downHint)} {...register("downPayment", { valueAsNumber: true })} />
                  </FormField>
                  <FormField id={id("tenure")} label={t("fields.tenure")} error={err("tenureMonths")}>
                    <Select {...fieldA11y(id("tenure"), err("tenureMonths"))} {...register("tenureMonths", { valueAsNumber: true })}>
                      {TENURES.map((m) => (
                        <option key={m} value={m}>
                          {t("tenureOption", { months: f.number(m), years: f.number(m / 12) })}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField id={id("partner")} label={t("fields.partner")} optionalLabel={tCommon("optional")} hint={t("hints.partner")}>
                    <Select {...fieldA11y(id("partner"), undefined, t("hints.partner"))} {...register("partnerId")}>
                      <option value="">{t("fields.anyPartner")}</option>
                      {partners
                        .filter((p) => p.type === values.financeType)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name[locale]}
                          </option>
                        ))}
                    </Select>
                  </FormField>
                </div>
                <fieldset>
                  <legend className="mb-3 text-sm font-medium">{t("fields.financeType")}</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(["conventional", "islamic"] as const).map((type) => (
                      <RadioCard
                        key={type}
                        value={type}
                        label={t(`financeTypes.${type}.label`)}
                        description={t(`financeTypes.${type}.hint`)}
                        {...register("financeType", { onChange: () => setValue("partnerId", "") })}
                      />
                    ))}
                  </div>
                </fieldset>
              </>
            ) : null}

            {current === "personal" ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField id={id("name")} label={t("fields.name")} error={err("name")} className="sm:col-span-2">
                  <Input autoComplete="name" {...fieldA11y(id("name"), err("name"))} {...register("name")} />
                </FormField>
                <FormField id={id("phone")} label={t("fields.phone")} hint={t("hints.phone")} error={err("phone")}>
                  <Input type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" {...fieldA11y(id("phone"), err("phone"), t("hints.phone"))} {...register("phone")} />
                </FormField>
                <FormField id={id("email")} label={t("fields.email")} optionalLabel={tCommon("optional")} error={err("email")}>
                  <Input type="email" inputMode="email" autoComplete="email" {...fieldA11y(id("email"), err("email"))} {...register("email")} />
                </FormField>
                <FormField id={id("nid")} label={t("fields.nidLast4")} hint={t("hints.nidLast4")} error={err("nidLast4")}>
                  <Input inputMode="numeric" maxLength={4} autoComplete="off" {...fieldA11y(id("nid"), err("nidLast4"), t("hints.nidLast4"))} {...register("nidLast4")} />
                </FormField>
                <FormField id={id("city")} label={t("fields.city")} error={err("city")}>
                  <Input autoComplete="address-level2" {...fieldA11y(id("city"), err("city"))} {...register("city")} />
                </FormField>
                <FormField id={id("address")} label={t("fields.address")} error={err("address")} className="sm:col-span-2">
                  <Input autoComplete="street-address" {...fieldA11y(id("address"), err("address"))} {...register("address")} />
                </FormField>
              </div>
            ) : null}

            {current === "employment" ? (
              <>
                <fieldset>
                  <legend className="mb-3 text-sm font-medium">{t("fields.employment")}</legend>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {EMPLOYMENT_TYPES.map((e) => (
                      <RadioCard key={e} value={e} label={t(`employment.${e}`)} {...register("employment", { onChange: () => setFiles({}) })} />
                    ))}
                  </div>
                </fieldset>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField id={id("employer")} label={t(values.employment === "salaried" ? "fields.employer" : "fields.businessName")} error={err("employer")} className="sm:col-span-2">
                    <Input autoComplete="organization" {...fieldA11y(id("employer"), err("employer"))} {...register("employer")} />
                  </FormField>
                  <FormField id={id("years")} label={t("fields.yearsInRole")} error={err("yearsInRole")}>
                    <Input inputMode="numeric" {...fieldA11y(id("years"), err("yearsInRole"))} {...register("yearsInRole", { valueAsNumber: true })} />
                  </FormField>
                  <FormField id={id("income")} label={t("fields.monthlyIncome")} error={err("monthlyIncome")}>
                    <Input inputMode="numeric" prefix="৳" {...fieldA11y(id("income"), err("monthlyIncome"))} {...register("monthlyIncome", { valueAsNumber: true })} />
                  </FormField>
                  <FormField id={id("existing")} label={t("fields.existingEmi")} hint={t("hints.existingEmi")} error={err("existingEmi")}>
                    <Input inputMode="numeric" prefix="৳" {...fieldA11y(id("existing"), err("existingEmi"), t("hints.existingEmi"))} {...register("existingEmi", { valueAsNumber: true })} />
                  </FormField>
                </div>
                {burden !== null ? (
                  <p
                    aria-live="polite"
                    className={
                      burden > AFFORDABILITY_WARN
                        ? "rounded-2xl bg-warning/10 px-4 py-3 text-sm text-warning-ink"
                        : "rounded-2xl bg-success/10 px-4 py-3 text-sm text-success-ink"
                    }
                  >
                    {t(burden > AFFORDABILITY_WARN ? "affordability.high" : "affordability.ok", {
                      percent: f.number(burden * 100, { maximumFractionDigits: 0 }),
                    })}
                  </p>
                ) : null}
              </>
            ) : null}

            {current === "documents" ? (
              <>
                <DemoNotice message={t("filesNotice")} />
                <ul className="flex flex-col gap-3">
                  {documentsFor(values.employment ?? "salaried").map((doc) => {
                    const file = files[doc];
                    return (
                      <li key={doc} className="flex flex-col gap-3 rounded-2xl border border-line bg-bg p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-medium">{t(`documentLabels.${doc}`)}</p>
                          <p className="mt-0.5 text-xs text-muted">{file ? `${file.name} · ${f.number(file.size / 1024, { maximumFractionDigits: 0 })} KB` : t("noFile")}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className={buttonVariants({ variant: "outline", size: "sm", className: "cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent-ink" })}>
                            <Paperclip aria-hidden className="size-4" />
                            {file ? t("replaceFile") : t("chooseFile")}
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="sr-only"
                              aria-label={t("chooseFileFor", { doc: t(`documentLabels.${doc}`) })}
                              onChange={(e) => {
                                const chosen = e.target.files?.[0] ?? null;
                                const nextFiles = { ...files, [doc]: chosen };
                                setFiles(nextFiles);
                                setValue("documents", Object.values(nextFiles).flatMap((x) => (x ? [x.name] : [])));
                              }}
                            />
                          </label>
                          {file ? (
                            <button
                              type="button"
                              aria-label={t("removeFile", { doc: t(`documentLabels.${doc}`) })}
                              onClick={() => {
                                const nextFiles = { ...files, [doc]: null };
                                setFiles(nextFiles);
                                setValue("documents", Object.values(nextFiles).flatMap((x) => (x ? [x.name] : [])));
                              }}
                              className="grid size-9 place-items-center rounded-full text-muted hover:bg-ink/[0.06] hover:text-ink"
                            >
                              <X aria-hidden className="size-4" />
                            </button>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <p className="text-sm text-muted">{t("documentsLater")}</p>
              </>
            ) : null}

            {current === "review" ? (
              <>
                <ReviewSection title={t("steps.vehicle")} onEdit={() => setStep(0)} editLabel={t("edit")}>
                  <ReviewRow label={t("fields.vehicle")} value={vehicles.find((v) => v.id === values.vehicleId)?.label ?? t("fields.customVehicle")} />
                  <ReviewRow label={t("fields.price")} value={f.bdt(price)} />
                  <ReviewRow label={t("fields.downPayment")} value={f.bdt(down)} />
                  <ReviewRow label={t("fields.tenure")} value={f.unit("months", Number(values.tenureMonths), 0)} />
                  <ReviewRow label={t("fields.financeType")} value={t(`financeTypes.${values.financeType ?? "conventional"}.label`)} />
                  <ReviewRow label={t("fields.partner")} value={partner?.name[locale] ?? t("fields.anyPartner")} />
                </ReviewSection>
                <ReviewSection title={t("steps.personal")} onEdit={() => setStep(1)} editLabel={t("edit")}>
                  <ReviewRow label={t("fields.name")} value={values.name ?? ""} />
                  <ReviewRow label={t("fields.phone")} value={values.phone ?? ""} />
                  <ReviewRow label={t("fields.email")} value={values.email || "—"} />
                  <ReviewRow label={t("fields.nidLast4")} value={`•••• ${values.nidLast4 ?? ""}`} />
                  <ReviewRow label={t("fields.address")} value={`${values.address ?? ""}, ${values.city ?? ""}`} />
                </ReviewSection>
                <ReviewSection title={t("steps.employment")} onEdit={() => setStep(2)} editLabel={t("edit")}>
                  <ReviewRow label={t("fields.employment")} value={t(`employment.${values.employment ?? "salaried"}`)} />
                  <ReviewRow label={t("fields.employer")} value={values.employer ?? ""} />
                  <ReviewRow label={t("fields.monthlyIncome")} value={f.bdt(income)} />
                  <ReviewRow label={t("fields.existingEmi")} value={f.bdt(Number(values.existingEmi) || 0)} />
                </ReviewSection>
                <ReviewSection title={t("steps.documents")} onEdit={() => setStep(3)} editLabel={t("edit")}>
                  <ReviewRow label={t("filesSelected")} value={values.documents?.length ? values.documents.join(", ") : t("noneYet")} />
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
            {/* Distinct keys matter: step validation resolves in a microtask, so reusing one
                <button> and flipping it to type="submit" would let the "Continue" click submit. */}
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
          {estimate ? (
            <>
              <div aria-live="polite">
                <p className="text-sm text-muted-on-dark">{t(values.financeType === "islamic" ? "summary.rental" : "summary.emi")}</p>
                <p className="mt-1 text-3xl font-light tabular">{f.bdt(estimate.monthlyPayment)}</p>
              </div>
              <dl className="grid gap-3 border-t border-line-on-dark pt-4 text-sm">
                <SummaryRow label={t("summary.financed")} value={f.bdt(estimate.principal)} />
                <SummaryRow label={t("summary.rate")} value={`${f.number(rate, { maximumFractionDigits: 2 })}%`} />
                <SummaryRow label={t("summary.tenure")} value={f.unit("months", Number(values.tenureMonths), 0)} />
              </dl>
            </>
          ) : (
            <p className="text-sm text-muted-on-dark">{t("summary.empty")}</p>
          )}
          <p className="text-xs leading-relaxed text-muted-on-dark">{t("summary.note")}</p>
        </div>
      </aside>
    </form>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-on-dark">{label}</dt>
      <dd className="font-medium tabular">{value}</dd>
    </div>
  );
}
