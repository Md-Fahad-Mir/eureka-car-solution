import { z } from "zod";

/**
 * Zod error messages are i18n keys in the `validation` namespace; form
 * components translate them at render time, so schemas stay locale-neutral.
 */
export const emailSchema = z.email({ error: "email" }).trim();

/** Optional email: empty string is allowed and becomes undefined. */
export const optionalEmailSchema = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .pipe(z.email({ error: "email" }).optional());

export const nameSchema = z.string().trim().min(1, { error: "required" }).min(2, { error: "name" }).max(80, { error: "name" });

/** Contact consent: must be actively ticked, never pre-ticked. */
export const consentSchema = z.boolean().refine((v) => v === true, { error: "consent" });

export const optionalMessageSchema = z.string().trim().max(1000, { error: "messageLong" }).optional();

export const newsletterSchema = z.object({ email: emailSchema });
export type NewsletterInput = z.infer<typeof newsletterSchema>;
