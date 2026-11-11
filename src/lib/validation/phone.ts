import { z } from "zod";

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

/**
 * Normalises a Bangladeshi mobile number to E.164 (+8801XXXXXXXXX).
 * Accepts 01XXXXXXXXX (11 digits, operator prefix 3–9), +8801XXXXXXXXX or
 * 8801XXXXXXXXX, with optional spaces/dashes/brackets and Bangla digits.
 * Returns null when the number isn't a valid BD mobile number.
 */
export function normalizeBdPhone(input: string): string | null {
  const ascii = input.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
  const compact = ascii.replace(/[\s\-().]/g, "");
  // +880 1XXXXXXXXX (country code + number without trunk 0) == "+88" + 01XXXXXXXXX
  const match = compact.match(/^(?:\+?88)?(01[3-9]\d{8})$/);
  return match ? `+88${match[1]}` : null;
}

/** Display form of an E.164 BD mobile: "+880 1712-345678". */
export function formatBdPhone(e164: string): string {
  const m = e164.match(/^\+880(1\d{3})(\d{6})$/);
  return m ? `+880 ${m[1]}-${m[2]}` : e164;
}

/** Required BD mobile; outputs E.164. Error messages are `validation.*` keys. */
export const bdPhoneSchema = z
  .string()
  .trim()
  .min(1, { error: "required" })
  .refine((v) => normalizeBdPhone(v) !== null, { error: "phone" })
  .transform((v) => normalizeBdPhone(v)!);
