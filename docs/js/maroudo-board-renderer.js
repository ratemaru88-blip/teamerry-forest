(function () {
  "use strict";

  const VIEWPORT_QUERY = "(max-width: 768px)";
  const DEFAULT_CANVAS = {
    pc: { width: 730, height: 658 },
    mobile: { width: 394, height: 1338 },
  };
  const DEFAULT_BACKGROUND = {
    pc: {
      image: "assets/images/tea_room/tea_room_pc_bg_v02.webp",
      width: 1920,
      height: 1080,
      fit: "cover",
      board: {
        x: 111,
        y: 91,
        width: 730,
        height: 658,
        quad: [
          { x: 111, y: 91 },
          { x: 841, y: 140 },
          { x: 841, y: 680 },
          { x: 118, y: 749 },
        ],
      },
    },
    mobile: {
      image: "assets/images/tea_room/tea_room_mobile_bg_v02.webp",
      width: 1080,
      height: 1920,
      fit: "contain",
      board: {
        x: 44,
        y: 142,
        width: 394,
        height: 1338,
        quad: [
          { x: 44, y: 142 },
          { x: 438, y: 205 },
          { x: 438, y: 1434 },
          { x: 44, y: 1480 },
        ],
      },
    },
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
    const region = getBoardRegion(data, key);
    if (region) {
      return {
        width: toPositiveNumber(region.width, DEFAULT_CANVAS[key].width),
        height: toPositiveNumber(region.height, DEFAULT_CANVAS[key].height),
      };
    }
    const canvas = data && data.canvas && data.canvas[key] ? data.canvas[key] : DEFAULT_CANVAS[key];
    const width = toPositiveNumber(canvas.width, DEFAULT_CANVAS[key].width);
    const height = toPositiveNumber(canvas.height, DEFAULT_CANVAS[key].height);
    return { width, height };
  }

  function getBackground(data, mode) {
    const key = normalizeMode(mode);
    const fallback = DEFAULT_BACKGROUND[key];
    const background = data && data.background && data.background[key] ? data.background[key] : fallback;
    if (!background) {
      return null;
    }
    return Object.assign({}, fallback, background, {
      board: Object.assign({}, fallback?.board || {}, background.board || {}),
    });
  }

  function getBoardRegion(data, mode) {
    const key = normalizeMode(mode);
    const background = getBackground(data, key);
    const region = background && background.board ? background.board :
      data && data.boardRegion && data.boardRegion[key] ? data.boardRegion[key] : null;
    return region ? Object.assign({}, region) : null;
  }

  function toPositiveNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : fallback;
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
    const background = getBackground(data, mode);
    const region = getBoardRegion(data, mode);
    stage.style.setProperty("--maroudo-board-width", `${canvas.width}`);
    stage.style.setProperty("--maroudo-board-height", `${canvas.height}`);
    stage.dataset.boardMode = mode;
    stage._maroudoBoardLayout = { canvas, background, region };
    updateStageScale(stage);
    observeStage(stage);
    return canvas;
  }

  function updateStageScale(stage) {
    const layout = stage._maroudoBoardLayout || {};
    const canvas = layout.canvas || getCanvas(null, getMode());
    const layer = stage.querySelector(".maroudo-board-layer");
    const rect = stage.getBoundingClientRect();
    let scale = Math.min(rect.width / canvas.width, rect.height / canvas.height);
    let left = 0;
    let top = 0;
    let transform = "";
    let inverse = null;
    if (layout.background && layout.region) {
      const backgroundWidth = toPositiveNumber(layout.background.width, rect.width || 1);
      const backgroundHeight = toPositiveNumber(layout.background.height, rect.height || 1);
      scale = layout.background.fit === "cover"
        ? Math.max(rect.width / backgroundWidth, rect.height / backgroundHeight)
        : Math.min(rect.width / backgroundWidth, rect.height / backgroundHeight);
      const offsetX = (rect.width - backgroundWidth * scale) / 2;
      const offsetY = (rect.height - backgroundHeight * scale) / 2;
      const quad = normalizeQuad(layout.region.quad, layout.region);
      if (quad) {
        const points = quad.map((point) => ({
          x: offsetX + Number(point.x || 0) * scale,
          y: offsetY + Number(point.y || 0) * scale,
        }));
        const matrix = getProjectiveTransform(canvas, points);
        if (matrix) {
          left = 0;
          top = 0;
          transform = toMatrix3d(matrix);
          inverse = invertProjectiveMatrix(matrix);
        }
      }
      if (!transform) {
        left = offsetX + Number(layout.region.x || 0) * scale;
        top = offsetY + Number(layout.region.y || 0) * scale;
      }
    }
    stage.style.setProperty("--maroudo-board-scale", String(Number.isFinite(scale) && scale > 0 ? scale : 1));
    stage._maroudoBoardTransform = { inverse, scale: Number.isFinite(scale) && scale > 0 ? scale : 1 };
    if (layer) {
      layer.style.left = `${Number.isFinite(left) ? left : 0}px`;
      layer.style.top = `${Number.isFinite(top) ? top : 0}px`;
      layer.style.transform = transform || `scale(${Number.isFinite(scale) && scale > 0 ? scale : 1})`;
    }
  }

  function normalizeQuad(quad, region) {
    if (Array.isArray(quad) && quad.length === 4) {
      return quad;
    }
    return null;
  }

  function getProjectiveTransform(canvas, points) {
    const width = toPositiveNumber(canvas.width, 1);
    const height = toPositiveNumber(canvas.height, 1);
    const src = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ];
    const matrixRows = [];
    const values = [];
    for (let index = 0; index < 4; index += 1) {
      const source = src[index];
      const target = points[index];
      matrixRows.push([source.x, source.y, 1, 0, 0, 0, -source.x * target.x, -source.y * target.x]);
      values.push(target.x);
      matrixRows.push([0, 0, 0, source.x, source.y, 1, -source.x * target.y, -source.y * target.y]);
      values.push(target.y);
    }
    const solved = solveLinearSystem(matrixRows, values);
    if (!solved) {
      return null;
    }
    return [
      solved[0], solved[1], solved[2],
      solved[3], solved[4], solved[5],
      solved[6], solved[7], 1,
    ];
  }

  function solveLinearSystem(matrix, values) {
    const size = values.length;
    const rows = matrix.map((row, index) => row.concat(values[index]));
    for (let column = 0; column < size; column += 1) {
      let pivot = column;
      for (let row = column + 1; row < size; row += 1) {
        if (Math.abs(rows[row][column]) > Math.abs(rows[pivot][column])) {
          pivot = row;
        }
      }
      if (Math.abs(rows[pivot][column]) < 1e-10) {
        return null;
      }
      [rows[column], rows[pivot]] = [rows[pivot], rows[column]];
      const divisor = rows[column][column];
      for (let cell = column; cell <= size; cell += 1) {
        rows[column][cell] /= divisor;
      }
      for (let row = 0; row < size; row += 1) {
        if (row === column) {
          continue;
        }
        const factor = rows[row][column];
        for (let cell = column; cell <= size; cell += 1) {
          rows[row][cell] -= factor * rows[column][cell];
        }
      }
    }
    return rows.map((row) => row[size]);
  }

  function toMatrix3d(matrix) {
    const [a, b, c, d, e, f, g, h] = matrix;
    return `matrix3d(${[
      a, d, 0, g,
      b, e, 0, h,
      0, 0, 1, 0,
      c, f, 0, 1,
    ].map((value) => Number(value).toFixed(12)).join(",")})`;
  }

  function invertProjectiveMatrix(matrix) {
    const [a, b, c, d, e, f, g, h, i] = matrix;
    const determinant =
      a * (e * i - f * h) -
      b * (d * i - f * g) +
      c * (d * h - e * g);
    if (Math.abs(determinant) < 1e-10) {
      return null;
    }
    return [
      (e * i - f * h) / determinant,
      (c * h - b * i) / determinant,
      (b * f - c * e) / determinant,
      (f * g - d * i) / determinant,
      (a * i - c * g) / determinant,
      (c * d - a * f) / determinant,
      (d * h - e * g) / determinant,
      (b * g - a * h) / determinant,
      (a * e - b * d) / determinant,
    ];
  }

  function applyProjectiveMatrix(matrix, x, y) {
    const denominator = matrix[6] * x + matrix[7] * y + matrix[8];
    if (!Number.isFinite(denominator) || Math.abs(denominator) < 1e-10) {
      return { x: 0, y: 0 };
    }
    return {
      x: (matrix[0] * x + matrix[1] * y + matrix[2]) / denominator,
      y: (matrix[3] * x + matrix[4] * y + matrix[5]) / denominator,
    };
  }

  function screenToBoardPoint(stage, clientX, clientY) {
    const rect = stage.getBoundingClientRect();
    const transform = stage._maroudoBoardTransform || {};
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (transform.inverse) {
      return applyProjectiveMatrix(transform.inverse, x, y);
    }
    const layer = stage.querySelector(".maroudo-board-layer");
    const scale = transform.scale || Number(getComputedStyle(stage).getPropertyValue("--maroudo-board-scale")) || 1;
    return {
      x: (clientX - rect.left - (layer ? layer.offsetLeft : 0)) / scale,
      y: (clientY - rect.top - (layer ? layer.offsetTop : 0)) / scale,
    };
  }

  function observeStage(stage) {
    if (!window.ResizeObserver) {
      window.addEventListener("resize", () => updateStageScale(stage), { passive: true });
      return;
    }
    if (stage._maroudoBoardObserver) {
      stage._maroudoBoardObserver.disconnect();
    }
    const observer = new ResizeObserver(() => updateStageScale(stage));
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
    updateStageScale(stage);
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
    updateStageScale(stage);
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
    DEFAULT_BACKGROUND,
    VIEWPORT_QUERY,
    clone,
    getMode,
    getCanvas,
    getBackground,
    getBoardRegion,
    getLayout,
    resolveImagePath,
    isWithinPublishWindow,
    validateBoardData,
    prepareStage,
    renderBoard,
    screenToBoardPoint,
  };
})();
