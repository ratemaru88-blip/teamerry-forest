const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=process.env.TEAMERRY_TEST_BASE_URL || 'http://127.0.0.1:8841';
async function main() {
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try {
    for(const [width,height] of [[390,844],[1366,900]]) {
      const entranceX=width<760?1588.63:1589.1;
      const entranceY=width<760?261.62:259.4;
      const context=await browser.newContext({viewport:{width,height}});
      const page=await context.newPage(), errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.clock.install();
      await page.goto(base+'/index.html?debug=1');
      await page.locator('#skipForestName').click();
      await page.waitForFunction(()=>window.TeaMerryMobileGuide.snapshot());
      await page.clock.runFor(2500);
      await page.clock.fastForward(10000);
      if(width<760) await page.locator('.forest-navigation-stick').focus();
      for(let i=0;i<20;i++) {
        if(width<760) {
          await page.keyboard.down(i%2?'ArrowLeft':'ArrowRight');
          await page.clock.runFor(1000);
          await page.keyboard.up(i%2?'ArrowLeft':'ArrowRight');
        } else {
          await page.mouse.move(i%2?600:660,450);
          await page.clock.runFor(1000);
        }
      }
      if(width<760) await page.keyboard.down('ArrowLeft');
      await page.clock.fastForward(20000);
      if(width>=760) await page.mouse.move(630,450);
      await page.clock.runFor(1500);
      const actor=width<760?'.mobile-walker':'.mint-guide';
      assert.equal(await page.evaluate(()=>window.TeaMerryMobileGuide.snapshot().count),2,'conversation while moving');
      assert(await page.locator(actor).evaluate(el=>el.classList.contains('has-speech')));
      if(width<760) await page.keyboard.up('ArrowLeft');
      const link=page.locator('#fixedObservatoryPortal');
      assert(await link.evaluate(el=>el.closest('#stage')!==null));
      assert.equal(await link.evaluate(el=>getComputedStyle(el).position),'absolute');
      const centerEntrance=async()=>{
        const box=await link.boundingBox();
        const dx=width*.65-(box.x+box.width/2),dy=height*.35-(box.y+box.height/2);
        if(width<760) await page.evaluate(([dx,dy])=>window.TeaMerryForestNavigation.move(-dx,-dy),[dx,dy]);
        else {
          await page.mouse.move(width/2,height*.6);await page.mouse.down();
          await page.mouse.move(width/2+dx,height*.6+dy,{steps:12});await page.mouse.up();
        }
        await page.clock.runFor(300);
      };
      await page.locator('.debug-panel').evaluate(el=>el.style.display='none');
      await centerEntrance();
      for(const time of ['day','evening-a','evening-b','night']) {
        await page.locator('[data-debug-time="'+time+'"]').evaluate(el=>el.click());
        await page.clock.runFor(2000);
        assert(await link.isVisible(),'terrace visible in '+time);
        const anchored=await link.evaluate((el,[entranceX,entranceY])=>{
          const r=el.getBoundingClientRect(),w=document.getElementById('stage').getBoundingClientRect();
          return Math.abs((r.x+r.width/2-w.x)/w.width-entranceX/1920)<.001
            &&Math.abs((r.y+r.height/2-w.y)/w.height-entranceY/1080)<.001;
        },[entranceX,entranceY]);
        assert(anchored,'entrance remains attached to world coordinates');
        const box=await link.boundingBox();
        assert(box.x>=0&&box.y>=0&&box.x+box.width<=width&&box.y+box.height<=height);
        assert(await link.evaluate(el=>{
          const r=el.getBoundingClientRect();
          return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('#fixedObservatoryPortal')===el;
        }),'entrance is hit-testable');
        await page.screenshot({path:'C:/Users/kakao/_terrace-'+width+'-'+time+'.png'});
      }
      const before=await link.boundingBox();
      if(width<760) {
        await page.evaluate(()=>window.TeaMerryForestNavigation.move(-1e6,-1e6));
      } else {
        await page.mouse.move(width/2,height*.6);await page.mouse.down();
        await page.mouse.move(width/2+90,height*.6+40,{steps:8});await page.mouse.up();
      }
      await page.clock.runFor(300);
      const after=await link.boundingBox();
      assert(Math.hypot(after.x-before.x,after.y-before.y)>20,'entrance moves with camera');
      if(width<760) assert(after.x>width||after.x+after.width<0,'entrance leaves viewport away from terrace');
      await centerEntrance();
      await page.setViewportSize({width:width+60,height:height-40});
      await page.clock.runFor(300);
      assert(await link.evaluate((el,entranceX)=>{
        const r=el.getBoundingClientRect(),w=document.getElementById('stage').getBoundingClientRect();
        return Math.abs((r.x+r.width/2-w.x)/w.width-entranceX/1920)<.001;
      },entranceX),'resize preserves world anchor');
      await page.setViewportSize({width,height});await page.clock.runFor(300);
      await centerEntrance();
      await page.route('**/observatory.html',route=>route.fulfill({contentType:'text/html',body:'<title>Terrace navigation test</title>'}));
      await page.locator('#fixedObservatoryPortal').click();
      await page.waitForURL('**/observatory.html');
      assert.deepEqual(errors,[]);
      console.log(width+'px: walking speech / world anchor / camera movement / four times / resize / actual terrace navigation PASS');
      await context.close();
    }
  } finally {await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
