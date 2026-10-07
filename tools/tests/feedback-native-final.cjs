const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    await page.route('**/api/tbalance/native-assets/**', route=>route.fulfill({status:503,body:'{}'}));
    await page.goto('http://127.0.0.1:8840/tools/tbalance/index.html');
    await page.waitForFunction(()=>document.querySelector('#pageSelect option'));
    await page.locator('#openFile').setInputFiles('musical/boku-no-takaramono/feedback-flow.tbalance');
    await page.locator('.tb-layer-row').filter({hasText:'PC感想ボトルメールへ'}).waitFor();
    const native = JSON.parse(fs.readFileSync('musical/boku-no-takaramono/feedback-flow.tbalance','utf8'));
    for (const [key,id] of [['desktop','lyr_db4f6f6480b84ae3'],['mobile','lyr_81d9c73753d44c63']]) {
      await page.locator(key==='desktop'?'#desktopMode':'#mobileMode').click();
      await page.locator(`[data-edit-viewport="${key}"]`).selectOption('4');
      await page.locator('#previewButton').click();
      await page.locator(`#canvas [data-layer-id="${id}"]`).waitFor();
      const action = native.page.layers.find(layer=>layer.id===id).clickAction;
      assert.deepEqual(action,{type:'page',target:'#musical-feedback'});
      assert.equal(native.page[key].width,key==='desktop'?1920:1080);
      assert.equal(native.page[key].screenHeight,key==='desktop'?1080:1920);
      await page.locator('#previewButton').click();
      console.log(key+': Native import / TEST rendering / saved Action PASS');
    }
    await page.locator('#finalPreviewButton').click();
    await page.locator('#finalPreviewComplete').waitFor({state:'visible'});
    assert.match(await page.locator('#finalPreviewStatus').innerText(),/確認が完了/);
    await page.screenshot({path:'document/submissions-test/native-final.png'});
    console.log('Native FINAL PASS; form Adapter is verified separately in Standard Web preview');
  } finally { await browser.close(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
