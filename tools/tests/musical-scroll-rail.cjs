const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=process.env.FOREST_TEST_BASE_URL||'http://127.0.0.1:8841';
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function main() {
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try {
    for(const [name,width,height,prefix] of [['Android',390,844,''],['iPhone',375,667,''],['compact',320,568,''],['docs',390,844,'/docs']]) {
      const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,
        userAgent:name==='iPhone'?'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1':'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36'});
      const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(base+prefix+'/musical/boku-no-takaramono/pair-preview.html');
      await page.waitForFunction(()=>document.querySelectorAll('[data-scratch="ready"]').length===4);
      const rail=page.locator('.musical-scroll-rail'),viewport=page.locator('#viewport');
      await rail.waitFor({state:'visible'});
      const r=await rail.boundingBox();assert(r.width>=24&&r.width<=32);assert.equal(r.x+r.width,width);
      const session=await context.newCDPSession(page);
      const send=(type,x,y)=>session.send('Input.dispatchTouchEvent',{type,touchPoints:/touchEnd|touchCancel/.test(type)?[]:[{x,y}]});
      const strokes=()=>page.locator('[data-scratch]').evaluateAll(cs=>cs.map(c=>c.dataset.strokes||'0'));
      const beforeStrokes=await strokes();const start=await viewport.evaluate(el=>el.scrollTop);
      await send('touchStart',r.x+16,r.y+100);
      assert.equal(await viewport.evaluate(el=>el.scrollTop),start,'touching track does not jump');
      assert(await rail.evaluate(el=>el.classList.contains('is-dragging')));
      for(let i=1;i<=10;i++){await send('touchMove',r.x+16,r.y+100+i*10);await pause(20);}
      const down=await viewport.evaluate(el=>el.scrollTop);assert(down>start+60,'downward drag scrolls down');
      await send('touchEnd');await pause(100);
      assert.equal(await rail.evaluate(el=>el.classList.contains('is-dragging')),false);
      await pause(250);assert.equal(await viewport.evaluate(el=>el.scrollTop),down,'no drift after release');
      assert.deepEqual(await strokes(),beforeStrokes,'rail never draws');
      await send('touchStart',r.x+16,r.y+350);
      assert.equal(await viewport.evaluate(el=>el.scrollTop),down,'regrabbing track does not jump');
      await send('touchMove',r.x-90,r.y+300);await pause(80);
      const up=await viewport.evaluate(el=>el.scrollTop);assert(up<down,'capture supports dragging outside rail');
      await send('touchCancel');await pause(80);
      assert.equal(await rail.evaluate(el=>el.classList.contains('is-dragging')),false);
      await send('touchStart',r.x+16,r.y+150);await send('touchMove',r.x+16,r.y+190);await send('touchEnd');
      assert((await viewport.evaluate(el=>el.scrollTop))>up,'next drag works after cancel');
      await rail.focus();await page.keyboard.press('End');await pause(150);
      assert(await viewport.evaluate(el=>Math.abs(el.scrollTop-(el.scrollHeight-el.clientHeight))<1));
      await page.keyboard.press('Home');await pause(150);assert.equal(await viewport.evaluate(el=>el.scrollTop),0);
      const p=await page.locator('[data-scratch]').first().evaluate(c=>{
        for(let y=180;y<Math.min(innerHeight-100,500);y+=20)for(let x=30;x<innerWidth-60;x+=25)
          if(document.elementFromPoint(x,y)===c&&document.elementFromPoint(x,y+65)===c)return{x,y};
        throw Error('No drawing point');
      });
      await send('touchStart',p.x,p.y);
      for(let i=1;i<=8;i++){await send('touchMove',p.x,p.y+i*8);await pause(20);}
      await send('touchEnd');await pause(100);
      assert.equal(await viewport.evaluate(el=>el.scrollTop),0,'drawing remains scroll-free');
      assert((await strokes()).some((value,i)=>Number(value)>Number(beforeStrokes[i])),'drawing still works');
      await page.screenshot({path:'C:/Users/kakao/_musical-rail-'+name+'.png'});
      await send('touchStart',r.x+16,r.y+100);
      await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
      assert.equal(await rail.evaluate(el=>el.classList.contains('is-dragging')),false,'blur releases');
      await send('touchCancel');
      await page.setViewportSize({width:1000,height:800});
      await rail.waitFor({state:'hidden'});
      assert.equal(await rail.evaluate(el=>el.classList.contains('is-dragging')),false,'resize releases');
      assert.deepEqual(errors,[]);
      console.log(name+': no jump / bidirectional scroll / release / cancel / capture / drawing / keyboard / resize PASS');
      await context.close();
    }
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    await page.goto(base+'/musical/boku-no-takaramono/pair-preview.html');
    await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
    assert.equal(await page.locator('.musical-scroll-rail').isVisible(),false);
    await page.goto(base+'/musical/boku-no-takaramono/pair-preview.html?view=pc');
    await page.setViewportSize({width:390,height:844});
    await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
    assert.equal(await page.locator('.musical-scroll-rail').isVisible(),false,'forced PC mode has no rail');
    console.log('PC and forced PC: rail hidden PASS');
  } finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
