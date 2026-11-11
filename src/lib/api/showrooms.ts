import { showrooms } from "@/data/mock/showrooms";
import type { Showroom } from "@/types";
import { simulateLatency } from "./client";

export async function getShowrooms(): Promise<Showroom[]> {
  // TODO(api): GET /showrooms → Showroom[]
  await simulateLatency();
  return showrooms;
}

/** Showrooms by id, in the order requested. */
export async function getShowroomsByIds(ids: string[]): Promise<Showroom[]> {
  // TODO(api): GET /showrooms?ids=a,b → Showroom[]
  await simulateLatency();
  return ids.flatMap((id) => showrooms.filter((s) => s.id === id));
}
