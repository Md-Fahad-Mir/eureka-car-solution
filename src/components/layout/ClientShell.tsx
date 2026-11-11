"use client";

import { Suspense } from "react";
import { Toaster } from "@/components/ui/Toaster";
import { FloatingWhatsApp } from "@/components/whatsapp/FloatingWhatsApp";
import { useRehydrateStores } from "@/stores/hydration";

/** Client-only chrome mounted once in the locale layout. */
export function ClientShell() {
  useRehydrateStores();
  return (
    <>
      {/* Reads the pathname to order topics, so it streams in on routes with unknown params. */}
      <Suspense fallback={null}>
        <FloatingWhatsApp />
      </Suspense>
      <Toaster />
    </>
  );
}
