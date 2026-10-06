const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const base = process.env.FOREST_TEST_BASE_URL || "http://127.0.0.1:8788/docs";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    for (const [mode, viewport, item] of [
      ["desktop", { width: 1440, height: 1000 }, "board_oshirase_pc_05"],
      ["mobile", { width: 390, height: 844 }, "board_oshirase_m_a05"],
    ]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const errors = [];
      context.on("page", (tab) => tab.on("pageerror", (error) => errors.push(error.message)));
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(base + "/tea_room.html");
      const notice = page.locator(`[data-board-item-id="${item}"]`);
      await notice.waitFor({ state: "visible" });
      await notice.locator("img").evaluate((image) => image.decode());
      const popupPromise = context.waitForEvent("page");
      await notice.click();
      const popup = await popupPromise;
      await popup.waitForURL(base + "/musical/boku-no-takaramono/pair-preview.html");
      await popup.waitForFunction(() => document.documentElement.dataset.ready);
      assert.equal(await popup.locator("#content").getAttribute("data-viewport"), mode);
      await popup.waitForFunction(() => document.querySelectorAll('[data-scratch="ready"]').length === 4);
      assert.deepEqual(errors, []);
      console.log(mode + ": actual notice click opens completed four-screen musical page PASS");
      await context.close();
    }
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
