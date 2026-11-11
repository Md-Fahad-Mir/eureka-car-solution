import { testimonials } from "@/data/mock/testimonials";
import type { Testimonial } from "@/types";
import { simulateLatency } from "./client";

/** Sample testimonials (all `isSample: true`, labelled in the UI). */
export async function getTestimonials(): Promise<Testimonial[]> {
  // TODO(api): GET /testimonials → Testimonial[] (real, consented quotes only)
  await simulateLatency();
  return testimonials;
}
