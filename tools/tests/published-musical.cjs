const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const base = process.env.FOREST_TEST_BASE_URL || "http://127.0.0.1:8788/docs";
async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    for (const [key, size] of [["desktop", { width: 1440, height: 1000 }], ["mobile", { width: 390, height: 844 }]]) {
      const page = await browser.newPage({ viewport: size, reducedMotion: "reduce", hasTouch: key === "mobile" });
      const errors = [], missing = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("response", (r) => { if (r.status() >= 400 && !r.url().endsWith("favicon.ico")) missing.push(r.url()); });
      await page.goto(base + "/musical/boku-no-takaramono/pair-preview.html");
      await page.waitForFunction(() => [...document.querySelectorAll("[data-scratch]")].filter((c) => c.dataset.scratch === "ready").length === 4);
      assert.equal(await page.locator("#content").getAttribute("data-viewport"), key);
      const masks = page.locator("[data-scratch]");
      for (let index = 0; index < 4; index++) {
        const mask = masks.nth(index);
        await mask.scrollIntoViewIfNeeded();
        const rect = await mask.boundingBox();
        const id = await mask.evaluate((el) => el.parentElement.dataset.colorLayerId);
        assert.deepEqual(rect, await page.locator(`[data-layer-id="${id}"]`).boundingBox());
        await page.mouse.move(rect.x + rect.width * .5, rect.y + rect.height * .4);
        assert.equal(await mask.evaluate((c) => c.getContext("2d").getImageData(Math.floor(c.width * .5), Math.floor(c.height * .4), 1, 1).data[3]), 0);
      }
      if (key === "mobile") {
        await page.locator('[data-layer-id="lyr_e0e27ee946f94375"]').click();
        assert.equal(await page.locator("[data-runtime-message] p").innerText(), "ヘッドホン、その位置で聞こえるの？");
        assert.equal(await page.locator("[data-message-tail]").count(), 1);
        await page.getByRole("button", { name: "吹き出しを閉じる" }).click();
        assert.equal(await page.locator('[data-layer-id="lyr_dd38db72c9ad438d"]').innerText(), "制作中");
      }
      assert.equal(await page.locator(".has-image-error").count(), 0);
      assert.deepEqual(errors, []);
      assert.deepEqual(missing, []);
      console.log(key + ": published four-screen assets, alignment, color reveal, message/label and JS dependencies PASS");
      await page.close();
    }
  } finally { await browser.close(); }
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
