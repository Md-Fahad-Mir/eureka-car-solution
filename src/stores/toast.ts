import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";
export type Toast = { id: number; tone: ToastTone; title: string; body?: string };

type ToastState = {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
};

let nextId = 1;
const AUTO_DISMISS_MS = 7000;

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = nextId++;
    set({ toasts: [...get().toasts.slice(-2), { ...toast, id }] });
    setTimeout(() => get().dismiss(id), AUTO_DISMISS_MS);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

/** Imperative helper for client components: `toast({ tone: "success", title })`. */
export const toast = (t: Omit<Toast, "id">) => useToastStore.getState().push(t);
