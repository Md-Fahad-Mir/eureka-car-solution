import { accountMetadata } from "@/components/account/accountMetadata";
import { EmiSchedule } from "@/components/account/Records";

export const generateMetadata = () => accountMetadata("emi", "/account/emi");

export default function Page() {
  return <EmiSchedule />;
}
