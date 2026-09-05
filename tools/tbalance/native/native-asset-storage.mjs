import crypto from "node:crypto";
import { access, mkdir, readFile, realpath, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export const ASSET_STORAGE_VERSION = "tbalance.assets.v0.1";
export const REGISTRY_RELATIVE_PATH = "data/tbalance/project-assets.json";
export const ASSET_ROOT = "assets";

const CATEGORY_FOLDERS = {
  character: "characters",
  background: "backgrounds",
  ui: "ui",
  effect: "effects",
  other: "other",
};
const ALLOWED_MEDIA_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const MAX_ASSET_BYTES = 40 * 1024 * 1024;

export async function createNativeAssetStorage(options = {}) {
  const repoRoot = await realpath(options.repoRoot || process.cwd());
  return {
    version: ASSET_STORAGE_VERSION,
    repoRoot,
    registryPath: REGISTRY_RELATIVE_PATH,
    assetRoot: ASSET_ROOT,
    getCapabilities() {
      return {
        ok: true,
        assetStorageVersion: ASSET_STORAGE_VERSION,
        registryPath: REGISTRY_RELATIVE_PATH,
        assetRoot: ASSET_ROOT,
        categories: Object.keys(CATEGORY_FOLDERS),
        allowedMediaTypes: Array.from(ALLOWED_MEDIA_TYPES),
        maxAssetBytes: MAX_ASSET_BYTES,
        projectRootScoped: true,
      };
    },
    async readRegistry(projectId = "") {
      const registry = await readRegistryFile(repoRoot, projectId);
      return { ok: true, assetStorageVersion: ASSET_STORAGE_VERSION, registry };
    },
    async importAsset(request = {}) {
      return importAsset(repoRoot, request);
    },
    async updateAsset(request = {}) {
      return updateAsset(repoRoot, request);
    },
  };
}

async function importAsset(repoRoot, request) {
  const projectId = requiredText(request.projectId, "projectId");
  const category = normalizeCategory(request.category);
  const mediaType = normalizeMediaType(request.mediaType, request.fileName);
  const fileName = sanitizeFileName(request.fileName || request.originalName || "asset", extensionForMediaType(mediaType));
  const assetId = validateAssetId(request.assetId || createAssetId());
  const bytes = decodeAssetBytes(request, mediaType);
  if (bytes.length > MAX_ASSET_BYTES) {
    throw assetError("file-too-large", "Asset file exceeds the size limit.");
  }
  const contentHash = hashBytes(bytes);
  const registry = await readRegistryFile(repoRoot, projectId);
  const duplicate = registry.assets.find((asset) => asset.contentHash && asset.contentHash === contentHash);
  if (duplicate) {
    duplicate.updatedAt = nowIso();
    await writeRegistryFile(repoRoot, registry);
    return {
      ok: true,
      assetStorageVersion: ASSET_STORAGE_VERSION,
      status: "duplicate-reused",
      registry,
      asset: duplicate,
    };
  }

  const targetRelativePath = await chooseAssetRelativePath(repoRoot, category, fileName);
  const targetPath = await resolveSafeProjectPath(repoRoot, targetRelativePath, { allowMissingLeaf: true });
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, bytes, { flag: "wx" });

  const asset = {
    assetId,
    id: assetId,
    displayName: cleanDisplayName(request.displayName || stripExtension(fileName)),
    mediaType,
    category,
    storage: {
      mode: "project-file",
      relativePath: targetRelativePath,
    },
    originalName: request.originalName || request.fileName || fileName,
    relativePath: targetRelativePath,
    contentHash,
    byteLength: bytes.length,
    width: Math.max(0, Number(request.width) || 0),
    height: Math.max(0, Number(request.height) || 0),
    variants: {
      source: {
        relativePath: targetRelativePath,
      },
    },
    status: "available",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  registry.assets.push(asset);
  registry.updatedAt = nowIso();
  await writeRegistryFile(repoRoot, registry);
  return {
    ok: true,
    assetStorageVersion: ASSET_STORAGE_VERSION,
    status: "imported",
    registry,
    asset,
  };
}

async function updateAsset(repoRoot, request) {
  const projectId = requiredText(request.projectId, "projectId");
  const assetId = validateAssetId(request.assetId);
  const registry = await readRegistryFile(repoRoot, projectId);
  const asset = registry.assets.find((item) => item.assetId === assetId || item.id === assetId);
  if (!asset) {
    throw assetError("asset-not-found", "Asset was not found.");
  }
  if (Object.prototype.hasOwnProperty.call(request, "displayName")) {
    asset.displayName = cleanDisplayName(request.displayName || asset.displayName);
    asset.name = asset.displayName;
  }
  if (Object.prototype.hasOwnProperty.call(request, "category")) {
    asset.category = normalizeCategory(request.category);
  }
  asset.updatedAt = nowIso();
  registry.updatedAt = nowIso();
  await writeRegistryFile(repoRoot, registry);
  return { ok: true, assetStorageVersion: ASSET_STORAGE_VERSION, registry, asset };
}

async function readRegistryFile(repoRoot, projectId = "") {
  const registryPath = await resolveSafeProjectPath(repoRoot, REGISTRY_RELATIVE_PATH, { allowMissingLeaf: true });
  try {
    const text = await readFile(registryPath, "utf8");
    const parsed = JSON.parse(text);
    if (parsed.projectId && projectId && parsed.projectId !== projectId) {
      return normalizeRegistry({}, projectId);
    }
    return normalizeRegistry(parsed, projectId);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw assetError("registry-read-failed", "Asset Registry could not be read.", { detail: error.message });
    }
    return normalizeRegistry({}, projectId);
  }
}

