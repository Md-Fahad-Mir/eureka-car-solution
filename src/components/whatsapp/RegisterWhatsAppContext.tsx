"use client";

import { useEffect } from "react";
import type { WhatsAppContext } from "@/lib/whatsapp";
import { useWhatsAppContextStore } from "@/stores/whatsappContext";

/** Tells the floating WhatsApp panel what this page is about (e.g. the vehicle being viewed). */
export function RegisterWhatsAppContext({ label, context }: { label: string; context: WhatsAppContext }) {
  const setPage = useWhatsAppContextStore((s) => s.setPage);
  const key = JSON.stringify(context);
  useEffect(() => {
    setPage({ label, context: JSON.parse(key) as WhatsAppContext });
    return () => setPage(null);
  }, [label, key, setPage]);
  return null;
}
