import { describe, expect, it } from "vitest";
import { profileSchema, signInCodeSchema } from "./account";

describe("account schemas", () => {
  const valid = { name: "Ayesha Rahman", email: "ayesha@example.com", phone: "01711 000001", city: "Dhaka", address: "", preferredLanguage: "bn", preferredContact: "whatsapp" };

  it("accepts a profile and normalises the phone", () => {
    const r = profileSchema.safeParse(valid);
    expect(r.success).toBe(true);
    expect(r.data?.phone).toBe("+8801711000001");
  });

  it("requires a real email and city", () => {
    const r = profileSchema.safeParse({ ...valid, email: "nope", city: "" });
    expect(r.error?.issues.map((i) => [i.path[0], i.message])).toEqual(expect.arrayContaining([["email", "email"], ["city", "required"]]));
  });

  it("accepts only six-digit codes", () => {
    expect(signInCodeSchema.safeParse({ code: " 123456 " }).success).toBe(true);
    expect(signInCodeSchema.safeParse({ code: "12345" }).error?.issues[0].message).toBe("otp");
  });
});