async function writeRegistryFile(repoRoot, registry) {
  const registryPath = await resolveSafeProjectPath(repoRoot, REGISTRY_RELATIVE_PATH, { allowMissingLeaf: true });
  await mkdir(path.dirname(registryPath), { recursive: true });
  await writeFile(registryPath, `${JSON.stringify(normalizeRegistry(registry, registry.projectId), null, 2)}\n`, "utf8");
}

function normalizeRegistry(input = {}, projectId = "") {
  const id = input.projectId || projectId || "";
  return {
    schemaVersion: input.schemaVersion || ASSET_STORAGE_VERSION,
    projectId: id,
    storage: Object.assign({ root: ASSET_ROOT, registryPath: REGISTRY_RELATIVE_PATH }, input.storage || {}),
    assets: normalizeAssets(input.assets || []),
    updatedAt: input.updatedAt || nowIso(),
  };
}

function normalizeAssets(assets) {
  const seen = new Set();
  return (Array.isArray(assets) ? assets : []).map((asset) => {
    const copy = Object.assign({}, asset || {});
    copy.assetId = validateAssetId(copy.assetId || copy.id || createAssetId());
    copy.id = copy.id || copy.assetId;
    copy.displayName = cleanDisplayName(copy.displayName || copy.name || copy.originalName || copy.assetId);
    copy.name = copy.name || copy.displayName;
    copy.category = normalizeCategory(copy.category);
    copy.storage = normalizeStorage(copy.storage, copy);
    copy.relativePath = copy.relativePath || copy.storage.relativePath || "";
    copy.mediaType = normalizeMediaType(copy.mediaType, copy.originalName || copy.relativePath || "");
    copy.contentHash = String(copy.contentHash || "");
    copy.variants = Object.assign({}, copy.variants || {});
    if (copy.storage.mode === "project-file" && copy.storage.relativePath) {
      copy.variants.source = Object.assign({ relativePath: copy.storage.relativePath }, copy.variants.source || {});
      copy.status = copy.status || "available";
    }
    copy.createdAt = copy.createdAt || nowIso();
    copy.updatedAt = copy.updatedAt || copy.createdAt;
    return copy;
  }).filter((asset) => {
    if (seen.has(asset.assetId)) return false;
    seen.add(asset.assetId);
    return true;
  });
}

function normalizeStorage(storage = {}, asset = {}) {
  const mode = storage.mode || (asset.relativePath ? "project-file" : asset.legacySrc ? "embedded" : "missing");
  if (mode === "project-file") {
    return { mode, relativePath: normalizeRelativePath(storage.relativePath || asset.relativePath || "") };
  }
  if (mode === "embedded") {
    return { mode };
  }
  return { mode: "missing", relativePath: normalizeRelativePath(storage.relativePath || asset.relativePath || "") };
}

async function chooseAssetRelativePath(repoRoot, category, fileName) {
  const folder = CATEGORY_FOLDERS[category] || CATEGORY_FOLDERS.other;
  const parsed = path.parse(fileName);
  const base = parsed.name || "asset";
  const ext = parsed.ext || ".png";
  for (let index = 0; index < 1000; index += 1) {
    const suffix = index ? `-${String(index + 1).padStart(2, "0")}` : "";
    const candidate = normalizeRelativePath(path.posix.join(ASSET_ROOT, folder, `${base}${suffix}${ext}`));
    try {
      await access(await resolveSafeProjectPath(repoRoot, candidate, { allowMissingLeaf: true }));
    } catch (error) {
      if (error.code === "ENOENT") {
        return candidate;
      }
      throw error;
    }
  }
  throw assetError("name-collision", "Could not create a collision-safe asset file name.");
}

