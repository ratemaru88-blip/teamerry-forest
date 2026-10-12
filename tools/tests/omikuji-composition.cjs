const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '../..');
const data = require('../../data/omikuji/ja.json');
const config = require('../../data/omikuji/config.json');
async function main() {
  let server, browser;
  try {
    server = http.createServer((req, res) => {
      const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://local').pathname));
      if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
      res.setHeader('Content-Type', ({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.webp':'image/webp','.png':'image/png','.mp3':'audio/mpeg'})[path.extname(file)] || 'application/octet-stream');
      fs.createReadStream(file).on('error', () => res.writeHead(404).end()).pipe(res);
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    browser = await chromium.launch({channel:'msedge', headless:true});
    for (const [width, height] of [[320,568],[360,800],[375,667],[390,844],[412,915],[430,932],[418,486]]) {
      const context = await browser.newContext({viewport:{width,height}, reducedMotion:'reduce'});
      const page = await context.newPage();
      let selected = data.results[0];
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.addInitScript(() => { Math.random = () => .81; });
      await page.route('**/data/omikuji/ja.json*', route => route.fulfill({json:{...data,results:[selected]}}));
      await page.route('**/data/omikuji/config.json*', route => route.fulfill({json:{...config,drawDelayMs:1}}));
      for (const result of data.results) {
        selected = result;
        await page.goto('http://127.0.0.1:' + server.address().port + '/omikuji.html');
        await page.waitForFunction(() => !document.getElementById('drawButton').disabled);
        const fairy = await page.locator('#peekFairy').getAttribute('src');
        await page.locator('#drawButton').click();
        await page.locator('#resultView').waitFor({state:'visible'});
        await page.locator('#resultFairy').evaluate(img => img.decode());
        await page.locator('#resultCharacter').evaluate(img => img.decode());
        assert.equal(await page.locator('#resultFairy').getAttribute('src'), fairy);
        assert.equal(await page.locator('#resultTitle').innerText(), result.title);
        const ratio = await page.locator('.result-main').evaluate(el => el.offsetWidth / innerWidth);
        assert(ratio >= .78 && ratio <= .82, 'paper layout width is about 80%');
        const angle = await page.locator('.fortune-paper').evaluate(el => { const m = new DOMMatrix(getComputedStyle(el).transform); return Math.abs(Math.atan2(m.b,m.a)*180/Math.PI); });
        assert(angle >= 3 && angle <= 5, 'paper is visibly angled');
        const paper = await page.locator('.fortune-paper').boundingBox();
        const character = await page.locator('#resultCharacter').boundingBox();
        const bubble = await page.locator('.comment-bubble').boundingBox();
        const guide = await page.locator('#resultFairy').boundingBox();
        assert(character.y+character.height <= height, result.resultId + ' character fits at ' + width);
        assert(bubble.y+bubble.height <= height, result.resultId + ' bubble fits at ' + width);
        assert(character.x > width*.55 && character.width >= 118, 'large quip character at lower right');
        assert(bubble.x < character.x && bubble.y+bubble.height/2 < character.y+character.height/2, 'bubble is left and above the character');
        assert(bubble.x+bubble.width >= character.x-12 && bubble.x+bubble.width <= character.x+12, 'tail connects bubble to character');
        assert(guide.width >= 110 && guide.x+guide.width <= width+1 && guide.y >= 0, 'visible delivery fairy at paper corner');
        assert(character.y <= paper.y+paper.height+12, 'character is attached to lower-right paper area');
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal overflow');
        for (const id of ['resultTitle','mainText','loveText','moneyText','itemText','characterLine']) assert(await page.locator('#'+id).evaluate(el => el.scrollWidth <= el.clientWidth+1), result.resultId+' '+id+' fits');
        if (process.env.OMIKUJI_TEST_ARTIFACTS && [0,2,16].includes(data.results.indexOf(result))) {
          fs.mkdirSync(process.env.OMIKUJI_TEST_ARTIFACTS, {recursive:true});
          await page.screenshot({path:path.join(process.env.OMIKUJI_TEST_ARTIFACTS, 'composition-'+width+'-'+result.resultId+'.png')});
        }
      }
      assert.deepEqual(errors, []);
      await context.close();
      console.log(width+'x'+height+': all 25 fortunes / 80% paper / 4-degree tilt / fairy / connected lower-right quip / first-screen fit PASS');
    }
  } finally { await browser?.close(); if (server) await new Promise(resolve => server.close(resolve)); }
}
main().catch(error => { console.error(error); process.exitCode=1; });
