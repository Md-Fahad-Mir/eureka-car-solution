import { describe, expect, it } from "vitest";
import { newsletterSchema } from "./newsletter";

describe("newsletterSchema", () => {
  it("trims and accepts a valid email", () => {
    expect(newsletterSchema.parse({ email: "  ayesha@example.com " }).email).toBe("ayesha@example.com");
  });
  it("rejects empty or invalid emails with the `email` key", () => {
    for (const email of ["", "not-an-email"]) expect(newsletterSchema.safeParse({ email }).error?.issues[0].message).toBe("email");
  });
});
