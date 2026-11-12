"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/States";
import { getCustomerDashboard } from "@/lib/api/account";
import { getFinancePartners } from "@/lib/api/finance";
import { getServicePackages } from "@/lib/api/service";
import { getShowrooms } from "@/lib/api/showrooms";
import type { CustomerDashboard, FinancePartner, ServicePackage, Showroom } from "@/types";

type Refs = { showrooms: Showroom[]; packages: ServicePackage[]; partners: FinancePartner[] };
type AccountContext = {
  data: CustomerDashboard;
  refs: Refs;
  /** Local update after a successful API call (profile saved, notifications read). */
  update: (fn: (d: CustomerDashboard) => CustomerDashboard) => void;
};

const Ctx = createContext<AccountContext | null>(null);

/** The demo customer's dashboard and the reference data its sections need, loaded once per visit. */
export function AccountDataProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("account");
  const tCommon = useTranslations("common");
  const [state, setState] = useState<{ status: "loading" } | { status: "error" } | { status: "ready"; data: CustomerDashboard; refs: Refs }>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCustomerDashboard(), getShowrooms(), getServicePackages(), getFinancePartners()]).then(
      ([data, showrooms, packages, partners]) => !cancelled && setState({ status: "ready", data, refs: { showrooms, packages, partners } }),
      () => !cancelled && setState({ status: "error" }),
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const update = useCallback(
    (fn: (d: CustomerDashboard) => CustomerDashboard) => setState((s) => (s.status === "ready" ? { ...s, data: fn(s.data) } : s)),
    [],
  );

  if (state.status === "loading") {
    return (
      <div className="flex flex-col gap-4" aria-busy>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 rounded-card" />
        <Skeleton className="h-48 rounded-card" />
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <ErrorState
        title={t("loadError")}
        action={
          <Button variant="outline" onClick={() => { setState({ status: "loading" }); setAttempt((a) => a + 1); }}>
            {tCommon("retry")}
          </Button>
        }
      />
    );
  }
  return <Ctx.Provider value={{ data: state.data, refs: state.refs, update }}>{children}</Ctx.Provider>;
}

export function useAccount(): AccountContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAccount must be used inside AccountDataProvider");
  return ctx;
}
