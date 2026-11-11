import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Client-side DEMO session. This is not authentication: it only remembers
 * that the visitor chose to continue as the demo customer in this browser.
 * Written by `src/lib/api/account.ts`; read by UI to show signed-in state.
 */
export type DemoSession = {
  customerId: string;
  method: "demo" | "otp";
  email?: string;
  signedInAt: string;
};

type DemoSessionState = {
  session: DemoSession | null;
  setSession: (session: DemoSession | null) => void;
};

export const useDemoSessionStore = create<DemoSessionState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
    }),
    {
      name: "eureka-demo-session",
      storage: createJSONStorage(() => window.localStorage),
      skipHydration: true,
    },
  ),
);
