const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "../..");
const artifacts = process.env.FOREST_TEST_ARTIFACTS;
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".webp": "image/webp", ".png": "image/png", ".webm": "video/webm", ".json": "application/json", ".mp3": "audio/mpeg" };
const staged = process.env.FOREST_TEST_STAGED === "1";
const snapshot = page => page.evaluate(() => window.TeaMerryForestNavigation.snapshot());
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function main() {
  let server;
  let browser;
  try {
    let base = process.env.FOREST_TEST_BASE_URL;
    if (!base) {
      server = http.createServer((req, res) => {
        let file;
        try { file = decodeURIComponent(new URL(req.url, "http://local").pathname); } catch { res.writeHead(400).end(); return; }
        const relative = file.replace(/^\//, "") || "index.html";
        const full = path.resolve(root, relative);
        if (!full.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
        res.setHeader("Content-Type", mime[path.extname(full)] || "application/octet-stream");
        if (staged && /^(docs\/)?(index.html|forest.js|css\/forest-mobile-navigation.css|js\/forest-mobile-navigation.js)$/.test(relative)) {
          try { res.end(execFileSync("git", ["show", ":" + relative], { cwd: root, maxBuffer: 1024 * 1024 })); } catch { res.writeHead(404).end(); }
          return;
        }
        const stream = fs.createReadStream(full);
        stream.on("error", () => { if (!res.headersSent) res.writeHead(404); res.end(); });
        stream.pipe(res);
      });
      await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
      base = "http://127.0.0.1:" + server.address().port;
    }
    browser = await chromium.launch({ channel: process.env.FOREST_TEST_BROWSER || "msedge", headless: true });
    for (const [width, height, prefix] of [[320,568,""],[375,667,""],[390,844,""],[412,915,""],[390,844,"/docs"]]) {
      if (process.env.FOREST_TEST_DESKTOP_ONLY || process.env.FOREST_TEST_GUIDE_CLOCK_ONLY) continue;
      if (process.env.FOREST_TEST_BASE_URL && prefix) continue;
      const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(base + prefix + "/index.html", { waitUntil: "domcontentloaded" });
      assert((await page.locator("#nameModalMessage").innerText()).includes("呼んでほしい名前"));
      await page.locator("#skipForestName").click();
      await page.waitForFunction(() => document.querySelector(".mobile-walker").classList.contains("has-speech"));
      assert((await page.locator('.mobile-walker__bubble').innerText()).includes('おさんぽさん'));
      assert.equal(await page.locator('.mobile-walker').evaluate(el => getComputedStyle(el).pointerEvents), 'none');
      assert.equal((await page.evaluate(() => window.TeaMerryMobileGuide.snapshot())).count, 1);
      await page.locator('.mobile-walker__image').evaluate(img => img.decode());
      await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.mobile-walker__bubble')).opacity) === 1);
      assert.equal(await page.evaluate(() => localStorage.getItem("teaMerryDisplayName")), "おさんぽさん");
      assert.equal(await page.locator(".forest-title").isVisible(), false);
      assert.equal(await page.locator("#fixedObservatoryPortal").isVisible(), true);
      assert.equal(await page.locator("#fixedObservatoryPortal").evaluate(el=>getComputedStyle(el).position), "absolute");
      const stick = page.locator(".forest-navigation-stick");
      const box = await stick.boundingBox();
      assert(box.width >= width * .25 && box.width <= width * .31);
      assert(box.x >= 24 && box.y + box.height <= height - 20);
      assert.equal(await page.locator(".forest-stick-direction").count(), 4);
      const mapBox = await page.locator(".forest-map-button").boundingBox();
      assert(mapBox.height >= 44 && mapBox.x + mapBox.width <= width - 15);
      const bubble = await page.locator(".mobile-walker__bubble").boundingBox();
      const character = await page.locator(".mobile-walker__image").boundingBox();
      assert(bubble.x >= 0 && bubble.x + bubble.width <= width && bubble.y >= 0);
      assert(bubble.y + bubble.height <= character.y + 12);
      if (artifacts) { fs.mkdirSync(artifacts, { recursive: true }); await page.screenshot({ path: path.join(artifacts, "forest-mobile-" + width + (prefix ? "-docs" : "") + ".png") }); }
      // Genuine touch hold using Chromium's mobile input pipeline.
      const session = await context.newCDPSession(page);
      const touch = (type, x, y) => session.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" || type === "touchCancel" ? [] : [{ x, y }] });
      let before = await snapshot(page);
      await touch("touchStart", box.x + box.width * .8, box.y + box.height * .5);
      assert.equal(await page.locator('.mobile-walker').evaluate(el => el.classList.contains('has-speech')), false);
      await pause(650);
      await touch("touchEnd");
      let after = await snapshot(page);
      assert(after.x < before.x - 65, "touch hold must move right");
      await pause(180);
      assert.deepEqual(await snapshot(page), after, "release must stop");
      for (const [key, axis, sign] of [["ArrowLeft","x",1],["ArrowRight","x",-1],["ArrowUp","y",1],["ArrowDown","y",-1]]) {
        await stick.focus();
        before = await snapshot(page);
        await page.keyboard.down(key);
        await pause(320);
        await page.keyboard.up(key);
        after = await snapshot(page);
        assert((after[axis] - before[axis]) * sign > 20, key + " must move");
      }
      await touch("touchStart", box.x + box.width * .2, box.y + box.height * .5);
      await pause(160);
      await touch("touchCancel");
      after = await snapshot(page);
      await pause(150);
      assert.deepEqual(await snapshot(page), after, "cancel must stop");
      await page.evaluate(() => {
        const s = window.TeaMerryForestNavigation.snapshot();
        window.TeaMerryForestNavigation.move(s.x + 35, 0);
      });
      await stick.focus(); await page.keyboard.down("ArrowLeft"); await pause(450); await page.keyboard.up("ArrowLeft");
      assert.equal((await snapshot(page)).x, 0, "hold reaches left edge");
      await page.evaluate(() => window.TeaMerryForestNavigation.move(1e6, 1e6));
      after = await snapshot(page);
      assert.equal(after.x, after.minX); assert.equal(after.y, after.minY);
      await page.evaluate(() => {
        const s = window.TeaMerryForestNavigation.snapshot();
        window.TeaMerryForestNavigation.move(s.x - s.minX / 2, s.y - s.minY / 2);
      });
      before = await snapshot(page);
      await touch("touchStart", 150, 170);
      await touch("touchMove", 205, 210);
      await touch("touchEnd");
      after = await snapshot(page);
      assert(after.x > before.x + 25 && after.y > before.y + 15, "swipe remains available");
      before = await snapshot(page);
      await touch("touchStart", 5, 170); await touch("touchMove", 60, 170); await touch("touchEnd");
      assert.deepEqual(await snapshot(page), before, "edge gesture is not captured by camera");
      await page.locator(".forest-map-button").click();
      assert.equal(await page.locator("#forestMapDialog").isVisible(), true);
      assert.equal(await page.locator('.mobile-walker').isVisible(), false, 'guide pauses while map is open');
      assert.equal(await page.locator(".forest-map-destinations a").count(), 7);
      assert.equal(await page.locator('.forest-map-destinations a[href="./tea_room.html"]').count(), 1);
      for (const image of await page.locator(".forest-map-destinations img").all()) {
        await image.evaluate(img => img.decode());
        assert(await image.evaluate(img => img.naturalWidth > 0));
      }
      if (artifacts && width === 320) await page.screenshot({path:path.join(artifacts,"forest-map-se.png")});
      await page.locator(".forest-map-close").click();
      await page.waitForFunction(() => !document.querySelector(".mobile-walker").classList.contains("has-speech"));
      await pause(1800);
      assert.equal(await page.locator(".mobile-walker").isVisible(), true, "quiet mobile guide remains present");
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => document.body.classList.contains('mobile-guide-active'));
      assert.equal(await page.locator("#nameModal").isVisible(), false);
      assert.equal(await page.locator(".mobile-walker").isVisible(), true, "returning visitor still has a companion");
      if (width === 375) {
        await page.evaluate(() => window.TeaMerryForestName.save("みどり"));
        await page.reload({ waitUntil: "domcontentloaded" });
        assert.equal(await page.evaluate(() => window.getForestDisplayName()), "みどりさん");
        assert.equal(await page.locator("#nameModal").isVisible(), false);
        await page.waitForFunction(() => document.querySelector('.mobile-walker').classList.contains('has-speech'));
        assert((await page.locator('.mobile-walker__bubble').innerText()).includes('みどりさん'));
        await pause(require('../../data/forest-guide.json').speechDurationMs + 500);
        assert.equal(await page.locator('.mobile-walker').isVisible(), true, 'Mint stays after speech closes');
        assert.equal(await page.locator('.mobile-walker').evaluate(el => el.classList.contains('has-speech')), false);
      }
      await stick.focus(); await page.keyboard.down("ArrowRight");
      const timings = await page.evaluate(() => new Promise(resolve => {
        const intervals = []; let previous = 0;
        function measure(now) { if (previous) intervals.push(now - previous); previous = now; if (intervals.length < 45) requestAnimationFrame(measure); else resolve(intervals); }
        requestAnimationFrame(measure);
      }));
      timings.sort((a,b)=>a-b);
      await page.keyboard.up("ArrowRight");
      await stick.focus(); await page.keyboard.down("ArrowRight");
      await page.evaluate(() => window.dispatchEvent(new Event("blur")));
      assert.equal(await page.locator('.mobile-walker').isVisible(), false, 'guide pauses on blur');
      const blurred = await snapshot(page);
      await pause(150); assert.deepEqual(await snapshot(page), blurred, "window blur stops movement");
      await page.keyboard.up("ArrowRight");
      assert.deepEqual(errors, []);
      console.log((prefix || "root") + " " + width + "x" + height + ": touch / directions / release / cancel / boundaries / swipe / map / guide PASS; moving RAF p95=" + timings[Math.floor(timings.length*.95)].toFixed(1) + "ms");
      await context.close();
    }
    if (!process.env.FOREST_TEST_DESKTOP_ONLY) {
      const idleContext = await browser.newContext({viewport:{width:320,height:568}, isMobile:true, hasTouch:true});
      const idlePage = await idleContext.newPage();
      await idlePage.clock.install();
      await idlePage.goto(base + '/index.html', {waitUntil:'domcontentloaded'});
      await idlePage.clock.runFor(1500);
      const guideResponse = idlePage.waitForResponse(response => response.url().includes('/data/forest-guide.json'));
      await idlePage.locator('#skipForestName').click();
      await idlePage.clock.runFor(2500);
      await guideResponse;
      await idlePage.clock.runFor(2000);
      assert.equal((await idlePage.evaluate(() => window.TeaMerryMobileGuide.snapshot())).count, 1);
      await idlePage.clock.fastForward(240000);
      await idlePage.clock.runFor(1000);
      assert.equal((await idlePage.evaluate(() => window.TeaMerryMobileGuide.snapshot())).count, 2, 'one idle hint appears');
      assert.equal(await idlePage.locator('.forest-narration').isVisible(), false);
      await idlePage.clock.fastForward(3600000);
      await idlePage.clock.runFor(1000);
      assert.equal((await idlePage.evaluate(() => window.TeaMerryMobileGuide.snapshot())).count, 3, 'long idle gives another distinct line');
      assert.equal(await idlePage.locator('.mobile-walker').isVisible(), true);
      await idleContext.close();
      console.log('Mobile clock: occasional distinct idle hints / narration suppression PASS');
    }
    if (process.env.FOREST_TEST_GUIDE_CLOCK_ONLY) return;
    const context = await browser.newContext({ viewport: {width:1440,height:900} });
    const page = await context.newPage();
    const errors = []; page.on("pageerror", e=>errors.push(e.message));
    await page.goto(base + "/index.html", {waitUntil:"domcontentloaded"});
    await page.locator("#forestNameInput").fill("みどり");
    await page.locator("#saveForestName").click();
    await page.waitForFunction(()=>document.querySelector('.mint-guide').classList.contains('has-speech'));
    assert.equal(await page.locator(".forest-title").isVisible(), true);
    assert.equal(await page.locator(".forest-navigation-stick").isVisible(), false);
    assert.equal(await page.locator(".forest-map-button").isVisible(), false);
    assert.equal(await page.locator(".mint-guide").evaluate(el=>el.classList.contains("has-speech")), true);
    const before = await snapshot(page);
    await page.mouse.move(400,400); await page.mouse.down(); await page.mouse.move(500,440,{steps:8}); await page.mouse.up();
    const after = await snapshot(page);
    assert(after.x > before.x, "PC drag preserved");
    assert(await page.locator("video.forest-bg.is-visible").evaluate(el=>Boolean(el.getAttribute("src"))));
    await page.goto(base + "/index.html?debug=1", {waitUntil:"domcontentloaded"});
    for (const preset of ["day", "evening-a", "evening-b", "night"]) {
      await page.locator('[data-debug-time="' + preset + '"]').evaluate(button => button.click());
      await page.waitForFunction(preset => document.querySelector(".forest-scene").classList.contains("forest-time--" + preset), preset);
    }
    await page.evaluate(() => document.body.classList.add("debug-panel-hidden"));
    if (artifacts) await page.screenshot({path:path.join(artifacts,"forest-pc.png")});
    await page.setViewportSize({width:390,height:844}); await pause(800);
    assert.equal(await page.locator(".forest-navigation-stick").isVisible(), true);
    await page.setViewportSize({width:1440,height:900}); await pause(100);
    assert.equal(await page.locator(".forest-title").isVisible(), true);
    assert.equal(await page.locator(".forest-navigation-stick").isVisible(), false);
    assert.deepEqual(errors,[]);
    console.log("PC: title / drag / Mint / background / responsive transitions PASS");
    await context.close();
    const story = await browser.newContext({ viewport: {width:320,height:568}, isMobile:true, hasTouch:true });
    const storyPage = await story.newPage();
    await storyPage.goto(base + "/index.html?story=bokunotakaramono", {waitUntil:"domcontentloaded"});
    await storyPage.locator("#continueMusicalStory").click();
    assert((await storyPage.locator("#nameModalMessage").innerText()).includes("呼んでほしい名前"));
    await storyPage.locator("#skipForestName").click();
    assert.equal(await storyPage.locator("#musicalStoryDestination").isVisible(), true);
    assert.equal(await storyPage.locator(".forest-map-button").isVisible(), false, "story modal remains the active destination");
    await story.close();
    console.log("Mobile musical name / anonymous destination flow PASS; PC four time presets PASS");
  } finally {
    if (browser) await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
