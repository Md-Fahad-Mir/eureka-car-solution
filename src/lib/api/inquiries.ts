import type { ContactMessage, CorporateInquiry, PurchaseInquiry } from "@/types";
import { assertMockPhoneAccepted, demoReference, mockDb, normalizeReference, nowIso, simulateLatency } from "./client";

export type NewsletterResult = { reference: string; demo: true };

/** Newsletter sign-up. */
export async function subscribeNewsletter(input: { email: string }): Promise<NewsletterResult> {
  // TODO(api): POST /newsletter { email } → { reference }
  void input;
  await simulateLatency();
  return { reference: demoReference("NL"), demo: true };
}

export type PurchaseInquiryInput = Omit<PurchaseInquiry, "reference" | "createdAt" | "isDemo" | "status">;

export async function submitInquiry(input: PurchaseInquiryInput): Promise<PurchaseInquiry> {
  // TODO(api): POST /inquiries → PurchaseInquiry
  await simulateLatency();
  assertMockPhoneAccepted(input.customer.phone);
  const inquiry: PurchaseInquiry = { ...input, reference: demoReference("PI"), createdAt: nowIso(), isDemo: true, status: "received" };
  mockDb().add("inquiries", inquiry);
  return inquiry;
}

export async function getPurchaseInquiry(reference: string): Promise<PurchaseInquiry | null> {
  // TODO(api): GET /inquiries/:reference → PurchaseInquiry | 404
  await simulateLatency();
  const ref = normalizeReference(reference);
  return mockDb().inquiries.find((i) => i.reference === ref) ?? null;
}

export type CorporateInquiryInput = Omit<CorporateInquiry, "reference" | "createdAt" | "isDemo">;

export async function submitCorporateInquiry(input: CorporateInquiryInput): Promise<CorporateInquiry> {
  // TODO(api): POST /corporate-inquiries → CorporateInquiry
  await simulateLatency();
  assertMockPhoneAccepted(input.customer.phone);
  const inquiry: CorporateInquiry = { ...input, reference: demoReference("CF"), createdAt: nowIso(), isDemo: true };
  mockDb().add("corporateInquiries", inquiry);
  return inquiry;
}

export type ContactMessageInput = Omit<ContactMessage, "reference" | "createdAt" | "isDemo">;

export async function submitContactMessage(input: ContactMessageInput): Promise<ContactMessage> {
  // TODO(api): POST /contact → ContactMessage
  await simulateLatency();
  assertMockPhoneAccepted(input.customer.phone);
  const message: ContactMessage = { ...input, reference: demoReference("CT"), createdAt: nowIso(), isDemo: true };
  mockDb().add("contactMessages", message);
  return message;
}
