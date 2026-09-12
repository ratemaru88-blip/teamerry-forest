(function () {
  "use strict";

  const VIEWPORTS = {
    desktop: { width: 1920, height: 1080, label: "PC 16:9" },
    mobile: { width: 1080, height: 1920, label: "Mobile 9:16" },
  };
  const LEGACY_DEVICE_PREVIEW_MOBILE = { width: 390, height: 844 };
  const DEFAULT_STAGE = {
    backgroundType: "transparent",
    backgroundColor: "#ffffff",
  };
  const runtimeAudioState = {
    bgm: null,
    bgmKey: "",
    ambient: [],
    ambientKey: "",
    sfx: new Set(),
    unlockHandlers: [],
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getViewportKey(key) {
    return key === "mobile" ? "mobile" : "desktop";
  }

  function getViewportSize(key) {
    return VIEWPORTS[getViewportKey(key)];
  }

  function getPageViewportSize(page, key) {
    const viewportKey = getViewportKey(key);
    return Object.assign({}, getViewportSize(viewportKey), page?.[viewportKey] || page?.viewports?.[viewportKey] || {});
  }

  function normalizeStage(stage) {
    const copy = Object.assign({}, DEFAULT_STAGE, stage || {});
    copy.backgroundType = ["transparent", "white", "solid"].includes(copy.backgroundType) ? copy.backgroundType : "transparent";
    copy.backgroundColor = normalizeColor(copy.backgroundColor || "#ffffff");
    return copy;
  }

  function getLayerLayout(layer, viewportKey) {
    const key = getViewportKey(viewportKey);
    const resolved = window.TBalanceNativeScenes?.resolveLayerState?.(layer, key, "");
    if (resolved) {
      return Object.assign({
        x: 0,
        y: 0,
        width: 320,
        height: 180,
        rotation: 0,
      }, resolved);
    }
    const fallback = key === "mobile" ? layer.desktop : layer.mobile;
    return Object.assign({
      x: 0,
      y: 0,
      width: 320,
      height: 180,
      rotation: 0,
    }, fallback || {}, layer[key] || {});
  }

  function getAppearance(layer) {
    return Object.assign({
      opacity: 1,
      brightness: 1,
      shadow: "none",
      shadowType: "soft",
      shadowSize: 16,
      shadowColor: "rgba(0, 0, 0, 0.38)",
      shadowOpacity: 38,
    }, layer.appearance || {});
  }

  function normalizeProject(project) {
    const nativeProject = window.TBalanceNativeMigration?.normalizeNativeProject(project || {}) || clone(project || {});
    const copy = clone(nativeProject);
    copy.schemaVersion = copy.schemaVersion || window.TBalanceNativeSchema?.SCHEMA_VERSION || "tbalance.native.v0.1";
    copy.format = "tbalance";
    copy.version = copy.version || "0.1.0";
    copy.sourceAuthority = copy.sourceAuthority || "tbalance";
    copy.projectId = copy.projectId || window.TBalanceNativeId?.createStableId("project") || makeId("project");
    copy.displayName = copy.displayName || copy.name || "TeaMerry";
    copy.name = copy.name || copy.displayName;
    copy.projectRef = Object.assign({
      projectId: copy.projectId,
      displayName: copy.displayName,
    }, copy.projectRef || {});
    copy.editorMode = copy.editorMode === "custom" ? "custom" : "normal";
    copy.uiSettings = normalizeUiSettings(copy.uiSettings);
    copy.assets = window.TBalanceNativeAssets?.normalizeAssets?.(copy.assets || []) || (Array.isArray(copy.assets) ? copy.assets : []);
    window.TBalanceNativeDataSources?.normalizeProject?.(copy);
    copy.assets.forEach((asset) => {
      asset.assetId = asset.assetId || asset.id || window.TBalanceNativeId?.createStableId("asset") || makeId("asset");
      asset.id = asset.id || asset.assetId;
      asset.displayName = asset.displayName || asset.fileName || asset.name || asset.assetId;
    });
    copy.pages = Array.isArray(copy.pages) && copy.pages.length ? copy.pages : [createDefaultPage()];
    copy.pages.forEach((page, index) => {
      page.pageId = page.pageId || page.id || window.TBalanceNativeId?.createStableId("page") || makeId("page");
      page.id = page.pageId;
      page.displayName = page.displayName || page.name || "トップページ";
      page.name = page.name || page.displayName;
      page.slug = page.slug || window.TBalanceNativeSchema?.slugify?.("", `page-${String(index + 1).padStart(3, "0")}`) || `page-${index + 1}`;
      page.sourceAuthority = page.sourceAuthority || "tbalance";
      page.desktop = Object.assign({}, VIEWPORTS.desktop, page.desktop || {});
      page.mobile = Object.assign({}, VIEWPORTS.mobile, page.mobile || {});
      upgradeLegacyNativeMobileViewport(page);
      page.viewports = Object.assign({}, page.viewports || {}, {
        desktop: Object.assign({}, page.desktop),
        mobile: Object.assign({}, page.mobile),
      });
      page.stage = normalizeStage(page.stage);
      page.layers = Array.isArray(page.layers) ? page.layers : [];
      page.layers.forEach(normalizeLayer);
      window.TBalanceNativeScenes?.normalizePage?.(page);
      window.TBalanceNativeBehaviors?.normalizePage?.(page);
    });
    return copy;
  }

  function normalizeUiSettings(settings) {
    const copy = Object.assign({
      rememberLastMode: true,
      alwaysStartNormal: false,
      developerPanelOpen: false,
      developerPanelHeight: 280,
      codeEditingAllowed: false,
      openDeveloperPanelOnStart: false,
      showConsole: false,
      showDebugInfo: false,
      showToolDescriptions: true,
      showBeginnerHints: true,
      showShortcuts: true,
      showGrid: false,
      showGuides: false,
      showRulers: true,
      gridStepX: 100,
      gridStepY: 100,
      guideStepX: 320,
      guideStepY: 180,
      snapToGrid: false,
      snapToGuide: false,
      normalAccentColor: "#2f8cff",
      customAccentColor: "#7c5cff",
    }, settings || {});
    copy.rememberLastMode = copy.alwaysStartNormal ? false : copy.rememberLastMode !== false;
    copy.alwaysStartNormal = Boolean(copy.alwaysStartNormal);
    copy.developerPanelOpen = Boolean(copy.developerPanelOpen);
    copy.developerPanelHeight = Math.max(180, Number(copy.developerPanelHeight) || 280);
    copy.showGrid = Boolean(copy.showGrid);
    copy.showGuides = Boolean(copy.showGuides);
    copy.showRulers = copy.showRulers !== false;
    copy.gridStepX = Math.max(1, Number(copy.gridStepX) || 100);
    copy.gridStepY = Math.max(1, Number(copy.gridStepY) || 100);
    copy.guideStepX = Math.max(1, Number(copy.guideStepX) || 320);
    copy.guideStepY = Math.max(1, Number(copy.guideStepY) || 180);
    copy.snapToGrid = Boolean(copy.snapToGrid);
    copy.snapToGuide = Boolean(copy.snapToGuide);
    return copy;
  }

  function normalizeLayer(layer) {
    layer.layerId = layer.layerId || layer.id || window.TBalanceNativeId?.createStableId("layer") || makeId("layer");
    layer.id = layer.id || layer.layerId;
    layer.type = layer.type || "image";
    layer.displayName = layer.displayName || layer.name || layer.fileName || layer.id;
    layer.name = layer.name || layer.displayName;
    layer.visible = layer.visible !== false;
    layer.visibilityMode = ["both", "desktop", "mobile", "hidden"].includes(layer.visibilityMode) ? layer.visibilityMode : (layer.visible === false ? "hidden" : "both");
    if (layer.role === "hit-area" && layer.visibilityMode !== "hidden") {
      layer.visibilityMode = "both";
    }
    layer.locked = Boolean(layer.locked);
    layer.flipX = Boolean(layer.flipX);
    layer.flipY = Boolean(layer.flipY);
    layer.constraints = Object.assign({
      keepAspect: getDefaultKeepAspect(layer),
      keepSquare: false,
      keepCircle: false,
    }, layer.constraints || {});
    if (layer.type === "shape") {
      layer.constraints.keepSquare = false;
      layer.constraints.keepCircle = false;
    }
    layer.transformMode = ["normal", "perspective", "free"].includes(layer.transformMode) ? layer.transformMode : "normal";
    layer.corners = Object.assign({
      topLeft: { x: 0, y: 0 },
      topRight: { x: 1, y: 0 },
      bottomRight: { x: 1, y: 1 },
      bottomLeft: { x: 0, y: 1 },
    }, layer.corners || {});
    layer.desktop = Object.assign({}, getLayerLayout(layer, "desktop"), layer.desktop || {});
    layer.mobile = Object.assign({}, getLayerLayout(layer, "mobile"), layer.mobile || {});
    window.TBalanceNativeScenes?.normalizeLayer?.(layer);
    layer.appearance = getAppearance(layer);
    layer.animation = normalizeAnimation(layer.animation);
    layer.hitArea = Object.assign({
      enabled: Boolean(layer.link),
      visible: false,
      x: 0,
      y: 0,
      width: layer.desktop.width,
      height: layer.desktop.height,
    }, layer.hitArea || {});
  }

  function getDefaultKeepAspect(layer) {
    if (layer.constraints && typeof layer.constraints.keepAspect === "boolean") {
      return layer.constraints.keepAspect;
    }
    if (layer.type === "button") {
      return true;
    }
    if (layer.type === "shape") {
      return false;
    }
    if (layer.role === "background") {
      return false;
    }
    if (layer.type === "image") {
      return true;
    }
    return false;
  }

  function createDefaultPage() {
    return {
      id: "home",
      name: "トップページ",
      desktop: clone(VIEWPORTS.desktop),
      mobile: clone(VIEWPORTS.mobile),
      layers: [
        {
          id: "layer_forest_bg",
          type: "image",
          name: "森の背景",
          fileName: "forest_day_v02.webm",
          src: "../../assets/backgrounds/決定稿_Webｍ/私用したPNG背景/Forest_Day_v02.png",
          role: "background",
          visible: true,
          locked: true,
          desktop: { x: 0, y: 0, width: 1920, height: 1080, rotation: 0 },
          mobile: { x: -457, y: 0, width: 1500, height: 844, rotation: 0 },
          appearance: { opacity: 1, brightness: 0.88, shadow: "none" },
        },
        {
          id: "layer_title",
          type: "text",
          name: "タイトル",
          text: "TeaMerry Forest",
          visible: true,
          locked: false,
          desktop: { x: 170, y: 150, width: 620, height: 96, rotation: 0 },
          mobile: { x: 112, y: 162, width: 856, height: 112, rotation: 0 },
          style: { fontSize: 72, color: "#fff6db", align: "left", weight: 700 },
          appearance: { opacity: 1, brightness: 1, shadow: "soft" },
        },
        {
          id: "layer_start_button",
          type: "button",
          name: "はじめるボタン",
          text: "はじめる",
          link: "#start",
          visible: true,
          locked: false,
          desktop: { x: 190, y: 820, width: 240, height: 72, rotation: 0 },
          mobile: { x: 330, y: 1578, width: 420, height: 104, rotation: 0 },
          appearance: { opacity: 1, brightness: 1, shadow: "soft" },
        },
      ],
    };
  }

  function createBlankProject(options) {
    const config = Object.assign({
      name: "新規TBalance",
      pageName: "トップページ",
      desktop: clone(VIEWPORTS.desktop),
      mobile: clone(VIEWPORTS.mobile),
      activeViewport: "desktop",
      stage: clone(DEFAULT_STAGE),
    }, options || {});
    const desktop = Object.assign({}, VIEWPORTS.desktop, config.desktop || {});
    const mobile = Object.assign({}, VIEWPORTS.mobile, config.mobile || {});
    return normalizeProject({
      schemaVersion: window.TBalanceNativeSchema?.SCHEMA_VERSION || "tbalance.native.v0.1",
      format: "tbalance",
      version: "0.1.0",
      sourceAuthority: "tbalance",
      projectId: window.TBalanceNativeId?.createStableId("project") || makeId("project"),
      displayName: config.name || "新規TBalance",
      name: config.name || "新規TBalance",
      pages: [
        {
          pageId: window.TBalanceNativeId?.createStableId("page") || makeId("page"),
          name: config.pageName || config.name || "トップページ",
          displayName: config.pageName || config.name || "トップページ",
          slug: config.slug || window.TBalanceNativeSchema?.slugify?.("", "page-001") || "page-001",
          sourceAuthority: "tbalance",
          desktop,
          mobile,
          viewports: { desktop, mobile },
          stage: normalizeStage(config.stage),
          layers: [],
        },
      ],
    });
  }

  function renderPage(target, page, viewportKey, options) {
    const root = typeof target === "string" ? document.querySelector(target) : target;
    const settings = Object.assign({
      edit: false,
      selectedId: "",
      selectedIds: [],
      project: null,
      sceneId: "",
      showHitAreas: false,
      onSelect: null,
      onAction: null,
      onImageStatus: null,
      isImageWarning: null,
      test: false,
    }, options || {});
    const key = getViewportKey(viewportKey);
    const size = getPageViewportSize(page, key);
    settings.pageSize = size;
    root.innerHTML = "";
    root.style.width = `${size.width}px`;
    root.style.height = `${size.height}px`;
    root.dataset.viewport = key;
    applyStageStyle(root, page);
    syncPageAudio(page, settings);

    getRenderableLayers(page).forEach((layer, index) => {
      if (!isLayerVisibleInViewport(layer, key, settings.sceneId)) {
        return;
      }
      const node = createLayerNode(layer, key, index, settings);
      root.appendChild(node);
      if (settings.showHitAreas && !settings.test && layer.role !== "hit-area" && layer.hitArea?.enabled) {
        root.appendChild(createHitAreaNode(layer, key, index, settings.sceneId));
      }
    });
  }

  function upgradeLegacyNativeMobileViewport(page) {
    const width = Math.round(Number(page?.mobile?.width) || 0);
    const height = Math.round(Number(page?.mobile?.height) || 0);
    if (width !== LEGACY_DEVICE_PREVIEW_MOBILE.width || height !== LEGACY_DEVICE_PREVIEW_MOBILE.height) {
      return;
    }
    const scaleX = VIEWPORTS.mobile.width / LEGACY_DEVICE_PREVIEW_MOBILE.width;
    const scaleY = VIEWPORTS.mobile.height / LEGACY_DEVICE_PREVIEW_MOBILE.height;
    const hasMobileLayerState = (page.layers || []).some((layer) => {
      return Boolean(layer.mobile || layer.viewportOverrides?.mobile || Object.values(layer.sceneViewportOverrides || {}).some((viewports) => viewports?.mobile));
    });
    page.mobile = Object.assign({}, page.mobile, VIEWPORTS.mobile);
    if (page.viewports?.mobile) {
      page.viewports.mobile = Object.assign({}, page.viewports.mobile, VIEWPORTS.mobile);
    }
    (page.layers || []).forEach((layer) => {
      scaleLayerLayout(layer.mobile, scaleX, scaleY);
      scaleLayerLayout(layer.viewportOverrides?.mobile, scaleX, scaleY);
      Object.values(layer.sceneViewportOverrides || {}).forEach((viewports) => {
        scaleLayerLayout(viewports?.mobile, scaleX, scaleY);
      });
    });
    if (hasMobileLayerState) {
      page.metadata = Object.assign({}, page.metadata || {});
      page.metadata.mobileLayoutReview = Object.assign({}, page.metadata.mobileLayoutReview || {}, {
        status: "review-required",
        reason: "legacy-mobile-canvas-rescaled",
        from: Object.assign({}, LEGACY_DEVICE_PREVIEW_MOBILE),
        to: { width: VIEWPORTS.mobile.width, height: VIEWPORTS.mobile.height },
        message: "旧Mobileレイアウトを1080×1920基準へ変換しました。配置を確認してください。",
      });
    }
  }

  function scaleLayerLayout(layout, scaleX, scaleY) {
    if (!layout) {
      return;
    }
    if (Number.isFinite(Number(layout.x))) layout.x = Math.round(Number(layout.x) * scaleX);
    if (Number.isFinite(Number(layout.y))) layout.y = Math.round(Number(layout.y) * scaleY);
    if (Number.isFinite(Number(layout.width))) layout.width = Math.max(1, Math.round(Number(layout.width) * scaleX));
    if (Number.isFinite(Number(layout.height))) layout.height = Math.max(1, Math.round(Number(layout.height) * scaleY));
  }

  function applyStageStyle(root, page) {
    const stage = normalizeStage(page?.stage);
    root.classList.toggle("is-transparent-stage", stage.backgroundType === "transparent");
    if (stage.backgroundType === "white") {
      root.style.setProperty("--tb-stage-background", "#ffffff");
      return;
    }
    if (stage.backgroundType === "solid") {
      root.style.setProperty("--tb-stage-background", stage.backgroundColor || "#ffffff");
      return;
    }
    root.style.setProperty("--tb-stage-background", "transparent");
  }

  function normalizeColor(value) {
    const text = String(value || "").trim();
    if (/^#[0-9a-f]{6}$/i.test(text)) {
      return text.toLowerCase();
    }
    if (/^#[0-9a-f]{3}$/i.test(text)) {
      return `#${text[1]}${text[1]}${text[2]}${text[2]}${text[3]}${text[3]}`.toLowerCase();
    }
    return "#ffffff";
  }

  function getRenderableLayers(page) {
    return (page.layers || []).slice().sort((a, b) => {
      return getLayerRenderRank(a) - getLayerRenderRank(b);
    });
  }

  function getLayerRenderRank(layer) {
    if (layer?.role === "background") {
      return 0;
    }
    if (layer?.role === "hit-area") {
      return 2;
    }
    if (layer?.role === "markup") {
      return 3;
    }
    return 1;
  }

  function isLayerVisibleInViewport(layer, viewportKey, sceneId = "") {
    const effective = window.TBalanceNativeScenes?.resolveLayerState?.(layer, viewportKey, sceneId) || layer;
    if (effective.visible === false || (!layer.base && layer.visible === false) || layer.visibilityMode === "hidden") {
      return false;
    }
    if (layer.visibilityMode === "desktop") {
      return viewportKey === "desktop";
    }
    if (layer.visibilityMode === "mobile") {
      return viewportKey === "mobile";
    }
    return true;
  }

  function createLayerNode(layer, viewportKey, index, settings) {
    const resolvedLayout = window.TBalanceNativeScenes?.resolveLayerState?.(layer, viewportKey, settings.sceneId) || getLayerLayout(layer, viewportKey);
    const layout = layer.role === "background"
      ? Object.assign({}, resolvedLayout, createFullCanvasLayout(settings.pageSize))
      : resolvedLayout;
    const appearance = Object.assign({}, getAppearance(layer));
    if (Object.prototype.hasOwnProperty.call(layout, "opacity")) {
      appearance.opacity = layout.opacity;
    }
    const node = document.createElement(layer.link && !settings.edit ? "a" : "div");
    node.className = `tb-layer tb-layer--${layer.type || "image"}`;
    node.classList.toggle("is-background-layer", layer.role === "background");
    const isHitAreaLayer = layer.role === "hit-area" || Boolean(layer.hitArea?.enabled);
    node.classList.toggle("is-hit-area-layer", isHitAreaLayer);
    node.classList.toggle("is-test-hit-layer", Boolean(settings.test) && layer.role === "hit-area");
    const hasClickAction = Boolean(layer.link || (layer.clickAction?.type && layer.clickAction.type !== "none"));
    node.classList.toggle("is-test-clickable", Boolean(settings.test) && hasClickAction);
    const selectedIds = Array.isArray(settings.selectedIds) ? settings.selectedIds : [];
    node.classList.toggle("is-selected", settings.edit && (layer.id === settings.selectedId || selectedIds.includes(layer.id)));
    node.classList.toggle("is-locked", Boolean(layer.locked));
    node.dataset.layerId = layer.id;
    node.style.left = `${layout.x}px`;
    node.style.top = `${layout.y}px`;
    node.style.width = `${Math.max(1, layout.width)}px`;
    node.style.height = `${Math.max(1, layout.height)}px`;
    node.style.zIndex = String(index + 1);
    node.style.transform = `rotate(${Number(layout.rotation) || 0}deg) scale(${layer.flipX ? -1 : 1}, ${layer.flipY ? -1 : 1})`;
    node.style.opacity = String(clamp(appearance.opacity, 0, 1));
    node.style.filter = buildFilter(appearance);
    applyAnimationStyle(node, layer.animation, settings);
    applyCornerMask(node, layer);
    if (appearance.shadow && appearance.shadow !== "none") {
      node.classList.add("has-shadow");
    }
    if (layer.link && !settings.edit) {
      node.href = layer.link;
    }
    node.setAttribute("aria-label", layer.name || layer.id);
    bindLayerSound(node, layer, settings);

    if (layer.type === "text") {
      node.appendChild(createTextContent(layer, viewportKey, settings));
    } else if (layer.type === "button") {
      node.appendChild(createButtonContent(layer));
    } else if (layer.type === "shape") {
      node.appendChild(createShapeContent(layer));
    } else {
      node.appendChild(createImageContent(layer, viewportKey, settings));
    }
    if (hasLayerSound(layer)) {
      node.appendChild(createSoundBadge(layer));
    }

    if (settings.edit) {
      node.addEventListener("pointerdown", (event) => {
        if (typeof settings.onSelect === "function") {
          settings.onSelect(layer.id, event);
        }
      });
    } else if ((hasClickAction || settings.test) && typeof settings.onAction === "function") {
      node.addEventListener("click", (event) => {
        settings.onAction(layer, event);
      });
    }
    if (layer.animation?.enabled && layer.animation?.trigger === "click") {
      node.style.animationPlayState = "paused";
      node.addEventListener("click", () => {
        node.style.animation = "none";
        void node.offsetWidth;
        applyAnimationStyle(node, layer.animation);
        node.style.animationPlayState = "running";
      });
    }

    return node;
  }

  function createFullCanvasLayout(size) {
    return {
      x: 0,
      y: 0,
      width: Math.max(1, Math.round(Number(size?.width) || 1)),
      height: Math.max(1, Math.round(Number(size?.height) || 1)),
      rotation: 0,
    };
  }

  function bindLayerSound(node, layer, settings) {
    if (settings.edit || !hasLayerSound(layer)) {
      return;
    }
    const sounds = getLayerSounds(layer);
    if (sounds.show || sounds.bgm) {
      window.setTimeout(() => {
        playRuntimeSound(sounds.show, settings.project);
        playRuntimeSound(sounds.bgm, settings.project);
      }, 0);
    }
    if (sounds.hover) {
      node.addEventListener("pointerenter", () => playRuntimeSound(sounds.hover, settings.project));
    }
    if (sounds.click) {
      node.addEventListener("click", () => playRuntimeSound(sounds.click, settings.project));
    }
  }

  function playRuntimeSound(sound, project) {
    const resolved = resolveSoundSource(sound, project);
    if (!resolved.src) {
      return;
    }
    try {
      const audio = new Audio(resolved.src);
      audio.volume = clamp(Number(resolved.volume ?? 80) / 100, 0, 1);
      audio.loop = Boolean(resolved.loop);
      audio.preload = "auto";
      runtimeAudioState.sfx.add(audio);
      const cleanup = () => runtimeAudioState.sfx.delete(audio);
      audio.addEventListener("ended", cleanup, { once: true });
      audio.addEventListener("pause", cleanup, { once: true });
      audio.play().catch(() => {});
    } catch (error) {
      // Audio playback is best-effort because browsers can block autoplay.
    }
  }

  function syncPageAudio(page, settings) {
    const bgm = getPageBgmSound(page, settings);
    const ambient = getPageAmbientSounds(page, settings);
    if (settings.edit) {
      stopPageAudio();
      return;
    }
    if (!settings.test) {
      return;
    }
    if (!bgm?.src && !ambient.length) {
      stopPageAudio();
      return;
    }
    const bgmKey = [
      page?.id || page?.pageId || "",
      settings.sceneId || "",
      bgm?.src || "",
      bgm?.volume ?? 80,
      bgm?.loop ? "loop" : "once",
    ].join("|");
    const ambientKey = ambient.map((sound) => [
      sound.src,
      sound.volume ?? 80,
      sound.loop ? "loop" : "once",
    ].join("|")).join("||");
    if (runtimeAudioState.bgmKey === bgmKey && runtimeAudioState.ambientKey === ambientKey) {
      return;
    }
    stopPageAudio();
    try {
      if (bgm?.src) {
        const audio = createPersistentAudio(bgm, true);
        runtimeAudioState.bgm = audio;
        runtimeAudioState.bgmKey = bgmKey;
      }
      runtimeAudioState.ambient = ambient.map((sound) => createPersistentAudio(sound, true));
      runtimeAudioState.ambientKey = ambientKey;
      window.TBalanceNativeAudioState = runtimeAudioState;
      playPageAudioWhenAllowed();
    } catch (error) {
      stopPageAudio();
    }
  }

  function getPageBgmSound(page, settings) {
    const sceneSound = settings.sceneId
      ? page?.sceneOverrides?.[settings.sceneId]?.sounds?.bgm
      : null;
    const sound = sceneSound || page?.sounds?.bgm;
    return normalizeRenderableSound(sound, settings.project);
  }

  function getPageAmbientSounds(page, settings) {
    const sceneAmbient = settings.sceneId
      ? page?.sceneOverrides?.[settings.sceneId]?.sounds?.ambient
      : null;
    const ambient = Array.isArray(sceneAmbient) ? sceneAmbient : page?.sounds?.ambient;
    return (Array.isArray(ambient) ? ambient : [])
      .map((sound) => normalizeRenderableSound(sound, settings.project))
      .filter(Boolean);
  }

  function normalizeRenderableSound(sound, project) {
    const resolved = resolveSoundSource(sound, project);
    return resolved.enabled && resolved.src ? resolved : null;
  }

  function resolveSoundSource(sound, project) {
    const copy = Object.assign({ enabled: false, src: "", fileName: "", volume: 80, loop: false }, sound || {});
    if (!copy.src && (copy.assetRef || copy.assetId) && window.TBalanceNativeAssets) {
      const asset = window.TBalanceNativeAssets.findAsset?.(project, copy.assetRef || copy.assetId);
      copy.src = window.TBalanceNativeAssets.resolveAssetSrc?.(asset) || "";
      copy.fileName = copy.fileName || asset?.displayName || asset?.fileName || "";
    }
    return copy;
  }

  function createPersistentAudio(sound, defaultLoop) {
    const audio = new Audio(sound.src);
    audio.volume = clamp(Number(sound.volume ?? 80) / 100, 0, 1);
    audio.loop = sound.loop !== false ? Boolean(sound.loop ?? defaultLoop) : false;
    audio.preload = "auto";
    return audio;
  }

  function playPageAudioWhenAllowed() {
    const tryPlay = () => {
      const audios = getPersistentAudios();
      if (!audios.length) {
        removePageBgmUnlockHandlers();
        return;
      }
      let pending = 0;
      audios.forEach((audio) => {
        pending += 1;
        audio.play()
          .then(() => {
            pending -= 1;
            if (pending <= 0) {
              removePageBgmUnlockHandlers();
            }
          })
          .catch(() => {});
      });
    };
    const events = ["pointerdown", "click", "keydown", "touchstart"];
    removePageBgmUnlockHandlers();
    runtimeAudioState.unlockHandlers = events.map((eventName) => {
      const handler = () => tryPlay();
      document.addEventListener(eventName, handler, true);
      return { eventName, handler };
    });
    tryPlay();
  }

  function getPersistentAudios() {
    return [runtimeAudioState.bgm].concat(runtimeAudioState.ambient || []).filter(Boolean);
  }

  function removePageBgmUnlockHandlers() {
    runtimeAudioState.unlockHandlers.forEach(({ eventName, handler }) => {
      document.removeEventListener(eventName, handler, true);
    });
    runtimeAudioState.unlockHandlers = [];
  }

  function stopPageAudio() {
    removePageBgmUnlockHandlers();
    getPersistentAudios().forEach((audio) => audio.pause());
    runtimeAudioState.bgm = null;
    runtimeAudioState.bgmKey = "";
    runtimeAudioState.ambient = [];
    runtimeAudioState.ambientKey = "";
    window.TBalanceNativeAudioState = runtimeAudioState;
  }

  function cleanupRuntimeAudio() {
    stopPageAudio();
    runtimeAudioState.sfx.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    runtimeAudioState.sfx.clear();
    window.TBalanceNativeAudioState = runtimeAudioState;
  }

  function hasLayerSound(layer) {
    return Object.values(getLayerSounds(layer)).some(Boolean);
  }

  function getLayerSounds(layer) {
    const result = {};
    const sounds = Object.assign({}, layer?.sounds || {});
    if (layer?.sound && !sounds.click) {
      sounds.click = layer.sound;
    }
    ["bgm", "hover", "click", "show"].forEach((mode) => {
      const sound = sounds[mode];
      if (sound?.enabled && (sound.src || sound.fileName || sound.assetRef || sound.assetId)) {
        result[mode] = sound;
      }
    });
    return result;
  }

  function createSoundBadge(layer) {
    const badge = document.createElement("span");
    badge.className = "tb-layer-sound-badge";
    const count = Object.keys(getLayerSounds(layer)).length;
    badge.title = count > 1 ? `サウンド設定あり: ${count}件` : "サウンド設定あり";
    badge.setAttribute("aria-label", "サウンド設定あり");
    badge.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16 9.5c1.1 1.3 1.1 3.7 0 5"/><path d="M18.7 7c2.3 2.8 2.3 7.2 0 10"/></svg>';
    return badge;
  }

  function createImageContent(layer, viewportKey, settings) {
    const media = getLayerMediaInfo(layer, viewportKey, settings);
    const src = media.src;
    const isPaintLayer = layer.role === "pen" || layer.role === "clone" || layer.paint?.mode === "pixel" || layer.paint?.mode === "clone";
    const wrapper = document.createElement("div");
    wrapper.className = "tb-layer-image-frame";
    wrapper.classList.toggle("is-background-image", layer.role === "background");
    const warning = document.createElement("div");
    warning.className = "tb-image-error";
    warning.innerHTML = `<strong>画像を表示できません</strong><span>${layer.name || "画像レイヤー"} を読み込めません。</span>`;
    if (media.mediaType === "video/webm") {
      const video = document.createElement("video");
      video.className = "tb-layer-video";
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = "auto";
      video.controls = false;
      video.disablePictureInPicture = true;
      video.setAttribute("muted", "");
      video.setAttribute("loop", "");
      video.setAttribute("autoplay", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("aria-label", layer.name || "動画背景");
      const forcedWarning = typeof settings.isImageWarning === "function" && settings.isImageWarning(layer, viewportKey);
      if (!src || forcedWarning) {
        wrapper.classList.add("has-image-error");
        if (!src) {
          notifyImageStatus(settings, layer.id, viewportKey, "error");
        }
      }
      video.addEventListener("error", () => {
        wrapper.classList.add("has-image-error");
        notifyImageStatus(settings, layer.id, viewportKey, "error");
      });
      video.addEventListener("loadeddata", () => {
        wrapper.classList.remove("has-image-error");
        notifyImageStatus(settings, layer.id, viewportKey, "ok");
        if (!settings.edit || layer.role === "background") {
          video.play?.().catch?.(() => {});
        }
      });
      video.src = src;
      wrapper.appendChild(video);
      wrapper.appendChild(warning);
      return wrapper;
    }
    if (Array.isArray(layer.stamps) && layer.stamps.length) {
      renderCloneStamps(wrapper, layer, viewportKey);
      wrapper.appendChild(warning);
      notifyImageStatus(settings, layer.id, viewportKey, "ok");
      return wrapper;
    }
    const img = document.createElement("img");
    img.alt = layer.name || "";
    img.draggable = false;
    const forcedWarning = typeof settings.isImageWarning === "function" && settings.isImageWarning(layer, viewportKey);
    if ((!src && !isPaintLayer) || forcedWarning) {
      wrapper.classList.add("has-image-error");
    }
    if (!src && !isPaintLayer) {
      notifyImageStatus(settings, layer.id, viewportKey, "error");
    }
    img.addEventListener("error", () => {
      if (!isPaintLayer) {
        wrapper.classList.add("has-image-error");
        notifyImageStatus(settings, layer.id, viewportKey, "error");
      }
    });
    img.addEventListener("load", () => {
      applyImageCrop(wrapper, img, layer);
      const visuallyEmpty = isImageVisuallyEmpty(img, layer, viewportKey, settings.sceneId);
      wrapper.classList.toggle("has-image-error", visuallyEmpty && !isPaintLayer);
      notifyImageStatus(settings, layer.id, viewportKey, visuallyEmpty && !isPaintLayer ? "error" : "ok");
    });
    img.src = src;
    if (src && img.complete) {
      window.setTimeout(() => {
        if (!img.naturalWidth || !img.naturalHeight) {
          if (!isPaintLayer) {
            wrapper.classList.add("has-image-error");
            notifyImageStatus(settings, layer.id, viewportKey, "error");
          }
          return;
        }
        applyImageCrop(wrapper, img, layer);
        const visuallyEmpty = isImageVisuallyEmpty(img, layer, viewportKey, settings.sceneId);
        wrapper.classList.toggle("has-image-error", visuallyEmpty && !isPaintLayer);
        notifyImageStatus(settings, layer.id, viewportKey, visuallyEmpty && !isPaintLayer ? "error" : "ok");
      }, 0);
    }
    wrapper.appendChild(img);
    wrapper.appendChild(warning);
    return wrapper;
  }

  function renderCloneStamps(wrapper, layer, viewportKey) {
    const key = getViewportKey(viewportKey);
    const stamps = layer.stamps.filter((stamp) => !stamp.viewport || stamp.viewport === key);
    stamps.forEach((stamp) => {
      if (!stamp.src || !stamp.source || !stamp.destination) {
        return;
      }
      const frame = document.createElement("div");
      const source = stamp.source;
      const destination = stamp.destination;
      frame.className = "tb-clone-stamp";
      if (stamp.tip === "square") {
        frame.classList.add("is-square-tip");
      }
      frame.style.left = `${Number(destination.x) || 0}px`;
      frame.style.top = `${Number(destination.y) || 0}px`;
      frame.style.width = `${Math.max(1, Number(destination.width) || 1)}px`;
      frame.style.height = `${Math.max(1, Number(destination.height) || 1)}px`;
      const img = document.createElement("img");
      img.alt = "";
      img.draggable = false;
      img.addEventListener("load", () => {
        const cropWidth = Math.max(1, Number(source.width) || img.naturalWidth);
        const cropHeight = Math.max(1, Number(source.height) || img.naturalHeight);
        const scale = Math.max(
          Math.max(1, Number(destination.width) || 1) / cropWidth,
          Math.max(1, Number(destination.height) || 1) / cropHeight,
        );
        img.style.left = `${-(Number(source.x) || 0) * scale}px`;
        img.style.top = `${-(Number(source.y) || 0) * scale}px`;
        img.style.width = `${img.naturalWidth * scale}px`;
        img.style.height = `${img.naturalHeight * scale}px`;
      });
      img.src = stamp.src;
      frame.appendChild(img);
      wrapper.appendChild(frame);
    });
  }

  function applyImageCrop(wrapper, img, layer) {
    const crop = layer.crop;
    if (!crop || !img.naturalWidth || !img.naturalHeight) {
      img.style.position = "";
      img.style.left = "";
      img.style.top = "";
      img.style.width = "";
      img.style.height = "";
      img.style.maxWidth = "";
      img.style.maxHeight = "";
      img.style.objectFit = "";
      return;
    }
    const cropWidth = Math.max(1, Number(crop.width) || img.naturalWidth);
    const cropHeight = Math.max(1, Number(crop.height) || img.naturalHeight);
    const boxWidth = Math.max(1, wrapper.clientWidth || cropWidth);
    const boxHeight = Math.max(1, wrapper.clientHeight || cropHeight);
    const scale = Math.max(boxWidth / cropWidth, boxHeight / cropHeight);
    img.style.position = "absolute";
    img.style.left = `${-(Number(crop.x) || 0) * scale}px`;
    img.style.top = `${-(Number(crop.y) || 0) * scale}px`;
    img.style.width = `${img.naturalWidth * scale}px`;
    img.style.height = `${img.naturalHeight * scale}px`;
    img.style.maxWidth = "none";
    img.style.maxHeight = "none";
    img.style.objectFit = "fill";
  }

  function notifyImageStatus(settings, layerId, viewportKey, status) {
    if (typeof settings.onImageStatus !== "function") {
      return;
    }
    const notify = () => settings.onImageStatus(layerId, status, getViewportKey(viewportKey));
    if (typeof window.queueMicrotask === "function") {
      window.queueMicrotask(notify);
    } else {
      window.setTimeout(notify, 0);
    }
  }

  function isImageVisuallyEmpty(img, layer, viewportKey, sceneId = "") {
    if (!img.naturalWidth || !img.naturalHeight) {
      return true;
    }
    try {
      const sampleSize = 64;
      const layout = window.TBalanceNativeScenes?.resolveLayerState?.(layer, viewportKey, sceneId) || getLayerLayout(layer, viewportKey);
      const boxWidth = Math.max(1, Number(layout.width) || img.naturalWidth);
      const boxHeight = Math.max(1, Number(layout.height) || img.naturalHeight);
      const imageRatio = img.naturalWidth / img.naturalHeight;
      const boxRatio = boxWidth / boxHeight;
      let sourceWidth = img.naturalWidth;
      let sourceHeight = img.naturalHeight;
      let sourceX = 0;
      let sourceY = 0;
      if (boxRatio > imageRatio) {
        sourceHeight = img.naturalWidth / boxRatio;
        sourceY = (img.naturalHeight - sourceHeight) / 2;
      } else {
        sourceWidth = img.naturalHeight * boxRatio;
        sourceX = (img.naturalWidth - sourceWidth) / 2;
      }
      const width = Math.min(sampleSize, Math.max(1, Math.round(sourceWidth)));
      const height = Math.min(sampleSize, Math.max(1, Math.round(sourceHeight)));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
      const data = context.getImageData(0, 0, width, height).data;
      let visiblePixels = 0;
      for (let index = 3; index < data.length; index += 4) {
        if (data[index] > 24) {
          visiblePixels += 1;
        }
      }
      return visiblePixels / (width * height) < 0.01;
    } catch (error) {
      return false;
    }
  }

  function getLayerImageSrc(layer, viewportKey, settings = {}) {
    return getLayerMediaInfo(layer, viewportKey, settings).src;
  }

  function getLayerMediaInfo(layer, viewportKey, settings = {}) {
    const effective = window.TBalanceNativeScenes?.resolveLayerState?.(layer, viewportKey, settings.sceneId) || {};
    const assetLayer = Object.assign({}, layer, {
      assetRef: effective.assetRef || layer?.assetRef,
      assetId: effective.assetId || effective.assetRef || layer?.assetId,
    });
    const asset = window.TBalanceNativeAssets?.findAsset?.(settings.project, assetLayer.assetRef || assetLayer.assetId);
    const resolved = window.TBalanceNativeAssets?.resolveLayerAssetSrc?.(settings.project, assetLayer, viewportKey);
    if (resolved) {
      return { src: resolved, mediaType: asset?.mediaType || "" };
    }
    if (viewportKey === "mobile") {
      return { src: layer.mobileSrc || layer.src || layer.desktopSrc || "", mediaType: "" };
    }
    return { src: layer.desktopSrc || layer.src || layer.mobileSrc || "", mediaType: "" };
  }

  function getTextStyle(layer, viewportKey) {
    const key = getViewportKey(viewportKey);
    return Object.assign({
      fontSize: 48,
      color: "#fff6db",
      align: "left",
      weight: 600,
      fontFamily: "",
      italic: false,
      underline: false,
      lineHeight: 1.22,
      strokeEnabled: false,
      strokeColor: "#0b1220",
      strokeWidth: 0,
    }, layer.style || {}, layer[`${key}Style`] || {});
  }

  function createTextContent(layer, viewportKey, settings = {}) {
    const content = document.createElement("div");
    const style = getTextStyle(layer, viewportKey);
    content.className = "tb-layer-text";
    if (layer.role === "memo") {
      content.classList.add("tb-layer-text--memo");
    }
    if (layer.role === "dialogue-text") {
      content.classList.add("tb-layer-text--dialogue");
    }
    const runtimeText = typeof settings.getRuntimeText === "function" ? settings.getRuntimeText(layer.id, layer) : null;
    content.textContent = runtimeText || layer.text || "テキスト";
    content.style.fontSize = `${Number(style.fontSize) || 48}px`;
    content.style.color = style.color || "#fff6db";
    content.style.textAlign = style.align || "left";
    content.style.fontWeight = style.weight || 600;
    content.style.lineHeight = String(Number(style.lineHeight) || 1.22);
    content.style.fontFamily = style.fontFamily || "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    content.style.fontStyle = style.italic ? "italic" : "normal";
    content.style.transform = style.italic ? "skewX(-10deg)" : "";
    content.style.transformOrigin = "center";
    content.style.textDecoration = style.underline ? "underline" : "none";
    if (layer.role === "dialogue-text") {
      content.style.textWrap = "balance";
    }
    const strokeWidth = Number(style.strokeWidth || 0);
    if (style.strokeEnabled && strokeWidth > 0) {
      content.style.webkitTextStroke = `${strokeWidth}px ${style.strokeColor || "#0b1220"}`;
      content.style.paintOrder = "stroke fill";
    } else {
      content.style.webkitTextStroke = "0 transparent";
      content.style.paintOrder = "normal";
    }
    return content;
  }

  function createButtonContent(layer) {
    const content = document.createElement("div");
    const style = Object.assign({
      color: "#fff6db",
      background: "rgba(0, 0, 0, 0.22)",
      borderColor: "rgba(255, 246, 219, 0.86)",
    }, layer.style || {});
    content.className = "tb-layer-button";
    content.textContent = layer.text || "ボタン";
    content.style.color = style.color;
    content.style.background = style.background;
    content.style.borderColor = style.borderColor;
    return content;
  }

  function createShapeContent(layer) {
    const shape = layer.shape || {};
    const type = shape.type || "rect";
    const flushToBounds = layer.role === "fill" || layer.role === "hit-area";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    const fillEnabled = shape.fillEnabled !== false && shape.fill !== "none";
    const fill = fillEnabled ? (shape.fill || (type === "marker" ? "rgba(255, 214, 86, 0.42)" : "#fff6db")) : "none";
    const strokeEnabled = shape.strokeEnabled !== false && shape.stroke !== "none" && Number(shape.strokeWidth ?? (type === "marker" ? 12 : 4)) > 0;
    const stroke = strokeEnabled ? (shape.stroke || "#2f8cff") : "none";
    const strokeWidth = strokeEnabled ? String(Number(shape.strokeWidth || (type === "marker" ? 12 : 4))) : "0";
    const radius = String(Math.max(0, Math.min(50, Number(shape.radius ?? (type === "roundRect" ? 14 : 0)))));
    const add = (node) => {
      node.setAttribute("fill", fill);
      node.setAttribute("stroke", stroke);
      node.setAttribute("stroke-width", strokeWidth);
      node.setAttribute("vector-effect", "non-scaling-stroke");
      svg.appendChild(node);
    };
    if (type === "ellipse") {
      const node = document.createElementNS(svg.namespaceURI, "ellipse");
      node.setAttribute("cx", "50");
      node.setAttribute("cy", "50");
      node.setAttribute("rx", flushToBounds ? "50" : "46");
      node.setAttribute("ry", flushToBounds ? "50" : "46");
      add(node);
    } else if (type === "speechBubble") {
      const node = document.createElementNS(svg.namespaceURI, "path");
      node.setAttribute("d", "M15 8 H85 Q96 8 96 20 V68 Q96 80 85 80 H57 L50 95 L43 80 H15 Q4 80 4 68 V20 Q4 8 15 8 Z");
      add(node);
    } else if (layer.role === "dialogue-bubble") {
      const node = document.createElementNS(svg.namespaceURI, "path");
      node.setAttribute("d", "M50 5 C24 5 6 16 6 50 C6 84 24 95 50 95 H50 C76 95 94 84 94 50 C94 16 76 5 50 5 Z");
      add(node);
    } else if (type === "triangle") {
      const node = document.createElementNS(svg.namespaceURI, "polygon");
      node.setAttribute("points", "50,6 94,94 6,94");
      add(node);
    } else if (type === "diamond") {
      const node = document.createElementNS(svg.namespaceURI, "polygon");
      node.setAttribute("points", "50,4 96,50 50,96 4,50");
      add(node);
    } else if (type === "arrow") {
      const node = document.createElementNS(svg.namespaceURI, "polygon");
      node.setAttribute("points", "4,38 62,38 62,18 96,50 62,82 62,62 4,62");
      add(node);
    } else if (type === "line") {
      const node = document.createElementNS(svg.namespaceURI, "line");
      node.setAttribute("x1", "6");
      node.setAttribute("y1", "50");
      node.setAttribute("x2", "94");
      node.setAttribute("y2", "50");
      node.setAttribute("fill", "none");
      node.setAttribute("stroke", stroke);
      node.setAttribute("stroke-width", strokeWidth);
      node.setAttribute("stroke-linecap", "round");
      node.setAttribute("vector-effect", "non-scaling-stroke");
      svg.appendChild(node);
    } else if (type === "pen" || type === "marker") {
      const strokes = getPenStrokes(shape);
      strokes.forEach((strokeItem) => {
        const strokePoints = Array.isArray(strokeItem) ? strokeItem : strokeItem.points;
        const node = document.createElementNS(svg.namespaceURI, "path");
        node.setAttribute("d", buildPenPath(strokePoints) || "M8 62 C22 22, 38 88, 54 46 S82 18, 94 52");
        node.setAttribute("fill", "none");
        node.setAttribute("stroke", type === "marker" ? fill : (strokeItem.color || stroke));
        node.setAttribute("stroke-width", String(Number(strokeItem.width || strokeWidth)));
        node.setAttribute("stroke-opacity", String(strokeItem.opacity ?? 1));
        node.setAttribute("stroke-linecap", (strokeItem.tip || shape.brushTip) === "square" ? "butt" : "round");
        node.setAttribute("stroke-linejoin", (strokeItem.tip || shape.brushTip) === "square" ? "miter" : "round");
        node.setAttribute("vector-effect", "non-scaling-stroke");
        svg.appendChild(node);
      });
    } else {
      const node = document.createElementNS(svg.namespaceURI, "rect");
      node.setAttribute("x", flushToBounds ? "0" : "4");
      node.setAttribute("y", flushToBounds ? "0" : "4");
      node.setAttribute("width", flushToBounds ? "100" : "92");
      node.setAttribute("height", flushToBounds ? "100" : "92");
      node.setAttribute("rx", radius);
      add(node);
    }
    return svg;
  }

  function getPenStrokes(shape) {
    if (Array.isArray(shape.strokes) && shape.strokes.length) {
      return shape.strokes;
    }
    return Array.isArray(shape.points) && shape.points.length ? [shape.points] : [];
  }

  function buildPenPath(points) {
    if (!Array.isArray(points) || !points.length) {
      return "";
    }
    const safe = points
      .map((point) => ({
        x: clamp(Number(point.x) || 0, 0, 100),
        y: clamp(Number(point.y) || 0, 0, 100),
      }));
    if (safe.length === 1) {
      const point = safe[0];
      return `M${point.x} ${point.y} l0.1 0.1`;
    }
    let d = `M${safe[0].x} ${safe[0].y}`;
    for (let index = 1; index < safe.length - 1; index += 1) {
      const current = safe[index];
      const next = safe[index + 1];
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      d += ` Q${current.x} ${current.y} ${midX} ${midY}`;
    }
    const last = safe[safe.length - 1];
    d += ` L${last.x} ${last.y}`;
    return d;
  }

  function applyCornerMask(node, layer) {
    if (!layer.corners || layer.transformMode === "normal") {
      return;
    }
    const corners = layer.corners;
    const points = [corners.topLeft, corners.topRight, corners.bottomRight, corners.bottomLeft]
      .map((point) => `${clamp(point.x, -0.5, 1.5) * 100}% ${clamp(point.y, -0.5, 1.5) * 100}%`)
      .join(", ");
    node.style.clipPath = `polygon(${points})`;
  }

  function createHitAreaNode(layer, viewportKey, index, sceneId = "") {
    const layout = window.TBalanceNativeScenes?.resolveLayerState?.(layer, viewportKey, sceneId) || getLayerLayout(layer, viewportKey);
    const hit = Object.assign({
      x: 0,
      y: 0,
      width: layout.width,
      height: layout.height,
    }, layer.hitArea || {});
    const node = document.createElement("div");
    node.className = "tb-hit-area";
    node.style.left = `${layout.x + Number(hit.x || 0)}px`;
    node.style.top = `${layout.y + Number(hit.y || 0)}px`;
    node.style.width = `${Math.max(1, Number(hit.width || layout.width))}px`;
    node.style.height = `${Math.max(1, Number(hit.height || layout.height))}px`;
    node.style.zIndex = String(4600 + index);
    return node;
  }

  function buildFilter(appearance) {
    const brightness = Number(appearance.brightness);
    const filters = [`brightness(${Number.isFinite(brightness) ? brightness : 1})`];
    if (appearance.shadow && appearance.shadow !== "none") {
      const shadowSize = clamp(Number(appearance.shadowSize ?? 16), 0, 80);
      const shadowOpacity = clamp(Number(appearance.shadowOpacity ?? 38), 0, 100) / 100;
      const baseColor = appearance.shadowColor || "#000000";
      if (appearance.shadowType === "solid") {
        const solidColor = toRgba(baseColor, shadowOpacity);
        const offset = Math.max(1, Math.round(shadowSize * 0.62));
        filters.push(`drop-shadow(${offset}px ${offset}px 0 ${solidColor})`);
        return filters.join(" ");
      }
      const contactColor = toRgba(baseColor, Math.min(1, shadowOpacity * 0.92));
      const castColor = toRgba(baseColor, shadowOpacity);
      const contactOffset = Math.max(1, Math.round(shadowSize * 0.12));
      const contactBlur = Math.max(2, Math.round(shadowSize * 0.22));
      const offsetY = Math.round(shadowSize * 0.55);
      const blur = Math.max(2, Math.round(shadowSize * 0.92));
      filters.push(`drop-shadow(0 ${contactOffset}px ${contactBlur}px ${contactColor})`);
      filters.push(`drop-shadow(0 ${offsetY}px ${blur}px ${castColor})`);
    }
    return filters.join(" ");
  }

  function normalizeAnimation(animation) {
    const copy = Object.assign({
      enabled: false,
      type: "none",
      trigger: "load",
      duration: 1,
      delay: 0,
      repeat: "once",
      direction: "up",
      strength: 30,
    }, animation || {});
    copy.type = ["none", "fadeIn", "fadeOut", "zoomIn", "slideIn", "pop", "float", "blink", "rotate"].includes(copy.type) ? copy.type : "none";
    copy.trigger = ["load", "click", "hover"].includes(copy.trigger) ? copy.trigger : "load";
    copy.repeat = copy.repeat === "loop" ? "loop" : "once";
    copy.direction = ["up", "down", "left", "right", "center"].includes(copy.direction) ? copy.direction : "up";
    copy.duration = clamp(Number(copy.duration) || 1, 0.1, 20);
    copy.delay = clamp(Number(copy.delay) || 0, 0, 20);
    copy.strength = clamp(Number(copy.strength) || 30, 1, 100);
    copy.enabled = copy.type !== "none" && copy.enabled !== false;
    return copy;
  }

  function applyAnimationStyle(node, animation, renderSettings) {
    if (renderSettings?.edit) {
      node.style.animation = "";
      node.style.animationPlayState = "";
      node.removeAttribute("data-animation-trigger");
      return;
    }
    const animationSettings = normalizeAnimation(animation);
    if (!animationSettings.enabled || animationSettings.type === "none") {
      node.style.animation = "";
      return;
    }
    node.dataset.animationTrigger = animationSettings.trigger;
    node.style.setProperty("--tb-anim-distance", `${Math.round(animationSettings.strength)}px`);
    const name = `tbAnim-${animationSettings.type}-${animationSettings.direction}`;
    const repeat = animationSettings.repeat === "loop" || ["float", "blink", "rotate"].includes(animationSettings.type) ? "infinite" : "1";
    const fillMode = animationSettings.repeat === "loop" ? "both" : "both";
    node.style.animation = `${name} ${animationSettings.duration}s ease ${animationSettings.delay}s ${repeat} ${fillMode}`;
    if (animationSettings.trigger === "hover") {
      node.style.animationPlayState = "paused";
    }
  }

  function toRgba(color, alpha) {
    const value = String(color || "").trim();
    if (value.startsWith("rgba(")) {
      return value.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `rgba($1,$2,$3,${alpha})`);
    }
    if (value.startsWith("rgb(")) {
      return value.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
    }
    const hex = value.replace("#", "");
    if (/^[0-9a-f]{6}$/i.test(hex)) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return `rgba(0, 0, 0, ${alpha})`;
  }

  function makeId(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  }

  function clamp(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return min;
    }
    return Math.max(min, Math.min(max, number));
  }

  window.TBalanceRenderer = {
    VIEWPORTS,
    clone,
    getViewportKey,
    getViewportSize,
    getPageViewportSize,
    getLayerLayout,
    getAppearance,
    normalizeStage,
    getTextStyle,
    normalizeProject,
    normalizeLayer,
    normalizeUiSettings,
    createBlankProject,
    createDefaultPage,
    renderPage,
    playRuntimeSound,
    cleanupRuntimeAudio,
    makeId,
    clamp,
  };
})();
