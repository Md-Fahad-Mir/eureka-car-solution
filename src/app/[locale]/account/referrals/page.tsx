import { accountMetadata } from "@/components/account/accountMetadata";
import { Referrals } from "@/components/account/Engagement";

export const generateMetadata = () => accountMetadata("referrals", "/account/referrals");

export default function Page() {
  return <Referrals />;
}
