import { notFound } from "next/navigation";

/** Any unmatched path under a locale renders the branded 404 inside the site layout. */
export default function CatchAllPage() {
  notFound();
}
