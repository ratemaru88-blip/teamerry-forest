const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.FOREST_TEST_BASE_URL || 'http://127.0.0.1:8841';
const pause = ms => new Promise(resolve=>setTimeout(resolve,ms));
const alpha = (canvas,x,y) => canvas.evaluate((c,[x,y])=>c.getContext('2d').getImageData(Math.floor(c.width*x),Math.floor(c.height*y),1,1).data[3],[x,y]);
async function swipe(session,x,y,dx,dy,cancel=false) {
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let i=1;i<=12;i++) {
    await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/12,y:y+dy*i/12}]});
    await pause(25);
  }
  await session.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});
  await pause(350);
}
async function main() {
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try {
    for(const [name,width,height,userAgent,prefix] of [
      ['Android',390,844,'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36',''],
      ['iPhone',375,667,'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',''],
      ['docs Android',390,844,'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36','/docs']
    ]) {
      const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,userAgent});
      const page=await context.newPage(),errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(base+prefix+'/musical/boku-no-takaramono/pair-preview.html');
      await page.waitForFunction(()=>document.querySelectorAll('[data-scratch="ready"]').length===4);
      const session=await context.newCDPSession(page);
      const canvas=page.locator('[data-scratch]').first();
      const point=await canvas.evaluate(c=>{
        const r=c.getBoundingClientRect();
        for(let y=180;y<Math.min(r.bottom,innerHeight)-150;y+=30) for(let x=35;x<innerWidth-35;x+=35) {
          if(document.elementFromPoint(x,y)===c&&document.elementFromPoint(x,y+120)===c)return {x,y,rx:(x-r.left)/r.width,ry:(y-r.top)/r.height};
        }
        throw Error('No clear drawing point');
      });
      assert.equal(await alpha(canvas,point.rx,point.ry),255);
      const before=await page.locator('#viewport').evaluate(el=>el.scrollTop);
      await swipe(session,point.x,point.y,0,120);
      assert.equal(await page.locator('#viewport').evaluate(el=>el.scrollTop),before,'drawing cannot scroll');
      assert(Number(await canvas.getAttribute('data-strokes'))>=8,'finger movement continues drawing');
      assert.equal(await alpha(canvas,point.rx,point.ry),0,'existing reveal removes the mono mask');
      assert.equal(await canvas.evaluate(c=>getComputedStyle(c).touchAction),'none');
      const outside=await page.evaluate(()=>{
        for(let y=30;y<innerHeight-50;y+=25)for(let x=25;x<innerWidth-25;x+=25) {
          const el=document.elementFromPoint(x,y);
          if(el&&!el.closest('canvas,button,a,video,audio,[data-runtime-message]'))return{x,y};
        }
        throw Error('No outside scrolling point');
      });
      await swipe(session,outside.x,outside.y,0,-150);
      assert((await page.locator('#viewport').evaluate(el=>el.scrollTop))>before+30,'outside drawing area still scrolls');
      await page.locator('#viewport').evaluate(el=>el.scrollTop=0);
      await pause(300);
      await swipe(session,point.x,point.y,20,40,true);
      const strokes=Number(await canvas.getAttribute('data-strokes'));
      await swipe(session,point.x,point.y+60,20,40);
      assert(Number(await canvas.getAttribute('data-strokes'))>strokes,'cancel does not disable next stroke');
      await page.evaluate(()=>{
        const c=document.querySelector('[data-scratch]'),node=c.parentElement,root=document.getElementById('stage');
        const pair={mono:node.querySelector('img').src,color:root.querySelector('[data-layer-id="'+node.dataset.colorLayerId+'"] img').src};
        c.scratchDispose();
        window.TakaramonoScratch.mount(node,pair,{eventRoot:root,replaceImages:false,radius:64,pointerTypes:['mouse','touch','pen']});
      });
      await page.waitForFunction(()=>document.querySelector('[data-scratch]')?.dataset.scratch==='ready');
      assert.equal(await alpha(page.locator('[data-scratch]').first(),point.rx,point.ry),255,'dispose/remount resets the mask');
      assert.equal(await page.locator('[data-scratch]').count(),4,'no duplicate canvas after remount');
      await swipe(session,point.x,point.y,0,80);
      assert.equal(await alpha(page.locator('[data-scratch]').first(),point.rx,point.ry),0,'drawing works after reset');
      await page.screenshot({path:'C:/Users/kakao/_scratch-touch-'+name.replaceAll(' ','-')+'.png'});
      assert.deepEqual(errors,[]);
      console.log(name+': native touch / no drawing scroll / outside scroll / pixels / cancel / remount PASS');
      await context.close();
    }
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    await page.goto(base+'/musical/boku-no-takaramono/pair-preview.html');
    await page.waitForFunction(()=>document.querySelectorAll('[data-scratch="ready"]').length===4);
    for(const canvas of await page.locator('[data-scratch]').all()) {
      await canvas.scrollIntoViewIfNeeded();const r=await canvas.boundingBox();
      assert.equal(await canvas.evaluate(c=>c.style.pointerEvents),'none','PC hit testing is unchanged');
      await page.mouse.move(r.x+r.width*.5,r.y+r.height*.4);
      assert.equal(await alpha(canvas,.5,.4),0,'PC hover drawing still works');
    }
    console.log('PC: all four canvas mouse reveal PASS');
  } finally {await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
