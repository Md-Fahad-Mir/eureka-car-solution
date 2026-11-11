import { Hind_Siliguri, Montserrat } from "next/font/google";

/**
 * Typography: Montserrat for English (and Latin words inside Bangla text),
 * Hind Siliguri for Bangla script. Fonts are only preloaded where their
 * className is rendered, so English pages don't download Bangla font files.
 */
export const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-montserrat",
});

export const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-hind-siliguri",
});
