import type { LocalizedText } from "./common";

/** Placeholder testimonial. Always `isSample: true` until real, consented quotes exist. */
export type Testimonial = {
  id: string;
  name: LocalizedText;
  city: LocalizedText;
  vehicleLabel: string;
  quote: LocalizedText;
  rating: 1 | 2 | 3 | 4 | 5;
  isSample: true;
};
