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
        assert(ratio >= .71 && ratio <= .73, 'paper layout width is about 72%');
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
        assert(guide.width >= 80 && guide.x+guide.width <= width+1 && guide.y >= 0, 'visible delivery fairy at branch');
        const foot=await page.locator('#resultView').evaluate(el=>Number(el.style.getPropertyValue('--fairy-foot')));
        const branchY=await page.evaluate(()=>document.body.offsetHeight*.2);
        assert(Math.abs(guide.y+(guide.height-guide.width)/2+guide.width*foot-branchY)<2,'fairy feet align with the branch');
        assert(character.y <= paper.y+paper.height+Math.max(16,height*.09), 'character stays between paper and stump');
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal overflow');
        for (const id of ['resultTitle','mainText','loveText','moneyText','itemText','characterLine']) assert(await page.locator('#'+id).evaluate(el => el.scrollWidth <= el.clientWidth+1), result.resultId+' '+id+' fits');
        if (process.env.OMIKUJI_TEST_ARTIFACTS && [0,2,16].includes(data.results.indexOf(result))) {
          fs.mkdirSync(process.env.OMIKUJI_TEST_ARTIFACTS, {recursive:true});
          await page.screenshot({path:path.join(process.env.OMIKUJI_TEST_ARTIFACTS, 'composition-'+width+'-'+result.resultId+'.png')});
        }
      }
      assert.deepEqual(errors, []);
      await context.close();
      console.log(width+'x'+height+': all 25 fortunes / 72% paper / 4-degree tilt / fairy / connected lower-right quip / first-screen fit PASS');
    }
    const {SECOND_QUIPS}=require('../../js/omikuji.js');
    assert.equal(SECOND_QUIPS.length,3);
    for(const [width,height] of [[320,568],[390,844]]) for(let index=0;index<3;index++) {
      const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
      const page=await context.newPage();
      await page.addInitScript(()=>{Math.random=()=>.81;});
      await page.route('**/data/omikuji/ja.json*',route=>route.fulfill({json:{...data,results:[data.results[2]]}}));
      await page.route('**/data/omikuji/config.json*',route=>route.fulfill({json:{...config,drawDelayMs:1}}));
      await page.goto('http://127.0.0.1:'+server.address().port+'/omikuji.html');
      await page.waitForFunction(()=>!document.getElementById('drawButton').disabled);
      await page.evaluate(i=>{Math.random=()=>i/3;},index);
      await page.locator('#drawButton').click();
      await page.locator('#resultView').waitFor({state:'visible'});
      assert.equal(await page.locator('#characterLine').innerText(),data.results[2].quip,'no second quip at initial reveal');
      const firstBubble=await page.locator('.comment-bubble').evaluate(el=>getComputedStyle(el).transform);
      assert(await page.evaluate(()=>getComputedStyle(document.body).backgroundAttachment==='scroll' && getComputedStyle(document.body,'::before').content==='none'),'one scrolling background without a second plate');
      if(width===390 && index===2) {
        await page.emulateMedia({reducedMotion:'no-preference'});
        await page.waitForTimeout(2700);
      }
      await page.evaluate(()=>{window.__quipCharacter=document.getElementById('resultCharacter');});
      const image=await page.locator('#resultCharacter').getAttribute('src');
      if(index===1) {
        await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));window.scrollTo(0,document.documentElement.scrollHeight);});
        await page.waitForTimeout(80);
        assert.equal(await page.locator('#resultView').getAttribute('data-quip-phase'),'first','hidden view must not switch quips');
        await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
      } else await page.locator('#againButton').scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>document.getElementById('resultView').dataset.quipPhase==='second');
      assert.equal(await page.locator('#characterLine').innerText(),SECOND_QUIPS[index]);
      if(width===390 && index===2) {
        assert(await page.locator('.comment-bubble').evaluate(el=>el.getAnimations().length>0),'whole second bubble animates, not just text');
        await page.waitForTimeout(700);
      }
      assert.notEqual(await page.locator('.comment-bubble').evaluate(el=>getComputedStyle(el).transform),firstBubble,'second bubble has a distinct placement and tilt');
      assert.equal(await page.locator('#resultCharacter').count(),1);
      assert.equal(await page.locator('#resultCharacter').getAttribute('src'),image);
      assert(await page.evaluate(()=>__quipCharacter===document.getElementById('resultCharacter')),'same character DOM node retained');
      assert(await page.locator('#characterLine').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
      const bubble=await page.locator('.comment-bubble').boundingBox();
      assert(bubble.x>=0 && bubble.x+bubble.width<=width,'whole bubble remains in viewport');
      const branch=await page.evaluate(()=>{
        const guide=document.getElementById('resultFairy').getBoundingClientRect();
        const foot=Number(document.getElementById('resultView').style.getPropertyValue('--fairy-foot'));
        return {feet:guide.y+(guide.height-guide.width)/2+guide.width*foot,branch:document.body.offsetHeight*.2-scrollY};
      });
      assert(Math.abs(branch.feet-branch.branch)<2,'branch and fairy scroll together');
      if(process.env.OMIKUJI_TEST_ARTIFACTS) await page.screenshot({path:path.join(process.env.OMIKUJI_TEST_ARTIFACTS,'second-quip-'+width+'-'+index+'.png')});
      await page.evaluate(()=>window.scrollTo(0,0));
      await page.waitForTimeout(60);
      assert.equal(await page.locator('#characterLine').innerText(),SECOND_QUIPS[index],'scroll back must not reroll the quip');
      await page.locator('#againButton').click();
      assert.equal(await page.locator('#resultView').getAttribute('data-quip-phase'),'first');
      await page.locator('#drawButton').click();
      await page.locator('#resultView').waitFor({state:'visible'});
      assert.equal(await page.locator('#characterLine').innerText(),data.results[2].quip,'retry restores the first quip');
      await context.close();
      console.log(width+'px second quip '+(index+1)+': scroll-only / same character / three variants / hidden pause / no reroll / retry reset PASS');
    }
  } finally { await browser?.close(); if (server) await new Promise(resolve => server.close(resolve)); }
}
main().catch(error => { console.error(error); process.exitCode=1; });
