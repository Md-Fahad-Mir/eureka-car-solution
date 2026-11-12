import type { EvArticle } from "@/types";
import { batteryTechnology } from "./batteryTechnology";
import { benefitsAndLimitations } from "./benefitsAndLimitations";
import { charging } from "./charging";
import { comparePowertrains } from "./comparePowertrains";
import { howEvsWork } from "./howEvsWork";
import { maintenance } from "./maintenance";
import { ownershipGuideBangladesh } from "./ownershipGuideBangladesh";
import { whatIsAnEv } from "./whatIsAnEv";

/**
 * EV Education Centre articles, in reading order. Content only: would come
 * from a CMS in production (see lib/api/ev.ts).
 */
export const evArticles: EvArticle[] = [
  whatIsAnEv,
  howEvsWork,
  comparePowertrains,
  batteryTechnology,
  charging,
  maintenance,
  benefitsAndLimitations,
  ownershipGuideBangladesh,
];
