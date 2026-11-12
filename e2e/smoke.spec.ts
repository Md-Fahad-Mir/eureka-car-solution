import { expect, test } from "@playwright/test";
import { calculateEmi } from "../src/lib/calc/emi";
import { formatBDT } from "../src/lib/format/currency";

/** The five smoke flows from the brief (§14). */

test("marketplace: filter by EV and price, open a vehicle, WhatsApp link names it", async ({ page }) => {
  await page.goto("/en/vehicles");
  const filters = page.getByRole("complementary", { name: "Filters" });
  await filters.getByText("Electric", { exact: true }).click();
  await expect(page).toHaveURL(/fuel=ev/);
  await filters.getByRole("textbox", { name: "Maximum price" }).fill("6000000");
  await expect(page).toHaveURL(/priceMax=6000000/);

  const card = page.locator("main article").first();
  await expect(card).toContainText("Electric");
  await card.getByRole("link").first().click();
  await expect(page).toHaveURL(/\/en\/vehicles\/[a-z0-9-]+$/);

  const model = (await page.locator("main h1").first().innerText()).split("\n")[0].trim();
  const href = await page.getByRole("link", { name: /Chat on WhatsApp/ }).first().getAttribute("href");
  expect(href).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
  expect(decodeURIComponent(href!)).toContain(model.split(" ")[0]);
});

test("compare: add three vehicles and see them side by side", async ({ page }) => {
  await page.goto("/en/vehicles");
  const add = page.getByRole("button", { name: /^Add .+ to compare$/ });
  for (let i = 0; i < 3; i++) await add.nth(i).click();
  await page.getByRole("link", { name: "Compare now" }).click();
  await expect(page).toHaveURL(/\/en\/compare\?ids=[^,]+,[^,]+,[^,]+$/);
  const table = page.getByRole("table");
  await expect(table.locator("thead th[scope=col]")).toHaveCount(4); // label column + 3 vehicles
  await expect(table.getByRole("rowheader").first()).toBeVisible();
});

test("EMI calculator: known inputs give the expected EMI", async ({ page }) => {
  await page.goto("/en/finance");
  const price = page.getByRole("textbox", { name: "Vehicle price" }).first();
  await price.fill("3000000");
  await price.blur();
  const down = page.getByRole("textbox", { name: "Down payment" }).first();
  await down.fill("20");
  await down.blur();
  // 30 lakh, 20% down → 24 lakh financed over the default 60 months at the default 13%.
  const expected = formatBDT(calculateEmi(2_400_000, 13, 60), "en");
  await expect(page.locator("main")).toContainText(expected);
});

test("test drive: book end to end and reach a DEMO confirmation", async ({ page }) => {
  await page.goto("/en/test-drive?vehicle=toyota-aqua-g-2019");
  await expect(page.getByRole("heading", { name: "Where would you like to drive it?" })).toBeVisible();
  await page.locator('input[name="showroomId"]').first().check({ force: true });
  await page.getByRole("button", { name: "Continue" }).click();
  await page.locator('input[name="td-date"]:not([disabled])').nth(1).check({ force: true });
  await page.getByRole("button", { name: "Continue" }).click();
  await page.locator('input[name="td-slot"]:not([disabled])').first().check({ force: true });
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Full name").fill("Smoke Test");
  await page.getByLabel("Mobile number").fill("01712345678");
  await page.getByText("I hold a valid driving licence").click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByText("I agree that Eureka may contact me about this booking").click();
  await page.getByRole("button", { name: "Confirm booking" }).click();
  await expect(page).toHaveURL(/\/en\/test-drive\/confirmation\?ref=DEMO-TD-\d{4}$/);
  await expect(page.getByText(/Demo mode: this request was not sent to Eureka\. Reference DEMO-TD-\d{4}/)).toBeVisible();
});

test("Bangla: UI and prices use Bangla script and digits", async ({ page }) => {
  await page.goto("/en/vehicles");
  // Once hydrated, the switcher links to the same page in the other language.
  const switcher = page.getByRole("link", { name: /বাংলা/ }).first();
  await expect(switcher).toHaveAttribute("href", /\/bn\/vehicles$/);
  await switcher.click();
  await expect(page).toHaveURL(/\/bn\/vehicles/);
  await expect(page.locator("html")).toHaveAttribute("lang", /^bn/);
  // Next keeps the previous page mounted (hidden) after client navigation, so look at visible elements only.
  await expect(page.locator("main h1").filter({ visible: true })).toContainText("গাড়ি");
  const price = await page.locator("main article").filter({ visible: true }).first().getByText(/৳/).first().innerText();
  expect(price).toMatch(/৳[০-৯]/);
  expect(price).not.toMatch(/[0-9]/);
});
