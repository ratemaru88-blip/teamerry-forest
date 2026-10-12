const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require('playwright');
const root = path.resolve(__dirname,'../..');
async function main() {
  let server, browser;
  try {
    let base=process.env.OMIKUJI_TEST_BASE_URL;
    if(!base) {
      server=http.createServer((req,res)=>{
        const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));
        if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
        res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.mp3':'audio/mpeg','.webm':'video/webm'})[path.extname(file)]||'application/octet-stream');
        fs.createReadStream(file).on('error',()=>res.writeHead(404).end()).pipe(res);
      });
      await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
      base='http://127.0.0.1:'+server.address().port;
    }
    browser=await chromium.launch({channel:'msedge',headless:true});
    for(const [width,height,prefix] of [[1366,900,''],[1024,600,''],[1920,1080,''],[1366,900,'/docs']]) {
      if(process.env.OMIKUJI_TEST_BASE_URL && prefix)continue;
      const context=await browser.newContext({viewport:{width,height}});
      await context.addInitScript(()=>{
        window.__audio=[];
        const NativeAudio=window.Audio;
        window.Audio=function(...args) {
          const a=new NativeAudio(...args);
          const pause=a.pause.bind(a);
          a.pause=()=>{pause();if(parent!==window)parent.__omikujiPaused=a.paused;};
          __audio.push(a);
          return a;
        };
      });
      const page=await context.newPage(),errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(base+prefix+'/index.html');
      await page.locator('#skipForestName').click();
      await page.waitForFunction(()=>[...document.querySelectorAll('video.forest-bg')].some(v=>v.classList.contains('is-visible') && v.readyState>=2));
      const snapshot=await page.evaluate(()=>window.TeaMerryForestNavigation.snapshot());
      await page.locator('.forest-portal--shrine').evaluate(el=>el.click());
      await page.locator('.forest-omikuji-dialog').waitFor({state:'visible'});
      await page.waitForFunction(()=>[...document.querySelectorAll('iframe.forest-omikuji-frame')].some(el=>el.contentWindow?.location.href.includes('omikuji.html')));
      const windowBox=await page.locator('.forest-omikuji-dialog').boundingBox();
      assert(windowBox.width>=360 && windowBox.width<=440 && windowBox.height<=height*.9);
      assert(windowBox.x>0 && windowBox.y>0);
      assert(page.url().endsWith('/index.html'),'Forest page is retained');
      let app=page.frames().find(f=>f.url().includes('omikuji.html'));
      await app.waitForFunction(()=>!document.getElementById('drawButton').disabled);
      await app.waitForFunction(()=>getComputedStyle(document.getElementById('peekFairy')).opacity==='1');
      await app.locator('#peekFairy').evaluate(img=>img.decode());
      if(process.env.OMIKUJI_TEST_ARTIFACTS) {
        fs.mkdirSync(process.env.OMIKUJI_TEST_ARTIFACTS,{recursive:true});
        await page.screenshot({path:path.join(process.env.OMIKUJI_TEST_ARTIFACTS,'pc-overlay-'+width+(prefix?'-docs':'')+'.png')});
      }
      const entryFairy=await app.locator('#peekFairy').getAttribute('src');
      await app.locator('#drawSign').click();
      await app.waitForFunction(()=>!document.getElementById('resultView').hidden);
      await app.waitForFunction(()=>getComputedStyle(document.querySelector('.result-comment')).opacity==='1');
      assert.equal(await app.locator('#resultFairy').getAttribute('src'),entryFairy);
      const comment=await app.locator('.result-comment').boundingBox();
      assert(comment.y+comment.height<=await app.evaluate(()=>innerHeight),'result and quip fit the portrait window');
      if(process.env.OMIKUJI_TEST_ARTIFACTS) await page.screenshot({path:path.join(process.env.OMIKUJI_TEST_ARTIFACTS,'pc-result-'+width+(prefix?'-docs':'')+'.png')});
      await app.locator('#mapButton').click();
      await app.waitForFunction(()=>document.getElementById('mapDestinations').children.length===7);
      await app.locator('#closeMap').click();
      await app.locator('#againButton').click();
      await app.locator('.tube-image').click();
      await app.waitForFunction(()=>__audio.some(a=>!a.paused));
      const forestAudio=await page.evaluate(()=>__audio.filter(a=>a.loop).map(a=>({src:a.src,paused:a.paused})));
      await page.evaluate(()=>window.__omikujiPaused=null);
      await app.locator('.entry-return').click();
      await page.waitForFunction(()=>!document.querySelector('.forest-omikuji-frame'));
      assert.equal(await page.locator('.forest-omikuji-frame').count(),0);
      assert.equal(await page.evaluate(()=>window.__omikujiPaused),true,'dedicated sound stopped before frame removal');
      assert.deepEqual(await page.evaluate(()=>window.TeaMerryForestNavigation.snapshot()),snapshot);
      assert.deepEqual(await page.evaluate(()=>__audio.filter(a=>a.loop).map(a=>({src:a.src,paused:a.paused}))),forestAudio);
      for(const mode of ['close','escape']) {
        await page.locator('.forest-portal--shrine').evaluate(el=>el.click());
        await page.locator('.forest-omikuji-dialog').waitFor({state:'visible'});
        await page.waitForFunction(()=>[...document.querySelectorAll('iframe.forest-omikuji-frame')].some(el=>el.contentWindow?.location.href.includes('omikuji.html')));
        app=page.frames().find(f=>f.url().includes('omikuji.html'));
        await app.waitForFunction(()=>!document.getElementById('drawButton').disabled);
        await app.locator('.tube-image').click();
        if(mode==='close')await page.locator('.forest-omikuji-close').click();
        else await app.locator('#drawButton').press('Escape');
        await page.waitForFunction(()=>!document.querySelector('.forest-omikuji-dialog').open);
        assert.equal(await page.locator('.forest-omikuji-frame').count(),0);
      }
      assert.deepEqual(errors,[]);
      await context.close();
      console.log((prefix||'root')+' '+width+'x'+height+': Forest preserved / portrait iframe / result / map / return / repeat close / Escape PASS');
    }
    const direct=await browser.newPage({viewport:{width:1366,height:900}});
    await direct.goto(base+'/omikuji.html');
    await direct.waitForURL('**/index.html?omikuji=1');
    await direct.locator('#skipForestName').click();
    await direct.locator('.forest-omikuji-dialog').waitFor({state:'visible'});
    await direct.locator('.forest-omikuji-close').click();
    assert.equal(new URL(direct.url()).searchParams.has('omikuji'),false);
    await direct.close();
    console.log('Desktop direct link / welcome dialog / close query cleanup PASS');
  } finally {await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
