import { z } from "zod";
import { consentSchema, nameSchema, optionalEmailSchema } from "./common";
import { bdPhoneSchema } from "./phone";

/** Showroom contact form (brief §10.N). Messages are `validation.*` keys. */

export const CONTACT_TOPICS = ["sales", "testDrive", "finance", "service", "feedback", "other"] as const;

export const contactSchema = z.object({
  showroomId: z.string().optional(),
  topic: z.enum(CONTACT_TOPICS, { error: "select" }),
  message: z.string().trim().min(10, { error: "messageShort" }).max(1000, { error: "messageLong" }),
  name: nameSchema,
  phone: bdPhoneSchema,
  email: optionalEmailSchema,
  consent: consentSchema,
});
export type ContactFormInput = z.input<typeof contactSchema>;
export type ContactFormOutput = z.output<typeof contactSchema>;
