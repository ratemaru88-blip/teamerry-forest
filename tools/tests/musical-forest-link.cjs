const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../..');
const base = process.env.FOREST_TEST_BASE_URL || 'http://127.0.0.1:8840';
const ids = ['lyr_ac2cb725f8dd446a', 'lyr_b9df2018c2e14bed'];
async function main() {
  const before = JSON.parse(execFileSync('git', ['show', 'HEAD:musical/boku-no-takaramono/feedback-flow.tbalance'], {cwd:root,encoding:'utf8',maxBuffer:4*1024*1024}));
  const saved = JSON.parse(fs.readFileSync(path.join(root,'musical/boku-no-takaramono/feedback-flow.tbalance'),'utf8'));
  const restored = structuredClone(saved);
  for (const id of ids) {
    const layer = restored.page.layers.find(l=>l.id===id);
    const old = before.page.layers.find(l=>l.id===id);
    assert.equal(layer.link,'../../index.html');
    assert.deepEqual(layer.clickAction,{type:'page',target:'../../index.html'});
    layer.link=old.link; layer.clickAction=old.clickAction;
  }
  assert.deepEqual(restored,before,'Only the two first-page forest link targets may change');
  assert.equal(fs.readFileSync(path.join(root,'docs/musical/boku-no-takaramono/feedback-flow.tbalance'),'utf8'),fs.readFileSync(path.join(root,'musical/boku-no-takaramono/feedback-flow.tbalance'),'utf8'));
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try {
    for (const prefix of process.env.FOREST_TEST_BASE_URL ? [''] : ['', '/docs']) {
      for (const [index,width] of [1440,390].entries()) {
        const context=await browser.newContext({viewport:{width,height:844}});
        const page=await context.newPage(); let popups=0;
        page.on('popup',()=>popups++);
        await page.goto(base+prefix+'/musical/boku-no-takaramono/pair-preview.html');
        await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
        await page.evaluate(()=>localStorage.setItem('teaMerryDisplayName','森リンク確認さん'));
        const hit=page.locator(`[data-layer-id="${ids[index]}"]`);
        assert.equal(await hit.getAttribute('href'),'../../index.html');
        const box=await hit.boundingBox(); assert(box.y>=0&&box.y<844,'Forest button is on first screen');
        await hit.click();
        await page.waitForURL(base+prefix+'/index.html');
        assert.equal(await page.title(),'TeaMerry Forest');
        assert.equal(await page.locator('.forest-scene').count(),1);
        assert.equal(await page.evaluate(()=>localStorage.getItem('teaMerryDisplayName')),'森リンク確認さん');
        assert.equal(popups,0,'Forest stays in same tab');
        console.log(`${prefix||'root'} ${width}px: first-page forest click / same tab / existing name retained PASS`);
        await context.close();
      }
    }
  } finally {await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
