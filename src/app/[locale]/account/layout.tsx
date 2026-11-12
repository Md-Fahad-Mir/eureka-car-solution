import { Suspense } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { Skeleton } from "@/components/ui/Skeleton";

/** Demo account area. The shell checks the client-side demo session (not real auth). */
export default function AccountLayout({ children }: LayoutProps<"/[locale]/account">) {
  return (
    <div className="container-page pt-8 pb-20">
      <Suspense fallback={<Skeleton className="h-[28rem] rounded-card" />}>
        <AccountShell>{children}</AccountShell>
      </Suspense>
    </div>
  );
}
