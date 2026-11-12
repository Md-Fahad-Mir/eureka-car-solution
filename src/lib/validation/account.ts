import { z } from "zod";
import { emailSchema, nameSchema } from "./common";
import { bdPhoneSchema } from "./phone";

/** Demo account forms. Error messages are `validation.*` keys. */

export const PREFERRED_CONTACTS = ["whatsapp", "call", "email"] as const;

export const profileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: bdPhoneSchema,
  city: z.string().trim().min(2, { error: "required" }).max(60, { error: "maxLength" }),
  address: z.string().trim().max(200, { error: "maxLength" }),
  preferredLanguage: z.enum(["en", "bn"]),
  preferredContact: z.enum(PREFERRED_CONTACTS),
});
export type ProfileFormInput = z.input<typeof profileSchema>;
export type ProfileFormOutput = z.output<typeof profileSchema>;

export const signInEmailSchema = z.object({ email: emailSchema });
export const signInCodeSchema = z.object({ code: z.string().trim().regex(/^\d{6}$/, { error: "otp" }) });
