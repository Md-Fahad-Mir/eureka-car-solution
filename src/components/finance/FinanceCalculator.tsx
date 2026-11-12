"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ArrowRight, Car } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { EmiInputs, EmiResults, useLoanCalculator } from "@/components/calculators/EmiCalculator";
import { buttonVariants } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { Segmented } from "@/components/ui/Segmented";
import { Skeleton } from "@/components/ui/Skeleton";
import { Link } from "@/i18n/navigation";
import type { FinanceType } from "@/types";
import type { VehicleOption } from "@/lib/vehicleOptions";

const LoanBreakdown = dynamic(() => import("@/components/calculators/LoanBreakdown"), {
  ssr: false,
  loading: () => <Skeleton className="h-80 rounded-card" />,
});

const CUSTOM = "__custom";

/** Full EMI calculator for /finance: vehicle picker, conventional/Islamic, breakdown and schedule. */
export function FinanceCalculator({ vehicles, defaultPrice }: { vehicles: VehicleOption[]; defaultPrice: number }) {
  const t = useTranslations("finance");
  const params = useSearchParams();
  const initialVehicle = vehicles.find((v) => v.slug === params.get("vehicle")) ?? null;
  const initialType: FinanceType = params.get("type") === "islamic" ? "islamic" : "conventional";

  const [vehicleId, setVehicleId] = useState<string>(initialVehicle?.id ?? CUSTOM);
  const calc = useLoanCalculator(initialVehicle?.price ?? defaultPrice, initialType);
  const vehicle = vehicles.find((v) => v.id === vehicleId);

  const applyQuery = new URLSearchParams({
    ...(vehicle ? { vehicle: vehicle.slug } : { price: String(Math.round(calc.price)) }),
    down: String(Math.round(calc.downPayment)),
    tenure: String(calc.tenure),
    type: calc.financeType,
  });

  return (
    <div className="flex flex-col gap-10">
      <div className="grid overflow-hidden rounded-card border border-line lg:grid-cols-[1.25fr_1fr]">
        <div className="flex flex-col gap-6 bg-bg-alt p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="finance-vehicle" className="mb-1.5 block text-sm font-medium">
                {t("calculator.vehicle")}
              </label>
              <Combobox
                id="finance-vehicle"
                leading={<Car aria-hidden className="size-4" />}
                value={vehicleId}
                onValueChange={(id) => {
                  setVehicleId(id);
                  const v = vehicles.find((x) => x.id === id);
                  if (v) calc.setPrice(v.price);
                }}
                options={[
                  { value: CUSTOM, label: t("calculator.customPrice") },
                  ...vehicles.map((v) => ({ value: v.id, label: v.label, hint: v.hint })),
                ]}
              />
            </div>
            <div>
              <p id="finance-type-label" className="mb-1.5 text-sm font-medium">
                {t("calculator.type")}
              </p>
              <Segmented
                label={t("calculator.type")}
                value={calc.financeType}
                onValueChange={calc.setFinanceType}
                options={[
                  { value: "conventional", label: t("calculator.conventional") },
                  { value: "islamic", label: t("calculator.islamic") },
                ]}
                className="h-12 items-center"
              />
            </div>
          </div>
          <EmiInputs
            calc={{
              ...calc,
              // Editing the price by hand turns the picker back to "custom price".
              setPrice: (p: number) => {
                calc.setPrice(p);
                if (vehicle && p !== vehicle.price) setVehicleId(CUSTOM);
              },
            }}
            priceMax={30_000_000}
          />
        </div>
        <div className="on-dark bg-graphite p-5 text-on-dark sm:p-7">
          <EmiResults
            calc={calc}
            vehicle={vehicle?.whatsapp}
            actions={
              <Link
                href={`/finance/apply?${applyQuery.toString()}`}
                className={buttonVariants({ variant: "light", className: "flex-1" })}
              >
                {t("calculator.apply")}
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            }
          />
        </div>
      </div>

      <LoanBreakdown
        principal={calc.loan.principal}
        rate={calc.rate}
        tenure={calc.tenure}
        downPayment={calc.downPayment}
        financeType={calc.financeType}
      />
    </div>
  );
}
