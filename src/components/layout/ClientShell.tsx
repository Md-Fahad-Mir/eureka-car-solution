"use client";

import { Suspense } from "react";
import { Toaster } from "@/components/ui/Toaster";
import { CompareTray } from "@/components/vehicle/CompareTray";
import { FloatingWhatsApp } from "@/components/whatsapp/FloatingWhatsApp";
import { useRehydrateStores } from "@/stores/hydration";
import { MotionObserver } from "./MotionObserver";

/** Client-only chrome mounted once in the locale layout. */
export function ClientShell() {
  useRehydrateStores();
  return (
    <>
      {/* Both read the pathname, so they stream in on routes with unknown params. */}
      <Suspense fallback={null}>
        <FloatingWhatsApp />
        <CompareTray />
      </Suspense>
      <Toaster />
      <MotionObserver />
    </>
  );
}
