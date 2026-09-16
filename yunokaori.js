(function () {
  "use strict";

  const TBALANCE_PATH = "./data/tbalance/%E6%B9%AF%E3%81%AE%E9%A6%99%E3%82%8A%E6%B8%A9%E6%B3%89%E9%83%B7.tbalance";
  const MOBILE_QUERY = window.matchMedia("(max-aspect-ratio: 3 / 4), (max-width: 760px)");

  const fit = document.querySelector("[data-yunokaori-fit]");
  const stage = document.querySelector("[data-yunokaori-stage]");
  const audioState = {
    bgm: null,
    ambient: [],
    unlockButton: null,
    unlocked: false,
  };
  let tbalanceDocument = null;

  if (!fit || !stage) {
    return;
  }

  stage.dataset.loading = "true";
  stage.dataset.status = "湯の香り温泉郷を読み込んでいます";

  loadTBalance()
    .then((documentData) => {
      tbalanceDocument = documentData;
      stage.dataset.loading = "false";
      render();
      prepareAudio();
    })
    .catch((error) => {
      stage.dataset.loading = "false";
      stage.dataset.error = "true";
      stage.dataset.status = "湯の香り温泉郷を読み込めませんでした";
      console.error("Failed to load Yunokaori TBalance data.", error);
    });

  window.addEventListener("resize", resizeStage, { passive: true });
  window.addEventListener("orientationchange", resizeStage, { passive: true });
  if (typeof MOBILE_QUERY.addEventListener === "function") {
    MOBILE_QUERY.addEventListener("change", render);
  } else if (typeof MOBILE_QUERY.addListener === "function") {
    MOBILE_QUERY.addListener(render);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseAudio();
      return;
    }
    playAudio();
  });

  function loadTBalance() {
    return fetchJson(TBALANCE_PATH);
  }

  function fetchJson(path) {
    return fetch(path, { cache: "no-store" }).then((response) => {
      if (!response.ok) {
        throw new Error(`${path}: ${response.status}`);
      }
      return response.json();
    });
  }

  function render() {
    if (!tbalanceDocument) {
      return;
    }
    const page = getPage(tbalanceDocument);
    const viewport = getViewportKey();
    const size = getViewportSize(page, viewport);
    const assets = createAssetMap(tbalanceDocument);

    stage.replaceChildren();
    stage.dataset.viewport = viewport;
    stage.style.setProperty("--stage-width", `${size.width}px`);
    stage.style.setProperty("--stage-height", `${size.height}px`);
    fit.style.setProperty("--stage-width", `${size.width}px`);
    fit.style.setProperty("--stage-height", `${size.height}px`);

    getRenderableLayers(page).forEach((layer, index) => {
      if (!isLayerVisible(layer, viewport)) {
        return;
      }
      const node = createLayer(layer, viewport, assets, index);
      if (node) {
        stage.appendChild(node);
      }
    });

    resizeStage();
  }

  function getPage(documentData) {
    if (documentData?.page) {
      return documentData.page;
    }
    if (Array.isArray(documentData?.pages)) {
      return documentData.pages[0] || {};
    }
    return {};
  }

  function getViewportKey() {
    return MOBILE_QUERY.matches ? "mobile" : "desktop";
  }

  function getViewportSize(page, viewport) {
    const fallback = viewport === "mobile"
      ? { width: 1080, height: 1920 }
      : { width: 1920, height: 1080 };
    return Object.assign({}, fallback, page?.viewports?.[viewport] || page?.[viewport] || {});
  }

  function resizeStage() {
    const width = Number(stage.style.getPropertyValue("--stage-width").replace("px", "")) || 1920;
    const height = Number(stage.style.getPropertyValue("--stage-height").replace("px", "")) || 1080;
    const scale = Math.min(window.innerWidth / width, window.innerHeight / height);
    fit.style.setProperty("--stage-scale", String(scale || 1));
  }

  function createAssetMap(documentData) {
    const map = new Map();
    const register = (asset) => {
      if (!asset) {
        return;
      }
      const assetId = asset.assetId || asset.id;
      if (!assetId) {
        return;
      }
      map.set(assetId, asset);
    };
    (documentData.assetManifest || []).forEach(register);
    (documentData.assets || documentData.project?.assets || []).forEach(register);
    return map;
  }

  function getRenderableLayers(page) {
    return (page.layers || []).slice().sort((a, b) => {
      return getLayerRank(a) - getLayerRank(b);
    });
  }

  function getLayerRank(layer) {
    if (layer?.role === "background") {
      return 0;
    }
    if (layer?.role === "hit-area") {
      return 2;
    }
    return 1;
  }

  function isLayerVisible(layer, viewport) {
    if (!layer || layer.visible === false || layer.visibilityMode === "hidden") {
      return false;
    }
    if (layer.visibilityMode === "desktop") {
      return viewport === "desktop";
    }
    if (layer.visibilityMode === "mobile") {
      return viewport === "mobile";
    }
    const layout = getLayerState(layer, viewport);
    return layout.visible !== false;
  }

  function getLayerState(layer, viewport) {
    return Object.assign(
      {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        rotation: 0,
        opacity: layer?.appearance?.opacity ?? 1,
      },
      layer?.base || {},
      layer?.[viewport] || {},
      layer?.viewportOverrides?.[viewport] || {},
    );
  }

  function createLayer(layer, viewport, assets, index) {
    const state = getLayerState(layer, viewport);
    const assetId = state.assetId || state.assetRef || layer.assetId || layer.assetRef;
    const asset = assets.get(assetId) || {};
    const mediaType = asset.mediaType || "";
    const source = normalizeAssetPath(asset.relativePath || asset.url || asset.sourcePath || layer.src);
    const isVideo = mediaType.includes("video") || /\.webm($|\?)/i.test(source);
    const isBackground = layer.role === "background";
    const target = getClickTarget(layer);
    const node = target
      ? document.createElement("a")
      : document.createElement(layer.role === "hit-area" ? "a" : "div");

    node.className = `yunokaori-layer yunokaori-layer--${layer.type || "image"}`;
    node.classList.toggle("yunokaori-layer--background", isBackground);
    node.classList.toggle("yunokaori-layer--clickable", Boolean(target));
    node.dataset.layerId = layer.layerId || layer.id || "";
    node.dataset.assetId = assetId || "";
    node.style.left = `${Number(state.x) || 0}px`;
    node.style.top = `${Number(state.y) || 0}px`;
    node.style.width = `${Math.max(1, Number(state.width) || 1)}px`;
    node.style.height = `${Math.max(1, Number(state.height) || 1)}px`;
    node.style.zIndex = String(index + 1);
    node.style.opacity = String(Number(state.opacity ?? layer.appearance?.opacity ?? 1));
    node.style.setProperty("--layer-opacity", node.style.opacity);
    node.style.setProperty("--layer-rotation", `${Number(state.rotation) || 0}deg`);
    node.style.transform = `rotate(${Number(state.rotation) || 0}deg)`;

    applyAnimation(node, layer);

    if (target) {
      node.href = target;
      node.setAttribute("aria-label", layer.name || layer.displayName || "リンク");
      if (/^https?:/i.test(target)) {
        node.target = "_blank";
        node.rel = "noopener";
      }
    }

    if (layer.role === "hit-area") {
      node.classList.add("yunokaori-hit-area");
      if (!target) {
        node.href = "./index.html";
        node.setAttribute("aria-label", layer.name || "森へ戻る");
      }
      return node;
    }

    if (!source) {
      node.hidden = true;
      return node;
    }

    if (isVideo) {
      const video = document.createElement("video");
      video.src = source;
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "auto";
      node.appendChild(video);
    } else {
      const image = document.createElement("img");
      image.src = source;
      image.alt = "";
      image.decoding = "async";
      image.loading = "eager";
      node.appendChild(image);
    }

    return node;
  }

  function normalizeAssetPath(path) {
    const text = String(path || "").trim();
    if (!text) {
      return "";
    }
    if (/^(data:|https?:|\.\/|\/)/i.test(text)) {
      return text;
    }
    return `./${text}`;
  }

  function getClickTarget(layer) {
    const action = layer?.clickAction || {};
    if (action.type === "external" && action.target) {
      return action.target;
    }
    if (action.type === "page") {
      return resolvePageTarget(action.target || layer.link);
    }
    if (layer.link) {
      return resolvePageTarget(layer.link);
    }
    if (layer.name === "森へ戻る") {
      return "./index.html";
    }
    return "";
  }

  function resolvePageTarget(target) {
    const value = String(target || "").trim();
    if (!value || value === "#") {
      return "./index.html";
    }
    return value;
  }

  function applyAnimation(node, layer) {
    const animation = layer?.animation || {};
    if (!animation.enabled || animation.type === "none") {
      return;
    }
    node.dataset.animation = animation.type;
    node.style.animationDuration = `${Math.max(0.1, Number(animation.duration) || 1)}s`;
    node.style.animationDelay = `${Math.max(0, Number(animation.delay) || 0)}s`;
  }

  function prepareAudio() {
    const page = getPage(tbalanceDocument);
    const sounds = getPageSounds(page);
    if (!sounds.bgm && !sounds.ambient.length) {
      return;
    }
    audioState.bgm = sounds.bgm ? createAudio(sounds.bgm, true) : null;
    audioState.ambient = sounds.ambient.map((sound) => createAudio(sound, true)).filter(Boolean);
    playAudio();
    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });
  }

  function getPageSounds(page) {
    const bgm = normalizeSound(page?.sounds?.bgm);
    const ambient = Array.isArray(page?.sounds?.ambient)
      ? page.sounds.ambient.map(normalizeSound).filter(Boolean)
      : [];
    return { bgm, ambient };
  }

  function normalizeSound(sound) {
    if (!sound || sound.enabled === false) {
      return null;
    }
    const src = normalizeAssetPath(sound.src || sound.relativePath || sound.url || sound.sourcePath || "");
    if (!src) {
      return null;
    }
    return {
      src,
      volume: clamp(Number(sound.volume ?? 80) / 100, 0, 1),
      loop: sound.loop !== false,
    };
  }

  function createAudio(sound, defaultLoop) {
    const audio = new Audio(sound.src);
    audio.volume = clamp(sound.volume, 0, 1);
    audio.loop = sound.loop !== false ? Boolean(sound.loop ?? defaultLoop) : false;
    audio.preload = "auto";
    return audio;
  }

  function playAudio() {
    getAudios().forEach((audio) => {
      audio.play().then(() => {
        audioState.unlocked = true;
        setUnlockVisible(false);
      }).catch(() => {
        if (!audioState.unlocked) {
          setUnlockVisible(true);
        }
      });
    });
  }

  function pauseAudio() {
    getAudios().forEach((audio) => audio.pause());
  }

  function unlockAudio() {
    audioState.unlocked = true;
    playAudio();
  }

  function getAudios() {
    return [audioState.bgm].concat(audioState.ambient).filter(Boolean);
  }

  function setUnlockVisible(visible) {
    if (!audioState.unlockButton) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "yunokaori-audio-unlock";
      button.setAttribute("aria-label", "音を再生");
      button.textContent = "♪";
      button.addEventListener("click", unlockAudio);
      document.body.appendChild(button);
      audioState.unlockButton = button;
    }
    audioState.unlockButton.classList.toggle("is-visible", Boolean(visible));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
  }
})();
