(function () {
  "use strict";

  const renderer = window.TeaMerryMaroudoBoard;
  const STORAGE_KEY = "teamerry.maroudoBoardEditor.draft";
  const DATA_URL = "../../data/maroudo_board/maroudo_board_current.json?v=2026.07.20-02";
  const objectUrls = new Map();

  const state = {
    data: null,
    mode: "pc",
    preview: false,
    selectedId: "",
    dirty: false,
    history: [],
    future: [],
    drag: null,
  };

  const $ = (id) => document.getElementById(id);
  const stage = $("boardStage");
  const image = $("boardImage");
  const els = {
    saveState: $("saveState"),
    modePc: $("modePc"),
    modeMobile: $("modeMobile"),
    editMode: $("editMode"),
    previewMode: $("previewMode"),
    jsonFile: $("jsonFile"),
    jsonText: $("jsonText"),
    downloadJson: $("downloadJson"),
    copyJson: $("copyJson"),
    resetSample: $("resetSample"),
    newImagePath: $("newImagePath"),
    newItemName: $("newItemName"),
    imageFile: $("imageFile"),
    imageHint: $("imageHint"),
    addItem: $("addItem"),
    dropZone: $("dropZone"),
    itemList: $("itemList"),
    undo: $("undo"),
    redo: $("redo"),
    duplicateItem: $("duplicateItem"),
    deleteItem: $("deleteItem"),
    bringFront: $("bringFront"),
    sendBack: $("sendBack"),
    metaBoardVersion: $("metaBoardVersion"),
    metaUpdatedAt: $("metaUpdatedAt"),
    metaStatus: $("metaStatus"),
    metaCommit: $("metaCommit"),
    metaDisplayDate: $("metaDisplayDate"),
    metaSummary: $("metaSummary"),
    propName: $("propName"),
    propImage: $("propImage"),
    propImagePc: $("propImagePc"),
    propImageMobile: $("propImageMobile"),
    propAlt: $("propAlt"),
    propX: $("propX"),
    propY: $("propY"),
    propWidth: $("propWidth"),
    propRotation: $("propRotation"),
    propZ: $("propZ"),
    propAction: $("propAction"),
    propDetail: $("propDetail"),
    propLink: $("propLink"),
    propNewTab: $("propNewTab"),
    propEnabled: $("propEnabled"),
    propFrom: $("propFrom"),
    propUntil: $("propUntil"),
  };

  function start() {
    const draft = storageGet(STORAGE_KEY);
    if (draft) {
      try {
        state.data = normalizeBoardData(JSON.parse(draft));
        render();
      } catch (error) {
        console.warn("[TeaMerry] localStorageの掲示板下書きを読み込めませんでした。", error);
      }
    }
    if (!state.data) {
      fetch(DATA_URL, { cache: "no-store" })
        .then((response) => response.json())
        .then((data) => {
          state.data = normalizeBoardData(data);
          render();
        })
        .catch((error) => {
          console.warn("[TeaMerry] 掲示板データを読み込めませんでした。", error);
          state.data = createEmptyBoard();
          render();
        });
    }
    bindEvents();
  }

  function createEmptyBoard() {
    const now = new Date();
    return {
      meta: {
        schemaVersion: 1,
        boardVersion: "2026.07.20-02",
        updatedAt: now.toISOString(),
        displayDate: "2026年7月20日現在",
        status: "draft",
        commit: "",
        summary: "まろうど掲示板の下書き",
      },
      canvas: renderer.DEFAULT_CANVAS,
      background: renderer.DEFAULT_BACKGROUND,
      items: [],
    };
  }

  function bindEvents() {
    els.modePc.addEventListener("click", () => setMode("pc"));
    els.modeMobile.addEventListener("click", () => setMode("mobile"));
    els.editMode.addEventListener("click", () => setPreview(false));
    els.previewMode.addEventListener("click", () => setPreview(true));
    els.addItem.addEventListener("click", addItemFromInputs);
    els.imageFile.addEventListener("change", handleImageFile);
    els.jsonFile.addEventListener("change", handleJsonFile);
    els.downloadJson.addEventListener("click", downloadJson);
    els.copyJson.addEventListener("click", updateJsonText);
    els.resetSample.addEventListener("click", resetToSource);
    els.undo.addEventListener("click", undo);
    els.redo.addEventListener("click", redo);
    els.duplicateItem.addEventListener("click", duplicateSelected);
    els.deleteItem.addEventListener("click", deleteSelected);
    els.bringFront.addEventListener("click", () => adjustZ("front"));
    els.sendBack.addEventListener("click", () => adjustZ("back"));
    stage.addEventListener("pointerdown", handleStagePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", endPointerAction);
    window.addEventListener("beforeunload", warnUnsaved);
    document.addEventListener("keydown", handleKeys);
    bindMetaInputs();
    bindPropertyInputs();
    bindDropZone();
  }

  function bindMetaInputs() {
    [
      ["metaBoardVersion", "boardVersion"],
      ["metaUpdatedAt", "updatedAt"],
      ["metaStatus", "status"],
      ["metaCommit", "commit"],
      ["metaDisplayDate", "displayDate"],
      ["metaSummary", "summary"],
    ].forEach(([elKey, metaKey]) => {
      els[elKey].addEventListener("input", () => {
        pushHistory();
        state.data.meta[metaKey] = els[elKey].value;
        markDirty();
        render();
      });
    });
  }

  function bindPropertyInputs() {
    const itemBindings = [
      ["propName", "name"],
      ["propImage", "image"],
      ["propImagePc", "imagePc"],
      ["propImageMobile", "imageMobile"],
      ["propAlt", "alt"],
      ["propAction", "clickAction"],
      ["propDetail", "detailImage"],
      ["propLink", "link"],
      ["propFrom", "publishFrom"],
      ["propUntil", "publishUntil"],
    ];
    itemBindings.forEach(([elKey, prop]) => {
      els[elKey].addEventListener("input", () => updateSelected((item) => {
        item[prop] = els[elKey].value;
      }));
    });
    els.propNewTab.addEventListener("change", () => updateSelected((item) => {
      item.openInNewTab = els.propNewTab.checked;
    }));
    els.propEnabled.addEventListener("change", () => updateSelected((item) => {
      item.enabled = els.propEnabled.checked;
    }));
    [
      ["propX", "x"],
      ["propY", "y"],
      ["propWidth", "width"],
      ["propRotation", "rotation"],
      ["propZ", "zIndex"],
    ].forEach(([elKey, key]) => {
      els[elKey].addEventListener("input", () => updateSelected((item) => {
        getCurrentLayout(item)[key] = Number(els[elKey].value) || 0;
      }));
    });
  }

  function bindDropZone() {
    ["dragenter", "dragover"].forEach((name) => {
      els.dropZone.addEventListener(name, (event) => {
        event.preventDefault();
        els.dropZone.classList.add("is-dragover");
      });
    });
    ["dragleave", "drop"].forEach((name) => {
      els.dropZone.addEventListener(name, () => els.dropZone.classList.remove("is-dragover"));
    });
    els.dropZone.addEventListener("drop", (event) => {
      event.preventDefault();
      const file = event.dataTransfer.files && event.dataTransfer.files[0];
      if (file) {
        addObjectUrlItem(file);
      }
    });
  }

  function render() {
    if (!state.data) {
      return;
    }
    ensureSelection();
    updateModeButtons();
    updateBoardPicture();
    if (state.preview) {
      renderer.renderBoard(stage, makeEditorPreviewData(), {
        mode: state.mode,
        preview: false,
        debug: true,
        onItemAction: previewAction,
      });
    } else {
      renderEditableBoard();
    }
    renderMeta();
    renderProperties();
    renderList();
    updateJsonText();
    storageSet(STORAGE_KEY, JSON.stringify(state.data));
    els.saveState.textContent = state.dirty ? "未保存の変更があります" : "未保存の変更はありません";
  }

  function renderEditableBoard() {
    const prepared = renderer.prepareStage(stage, state.data, state.mode);
    if (!prepared) {
      return;
    }
    const layer = prepared.layer;
    layer.innerHTML = "";
    state.data.items.forEach((item) => {
      if (item._editorHidden) {
        return;
      }
      const layout = getCurrentLayout(item);
      const src = resolveEditorImage(item);
      const node = document.createElement("button");
      node.type = "button";
      node.className = "maroudo-board-item";
      node.classList.toggle("is-selected", item.id === state.selectedId);
      node.dataset.itemId = item.id;
      node.style.left = `${layout.x}px`;
      node.style.top = `${layout.y}px`;
      node.style.width = `${Math.max(24, layout.width)}px`;
      node.style.zIndex = String(layout.zIndex || 1);
      node.style.transform = `rotate(${layout.rotation || 0}deg)`;
      node.setAttribute("aria-label", item.name || item.id);
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.draggable = false;
      node.appendChild(img);
      if (item.id === state.selectedId) {
        node.appendChild(createHandle("resize"));
        node.appendChild(createHandle("rotate"));
      }
      layer.appendChild(node);
    });
    const date = document.createElement("p");
    date.className = "maroudo-board-date";
    date.textContent = `森の掲示板　${state.data.meta?.displayDate || ""}`;
    layer.appendChild(date);
  }

  function createHandle(type) {
    const handle = document.createElement("span");
    handle.className = `editor-handle editor-handle--${type}`;
    handle.dataset.handle = type;
    return handle;
  }

  function updateModeButtons() {
    els.modePc.classList.toggle("is-active", state.mode === "pc");
    els.modeMobile.classList.toggle("is-active", state.mode === "mobile");
    els.editMode.classList.toggle("is-active", !state.preview);
    els.previewMode.classList.toggle("is-active", state.preview);
  }

  function updateBoardPicture() {
    const sourceMobile = $("boardSourceMobile");
    const sourcePc = $("boardSourcePc");
    if (state.mode === "mobile") {
      stage.dataset.boardMode = "mobile";
      sourceMobile.srcset = "../../assets/images/tea_room/tea_room_mobile_bg_v02.webp";
      sourcePc.srcset = "../../assets/images/tea_room/tea_room_mobile_bg_v02.webp";
      image.src = "../../assets/images/tea_room/tea_room_mobile_bg_v02.webp";
    } else {
      stage.dataset.boardMode = "pc";
      sourceMobile.srcset = "../../assets/images/tea_room/tea_room_pc_bg_v02.webp";
      sourcePc.srcset = "../../assets/images/tea_room/tea_room_pc_bg_v02.webp";
      image.src = "../../assets/images/tea_room/tea_room_pc_bg_v02.webp";
    }
  }

  function renderMeta() {
    const meta = state.data.meta || {};
    els.metaBoardVersion.value = meta.boardVersion || "";
    els.metaUpdatedAt.value = meta.updatedAt || "";
    els.metaStatus.value = meta.status || "draft";
    els.metaCommit.value = meta.commit || "";
    els.metaDisplayDate.value = meta.displayDate || "";
    els.metaSummary.value = meta.summary || "";
  }

  function renderProperties() {
    const item = getSelectedItem();
    const inputs = document.querySelectorAll(".property-panel input, .property-panel select");
    inputs.forEach((input) => {
      input.disabled = !item;
    });
    if (!item) {
      inputs.forEach((input) => {
        if (input.type === "checkbox") {
          input.checked = false;
        } else {
          input.value = "";
        }
      });
      return;
    }
    const layout = getCurrentLayout(item);
    els.propName.value = item.name || "";
    els.propImage.value = item.image || "";
    els.propImagePc.value = item.imagePc || "";
    els.propImageMobile.value = item.imageMobile || "";
    els.propAlt.value = item.alt || "";
    els.propX.value = Math.round(layout.x || 0);
    els.propY.value = Math.round(layout.y || 0);
    els.propWidth.value = Math.round(layout.width || 0);
    els.propRotation.value = Math.round(layout.rotation || 0);
    els.propZ.value = Math.round(layout.zIndex || 1);
    els.propAction.value = item.clickAction || "none";
    els.propDetail.value = item.detailImage || "";
    els.propLink.value = item.link || "";
    els.propNewTab.checked = Boolean(item.openInNewTab);
    els.propEnabled.checked = item.enabled !== false;
    els.propFrom.value = item.publishFrom || "";
    els.propUntil.value = item.publishUntil || "";
  }

  function renderList() {
    els.itemList.innerHTML = "";
    state.data.items
      .slice()
      .sort((a, b) => (getCurrentLayout(b).zIndex || 0) - (getCurrentLayout(a).zIndex || 0))
      .forEach((item) => {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "item-row";
        row.classList.toggle("is-selected", item.id === state.selectedId);
        row.innerHTML = `
          <img src="${escapeAttr(resolveEditorImage(item))}" alt="">
          <span><strong>${escapeHtml(item.name || item.id)}</strong><span>${escapeHtml(item.clickAction || "none")} / z:${getCurrentLayout(item).zIndex || 1}</span></span>
          <input type="checkbox" ${item.enabled !== false ? "checked" : ""} aria-label="表示">
        `;
        row.addEventListener("click", (event) => {
          const checkbox = event.target.closest("input");
          if (checkbox) {
            updateItem(item.id, (target) => {
              target.enabled = checkbox.checked;
            });
            return;
          }
          state.selectedId = item.id;
          render();
        });
        els.itemList.appendChild(row);
      });
  }

  function handleStagePointerDown(event) {
    if (state.preview) {
      return;
    }
    const itemNode = event.target.closest(".maroudo-board-item");
    if (!itemNode) {
      state.selectedId = "";
      render();
      return;
    }
    const item = findItem(itemNode.dataset.itemId);
    if (!item) {
      return;
    }
    state.selectedId = item.id;
    pushHistory();
    const layout = getCurrentLayout(item);
    const point = toCanvasPoint(event);
    const handle = event.target.closest("[data-handle]");
    state.drag = {
      type: handle ? handle.dataset.handle : "move",
      id: item.id,
      start: point,
      origin: Object.assign({}, layout),
      center: { x: layout.x + layout.width / 2, y: layout.y + getItemHeight(item, layout.width) / 2 },
    };
    itemNode.setPointerCapture?.(event.pointerId);
    render();
  }

  function handlePointerMove(event) {
    if (!state.drag) {
      return;
    }
    const item = findItem(state.drag.id);
    if (!item) {
      return;
    }
    const layout = getCurrentLayout(item);
    const point = toCanvasPoint(event);
    const dx = point.x - state.drag.start.x;
    const dy = point.y - state.drag.start.y;
    if (state.drag.type === "move") {
      layout.x = clamp(state.drag.origin.x + dx, -layout.width + 24, getCanvas().width - 24);
      layout.y = clamp(state.drag.origin.y + dy, -getItemHeight(item, layout.width) + 24, getCanvas().height - 24);
    } else if (state.drag.type === "resize") {
      layout.width = Math.max(24, state.drag.origin.width + dx);
    } else if (state.drag.type === "rotate") {
      const angle = Math.atan2(point.y - state.drag.center.y, point.x - state.drag.center.x) * 180 / Math.PI + 90;
      layout.rotation = Math.round(angle);
    }
    markDirty();
    render();
  }

  function endPointerAction() {
    state.drag = null;
  }

  function toCanvasPoint(event) {
    const layer = stage.querySelector(".maroudo-board-layer");
    const rect = stage.getBoundingClientRect();
    const scale = Number(getComputedStyle(stage).getPropertyValue("--maroudo-board-scale")) || 1;
    return {
      x: (event.clientX - rect.left - (layer ? layer.offsetLeft : 0)) / scale,
      y: (event.clientY - rect.top - (layer ? layer.offsetTop : 0)) / scale,
    };
  }

  function addItemFromInputs() {
    const imagePath = els.newImagePath.value.trim() || "assets/images/maroudo_board/items/new_item.webp";
    addItem({
      name: els.newItemName.value.trim() || "新しい貼り紙",
      image: imagePath,
    });
  }

  function handleImageFile(event) {
    const file = event.target.files && event.target.files[0];
    if (file) {
      addObjectUrlItem(file);
    }
    event.target.value = "";
  }

  function addObjectUrlItem(file) {
    const url = URL.createObjectURL(file);
    const suggested = `assets/images/maroudo_board/items/${file.name}`;
    const id = makeId(file.name.replace(/\.[^.]+$/, ""));
    objectUrls.set(suggested, url);
    els.imageHint.textContent = `プレビュー中: ${file.name} / 推奨保存先: ${suggested}`;
    addItem({ id, name: file.name, image: suggested });
  }

  function addItem(seed) {
    pushHistory();
    const id = seed.id || makeId(seed.name || "item");
    const canvas = getCanvas();
    const item = {
      id,
      name: seed.name || id,
      image: seed.image || "",
      imagePc: "",
      imageMobile: "",
      alt: seed.name || id,
      enabled: true,
      publishFrom: "",
      publishUntil: "",
      clickAction: "none",
      detailImage: "",
      detailImagePc: "",
      detailImageMobile: "",
      link: "",
      openInNewTab: false,
      layouts: {
        pc: { x: 120, y: 120, width: 260, rotation: -2, zIndex: nextZ() },
        mobile: { x: 80, y: 160, width: 320, rotation: -1, zIndex: nextZ() },
      },
    };
    item.layouts[state.mode].x = Math.round(canvas.width * 0.18);
    item.layouts[state.mode].y = Math.round(canvas.height * 0.18);
    state.data.items.push(item);
    state.selectedId = id;
    markDirty();
    render();
  }

  function handleJsonFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    file.text().then((text) => {
      const parsed = normalizeBoardData(JSON.parse(text));
      const validation = renderer.validateBoardData(parsed);
      if (!validation.valid) {
        alert(`JSONに問題があります。\n${validation.errors.join("\n")}`);
        return;
      }
      pushHistory();
      state.data = parsed;
      state.selectedId = state.data.items[0]?.id || "";
      markDirty();
      render();
    }).catch((error) => {
      alert(`JSONを読み込めませんでした。\n${error.message}`);
    });
    event.target.value = "";
  }

  function downloadJson() {
    const blob = new Blob([stringifyData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "maroudo_board_current.json";
    a.click();
    URL.revokeObjectURL(url);
    state.dirty = false;
    render();
  }

  function resetToSource() {
    if (!confirm("現在の下書きを破棄して初期状態へ戻しますか？")) {
      return;
    }
    storageRemove(STORAGE_KEY);
    location.reload();
  }

  function updateJsonText() {
    els.jsonText.value = stringifyData();
  }

  function stringifyData() {
    return JSON.stringify(stripEditorOnly(state.data), null, 2);
  }

  function stripEditorOnly(data) {
    const copy = renderer.clone(data);
    copy.items.forEach((item) => {
      delete item._editorHidden;
    });
    return copy;
  }

  function normalizeBoardData(data) {
    const copy = renderer.clone(data || createEmptyBoard());
    const pcCanvas = copy.canvas?.pc || {};
    const mobileCanvas = copy.canvas?.mobile || {};
    const isLegacyCanvas =
      !copy.background &&
      Number(pcCanvas.width) === 1536 &&
      Number(pcCanvas.height) === 864 &&
      Number(mobileCanvas.width) === 640 &&
      Number(mobileCanvas.height) === 1040;

    if (isLegacyCanvas) {
      const nextCanvas = renderer.clone(renderer.DEFAULT_CANVAS);
      copy.items = (copy.items || []).map((item) => {
        const next = renderer.clone(item);
        transformLegacyLayout(next.layouts?.pc, pcCanvas, nextCanvas.pc);
        transformLegacyLayout(next.layouts?.mobile, mobileCanvas, nextCanvas.mobile);
        return next;
      });
      copy.canvas = nextCanvas;
    } else {
      copy.canvas = Object.assign({}, renderer.clone(renderer.DEFAULT_CANVAS), copy.canvas || {});
    }
    if (isLegacyCanvas || copy.meta?.boardVersion === "2026.07.18-01") {
      copy.meta = Object.assign({}, copy.meta || {}, {
        boardVersion: "2026.07.20-02",
        updatedAt: "2026-07-20T00:00:00+09:00",
        displayDate: "2026年7月20日現在",
        summary: "ティールームv02背景の掲示板範囲に合わせて配置を更新",
      });
    }
    copy.background = Object.assign({}, renderer.clone(renderer.DEFAULT_BACKGROUND), copy.background || {});
    return copy;
  }

  function transformLegacyLayout(layout, fromCanvas, toCanvas) {
    if (!layout || !fromCanvas || !toCanvas) {
      return;
    }
    const scaleX = Number(toCanvas.width) / Number(fromCanvas.width);
    const scaleY = Number(toCanvas.height) / Number(fromCanvas.height);
    if (!Number.isFinite(scaleX) || !Number.isFinite(scaleY)) {
      return;
    }
    layout.x = Math.round(Number(layout.x || 0) * scaleX);
    layout.y = Math.round(Number(layout.y || 0) * scaleY);
    layout.width = Math.max(24, Math.round(Number(layout.width || 0) * scaleX));
  }

  function updateSelected(mutator) {
    const item = getSelectedItem();
    if (!item) {
      return;
    }
    pushHistory();
    mutator(item);
    markDirty();
    render();
  }

  function updateItem(id, mutator) {
    const item = findItem(id);
    if (!item) {
      return;
    }
    pushHistory();
    mutator(item);
    markDirty();
    render();
  }

  function duplicateSelected() {
    const item = getSelectedItem();
    if (!item) {
      return;
    }
    pushHistory();
    const copy = renderer.clone(item);
    copy.id = makeId(`${item.id}_copy`);
    copy.name = `${item.name || item.id} コピー`;
    copy.layouts.pc.x += 24;
    copy.layouts.pc.y += 24;
    copy.layouts.mobile.x += 24;
    copy.layouts.mobile.y += 24;
    copy.layouts.pc.zIndex = nextZ();
    copy.layouts.mobile.zIndex = nextZ();
    state.data.items.push(copy);
    state.selectedId = copy.id;
    markDirty();
    render();
  }

  function deleteSelected() {
    const item = getSelectedItem();
    if (!item || !confirm(`${item.name || item.id} を削除しますか？`)) {
      return;
    }
    pushHistory();
    state.data.items = state.data.items.filter((candidate) => candidate.id !== item.id);
    state.selectedId = state.data.items[0]?.id || "";
    markDirty();
    render();
  }

  function adjustZ(direction) {
    updateSelected((item) => {
      const layout = getCurrentLayout(item);
      layout.zIndex = direction === "front" ? nextZ() : 1;
    });
  }

  function undo() {
    if (!state.history.length) {
      return;
    }
    state.future.push(renderer.clone(state.data));
    state.data = state.history.pop();
    state.selectedId = state.data.items.find((item) => item.id === state.selectedId)?.id || state.data.items[0]?.id || "";
    markDirty();
    render();
  }

  function redo() {
    if (!state.future.length) {
      return;
    }
    state.history.push(renderer.clone(state.data));
    state.data = state.future.pop();
    markDirty();
    render();
  }

  function pushHistory() {
    state.history.push(renderer.clone(state.data));
    state.future = [];
    if (state.history.length > 80) {
      state.history.shift();
    }
  }

  function handleKeys(event) {
    if (event.target.matches("input, textarea, select")) {
      return;
    }
    const item = getSelectedItem();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) {
        redo();
      } else {
        undo();
      }
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
      event.preventDefault();
      duplicateSelected();
      return;
    }
    if (event.key === "Delete") {
      event.preventDefault();
      deleteSelected();
      return;
    }
    if (!item || !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      return;
    }
    event.preventDefault();
    pushHistory();
    const layout = getCurrentLayout(item);
    const step = event.shiftKey ? 10 : 1;
    if (event.key === "ArrowUp") layout.y -= step;
    if (event.key === "ArrowDown") layout.y += step;
    if (event.key === "ArrowLeft") layout.x -= step;
    if (event.key === "ArrowRight") layout.x += step;
    markDirty();
    render();
  }

  function previewAction(detail) {
    if (detail.action === "link" && detail.link) {
      window.open(detail.link, detail.openInNewTab ? "_blank" : "_self", "noopener,noreferrer");
      return;
    }
    if (detail.action === "detailImage" && detail.detailImage) {
      window.open(detail.detailImage, "_blank", "noopener,noreferrer");
    }
  }

  function makeEditorPreviewData() {
    const copy = stripEditorOnly(state.data);
    copy.items.forEach((item) => {
      ["image", "imagePc", "imageMobile", "detailImage", "detailImagePc", "detailImageMobile"].forEach((key) => {
        if (item[key]) {
          item[key] = objectUrls.get(item[key]) || toEditorUrl(item[key]);
        }
      });
    });
    return copy;
  }

  function setMode(mode) {
    state.mode = mode;
    ensureSelection(true);
    render();
  }

  function setPreview(value) {
    state.preview = value;
    render();
  }

  function markDirty() {
    state.dirty = true;
  }

  function warnUnsaved(event) {
    if (!state.dirty) {
      return;
    }
    event.preventDefault();
    event.returnValue = "";
  }

  function getStorage() {
    try {
      return window.localStorage || null;
    } catch (error) {
      return null;
    }
  }

  function storageGet(key) {
    const storage = getStorage();
    return storage ? storage.getItem(key) : "";
  }

  function storageSet(key, value) {
    const storage = getStorage();
    if (storage) {
      storage.setItem(key, value);
    }
  }

  function storageRemove(key) {
    const storage = getStorage();
    if (storage) {
      storage.removeItem(key);
    }
  }

  function getCurrentLayout(item) {
    const layouts = item.layouts || (item.layouts = {});
    return layouts[state.mode] || (layouts[state.mode] = { x: 0, y: 0, width: 220, rotation: 0, zIndex: nextZ() });
  }

  function getCanvas() {
    return renderer.getCanvas(state.data, state.mode);
  }

  function getSelectedItem() {
    return findItem(state.selectedId);
  }

  function ensureSelection(forceFirst) {
    if (!state.data || !state.data.items.length) {
      state.selectedId = "";
      return;
    }
    if (forceFirst && !state.selectedId) {
      state.selectedId = state.data.items[0].id;
      return;
    }
    if (state.selectedId && !findItem(state.selectedId)) {
      state.selectedId = state.data.items[0].id;
    }
  }

  function findItem(id) {
    return state.data && state.data.items.find((item) => item.id === id);
  }

  function resolveEditorImage(item) {
    const path = renderer.resolveImagePath(item, state.mode, false);
    return objectUrls.get(path) || toEditorUrl(path) || "../../assets/images/tea_room/tea_room_pc_bg_v02.webp";
  }

  function toEditorUrl(path) {
    if (!path || /^(blob:|data:|https?:|\.{0,2}\/)/.test(path)) {
      return path || "";
    }
    return `../../${path}`;
  }

  function getItemHeight(item, width) {
    return Math.max(24, width * 0.72);
  }

  function nextZ() {
    return Math.max(0, ...((state.data && state.data.items) || []).flatMap((item) => [
      Number(item.layouts?.pc?.zIndex) || 0,
      Number(item.layouts?.mobile?.zIndex) || 0,
    ])) + 1;
  }

  function makeId(seed) {
    const base = String(seed || "item")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "item";
    let id = `board_${base}`;
    let index = 1;
    while (state.data && state.data.items.some((item) => item.id === id)) {
      index += 1;
      id = `board_${base}_${index}`;
    }
    return id;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, "&quot;");
  }

  if (!renderer) {
    alert("掲示板レンダラーを読み込めませんでした。");
    return;
  }

  start();
})();
