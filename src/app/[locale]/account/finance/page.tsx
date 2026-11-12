import { accountMetadata } from "@/components/account/accountMetadata";
import { FinanceApplications } from "@/components/account/Records";

export const generateMetadata = () => accountMetadata("finance", "/account/finance");

export default function Page() {
  return <FinanceApplications />;
}
