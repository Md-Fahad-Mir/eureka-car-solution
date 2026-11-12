import { accountMetadata } from "@/components/account/accountMetadata";
import { SavedVehicles } from "@/components/account/Engagement";

export const generateMetadata = () => accountMetadata("saved", "/account/saved");

export default function Page() {
  return <SavedVehicles />;
}
