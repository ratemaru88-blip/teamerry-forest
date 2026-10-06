const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require("playwright");
const base = process.env.FOREST_TEST_BASE_URL || "http://127.0.0.1:8788";
const destination = "/musical/boku-no-takaramono/pair-preview.html";
const results = [], errors = [], consoleErrors = new Set();
const missingResources = new Set();
async function open(browser, size, query, stored = {}) {
  const context = await browser.newContext({ viewport: size, reducedMotion: "reduce" });
  await context.addInitScript((items) => {
    for (const [key, value] of Object.entries(items)) localStorage.setItem(key, value);
  }, stored);
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.add(m.text() + " " + m.location().url); });
  page.on("response", (r) => { if (r.status() >= 400) missingResources.add(r.status() + " " + r.url()); });
  await page.goto(base + "/index.html" + query, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.TeaMerryForestName);
  return { context, page };
}
const returning = (name = "森のお友だち", time = Date.now()) => ({
  teaMerryForestName: name, teaMerryDisplayName: name + "さん", teaMerryNameDone: "true", teaMerryLastVisitAt: String(time),
});
async function welcome(page) {
  assert.equal(await page.locator("#nameModal").getAttribute("data-story-step"), "welcome");
  assert((await page.locator("#nameModalMessage").innerText()).includes("ミュージカル『ぼくの宝物』の続きを見に来たの？"));
  assert.equal(await page.locator("#forestNameInput").isVisible(), false);
  await page.locator("#continueMusicalStory").click();
}
async function ready(page, name) {
  assert.equal(await page.locator("#nameModal").getAttribute("data-story-step"), "ready");
  assert((await page.locator("#nameModalMessage").innerText()).startsWith(name + "、じゃあこっちだよ。"));
  assert.equal(await page.locator("#musicalStoryDestination").getAttribute("href"), "." + destination);
  assert.equal(await page.locator("#forestNameInput").isVisible(), false);
}
async function main() {
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  try {
    fs.mkdirSync("_codex_screenshots", { recursive: true });
    for (const [mode, size] of [["pc", { width: 1440, height: 1000 }], ["mobile", { width: 390, height: 844 }]]) {
      let run = await open(browser, size, "?story=bokunotakaramono");
      await run.page.waitForFunction(() => document.querySelector(".tm-mint").naturalWidth > 0);
      await run.page.screenshot({ path: `_codex_screenshots/story-${mode}-welcome.png` });
      await welcome(run.page);
      assert(await run.page.locator("#forestNameInput").isVisible());
      await run.page.locator("#forestNameInput").fill("宝物");
      await run.page.locator("#forestNameInput").press("Enter");
      await ready(run.page, "宝物さん");
      assert.equal(await run.page.evaluate(() => localStorage.getItem("teaMerryForestName")), "宝物");
      await run.page.screenshot({ path: `_codex_screenshots/story-${mode}-ready.png` });
      await run.page.locator("#musicalStoryDestination").click();
      await run.page.waitForURL("**" + destination);
      await run.page.waitForFunction(() => document.documentElement.dataset.ready);
      assert.equal(await run.page.locator("#content").getAttribute("data-viewport"), mode === "pc" ? "desktop" : "mobile");
      await run.context.close();
      results.push(mode + ": first visit, Enter save, direct destination and responsive display PASS");

      run = await open(browser, size, "?story=bokunotakaramono", returning());
      await welcome(run.page);
      assert.equal(await run.page.locator("#nameModal").getAttribute("data-story-step"), "returning");
      assert((await run.page.locator("#nameModalMessage").innerText()).includes("森のお友だちさん"));
      assert.equal(await run.page.locator("#forestNameInput").isVisible(), false);
      await run.page.locator("#continueMusicalStory").click();
      await ready(run.page, "森のお友だちさん");
      assert.equal(await run.page.evaluate(() => localStorage.getItem("teaMerryForestName")), "森のお友だち");
      await run.context.close();
      results.push(mode + ": saved-name reuse PASS");

      run = await open(browser, size, "?story=bokunotakaramono", returning());
      await welcome(run.page);
      await run.page.locator("#changeMusicalName").click();
      assert.equal(await run.page.locator("#forestNameInput").inputValue(), "森のお友だち");
      await run.page.locator("#forestNameInput").fill("新しい名前");
      await run.page.locator("#saveForestName").click();
      await ready(run.page, "新しい名前さん");
      await run.context.close();
      results.push(mode + ": change name PASS");

      run = await open(browser, size, "?story=bokunotakaramono");
      await welcome(run.page);
      await run.page.locator("#skipForestName").click();
      await ready(run.page, "おさんぽさん");
      assert.equal(await run.page.evaluate(() => localStorage.getItem("teaMerryDisplayName")), "おさんぽさん");
      await run.page.reload({ waitUntil: "domcontentloaded" });
      await run.page.waitForFunction(() => window.TeaMerryForestName);
      await welcome(run.page);
      assert((await run.page.locator("#nameModalMessage").innerText()).includes("おさんぽさん"));
      await run.page.locator("#continueMusicalStory").click();
      await ready(run.page, "おさんぽさん");
      await run.context.close();
      results.push(mode + ": walk-only save/revisit PASS");

      for (const query of ["", "?story=other"]) {
        run = await open(browser, size, query);
        assert.equal(await run.page.locator("#nameModal").getAttribute("data-story-step"), null);
        assert(await run.page.locator("#forestNameInput").isVisible());
        assert.equal(await run.page.locator("#storyWelcomeActions").isVisible(), false);
        await run.page.locator("#forestNameInput").fill("普通");
        await run.page.locator("#saveForestName").click();
        assert.equal(await run.page.locator("#nameModal").isVisible(), false);
        assert.equal(await run.page.locator(".forest-scene").getAttribute("inert"), null);
        assert.equal(await run.page.locator('.forest-portal--contact').getAttribute("href"), "./tea_room.html");
        assert.equal(await run.page.locator('#fixedObservatoryPortal').getAttribute("href"), "./observatory.html");
        assert.equal(await run.page.locator(".mint-guide, .mobile-walker, .kakao-walker").count(), 3);
        await run.context.close();
      }
      run = await open(browser, size, "", returning());
      assert.equal(await run.page.locator("#nameModal").isVisible(), false);
      assert.equal(await run.page.locator(".forest-scene").getAttribute("inert"), null);
      await run.context.close();
      run = await open(browser, size, "", returning("前回", Date.now() - 15 * 86400000));
      assert.equal(await run.page.locator("#nameModal").getAttribute("data-mode"), "confirm");
      await run.page.locator("#reuseForestName").click();
      assert.equal(await run.page.locator("#nameModal").isVisible(), false);
      await run.context.close();
      results.push(mode + ": normal/unknown parameter, first/recent/15-day revisit regression PASS");
      run = await open(browser, size, "?debug=1", returning());
      await run.page.locator('[data-debug-time="night"]').evaluate((button) => button.click());
      assert(await run.page.locator(".forest-scene").evaluate((el) => el.classList.contains("forest-time--night")));
      await run.page.locator('[data-debug-time="day"]').evaluate((button) => button.click());
      assert(await run.page.locator(".forest-scene").evaluate((el) => el.classList.contains("forest-time--day")));
      await run.page.locator('[data-debug-toggle="walker"]').evaluate((button) => button.click());
      assert.equal(await run.page.locator('[data-debug-toggle="walker"]').getAttribute("aria-pressed"), "false");
      await run.page.locator('[data-debug-toggle="walker"]').evaluate((button) => button.click());
      assert.equal(await run.page.locator('[data-debug-toggle="walker"]').getAttribute("aria-pressed"), "true");
      await run.page.waitForTimeout(1200);
      await run.context.close();
      results.push(mode + ": Scene day/night and Walker debug toggle PASS");
    }
    const small = await open(browser, { width: 320, height: 568 }, "?story=bokunotakaramono");
    await welcome(small.page);
    await small.page.screenshot({ path: "_codex_screenshots/story-mobile-small-name.png" });
    const card = await small.page.locator(".tm-name-card").boundingBox();
    assert(card.x >= 0 && card.x + card.width <= 320 && card.y >= 0 && card.y + card.height <= 568);
    await small.context.close();
    assert.deepEqual(errors, []);
    assert([...consoleErrors].every((line) => line.endsWith(new URL(base).origin + "/favicon.ico")), "No new console errors except the existing preview favicon request");
    console.log(results.join("\n"));
    console.log("JS pageerrors:", errors);
    console.log("Console errors:", [...consoleErrors]);
    console.log("Missing resources:", [...missingResources]);
  } finally { await browser.close(); }
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
