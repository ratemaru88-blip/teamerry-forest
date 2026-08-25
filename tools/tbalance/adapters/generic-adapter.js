(function () {
  "use strict";

  const NONE_ADAPTER = {
    id: "none",
    version: "0.1",
    label: "None",
    capabilities: {
      pages: false,
      links: false,
      componentMapping: false,
      protectedBehavior: false,
      patch: false,
    },
    getKnownPages() {
      return [];
    },
    resolveInternalLink() {
      return { status: "unresolved", reason: "adapter-none" };
    },
    resolveTestUrl() {
      return { status: "unresolved", reason: "adapter-none" };
    },
    getComponentMapping() {
      return null;
    },
    getProtectedBehavior() {
      return null;
    },
  };

  function createGenericAdapter(provider = {}) {
    const getMappings = () => {
      const mappings = typeof provider.getConfirmedMappings === "function"
        ? provider.getConfirmedMappings()
        : [];
      return Array.isArray(mappings) ? mappings : [];
    };

    const adapter = {
      id: "generic",
      version: "0.1",
      label: "Generic",
      capabilities: {
        pages: true,
        links: true,
        componentMapping: true,
        protectedBehavior: true,
        patch: false,
      },
      getKnownPages() {
        return getKnownPagesFromMappings(getMappings());
      },
      resolveInternalLink(target, context = {}) {
        return resolveStandardWebUrl(target, context, { internalOnly: true });
      },
      resolveTestUrl(target, context = {}) {
        return resolveStandardWebUrl(target, context, { internalOnly: false });
      },
      getComponentMapping(pageId, tbId, context = {}) {
        return findComponentMapping(getMappings(), pageId, tbId, context);
      },
      getProtectedBehavior(pageId, tbId, context = {}) {
        const result = findComponentMapping(getMappings(), pageId, tbId, context);
        if (!result) {
          return null;
        }
        if (result.status === "ambiguous") {
          return {
            status: "ambiguous",
            reason: result.reason,
            mappings: result.mappings.map(toProtectedBehavior),
          };
        }
        const protectedBehavior = toProtectedBehavior(result.mapping);
        if (!protectedBehavior.protectedProperties.length && !protectedBehavior.behaviorRef) {
          return null;
        }
        return protectedBehavior;
      },
    };
    return adapter;
  }

  function createAdapterRegistry(provider = {}) {
    const adapters = new Map();
    let activeId = "none";

    const registry = {
      registerAdapter(adapter) {
        if (!adapter || !adapter.id) {
          throw new Error("Adapter must have id");
        }
        adapters.set(adapter.id, adapter);
      },
      listAdapters() {
        return Array.from(adapters.values()).map(getAdapterSummary);
      },
      list() {
        return Array.from(adapters.values());
      },
      getAdapter(id = activeId) {
        return adapters.get(id) || adapters.get("none");
      },
      get(id = activeId) {
        return adapters.get(id) || adapters.get("none");
      },
      setActiveAdapter(id) {
        if (!adapters.has(id)) {
          return { selected: false, adapter: adapters.get("none"), reason: "unknown-adapter" };
        }
        activeId = id;
        return { selected: true, adapter: adapters.get(activeId) };
      },
      setActive(id) {
        return registry.setActiveAdapter(id);
      },
      getActiveAdapter() {
        return adapters.get(activeId) || adapters.get("none");
      },
      getActiveAdapterId() {
        return activeId;
      },
    };

    registry.registerAdapter(NONE_ADAPTER);
    registry.registerAdapter(createGenericAdapter(provider));
    return registry;
  }

  function getKnownPagesFromMappings(mappings) {
    const pages = new Map();
    mappings.forEach((mapping) => {
      if (!mapping || !mapping.pageId) {
        return;
      }
      if (!pages.has(mapping.pageId)) {
        pages.set(mapping.pageId, {
          pageId: mapping.pageId,
          sourcePath: mapping.page?.sourcePath || mapping.page?.path || "",
          sourceAuthority: mapping.sourceAuthority || "standard-web",
          viewStates: [],
          componentCount: 0,
        });
      }
      const page = pages.get(mapping.pageId);
      page.componentCount += 1;
      const viewState = mapping.viewState || mapping.page?.viewState || "";
      if (viewState && !page.viewStates.includes(viewState)) {
        page.viewStates.push(viewState);
      }
    });
    return Array.from(pages.values()).map((page) => ({
      ...page,
      viewStates: page.viewStates.slice().sort(),
    }));
  }

  function findComponentMapping(mappings, pageId, tbId, context = {}) {
    if (!pageId || !tbId) {
      return null;
    }
    const pageMappings = mappings.filter((mapping) => mapping.pageId === pageId && mapping.tbId === tbId);
    if (!pageMappings.length) {
      return null;
    }
    const viewState = normalizeViewState(context.viewState);
    const commonMappings = pageMappings.filter((mapping) => !normalizeViewState(mapping.viewState || mapping.page?.viewState));
    const viewMappings = viewState
      ? pageMappings.filter((mapping) => normalizeViewState(mapping.viewState || mapping.page?.viewState) === viewState)
      : [];

    if (viewState && commonMappings.length && viewMappings.length) {
      return {
        status: "ambiguous",
        reason: "common-and-view-specific",
        mappings: [...commonMappings, ...viewMappings].map(toPublicMapping),
      };
    }
    if (viewState && viewMappings.length === 1) {
      return { status: "resolved", mapping: toPublicMapping(viewMappings[0]) };
    }
    if (viewState && viewMappings.length > 1) {
      return {
        status: "ambiguous",
        reason: "multiple-view-specific-mappings",
        mappings: viewMappings.map(toPublicMapping),
      };
    }
    if (commonMappings.length === 1) {
      return { status: "resolved", mapping: toPublicMapping(commonMappings[0]) };
    }
    if (commonMappings.length > 1) {
      return {
        status: "ambiguous",
        reason: "multiple-common-mappings",
        mappings: commonMappings.map(toPublicMapping),
      };
    }
    if (!viewState && pageMappings.length > 1) {
      return {
        status: "ambiguous",
        reason: "view-state-required",
        mappings: pageMappings.map(toPublicMapping),
      };
    }
    return { status: "resolved", mapping: toPublicMapping(pageMappings[0]) };
  }

  function resolveStandardWebUrl(target, context = {}, options = {}) {
    const rawTarget = String(target || "").trim();
    if (!rawTarget) {
      return { status: "unresolved", reason: "empty-target" };
    }
    const baseUrl = getBaseUrl(context);
    if (!baseUrl) {
      return { status: "unresolved", reason: "missing-base-url", target: rawTarget };
    }
    try {
      const url = new URL(rawTarget, baseUrl);
      const base = new URL(baseUrl);
      const isExternal = url.origin !== base.origin;
      if (options.internalOnly && isExternal) {
        return {
          status: "external",
          target: rawTarget,
          url: url.href,
          isExternal: true,
          reason: "external-url",
        };
      }
      return {
        status: "resolved",
        target: rawTarget,
        url: url.href,
        path: `${url.pathname}${url.search}${url.hash}`,
        isExternal,
      };
    } catch (error) {
      return {
        status: "unresolved",
        target: rawTarget,
        reason: "invalid-url",
        message: error.message,
      };
    }
  }

  function getBaseUrl(context) {
    const candidates = [
      context.baseUrl,
      context.currentUrl,
      context.effectiveUrl,
      context.url,
      context.origin,
      typeof location !== "undefined" ? location.href : "",
    ];
    return candidates.find((candidate) => typeof candidate === "string" && candidate.trim()) || "";
  }

  function normalizeViewState(value) {
    return String(value || "").trim();
  }

  function toPublicMapping(mapping) {
    return {
      pageId: mapping.pageId,
      sourcePath: mapping.page?.sourcePath || mapping.page?.path || "",
      sourceAuthority: mapping.sourceAuthority || "standard-web",
      tbId: mapping.tbId,
      domRef: mapping.domRef,
      selectorQuality: mapping.selectorQuality || "",
      role: mapping.role || "visual",
      editableProperties: Array.isArray(mapping.editableProperties) ? [...mapping.editableProperties] : [],
      protectedProperties: Array.isArray(mapping.protectedProperties) ? [...mapping.protectedProperties] : [],
      behaviorRef: mapping.behaviorRef || null,
      viewState: normalizeViewState(mapping.viewState || mapping.page?.viewState),
    };
  }

  function toProtectedBehavior(mapping) {
    return {
      status: "resolved",
      pageId: mapping.pageId,
      tbId: mapping.tbId,
      protectedProperties: Array.isArray(mapping.protectedProperties) ? [...mapping.protectedProperties] : [],
      behaviorRef: mapping.behaviorRef || null,
      viewState: normalizeViewState(mapping.viewState),
    };
  }

  function getAdapterSummary(adapter) {
    return {
      id: adapter.id,
      version: adapter.version,
      label: adapter.label,
      capabilities: { ...adapter.capabilities },
    };
  }

  window.TBalanceAdapter = {
    createAdapterRegistry,
    createGenericAdapter,
  };
})();
