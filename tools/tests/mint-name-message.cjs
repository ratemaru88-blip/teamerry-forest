const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.FOREST_TEST_BASE_URL || 'http://127.0.0.1:8840';
const normal = '呼んでほしい名前があれば教えてね。';
const musical = normal;
async function main() {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  try {
    for (const prefix of ['', '/docs']) for (const width of [1440,390]) {
      for (const story of [false,true]) for (const skip of [false,true]) {
        const context = await browser.newContext({viewport:{width,height:844}});
        const page = await context.newPage(); const errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        const url=base+prefix+'/index.html'+(story?'?story=bokunotakaramono':'');
        await page.goto(url);
        await page.locator('#nameModal:not(.hidden)').waitFor();
        if (story) {
          assert((await page.locator('#nameModalMessage').innerText()).includes('ミュージカル『ぼくの宝物』の続きを見に来たの？'));
          await page.locator('#continueMusicalStory').click();
        }
        assert.equal(await page.locator('#nameModalMessage').innerText(),story?musical:normal);
        assert.equal(await page.locator('#forestNameInput').isVisible(),true);
        const card=await page.locator('.tm-name-card').boundingBox();
        assert(card.x>=0&&card.x+card.width<=width+1&&card.y>=0&&card.y+card.height<=845);
        if (skip) await page.locator('#skipForestName').click();
        else {await page.locator('#forestNameInput').fill('テスト');await page.locator('#saveForestName').click();}
        const expected=skip?'おさんぽさん':'テストさん';
        assert.equal(await page.evaluate(()=>localStorage.getItem('teaMerryDisplayName')),expected);
        assert.equal(await page.evaluate(()=>localStorage.getItem('teaMerryNameDone')),'true');
        if (story) {
          await page.locator('#musicalStoryDestination').waitFor({state:'visible'});
          assert.equal(await page.locator('#musicalStoryDestination').getAttribute('href'),'./musical/boku-no-takaramono/pair-preview.html');
          await page.locator('#musicalStoryDestination').click();
          await page.waitForURL('**/musical/boku-no-takaramono/pair-preview.html');
        }
        await page.evaluate(()=>localStorage.setItem('teaMerryLastVisitAt','1'));
        await page.goto(url);
        if (story) {await page.locator('#continueMusicalStory').click();await page.locator('#continueMusicalStory').click();}
        else {await page.locator('#reuseForestName').waitFor({state:'visible'});await page.locator('#reuseForestName').click();}
        assert.equal(await page.evaluate(()=>localStorage.getItem('teaMerryDisplayName')),expected);
        assert.deepEqual(errors,[]);
        console.log(`${prefix||'root'} ${width}px ${story?'musical':'normal'} ${skip?'walk':'named'}: copy / save / reuse / destination PASS`);
        await context.close();
      }
    }
  } finally {await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
