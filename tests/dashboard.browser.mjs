// Run against a local production build with playwright-core on the Node search path.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright-core");

async function verify() {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ reducedMotion: "reduce" });
    const hydrationErrors = [];
    page.on("console", (message) => {
      if (/hydration|hydrated|error #418/i.test(message.text())) hydrationErrors.push(message.text());
    });
    await page.addInitScript(() => {
      Storage.prototype.setItem = () => { throw new Error("Storage unavailable"); };
      const city = (id, name) => ({ id, name, latitude: 20, longitude: 78, region: "Fixture" });
      const cities = [city(1, "Delhi"), city(2, "Mumbai")];
      const air = (selected) => ({
        city: selected,
        measured: { status: "no-data", readings: [] },
        modeled: { status: "no-data", readings: [] },
      });
      const send = window.fetch.bind(window);
      window.pendingPlans = [];
      window.fetch = (input, init) => {
        const url = new URL(input, location.href);
        if (url.pathname === "/api/cities") {
          const q = url.searchParams.get("q");
          const matches = q === "both" ? cities : cities.filter((item) => item.name === q);
          return Promise.resolve(Response.json({ cities: matches }));
        }
        if (url.pathname === "/api/air-quality") {
          const selected = cities.find((item) => item.id === Number(url.searchParams.get("cityId")));
          return Promise.resolve(Response.json(air(selected)));
        }
        if (url.pathname === "/api/recommendations") {
          const selected = cities.find((item) => item.id === JSON.parse(init.body).cityId);
          // Deliberately ignore abort so obsolete success, failure and finally paths execute.
          return new Promise((resolve) => window.pendingPlans.push((fail) => {
            const action = { id: "checkBefore", title: selected.name + " fixture plan", why: "Fixture" };
            resolve(fail ? Response.json({ error: "Obsolete failure" }, { status: 502 }) : Response.json({
              air: air(selected),
              plan: { basis: "limited", source: "gemini", actions: { routine: action, indoor: action, travel: action } },
            }));
          }));
        }
        if (url.pathname.startsWith("/api/")) throw new Error("Unexpected API request");
        return send(input, init);
      };
    });
    await page.goto("http://127.0.0.1:3000/");
    await page.getByRole("radio", { name: "Dark theme" }).click();
    await page.waitForFunction(() => document.documentElement.dataset.theme === "dark" &&
      document.querySelector('[aria-label="Dark theme"]').getAttribute("aria-checked") === "true");
    assert.deepEqual(hydrationErrors, []);
    assert.equal(await page.locator('[role="tabpanel"]').evaluateAll((panels) =>
      panels.length > 0 && panels.every((panel) =>
        document.getElementById(panel.getAttribute("aria-labelledby"))?.getAttribute("aria-controls") === panel.id)), true);

    const search = page.locator("#city-query");
    const generate = page.getByRole("button", { name: "Generate action plan", exact: true });
    const submit = async (term) => {
      await search.fill(term);
      await search.press("Enter");
    };
    await page.getByRole("checkbox", { name: /Children/ }).click();
    await generate.click();
    await submit("both");
    await page.waitForFunction(() => document.activeElement?.getAttribute("role") === "listbox");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await generate.click();
    await page.waitForFunction(() => window.pendingPlans.length === 2);
    await page.evaluate(() => window.pendingPlans[0](false));
    await page.getByRole("button", { name: /Generating action plan/ }).waitFor();
    assert.equal(await page.getByText("Delhi fixture plan", { exact: true }).count(), 0);
    await submit("Delhi");
    await generate.click();
    await page.evaluate(() => window.pendingPlans[1](true));
    await page.getByRole("button", { name: /Generating action plan/ }).waitFor();
    assert.equal(await page.getByText("Obsolete failure").count(), 0);
    await page.evaluate(() => window.pendingPlans[2](false));
    const currentPlan = page.getByText("Delhi fixture plan", { exact: true }).first();
    await currentPlan.waitFor();
    await submit("Delhi");
    await page.waitForFunction(() => !document.querySelector("#city-query").readOnly);
    await currentPlan.waitFor();
    assert.equal(await generate.isEnabled(), true);
    console.log("Dashboard browser regressions passed.");
  } finally {
    await browser.close();
  }
}
verify().catch((error) => { console.error(error); process.exitCode = 1; });
