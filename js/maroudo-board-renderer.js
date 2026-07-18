(function () {
  "use strict";

  const VIEWPORT_QUERY = "(max-width: 768px)";
  const DEFAULT_CANVAS = {
    pc: { width: 1536, height: 864 },
    mobile: { width: 640, height: 1040 },
  };
  const VALID_ACTIONS = new Set(["none", "detailImage", "link"]);
  const JST_OFFSET = "+09:00";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeMode(mode) {
    return mode === "mobile" ? "mobile" : "pc";
  }

  function getMode() {
    return window.matchMedia && window.matchMedia(VIEWPORT_QUERY).matches ? "mobile" : "pc";
  }

  function getCanvas(data, mode) {
    const key = normalizeMode(mode);
    const canvas = data && data.canvas && data.canvas[key] ? data.canvas[key] : DEFAULT_CANVAS[key];
    const width = Number(canvas.width) > 0 ? Number(canvas.width) : DEFAULT_CANVAS[key].width;
    const height = Number(canvas.height) > 0 ? Number(canvas.height) : DEFAULT_CANVAS[key].height;
    return { width, height };
  }

  function getLayout(item, mode) {
    const key = normalizeMode(mode);
    return item && item.layouts && item.layouts[key] ? item.layouts[key] : null;
  }

  function resolveImagePath(item, mode, detail) {
    if (!item) {
      return "";
    }
    const key = normalizeMode(mode);
    if (detail) {
      return (key === "mobile" && item.detailImageMobile) ||
        (key === "pc" && item.detailImagePc) ||
        item.detailImage ||
        "";
    }
    return (key === "mobile" && item.imageMobile) ||
      (key === "pc" && item.imagePc) ||
      item.image ||
      "";
  }

  function isWithinPublishWindow(item, now) {
    if (!item) {
      return false;
    }
    const current = now instanceof Date ? now : new Date();
    const from = parseJstDate(item.publishFrom, false);
    const until = parseJstDate(item.publishUntil, true);
    if (from && current < from) {
      return false;
    }
    if (until && current > until) {
      return false;
    }
    return true;
  }

  function parseJstDate(value, endOfDay) {
    const text = String(value || "").trim();
    if (!text) {
      return null;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return new Date(`${text}T${endOfDay ? "23:59:59" : "00:00:00"}${JST_OFFSET}`);
    }
    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function validateBoardData(data) {
    const errors = [];
    const warnings = [];
    if (!data || typeof data !== "object") {
      errors.push("JSON root must be an object.");
      return { valid: false, errors, warnings };
    }
    if (!Array.isArray(data.items)) {
      errors.push("items must be an array.");
    }
    ["pc", "mobile"].forEach((mode) => {
      const canvas = getCanvas(data, mode);
      if (!canvas.width || !canvas.height) {
        errors.push(`canvas.${mode} must have width and height.`);
      }
    });
    const ids = new Set();
    (data.items || []).forEach((item, index) => {
      if (!item || typeof item !== "object") {
        errors.push(`items[${index}] must be an object.`);
        return;
      }
      if (!item.id) {
        errors.push(`items[${index}] is missing id.`);
      } else if (ids.has(item.id)) {
        errors.push(`Duplicate item id: ${item.id}`);
      } else {
        ids.add(item.id);
      }
      const itemLabel = item.id || `items[${index}]`;
      if (!resolveImagePath(item, "pc") && !resolveImagePath(item, "mobile")) {
        warnings.push(`${itemLabel} has no image.`);
      }
      if (!VALID_ACTIONS.has(item.clickAction || "none")) {
        warnings.push(`${itemLabel} has unknown clickAction.`);
      }
      ["pc", "mobile"].forEach((mode) => {
        const layout = getLayout(item, mode);
        if (!layout) {
          warnings.push(`${itemLabel} has no ${mode} layout.`);
          return;
        }
        ["x", "y", "width", "rotation", "zIndex"].forEach((key) => {
          if (!Number.isFinite(Number(layout[key]))) {
            warnings.push(`${itemLabel} ${mode}.${key} is invalid.`);
          }
        });
      });
    });
    return { valid: errors.length === 0, errors, warnings };
  }

  function createLayer(stage) {
    let layer = stage.querySelector(".maroudo-board-layer");
    if (!layer) {
      layer = document.createElement("div");
      layer.className = "maroudo-board-layer";
      stage.appendChild(layer);
    }
    return layer;
  }

  function applyStageCanvas(stage, data, mode) {
    const canvas = getCanvas(data, mode);
    stage.style.setProperty("--maroudo-board-width", `${canvas.width}`);
    stage.style.setProperty("--maroudo-board-height", `${canvas.height}`);
    stage.dataset.boardMode = mode;
    updateStageScale(stage, canvas);
    observeStage(stage, canvas);
    return canvas;
  }

  function updateStageScale(stage, canvas) {
    const rect = stage.getBoundingClientRect();
    const scale = Math.min(rect.width / canvas.width, rect.height / canvas.height);
    stage.style.setProperty("--maroudo-board-scale", String(Number.isFinite(scale) && scale > 0 ? scale : 1));
  }

  function observeStage(stage, canvas) {
    if (!window.ResizeObserver) {
      window.addEventListener("resize", () => updateStageScale(stage, canvas), { passive: true });
      return;
    }
    if (stage._maroudoBoardObserver) {
      stage._maroudoBoardObserver.disconnect();
    }
    const observer = new ResizeObserver(() => updateStageScale(stage, canvas));
    observer.observe(stage);
    stage._maroudoBoardObserver = observer;
  }

  function renderBoard(target, data, options) {
    const stage = typeof target === "string" ? document.querySelector(target) : target;
    const settings = Object.assign({
      mode: getMode(),
      preview: false,
      debug: new URLSearchParams(window.location.search).get("debug") === "1",
      now: new Date(),
      onItemAction: null,
      onWarnings: null,
    }, options || {});

    if (!stage) {
      return null;
    }

    const mode = normalizeMode(settings.mode);
    const validation = validateBoardData(data);
    if (!validation.valid) {
      console.warn("[TeaMerry] 掲示板データが不正です。", validation.errors);
    }
    if (validation.warnings.length) {
      console.warn("[TeaMerry] 掲示板データに警告があります。", validation.warnings);
    }
    if (typeof settings.onWarnings === "function") {
      settings.onWarnings(validation);
    }

    applyStageCanvas(stage, data, mode);
    const layer = createLayer(stage);
    layer.innerHTML = "";

    const items = Array.isArray(data && data.items) ? data.items : [];
    items.forEach((item) => {
      if (!item || item.enabled === false) {
        return;
      }
      if (!settings.preview && !isWithinPublishWindow(item, settings.now)) {
        return;
      }
      const layout = getLayout(item, mode);
      const image = resolveImagePath(item, mode, false);
      if (!layout || !image) {
        return;
      }
      layer.appendChild(createItemElement(item, layout, image, mode, settings));
    });

    renderDisplayDate(layer, data && data.meta);
    renderDebug(layer, data && data.meta, settings.debug);
    return { mode, validation, itemCount: layer.querySelectorAll(".maroudo-board-item").length };
  }

  function prepareStage(target, data, mode) {
    const stage = typeof target === "string" ? document.querySelector(target) : target;
    if (!stage) {
      return null;
    }
    const key = normalizeMode(mode);
    const canvas = applyStageCanvas(stage, data, key);
    const layer = createLayer(stage);
    return { stage, layer, canvas, mode: key };
  }

  function createItemElement(item, layout, image, mode, settings) {
    const action = VALID_ACTIONS.has(item.clickAction) ? item.clickAction : "none";
    const clickable = action !== "none";
    const node = document.createElement(clickable ? "button" : "div");
    node.className = "maroudo-board-item";
    node.dataset.boardItemId = item.id || "";
    node.dataset.clickAction = action;
    node.style.left = `${Number(layout.x) || 0}px`;
    node.style.top = `${Number(layout.y) || 0}px`;
    node.style.width = `${Math.max(1, Number(layout.width) || 1)}px`;
    node.style.zIndex = String(Number(layout.zIndex) || 1);
    node.style.transform = `rotate(${Number(layout.rotation) || 0}deg)`;
    if (clickable) {
      node.type = "button";
      node.setAttribute("aria-label", item.alt || item.name || "掲示板の貼り紙を開く");
    } else {
      node.setAttribute("aria-hidden", item.alt ? "false" : "true");
      if (item.alt) {
        node.setAttribute("role", "img");
        node.setAttribute("aria-label", item.alt);
      }
    }

    const img = document.createElement("img");
    img.src = image;
    img.alt = clickable ? "" : (item.alt || "");
    img.draggable = false;
    img.addEventListener("error", () => {
      node.classList.add("is-missing-image");
      console.warn("[TeaMerry] 掲示板画像を読み込めませんでした。", image);
    });
    node.appendChild(img);

    if (clickable) {
      node.addEventListener("click", () => {
        if (typeof settings.onItemAction === "function") {
          settings.onItemAction({
            item: clone(item),
            action,
            detailImage: resolveImagePath(item, mode, true),
            link: item.link || "",
            openInNewTab: Boolean(item.openInNewTab),
          });
        }
      });
    }
    return node;
  }

  function renderDisplayDate(layer, meta) {
    const label = document.createElement("p");
    label.className = "maroudo-board-date";
    label.textContent = `森の掲示板　${(meta && meta.displayDate) || ""}`;
    layer.appendChild(label);
  }

  function renderDebug(layer, meta, enabled) {
    if (!enabled) {
      return;
    }
    const debug = document.createElement("aside");
    debug.className = "maroudo-board-debug";
    debug.setAttribute("aria-label", "Maroudo Board Debug");
    const info = meta || {};
    debug.innerHTML = [
      ["Board Version", info.boardVersion || "unknown"],
      ["Updated At", info.updatedAt || "unknown"],
      ["Status", info.status || "unknown"],
      ["Commit", info.commit || "unknown"],
      ["Summary", info.summary || "更新内容未設定"],
    ].map(([key, value]) => `<span><b>${escapeHtml(key)}</b>: ${escapeHtml(value)}</span>`).join("");
    layer.appendChild(debug);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  window.TeaMerryMaroudoBoard = {
    DEFAULT_CANVAS,
    VIEWPORT_QUERY,
    clone,
    getMode,
    getCanvas,
    getLayout,
    resolveImagePath,
    isWithinPublishWindow,
    validateBoardData,
    prepareStage,
    renderBoard,
  };
})();
