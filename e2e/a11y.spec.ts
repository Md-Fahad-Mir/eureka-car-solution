import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** Automated WCAG 2.2 A/AA checks (axe) on key pages in both languages. Serious and critical issues fail. */
const PAGES = ["", "/vehicles", "/vehicles/toyota-aqua-g-2019", "/compare?ids=v01,v02,v03", "/finance", "/savings-calculator", "/test-drive", "/service", "/ev/charging", "/showrooms", "/sign-in", "/privacy"];

test.use({ reducedMotion: "reduce" });

for (const locale of ["en", "bn"]) {
  for (const path of PAGES) {
    test(`a11y: /${locale}${path}`, async ({ page }) => {
      await page.goto(`/${locale}${path}`);
      await page.waitForLoadState("load");
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
    });
  }
}
