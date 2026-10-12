const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '../..');
const data = require('../../data/omikuji/ja.json');
const config = require('../../data/omikuji/config.json');
const {selectFortune} = require('../../js/omikuji.js');
assert.equal(data.results.length,25);
assert.equal(new Set(data.results.map(x=>x.resultId)).size,25);
assert.equal(config.fairies.length,10);
assert(!config.fairies.some(x=>x.id==='elder'));
assert.deepEqual(config.availableLocales,['ja']);
assert.equal(config.peekDurationMs,3000);
assert.equal(config.ui.ja.draw,'おみくじを引く');
for(let i=0;i<25;i++) assert.equal(selectFortune(data.results,()=>i/25).resultId,data.results[i].resultId);
assert.throws(()=>selectFortune([],()=>0));
assert.throws(()=>selectFortune(data.results,()=>1));
for (const prefix of ['','docs/']) for(const asset of [...Object.values(config.assets),...Object.values(config.legacyCharacters),...config.fairies.map(x=>x.image)]) assert(fs.existsSync(path.join(root,prefix,asset)));
for(const file of ['omikuji.html','css/omikuji.css','js/omikuji.js','data/omikuji/config.json','data/omikuji/ja.json']) assert.equal(fs.readFileSync(path.join(root,file),'utf8'),fs.readFileSync(path.join(root,'docs',file),'utf8'));
if(process.env.OMIKUJI_SOURCE) {
  const {extract}=require('../omikuji/extract-wix-data.cjs');
  const original=extract(process.env.OMIKUJI_SOURCE);
  assert.equal(data.sourceSha256,original.sha256);
  assert.deepEqual(data.results.map(({resultId,...value})=>value),original.results,'all original text, ratings, items, quips and character associations preserved');
}
console.log('Data: 25 original fortunes / uniform selection / assets / 10 fairies without Elder / locale / docs mirror PASS');
async function main() {
  let server,browser;
  try {
    let base=process.env.OMIKUJI_TEST_BASE_URL;
    if(!base) {
      server=http.createServer((req,res)=>{
        const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);
        const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
        if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
        res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg'})[path.extname(file)]||'application/octet-stream');
        fs.createReadStream(file).on('error',()=>res.writeHead(404).end()).pipe(res);
      });
      await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
      base='http://127.0.0.1:'+server.address().port;
    }
    browser=await chromium.launch({channel:'msedge',headless:true});
    for(const [width,height,prefix] of [[320,568,''],[360,800,''],[375,667,''],[390,844,''],[412,915,''],[430,932,''],[667,375,''],[390,844,'/docs']]) {
      if(process.env.OMIKUJI_TEST_BASE_URL && prefix)continue;
      const mobile=width<760;
      const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile});
      const page=await context.newPage();
      const errors=[],external=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin) external.push(r.url());});
      await page.addInitScript(()=>{Math.random=()=>0; window.__sounds=[]; const NativeAudio=window.Audio; window.Audio=function(...args){const a=new NativeAudio(...args); __sounds.push(a); return a;};});
      await page.goto(base+prefix+'/omikuji.html',{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>!document.getElementById('drawButton').disabled);
      await page.locator('.tube-image').evaluate(img=>img.decode());
      await page.waitForFunction(()=>window.__sounds[0]?.duration>0);
      if(mobile) {
        await page.waitForFunction(()=>document.getElementById('peekFairy').classList.contains('is-peeking'));
        await page.locator('#peekFairy').evaluate(img=>img.decode());
        await page.waitForFunction(()=>Number(getComputedStyle(document.getElementById('peekFairy')).opacity)===1);
        assert.equal(await page.locator('#peekFairy').getAttribute('data-character-id'),'aco');
      } else assert.equal(await page.locator('#peekFairy').isVisible(),false);
      const tube=await page.locator('.tube-image').boundingBox();
      assert.equal(await page.locator('#drawLabel').innerText(),'おみくじを引く');
      assert.equal(await page.locator('.forest-back').count(),0,'old white return removed');
      assert(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1),'entry needs no scrolling');
      const entryReturn=await page.locator('.entry-return').boundingBox();
      assert(entryReturn.x>width/2 && entryReturn.y>height/2 && entryReturn.x+entryReturn.width<=width);
      assert(entryReturn.x>=tube.x+tube.width || entryReturn.y>=tube.y+tube.height,'return sign must not cover tube');
      if(mobile) {
        const fairy=await page.locator('#peekFairy').boundingBox();
        assert(fairy.x>=0 && fairy.x+fairy.width<=width && fairy.y+fairy.height<=height,'whole fairy stays in viewport');
        assert.equal(await page.locator('#peekFairy').evaluate(el=>getComputedStyle(el).zIndex),'2','fairy sits in front of tube');
        const sign=await page.locator('.draw-label').boundingBox();
        assert(sign.width<=255,'sign is subordinate to tube');
        assert(fairy.width>=80 && (height<480 || fairy.width>=130),'fairy is recognizable');
        if(width===390 && !prefix) {
          await page.waitForTimeout(1500);
          assert(await page.locator('#peekFairy').evaluate(el=>el.classList.contains('is-peeking')),'fairy stays longer than 1.5 seconds');
        }
      }
      assert(tube.y>=60 && tube.y+tube.height<=height);
      assert(tube.x>=0 && tube.x+tube.width<=width);
      if(process.env.OMIKUJI_TEST_ARTIFACTS) {
        fs.mkdirSync(process.env.OMIKUJI_TEST_ARTIFACTS,{recursive:true});
        await page.screenshot({path:path.join(process.env.OMIKUJI_TEST_ARTIFACTS,'entry-'+width+(prefix?'-docs':'')+'.png')});
      }
      await page.locator('#drawSign').evaluate(img=>img.decode());
      assert((await page.locator('#drawSign').getAttribute('src')).endsWith('omikuji_kanban2A.webp'));
      await page.locator(width===360?'#drawSign':'.tube-image').click();
      assert.equal(await page.locator('#drawLabel').textContent(),'おみくじを引く','sign does not switch to explanatory text');
      await page.waitForFunction(()=>!window.__sounds[0].paused);
      assert.equal(await page.locator('#drawButton').isDisabled(),true);
      assert.equal(await page.locator('#peekFairy').evaluate(el=>el.classList.contains('is-peeking')),false);
      // Disabled button blocks rapid double draws.
      await page.locator('#drawButton').evaluate(el=>el.click());
      await page.waitForFunction(()=>!document.getElementById('resultView').hidden);
      assert.equal(await page.locator('.result-comment').evaluate(el=>Number(getComputedStyle(el).opacity)),0,'paper precedes delayed comment');
      assert.equal(await page.locator('#resultTitle').evaluate(el=>Number(getComputedStyle(el).opacity)),0,'paper appears before text');
      assert.equal(await page.locator('.fortune-eyebrow').count(),0,'no extra heading copy');
      const delays=await page.evaluate(()=>['#resultTitle','#mainText','.fortune-details > div:nth-child(1)','.fortune-details > div:nth-child(2)','.fortune-details > div:nth-child(3)','.result-guide','.result-comment'].map(s=>parseFloat(getComputedStyle(document.querySelector(s)).animationDelay)));
      assert.deepEqual(delays,[.3,.5,.8,.95,1.1,1.5,2.1]);
      assert.equal(await page.locator('#resultFairy').getAttribute('src'),await page.locator('#peekFairy').getAttribute('src'),'same fairy delivers the result');
      assert.equal(await page.locator('#resultFairy').getAttribute('data-character-id'),'aco');
      await page.locator('#resultFairy').evaluate(img=>img.decode());
      assert.equal(await page.locator('#resultTitle').innerText(),data.results[0].title);
      assert.equal(await page.locator('#mainText').innerText(),data.results[0].main);
      assert.equal(await page.locator('#loveText').innerText(),data.results[0].love.replace(/★/g,'🍃'));
      assert.equal(await page.locator('#moneyText').innerText(),data.results[0].work.replace(/★/g,'🍃'));
      assert.equal(await page.locator('#itemText').innerText(),data.results[0].item);
      assert.equal(await page.locator('#characterLine').innerText(),data.results[0].quip);
      await page.locator('#resultCharacter').evaluate(img=>img.decode());
      await page.waitForFunction(()=>Number(getComputedStyle(document.querySelector('.fortune-paper')).opacity)===1);
      await page.waitForFunction(()=>Number(getComputedStyle(document.querySelector('.result-comment')).opacity)===1);
      const paper=await page.locator('.fortune-paper').boundingBox();
      const comment=await page.locator('.result-comment').boundingBox();
      const bubble=await page.locator('.comment-bubble').boundingBox();
      const character=await page.locator('#resultCharacter').boundingBox();
      const item=await page.locator('#itemText').boundingBox();
      assert(bubble.y>=item.y+item.height+4,'bubble must not cover result information');
      assert(Math.abs(bubble.x+bubble.width-character.x)<=12,'bubble connects to character without covering it');
      if(height>width) assert(comment.y+comment.height<=height,'result and quip fit first portrait screen');
      const actions=await page.locator('.result-actions').boundingBox();
      assert(actions.y>=comment.y+comment.height,'buttons follow the quip naturally');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      for(const id of ['resultTitle','mainText','loveText','moneyText','itemText','characterLine']) assert(await page.locator('#'+id).evaluate(el=>el.scrollWidth<=el.clientWidth+1),id+' must fit');
      if(process.env.OMIKUJI_TEST_ARTIFACTS) await page.screenshot({path:path.join(process.env.OMIKUJI_TEST_ARTIFACTS,'result-'+width+(prefix?'-docs':'')+'.png'),fullPage:true});
      assert.equal(await page.locator('.result-actions a').getAttribute('href'),'./index.html');
      assert.equal(await page.locator('#againButton').getAttribute('aria-label'),'もう一回引く');
      const again=await page.locator('#againButton').boundingBox();
      const map=await page.locator('#mapButton').boundingBox();
      const back=await page.locator('.forest-art').boundingBox();
      assert(again.y+again.height<=map.y && again.y+again.height<=back.y,'retry is separate upper row');
      assert(map.x+map.width<=back.x && map.height>=48 && back.height>=48);
      for(const selector of ['#againButton img','#mapButton img','.forest-art img']) await page.locator(selector).evaluate(img=>img.decode());
      await page.locator('#mapButton').click();
      await page.waitForFunction(()=>document.getElementById('mapDestinations').children.length===7);
      await page.locator('.map-overview').evaluate(img=>img.decode());
      assert.equal(await page.locator('#omikujiMap').evaluate(el=>el.open),true);
      assert.equal(await page.locator('#mapDestinations a').nth(2).getAttribute('href'),base+prefix+'/omikuji.html');
      assert.equal(await page.evaluate(()=>__sounds.every(a=>a.paused)),true);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#omikujiMap').evaluate(el=>el.open),false);
      await page.locator('#mapButton').click();
      await page.locator('#closeMap').click();
      assert.equal(await page.locator('#mapDestinations a').count(),7,'no duplicate links after reopening');
      if(process.env.OMIKUJI_TEST_ARTIFACTS) await page.screenshot({path:path.join(process.env.OMIKUJI_TEST_ARTIFACTS,'actions-'+width+(prefix?'-docs':'')+'.png')});
      await page.locator('#againButton').click();
      assert.equal(await page.locator('#drawView').isVisible(),true);
      if(mobile) assert.equal(await page.locator('#peekFairy').getAttribute('data-character-id'),'berry','next visit/entry changes fairy');
      // Keep the draw from completing while hidden, without replaying audio.
      await page.locator('#drawButton').click();
      await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true}); document.dispatchEvent(new Event('visibilitychange'));});
      assert.equal(await page.evaluate(()=>__sounds.every(a=>a.paused)),true);
      await page.waitForTimeout(2200);
      assert.equal(await page.locator('#resultView').isVisible(),false);
      await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
      await page.waitForFunction(()=>!document.getElementById('resultView').hidden);
      assert.deepEqual(errors,[]);assert.deepEqual(external,[],'runtime must be independent of Wix');
      console.log((prefix||'root')+' '+width+'x'+height+': entry / fairy / shake / sound state / preserved result / retry / hidden pause / local assets PASS');
      await context.close();
    }
    for(const [width,height] of [[320,568],[390,844],[418,486]]) {
      const coverage=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
      const screen=await coverage.newPage();
      let selected=data.results[0];
      await screen.route('**/data/omikuji/ja.json*',route=>route.fulfill({json:{...data,results:[selected]}}));
      await screen.route('**/data/omikuji/config.json*',route=>route.fulfill({json:{...config,drawDelayMs:1}}));
      for(const result of data.results) {
        selected=result;
        await screen.goto(base+'/omikuji.html');
        await screen.waitForFunction(()=>!document.getElementById('drawButton').disabled);
        const fairy=await screen.locator('#peekFairy').getAttribute('src');
        await screen.locator('#drawButton').click();
        await screen.waitForFunction(()=>!document.getElementById('resultView').hidden);
        assert.equal(await screen.locator('#resultFairy').getAttribute('src'),fairy);
        const comment=await screen.locator('.result-comment').boundingBox();
        assert(comment.y+comment.height<=height,result.resultId+' fits first screen at '+width);
        for(const id of ['resultTitle','mainText','loveText','moneyText','itemText','characterLine']) assert(await screen.locator('#'+id).evaluate(el=>el.scrollWidth<=el.clientWidth+1),result.resultId+' '+id+' fits');
      }
      await coverage.close();
      console.log('All 25 fortunes / same delivering fairy / first screen / text fits at '+width+' PASS');
    }
    const context=await browser.newContext({viewport:{width:320,height:568},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
    const page=await context.newPage();
    await page.route('**/data/omikuji/ja.json*',route=>route.fulfill({json:{...data,results:[{...data.results[0],main:'<script>window.__unsafe=1</script>',quip:'<img src=x onerror=window.__unsafe=2>'}]}}));
    await page.goto(base+'/omikuji.html?lang=en');
    await page.waitForFunction(()=>!document.getElementById('drawButton').disabled);
    assert.equal(await page.locator('html').getAttribute('lang'),'ja','missing EN data falls back without invented translations');
    await page.locator('#drawButton').click();
    await page.waitForFunction(()=>!document.getElementById('resultView').hidden);
    assert.equal(await page.evaluate(()=>window.__unsafe),undefined);
    assert.equal(await page.locator('#mainText script').count(),0);
    assert((await page.locator('#mainText').innerText()).includes('<script>'));
    await context.close();
    console.log('Safe text / locale fallback / reduced motion PASS');
    const failed=await browser.newContext({viewport:{width:320,height:568}});
    const failedPage=await failed.newPage();
    await failedPage.route('**/data/omikuji/ja.json*',route=>route.fulfill({status:503,body:'unavailable'}));
    await failedPage.goto(base+'/omikuji.html');
    await failedPage.locator('#retryLoad').waitFor({state:'visible'});
    assert.equal(await failedPage.locator('#drawButton').isDisabled(),true);
    await failedPage.unroute('**/data/omikuji/ja.json*');
    await failedPage.locator('#retryLoad').click();
    await failedPage.waitForFunction(()=>!document.getElementById('drawButton').disabled);
    await failed.close();
    console.log('Data loading failure / retry recovery PASS');
    const navigation=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const navPage=await navigation.newPage();
    await navPage.goto(base+'/omikuji.html');
    await navPage.waitForFunction(()=>!document.getElementById('drawButton').disabled);
    await navPage.locator('#drawButton').click();
    await navPage.waitForFunction(()=>!document.getElementById('resultView').hidden);
    await navPage.route('**/index.html',route=>route.fulfill({status:503,body:'unavailable'}));
    await navPage.locator('#mapButton').click();
    await navPage.waitForFunction(()=>document.getElementById('mapStatus').textContent.includes('読み込めません'));
    await navPage.locator('#closeMap').click();
    await navPage.unroute('**/index.html');
    await navPage.locator('#mapButton').click();
    await navPage.waitForFunction(()=>document.getElementById('mapDestinations').children.length===7);
    const teaUrl=base+'/tea_room.html';
    await navPage.route(teaUrl,route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Navigation check</title>'}));
    await navPage.locator('#mapDestinations a').nth(5).click();
    await navPage.waitForURL(teaUrl);
    await navPage.goto(base+'/omikuji.html');
    await navPage.waitForFunction(()=>!document.getElementById('drawButton').disabled);
    await navPage.route(base+'/index.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Forest return check</title>'}));
    await navPage.locator('.entry-return').click();
    await navPage.waitForURL(base+'/index.html');
    await navigation.close();
    console.log('Map loading failure / recovery / actual corner navigation / Forest return PASS');
  } finally {await browser?.close();if(server) await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
