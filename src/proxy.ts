import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Negotiates the locale (cookie → Accept-Language → default) and redirects
// unprefixed paths such as `/vehicles` to `/en/vehicles`.
export default createMiddleware(routing);

export const config = {
  // Skip Next internals, API routes and any path with a file extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
