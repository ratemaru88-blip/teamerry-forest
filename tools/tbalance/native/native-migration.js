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
    project.assets = normalizeAssets(project.assets, ids);
    project.pages = normalizePages(project.pages, schema, ids);
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
      assets: Array.isArray(input.assets) ? input.assets : [],
      pages: [page],
      metadata: input.meta || input.metadata,
    };
  }

  function normalizeAssets(assets, ids) {
    return (Array.isArray(assets) ? assets : []).map((asset) => {
      const copy = Object.assign({}, asset || {});
      copy.assetId = copy.assetId || copy.id || ids?.createStableId("asset") || `ast_${Date.now().toString(36)}`;
      copy.id = copy.id || copy.assetId;
      copy.displayName = copy.displayName || copy.fileName || copy.name || copy.assetId;
      return copy;
    });
  }

  function normalizePages(pages, schema, ids) {
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
      normalized.layers = normalizeLayers(original.layers, ids);
      return normalized;
    });
  }

  function normalizeLayers(layers, ids) {
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
