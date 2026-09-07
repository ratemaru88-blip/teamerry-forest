(function () {
  "use strict";

  const ASSET_SCHEMA_VERSION = "tbalance.assets.v0.1";
  const REGISTRY_PATH = "data/tbalance/project-assets.json";
  const ASSET_ROOT = "assets";
  const CATEGORIES = {
    character: { label: "キャラクター", folder: "characters" },
    background: { label: "背景", folder: "backgrounds" },
    ui: { label: "UI・ボタン", folder: "ui" },
    effect: { label: "エフェクト", folder: "effects" },
    uncategorized: { label: "未分類", folder: "other" },
    other: { label: "その他", folder: "other" },
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function nowIso() {
    return window.TBalanceNativeSchema?.nowIso?.() || new Date().toISOString();
  }

  function normalizeCategory(value) {
    const key = String(value || "").trim().toLowerCase();
    return CATEGORIES[key] ? key : "uncategorized";
  }

  function createRegistry(input = {}, project = {}) {
    const projectId = input.projectId || project.projectId || project.projectRef?.projectId || "";
    return {
      schemaVersion: ASSET_SCHEMA_VERSION,
      projectId,
      assets: [],
      updatedAt: nowIso(),
      storage: {
        root: ASSET_ROOT,
        registryPath: REGISTRY_PATH,
      },
    };
  }

  function normalizeRegistry(input = {}, project = {}) {
    const registry = Object.assign(createRegistry(input, project), clone(input));
    registry.schemaVersion = registry.schemaVersion || ASSET_SCHEMA_VERSION;
    registry.projectId = registry.projectId || project.projectId || project.projectRef?.projectId || "";
    registry.storage = Object.assign({ root: ASSET_ROOT, registryPath: REGISTRY_PATH }, registry.storage || {});
    registry.assets = normalizeAssets(registry.assets || input.assets || project.assets || []);
    registry.updatedAt = registry.updatedAt || nowIso();
    return registry;
  }

  function normalizeAssets(assets) {
    const seen = new Set();
    return (Array.isArray(assets) ? assets : []).map((asset) => normalizeAsset(asset)).filter((asset) => {
      if (!asset.assetId || seen.has(asset.assetId)) {
        return false;
      }
      seen.add(asset.assetId);
      return true;
    });
  }

  function normalizeAsset(asset = {}) {
    const ids = window.TBalanceNativeId;
    const assetId = asset.assetId || asset.id || ids?.createStableId("asset") || `ast_${Date.now().toString(36)}`;
    const category = normalizeCategory(asset.category);
    const storage = normalizeStorage(asset.storage, asset);
    const displayName = asset.displayName || asset.name || asset.fileName || asset.originalName || assetId;
    const now = nowIso();
    return Object.assign({}, asset, {
      assetId,
      id: asset.id || assetId,
      displayName,
      name: asset.name || displayName,
      mediaType: asset.mediaType || guessMediaType(asset.fileName || asset.originalName || storage.relativePath),
      category,
      storage,
      originalName: asset.originalName || asset.fileName || "",
      relativePath: asset.relativePath || storage.relativePath || "",
      contentHash: asset.contentHash || "",
      width: Math.max(0, Number(asset.width) || 0),
      height: Math.max(0, Number(asset.height) || 0),
      byteLength: Math.max(0, Number(asset.byteLength) || 0),
      variants: normalizeVariants(asset.variants, storage),
      status: asset.status || inferAssetStatus(storage),
      createdAt: asset.createdAt || now,
      updatedAt: asset.updatedAt || asset.createdAt || now,
    });
  }

  function normalizeStorage(storage = {}, asset = {}) {
    const mode = storage.mode || (asset.relativePath ? "project-file" : asset.legacySrc || asset.src || asset.originalSrc ? "embedded" : "missing");
    if (mode === "project-file") {
      return {
        mode,
        relativePath: normalizeRelativePath(storage.relativePath || asset.relativePath || ""),
      };
    }
    if (mode === "embedded") {
      return { mode };
    }
    return { mode: "missing", relativePath: normalizeRelativePath(storage.relativePath || asset.relativePath || "") };
  }

  function normalizeVariants(variants = {}, storage = {}) {
    const source = variants.source || {};
    if (storage.mode === "project-file") {
      return Object.assign({}, variants, {
        source: Object.assign({ relativePath: storage.relativePath }, source),
      });
    }
    return Object.assign({}, variants);
  }

  function inferAssetStatus(storage = {}) {
    if (storage.mode === "project-file") return "available";
    if (storage.mode === "embedded") return "legacy-embedded";
    return "missing";
  }

  function normalizeRelativePath(value) {
    return String(value || "").replace(/\\/g, "/").replace(/^\/+/, "");
  }

  function guessMediaType(name = "") {
    const lower = String(name || "").toLowerCase();
    if (lower.endsWith(".png")) return "image/png";
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
    if (lower.endsWith(".webp")) return "image/webp";
    if (lower.endsWith(".webm")) return "video/webm";
    if (lower.endsWith(".svg")) return "image/svg+xml";
    return "";
  }

  function mergeProjectRegistry(project, registry) {
    if (!project) {
      return null;
    }
    const normalized = normalizeRegistry(registry || {}, project);
    project.assetRegistry = {
      schemaVersion: normalized.schemaVersion,
      projectId: normalized.projectId,
      registryPath: normalized.storage.registryPath || REGISTRY_PATH,
      storageRoot: normalized.storage.root || ASSET_ROOT,
      loadedAt: nowIso(),
    };
    project.assets = normalized.assets;
    return normalized;
  }

  function upsertAsset(project, asset) {
    if (!project) {
      return null;
    }
    const normalized = normalizeAsset(asset);
    project.assets = normalizeAssets(project.assets || []);
    const index = project.assets.findIndex((item) => item.assetId === normalized.assetId);
    if (index >= 0) {
      project.assets[index] = Object.assign({}, project.assets[index], normalized, { updatedAt: nowIso() });
    } else {
      project.assets.push(normalized);
    }
    return normalized;
  }

  function findAsset(project, assetRef) {
    const id = typeof assetRef === "string" ? assetRef : assetRef?.assetId || assetRef?.id || "";
    return (project?.assets || []).find((asset) => asset.assetId === id || asset.id === id) || null;
  }

  function resolveAssetSrc(asset) {
    if (!asset) {
      return "";
    }
    const normalized = normalizeAsset(asset);
    if (normalized.storage.mode === "project-file" && normalized.storage.relativePath) {
      return encodeProjectRelativeUrl(normalized.storage.relativePath);
    }
    if (normalized.storage.mode === "embedded") {
      return normalized.legacySrc || normalized.src || normalized.originalSrc || "";
    }
    return normalized.legacySrc || normalized.src || "";
  }

  function resolveLayerAssetSrc(project, layer, viewportKey) {
    const asset = findAsset(project, layer?.assetRef || layer?.assetId);
    const src = resolveAssetSrc(asset);
    if (src) {
      return src;
    }
    if (viewportKey === "mobile") {
      return layer?.mobileSrc || layer?.src || layer?.desktopSrc || "";
    }
    return layer?.desktopSrc || layer?.src || layer?.mobileSrc || "";
  }

  function encodeRelativeUrl(relativePath) {
    return normalizeRelativePath(relativePath).split("/").map((part) => encodeURIComponent(part)).join("/");
  }

  function encodeProjectRelativeUrl(relativePath) {
    const encoded = encodeRelativeUrl(relativePath);
    if (!encoded) {
      return "";
    }
    return `../../${encoded}`;
  }

  function createAssetRefSnapshot(project, page) {
    const refs = Array.from(new Set((page?.layers || []).flatMap((layer) => collectLayerAssetRefs(layer)).filter(Boolean)));
    return refs.map((assetId) => {
      const asset = findAsset(project, assetId);
      return asset ? {
        assetId: asset.assetId,
        displayName: asset.displayName,
        category: asset.category,
        relativePath: asset.storage?.relativePath || asset.relativePath || "",
        mediaType: asset.mediaType || "",
      } : { assetId, status: "missing" };
    });
  }

  function collectLayerAssetRefs(layer = {}) {
    const refs = [layer.assetRef || layer.assetId, layer.base?.assetRef || layer.base?.assetId];
    Object.values(layer.viewportOverrides || {}).forEach((override) => refs.push(override.assetRef || override.assetId));
    Object.values(layer.sceneOverrides || {}).forEach((override) => refs.push(override.assetRef || override.assetId));
    Object.values(layer.sceneViewportOverrides || {}).forEach((viewports) => {
      Object.values(viewports || {}).forEach((override) => refs.push(override.assetRef || override.assetId));
    });
    return refs;
  }

  function getCategoryLabel(category) {
    return CATEGORIES[normalizeCategory(category)].label;
  }

  window.TBalanceNativeAssets = {
    ASSET_SCHEMA_VERSION,
    REGISTRY_PATH,
    ASSET_ROOT,
    CATEGORIES,
    createRegistry,
    normalizeRegistry,
    normalizeAsset,
    normalizeAssets,
    normalizeCategory,
    mergeProjectRegistry,
    upsertAsset,
    findAsset,
    resolveAssetSrc,
    resolveLayerAssetSrc,
    encodeProjectRelativeUrl,
    createAssetRefSnapshot,
    getCategoryLabel,
  };
})();
