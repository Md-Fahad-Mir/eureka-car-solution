import { z } from "zod";
import { financeConfig } from "@/config/finance";
import { EMPLOYMENT_TYPES } from "@/types";
import { consentSchema, nameSchema, optionalEmailSchema } from "./common";
import { bdPhoneSchema } from "./phone";

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
const toAsciiDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));

const money = z.number({ error: "number" }).finite({ error: "number" });

/**
 * Finance application (brief §10.G), validated step by step in the UI via
 * `STEP_FIELDS`. Error messages are `validation.*` keys.
 */
export const financeApplicationSchema = z
  .object({
    // 1 · Vehicle & finance
    vehicleId: z.string(),
    vehiclePrice: money.min(100_000, { error: "priceMin" }),
    downPayment: money.min(0, { error: "number" }),
    tenureMonths: z
      .number({ error: "select" })
      .int()
      .min(financeConfig.tenure.min, { error: "select" })
      .max(financeConfig.tenure.max, { error: "select" }),
    financeType: z.enum(["conventional", "islamic"], { error: "select" }),
    partnerId: z.string(),
    // 2 · Personal
    name: nameSchema,
    phone: bdPhoneSchema,
    email: optionalEmailSchema,
    nidLast4: z
      .string()
      .trim()
      .transform(toAsciiDigits)
      .refine((v) => /^\d{4}$/.test(v), { error: "nidLast4" }),
    city: z.string().trim().min(2, { error: "required" }),
    address: z.string().trim().min(8, { error: "address" }),
    // 3 · Employment & income
    employment: z.enum(EMPLOYMENT_TYPES, { error: "select" }),
    employer: z.string().trim().min(2, { error: "required" }),
    yearsInRole: z.number({ error: "number" }).min(0, { error: "number" }).max(60, { error: "number" }),
    monthlyIncome: money.min(1_000, { error: "income" }),
    existingEmi: money.min(0, { error: "number" }),
    // 4 · Documents (file names only; nothing is uploaded)
    documents: z.array(z.string()),
    // 5 · Review
    consent: consentSchema,
  })
  .superRefine((d, ctx) => {
    const min = (d.vehiclePrice * financeConfig.downPayment.minPercent) / 100;
    if (d.downPayment < min) ctx.addIssue({ code: "custom", path: ["downPayment"], message: "downPaymentMin" });
    if (d.downPayment >= d.vehiclePrice) ctx.addIssue({ code: "custom", path: ["downPayment"], message: "downPaymentMax" });
  });

export type FinanceApplicationInput = z.input<typeof financeApplicationSchema>;
export type FinanceApplicationOutput = z.output<typeof financeApplicationSchema>;

export const APPLY_STEPS = ["vehicle", "personal", "employment", "documents", "review"] as const;
export type ApplyStep = (typeof APPLY_STEPS)[number];

/** Fields validated when leaving each step. */
export const STEP_FIELDS: Record<ApplyStep, (keyof FinanceApplicationInput)[]> = {
  vehicle: ["vehicleId", "vehiclePrice", "downPayment", "tenureMonths", "financeType", "partnerId"],
  personal: ["name", "phone", "email", "nidLast4", "city", "address"],
  employment: ["employment", "employer", "yearsInRole", "monthlyIncome", "existingEmi"],
  documents: ["documents"],
  review: ["consent"],
};
