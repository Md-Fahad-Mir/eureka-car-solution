import { z } from "zod";
import { consentSchema, nameSchema, optionalEmailSchema, optionalMessageSchema } from "./common";
import { bdPhoneSchema } from "./phone";

export const PAYMENT_PREFERENCES = ["full", "emi", "islamic", "tradeIn"] as const;
export const CONTACT_CHANNELS = ["call", "whatsapp", "email"] as const;
export const CONTACT_TIMES = ["anytime", "morning", "afternoon", "evening"] as const;

/** Purchase inquiry (brief §10.I). Error messages are `validation.*` keys. */
export const inquirySchema = z
  .object({
    vehicleId: z.string().min(1, { error: "select" }),
    name: nameSchema,
    phone: bdPhoneSchema,
    email: optionalEmailSchema,
    paymentPreference: z.enum(PAYMENT_PREFERENCES, { error: "select" }),
    financingPreference: z.string().optional(),
    contactChannel: z.enum(CONTACT_CHANNELS, { error: "select" }),
    contactTime: z.enum(CONTACT_TIMES, { error: "select" }),
    message: optionalMessageSchema,
    consent: consentSchema,
  })
  .refine((d) => d.contactChannel !== "email" || Boolean(d.email), { path: ["email"], error: "emailForChannel" });

export type InquiryFormInput = z.input<typeof inquirySchema>;
export type InquiryFormOutput = z.output<typeof inquirySchema>;
