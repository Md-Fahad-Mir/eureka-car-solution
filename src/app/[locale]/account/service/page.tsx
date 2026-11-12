import { accountMetadata } from "@/components/account/accountMetadata";
import { ServiceRecords } from "@/components/account/Records";

export const generateMetadata = () => accountMetadata("service", "/account/service");

export default function Page() {
  return <ServiceRecords />;
}
