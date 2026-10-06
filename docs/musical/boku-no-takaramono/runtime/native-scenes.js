(function () {
  "use strict";

  const VISUAL_FIELDS = [
    "x",
    "y",
    "width",
    "height",
    "rotation",
    "visible",
    "opacity",
    "assetRef",
    "assetId",
  ];
  const VIEWPORTS = {
    desktop: { viewportId: "desktop", displayName: "PC", width: 1920, height: 1080 },
    mobile: { viewportId: "mobile", displayName: "Mobile", width: 1080, height: 1920 },
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function getViewportKey(value) {
    return value === "mobile" ? "mobile" : "desktop";
  }

  function getDefaultViewport(value) {
    const key = getViewportKey(value);
    return Object.assign({}, VIEWPORTS[key]);
  }

  function createScene(input = {}) {
    const ids = window.TBalanceNativeId;
    const displayName = String(input.displayName || input.name || "新しいシーン").trim() || "新しいシーン";
    const sceneId = input.sceneId || input.id || ids?.createStableId("scene") || `scn_${Date.now().toString(36)}`;
    return {
      sceneId,
      displayName,
      order: Number.isFinite(Number(input.order)) ? Number(input.order) : 0,
      enabled: input.enabled !== false,
    };
  }

  function normalizePage(page = {}) {
    page.desktop = Object.assign({}, getDefaultViewport("desktop"), page.desktop || page.viewports?.desktop || {});
    page.mobile = Object.assign({}, getDefaultViewport("mobile"), page.mobile || page.viewports?.mobile || {});
    page.viewports = Object.assign({}, page.viewports || {}, {
      desktop: Object.assign({}, page.desktop, page.viewports?.desktop || {}),
      mobile: Object.assign({}, page.mobile, page.viewports?.mobile || {}),
    });
    if (Array.isArray(page.scenes) && page.scenes.length) {
      const seen = new Set();
      page.scenes = page.scenes
        .map((scene, index) => createScene(Object.assign({ order: index }, scene || {})))
        .filter((scene) => {
          if (!scene.sceneId || seen.has(scene.sceneId)) {
            return false;
          }
          seen.add(scene.sceneId);
          return true;
        })
        .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
      const defaultScene = page.scenes.find((scene) => scene.sceneId === page.defaultSceneId && scene.enabled !== false)
        || page.scenes.find((scene) => scene.enabled !== false)
        || page.scenes[0];
      page.defaultSceneId = defaultScene?.sceneId || "";
    } else {
      page.scenes = [];
      delete page.defaultSceneId;
    }
    (page.layers || []).forEach(normalizeLayer);
    return page;
  }

  function normalizeLayer(layer = {}) {
    const desktop = normalizeLayout(layer.desktop || layer.base || {});
    const mobile = normalizeLayout(layer.mobile || layer.viewportOverrides?.mobile || desktop);
    layer.base = Object.assign({}, desktop, layer.base || {});
    if (!hasOwn(layer.base, "visible")) {
      layer.base.visible = layer.visible !== false;
    }
    if (layer.appearance && hasOwn(layer.appearance, "opacity") && !hasOwn(layer.base, "opacity")) {
      layer.base.opacity = layer.appearance.opacity;
    }
    if (layer.assetRef && !hasOwn(layer.base, "assetRef")) {
      layer.base.assetRef = layer.assetRef;
    }
    if (layer.assetId && !hasOwn(layer.base, "assetId")) {
      layer.base.assetId = layer.assetId;
    }
    layer.viewportOverrides = normalizeOverrideMap(layer.viewportOverrides);
    layer.sceneOverrides = normalizeOverrideMap(layer.sceneOverrides);
    layer.sceneViewportOverrides = normalizeNestedOverrideMap(layer.sceneViewportOverrides);
    layer.viewportOverrides.mobile = diffVisualState(layer.base, Object.assign({}, mobile, layer.viewportOverrides.mobile || {}));
    cleanupAllOverrides(layer);
    layer.desktop = Object.assign({}, layer.base);
    layer.mobile = resolveLayerState(layer, "mobile", "");
    return layer;
  }

  function normalizeLayout(value = {}) {
    const layout = {
      x: Math.round(Number(value.x) || 0),
      y: Math.round(Number(value.y) || 0),
      width: Math.max(1, Math.round(Number(value.width) || 320)),
      height: Math.max(1, Math.round(Number(value.height) || 180)),
      rotation: Math.round(Number(value.rotation) || 0),
    };
    VISUAL_FIELDS.forEach((field) => {
      if (!hasOwn(layout, field) && hasOwn(value, field)) {
        layout[field] = value[field];
      }
    });
    return layout;
  }

  function normalizeOverrideMap(map = {}) {
    const result = {};
    Object.keys(map || {}).forEach((key) => {
      const value = pickVisualFields(map[key] || {});
      if (Object.keys(value).length) {
        result[key] = value;
      }
    });
    return result;
  }

  function normalizeNestedOverrideMap(map = {}) {
    const result = {};
    Object.keys(map || {}).forEach((sceneId) => {
      const viewports = normalizeOverrideMap(map[sceneId]);
      if (Object.keys(viewports).length) {
        result[sceneId] = viewports;
      }
    });
    return result;
  }

  function pickVisualFields(source = {}) {
    const result = {};
    VISUAL_FIELDS.forEach((field) => {
      if (hasOwn(source, field)) {
        result[field] = source[field];
      }
    });
    return result;
  }

  function resolveLayerState(layer = {}, viewportId = "desktop", sceneId = "") {
    const viewport = getViewportKey(viewportId);
    const state = Object.assign({
      x: 0,
      y: 0,
      width: 320,
      height: 180,
      rotation: 0,
    }, layer.base || layer.desktop || {});
    applyOverride(state, layer.viewportOverrides?.[viewport]);
    if (sceneId) {
      if (viewport === "desktop") {
        applyOverride(state, layer.sceneOverrides?.[sceneId]);
      }
      applyOverride(state, layer.sceneViewportOverrides?.[sceneId]?.[viewport]);
    }
    return state;
  }

  function getWritableLayerState(layer, page, viewportId = "desktop", sceneId = "") {
    normalizeLayer(layer);
    const scope = getWriteScope(page, viewportId, sceneId);
    const target = ensureWriteTarget(layer, scope);
    const inherited = resolveInheritedState(layer, scope);
    const effective = Object.assign({}, inherited, target);
    return new Proxy(target, {
      get(object, prop) {
        if (prop === "__target") return object;
        if (prop === "__scope") return scope;
        if (hasOwn(object, prop)) return object[prop];
        return effective[prop];
      },
      set(object, prop, value) {
        if (typeof prop === "string" && VISUAL_FIELDS.includes(prop) && scope.type !== "base" && valuesEqual(inherited[prop], value)) {
          delete object[prop];
        } else {
          object[prop] = value;
        }
        cleanupAllOverrides(layer, object);
        syncLegacyViewportAliases(layer);
        return true;
      },
      ownKeys() {
        return Array.from(new Set([...Object.keys(effective), ...Object.keys(target), ...VISUAL_FIELDS]));
      },
      getOwnPropertyDescriptor() {
        return { enumerable: true, configurable: true };
      },
    });
  }

  function getWriteScope(page, viewportId = "desktop", sceneId = "") {
    const viewport = getViewportKey(viewportId);
    const activeScene = sceneId || getDefaultSceneId(page);
    const hasScene = Boolean(activeScene && Array.isArray(page?.scenes) && page.scenes.length);
    const defaultSceneId = getDefaultSceneId(page);
    if (!hasScene || activeScene === defaultSceneId) {
      return viewport === "mobile"
        ? { type: "viewport", viewportId: viewport }
        : { type: "base", viewportId: viewport };
    }
    return viewport === "mobile"
      ? { type: "sceneViewport", sceneId: activeScene, viewportId: viewport }
      : { type: "scene", sceneId: activeScene, viewportId: viewport };
  }

  function ensureWriteTarget(layer, scope) {
    if (scope.type === "base") {
      layer.base = Object.assign({}, layer.base || layer.desktop || {});
      return layer.base;
    }
    if (scope.type === "viewport") {
      layer.viewportOverrides = layer.viewportOverrides || {};
      layer.viewportOverrides[scope.viewportId] = Object.assign({}, layer.viewportOverrides[scope.viewportId] || {});
      return layer.viewportOverrides[scope.viewportId];
    }
    if (scope.type === "scene") {
      layer.sceneOverrides = layer.sceneOverrides || {};
      layer.sceneOverrides[scope.sceneId] = Object.assign({}, layer.sceneOverrides[scope.sceneId] || {});
      return layer.sceneOverrides[scope.sceneId];
    }
    layer.sceneViewportOverrides = layer.sceneViewportOverrides || {};
    layer.sceneViewportOverrides[scope.sceneId] = layer.sceneViewportOverrides[scope.sceneId] || {};
    layer.sceneViewportOverrides[scope.sceneId][scope.viewportId] = Object.assign({}, layer.sceneViewportOverrides[scope.sceneId][scope.viewportId] || {});
    return layer.sceneViewportOverrides[scope.sceneId][scope.viewportId];
  }

  function resolveInheritedState(layer, scope) {
    const base = Object.assign({
      x: 0,
      y: 0,
      width: 320,
      height: 180,
      rotation: 0,
    }, layer.base || layer.desktop || {});
    if (scope.type === "base") {
      return {};
    }
    if (scope.type === "viewport") {
      return base;
    }
    const viewportState = Object.assign({}, base, layer.viewportOverrides?.[scope.viewportId] || {});
    if (scope.type === "scene") {
      return viewportState;
    }
    return viewportState;
  }

  function cleanupAllOverrides(layer, preserveTarget = null) {
    cleanupOverrideMap(layer.viewportOverrides, layer.base || {}, preserveTarget);
    cleanupOverrideMap(layer.sceneOverrides, layer.base || {}, preserveTarget);
    Object.keys(layer.sceneViewportOverrides || {}).forEach((sceneId) => {
      Object.keys(layer.sceneViewportOverrides[sceneId] || {}).forEach((viewportId) => {
        const inherited = Object.assign(
          {},
          layer.base || {},
          layer.viewportOverrides?.[viewportId] || {},
        );
        cleanupOverrideObject(layer.sceneViewportOverrides[sceneId][viewportId], inherited);
        if (!Object.keys(layer.sceneViewportOverrides[sceneId][viewportId]).length && layer.sceneViewportOverrides[sceneId][viewportId] !== preserveTarget) {
          delete layer.sceneViewportOverrides[sceneId][viewportId];
        }
      });
      if (!Object.keys(layer.sceneViewportOverrides[sceneId] || {}).length) {
        delete layer.sceneViewportOverrides[sceneId];
      }
    });
  }

  function cleanupOverrideMap(map = {}, inherited = {}, preserveTarget = null) {
    Object.keys(map || {}).forEach((key) => {
      cleanupOverrideObject(map[key], inherited);
      if (!Object.keys(map[key] || {}).length && map[key] !== preserveTarget) {
        delete map[key];
      }
    });
  }

  function cleanupOverrideObject(target = {}, inherited = {}) {
    Object.keys(target || {}).forEach((key) => {
      if (valuesEqual(target[key], inherited[key])) {
        delete target[key];
      }
    });
  }

  function syncLegacyViewportAliases(layer) {
    layer.desktop = Object.assign({}, layer.base || {});
    layer.mobile = resolveLayerState(layer, "mobile", "");
  }

  function diffVisualState(base = {}, next = {}) {
    const diff = {};
    VISUAL_FIELDS.forEach((field) => {
      if (hasOwn(next, field) && !valuesEqual(base[field], next[field])) {
        diff[field] = next[field];
      }
    });
    return diff;
  }

  function addScene(page, displayName) {
    normalizePage(page);
    const scene = createScene({
      displayName: displayName || `シーン${page.scenes.length + 1}`,
      order: page.scenes.length,
    });
    page.scenes.push(scene);
    if (!page.defaultSceneId) {
      page.defaultSceneId = scene.sceneId;
    }
    return scene;
  }

  function renameScene(page, sceneId, displayName) {
    normalizePage(page);
    const scene = page.scenes.find((item) => item.sceneId === sceneId);
    if (!scene) {
      return null;
    }
    scene.displayName = String(displayName || "").trim() || scene.displayName;
    return scene;
  }

  function getDefaultSceneId(page) {
    if (!Array.isArray(page?.scenes) || !page.scenes.length) {
      return "";
    }
    return page.scenes.find((scene) => scene.sceneId === page.defaultSceneId)?.sceneId || page.scenes[0].sceneId;
  }

  function applyOverride(target, override) {
    Object.keys(override || {}).forEach((key) => {
      target[key] = override[key];
    });
  }

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object || {}, key);
  }

  function valuesEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  window.TBalanceNativeScenes = {
    VISUAL_FIELDS,
    VIEWPORTS,
    createScene,
    normalizePage,
    normalizeLayer,
    resolveLayerState,
    getWritableLayerState,
    getWriteScope,
    getDefaultSceneId,
    addScene,
    renameScene,
    syncLegacyViewportAliases,
    clone,
  };
})();
