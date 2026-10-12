const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "../..");
async function main() {
  let server, browser;
  try {
    let base = process.env.FOREST_TEST_BASE_URL;
    if (!base) {
      server = http.createServer((req,res) => {
        const relative = decodeURIComponent(new URL(req.url, "http://local").pathname).replace(/^\//, "") || "index.html";
        const full = path.resolve(root, relative);
        if (!full.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
        const mime = {".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".png":"image/png",".webp":"image/webp",".webm":"video/webm"};
        res.setHeader("Content-Type",mime[path.extname(full)] || "application/octet-stream");
        const stream = fs.createReadStream(full); stream.on("error",()=>{res.writeHead(404).end();}); stream.pipe(res);
      });
      await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
      base = "http://127.0.0.1:" + server.address().port;
    }
    browser = await chromium.launch({channel:process.env.FOREST_TEST_BROWSER || "chrome",headless:true});
    const expectedNames = ["雫ゲーム","フォーチュンクッキー","森のおみくじ","湯の香り温泉郷","忘れ時の洞窟","まろうど茶房","星風のテラス"];
    const expectedPaths = ["https://ratemaru88-blip.github.io/teamerry-shizuku-game/","https://ratemaru88.wixsite.com/teamerry/%E3%83%86%E3%82%B9%E3%83%88","https://ratemaru88.wixsite.com/teamerry/%E3%83%97%E3%83%A9%E3%82%A4%E3%83%90%E3%82%B7%E3%83%BC%E3%83%9D%E3%83%AA%E3%82%B7%E3%83%BC","./yunokaori.html","cave.html","./tea_room.html","./observatory.html"];
    for (const [width,height,prefix] of [[320,568,""],[375,667,""],[390,844,""],[412,915,""],[667,375,""],[390,844,"/docs"]]) {
      if (process.env.FOREST_TEST_BASE_URL && prefix) continue;
      const context = await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true});
      const page = await context.newPage(); const errors=[]; page.on("pageerror",e=>errors.push(e.message));
      await page.goto(base+prefix+"/index.html",{waitUntil:"domcontentloaded"});
      await page.locator("#skipForestName").click();
      const before = await page.evaluate(()=>window.TeaMerryForestNavigation.snapshot());
      await page.locator(".forest-map-button").click();
      await page.locator(".forest-map-image").evaluate(img=>img.decode());
      assert((await page.locator(".forest-map-image").getAttribute("src")).endsWith("forest-guide-evening.webp"));
      assert.equal(await page.locator(".forest-map-introduction, .forest-map-card-description, .forest-map-card-action").count(),0);
      assert((await page.locator(".forest-map-note").innerText()).includes("時間とともに"));
      assert.equal(await page.locator(".forest-navigation-stick").isVisible(),false);
      assert.equal(await page.locator(".forest-map-card").count(),7);
      assert.equal(await page.locator(".forest-map-marker").count(),7);
      const map = await page.locator(".forest-map-overview").boundingBox();
      assert(map.x>=0 && map.x+map.width<=width && map.y>=0 && map.width>240);
      assert(map.y+map.height<=height-20,"entire overview should be visible before scrolling");
      for (let index=0;index<7;index++) {
        const number=String(index+1);
        const marker=page.locator('.forest-map-marker[data-map-number="'+number+'"]');
        const card=page.locator('.forest-map-card[data-map-number="'+number+'"]');
        assert.equal(await marker.innerText(),await card.locator(".forest-map-number").innerText());
        assert.equal(await card.locator(".forest-map-card-name").innerText(),expectedNames[index]);
        assert.equal(await card.getAttribute("href"),expectedPaths[index]);
        assert.equal(await card.locator("img").isVisible(),true,"existing UI image must remain visible even on SE");
        await card.locator("img").evaluate(img=>img.decode());
        const markerBox=await marker.boundingBox(); assert(markerBox.width>=16 && markerBox.width<=20 && markerBox.x>=map.x-1 && markerBox.x+markerBox.width<=map.x+map.width+1);
        await card.scrollIntoViewIfNeeded();
        const cardBox=await card.boundingBox(); assert(cardBox.height>=44 && cardBox.height<=56 && cardBox.x>=0 && cardBox.x+cardBox.width<=width);
        assert(await card.evaluate(el=>el.scrollWidth<=el.clientWidth),"card text must fit");
        // Exercise a real whole-card click, but intercept navigation instead of submitting visits to external sites.
        const target=await card.evaluate(el=>el.href);
        const event=page.waitForEvent("request",request=>request.isNavigationRequest() && request.url()===target);
        await page.route(target,route=>route.abort());
        await card.click({position:{x:8,y:8},noWaitAfter:true});
        await event;
        await page.unroute(target);
        await page.goto(base+prefix+"/index.html",{waitUntil:"domcontentloaded"});
        await page.locator(".forest-map-button").click();
      }
      await page.locator(".forest-map-content").evaluate(el=>el.scrollTop=0);
      await page.locator(".forest-map-image").evaluate(img=>img.decode());
      if (process.env.FOREST_TEST_ARTIFACTS) {
        fs.mkdirSync(process.env.FOREST_TEST_ARTIFACTS,{recursive:true});
        await page.screenshot({path:path.join(process.env.FOREST_TEST_ARTIFACTS,"guide-map-"+width+"-"+height+(prefix?"-docs":"")+".png")});
      }
      const content=page.locator(".forest-map-content");
      const overflow=await content.evaluate(el=>el.scrollHeight-el.clientHeight);
      if (width===320) assert(overflow<=180,"SE should need less than half a screen of scrolling");
      if (height>=844) assert(overflow<=2,"all seven rows should fit on a taller phone");
      if (overflow>20) {
      const cdp=await context.newCDPSession(page);
      const box=await content.boundingBox();
      const x=box.x+box.width/2, y=box.y+box.height*.8;
      await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x,y}]});
      for(let step=1;step<=6;step++) await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x,y:y-step*20}]});
      await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
      await page.waitForTimeout(250);
      assert(await content.evaluate(el=>el.scrollTop>20),"touch scroll must work");
      }
      await page.locator(".forest-map-close").click();
      await page.locator(".forest-navigation-stick").waitFor({state:"visible"});
      assert.equal(await page.locator(".forest-navigation-stick").isVisible(),true);
      assert.deepEqual(await page.evaluate(()=>window.TeaMerryForestNavigation.snapshot()),before,"map must not pan forest");
      await page.locator(".forest-map-button").click();
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#forestMapDialog").isVisible(),false);
      assert.deepEqual(errors,[]);
      console.log((prefix||"root")+" "+width+"x"+height+": map / numbers / cards / 7 real link clicks / touch scroll / close / stick PASS");
      await context.close();
    }
  } finally { if(browser)await browser.close(); if(server)await new Promise(resolve=>server.close(resolve)); }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
