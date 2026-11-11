import { useDemoRecordsStore } from "@/stores/demoRecords";
import { ensureHydrated } from "@/stores/persist";

/**
 * Shared helpers for the mock service layer. Each public function in
 * `src/lib/api/*` has a typed signature that a real `fetch` implementation can
 * replace; UI code never changes and never sees mock data directly.
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

/** A request-level failure (network, server). The UI shows an error state with retry. */
export class ApiError extends Error {
  constructor(message = "Request failed") {
    super(message);
    this.name = "ApiError";
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Simulates 300–700 ms of network latency in the browser. On the server it
 * resolves immediately: server components prerender with Cache Components,
 * where timers and Math.random() are not allowed (decision D15).
 */
export function simulateLatency(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
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

/** The browser-local mock database (session-created records). Client-side only. */
export function mockDb() {
  ensureHydrated(useDemoRecordsStore);
  return useDemoRecordsStore.getState();
}

/** Current time as an ISO 8601 string, for record timestamps. */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Case-insensitive reference normaliser ("demo-td-1186 " → "DEMO-TD-1186"). */
export const normalizeReference = (ref: string) => ref.trim().toUpperCase();
