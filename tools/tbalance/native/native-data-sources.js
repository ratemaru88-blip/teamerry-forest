(function () {
  "use strict";

  const REGISTRY_SCHEMA_VERSION = "tbalance.datasources.v0.1";
  const DEFAULT_REGISTRY_PATH = "data/tbalance/project-data-sources.json";

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function normalizeRegistry(input = {}, project = {}) {
    const registry = Object.assign({}, input || {});
    registry.schemaVersion = registry.schemaVersion || REGISTRY_SCHEMA_VERSION;
    registry.projectId = registry.projectId || project.projectId || project.projectRef?.projectId || "";
    registry.registryPath = registry.registryPath || DEFAULT_REGISTRY_PATH;
    registry.dataSources = Array.isArray(registry.dataSources) ? registry.dataSources.map(normalizeDataSource).filter(Boolean) : [];
    return registry;
  }

  function normalizeProject(project = {}) {
    const copy = project;
    const seedRegistry = Object.assign({}, copy.dataSourceRegistry || {});
    if (!Array.isArray(seedRegistry.dataSources) && Array.isArray(copy.dataSources)) {
      seedRegistry.dataSources = copy.dataSources;
    }
    copy.dataSourceRegistry = normalizeRegistry(seedRegistry, copy);
    copy.dataSources = copy.dataSourceRegistry.dataSources;
    return copy;
  }

  function normalizeDataSource(source = {}) {
    const dataSourceId = source.dataSourceId || source.id || window.TBalanceNativeId?.createStableId?.("datasource") || `data_${Date.now().toString(36)}`;
    const provider = ["project-json", "inline"].includes(source.provider) ? source.provider : "inline";
    const kind = source.kind || "dialogue-list";
    return {
      dataSourceId,
      id: dataSourceId,
      displayName: source.displayName || source.name || "台詞データ",
      enabled: source.enabled !== false,
      kind,
      provider,
      source: normalizeSourceRef(source.source, provider),
      mapping: Object.assign({ idField: "id", textField: "text" }, source.mapping || {}),
      items: Array.isArray(source.items) ? source.items.map(normalizeItem).filter(Boolean) : [],
      metadata: Object.assign({}, source.metadata || {}),
    };
  }

  function normalizeSourceRef(source = {}, provider = "inline") {
    const ref = Object.assign({}, source || {});
    if (provider === "project-json") {
      ref.relativePath = normalizeProjectRelativePath(ref.relativePath || "");
      ref.selector = ref.selector || "";
    }
    return ref;
  }

  function normalizeItem(item = {}, index = 0) {
    if (typeof item === "string") {
      return { id: `item-${index + 1}`, text: item };
    }
    const text = item.text ?? item.message ?? item.body ?? "";
    if (!String(text).trim()) {
      return null;
    }
    return Object.assign({}, item, {
      id: String(item.id || item.itemId || `item-${index + 1}`),
      text: String(text),
    });
  }

  function normalizeProjectRelativePath(value) {
    const raw = String(value || "").replace(/\\/g, "/").trim();
    if (!raw || raw.startsWith("/") || /^[a-z]:\//i.test(raw) || raw.split("/").some((part) => part === "..")) {
      return "";
    }
    return raw.replace(/^\.\/+/, "");
  }

  function findDataSource(project, dataSourceId) {
    const registry = normalizeRegistry(project?.dataSourceRegistry || { dataSources: project?.dataSources || [] }, project);
    return registry.dataSources.find((source) => source.dataSourceId === dataSourceId || source.id === dataSourceId) || null;
  }

  async function resolveDataSource(project, dataSourceId, options = {}) {
    const source = findDataSource(project, dataSourceId);
    if (!source) {
      return { status: "missing", code: "missing-data-source", dataSourceId, items: [] };
    }
    if (source.enabled === false) {
      return { status: "disabled", code: "disabled-data-source", dataSource: source, items: [] };
    }
    if (source.provider === "inline") {
      return { status: source.items.length ? "ok" : "empty", dataSource: source, items: source.items };
    }
    if (source.provider === "project-json") {
      return resolveProjectJsonDataSource(source, options);
    }
    return { status: "unsupported", code: "unsupported-provider", dataSource: source, items: [] };
  }

  async function resolveProjectJsonDataSource(source, options = {}) {
    const relativePath = normalizeProjectRelativePath(source.source?.relativePath || "");
    if (!relativePath) {
      return { status: "invalid", code: "invalid-relative-path", dataSource: source, items: [] };
    }
    if (typeof options.fetchJson !== "function") {
      return { status: "unresolved", code: "project-json-reader-unavailable", dataSource: source, items: [] };
    }
    try {
      const json = await options.fetchJson(relativePath);
      const selected = selectJsonValue(json, source.source?.selector || "");
      const rawItems = Array.isArray(selected) ? selected : Array.isArray(selected?.items) ? selected.items : [];
      const items = rawItems.map(normalizeItem).filter(Boolean);
      return { status: items.length ? "ok" : "empty", dataSource: source, items };
    } catch (error) {
      return { status: "error", code: error?.code || "read-failed", message: error?.message || "台詞データを読み込めません", dataSource: source, items: [] };
    }
  }

  function selectJsonValue(json, selector) {
    const path = String(selector || "").trim();
    if (!path) {
      return json;
    }
    return path.split(".").filter(Boolean).reduce((current, key) => current?.[key], json);
  }

  window.TBalanceNativeDataSources = {
    REGISTRY_SCHEMA_VERSION,
    DEFAULT_REGISTRY_PATH,
    normalizeRegistry,
    normalizeProject,
    normalizeDataSource,
    findDataSource,
    resolveDataSource,
    normalizeProjectRelativePath,
    clone,
  };
})();
