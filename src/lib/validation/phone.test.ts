import { describe, expect, it } from "vitest";
import { bdPhoneSchema, formatBdPhone, normalizeBdPhone } from "./phone";

describe("normalizeBdPhone", () => {
  it.each([
    ["01712345678", "+8801712345678"],
    ["+8801712345678", "+8801712345678"],
    ["8801912345678", "+8801912345678"],
    ["017 1234-5678", "+8801712345678"],
    ["(+880) 1312-345678", "+8801312345678"],
    ["০১৭১২৩৪৫৬৭৮", "+8801712345678"],
    [" 01512345678 ", "+8801512345678"],
  ])("accepts %s", (input, expected) => {
    expect(normalizeBdPhone(input)).toBe(expected);
  });

  it.each([
    "0171234567", // 10 digits
    "017123456789", // 12 digits
    "01212345678", // operator prefix 2
    "01012345678", // operator prefix 0
    "+8811712345678",
    "1712345678", // missing leading 0
    "02-9123456", // landline
    "abc",
    "",
  ])("rejects %s", (input) => {
    expect(normalizeBdPhone(input)).toBeNull();
  });
});

describe("bdPhoneSchema", () => {
  it("outputs E.164", () => {
    expect(bdPhoneSchema.parse("01812345678")).toBe("+8801812345678");
  });

  it("uses i18n keys as error messages", () => {
    expect(bdPhoneSchema.safeParse("").error?.issues[0].message).toBe("required");
    expect(bdPhoneSchema.safeParse("12345").error?.issues[0].message).toBe("phone");
  });
});

describe("formatBdPhone", () => {
  it("formats E.164 for display", () => {
    expect(formatBdPhone("+8801712345678")).toBe("+880 1712-345678");
    expect(formatBdPhone("+44123")).toBe("+44123");
  });
});
