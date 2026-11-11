import { z } from "zod";

/**
 * Zod error messages are i18n keys in the `validation` namespace; form
 * components translate them at render time, so schemas stay locale-neutral.
 */
export const emailSchema = z.email({ error: "email" }).trim();

export const newsletterSchema = z.object({ email: emailSchema });
export type NewsletterInput = z.infer<typeof newsletterSchema>;
