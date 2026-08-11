(function () {
  "use strict";

  const VIEWPORTS = {
    desktop: { width: 1920, height: 1080, label: "PC 16:9" },
    mobile: { width: 1080, height: 1920, label: "Mobile 9:16" },
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

  function getLayerLayout(layer, viewportKey) {
    const key = getViewportKey(viewportKey);
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
    }, layer.appearance || {});
  }

  function normalizeProject(project) {
    const copy = clone(project || {});
    copy.format = "tbalance";
    copy.version = copy.version || "0.1.0";
    copy.projectId = copy.projectId || "teamerry";
    copy.name = copy.name || "TeaMerry";
    copy.editorMode = copy.editorMode === "custom" ? "custom" : "normal";
    copy.uiSettings = normalizeUiSettings(copy.uiSettings);
    copy.assets = Array.isArray(copy.assets) ? copy.assets : [];
    copy.pages = Array.isArray(copy.pages) && copy.pages.length ? copy.pages : [createDefaultPage()];
    copy.pages.forEach((page) => {
      page.id = page.id || makeId("page");
      page.name = page.name || "トップページ";
      page.desktop = Object.assign({}, VIEWPORTS.desktop, page.desktop || {});
      page.mobile = Object.assign({}, VIEWPORTS.mobile, page.mobile || {});
      page.layers = Array.isArray(page.layers) ? page.layers : [];
      page.layers.forEach(normalizeLayer);
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
      normalAccentColor: "#2f8cff",
      customAccentColor: "#7c5cff",
    }, settings || {});
    copy.rememberLastMode = copy.alwaysStartNormal ? false : copy.rememberLastMode !== false;
    copy.alwaysStartNormal = Boolean(copy.alwaysStartNormal);
    copy.developerPanelOpen = Boolean(copy.developerPanelOpen);
    copy.developerPanelHeight = Math.max(180, Number(copy.developerPanelHeight) || 280);
    return copy;
  }

  function normalizeLayer(layer) {
    layer.id = layer.id || makeId("layer");
    layer.type = layer.type || "image";
    layer.name = layer.name || layer.fileName || layer.id;
    layer.visible = layer.visible !== false;
    layer.locked = Boolean(layer.locked);
    layer.constraints = Object.assign({
      keepAspect: getDefaultKeepAspect(layer),
      keepSquare: false,
      keepCircle: false,
    }, layer.constraints || {});
    layer.transformMode = ["normal", "perspective", "free"].includes(layer.transformMode) ? layer.transformMode : "normal";
    layer.corners = Object.assign({
      topLeft: { x: 0, y: 0 },
      topRight: { x: 1, y: 0 },
      bottomRight: { x: 1, y: 1 },
      bottomLeft: { x: 0, y: 1 },
    }, layer.corners || {});
    layer.desktop = Object.assign({}, getLayerLayout(layer, "desktop"), layer.desktop || {});
    layer.mobile = Object.assign({}, getLayerLayout(layer, "mobile"), layer.mobile || {});
    layer.appearance = getAppearance(layer);
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
          mobile: { x: -1166, y: 0, width: 3413, height: 1920, rotation: 0 },
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

  function renderPage(target, page, viewportKey, options) {
    const root = typeof target === "string" ? document.querySelector(target) : target;
    const settings = Object.assign({
      edit: false,
      selectedId: "",
      showHitAreas: false,
      onSelect: null,
    }, options || {});
    const key = getViewportKey(viewportKey);
    const size = getViewportSize(key);
    root.innerHTML = "";
    root.style.width = `${size.width}px`;
    root.style.height = `${size.height}px`;
    root.dataset.viewport = key;

    (page.layers || []).forEach((layer, index) => {
      if (layer.visible === false) {
        return;
      }
      const node = createLayerNode(layer, key, index, settings);
      root.appendChild(node);
      if (settings.showHitAreas && layer.hitArea?.enabled) {
        root.appendChild(createHitAreaNode(layer, key, index));
      }
    });
  }

  function createLayerNode(layer, viewportKey, index, settings) {
    const layout = getLayerLayout(layer, viewportKey);
    const appearance = getAppearance(layer);
    const node = document.createElement(layer.link && !settings.edit ? "a" : "div");
    node.className = `tb-layer tb-layer--${layer.type || "image"}`;
    node.classList.toggle("is-selected", settings.edit && layer.id === settings.selectedId);
    node.classList.toggle("is-locked", Boolean(layer.locked));
    node.dataset.layerId = layer.id;
    node.style.left = `${layout.x}px`;
    node.style.top = `${layout.y}px`;
    node.style.width = `${Math.max(1, layout.width)}px`;
    node.style.height = `${Math.max(1, layout.height)}px`;
    node.style.zIndex = String(index + 1);
    node.style.transform = `rotate(${Number(layout.rotation) || 0}deg)`;
    node.style.opacity = String(clamp(appearance.opacity, 0, 1));
    node.style.filter = buildFilter(appearance);
    applyCornerMask(node, layer);
    if (appearance.shadow && appearance.shadow !== "none") {
      node.classList.add("has-shadow");
    }
    if (layer.link && !settings.edit) {
      node.href = layer.link;
    }
    node.setAttribute("aria-label", layer.name || layer.id);

    if (layer.type === "text") {
      node.appendChild(createTextContent(layer));
    } else if (layer.type === "button") {
      node.appendChild(createButtonContent(layer));
    } else if (layer.type === "shape") {
      node.appendChild(createShapeContent(layer));
    } else {
      node.appendChild(createImageContent(layer));
    }

    if (settings.edit) {
      node.addEventListener("pointerdown", (event) => {
        if (typeof settings.onSelect === "function") {
          settings.onSelect(layer.id, event);
        }
      });
    }

    return node;
  }

  function createImageContent(layer) {
    const img = document.createElement("img");
    img.src = layer.src || "";
    img.alt = layer.name || "";
    img.draggable = false;
    return img;
  }

  function createTextContent(layer) {
    const content = document.createElement("div");
    const style = Object.assign({
      fontSize: 48,
      color: "#fff6db",
      align: "left",
      weight: 600,
    }, layer.style || {});
    content.className = "tb-layer-text";
    content.textContent = layer.text || "テキスト";
    content.style.fontSize = `${Number(style.fontSize) || 48}px`;
    content.style.color = style.color || "#fff6db";
    content.style.textAlign = style.align || "left";
    content.style.fontWeight = style.weight || 600;
    return content;
  }

  function createButtonContent(layer) {
    const content = document.createElement("div");
    content.className = "tb-layer-button";
    content.textContent = layer.text || "ボタン";
    return content;
  }

  function createShapeContent(layer) {
    const shape = layer.shape || {};
    const type = shape.type || "rect";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    const fill = shape.fill || (type === "marker" ? "rgba(255, 214, 86, 0.42)" : "#fff6db");
    const stroke = shape.stroke || "#2f8cff";
    const strokeWidth = String(Number(shape.strokeWidth || (type === "marker" ? 12 : 4)));
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
      node.setAttribute("rx", "46");
      node.setAttribute("ry", "46");
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
      const node = document.createElementNS(svg.namespaceURI, "path");
      node.setAttribute("d", "M8 62 C22 22, 38 88, 54 46 S82 18, 94 52");
      node.setAttribute("fill", "none");
      node.setAttribute("stroke", type === "marker" ? fill : stroke);
      node.setAttribute("stroke-width", strokeWidth);
      node.setAttribute("stroke-linecap", "round");
      node.setAttribute("stroke-linejoin", "round");
      node.setAttribute("vector-effect", "non-scaling-stroke");
      svg.appendChild(node);
    } else {
      const node = document.createElementNS(svg.namespaceURI, "rect");
      node.setAttribute("x", "4");
      node.setAttribute("y", "4");
      node.setAttribute("width", "92");
      node.setAttribute("height", "92");
      node.setAttribute("rx", type === "roundRect" ? "14" : "0");
      add(node);
    }
    return svg;
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

  function createHitAreaNode(layer, viewportKey, index) {
    const layout = getLayerLayout(layer, viewportKey);
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
    node.style.zIndex = String(index + 1000);
    return node;
  }

  function buildFilter(appearance) {
    const brightness = Number(appearance.brightness);
    const filters = [`brightness(${Number.isFinite(brightness) ? brightness : 1})`];
    if (appearance.shadow && appearance.shadow !== "none") {
      filters.push("drop-shadow(0 18px 26px rgba(0, 0, 0, 0.38))");
    }
    return filters.join(" ");
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
    getLayerLayout,
    getAppearance,
    normalizeProject,
    normalizeLayer,
    normalizeUiSettings,
    createDefaultPage,
    renderPage,
    makeId,
    clamp,
  };
})();
