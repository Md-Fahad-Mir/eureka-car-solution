import { describe, expect, it } from "vitest";
import { financeApplicationSchema } from "./finance";

const valid = {
  vehicleId: "v19",
  vehiclePrice: 4_990_000,
  downPayment: 1_500_000,
  tenureMonths: 60,
  financeType: "conventional" as const,
  partnerId: "",
  name: "Test Customer",
  phone: "01712345678",
  email: "",
  nidLast4: "১২৩৪",
  city: "Dhaka",
  address: "House 1, Road 2, Dhanmondi",
  employment: "salaried" as const,
  employer: "Demo Co.",
  yearsInRole: 3,
  monthlyIncome: 250_000,
  existingEmi: 0,
  documents: [],
  consent: true,
};

const issues = (data: object) =>
  financeApplicationSchema.safeParse(data).error?.issues.map((i) => `${i.path.join(".")}:${i.message}`) ?? [];

describe("financeApplicationSchema", () => {
  it("accepts a complete application and normalises phone and Bangla NID digits", () => {
    const out = financeApplicationSchema.parse(valid);
    expect(out.phone).toBe("+8801712345678");
    expect(out.nidLast4).toBe("1234");
    expect(out.email).toBeUndefined();
  });

  it("requires at least the minimum down payment and less than the price", () => {
    expect(issues({ ...valid, downPayment: 100_000 })).toContain("downPayment:downPaymentMin");
    expect(issues({ ...valid, downPayment: 4_990_000 })).toContain("downPayment:downPaymentMax");
  });

  it("validates tenure bounds, NID digits and consent", () => {
    expect(issues({ ...valid, tenureMonths: 96 })).toContain("tenureMonths:select");
    expect(issues({ ...valid, nidLast4: "12a4" })).toContain("nidLast4:nidLast4");
    expect(issues({ ...valid, consent: false })).toContain("consent:consent");
  });
});
