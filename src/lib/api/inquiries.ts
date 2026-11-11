import { demoReference, simulateLatency } from "./client";

export type NewsletterResult = { reference: string; demo: true };

/** Newsletter sign-up. */
export async function subscribeNewsletter(input: { email: string }): Promise<NewsletterResult> {
  // TODO(api): POST /newsletter { email } → { reference }
  void input;
  await simulateLatency();
  return { reference: demoReference("NL"), demo: true };
}
