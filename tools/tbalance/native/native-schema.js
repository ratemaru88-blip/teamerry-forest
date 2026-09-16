(function () {
  "use strict";

  const SCHEMA_VERSION = "tbalance.native.v0.1";
  const SOURCE_AUTHORITY = "tbalance";
  const FORMAT = "tbalance";
  const LEGACY_VERSION = "0.1.0";
  const DEFAULT_PROJECT_NAME = "新規TBalance";
  const DEFAULT_DESKTOP = { width: 1920, height: 1080, label: "PC 16:9" };
  const DEFAULT_MOBILE = { width: 1080, height: 1920, label: "Mobile 9:16" };

  function nowIso() {
    return new Date().toISOString();
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function slugify(value, fallback = "page") {
    const ascii = String(value || "")
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
    return ascii || fallback;
  }

  function createProject(input = {}) {
    const ids = window.TBalanceNativeId;
    const displayName = String(input.displayName || input.name || DEFAULT_PROJECT_NAME).trim() || DEFAULT_PROJECT_NAME;
    const createdAt = input.metadata?.createdAt || nowIso();
    return {
      schemaVersion: SCHEMA_VERSION,
      format: FORMAT,
      version: input.version || LEGACY_VERSION,
      sourceAuthority: SOURCE_AUTHORITY,
      projectId: input.projectId || ids?.createStableId("project") || `prj_${Date.now().toString(36)}`,
      projectRef: input.projectRef,
      displayName,
      name: input.name || displayName,
      editorMode: input.editorMode,
      uiSettings: input.uiSettings,
      assetRegistry: input.assetRegistry,
      dataSourceRegistry: input.dataSourceRegistry,
      dataSources: Array.isArray(input.dataSources) ? input.dataSources : [],
      assets: Array.isArray(input.assets) ? input.assets : [],
      pages: Array.isArray(input.pages) ? input.pages : [],
      metadata: Object.assign({}, input.metadata || {}, {
        createdAt,
        updatedAt: input.metadata?.updatedAt || createdAt,
      }),
    };
  }

  function createPage(input = {}) {
    const ids = window.TBalanceNativeId;
    const displayName = String(input.displayName || input.name || "新しいページ").trim() || "新しいページ";
    const pageId = input.pageId || ids?.createStableId("page") || `pg_${Date.now().toString(36)}`;
    const slug = slugify(input.slug || input.webName || input.outputName || "", `page-${String(input.index || 1).padStart(3, "0")}`);
    const desktop = Object.assign({}, DEFAULT_DESKTOP, input.desktop || input.viewports?.desktop || {});
    const mobile = Object.assign({}, DEFAULT_MOBILE, input.mobile || input.viewports?.mobile || {});
    const createdAt = input.metadata?.createdAt || nowIso();
    return {
      pageId,
      id: pageId,
      legacyId: input.legacyId,
      displayName,
      name: displayName,
      slug,
      sourceAuthority: SOURCE_AUTHORITY,
      viewports: { desktop, mobile },
      desktop,
      mobile,
      stage: input.stage,
      scenes: Array.isArray(input.scenes) ? input.scenes : [],
      defaultSceneId: input.defaultSceneId || "",
      sounds: input.sounds ? clone(input.sounds) : undefined,
      sceneOverrides: input.sceneOverrides ? clone(input.sceneOverrides) : undefined,
      behaviors: Array.isArray(input.behaviors) ? input.behaviors : [],
      dataSourceRefs: Array.isArray(input.dataSourceRefs) ? input.dataSourceRefs : [],
      layers: Array.isArray(input.layers) ? input.layers : [],
      metadata: Object.assign({}, input.metadata || {}, {
        createdAt,
        updatedAt: input.metadata?.updatedAt || createdAt,
      }),
    };
  }

  function assertSupportedSchema(project) {
    const version = project?.schemaVersion;
    if (!version || version === SCHEMA_VERSION) {
      return true;
    }
    if (/^tbalance\.native\./.test(version)) {
      const error = new Error(`Unsupported TBalance Native schema version: ${version}`);
      error.code = "unsupported-native-schema";
      error.schemaVersion = version;
      throw error;
    }
    return true;
  }

  function createPageDocument(project, page) {
    const normalizedProject = project || {};
    const normalizedPage = window.TBalanceNativeScenes?.normalizePage?.(page || {}) || page || {};
    const now = nowIso();
    return {
      schemaVersion: SCHEMA_VERSION,
      format: FORMAT,
      version: normalizedProject.version || LEGACY_VERSION,
      sourceAuthority: SOURCE_AUTHORITY,
      projectRef: {
        projectId: normalizedProject.projectId || "",
        displayName: normalizedProject.displayName || normalizedProject.name || "",
        assetRegistryPath: normalizedProject.assetRegistry?.registryPath || window.TBalanceNativeAssets?.REGISTRY_PATH || "",
      },
      page: normalizedPage,
      assetManifest: window.TBalanceNativeAssets?.createAssetRefSnapshot?.(normalizedProject, normalizedPage) || [],
      meta: {
        createdAt: normalizedPage.metadata?.createdAt || normalizedProject.metadata?.createdAt || now,
        updatedAt: now,
      },
    };
  }

  window.TBalanceNativeSchema = {
    SCHEMA_VERSION,
    SOURCE_AUTHORITY,
    FORMAT,
    LEGACY_VERSION,
    DEFAULT_DESKTOP,
    DEFAULT_MOBILE,
    createProject,
    createPage,
    createPageDocument,
    slugify,
    nowIso,
    assertSupportedSchema,
  };
})();
