const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { chromium } = require('playwright');
const base = process.env.FOREST_TEST_BASE_URL || 'http://127.0.0.1:8841';
const publicBase = 'https://ratemaru88-blip.github.io/teamerry-forest/';
const title = 'ミュージカル『ぼくの宝物』 | TeaMerry';
const description = 'TeaMerry制作のオリジナルミュージカル『ぼくの宝物』。予告編や作品紹介はこちら。';
const imagePath = 'assets/images/bokunotakaramono/bokunotakaramono_og.png';
async function main() {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  try {
    for (const prefix of ['', '/docs']) {
      const crawler = await browser.newContext({javaScriptEnabled:false,userAgent:'facebookexternalhit/1.1'});
      const page = await crawler.newPage();
      await page.goto(base+prefix+'/bokunotakaramono.html');
      const content = key => page.locator('meta[property="'+key+'"],meta[name="'+key+'"]').getAttribute('content');
      assert.equal(await content('og:title'),title);
      assert.equal(await content('og:description'),description);
      assert.equal(await content('og:image'),publicBase+imagePath);
      assert.equal(await content('og:url'),publicBase+'bokunotakaramono.html');
      assert.equal(await content('twitter:card'),'summary_large_image');
      for (const field of ['title','description','image']) assert.equal(await content('twitter:'+field),await content('og:'+field));
      assert.equal(await page.locator('meta[http-equiv="refresh"]').count(),0,'crawler must retain the dedicated metadata');
      assert.equal(await page.locator('body a').getAttribute('href'),'./index.html?story=bokunotakaramono');
      await page.locator('body img').evaluate(img=>img.decode());
      const asset = await page.request.get(base+prefix+'/'+imagePath);
      assert.equal(asset.status(),200);
      const bytes = await asset.body();
      assert.equal(bytes.readUInt32BE(16),1254);
      assert.equal(bytes.readUInt32BE(20),1254);
      const original = fs.readFileSync('C:/Users/kakao/Downloads/ぼくの宝物：夕暮れの絵描きたぬき.png');
      assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),crypto.createHash('sha256').update(original).digest('hex'));
      await page.goto(base+prefix+'/index.html');
      assert.equal(await content('og:image'),publicBase+'assets/icons/icon-512.png');
      await page.goto(base+prefix+'/index.html?story=bokunotakaramono');
      assert.equal(await content('og:image'),publicBase+'assets/icons/icon-512.png','query alias stays unchanged; share the dedicated HTML');
      console.log((prefix||'root')+': static crawler OGP / exact PNG / separate top metadata PASS');
      await crawler.close();
      for (const width of [1440,390]) for (const skip of [false,true]) {
        const context = await browser.newContext({viewport:{width,height:844}});
        const p = await context.newPage(),errors=[];
        p.on('pageerror',e=>errors.push(e.message));
        await p.goto(base+prefix+'/bokunotakaramono.html');
        await p.waitForURL('**/index.html?story=bokunotakaramono');
        await p.locator('#continueMusicalStory').waitFor({state:'visible'});
        assert((await p.locator('#nameModalMessage').innerText()).includes('ミュージカル『ぼくの宝物』の続きを見に来たの？'));
        await p.locator('#continueMusicalStory').click();
        if(skip) await p.locator('#skipForestName').click();
        else { await p.locator('#forestNameInput').fill('テスト');await p.locator('#saveForestName').click(); }
        const expected=skip?'おさんぽさん':'テストさん';
        assert.equal(await p.evaluate(()=>localStorage.getItem('teaMerryDisplayName')),expected);
        assert.equal(await p.locator('#musicalStoryDestination').getAttribute('href'),'./musical/boku-no-takaramono/pair-preview.html');
        await p.locator('#musicalStoryDestination').click();
        await p.waitForURL('**/musical/boku-no-takaramono/pair-preview.html');
        await p.goto(base+prefix+'/bokunotakaramono.html');
        await p.waitForURL('**/index.html?story=bokunotakaramono');
        await p.locator('#continueMusicalStory').click();
        assert((await p.locator('#nameModalMessage').innerText()).includes('また来てくれたんだね。'));
        await p.locator('#continueMusicalStory').click();
        await p.locator('#musicalStoryDestination').waitFor({state:'visible'});
        assert.equal(await p.evaluate(()=>localStorage.getItem('teaMerryDisplayName')),expected);
        assert.deepEqual(errors,[]);
        console.log((prefix||'root')+' '+width+'px '+(skip?'anonymous':'named')+': redirect / story welcome / name / destination / returning flow PASS');
        await context.close();
      }
    }
  } finally { await browser.close(); }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
