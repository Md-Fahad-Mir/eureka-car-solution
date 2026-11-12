import { accountMetadata } from "@/components/account/accountMetadata";
import { Profile } from "@/components/account/Profile";

export const generateMetadata = () => accountMetadata("profile", "/account/profile");

export default function Page() {
  return <Profile />;
}
