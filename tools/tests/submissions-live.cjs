const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../js/submission-config.js'), 'utf8'), context);
const endpoint = context.window.TeaMerrySubmissionConfig.endpoint;
// Reuse the three verified TEST receipts; never create new successful rows.
const receipts = [
  ['musical_feedback', 'TEST 実送信確認', 'TEST 2026-10-08 ミュージカル感想の実送信・保存確認です。', '2f100da3-f90c-4628-86fc-b8edde20258a'],
  ['bottle_mail', 'おさんぽさん', 'TEST 2026-10-08 ボトルメールの実送信・保存確認です。', '623363dc-9ea6-4950-b26d-b19a991e162e'],
  ['wish_star', 'おさんぽさん', 'TEST 2026-10-08 願い星の実送信・保存確認です。', '8864202a-a525-4923-b8d1-e278cc5d1cbc'],
];
async function post(payload) {
  const response = await fetch(endpoint, {
    method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(30000),
  });
  assert(response.ok);
  return response.json();
}
async function main() {
  for (const [type, name, message, requestId] of receipts) {
    const payload = { type, name, message, requestId, clientId: crypto.randomUUID(), workId: type === 'musical_feedback' ? 'boku-no-takaramono' : '' };
    const duplicate = await post(payload);
    assert.equal(duplicate.ok, true); assert.equal(duplicate.duplicate, true);
    assert.equal(duplicate.requestId, requestId);
    assert.equal((await post({ ...payload, message: message + ' changed' })).code, 'id_conflict');
    for (const bad of ['', ' ', 'あ'.repeat(301)]) {
      const result = await post({ ...payload, requestId: crypto.randomUUID(), message: bad });
      assert.equal(result.ok, false); assert.equal(result.code, 'invalid_message');
    }
    const html = await post({ ...payload, requestId: crypto.randomUUID(), message: '<script>TEST</script>' });
    assert.equal(html.ok, false); assert.equal(html.code, 'invalid_text');
    console.log(type + ': live duplicate, conflict, empty/301, HTML PASS');
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
