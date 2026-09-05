(function () {
  "use strict";

  function clone(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function normalizeNativeProject(input = {}) {
    const schema = window.TBalanceNativeSchema;
    const ids = window.TBalanceNativeId;
    if (!schema) {
      return clone(input);
    }
    schema.assertSupportedSchema(input);
    const source = unwrapPageDocument(input);
    const project = schema.createProject(source);
    if (input.projectRef && !project.projectRef) {
      project.projectRef = Object.assign({}, input.projectRef);
    }
    if (input.assetManifest && !project.assets?.length) {
      project.assets = input.assetManifest;
    }
    project.assetRegistry = Object.assign({}, source.assetRegistry || project.assetRegistry || {}, {
      registryPath: source.assetRegistry?.registryPath || source.projectRef?.assetRegistryPath || window.TBalanceNativeAssets?.REGISTRY_PATH || "",
    });
    const normalizedAssets = normalizeAssetsWithIdMap(project.assets, ids);
    project.assets = window.TBalanceNativeAssets?.normalizeAssets?.(normalizedAssets.assets) || normalizedAssets.assets;
    project.pages = normalizePages(project.pages, schema, ids, normalizedAssets.idMap);
    if (!project.pages.length) {
      project.pages = [schema.createPage({ displayName: "トップページ", slug: "home", index: 1 })];
    }
    project.name = project.name || project.displayName;
    project.displayName = project.displayName || project.name;
    return project;
  }

  function unwrapPageDocument(input = {}) {
    if (!input.page) {
      return clone(input);
    }
    const page = clone(input.page);
    const projectRef = input.projectRef || {};
    return {
      schemaVersion: input.schemaVersion,
      format: input.format,
      version: input.version,
      sourceAuthority: input.sourceAuthority,
      projectId: projectRef.projectId || input.projectId,
      projectRef: clone(projectRef),
      displayName: projectRef.displayName || input.displayName || input.name,
      name: projectRef.displayName || input.name,
      assetRegistry: input.assetRegistry,
      assets: Array.isArray(input.assets) ? input.assets : Array.isArray(input.assetManifest) ? input.assetManifest : [],
      pages: [page],
      metadata: input.meta || input.metadata,
    };
  }

  function normalizeAssetsWithIdMap(assets, ids) {
    const idMap = new Map();
    const normalized = (Array.isArray(assets) ? assets : []).map((asset) => {
      const copy = Object.assign({}, asset || {});
      const originalId = copy.assetId || copy.id || "";
      const stable = ids?.isStableId?.(originalId, "asset");
      copy.assetId = stable ? originalId : ids?.createStableId("asset") || `ast_${Date.now().toString(36)}`;
      if (originalId && originalId !== copy.assetId) {
        copy.legacyId = copy.legacyId || originalId;
        idMap.set(originalId, copy.assetId);
      }
      copy.id = copy.assetId;
      copy.displayName = copy.displayName || copy.fileName || copy.name || copy.assetId;
      return copy;
    });
    return { assets: normalized, idMap };
  }

  function normalizePages(pages, schema, ids, assetIdMap = new Map()) {
    return (Array.isArray(pages) ? pages : []).map((page, index) => {
      const original = Object.assign({}, page || {});
      const legacyId = original.legacyId || original.id || "";
      const weakLegacyId = isWeakPageId(legacyId);
      const pageId = original.pageId || (weakLegacyId ? ids?.createStableId("page") : legacyId) || ids?.createStableId("page");
      const normalized = schema.createPage(Object.assign({}, original, {
        pageId,
        legacyId: weakLegacyId ? legacyId : original.legacyId,
        displayName: original.displayName || original.name || `ページ${index + 1}`,
        slug: original.slug || schema.slugify(original.webName || original.outputName || "", `page-${String(index + 1).padStart(3, "0")}`),
        index: index + 1,
      }));
      normalized.id = normalized.pageId;
      normalized.layers = normalizeLayers(original.layers, ids, assetIdMap);
      return normalized;
    });
  }

  function normalizeLayers(layers, ids, assetIdMap = new Map()) {
    return (Array.isArray(layers) ? layers : []).map((layer) => {
      const copy = Object.assign({}, layer || {});
      const layerId = copy.layerId || copy.id || ids?.createStableId("layer") || `lyr_${Date.now().toString(36)}`;
      copy.layerId = layerId;
      copy.id = copy.id || layerId;
      copy.displayName = copy.displayName || copy.name || copy.fileName || layerId;
      copy.name = copy.name || copy.displayName;
      if (copy.assetId && !copy.assetRef) {
        copy.assetRef = copy.assetId;
      }
      if (copy.assetRef && !copy.assetId) {
        copy.assetId = copy.assetRef;
      }
      const remappedAssetId = assetIdMap.get(copy.assetRef) || assetIdMap.get(copy.assetId);
      if (remappedAssetId) {
        copy.legacyAssetId = copy.legacyAssetId || copy.assetRef || copy.assetId;
        copy.assetRef = remappedAssetId;
        copy.assetId = remappedAssetId;
      }
      return copy;
    });
  }

  function isWeakPageId(value) {
    const id = String(value || "").trim().toLowerCase();
    return !id || id === "home" || id === "page" || id === "default" || id === "top";
  }

  window.TBalanceNativeMigration = {
    normalizeNativeProject,
    unwrapPageDocument,
    isWeakPageId,
  };
})();