async function resolveSafeProjectPath(repoRoot, relativePath, options = {}) {
  const normalized = normalizeRelativePath(requiredText(relativePath, "path"));
  if (!normalized || normalized.split("/").some((segment) => !segment || segment === "." || segment === ".." || segment.startsWith("."))) {
    throw assetError("invalid-path", "Invalid project relative path.");
  }
  if (normalized.split("/").includes("node_modules") || normalized.split("/").includes(".git")) {
    throw assetError("invalid-path", "This path is not allowed.");
  }
  const candidate = path.resolve(repoRoot, normalized);
  const rootWithSep = repoRoot.endsWith(path.sep) ? repoRoot : `${repoRoot}${path.sep}`;
  if (candidate !== repoRoot && !candidate.startsWith(rootWithSep)) {
    throw assetError("path-outside-project", "Path resolves outside the project.");
  }
  if (options.allowMissingLeaf) {
    try {
      const parentReal = await realpath(path.dirname(candidate));
      if (parentReal !== repoRoot && !parentReal.startsWith(rootWithSep)) {
        throw assetError("path-outside-project", "Parent path resolves outside the project.");
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    return candidate;
  }
  const real = await realpath(candidate);
  if (real !== repoRoot && !real.startsWith(rootWithSep)) {
    throw assetError("path-outside-project", "Real path resolves outside the project.");
  }
  return real;
}

function decodeAssetBytes(request, mediaType) {
  const dataUrl = String(request.dataUrl || "");
  const match = dataUrl.match(/^data:([^;,]+);base64,(.+)$/);
  if (!match) {
    throw assetError("invalid-data", "Asset dataUrl must be base64.");
  }
  const declaredType = normalizeMediaType(match[1], request.fileName);
  if (declaredType !== mediaType) {
    throw assetError("media-type-mismatch", "Asset media type does not match dataUrl.");
  }
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length) {
    throw assetError("invalid-data", "Asset data is empty.");
  }
  return bytes;
}

function normalizeCategory(value) {
  const key = String(value || "").trim().toLowerCase();
  return CATEGORY_FOLDERS[key] ? key : "other";
}

function normalizeMediaType(mediaType, fileName = "") {
  const type = String(mediaType || guessMediaType(fileName)).toLowerCase();
  if (!ALLOWED_MEDIA_TYPES.has(type)) {
    throw assetError("unsupported-media-type", "Only PNG, JPEG, and WebP assets are supported in v0.1.");
  }
  return type;
}

function guessMediaType(fileName = "") {
  const ext = path.extname(String(fileName || "")).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "";
}

function extensionForMediaType(mediaType) {
  if (mediaType === "image/jpeg") return ".jpg";
  if (mediaType === "image/webp") return ".webp";
  return ".png";
}

function sanitizeFileName(value, fallbackExtension) {
  const input = String(value || "asset").trim();
  const parsed = path.parse(input.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").replace(/\s+/g, "_"));
  const ext = path.extname(parsed.base).toLowerCase() || fallbackExtension;
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw assetError("unsupported-extension", "Only PNG, JPEG, and WebP files are supported in v0.1.");
  }
  const name = (parsed.name || "asset").replace(/^\.+/, "").slice(0, 80) || "asset";
  return `${name}${ext}`;
}

function stripExtension(fileName) {
  return String(fileName || "").replace(/\.[^.]+$/, "");
}

function cleanDisplayName(value) {
  return String(value || "正式素材").trim().slice(0, 80) || "正式素材";
}

function requiredText(value, name) {
  const text = String(value || "").trim();
  if (!text) {
    throw assetError("invalid-request", `${name} is required.`);
  }
  return text;
}

function validateAssetId(value) {
  const text = requiredText(value, "assetId");
  if (!/^ast_[a-z0-9]{8,}$/i.test(text)) {
    throw assetError("invalid-asset-id", "assetId must be a stable ast_ id.");
  }
  return text;
}

function createAssetId() {
  return `ast_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

function normalizeRelativePath(value) {
  return String(value || "").replace(/\\/g, "/").replace(/^\/+/, "");
}

function hashBytes(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function nowIso() {
  return new Date().toISOString();
}

function assetError(errorCode, message, details = {}) {
  const error = new Error(message);
  error.assetStorageError = true;
  error.errorCode = errorCode;
  Object.assign(error, details);
  return error;
}
