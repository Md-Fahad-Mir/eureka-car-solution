import * as z from "zod/mini";

/**
 * Footer newsletter sign-up. The footer is on every page, so this schema uses
 * the tree-shakable `zod/mini` build: the full Zod bundle then only loads on
 * pages that have a larger form. Messages are `validation.*` keys.
 */
export const newsletterSchema = z.object({ email: z.pipe(z.string().check(z.trim()), z.email({ error: "email" })) });
export type NewsletterInput = z.infer<typeof newsletterSchema>;
