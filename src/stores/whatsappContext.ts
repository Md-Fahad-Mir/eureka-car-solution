import { create } from "zustand";
import type { WhatsAppContext } from "@/lib/whatsapp";

type WhatsAppContextState = {
  /** Context registered by the current page (e.g. the vehicle being viewed). */
  page: { label: string; context: WhatsAppContext } | null;
  setPage: (page: WhatsAppContextState["page"]) => void;
};

/** Lets pages tell the floating WhatsApp panel what the customer is looking at. */
export const useWhatsAppContextStore = create<WhatsAppContextState>()((set) => ({
  page: null,
  setPage: (page) => set({ page }),
}));
