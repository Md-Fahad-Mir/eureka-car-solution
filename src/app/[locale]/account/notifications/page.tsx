import { accountMetadata } from "@/components/account/accountMetadata";
import { Notifications } from "@/components/account/Engagement";

export const generateMetadata = () => accountMetadata("notifications", "/account/notifications");

export default function Page() {
  return <Notifications />;
}
