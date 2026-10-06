const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require("playwright");
const base = process.env.FOREST_TEST_BASE_URL || "http://127.0.0.1:8788/docs";
const styles = ["quiet", "round", "careful", "faded", "child"];
const texts = [
  "今日は少しだけ遠くのスーパーまで歩きました。帰り道は荷物が重かったけれど、不思議と足取りは軽かったです。",
  "あれ、何を書こうとしてたんだっけ。",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".repeat(4),
];

async function verify(page) {
  const result = await page.evaluate(() => {
    const body = document.getElementById("driftBottleBody");
    const content = body.closest(".drift-bottle-letter-content");
    const bounds = content.getBoundingClientRect();
    const clipped = [];
    for (const line of body.querySelectorAll(".letter-line")) {
      const node = line.firstChild;
      if (!node) continue;
      for (let i = 0; i < node.length; i++) {
        const range = document.createRange();
        range.setStart(node, i); range.setEnd(node, i + 1);
        for (const rect of range.getClientRects()) {
          if (rect.left < bounds.left - 1 || rect.right > bounds.right + 1) clipped.push(node.textContent);
        }
      }
    }
    return { clipped, verticalReachable: body.scrollHeight <= body.clientHeight + 1 || getComputedStyle(body).overflowY === "auto" };
  });
  assert.deepEqual(result.clipped, []);
  assert(result.verticalReachable);
}

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    for (const viewport of [{ width: 940, height: 735 }, { width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 568 }]) {
      const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(base + "/observatory.html?time=day&hokkori=1");
      await page.waitForFunction(() => window.TeaMerryObservatoryDriftBottle);
      await page.evaluate(() => document.fonts.ready);
      await page.locator(".hokkori-letter").first().click();
      await page.waitForTimeout(100);
      await verify(page);
      fs.mkdirSync("_codex_screenshots", { recursive: true });
      await page.screenshot({ path: `_codex_screenshots/letter-fit-${viewport.width}.png` });
      for (const handwritingTemplate of styles) {
        for (const text of texts) {
          await page.locator("#driftBottleClose").click();
          await page.evaluate(({ text, handwritingTemplate }) => window.TeaMerryObservatoryDriftBottle.openHokkoriBottleMessage({ id: "fit-test", displayName: "おさんぽさん", text, handwritingTemplate }), { text, handwritingTemplate });
          await page.waitForTimeout(60);
          await verify(page);
        }
      }
      await page.setViewportSize({ width: 844, height: 390 });
      await page.waitForTimeout(100);
      await verify(page);
      assert.deepEqual(errors, []);
      console.log(`${viewport.width}x${viewport.height}: actual letter, five fonts, Japanese/long token, resize PASS`);
      await page.close();
    }
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    await page.goto(base + "/observatory.html?time=night&hokkori=1");
    await page.locator(".wish-hokkori-star").last().click();
    await page.waitForTimeout(100);
    await verify(page);
    console.log("Wish star: actual click uses non-clipping letter layout PASS");
    await page.close();
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
