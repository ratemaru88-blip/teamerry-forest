import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';
const root = process.cwd();
const sourcePath = process.argv[2];
if (!sourcePath) throw new Error('Provide the saved Native .tbalance authority path');
const source = JSON.parse(await readFile(sourcePath, 'utf8'));
const doc = structuredClone(source);
const ids = ['lyr_db4f6f6480b84ae3', 'lyr_81d9c73753d44c63'];
const messageId = 'lyr_e0e27ee946f94375';
const existing = JSON.parse(await readFile(path.join(root, 'docs/musical/boku-no-takaramono/kakao-message.tbalance'), 'utf8'));
const messageAction = existing.page.layers.find(layer => layer.id === messageId)?.clickAction;
assert.equal(messageAction?.type, 'message');
// The user explicitly approved retaining the existing published Kakao Action.
doc.page.layers.find(layer => layer.id === messageId).clickAction = structuredClone(messageAction);
for (const id of ids) {
  const layer = doc.page.layers.find(layer => layer.id === id);
  assert(layer?.hitArea?.enabled, 'Expected saved HitArea: ' + id);
  layer.clickAction = { type: 'page', target: '#musical-feedback' };
  layer.link = '#musical-feedback';
}
const comparison = structuredClone(doc);
comparison.page.layers.find(layer => layer.id === messageId).clickAction = source.page.layers.find(layer => layer.id === messageId).clickAction;
for (const id of ids) {
  const layer = comparison.page.layers.find(layer => layer.id === id);
  const before = source.page.layers.find(layer => layer.id === id);
  layer.clickAction = before.clickAction; layer.link = before.link;
}
assert.deepEqual(comparison, source, 'Only the two feedback Actions and approved existing message Action may change');
const used = new Set();
function visit(value) {
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    if (['assetId', 'assetRef'].includes(key) && typeof item === 'string' && item) used.add(item);
    else visit(item);
  }
}
visit(doc.page);
const manifest = [];
for (const id of used) {
  const asset = [...(source.assetLibrary || []), ...source.assetManifest].find(asset => (asset.assetId || asset.id) === id);
  assert(asset, 'Missing asset: ' + id);
  let bytes, mediaType = asset.mediaType;
  if (asset.storage?.mode === 'project-file') bytes = await readFile(path.resolve(root, asset.storage.relativePath));
  else {
    const match = /^data:([^;,]+);base64,([\s\S]+)$/.exec(asset.legacySrc || asset.src || asset.originalSrc || '');
    assert(match, 'Missing embedded asset: ' + id); mediaType = match[1]; bytes = Buffer.from(match[2], 'base64');
  }
  const extension = { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg' }[mediaType];
  assert(extension);
  const relativePath = `assets/musical/boku-no-takaramono/${id}.${extension}`;
  for (const prefix of ['', 'docs/']) {
    const output = path.join(root, prefix, relativePath);
    await mkdir(path.dirname(output), { recursive: true }); await writeFile(output, bytes);
  }
  manifest.push({ assetId: id, id, displayName: asset.displayName || asset.name, name: asset.name,
    originalName: asset.originalName, mediaType, width: asset.width, height: asset.height,
    byteLength: bytes.length, contentHash: createHash('sha256').update(bytes).digest('hex'),
    status: 'available', storage: { mode: 'project-file', relativePath }, relativePath });
}
doc.assetManifest = manifest; doc.assetLibrary = [];
const outputName = 'musical/boku-no-takaramono/feedback-flow.tbalance';
for (const prefix of ['', 'docs/']) await writeFile(path.join(root, prefix, outputName), JSON.stringify(doc, null, 2));
for (const file of ['js/musical-feedback.js', 'js/submission-config.js', 'js/submissions.js', 'css/submissions.css', 'musical/boku-no-takaramono/pair-preview.js']) {
  await copyFile(path.join(root, file), path.join(root, 'docs', file));
}
const html = (await readFile(path.join(root, 'musical/boku-no-takaramono/pair-preview.html'), 'utf8'))
  .replaceAll('../../tools/tbalance/native/', 'runtime/').replaceAll('../../tools/tbalance/', 'runtime/');
await writeFile(path.join(root, 'musical/boku-no-takaramono/pair-preview.html'), html);
await writeFile(path.join(root, 'docs/musical/boku-no-takaramono/pair-preview.html'), html);
for (const file of ['native-id.js', 'native-schema.js', 'native-scenes.js', 'native-assets.js', 'native-migration.js', 'tbalance-renderer.js', 'scroll-layout.js']) {
  const target = path.join(root, 'musical/boku-no-takaramono/runtime', file);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(path.join(root, 'docs/musical/boku-no-takaramono/runtime', file), target);
}
console.log(JSON.stringify({ sourcePath, ids, assets: manifest.length, authority: doc.sourceAuthority, coordinatesUnchanged: true }));
