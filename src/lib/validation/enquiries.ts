import { z } from "zod";
import { VEHICLE_CATEGORIES } from "@/types";
import { consentSchema, emailSchema, nameSchema, optionalEmailSchema, optionalMessageSchema } from "./common";
import { bdPhoneSchema } from "./phone";

/** Corporate fleet inquiry (brief §10.K) and showroom contact form (§10.N). Messages are `validation.*` keys. */

export const INDUSTRIES = ["logistics", "manufacturing", "rideHailing", "construction", "agriculture", "retail", "ngo", "government", "other"] as const;
export const FLEET_SIZES = ["upTo5", "upTo20", "upTo50", "over50"] as const;
export const FLEET_TIMELINES = ["now", "quarter", "halfYear", "exploring"] as const;

export const corporateInquirySchema = z.object({
  company: z.string().trim().min(2, { error: "company" }).max(120, { error: "company" }),
  industry: z.enum(INDUSTRIES, { error: "select" }),
  fleetSize: z.enum(FLEET_SIZES, { error: "select" }),
  vehicleTypes: z.array(z.enum(VEHICLE_CATEGORIES)).min(1, { error: "selectOne" }),
  timeline: z.enum(FLEET_TIMELINES, { error: "select" }),
  financingInterest: z.boolean(),
  name: nameSchema,
  designation: z.string().trim().max(80, { error: "maxLength" }).optional(),
  phone: bdPhoneSchema,
  /** Corporate replies (quotations) go by email, so it's required here. */
  email: emailSchema,
  message: optionalMessageSchema,
  consent: consentSchema,
});
export type CorporateInquiryFormInput = z.input<typeof corporateInquirySchema>;
export type CorporateInquiryFormOutput = z.output<typeof corporateInquirySchema>;

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
