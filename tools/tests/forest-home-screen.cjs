const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const base = process.env.FOREST_TEST_BASE_URL || 'http://127.0.0.1:8841';
const android = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36';
const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1';
async function main() {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  try {
    for (const [name,settings] of [
      ['first',{first:true}], ['android',{}], ['iphone',{ios:true,width:320,height:568}],
      ['dismissed',{dismissed:true}], ['expired',{expired:true}], ['installed',{installed:true}],
      ['standalone',{standalone:true}], ['desktop',{pc:true}], ['desktop narrow',{pc:true,width:390}],
      ['dialog',{dialog:true}], ['moving',{moving:true}], ['docs',{prefix:'/docs'}],
      ['storage blocked',{storage:true}]
    ]) {
      const width=settings.width || (settings.pc?1366:390),height=settings.height || 844;
      const context=await browser.newContext({viewport:{width,height},isMobile:!settings.pc,hasTouch:!settings.pc,
        ...(!settings.pc?{userAgent:settings.ios?iphone:android}:{})});
      await context.addInitScript(s=>{
        if(!s.first) localStorage.setItem('teaMerryLastVisitAt',String(Date.now()-86400000));
        if(!s.first) {localStorage.setItem('teaMerryNameDone','true');localStorage.setItem('teaMerryDisplayName','おさんぽさん');}
        if(s.dismissed||s.expired) localStorage.setItem('teaMerryHomeScreenDismissedAt',String(Date.now()-(s.expired?8*86400000:1000)));
        if(s.installed) localStorage.setItem('teaMerryHomeScreenAdded','true');
        if(s.standalone) Object.defineProperty(navigator,'standalone',{value:true});
        if(s.storage) {Storage.prototype.getItem=()=>{throw new Error('blocked')};Storage.prototype.setItem=()=>{throw new Error('blocked')};}
      },settings);
      const page=await context.newPage(),errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.clock.install();
      await page.goto(base+(settings.prefix||'')+'/index.html');
      if(settings.first||settings.storage) await page.locator('#skipForestName').click();
      await page.waitForFunction(()=>window.TeaMerryMobileGuide.snapshot());
      await page.clock.runFor(2500);
      const bubble=page.locator('.mobile-walker__bubble');
      assert.equal(await page.locator('.forest-home-actions').count(),0,'never interrupts welcome');
      if(settings.dialog) await page.locator('.forest-map-button').click();
      if(settings.moving) {await page.locator('.forest-navigation-stick').focus();await page.keyboard.down('ArrowLeft');}
      await page.clock.runFor(10000);
      assert.equal(await page.locator('.forest-home-actions').count(),0,'no offer before 15 seconds');
      await page.clock.runFor(8000);
      const suppressed=settings.first||settings.storage||settings.pc||settings.dismissed||settings.installed||settings.standalone||settings.dialog||settings.moving;
      assert.equal(await page.locator('.forest-home-actions').count(),suppressed?0:1,name);
      if(settings.dialog) {await page.locator('.forest-map-close').click();await page.clock.runFor(7000);}
      if(settings.moving) {await page.keyboard.up('ArrowLeft');await page.clock.runFor(7000);}
      if(!suppressed||settings.dialog||settings.moving) {
        assert((await bubble.innerText()).includes('また来るとき用に、この森のマーク、携帯のホーム画面に置いておく？'));
        for(const button of await page.locator('.forest-home-actions button').all()) {
          const r=await button.boundingBox();
          assert(r.x>=0&&r.y>=0&&r.x+r.width<=width&&r.y+r.height<=height,'button fits screen');
          assert.equal(await button.evaluate(el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===el;}),true);
        }
        if(name==='android') {
          await page.evaluate(()=>{
            window.promptCalls=0; const event=new Event('beforeinstallprompt',{cancelable:true});
            event.prompt=async()=>{window.promptCalls++;window.promptGesture=navigator.userActivation.isActive;};
            event.userChoice=Promise.resolve({outcome:'accepted'});
            window.dispatchEvent(event); window.eventPrevented=event.defaultPrevented;
          });
          assert.equal(await page.evaluate(()=>window.promptCalls),0,'no automatic prompt');
          await page.getByRole('button',{name:'置いておく',exact:true}).click();
          assert.equal(await page.evaluate(()=>window.promptCalls),1);
          assert(await page.evaluate(()=>window.promptGesture&&window.eventPrevented));
          await page.evaluate(()=>window.dispatchEvent(new Event('appinstalled')));
          assert.equal(await page.evaluate(()=>localStorage.getItem('teaMerryHomeScreenAdded')),'true');
        } else if(name==='iphone'||name==='expired') {
          await page.screenshot({path:'C:/Users/kakao/_home-screen-'+name+'.png'});
          await page.getByRole('button',{name:'置いておく',exact:true}).click();
          assert((await bubble.innerText()).includes(settings.ios?'Safariの共有ボタン':'ブラウザのメニュー'));
          await page.getByRole('button',{name:'わかった',exact:true}).click();
        } else {
          await page.getByRole('button',{name:'今はいい',exact:true}).click();
          assert(Number(await page.evaluate(()=>localStorage.getItem('teaMerryHomeScreenDismissedAt')))>0);
        }
        await page.clock.runFor(60000);
        assert.equal(await page.locator('.forest-home-actions').count(),0,'one offer per visit');
      }
      assert.deepEqual(errors,[]);
      console.log(name+': PASS');await context.close();
    }
  } finally {await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
