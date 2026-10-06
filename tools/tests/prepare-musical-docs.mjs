import { readFile, writeFile, copyFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const output = path.join(root, "docs");
const source = JSON.parse(await readFile(path.join(root, "musical/boku-no-takaramono/kakao-message.tbalance"), "utf8"));
const doc = structuredClone(source);
const used = new Set();
function visit(value) {
  if (!value || typeof value !== "object") return;
  for (const [key, item] of Object.entries(value)) {
    if (["assetId", "assetRef"].includes(key) && typeof item === "string" && item) used.add(item);
    else visit(item);
  }
}
visit(source.page);
const assets = [...(source.assetLibrary || []), ...source.assetManifest];
const published = [], files = [];
for (const id of used) {
  const asset = assets.find((a) => (a.assetId || a.id) === id);
  if (!asset) throw new Error("Missing asset: " + id);
  let bytes, mediaType = asset.mediaType;
  if (asset.storage?.mode === "project-file") {
    const file = path.resolve(root, asset.storage.relativePath);
    if (!file.startsWith(root + path.sep)) throw new Error("Asset path outside repository");
    bytes = await readFile(file);
  } else {
    const src = asset.legacySrc || asset.src || asset.originalSrc || "";
    const match = /^data:([^;,]+);base64,([\s\S]+)$/.exec(src);
    if (!match) throw new Error("Unsupported embedded asset: " + id);
    mediaType = match[1];
    bytes = Buffer.from(match[2], "base64");
  }
  const extension = { "image/webp": "webp", "image/png": "png", "image/jpeg": "jpg" }[mediaType];
  if (!extension) throw new Error("Unsupported used media: " + mediaType);
  const relativePath = `assets/musical/boku-no-takaramono/${id}.${extension}`;
  await mkdir(path.dirname(path.join(output, relativePath)), { recursive: true });
  await writeFile(path.join(output, relativePath), bytes);
  published.push({ assetId: id, id, displayName: asset.displayName || asset.name, name: asset.name,
    originalName: asset.originalName, mediaType, width: asset.width, height: asset.height,
    byteLength: bytes.length, contentHash: createHash("sha256").update(bytes).digest("hex"),
    status: "available", storage: { mode: "project-file", relativePath }, relativePath });
  files.push("docs/" + relativePath);
}
doc.assetManifest = published;
doc.assetLibrary = [];
assert.deepEqual(doc.page, source.page);
await mkdir(path.join(output, "musical/boku-no-takaramono"), { recursive: true });
await writeFile(path.join(output, "musical/boku-no-takaramono/kakao-message.tbalance"), JSON.stringify(doc, null, 2));
files.push("docs/musical/boku-no-takaramono/kakao-message.tbalance");
for (const file of ["index.html", "forest.js", "forest.css", "musical/boku-no-takaramono/pair-preview.html",
  "musical/boku-no-takaramono/pair-preview.js", "musical/boku-no-takaramono/scratch.js",
  "tools/tbalance/tbalance-renderer.js", "tools/tbalance/scroll-layout.js",
  ...["native-id", "native-schema", "native-scenes", "native-assets", "native-migration"].map((name) => `tools/tbalance/native/${name}.js`)]) {
  const target = file.startsWith("tools/tbalance/")
    ? "musical/boku-no-takaramono/runtime/" + path.basename(file) : file;
  await mkdir(path.dirname(path.join(output, target)), { recursive: true });
  if (file.endsWith("pair-preview.html")) {
    const html = (await readFile(path.join(root, file), "utf8"))
      .replaceAll("../../tools/tbalance/native/", "runtime/")
      .replaceAll("../../tools/tbalance/", "runtime/");
    await writeFile(path.join(output, target), html);
  } else await copyFile(path.join(root, file), path.join(output, target));
  files.push("docs/" + target);
}
console.log(JSON.stringify({ usedAssets: published.length, totalAssetBytes: published.reduce((sum, a) => sum + a.byteLength, 0), files }, null, 2));
