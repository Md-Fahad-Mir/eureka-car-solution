import { accountMetadata } from "@/components/account/accountMetadata";
import { Overview } from "@/components/account/Overview";

export const generateMetadata = () => accountMetadata("overview", "/account");

export default function Page() {
  return <Overview />;
}
