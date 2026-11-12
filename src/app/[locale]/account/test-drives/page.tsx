import { accountMetadata } from "@/components/account/accountMetadata";
import { TestDrives } from "@/components/account/Records";

export const generateMetadata = () => accountMetadata("testDrives", "/account/test-drives");

export default function Page() {
  return <TestDrives />;
}
