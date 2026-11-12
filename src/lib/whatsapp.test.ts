import { describe, expect, it } from "vitest";
import { buildWhatsAppLink, buildWhatsAppShareLink, whatsAppMessage, type WhatsAppTranslator } from "./whatsapp";
import en from "../../messages/en.json";

/** Minimal ICU-free translator over the real English catalogue (only {name} substitution is used). */
const t: WhatsAppTranslator = (key, values) => {
  const [group, name] = key.split(".") as ["templates" | "detail", string];
  const template = (en.whatsapp[group] as Record<string, string>)[name];
  return template.replace(/\{(\w+)\}/g, (_, k: string) => values[k] ?? "");
};

describe("buildWhatsAppLink", () => {
  it("uses wa.me with digits only and an encoded message", () => {
    const link = buildWhatsAppLink("Hello & welcome? 50% off\nline 2", "+880 1712-345678");
    expect(link).toBe("https://wa.me/8801712345678?text=Hello%20%26%20welcome%3F%2050%25%20off%0Aline%202");
  });

  it("encodes Bangla text", () => {
    const link = buildWhatsAppLink("আসসালামু আলাইকুম", "8801000000000");
    expect(decodeURIComponent(link.split("text=")[1])).toBe("আসসালামু আলাইকুম");
  });

  it("defaults to the configured number", () => {
    expect(buildWhatsAppLink("hi")).toMatch(/^https:\/\/wa\.me\/\d{10,15}\?text=hi$/);
  });
});

describe("whatsAppMessage", () => {
  it("includes vehicle name, year, condition, reference and link for a vehicle inquiry", () => {
    const msg = whatsAppMessage(t, {
      kind: "vehicleInquiry",
      vehicle: {
        name: "Toyota Corolla Cross Hybrid Z",
        year: "2023",
        condition: "Reconditioned",
        reference: "EU-0012",
        url: "https://example.com/en/vehicles/toyota-corolla-cross",
      },
    });
    expect(msg).toContain("Hello, I am interested in the Toyota Corolla Cross Hybrid Z.");
    expect(msg).toContain("Year: 2023");
    expect(msg).toContain("Condition: Reconditioned");
    expect(msg).toContain("Reference: EU-0012");
    expect(msg).toContain("Link: https://example.com/en/vehicles/toyota-corolla-cross");
  });

  it("carries the computed EMI into the message", () => {
    const msg = whatsAppMessage(t, {
      kind: "emiInquiry",
      vehicle: { name: "BYD Atto 3" },
      emi: "৳78,450",
      tenureMonths: "60",
    });
    expect(msg.startsWith("Hello, I want to purchase BYD Atto 3 through EMI.")).toBe(true);
    expect(msg).toContain("Estimated EMI: ৳78,450");
    expect(msg).toContain("Tenure: 60 months");
  });

  it("falls back to generic wording without a vehicle and has no trailing details", () => {
    expect(whatsAppMessage(t, { kind: "testDrive" })).toBe("Hello, I would like to book a test drive.");
    expect(whatsAppMessage(t, { kind: "corporate" })).toBe(
      "Hello, I am interested in your corporate fleet solutions.",
    );
  });

  it("adds service vehicle, registration and reference", () => {
    const msg = whatsAppMessage(t, {
      kind: "service",
      vehicle: "Honda Vezel 2019",
      registration: "Dhaka Metro Ga 12-3456",
      reference: "DEMO-SB-1234",
    });
    expect(msg).toContain("Vehicle: Honda Vezel 2019");
    expect(msg).toContain("Registration: Dhaka Metro Ga 12-3456");
    expect(msg).toContain("Reference: DEMO-SB-1234");
  });
});

describe("buildWhatsAppShareLink", () => {
  it("has no recipient, so WhatsApp lets the customer choose a contact", () => {
    expect(buildWhatsAppShareLink("Code: AYESHA-EU24 & more")).toBe("https://wa.me/?text=Code%3A%20AYESHA-EU24%20%26%20more");
  });
});
