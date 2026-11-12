import { accountMetadata } from "@/components/account/accountMetadata";
import { Inquiries } from "@/components/account/Records";

export const generateMetadata = () => accountMetadata("inquiries", "/account/inquiries");

export default function Page() {
  return <Inquiries />;
}
