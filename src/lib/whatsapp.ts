import { siteConfig } from "@/config/site";

/**
 * WhatsApp click-to-chat helpers. These only build `wa.me` links: nothing is
 * sent until the customer presses send in WhatsApp. Never describe these
 * links as automation or as a sent message.
 */

/** Vehicle details carried into a message. Pre-formatted, localised strings. */
export type WhatsAppVehicle = {
  name: string;
  year?: string;
  condition?: string;
  reference?: string;
  url?: string;
};

export type WhatsAppContext =
  | { kind: "vehicleInquiry"; vehicle: WhatsAppVehicle }
  | {
      kind: "emiInquiry";
      vehicle?: WhatsAppVehicle;
      emi?: string;
      tenureMonths?: string;
      downPayment?: string;
      reference?: string;
    }
  | { kind: "testDrive"; vehicle?: WhatsAppVehicle; reference?: string }
  | { kind: "service"; vehicle?: string; registration?: string; reference?: string }
  | { kind: "corporate"; reference?: string }
  | { kind: "savings"; savings?: string; reference?: string }
  | { kind: "general"; reference?: string };

export type WhatsAppKind = WhatsAppContext["kind"];

type DetailKey =
  | "year"
  | "condition"
  | "reference"
  | "link"
  | "vehicle"
  | "registration"
  | "emi"
  | "tenure"
  | "downPayment"
  | "savings";

type TemplateKey =
  | "vehicleInquiry"
  | "emiInquiry"
  | "emiInquiryGeneric"
  | "testDrive"
  | "testDriveGeneric"
  | "service"
  | "corporate"
  | "general"
  | "savings";

/**
 * Minimal translator shape for the `whatsapp` namespace. Both next-intl's
 * `useTranslations("whatsapp")` and `getTranslations("whatsapp")` satisfy it.
 */
export type WhatsAppTranslator = (
  key: `templates.${TemplateKey}` | `detail.${DetailKey}`,
  values: Record<string, string>,
) => string;

/** Builds `https://wa.me/<digits>?text=<encoded message>`. */
export function buildWhatsAppLink(
  message: string,
  number: string = siteConfig.whatsappNumber,
): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * Share link with no recipient: WhatsApp asks the customer whom to send it to
 * (used to share a referral code with a friend, not to message Eureka).
 */
export function buildWhatsAppShareLink(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/** Composes the localised message text for a WhatsApp context. */
export function whatsAppMessage(t: WhatsAppTranslator, ctx: WhatsAppContext): string {
  const lines: string[] = [];
  const add = (key: DetailKey, value: string | undefined) => {
    if (value) lines.push(t(`detail.${key}`, { value }));
  };
  const addVehicle = (v: WhatsAppVehicle | undefined) => {
    if (!v) return;
    add("year", v.year);
    add("condition", v.condition);
    add("reference", v.reference);
    add("link", v.url);
  };

  let template: TemplateKey;
  let vehicle = "";

  switch (ctx.kind) {
    case "vehicleInquiry":
      template = "vehicleInquiry";
      vehicle = ctx.vehicle.name;
      addVehicle(ctx.vehicle);
      break;
    case "emiInquiry":
      template = ctx.vehicle ? "emiInquiry" : "emiInquiryGeneric";
      vehicle = ctx.vehicle?.name ?? "";
      add("emi", ctx.emi);
      add("tenure", ctx.tenureMonths);
      add("downPayment", ctx.downPayment);
      addVehicle(ctx.vehicle);
      add("reference", ctx.reference);
      break;
    case "testDrive":
      template = ctx.vehicle ? "testDrive" : "testDriveGeneric";
      vehicle = ctx.vehicle?.name ?? "";
      addVehicle(ctx.vehicle);
      add("reference", ctx.reference);
      break;
    case "service":
      template = "service";
      add("vehicle", ctx.vehicle);
      add("registration", ctx.registration);
      add("reference", ctx.reference);
      break;
    case "corporate":
      template = "corporate";
      add("reference", ctx.reference);
      break;
    case "savings":
      template = "savings";
      add("savings", ctx.savings);
      add("reference", ctx.reference);
      break;
    case "general":
      template = "general";
      add("reference", ctx.reference);
      break;
  }

  const details = lines.length ? `\n${lines.join("\n")}` : "";
  return t(`templates.${template}`, { vehicle, details });
}

/** Convenience: message + link in one call. */
export function whatsAppHref(t: WhatsAppTranslator, ctx: WhatsAppContext): string {
  return buildWhatsAppLink(whatsAppMessage(t, ctx));
}
