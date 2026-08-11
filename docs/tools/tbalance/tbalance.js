(function () {
  "use strict";

  const renderer = window.TBalanceRenderer;
  const STORAGE_KEY = "tbalance.autosave.v0.1";
  const UI_SETTINGS_KEY = "tbalance.uiSettings.v0.1";
  const HISTORY_LIMIT = 100;
  const DEFAULT_DROP_SIZE = { width: 360, height: 240 };

  const state = {
    project: null,
    editorMode: "normal",
    uiSettings: renderer.normalizeUiSettings(),
    pageId: "home",
    viewport: "desktop",
    selectedId: "",
    tool: "move",
    aiCollab: false,
    balanceMode: "side-by-side",
    preview: false,
    showHitAreas: false,
    zoom: "fit",
    fitScale: 1,
    history: [],
    future: [],
    pointer: null,
    panelResize: null,
    finalPreviewComplete: false,
    dirty: false,
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    pageSelect: $("pageSelect"),
    normalMode: $("normalMode"),
    customMode: $("customMode"),
    desktopMode: $("desktopMode"),
    mobileMode: $("mobileMode"),
    openFile: $("openFile"),
    saveProject: $("saveProject"),
    saveJson: $("saveJson"),
    undoButton: $("undoButton"),
    redoButton: $("redoButton"),
    aiCollabButton: $("aiCollabButton"),
    balanceCheckButton: $("balanceCheckButton"),
    previewButton: $("previewButton"),
    markupButton: $("markupButton"),
    finalPreviewButton: $("finalPreviewButton"),
    publishButton: $("publishButton"),
    settingsButton: $("settingsButton"),
    settingsPanel: $("settingsPanel"),
    closeSettings: $("closeSettings"),
    rememberLastMode: $("rememberLastMode"),
    alwaysStartNormal: $("alwaysStartNormal"),
    showToolDescriptions: $("showToolDescriptions"),
    showBeginnerHints: $("showBeginnerHints"),
    showShortcuts: $("showShortcuts"),
    modeToast: $("modeToast"),
    moveTool: $("moveTool"),
    selectTool: $("selectTool"),
    imageFile: $("imageFile"),
    addText: $("addText"),
    addBubble: $("addBubble"),
    addButton: $("addButton"),
    eyedropperTool: $("eyedropperTool"),
    shapeTool: $("shapeTool"),
    toggleHitAreas: $("toggleHitAreas"),
    canvasViewport: $("canvasViewport"),
    canvasScaler: $("canvasScaler"),
    canvas: $("canvas"),
    zoomOut: $("zoomOut"),
    zoomIn: $("zoomIn"),
    fitCanvas: $("fitCanvas"),
    actualSize: $("actualSize"),
    zoomPercent: $("zoomPercent"),
    zoomLabel: $("zoomLabel"),
    statusText: $("statusText"),
    rotationStatus: $("rotationStatus"),
    saveState: $("saveState"),
    propertyHeader: $("propertyHeader"),
    propertyUndoButton: $("propertyUndoButton"),
    propertyRedoButton: $("propertyRedoButton"),
    propertyTab: $("propertyTab"),
    styleTab: $("styleTab"),
    propertyPane: $("propertyPane"),
    stylePane: $("stylePane"),
    rightPanel: $("rightPanel"),
    rightPanelDivider: $("rightPanelDivider"),
    finalPreviewModal: $("finalPreviewModal"),
    closeFinalPreview: $("closeFinalPreview"),
    finalPreviewStatus: $("finalPreviewStatus"),
    finalPreviewProgress: $("finalPreviewProgress"),
    finalPreviewChecklist: $("finalPreviewChecklist"),
    finalPreviewComplete: $("finalPreviewComplete"),
    emptyProperties: $("emptyProperties"),
    properties: $("properties"),
    propId: $("propId"),
    propName: $("propName"),
    propX: $("propX"),
    propY: $("propY"),
    propW: $("propW"),
    propH: $("propH"),
    propRotation: $("propRotation"),
    propBrightness: $("propBrightness"),
    propOpacity: $("propOpacity"),
    propOpacityNumber: $("propOpacityNumber"),
    propKeepAspect: $("propKeepAspect"),
    propKeepSquare: $("propKeepSquare"),
    propKeepCircle: $("propKeepCircle"),
    squareOption: $("squareOption"),
    circleOption: $("circleOption"),
    propShadow: $("propShadow"),
    propLink: $("propLink"),
    transformNormal: $("transformNormal"),
    transformPerspective: $("transformPerspective"),
    transformFree: $("transformFree"),
    fitStretchCanvas: $("fitStretchCanvas"),
    setBackgroundLayer: $("setBackgroundLayer"),
    layerList: $("layerList"),
    bringFront: $("bringFront"),
    moveForward: $("moveForward"),
    moveBackward: $("moveBackward"),
    sendBack: $("sendBack"),
    deleteLayer: $("deleteLayer"),
  };

  function start() {
    state.project = loadAutosave() || renderer.normalizeProject();
    state.uiSettings = resolveUiSettings(state.project);
    state.editorMode = getStartupMode(state.project);
    syncProjectEditorSettings();
    state.pageId = state.project.pages[0].id;
    bindEvents();
    renderAll();
  }

  function bindEvents() {
    els.normalMode.addEventListener("click", () => setEditorMode("normal"));
    els.customMode.addEventListener("click", () => setEditorMode("custom"));
    els.desktopMode.addEventListener("click", () => setViewport("desktop"));
    els.mobileMode.addEventListener("click", () => setViewport("mobile"));
    els.pageSelect.addEventListener("change", () => {
      state.pageId = els.pageSelect.value;
      state.selectedId = "";
      renderAll();
    });
    els.openFile.addEventListener("change", openProjectFile);
    els.saveProject.addEventListener("click", () => downloadProject("tbalance"));
    els.saveJson.addEventListener("click", () => downloadProject("json"));
    els.undoButton.addEventListener("click", undo);
    els.redoButton.addEventListener("click", redo);
    els.propertyUndoButton.addEventListener("click", undo);
    els.propertyRedoButton.addEventListener("click", redo);
    els.aiCollabButton.addEventListener("click", toggleAiCollab);
    els.balanceCheckButton.addEventListener("click", cycleBalanceMode);
    els.previewButton.addEventListener("click", () => {
      state.preview = !state.preview;
      renderAll();
    });
    els.settingsButton.addEventListener("click", () => {
      els.settingsPanel.hidden = !els.settingsPanel.hidden;
      renderSettings();
    });
    els.closeSettings.addEventListener("click", () => {
      els.settingsPanel.hidden = true;
    });
    els.rememberLastMode.addEventListener("change", () => updateStartupModeSetting("remember"));
    els.alwaysStartNormal.addEventListener("change", () => updateStartupModeSetting("normal"));
    els.showToolDescriptions.addEventListener("change", persistToolDisplaySettings);
    els.showBeginnerHints.addEventListener("change", persistToolDisplaySettings);
    els.showShortcuts.addEventListener("change", persistToolDisplaySettings);
    els.moveTool.addEventListener("click", () => setTool("move"));
    els.selectTool.addEventListener("click", () => setTool("select"));
    els.imageFile.addEventListener("change", handleImageFile);
    els.addText.addEventListener("click", addTextLayer);
    els.addBubble.addEventListener("click", addBubbleGroup);
    els.markupButton.addEventListener("click", addBubbleGroup);
    els.addButton.addEventListener("click", addButtonLayer);
    els.eyedropperTool.addEventListener("click", () => setTool("eyedropper"));
    els.shapeTool.addEventListener("change", () => {
      if (els.shapeTool.value) {
        addShapeLayer(els.shapeTool.value);
        els.shapeTool.value = "";
      }
    });
    els.toggleHitAreas.addEventListener("click", () => {
      state.showHitAreas = !state.showHitAreas;
      renderAll();
    });
    els.finalPreviewButton.addEventListener("click", runFinalPreview);
    els.closeFinalPreview.addEventListener("click", () => {
      els.finalPreviewModal.hidden = true;
    });
    els.publishButton.addEventListener("click", () => {
      showModeToast("公開する準備ができています。公開連携は次の段階で接続します。");
    });
    els.propertyTab.addEventListener("click", () => setInspectorTab("property"));
    els.styleTab.addEventListener("click", () => setInspectorTab("style"));
    els.rightPanelDivider.addEventListener("pointerdown", beginInspectorResize);
    els.zoomOut.addEventListener("click", () => stepZoom(-0.1));
    els.zoomIn.addEventListener("click", () => stepZoom(0.1));
    els.fitCanvas.addEventListener("click", () => {
      state.zoom = "fit";
      updateCanvasScale();
    });
    els.actualSize.addEventListener("click", () => {
      state.zoom = 1;
      updateCanvasScale();
    });
    els.canvasViewport.addEventListener("dragover", handleDragOver);
    els.canvasViewport.addEventListener("drop", handleDrop);
    els.canvas.addEventListener("pointerdown", handleCanvasPointerDown);
    els.canvas.addEventListener("dblclick", handleDoubleClick);
    els.layerList.addEventListener("click", handleLayerListClick);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", endPointer);
    window.addEventListener("resize", updateCanvasScale);
    document.addEventListener("keydown", handleKeys);
    document.addEventListener("keyup", handleKeyUp);
    bindPropertyInputs();
    bindLayerButtons();
  }

  function bindPropertyInputs() {
    [
      ["propName", (layer, value) => { layer.name = value; }],
      ["propLink", (layer, value) => {
        layer.link = value;
        layer.hitArea.enabled = Boolean(value);
      }],
    ].forEach(([key, apply]) => {
      els[key].addEventListener("input", () => updateSelected((layer) => apply(layer, els[key].value)));
    });

    [
      ["propX", "x"],
      ["propY", "y"],
      ["propW", "width"],
      ["propH", "height"],
      ["propRotation", "rotation"],
    ].forEach(([key, prop]) => {
      els[key].addEventListener("input", () => updateSelected((layer) => {
        getCurrentLayout(layer)[prop] = Number(els[key].value) || 0;
      }));
    });

    els.propBrightness.addEventListener("input", () => updateSelected((layer) => {
      layer.appearance.brightness = Number(els.propBrightness.value) || 1;
    }));
    els.propOpacity.addEventListener("input", () => setSelectedOpacity(Number(els.propOpacity.value)));
    els.propOpacityNumber.addEventListener("input", () => setSelectedOpacity(Number(els.propOpacityNumber.value)));
    els.propKeepAspect.addEventListener("change", () => updateSelected((layer) => {
      layer.constraints.keepAspect = els.propKeepAspect.checked;
    }));
    els.propKeepSquare.addEventListener("change", () => updateSelected((layer) => {
      layer.constraints.keepSquare = els.propKeepSquare.checked;
      if (els.propKeepSquare.checked) {
        makeCurrentLayoutSquare(layer);
      }
    }));
    els.propKeepCircle.addEventListener("change", () => updateSelected((layer) => {
      layer.constraints.keepCircle = els.propKeepCircle.checked;
      if (els.propKeepCircle.checked) {
        makeCurrentLayoutSquare(layer);
      }
    }));
    els.propShadow.addEventListener("change", () => updateSelected((layer) => {
      layer.appearance.shadow = els.propShadow.checked ? "soft" : "none";
    }));
    [
      ["transformNormal", "normal"],
      ["transformPerspective", "perspective"],
      ["transformFree", "free"],
    ].forEach(([key, mode]) => {
      els[key].addEventListener("click", () => updateSelected((layer) => {
        layer.transformMode = mode;
        if (mode === "normal") {
          layer.corners = createDefaultCorners();
        }
      }));
    });
    els.fitStretchCanvas.addEventListener("click", () => placeSelectedLayer("stretch"));
    els.setBackgroundLayer.addEventListener("click", setSelectedAsBackground);
  }

  function bindLayerButtons() {
    els.bringFront.addEventListener("click", () => reorderSelected("front"));
    els.moveForward.addEventListener("click", () => reorderSelected("forward"));
    els.moveBackward.addEventListener("click", () => reorderSelected("backward"));
    els.sendBack.addEventListener("click", () => reorderSelected("back"));
    els.deleteLayer.addEventListener("click", deleteSelected);
  }

  function setViewport(viewport) {
    state.viewport = renderer.getViewportKey(viewport);
    state.selectedId = "";
    renderAll();
  }

  function setEditorMode(mode, options) {
    const nextMode = mode === "custom" ? "custom" : "normal";
    if (state.editorMode === nextMode) {
      return;
    }
    state.editorMode = nextMode;
    syncProjectEditorSettings();
    persistUiSettings();
    markDirty();
    renderAll();
    if (!options || options.notify !== false) {
      showModeToast(nextMode === "custom" ? "Custom Modeに切り替えました。" : "Normal Modeに戻りました。");
    }
  }

  function setTool(tool) {
    state.tool = tool;
    document.querySelectorAll("[data-tool]").forEach((node) => {
      node.classList.toggle("is-active", node.dataset.tool === tool);
    });
    renderPropertyMode();
  }

  function setInspectorTab(tab) {
    const style = tab === "style";
    els.propertyTab.classList.toggle("is-active", !style);
    els.styleTab.classList.toggle("is-active", style);
    els.propertyTab.setAttribute("aria-selected", String(!style));
    els.styleTab.setAttribute("aria-selected", String(style));
    els.propertyPane.hidden = style;
    els.stylePane.hidden = !style;
    els.propertyPane.classList.toggle("is-active", !style);
    els.stylePane.classList.toggle("is-active", style);
  }

  function beginInspectorResize(event) {
    event.preventDefault();
    state.panelResize = { startY: event.clientY };
    els.rightPanelDivider.setPointerCapture?.(event.pointerId);
  }

  function persistToolDisplaySettings() {
    state.uiSettings.showToolDescriptions = els.showToolDescriptions.checked;
    state.uiSettings.showBeginnerHints = els.showBeginnerHints.checked;
    state.uiSettings.showShortcuts = els.showShortcuts.checked;
    syncProjectEditorSettings();
    persistUiSettings();
    renderAll();
  }

  function toggleAiCollab() {
    state.aiCollab = !state.aiCollab;
    updateButtons();
    showModeToast(state.aiCollab ? "AI共同をONにしました。同じ画面を見ながら相談できます。" : "AI共同をOFFにしました。自分だけで編集できます。");
  }

  function cycleBalanceMode() {
    const modes = ["side-by-side", "overlay", "before-after"];
    const currentIndex = Math.max(0, modes.indexOf(state.balanceMode));
    state.balanceMode = modes[(currentIndex + 1) % modes.length];
    updateButtons();
    showModeToast(`Balance Check: ${getBalanceModeLabel(state.balanceMode)}に切り替えました。`);
  }

  function getBalanceModeLabel(mode) {
    if (mode === "overlay") {
      return "重ねて表示";
    }
    if (mode === "before-after") {
      return "Before / After";
    }
    return "並べて表示";
  }

  function runFinalPreview() {
    const steps = [
      "レイアウト確認",
      "リンク確認",
      "画像最適化",
      "動画最適化",
      "スマホ表示確認",
      "公開データ生成",
    ];
    state.finalPreviewComplete = false;
    els.finalPreviewModal.hidden = false;
    els.finalPreviewComplete.hidden = true;
    els.finalPreviewProgress.style.width = "0%";
    els.finalPreviewStatus.textContent = "Final Previewを開始しています。";
    els.finalPreviewChecklist.innerHTML = steps.map((step) => (
      `<li data-step="${escapeAttr(step)}"><span class="tb-final-check"></span><span>${escapeHtml(step)}</span></li>`
    )).join("");
    updateButtons();
    steps.forEach((step, index) => {
      window.setTimeout(() => {
        const rows = Array.from(els.finalPreviewChecklist.querySelectorAll("li"));
        rows.forEach((row, rowIndex) => {
          row.classList.toggle("is-running", rowIndex === index);
          if (rowIndex < index) {
            row.classList.add("is-done");
            row.querySelector(".tb-final-check").textContent = "T";
          }
        });
        els.finalPreviewStatus.textContent = `${step}を確認しています。`;
        els.finalPreviewProgress.style.width = `${Math.round(index / steps.length * 100)}%`;
      }, 420 * (index + 1));
    });
    window.setTimeout(() => {
      Array.from(els.finalPreviewChecklist.querySelectorAll("li")).forEach((row) => {
        row.classList.remove("is-running");
        row.classList.add("is-done");
        row.querySelector(".tb-final-check").textContent = "T";
      });
      els.finalPreviewProgress.style.width = "100%";
      els.finalPreviewStatus.textContent = "公開する準備ができました。";
      els.finalPreviewComplete.hidden = false;
      state.finalPreviewComplete = true;
      updateButtons();
      showModeToast("Final Previewが完了しました。公開ボタンを有効化しました。");
    }, 420 * (steps.length + 2));
  }

  function renderAll() {
    const page = getCurrentPage();
    applyEditorMode();
    renderPropertyMode();
    renderPageSelect();
    renderCanvas(page);
    renderProperties();
    renderLayerList();
    renderSettings();
    updateButtons();
    updateStatus();
    updateCanvasScale();
    autosave();
  }

  function applyEditorMode() {
    els.normalMode.classList.toggle("is-active", state.editorMode === "normal");
    els.customMode.classList.toggle("is-active", state.editorMode === "custom");
    document.body.dataset.editorMode = state.editorMode;
    document.body.dataset.showToolDescriptions = state.uiSettings.showToolDescriptions === false ? "false" : "true";
    document.body.dataset.showBeginnerHints = state.uiSettings.showBeginnerHints === false ? "false" : "true";
    document.body.dataset.showShortcuts = state.uiSettings.showShortcuts === false ? "false" : "true";
    document.documentElement.style.setProperty("--tb-accent", state.editorMode === "custom" ? state.uiSettings.customAccentColor : state.uiSettings.normalAccentColor);
  }

  function renderPageSelect() {
    els.pageSelect.innerHTML = "";
    state.project.pages.forEach((page) => {
      const option = document.createElement("option");
      option.value = page.id;
      option.textContent = page.name;
      option.selected = page.id === state.pageId;
      els.pageSelect.appendChild(option);
    });
  }

  function renderCanvas(page) {
    els.canvas.classList.toggle("is-preview", state.preview);
    renderer.renderPage(els.canvas, page, state.viewport, {
      edit: !state.preview,
      selectedId: state.selectedId,
      showHitAreas: state.showHitAreas,
      onSelect: (id, event) => beginLayerPointer(id, event),
    });
    if (!state.preview) {
      renderSelectionHandles();
    }
  }

  function renderSelectionHandles() {
    const layer = getSelectedLayer();
    if (!layer || layer.locked) {
      return;
    }
    const layout = getCurrentLayout(layer);
    const box = document.createElement("div");
    box.className = "tb-selection-box";
    box.style.left = `${layout.x}px`;
    box.style.top = `${layout.y}px`;
    box.style.width = `${Math.max(1, layout.width)}px`;
    box.style.height = `${Math.max(1, layout.height)}px`;
    box.style.transform = `rotate(${Number(layout.rotation) || 0}deg)`;
    box.dataset.layerId = layer.id;
    box.classList.toggle("is-free-transform", state.editorMode === "custom" && layer.transformMode === "free");
    box.classList.toggle("is-perspective-transform", state.editorMode === "custom" && layer.transformMode === "perspective");
    getHandleTypes(layer).forEach((type) => {
      const handle = document.createElement("span");
      handle.className = "tb-handle";
      handle.dataset.handle = type;
      if (type.startsWith("corner-")) {
        const point = (layer.corners || createDefaultCorners())[type.replace("corner-", "")];
        handle.style.left = `${renderer.clamp(point?.x ?? 0, -0.4, 1.4) * 100}%`;
        handle.style.top = `${renderer.clamp(point?.y ?? 0, -0.4, 1.4) * 100}%`;
      }
      handle.addEventListener("pointerdown", (event) => beginLayerPointer(layer.id, event));
      box.appendChild(handle);
    });
    els.canvas.appendChild(box);
  }

  function renderProperties() {
    const layer = getSelectedLayer();
    els.emptyProperties.hidden = Boolean(layer);
    els.properties.hidden = !layer;
    if (!layer) {
      return;
    }
    const layout = getCurrentLayout(layer);
    const appearance = renderer.getAppearance(layer);
    els.propId.value = layer.id;
    els.propName.value = layer.name || "";
    els.propX.value = Math.round(layout.x || 0);
    els.propY.value = Math.round(layout.y || 0);
    els.propW.value = Math.round(layout.width || 0);
    els.propH.value = Math.round(layout.height || 0);
    els.propRotation.value = Math.round(layout.rotation || 0);
    els.propBrightness.value = Number(appearance.brightness || 1).toFixed(2);
    els.propOpacity.value = Math.round((appearance.opacity ?? 1) * 100);
    els.propOpacityNumber.value = els.propOpacity.value;
    els.propKeepAspect.checked = Boolean(layer.constraints?.keepAspect);
    els.propKeepSquare.checked = Boolean(layer.constraints?.keepSquare);
    els.propKeepCircle.checked = Boolean(layer.constraints?.keepCircle);
    els.squareOption.hidden = layer.type !== "shape" || !["rect", "roundRect", "diamond"].includes(layer.shape?.type);
    els.circleOption.hidden = layer.type !== "shape" || layer.shape?.type !== "ellipse";
    els.propShadow.checked = appearance.shadow && appearance.shadow !== "none";
    els.propLink.value = layer.link || "";
    els.transformNormal.classList.toggle("is-active", layer.transformMode === "normal");
    els.transformPerspective.classList.toggle("is-active", layer.transformMode === "perspective");
    els.transformFree.classList.toggle("is-active", layer.transformMode === "free");
  }

  function renderPropertyMode() {
    if (!els.propertyHeader) {
      return;
    }
    const knownModes = ["move", "select", "image", "text", "shape", "click", "eyedropper"];
    els.propertyHeader.dataset.propertyMode = knownModes.includes(state.tool) ? state.tool : "move";
  }

  function renderSettings() {
    els.rememberLastMode.checked = !state.uiSettings.alwaysStartNormal;
    els.alwaysStartNormal.checked = Boolean(state.uiSettings.alwaysStartNormal);
    els.showToolDescriptions.checked = state.uiSettings.showToolDescriptions !== false;
    els.showBeginnerHints.checked = state.uiSettings.showBeginnerHints !== false;
    els.showShortcuts.checked = state.uiSettings.showShortcuts !== false;
  }

  function renderLayerList() {
    const page = getCurrentPage();
    els.layerList.innerHTML = "";
    page.layers.slice().reverse().forEach((layer) => {
      const row = document.createElement("div");
      const appearance = renderer.getAppearance(layer);
      row.className = "tb-layer-row";
      row.classList.toggle("is-background-layer", layer.role === "background");
      row.setAttribute("role", "button");
      row.tabIndex = 0;
      row.classList.toggle("is-selected", layer.id === state.selectedId);
      row.draggable = true;
      row.dataset.layerId = layer.id;
      const visible = layer.visible !== false;
      const locked = Boolean(layer.locked);
      row.innerHTML = `
        <button class="tb-layer-toggle ${visible ? "" : "is-off"}" type="button" data-layer-action="visible" title="${visible ? "表示中" : "非表示"}" aria-label="${visible ? "レイヤーを非表示にする" : "レイヤーを表示する"}">${getLayerToggleIcon(visible ? "eye" : "eyeOff")}</button>
        <button class="tb-layer-toggle ${locked ? "is-locked" : ""}" type="button" data-layer-action="lock" title="${locked ? "ロック中" : "ロックなし"}" aria-label="${locked ? "レイヤーのロックを解除する" : "レイヤーをロックする"}">${getLayerToggleIcon(locked ? "lock" : "unlock")}</button>
        <span class="tb-layer-thumb">${createThumbHtml(layer)}</span>
        <span class="tb-layer-name"><strong>${getLayerRoleBadge(layer)}${escapeHtml(layer.name || layer.id)}</strong><small>${escapeHtml(layer.role === "background" ? "background fixed" : layer.type || "layer")}</small></span>
        <span class="tb-layer-opacity">${Math.round((appearance.opacity ?? 1) * 100)}%</span>
        <span class="tb-mini" title="ドラッグ">::</span>
      `;
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          state.selectedId = layer.id;
          renderAll();
        }
      });
      row.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", layer.id);
      });
      row.addEventListener("dragover", (event) => {
        event.preventDefault();
        row.classList.add("is-drop-before");
      });
      row.addEventListener("dragleave", () => row.classList.remove("is-drop-before"));
      row.addEventListener("drop", (event) => {
        event.preventDefault();
        row.classList.remove("is-drop-before");
        moveLayerBefore(event.dataTransfer.getData("text/plain"), layer.id);
      });
      els.layerList.appendChild(row);
    });
  }

  function handleLayerListClick(event) {
    const row = event.target.closest(".tb-layer-row");
    if (!row) {
      return;
    }
    const layerId = row.dataset.layerId;
    const actionButton = event.target.closest("[data-layer-action]");
    if (actionButton && row.contains(actionButton)) {
      toggleLayerState(layerId, actionButton.dataset.layerAction);
      return;
    }
    state.selectedId = layerId;
    renderAll();
  }

  function updateButtons() {
    document.querySelectorAll(".tb-custom-only").forEach((node) => {
      node.hidden = state.editorMode !== "custom";
    });
    els.desktopMode.classList.toggle("is-active", state.viewport === "desktop");
    els.mobileMode.classList.toggle("is-active", state.viewport === "mobile");
    els.aiCollabButton.classList.toggle("is-active", state.aiCollab);
    els.aiCollabButton.setAttribute("aria-pressed", String(state.aiCollab));
    els.balanceCheckButton.title = `比較: ${getBalanceModeLabel(state.balanceMode)}`;
    els.balanceCheckButton.querySelectorAll("[data-balance-mode]").forEach((node) => {
      node.classList.toggle("is-active", node.dataset.balanceMode === state.balanceMode);
    });
    els.previewButton.classList.toggle("is-active", state.preview);
    els.toggleHitAreas.classList.toggle("is-active", state.showHitAreas);
    els.publishButton.disabled = !state.finalPreviewComplete;
    els.undoButton.disabled = !state.history.length;
    els.redoButton.disabled = !state.future.length;
    els.propertyUndoButton.disabled = !state.history.length;
    els.propertyRedoButton.disabled = !state.future.length;
    const hasSelection = Boolean(getSelectedLayer());
    [
      els.bringFront,
      els.moveForward,
      els.moveBackward,
      els.sendBack,
      els.deleteLayer,
      els.fitStretchCanvas,
      els.setBackgroundLayer,
      els.transformNormal,
      els.transformPerspective,
      els.transformFree,
    ].forEach((button) => {
      button.disabled = !hasSelection;
    });
    const selectedLayer = getSelectedLayer();
    els.setBackgroundLayer.classList.toggle("is-active", Boolean(selectedLayer && selectedLayer.role === "background"));
  }

  function updateStatus() {
    const layer = getSelectedLayer();
    if (!layer) {
      els.statusText.textContent = "ID: - / 名前: -";
      els.rotationStatus.textContent = "リンク: -";
    } else {
      els.statusText.textContent = `ID: ${layer.id || "-"} / 名前: ${layer.name || "-"}`;
      els.rotationStatus.textContent = `リンク: ${layer.link || "-"}`;
    }
    els.saveState.textContent = state.dirty ? "未保存の変更があります" : "保存済み";
  }

  function updateCanvasScale() {
    const size = renderer.getViewportSize(state.viewport);
    const rect = els.canvasViewport.getBoundingClientRect();
    const fit = Math.min((rect.width - 76) / size.width, (rect.height - 76) / size.height);
    state.fitScale = Math.max(0.05, fit);
    const scale = state.zoom === "fit" ? state.fitScale : Number(state.zoom) || 1;
    els.canvasScaler.style.width = `${Math.round(size.width * scale)}px`;
    els.canvasScaler.style.height = `${Math.round(size.height * scale)}px`;
    els.canvasScaler.style.transform = `scale(${scale})`;
    els.zoomPercent.textContent = `${Math.round(scale * 100)}%`;
    els.zoomLabel.textContent = state.zoom === "fit" ? "Fit" : `${Math.round(scale * 100)}%`;
  }

  function stepZoom(delta) {
    const current = state.zoom === "fit" ? state.fitScale : Number(state.zoom) || 1;
    state.zoom = renderer.clamp(current + delta, 0.1, 2);
    updateCanvasScale();
  }

  function beginLayerPointer(id, event) {
    if (state.preview) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const layer = findLayer(id);
    if (!layer) {
      return;
    }
    state.selectedId = id;
    if (layer.locked) {
      renderAll();
      return;
    }
    pushHistory();
    const layout = getCurrentLayout(layer);
    const point = getCanvasPoint(event);
    const handle = event.target.closest("[data-handle]");
    state.pointer = {
      id,
      type: handle ? handle.dataset.handle : "move",
      start: point,
      origin: Object.assign({}, layout),
      originCorners: renderer.clone(layer.corners || createDefaultCorners()),
      center: {
        x: layout.x + layout.width / 2,
        y: layout.y + layout.height / 2,
      },
    };
    renderAll();
  }

  function handleCanvasPointerDown(event) {
    if (event.target === els.canvas) {
      state.selectedId = "";
      renderAll();
    }
  }

  function handlePointerMove(event) {
    if (state.panelResize) {
      const rect = els.rightPanel.getBoundingClientRect();
      const next = renderer.clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0.26, 0.72);
      document.documentElement.style.setProperty("--inspector-height", `${Math.round(next * 100)}%`);
      return;
    }
    if (!state.pointer) {
      return;
    }
    const layer = findLayer(state.pointer.id);
    if (!layer) {
      return;
    }
    const layout = getCurrentLayout(layer);
    const point = getCanvasPoint(event);
    const dx = point.x - state.pointer.start.x;
    const dy = point.y - state.pointer.start.y;
    if (state.pointer.type === "move") {
      layout.x = Math.round(state.pointer.origin.x + dx);
      layout.y = Math.round(state.pointer.origin.y + dy);
    } else if (state.pointer.type.startsWith("corner-")) {
      moveCorner(layer, state.pointer.type.replace("corner-", ""), point);
    } else if (state.pointer.type.startsWith("resize-")) {
      resizeLayerFromHandle(layer, state.pointer.type.replace("resize-", ""), dx, dy);
    } else if (state.pointer.type === "rotate") {
      layout.rotation = Math.round(Math.atan2(point.y - state.pointer.center.y, point.x - state.pointer.center.x) * 180 / Math.PI + 90);
    }
    markDirty();
    renderAll();
  }

  function endPointer() {
    state.pointer = null;
    state.panelResize = null;
  }

  function handleDoubleClick(event) {
    const layerNode = event.target.closest("[data-layer-id]");
    const layer = layerNode ? findLayer(layerNode.dataset.layerId) : null;
    if (!layer || (layer.type !== "text" && layer.type !== "button")) {
      return;
    }
    const value = prompt("テキストを入力", layer.text || "");
    if (value === null) {
      return;
    }
    updateSelected((selected) => {
      selected.text = value;
    });
  }

  function handleKeys(event) {
    const activeTag = document.activeElement?.tagName;
    const inInput = activeTag === "INPUT" || activeTag === "SELECT" || activeTag === "TEXTAREA";
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) {
        redo();
      } else {
        undo();
      }
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
      event.preventDefault();
      redo();
      return;
    }
    if (!inInput && event.code === "Space") {
      event.preventDefault();
      document.body.classList.add("is-space-panning");
      return;
    }
    if (!inInput && (event.key === "Delete" || event.key === "Backspace")) {
      event.preventDefault();
      deleteSelected();
    }
  }

  function handleKeyUp(event) {
    if (event.code === "Space") {
      document.body.classList.remove("is-space-panning");
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) {
      return;
    }
    addImageFile(file, getCanvasPoint(event), chooseBackgroundMode());
  }

  function handleImageFile(event) {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const size = renderer.getViewportSize(state.viewport);
      addImageFile(file, { x: size.width * 0.5, y: size.height * 0.5 }, chooseBackgroundMode());
    }
    event.target.value = "";
  }

  function addImageFile(file, point, backgroundMode) {
    const reader = new FileReader();
    reader.onload = () => {
      const originalSrc = String(reader.result || "");
      if (backgroundMode === "transparent") {
        createTransparentPng(originalSrc).then((transparentSrc) => {
          addDroppedImageLayer(file, point, originalSrc, transparentSrc, true);
        }).catch(() => {
          addDroppedImageLayer(file, point, originalSrc, originalSrc, false);
        });
      } else {
        addDroppedImageLayer(file, point, originalSrc, originalSrc, false);
      }
    };
    reader.readAsDataURL(file);
  }

  function addDroppedImageLayer(file, point, originalSrc, activeSrc, transparent) {
    const assetId = renderer.makeId("asset");
    pushHistory();
    state.project.assets = Array.isArray(state.project.assets) ? state.project.assets : [];
    state.project.assets.push({
      id: assetId,
      fileName: file.name,
      originalSrc,
      transparentSrc: transparent ? activeSrc : "",
      generatedFileName: transparent ? `${file.name.replace(/\.[^.]+$/, "")}_transparent.png` : "",
    });
    addLayer({
      type: "image",
      name: transparent ? `${file.name.replace(/\.[^.]+$/, "")} 透過PNG` : file.name,
      fileName: file.name,
      assetId,
      src: activeSrc,
      originalSrc,
      transparentSrc: transparent ? activeSrc : "",
      desktop: createCenteredLayout(point, DEFAULT_DROP_SIZE.width, DEFAULT_DROP_SIZE.height),
      mobile: createCenteredLayout(point, 360, 240),
      appearance: { opacity: 1, brightness: 1, shadow: "soft" },
      constraints: { keepAspect: true, keepSquare: false, keepCircle: false },
    }, { history: false });
  }

  function chooseBackgroundMode() {
    const value = prompt([
      "画像の背景処理を選択",
      "0: そのまま使う",
      "1: 背景を透過する（自動）",
      "2: 単色背景（Ver.0.1では自動に切り替え）",
      "3: 手動調整（Ver.0.1では自動に切り替え）",
    ].join("\n"), "0");
    return value === "1" || value === "2" || value === "3" ? "transparent" : "original";
  }

  function createTransparentPng(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        context.drawImage(image, 0, 0);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        removeBackgroundFromImageData(imageData);
        context.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      image.onerror = reject;
      image.src = src;
    });
  }

  function removeBackgroundFromImageData(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const samples = [
      getPixel(data, width, 0, 0),
      getPixel(data, width, width - 1, 0),
      getPixel(data, width, 0, height - 1),
      getPixel(data, width, width - 1, height - 1),
    ];
    const bg = samples.reduce((acc, color) => ({
      r: acc.r + color.r / samples.length,
      g: acc.g + color.g / samples.length,
      b: acc.b + color.b / samples.length,
    }), { r: 0, g: 0, b: 0 });
    for (let index = 0; index < data.length; index += 4) {
      const distance = Math.hypot(data[index] - bg.r, data[index + 1] - bg.g, data[index + 2] - bg.b);
      if (distance < 42) {
        data[index + 3] = 0;
      } else if (distance < 88) {
        data[index + 3] = Math.round(data[index + 3] * ((distance - 42) / 46));
      }
    }
  }

  function getPixel(data, width, x, y) {
    const index = (y * width + x) * 4;
    return { r: data[index], g: data[index + 1], b: data[index + 2] };
  }

  function addTextLayer() {
    const size = renderer.getViewportSize(state.viewport);
    addLayer({
      type: "text",
      name: "メッセージ",
      text: "テキスト",
      desktop: createCenteredLayout({ x: size.width / 2, y: size.height / 2 }, 420, 120),
      mobile: createCenteredLayout({ x: size.width / 2, y: size.height / 2 }, 520, 140),
      style: { fontSize: 58, color: "#fff6db", align: "center", weight: 700 },
      appearance: { opacity: 1, brightness: 1, shadow: "soft" },
      constraints: { keepAspect: false, keepSquare: false, keepCircle: false },
    });
  }

  function addButtonLayer() {
    const size = renderer.getViewportSize(state.viewport);
    addLayer({
      type: "button",
      name: "ボタン",
      text: "次へ",
      link: "#next",
      desktop: createCenteredLayout({ x: size.width / 2, y: size.height / 2 }, 260, 78),
      mobile: createCenteredLayout({ x: size.width / 2, y: size.height / 2 }, 380, 108),
      appearance: { opacity: 1, brightness: 1, shadow: "soft" },
      hitArea: { enabled: true, visible: false, x: 0, y: 0, width: 260, height: 78 },
      constraints: { keepAspect: true, keepSquare: false, keepCircle: false },
    });
  }

  function addBubbleGroup() {
    const size = renderer.getViewportSize(state.viewport);
    addLayer({
      type: "button",
      name: "吹き出し",
      text: "ようこそ、\nTeaMerryの森へ",
      desktop: createCenteredLayout({ x: size.width / 2, y: size.height / 2 }, 420, 170),
      mobile: createCenteredLayout({ x: size.width / 2, y: size.height / 2 }, 560, 210),
      appearance: { opacity: 1, brightness: 1, shadow: "soft" },
      constraints: { keepAspect: false, keepSquare: false, keepCircle: false },
    });
  }

  function addShapeLayer(shapeType) {
    const size = renderer.getViewportSize(state.viewport);
    const square = ["ellipse", "rect", "roundRect", "diamond"].includes(shapeType);
    addLayer({
      type: "shape",
      name: getShapeName(shapeType),
      shape: {
        type: shapeType,
        fill: shapeType === "marker" ? "rgba(255, 214, 86, 0.42)" : "rgba(255, 246, 219, 0.18)",
        stroke: shapeType === "pen" ? "#fff6db" : "#2f8cff",
        strokeWidth: shapeType === "marker" ? 18 : 4,
      },
      desktop: createCenteredLayout({ x: size.width / 2, y: size.height / 2 }, shapeType === "line" ? 420 : 220, square ? 220 : 140),
      mobile: createCenteredLayout({ x: size.width / 2, y: size.height / 2 }, shapeType === "line" ? 520 : 280, square ? 280 : 180),
      appearance: { opacity: 1, brightness: 1, shadow: "none" },
      constraints: { keepAspect: false, keepSquare: shapeType === "rect", keepCircle: shapeType === "ellipse" },
    });
  }

  function addLayer(seed, options) {
    if (!options || options.history !== false) {
      pushHistory();
    }
    const layer = Object.assign({
      id: renderer.makeId("layer"),
      visible: true,
      locked: false,
      link: "",
      hitArea: { enabled: false, visible: false, x: 0, y: 0, width: 1, height: 1 },
      corners: createDefaultCorners(),
      transformMode: "normal",
    }, seed);
    renderer.normalizeLayer(layer);
    getCurrentPage().layers.push(layer);
    state.selectedId = layer.id;
    markDirty();
    renderAll();
  }

  function createCenteredLayout(point, width, height) {
    return {
      x: Math.round(point.x - width / 2),
      y: Math.round(point.y - height / 2),
      width,
      height,
      rotation: 0,
    };
  }

  function getHandleTypes(layer) {
    if (state.editorMode === "custom" && (layer.transformMode === "free" || layer.transformMode === "perspective")) {
      return ["corner-topLeft", "corner-topRight", "corner-bottomRight", "corner-bottomLeft", "rotate"];
    }
    return [
      "resize-nw",
      "resize-n",
      "resize-ne",
      "resize-e",
      "resize-se",
      "resize-s",
      "resize-sw",
      "resize-w",
      "rotate",
    ];
  }

  function resizeLayerFromHandle(layer, handle, dx, dy) {
    const layout = getCurrentLayout(layer);
    const origin = state.pointer.origin;
    let nextX = origin.x;
    let nextY = origin.y;
    let nextWidth = origin.width;
    let nextHeight = origin.height;
    const west = handle.includes("w");
    const east = handle.includes("e");
    const north = handle.includes("n");
    const south = handle.includes("s");
    if (east) {
      nextWidth = origin.width + dx;
    }
    if (south) {
      nextHeight = origin.height + dy;
    }
    if (west) {
      nextWidth = origin.width - dx;
      nextX = origin.x + dx;
    }
    if (north) {
      nextHeight = origin.height - dy;
      nextY = origin.y + dy;
    }

    const cornerHandle = (north || south) && (east || west);
    const keepRatio = cornerHandle && Boolean(layer.constraints?.keepAspect);
    if (keepRatio) {
      const ratio = Math.max(0.01, origin.width / Math.max(1, origin.height));
      if (Math.abs(dx) >= Math.abs(dy)) {
        nextHeight = Math.abs(nextWidth) / ratio;
      } else {
        nextWidth = Math.abs(nextHeight) * ratio;
      }
      if (west) {
        nextX = origin.x + origin.width - nextWidth;
      }
      if (north) {
        nextY = origin.y + origin.height - nextHeight;
      }
    }

    if (layer.constraints?.keepSquare || layer.constraints?.keepCircle) {
      const side = Math.max(12, Math.max(Math.abs(nextWidth), Math.abs(nextHeight)));
      if (west) {
        nextX = origin.x + origin.width - side;
      }
      if (north) {
        nextY = origin.y + origin.height - side;
      }
      nextWidth = side;
      nextHeight = side;
    }

    layout.x = Math.round(nextX);
    layout.y = Math.round(nextY);
    layout.width = Math.max(12, Math.round(Math.abs(nextWidth)));
    layout.height = Math.max(12, Math.round(Math.abs(nextHeight)));
  }

  function moveCorner(layer, cornerName, point) {
    const layout = getCurrentLayout(layer);
    const x = renderer.clamp((point.x - layout.x) / Math.max(1, layout.width), -0.4, 1.4);
    const y = renderer.clamp((point.y - layout.y) / Math.max(1, layout.height), -0.4, 1.4);
    layer.corners[cornerName] = { x, y };
  }

  function createDefaultCorners() {
    return {
      topLeft: { x: 0, y: 0 },
      topRight: { x: 1, y: 0 },
      bottomRight: { x: 1, y: 1 },
      bottomLeft: { x: 0, y: 1 },
    };
  }

  function makeCurrentLayoutSquare(layer) {
    const layout = getCurrentLayout(layer);
    const side = Math.max(12, Math.max(Number(layout.width) || 12, Number(layout.height) || 12));
    layout.width = side;
    layout.height = side;
  }

  function getShapeName(shapeType) {
    return {
      rect: "四角形",
      roundRect: "角丸四角形",
      ellipse: "円・楕円",
      triangle: "三角形",
      diamond: "ひし形",
      arrow: "矢印",
      line: "直線",
      pen: "手書きペン",
      marker: "マーカー",
    }[shapeType] || "図形";
  }

  function getCanvasPoint(event) {
    const rect = els.canvas.getBoundingClientRect();
    const size = renderer.getViewportSize(state.viewport);
    const scaleX = rect.width / size.width;
    const scaleY = rect.height / size.height;
    return {
      x: (event.clientX - rect.left) / scaleX,
      y: (event.clientY - rect.top) / scaleY,
    };
  }

  function updateSelected(mutator) {
    const layer = getSelectedLayer();
    if (!layer) {
      return;
    }
    pushHistory();
    mutator(layer);
    renderer.normalizeLayer(layer);
    markDirty();
    renderAll();
  }

  function setSelectedOpacity(value) {
    updateSelected((layer) => {
      layer.appearance.opacity = renderer.clamp(value, 0, 100) / 100;
    });
  }

  function toggleLayerState(id, action) {
    const layer = findLayer(id);
    if (!layer) {
      return;
    }
    pushHistory();
    state.selectedId = id;
    if (action === "visible") {
      layer.visible = layer.visible === false;
    } else if (action === "lock") {
      layer.locked = !layer.locked;
    }
    markDirty();
    renderAll();
  }

  function placeSelectedLayer(mode) {
    const layer = getSelectedLayer();
    if (!layer) {
      return;
    }
    const layout = getCurrentLayout(layer);
    const size = renderer.getViewportSize(state.viewport);
    const currentRatio = Math.max(0.01, Number(layout.width) / Math.max(1, Number(layout.height)));
    const canvasRatio = size.width / size.height;
    pushHistory();

    if (mode === "stretch") {
      layout.x = 0;
      layout.y = 0;
      layout.width = size.width;
      layout.height = size.height;
      layer.constraints.keepAspect = false;
    } else if (mode === "center") {
      layout.x = Math.round((size.width - layout.width) / 2);
      layout.y = Math.round((size.height - layout.height) / 2);
    } else {
      let width;
      let height;
      const shouldCover = mode === "cover";
      if ((currentRatio >= canvasRatio && shouldCover) || (currentRatio < canvasRatio && !shouldCover)) {
        height = size.height;
        width = height * currentRatio;
      } else {
        width = size.width;
        height = width / currentRatio;
      }
      layout.width = Math.round(width);
      layout.height = Math.round(height);
      layout.x = Math.round((size.width - width) / 2);
      layout.y = Math.round((size.height - height) / 2);
      layer.constraints.keepAspect = true;
    }

    layout.rotation = 0;
    renderer.normalizeLayer(layer);
    markDirty();
    renderAll();
  }

  function setSelectedAsBackground() {
    const page = getCurrentPage();
    const index = page.layers.findIndex((layer) => layer.id === state.selectedId);
    if (index < 0) {
      return;
    }
    pushHistory();
    const [layer] = page.layers.splice(index, 1);
    layer.visible = true;
    layer.locked = true;
    layer.role = "background";
    page.layers.unshift(layer);
    state.selectedId = layer.id;
    markDirty();
    renderAll();
  }

  function reorderSelected(direction) {
    const page = getCurrentPage();
    const index = page.layers.findIndex((layer) => layer.id === state.selectedId);
    if (index < 0) {
      return;
    }
    pushHistory();
    const [layer] = page.layers.splice(index, 1);
    if (direction === "front") {
      page.layers.push(layer);
    } else if (direction === "back") {
      page.layers.splice(getBackgroundBoundary(page, layer), 0, layer);
    } else if (direction === "forward") {
      page.layers.splice(Math.min(page.layers.length, index + 1), 0, layer);
    } else {
      page.layers.splice(Math.max(getBackgroundBoundary(page, layer), index - 1), 0, layer);
    }
    markDirty();
    renderAll();
  }

  function moveLayerBefore(draggedId, targetId) {
    if (!draggedId || draggedId === targetId) {
      return;
    }
    const page = getCurrentPage();
    const draggedIndex = page.layers.findIndex((layer) => layer.id === draggedId);
    const targetIndex = page.layers.findIndex((layer) => layer.id === targetId);
    if (draggedIndex < 0 || targetIndex < 0) {
      return;
    }
    pushHistory();
    const [dragged] = page.layers.splice(draggedIndex, 1);
    const nextTargetIndex = page.layers.findIndex((layer) => layer.id === targetId);
    const insertIndex = Math.max(getBackgroundBoundary(page, dragged), nextTargetIndex + 1);
    page.layers.splice(insertIndex, 0, dragged);
    state.selectedId = draggedId;
    markDirty();
    renderAll();
  }

  function getBackgroundBoundary(page, movingLayer) {
    if (movingLayer?.role === "background") {
      return 0;
    }
    const index = page.layers.findIndex((layer) => layer.role !== "background");
    return index < 0 ? page.layers.length : index;
  }

  function deleteSelected() {
    const page = getCurrentPage();
    const index = page.layers.findIndex((layer) => layer.id === state.selectedId);
    if (index < 0) {
      return;
    }
    const layer = page.layers[index];
    const name = layer.name || layer.id || "選択中のレイヤー";
    if (!confirm(`「${name}」レイヤーを削除していいですか？`)) {
      return;
    }
    pushHistory();
    page.layers.splice(index, 1);
    state.selectedId = "";
    markDirty();
    renderAll();
  }

  function openProjectFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    file.text().then((text) => {
      const parsed = renderer.normalizeProject(JSON.parse(text));
      pushHistory();
      state.project = parsed;
      state.uiSettings = resolveUiSettings(parsed);
      state.editorMode = getStartupMode(parsed);
      syncProjectEditorSettings();
      state.pageId = parsed.pages[0].id;
      state.selectedId = "";
      markDirty();
      renderAll();
    }).catch((error) => {
      alert(`TBalanceファイルを開けませんでした。\n${error.message}`);
    });
    event.target.value = "";
  }

  function downloadProject(kind) {
    syncProjectEditorSettings();
    const project = renderer.normalizeProject(state.project);
    const payload = JSON.stringify(project, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = kind === "json" ? "TeaMerry.tbalance.json" : "TeaMerry.tbalance";
    anchor.click();
    URL.revokeObjectURL(url);
    state.dirty = false;
    renderAll();
  }

  function pushHistory() {
    state.history.push(JSON.stringify(state.project));
    if (state.history.length > HISTORY_LIMIT) {
      state.history.shift();
    }
    state.future = [];
  }

  function undo() {
    if (!state.history.length) {
      return;
    }
    state.future.push(JSON.stringify(state.project));
    state.project = renderer.normalizeProject(JSON.parse(state.history.pop()));
    state.pageId = state.project.pages.find((page) => page.id === state.pageId)?.id || state.project.pages[0].id;
    state.selectedId = "";
    markDirty();
    renderAll();
  }

  function redo() {
    if (!state.future.length) {
      return;
    }
    state.history.push(JSON.stringify(state.project));
    state.project = renderer.normalizeProject(JSON.parse(state.future.pop()));
    state.pageId = state.project.pages.find((page) => page.id === state.pageId)?.id || state.project.pages[0].id;
    state.selectedId = "";
    markDirty();
    renderAll();
  }

  function markDirty() {
    state.dirty = true;
  }

  function autosave() {
    try {
      syncProjectEditorSettings();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.project));
    } catch (error) {
      // Autosave is best-effort in the static prototype.
    }
  }

  function loadAutosave() {
    try {
      const text = localStorage.getItem(STORAGE_KEY);
      return text ? renderer.normalizeProject(JSON.parse(text)) : null;
    } catch (error) {
      return null;
    }
  }

  function resolveUiSettings(project) {
    const projectSettings = renderer.normalizeUiSettings(project?.uiSettings);
    const localSettings = loadLocalUiSettings();
    return renderer.normalizeUiSettings(Object.assign({}, projectSettings, localSettings));
  }

  function getStartupMode(project) {
    const projectMode = project?.editorMode === "custom" ? "custom" : "normal";
    if (state.uiSettings.alwaysStartNormal) {
      return "normal";
    }
    const localSettings = loadLocalUiSettings();
    if (localSettings.lastEditorMode === "custom" || localSettings.lastEditorMode === "normal") {
      return localSettings.lastEditorMode;
    }
    return projectMode;
  }

  function loadLocalUiSettings() {
    try {
      const text = localStorage.getItem(UI_SETTINGS_KEY);
      return text ? JSON.parse(text) : {};
    } catch (error) {
      return {};
    }
  }

  function persistUiSettings() {
    try {
      localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(Object.assign({}, state.uiSettings, {
        lastEditorMode: state.editorMode,
      })));
    } catch (error) {
      // Local UI preferences are optional.
    }
  }

  function syncProjectEditorSettings() {
    if (!state.project) {
      return;
    }
    state.uiSettings = renderer.normalizeUiSettings(state.uiSettings);
    state.project.editorMode = state.editorMode === "custom" ? "custom" : "normal";
    state.project.uiSettings = Object.assign({}, state.uiSettings, {
      lastEditorMode: state.editorMode,
    });
  }

  function updateStartupModeSetting(mode) {
    if (mode === "normal") {
      state.uiSettings.alwaysStartNormal = true;
      state.uiSettings.rememberLastMode = false;
    } else {
      state.uiSettings.alwaysStartNormal = false;
      state.uiSettings.rememberLastMode = true;
    }
    syncProjectEditorSettings();
    persistUiSettings();
    markDirty();
    renderAll();
  }

  function showModeToast(message) {
    els.modeToast.textContent = message;
    els.modeToast.classList.add("is-visible");
    window.clearTimeout(showModeToast.timer);
    showModeToast.timer = window.setTimeout(() => {
      els.modeToast.classList.remove("is-visible");
    }, 2600);
  }

  function getCurrentPage() {
    return state.project.pages.find((page) => page.id === state.pageId) || state.project.pages[0];
  }

  function findLayer(id) {
    return getCurrentPage().layers.find((layer) => layer.id === id) || null;
  }

  function getSelectedLayer() {
    return state.selectedId ? findLayer(state.selectedId) : null;
  }

  function getCurrentLayout(layer) {
    return layer[state.viewport];
  }

  function getLayerToggleIcon(type) {
    const icons = {
      eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.8"/></svg>',
      eyeOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"/><path d="M9.4 5.4A10.5 10.5 0 0 1 12 5c6.1 0 9.5 7 9.5 7a18.2 18.2 0 0 1-3 3.7"/><path d="M14.1 14.6A3 3 0 0 1 9.4 9.9"/><path d="M6.2 7.6C3.9 9.2 2.5 12 2.5 12s3.4 7 9.5 7c1.5 0 2.8-.4 4-.9"/></svg>',
      lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
      unlock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 7.5-2"/></svg>',
    };
    return icons[type] || "";
  }

  function getLayerRoleBadge(layer) {
    if (layer.role !== "background") {
      return "";
    }
    return '<span class="tb-background-badge" title="背景固定" aria-label="背景固定"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M7 15l3-3 2 2 3-4 2 5"/><path d="M9 3h6"/></svg></span>';
  }

  function createThumbHtml(layer) {
    if (layer.type === "image" && layer.src) {
      return `<img src="${escapeAttr(layer.src)}" alt="">`;
    }
    if (layer.type === "text") {
      return "T";
    }
    if (layer.type === "button") {
      return "BTN";
    }
    return "L";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  start();
})();
