const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const base = process.env.FOREST_TEST_BASE_URL || 'http://127.0.0.1:8841';
async function main() {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  try {
    for (const [width,height] of [[320,568],[390,844],[1366,900]]) {
      const context = await browser.newContext({viewport:{width,height}});
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.clock.install();
      await page.goto(base+'/index.html');
      await page.locator('#skipForestName').waitFor({state:'visible'});
      for (const selector of ['#forestNameInput','#saveForestName','#skipForestName']) {
        const box = await page.locator(selector).boundingBox();
        assert(box.y >= 0 && box.y+box.height <= height,selector+' fits first viewport');
      }
      assert.equal(await page.locator('#skipForestName').innerText(),'おさんぽさんで進む');
      await page.locator('#skipForestName').click();
      await page.waitForFunction(()=>window.TeaMerryMobileGuide.snapshot());
      await page.clock.runFor(2500);
      const actor = width<760 ? '.mobile-walker' : '.mint-guide';
      const bubble = width<760 ? '.mobile-walker__bubble' : '.mint-guide__bubble';
      assert(await page.locator(actor).evaluate(el=>el.classList.contains('has-speech')),'welcome visible');
      const welcome = await page.locator(bubble).innerText();
      assert(welcome.includes('おさんぽさん、こんにちは。') && welcome.includes('いつでも無料'));
      assert.equal(await page.evaluate(()=>window.TeaMerryForestGuideSpeech.show('割り込み',2000)),false);
      assert.equal(await page.locator(bubble).innerText(),welcome);
      await page.clock.fastForward(90000);
      await page.clock.runFor(1000);
      assert.equal(await page.evaluate(()=>window.TeaMerryMobileGuide.snapshot().count),2,'idle conversation returns on both platforms');
      assert.notEqual(await page.locator(bubble).innerText(),welcome);
      if(width>=760) {
        for(let i=0;i<8;i++) {
          const box=await page.locator('.forest-portal--shrine').boundingBox();
          if(box.x>=0 && box.x+box.width<width && box.y>=0 && box.y+box.height<height) break;
          const dx=Math.max(-450,Math.min(450,width/2-box.x-box.width/2));
          const dy=Math.max(-300,Math.min(300,height/2-box.y-box.height/2));
          await page.mouse.move(width/2,height/2);
          await page.mouse.down();
          await page.mouse.move(width/2+dx,height/2+dy,{steps:8});
          await page.mouse.up();
          await page.clock.runFor(100);
        }
        await page.locator('.forest-portal--shrine').hover();
      }
      await page.clock.fastForward(90000);
      await page.clock.runFor(4000);
      assert.equal(await page.evaluate(()=>window.TeaMerryMobileGuide.snapshot().count),3,JSON.stringify(await page.evaluate(()=>({guide:window.TeaMerryMobileGuide.snapshot(),dialogs:[...document.querySelectorAll('dialog[open]')].map(el=>el.id),text:document.querySelector('.mint-guide__bubble').textContent,actor:document.querySelector('.mint-guide').className}))));
      if(width>=760) assert.equal(await page.locator(actor).getAttribute('data-dialogue-id'),'guide_omikuji','nearby shrine hint');
      await page.clock.runFor(350);
      await page.screenshot({path:'C:/Users/kakao/_mint-guide-'+width+'.png'});
      assert.deepEqual(errors,[]);
      console.log(width+'x'+height+': compact entry / anonymous welcome / no interruption / recurring idle PASS');
      await context.close();
    }
  } finally { await browser.close(); }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
