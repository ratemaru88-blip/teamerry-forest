const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../..');
const endpoint = 'https://script.google.com/macros/s/TEST_SUBMISSIONS/exec';
const header = ['日時','名前','本文','確認状態','requestId','fingerprint'];
function backend() {
  const rows = Object.fromEntries(['ミュージカル感想','ボトルメール','願い星'].map(n=>[n,[header.slice()]]));
  const cache = new Map(); let locked = false;
  function sheet(name) {
    const values = rows[name];
    return {
      getLastRow:()=>values.length, getMaxRows:()=>1000,
      getRange:(row,col,rc=1,cc=1)=>({
        getValues:()=>[values[0].slice(0,4)],
        getValue:()=>values[row-1]?.[col-1],
        setValues:(matrix)=>{ assert(locked); assert.equal(matrix.length,1); assert.equal(cc,6); values[row-1]=matrix[0]; },
        createTextFinder:(id)=>({matchEntireCell:()=>({findNext:()=>{
          const i=values.findIndex(r=>r[4]===id); return i<0?null:{getRow:()=>i+1};
        }})}),
      }),
    };
  }
  const context = vm.createContext({
    console:{error:()=>{}}, Date, JSON,
    PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'TEST_BOOK'})},
    LockService:{getScriptLock:()=>({tryLock:()=>{assert(!locked);locked=true;return true;},hasLock:()=>locked,releaseLock:()=>{locked=false;}})},
    CacheService:{getScriptCache:()=>({get:k=>cache.get(k),put:(k,v)=>cache.set(k,v)})},
    SpreadsheetApp:{openById:()=>({getSheetByName:sheet}),flush:()=>{}},
    Utilities:{DigestAlgorithm:{SHA_256:'sha256'},computeDigest:(_,s)=>Array.from(crypto.createHash('sha256').update(s).digest())},
    ContentService:{MimeType:{JSON:'json'},createTextOutput:s=>({setMimeType:()=>JSON.parse(s)})},
  });
  vm.runInContext(fs.readFileSync(path.join(root,'tools/submissions-gas/Code.gs'),'utf8'),context);
  return {context,rows,cache,post:p=>context.doPost({postData:{contents:JSON.stringify(p)}})};
}
function payload(type,extra={}) {return {type,name:'',message:'TEST 感想',workId:type==='musical_feedback'?'boku-no-takaramono':'',requestId:crypto.randomUUID(),clientId:crypto.randomUUID(),...extra};}
async function main() {
  const api=backend();
  for (const [type,name] of Object.entries({musical_feedback:'ミュージカル感想',bottle_mail:'ボトルメール',wish_star:'願い星'})) {
    const p=payload(type,{message:'あ'.repeat(300)});
    assert.equal(api.post(p).ok,true); assert.equal(api.rows[name].length,2);
    assert.equal(api.rows[name][1][2].length,300); assert.equal(api.rows[name][1][3],'未確認');
    assert(api.rows[name][1][0] instanceof Date);
    assert.equal(api.post(p).duplicate,true); assert.equal(api.rows[name].length,2);
    assert.equal(api.post({...p,requestId:crypto.randomUUID()}).code,'rate_limited');
    assert.equal(api.post({...p,message:'changed'}).code,'id_conflict');
    for (const message of ['あ'.repeat(301),'','  ','<script>alert(1)</script>']) assert.equal(api.post(payload(type,{message})).ok,false);
    assert.equal(api.post(payload(type,{name:'名前あり'})).ok,true);
  }
  assert.equal(api.post(payload('__proto__')).code,'invalid_type');
  assert.equal(api.post(payload('musical_feedback',{workId:'invalid'})).code,'invalid_work');
  assert.equal(api.post(payload('bottle_mail',{requestId:[crypto.randomUUID()]})).code,'invalid_id');
  const formula=payload('bottle_mail',{name:'=1+1',message:'=IMPORTXML("https://example.invalid","//x")'});
  assert.equal(api.post(formula).ok,true); assert(api.rows['ボトルメール'].at(-1)[2].startsWith("'="));
  assert.equal(api.context.doPost({postData:{contents:'not json'}}).ok,false);
  console.log('GAS: three routes, anonymous/named, 300/301, empty, HTML, type/work, literal formulas, dedupe, throttle, lock PASS');
  const server=http.createServer((req,res)=>{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path.resolve(root,'.'+pathname);
    if (!file.startsWith(root+path.sep)) {res.writeHead(403);return res.end();}
    const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.tbalance':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.webm':'video/webm','.tsv':'text/plain'};
    fs.stat(file,(error,stat)=>{if(error||!stat.isFile()){res.writeHead(404);return res.end();}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({channel:'chrome',headless:true});
  fs.mkdirSync(path.join(root,'document/submissions-test'),{recursive:true});
  try {
    for (const prefix of ['', '/docs']) for (const width of [1440,390]) {
      const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
      const page=await context.newPage(); const pageErrors=[];
      page.on('pageerror',e=>pageErrors.push(e.message));
      await page.route('**/js/submission-config.js*',r=>r.fulfill({contentType:'text/javascript',body:`window.TeaMerrySubmissionConfig={endpoint:${JSON.stringify(endpoint)},timeoutMs:1000};`}));
      let fail=false, requests=[];
      await page.route(endpoint,async r=>{
        const p=r.request().postDataJSON(); requests.push(p);
        await r.fulfill({contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify(fail?{ok:false,requestId:p.requestId,code:'save_failed'}:{ok:true,requestId:p.requestId})});
      });
      await page.goto(base+prefix+'/musical/boku-no-takaramono/pair-preview.html');
      await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
      const hitId = width <= 720 ? 'lyr_81d9c73753d44c63' : 'lyr_db4f6f6480b84ae3';
      const hit = page.locator(`[data-layer-id="${hitId}"]`);
      assert.equal(await page.locator('#musical-feedback').evaluate(el=>el.open),false);
      const native = JSON.parse(fs.readFileSync(path.join(root, prefix ? 'docs/musical/boku-no-takaramono/feedback-flow.tbalance' : 'musical/boku-no-takaramono/feedback-flow.tbalance'),'utf8'));
      const sourceLayer = native.page.layers.find(layer=>layer.id===hitId);
      const key = width <= 720 ? 'mobile' : 'desktop';
      assert.equal(native.page[key].width,key==='mobile'?1080:1920);
      assert.equal(native.page[key].screenHeight,key==='mobile'?1920:1080);
      const layout = await hit.evaluate(el=>({left:parseFloat(el.style.left),top:parseFloat(el.style.top),width:parseFloat(el.style.width),height:parseFloat(el.style.height)}));
      for (const [a,b] of [['left','x'],['top','y'],['width','width'],['height','height']]) assert.equal(layout[a],sourceLayer[key][b]);
      await hit.click();
      assert.equal(await page.locator('#musical-feedback').evaluate(el=>el.open),true);
      const dialogBox = await page.locator('#musical-feedback').boundingBox();
      assert(dialogBox.x>=0&&dialogBox.y>=0&&dialogBox.x+dialogBox.width<=width);
      const invalid = await page.evaluate(async () => {
        const rejected=[];
        for (const [type,message] of [['musical_feedback','あ'.repeat(301)],['musical_feedback',''],['musical_feedback','  '],['unknown','TEST']]) {
          try {await TeaMerrySubmissions.send(type,'',message,'boku-no-takaramono');rejected.push(false);}
          catch (_) {rejected.push(true);}
        }
        return rejected;
      });
      assert.deepEqual(invalid,[true,true,true,true]); assert.equal(requests.length,0);
      const input=page.locator('#tm-feedback-message');
      await input.fill('あ'.repeat(300)); await page.locator('button[type=submit]').click();
      await page.waitForFunction(()=>document.querySelector('.tm-submission-status').textContent.includes('感想が届きました'));
      assert.equal(requests.at(-1).type,'musical_feedback'); assert.equal(requests.at(-1).name,'');
      assert.equal(await input.inputValue(),'');
      await page.locator('#tm-feedback-name').fill('TEST 名前');
      await input.fill('失敗テスト'); fail=true;
      await page.locator('button[type=submit]').click();
      await page.waitForFunction(()=>document.querySelector('.tm-submission-status').textContent.includes('保存を確認できません'));
      assert.equal(await input.inputValue(),'失敗テスト');
      const retryId=requests.at(-1).requestId; fail=false;
      await page.locator('button[type=submit]').click();
      await page.waitForFunction(()=>document.querySelector('.tm-submission-status').textContent.includes('感想が届きました'));
      assert.equal(requests.at(-1).requestId,retryId);
      await page.locator('button[aria-label="感想フォームを閉じる"]').click();
      await hit.click();
      assert.equal(await page.locator('#tm-feedback-name').inputValue(),'TEST 名前');
      await page.setViewportSize({width,height:360});
      const compressed = await page.locator('#musical-feedback').boundingBox();
      assert(compressed.y>=0&&compressed.y+compressed.height<=360);
      await page.locator('#tm-feedback-message').fill('あ'.repeat(300));
      assert.equal(await page.locator('#tm-feedback-message').evaluate(el=>getComputedStyle(el).overflowY),'auto');
      await page.setViewportSize({width,height:900});
      await page.locator('.tm-feedback').screenshot({path:path.join(root,`document/submissions-test/musical-${prefix?'docs':'root'}-${width}.png`)});
      await page.goto(base+prefix+'/observatory.html?time=day');
      await page.waitForFunction(()=>window.TeaMerryObservatoryDriftBottle);
      for (const [type,inputId,open,insert,confirm,key] of [
        ['bottle_mail','bottleMessageInput','#bottleMailButton','[data-bottle-flush]','[data-bottle-public="false"]','teaMerryBottleMessages'],
        ['wish_star','wishMessageInput','#wishStarButton','[data-wish-lantern]','[data-wish-public="false"]','teaMerryWishMessages'],
      ]) {
        if (type === 'wish_star') {
          await page.goto(base+prefix+'/observatory.html?time=night');
          await page.waitForFunction(()=>window.TeaMerryObservatoryDriftBottle);
        }
        await page.locator(open).click({force:true});
        const field=page.locator('#'+inputId);
        assert.equal(await field.getAttribute('maxlength'),'300');
        await field.fill('あ'.repeat(300)); await page.locator(insert).click({force:true});
        fail=true; await page.locator(confirm).click({force:true});
        await page.waitForFunction(()=>Array.from(document.querySelectorAll('.tm-submission-status')).some(n=>n.textContent.includes('保存を確認できません')));
        assert.equal(await field.inputValue(),'あ'.repeat(300));
        assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),null);
        await page.locator('.is-active .tm-submission-status').screenshot({path:path.join(root,`document/submissions-test/${type}-error-${prefix?'docs':'root'}-${width}.png`)});
        fail=false; await page.locator(confirm).click({force:true});
        await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)||'[]').length===1,key);
        assert.equal(requests.at(-1).type,type);
        const category = type==='bottle_mail' ? 'ボトルメールを出したあと' : '願い星を飛ばしたあと';
        const reactions = JSON.parse(fs.readFileSync(path.join(root,prefix?'docs/data/export/lill_action_reactions.json':'data/export/lill_action_reactions.json'),'utf8')).reactions[category];
        await page.waitForFunction(sets=>sets.some(set=>set.lines[0]===document.querySelector('#fairyBalloon').textContent),reactions,{timeout:20000});
        const first = await page.locator('#fairyBalloon').innerText();
        const selected = reactions.find(set=>set.lines[0]===first);
        for (const index of [1,2]) {
          await page.waitForTimeout(220);
          await page.locator('#fairyBalloon').click();
          await page.waitForFunction(text=>document.querySelector('#fairyBalloon').textContent===text,selected.lines[index]);
        }
        await page.waitForTimeout(220);
        await page.locator('#fairyBalloon').click();
        await page.waitForFunction(text=>document.querySelector('#fairyBalloon').textContent!==text,selected.lines[2]);
        assert.equal(await page.locator('#fairyBalloon').evaluate(el=>el.classList.contains('is-reaction-active')),false);
        await page.screenshot({path:path.join(root,`document/submissions-test/${type}-${prefix?'docs':'root'}-${width}.png`)});
        await page.evaluate(()=>document.querySelectorAll('[data-observatory-back]').forEach(b=>b.click()));
      }
      assert.deepEqual(pageErrors,[]);
      console.log(`${prefix||'root'} ${width}px: three forms, success, failure retention/no local success, retry ID, 300, counter, no page errors PASS`);
      await context.close();
    }
  } finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
