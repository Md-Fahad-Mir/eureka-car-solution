import type { WhatsAppVehicle } from "@/lib/whatsapp";

/** Slim vehicle option for finance pickers, built on the server from the API. */
export type FinanceVehicleOption = {
  id: string;
  slug: string;
  label: string;
  hint: string;
  price: number;
  whatsapp: WhatsAppVehicle;
};
