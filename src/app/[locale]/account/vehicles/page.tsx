import { accountMetadata } from "@/components/account/accountMetadata";
import { MyVehicles } from "@/components/account/MyVehicles";

export const generateMetadata = () => accountMetadata("vehicles", "/account/vehicles");

export default function Page() {
  return <MyVehicles />;
}
