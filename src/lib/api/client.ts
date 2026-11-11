/**
 * Shared helpers for the mock service layer. Real API implementations replace
 * the bodies of functions in `src/lib/api/*`; UI code never changes.
 */

export const DATA_MODE = process.env.NEXT_PUBLIC_DATA_MODE ?? "mock";
export const isMockMode = DATA_MODE === "mock";

/** A field-level error returned by the "server", mapped onto form fields by the UI. */
export class ApiFieldError extends Error {
  constructor(
    public readonly field: string,
    /** i18n key under the `validation` namespace. */
    public readonly messageKey: string,
  ) {
    super(`${field}: ${messageKey}`);
    this.name = "ApiFieldError";
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Simulates 300–700 ms of network latency. */
export function simulateLatency(): Promise<void> {
  return sleep(300 + Math.round(Math.random() * 400));
}

/** `DEMO-<PREFIX>-1234`: every mock-created record carries an obviously-demo reference. */
export function demoReference(prefix: string): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `DEMO-${prefix}-${n}`;
}

/**
 * Test hook: phone numbers ending in `0000` are rejected by the mock "server",
 * so error mapping can be exercised end to end.
 */
export function assertMockPhoneAccepted(phone: string | undefined, field = "phone"): void {
  if (phone && phone.replace(/\D/g, "").endsWith("0000")) {
    throw new ApiFieldError(field, "phoneServer");
  }
}
