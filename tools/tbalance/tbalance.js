(function () {
  "use strict";

  const renderer = window.TBalanceRenderer;
  const STORAGE_KEY = "tbalance.autosave.v0.1";
  const BEFORE_NEW_STORAGE_KEY = "tbalance.beforeNewBackup.v0.1";
  const UI_SETTINGS_KEY = "tbalance.uiSettings.v0.1";
  const PROJECT_DB_NAME = "tbalance-project-store";
  const PROJECT_DB_STORE = "projects";
  const PROJECT_DB_KEY = "autosave";
  const PROJECT_BEFORE_NEW_KEY = "before-new-backup";
  const AI_BRIDGE_URL = "http://127.0.0.1:8787/api/tbalance/share";
  const AI_BRIDGE_HISTORY_URL = "http://127.0.0.1:8787/api/tbalance/history";
  const AI_BRIDGE_RESTORE_URL = "http://127.0.0.1:8787/api/tbalance/history/restore";
  const AI_BRIDGE_SUGGESTION_URL = "http://127.0.0.1:8787/api/tbalance/suggestion";
  const SOURCE_WRITER_URL = "http://127.0.0.1:8787/api/tbalance/source-writer";
  const AI_SHARE_HISTORY_LIMIT = 5;
  const HISTORY_LIMIT = 100;
  const DEFAULT_DROP_SIZE = { width: 360, height: 240 };
  const BUTTON_TEMPLATE_BASE = "assets/buttons/";
  const DEFAULT_TEXT_STYLE = {
    fontSize: 48,
    color: "#fff6db",
    align: "left",
    weight: 600,
    fontFamily: "",
    italic: false,
    underline: false,
    strokeEnabled: false,
    strokeColor: "#0b1220",
    strokeWidth: 0,
  };
  const BUTTON_TEMPLATES = [
    "back_buttan_1.webp",
    "back_buttan_b1.webp",
    "back_buttan_c1.webp",
    "back_buttan_d1.webp",
    "back_buttan_e1.webp",
    "back_buttan_f1.webp",
    "forest_go_buttan_1.webp",
    "forest_go_buttan_b1.webp",
    "forest_go_buttan_c1.webp",
    "forest_go_buttan_d1.webp",
    "forest_go_buttan_e1.webp",
    "forest_go_buttan_f1.webp",
    "buttan_k1.webp",
    "buttan_k2.webp",
    "buttan_k3.webp",
    "buttan_k4.webp",
    "buttan_k5.webp",
    "buttan_k6.webp",
    "buttan_k7.webp",
    "buttan_k8.webp",
    "buttan_k10.webp",
    "buttan_k11.webp",
    "buttan_m1.webp",
    "buttan_m2.webp",
    "buttan_m3.webp",
    "buttan_m4.webp",
    "buttan_m5.webp",
    "buttan_m6.webp",
    "buttan_m7.webp",
  ].map((fileName) => ({
    fileName,
    src: `${BUTTON_TEMPLATE_BASE}${fileName}`,
    label: getButtonTemplateLabel(fileName),
  }));
  const NEW_CANVAS_PRESETS = {
    "teamerry-pc": {
      label: "TeaMerry PC",
      width: 1920,
      height: 1080,
      desktop: { width: 1920, height: 1080, label: "TeaMerry PC" },
      mobile: { width: 1080, height: 1920, label: "TeaMerry Mobile" },
      activeViewport: "desktop",
    },
    "teamerry-mobile": {
      label: "TeaMerry Mobile",
      width: 1080,
      height: 1920,
      desktop: { width: 1920, height: 1080, label: "TeaMerry PC" },
      mobile: { width: 1080, height: 1920, label: "TeaMerry Mobile" },
      activeViewport: "mobile",
    },
    "video-16-9": {
      label: "動画 16:9",
      width: 1920,
      height: 1080,
      desktop: { width: 1920, height: 1080, label: "動画 16:9" },
      mobile: { width: 1920, height: 1080, label: "動画 16:9" },
      activeViewport: "desktop",
    },
    "video-9-16": {
      label: "動画 9:16",
      width: 1080,
      height: 1920,
      desktop: { width: 1080, height: 1920, label: "動画 9:16" },
      mobile: { width: 1080, height: 1920, label: "動画 9:16" },
      activeViewport: "desktop",
    },
    square: {
      label: "正方形",
      width: 1080,
      height: 1080,
      desktop: { width: 1080, height: 1080, label: "正方形" },
      mobile: { width: 1080, height: 1080, label: "正方形" },
      activeViewport: "desktop",
    },
    custom: {
      label: "カスタム",
      width: 1920,
      height: 1080,
      desktop: { width: 1920, height: 1080, label: "カスタム" },
      mobile: { width: 1920, height: 1080, label: "カスタム" },
      activeViewport: "desktop",
    },
  };

  const state = {
    project: null,
    editorMode: "normal",
    uiSettings: renderer.normalizeUiSettings(),
    pageId: "home",
    primaryPageId: "home",
    viewport: "desktop",
    selectedId: "",
    selectedIds: [],
    editingTextId: "",
    tool: "move",
    markupPenMode: false,
    windowMode: "single",
    windowLayout: "horizontal",
    secondaryWindow: null,
    suspendedWindow: null,
    activeWindow: "primary",
    activeColorSlot: "foreground",
    soundMode: "click",
    foregroundColor: "#fff6db",
    backgroundColor: "#111827",
    shapeColorTarget: "",
    colorAdjustBase: "#fff6db",
    colorBrightness: 0,
    colorSaturation: 0,
    brushTip: "round",
    brushSize: 16,
    brushStrength: 70,
    brushOpacity: 100,
    eraserTip: "round",
    eraserSize: 12,
    retouchMode: "lighten",
    retouchTip: "round",
    retouchSize: 32,
    retouchHardness: 60,
    retouchOpacity: 45,
    retouchStep: 18,
    retouchDensity: 70,
    fillType: "solid",
    fillOpacity: 100,
    cloneSource: null,
    aiCollab: false,
    withAiShare: {
      targetAi: "chatgpt",
      mode: "safe-change",
      status: "idle",
      message: "",
      summary: "",
      details: "",
      package: null,
      text: "",
    },
    balanceMode: "side-by-side",
    preview: false,
    testWindow: "",
    testAction: null,
    testPageIds: {
      primary: "",
      secondary: "",
    },
    testPages: {},
    testExternalViews: {
      primary: null,
      secondary: null,
    },
    testNavigation: {
      primary: [],
      secondary: [],
    },
    showHitAreas: false,
    zoom: "fit",
    fitScale: 1,
    windowZoom: {
      primary: "fit",
      secondary: "fit",
    },
    windowFitScale: {
      primary: 1,
      secondary: 1,
    },
    imageWarnings: {},
    history: [],
    future: [],
    pointer: null,
    selectionMode: "rect",
    selectionRange: null,
    selectionRect: null,
    panelResize: null,
    paintSurfaces: new Map(),
    finalPreviewComplete: false,
    analyzer: {
      open: false,
      result: null,
      selectedId: "",
      loadedPath: "",
      loadedKind: "",
      effectiveUrl: "",
      sourcePath: "",
      viewState: "",
      message: "",
      confirmedMappings: [],
      mappingWarning: "",
      manifestProjectId: "sample-project",
      manifestPageId: "page-home",
      manifestWarning: "",
      adapterId: "none",
      safeChange: {
        targetMappingId: "",
        property: "",
        beforeSource: "observed",
        beforeText: "",
        afterText: "",
        intent: "",
        status: "idle",
        message: "",
        json: null,
        summary: "",
      },
      safePatch: {
        status: "idle",
        message: "",
        candidate: null,
        diffText: "",
        summary: "",
        signature: "",
        reviewStatus: "",
        approvedSignature: "",
      },
      safeApply: {
        status: "idle",
        message: "",
        preflight: null,
        result: null,
        diffText: "",
      },
    },
    existingWeb: {
      active: false,
      pageId: "",
      label: "",
      sourcePath: "",
      sourceAuthority: "standard-web",
      currentUrl: "",
      viewState: "",
      targetState: null,
      adapterId: "none",
      mode: "edit",
      selected: null,
      virtualLayers: [],
      checks: {},
      aiReviews: {},
      pageCheck: {
        status: "idle",
        fingerprint: "",
        checkedAt: "",
        summary: null,
      },
      audioMuted: true,
      preview: {
        active: false,
        changes: [],
      },
      previewHistory: [],
      previewFuture: [],
      impactAnalysis: null,
      reloadToken: "",
      drag: null,
    },
    siteMap: {
      open: false,
      status: "idle",
      message: "未生成",
      graph: null,
      selectedPageId: "",
      selectedLinkId: "",
      detailMode: "normal",
      filter: "all",
      search: "",
      layoutMode: "auto",
      zoom: 1,
      panX: 0,
      panY: 0,
      positions: {},
      dragging: null,
      panning: null,
      lastScanAt: "",
    },
    dirty: false,
    autosaveError: "",
    autosaveStorage: "",
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    pageSelect: $("pageSelect"),
    pageNameInput: $("pageNameInput"),
    canvasSizeLabel: $("canvasSizeLabel"),
    newCanvasModal: $("newCanvasModal"),
    newCanvasName: $("newCanvasName"),
    newCanvasWidth: $("newCanvasWidth"),
    newCanvasHeight: $("newCanvasHeight"),
    newCanvasBackgroundColor: $("newCanvasBackgroundColor"),
    newCanvasCreate: $("newCanvasCreate"),
    newCanvasCancel: $("newCanvasCancel"),
    newCanvasCancelTop: $("newCanvasCancelTop"),
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
    aiCollabPanel: $("aiCollabPanel"),
    closeAiCollab: $("closeAiCollab"),
    aiRequestMode: $("aiRequestMode"),
    aiProjectSummary: $("aiProjectSummary"),
    aiPromptText: $("aiPromptText"),
    aiQuickNote: $("aiQuickNote"),
    aiBridgeStatus: $("aiBridgeStatus"),
    aiShareTarget: $("aiShareTarget"),
    aiSafeChangeSummary: $("aiSafeChangeSummary"),
    aiSafeChangeDetails: $("aiSafeChangeDetails"),
    aiSafeChangeDetailsPreview: $("aiSafeChangeDetailsPreview"),
    aiShareMessage: $("aiShareMessage"),
    aiExistingWebImport: $("aiExistingWebImport"),
    aiExistingWebResultText: $("aiExistingWebResultText"),
    pasteExistingWebAiResult: $("pasteExistingWebAiResult"),
    applyExistingWebAiResult: $("applyExistingWebAiResult"),
    aiExistingWebImportStatus: $("aiExistingWebImportStatus"),
    shareAiState: $("shareAiState"),
    shareSafeChangeWithAi: $("shareSafeChangeWithAi"),
    cancelExistingWebAiShare: $("cancelExistingWebAiShare"),
    loadAiSuggestion: $("loadAiSuggestion"),
    refreshAiHistory: $("refreshAiHistory"),
    aiShareHistoryList: $("aiShareHistoryList"),
    aiShowPcMobile: $("aiShowPcMobile"),
    refreshAiPrompt: $("refreshAiPrompt"),
    copyAiPrompt: $("copyAiPrompt"),
    downloadAiPrompt: $("downloadAiPrompt"),
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
    gridStepX: $("gridStepX"),
    gridStepY: $("gridStepY"),
    guideStepX: $("guideStepX"),
    guideStepY: $("guideStepY"),
    snapToGrid: $("snapToGrid"),
    snapToGuide: $("snapToGuide"),
    modeToast: $("modeToast"),
    moveTool: $("moveTool"),
    selectTool: $("selectTool"),
    imageFile: $("imageFile"),
    addText: $("addText"),
    addBubble: $("addBubble"),
    addButton: $("addButton"),
    soundFile: $("soundFile"),
    eyedropperTool: $("eyedropperTool"),
    shapeTool: $("shapeTool"),
    toggleHitAreas: $("toggleHitAreas"),
    canvasViewport: $("canvasViewport"),
    canvasScaler: $("canvasScaler"),
    canvas: $("canvas"),
    secondaryCanvasScaler: $("secondaryCanvasScaler"),
    secondaryCanvas: $("secondaryCanvas"),
    existingWebViewer: $("existingWebViewer"),
    existingWebFrame: $("existingWebFrame"),
    existingWebTitle: $("existingWebTitle"),
    existingWebMeta: $("existingWebMeta"),
    existingWebEditMode: $("existingWebEditMode"),
    existingWebTestMode: $("existingWebTestMode"),
    existingWebAudioToggle: $("existingWebAudioToggle"),
    existingWebPageCheck: $("existingWebPageCheck"),
    existingWebAnalyze: $("existingWebAnalyze"),
    existingWebCreateSafeChange: $("existingWebCreateSafeChange"),
    existingWebResetPreview: $("existingWebResetPreview"),
    existingWebBackToCanvas: $("existingWebBackToCanvas"),
    existingWebSelectionSummary: $("existingWebSelectionSummary"),
    existingWebOpenModal: $("existingWebOpenModal"),
    existingWebSourcePath: $("existingWebSourcePath"),
    existingWebOpenSubmit: $("existingWebOpenSubmit"),
    existingWebOpenCancel: $("existingWebOpenCancel"),
    existingWebOpenCancelTop: $("existingWebOpenCancelTop"),
    zoomOut: $("zoomOut"),
    zoomIn: $("zoomIn"),
    fitCanvas: $("fitCanvas"),
    actualSize: $("actualSize"),
    zoomPercent: $("zoomPercent"),
    zoomLabel: $("zoomLabel"),
    statusText: $("statusText"),
    rotationStatus: $("rotationStatus"),
    saveState: $("saveState"),
    sizeStatus: $("sizeStatus"),
    propertyHeader: $("propertyHeader"),
    propertyTab: $("propertyTab"),
    styleTab: $("styleTab"),
    propertyPane: $("propertyPane"),
    stylePane: $("stylePane"),
    foregroundSwatch: $("foregroundSwatch"),
    backgroundSwatch: $("backgroundSwatch"),
    styleColorInput: $("styleColorInput"),
    styleHexInput: $("styleHexInput"),
    transparentColor: $("transparentColor"),
    styleBrightness: $("styleBrightness"),
    styleBrightnessValue: $("styleBrightnessValue"),
    styleSaturation: $("styleSaturation"),
    styleSaturationValue: $("styleSaturationValue"),
    styleOpacity: $("styleOpacity"),
    styleOpacityValue: $("styleOpacityValue"),
    brushTip: $("brushTip"),
    brushSize: $("brushSize"),
    brushSizeValue: $("brushSizeValue"),
    eraserTip: $("eraserTip"),
    eraserSize: $("eraserSize"),
    eraserSizeValue: $("eraserSizeValue"),
    brushStrength: $("brushStrength"),
    brushStrengthValue: $("brushStrengthValue"),
    brushOpacity: $("brushOpacity"),
    brushOpacityValue: $("brushOpacityValue"),
    headerBrushTip: $("headerBrushTip"),
    headerBrushSize: $("headerBrushSize"),
    headerBrushSizeValue: $("headerBrushSizeValue"),
    headerEraserTip: $("headerEraserTip"),
    headerEraserSize: $("headerEraserSize"),
    headerEraserSizeValue: $("headerEraserSizeValue"),
    headerBrushStrength: $("headerBrushStrength"),
    headerBrushStrengthValue: $("headerBrushStrengthValue"),
    headerBrushOpacity: $("headerBrushOpacity"),
    headerBrushOpacityValue: $("headerBrushOpacityValue"),
    retouchMode: $("retouchMode"),
    retouchTip: $("retouchTip"),
    retouchSize: $("retouchSize"),
    retouchSizeValue: $("retouchSizeValue"),
    retouchHardness: $("retouchHardness"),
    retouchHardnessValue: $("retouchHardnessValue"),
    retouchOpacity: $("retouchOpacity"),
    retouchOpacityValue: $("retouchOpacityValue"),
    retouchStep: $("retouchStep"),
    retouchStepValue: $("retouchStepValue"),
    retouchDensity: $("retouchDensity"),
    retouchDensityValue: $("retouchDensityValue"),
    propFillType: $("propFillType"),
    propFillColor: $("propFillColor"),
    propFillOpacity: $("propFillOpacity"),
    propFillOpacityValue: $("propFillOpacityValue"),
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
    propClickAction: $("propClickAction"),
    propClickPreset: $("propClickPreset"),
    propClickDisplayMode: $("propClickDisplayMode"),
    propSoundTarget: $("propSoundTarget"),
    propSoundTrigger: $("propSoundTrigger"),
    propSoundChoose: $("propSoundChoose"),
    propSoundFileName: $("propSoundFileName"),
    propSoundVolume: $("propSoundVolume"),
    propSoundVolumeValue: $("propSoundVolumeValue"),
    propSoundLoop: $("propSoundLoop"),
    propSoundClear: $("propSoundClear"),
    propShapeType: $("propShapeType"),
    propShapeFillMode: $("propShapeFillMode"),
    propShapeFill: $("propShapeFill"),
    propShapeStrokeMode: $("propShapeStrokeMode"),
    propShapeStroke: $("propShapeStroke"),
    propShapeStrokeWidth: $("propShapeStrokeWidth"),
    propShapeRadius: $("propShapeRadius"),
    propShapeShadow: $("propShapeShadow"),
    propShapeShadowType: $("propShapeShadowType"),
    propShapeShadowSize: $("propShapeShadowSize"),
    propShapeShadowColor: $("propShapeShadowColor"),
    propShapeShadowOpacity: $("propShapeShadowOpacity"),
    propTextFont: $("propTextFont"),
    propTextFontSize: $("propTextFontSize"),
    propTextBold: $("propTextBold"),
    propTextItalic: $("propTextItalic"),
    propTextUnderline: $("propTextUnderline"),
    propTextColor: $("propTextColor"),
    propTextStrokeMode: $("propTextStrokeMode"),
    propTextStrokeColor: $("propTextStrokeColor"),
    propTextStrokeWidth: $("propTextStrokeWidth"),
    propTextShadow: $("propTextShadow"),
    propTextShadowType: $("propTextShadowType"),
    propTextShadowSize: $("propTextShadowSize"),
    propTextShadowColor: $("propTextShadowColor"),
    propTextShadowOpacity: $("propTextShadowOpacity"),
    propAnimationType: $("propAnimationType"),
    propAnimationTrigger: $("propAnimationTrigger"),
    propAnimationDuration: $("propAnimationDuration"),
    propAnimationDelay: $("propAnimationDelay"),
    propAnimationRepeat: $("propAnimationRepeat"),
    propAnimationDirection: $("propAnimationDirection"),
    propAnimationStrength: $("propAnimationStrength"),
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
    renameLayer: $("renameLayer"),
    deleteLayer: $("deleteLayer"),
    analyzerPanel: $("analyzerPanel"),
    closeAnalyzerPanel: $("closeAnalyzerPanel"),
    analyzerPath: $("analyzerPath"),
    loadAnalyzerPage: $("loadAnalyzerPage"),
    runAnalyzer: $("runAnalyzer"),
    loadAnalyzerGenericTest: $("loadAnalyzerGenericTest"),
    loadAnalyzerTeaMerryTest: $("loadAnalyzerTeaMerryTest"),
    analyzerStatus: $("analyzerStatus"),
    safeWorkflowPanel: $("safeWorkflowPanel"),
    safeWorkflowContext: $("safeWorkflowContext"),
    safeWorkflowOverall: $("safeWorkflowOverall"),
    safeWorkflowSteps: $("safeWorkflowSteps"),
    safeWorkflowTarget: $("safeWorkflowTarget"),
    safeWorkflowChange: $("safeWorkflowChange"),
    safeWorkflowReview: $("safeWorkflowReview"),
    safeWorkflowApply: $("safeWorkflowApply"),
    safeWorkflowNextAction: $("safeWorkflowNextAction"),
    analyzerFrame: $("analyzerFrame"),
    analyzerSummary: $("analyzerSummary"),
    analyzerElementList: $("analyzerElementList"),
    analyzerElementDetail: $("analyzerElementDetail"),
    mappingCandidateStatus: $("mappingCandidateStatus"),
    mappingCandidatePanel: $("mappingCandidatePanel"),
    confirmedMappingCount: $("confirmedMappingCount"),
    confirmedMappingList: $("confirmedMappingList"),
    safeChangeStatus: $("safeChangeStatus"),
    safeChangeTarget: $("safeChangeTarget"),
    safeChangeIntent: $("safeChangeIntent"),
    safeChangeProperty: $("safeChangeProperty"),
    safeChangeBeforeSource: $("safeChangeBeforeSource"),
    safeChangeBefore: $("safeChangeBefore"),
    safeChangeAfter: $("safeChangeAfter"),
    generateSafeChange: $("generateSafeChange"),
    copySafeChangeJson: $("copySafeChangeJson"),
    copySafeChangeSummary: $("copySafeChangeSummary"),
    clearSafeChange: $("clearSafeChange"),
    safeChangeMessage: $("safeChangeMessage"),
    safeChangeJsonPreview: $("safeChangeJsonPreview"),
    safeChangeSummaryPreview: $("safeChangeSummaryPreview"),
    safePatchStatus: $("safePatchStatus"),
    generateSafePatch: $("generateSafePatch"),
    approveSafePatch: $("approveSafePatch"),
    rejectSafePatch: $("rejectSafePatch"),
    copySafePatchCandidate: $("copySafePatchCandidate"),
    copySafePatchDiff: $("copySafePatchDiff"),
    clearSafePatch: $("clearSafePatch"),
    safePatchMessage: $("safePatchMessage"),
    safePatchSummaryPreview: $("safePatchSummaryPreview"),
    safePatchJsonPreview: $("safePatchJsonPreview"),
    safePatchDiffPreview: $("safePatchDiffPreview"),
    safeApplyStatus: $("safeApplyStatus"),
    runSafeApplyPreflight: $("runSafeApplyPreflight"),
    applySafePatchCandidate: $("applySafePatchCandidate"),
    clearSafeApply: $("clearSafeApply"),
    safeApplyMessage: $("safeApplyMessage"),
    safeApplyDiffPreview: $("safeApplyDiffPreview"),
    safeApplyResultPreview: $("safeApplyResultPreview"),
    siteMapButton: $("siteMapButton"),
    siteMapPanel: $("siteMapPanel"),
    closeSiteMapPanel: $("closeSiteMapPanel"),
    refreshSiteMap: $("refreshSiteMap"),
    siteMapStatus: $("siteMapStatus"),
    siteMapStats: $("siteMapStats"),
    siteMapContext: $("siteMapContext"),
    siteMapAdapterSelect: $("siteMapAdapterSelect"),
    siteMapSearch: $("siteMapSearch"),
    siteMapFitView: $("siteMapFitView"),
    siteMapAutoLayout: $("siteMapAutoLayout"),
    siteMapFreeLayout: $("siteMapFreeLayout"),
    siteMapResetLayout: $("siteMapResetLayout"),
    siteMapGraphViewport: $("siteMapGraphViewport"),
    siteMapGraphCanvas: $("siteMapGraphCanvas"),
    siteMapGraphEdges: $("siteMapGraphEdges"),
    siteMapGraphLinks: $("siteMapGraphLinks"),
    siteMapPageCount: $("siteMapPageCount"),
    siteMapPageCards: $("siteMapPageCards"),
    siteMapLinkCount: $("siteMapLinkCount"),
    siteMapLinkList: $("siteMapLinkList"),
    siteMapSelectedDetail: $("siteMapSelectedDetail"),
    siteMapDiagnosticCount: $("siteMapDiagnosticCount"),
    siteMapDiagnostics: $("siteMapDiagnostics"),
    manifestMappingCount: $("manifestMappingCount"),
    manifestProjectId: $("manifestProjectId"),
    manifestPageId: $("manifestPageId"),
    exportManifest: $("exportManifest"),
    importManifest: $("importManifest"),
    clearRuntimeMappings: $("clearRuntimeMappings"),
    manifestImportFile: $("manifestImportFile"),
    manifestStatus: $("manifestStatus"),
    adapterSelect: $("adapterSelect"),
    adapterStatus: $("adapterStatus"),
    adapterInfo: $("adapterInfo"),
  };

  const adapterRegistry = window.TBalanceAdapter?.createAdapterRegistry({
    getConfirmedMappings: () => state.analyzer.confirmedMappings.map((mapping) => ({ ...mapping })),
  }) || null;
  if (adapterRegistry && window.TBalanceTeaMerryAdapter?.createTeaMerryAdapter) {
    adapterRegistry.registerAdapter(window.TBalanceTeaMerryAdapter.createTeaMerryAdapter({
      getConfirmedMappings: () => state.analyzer.confirmedMappings.map((mapping) => ({ ...mapping })),
    }, {
      genericAdapter: adapterRegistry.get("generic"),
    }));
  }

  async function start() {
    showFileProtocolWarning();
    state.project = await loadAutosave() || renderer.normalizeProject();
    state.uiSettings = resolveUiSettings(state.project);
    state.editorMode = getStartupMode(state.project);
    syncProjectEditorSettings();
    state.pageId = state.project.pages[0].id;
    state.primaryPageId = state.pageId;
    bindEvents();
    installAiBridge();
    renderAll();
  }

  function showFileProtocolWarning() {
    if (window.location.protocol !== "file:") {
      return;
    }
    const warning = document.getElementById("fileProtocolWarning");
    if (warning) {
      warning.hidden = false;
    }
  }

  function bindEvents() {
    els.normalMode.addEventListener("click", () => setEditorMode("normal"));
    els.customMode.addEventListener("click", () => setEditorMode("custom"));
    els.desktopMode.addEventListener("click", () => setViewport("desktop"));
    els.mobileMode.addEventListener("click", () => setViewport("mobile"));
    els.pageSelect.addEventListener("change", () => {
      state.pageId = els.pageSelect.value;
      state.primaryPageId = state.pageId;
      state.windowMode = "single";
      state.windowLayout = "horizontal";
      state.secondaryWindow = null;
      state.suspendedWindow = null;
      state.activeWindow = "primary";
      clearSelection();
      renderAll();
    });
    els.pageSelect.addEventListener("dblclick", beginPageNameEdit);
    els.pageNameInput?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        commitPageNameEdit();
      } else if (event.key === "Escape") {
        event.preventDefault();
        cancelPageNameEdit();
      }
    });
    els.pageNameInput?.addEventListener("blur", commitPageNameEdit);
    bindNewCanvasDialog();
    els.openFile.addEventListener("change", openProjectFile);
    els.existingWebEditMode?.addEventListener("click", () => setExistingWebMode("edit"));
    els.existingWebTestMode?.addEventListener("click", () => setExistingWebMode("test"));
    els.existingWebAudioToggle?.addEventListener("click", toggleExistingWebAudio);
    els.existingWebPageCheck?.addEventListener("click", runExistingWebPageCheck);
    els.existingWebAnalyze?.addEventListener("click", openExistingWebInAnalyzer);
    els.existingWebCreateSafeChange?.addEventListener("click", sendExistingWebPreviewToSafeChange);
    els.existingWebResetPreview?.addEventListener("click", resetExistingWebPreview);
    els.existingWebBackToCanvas?.addEventListener("click", closeExistingWebView);
    els.existingWebFrame?.addEventListener("load", handleExistingWebFrameLoad);
    els.existingWebOpenSubmit?.addEventListener("click", submitExistingWebDialog);
    els.existingWebOpenCancel?.addEventListener("click", closeExistingWebDialog);
    els.existingWebOpenCancelTop?.addEventListener("click", closeExistingWebDialog);
    els.existingWebOpenModal?.addEventListener("pointerdown", (event) => {
      if (event.target === els.existingWebOpenModal) {
        closeExistingWebDialog();
      }
    });
    document.querySelectorAll("[data-existing-web-source]").forEach((button) => {
      button.addEventListener("click", () => {
        if (els.existingWebSourcePath) {
          els.existingWebSourcePath.value = button.dataset.existingWebSource || "index.html";
        }
      });
    });
    els.saveProject.addEventListener("click", () => downloadProject("tbalance"));
    els.saveJson.addEventListener("click", () => downloadProject("json"));
    els.undoButton.addEventListener("click", undo);
    els.redoButton.addEventListener("click", redo);
    els.aiCollabButton.addEventListener("click", toggleAiCollab);
    els.closeAiCollab?.addEventListener("click", closeAiCollabPanel);
    els.aiRequestMode?.addEventListener("change", refreshAiCollabPanel);
    els.shareAiState?.addEventListener("click", shareAiStateToBridge);
    els.aiShareTarget?.addEventListener("change", () => {
      state.withAiShare.targetAi = els.aiShareTarget.value || "chatgpt";
      renderWithAiSafeChangeShare();
    });
    document.addEventListener("click", (event) => {
      if (!event.target?.closest?.("#shareSafeChangeWithAi")) {
        return;
      }
      event.preventDefault();
      shareSafeChangeInstructionWithAi();
    });
    els.cancelExistingWebAiShare?.addEventListener("click", cancelExistingWebAiShare);
    els.pasteExistingWebAiResult?.addEventListener("click", pasteExistingWebAiResultFromClipboard);
    els.applyExistingWebAiResult?.addEventListener("click", importExistingWebAiReviewResult);
    els.loadAiSuggestion?.addEventListener("click", loadAiSuggestionFromBridge);
    els.refreshAiHistory?.addEventListener("click", refreshAiShareHistory);
    els.aiShareHistoryList?.addEventListener("click", handleAiHistoryClick);
    els.aiShowPcMobile?.addEventListener("click", showPcMobileForAiShare);
    els.refreshAiPrompt?.addEventListener("click", refreshAiCollabPanel);
    els.copyAiPrompt?.addEventListener("click", copyAiPrompt);
    els.downloadAiPrompt?.addEventListener("click", downloadAiPrompt);
    els.closeAnalyzerPanel?.addEventListener("click", closeAnalyzerPanel);
    els.loadAnalyzerPage?.addEventListener("click", loadAnalyzerPageFromInput);
    els.runAnalyzer?.addEventListener("click", runReadOnlyAnalyzer);
    els.loadAnalyzerGenericTest?.addEventListener("click", loadAnalyzerGenericTest);
    els.loadAnalyzerTeaMerryTest?.addEventListener("click", loadAnalyzerTeaMerryTest);
    els.analyzerFrame?.addEventListener("load", handleAnalyzerFrameLoad);
    els.analyzerElementList?.addEventListener("click", handleAnalyzerElementListClick);
    els.mappingCandidatePanel?.addEventListener("click", handleMappingCandidateClick);
    els.confirmedMappingList?.addEventListener("click", handleConfirmedMappingListClick);
    els.safeChangeTarget?.addEventListener("change", handleSafeChangeTargetChange);
    els.safeChangeProperty?.addEventListener("change", handleSafeChangePropertyChange);
    els.safeChangeBeforeSource?.addEventListener("change", handleSafeChangeBeforeSourceChange);
    els.safeChangeIntent?.addEventListener("input", () => {
      state.analyzer.safeChange.intent = els.safeChangeIntent.value;
      invalidateSafePatchReview("Safe Change Intentが変更されました。");
    });
    els.safeChangeBefore?.addEventListener("input", () => {
      state.analyzer.safeChange.beforeText = els.safeChangeBefore.value;
      invalidateSafePatchReview("Safe Change Beforeが変更されました。");
    });
    els.safeChangeAfter?.addEventListener("input", () => {
      state.analyzer.safeChange.afterText = els.safeChangeAfter.value;
      invalidateSafePatchReview("Safe Change Afterが変更されました。");
    });
    els.generateSafeChange?.addEventListener("click", generateSafeChangeInstruction);
    els.copySafeChangeJson?.addEventListener("click", copySafeChangeJson);
    els.copySafeChangeSummary?.addEventListener("click", copySafeChangeSummary);
    els.clearSafeChange?.addEventListener("click", clearSafeChangeInstruction);
    els.generateSafePatch?.addEventListener("click", generateSafePatchCandidate);
    els.approveSafePatch?.addEventListener("click", approveSafePatchCandidate);
    els.rejectSafePatch?.addEventListener("click", rejectSafePatchCandidate);
    els.copySafePatchCandidate?.addEventListener("click", copySafePatchCandidate);
    els.copySafePatchDiff?.addEventListener("click", copySafePatchDiff);
    els.clearSafePatch?.addEventListener("click", clearSafePatchCandidate);
    els.runSafeApplyPreflight?.addEventListener("click", runSafeApplyPreflight);
    els.applySafePatchCandidate?.addEventListener("click", applySafePatchCandidate);
    els.clearSafeApply?.addEventListener("click", clearSafeApplyState);
    els.siteMapButton?.addEventListener("click", openSiteMapPanel);
    els.closeSiteMapPanel?.addEventListener("click", closeSiteMapPanel);
    els.refreshSiteMap?.addEventListener("click", refreshSiteMap);
    els.siteMapPageCards?.addEventListener("click", handleSiteMapPageClick);
    els.siteMapPageCards?.addEventListener("dblclick", handleSiteMapPageDoubleClick);
    els.siteMapPageCards?.addEventListener("pointerdown", handleSiteMapPagePointerDown);
    els.siteMapLinkList?.addEventListener("click", handleSiteMapLinkClick);
    els.siteMapGraphEdges?.addEventListener("click", handleSiteMapLinkClick);
    els.siteMapGraphLinks?.addEventListener("click", handleSiteMapLinkClick);
    els.siteMapSearch?.addEventListener("input", () => {
      state.siteMap.search = els.siteMapSearch.value || "";
      renderSiteMapPanel();
    });
    els.siteMapFitView?.addEventListener("click", fitSiteMapView);
    els.siteMapAutoLayout?.addEventListener("click", () => setSiteMapLayoutMode("auto"));
    els.siteMapFreeLayout?.addEventListener("click", () => setSiteMapLayoutMode("free"));
    els.siteMapResetLayout?.addEventListener("click", resetSiteMapLayout);
    els.siteMapGraphViewport?.addEventListener("wheel", handleSiteMapWheel, { passive: false });
    els.siteMapGraphViewport?.addEventListener("pointerdown", handleSiteMapPanStart);
    document.addEventListener("pointermove", handleSiteMapPointerMove);
    document.addEventListener("pointerup", handleSiteMapPointerUp);
    els.siteMapAdapterSelect?.addEventListener("change", () => {
      setAnalyzerAdapter(els.siteMapAdapterSelect.value || "none");
      state.siteMap.selectedPageId = "";
      state.siteMap.selectedLinkId = "";
      setSiteMapStatus("Adapterを切り替えました。Scan Known Pagesを押してください。", "idle");
      renderSiteMapPanel();
    });
    document.querySelectorAll("[data-site-map-filter]").forEach((button) => {
      button.addEventListener("click", () => setSiteMapFilter(button.dataset.siteMapFilter || "all"));
    });
    document.querySelectorAll("[data-site-map-detail-mode]").forEach((button) => {
      button.addEventListener("click", () => setSiteMapDetailMode(button.dataset.siteMapDetailMode || "normal"));
    });
    els.exportManifest?.addEventListener("click", exportAnalyzerManifest);
    els.importManifest?.addEventListener("click", () => els.manifestImportFile?.click());
    els.manifestImportFile?.addEventListener("change", importAnalyzerManifestFromFile);
    els.clearRuntimeMappings?.addEventListener("click", clearRuntimeConfirmedMappings);
    els.adapterSelect?.addEventListener("change", () => setAnalyzerAdapter(els.adapterSelect.value || "none"));
    els.safeWorkflowSteps?.addEventListener("click", handleSafeWorkflowStepClick);
    els.safeWorkflowPanel?.addEventListener("click", handleSafeWorkflowFocusClick);
    els.manifestProjectId?.addEventListener("input", () => {
      state.analyzer.manifestProjectId = sanitizeManifestId(els.manifestProjectId.value || "sample-project", "sample-project");
      renderSafeChangePanel();
      renderManifestPanel();
      renderAdapterPanel();
    });
    els.manifestPageId?.addEventListener("input", () => {
      state.analyzer.manifestPageId = sanitizeManifestId(els.manifestPageId.value || "page-home", "page-home");
      renderSafeChangePanel();
      renderManifestPanel();
      renderAdapterPanel();
    });
    els.balanceCheckButton.addEventListener("click", cycleBalanceMode);
    els.previewButton.addEventListener("click", toggleTestMode);
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
    [els.gridStepX, els.gridStepY, els.guideStepX, els.guideStepY].forEach((input) => {
      input.addEventListener("change", persistGridGuideSettings);
    });
    els.snapToGrid.addEventListener("change", persistGridGuideSettings);
    els.snapToGuide.addEventListener("change", persistGridGuideSettings);
    els.moveTool.addEventListener("click", (event) => setTool("move", event));
    document.querySelector('[data-tool="pen"]')?.addEventListener("click", (event) => setTool("pen", event));
    document.querySelector('[data-tool="clone"]')?.addEventListener("click", (event) => setTool("clone", event));
    document.querySelector('[data-tool="eraser"]')?.addEventListener("click", (event) => setTool("eraser", event));
    document.querySelector('[data-tool="fill"]')?.addEventListener("click", (event) => setTool("fill", event));
    document.querySelector('[data-tool="retouch"]')?.addEventListener("click", (event) => setTool("retouch", event));
    els.selectTool.addEventListener("click", (event) => {
      setTool("select");
      toggleToolMenu("select", event);
    });
    els.imageFile.addEventListener("change", handleImageFile);
    els.addText.addEventListener("click", activateTextTool);
    document.querySelector('[data-tool="animation"]')?.addEventListener("click", activateAnimationTool);
    els.addBubble.addEventListener("click", (event) => {
      setTool("note", event);
      showModeToast("自分メモ: 置きたい場所をクリックしてください。", { event });
    });
    els.markupButton.addEventListener("click", toggleMarkupMenu);
    els.addButton.addEventListener("click", (event) => {
      setTool("click");
      toggleToolMenu("click", event);
    });
    document.querySelectorAll("[data-sound-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        state.soundMode = normalizeSoundMode(button.dataset.soundMode);
        closeToolMenus();
        activateSoundTool();
      });
    });
    els.soundFile?.addEventListener("change", handleSoundFile);
    els.eyedropperTool.addEventListener("click", () => setTool("eyedropper"));
    els.shapeTool.addEventListener("change", () => {
      if (els.shapeTool.value) {
        addShapeLayer(els.shapeTool.value);
        els.shapeTool.value = "";
      }
    });
    bindToolMenus();
    bindHeaderMenus();
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
    els.foregroundSwatch.addEventListener("click", () => setActiveColorSlot("foreground"));
    els.backgroundSwatch.addEventListener("click", () => setActiveColorSlot("background"));
    els.styleColorInput.addEventListener("input", () => updateActiveColor(els.styleColorInput.value));
    els.styleHexInput.addEventListener("change", () => updateActiveColor(els.styleHexInput.value));
    els.transparentColor.addEventListener("click", () => {
      setActiveColorSlot("background");
      updateActiveColor("transparent");
    });
    els.styleBrightness.addEventListener("input", () => updateActiveColorBrightness(Number(els.styleBrightness.value)));
    els.styleSaturation.addEventListener("input", () => updateActiveColorSaturation(Number(els.styleSaturation.value)));
    els.styleOpacity.addEventListener("input", () => {
      setSelectedOpacity(Number(els.styleOpacity.value));
    });
    els.brushTip.addEventListener("change", () => updateBrushSetting("brushTip", els.brushTip.value));
    els.headerBrushTip.addEventListener("change", () => updateBrushSetting("brushTip", els.headerBrushTip.value));
    els.eraserTip.addEventListener("change", () => updateBrushSetting("eraserTip", els.eraserTip.value));
    els.headerEraserTip.addEventListener("change", () => updateBrushSetting("eraserTip", els.headerEraserTip.value));
    [
      [els.brushSize, "brushSize"],
      [els.brushStrength, "brushStrength"],
      [els.brushOpacity, "brushOpacity"],
      [els.headerBrushSize, "brushSize"],
      [els.headerBrushStrength, "brushStrength"],
      [els.headerBrushOpacity, "brushOpacity"],
      [els.eraserSize, "eraserSize"],
      [els.headerEraserSize, "eraserSize"],
    ].forEach(([input, key]) => {
      input.addEventListener("input", () => updateBrushSetting(key, Number(input.value)));
    });
    document.querySelectorAll("[data-eraser-size]").forEach((button) => {
      button.addEventListener("click", () => {
        setTool("eraser");
        updateBrushSetting("eraserSize", Number(button.dataset.eraserSize));
      });
    });
    els.retouchMode?.addEventListener("change", () => updateRetouchSetting("retouchMode", els.retouchMode.value));
    els.retouchTip?.addEventListener("change", () => updateRetouchSetting("retouchTip", els.retouchTip.value));
    [
      [els.retouchSize, "retouchSize"],
      [els.retouchHardness, "retouchHardness"],
      [els.retouchOpacity, "retouchOpacity"],
      [els.retouchStep, "retouchStep"],
      [els.retouchDensity, "retouchDensity"],
    ].forEach(([input, key]) => {
      input?.addEventListener("input", () => updateRetouchSetting(key, Number(input.value)));
    });
    document.querySelectorAll("[data-style-color-target]").forEach((button) => {
      button.addEventListener("click", () => applyActiveColor(button.dataset.styleColorTarget));
    });
    document.querySelectorAll("[data-style-preset]").forEach((button) => {
      button.addEventListener("click", () => updateActiveColor(button.dataset.stylePreset));
    });
    els.rightPanelDivider.addEventListener("pointerdown", beginInspectorResize);
    els.zoomOut.addEventListener("click", () => stepZoom(-0.1));
    els.zoomIn.addEventListener("click", () => stepZoom(0.1));
    els.fitCanvas.addEventListener("click", () => {
      setActiveWindowZoom("fit");
      updateCanvasScale();
    });
    els.actualSize.addEventListener("click", () => {
      setActiveWindowZoom(1);
      updateCanvasScale();
    });
    els.canvasViewport.addEventListener("dragover", handleDragOver);
    els.canvasViewport.addEventListener("drop", handleDrop);
    document.addEventListener("paste", handlePaste);
    els.canvas.addEventListener("pointerdown", handleClonePointerCapture, true);
    els.secondaryCanvas.addEventListener("pointerdown", handleClonePointerCapture, true);
    els.canvas.addEventListener("pointerdown", handleCanvasPointerDown);
    els.secondaryCanvas.addEventListener("pointerdown", handleSecondaryCanvasPointerDown);
    els.canvas.addEventListener("click", handleSelectionFloatAction);
    els.secondaryCanvas.addEventListener("click", handleSelectionFloatAction);
    els.canvas.addEventListener("contextmenu", handleSelectionContextMenu);
    els.secondaryCanvas.addEventListener("contextmenu", handleSelectionContextMenu);
    els.canvas.addEventListener("pointerleave", hideBrushPreview);
    els.secondaryCanvas.addEventListener("pointerleave", hideBrushPreview);
    els.canvas.addEventListener("dblclick", handleDoubleClick);
    els.layerList.addEventListener("click", handleLayerListClick);
    els.layerList.addEventListener("dblclick", handleLayerListDoubleClick);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", endPointer);
    window.addEventListener("resize", updateCanvasScale);
    document.addEventListener("keydown", handleKeys);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("pointerdown", handleDocumentPointerDown);
    bindPropertyInputs();
    bindLayerButtons();
  }

  function bindToolMenus() {
    document.querySelectorAll("[data-tool-menu-trigger]").forEach((button) => {
      const menuName = button.dataset.toolMenuTrigger;
      if (menuName === "select" || menuName === "click") {
        return;
      }
      button.addEventListener("click", (event) => {
        if (button.dataset.tool) {
          setTool(button.dataset.tool, event);
        }
        toggleToolMenu(menuName, event);
      });
    });
    document.querySelectorAll("[data-select-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.disabled) {
          return;
        }
        const mode = button.dataset.selectMode || "rect";
        state.selectionMode = mode;
        setTool("select");
        closeToolMenus();
        const messages = {
          layer: "レイヤー選択: ドラッグした範囲に重なったレイヤーを選択します。",
          rect: "四角範囲選択: 背景や画像の一部を範囲として選べます。",
          ellipse: "丸・楕円範囲選択: 丸い範囲を素材化・当たり判定化できます。",
        };
        showModeToast(messages[mode] || messages.rect);
      });
    });
    document.querySelectorAll("[data-select-range-action]").forEach((button) => {
      button.addEventListener("click", () => {
        handleSelectionRangeAction(button.dataset.selectRangeAction);
        closeToolMenus();
      });
    });
    document.querySelectorAll("[data-click-action]").forEach((button) => {
      button.addEventListener("click", () => {
        handleClickActionMenu(button.dataset.clickAction);
      });
    });
    document.querySelectorAll("[data-shape-menu]").forEach((button) => {
      button.addEventListener("click", () => {
        const shape = button.dataset.shapeMenu;
        closeToolMenus();
        closeHeaderMenus();
        if (shape) {
          addShapeLayer(shape);
        }
      });
    });
    document.querySelectorAll("[data-shape-detail-focus]").forEach((button) => {
      button.addEventListener("click", () => {
        closeHeaderMenus();
        const target = button.dataset.shapeDetailFocus;
        const focusMap = {
          fill: els.propShapeFillMode,
          stroke: els.propShapeStroke,
          strokeWidth: els.propShapeStrokeWidth,
          radius: els.propShapeRadius,
          link: els.propLink,
        };
        if (getSelectedLayer()?.type !== "shape") {
          showModeToast("図形レイヤーを選択してください。");
          return;
        }
        if (target === "fill" || target === "stroke") {
          setShapeColorTarget(target);
          setInspectorTab("property");
          showModeToast(target === "fill" ? "図形の塗り色を選択中です。右パレットで色を選んでください。" : "図形の線色を選択中です。右パレットで色を選んでください。");
        }
        focusMap[target]?.focus();
      });
    });
  }

  function bindHeaderMenus() {
    document.querySelectorAll("[data-header-menu-trigger]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleHeaderMenu(button.dataset.headerMenuTrigger);
      });
    });
    document.querySelectorAll("[data-file-action]").forEach((button) => {
      button.addEventListener("click", () => handleFileMenuAction(button.dataset.fileAction));
    });
    document.querySelectorAll("[data-view-action]").forEach((button) => {
      button.addEventListener("click", () => handleViewMenuAction(button.dataset.viewAction));
    });
    document.querySelectorAll("[data-image-action]").forEach((button) => {
      button.addEventListener("click", () => handleImageMenuAction(button.dataset.imageAction));
    });
    document.querySelectorAll("[data-layer-menu-action]").forEach((button) => {
      button.addEventListener("click", () => handleLayerMenuAction(button.dataset.layerMenuAction));
    });
    document.querySelectorAll("[data-select-action]").forEach((button) => {
      button.addEventListener("click", () => handleSelectMenuAction(button.dataset.selectAction));
    });
    document.querySelectorAll("[data-color-action]").forEach((button) => {
      button.addEventListener("click", () => handleColorMenuAction(button.dataset.colorAction));
    });
    document.querySelectorAll("[data-animation-menu]").forEach((button) => {
      button.addEventListener("click", () => handleAnimationMenuAction(button.dataset.animationMenu));
    });
    document.querySelectorAll("[data-window-action]").forEach((button) => {
      button.addEventListener("click", () => handleWindowMenuAction(button.dataset.windowAction));
    });
    document.querySelectorAll("[data-help-action]").forEach((button) => {
      button.addEventListener("click", () => handleHelpMenuAction(button.dataset.helpAction));
    });
  }

  function toggleHeaderMenu(name) {
    const targetMenu = document.querySelector(`[data-header-menu="${name}"]`);
    if (!targetMenu) {
      return;
    }
    const shouldOpen = targetMenu.hidden;
    closeHeaderMenus();
    closeToolMenus();
    targetMenu.hidden = !shouldOpen;
  }

  function closeHeaderMenus() {
    document.querySelectorAll("[data-header-menu]").forEach((menu) => {
      menu.hidden = true;
    });
  }

  function handleFileMenuAction(action) {
    closeHeaderMenus();
    if (action === "new") {
      openNewCanvasDialog();
      return;
    }
    if (action === "open") {
      els.openFile.click();
      return;
    }
    if (action === "open-existing-web") {
      openExistingWebFromMenu();
      return;
    }
    if (action === "save") {
      downloadProject("tbalance");
      return;
    }
    if (action === "save-as") {
      saveProjectAs();
      return;
    }
    if (action === "close") {
      closeProject();
      return;
    }
    if (action === "screenshot") {
      captureCanvasScreenshot();
      return;
    }
    if (action === "export") {
      exportStandaloneHtml();
      return;
    }
    if (action === "print") {
      window.print();
      return;
    }
    const labels = {
      template: "テンプレートから開く",
      recent: "最近使ったファイル",
      import: "インポート",
      backup: "データーベースのバックアップ",
      exit: "終了",
    };
    showModeToast(`${labels[action] || "ファイル操作"} は次の段階で接続します。`);
  }

  function bindNewCanvasDialog() {
    document.querySelectorAll("[data-new-canvas-preset]").forEach((button) => {
      button.addEventListener("click", () => selectNewCanvasPreset(button.dataset.newCanvasPreset));
    });
    [els.newCanvasWidth, els.newCanvasHeight].forEach((input) => {
      input?.addEventListener("input", markNewCanvasCustomPreset);
    });
    els.newCanvasCreate?.addEventListener("click", submitNewCanvasDialog);
    els.newCanvasCancel?.addEventListener("click", closeNewCanvasDialog);
    els.newCanvasCancelTop?.addEventListener("click", closeNewCanvasDialog);
    els.newCanvasModal?.addEventListener("pointerdown", (event) => {
      if (event.target === els.newCanvasModal) {
        closeNewCanvasDialog();
      }
    });
  }

  function openNewCanvasDialog() {
    const page = getCurrentPage();
    const size = getPageViewportSize(page, state.viewport);
    const title = isUntitledProject() ? "未命名" : getProjectBaseName();
    els.newCanvasName.value = title || page?.name || state.project?.name || "未命名";
    els.newCanvasWidth.value = Math.round(size.width || 1920);
    els.newCanvasHeight.value = Math.round(size.height || 1080);
    const stage = renderer.normalizeStage(page?.stage);
    const backgroundInput = document.querySelector(`input[name="newCanvasBackground"][value="${stage.backgroundType}"]`);
    if (backgroundInput) {
      backgroundInput.checked = true;
    }
    if (els.newCanvasBackgroundColor) {
      els.newCanvasBackgroundColor.value = stage.backgroundColor || "#fff6db";
    }
    const startInput = document.querySelector('input[name="newCanvasStart"][value="blank"]');
    if (startInput) {
      startInput.checked = true;
    }
    selectNewCanvasPreset(findPresetForSize(size.width, size.height, state.viewport), { updateSize: false });
    els.newCanvasModal.hidden = false;
    window.setTimeout(() => els.newCanvasName?.focus(), 0);
  }

  function closeNewCanvasDialog() {
    if (els.newCanvasModal) {
      els.newCanvasModal.hidden = true;
    }
  }

  function selectNewCanvasPreset(presetKey, options = {}) {
    const key = NEW_CANVAS_PRESETS[presetKey] ? presetKey : "custom";
    document.querySelectorAll("[data-new-canvas-preset]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.newCanvasPreset === key);
    });
    if (options.updateSize === false || key === "custom") {
      return;
    }
    const preset = NEW_CANVAS_PRESETS[key];
    els.newCanvasWidth.value = preset.width;
    els.newCanvasHeight.value = preset.height;
  }

  function markNewCanvasCustomPreset() {
    selectNewCanvasPreset("custom", { updateSize: false });
  }

  function findPresetForSize(width, height, viewport) {
    const normalizedWidth = Math.round(Number(width) || 0);
    const normalizedHeight = Math.round(Number(height) || 0);
    if (viewport === "mobile" && normalizedWidth === 1080 && normalizedHeight === 1920) {
      return "teamerry-mobile";
    }
    const match = Object.entries(NEW_CANVAS_PRESETS).find(([key, preset]) => {
      return key !== "custom" && preset.width === normalizedWidth && preset.height === normalizedHeight;
    });
    return match?.[0] || "custom";
  }

  async function submitNewCanvasDialog() {
    const options = getNewCanvasOptions();
    if (!options) {
      return;
    }
    const created = await createNewProject(options);
    if (!created) {
      return;
    }
    closeNewCanvasDialog();
    if (options.startMode === "image") {
      window.setTimeout(() => els.imageFile?.click(), 80);
    }
  }

  function getNewCanvasOptions() {
    const width = Math.round(Number(els.newCanvasWidth?.value) || 0);
    const height = Math.round(Number(els.newCanvasHeight?.value) || 0);
    if (width < 1 || height < 1) {
      showModeToast("キャンバスの幅と高さを入力してください。");
      return null;
    }
    const activePreset = document.querySelector("[data-new-canvas-preset].is-active")?.dataset.newCanvasPreset || "custom";
    const preset = NEW_CANVAS_PRESETS[activePreset] || NEW_CANVAS_PRESETS.custom;
    const name = String(els.newCanvasName?.value || "").trim() || "未命名";
    const backgroundType = document.querySelector('input[name="newCanvasBackground"]:checked')?.value || "transparent";
    const startMode = document.querySelector('input[name="newCanvasStart"]:checked')?.value || "blank";
    const stage = {
      backgroundType,
      backgroundColor: els.newCanvasBackgroundColor?.value || "#ffffff",
    };
    const desktop = activePreset === "custom"
      ? { width, height, label: "カスタム" }
      : Object.assign({}, preset.desktop);
    const mobile = activePreset === "custom"
      ? { width, height, label: "カスタム" }
      : Object.assign({}, preset.mobile);
    if (activePreset !== "teamerry-pc" && activePreset !== "teamerry-mobile") {
      desktop.width = width;
      desktop.height = height;
      mobile.width = width;
      mobile.height = height;
    }
    return {
      name,
      pageName: name,
      desktop,
      mobile,
      activeViewport: activePreset === "teamerry-mobile" ? "mobile" : preset.activeViewport || "desktop",
      stage,
      startMode,
    };
  }

  function handleViewMenuAction(action) {
    closeHeaderMenus();
    if (action === "zoom-in") {
      stepZoom(0.1);
      return;
    }
    if (action === "zoom-out") {
      stepZoom(-0.1);
      return;
    }
    if (action === "actual-size") {
      setActiveWindowZoom(1);
      updateCanvasScale();
      return;
    }
    if (action === "fit" || action === "show-all") {
      setActiveWindowZoom("fit");
      updateCanvasScale();
      return;
    }
    if (action === "hit-area") {
      state.showHitAreas = !state.showHitAreas;
      renderAll();
      return;
    }
    if (action === "analyzer") {
      openAnalyzerPanel();
      return;
    }
    if (action === "grid") {
      state.uiSettings.showGrid = !state.uiSettings.showGrid;
      persistGridGuideSettings({ silent: true, skipInputs: true });
      updateViewMenuState();
      showModeToast(state.uiSettings.showGrid ? "グリッドを表示しました。" : "グリッドを非表示にしました。");
      return;
    }
    if (action === "guide") {
      state.uiSettings.showGuides = !state.uiSettings.showGuides;
      persistGridGuideSettings({ silent: true, skipInputs: true });
      updateViewMenuState();
      showModeToast(state.uiSettings.showGuides ? "ガイドを表示しました。" : "ガイドを非表示にしました。");
      return;
    }
    if (action === "ruler") {
      state.uiSettings.showRulers = !state.uiSettings.showRulers;
      persistGridGuideSettings({ silent: true, skipInputs: true });
      updateViewMenuState();
      showModeToast(state.uiSettings.showRulers ? "ルーラーを表示しました。" : "ルーラーを非表示にしました。");
      return;
    }
    if (action === "grid-guide-settings") {
      els.settingsPanel.hidden = false;
      renderSettings();
      els.gridStepX.focus();
      return;
    }
    const labels = {
      "left-toolbar": "左ツールバーを表示",
      "right-panel": "右パネルを表示",
      "status-bar": "ステータスバーを表示",
      fullscreen: "フルスクリーン",
    };
    showModeToast(`${labels[action] || "表示操作"} は次の段階で接続します。`);
  }

  function openAnalyzerPanel() {
    state.analyzer.open = true;
    if (els.analyzerPanel) {
      els.analyzerPanel.hidden = false;
    }
    setAnalyzerStatus("idle", "読み取り専用です。既存HTML/CSS/JSには書き込みません。");
    renderAnalyzerResult();
  }

  function closeAnalyzerPanel() {
    state.analyzer.open = false;
    if (els.analyzerPanel) {
      els.analyzerPanel.hidden = true;
    }
  }

  function loadAnalyzerPageFromInput() {
    const path = (els.analyzerPath?.value || "").trim();
    if (!path) {
      setAnalyzerStatus("error", "解析するページパスを入力してください。");
      return;
    }
    loadAnalyzerUrl(path, "local");
  }

  function loadAnalyzerTeaMerryTest() {
    const reference = adapterRegistry?.get("teamerry")?.getReferenceTarget?.("observatory-night", {
      baseUrl: window.location.href,
      currentUrl: window.location.href,
      origin: window.location.origin,
    });
    const url = reference?.url || new URL("../../observatory.html?time=night", window.location.href).href;
    if (els.analyzerPath) {
      els.analyzerPath.value = url;
    }
    loadAnalyzerUrl(url, reference?.loadedKind || "teamerry-reference", reference?.meta || {
      sourcePath: "observatory.html",
      viewState: "time=night",
      allowScripts: true,
    });
  }

  function loadAnalyzerGenericTest() {
    const genericFixture = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>TBalance Analyzer Generic Test</title>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; background: #f7f2e6; color: #172033; }
    main { display: grid; grid-template-columns: 1fr 280px; gap: 24px; min-height: 100vh; padding: 32px; }
    .hero { position: relative; min-height: 360px; border-radius: 16px; background: linear-gradient(135deg, #dbeafe, #fef3c7); overflow: hidden; }
    .badge { position: absolute; left: 32px; top: 32px; padding: 8px 14px; border-radius: 999px; background: #14532d; color: white; }
    .card { display: flex; flex-direction: column; gap: 12px; padding: 24px; border-radius: 12px; background: rgba(255,255,255,.8); }
    .float { position: absolute; right: 48px; bottom: 42px; width: 160px; height: 96px; background: #f97316; transform: rotate(-4deg); }
    .patch-safe-box { position: absolute; left: 220px; top: 180px; width: 80px; height: 48px; background: #22c55e; }
  </style>
</head>
<body>
  <main data-demo="generic">
    <section class="hero" aria-label="読み取りテスト">
      <p class="badge">safe visual candidate</p>
      <div class="patch-safe-box" data-part="patch-safe-box"></div>
      <div class="float" data-part="visual-box"></div>
      <a href="#next" onclick="return false">リンク候補</a>
    </section>
    <aside class="card">
      <h1>既存ページ解析</h1>
      <button type="button" onclick="alert('blocked')">動作あり</button>
      <form action="/demo"><input type="email" placeholder="mail@example.com"></form>
    </aside>
  </main>
</body>
</html>`;
    state.analyzer.loadedPath = "generic-srcdoc-fixture";
    state.analyzer.loadedKind = "generic-test";
    state.analyzer.effectiveUrl = "srcdoc";
    state.analyzer.sourcePath = "";
    state.analyzer.viewState = "";
    state.analyzer.result = null;
    state.analyzer.selectedId = "";
    state.analyzer.mappingWarning = "";
    syncManifestInputsToAnalyzerPage();
    if (els.analyzerFrame) {
      setAnalyzerFrameSandbox(false);
      els.analyzerFrame.removeAttribute("src");
      els.analyzerFrame.srcdoc = genericFixture;
    }
    setAnalyzerStatus("loading", "Generic Testを読み込み中です。");
    renderAnalyzerResult();
  }

  function loadAnalyzerUrl(path, kind = "local", meta = {}) {
    state.analyzer.loadedPath = path;
    state.analyzer.loadedKind = kind;
    state.analyzer.effectiveUrl = "";
    state.analyzer.sourcePath = meta.sourcePath || "";
    state.analyzer.viewState = meta.viewState || "";
    state.analyzer.result = null;
    state.analyzer.selectedId = "";
    state.analyzer.mappingWarning = "";
    syncManifestInputsToAnalyzerPage();
    if (els.analyzerFrame) {
      setAnalyzerFrameSandbox(Boolean(meta.allowScripts));
      els.analyzerFrame.removeAttribute("srcdoc");
      els.analyzerFrame.src = path;
    }
    setAnalyzerStatus("loading", `${path} を読み込み中です。`);
    renderAnalyzerResult();
  }

  function openExistingWebFromMenu() {
    openExistingWebDialog();
  }

  function openExistingWebDialog() {
    if (els.existingWebSourcePath) {
      els.existingWebSourcePath.value = getExistingWebDefaultSourcePath();
    }
    if (els.existingWebOpenModal) {
      els.existingWebOpenModal.hidden = false;
    }
    requestAnimationFrame(() => {
      els.existingWebSourcePath?.focus();
      els.existingWebSourcePath?.select();
    });
  }

  function closeExistingWebDialog() {
    if (els.existingWebOpenModal) {
      els.existingWebOpenModal.hidden = true;
    }
  }

  function submitExistingWebDialog() {
    const sourcePath = String(els.existingWebSourcePath?.value || "").trim();
    if (!sourcePath) {
      alert("index.html などの入口HTMLを入力してください。");
      return;
    }
    const opened = openExistingWebPage(sourcePath, { autoSelectAdapter: true });
    if (opened) {
      closeExistingWebDialog();
    }
  }

  function openExistingWebPage(target, options = {}) {
    const info = resolveExistingWebPageInfo(target, options);
    if (!info || !info.sourcePath || isSiteMapPlaceholderSource(info.sourcePath)) {
      alert("既存Webページを開けませんでした。\nindex.html など、localhost配下で確認できるHTMLを指定してください。");
      return null;
    }
    if (state.existingWeb.active) {
      resetExistingWebPreview({ skipRender: true });
    }
    if (info.adapterId && info.adapterId !== state.analyzer.adapterId) {
      setAnalyzerAdapter(info.adapterId);
    }
    state.existingWeb = {
      active: true,
      pageId: info.pageId,
      label: info.label,
      sourcePath: info.sourcePath,
      sourceAuthority: "standard-web",
      currentUrl: info.currentUrl,
      viewState: info.viewState,
      targetState: info.targetState,
      adapterId: info.adapterId || state.analyzer.adapterId || "none",
      mode: "edit",
      selected: null,
      virtualLayers: [],
      checks: {},
      aiReviews: {},
      pageCheck: {
        status: "idle",
        fingerprint: "",
        checkedAt: "",
        summary: null,
      },
      audioMuted: true,
      preview: {
        active: false,
        changes: [],
      },
      previewHistory: [],
      previewFuture: [],
      impactAnalysis: null,
      reloadToken: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      drag: null,
    };
    prepareAnalyzerForExistingWeb(info);
    state.windowMode = "single";
    state.windowLayout = "horizontal";
    state.secondaryWindow = null;
    state.suspendedWindow = null;
    clearSelection();
    renderAll();
    scheduleExistingWebPageCheckRestore(info.currentUrl);
    showModeToast(`${info.label || info.sourcePath} を既存Webページとして開きました。`);
    return info;
  }

  function resolveExistingWebPageInfo(target, options = {}) {
    const raw = typeof target === "string"
      ? target
      : target?.sourcePath || target?.path || target?.url || target?.currentUrl || "";
    const split = splitExistingWebTarget(raw, target?.targetState || null);
    const sourcePath = normalizeExistingWebSourcePath(target?.sourcePath || split.sourcePath || raw);
    const knownPage = target?.pageId ? target : findKnownPageBySourcePath(sourcePath);
    const adapterId = options.autoSelectAdapter === false
      ? state.analyzer.adapterId
      : findAdapterIdForExistingPage(sourcePath) || state.analyzer.adapterId || "none";
    const pageId = target?.pageId || knownPage?.pageId || suggestManifestPageId(sourcePath);
    const label = target?.label || knownPage?.label || getExistingWebLabel(sourcePath);
    const viewState = normalizeExistingWebViewState(target?.viewState || target?.targetState?.viewState || split.viewState || "");
    const hash = target?.targetState?.hash || split.hash || "";
    return {
      pageId,
      label,
      sourcePath,
      viewState,
      currentUrl: buildExistingWebUrl(sourcePath, viewState, hash),
      targetState: {
        query: viewState,
        hash,
        viewState,
      },
      adapterId,
    };
  }

  function splitExistingWebTarget(raw, targetState = null) {
    const value = String(raw || "").trim();
    try {
      const url = new URL(value, getExistingWebBaseUrl());
      return {
        sourcePath: url.pathname.split("/").filter(Boolean).pop() || "index.html",
        viewState: targetState?.viewState || url.search.replace(/^\?/, ""),
        hash: targetState?.hash || url.hash.replace(/^#/, ""),
      };
    } catch (error) {
      const query = getQueryFromResolvedPath(value);
      const hash = getHashFromResolvedPath(value);
      return {
        sourcePath: value.split("?")[0].split("#")[0],
        viewState: targetState?.viewState || query,
        hash: targetState?.hash || hash,
      };
    }
  }

  function normalizeExistingWebSourcePath(value) {
    if (window.TBalanceSiteMap?.normalizeSourcePath) {
      return window.TBalanceSiteMap.normalizeSourcePath(value || "index.html");
    }
    return String(value || "index.html").replace(/\\/g, "/").replace(/^[./]+/, "").split("?")[0].split("#")[0] || "index.html";
  }

  function normalizeExistingWebViewState(value) {
    return String(value || "").trim().replace(/^\?/, "");
  }

  function buildExistingWebUrl(sourcePath, viewState = "", hash = "") {
    const url = new URL(normalizeExistingWebSourcePath(sourcePath), getExistingWebBaseUrl());
    if (viewState) {
      url.search = viewState;
    }
    if (hash) {
      url.hash = hash;
    }
    return url.href;
  }

  function getExistingWebBaseUrl() {
    if (window.location.protocol === "file:") {
      return "http://127.0.0.1:8788/";
    }
    return new URL("../../", window.location.href).href;
  }

  function getExistingWebDefaultSourcePath() {
    const adapter = getActiveAnalyzerAdapter();
    const knownPages = typeof adapter?.getKnownPages === "function" ? adapter.getKnownPages(getAnalyzerAdapterContext()) : [];
    return knownPages.find((page) => page.pageId === "page-home")?.sourcePath
      || knownPages[0]?.sourcePath
      || state.existingWeb.sourcePath
      || "index.html";
  }

  function findKnownPageBySourcePath(sourcePath) {
    const clean = normalizeExistingWebSourcePath(sourcePath);
    const adapters = adapterRegistry?.list?.() || [];
    const context = getExistingWebLookupContext(sourcePath);
    for (const adapter of adapters) {
      const pages = typeof adapter?.getKnownPages === "function" ? adapter.getKnownPages(context) : [];
      const match = pages.find((page) => normalizeExistingWebSourcePath(page.sourcePath || page.path || page.url) === clean);
      if (match) {
        return match;
      }
    }
    return null;
  }

  function findAdapterIdForExistingPage(sourcePath) {
    const clean = normalizeExistingWebSourcePath(sourcePath);
    const context = getExistingWebLookupContext(sourcePath);
    const matches = (adapterRegistry?.list?.() || [])
      .filter((adapter) => adapter?.id && adapter.id !== "none")
      .filter((adapter) => {
        const pages = typeof adapter.getKnownPages === "function" ? adapter.getKnownPages(context) : [];
        return pages.some((page) => normalizeExistingWebSourcePath(page.sourcePath || page.path || page.url) === clean);
      });
    return matches.length === 1 ? matches[0].id : "";
  }

  function getExistingWebLookupContext(sourcePath = "") {
    const clean = normalizeExistingWebSourcePath(sourcePath || state.analyzer.sourcePath || state.existingWeb.sourcePath || "index.html");
    return {
      pageId: state.existingWeb.pageId || suggestManifestPageId(clean),
      sourcePath: clean,
      viewState: state.existingWeb.viewState || state.analyzer.viewState || "",
      sourceAuthority: "standard-web",
      effectiveUrl: state.existingWeb.currentUrl || buildExistingWebUrl(clean),
      currentUrl: state.existingWeb.currentUrl || buildExistingWebUrl(clean),
      baseUrl: state.existingWeb.currentUrl || buildExistingWebUrl(clean),
    };
  }

  function getExistingWebLabel(sourcePath) {
    const clean = normalizeExistingWebSourcePath(sourcePath);
    return clean === "index.html" ? "トップページ" : clean;
  }

  function prepareAnalyzerForExistingWeb(info) {
    state.analyzer.loadedPath = info.currentUrl;
    state.analyzer.loadedKind = "existing-web";
    state.analyzer.effectiveUrl = info.currentUrl;
    state.analyzer.sourcePath = info.sourcePath;
    state.analyzer.viewState = info.viewState || "";
    state.analyzer.result = null;
    state.analyzer.selectedId = "";
    state.analyzer.mappingWarning = "";
    state.analyzer.manifestPageId = info.pageId;
    if (els.analyzerPath) {
      els.analyzerPath.value = info.currentUrl;
    }
    syncManifestInputsToAnalyzerPage();
  }

  function openExistingWebInAnalyzer() {
    if (!state.existingWeb.active || !state.existingWeb.currentUrl) {
      return;
    }
    openAnalyzerPanel();
    loadAnalyzerUrl(state.existingWeb.currentUrl, "existing-web", {
      sourcePath: state.existingWeb.sourcePath,
      viewState: state.existingWeb.viewState,
      allowScripts: true,
    });
  }

  function closeExistingWebView() {
    resetExistingWebPreview({ skipRender: true });
    uninstallExistingWebSelection();
    state.existingWeb.active = false;
    renderAll();
  }

  function handleExistingWebFrameLoad() {
    if (!state.existingWeb.active) {
      return;
    }
    state.existingWeb.selected = null;
    state.existingWeb.drag = null;
    state.existingWeb.virtualLayers = [];
    state.existingWeb.checks = {};
    state.existingWeb.aiReviews = {};
    state.existingWeb.pageCheck = {
      status: "idle",
      fingerprint: getExistingWebFingerprint(),
      checkedAt: "",
      summary: null,
    };
    state.existingWeb.audioMuted = true;
    state.existingWeb.preview = {
      active: false,
      changes: [],
    };
    state.existingWeb.previewHistory = [];
    state.existingWeb.previewFuture = [];
    state.existingWeb.impactAnalysis = null;
    installExistingWebEditMode();
    restoreExistingWebPageCheckCache();
    refreshExistingWebVirtualLayers();
    showModeToast(`${state.existingWeb.label || state.existingWeb.sourcePath} を表示しました。`);
    renderAll();
  }

  function setExistingWebMode(mode) {
    if (!state.existingWeb.active) {
      return;
    }
    state.existingWeb.mode = mode === "test" ? "test" : "edit";
    state.existingWeb.drag = null;
    installExistingWebEditMode();
    applyExistingWebAudioPolicy();
    renderAll();
  }

  function installExistingWebEditMode() {
    const frame = els.existingWebFrame;
    let doc;
    try {
      doc = frame?.contentDocument;
    } catch (error) {
      doc = null;
    }
    if (!doc || !doc.documentElement) {
      return;
    }
    ensureExistingWebRuntimeStyle(doc);
    uninstallExistingWebSelectionListeners(doc);
    if (state.existingWeb.mode === "edit") {
      doc.addEventListener("pointerdown", handleExistingWebPointerDown, true);
      doc.addEventListener("pointermove", handleExistingWebPointerMove, true);
      doc.addEventListener("pointerup", handleExistingWebPointerUp, true);
      doc.addEventListener("click", handleExistingWebClick, true);
      doc.addEventListener("submit", stopExistingWebNativeAction, true);
      doc.addEventListener("keydown", handleExistingWebKeydown, true);
      doc.__tbExistingWebSelectionInstalled = true;
    }
    applyExistingWebAudioPolicy();
    applyExistingWebSelectionClass();
  }

  function uninstallExistingWebSelection() {
    const doc = getExistingWebDocument();
    if (doc) {
      uninstallExistingWebSelectionListeners(doc);
      clearExistingWebSelectionClass(doc);
    }
  }

  function uninstallExistingWebSelectionListeners(doc) {
    if (!doc?.__tbExistingWebSelectionInstalled) {
      return;
    }
    doc.removeEventListener("pointerdown", handleExistingWebPointerDown, true);
    doc.removeEventListener("pointermove", handleExistingWebPointerMove, true);
    doc.removeEventListener("pointerup", handleExistingWebPointerUp, true);
    doc.removeEventListener("click", handleExistingWebClick, true);
    doc.removeEventListener("submit", stopExistingWebNativeAction, true);
    doc.removeEventListener("keydown", handleExistingWebKeydown, true);
    doc.__tbExistingWebSelectionInstalled = false;
  }

  function ensureExistingWebRuntimeStyle(doc) {
    if (doc.getElementById("__tb_existing_web_runtime_style")) {
      return;
    }
    const style = doc.createElement("style");
    style.id = "__tb_existing_web_runtime_style";
    style.textContent = `
      .__tb_existing_web_selected {
        outline: 3px solid #22d3ee !important;
        outline-offset: 3px !important;
        box-shadow: 0 0 0 2px rgba(3, 7, 18, 0.78), 0 0 18px rgba(34, 211, 238, 0.48) !important;
      }
      .__tb_existing_web_preview {
        outline: 3px dashed #fbbf24 !important;
        outline-offset: 5px !important;
      }
    `;
    doc.head?.appendChild(style);
  }

  function getExistingWebDocument() {
    try {
      return els.existingWebFrame?.contentDocument || null;
    } catch (error) {
      return null;
    }
  }

  function handleExistingWebPointerDown(event) {
    if (!state.existingWeb.active || state.existingWeb.mode !== "edit") {
      return;
    }
    stopExistingWebNativeAction(event);
    const selection = selectExistingWebElement(resolveExistingWebSelectableNode(event.target, event.clientX, event.clientY));
    if (!selection || !canExistingWebPreviewProperty(selection, "position")) {
      renderAll();
      return;
    }
    state.existingWeb.drag = {
      domRef: selection.domRef,
      startClientX: event.clientX,
      startClientY: event.clientY,
      beforeBounds: { ...selection.bounds },
      beforeInline: captureExistingWebInlineStyle(selection.node),
    };
    selection.node.setPointerCapture?.(event.pointerId);
  }

  function handleExistingWebClick(event) {
    if (!state.existingWeb.active || state.existingWeb.mode !== "edit") {
      return;
    }
    stopExistingWebNativeAction(event);
    selectExistingWebElement(resolveExistingWebSelectableNode(event.target, event.clientX, event.clientY));
    renderAll();
  }

  function handleExistingWebPointerMove(event) {
    if (handleExistingWebDragMove(event)) {
      stopExistingWebNativeAction(event);
    }
  }

  function handleExistingWebPointerUp(event) {
    if (endExistingWebDrag()) {
      stopExistingWebNativeAction(event);
    }
  }

  function handleExistingWebKeydown(event) {
    if (!state.existingWeb.active || state.existingWeb.mode !== "edit") {
      return;
    }
    const target = event.target;
    if (target?.closest?.("a, button, input, textarea, select, summary, details")) {
      stopExistingWebNativeAction(event);
    }
  }

  function stopExistingWebNativeAction(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
  }

  function handleExistingWebDragMove(event) {
    const drag = state.existingWeb.drag;
    if (!drag || state.existingWeb.mode !== "edit") {
      return false;
    }
    const selected = state.existingWeb.selected;
    if (!selected || selected.domRef !== drag.domRef || !selected.node?.isConnected) {
      state.existingWeb.drag = null;
      return false;
    }
    const dx = Math.round((event.clientX - drag.startClientX) * 100) / 100;
    const dy = Math.round((event.clientY - drag.startClientY) * 100) / 100;
    applyExistingWebPreviewPosition(selected, drag.beforeBounds.x + dx, drag.beforeBounds.y + dy, drag.beforeInline);
    return true;
  }

  function endExistingWebDrag() {
    if (!state.existingWeb.drag) {
      return false;
    }
    const selected = state.existingWeb.selected;
    if (selected?.node?.isConnected) {
      selected.bounds = getDomNodeBounds(selected.node) || selected.bounds;
      recordExistingWebPreviewChange("position", state.existingWeb.drag.beforeBounds, selected.bounds, "runtime-confirmed", {
        domRef: selected.domRef,
        beforeInline: state.existingWeb.drag.beforeInline,
        afterInline: captureExistingWebInlineStyle(selected.node),
      });
    }
    state.existingWeb.drag = null;
    renderAll();
    return true;
  }

  function selectExistingWebElement(node) {
    const doc = getExistingWebDocument();
    if (!doc || !node || node.nodeType !== 1) {
      return null;
    }
    clearExistingWebSelectionClass(doc);
    const analyzer = window.TBalanceReadOnlyAnalyzer;
    const domRef = typeof analyzer?.getSelectorCandidate === "function"
      ? analyzer.getSelectorCandidate(node)
      : getFallbackDomRef(node);
    const analysis = analyzeExistingWebDocument();
    const element = analysis?.elements?.find((item) => item.observed?.domRef === domRef) || null;
    const mapping = findExistingWebMapping(domRef);
    const bounds = element?.observed?.bounds || getDomNodeBounds(node) || {};
    const computed = element?.observed?.computed || getExistingWebComputed(node);
    const protectedBehavior = getExistingWebProtectedBehavior(mapping);
    const selected = {
      domRef,
      node,
      tag: node.tagName.toLowerCase(),
      id: node.id || "",
      className: typeof node.className === "string" ? node.className : "",
      bounds,
      computed,
      pageId: state.existingWeb.pageId,
      sourcePath: state.existingWeb.sourcePath,
      viewState: state.existingWeb.viewState,
      analyzerElement: element,
      analyzerStatus: element?.inferred?.analysisStatus || "unknown",
      mapping,
      protectedBehavior,
      editableProperties: getExistingWebEditableProperties(mapping, element, node),
      blockedReasons: getExistingWebEditBlockReasons(mapping, element, protectedBehavior),
    };
    state.existingWeb.selected = applyExistingWebCheckToSelection(selected);
    applyExistingWebSelectionClass();
    refreshExistingWebVirtualLayers(analysis);
    return state.existingWeb.selected;
  }

  function refreshExistingWebVirtualLayers(analysis = null) {
    if (!state.existingWeb.active) {
      return [];
    }
    const result = analysis || analyzeExistingWebDocument();
    state.existingWeb.virtualLayers = buildExistingWebVirtualLayers(result);
    return state.existingWeb.virtualLayers;
  }

  function buildExistingWebVirtualLayers(analysis) {
    const doc = getExistingWebDocument();
    if (!doc || !analysis?.elements?.length) {
      return [];
    }
    const mappings = getVisibleConfirmedMappings({
      pageId: state.existingWeb.pageId,
      sourcePath: state.existingWeb.sourcePath,
      currentViewState: state.existingWeb.viewState || "",
      sourceAuthority: "standard-web",
    });
    const mappingByDomRef = new Map(mappings.map((mapping) => [mapping.domRef, mapping]));
    const analyzer = window.TBalanceReadOnlyAnalyzer;
    const layers = analysis.elements
      .map((element) => {
        const node = getExistingWebNodeByDomRef(element.observed?.domRef);
        if (!node || !shouldShowExistingWebVirtualLayer(element, node, mappingByDomRef)) {
          return null;
        }
          const mapping = mappingByDomRef.get(element.observed.domRef) || null;
        const protectedBehavior = getExistingWebProtectedBehavior(mapping);
        const check = getExistingWebCheck(element.observed.domRef);
        const assessment = getExistingWebLayerAssessment(element, node, mapping, protectedBehavior, check);
        const editableProperties = assessment.editableProperties;
        const blockedReasons = assessment.blockedReasons;
        const status = assessment.status;
        const liveBounds = getDomNodeBounds(node) || element.observed.bounds;
        return {
          domRef: element.observed.domRef,
          parentRef: element.observed.parentRef || "",
          name: getExistingWebVirtualLayerName(element, node, mapping),
          detail: getExistingWebVirtualLayerDetail(element, mapping),
          tag: element.observed.tag,
          role: element.inferred?.roleCandidate || element.observed.role || "",
          status,
          editableProperties,
          protectedProperties: assessment.protectedProperties,
          check,
          blockedReasons,
          mapping,
          protectedBehavior,
          bounds: liveBounds,
          analyzerStatus: element.inferred?.analysisStatus || "unknown",
          analyzerElement: element,
          node,
          score: getExistingWebVirtualLayerScore(element, node, mapping),
        };
      })
      .filter(Boolean);
    if (isExistingWebNormalFreePreviewMode()) {
      const existingRefs = new Set(layers.map((layer) => layer.domRef));
      doc.querySelectorAll("[id], [class]").forEach((node) => {
        if (!isExistingWebSpeechVisualCandidate(null, node)) {
          return;
        }
        const bounds = getDomNodeBounds(node);
        if (!bounds || Number(bounds.width || 0) <= 0 || Number(bounds.height || 0) <= 0) {
          return;
        }
        const domRef = typeof analyzer?.getSelectorCandidate === "function"
          ? analyzer.getSelectorCandidate(node)
          : getFallbackDomRef(node);
        if (!domRef || existingRefs.has(domRef)) {
          return;
        }
        const observed = {
          domRef,
          parentRef: node.parentElement
            ? typeof analyzer?.getSelectorCandidate === "function"
              ? analyzer.getSelectorCandidate(node.parentElement)
              : getFallbackDomRef(node.parentElement)
            : "",
          tag: node.tagName.toLowerCase(),
          id: node.id || "",
          className: typeof node.className === "string" ? node.className : "",
          bounds,
          computed: getExistingWebComputed(node),
          textExists: Boolean(getExistingWebNodeIdentityText(node)),
          childCount: node.children?.length || 0,
        };
        const element = {
          observed,
          inferred: { roleCandidate: "visual", analysisStatus: "unknown" },
        };
        const mapping = mappingByDomRef.get(domRef) || null;
        const protectedBehavior = getExistingWebProtectedBehavior(mapping);
        const assessment = getExistingWebLayerAssessment(element, node, mapping, protectedBehavior, null);
        layers.push({
          domRef,
          parentRef: observed.parentRef,
          name: getExistingWebVirtualLayerName(element, node, mapping),
          detail: getExistingWebVirtualLayerDetail(element, mapping),
          tag: observed.tag,
          role: "visual",
          status: assessment.status,
          editableProperties: assessment.editableProperties,
          protectedProperties: assessment.protectedProperties,
          check: null,
          blockedReasons: assessment.blockedReasons,
          mapping,
          protectedBehavior,
          bounds,
          analyzerStatus: "unknown",
          analyzerElement: element,
          node,
          score: getExistingWebVirtualLayerScore(element, node, mapping) + 25,
        });
        existingRefs.add(domRef);
      });
    }
    return layers
      .sort((a, b) => b.score - a.score)
      .slice(0, state.editorMode === "custom" ? 72 : 36);
  }

  function shouldShowExistingWebVirtualLayer(element, node, mappingByDomRef) {
    const observed = element?.observed || {};
    if (mappingByDomRef.has(observed.domRef)) {
      return true;
    }
    const tag = String(observed.tag || node.tagName || "").toLowerCase();
    if (["script", "style", "meta", "link", "title", "template", "noscript"].includes(tag)) {
      return false;
    }
    const text = getExistingWebNodeIdentityText(node, observed).toLowerCase();
    const className = String(observed.className || "").toLowerCase();
    const id = String(observed.id || "").toLowerCase();
    const hasMeaningfulName = Boolean(observed.ariaLabel || node.getAttribute("title") || node.getAttribute("alt") || observed.id);
    const importantName = /lilu|lill|fairy|speech|balloon|message|wish|hokkori|forest-back|back|hotspot|button|board|card|modal|view|scene|character|container|background|guide|nav/.test(`${id} ${className} ${text}`);
    const importantTag = /^(a|button|img|video|audio|canvas|svg|picture|input|textarea|select|form|h[1-6])$/.test(tag);
    const visual = Boolean(observed.src || observed.backgroundImage);
    const largeContainer = observed.bounds && observed.bounds.width >= 160 && observed.bounds.height >= 80 && observed.childCount > 0;
    return importantTag || visual || hasMeaningfulName || importantName || largeContainer;
  }

  function getExistingWebVirtualLayerName(element, node, mapping) {
    if (mapping?.name || mapping?.label) {
      return mapping.name || mapping.label;
    }
    const observed = element?.observed || {};
    const identity = getExistingWebNodeIdentityText(node, observed);
    const key = `${observed.id || ""} ${observed.className || ""} ${identity}`.toLowerCase();
    if (/speech|balloon|message|bubble|吹き出し/.test(key)) return "吹き出し";
    if (/wish.*hokkori|hokkori.*wish/.test(key)) return "今日のほっこり";
    if (/wishstar|wish-star|wish.*button|願い/.test(key)) return "願い星を書く";
    if (/hokkori/.test(key)) return "今日のほっこり";
    if (/forest-back|back_buttan|back-button|森へ戻る|戻る/.test(key)) return "森へ戻る";
    if (/lilu|lill/.test(key)) return "リル";
    if (/background|bg_|backdrop|scene|stage|背景/.test(key) || observed.backgroundImage) return "背景";
    return identity || observed.id || getReadableClassName(observed.className) || observed.tag || "DOM要素";
  }

  function getExistingWebNodeIdentityText(node, observed = {}) {
    const directText = Array.from(node.childNodes || [])
      .filter((child) => child.nodeType === 3)
      .map((child) => child.textContent || "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    return compactExistingWebLabel(
      observed.ariaLabel
      || node.getAttribute("aria-label")
      || node.getAttribute("title")
      || node.getAttribute("alt")
      || directText
      || observed.id
      || getReadableClassName(observed.className)
      || observed.tag
    );
  }

  function getReadableClassName(className = "") {
    return String(className)
      .split(/\s+/)
      .find((item) => item && !/^is-|^has-|^js-|^__tb/.test(item))
      || "";
  }

  function compactExistingWebLabel(value) {
    return String(value || "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 42);
  }

  function getExistingWebVirtualLayerDetail(element, mapping) {
    const observed = element?.observed || {};
    const role = element?.inferred?.roleCandidate || observed.role || observed.tag || "dom";
    return mapping?.tbId ? `${role} / ${mapping.tbId}` : `${role} / ${observed.tag || "dom"}`;
  }

  function getExistingWebVirtualLayerScore(element, node, mapping) {
    const observed = element?.observed || {};
    let score = 0;
    if (mapping) score += 100;
    if (/^(button|a|img|video|canvas|svg|input|textarea|select)$/i.test(observed.tag)) score += 34;
    if (observed.ariaLabel || node.getAttribute("title") || node.getAttribute("alt")) score += 24;
    if (observed.id) score += 16;
    if (observed.src || observed.backgroundImage) score += 15;
    if (observed.textExists) score += 10;
    if (/lilu|lill|wish|hokkori|forest-back|speech|balloon|hotspot/i.test(`${observed.id} ${observed.className}`)) score += 36;
    if (/speech|balloon|bubble|message|caption|dialogue|comment|tooltip/i.test(`${observed.id} ${observed.className}`)) score += 60;
    if (observed.bounds) score += Math.min(18, Math.round((observed.bounds.width * observed.bounds.height) / 60000));
    score -= Math.min(20, Number(observed.childCount || 0));
    return score;
  }

  function getExistingWebCheck(domRef) {
    return state.existingWeb.checks?.[domRef] || null;
  }

  function setExistingWebCheck(domRef, check) {
    if (!domRef) {
      return;
    }
    state.existingWeb.checks = {
      ...(state.existingWeb.checks || {}),
      [domRef]: check,
    };
  }

  function getExistingWebLayerAssessment(element, node, mapping, protectedBehavior, check = null) {
    if (isExistingWebNormalFreePreviewMode()) {
      const editableProperties = getExistingWebRuntimeEditableProperties(element, node, { freeVisualPreview: true });
      const fallbackEditableProperties = !editableProperties.length && isExistingWebSpeechVisualCandidate(element, node)
        ? getExistingWebSpeechPreviewProperties(node)
        : [];
      const normalEditableProperties = editableProperties.length ? editableProperties : fallbackEditableProperties;
      if (normalEditableProperties.length) {
        const protectedProperties = Array.from(new Set([
          ...(mapping?.protectedProperties || []),
          ...(protectedBehavior || mapping?.behaviorRef || isExistingWebBehaviorProtected(element, node) ? ["click", "behavior"] : []),
        ]));
        return {
          status: { key: "editable", label: "見た目編集OK" },
          editableProperties: normalEditableProperties,
          protectedProperties,
          blockedReasons: [],
        };
      }
    }
    const aiReview = getExistingWebAiReview(element?.observed?.domRef);
    if (aiReview?.finalCheck) {
      return {
        status: aiReview.finalCheck.status,
        editableProperties: aiReview.finalCheck.editableProperties || [],
        protectedProperties: aiReview.finalCheck.protectedProperties || [],
        blockedReasons: aiReview.finalCheck.blockedReasons || [],
      };
    }
    if (aiReview?.status === "shared") {
      return {
        status: { key: "ai-needed", label: "AIで確認中" },
        editableProperties: [],
        protectedProperties: aiReview.package?.tbalanceAssessment?.protectedProperties || [],
        blockedReasons: ["AI回答の取り込み待ちです"],
      };
    }
    if (check) {
      return {
        status: check.status,
        editableProperties: check.editableProperties || [],
        protectedProperties: check.protectedProperties || [],
        blockedReasons: check.blockedReasons || [],
      };
    }
    const light = runExistingWebLayerCheck(element, node, mapping, protectedBehavior, { level: "light" });
    return {
      status: light.status,
      editableProperties: light.status.key === "editable" ? light.editableProperties : [],
      protectedProperties: light.protectedProperties,
      blockedReasons: light.blockedReasons,
    };
  }

  function runExistingWebLayerCheck(element, node, mapping, protectedBehavior, options = {}) {
    const level = options.level || "light";
    const observed = element?.observed || {};
    const computed = observed.computed || getExistingWebComputed(node);
    const tag = String(observed.tag || node?.tagName || "").toLowerCase();
    const analyzerStatus = element?.inferred?.analysisStatus || "unknown";
    const protectedProperties = new Set(mapping?.protectedProperties || []);
    if (protectedBehavior || mapping?.behaviorRef || isExistingWebBehaviorProtected(element, node)) {
      protectedProperties.add("click");
    }
    if (isExistingWebNormalFreePreviewMode() && level === "light") {
      const runtimeEditable = getExistingWebRuntimeEditableProperties(element, node, { freeVisualPreview: true });
      const fallbackEditable = !runtimeEditable.length && isExistingWebSpeechVisualCandidate(element, node)
        ? getExistingWebSpeechPreviewProperties(node)
        : [];
      const normalEditable = runtimeEditable.length ? runtimeEditable : fallbackEditable;
      if (normalEditable.length) {
        if (protectedBehavior || mapping?.behaviorRef || isExistingWebBehaviorProtected(element, node)) {
          protectedProperties.add("behavior");
        }
        return {
          level,
          status: { key: "editable", label: "見た目編集OK" },
          editableProperties: normalEditable,
          protectedProperties: Array.from(protectedProperties),
          blockedReasons: [],
          message: "見た目はRuntime Previewで試せます。動作は変更せず維持します。",
          checks: getExistingWebPropertyChecks(normalEditable, Array.from(protectedProperties), []),
        };
      }
    }
    if (isExistingWebProblemElement(element, node)) {
      return {
        level,
        status: { key: "problem", label: "問題あり" },
        editableProperties: [],
        protectedProperties: Array.from(protectedProperties),
        blockedReasons: ["DOMまたは表示状態を確認できません"],
        message: "この要素は表示状態か参照先に問題がある可能性があります。",
        checks: getExistingWebPropertyChecks([], Array.from(protectedProperties), ["DOMまたは表示状態を確認できません"]),
      };
    }
    getExistingWebBackgroundProtectedProperties(element, node).forEach((property) => protectedProperties.add(property));
    const confirmedEditable = getExistingWebEditableProperties(mapping, element, node);
    const runtimeEditable = getExistingWebRuntimeEditableProperties(element, node);
    const editableProperties = Array.from(new Set([...confirmedEditable, ...runtimeEditable]))
      .filter((property) => !protectedProperties.has(property));
    const hardProtected = protectedProperties.has("click") && !editableProperties.length && isExistingWebBehaviorProtected(element, node);
    if (hardProtected) {
      return {
        level,
        status: { key: "protected", label: "保護" },
        editableProperties: [],
        protectedProperties: Array.from(protectedProperties),
        blockedReasons: ["ページのクリック動作または重要Behaviorと連動しています"],
        message: "この要素はページの動作と連動しています。現在は選択のみ可能です。",
        checks: getExistingWebPropertyChecks([], Array.from(protectedProperties), ["ページの動作と連動"]),
      };
    }
    if (editableProperties.length && (level === "confirm" || level === "page" || analyzerStatus === "safe-visual-edit")) {
      return {
        level,
        status: { key: "editable", label: "編集OK" },
        editableProperties,
        protectedProperties: Array.from(protectedProperties),
        blockedReasons: [],
        message: "この要素はRuntime Previewで位置またはサイズを確認できます。",
        checks: getExistingWebPropertyChecks(editableProperties, Array.from(protectedProperties), []),
      };
    }
    if (analyzerStatus === "layout-dependency" || observed.layout?.flexChild || observed.layout?.gridChild || computed.transform) {
      return {
        level,
        status: level === "confirm" || level === "page"
          ? { key: "ai-needed", label: level === "page" ? "AI確認" : "追加確認が必要" }
          : { key: "warning", label: "要確認" },
        editableProperties: [],
        protectedProperties: Array.from(protectedProperties),
        blockedReasons: ["配置とレイアウトが連動している可能性があります"],
        message: level === "confirm" || level === "page"
          ? "TBalanceだけでは安全に判断できませんでした。必要ならAIに相談できます。"
          : "配置とページレイアウトの関係を確認してください。",
        checks: getExistingWebPropertyChecks([], Array.from(protectedProperties), [level === "confirm" || level === "page" ? "未確定" : "配置とレイアウトが連動"]),
      };
    }
    return {
      level,
      status: level === "confirm" || level === "page"
        ? { key: "ai-needed", label: level === "page" ? "AI確認" : "追加確認が必要" }
        : { key: "warning", label: "要確認" },
      editableProperties: [],
      protectedProperties: Array.from(protectedProperties),
      blockedReasons: ["編集範囲をまだ確認していません"],
      message: level === "confirm" || level === "page"
        ? "TBalanceだけでは安全に判断できませんでした。必要ならAIに相談できます。"
        : "この要素はまだ編集範囲を確認していません。",
      checks: getExistingWebPropertyChecks([], Array.from(protectedProperties), [level === "confirm" || level === "page" ? "未確定" : "未確認"]),
    };
  }

  function getExistingWebRuntimeEditableProperties(element, node, options = {}) {
    const observed = element?.observed || {};
    const computed = observed.computed || getExistingWebComputed(node);
    const tag = String(observed.tag || node?.tagName || "").toLowerCase();
    const liveBounds = getDomNodeBounds(node);
    const observedBounds = observed.bounds || null;
    const bounds = liveBounds && Number(liveBounds.width || 0) > 0 && Number(liveBounds.height || 0) > 0
      ? liveBounds
      : observedBounds;
    if (!options.freeVisualPreview && isExistingWebPageBackgroundCandidate(element, node)) {
      return [];
    }
    if (options.freeVisualPreview) {
      return getExistingWebFreePreviewProperties(element, node, computed, bounds);
    }
    const safePosition = ["absolute", "fixed"].includes(computed.positionType)
      && (options.allowTransformAnimation || !computed.transform)
      && !observed.layout?.flexChild
      && !observed.layout?.gridChild
      && Number(bounds?.width || 0) > 0
      && Number(bounds?.height || 0) > 0
      && (options.allowBehaviorProtectedVisual || !isExistingWebBehaviorProtected(element, node));
    const staticVisual = isExistingWebStaticVisualElement(element, node);
    if (!safePosition || !staticVisual) {
      return [];
    }
    const props = ["position"];
    if (!["svg", "canvas"].includes(tag)) {
      props.push("size");
    }
    return props;
  }

  function isExistingWebNormalFreePreviewMode() {
    return state.existingWeb.active && state.existingWeb.mode === "edit" && state.editorMode !== "custom";
  }

  function getExistingWebFreePreviewProperties(element, node, computed, bounds) {
    const observed = element?.observed || {};
    const tag = String(observed.tag || node?.tagName || "").toLowerCase();
    if (!node || ["html", "head", "script", "style", "meta", "link", "title", "template", "noscript"].includes(tag)) {
      return [];
    }
    if (!bounds || Number(bounds.width || 0) <= 0 || Number(bounds.height || 0) <= 0) {
      return [];
    }
    if (computed.visibility === "hidden" || computed.display === "none" || Number.parseFloat(computed.opacity || "1") === 0) {
      return [];
    }
    const visual = isExistingWebStaticVisualElement(element, node)
      || isExistingWebBehaviorProtected(element, node)
      || isExistingWebPageBackgroundCandidate(element, node)
      || isExistingWebSpeechVisualCandidate(element, node)
      || Boolean(observed.textExists)
      || Number(bounds.width || 0) >= 12
      || Number(bounds.height || 0) >= 12;
    if (!visual) {
      return [];
    }
    const props = ["position"];
    if (!["svg", "canvas", "audio", "video"].includes(tag)) {
      props.push("size");
    }
    return props;
  }

  function isExistingWebSpeechVisualCandidate(element, node) {
    if (!node) {
      return false;
    }
    const observed = element?.observed || {};
    const key = `${observed.id || node.id || ""} ${observed.className || node.className || ""} ${getExistingWebNodeIdentityText(node, observed)}`.toLowerCase();
    return /speech|balloon|bubble|message|caption|dialogue|comment|tooltip|吹き出し/.test(key);
  }

  function getExistingWebSpeechPreviewProperties(node) {
    const bounds = getDomNodeBounds(node);
    const computed = getExistingWebComputed(node);
    if (!bounds || Number(bounds.width || 0) <= 0 || Number(bounds.height || 0) <= 0) {
      return [];
    }
    if (computed.display === "none" || computed.visibility === "hidden" || Number.parseFloat(computed.opacity || "1") === 0) {
      return [];
    }
    return ["position", "size"];
  }

  function getExistingWebBackgroundProtectedProperties(element, node) {
    return !isExistingWebNormalFreePreviewMode() && isExistingWebPageBackgroundCandidate(element, node)
      ? ["position", "size", "width", "height"]
      : [];
  }

  function isExistingWebPageBackgroundCandidate(element, node) {
    if (!node) {
      return false;
    }
    const observed = element?.observed || {};
    const tag = String(observed.tag || node.tagName || "").toLowerCase();
    const bounds = observed.bounds || getDomNodeBounds(node);
    if (!bounds || Number(bounds.width || 0) <= 0 || Number(bounds.height || 0) <= 0) {
      return false;
    }
    const doc = node.ownerDocument;
    const view = doc?.defaultView;
    const viewportWidth = Number(view?.innerWidth || doc?.documentElement?.clientWidth || 0);
    const viewportHeight = Number(view?.innerHeight || doc?.documentElement?.clientHeight || 0);
    if (!viewportWidth || !viewportHeight) {
      return false;
    }
    const widthRatio = Number(bounds.width || 0) / viewportWidth;
    const heightRatio = Number(bounds.height || 0) / viewportHeight;
    const areaRatio = (Number(bounds.width || 0) * Number(bounds.height || 0)) / (viewportWidth * viewportHeight);
    const pageScale = (widthRatio >= 0.7 && heightRatio >= 0.55) || areaRatio >= 0.45;
    if (!pageScale) {
      return false;
    }
    const hasBackgroundSource = Boolean(observed.backgroundImage || observed.src || node.currentSrc || node.src);
    const isDocumentSurface = node === doc?.body || node === doc?.documentElement || ["main", "section", "article"].includes(tag);
    const roleKey = `${element?.inferred?.roleCandidate || ""} ${observed.role || ""}`.toLowerCase();
    const backgroundRole = /background|backdrop|scene|stage|canvas|surface|hero|visual/.test(roleKey);
    return hasBackgroundSource || isDocumentSurface || backgroundRole;
  }

  function isExistingWebStaticVisualElement(element, node) {
    const observed = element?.observed || {};
    const tag = String(observed.tag || node?.tagName || "").toLowerCase();
    if (["img", "svg", "picture", "video"].includes(tag)) {
      return true;
    }
    if (observed.backgroundImage) {
      return true;
    }
    return ["div", "span"].includes(tag)
      && Number(observed.childCount || 0) === 0
      && !observed.textExists
      && Boolean(observed.computed?.backgroundColor && observed.computed.backgroundColor !== "rgba(0, 0, 0, 0)");
  }

  function isExistingWebBehaviorProtected(element, node) {
    const observed = element?.observed || {};
    const tag = String(observed.tag || node?.tagName || "").toLowerCase();
    return ["a", "button", "input", "select", "textarea", "form", "summary", "details"].includes(tag)
      || Boolean(observed.link || observed.formType)
      || Boolean(observed.role && /button|link|menuitem|tab|checkbox|radio/i.test(observed.role))
      || Boolean(observed.tabIndex && observed.tabIndex !== "-1")
      || Boolean(observed.inlineEvents?.length)
      || Boolean(node?.hasAttribute?.("aria-expanded") || node?.hasAttribute?.("aria-controls") || node?.hasAttribute?.("aria-pressed"));
  }

  function isExistingWebProblemElement(element, node) {
    return !node?.isConnected;
  }

  function getExistingWebPropertyChecks(editableProperties, protectedProperties, blockedReasons) {
    const editable = new Set(editableProperties || []);
    const protectedSet = new Set(protectedProperties || []);
    const unknownReason = blockedReasons?.[0] || "要確認";
    return [
      { label: "位置", state: editable.has("position") ? "ok" : protectedSet.has("position") ? "protected" : "warning", text: editable.has("position") ? "変更できます" : protectedSet.has("position") ? "保護" : unknownReason },
      { label: "サイズ", state: (editable.has("size") || editable.has("width") || editable.has("height")) ? "ok" : (protectedSet.has("size") || protectedSet.has("width") || protectedSet.has("height")) ? "protected" : "warning", text: (editable.has("size") || editable.has("width") || editable.has("height")) ? "変更できます" : (protectedSet.has("size") || protectedSet.has("width") || protectedSet.has("height")) ? "保護" : unknownReason },
      { label: "クリック", state: protectedSet.has("click") ? "protected" : "warning", text: protectedSet.has("click") ? "保護" : "変更対象外" },
    ];
  }

  function getExistingWebAiReview(domRef) {
    return state.existingWeb.aiReviews?.[domRef] || null;
  }

  function setExistingWebAiReview(domRef, review) {
    if (!domRef) {
      return;
    }
    state.existingWeb.aiReviews = {
      ...(state.existingWeb.aiReviews || {}),
      [domRef]: review,
    };
  }

  function applyExistingWebCheckToSelection(selection) {
    if (!selection) {
      return selection;
    }
    const check = isExistingWebNormalFreePreviewMode()
      ? runExistingWebLayerCheck(selection.analyzerElement, selection.node, selection.mapping, selection.protectedBehavior, { level: "light" })
      : getExistingWebCheck(selection.domRef)
        || runExistingWebLayerCheck(selection.analyzerElement, selection.node, selection.mapping, selection.protectedBehavior, { level: "light" });
    if (!check) {
      return selection;
    }
    selection.check = check;
    if (check.status?.key === "editable") {
      selection.editableProperties = check.editableProperties || [];
      selection.protectedProperties = check.protectedProperties || [];
      selection.blockedReasons = [];
    } else {
      selection.protectedProperties = check.protectedProperties || [];
      selection.blockedReasons = check.blockedReasons || [];
    }
    return selection;
  }

  function getExistingWebNodeByDomRef(domRef) {
    const doc = getExistingWebDocument();
    if (!doc || !domRef) {
      return null;
    }
    try {
      return doc.querySelector(domRef);
    } catch (error) {
      return null;
    }
  }

  function selectExistingWebVirtualLayer(domRef) {
    const node = getExistingWebNodeByDomRef(domRef);
    if (!node) {
      showModeToast("対応するDOM要素が見つかりません。");
      refreshExistingWebVirtualLayers();
      renderAll();
      return;
    }
    selectExistingWebElement(node);
    node.scrollIntoView?.({ block: "center", inline: "center", behavior: "smooth" });
    renderAll();
  }

  function toggleExistingWebAudio() {
    if (!state.existingWeb.active) {
      return;
    }
    state.existingWeb.audioMuted = !state.existingWeb.audioMuted;
    applyExistingWebAudioPolicy();
    renderAll();
  }

  function applyExistingWebAudioPolicy() {
    const doc = getExistingWebDocument();
    if (!doc || !state.existingWeb.active) {
      return;
    }
    const shouldMute = state.existingWeb.mode === "edit" && state.existingWeb.audioMuted;
    doc.querySelectorAll("audio, video").forEach((media) => {
      if (!media.__tbExistingWebAudioState) {
        media.__tbExistingWebAudioState = {
          muted: media.muted,
          volume: media.volume,
          paused: media.paused,
        };
      }
      if (shouldMute) {
        media.pause?.();
        media.muted = true;
      } else {
        const before = media.__tbExistingWebAudioState;
        if (before) {
          media.muted = before.muted;
          media.volume = before.volume;
          if (!before.paused && typeof media.play === "function") {
            media.play().catch(() => {});
          }
        }
      }
    });
  }

  function resolveExistingWebSelectableNode(target, clientX, clientY) {
    if (!target || target.nodeType !== 1) {
      return target;
    }
    const doc = target.ownerDocument || getExistingWebDocument();
    const candidates = Array.from(doc?.body?.querySelectorAll?.("*") || target.querySelectorAll?.("*") || [])
      .concat(target)
      .filter((node) => {
        if (!node || node.nodeType !== 1 || typeof node.getBoundingClientRect !== "function") {
          return false;
        }
        const rect = node.getBoundingClientRect();
        return rect.width >= 1
          && rect.height >= 1
          && clientX >= rect.left
          && clientX <= rect.right
          && clientY >= rect.top
          && clientY <= rect.bottom;
      })
      .sort((a, b) => {
        const aScore = getExistingWebSelectableScore(a);
        const bScore = getExistingWebSelectableScore(b);
        if (aScore !== bScore) {
          return bScore - aScore;
        }
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        return (aRect.width * aRect.height) - (bRect.width * bRect.height);
      });
    return candidates[0] || target;
  }

  function getExistingWebSelectableScore(node) {
    const tag = node.tagName;
    let score = 0;
    if (node.id) score += 8;
    if (["A", "BUTTON", "INPUT", "TEXTAREA", "SELECT"].includes(tag)) score += 20;
    if (["IMG", "SVG", "PICTURE"].includes(tag)) score += 10;
    if (node.getAttribute("role")) score += 5;
    if (node.textContent?.trim()) score += 2;
    if (node.children?.length) score -= Math.min(6, node.children.length);
    return score;
  }

  function analyzeExistingWebDocument() {
    const doc = getExistingWebDocument();
    const analyzer = window.TBalanceReadOnlyAnalyzer;
    if (!doc || typeof analyzer?.analyzeDocument !== "function") {
      return null;
    }
    try {
      const result = analyzer.analyzeDocument(doc, {
        path: state.existingWeb.currentUrl || doc.location?.href || "",
        sourcePath: state.existingWeb.sourcePath,
        viewState: state.existingWeb.viewState,
        sourceAuthority: state.existingWeb.sourceAuthority || "standard-web",
        scriptExecution: "allowed-runtime-edit-mode",
      });
      state.analyzer.loadedPath = state.existingWeb.currentUrl;
      state.analyzer.loadedKind = "existing-web";
      state.analyzer.effectiveUrl = state.existingWeb.currentUrl;
      state.analyzer.sourcePath = state.existingWeb.sourcePath;
      state.analyzer.viewState = state.existingWeb.viewState || "";
      state.analyzer.manifestPageId = state.existingWeb.pageId;
      state.analyzer.result = result;
      state.analyzer.selectedId = result.elements.find((item) => item.observed?.domRef === state.existingWeb.selected?.domRef)?.candidateId || state.analyzer.selectedId;
      syncManifestInputsToAnalyzerPage();
      return result;
    } catch (error) {
      return null;
    }
  }

  function applyExistingWebSelectionClass() {
    const doc = getExistingWebDocument();
    if (!doc) {
      return;
    }
    clearExistingWebSelectionClass(doc);
    const selectedNode = state.existingWeb.selected?.node;
    if (state.existingWeb.mode === "edit" && selectedNode?.isConnected) {
      selectedNode.classList.add("__tb_existing_web_selected");
      if (state.existingWeb.preview?.active) {
        selectedNode.classList.add("__tb_existing_web_preview");
      }
    }
  }

  function clearExistingWebSelectionClass(doc) {
    doc.querySelectorAll?.(".__tb_existing_web_selected, .__tb_existing_web_preview").forEach((node) => {
      node.classList.remove("__tb_existing_web_selected", "__tb_existing_web_preview");
    });
  }

  function findExistingWebMapping(domRef) {
    const pageMeta = {
      pageId: state.existingWeb.pageId,
      sourcePath: state.existingWeb.sourcePath,
      currentViewState: state.existingWeb.viewState || "",
      sourceAuthority: "standard-web",
    };
    return getVisibleConfirmedMappings(pageMeta).find((mapping) => mapping.domRef === domRef) || null;
  }

  function getExistingWebProtectedBehavior(mapping) {
    if (!mapping) {
      return null;
    }
    const adapter = getActiveAnalyzerAdapter();
    if (typeof adapter?.getProtectedBehavior !== "function") {
      return null;
    }
    const context = {
      ...getExistingWebLookupContext(state.existingWeb.sourcePath),
      viewState: state.existingWeb.viewState || "",
      mapping,
    };
    const result = adapter.getProtectedBehavior(state.existingWeb.pageId, mapping.tbId, context);
    return result?.status === "resolved" ? result.protectedBehavior || result.behavior || result : null;
  }

  function getExistingWebEditableProperties(mapping, element, node = null) {
    if (!mapping || element?.inferred?.analysisStatus !== "safe-visual-edit") {
      return [];
    }
    const protectedProperties = new Set([
      ...(mapping.protectedProperties || []),
      ...getExistingWebBackgroundProtectedProperties(element, node),
    ]);
    return (mapping.editableProperties || []).filter((property) => ["position", "size", "width", "height"].includes(property) && !protectedProperties.has(property));
  }

  function getExistingWebEditBlockReasons(mapping, element, protectedBehavior) {
    const reasons = [];
    if (!mapping) {
      reasons.push("Confirmed Mappingなし");
    }
    const status = element?.inferred?.analysisStatus || "unknown";
    if (status !== "safe-visual-edit") {
      reasons.push(`Analyzer Status: ${status}`);
    }
    if (!mapping?.editableProperties?.length) {
      reasons.push("editableProperties未設定");
    }
    return Array.from(new Set(reasons));
  }

  function canExistingWebPreviewProperty(selection, property) {
    return Boolean(selection?.editableProperties?.includes(property) && !selection.blockedReasons?.length);
  }

  function applyExistingWebPreviewPosition(selection, viewportX, viewportY, beforeInline) {
    const node = selection?.node;
    if (!node) {
      return;
    }
    const computed = getExistingWebComputed(node);
    if (!["absolute", "fixed", "relative"].includes(computed.positionType) && !isExistingWebNormalFreePreviewMode()) {
      return;
    }
    const dx = Math.round((viewportX - selection.bounds.x) * 100) / 100;
    const dy = Math.round((viewportY - selection.bounds.y) * 100) / 100;
    if (!["absolute", "fixed", "relative"].includes(computed.positionType)) {
      const baseTransform = beforeInline?.transform || "";
      node.style.transform = `${baseTransform} translate(${dx}px, ${dy}px)`.trim();
      node.classList.add("__tb_existing_web_preview");
      state.existingWeb.preview.active = true;
      state.existingWeb.preview.beforeInline = beforeInline;
      return;
    }
    const currentLeft = parseCssPx(beforeInline?.left || selection.computed?.left || computed.left, 0);
    const currentTop = parseCssPx(beforeInline?.top || selection.computed?.top || computed.top, 0);
    node.style.position = computed.positionType;
    node.style.left = `${Math.round((currentLeft + dx) * 100) / 100}px`;
    node.style.top = `${Math.round((currentTop + dy) * 100) / 100}px`;
    node.classList.add("__tb_existing_web_preview");
    state.existingWeb.preview.active = true;
    state.existingWeb.preview.beforeInline = beforeInline;
  }

  function nudgeExistingWebSelection(dx, dy) {
    const selected = state.existingWeb.selected;
    if (!selected || !canExistingWebPreviewProperty(selected, "position")) {
      showModeToast("この要素はv0.1では移動Previewできません。");
      renderAll();
      return;
    }
    const before = getDomNodeBounds(selected.node) || selected.bounds;
    const beforeInline = captureExistingWebInlineStyle(selected.node);
    applyExistingWebPreviewPosition(selected, before.x + dx, before.y + dy, beforeInline);
    selected.bounds = getDomNodeBounds(selected.node) || before;
    recordExistingWebPreviewChange("position", before, selected.bounds, "runtime-confirmed", {
      domRef: selected.domRef,
      beforeInline,
      afterInline: captureExistingWebInlineStyle(selected.node),
    });
    renderAll();
  }

  function resizeExistingWebSelection(dw, dh) {
    const selected = state.existingWeb.selected;
    if (!selected || !canExistingWebPreviewProperty(selected, "size")) {
      showModeToast("この要素はv0.1ではサイズPreviewできません。");
      renderAll();
      return;
    }
    const before = getDomNodeBounds(selected.node) || selected.bounds;
    const beforeInline = captureExistingWebInlineStyle(selected.node);
    selected.node.style.width = `${Math.max(1, Math.round((before.width + dw) * 100) / 100)}px`;
    selected.node.style.height = `${Math.max(1, Math.round((before.height + dh) * 100) / 100)}px`;
    selected.node.classList.add("__tb_existing_web_preview");
    state.existingWeb.preview.active = true;
    state.existingWeb.preview.beforeInline = beforeInline;
    selected.bounds = getDomNodeBounds(selected.node) || before;
    recordExistingWebPreviewChange("size", before, selected.bounds, "runtime-confirmed", {
      domRef: selected.domRef,
      beforeInline,
      afterInline: captureExistingWebInlineStyle(selected.node),
    });
    renderAll();
  }

  function recordExistingWebPreviewChange(property, beforeBounds, afterBounds, beforeSource, options = {}) {
    const before = property === "size"
      ? { width: beforeBounds.width, height: beforeBounds.height }
      : { x: beforeBounds.x, y: beforeBounds.y };
    const after = property === "size"
      ? { width: afterBounds.width, height: afterBounds.height }
      : { x: afterBounds.x, y: afterBounds.y };
    const changed = Object.keys(before).some((key) => Math.abs((Number(after[key]) || 0) - (Number(before[key]) || 0)) >= 0.5);
    if (!changed) {
      state.existingWeb.preview.changes = [];
      state.existingWeb.preview.active = false;
      applyExistingWebSelectionClass();
      return;
    }
    const selected = state.existingWeb.selected;
    const change = {
      domRef: options.domRef || selected?.domRef || "",
      property,
      before,
      after,
      beforeSource,
      beforeInline: options.beforeInline || state.existingWeb.preview?.beforeInline || null,
      afterInline: options.afterInline || (selected?.node ? captureExistingWebInlineStyle(selected.node) : null),
      coordinateContext: "iframe-viewport-css-px",
    };
    state.existingWeb.preview.changes = [change];
    state.existingWeb.impactAnalysis = null;
    pushExistingWebPreviewHistory(change);
    applyExistingWebSelectionClass();
  }

  function pushExistingWebPreviewHistory(change) {
    if (!change?.domRef || !change.beforeInline || !change.afterInline) {
      return;
    }
    state.existingWeb.previewHistory = [
      ...(state.existingWeb.previewHistory || []),
      change,
    ].slice(-HISTORY_LIMIT);
    state.existingWeb.previewFuture = [];
  }

  function applyExistingWebPreviewInline(change, inlineKey) {
    const node = getExistingWebNodeByDomRef(change?.domRef);
    const inline = change?.[inlineKey];
    if (!node || !inline) {
      return false;
    }
    restoreExistingWebInlineStyle(node, inline);
    node.classList.toggle("__tb_existing_web_preview", inlineKey === "afterInline");
    if (state.existingWeb.selected?.domRef === change.domRef) {
      state.existingWeb.selected.node = node;
      state.existingWeb.selected.bounds = getDomNodeBounds(node) || state.existingWeb.selected.bounds;
    }
    return true;
  }

  function syncExistingWebPreviewStateFromHistory() {
    const latest = state.existingWeb.previewHistory?.[state.existingWeb.previewHistory.length - 1] || null;
    state.existingWeb.preview = {
      active: Boolean(latest),
      changes: latest ? [latest] : [],
    };
    applyExistingWebSelectionClass();
  }

  function undoExistingWebPreview() {
    const history = state.existingWeb.previewHistory || [];
    if (!state.existingWeb.active || !history.length) {
      return false;
    }
    const change = history.pop();
    applyExistingWebPreviewInline(change, "beforeInline");
    state.existingWeb.previewFuture = [...(state.existingWeb.previewFuture || []), change];
    state.existingWeb.impactAnalysis = null;
    syncExistingWebPreviewStateFromHistory();
    refreshExistingWebVirtualLayers();
    renderAll();
    return true;
  }

  function redoExistingWebPreview() {
    const future = state.existingWeb.previewFuture || [];
    if (!state.existingWeb.active || !future.length) {
      return false;
    }
    const change = future.pop();
    applyExistingWebPreviewInline(change, "afterInline");
    state.existingWeb.previewHistory = [...(state.existingWeb.previewHistory || []), change];
    state.existingWeb.impactAnalysis = null;
    syncExistingWebPreviewStateFromHistory();
    refreshExistingWebVirtualLayers();
    renderAll();
    return true;
  }

  function resetExistingWebPreview(options = {}) {
    const applied = new Set();
    const originalByDomRef = new Map();
    (state.existingWeb.previewHistory || []).forEach((change) => {
      if (change?.domRef && !originalByDomRef.has(change.domRef)) {
        originalByDomRef.set(change.domRef, change);
      }
    });
    originalByDomRef.forEach((change) => {
      if (applied.has(change.domRef)) {
        return;
      }
      if (applyExistingWebPreviewInline(change, "beforeInline")) {
        applied.add(change.domRef);
      }
    });
    (state.existingWeb.preview?.changes || []).forEach((change) => {
      if (!change?.domRef || applied.has(change.domRef)) {
        return;
      }
      if (applyExistingWebPreviewInline(change, "beforeInline")) {
        applied.add(change.domRef);
      }
    });
    state.existingWeb.preview = {
      active: false,
      changes: [],
    };
    state.existingWeb.previewHistory = [];
    state.existingWeb.previewFuture = [];
    state.existingWeb.impactAnalysis = null;
    state.existingWeb.drag = null;
    applyExistingWebSelectionClass();
    refreshExistingWebVirtualLayers();
    if (!options.skipRender) {
      renderAll();
    }
  }

  function sendExistingWebPreviewToSafeChange() {
    const selected = state.existingWeb.selected;
    const change = state.existingWeb.preview?.changes?.[0];
    if (state.editorMode !== "custom" && selected && change && !selected.mapping) {
      state.existingWeb.impactAnalysis = buildExistingWebImpactAnalysis(selected, change);
      showModeToast(`変更後の影響を確認しました: ${formatExistingWebPreviewForNormal(change)}`);
      renderAll();
      return;
    }
    if (state.editorMode !== "custom" && selected && change) {
      state.existingWeb.impactAnalysis = buildExistingWebImpactAnalysis(selected, change);
      prepareExistingWebPreviewSafeChange(selected, change);
      showModeToast(`変更後の影響を確認しました: ${formatExistingWebPreviewForNormal(change)}`);
      renderAll();
      return;
    }
    if (!selected?.mapping || !change) {
      showModeToast(state.editorMode === "custom"
        ? "Safe Changeへ送るには、Confirmed MappingとPreview変更が必要です。"
        : "先に編集内容をPreviewしてください。");
      return;
    }
    openAnalyzerPanel();
    state.analyzer.safeChange.targetMappingId = selected.mapping.mappingId;
    state.analyzer.safeChange.property = change.property;
    state.analyzer.safeChange.intent = "既存Web編集モードのRuntime Previewを安全な変更指示へ変換";
    state.analyzer.safeChange.beforeSource = change.beforeSource || "runtime-confirmed";
    state.analyzer.safeChange.beforeText = JSON.stringify(change.before);
    state.analyzer.safeChange.afterText = JSON.stringify(change.after);
    state.analyzer.safeChange.json = null;
    state.analyzer.safeChange.summary = "";
    state.analyzer.safeChange.status = "idle";
    state.analyzer.safeChange.message = "既存Web編集モードのPreviewをSafe Changeに渡しました。Generateを実行してください。";
    renderSafeChangePanel();
    showModeToast("Safe ChangeにPreview内容をセットしました。");
  }

  function prepareExistingWebPreviewSafeChange(selected, change) {
    if (!selected?.mapping || !change) {
      return;
    }
    state.analyzer.safeChange.targetMappingId = selected.mapping.mappingId;
    state.analyzer.safeChange.property = change.property;
    state.analyzer.safeChange.intent = formatExistingWebPreviewIntent(selected, change);
    state.analyzer.safeChange.beforeSource = change.beforeSource || "runtime-preview";
    state.analyzer.safeChange.beforeText = JSON.stringify(change.before);
    state.analyzer.safeChange.afterText = JSON.stringify(change.after);
    state.analyzer.safeChange.json = null;
    state.analyzer.safeChange.summary = "";
    state.analyzer.safeChange.status = "idle";
    state.analyzer.safeChange.message = "Existing Web Runtime Previewの差分をセットしました。Source反映前にSafe Changeで確認できます。";
  }

  function confirmExistingWebVirtualLayer(domRef) {
    const node = getExistingWebNodeByDomRef(domRef || state.existingWeb.selected?.domRef);
    if (!node) {
      showModeToast("確認対象が見つかりません。");
      return;
    }
    const analysis = analyzeExistingWebDocument();
    const analyzer = window.TBalanceReadOnlyAnalyzer;
    const resolvedDomRef = domRef || (typeof analyzer?.getSelectorCandidate === "function"
      ? analyzer.getSelectorCandidate(node)
      : getFallbackDomRef(node));
    const element = analysis?.elements?.find((item) => item.observed?.domRef === resolvedDomRef) || null;
    const mapping = findExistingWebMapping(resolvedDomRef);
    const protectedBehavior = getExistingWebProtectedBehavior(mapping);
    const check = runExistingWebLayerCheck(element, node, mapping, protectedBehavior, { level: "confirm" });
    setExistingWebCheck(resolvedDomRef, check);
    selectExistingWebElement(node);
    refreshExistingWebVirtualLayers(analysis);
    showModeToast(`${getExistingWebSelectionTitle(state.existingWeb.selected)}: ${check.status.label}`);
    renderAll();
  }

  async function runExistingWebPageCheck() {
    if (!state.existingWeb.active) {
      return;
    }
    state.existingWeb.pageCheck = {
      ...(state.existingWeb.pageCheck || {}),
      status: "running",
      fingerprint: getExistingWebFingerprint(),
      summary: state.existingWeb.pageCheck?.summary || null,
    };
    renderAll();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const analysis = analyzeExistingWebDocument();
    const doc = getExistingWebDocument();
    if (!analysis || !doc) {
      state.existingWeb.pageCheck = {
        status: "problem",
        fingerprint: getExistingWebFingerprint(),
        checkedAt: new Date().toISOString(),
        summary: { editable: 0, ai: 0, protected: 0, problem: 1, total: 0 },
      };
      renderAll();
      showModeToast("ページ確認に失敗しました。");
      return;
    }
    const mappings = getVisibleConfirmedMappings({
      pageId: state.existingWeb.pageId,
      sourcePath: state.existingWeb.sourcePath,
      currentViewState: state.existingWeb.viewState || "",
      sourceAuthority: "standard-web",
    });
    const mappingByDomRef = new Map(mappings.map((mapping) => [mapping.domRef, mapping]));
    const checks = {};
    analysis.elements.forEach((element) => {
      const domRef = element.observed?.domRef || "";
      const node = getExistingWebNodeByDomRef(domRef);
      if (!node || !shouldShowExistingWebVirtualLayer(element, node, mappingByDomRef)) {
        return;
      }
      const mapping = mappingByDomRef.get(domRef) || null;
      const protectedBehavior = getExistingWebProtectedBehavior(mapping);
      checks[domRef] = runExistingWebLayerCheck(element, node, mapping, protectedBehavior, { level: "page" });
    });
    state.existingWeb.checks = {
      ...(state.existingWeb.checks || {}),
      ...checks,
    };
    const fingerprint = getExistingWebFingerprint();
    const summary = summarizeExistingWebChecks(checks);
    state.existingWeb.pageCheck = {
      status: "checked",
      fingerprint,
      checkedAt: new Date().toISOString(),
      summary,
    };
    saveExistingWebPageCheckCache(fingerprint, checks, summary);
    refreshExistingWebVirtualLayers(analysis);
    if (state.existingWeb.selected) {
      applyExistingWebCheckToSelection(state.existingWeb.selected);
    }
    renderAll();
    showModeToast(`ページ確認済み: 編集OK ${summary.editable} / AI確認 ${summary.ai} / 保護 ${summary.protected}`);
  }

  function summarizeExistingWebChecks(checks) {
    return Object.values(checks || {}).reduce((summary, check) => {
      summary.total += 1;
      const key = check?.status?.key || "problem";
      if (key === "editable") summary.editable += 1;
      else if (key === "protected") summary.protected += 1;
      else if (key === "problem") summary.problem += 1;
      else summary.ai += 1;
      return summary;
    }, { editable: 0, ai: 0, protected: 0, problem: 0, total: 0 });
  }

  function getExistingWebFingerprint() {
    const doc = getExistingWebDocument();
    if (!doc?.documentElement) {
      return "";
    }
    const parts = [
      state.existingWeb.currentUrl || "",
      Array.from(doc.querySelectorAll("link[rel='stylesheet'], script[src], img[src], video[src], audio[src]"))
        .map((node) => `${node.tagName}:${node.getAttribute("href") || node.getAttribute("src") || ""}`)
        .join("|"),
    ];
    return createStableHash(parts.join("\n"));
  }

  function getExistingWebPageCheckCacheKey(fingerprint = getExistingWebFingerprint()) {
    return [
      "tbalance-existing-web-page-check-v1",
      state.existingWeb.pageId || "page",
      state.existingWeb.sourcePath || "source",
      state.existingWeb.viewState || "",
      fingerprint || "unknown",
    ].join("::");
  }

  function getExistingWebPageCheckBaseCacheKey() {
    return [
      "tbalance-existing-web-page-check-v1",
      state.existingWeb.pageId || "page",
      state.existingWeb.sourcePath || "source",
      state.existingWeb.viewState || "",
      "latest",
    ].join("::");
  }

  function saveExistingWebPageCheckCache(fingerprint, checks, summary) {
    try {
      const payload = {
        fingerprint,
        checkedAt: state.existingWeb.pageCheck?.checkedAt || new Date().toISOString(),
        checks,
        summary,
      };
      localStorage.setItem(getExistingWebPageCheckCacheKey(fingerprint), JSON.stringify(payload));
      localStorage.setItem(getExistingWebPageCheckBaseCacheKey(), JSON.stringify({
        fingerprint,
        checkedAt: payload.checkedAt,
      }));
    } catch (error) {
      // Runtime cache is optional; Source remains authoritative.
    }
  }

  function restoreExistingWebPageCheckCache() {
    const fingerprint = getExistingWebFingerprint();
    if (!fingerprint) {
      return;
    }
    try {
      const latest = JSON.parse(localStorage.getItem(getExistingWebPageCheckBaseCacheKey()) || "null");
      const cached = JSON.parse(localStorage.getItem(getExistingWebPageCheckCacheKey(fingerprint)) || "null");
      if (!cached || cached.fingerprint !== fingerprint || !cached.checks) {
        state.existingWeb.pageCheck = {
          ...(state.existingWeb.pageCheck || {}),
          status: latest?.fingerprint && latest.fingerprint !== fingerprint ? "changed" : "idle",
          fingerprint,
          summary: null,
        };
        return;
      }
      state.existingWeb.checks = {
        ...(state.existingWeb.checks || {}),
        ...cached.checks,
      };
      state.existingWeb.pageCheck = {
        status: "checked",
        fingerprint,
        checkedAt: cached.checkedAt || "",
        summary: cached.summary || summarizeExistingWebChecks(cached.checks),
      };
    } catch (error) {
      state.existingWeb.pageCheck = {
        ...(state.existingWeb.pageCheck || {}),
        status: "idle",
        fingerprint,
        summary: null,
      };
    }
  }

  function scheduleExistingWebPageCheckRestore(expectedUrl, attempts = 8) {
    window.setTimeout(() => {
      if (!state.existingWeb.active || state.existingWeb.currentUrl !== expectedUrl) {
        return;
      }
      const doc = getExistingWebDocument();
      if (!doc?.documentElement) {
        if (attempts > 0) {
          scheduleExistingWebPageCheckRestore(expectedUrl, attempts - 1);
        }
        return;
      }
      restoreExistingWebPageCheckCache();
      refreshExistingWebVirtualLayers();
      renderAll();
    }, 250);
  }

  function createStableHash(value) {
    let hash = 2166136261;
    const text = String(value || "");
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16);
  }

  function prepareExistingWebAiReview(domRef) {
    const selected = state.existingWeb.selected?.domRef === domRef
      ? state.existingWeb.selected
      : selectExistingWebElement(getExistingWebNodeByDomRef(domRef));
    if (!selected) {
      showModeToast("AI確認対象が見つかりません。");
      return;
    }
    const check = selected.check || getExistingWebCheck(selected.domRef) || runExistingWebLayerCheck(selected.analyzerElement, selected.node, selected.mapping, selected.protectedBehavior, { level: "confirm" });
    const packageData = buildExistingWebAiReviewPackage(selected, check);
    setExistingWebAiReview(selected.domRef, {
      ...(getExistingWebAiReview(selected.domRef) || {}),
      status: "preview",
      package: packageData,
      text: formatExistingWebAiReviewText(packageData),
    });
    state.withAiShare.mode = "existing-web-ai-review";
    state.withAiShare.package = packageData;
    state.withAiShare.text = formatExistingWebAiReviewText(packageData);
    state.withAiShare.summary = `${packageData.target.name} のAI確認`;
    state.withAiShare.details = JSON.stringify(packageData, null, 2);
    state.withAiShare.status = "idle";
    state.withAiShare.message = "AIに共有する内容を確認してから、AIと共有してください。";
    state.aiCollab = true;
    if (els.aiCollabPanel) {
      els.aiCollabPanel.hidden = false;
    }
    refreshAiCollabPanel();
    showModeToast("AIに共有する内容を準備しました。");
    renderAll();
  }

  function prepareExistingWebAiReviewAll() {
    const layers = state.existingWeb.virtualLayers?.length
      ? state.existingWeb.virtualLayers
      : refreshExistingWebVirtualLayers();
    const targets = getExistingWebNormalDisplayLayers(layers)
      .filter((layer) => layer.kind !== "other-summary" && layer.status?.key === "ai-needed")
      .map((layer) => {
        const node = getExistingWebNodeByDomRef(layer.domRef);
        const selectedLike = {
          domRef: layer.domRef,
          node,
          tag: layer.tag || node?.tagName?.toLowerCase?.() || "",
          id: node?.id || "",
          className: typeof node?.className === "string" ? node.className : "",
          bounds: layer.bounds,
          computed: node ? getExistingWebComputed(node) : {},
          pageId: state.existingWeb.pageId,
          sourcePath: state.existingWeb.sourcePath,
          viewState: state.existingWeb.viewState,
          analyzerElement: layer.analyzerElement || null,
          analyzerStatus: layer.analyzerStatus,
          mapping: layer.mapping || null,
          protectedBehavior: layer.protectedBehavior || null,
        };
        const check = layer.check || getExistingWebCheck(layer.domRef) || runExistingWebLayerCheck(layer.analyzerElement, node, layer.mapping, layer.protectedBehavior, { level: "page" });
        return buildExistingWebAiReviewPackage({ ...selectedLike, check }, check);
      })
      .filter((item) => item.target?.domRef);
    if (!targets.length) {
      showModeToast("AI確認が必要なレイヤーはありません。");
      return;
    }
    const packageData = {
      type: "existing-web-ai-review-batch",
      targetAi: els.aiShareTarget?.value || state.withAiShare.targetAi || "chatgpt",
      project: { name: state.project?.name || "TBalance Project" },
      page: {
        pageId: state.existingWeb.pageId,
        sourcePath: state.existingWeb.sourcePath,
        viewState: state.existingWeb.viewState || "",
        currentUrl: state.existingWeb.currentUrl,
        sourceFingerprint: getExistingWebFingerprint(),
        requestRevision: createExistingWebAiRequestId(targets.map((item) => item.target?.domRef).join("|")),
      },
      targets,
      userIntent: "AI確認が必要な要素だけ、位置変更またはサイズ変更の安全性をproperty単位で確認したい。",
      responseFormat: {
        schemaVersion: "1.0",
        pageId: state.existingWeb.pageId,
        sourcePath: state.existingWeb.sourcePath,
        viewState: state.existingWeb.viewState || "",
        sourceFingerprint: getExistingWebFingerprint(),
        requestRevision: createExistingWebAiRequestId(targets.map((item) => item.target?.domRef).join("|")),
        targets: targets.map((targetPackage) => ({
          domRef: targetPackage.target.domRef,
          properties: {
            position: { result: "ok|caution|unknown|protected", reason: "" },
            width: { result: "ok|caution|unknown|protected", reason: "" },
            height: { result: "ok|caution|unknown|protected", reason: "" },
            click: { result: "protected", reason: "" },
          },
        })),
      },
      safetyPolicy: {
        automaticApplyAllowed: false,
        sourceMutationAllowed: false,
        autoPromoteFromAiOnly: false,
      },
    };
    state.withAiShare.mode = "existing-web-ai-review";
    state.withAiShare.package = packageData;
    state.withAiShare.text = formatExistingWebAiReviewText(packageData);
    state.withAiShare.summary = `AI確認: ${targets.length}件`;
    state.withAiShare.details = JSON.stringify(packageData, null, 2);
    state.withAiShare.status = "idle";
    state.withAiShare.message = "AIに共有する内容を確認してから、AIと共有してください。";
    state.aiCollab = true;
    if (els.aiCollabPanel) {
      els.aiCollabPanel.hidden = false;
    }
    refreshAiCollabPanel();
    showModeToast(`AI確認が必要な${targets.length}件を準備しました。`);
    renderAll();
  }

  function buildExistingWebAiReviewPackage(selected, check) {
    const computed = selected.computed || getExistingWebComputed(selected.node);
    const observed = selected.analyzerElement?.observed || {};
    return {
      type: "existing-web-ai-review",
      targetAi: els.aiShareTarget?.value || state.withAiShare.targetAi || "chatgpt",
      project: {
        name: state.project?.name || "TBalance Project",
      },
      page: {
        pageId: selected.pageId,
        sourcePath: selected.sourcePath,
        viewState: selected.viewState || "",
        currentUrl: state.existingWeb.currentUrl,
        sourceFingerprint: getExistingWebFingerprint(),
        requestRevision: createExistingWebAiRequestId(selected.domRef),
      },
      target: {
        name: getExistingWebSelectionTitle(selected),
        domRef: selected.domRef,
        tag: selected.tag,
        id: selected.id,
        className: selected.className,
        role: selected.analyzerElement?.inferred?.roleCandidate || "",
        bounds: selected.bounds,
      },
      userIntent: "位置変更またはサイズ変更が、既存JS動作を壊さず安全に可能か確認したい。",
      tbalanceAssessment: {
        status: check.status,
        propertyChecks: check.checks || [],
        editableProperties: check.editableProperties || [],
        protectedProperties: check.protectedProperties || [],
        blockedReasons: check.blockedReasons || [],
        analyzerStatus: selected.analyzerStatus,
      },
      cssContext: {
        display: computed.display,
        visibility: computed.visibility,
        opacity: computed.opacity,
        positionType: computed.positionType,
        left: computed.left,
        top: computed.top,
        width: computed.width,
        height: computed.height,
        transform: computed.transform,
        backgroundImage: observed.backgroundImage || "",
      },
      sourceProvenance: {
        mapping: selected.mapping ? {
          tbId: selected.mapping.tbId,
          editableProperties: selected.mapping.editableProperties,
          protectedProperties: selected.mapping.protectedProperties,
          behaviorRef: selected.mapping.behaviorRef,
        } : null,
        sourceAuthority: state.existingWeb.sourceAuthority || "standard-web",
      },
      protectedBehavior: selected.protectedBehavior || null,
      ask: {
        position: "位置変更が安全候補になるか",
        width: "幅変更が安全候補になるか",
        height: "高さ変更が安全候補になるか",
        clickBehavior: "クリック動作は保護対象として触らない",
      },
      aiResultContract: ["AI_RESULT_OK", "AI_RESULT_CAUTION", "AI_RESULT_UNKNOWN"],
      responseFormat: {
        schemaVersion: "1.0",
        pageId: selected.pageId,
        sourcePath: selected.sourcePath,
        viewState: selected.viewState || "",
        sourceFingerprint: getExistingWebFingerprint(),
        requestRevision: createExistingWebAiRequestId(selected.domRef),
        targets: [{
          domRef: selected.domRef,
          properties: {
            position: { result: "ok|caution|unknown|protected", reason: "" },
            width: { result: "ok|caution|unknown|protected", reason: "" },
            height: { result: "ok|caution|unknown|protected", reason: "" },
            click: { result: "protected", reason: "" },
          },
        }],
      },
      safetyPolicy: {
        automaticApplyAllowed: false,
        sourceMutationAllowed: false,
        autoPromoteFromAiOnly: false,
      },
    };
  }

  function formatExistingWebAiReviewText(packageData) {
    if (packageData.type === "existing-web-ai-review-batch") {
      return [
        "TBalance Existing Web のAI確認が必要な要素だけをまとめて確認したいです。",
        "",
        "【ページ】",
        `${packageData.page.pageId} / ${packageData.page.sourcePath}${packageData.page.viewState ? `?${packageData.page.viewState}` : ""}`,
        "",
        "【目的】",
        packageData.userIntent,
        "",
        "【対象】",
        packageData.targets.map((targetPackage, index) => `${index + 1}. ${targetPackage.target.name} / ${targetPackage.target.domRef}`).join("\n"),
        "",
        "【確認してほしいこと】",
        "各対象について position / width / height / click behavior をproperty単位で見てください。",
        "AIの回答だけで自動許可はしません。TBalance側で再照合します。",
        "回答は共有データ内の responseFormat と同じJSON形式だけで返してください。",
        "",
        "【共有データ】",
        JSON.stringify(packageData, null, 2),
      ].join("\n");
    }
    return [
      "TBalance Existing Web の選択要素だけをAI確認したいです。",
      "",
      "【対象】",
      `${packageData.target.name} / ${packageData.target.domRef}`,
      "",
      "【目的】",
      packageData.userIntent,
      "",
      "【TBalance判定】",
      `状態: ${packageData.tbalanceAssessment.status.label}`,
      `位置: ${getExistingWebShareCheckText(packageData.tbalanceAssessment.propertyChecks, "位置")}`,
      `サイズ: ${getExistingWebShareCheckText(packageData.tbalanceAssessment.propertyChecks, "サイズ")}`,
      `クリック: ${getExistingWebShareCheckText(packageData.tbalanceAssessment.propertyChecks, "クリック")}`,
      "",
      "【確認してほしいこと】",
      "position / width / height / click behavior をproperty単位で見てください。",
      "AIの回答だけで自動許可はしません。TBalance側で再照合します。",
      "回答は共有データ内の responseFormat と同じJSON形式だけで返してください。",
      "",
      "【共有データ】",
      JSON.stringify(packageData, null, 2),
    ].join("\n");
  }

  function getExistingWebShareCheckText(checks, label) {
    const item = (checks || []).find((check) => check.label === label);
    return item ? `${getExistingWebCheckStateLabel(item)} / ${item.text}` : "未確定";
  }

  function getExistingWebAiSharePreview() {
    const selected = state.existingWeb.selected;
    const review = selected ? getExistingWebAiReview(selected.domRef) : null;
    const packageData = review?.package || state.withAiShare.package;
    const text = review?.text || state.withAiShare.text;
    if (!state.existingWeb.active || !packageData || !["existing-web-ai-review", "existing-web-ai-review-batch"].includes(packageData.type)) {
      return {
        ok: false,
        summary: "AI確認対象を選択してください",
        message: "Existing Webで対象を選択し、AIに確認を押してください。",
        details: "AI確認対象がありません。",
      };
    }
    packageData.targetAi = els.aiShareTarget?.value || state.withAiShare.targetAi || packageData.targetAi || "chatgpt";
    const isBatch = packageData.type === "existing-web-ai-review-batch";
    if (isBatch) {
      (packageData.targets || []).forEach((targetPackage) => {
        targetPackage.targetAi = packageData.targetAi;
      });
    }
    return {
      ok: true,
      package: packageData,
      text: formatExistingWebAiReviewText(packageData) || text,
      summary: isBatch ? `AI確認: ${packageData.targets?.length || 0}件` : `AI確認: ${packageData.target.name}`,
      message: "AIに共有する内容を確認してから共有してください。",
      details: [
        isBatch ? `対象: ${packageData.targets?.length || 0}件` : `対象: ${packageData.target.name}`,
        "目的: 位置変更/サイズ変更の安全性確認",
        "共有: 対象HTML情報 / 関連CSS / TBalance判定 / Protected情報",
        "",
        JSON.stringify(packageData, null, 2),
      ].join("\n"),
    };
  }

  function cancelExistingWebAiShare() {
    if (state.withAiShare.mode === "existing-web-ai-review") {
      state.withAiShare.mode = "safe-change";
      state.withAiShare.package = null;
      state.withAiShare.text = "";
      state.withAiShare.summary = "";
      state.withAiShare.details = "";
      state.withAiShare.status = "idle";
      state.withAiShare.message = "AI共有はClipboardへコピーします。";
    }
    renderWithAiSafeChangeShare();
    renderAll();
    showModeToast("AI確認の共有をキャンセルしました。");
  }

  function createExistingWebAiRequestId(seed = "") {
    return createStableHash([
      state.existingWeb.pageId || "",
      state.existingWeb.sourcePath || "",
      state.existingWeb.viewState || "",
      getExistingWebFingerprint(),
      seed || "",
    ].join("\n"));
  }

  async function pasteExistingWebAiResultFromClipboard() {
    if (!els.aiExistingWebResultText) {
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      els.aiExistingWebResultText.value = text || "";
      setExistingWebAiImportStatus("idle", text ? "Clipboardから貼り付けました。内容を確認して取り込んでください。" : "Clipboardにテキストがありません。");
    } catch (error) {
      setExistingWebAiImportStatus("error", "Clipboardを読めませんでした。AI回答を手動で貼り付けてください。");
    }
  }

  function importExistingWebAiReviewResult() {
    const text = els.aiExistingWebResultText?.value || "";
    const result = applyExistingWebAiReviewResult(text);
    setExistingWebAiImportStatus(result.ok ? "ok" : "error", result.message || (result.ok ? "AI回答を取り込みました。" : "AI回答を取り込めませんでした。"));
    if (result.ok) {
      showModeToast(result.message || "AI回答をTBalanceで再照合しました。");
    }
  }

  function setExistingWebAiImportStatus(status, message) {
    if (!els.aiExistingWebImportStatus) {
      return;
    }
    els.aiExistingWebImportStatus.dataset.status = status;
    els.aiExistingWebImportStatus.textContent = message;
  }

  function applyExistingWebAiReviewResult(input = {}) {
    if (!state.existingWeb.active) {
      return { ok: false, message: "Existing Webを開いてからAI回答を取り込んでください。" };
    }
    const parsed = parseExistingWebAiReviewPayload(input);
    if (!parsed.ok) {
      return { ok: false, message: parsed.message };
    }
    const normalized = normalizeExistingWebAiReviewResult(parsed.payload);
    const validation = validateExistingWebAiReviewContext(normalized);
    if (!validation.ok) {
      return { ok: false, message: validation.message };
    }
    const applied = normalized.targets.map((target) => reconcileExistingWebAiTarget(target, normalized)).filter(Boolean);
    if (!applied.length) {
      return { ok: false, message: "取り込めるAI確認対象がありませんでした。" };
    }
    refreshExistingWebVirtualLayers();
    if (state.existingWeb.selected) {
      applyExistingWebCheckToSelection(state.existingWeb.selected);
    }
    renderAll();
    const editableCount = applied.reduce((sum, item) => sum + (item.finalCheck.editableProperties?.length || 0), 0);
    return {
      ok: true,
      result: "AI_REVIEW_IMPORTED",
      targets: applied.length,
      editableProperties: editableCount,
      message: `AI回答を${applied.length}件取り込み、TBalanceで再照合しました。`,
    };
  }

  function parseExistingWebAiReviewPayload(input) {
    if (input && typeof input === "object" && !Array.isArray(input)) {
      return { ok: true, payload: input };
    }
    const text = String(input || "").trim();
    if (!text) {
      return { ok: false, message: "AI回答が空です。回答を貼り付けてください。" };
    }
    const direct = parseExistingWebAiJson(text);
    if (direct.ok) {
      return direct;
    }
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) {
      const parsed = parseExistingWebAiJson(fenced[1]);
      if (parsed.ok) {
        return parsed;
      }
    }
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end > start) {
      const parsed = parseExistingWebAiJson(text.slice(start, end + 1));
      if (parsed.ok) {
        return parsed;
      }
    }
    return { ok: false, message: "構造化されたAI回答を読み取れませんでした。JSON形式の回答を貼り付けてください。" };
  }

  function parseExistingWebAiJson(text) {
    try {
      return { ok: true, payload: JSON.parse(text) };
    } catch (error) {
      return { ok: false, message: "JSONとして解析できませんでした。" };
    }
  }

  function normalizeExistingWebAiReviewResult(payload = {}) {
    const root = payload.response || payload.aiReview || payload;
    const targets = Array.isArray(root.targets)
      ? root.targets
      : root.domRef || root.properties
        ? [root]
        : [];
    return {
      schemaVersion: String(root.schemaVersion || "1.0"),
      pageId: root.pageId || root.page?.pageId || "",
      sourcePath: normalizeExistingWebSourcePath(root.sourcePath || root.page?.sourcePath || ""),
      viewState: normalizeExistingWebViewState(root.viewState || root.page?.viewState || ""),
      sourceFingerprint: String(root.sourceFingerprint || root.page?.sourceFingerprint || ""),
      requestRevision: String(root.requestRevision || root.page?.requestRevision || ""),
      targets: targets.map(normalizeExistingWebAiReviewTarget).filter((target) => target.domRef),
      raw: payload,
    };
  }

  function normalizeExistingWebAiReviewTarget(target = {}) {
    const properties = target.properties && typeof target.properties === "object"
      ? target.properties
      : buildExistingWebAiPropertiesFromLegacy(target);
    return {
      domRef: String(target.domRef || target.target?.domRef || ""),
      name: String(target.name || target.target?.name || ""),
      properties: Object.fromEntries(Object.entries(properties || {}).map(([property, value]) => {
        const normalizedProperty = normalizeExistingWebAiPropertyName(property);
        const item = typeof value === "object" && value !== null ? value : { result: value };
        return [normalizedProperty, {
          result: normalizeExistingWebAiPropertyResult(item.result || item.status || item.value),
          reason: String(item.reason || item.message || ""),
        }];
      }).filter(([property]) => property)),
    };
  }

  function buildExistingWebAiPropertiesFromLegacy(target = {}) {
    const allowed = normalizeExistingWebAiProperties(target.allowedProperties || target.editableProperties || []);
    const denied = normalizeExistingWebAiProperties(target.protectedProperties || target.deniedProperties || []);
    const entries = {};
    allowed.forEach((property) => { entries[property] = { result: "ok", reason: target.reason || "" }; });
    denied.forEach((property) => { entries[property] = { result: "protected", reason: target.reason || "" }; });
    if (!Object.keys(entries).length && (target.type || target.result || target.status)) {
      normalizeExistingWebAiProperties(target.properties || ["position", "width", "height"]).forEach((property) => {
        entries[property] = { result: target.type || target.result || target.status, reason: target.reason || "" };
      });
    }
    return entries;
  }

  function validateExistingWebAiReviewContext(normalized) {
    if (!normalized.targets.length) {
      return { ok: false, message: "AI回答に対象レイヤーが含まれていません。" };
    }
    if (normalized.pageId && normalized.pageId !== state.existingWeb.pageId) {
      return { ok: false, message: "AI回答のページが現在のページと一致しません。AI確認をやり直してください。" };
    }
    if (normalized.sourcePath && normalizeExistingWebSourcePath(normalized.sourcePath) !== normalizeExistingWebSourcePath(state.existingWeb.sourcePath)) {
      return { ok: false, message: "AI回答のSourceが現在のSourceと一致しません。AI確認をやり直してください。" };
    }
    if ((normalized.viewState || "") !== (state.existingWeb.viewState || "")) {
      return { ok: false, message: "AI回答の表示状態が現在の表示状態と一致しません。AI確認をやり直してください。" };
    }
    const fingerprint = getExistingWebFingerprint();
    if (normalized.sourceFingerprint && normalized.sourceFingerprint !== fingerprint) {
      state.existingWeb.pageCheck = {
        ...(state.existingWeb.pageCheck || {}),
        status: "changed",
        fingerprint,
        summary: null,
      };
      return { ok: false, message: "ページが変更されています。AI確認をやり直してください。" };
    }
    const expectedRevision = getExpectedExistingWebAiRequestRevision(normalized.targets.map((target) => target.domRef));
    if (normalized.requestRevision && normalized.requestRevision !== expectedRevision) {
      return { ok: false, message: "AI回答の依頼Revisionが現在の確認内容と一致しません。AI確認をやり直してください。" };
    }
    return { ok: true };
  }

  function getExpectedExistingWebAiRequestRevision(domRefs) {
    const refs = (domRefs || []).filter(Boolean).join("|");
    return createExistingWebAiRequestId(refs);
  }

  function reconcileExistingWebAiTarget(target, normalized) {
    const node = getExistingWebNodeByDomRef(target.domRef);
    if (!node) {
      return null;
    }
    const analysis = analyzeExistingWebDocument();
    const element = analysis?.elements?.find((item) => item.observed?.domRef === target.domRef) || null;
    const mapping = findExistingWebMapping(target.domRef);
    const protectedBehavior = getExistingWebProtectedBehavior(mapping);
    const localCheck = runExistingWebLayerCheck(element, node, mapping, protectedBehavior, { level: "confirm" });
    const finalCheck = buildExistingWebFinalCheckFromAi(target, localCheck, element, node);
    setExistingWebAiReview(target.domRef, {
      ...(getExistingWebAiReview(target.domRef) || {}),
      status: "result",
      result: {
        type: finalCheck.status.key === "editable" ? "AI_RESULT_OK" : finalCheck.status.key === "protected" ? "AI_RESULT_UNKNOWN" : "AI_RESULT_CAUTION",
        schemaVersion: normalized.schemaVersion,
        sourceFingerprint: normalized.sourceFingerprint,
        requestRevision: normalized.requestRevision,
        target,
        normalMessage: finalCheck.message,
        raw: normalized.raw,
      },
      finalCheck,
      importedAt: new Date().toISOString(),
    });
    setExistingWebCheck(target.domRef, finalCheck);
    return { domRef: target.domRef, finalCheck };
  }

  function buildExistingWebFinalCheckFromAi(target, localCheck, element, node) {
    const protectedProperties = new Set(localCheck.protectedProperties || []);
    getExistingWebBackgroundProtectedProperties(element, node).forEach((property) => protectedProperties.add(property));
    if (localCheck.status?.key === "protected") {
      protectedProperties.add("click");
    }
    const runtimeEditable = new Set(getExistingWebRuntimeEditableProperties(element, node, {
      allowBehaviorProtectedVisual: true,
      allowTransformAnimation: true,
    }));
    const aiOk = new Set();
    const aiProtected = new Set();
    const cautions = [];
    Object.entries(target.properties || {}).forEach(([property, result]) => {
      const prop = normalizeExistingWebAiPropertyName(property);
      if (!prop) {
        return;
      }
      const value = normalizeExistingWebAiPropertyResult(result?.result);
      if (value === "ok") {
        aiOk.add(prop);
      } else if (value === "protected") {
        aiProtected.add(prop);
      } else {
        cautions.push(result?.reason || `${prop} は安全確認できませんでした`);
      }
    });
    aiProtected.forEach((property) => protectedProperties.add(property));
    protectedProperties.add("click");
    const editableProperties = [];
    if (aiOk.has("position") && runtimeEditable.has("position") && !protectedProperties.has("position")) {
      editableProperties.push("position");
    }
    const sizeOk = (aiOk.has("size") || (aiOk.has("width") && aiOk.has("height")))
      && (runtimeEditable.has("size") || runtimeEditable.has("width") || runtimeEditable.has("height"))
      && !protectedProperties.has("size")
      && !protectedProperties.has("width")
      && !protectedProperties.has("height");
    if (sizeOk) {
      editableProperties.push("size");
    }
    const propertyChecks = getExistingWebAiPropertyChecks(target.properties, editableProperties, Array.from(protectedProperties), cautions);
    if (editableProperties.length) {
      return {
        ...localCheck,
        level: "ai-review",
        status: { key: "editable", label: "一部編集できます" },
        editableProperties,
        protectedProperties: Array.from(protectedProperties),
        blockedReasons: [],
        message: "AI確認結果をTBalanceで再照合しました。許可候補の範囲だけRuntime Previewできます。",
        checks: propertyChecks,
      };
    }
    return {
      ...localCheck,
      level: "ai-review",
      status: { key: "protected", label: "現在は編集できません" },
      editableProperties: [],
      protectedProperties: Array.from(protectedProperties),
      blockedReasons: cautions.length ? cautions : ["AIでも安全を確認できませんでした"],
      message: "AIでも安全を確認できませんでした。現在は編集できません。",
      checks: propertyChecks,
    };
  }

  function getExistingWebAiPropertyChecks(aiProperties, editableProperties, protectedProperties, cautions) {
    const editable = new Set(editableProperties || []);
    const protectedSet = new Set(protectedProperties || []);
    const resultFor = (property) => normalizeExistingWebAiPropertyResult(aiProperties?.[property]?.result || aiProperties?.[property]?.status);
    const reasonFor = (property) => aiProperties?.[property]?.reason || "";
    return [
      {
        label: "位置",
        state: editable.has("position") ? "ok" : protectedSet.has("position") ? "protected" : resultFor("position") === "unknown" ? "warning" : "warning",
        text: editable.has("position") ? "AI確認済み" : protectedSet.has("position") ? "保護" : reasonFor("position") || cautions?.[0] || "編集できません",
      },
      {
        label: "サイズ",
        state: editable.has("size") ? "ok" : (protectedSet.has("size") || protectedSet.has("width") || protectedSet.has("height")) ? "protected" : "warning",
        text: editable.has("size") ? "AI確認済み" : (reasonFor("width") || reasonFor("height") || cautions?.[0] || "編集できません"),
      },
      {
        label: "クリック",
        state: "protected",
        text: reasonFor("click") || "保護",
      },
    ];
  }

  function normalizeExistingWebAiProperties(value) {
    const list = Array.isArray(value) ? value : String(value || "").split(/[,\s]+/);
    return Array.from(new Set(list.map((item) => {
      return normalizeExistingWebAiPropertyName(item);
    }).filter(Boolean)));
  }

  function normalizeExistingWebAiPropertyName(value) {
    const key = String(value || "").toLowerCase().trim();
    if (["position", "pos", "move", "x", "y", "left", "top", "位置"].includes(key)) return "position";
    if (["size", "resize", "scale", "サイズ"].includes(key)) return "size";
    if (["width", "w", "幅"].includes(key)) return "width";
    if (["height", "h", "高さ"].includes(key)) return "height";
    if (["click", "clickbehavior", "click_behavior", "button", "link", "クリック"].includes(key)) return "click";
    if (["behavior", "behaviour", "動作"].includes(key)) return "behavior";
    return key;
  }

  function normalizeExistingWebAiPropertyResult(value) {
    const key = String(value || "").toLowerCase().trim();
    if (["ok", "safe", "allowed", "editable", "編集可能", "編集できます"].includes(key)) return "ok";
    if (["caution", "warn", "warning", "maybe", "注意"].includes(key)) return "caution";
    if (["protected", "deny", "denied", "blocked", "lock", "保護"].includes(key)) return "protected";
    return "unknown";
  }

  function getExistingWebAiResultNormalMessage(type) {
    if (type === "AI_RESULT_OK") return "AI確認結果をTBalanceで照合しました。許可候補だけ編集できます。";
    if (type === "AI_RESULT_CAUTION") return "AI確認では注意が必要です。現在は編集できません。";
    return "AIでも安全を確認できませんでした。現在は編集できません。";
  }

  function handleExistingWebLayerAction(action, actionSource = null) {
    const domRef = actionSource?.dataset?.existingWebDomRef || state.existingWeb.selected?.domRef || "";
    if (action === "confirm-layer") {
      confirmExistingWebVirtualLayer(domRef);
      return;
    }
    if (action === "ai-check") {
      prepareExistingWebAiReview(domRef);
      return;
    }
    if (action === "ai-check-all") {
      prepareExistingWebAiReviewAll();
      return;
    }
    if (action === "page-check") {
      runExistingWebPageCheck();
      return;
    }
    if (action === "nudge-left") nudgeExistingWebSelection(-10, 0);
    if (action === "nudge-right") nudgeExistingWebSelection(10, 0);
    if (action === "nudge-up") nudgeExistingWebSelection(0, -10);
    if (action === "nudge-down") nudgeExistingWebSelection(0, 10);
    if (action === "size-smaller") resizeExistingWebSelection(-10, -10);
    if (action === "size-larger") resizeExistingWebSelection(10, 10);
    if (action === "reset-preview") resetExistingWebPreview();
    if (action === "safe-change") sendExistingWebPreviewToSafeChange();
  }

  function getFallbackDomRef(node) {
    if (node.id) {
      return `#${CSS.escape(node.id)}`;
    }
    const tag = node.tagName.toLowerCase();
    const className = typeof node.className === "string" ? node.className.trim().split(/\s+/).filter(Boolean)[0] : "";
    return className ? `${tag}.${CSS.escape(className)}` : tag;
  }

  function getExistingWebComputed(node) {
    const style = node.ownerDocument.defaultView.getComputedStyle(node);
    return {
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity,
      positionType: style.position,
      left: style.left,
      top: style.top,
      width: style.width,
      height: style.height,
      transform: style.transform === "none" ? "" : style.transform,
    };
  }

  function captureExistingWebInlineStyle(node) {
    return {
      position: node.style.position,
      left: node.style.left,
      top: node.style.top,
      width: node.style.width,
      height: node.style.height,
      transform: node.style.transform,
    };
  }

  function restoreExistingWebInlineStyle(node, inline) {
    ["position", "left", "top", "width", "height", "transform"].forEach((key) => {
      node.style[key] = inline?.[key] || "";
    });
  }

  function parseCssPx(value, fallback = 0) {
    const parsed = Number.parseFloat(String(value || ""));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function handleAnalyzerFrameLoad() {
    installAnalyzerClickSelection();
    let effectiveUrl = "";
    try {
      effectiveUrl = els.analyzerFrame?.contentWindow?.location?.href || "";
    } catch (error) {
      effectiveUrl = "";
    }
    state.analyzer.effectiveUrl = effectiveUrl || state.analyzer.loadedPath || els.analyzerFrame?.getAttribute("src") || "srcdoc";
    setAnalyzerStatus("idle", `Page Load Success: ${state.analyzer.effectiveUrl} / AnalyzeでDOMを読み取ります。`);
  }

  function setAnalyzerFrameSandbox(allowScripts) {
    if (!els.analyzerFrame) {
      return;
    }
    const value = allowScripts ? "allow-same-origin allow-scripts" : "allow-same-origin";
    if (els.analyzerFrame.getAttribute("sandbox") !== value) {
      els.analyzerFrame.setAttribute("sandbox", value);
    }
  }

  function installAnalyzerClickSelection() {
    const frame = els.analyzerFrame;
    if (!frame || !window.TBalanceReadOnlyAnalyzer) {
      return;
    }
    let doc;
    try {
      doc = frame.contentDocument;
    } catch (error) {
      setAnalyzerStatus("error", "iframeのDOMへアクセスできません。localhostまたは同一プロジェクトのページで確認してください。");
      return;
    }
    if (!doc || doc.__tbalanceAnalyzerInstalled) {
      return;
    }
    doc.__tbalanceAnalyzerInstalled = true;
    doc.addEventListener("click", handleAnalyzerFrameClick, true);
    doc.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopPropagation();
    }, true);
  }

  function handleAnalyzerFrameClick(event) {
    event.preventDefault();
    event.stopPropagation();
    const analyzer = window.TBalanceReadOnlyAnalyzer;
    if (!analyzer || typeof analyzer.getSelectorCandidate !== "function") {
      setAnalyzerStatus("error", "Analyzerモジュールを読み込めていません。");
      return;
    }
    const selectedDomRef = analyzer.getSelectorCandidate(event.target);
    runReadOnlyAnalyzer({ selectedDomRef });
  }

  function runReadOnlyAnalyzer(options = {}) {
    if (options instanceof Event) {
      options = {};
    }
    const analyzer = window.TBalanceReadOnlyAnalyzer;
    if (!analyzer || typeof analyzer.analyzeDocument !== "function") {
      setAnalyzerStatus("error", "Analyzerモジュールを読み込めていません。");
      return;
    }
    const frame = els.analyzerFrame;
    let doc;
    try {
      doc = frame?.contentDocument;
    } catch (error) {
      setAnalyzerStatus("error", "読み取りに失敗しました。file://制約またはクロスオリジンの可能性があります。localhostで開いてください。");
      return;
    }
    if (!doc || !doc.documentElement) {
      setAnalyzerStatus("error", "解析対象ページがまだ読み込まれていません。");
      return;
    }
    try {
      const result = analyzer.analyzeDocument(doc, {
        path: state.analyzer.effectiveUrl || doc.location?.href || state.analyzer.loadedPath || "unknown",
        sourcePath: state.analyzer.sourcePath,
        viewState: state.analyzer.viewState,
        scriptExecution: els.analyzerFrame?.sandbox?.contains("allow-scripts")
          ? "enabled-in-readonly-frame"
          : "blocked-by-sandbox",
      });
      state.analyzer.result = result;
      const selected = options.selectedDomRef
        ? result.elements.find((element) => element.observed.domRef === options.selectedDomRef)
        : null;
      state.analyzer.selectedId = selected?.candidateId || state.analyzer.selectedId || result.elements[0]?.candidateId || "";
      state.analyzer.mappingWarning = "";
      setAnalyzerStatus("success", `解析完了: ${result.counts.elements}要素 / safe ${countAnalyzerStatus(result, "safe-visual-edit")} / 要確認 ${countAnalyzerStatus(result, "behavior-analysis-required")}`);
      renderAnalyzerResult();
    } catch (error) {
      state.analyzer.result = null;
      state.analyzer.selectedId = "";
      setAnalyzerStatus("error", `解析に失敗しました: ${error.message || error}`);
      renderAnalyzerResult();
    }
  }

  function handleAnalyzerElementListClick(event) {
    const item = event.target.closest("[data-analyzer-id]");
    if (!item) {
      return;
    }
    state.analyzer.selectedId = item.dataset.analyzerId || "";
    state.analyzer.mappingWarning = "";
    renderAnalyzerResult();
  }

  function renderAnalyzerResult() {
    if (!els.analyzerSummary || !els.analyzerElementList || !els.analyzerElementDetail) {
      return;
    }
    const result = state.analyzer.result;
    if (!result) {
      els.analyzerSummary.textContent = state.analyzer.loadedPath
        ? "ページ読み込み済み。解析ボタンを押してください。"
        : "解析対象を読み込んでください。";
      els.analyzerElementList.innerHTML = "";
      els.analyzerElementDetail.textContent = "未解析";
      renderMappingCandidate(null);
      renderConfirmedMappings();
      renderSafeChangePanel();
      renderManifestPanel();
      renderAdapterPanel();
      renderSafeWorkflowPanel();
      renderSiteMapPanel();
      return;
    }
    const statusCounts = result.elements.reduce((counts, element) => {
      const status = element.inferred.analysisStatus;
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});
    els.analyzerSummary.innerHTML = [
      `<span>Analyzed Source: ${escapeHtml(result.page.path)}</span>`,
      result.page.sourcePath ? `<span>Source Path: ${escapeHtml(result.page.sourcePath)}</span>` : "",
      result.page.viewState ? `<span>View State: ${escapeHtml(result.page.viewState)}</span>` : "",
      `<span>要素: ${result.counts.elements}</span>`,
      `<span>safe: ${statusCounts["safe-visual-edit"] || 0}</span>`,
      `<span>layout: ${statusCounts["layout-dependency"] || 0}</span>`,
      `<span>behavior: ${statusCounts["behavior-analysis-required"] || 0}</span>`,
      `<span>unknown: ${statusCounts.unknown || 0}</span>`,
    ].join("");
    els.analyzerElementList.innerHTML = result.elements.map((element) => {
      const selected = element.candidateId === state.analyzer.selectedId;
      const bounds = element.observed.bounds;
      return `<button type="button" class="tb-analyzer-item${selected ? " is-selected" : ""}" data-analyzer-id="${escapeHtml(element.candidateId)}">
        <span class="tb-analyzer-item-main">
          <strong>${escapeHtml(getAnalyzerElementLabel(element))}</strong>
          <em class="${escapeHtml(getAnalyzerStatusClass(element.inferred.analysisStatus))}">${escapeHtml(getAnalyzerStatusLabel(element.inferred.analysisStatus))}</em>
        </span>
        <small>${escapeHtml(`${bounds.x},${bounds.y} / ${bounds.width}x${bounds.height}`)}</small>
      </button>`;
    }).join("");
    const selectedElement = getAnalyzerSelectedElement();
    els.analyzerElementDetail.textContent = selectedElement
      ? JSON.stringify({
        candidateId: selectedElement.candidateId,
        observed: selectedElement.observed,
        inferred: selectedElement.inferred,
      }, null, 2)
      : "要素を選択してください。";
    renderMappingCandidate(selectedElement);
    renderConfirmedMappings();
    renderSafeChangePanel();
    renderManifestPanel();
    renderAdapterPanel();
    renderSafeWorkflowPanel();
    renderSiteMapPanel();
  }

  function handleMappingCandidateClick(event) {
    const action = event.target.closest("[data-mapping-action]")?.dataset.mappingAction;
    if (!action) {
      return;
    }
    if (action === "confirm") {
      confirmSelectedMapping();
    }
  }

  function handleConfirmedMappingListClick(event) {
    const removeButton = event.target.closest("[data-remove-mapping]");
    if (!removeButton) {
      return;
    }
    const mappingId = removeButton.dataset.removeMapping || "";
    state.analyzer.confirmedMappings = state.analyzer.confirmedMappings.filter((mapping) => mapping.mappingId !== mappingId);
    state.analyzer.mappingWarning = "";
    setAnalyzerStatus("success", "Confirmed Mappingを解除しました。既存HTML/CSS/JSは変更していません。");
    renderAnalyzerResult();
  }

  function renderMappingCandidate(element) {
    if (!els.mappingCandidatePanel || !els.mappingCandidateStatus) {
      return;
    }
    if (!element) {
      els.mappingCandidateStatus.textContent = "未選択";
      els.mappingCandidatePanel.textContent = "Elementを選択してください。";
      return;
    }
    const candidate = buildMappingCandidate(element);
    const duplicateWarnings = getMappingDuplicateWarnings(candidate);
    const warning = state.analyzer.mappingWarning || duplicateWarnings.join(" / ");
    els.mappingCandidateStatus.textContent = getAnalyzerStatusLabel(element.inferred.analysisStatus);
    els.mappingCandidatePanel.innerHTML = `
      <div class="tb-mapping-grid">
        <label>tbId<input id="mappingTbId" type="text" value="${escapeAttr(candidate.tbId)}" spellcheck="false"></label>
        <label>role<input id="mappingRole" type="text" value="${escapeAttr(candidate.role)}" spellcheck="false"></label>
        <label>domRef<input id="mappingDomRef" type="text" value="${escapeAttr(candidate.domRef)}" readonly></label>
        <label>selector<input id="mappingSelectorQuality" type="text" value="${escapeAttr(candidate.selectorQuality)}" readonly></label>
        <label>behaviorRef<input id="mappingBehaviorRef" type="text" value="${escapeAttr(candidate.behaviorRef || "")}" placeholder="unknown / existing-click-behavior" spellcheck="false"></label>
      </div>
      <fieldset>
        <legend>editable</legend>
        ${renderMappingCheckboxes("editable", ["position", "size", "visibility", "text", "style", "hitArea"], candidate.editableProperties)}
      </fieldset>
      <fieldset>
        <legend>protected</legend>
        ${renderMappingCheckboxes("protected", ["behavior", "dataSource", "structure", "navigation", "dialogue", "formFlow", "saveFlow"], candidate.protectedProperties)}
      </fieldset>
      <p class="tb-mapping-note">Analyzer Status: ${escapeHtml(element.inferred.analysisStatus)} / Confirmするまで正式Mappingにはしません。</p>
      ${warning ? `<p class="tb-mapping-warning">${escapeHtml(warning)}</p>` : ""}
      <button type="button" class="tb-mapping-confirm" data-mapping-action="confirm">Confirm Mapping</button>
    `;
  }

  function renderMappingCheckboxes(group, values, selectedValues) {
    const selected = new Set(selectedValues || []);
    return values.map((value) => `
      <label class="tb-mapping-check">
        <input type="checkbox" name="mapping-${group}" value="${escapeAttr(value)}"${selected.has(value) ? " checked" : ""}>
        <span>${escapeHtml(value)}</span>
      </label>
    `).join("");
  }

  function renderConfirmedMappings() {
    if (!els.confirmedMappingList || !els.confirmedMappingCount) {
      return;
    }
    const pageMeta = getAnalyzerManifestPageMeta();
    const mappings = getVisibleConfirmedMappings(pageMeta);
    els.confirmedMappingCount.textContent = `${mappings.length}件`;
    if (!mappings.length) {
      els.confirmedMappingList.textContent = "まだMappingは確定していません。";
      return;
    }
    els.confirmedMappingList.innerHTML = mappings.map((mapping) => {
      const missing = isMappingDomMissing(mapping);
      return `<article class="tb-confirmed-mapping${missing ? " is-missing" : ""}">
        <div>
          <strong>${escapeHtml(mapping.tbId)}</strong>
          <small>${escapeHtml(mapping.domRef)}${mapping.viewState ? ` / ${escapeHtml(mapping.viewState)}` : " / common"}${missing ? " / Mapping Missing" : ""}</small>
        </div>
        <span>${escapeHtml(mapping.role || "visual")}</span>
        <button type="button" data-remove-mapping="${escapeAttr(mapping.mappingId)}">解除</button>
      </article>`;
    }).join("");
  }

  function renderSafeChangePanel() {
    if (!els.safeChangeTarget || !els.safeChangeProperty || !els.safeChangeStatus) {
      return;
    }
    const safeState = state.analyzer.safeChange;
    const pageMeta = getAnalyzerManifestPageMeta();
    const mappings = getVisibleConfirmedMappings(pageMeta);
    const previousTarget = safeState.targetMappingId;
    els.safeChangeTarget.innerHTML = mappings.length
      ? mappings.map((mapping) => `<option value="${escapeAttr(mapping.mappingId)}">${escapeHtml(`${mapping.tbId} / ${mapping.domRef}${mapping.viewState ? ` / ${mapping.viewState}` : " / common"}`)}</option>`).join("")
      : `<option value="">Confirmed Mappingなし</option>`;
    const selectedMapping = mappings.find((mapping) => mapping.mappingId === previousTarget) || mappings[0] || null;
    safeState.targetMappingId = selectedMapping?.mappingId || "";
    if (els.safeChangeTarget.value !== safeState.targetMappingId) {
      els.safeChangeTarget.value = safeState.targetMappingId;
    }

    const properties = getSafeChangeEditableProperties(selectedMapping);
    els.safeChangeProperty.innerHTML = properties.length
      ? properties.map((property) => `<option value="${escapeAttr(property)}">${escapeHtml(property)}</option>`).join("")
      : `<option value="">変更可能Propertyなし</option>`;
    if (!properties.includes(safeState.property)) {
      safeState.property = properties[0] || "";
    }
    if (els.safeChangeProperty.value !== safeState.property) {
      els.safeChangeProperty.value = safeState.property;
    }
    if (els.safeChangeBeforeSource && els.safeChangeBeforeSource.value !== safeState.beforeSource) {
      els.safeChangeBeforeSource.value = safeState.beforeSource;
    }
    if (els.safeChangeIntent && els.safeChangeIntent.value !== safeState.intent) {
      els.safeChangeIntent.value = safeState.intent;
    }
    refreshSafeChangeBeforeFromObserved();
    renderSafeChangePreview();
  }

  function renderSafeChangePreview() {
    const safeState = state.analyzer.safeChange;
    if (els.safeChangeStatus) {
      els.safeChangeStatus.textContent = safeState.json ? "生成済み" : "未作成";
    }
    if (els.safeChangeMessage) {
      els.safeChangeMessage.textContent = safeState.message || "Confirmed Mappingを選ぶとInstructionを作成できます。";
      els.safeChangeMessage.dataset.status = safeState.status || "idle";
    }
    if (els.safeChangeJsonPreview) {
      els.safeChangeJsonPreview.textContent = safeState.json ? JSON.stringify(safeState.json, null, 2) : "未生成";
    }
    if (els.safeChangeSummaryPreview) {
      els.safeChangeSummaryPreview.textContent = safeState.summary || "未生成";
    }
    renderSafePatchPanel();
    renderWithAiSafeChangeShare();
  }

  function getSafeChangeEditableProperties(mapping) {
    if (!mapping) {
      return [];
    }
    const supported = new Set(["position", "size", "visibility", "text"]);
    const protectedProperties = new Set(mapping.protectedProperties || []);
    return (mapping.editableProperties || [])
      .filter((property) => supported.has(property) && !protectedProperties.has(property));
  }

  function handleSafeChangeTargetChange() {
    state.analyzer.safeChange.targetMappingId = els.safeChangeTarget?.value || "";
    state.analyzer.safeChange.property = "";
    state.analyzer.safeChange.json = null;
    state.analyzer.safeChange.summary = "";
    invalidateSafePatchReview("Safe Change Targetが変更されました。");
    renderSafeChangePanel();
  }

  function handleSafeChangePropertyChange() {
    state.analyzer.safeChange.property = els.safeChangeProperty?.value || "";
    state.analyzer.safeChange.json = null;
    state.analyzer.safeChange.summary = "";
    invalidateSafePatchReview("Safe Change Propertyが変更されました。");
    refreshSafeChangeBeforeFromObserved();
    renderSafeChangePreview();
  }

  function handleSafeChangeBeforeSourceChange() {
    state.analyzer.safeChange.beforeSource = els.safeChangeBeforeSource?.value || "observed";
    invalidateSafePatchReview("Safe Change Before Sourceが変更されました。");
    refreshSafeChangeBeforeFromObserved();
    renderSafeChangePreview();
  }

  function refreshSafeChangeBeforeFromObserved() {
    const safeState = state.analyzer.safeChange;
    const mapping = getSafeChangeSelectedMapping();
    const property = safeState.property;
    const beforeSource = els.safeChangeBeforeSource?.value || safeState.beforeSource || "observed";
    safeState.beforeSource = beforeSource;
    if (els.safeChangeBefore) {
      els.safeChangeBefore.readOnly = beforeSource === "observed";
    }
    if (!mapping || !property) {
      safeState.beforeText = "";
      if (els.safeChangeBefore) {
        els.safeChangeBefore.value = "";
      }
      return;
    }
    if (beforeSource !== "observed") {
      if (els.safeChangeBefore && els.safeChangeBefore.value !== safeState.beforeText) {
        els.safeChangeBefore.value = safeState.beforeText;
      }
      return;
    }
    const observed = getSafeChangeObservedBefore(mapping, property);
    safeState.beforeText = observed.ok ? JSON.stringify(observed.value, null, 2) : "";
    if (els.safeChangeBefore) {
      els.safeChangeBefore.value = safeState.beforeText;
    }
    if (observed.ok && !safeState.afterText && els.safeChangeAfter) {
      safeState.afterText = safeState.beforeText;
      els.safeChangeAfter.value = safeState.afterText;
    }
  }

  function getSafeChangeSelectedMapping() {
    const pageMeta = getAnalyzerManifestPageMeta();
    const mappings = getVisibleConfirmedMappings(pageMeta);
    const mappingId = state.analyzer.safeChange.targetMappingId || els.safeChangeTarget?.value || "";
    return mappings.find((mapping) => mapping.mappingId === mappingId) || null;
  }

  function getSafeChangeObservedBefore(mapping, property) {
    const element = findAnalyzerElementByDomRef(mapping.domRef);
    const node = resolveAnalyzerDomNode(mapping.domRef);
    if (!element && !node) {
      return { ok: false, reason: "missing-dom" };
    }
    const bounds = element?.observed?.bounds || getDomNodeBounds(node);
    if (property === "position") {
      if (!bounds) {
        return { ok: false, reason: "missing-bounds" };
      }
      return { ok: true, value: { x: bounds.x, y: bounds.y }, coordinateContext: "iframe-viewport-css-px" };
    }
    if (property === "size") {
      if (!bounds) {
        return { ok: false, reason: "missing-bounds" };
      }
      return { ok: true, value: { width: bounds.width, height: bounds.height }, coordinateContext: "iframe-viewport-css-px" };
    }
    if (property === "visibility") {
      const style = element?.observed?.style || (node ? node.ownerDocument.defaultView.getComputedStyle(node) : null);
      if (!style) {
        return { ok: false, reason: "missing-style" };
      }
      return { ok: true, value: { display: style.display, visibility: style.visibility, opacity: style.opacity } };
    }
    if (property === "text") {
      if (!node) {
        return { ok: false, reason: "missing-dom" };
      }
      return { ok: true, value: node.textContent || "" };
    }
    return { ok: false, reason: "unsupported-property" };
  }

  function findAnalyzerElementByDomRef(domRef) {
    if (!domRef || !state.analyzer.result?.elements) {
      return null;
    }
    return state.analyzer.result.elements.find((element) => element.observed?.domRef === domRef) || null;
  }

  function resolveAnalyzerDomNode(domRef) {
    const frame = state.existingWeb.active ? els.existingWebFrame : els.analyzerFrame;
    let doc;
    try {
      doc = frame?.contentDocument;
    } catch (error) {
      return null;
    }
    if (!doc || !domRef) {
      return null;
    }
    try {
      return doc.querySelector(domRef);
    } catch (error) {
      return null;
    }
  }

  function getDomNodeBounds(node) {
    if (!node || typeof node.getBoundingClientRect !== "function") {
      return null;
    }
    const rect = node.getBoundingClientRect();
    return {
      x: Math.round(rect.x * 100) / 100,
      y: Math.round(rect.y * 100) / 100,
      width: Math.round(rect.width * 100) / 100,
      height: Math.round(rect.height * 100) / 100,
    };
  }

  function generateSafeChangeInstruction() {
    const safeState = state.analyzer.safeChange;
    const mapping = getSafeChangeSelectedMapping();
    safeState.intent = els.safeChangeIntent?.value || "";
    safeState.property = els.safeChangeProperty?.value || "";
    safeState.beforeSource = els.safeChangeBeforeSource?.value || "observed";
    safeState.beforeText = els.safeChangeBefore?.value || "";
    safeState.afterText = els.safeChangeAfter?.value || "";
    safeState.json = null;
    safeState.summary = "";

    if (!window.TBalanceSafeChange?.buildSafeChangeInstruction) {
      setSafeChangeStatus("error", "Safe Change moduleを読み込めていません。");
      renderSafeChangePreview();
      return;
    }
    if (!mapping) {
      setSafeChangeStatus("error", "Confirmed Mappingを選択してください。");
      renderSafeChangePreview();
      return;
    }
    const beforeParsed = parseSafeChangeValue(safeState.beforeText, safeState.property, "before");
    const afterParsed = parseSafeChangeValue(safeState.afterText, safeState.property, "after");
    if (!beforeParsed.ok || !afterParsed.ok) {
      setSafeChangeStatus("error", [beforeParsed.error, afterParsed.error].filter(Boolean).join(" / "));
      renderSafeChangePreview();
      return;
    }
    const observed = getSafeChangeObservedBefore(mapping, safeState.property);
    const adapterMapping = getAdapterComponentMappingForSafeChange(mapping);
    const protectedBehavior = getAdapterProtectedBehaviorForSafeChange(mapping);
    const ambiguousMapping = isSafeChangeMappingAmbiguous(mapping) || adapterMapping?.status === "ambiguous";
    const result = window.TBalanceSafeChange.buildSafeChangeInstruction({
      projectId: getAnalyzerManifestPageMeta().projectId,
      sourcePath: mapping.page?.sourcePath || getAnalyzerManifestPageMeta().sourcePath,
      sourceAuthority: mapping.sourceAuthority || "standard-web",
      viewState: mapping.viewState || getAnalyzerManifestPageMeta().currentViewState,
      mapping,
      userIntent: safeState.intent,
      domResolved: Boolean(resolveAnalyzerDomNode(mapping.domRef)),
      ambiguousMapping,
      protectedBehavior,
      changes: [{
        property: safeState.property,
        before: beforeParsed.value,
        after: afterParsed.value,
        beforeSource: safeState.beforeSource,
        ...(observed.coordinateContext ? { coordinateContext: observed.coordinateContext } : {}),
      }],
    });
    if (!result.ok) {
      setSafeChangeStatus("error", result.errors.join(" / "));
      renderSafeChangePreview();
      return;
    }
    safeState.json = result.instruction;
    safeState.summary = result.summary;
    setSafeChangeStatus(result.warnings.length ? "warning" : "success", result.warnings.length ? result.warnings.join(" / ") : "Safe Change Instructionを生成しました。");
    renderSafeChangePreview();
  }

  function parseSafeChangeValue(text, property, label) {
    const raw = String(text || "");
    if (!raw.trim()) {
      return { ok: false, error: `${label}が空です。` };
    }
    if (property === "text") {
      try {
        return { ok: true, value: JSON.parse(raw) };
      } catch (error) {
        return { ok: true, value: raw };
      }
    }
    try {
      return { ok: true, value: JSON.parse(raw) };
    } catch (error) {
      return { ok: false, error: `${label}はJSONとして入力してください。` };
    }
  }

  function isSafeChangeMappingAmbiguous(mapping) {
    if (!mapping) {
      return false;
    }
    const pageMeta = getAnalyzerManifestPageMeta();
    return getVisibleConfirmedMappings(pageMeta).some((item) => {
      if (item.mappingId === mapping.mappingId) {
        return false;
      }
      const sameIdentity = (item.tbId && item.tbId === mapping.tbId) || (item.domRef && item.domRef === mapping.domRef);
      if (!sameIdentity) {
        return false;
      }
      const itemView = item.viewState || "";
      const mappingView = mapping.viewState || "";
      return itemView !== mappingView || itemView === pageMeta.currentViewState;
    });
  }

  function getAdapterComponentMappingForSafeChange(mapping) {
    const adapter = getActiveAnalyzerAdapter();
    if (!adapter || adapter.id === "none" || typeof adapter.getComponentMapping !== "function") {
      return null;
    }
    return adapter.getComponentMapping(mapping.pageId, mapping.tbId, {
      ...getAnalyzerAdapterContext(),
      viewState: mapping.viewState || getAnalyzerAdapterContext().viewState,
    });
  }

  function getAdapterProtectedBehaviorForSafeChange(mapping) {
    const adapter = getActiveAnalyzerAdapter();
    if (!adapter || adapter.id === "none" || typeof adapter.getProtectedBehavior !== "function") {
      return null;
    }
    return adapter.getProtectedBehavior(mapping.pageId, mapping.tbId, {
      ...getAnalyzerAdapterContext(),
      viewState: mapping.viewState || getAnalyzerAdapterContext().viewState,
    });
  }

  function setSafeChangeStatus(status, message) {
    state.analyzer.safeChange.status = status;
    state.analyzer.safeChange.message = message;
  }

  async function copySafeChangeJson() {
    const json = state.analyzer.safeChange.json;
    if (!json) {
      setSafeChangeStatus("error", "コピーするJSONがありません。");
      renderSafeChangePreview();
      return;
    }
    await copyTextToClipboard(JSON.stringify(json, null, 2), "Safe Change JSONをコピーしました。");
  }

  async function copySafeChangeSummary() {
    const summary = state.analyzer.safeChange.summary;
    if (!summary) {
      setSafeChangeStatus("error", "コピーするSummaryがありません。");
      renderSafeChangePreview();
      return;
    }
    await copyTextToClipboard(summary, "Safe Change Summaryをコピーしました。");
  }

  function clearSafeChangeInstruction() {
    state.analyzer.safeChange = {
      targetMappingId: state.analyzer.safeChange.targetMappingId,
      property: state.analyzer.safeChange.property,
      beforeSource: "observed",
      beforeText: "",
      afterText: "",
      intent: "",
      status: "idle",
      message: "Safe Change Instructionをクリアしました。",
      json: null,
      summary: "",
    };
    clearSafePatchCandidate(false);
    renderSafeChangePanel();
  }

  function renderSafePatchPanel() {
    const patchState = state.analyzer.safePatch;
    if (!els.safePatchStatus) {
      return;
    }
    const candidate = patchState.candidate;
    const reviewLabel = patchState.reviewStatus ? ` / ${patchState.reviewStatus}` : "";
    els.safePatchStatus.textContent = candidate ? `${candidate.status}${reviewLabel}` : "未作成";
    if (els.safePatchMessage) {
      els.safePatchMessage.textContent = patchState.message || "Safe Change Instructionを生成してからPatch Candidateを作成します。";
      els.safePatchMessage.dataset.status = patchState.reviewStatus || patchState.status || "idle";
    }
    if (els.safePatchSummaryPreview) {
      els.safePatchSummaryPreview.textContent = patchState.summary || "未生成";
    }
    if (els.safePatchJsonPreview) {
      els.safePatchJsonPreview.textContent = candidate ? JSON.stringify(candidate, null, 2) : "未生成";
    }
    if (els.safePatchDiffPreview) {
      els.safePatchDiffPreview.textContent = patchState.diffText || "未生成";
    }
    renderSafeApplyPanel();
  }

  function generateSafePatchCandidate() {
    const instruction = state.analyzer.safeChange.json;
    const mapping = instruction ? findMappingForSafePatchInstruction(instruction) : null;
    if (!window.TBalanceSafePatch?.buildPatchCandidate) {
      setSafePatchStatus("error", "Safe Patch moduleを読み込めていません。");
      renderSafePatchPanel();
      return null;
    }
    if (!instruction) {
      setSafePatchStatus("error", "先にSafe Change Instructionを生成してください。");
      renderSafePatchPanel();
      return null;
    }
    const change = instruction.changes?.[0] || null;
    const currentObserved = mapping && change ? getSafeChangeObservedBefore(mapping, change.property) : { ok: false, reason: "missing-mapping" };
    const sourceResolution = mapping && change
      ? resolveSafePatchSource(instruction, mapping, change)
      : { status: "unresolved", reason: "missing-mapping", message: "Confirmed Mappingが見つかりません。" };
    const adapterMapping = mapping ? getAdapterComponentMappingForSafeChange(mapping) : null;
    const result = window.TBalanceSafePatch.buildPatchCandidate({
      instruction,
      mapping,
      pageMeta: getAnalyzerManifestPageMeta(),
      domResolved: mapping ? Boolean(resolveAnalyzerDomNode(mapping.domRef)) : false,
      ambiguousMapping: Boolean(mapping && (isSafeChangeMappingAmbiguous(mapping) || adapterMapping?.status === "ambiguous")),
      currentObserved,
      sourceResolution,
    });
    state.analyzer.safePatch.candidate = result.candidate;
    state.analyzer.safePatch.diffText = result.diffText;
    state.analyzer.safePatch.summary = buildSafePatchSummary(result.candidate);
    state.analyzer.safePatch.signature = result.signature;
    state.analyzer.safePatch.reviewStatus = "pending";
    state.analyzer.safePatch.approvedSignature = "";
    clearSafeApplyState(false);
    setSafePatchStatus(result.ok ? "pending" : result.candidate.status, result.ok ? "Patch Candidateを生成しました。Applyは行いません。" : `Patch Candidate blocked: ${result.candidate.blockReason?.code || "unknown"}`);
    renderSafePatchPanel();
    return result;
  }

  function findMappingForSafePatchInstruction(instruction) {
    const target = instruction?.target || {};
    return state.analyzer.confirmedMappings.find((mapping) => (
      mapping.pageId === target.pageId
      && mapping.tbId === target.tbId
      && mapping.domRef === target.domRef
      && (mapping.viewState || "") === (target.viewState || "")
      && (mapping.page?.sourcePath || getAnalyzerManifestPageMeta().sourcePath || "") === (target.sourcePath || "")
    )) || null;
  }

  function approveSafePatchCandidate() {
    const patchState = state.analyzer.safePatch;
    if (!patchState.candidate) {
      setSafePatchStatus("error", "ApproveするPatch Candidateがありません。");
      renderSafePatchPanel();
      return;
    }
    if (patchState.candidate.status !== "ready-for-review") {
      setSafePatchStatus("blocked", "Blocked CandidateはApproveできません。");
      renderSafePatchPanel();
      return;
    }
    patchState.reviewStatus = "approved";
    patchState.approvedSignature = patchState.signature;
    patchState.candidate.review = {
      status: "approved",
      approvedAt: new Date().toISOString(),
      rejectedAt: null,
    };
    setSafePatchStatus("approved", "Patch Candidateを承認しました。v0.1ではファイルへ適用しません。");
    clearSafeApplyState(false);
    renderSafePatchPanel();
  }

  function rejectSafePatchCandidate() {
    const patchState = state.analyzer.safePatch;
    if (!patchState.candidate) {
      setSafePatchStatus("error", "RejectするPatch Candidateがありません。");
      renderSafePatchPanel();
      return;
    }
    patchState.reviewStatus = "rejected";
    patchState.approvedSignature = "";
    patchState.candidate.review = {
      status: "rejected",
      approvedAt: null,
      rejectedAt: new Date().toISOString(),
    };
    setSafePatchStatus("rejected", "Patch CandidateをRejectしました。");
    clearSafeApplyState(false);
    renderSafePatchPanel();
  }

  async function copySafePatchCandidate() {
    const candidate = state.analyzer.safePatch.candidate;
    if (!candidate) {
      setSafePatchStatus("error", "コピーするPatch Candidateがありません。");
      renderSafePatchPanel();
      return;
    }
    await copyTextToClipboard(JSON.stringify(candidate, null, 2), "Patch Candidate JSONをコピーしました。");
  }

  async function copySafePatchDiff() {
    const diffText = state.analyzer.safePatch.diffText;
    if (!diffText) {
      setSafePatchStatus("error", "コピーするDiffがありません。");
      renderSafePatchPanel();
      return;
    }
    await copyTextToClipboard(diffText, "Patch Candidate Diffをコピーしました。");
  }

  function clearSafePatchCandidate(render = true) {
    state.analyzer.safePatch = {
      status: "idle",
      message: "Patch Candidateをクリアしました。",
      candidate: null,
      diffText: "",
      summary: "",
      signature: "",
      reviewStatus: "",
      approvedSignature: "",
    };
    clearSafeApplyState(false);
    if (render) {
      renderSafePatchPanel();
    }
  }

  function invalidateSafePatchReview(message) {
    const patchState = state.analyzer.safePatch;
    if (!patchState.candidate || patchState.reviewStatus !== "approved") {
      return;
    }
    patchState.reviewStatus = "pending";
    patchState.approvedSignature = "";
    patchState.candidate.review = {
      status: "pending",
      approvedAt: null,
      rejectedAt: null,
    };
    setSafePatchStatus("pending", message || "Patch Candidateが変更されたため承認をpendingに戻しました。");
    clearSafeApplyState(false);
    renderSafePatchPanel();
  }

  function setSafePatchStatus(status, message) {
    state.analyzer.safePatch.status = status;
    state.analyzer.safePatch.message = message;
  }

  function renderSafeApplyPanel() {
    const applyState = state.analyzer.safeApply;
    if (!els.safeApplyStatus) {
      return;
    }
    els.safeApplyStatus.textContent = applyState.status === "idle" ? "未実行" : applyState.status;
    if (els.safeApplyMessage) {
      els.safeApplyMessage.textContent = applyState.message || "Approved Candidateだけ実Sourceへ適用できます。";
      els.safeApplyMessage.dataset.status = applyState.status || "idle";
    }
    if (els.safeApplyDiffPreview) {
      els.safeApplyDiffPreview.textContent = applyState.diffText || "未生成";
    }
    if (els.safeApplyResultPreview) {
      els.safeApplyResultPreview.textContent = applyState.result ? JSON.stringify(applyState.result, null, 2) : "未生成";
    }
    if (els.applySafePatchCandidate) {
      els.applySafePatchCandidate.disabled = !(applyState.preflight?.ok && applyState.status === "ready-to-apply");
    }
    renderSafeWorkflowPanel();
  }

  function getSafeApplyClient() {
    return window.TBalanceSafeApply?.createSourceWriterClient?.({ baseUrl: SOURCE_WRITER_URL }) || null;
  }

  async function runSafeApplyPreflight() {
    if (!window.TBalanceSafeApply?.runApplyPreflight) {
      setSafeApplyStatus("failed", "Safe Apply moduleを読み込めていません。");
      renderSafeApplyPanel();
      return null;
    }
    const client = getSafeApplyClient();
    if (!client) {
      setSafeApplyStatus("failed", "Source Writer Clientを作成できません。");
      renderSafeApplyPanel();
      return null;
    }
    setSafeApplyStatus("checking", "Safe Apply Preflightを確認中です。");
    renderSafeApplyPanel();
    const result = await window.TBalanceSafeApply.runApplyPreflight({
      candidate: state.analyzer.safePatch.candidate,
      approvedSignature: state.analyzer.safePatch.approvedSignature,
      sourceWriterClient: client,
      createSignature: window.TBalanceSafePatch?.createCandidateSignature,
    });
    state.analyzer.safeApply.preflight = result.ok ? result : null;
    state.analyzer.safeApply.result = result;
    state.analyzer.safeApply.diffText = result.diffText || "";
    setSafeApplyStatus(result.status || "failed", result.message || "Preflightを完了しました。");
    renderSafeApplyPanel();
    return result;
  }

  async function applySafePatchCandidate() {
    const preflight = state.analyzer.safeApply.preflight;
    if (!preflight?.ok) {
      setSafeApplyStatus("preflight-blocked", "先にApply Preflightを成功させてください。");
      renderSafeApplyPanel();
      return null;
    }
    const change = preflight.sourceChange || {};
    const ok = window.confirm([
      "SAFE APPLY",
      "",
      "この変更は実Source Fileを書き換えます。",
      "",
      `File: ${preflight.source?.path || "-"}`,
      `Selector: ${change.selector || "-"}`,
      `Property: ${change.property || "-"}`,
      "",
      `${change.before} -> ${change.after}`,
      "",
      "この変更を適用しますか？",
    ].join("\n"));
    if (!ok) {
      const cancelled = {
        ok: false,
        safeApplyVersion: "0.1",
        status: "cancelled",
        message: "UserがSafe Applyをキャンセルしました。Source Writer Writeは呼び出していません。",
        candidateSignature: preflight.candidateSignature,
        policy: {
          gitCommitPerformed: false,
          pushPerformed: false,
          publishPerformed: false,
          automaticApplyAllowed: false,
        },
      };
      state.analyzer.safeApply.result = cancelled;
      setSafeApplyStatus("cancelled", cancelled.message);
      renderSafeApplyPanel();
      return cancelled;
    }
    const client = getSafeApplyClient();
    setSafeApplyStatus("applying", "Source Writer Bridge経由で実Sourceへ適用中です。");
    renderSafeApplyPanel();
    const result = await window.TBalanceSafeApply.applyApprovedCandidate({
      preflight,
      sourceWriterClient: client,
    });
    state.analyzer.safeApply.result = result;
    state.analyzer.safeApply.preflight = null;
    setSafeApplyStatus(result.status || "failed", result.message || "Safe Applyを完了しました。");
    renderSafeApplyPanel();
    return result;
  }

  function clearSafeApplyState(render = true) {
    state.analyzer.safeApply = {
      status: "idle",
      message: "Safe Applyをクリアしました。",
      preflight: null,
      result: null,
      diffText: "",
    };
    if (render) {
      renderSafeApplyPanel();
    }
  }

  function setSafeApplyStatus(status, message) {
    state.analyzer.safeApply.status = status;
    state.analyzer.safeApply.message = message;
  }

  function renderSafeWorkflowPanel() {
    if (!els.safeWorkflowPanel || !window.TBalanceSafeWorkflow?.buildSafeWorkflowState) {
      return;
    }
    const pageMeta = getAnalyzerManifestPageMeta();
    const workflow = window.TBalanceSafeWorkflow.buildSafeWorkflowState({
      analyzer: state.analyzer,
      pageMeta,
      selectedElement: getAnalyzerSelectedElement(),
      selectedMapping: getSafeChangeSelectedMapping(),
      visibleMappings: getVisibleConfirmedMappings(pageMeta),
      adapter: getActiveAnalyzerAdapter(),
      manifest: {
        projectId: pageMeta.projectId,
        pageId: pageMeta.pageId,
        sourcePath: pageMeta.sourcePath,
        viewState: pageMeta.currentViewState,
      },
    });
    els.safeWorkflowPanel.dataset.currentStep = workflow.currentStep || "";
    if (els.safeWorkflowContext) {
      const target = workflow.target || {};
      els.safeWorkflowContext.textContent = [
        `Adapter: ${workflow.context?.adapterLabel || "None"}`,
        target.pageId ? `Page: ${target.pageId}` : "",
        target.viewState ? `View: ${target.viewState}` : "",
      ].filter(Boolean).join(" / ");
    }
    if (els.safeWorkflowOverall) {
      els.safeWorkflowOverall.textContent = formatWorkflowStatus(workflow.overallStatus);
      els.safeWorkflowOverall.dataset.status = workflow.overallStatus || "not-ready";
    }
    renderSafeWorkflowSteps(workflow);
    if (els.safeWorkflowTarget) {
      const target = workflow.target || {};
      els.safeWorkflowTarget.textContent = target.hasConfirmedMapping
        ? `${target.tbId || "-"} / ${target.domRef || "-"}`
        : (target.domRef || target.selectedLabel || "Not selected");
      els.safeWorkflowTarget.title = [
        target.pageId,
        target.sourcePath,
        target.viewState,
        target.tbId,
        target.domRef,
      ].filter(Boolean).join(" / ");
    }
    if (els.safeWorkflowChange) {
      const change = workflow.change || {};
      els.safeWorkflowChange.textContent = change.property
        ? `${change.property}: ${shortWorkflowValue(change.before)} -> ${shortWorkflowValue(change.after)}`
        : (change.intent || "未作成");
      els.safeWorkflowChange.title = change.intent || "";
    }
    if (els.safeWorkflowReview) {
      const review = workflow.review || {};
      els.safeWorkflowReview.textContent = [
        review.status ? formatWorkflowStatus(review.status) : "未作成",
        review.reviewStatus ? `/ ${review.reviewStatus}` : "",
        review.reason ? `/ ${review.reason}` : "",
      ].join(" ").replace(/\s+/g, " ").trim();
      els.safeWorkflowReview.title = [review.source, review.change, review.message].filter(Boolean).join("\n");
    }
    if (els.safeWorkflowApply) {
      const apply = workflow.apply || {};
      els.safeWorkflowApply.textContent = `${formatWorkflowStatus(apply.status || "idle")} / Preflight: ${apply.preflight || "Not yet"}`;
      els.safeWorkflowApply.title = apply.message || "";
    }
    if (els.safeWorkflowNextAction) {
      els.safeWorkflowNextAction.textContent = workflow.nextAction?.message || "";
      els.safeWorkflowNextAction.dataset.status = workflow.steps?.[workflow.currentStep]?.status || "";
    }
  }

  function renderSafeWorkflowSteps(workflow) {
    if (!els.safeWorkflowSteps) {
      return;
    }
    els.safeWorkflowSteps.querySelectorAll("[data-workflow-step]").forEach((button) => {
      const key = button.dataset.workflowStep || "";
      const step = workflow.steps?.[key] || {};
      const marker = getWorkflowStatusMarker(step.status);
      button.textContent = `${marker} ${buttonTextWorkflowStep(key)}`;
      button.dataset.status = step.status || "not-ready";
      button.dataset.current = String(workflow.currentStep === key);
      button.title = step.reason ? `${step.reason}: ${step.message || ""}` : (step.message || "");
    });
  }

  function handleSafeWorkflowStepClick(event) {
    const step = event.target.closest("[data-workflow-step]")?.dataset.workflowStep;
    if (!step) {
      return;
    }
    focusSafeWorkflowPanel(step);
  }

  function handleSafeWorkflowFocusClick(event) {
    const focus = event.target.closest("[data-workflow-focus]")?.dataset.workflowFocus;
    if (!focus) {
      return;
    }
    if (focus === "with-ai") {
      if (!state.aiCollab) {
        toggleAiCollab();
      }
      els.aiCollabPanel?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
      return;
    }
    focusSafeWorkflowPanel(focus);
  }

  function focusSafeWorkflowPanel(step) {
    if (step === "analyze") {
      els.analyzerPath?.focus();
      return;
    }
    const targetStep = step === "confirm" ? "confirm" : step;
    const panel = els.analyzerPanel?.querySelector?.(`[data-workflow-panel="${targetStep}"]`);
    panel?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
    const firstField = panel?.querySelector?.("button, input, select, textarea");
    firstField?.focus?.({ preventScroll: true });
  }

  function buttonTextWorkflowStep(step) {
    const labels = {
      analyze: "1 Analyze",
      confirm: "2 Confirm",
      change: "3 Change",
      review: "4 Review",
      apply: "5 Apply",
    };
    return labels[step] || step;
  }

  function getWorkflowStatusMarker(status) {
    if (status === "complete") {
      return "✓";
    }
    if (status === "blocked") {
      return "!";
    }
    if (status === "current") {
      return "●";
    }
    if (status === "ready") {
      return "○";
    }
    return "–";
  }

  function formatWorkflowStatus(status) {
    const labels = {
      idle: "Idle",
      "not-ready": "Not Ready",
      ready: "Ready",
      current: "Current",
      complete: "Complete",
      blocked: "Blocked",
      applied: "Applied",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      cancelled: "Cancelled",
      "ready-for-review": "Ready for Review",
      "ready-to-apply": "Ready to Apply",
    };
    return labels[status] || status || "Not Ready";
  }

  function shortWorkflowValue(value) {
    const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
    return text.length > 36 ? `${text.slice(0, 33)}...` : text;
  }

  function buildSafePatchSummary(candidate) {
    if (!candidate) {
      return "";
    }
    const target = candidate.target || {};
    const lines = [
      `Status: ${candidate.status}`,
      `Target: ${target.pageId || "-"} / ${target.sourcePath || "-"}${target.viewState ? ` / ${target.viewState}` : ""} / ${target.tbId || "-"}`,
      `DOM: ${target.domRef || "-"}`,
      `Intent: ${candidate.userIntent || "-"}`,
    ];
    if (candidate.blockReason) {
      lines.push(`Block: ${candidate.blockReason.code} / ${candidate.blockReason.message}`);
    }
    if (candidate.semanticDiff?.length) {
      lines.push("Semantic Diff:");
      candidate.semanticDiff.forEach((change) => {
        lines.push(`- ${change.property}: ${JSON.stringify(change.before)} -> ${JSON.stringify(change.after)} (${change.beforeSource})`);
      });
    }
    if (candidate.operations?.length) {
      lines.push("Source Change:");
      candidate.operations.forEach((operation) => {
        const sourceRef = operation.sourceRef || operation.source || {};
        lines.push(`- ${sourceRef.sourcePath || sourceRef.path || "-"} :: ${sourceRef.selector || "-"} { ${operation.property}: ${JSON.stringify(operation.before)} -> ${JSON.stringify(operation.after)} }`);
      });
    }
    if (candidate.doNotChange?.length) {
      lines.push("Do Not Change:");
      candidate.doNotChange.forEach((item) => {
        lines.push(`- ${item.type}: ${item.name || item.behaviorRef || item.description || "protected"}`);
      });
    }
    return lines.join("\n");
  }

  function resolveSafePatchSource(instruction, mapping, change) {
    const node = resolveAnalyzerDomNode(mapping.domRef);
    if (!node) {
      return { status: "unresolved", reason: "missing-dom", message: "対象DOMが見つかりません。" };
    }
    const property = change.property;
    if (!["position", "size", "visibility"].includes(property)) {
      return { status: "unsupported", reason: "unsupported-property", message: `"${property}" はSafe Patch v0.1のCSS宣言候補化では未対応です。` };
    }
    const declarations = getPatchCssDeclarationsForChange(property, change);
    if (!declarations.length) {
      return { status: "unsupported", reason: "unsupported-property", message: `"${property}" をCSS宣言へ安全に変換できません。` };
    }
    if (hasUnsafeLayoutDependency(node, declarations)) {
      return { status: "unresolved", reason: "layout-dependency", message: "flex/grid/transform等のLayout依存があるためv0.1ではPatch化しません。" };
    }
    const operations = [];
    for (const declaration of declarations) {
      const source = findUniqueCssDeclarationSource(node, declaration.cssProperty);
      if (source.status !== "resolved") {
        return source;
      }
      const operation = buildCssPatchOperation(instruction, mapping, change, declaration, source);
      if (!operation) {
        return { status: "unresolved", reason: "source-location-unresolved", message: `${declaration.cssProperty} の変更値を作れません。` };
      }
      operations.push(operation);
    }
    return {
      status: "resolved",
      sourceLocation: operations.map((operation) => operation.sourceRef),
      operations,
    };
  }

  function getPatchCssDeclarationsForChange(property, change) {
    if (property === "position") {
      const before = change.before || {};
      const after = change.after || {};
      const declarations = [];
      if (Number.isFinite(Number(before.x)) && Number.isFinite(Number(after.x)) && Number(before.x) !== Number(after.x)) {
        declarations.push({ cssProperty: "left", delta: Number(after.x) - Number(before.x), unit: "px" });
      }
      if (Number.isFinite(Number(before.y)) && Number.isFinite(Number(after.y)) && Number(before.y) !== Number(after.y)) {
        declarations.push({ cssProperty: "top", delta: Number(after.y) - Number(before.y), unit: "px" });
      }
      return declarations;
    }
    if (property === "size") {
      const before = change.before || {};
      const after = change.after || {};
      const declarations = [];
      if (Number.isFinite(Number(after.width)) && Number(before.width) !== Number(after.width)) {
        declarations.push({ cssProperty: "width", exactValue: `${Number(after.width)}px` });
      }
      if (Number.isFinite(Number(after.height)) && Number(before.height) !== Number(after.height)) {
        declarations.push({ cssProperty: "height", exactValue: `${Number(after.height)}px` });
      }
      return declarations;
    }
    if (property === "visibility") {
      const before = change.before || {};
      const after = change.after || {};
      return ["display", "visibility", "opacity"]
        .filter((cssProperty) => Object.prototype.hasOwnProperty.call(after, cssProperty) && before[cssProperty] !== after[cssProperty])
        .map((cssProperty) => ({ cssProperty, exactValue: String(after[cssProperty]) }));
    }
    return [];
  }

  function hasUnsafeLayoutDependency(node, declarations) {
    const win = node.ownerDocument.defaultView;
    const style = win.getComputedStyle(node);
    const parentStyle = node.parentElement ? win.getComputedStyle(node.parentElement) : null;
    const declarationNames = new Set(declarations.map((item) => item.cssProperty));
    if (style.transform && style.transform !== "none" && (declarationNames.has("left") || declarationNames.has("top"))) {
      return true;
    }
    if (parentStyle && ["flex", "inline-flex", "grid", "inline-grid"].includes(parentStyle.display)) {
      return true;
    }
    return false;
  }

  function findUniqueCssDeclarationSource(node, cssProperty) {
    const candidates = [];
    const inlineValue = node.style?.getPropertyValue(cssProperty);
    if (inlineValue) {
      candidates.push({
        kind: "inline-style",
        path: getAnalyzerManifestPageMeta().sourcePath,
        selector: getInlinePatchSelector(node),
        property: cssProperty,
        value: inlineValue.trim(),
        priority: node.style.getPropertyPriority(cssProperty) || "",
      });
    }
    candidates.push(...findStylesheetDeclarationSources(node, cssProperty));
    if (candidates.length === 1) {
      return { status: "resolved", source: candidates[0] };
    }
    if (candidates.length > 1) {
      return {
        status: "multiple",
        reason: "multiple-source-candidates",
        message: `${cssProperty} のCSS宣言候補が複数あります。`,
        candidates,
      };
    }
    return {
      status: "unresolved",
      reason: "source-location-unresolved",
      message: `${cssProperty} の直接CSS宣言を見つけられません。`,
    };
  }

  function findStylesheetDeclarationSources(node, cssProperty) {
    const doc = node.ownerDocument;
    const sources = [];
    Array.from(doc.styleSheets || []).forEach((sheet) => {
      let rules;
      try {
        rules = Array.from(sheet.cssRules || []);
      } catch (error) {
        return;
      }
      collectCssRuleDeclarationSources(rules, node, cssProperty, sheet, sources);
    });
    return sources;
  }

  function collectCssRuleDeclarationSources(rules, node, cssProperty, sheet, sources, mediaText = "") {
    rules.forEach((rule) => {
      if (rule.type === CSSRule.MEDIA_RULE || rule.type === CSSRule.SUPPORTS_RULE) {
        collectCssRuleDeclarationSources(Array.from(rule.cssRules || []), node, cssProperty, sheet, sources, rule.conditionText || rule.media?.mediaText || mediaText);
        return;
      }
      if (!rule.selectorText || !rule.style || !rule.style.getPropertyValue(cssProperty)) {
        return;
      }
      let matches = false;
      try {
        matches = node.matches(rule.selectorText);
      } catch (error) {
        matches = false;
      }
      if (!matches) {
        return;
      }
      sources.push({
        kind: "stylesheet-rule",
        path: getStylesheetSourcePath(sheet),
        selector: rule.selectorText,
        property: cssProperty,
        value: rule.style.getPropertyValue(cssProperty).trim(),
        priority: rule.style.getPropertyPriority(cssProperty) || "",
        media: mediaText || "",
      });
    });
  }

  function buildCssPatchOperation(instruction, mapping, change, declaration, sourceResult) {
    const source = sourceResult.source;
    const before = source.value;
    let after = declaration.exactValue;
    if (!after && Number.isFinite(Number(declaration.delta))) {
      const parsed = parseCssPxValue(before);
      if (!parsed.ok) {
        return null;
      }
      after = `${roundPatchNumber(parsed.value + declaration.delta)}${parsed.unit}`;
    }
    if (before === after) {
      return null;
    }
    return {
      type: "set-css-declaration",
      target: {
        pageId: instruction.target.pageId,
        sourcePath: instruction.target.sourcePath,
        viewState: instruction.target.viewState || "",
        tbId: mapping.tbId,
        domRef: mapping.domRef,
      },
      sourceRef: {
        sourceType: source.kind,
        sourcePath: source.path,
        selector: source.selector,
        property: declaration.cssProperty,
        currentValue: before,
        media: source.media || null,
      },
      source: {
        kind: source.kind,
        path: source.path,
        selector: source.selector,
        media: source.media || "",
      },
      property: declaration.cssProperty,
      before,
      after,
      priority: source.priority || "",
    };
  }

  function getInlinePatchSelector(node) {
    if (node.id) {
      return `#${node.id}`;
    }
    return getSafeChangeSelectedMapping()?.domRef || getDomPathSelector(node);
  }

  function getDomPathSelector(node) {
    const parts = [];
    let current = node;
    while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 4) {
      let label = current.tagName.toLowerCase();
      if (current.classList?.length) {
        label += `.${Array.from(current.classList).slice(0, 2).join(".")}`;
      }
      parts.unshift(label);
      current = current.parentElement;
    }
    return parts.join(" > ");
  }

  function getStylesheetSourcePath(sheet) {
    if (!sheet.href) {
      return "inline-style-block";
    }
    try {
      const pageUrl = new URL(state.analyzer.effectiveUrl || state.analyzer.loadedPath || window.location.href, window.location.href);
      const sheetUrl = new URL(sheet.href, pageUrl);
      if (sheetUrl.origin === pageUrl.origin) {
        return decodeURIComponent(sheetUrl.pathname).replace(/^\/+/, "") || sheetUrl.href;
      }
      return sheetUrl.href;
    } catch (error) {
      return sheet.href;
    }
  }

  function parseCssPxValue(value) {
    const match = String(value || "").trim().match(/^(-?\d+(?:\.\d+)?)(px)$/i);
    if (!match) {
      return { ok: false };
    }
    return { ok: true, value: Number(match[1]), unit: match[2] };
  }

  function roundPatchNumber(value) {
    return Math.round(Number(value) * 1000) / 1000;
  }

  function confirmSelectedMapping() {
    const element = getAnalyzerSelectedElement();
    if (!element) {
      setAnalyzerStatus("error", "Mapping対象のElementを選択してください。");
      return;
    }
    const candidate = buildMappingCandidate(element);
    const tbId = sanitizeTbId(els.mappingCandidatePanel?.querySelector("#mappingTbId")?.value || candidate.tbId);
    const role = (els.mappingCandidatePanel?.querySelector("#mappingRole")?.value || candidate.role || "visual").trim();
    const domRef = els.mappingCandidatePanel?.querySelector("#mappingDomRef")?.value || candidate.domRef;
    const selectorQuality = els.mappingCandidatePanel?.querySelector("#mappingSelectorQuality")?.value || candidate.selectorQuality;
    const behaviorRefInput = (els.mappingCandidatePanel?.querySelector("#mappingBehaviorRef")?.value || "").trim();
    const pageMeta = getAnalyzerManifestPageMeta();
    const mapping = {
      mappingId: `mapping_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      pageId: pageMeta.pageId,
      page: {
        path: state.analyzer.result?.page?.path || state.analyzer.effectiveUrl || state.analyzer.loadedPath || "",
        sourcePath: pageMeta.sourcePath,
        viewState: pageMeta.currentViewState,
      },
      sourceAuthority: "standard-web",
      tbId,
      domRef,
      selectorQuality,
      role,
      editableProperties: getCheckedMappingValues("editable"),
      protectedProperties: getCheckedMappingValues("protected"),
      behaviorRef: behaviorRefInput || null,
      viewState: pageMeta.currentViewState || "",
      analyzer: {
        candidateId: element.candidateId,
        statusAtConfirmation: element.inferred.analysisStatus,
      },
      confirmed: true,
      confirmedBy: "user",
      confirmedAt: new Date().toISOString(),
    };
    if (!mapping.domRef) {
      state.analyzer.mappingWarning = "DOM Mappingが不明です。Needs Reviewとして扱ってください。";
      renderMappingCandidate(element);
      setAnalyzerStatus("error", state.analyzer.mappingWarning);
      return;
    }
    const duplicateWarnings = getMappingDuplicateWarnings(mapping);
    if (duplicateWarnings.length) {
      state.analyzer.mappingWarning = duplicateWarnings.join(" / ");
      renderMappingCandidate(element);
      setAnalyzerStatus("error", `Mapping重複: ${state.analyzer.mappingWarning}`);
      return;
    }
    const scopeWarnings = getMappingScopeWarnings(mapping);
    state.analyzer.confirmedMappings.push(mapping);
    state.analyzer.mappingWarning = scopeWarnings.join(" / ");
    setAnalyzerStatus("success", `Confirmed Mappingを追加しました: ${mapping.tbId}${scopeWarnings.length ? ` / Warning: ${scopeWarnings.join(" / ")}` : ""}`);
    renderAnalyzerResult();
  }

  function getCheckedMappingValues(group) {
    return Array.from(els.mappingCandidatePanel?.querySelectorAll(`input[name="mapping-${group}"]:checked`) || [])
      .map((input) => input.value);
  }

  function buildMappingCandidate(element) {
    const status = element.inferred.analysisStatus || "unknown";
    const domRef = element.observed.domRef || "";
    return {
      tbId: suggestMappingTbId(element),
      domRef,
      selectorQuality: getSelectorQuality(domRef),
      role: element.inferred.roleCandidate || element.inferred.componentCandidate || "visual",
      editableProperties: getDefaultEditableProperties(element),
      protectedProperties: getDefaultProtectedProperties(element),
      behaviorRef: status === "behavior-analysis-required" ? "unknown" : null,
    };
  }

  function suggestMappingTbId(element) {
    const observed = element.observed || {};
    const raw = observed.id
      || (observed.className || "").split(/\s+/).find(Boolean)
      || element.inferred.componentCandidate
      || element.inferred.roleCandidate
      || observed.tag
      || "element";
    const base = sanitizeTbId(raw);
    const pageMeta = getAnalyzerManifestPageMeta();
    const used = new Set(state.analyzer.confirmedMappings
      .filter((mapping) => mapping.pageId === pageMeta.pageId && (mapping.viewState || "") === (pageMeta.currentViewState || ""))
      .map((mapping) => mapping.tbId));
    if (!used.has(base)) {
      return base;
    }
    let index = 2;
    while (used.has(`${base}-${index}`)) {
      index += 1;
    }
    return `${base}-${index}`;
  }

  function sanitizeTbId(value) {
    const fallback = "element";
    const normalized = String(value || fallback)
      .trim()
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return normalized || fallback;
  }

  function getSelectorQuality(domRef) {
    const value = String(domRef || "");
    if (!value) {
      return "fragile";
    }
    if (/^#[A-Za-z_][\w-]*$/.test(value) || /^\[(data-testid|data-test|aria-label)=/.test(value)) {
      return "stable";
    }
    if (/nth-of-type|nth-child|\s>\s|^\w+$/.test(value)) {
      return "fragile";
    }
    return "acceptable";
  }

  function getDefaultEditableProperties(element) {
    const status = element.inferred.analysisStatus || "unknown";
    const role = element.inferred.roleCandidate || "";
    const values = ["position", "size", "visibility"];
    if (role === "text" || element.observed.textExists) {
      values.push("text");
    }
    if (status === "safe-visual-edit") {
      values.push("style");
    }
    if (status === "behavior-analysis-required") {
      values.push("hitArea");
    }
    return Array.from(new Set(values));
  }

  function getDefaultProtectedProperties(element) {
    const status = element.inferred.analysisStatus || "unknown";
    const role = element.inferred.roleCandidate || "";
    const values = [];
    if (status === "behavior-analysis-required") {
      values.push("behavior");
    }
    if (["link", "button", "form-control"].includes(role)) {
      values.push("navigation", "formFlow");
    }
    if (status === "layout-dependency") {
      values.push("structure");
    }
    if (element.inferred.possibleBehavior && element.inferred.possibleBehavior !== "unknown") {
      values.push("behavior");
    }
    return Array.from(new Set(values));
  }

  function getMappingDuplicateWarnings(mapping) {
    const pageKey = mapping.pageId || getAnalyzerManifestPageMeta().pageId;
    const viewState = mapping.viewState || "";
    const mappings = state.analyzer.confirmedMappings.filter((item) => item.pageId === pageKey && (item.viewState || "") === viewState);
    const warnings = [];
    if (mapping.tbId && mappings.some((item) => item.tbId === mapping.tbId)) {
      warnings.push(`tbId "${mapping.tbId}" は同一Pageで使用済みです`);
    }
    if (mapping.domRef && mappings.some((item) => item.domRef === mapping.domRef)) {
      warnings.push(`DOM "${mapping.domRef}" は既にMapping済みです`);
    }
    return warnings;
  }

  function getMappingScopeWarnings(mapping) {
    const pageKey = mapping.pageId || getAnalyzerManifestPageMeta().pageId;
    const viewState = mapping.viewState || "";
    const mappings = state.analyzer.confirmedMappings.filter((item) => item.pageId === pageKey);
    const warnings = [];
    const commonConflict = mappings.find((item) => {
      const itemViewState = item.viewState || "";
      if (itemViewState === viewState) {
        return false;
      }
      if (itemViewState && viewState) {
        return false;
      }
      return (mapping.tbId && item.tbId === mapping.tbId) || (mapping.domRef && item.domRef === mapping.domRef);
    });
    if (commonConflict) {
      warnings.push("共通MappingとView専用Mappingに同じtbIdまたはDOMがあります。v0.1では上書きせず両方保持します");
    }
    return warnings;
  }

  function getAnalyzerPageKey() {
    const result = state.analyzer.result;
    const page = result?.page || {};
    return [
      page.sourcePath || state.analyzer.sourcePath || page.path || state.analyzer.effectiveUrl || state.analyzer.loadedPath || "unknown-page",
      page.viewState || state.analyzer.viewState || "",
    ].filter(Boolean).join("?");
  }

  function getAnalyzerManifestPageMeta() {
    const result = state.analyzer.result;
    const page = result?.page || {};
    const sourcePath = page.sourcePath || state.analyzer.sourcePath || (state.existingWeb.active ? state.existingWeb.sourcePath : "") || deriveSourcePathFromAnalyzer();
    const currentViewState = page.viewState || state.analyzer.viewState || "";
    const knownPage = findKnownPageBySourcePath(sourcePath);
    const candidatePageId = knownPage?.pageId || state.existingWeb.pageId || suggestManifestPageId(sourcePath || state.analyzer.loadedKind || "page");
    const pageId = sanitizeManifestId(els.manifestPageId?.value || state.analyzer.manifestPageId || candidatePageId, candidatePageId);
    const projectId = sanitizeManifestId(els.manifestProjectId?.value || state.analyzer.manifestProjectId || "sample-project", "sample-project");
    return {
      runtimeKey: getAnalyzerPageKey(),
      projectId,
      pageId,
      sourcePath: sourcePath || "unknown.html",
      currentViewState,
      sourceAuthority: "standard-web",
    };
  }

  function deriveSourcePathFromAnalyzer() {
    if (state.analyzer.loadedKind === "generic-test") {
      return "generic-test";
    }
    const raw = state.analyzer.sourcePath || state.analyzer.loadedPath || state.analyzer.effectiveUrl || "";
    if (!raw) {
      return "";
    }
    try {
      const url = new URL(raw, window.location.href);
      return url.pathname.split("/").filter(Boolean).pop() || "index.html";
    } catch (error) {
      return String(raw).split("?")[0].split("#")[0] || "unknown.html";
    }
  }

  function suggestManifestPageId(sourcePath) {
    const rawName = String(sourcePath || "page")
      .split("?")[0]
      .split("#")[0]
      .split(/[\\/]/)
      .pop()
      .replace(/\.[^.]+$/, "");
    return sanitizeManifestId(`page-${rawName || "page"}`, "page-home");
  }

  function sanitizeManifestId(value, fallback) {
    const normalized = String(value || fallback || "id")
      .trim()
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return normalized || fallback || "id";
  }

  function syncManifestInputsToAnalyzerPage() {
    const sourcePath = deriveSourcePathFromAnalyzer();
    const knownPage = findKnownPageBySourcePath(sourcePath);
    const pageId = knownPage?.pageId || suggestManifestPageId(sourcePath || state.analyzer.loadedKind || "page");
    if (els.manifestPageId) {
      els.manifestPageId.value = pageId;
    }
    state.analyzer.manifestPageId = pageId;
    if (els.manifestProjectId && !els.manifestProjectId.value) {
      els.manifestProjectId.value = state.analyzer.manifestProjectId || "sample-project";
    }
  }

  function getVisibleConfirmedMappings(pageMeta = getAnalyzerManifestPageMeta()) {
    return state.analyzer.confirmedMappings.filter((mapping) => {
      if (mapping.pageId !== pageMeta.pageId) {
        return false;
      }
      const mappingViewState = mapping.viewState || "";
      return !mappingViewState || mappingViewState === pageMeta.currentViewState;
    });
  }

  function renderManifestPanel() {
    if (!els.manifestMappingCount) {
      return;
    }
    const pageMeta = getAnalyzerManifestPageMeta();
    const mappings = getVisibleConfirmedMappings(pageMeta);
    els.manifestMappingCount.textContent = `${mappings.length}件`;
    if (els.manifestProjectId && els.manifestProjectId.value !== pageMeta.projectId) {
      els.manifestProjectId.value = pageMeta.projectId;
    }
    if (els.manifestPageId && els.manifestPageId.value !== pageMeta.pageId) {
      els.manifestPageId.value = pageMeta.pageId;
    }
    if (els.manifestStatus && state.analyzer.manifestWarning) {
      els.manifestStatus.textContent = state.analyzer.manifestWarning;
      els.manifestStatus.dataset.status = "warning";
    }
  }

  function setAnalyzerAdapter(adapterId) {
    const nextId = adapterRegistry?.get(adapterId) ? adapterId : "none";
    adapterRegistry?.setActive?.(nextId);
    state.analyzer.adapterId = nextId;
    if (els.adapterSelect && els.adapterSelect.value !== nextId) {
      els.adapterSelect.value = nextId;
    }
    if (els.siteMapAdapterSelect && els.siteMapAdapterSelect.value !== nextId) {
      els.siteMapAdapterSelect.value = nextId;
    }
    renderSafeChangePanel();
    renderAdapterPanel();
    renderSiteMapPanel();
  }

  function getActiveAnalyzerAdapter() {
    return adapterRegistry?.get(state.analyzer.adapterId) || adapterRegistry?.get("none") || null;
  }

  function getAnalyzerAdapterContext() {
    const pageMeta = getAnalyzerManifestPageMeta();
    return {
      pageId: pageMeta.pageId,
      sourcePath: pageMeta.sourcePath,
      viewState: pageMeta.currentViewState,
      sourceAuthority: pageMeta.sourceAuthority,
      effectiveUrl: state.analyzer.effectiveUrl || "",
      currentUrl: state.analyzer.effectiveUrl || state.analyzer.loadedPath || window.location.href,
      baseUrl: state.analyzer.effectiveUrl || state.analyzer.loadedPath || window.location.href,
    };
  }

  function renderAdapterPanel() {
    if (!els.adapterStatus || !els.adapterInfo) {
      return;
    }
    const adapter = getActiveAnalyzerAdapter();
    if (!adapter) {
      els.adapterStatus.textContent = "Unavailable";
      els.adapterInfo.textContent = "Adapter moduleを読み込めていません。";
      return;
    }
    if (els.adapterSelect && els.adapterSelect.value !== adapter.id) {
      els.adapterSelect.value = adapter.id;
    }
    els.adapterStatus.textContent = `${adapter.label} v${adapter.version}`;
    const capabilities = adapter.capabilities || {};
    if (adapter.id === "none") {
      els.adapterInfo.textContent = [
        "Adapter固有解決は行いません。",
        "Confirmed Mappingは保持したままです。",
        "Patch: false",
      ].join("\n");
      return;
    }
    const context = getAnalyzerAdapterContext();
    const knownPages = typeof adapter.getKnownPages === "function" ? adapter.getKnownPages(context) : [];
    const visibleMappings = getVisibleConfirmedMappings(getAnalyzerManifestPageMeta());
    const lines = [
      `Active: ${adapter.label} v${adapter.version}`,
      `Page: ${context.pageId}`,
      `Source: ${context.sourcePath}${context.viewState ? ` / ${context.viewState}` : ""}`,
      `Capabilities: pages=${Boolean(capabilities.pages)}, links=${Boolean(capabilities.links)}, componentMapping=${Boolean(capabilities.componentMapping)}, protectedBehavior=${Boolean(capabilities.protectedBehavior)}, patch=${Boolean(capabilities.patch)}`,
      `Visible Confirmed Mapping: ${visibleMappings.length}`,
      `Known Pages: ${knownPages.length}`,
      ...knownPages.slice(0, 5).map((page) => `- ${page.pageId} / ${page.label ? `${page.label} / ` : ""}${page.sourcePath || "-"} / view:${page.viewStates?.join(",") || "common"} / ${page.componentCount}件`),
    ];
    els.adapterInfo.textContent = lines.join("\n");
  }

  function openSiteMapPanel() {
    state.siteMap.open = true;
    if (els.siteMapPanel) {
      els.siteMapPanel.hidden = false;
    }
    if (els.siteMapButton) {
      els.siteMapButton.setAttribute("aria-pressed", "true");
    }
    renderSiteMapPanel();
  }

  function closeSiteMapPanel() {
    state.siteMap.open = false;
    if (els.siteMapPanel) {
      els.siteMapPanel.hidden = true;
    }
    if (els.siteMapButton) {
      els.siteMapButton.setAttribute("aria-pressed", "false");
    }
  }

  async function refreshSiteMap() {
    if (!window.TBalanceSiteMap?.buildGraph || !window.TBalanceSiteMap?.scanHtml) {
      setSiteMapStatus("Site Map moduleを読み込めていません。", "error");
      return null;
    }
    setSiteMapStatus("Known Pagesを読み取り中...", "idle");
    const adapter = getActiveAnalyzerAdapter();
    const context = getAnalyzerAdapterContext();
    const pageSources = buildSiteMapPageSources(adapter, context);
    const scans = {};
    for (const page of pageSources) {
      if (!page.sourcePath || page.sourcePath === "generic-test" || isSiteMapPlaceholderSource(page.sourcePath)) {
        continue;
      }
      const scanKey = window.TBalanceSiteMap.normalizeSourcePath(page.sourcePath);
      if (scans[scanKey]) {
        continue;
      }
      const fetchResult = await fetchSiteMapHtml(page.sourcePath);
      if (!fetchResult.ok) {
        scans[scanKey] = {
          sourcePath: scanKey,
          title: page.label || page.sourcePath,
          links: [],
          dynamic: [],
          diagnostics: [{
            severity: "warning",
            code: "fetch-failed",
            sourcePath: page.sourcePath,
            message: fetchResult.message,
          }],
        };
        continue;
      }
      const scan = window.TBalanceSiteMap.scanHtml(fetchResult.html, page.sourcePath);
      scan.links = scan.links.map((link) => resolveSiteMapLinkWithAdapter(link, page, adapter, context));
      scans[scanKey] = scan;
    }
    const graph = window.TBalanceSiteMap.buildGraph({
      projectId: getAnalyzerManifestPageMeta().projectId,
      adapterId: adapter?.id || "none",
      pages: pageSources,
      scans,
    });
    state.siteMap.graph = graph;
    state.siteMap.selectedPageId = state.siteMap.selectedPageId || graph.pages[0]?.pageId || "";
    state.siteMap.lastScanAt = graph.generatedAt;
    setSiteMapStatus(`生成済み: ${new Date(graph.generatedAt).toLocaleTimeString()}`, "success");
    renderSiteMapPanel();
    return graph;
  }

  function buildSiteMapPageSources(adapter, context) {
    const sources = [];
    const manifest = buildAnalyzerManifest();
    manifest.pages.forEach((page) => {
      if (isSiteMapPlaceholderSource(page.sourcePath)) {
        sources.push({
          sourcePath: page.sourcePath,
          source: "manifest-current",
          unresolvedReason: "page metadata不足",
        });
        return;
      }
      sources.push({
        pageId: page.pageId,
        label: page.pageId,
        sourcePath: page.sourcePath,
        sourceAuthority: page.sourceAuthority || "standard-web",
        componentCount: page.components.length,
        viewStates: Array.from(new Set(page.components.map((component) => component.viewState).filter(Boolean))),
        identityStatus: page.components.length ? "confirmed" : "candidate",
        source: page.components.length ? "manifest" : "manifest-current",
      });
    });
    const knownPages = typeof adapter?.getKnownPages === "function" ? adapter.getKnownPages(context) : [];
    knownPages.forEach((page) => {
      if (isSiteMapPlaceholderSource(page.sourcePath || page.path || page.url)) {
        sources.push({
          sourcePath: page.sourcePath || page.path || page.url || "",
          source: `adapter:${adapter?.id || "none"}`,
          unresolvedReason: "Adapter page source未確定",
        });
        return;
      }
      sources.push({
        ...page,
        identityStatus: page.componentCount ? "confirmed" : "candidate",
        source: `adapter:${adapter?.id || "none"}`,
      });
    });
    const analyzerPage = state.analyzer.result?.page || null;
    const analyzerSourcePath = analyzerPage?.sourcePath || state.analyzer.sourcePath || els.analyzerFrame?.src;
    if (analyzerSourcePath) {
      if (isSiteMapPlaceholderSource(analyzerSourcePath)) {
        sources.push({
          sourcePath: analyzerSourcePath,
          source: "current-analyzer",
          unresolvedReason: "Analyzer page source未確定",
        });
      } else {
        const analyzerViewState = getAnalyzerSiteMapViewState(analyzerPage);
        const normalizedAnalyzerSourcePath = window.TBalanceSiteMap.normalizeSourcePath(analyzerSourcePath);
        const knownAnalyzerPage = knownPages.find((page) => (
          !isSiteMapPlaceholderSource(page.sourcePath || page.path || page.url)
          && window.TBalanceSiteMap.normalizeSourcePath(page.sourcePath || page.path || page.url) === normalizedAnalyzerSourcePath
        ));
        const analyzerPageId = knownAnalyzerPage?.pageId || getAnalyzerManifestPageMeta().pageId;
        sources.push({
          pageId: analyzerPageId,
          label: knownAnalyzerPage?.label || analyzerPage?.title || analyzerPage?.sourcePath || state.analyzer.sourcePath,
          sourcePath: normalizedAnalyzerSourcePath,
          sourceAuthority: "standard-web",
          viewStateDetails: analyzerViewState ? [{ value: analyzerViewState, source: "analyzer-observed" }] : [],
          componentCount: getVisibleConfirmedMappings({
            ...getAnalyzerManifestPageMeta(),
            pageId: analyzerPageId,
            sourcePath: normalizedAnalyzerSourcePath,
            currentViewState: analyzerViewState,
          }).length,
          identityStatus: "candidate",
          source: "current-analyzer",
        });
      }
    }
    return sources.filter((page) => page.sourcePath);
  }

  function isSiteMapPlaceholderSource(value) {
    if (window.TBalanceSiteMap?.isPlaceholderSourcePath) {
      return window.TBalanceSiteMap.isPlaceholderSourcePath(value);
    }
    const raw = String(value || "").trim().toLowerCase().split("?")[0].split("#")[0];
    return !raw || raw === "unknown" || raw === "unknown.html" || raw === "unknown-page" || raw === "page";
  }

  function getAnalyzerSiteMapViewState(analyzerPage = null) {
    const explicit = analyzerPage?.viewState || state.analyzer.viewState || "";
    if (explicit) {
      return explicit;
    }
    const candidates = [
      analyzerPage?.url,
      analyzerPage?.effectiveUrl,
      state.analyzer.effectiveUrl,
      state.analyzer.loadedPath,
      state.analyzer.sourcePath,
      els.analyzerPath?.value,
      els.analyzerFrame?.src,
    ].filter(Boolean);
    for (const value of candidates) {
      const query = getQueryFromResolvedPath(value);
      if (query) {
        return query;
      }
    }
    return "";
  }

  function resolveSiteMapLinkWithAdapter(link, page, adapter, context) {
    if (!link || !adapter || adapter.id === "none" || typeof adapter.resolveInternalLink !== "function") {
      return link;
    }
    const pageUrl = getSiteMapPageUrl(page.sourcePath);
    const adapterContext = {
      ...context,
      sourcePath: page.sourcePath,
      currentUrl: pageUrl,
      baseUrl: pageUrl,
      effectiveUrl: pageUrl,
    };
    const result = adapter.resolveInternalLink(link.rawHref, adapterContext);
    if (!result || !["resolved", "external"].includes(result.status)) {
      return link;
    }
    if (result.status === "external" || result.isExternal) {
      return {
        ...link,
        kind: "external",
        externalUrl: result.url || link.externalUrl,
        reason: result.reason || "external-url",
      };
    }
    const sourcePath = result.sourcePath || window.TBalanceSiteMap.normalizeSourcePath(result.path || link.targetSourcePath || "");
    return {
      ...link,
      kind: "internal",
      targetPageId: result.pageId || link.targetPageId,
      targetSourcePath: sourcePath || link.targetSourcePath,
      targetState: {
        ...(link.targetState || {}),
        query: getQueryFromResolvedPath(result.path || result.url || link.rawHref),
        hash: getHashFromResolvedPath(result.path || result.url || link.rawHref),
        viewState: result.viewState || link.targetState?.viewState || getQueryFromResolvedPath(result.path || result.url || link.rawHref),
      },
    };
  }

  async function fetchSiteMapHtml(sourcePath) {
    const url = getSiteMapPageUrl(sourcePath);
    try {
      const resolved = new URL(url);
      if (resolved.origin !== window.location.origin) {
        return { ok: false, message: `same-origin外のため読み取りません: ${resolved.href}` };
      }
      const response = await fetch(resolved.href, { cache: "no-store" });
      if (!response.ok) {
        return { ok: false, message: `HTTP ${response.status}: ${resolved.pathname}` };
      }
      return { ok: true, html: await response.text(), url: resolved.href };
    } catch (error) {
      return { ok: false, message: error.message || String(error) };
    }
  }

  function getSiteMapPageUrl(sourcePath) {
    const clean = window.TBalanceSiteMap?.normalizeSourcePath
      ? window.TBalanceSiteMap.normalizeSourcePath(sourcePath)
      : String(sourcePath || "index.html").split("?")[0].split("#")[0];
    return new URL(clean, new URL("../../", window.location.href)).href;
  }

  function getQueryFromResolvedPath(value) {
    try {
      return new URL(String(value || ""), "https://tbalance.local/").search.replace(/^\?/, "");
    } catch (error) {
      const match = String(value || "").match(/\?([^#]+)/);
      return match ? match[1] : "";
    }
  }

  function getHashFromResolvedPath(value) {
    try {
      return new URL(String(value || ""), "https://tbalance.local/").hash.replace(/^#/, "");
    } catch (error) {
      const match = String(value || "").match(/#(.+)$/);
      return match ? match[1] : "";
    }
  }

  function setSiteMapStatus(message, status = "idle") {
    state.siteMap.message = message;
    state.siteMap.status = status;
    renderSiteMapPanel();
  }

  function setSiteMapFilter(filter) {
    state.siteMap.filter = filter || "all";
    renderSiteMapPanel();
  }

  function setSiteMapDetailMode(mode) {
    state.siteMap.detailMode = mode === "custom" ? "custom" : "normal";
    renderSiteMapPanel();
  }

  function setSiteMapLayoutMode(mode) {
    state.siteMap.layoutMode = mode === "free" ? "free" : "auto";
    if (state.siteMap.layoutMode === "auto") {
      applySiteMapAutoLayout(state.siteMap.graph);
    }
    saveSiteMapLayoutSettings();
    renderSiteMapPanel();
  }

  function resetSiteMapLayout() {
    state.siteMap.positions = {};
    state.siteMap.zoom = 1;
    state.siteMap.panX = 0;
    state.siteMap.panY = 0;
    state.siteMap.layoutMode = "auto";
    applySiteMapAutoLayout(state.siteMap.graph);
    saveSiteMapLayoutSettings();
    renderSiteMapPanel();
  }

  function fitSiteMapView() {
    state.siteMap.zoom = 1;
    state.siteMap.panX = 0;
    state.siteMap.panY = 0;
    saveSiteMapLayoutSettings();
    renderSiteMapPanel();
  }

  function handleSiteMapPageClick(event) {
    const button = event.target.closest("[data-site-map-page-id]");
    if (!button) {
      return;
    }
    if (event.detail >= 2) {
      const page = state.siteMap.graph?.pages?.find((item) => item.pageId === button.dataset.siteMapPageId);
      if (page) {
        state.siteMap.selectedPageId = page.pageId;
        state.siteMap.selectedLinkId = "";
        openExistingWebPage(page);
      }
      return;
    }
    state.siteMap.selectedPageId = button.dataset.siteMapPageId || "";
    state.siteMap.selectedLinkId = "";
    const issue = event.target.closest("[data-site-map-issue]");
    state.siteMap.selectedIssue = issue?.dataset.siteMapIssue || "";
    renderSiteMapPanel();
  }

  function handleSiteMapPageDoubleClick(event) {
    const button = event.target.closest("[data-site-map-page-id]");
    if (!button) {
      return;
    }
    const page = state.siteMap.graph?.pages?.find((item) => item.pageId === button.dataset.siteMapPageId);
    if (!page) {
      return;
    }
    state.siteMap.selectedPageId = page.pageId;
    state.siteMap.selectedLinkId = "";
    openExistingWebPage(page);
  }

  function handleSiteMapLinkClick(event) {
    const row = event.target.closest("[data-site-map-link-id]");
    if (!row) {
      return;
    }
    selectSiteMapLink(row.dataset.siteMapLinkId || "");
  }

  function selectSiteMapLink(edgeId) {
    state.siteMap.selectedLinkId = edgeId || "";
    state.siteMap.selectedPageId = "";
    state.siteMap.selectedIssue = "";
    renderSiteMapPanel();
  }

  function handleSiteMapPagePointerDown(event) {
    const card = event.target.closest("[data-site-map-page-id]");
    if (!card || event.button !== 0 || state.siteMap.layoutMode !== "free") {
      return;
    }
    event.preventDefault();
    const pageId = card.dataset.siteMapPageId || "";
    const point = getSiteMapPointerPoint(event);
    const current = state.siteMap.positions[pageId] || { x: 0, y: 0 };
    state.siteMap.dragging = {
      pageId,
      startX: point.x,
      startY: point.y,
      baseX: current.x,
      baseY: current.y,
    };
  }

  function handleSiteMapPanStart(event) {
    if (event.button !== 0 || !event.target.closest("#siteMapGraphViewport") || event.target.closest("[data-site-map-page-id]") || event.target.closest("[data-site-map-link-id]")) {
      return;
    }
    event.preventDefault();
    state.siteMap.panning = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: state.siteMap.panX,
      baseY: state.siteMap.panY,
    };
  }

  function handleSiteMapPointerMove(event) {
    if (state.siteMap.dragging) {
      const point = getSiteMapPointerPoint(event);
      const drag = state.siteMap.dragging;
      const scale = state.siteMap.zoom || 1;
      state.siteMap.positions[drag.pageId] = {
        x: drag.baseX + ((point.x - drag.startX) / scale),
        y: drag.baseY + ((point.y - drag.startY) / scale),
      };
      renderSiteMapPanel();
      return;
    }
    if (state.siteMap.panning) {
      const pan = state.siteMap.panning;
      state.siteMap.panX = pan.baseX + (event.clientX - pan.startX);
      state.siteMap.panY = pan.baseY + (event.clientY - pan.startY);
      renderSiteMapPanel();
    }
  }

  function handleSiteMapPointerUp() {
    if (!state.siteMap.dragging && !state.siteMap.panning) {
      return;
    }
    state.siteMap.dragging = null;
    state.siteMap.panning = null;
    saveSiteMapLayoutSettings();
  }

  function handleSiteMapWheel(event) {
    if (!state.siteMap.open) {
      return;
    }
    event.preventDefault();
    const currentZoom = Number(state.siteMap.zoom || 1);
    const delta = Number(event.deltaY) || 0;
    if (!delta) {
      return;
    }
    const minZoom = 0.55;
    const maxZoom = 1.5;
    const pointer = getSiteMapPointerPoint(event);
    const contentX = (pointer.x - (state.siteMap.panX || 0)) / currentZoom;
    const contentY = (pointer.y - (state.siteMap.panY || 0)) / currentZoom;
    const normalizedSteps = Math.min(1, Math.max(0.25, Math.abs(delta) / 100));
    const zoomFactor = 1 + (0.055 * normalizedSteps);
    const rawZoom = delta < 0 ? currentZoom * zoomFactor : currentZoom / zoomFactor;
    const nextZoom = Math.min(maxZoom, Math.max(minZoom, Number(rawZoom.toFixed(3))));
    state.siteMap.zoom = nextZoom;
    state.siteMap.panX = pointer.x - (contentX * nextZoom);
    state.siteMap.panY = pointer.y - (contentY * nextZoom);
    saveSiteMapLayoutSettings();
    renderSiteMapPanel();
  }

  function getSiteMapPointerPoint(event) {
    const rect = els.siteMapGraphViewport?.getBoundingClientRect?.() || { left: 0, top: 0 };
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function renderSiteMapPanel() {
    if (!els.siteMapPanel) {
      return;
    }
    if (els.siteMapPanel.hidden !== !state.siteMap.open) {
      els.siteMapPanel.hidden = !state.siteMap.open;
    }
    if (els.siteMapButton) {
      els.siteMapButton.setAttribute("aria-pressed", state.siteMap.open ? "true" : "false");
    }
    const graph = state.siteMap.graph;
    const adapter = getActiveAnalyzerAdapter();
    if (els.siteMapStatus) {
      els.siteMapStatus.textContent = state.siteMap.message || "未生成";
      els.siteMapStatus.dataset.status = state.siteMap.status || "idle";
    }
    if (els.siteMapContext) {
      els.siteMapContext.textContent = `Adapter: ${adapter?.label || "None"} / Project: ${getSiteMapProjectDisplayName(adapter)}`;
    }
    if (els.siteMapAdapterSelect && els.siteMapAdapterSelect.value !== (adapter?.id || "none")) {
      els.siteMapAdapterSelect.value = adapter?.id || "none";
    }
    if (!graph) {
      if (els.siteMapStats) els.siteMapStats.textContent = "Pages: 0 / Links: 0 / Diagnostics: 0";
      if (els.siteMapPageCount) els.siteMapPageCount.textContent = "0";
      if (els.siteMapLinkCount) els.siteMapLinkCount.textContent = "0";
      if (els.siteMapDiagnosticCount) els.siteMapDiagnosticCount.textContent = "0";
      if (els.siteMapPageCards) els.siteMapPageCards.textContent = "Scan Known Pagesを押してください。";
      if (els.siteMapGraphEdges) els.siteMapGraphEdges.innerHTML = "";
      if (els.siteMapGraphLinks) els.siteMapGraphLinks.innerHTML = "";
      if (els.siteMapLinkList) els.siteMapLinkList.textContent = "未生成";
      if (els.siteMapSelectedDetail) els.siteMapSelectedDetail.textContent = "未選択";
      if (els.siteMapDiagnostics) els.siteMapDiagnostics.textContent = "診断なし";
      renderSiteMapFilterButtons();
      renderSiteMapDetailModeButtons();
      renderSiteMapLayoutButtons();
      applySiteMapTransform();
      return;
    }
    ensureSiteMapLayout(graph);
    const visiblePages = filterSiteMapPages(graph);
    const filteredLinks = filterSiteMapLinks(graph.links || []);
    if (els.siteMapStats) {
      const issueCounts = getSiteMapIssueCounts(graph);
      els.siteMapStats.textContent = `ページ ${graph.pages.length} / リンク ${graph.links.length} / 要確認 ${issueCounts.warnings} / 問題 ${issueCounts.problems}`;
    }
    if (els.siteMapPageCount) els.siteMapPageCount.textContent = String(visiblePages.length);
    if (els.siteMapLinkCount) els.siteMapLinkCount.textContent = String(filteredLinks.length);
    if (els.siteMapDiagnosticCount) els.siteMapDiagnosticCount.textContent = String(graph.diagnostics.total);
    renderSiteMapFilterButtons();
    renderSiteMapDetailModeButtons();
    renderSiteMapLayoutButtons();
    renderSiteMapPages(graph, visiblePages);
    renderSiteMapGraphEdges(graph, visiblePages);
    renderSiteMapLinks(filteredLinks);
    renderSiteMapDetails(graph);
    renderSiteMapDiagnostics(graph);
    applySiteMapTransform();
  }

  function renderSiteMapFilterButtons() {
    document.querySelectorAll("[data-site-map-filter]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.siteMapFilter === state.siteMap.filter);
    });
  }

  function renderSiteMapDetailModeButtons() {
    document.querySelectorAll("[data-site-map-detail-mode]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.siteMapDetailMode === state.siteMap.detailMode);
    });
  }

  function renderSiteMapLayoutButtons() {
    if (els.siteMapAutoLayout) {
      els.siteMapAutoLayout.classList.toggle("is-active", state.siteMap.layoutMode !== "free");
    }
    if (els.siteMapFreeLayout) {
      els.siteMapFreeLayout.classList.toggle("is-active", state.siteMap.layoutMode === "free");
    }
  }

  function filterSiteMapLinks(links) {
    if (state.siteMap.filter === "warning") {
      return links.filter((link) => ["unresolved", "dynamic"].includes(link.status));
    }
    if (state.siteMap.filter === "problem") {
      return links.filter((link) => link.status === "missing-target");
    }
    if (state.siteMap.filter === "external") {
      return links.filter((link) => link.status === "external");
    }
    return links;
  }

  function filterSiteMapPages(graph) {
    const search = String(state.siteMap.search || "").trim().toLowerCase();
    return (graph.pages || []).filter((page) => {
      const summary = getSiteMapPageSummary(page, graph);
      const searchText = [page.label, page.pageId, page.sourcePath, ...(page.viewStates || [])].join(" ").toLowerCase();
      if (search && !searchText.includes(search)) {
        return false;
      }
      if (state.siteMap.filter === "warning") {
        return [summary.display, summary.assets, summary.navigation].some((item) => item.level === "warning");
      }
      if (state.siteMap.filter === "problem") {
        return [summary.display, summary.assets, summary.navigation].some((item) => item.level === "problem");
      }
      if (state.siteMap.filter === "external") {
        return (graph.links || []).some((link) => link.fromPageId === page.pageId && link.status === "external");
      }
      return true;
    });
  }

  function renderSiteMapPages(graph, pages) {
    if (!els.siteMapPageCards) {
      return;
    }
    const compact = (state.siteMap.zoom || 1) < 0.75;
    els.siteMapPageCards.innerHTML = pages.map((page) => {
      const selected = page.pageId === state.siteMap.selectedPageId;
      const summary = getSiteMapPageSummary(page, graph);
      const position = state.siteMap.positions[page.pageId] || { x: 0, y: 0 };
      return `<button class="tb-site-map-page-card${selected ? " is-selected" : ""}${compact ? " is-compact" : ""}" type="button" data-site-map-page-id="${escapeAttr(page.pageId)}" style="left:${Math.round(position.x)}px;top:${Math.round(position.y)}px;">
        <strong>${escapeHtml(page.label || page.pageId)}</strong>
        <div class="tb-site-map-card-checks">
          ${renderSiteMapCheck("表示", summary.display, compact)}
          ${renderSiteMapCheck("画像・素材", summary.assets, compact)}
          ${renderSiteMapCheck("移動先", summary.navigation, compact)}
        </div>
      </button>`;
    }).join("") || "Page候補がありません。";
  }

  function renderSiteMapCheck(label, item, compact) {
    const icon = getSiteMapLevelIcon(item.level);
    const shortLabel = label === "画像・素材" ? "素材" : label === "移動先" ? "移動" : label;
    const text = compact
      ? `<b aria-label="${escapeAttr(shortLabel)}">${icon}</b>`
      : `${escapeHtml(shortLabel)} <b>${icon}</b>`;
    return `<span class="tb-site-map-check" data-level="${escapeAttr(item.level)}" data-site-map-issue="${escapeAttr(label)}">${text}</span>`;
  }

  function renderSiteMapGraphEdges(graph, pages) {
    if (!els.siteMapGraphEdges) {
      return;
    }
    const visibleIds = new Set(pages.map((page) => page.pageId));
    const hierarchy = getSiteMapHierarchy(graph);
    const cardW = getSiteMapCardWidth();
    const cardH = getSiteMapCardHeight();
    const visibleLinks = (graph.links || []).filter((link) => visibleIds.has(link.fromPageId));
    const markers = [];
    const externalGroups = new Map();
    els.siteMapGraphEdges.innerHTML = visibleLinks.map((link, index) => {
      const from = state.siteMap.positions[link.fromPageId];
      const to = link.status === "external" || !visibleIds.has(link.toPageId) ? null : state.siteMap.positions[link.toPageId];
      if (!from) {
        return "";
      }
      const edgeKind = getSiteMapEdgeKind(link, hierarchy);
      const label = link.status === "external" ? "↗ 外部" : getSiteMapLevelIcon(getSiteMapLinkLevel(link));
      const linkId = escapeAttr(link.edgeId);
      if (!to) {
        if (link.status === "external") {
          const group = externalGroups.get(link.fromPageId) || { from, links: [] };
          group.links.push(link);
          externalGroups.set(link.fromPageId, group);
          return "";
        }
        const markerX = from.x + cardW + 10;
        const markerY = from.y + 17 + ((index % 2) * 22);
        markers.push(`<button class="tb-site-map-link-marker${isSiteMapLinkSelected(link) ? " is-selected" : ""}" type="button" data-site-map-link-id="${linkId}" data-status="${escapeAttr(link.status)}" style="left:${Math.round(markerX)}px;top:${Math.round(markerY)}px;">${escapeHtml(label)}</button>`);
        return "";
      }
      const points = getSiteMapEdgePoints(from, to, cardW, cardH, index, edgeKind);
      markers.push(`<button class="tb-site-map-link-marker${isSiteMapLinkSelected(link) ? " is-selected" : ""}" type="button" data-site-map-link-id="${linkId}" data-status="${escapeAttr(link.status)}" data-edge-kind="${escapeAttr(edgeKind)}" style="left:${Math.round(points.markerX)}px;top:${Math.round(points.markerY)}px;">${escapeHtml(label)}</button>`);
      return `<g class="tb-site-map-edge${isSiteMapLinkSelected(link) ? " is-selected" : ""}" data-site-map-link-id="${escapeAttr(link.edgeId)}" data-status="${escapeAttr(link.status)}" data-edge-kind="${escapeAttr(edgeKind)}">
        <path class="tb-site-map-edge-hit" data-site-map-link-id="${linkId}" d="${points.path}" />
        <path data-site-map-link-id="${linkId}" d="${points.path}" />
        <polygon data-site-map-link-id="${linkId}" points="${points.arrow}" />
      </g>`;
    }).join("");
    externalGroups.forEach((group) => {
      const firstLink = group.links[0];
      const count = group.links.length;
      const markerX = group.from.x + cardW + 10;
      const markerY = group.from.y + 16;
      const selected = group.links.some((link) => isSiteMapLinkSelected(link));
      const label = `↗ 外部 ${count}`;
      markers.push(`<button class="tb-site-map-link-marker tb-site-map-link-marker--external-group${selected ? " is-selected" : ""}" type="button" data-site-map-link-id="${escapeAttr(firstLink.edgeId)}" data-status="external" style="left:${Math.round(markerX)}px;top:${Math.round(markerY)}px;">${escapeHtml(label)}</button>`);
    });
    if (els.siteMapGraphLinks) {
      els.siteMapGraphLinks.innerHTML = markers.join("");
      els.siteMapGraphLinks.querySelectorAll("[data-site-map-link-id]").forEach((item) => {
        item.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          selectSiteMapLink(item.dataset.siteMapLinkId || "");
        });
      });
    }
    els.siteMapGraphEdges.querySelectorAll("[data-site-map-link-id]").forEach((item) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        selectSiteMapLink(item.dataset.siteMapLinkId || "");
      });
    });
  }

  function renderSiteMapLinks(links) {
    if (!els.siteMapLinkList) {
      return;
    }
    els.siteMapLinkList.innerHTML = links.map((link) => {
      const target = link.status === "external"
        ? link.externalUrl
        : `${link.toPageId || "unresolved"}${link.targetState?.viewState ? ` / ${link.targetState.viewState}` : ""}${link.targetState?.hash ? ` #${link.targetState.hash}` : ""}`;
      return `<article class="tb-site-map-link-row" data-site-map-link-id="${escapeAttr(link.edgeId)}">
        <strong>${escapeHtml(link.fromPageId)} → ${escapeHtml(target)}</strong>
        <small>${escapeHtml(link.label || link.rawHref || "-")} / ${escapeHtml(link.domRef || "-")}</small>
        <div class="tb-site-map-badges">
          <span class="tb-site-map-link-status" data-status="${escapeAttr(link.status)}">${escapeHtml(link.status)}</span>
          <span>${escapeHtml(link.kind)}</span>
          ${link.rawHref ? `<span>${escapeHtml(link.rawHref)}</span>` : ""}
        </div>
      </article>`;
    }).join("") || "該当リンクはありません。";
  }

  function renderSiteMapDetails(graph) {
    if (!els.siteMapSelectedDetail) {
      return;
    }
    if (state.siteMap.selectedLinkId) {
      const link = (graph.links || []).find((item) => item.edgeId === state.siteMap.selectedLinkId);
      renderSiteMapLinkDetails(graph, link);
      return;
    }
    const page = graph.pages.find((item) => item.pageId === state.siteMap.selectedPageId) || graph.pages[0] || null;
    if (!page) {
      els.siteMapSelectedDetail.textContent = "未選択";
      return;
    }
    if (!state.siteMap.selectedPageId) {
      state.siteMap.selectedPageId = page.pageId;
    }
    const outgoing = graph.links.filter((link) => link.fromPageId === page.pageId);
    const incoming = graph.links.filter((link) => link.toPageId === page.pageId);
    els.siteMapSelectedDetail.innerHTML = state.siteMap.detailMode === "custom"
      ? renderSiteMapPageCustomDetail(graph, page, outgoing, incoming)
      : renderSiteMapPageNormalDetail(graph, page, outgoing, incoming);
  }

  function renderSiteMapLinkDetails(graph, link) {
    if (!link) {
      els.siteMapSelectedDetail.textContent = "未選択";
      return;
    }
    if (state.siteMap.detailMode === "custom") {
      els.siteMapSelectedDetail.innerHTML = `<div class="tb-site-map-detail-block">
        <h3>Navigation詳細</h3>
        <dl>
          <dt>From</dt><dd>${escapeHtml(link.fromPageId || "-")}</dd>
          <dt>To</dt><dd>${escapeHtml(link.toPageId || link.externalUrl || "-")}</dd>
          <dt>href</dt><dd>${escapeHtml(link.rawHref || "-")}</dd>
          <dt>selector</dt><dd>${escapeHtml(link.domRef || "-")}</dd>
          <dt>targetState</dt><dd>${escapeHtml(link.targetState?.viewState || link.targetState?.query || link.targetState?.hash || "-")}</dd>
          <dt>status</dt><dd>${escapeHtml(link.status || "-")}</dd>
          <dt>kind</dt><dd>${escapeHtml(link.kind || "-")}</dd>
        </dl>
      </div>`;
      return;
    }
    const status = getSiteMapLinkNormalStatus(link);
    els.siteMapSelectedDetail.innerHTML = `<div class="tb-site-map-detail-block">
      <h3>移動先</h3>
      <p>${escapeHtml(link.label || "このボタン")} → ${escapeHtml(link.status === "external" ? "外部サイト" : getPageLabel(graph, link.toPageId))}</p>
      <p class="tb-site-map-normal-status" data-level="${escapeAttr(status.level)}">${getSiteMapLevelIcon(status.level)} ${escapeHtml(status.text)}</p>
    </div>`;
  }

  function getSiteMapProjectDisplayName(adapter) {
    const projectId = getAnalyzerManifestPageMeta().projectId;
    if ((!projectId || projectId === "sample-project") && adapter?.id === "teamerry") {
      return "TeaMerry Forest";
    }
    return projectId || adapter?.label || "未確定";
  }

  function getSiteMapIssueCounts(graph) {
    const diagnostics = graph?.diagnostics || {};
    const warningLinks = (graph?.links || []).filter((link) => ["unresolved", "dynamic"].includes(link.status)).length;
    const problemLinks = (graph?.links || []).filter((link) => link.status === "missing-target").length;
    return {
      warnings: Math.max(Number(diagnostics.warnings || 0), warningLinks),
      problems: Math.max(Number(diagnostics.errors || 0), problemLinks),
    };
  }

  function ensureSiteMapLayout(graph) {
    if (!graph?.pages?.length) {
      return;
    }
    loadSiteMapLayoutSettings(graph);
    const missing = graph.pages.some((page) => !state.siteMap.positions[page.pageId]);
    if (state.siteMap.layoutMode !== "free" || missing) {
      applySiteMapAutoLayout(graph, { keepExisting: state.siteMap.layoutMode === "free" });
    }
  }

  function applySiteMapAutoLayout(graph, options = {}) {
    if (!graph?.pages?.length) {
      return;
    }
    const positions = options.keepExisting ? { ...(state.siteMap.positions || {}) } : {};
    const hierarchy = getSiteMapHierarchy(graph);
    hierarchy.layoutPages.forEach((page) => {
      if (options.keepExisting && positions[page.pageId]) {
        return;
      }
      positions[page.pageId] = {
        x: page.x,
        y: page.y,
      };
    });
    state.siteMap.positions = positions;
  }

  function getSiteMapHierarchy(graph) {
    const pages = graph?.pages || [];
    const pageIds = new Set(pages.map((page) => page.pageId));
    const treeLinks = (graph?.links || []).filter((link) => (
      link.status === "resolved"
      && link.fromPageId
      && link.toPageId
      && link.fromPageId !== link.toPageId
      && pageIds.has(link.fromPageId)
      && pageIds.has(link.toPageId)
    ));
    const incoming = new Map(pages.map((page) => [page.pageId, 0]));
    treeLinks.forEach((link) => incoming.set(link.toPageId, (incoming.get(link.toPageId) || 0) + 1));
    const homePages = pages.filter((page) => isSiteMapHomePage(page));
    const rootPages = homePages.length
      ? homePages
      : pages.filter((page) => !incoming.get(page.pageId)).slice(0, 3);
    if (!rootPages.length && pages[0]) {
      rootPages.push(pages[0]);
    }

    const levels = new Map();
    const parents = new Map();
    const queue = rootPages.map((page) => ({ pageId: page.pageId, level: 0 }));
    rootPages.forEach((page) => levels.set(page.pageId, 0));
    while (queue.length) {
      const current = queue.shift();
      treeLinks
        .filter((link) => link.fromPageId === current.pageId)
        .forEach((link) => {
          const nextLevel = current.level + 1;
          const existingLevel = levels.get(link.toPageId);
          if (existingLevel === undefined || nextLevel < existingLevel) {
            levels.set(link.toPageId, nextLevel);
            parents.set(link.toPageId, current.pageId);
            queue.push({ pageId: link.toPageId, level: nextLevel });
          }
        });
    }

    const fallbackLevel = Math.max(0, ...Array.from(levels.values())) + 1;
    pages.forEach((page) => {
      if (!levels.has(page.pageId)) {
        levels.set(page.pageId, fallbackLevel);
      }
    });

    const childOrder = new Map();
    treeLinks.forEach((link, index) => {
      if (!childOrder.has(link.toPageId)) {
        childOrder.set(link.toPageId, index);
      }
    });
    const groups = new Map();
    pages.forEach((page) => {
      const level = levels.get(page.pageId) || 0;
      if (!groups.has(level)) {
        groups.set(level, []);
      }
      groups.get(level).push(page);
    });

    const cardW = getSiteMapCardWidth();
    const xGap = 56;
    const yGap = 132;
    const canvasWidth = 1800;
    const layoutPages = [];
    Array.from(groups.keys()).sort((a, b) => a - b).forEach((level) => {
      const rowPages = groups.get(level).sort((a, b) => {
        const parentCompare = String(parents.get(a.pageId) || "").localeCompare(String(parents.get(b.pageId) || ""));
        if (parentCompare) {
          return parentCompare;
        }
        return (childOrder.get(a.pageId) ?? 9999) - (childOrder.get(b.pageId) ?? 9999)
          || String(a.label || a.pageId).localeCompare(String(b.label || b.pageId));
      });
      const totalWidth = (rowPages.length * cardW) + (Math.max(0, rowPages.length - 1) * xGap);
      const startX = Math.max(44, Math.round((canvasWidth - totalWidth) / 2));
      rowPages.forEach((page, index) => {
        layoutPages.push({
          pageId: page.pageId,
          x: startX + (index * (cardW + xGap)),
          y: 44 + (level * yGap),
        });
      });
    });

    return { levels, parents, layoutPages };
  }

  function isSiteMapHomePage(page) {
    const id = String(page?.pageId || "").toLowerCase();
    const sourcePath = String(page?.sourcePath || "").toLowerCase();
    return id === "page-home" || id === "home" || sourcePath === "index.html" || sourcePath.endsWith("/index.html");
  }

  function getSiteMapEdgeKind(link, hierarchy) {
    if (link.status !== "resolved") {
      return link.status || "other";
    }
    if (hierarchy.parents.get(link.toPageId) === link.fromPageId) {
      return "tree";
    }
    return "cross";
  }

  function isSiteMapLinkSelected(link) {
    if (!link) {
      return false;
    }
    if (state.siteMap.selectedLinkId) {
      return state.siteMap.selectedLinkId === link.edgeId;
    }
    if (!state.siteMap.selectedPageId) {
      return false;
    }
    return link.fromPageId === state.siteMap.selectedPageId || link.toPageId === state.siteMap.selectedPageId;
  }

  function getSiteMapCardWidth() {
    return 156;
  }

  function getSiteMapCardHeight() {
    return 78;
  }

  function getSiteMapEdgePoints(from, to, cardW, cardH, index, edgeKind) {
    const fromCenterX = from.x + (cardW / 2);
    const toCenterX = to.x + (cardW / 2);
    const startY = edgeKind === "tree" ? from.y + cardH : from.y + cardH / 2;
    const endY = edgeKind === "tree" ? to.y : to.y + cardH / 2;
    const startX = edgeKind === "tree" ? fromCenterX : from.x + cardW;
    const endX = edgeKind === "tree" ? toCenterX : to.x;
    if (edgeKind === "tree") {
      const midY = Math.round(startY + Math.max(18, (endY - startY) / 2));
      return {
        path: `M ${Math.round(startX)} ${Math.round(startY)} V ${midY} H ${Math.round(endX)} V ${Math.round(endY)}`,
        arrow: `${Math.round(endX)},${Math.round(endY)} ${Math.round(endX - 6)},${Math.round(endY - 8)} ${Math.round(endX + 6)},${Math.round(endY - 8)}`,
        markerX: endX + 8,
        markerY: endY - 12,
      };
    }
    const lane = 28 + ((index % 4) * 10);
    const midX = Math.max(startX, endX) + lane;
    return {
      path: `M ${Math.round(startX)} ${Math.round(startY)} H ${Math.round(midX)} V ${Math.round(endY)} H ${Math.round(endX)}`,
      arrow: `${Math.round(endX)},${Math.round(endY)} ${Math.round(endX + 8)},${Math.round(endY - 5)} ${Math.round(endX + 8)},${Math.round(endY + 5)}`,
      markerX: midX + 6,
      markerY: endY - 12,
    };
  }

  function applySiteMapTransform() {
    if (!els.siteMapGraphCanvas) {
      return;
    }
    els.siteMapGraphCanvas.style.transform = `translate(${Math.round(state.siteMap.panX || 0)}px, ${Math.round(state.siteMap.panY || 0)}px) scale(${state.siteMap.zoom || 1})`;
  }

  function getSiteMapLayoutStorageKey(graph = state.siteMap.graph) {
    const projectId = graph?.projectId || getAnalyzerManifestPageMeta().projectId || "sample-project";
    const adapterId = graph?.adapterId || getActiveAnalyzerAdapter()?.id || "none";
    return `tbalance.siteMap.v02.${projectId}.${adapterId}`;
  }

  function loadSiteMapLayoutSettings(graph) {
    if (state.siteMap.layoutLoadedFor === getSiteMapLayoutStorageKey(graph)) {
      return;
    }
    state.siteMap.layoutLoadedFor = getSiteMapLayoutStorageKey(graph);
    try {
      const text = localStorage.getItem(state.siteMap.layoutLoadedFor);
      if (!text) {
        return;
      }
      const parsed = JSON.parse(text);
      state.siteMap.layoutMode = parsed.layoutMode === "free" ? "free" : "auto";
      state.siteMap.zoom = Number(parsed.zoom) || 1;
      state.siteMap.panX = Number(parsed.panX) || 0;
      state.siteMap.panY = Number(parsed.panY) || 0;
      state.siteMap.positions = parsed.positions && typeof parsed.positions === "object" ? parsed.positions : {};
    } catch (error) {
      state.siteMap.positions = {};
    }
  }

  function saveSiteMapLayoutSettings() {
    try {
      localStorage.setItem(getSiteMapLayoutStorageKey(), JSON.stringify({
        layoutMode: state.siteMap.layoutMode,
        zoom: state.siteMap.zoom,
        panX: state.siteMap.panX,
        panY: state.siteMap.panY,
        positions: state.siteMap.positions || {},
      }));
    } catch (error) {
      // Site Map layout is a UI preference only; storage failure must not affect analysis.
    }
  }

  function getSiteMapPageSummary(page, graph) {
    const pageDiagnostics = (graph.diagnostics?.items || []).filter((item) => item.sourcePath === page.sourcePath);
    const outgoing = (graph.links || []).filter((link) => link.fromPageId === page.pageId);
    const displayProblem = pageDiagnostics.find((item) => item.code === "fetch-failed" || item.code === "empty-html");
    const missing = outgoing.filter((link) => link.status === "missing-target").length;
    const uncertain = outgoing.filter((link) => ["unresolved", "dynamic"].includes(link.status)).length;
    return {
      display: displayProblem
        ? { level: "problem", shortLabel: "問題あり", text: displayProblem.message }
        : { level: "ok", shortLabel: "OK", text: "現在のTEST環境で読み込みを確認しました。" },
      assets: { level: "ok", shortLabel: "読み込みOK", text: "v0.2ではページ読み込み範囲で確認しています。外部依存の詳細検査は今後対象です。" },
      navigation: missing
        ? { level: "problem", shortLabel: `問題あり ${missing}件`, text: "存在しない移動先があります。" }
        : uncertain
          ? { level: "warning", shortLabel: `要確認 ${uncertain}件`, text: "JS経由など、TBalanceだけでは移動先を確定できない要素があります。" }
          : { level: "ok", shortLabel: "OK", text: "移動先を安全に解決できました。" },
    };
  }

  function getSiteMapLinkLevel(link) {
    if (link.status === "missing-target") {
      return "problem";
    }
    if (["unresolved", "dynamic"].includes(link.status)) {
      return "warning";
    }
    return "ok";
  }

  function getSiteMapLinkNormalStatus(link) {
    if (link.status === "missing-target") {
      return { level: "problem", text: "指定された移動先Pageを確認できません。" };
    }
    if (link.status === "external") {
      return { level: "ok", text: "外部リンクとして識別しました。内部Pageとしては扱いません。" };
    }
    if (["unresolved", "dynamic"].includes(link.status)) {
      return { level: "warning", text: "JS経由または未確定のため、移動先の確認が必要です。" };
    }
    return { level: "ok", text: "移動先確認済みです。" };
  }

  function getSiteMapLevelIcon(level) {
    if (level === "problem") {
      return "❌";
    }
    if (level === "warning") {
      return "⚠️";
    }
    return "✅";
  }

  function getSiteMapPreviewLabel(page) {
    return page.sourcePath ? "Previewなし" : "未取得";
  }

  function getPageLabel(graph, pageId) {
    const page = graph.pages.find((item) => item.pageId === pageId);
    return page?.label || pageId || "未解決";
  }

  function renderSiteMapPageNormalDetail(graph, page, outgoing, incoming) {
    const summary = getSiteMapPageSummary(page, graph);
    const states = page.viewStateDetails?.length
      ? page.viewStateDetails.map((item) => `<li>${escapeHtml(item.value)} <small>${escapeHtml(item.source || "")}</small></li>`).join("")
      : (page.viewStates || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    const problemItems = [summary.display, summary.assets, summary.navigation].filter((item) => item.level !== "ok");
    return `<div class="tb-site-map-detail-block">
      <h3>${escapeHtml(page.label || page.pageId)}</h3>
      <div class="tb-site-map-normal-list">
        ${renderSiteMapNormalLine("表示", summary.display)}
        ${renderSiteMapNormalLine("画像・素材", summary.assets)}
        ${renderSiteMapNormalLine("移動先", summary.navigation)}
      </div>
      ${problemItems.length ? `<div class="tb-site-map-problems">${problemItems.map((item) => `<p data-level="${escapeAttr(item.level)}">${getSiteMapLevelIcon(item.level)} ${escapeHtml(item.text)}</p>`).join("")}</div>` : `<p class="tb-site-map-normal-status" data-level="ok">OK 問題は見つかりませんでした</p>`}
      <h4>状態</h4>
      <ul>${states || "<li>共通表示</li>"}</ul>
      <h4>移動</h4>
      <p>出ていく移動先: ${outgoing.length} / 入ってくる移動元: ${incoming.length}</p>
    </div>`;
  }

  function renderSiteMapNormalLine(label, item) {
    return `<p data-level="${escapeAttr(item.level)}"><strong>${escapeHtml(label)}</strong><span>${getSiteMapLevelIcon(item.level)} ${escapeHtml(item.shortLabel)}</span></p>`;
  }

  function renderSiteMapPageCustomDetail(graph, page, outgoing, incoming) {
    const adapter = getActiveAnalyzerAdapter();
    const diagnostics = (graph.diagnostics?.items || []).filter((item) => item.sourcePath === page.sourcePath);
    const visibleMappings = getVisibleConfirmedMappings(getAnalyzerManifestPageMeta()).filter((mapping) => mapping.pageId === page.pageId);
    const states = page.viewStateDetails?.length
      ? page.viewStateDetails.map((item) => `<li>${escapeHtml(item.value)} <small>${escapeHtml(item.source || "")}</small></li>`).join("")
      : (page.viewStates || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    return `<div class="tb-site-map-detail-block tb-site-map-detail-block--custom">
      <h3>Page情報</h3>
      <dl>
        <dt>表示名</dt><dd>${escapeHtml(page.label || "-")}</dd>
        <dt>Page ID</dt><dd>${escapeHtml(page.pageId || "-")}</dd>
        <dt>sourcePath</dt><dd>${escapeHtml(page.sourcePath || "-")}</dd>
        <dt>View State</dt><dd>${states ? `<ul>${states}</ul>` : "共通表示"}</dd>
        <dt>Source Authority</dt><dd>${escapeHtml(page.sourceAuthority || "-")}</dd>
        <dt>Adapter</dt><dd>${escapeHtml(adapter?.label || "None")}</dd>
      </dl>
      <h3>構成・素材</h3>
      <p>HTML: ${escapeHtml(page.sourcePath || "-")} / Images・Video・Fonts: 詳細検査は今後対象 / Missing Assets: ${diagnostics.filter((item) => item.code === "missing-asset").length}</p>
      <h3>Navigation</h3>
      ${outgoing.map((link) => `<details><summary>${escapeHtml(link.label || link.rawHref || link.edgeId)} / ${escapeHtml(link.status)}</summary><pre>${escapeHtml(JSON.stringify(link, null, 2))}</pre></details>`).join("") || "<p>出ていくNavigationなし</p>"}
      <h3>TBalance解析</h3>
      <p>Confirmed Mapping: ${visibleMappings.length}</p>
      ${visibleMappings.map((mapping) => `<details><summary>${escapeHtml(mapping.tbId)} / ${escapeHtml(mapping.domRef)}</summary><pre>${escapeHtml(JSON.stringify(mapping, null, 2))}</pre></details>`).join("")}
      <h3>Diagnostics</h3>
      ${diagnostics.map((item) => `<details><summary>${escapeHtml(item.severity)} / ${escapeHtml(item.code)}</summary><pre>${escapeHtml(JSON.stringify(item, null, 2))}</pre></details>`).join("") || "<p>診断なし</p>"}
    </div>`;
  }

  function renderSiteMapDiagnostics(graph) {
    if (!els.siteMapDiagnostics) {
      return;
    }
    const items = graph.diagnostics.items || [];
    els.siteMapDiagnostics.innerHTML = items.map((item) => `<article class="tb-site-map-diagnostic">
      <strong>${escapeHtml(item.severity)} / ${escapeHtml(item.code)}</strong>
      <small>${escapeHtml(item.sourcePath)}: ${escapeHtml(item.message)}</small>
    </article>`).join("") || "診断なし";
  }

  function buildAnalyzerManifest() {
    const pageMeta = getAnalyzerManifestPageMeta();
    const mappings = state.analyzer.confirmedMappings;
    const pagesById = new Map();
    mappings.forEach((mapping) => {
      const pageId = mapping.pageId || pageMeta.pageId;
      if (!pagesById.has(pageId)) {
        pagesById.set(pageId, {
          pageId,
          sourcePath: mapping.page?.sourcePath || pageMeta.sourcePath,
          sourceAuthority: mapping.sourceAuthority || "standard-web",
          components: [],
        });
      }
      const page = pagesById.get(pageId);
      const component = {
        tbId: mapping.tbId,
        domRef: mapping.domRef,
        role: mapping.role || "visual",
        editableProperties: Array.isArray(mapping.editableProperties) ? mapping.editableProperties : [],
        protectedProperties: Array.isArray(mapping.protectedProperties) ? mapping.protectedProperties : [],
        behaviorRef: mapping.behaviorRef || null,
      };
      if (mapping.viewState) {
        component.viewState = mapping.viewState;
      }
      page.components.push(component);
    });
    if (!pagesById.size) {
      pagesById.set(pageMeta.pageId, {
        pageId: pageMeta.pageId,
        sourcePath: pageMeta.sourcePath,
        sourceAuthority: pageMeta.sourceAuthority,
        components: [],
      });
    }
    return {
      compatibilitySpecVersion: "1.0",
      projectId: pageMeta.projectId,
      pages: Array.from(pagesById.values()),
    };
  }

  function exportAnalyzerManifest() {
    const manifest = buildAnalyzerManifest();
    const validation = validateAnalyzerManifest(manifest);
    if (validation.errors.length) {
      setManifestStatus(`Manifest Export不可: ${validation.errors.join(" / ")}`, "error");
      renderManifestPanel();
      return;
    }
    downloadBlob(JSON.stringify(manifest, null, 2), "tbalance.manifest.json", "application/json");
    setManifestStatus(`ManifestをExportしました: ${manifest.pages.reduce((sum, page) => sum + page.components.length, 0)}件${validation.warnings.length ? ` / Warning: ${validation.warnings.join(" / ")}` : ""}`, validation.warnings.length ? "warning" : "success");
    renderManifestPanel();
  }

  function importAnalyzerManifestFromFile(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const manifest = JSON.parse(String(reader.result || ""));
        applyAnalyzerManifest(manifest);
      } catch (error) {
        setManifestStatus(`Manifest Import不可: JSONとして読めません。${error.message || error}`, "error");
      } finally {
        if (els.manifestImportFile) {
          els.manifestImportFile.value = "";
        }
      }
    };
    reader.onerror = () => {
      setManifestStatus("Manifest Import不可: ファイルを読めません。", "error");
      if (els.manifestImportFile) {
        els.manifestImportFile.value = "";
      }
    };
    reader.readAsText(file, "utf-8");
  }

  function applyAnalyzerManifest(manifest) {
    const validation = validateAnalyzerManifest(manifest);
    if (validation.errors.length) {
      setManifestStatus(`Manifest Import不可: ${validation.errors.join(" / ")}`, "error");
      return { imported: false, validation, count: state.analyzer.confirmedMappings.length };
    }
    restoreConfirmedMappingsFromManifest(manifest);
    state.analyzer.manifestProjectId = sanitizeManifestId(manifest.projectId, "sample-project");
    if (els.manifestProjectId) {
      els.manifestProjectId.value = state.analyzer.manifestProjectId;
    }
    setManifestStatus(`ManifestをImportしました: ${state.analyzer.confirmedMappings.length}件${validation.warnings.length ? ` / Warning: ${validation.warnings.join(" / ")}` : ""}`, validation.warnings.length ? "warning" : "success");
    renderAnalyzerResult();
    return { imported: true, validation, count: state.analyzer.confirmedMappings.length };
  }

  function validateAnalyzerManifest(manifest) {
    const errors = [];
    const warnings = [];
    if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
      return { errors: ["Manifest root must be object"], warnings };
    }
    if (!manifest.compatibilitySpecVersion) {
      errors.push("compatibilitySpecVersionがありません");
    } else if (manifest.compatibilitySpecVersion !== "1.0") {
      warnings.push(`compatibilitySpecVersion ${manifest.compatibilitySpecVersion} は現在対応Version 1.0と異なります`);
    }
    if (!manifest.projectId || typeof manifest.projectId !== "string") {
      errors.push("projectIdがありません");
    }
    if (!Array.isArray(manifest.pages)) {
      errors.push("pagesがArrayではありません");
      return { errors, warnings };
    }
    manifest.pages.forEach((page, pageIndex) => {
      if (!page || typeof page !== "object") {
        errors.push(`pages[${pageIndex}]がObjectではありません`);
        return;
      }
      if (!page.pageId) {
        errors.push(`pages[${pageIndex}].pageIdがありません`);
      }
      if (!page.sourcePath) {
        errors.push(`${page.pageId || `pages[${pageIndex}]`}.sourcePathがありません`);
      }
      if (!["standard-web", "tbalance"].includes(page.sourceAuthority)) {
        errors.push(`${page.pageId || `pages[${pageIndex}]`}.sourceAuthorityが不正です`);
      }
      if (page.sourcePath && /[?#]/.test(page.sourcePath)) {
        errors.push(`${page.pageId || `pages[${pageIndex}]`}.sourcePathにquery/hashを含めないでください`);
      }
      if (!Array.isArray(page.components)) {
        errors.push(`${page.pageId || `pages[${pageIndex}]`}.componentsがArrayではありません`);
        return;
      }
      const exactTbIds = new Set();
      const exactDomRefs = new Set();
      const commonTbIds = new Set();
      const commonDomRefs = new Set();
      const viewTbIds = new Set();
      const viewDomRefs = new Set();
      page.components.forEach((component, componentIndex) => {
        const label = `${page.pageId || `pages[${pageIndex}]`}.components[${componentIndex}]`;
        if (!component || typeof component !== "object") {
          errors.push(`${label}がObjectではありません`);
          return;
        }
        if (!component.tbId) {
          errors.push(`${label}.tbIdがありません`);
        }
        if (!component.domRef) {
          errors.push(`${label}.domRefがありません`);
        }
        const viewState = component.viewState || "";
        const tbKey = `${viewState}\n${component.tbId || ""}`;
        const domKey = `${viewState}\n${component.domRef || ""}`;
        if (component.tbId) {
          if (exactTbIds.has(tbKey)) {
            errors.push(`${page.pageId}.tbId "${component.tbId}" が同一Viewで重複しています`);
          }
          exactTbIds.add(tbKey);
          if (viewState) {
            viewTbIds.add(component.tbId);
          } else {
            commonTbIds.add(component.tbId);
          }
        }
        if (component.domRef) {
          if (exactDomRefs.has(domKey)) {
            errors.push(`${page.pageId}.domRef "${component.domRef}" が同一Viewで重複しています`);
          }
          exactDomRefs.add(domKey);
          if (viewState) {
            viewDomRefs.add(component.domRef);
          } else {
            commonDomRefs.add(component.domRef);
          }
        }
      });
      commonTbIds.forEach((tbId) => {
        if (viewTbIds.has(tbId)) {
          warnings.push(`${page.pageId}.tbId "${tbId}" は共通MappingとView専用Mappingの両方にあります`);
        }
      });
      commonDomRefs.forEach((domRef) => {
        if (viewDomRefs.has(domRef)) {
          warnings.push(`${page.pageId}.domRef "${domRef}" は共通MappingとView専用Mappingの両方にあります`);
        }
      });
    });
    return { errors, warnings };
  }

  function restoreConfirmedMappingsFromManifest(manifest) {
    const restored = [];
    manifest.pages.forEach((page) => {
      page.components.forEach((component) => {
        restored.push({
          mappingId: `mapping_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          pageId: page.pageId,
          page: {
            path: page.sourcePath,
            sourcePath: page.sourcePath,
            viewState: component.viewState || "",
          },
          sourceAuthority: page.sourceAuthority || "standard-web",
          tbId: component.tbId,
          domRef: component.domRef,
          selectorQuality: getSelectorQuality(component.domRef),
          role: component.role || "visual",
          editableProperties: Array.isArray(component.editableProperties) ? component.editableProperties : [],
          protectedProperties: Array.isArray(component.protectedProperties) ? component.protectedProperties : [],
          behaviorRef: component.behaviorRef || null,
          viewState: component.viewState || "",
          importedFromManifest: true,
        });
      });
    });
    state.analyzer.confirmedMappings = restored;
  }

  function clearRuntimeConfirmedMappings() {
    state.analyzer.confirmedMappings = [];
    state.analyzer.mappingWarning = "";
    state.analyzer.manifestWarning = "";
    setManifestStatus("Runtime Confirmed Mappingをクリアしました。Existing HTML/CSS/JSは変更していません。", "success");
    renderAnalyzerResult();
  }

  function setManifestStatus(message, status = "idle") {
    state.analyzer.manifestWarning = status === "warning" ? message : "";
    if (!els.manifestStatus) {
      return;
    }
    els.manifestStatus.textContent = message;
    els.manifestStatus.dataset.status = status;
  }

  window.TBalanceManifestDebug = {
    build: buildAnalyzerManifest,
    validate: validateAnalyzerManifest,
    import: applyAnalyzerManifest,
    clear: clearRuntimeConfirmedMappings,
    getConfirmedMappings: () => state.analyzer.confirmedMappings.map((mapping) => ({ ...mapping })),
    getVisibleMappings: () => getVisibleConfirmedMappings(getAnalyzerManifestPageMeta()).map((mapping) => ({ ...mapping })),
  };

  window.TBalanceSiteMapRuntime = {
    refresh: refreshSiteMap,
    open: openSiteMapPanel,
    close: closeSiteMapPanel,
    getCurrentSiteMap: () => state.siteMap.graph ? JSON.parse(JSON.stringify(state.siteMap.graph)) : null,
    getStatus: () => ({
      open: state.siteMap.open,
      status: state.siteMap.status,
      message: state.siteMap.message,
      selectedPageId: state.siteMap.selectedPageId,
      filter: state.siteMap.filter,
      lastScanAt: state.siteMap.lastScanAt,
    }),
  };

  window.TBalanceSafeApplyDebug = {
    getState: () => ({
      ...state.analyzer.safeApply,
      preflight: state.analyzer.safeApply.preflight ? JSON.parse(JSON.stringify(state.analyzer.safeApply.preflight)) : null,
      result: state.analyzer.safeApply.result ? JSON.parse(JSON.stringify(state.analyzer.safeApply.result)) : null,
    }),
    preflight: runSafeApplyPreflight,
    clear: clearSafeApplyState,
  };

  window.TBalanceAdapterDebug = {
    list: () => adapterRegistry?.list().map((adapter) => ({
      id: adapter.id,
      version: adapter.version,
      label: adapter.label,
      capabilities: { ...adapter.capabilities },
    })) || [],
    setActive: (adapterId) => {
      setAnalyzerAdapter(adapterId);
      const adapter = getActiveAnalyzerAdapter();
      return adapter ? { id: adapter.id, label: adapter.label, version: adapter.version } : null;
    },
    getActive: () => {
      const adapter = getActiveAnalyzerAdapter();
      return adapter ? { id: adapter.id, label: adapter.label, version: adapter.version, capabilities: { ...adapter.capabilities } } : null;
    },
    getKnownPages: () => {
      const adapter = getActiveAnalyzerAdapter();
      return adapter?.getKnownPages?.(getAnalyzerAdapterContext()) || [];
    },
    resolveInternalLink: (target, context = {}) => {
      const adapter = getActiveAnalyzerAdapter();
      return adapter?.resolveInternalLink?.(target, { ...getAnalyzerAdapterContext(), ...context }) || null;
    },
    resolveTestUrl: (target, context = {}) => {
      const adapter = getActiveAnalyzerAdapter();
      return adapter?.resolveTestUrl?.(target, { ...getAnalyzerAdapterContext(), ...context }) || null;
    },
    getComponentMapping: (pageId, tbId, context = {}) => {
      const adapter = getActiveAnalyzerAdapter();
      return adapter?.getComponentMapping?.(pageId, tbId, { ...getAnalyzerAdapterContext(), ...context }) || null;
    },
    getProtectedBehavior: (pageId, tbId, context = {}) => {
      const adapter = getActiveAnalyzerAdapter();
      return adapter?.getProtectedBehavior?.(pageId, tbId, { ...getAnalyzerAdapterContext(), ...context }) || null;
    },
  };

  window.TBalanceSafeChangeDebug = {
    generateFromUi: generateSafeChangeInstruction,
    clear: clearSafeChangeInstruction,
    getCurrent: () => ({
      safeChange: { ...state.analyzer.safeChange },
      json: state.analyzer.safeChange.json ? JSON.parse(JSON.stringify(state.analyzer.safeChange.json)) : null,
      summary: state.analyzer.safeChange.summary,
    }),
    getTargets: () => getVisibleConfirmedMappings(getAnalyzerManifestPageMeta()).map((mapping) => ({
      mappingId: mapping.mappingId,
      pageId: mapping.pageId,
      viewState: mapping.viewState || "",
      tbId: mapping.tbId,
      domRef: mapping.domRef,
      editableProperties: [...(mapping.editableProperties || [])],
      protectedProperties: [...(mapping.protectedProperties || [])],
    })),
  };

  window.TBalanceSafePatchDebug = {
    generateFromUi: generateSafePatchCandidate,
    approve: approveSafePatchCandidate,
    reject: rejectSafePatchCandidate,
    clear: clearSafePatchCandidate,
    getCurrent: () => ({
      safePatch: { ...state.analyzer.safePatch },
      candidate: state.analyzer.safePatch.candidate ? JSON.parse(JSON.stringify(state.analyzer.safePatch.candidate)) : null,
      diffText: state.analyzer.safePatch.diffText,
      summary: state.analyzer.safePatch.summary,
    }),
    resolveSourceForCurrentInstruction: () => {
      const instruction = state.analyzer.safeChange.json;
      const mapping = instruction ? findMappingForSafePatchInstruction(instruction) : null;
      const change = instruction?.changes?.[0] || null;
      if (!instruction || !mapping || !change) {
        return { status: "unresolved", reason: "missing-instruction" };
      }
      return resolveSafePatchSource(instruction, mapping, change);
    },
  };

  function isMappingDomMissing(mapping) {
    const frame = els.analyzerFrame;
    let doc;
    try {
      doc = frame?.contentDocument;
    } catch (error) {
      return false;
    }
    if (!doc || !mapping.domRef) {
      return false;
    }
    try {
      return !doc.querySelector(mapping.domRef);
    } catch (error) {
      return true;
    }
  }

  function getAnalyzerSelectedElement() {
    const result = state.analyzer.result;
    if (!result) {
      return null;
    }
    return result.elements.find((element) => element.candidateId === state.analyzer.selectedId) || result.elements[0] || null;
  }

  function getAnalyzerElementLabel(element) {
    const observed = element.observed;
    if (observed.id) {
      return `${observed.tag}#${observed.id}`;
    }
    const className = observed.className.split(/\s+/).find(Boolean);
    if (className) {
      return `${observed.tag}.${className}`;
    }
    return observed.domRef || observed.tag;
  }

  function getAnalyzerStatusLabel(status) {
    const labels = {
      "safe-visual-edit": "safe",
      "layout-dependency": "layout",
      "behavior-analysis-required": "behavior",
      protected: "protected",
      unknown: "unknown",
    };
    return labels[status] || status || "unknown";
  }

  function getAnalyzerStatusClass(status) {
    return `tb-analyzer-status tb-analyzer-status-${String(status || "unknown").replace(/[^a-z0-9_-]+/gi, "-")}`;
  }

  function countAnalyzerStatus(result, status) {
    return result.elements.filter((element) => element.inferred.analysisStatus === status).length;
  }

  function setAnalyzerStatus(status, message) {
    state.analyzer.message = message;
    if (!els.analyzerStatus) {
      return;
    }
    els.analyzerStatus.dataset.status = status;
    els.analyzerStatus.textContent = message;
  }

  function handleImageMenuAction(action) {
    closeHeaderMenus();
    if (action === "load") {
      els.imageFile.click();
      return;
    }
    const layer = getSelectedImageLayer();
    if (!layer) {
      showModeToast("画像レイヤーを選択してください。");
      return;
    }
    if (action === "replace-desktop" || action === "replace-mobile" || action === "replace-all") {
      const scope = action.replace("replace-", "");
      replaceSelectedImageSource(scope, {
        switchViewport: scope === "desktop" || scope === "mobile" ? scope : "",
      });
      return;
    }
    if (action === "rotate-right" || action === "rotate-left") {
      rotateSelectedImage(action === "rotate-right" ? 90 : -90);
      return;
    }
    if (action === "free-rotate") {
      els.propRotation.focus();
      els.propRotation.select();
      showModeToast("回転の数値を入力できます。キャンバス上の回転ハンドルでも調整できます。");
      return;
    }
    if (action === "flip-x" || action === "flip-y") {
      flipSelectedImage(action === "flip-x" ? "x" : "y");
      return;
    }
    if (action === "fit-canvas") {
      placeSelectedLayer("stretch");
      return;
    }
    if (action === "original-size") {
      restoreSelectedImageOriginalSize(layer);
      return;
    }
    if (action === "brightness") {
      els.propBrightness.focus();
      els.propBrightness.select();
      return;
    }
    const labels = {
      crop: "トリミング",
      mask: "マスク",
      unmask: "マスク解除",
      contrast: "コントラスト",
      saturation: "彩度",
      webp: "WebPに変換",
      compress: "画像を圧縮",
    };
    showModeToast(`${labels[action] || "画像操作"} は次の段階で接続します。`);
  }

  function handleLayerMenuAction(action) {
    closeHeaderMenus();
    const requiresSelection = action !== "new";
    if (requiresSelection && !getSelectedLayer()) {
      showModeToast("レイヤーを選択してください。");
      return;
    }
    if (action === "new") {
      showModeToast("新規レイヤーは、左ツールバーから画像・文字・図形を追加してください。");
      return;
    }
    if (action === "duplicate") {
      duplicateSelectedLayer();
      return;
    }
    if (action === "delete") {
      deleteSelected();
      return;
    }
    if (action.startsWith("align-")) {
      alignSelectedLayer(action.replace("align-", ""));
      return;
    }
    if (action === "space-h" || action === "space-v") {
      showModeToast("均等揃えは複数選択の実装後に接続します。");
      return;
    }
    if (["front", "forward", "backward", "back"].includes(action)) {
      reorderSelected(action);
      return;
    }
    if (action === "fit-canvas") {
      placeSelectedLayer("stretch");
      return;
    }
    if (action === "background") {
      setSelectedAsBackground();
      return;
    }
    if (action === "show" || action === "hide" || action === "lock" || action === "unlock") {
      setSelectedLayerState(action);
    }
  }

  function handleSelectMenuAction(action) {
    closeHeaderMenus();
    if (action === "clear") {
      clearSelection();
      renderAll();
      return;
    }
    if (action === "all") {
      selectLayersBy((layer) => layer.role !== "background");
      return;
    }
    if (action === "invert") {
      invertSelection();
      return;
    }
    if (action.startsWith("type-")) {
      selectLayersBy((layer) => layer.type === action.replace("type-", "") && layer.role !== "background");
      return;
    }
    if (action === "not-background") {
      selectLayersBy((layer) => layer.role !== "background");
      return;
    }
    if (action === "visible") {
      selectLayersBy((layer) => layer.visible !== false && layer.visibilityMode !== "hidden");
      return;
    }
    if (action === "hidden") {
      selectLayersBy((layer) => layer.visible === false || layer.visibilityMode === "hidden");
      return;
    }
    if (action === "locked") {
      selectLayersBy((layer) => Boolean(layer.locked));
      return;
    }
    if (action === "unlocked") {
      selectLayersBy((layer) => !layer.locked);
      return;
    }
    if (action === "front" || action === "back") {
      selectLayerByOrder(action);
    }
  }

  function handleColorMenuAction(action) {
    closeHeaderMenus();
    if (action === "open") {
      setInspectorTab("property");
      showModeToast("右パネルをカラー設定に切り替えました。");
      return;
    }
    if (!getSelectedLayer()) {
      showModeToast("レイヤーを選択してください。");
      return;
    }
    if (action === "opacity") {
      els.propOpacity.focus();
      return;
    }
    if (action === "reset") {
      resetSelectedColors();
      return;
    }
    setInspectorTab("property");
    const labels = {
      fill: "塗りの色",
      stroke: "線の色",
      text: "文字色",
      background: "背景色",
    };
    if ((action === "fill" || action === "stroke") && getSelectedLayer()?.type === "shape") {
      setShapeColorTarget(action);
    }
    showModeToast(`${labels[action] || "カラー設定"} は右パネルで調整します。`);
  }

  function handleAnimationMenuAction(action) {
    closeHeaderMenus();
    activateAnimationTool();
    const layer = getSelectedLayer();
    if (!layer) {
      return;
    }
    if (action === "open") {
      showModeToast("3段目で動き・演出を調整できます。");
      return;
    }
    updateSelectedAnimation((animation) => {
      animation.type = action || "none";
      animation.enabled = animation.type !== "none";
      if (["float", "blink", "rotate"].includes(animation.type)) {
        animation.repeat = "loop";
      }
    });
    showModeToast(action === "none" ? "動き・演出をなしにしました。" : "動き・演出を設定しました。");
  }

  function handleWindowMenuAction(action) {
    closeHeaderMenus();
    if (action === "single" || action === "close-extra" || action === "reset-layout") {
      state.windowMode = "single";
      state.windowLayout = "horizontal";
      state.secondaryWindow = null;
      state.suspendedWindow = null;
      state.activeWindow = "primary";
      renderAll();
      showModeToast(action === "single" ? "1画面表示に戻しました。" : "追加ウィンドウを閉じました。");
      return;
    }
    if (action === "split-horizontal" || action === "split-vertical") {
      state.windowLayout = action === "split-vertical" ? "vertical" : "horizontal";
      if (state.windowMode === "single") {
        state.windowMode = "pc-mobile";
        state.viewport = "desktop";
        state.activeWindow = "primary";
      }
      renderAll();
      showModeToast(action === "split-vertical" ? "上下に並べました。" : "左右に並べました。");
      return;
    }
    if (action === "pc-mobile") {
      if (state.windowMode === "image") {
        suspendImageWindow();
      }
      state.windowMode = "pc-mobile";
      state.windowLayout = "horizontal";
      state.viewport = "desktop";
      state.activeWindow = "primary";
      renderAll();
      showModeToast("PC / Mobile を左右に並べました。");
      return;
    }
    const labels = {
      single: "1画面表示",
      "split-horizontal": "左右に並べる",
      "split-vertical": "上下に並べる",
      "pc-mobile": "PC / Mobile 同時表示",
      reference: "参考画像を開く",
      "close-extra": "追加ウィンドウを閉じる",
    };
    showModeToast(`${labels[action] || "ウィンドウ操作"} は複数ビュー機能で接続します。`);
  }

  function handleHelpMenuAction(action) {
    closeHeaderMenus();
    const labels = {
      intro: "TBalanceの使い方",
      basic: "基本操作",
      image: "画像を追加する",
      background: "背景を設定する",
      responsive: "PC / Mobileを編集する",
      layer: "レイヤーの使い方",
      visibility: "PCのみ表示 / Mobileのみ表示",
      text: "テキスト編集",
      shape: "図形編集",
      animation: "動き・演出",
      click: "クリック動作",
      markup: "Markup / 指示メモ",
      save: "保存と書き出し",
      "final-preview": "公開前チェック",
      shortcuts: "ショートカット",
      faq: "よくある質問",
      version: "バージョン情報",
    };
    showModeToast(`${labels[action] || "ヘルプ"} を開きます。`);
  }

  function activateSecondaryWindow() {
    if (state.windowMode !== "image" && state.windowMode !== "pc-mobile") {
      return;
    }
    state.activeWindow = "secondary";
    if (state.windowMode === "pc-mobile") {
      state.viewport = "mobile";
    }
    if (state.windowMode === "image" && state.secondaryWindow?.pageId) {
      state.pageId = state.secondaryWindow.pageId;
    }
    clearSelection();
  }

  function activatePrimaryWindow() {
    if (state.windowMode === "single") {
      state.activeWindow = "primary";
      return;
    }
    const primaryPage = getPrimaryPage();
    state.activeWindow = "primary";
    state.pageId = primaryPage.id;
    if (state.windowMode === "pc-mobile") {
      state.viewport = "desktop";
    }
    clearSelection();
  }

  function getActiveWindowKey() {
    if (state.windowMode !== "image" && state.windowMode !== "pc-mobile") {
      return "primary";
    }
    if (state.activeWindow === "secondary") {
      return "secondary";
    }
    if (state.windowMode === "image" && state.pageId === state.secondaryWindow?.pageId) {
      return "secondary";
    }
    return "primary";
  }

  function toggleTestMode() {
    state.preview = !state.preview;
    state.testWindow = state.preview ? getActiveWindowKey() : "";
    state.testAction = null;
    state.testPageIds = state.preview
      ? {
        primary: getPrimaryPage()?.id || state.pageId,
        secondary: state.windowMode === "image" ? state.secondaryWindow?.pageId || "" : getPrimaryPage()?.id || state.pageId,
      }
      : { primary: "", secondary: "" };
    state.testPages = {};
    state.testExternalViews = { primary: null, secondary: null };
    state.testNavigation = { primary: [], secondary: [] };
    window.clearTimeout(toggleTestMode.timer);
    showModeToast(state.preview
      ? `${getWindowTestLabel(state.testWindow)}だけTEST中です。反対側は比較表示です。`
      : "TESTを終了しました。");
    renderAll();
  }

  function isWindowInTest(windowKey) {
    return Boolean(state.preview) && (state.testWindow || "primary") === (windowKey === "secondary" ? "secondary" : "primary");
  }

  function getWindowTestLabel(windowKey) {
    if (state.windowMode === "pc-mobile") {
      return windowKey === "secondary" ? "Mobile" : "PC";
    }
    if (state.windowMode === "image") {
      return windowKey === "secondary" ? "別ウィンドウ" : "メイン";
    }
    return state.viewport === "mobile" ? "Mobile" : "PC";
  }

  function getClickTargetLabel(target) {
    const teaMerryLink = getTeaMerryPageLink(target);
    if (teaMerryLink) {
      return teaMerryLink.label;
    }
    const labels = {
      "#hokkori": "今日のほっこり",
      "#wish-star": "願い星を書く",
      "#bottle-mail": "ボトルメール",
      "#forest-map": "森の地図",
      "#back": "戻る",
    };
    return labels[target] || target || "未設定";
  }

  function getTestPageById(pageId) {
    return getPageById(pageId) || state.testPages?.[pageId] || null;
  }

  function getLayerAction(layer) {
    const clickAction = layer?.clickAction || {};
    const link = layer?.link || "";
    const rawTarget = isExternalUrl(link) ? link : (clickAction.target || link || "");
    const target = getCanonicalClickTarget(layer, rawTarget);
    const type = normalizeClickActionType(clickAction.type, target);
    return { type, target };
  }

  function getCanonicalClickTarget(layer, target) {
    const raw = String(target || "").trim();
    const layerTarget = getTestLayerTarget(layer, raw);
    if (layerTarget === "#wish-star") {
      return "https://ratemaru88-blip.github.io/teamerry-forest/observatory.html?wish=1";
    }
    if (layerTarget === "#hokkori") {
      return "https://ratemaru88-blip.github.io/teamerry-forest/observatory.html?hokkori=1";
    }
    const teaMerryLink = getTeaMerryPageLink(raw);
    return teaMerryLink ? teaMerryLink.url : raw;
  }

  function getTestLayerTarget(layer, fallbackTarget = "") {
    const name = normalizeTargetText(layer?.name || "");
    const fileName = normalizeTargetText(layer?.fileName || "");
    if (name.includes("願い星")) {
      return "#wish-star";
    }
    if (name.includes("今日のほっこり") || name.includes("ほっこり")) {
      return "#hokkori";
    }
    if (name.includes("ボトルメール")) {
      return "#bottle-mail";
    }
    if (name.includes("戻る") || name.includes("back") || fileName.includes("back")) {
      return "#back";
    }
    return fallbackTarget;
  }

  function isExternalUrl(value) {
    return /^https?:\/\//i.test(String(value || "").trim());
  }

  const TEA_MERRY_PAGE_LINKS = [
    {
      id: "top",
      label: "トップページ（森）",
      url: "https://ratemaru88-blip.github.io/teamerry-forest/index.html",
      aliases: ["トップページ", "森", "forest", "top", "#forest-map"],
    },
    {
      id: "observatory",
      label: "星風テラス",
      url: "https://ratemaru88-blip.github.io/teamerry-forest/observatory.html",
      aliases: ["星風テラス", "星風", "observatory"],
    },
    {
      id: "hokkori",
      label: "今日のほっこり",
      url: "https://ratemaru88-blip.github.io/teamerry-forest/observatory.html?hokkori=1",
      aliases: ["今日のほっこり", "ほっこり", "hokkori", "#hokkori"],
    },
    {
      id: "wishstar",
      label: "願い星を書く",
      url: "https://ratemaru88-blip.github.io/teamerry-forest/observatory.html?wish=1",
      aliases: ["願い星を書く", "願い星", "wishstar", "wish", "#wish-star"],
    },
    {
      id: "tea-room",
      label: "ティールーム",
      url: "https://ratemaru88-blip.github.io/teamerry-forest/tea_room.html",
      aliases: ["ティールーム", "tea room", "tearoom", "tea_room"],
    },
    {
      id: "ledger",
      label: "森の記録帳",
      url: "https://ratemaru88-blip.github.io/teamerry-forest/ledger.html",
      aliases: ["森の記録帳", "記録帳", "ledger"],
    },
    {
      id: "cave",
      label: "ひみつの洞窟",
      url: "https://ratemaru88-blip.github.io/teamerry-forest/cave.html",
      aliases: ["ひみつの洞窟", "洞窟", "cave"],
    },
    {
      id: "komoremi",
      label: "木漏れ日ページ",
      url: "https://ratemaru88-blip.github.io/teamerry-forest/komoremi.html",
      aliases: ["木漏れ日", "komoremi"],
    },
  ];

  function normalizeTeaMerryUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) {
      return "";
    }
    try {
      const url = new URL(raw, "https://ratemaru88-blip.github.io/teamerry-forest/");
      if (url.hostname !== "ratemaru88-blip.github.io" || !url.pathname.startsWith("/teamerry-forest/")) {
        return raw;
      }
      url.hash = "";
      return url.toString();
    } catch (error) {
      return raw;
    }
  }

  function getTeaMerryPageLink(value) {
    const raw = String(value || "").trim();
    const adapterLink = adapterRegistry?.get("teamerry")?.getPageLink?.(raw);
    if (adapterLink) {
      return {
        id: adapterLink.id,
        label: adapterLink.label,
        url: adapterLink.url,
        aliases: Array.isArray(adapterLink.aliases) ? [...adapterLink.aliases] : [],
        pageId: adapterLink.pageId,
        sourcePath: adapterLink.sourcePath,
        viewState: adapterLink.viewState || "",
      };
    }
    const normalizedUrl = normalizeTeaMerryUrl(raw);
    const normalizedText = normalizeTargetText(raw);
    return TEA_MERRY_PAGE_LINKS.find((link) => {
      if (normalizeTeaMerryUrl(link.url) === normalizedUrl) {
        return true;
      }
      return link.aliases.some((alias) => normalizeTargetText(alias) === normalizedText);
    }) || null;
  }

  function isTeamerryPageUrl(value) {
    return Boolean(getTeaMerryPageLink(value))
      || /^https:\/\/ratemaru88-blip\.github\.io\/teamerry-forest\//i.test(String(value || "").trim());
  }

  function getTeaMerryLocalTestUrl(value) {
    const adapterResult = adapterRegistry?.get("teamerry")?.resolveTestUrl?.(value, {
      baseUrl: window.location.href,
      currentUrl: window.location.href,
      origin: window.location.origin,
    });
    if (adapterResult?.status === "resolved" && adapterResult.url) {
      return adapterResult.url;
    }
    const link = getTeaMerryPageLink(value);
    const raw = String(link?.url || value || "").trim();
    if (!raw || !isTeamerryPageUrl(raw)) {
      return raw;
    }
    try {
      const parsed = new URL(raw, "https://ratemaru88-blip.github.io/teamerry-forest/");
      const fileName = parsed.pathname.replace(/^\/teamerry-forest\//, "") || "index.html";
      return new URL(`../../${fileName}${parsed.search}${parsed.hash}`, window.location.href).toString();
    } catch (error) {
      return raw;
    }
  }

  function getTestExternalDisplayMode(url, windowKey, layer = null) {
    const setting = layer?.clickAction?.displayMode || "auto";
    const viewport = getTestExternalViewport(windowKey);
    if (setting === "full") {
      return "full";
    }
    if (setting === "mobile-modal") {
      return viewport === "desktop" ? "mobile-modal" : "full";
    }
    if (!isTeamerryPageUrl(url)) {
      return "full";
    }
    return viewport === "desktop" && shouldUseMobileModalForTeaMerryUrl(url) ? "mobile-modal" : "full";
  }

  function getTestExternalViewport(windowKey) {
    const key = windowKey === "secondary" ? "secondary" : "primary";
    return state.windowMode === "pc-mobile"
      ? (key === "secondary" ? "mobile" : "desktop")
      : state.viewport;
  }

  function shouldUseMobileModalForTeaMerryUrl(value) {
    const adapter = adapterRegistry?.get("teamerry");
    if (adapter?.shouldUseMobileModal?.(value)) {
      return true;
    }
    try {
      const url = new URL(value, "https://ratemaru88-blip.github.io/teamerry-forest/");
      const pathName = url.pathname.replace(/\/+$/, "");
      if (!pathName.endsWith("/teamerry-forest/observatory.html")) {
        return false;
      }
      return url.searchParams.get("wish") === "1"
        || url.searchParams.get("hokkori") === "1"
        || url.searchParams.get("bottle") === "1";
    } catch (error) {
      return false;
    }
  }

  function normalizeTargetText(target) {
    return String(target || "")
      .trim()
      .replace(/^#/, "")
      .replace(/[＿_\-\s]+/g, "")
      .toLowerCase();
  }

  function getTargetAliases(target) {
    const raw = String(target || "").trim();
    const clean = normalizeTargetText(raw);
    const teaMerryLink = getTeaMerryPageLink(raw);
    const adapterAliases = adapterRegistry?.get("teamerry")?.getClickTargetAliases?.(raw) || [];
    const aliases = {
      hokkori: ["今日のほっこり", "ほっこり", "hokkori"],
      wishstar: ["願い星を書く", "願い星", "wishstar", "wish"],
      bottlemail: ["ボトルメール", "bottlemail"],
      forestmap: ["森の地図", "森マップ", "forestmap"],
      next: ["次へ", "next"],
    };
    return [raw, clean, teaMerryLink?.id, teaMerryLink?.label, ...(teaMerryLink?.aliases || []), ...adapterAliases, ...(aliases[clean] || [])].filter(Boolean);
  }

  function resolveTestTargetPage(target, windowKey) {
    const raw = String(target || "").trim();
    if (!raw || raw === "#back") {
      return null;
    }
    if (raw === "#next") {
      const currentId = getTestCurrentPageId(windowKey);
      const currentIndex = state.project.pages.findIndex((page) => page.id === currentId);
      return state.project.pages[currentIndex + 1] || null;
    }
    const direct = getPageById(raw) || getPageById(raw.replace(/^#/, ""));
    if (direct) {
      return direct;
    }
    const aliases = getTargetAliases(raw).map(normalizeTargetText);
    return state.project.pages.find((page) => {
      const pageId = normalizeTargetText(page.id);
      const pageName = normalizeTargetText(page.name);
      return aliases.some((alias) => alias && (pageId === alias || pageName === alias || pageName.includes(alias)));
    }) || createTestFallbackPage(raw, windowKey);
  }

  function createTestFallbackPage(target, windowKey) {
    const clean = normalizeTargetText(target) || "page";
    const id = `__test_${clean}`;
    state.testPages = state.testPages || {};
    if (state.testPages[id]) {
      return state.testPages[id];
    }
    const label = getClickTargetLabel(target);
    const desktop = { width: 1920, height: 1080 };
    const mobile = { width: 1080, height: 1920 };
    const isMobileWindow = windowKey === "secondary" && state.windowMode === "pc-mobile";
    const page = renderer.normalizeProject({
      name: label,
      pages: [{
        id,
        name: label,
        desktop,
        mobile,
        stage: {
          backgroundType: "solid",
          backgroundColor: "#071018",
        },
        layers: [
          {
            id: `${id}_panel`,
            type: "shape",
            name: `${label} テスト画面`,
            shape: { type: "rect", fill: "#fff6db", stroke: "#19c6e8", strokeWidth: 4, radius: 24 },
            visible: true,
            locked: false,
            desktop: { x: 560, y: 350, width: 800, height: 280, rotation: 0 },
            mobile: { x: 140, y: 690, width: 800, height: 360, rotation: 0 },
            appearance: { opacity: 1, brightness: 1, shadow: "soft" },
          },
          {
            id: `${id}_title`,
            type: "text",
            name: `${label} タイトル`,
            text: label,
            visible: true,
            locked: false,
            desktop: { x: 650, y: 410, width: 620, height: 70, rotation: 0 },
            mobile: { x: 210, y: 760, width: 660, height: 88, rotation: 0 },
            style: { fontSize: isMobileWindow ? 48 : 46, color: "#173326", align: "center", weight: 700 },
            appearance: { opacity: 1, brightness: 1, shadow: "none" },
          },
          {
            id: `${id}_note`,
            type: "text",
            name: "テスト用メモ",
            text: "リンク先ページはまだ未作成です。TEST用の仮画面として表示しています。",
            visible: true,
            locked: false,
            desktop: { x: 645, y: 500, width: 630, height: 64, rotation: 0 },
            mobile: { x: 215, y: 880, width: 650, height: 120, rotation: 0 },
            style: { fontSize: isMobileWindow ? 30 : 28, color: "#325047", align: "center", weight: 600 },
            appearance: { opacity: 1, brightness: 1, shadow: "none" },
          },
          {
            id: `${id}_back`,
            type: "button",
            name: "戻る",
            text: "戻る",
            link: "#back",
            clickAction: { type: "page", target: "#back" },
            visible: true,
            locked: false,
            desktop: { x: 820, y: 675, width: 280, height: 78, rotation: 0 },
            mobile: { x: 360, y: 1110, width: 360, height: 104, rotation: 0 },
            appearance: { opacity: 1, brightness: 1, shadow: "soft" },
          },
        ],
      }],
    }).pages[0];
    state.testPages[id] = page;
    return page;
  }

  function getTestNavigationStack(windowKey) {
    const key = windowKey === "secondary" ? "secondary" : "primary";
    state.testNavigation = state.testNavigation || { primary: [], secondary: [] };
    if (!Array.isArray(state.testNavigation[key])) {
      state.testNavigation[key] = [];
    }
    return state.testNavigation[key];
  }

  function getTestCurrentPageId(windowKey) {
    const key = windowKey === "secondary" ? "secondary" : "primary";
    if (state.preview && state.testPageIds?.[key]) {
      return state.testPageIds[key];
    }
    if (state.windowMode === "image" && windowKey === "secondary" && state.secondaryWindow?.pageId) {
      return state.secondaryWindow.pageId;
    }
    return getPrimaryPage()?.id || state.pageId;
  }

  function setTestPageForWindow(windowKey, pageId) {
    const key = windowKey === "secondary" ? "secondary" : "primary";
    if (state.preview) {
      state.testPageIds = state.testPageIds || { primary: "", secondary: "" };
      state.testPageIds[key] = pageId;
      state.testExternalViews = state.testExternalViews || { primary: null, secondary: null };
      state.testExternalViews[key] = null;
      return;
    }
    if (state.windowMode === "image" && windowKey === "secondary" && state.secondaryWindow) {
      state.secondaryWindow.pageId = pageId;
      state.pageId = pageId;
      return;
    }
    state.primaryPageId = pageId;
    state.pageId = pageId;
  }

  function setTestActionMessage(layer, windowKey, message, event) {
    state.testAction = {
      window: windowKey,
      layerId: layer?.id || "",
      layerName: layer?.name || layer?.id || "TEST",
      message,
      updatedAt: Date.now(),
    };
    window.clearTimeout(handleTestLayerAction.timer);
    handleTestLayerAction.timer = window.setTimeout(() => {
      state.testAction = null;
      renderAll();
    }, 3000);
    showModeToast(`TEST: ${message}`, { event });
  }

  function handleTestBack(layer, event, windowKey) {
    const key = windowKey === "secondary" ? "secondary" : "primary";
    if (state.testExternalViews?.[key]) {
      state.testExternalViews[key] = null;
      setTestActionMessage(layer, windowKey, "TBalance画面へ戻る", event);
      renderAll();
      return true;
    }
    const stack = getTestNavigationStack(windowKey);
    const previousPageId = stack.pop();
    const previousPage = getTestPageById(previousPageId);
    if (!previousPage) {
      setTestActionMessage(layer, windowKey, "戻る先がありません", event);
      renderAll();
      return true;
    }
    setTestPageForWindow(windowKey, previousPage.id);
    clearSelection();
    setTestActionMessage(layer, windowKey, `戻る: ${previousPage.name || "前のページ"}`, event);
    renderAll();
    return true;
  }

  function handleTestExternalNavigation(layer, event, windowKey, target) {
    const url = String(target || "").trim();
    if (!isExternalUrl(url)) {
      return handleTestPageNavigation(layer, event, windowKey, getTestLayerTarget(layer, target));
    }
    const frameUrl = isTeamerryPageUrl(url) ? getTeaMerryLocalTestUrl(url) : url;
    const displayMode = getTestExternalDisplayMode(url, windowKey, layer);
    const displayModeSetting = layer?.clickAction?.displayMode || "auto";
    const key = windowKey === "secondary" ? "secondary" : "primary";
    state.testExternalViews = state.testExternalViews || { primary: null, secondary: null };
    state.testExternalViews[key] = {
      url: frameUrl,
      officialUrl: url,
      title: layer?.name || getClickTargetLabel(target),
      displayMode,
      displayModeSetting,
      viewport: getTestExternalViewport(windowKey),
      updatedAt: Date.now(),
    };
    setTestActionMessage(layer, windowKey, `外部ページを表示: ${layer?.name || url}`, event);
    renderAll();
    return true;
  }

  function handleTestPageNavigation(layer, event, windowKey, target) {
    if (String(target || "").trim() === "#back") {
      return handleTestBack(layer, event, windowKey);
    }
    const targetPage = resolveTestTargetPage(target, windowKey);
    if (!targetPage) {
      const targetLabel = getClickTargetLabel(target);
      setTestActionMessage(layer, windowKey, `リンク先ページ未作成: ${targetLabel}`, event);
      renderAll();
      return true;
    }
    const currentPageId = getTestCurrentPageId(windowKey);
    if (currentPageId && currentPageId !== targetPage.id) {
      getTestNavigationStack(windowKey).push(currentPageId);
    }
    setTestPageForWindow(windowKey, targetPage.id);
    clearSelection();
    const isFallback = String(targetPage.id || "").startsWith("__test_");
    setTestActionMessage(
      layer,
      windowKey,
      isFallback
        ? `テスト画面を表示: ${targetPage.name || getClickTargetLabel(target)}`
        : `ページを表示: ${targetPage.name || getClickTargetLabel(target)}`,
      event,
    );
    renderAll();
    return true;
  }

  function describeTestAction(layer, windowKey) {
    const action = getLayerAction(layer);
    const targetLabel = getClickTargetLabel(action.target);
    if (action.type === "external") {
      return `外部リンクへ移動: ${targetLabel}`;
    }
    if (action.type === "page") {
      return `ページへ移動: ${targetLabel}`;
    }
    if (action.type === "message") {
      return `メッセージ表示: ${targetLabel}`;
    }
    if (action.type === "sound") {
      return `サウンド再生: ${layer.name || "選択レイヤー"}`;
    }
    return `${getWindowTestLabel(windowKey)} TEST: クリック動作は未設定です`;
  }

  function handleTestLayerAction(layer, event, windowKey) {
    event?.preventDefault();
    event?.stopPropagation();
    if (!state.preview) {
      return;
    }
    if (!isWindowInTest(windowKey)) {
      showModeToast(`${getWindowTestLabel(state.testWindow)}だけTEST中です。${getWindowTestLabel(windowKey)}側は比較表示です。`, { event });
      return;
    }
    const action = getLayerAction(layer);
    if (action.type === "page") {
      if (isExternalUrl(action.target)) {
        handleTestExternalNavigation(layer, event, windowKey, action.target);
        return;
      }
      handleTestPageNavigation(layer, event, windowKey, getTestLayerTarget(layer, action.target));
      return;
    }
    if (action.type === "external") {
      handleTestExternalNavigation(layer, event, windowKey, action.target);
      return;
    }
    const message = describeTestAction(layer, windowKey);
    setTestActionMessage(layer, windowKey, message, event);
    renderAll();
  }

  function getWindowZoom(key) {
    const windowKey = key === "secondary" ? "secondary" : "primary";
    return state.windowZoom?.[windowKey] ?? state.zoom ?? "fit";
  }

  function setWindowZoom(key, value) {
    const windowKey = key === "secondary" ? "secondary" : "primary";
    state.windowZoom = state.windowZoom || {};
    state.windowZoom[windowKey] = value;
    if (windowKey === "primary") {
      state.zoom = value;
    }
  }

  function setActiveWindowZoom(value) {
    setWindowZoom(getActiveWindowKey(), value);
  }

  function toggleToolMenu(name, event) {
    event?.preventDefault();
    event?.stopPropagation();
    const targetMenu = document.querySelector(`[data-tool-menu="${name}"]`);
    if (!targetMenu) {
      return;
    }
    const shouldOpen = targetMenu.hidden;
    closeToolMenus();
    targetMenu.hidden = !shouldOpen;
  }

  function closeToolMenus() {
    document.querySelectorAll("[data-tool-menu]").forEach((menu) => {
      menu.hidden = true;
    });
  }

  function closeMarkupMenu() {
    document.querySelector(".tb-markup-menu")?.remove();
  }

  function toggleMarkupMenu(event) {
    event?.preventDefault();
    event?.stopPropagation();
    const existing = document.querySelector(".tb-markup-menu");
    if (existing) {
      existing.remove();
      return;
    }
    closeToolMenus();
    closeHeaderMenus();
    const menu = document.createElement("div");
    menu.className = "tb-markup-menu";
    menu.setAttribute("role", "menu");
    menu.innerHTML = `
      <button type="button" data-markup-action="red-pen">赤ペンで描く</button>
      <button type="button" data-markup-action="arrow">矢印を入れる</button>
      <button type="button" data-markup-action="box">囲みを入れる</button>
      <button type="button" data-markup-action="text">指示テキストを入れる</button>
      <button type="button" data-markup-action="list">指示一覧を確認</button>
      <span class="tb-markup-menu-divider"></span>
      <button type="button" data-markup-action="show">赤ペンを表示</button>
      <button type="button" data-markup-action="hide">赤ペンを非表示</button>
      <button type="button" data-markup-action="export">赤ペンを書き出す</button>
      <button type="button" data-markup-action="ai">AIへ指示として渡す</button>
    `;
    menu.addEventListener("click", (menuEvent) => {
      const button = menuEvent.target.closest("[data-markup-action]");
      if (!button) {
        return;
      }
      handleMarkupAction(button.dataset.markupAction, menuEvent);
    });
    document.body.appendChild(menu);
    const rect = els.markupButton.getBoundingClientRect();
    menu.style.top = `${Math.round(rect.bottom + 8)}px`;
    menu.style.left = `${Math.round(Math.min(rect.left, window.innerWidth - menu.offsetWidth - 12))}px`;
  }

  function handleMarkupAction(action, event) {
    closeMarkupMenu();
    if (action === "red-pen") {
      activateMarkupPen(event);
    } else if (action === "arrow") {
      addMarkupShape("arrow");
    } else if (action === "box") {
      addMarkupShape("rect");
    } else if (action === "text") {
      addMarkupText();
    } else if (action === "list") {
      showMarkupLayerSummary();
    } else if (action === "show" || action === "hide") {
      setMarkupVisibility(action === "show");
    } else if (action === "export") {
      exportMarkupInstructions();
    } else if (action === "ai") {
      showModeToast("AIへ渡す機能は次の段階でつなぎます。今は赤ペン指示を書き出せます。", { event });
    }
  }

  function activateMarkupPen(event) {
    state.markupPenMode = true;
    updateActiveColor("#ff3b3b", { applyToShape: false });
    state.brushSize = Math.max(8, Math.min(24, Number(state.brushSize) || 12));
    state.brushOpacity = 100;
    setTool("pen", event);
    state.markupPenMode = true;
    renderPropertyMode();
    showModeToast("赤ペン指示モード: 画面に直接修正指示を描けます。", { event });
  }

  function addMarkupShape(shapeType) {
    const activeViewport = getActiveViewportKey();
    const page = getCurrentPage();
    const size = getPageViewportSize(page, activeViewport);
    const isArrow = shapeType === "arrow";
    const width = isArrow ? 320 : 360;
    const height = isArrow ? 130 : 220;
    const layout = createCenteredLayout({ x: size.width / 2, y: size.height / 2 }, width, height);
    const inactiveLayout = createHiddenViewportLayout({ x: 0, y: 0, width, height });
    addLayer({
      type: "shape",
      name: isArrow ? "赤ペン矢印" : "赤ペン囲み",
      role: "markup",
      shape: {
        type: shapeType,
        fill: isArrow ? "rgba(255, 59, 59, 0.22)" : "rgba(255, 59, 59, 0.04)",
        fillEnabled: isArrow,
        stroke: "#ff3b3b",
        strokeEnabled: true,
        strokeWidth: isArrow ? 5 : 4,
        radius: 0,
      },
      desktop: activeViewport === "desktop" ? layout : inactiveLayout,
      mobile: activeViewport === "mobile" ? layout : inactiveLayout,
      visibilityMode: activeViewport === "mobile" ? "mobile" : "desktop",
      appearance: { opacity: 1, brightness: 1, shadow: "none" },
      constraints: { keepAspect: false, keepSquare: false, keepCircle: false },
    });
    showModeToast(isArrow ? "赤ペン矢印を追加しました。" : "赤ペン囲みを追加しました。");
  }

  function addMarkupText() {
    const activeViewport = getActiveViewportKey();
    const page = getCurrentPage();
    const size = getPageViewportSize(page, activeViewport);
    const width = activeViewport === "mobile" ? 440 : 360;
    const height = activeViewport === "mobile" ? 110 : 90;
    const layout = createCenteredLayout({ x: size.width / 2, y: size.height / 2 }, width, height);
    const inactiveLayout = createHiddenViewportLayout({ x: 0, y: 0, width, height });
    addLayer({
      type: "text",
      name: "赤ペン指示テキスト",
      role: "markup",
      text: "ここを調整",
      style: {
        fontFamily: '"Noto Sans JP", "Yu Gothic", sans-serif',
        fontSize: 42,
        fontWeight: 800,
        italic: false,
        underline: false,
        color: "#fff6f6",
        strokeColor: "#9b1212",
        strokeWidth: 3,
        shadowColor: "rgba(0,0,0,0.55)",
        shadowBlur: 8,
        shadowOpacity: 70,
      },
      desktop: activeViewport === "desktop" ? layout : inactiveLayout,
      mobile: activeViewport === "mobile" ? layout : inactiveLayout,
      visibilityMode: activeViewport === "mobile" ? "mobile" : "desktop",
      appearance: { opacity: 1, brightness: 1, shadow: "soft" },
      constraints: { keepAspect: false, keepSquare: false, keepCircle: false },
    });
    showModeToast("赤ペン指示テキストを追加しました。");
  }

  function getMarkupLayers(page = getCurrentPage()) {
    return (page.layers || []).filter((layer) => layer.role === "markup");
  }

  function setMarkupVisibility(visible) {
    const layers = getMarkupLayers();
    layers.forEach((layer) => {
      layer.visible = visible;
    });
    markDirty();
    renderAll();
    showModeToast(visible ? "赤ペン指示を表示しました。" : "赤ペン指示を非表示にしました。");
  }

  function showMarkupLayerSummary() {
    const layers = getMarkupLayers();
    if (!layers.length) {
      showModeToast("赤ペン指示はまだありません。");
      return;
    }
    state.selectedIds = layers.map((layer) => layer.id);
    state.selectedId = state.selectedIds[state.selectedIds.length - 1] || "";
    renderAll();
    showModeToast(`赤ペン指示: ${layers.length}件あります。`);
  }

  function exportMarkupInstructions() {
    const page = getCurrentPage();
    const layers = getMarkupLayers(page);
    const lines = [
      "TBalance Markup Instructions",
      `Page: ${page?.name || page?.id || "-"}`,
      `Date: ${new Date().toLocaleString()}`,
      "",
    ];
    if (!layers.length) {
      lines.push("赤ペン指示はありません。");
    } else {
      layers.forEach((layer, index) => {
        const layout = getCurrentLayout(layer);
        lines.push(`${index + 1}. ${layer.name || layer.id}`);
        lines.push(`   type: ${layer.type || "-"} / role: ${layer.role || "-"}`);
        lines.push(`   x:${Math.round(layout.x)} y:${Math.round(layout.y)} w:${Math.round(layout.width)} h:${Math.round(layout.height)}`);
        if (layer.text) {
          lines.push(`   text: ${String(layer.text).replace(/\n/g, " / ")}`);
        }
        if (layer.link) {
          lines.push(`   link: ${layer.link}`);
        }
      });
    }
    downloadBlob(lines.join("\n"), `${getProjectBaseName()}_markup.txt`, "text/plain");
    showModeToast("赤ペン指示を書き出しました。");
  }

  function handleDocumentPointerDown(event) {
    if (!event.target.closest(".tb-tool-menu-wrap")) {
      closeToolMenus();
    }
    if (!event.target.closest(".tb-markup-menu") && !event.target.closest("#markupButton")) {
      closeMarkupMenu();
    }
    if (!event.target.closest(".tb-header-menu-wrap")) {
      closeHeaderMenus();
    }
    if (!event.target.closest(".tb-button-template-dialog")) {
      closeButtonTemplateDialog();
    }
  }

  function handleClickActionMenu(action) {
    closeToolMenus();
    if (action === "button") {
      showButtonTemplateDialog();
      return;
    }
    if (action === "hit-rect" || action === "hit-ellipse") {
      addClickHitAreaLayer(action === "hit-ellipse" ? "ellipse" : "rect");
      return;
    }
    if (action === "hit-area") {
      enableHitAreaForSelected();
    }
  }

  function showButtonTemplateDialog() {
    closeButtonTemplateDialog();
    const dialog = document.createElement("div");
    dialog.className = "tb-button-template-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-label", "ボタンテンプレート");
    dialog.innerHTML = `
      <div class="tb-button-template-head">
        <strong>ボタンテンプレート</strong>
        <button type="button" data-button-template-close aria-label="閉じる">×</button>
      </div>
      <div class="tb-button-template-grid">
        ${BUTTON_TEMPLATES.map((template) => `
          <button type="button" data-button-template="${escapeAttr(template.fileName)}" title="${escapeAttr(template.label)}">
            <img src="${escapeAttr(template.src)}" alt="">
            <span>${escapeHtml(template.label)}</span>
          </button>
        `).join("")}
      </div>
      <div class="tb-button-template-actions">
        <button type="button" data-button-template-standard>標準ボタンを作成</button>
      </div>
    `;
    document.body.appendChild(dialog);
    dialog.querySelector("[data-button-template-close]")?.addEventListener("click", closeButtonTemplateDialog);
    dialog.querySelector("[data-button-template-standard]")?.addEventListener("click", () => {
      closeButtonTemplateDialog();
      addButtonLayer();
    });
    dialog.querySelectorAll("[data-button-template]").forEach((button) => {
      button.addEventListener("click", () => {
        const template = BUTTON_TEMPLATES.find((item) => item.fileName === button.dataset.buttonTemplate);
        closeButtonTemplateDialog();
        if (template) {
          addImageButtonLayer(template);
        }
      });
    });
  }

  function closeButtonTemplateDialog() {
    document.querySelector(".tb-button-template-dialog")?.remove();
  }

  function addClickHitAreaLayer(shape) {
    const activeViewport = getActiveViewportKey();
    const page = getCurrentPage();
    const size = getPageViewportSize(page, activeViewport);
    const desktopSize = getPageViewportSize(page, "desktop");
    const mobileSize = getPageViewportSize(page, "mobile");
    state.showHitAreas = true;
    setTool("click");
    const isEllipse = shape === "ellipse";
    const width = isEllipse ? 260 : 300;
    const height = isEllipse ? 190 : 150;
    const layout = createCenteredLayout({ x: size.width / 2, y: size.height / 2 }, width, height);
    const desktopLayout = activeViewport === "desktop"
      ? layout
      : createCenteredLayout({ x: desktopSize.width / 2, y: desktopSize.height / 2 }, width, height);
    const mobileLayout = activeViewport === "mobile"
      ? layout
      : createCenteredLayout({ x: mobileSize.width / 2, y: mobileSize.height / 2 }, width, height);
    const id = addLayer({
      type: "shape",
      name: isEllipse ? "丸・楕円当たり判定" : "四角当たり判定",
      role: "hit-area",
      shape: {
        type: isEllipse ? "ellipse" : "rect",
        fill: "rgba(48, 211, 106, 0.12)",
        fillEnabled: true,
        stroke: "#30d36a",
        strokeEnabled: true,
        strokeWidth: 3,
      },
      link: "#",
      clickAction: { type: "page", target: "#" },
      desktop: desktopLayout,
      mobile: mobileLayout,
      visibilityMode: "both",
      appearance: { opacity: 0.45, brightness: 1, shadow: "none" },
      hitArea: { enabled: true, visible: true, x: 0, y: 0, width, height },
      constraints: { keepAspect: false, keepSquare: false, keepCircle: isEllipse },
    });
    syncHitAreaToLayer(findLayer(id));
    showModeToast(isEllipse ? "丸・楕円の当たり判定を作成しました。" : "四角の当たり判定を作成しました。");
  }

  function enableHitAreaForSelected() {
    const layer = getSelectedLayer();
    state.showHitAreas = true;
    setTool("click");
    if (!layer) {
      renderAll();
      showModeToast("当たり判定: レイヤーを選ぶとクリック範囲を設定できます。");
      return;
    }
    pushHistory();
    const layout = getCurrentLayout(layer);
    layer.link = layer.link || "#";
    layer.visibilityMode = "both";
    layer.hitArea = Object.assign({}, layer.hitArea || {}, {
      enabled: true,
      visible: true,
      x: 0,
      y: 0,
      width: Math.max(1, Number(layout.width) || 1),
      height: Math.max(1, Number(layout.height) || 1),
    });
    markDirty();
    renderAll();
    showModeToast("当たり判定をONにしました。リンク欄でクリック時の移動先を設定できます。");
  }

  function syncHitAreaToLayer(layer) {
    if (!layer || !layer.hitArea?.enabled) {
      return;
    }
    if (layer.role !== "hit-area" && state.tool !== "click") {
      return;
    }
    const layout = getCurrentLayout(layer);
    layer.hitArea = Object.assign({}, layer.hitArea, {
      x: 0,
      y: 0,
      width: Math.max(1, Math.round(Number(layout.width) || 1)),
      height: Math.max(1, Math.round(Number(layout.height) || 1)),
    });
  }

  function getClickPresetValue(value) {
    const teaMerryLink = getTeaMerryPageLink(value);
    if (teaMerryLink) {
      return teaMerryLink.url;
    }
    const known = [
      ...TEA_MERRY_PAGE_LINKS.map((link) => link.url),
      "#hokkori",
      "#wish-star",
      "#bottle-mail",
      "#forest-map",
      "#back",
      "#next",
    ];
    return known.includes(value) ? value : "";
  }

  function hasClickControls(layer) {
    if (!layer) {
      return false;
    }
    return layer.role === "button"
      || layer.role === "hit-area"
      || isLikelyButtonLayer(layer)
      || Boolean(layer.link)
      || Boolean(layer.clickAction?.type && layer.clickAction.type !== "none")
      || Boolean(layer.hitArea?.enabled);
  }

  function isLikelyButtonLayer(layer) {
    const text = [
      layer?.name,
      layer?.fileName,
      layer?.src,
      layer?.originalSrc,
    ].filter(Boolean).join(" ").toLowerCase();
    return /戻る|次へ|back_buttan|back_button|button|btn/.test(text);
  }

  function normalizeClickActionType(type, target = "") {
    if (type === "external" || type === "page" || type === "message" || type === "sound") {
      return type;
    }
    if (type === "none") {
      return target ? (isExternalUrl(target) && !isTeamerryPageUrl(target) ? "external" : "page") : "none";
    }
    if (type === "link") {
      return isExternalUrl(target) && !isTeamerryPageUrl(target) ? "external" : "page";
    }
    if (!target) {
      return "none";
    }
    return isExternalUrl(target) && !isTeamerryPageUrl(target) ? "external" : "page";
  }

  function bindPropertyInputs() {
    [
      ["propName", (layer, value) => { layer.name = value; }],
      ["propLink", (layer, value) => {
        layer.link = value;
        layer.clickAction = layer.clickAction || {};
        layer.clickAction.type = value ? normalizeClickActionType(layer.clickAction.type, value) : "none";
        layer.clickAction.target = value;
        layer.hitArea.enabled = Boolean(value) || layer.role === "hit-area";
      }],
    ].forEach(([key, apply]) => {
      els[key].addEventListener("input", () => updateSelected((layer) => apply(layer, els[key].value)));
    });

    els.propClickAction.addEventListener("change", () => updateSelected((layer) => {
      const nextType = els.propClickAction.value;
      if (nextType === "external") {
        els.propClickPreset.value = "";
      }
      els.propClickPreset.disabled = nextType !== "page";
      layer.clickAction = Object.assign({}, layer.clickAction || {}, {
        type: nextType,
        target: els.propLink.value,
      });
      if (nextType === "none") {
        layer.link = "";
        layer.clickAction.target = "";
      } else if (nextType === "page" && els.propClickPreset.value) {
        layer.link = els.propClickPreset.value;
        layer.clickAction.target = layer.link;
      }
      layer.hitArea.enabled = layer.role === "hit-area" || Boolean(layer.link);
    }));

    els.propClickPreset.addEventListener("change", () => updateSelected((layer) => {
      const value = els.propClickPreset.value;
      layer.clickAction = Object.assign({}, layer.clickAction || {});
      if (value) {
        layer.link = value;
        layer.clickAction.type = "page";
        layer.clickAction.target = value;
        els.propClickAction.value = "page";
      }
      layer.hitArea.enabled = layer.role === "hit-area" || Boolean(layer.link);
    }));

    els.propClickDisplayMode?.addEventListener("change", () => updateSelected((layer) => {
      layer.clickAction = Object.assign({}, layer.clickAction || {}, {
        displayMode: els.propClickDisplayMode.value || "auto",
      });
    }));

    els.propSoundTarget?.addEventListener("change", renderProperties);
    els.propSoundTrigger?.addEventListener("change", () => updateSoundTarget((sound) => {
      sound.trigger = getSoundTriggerForMode(state.soundMode);
    }));
    els.propSoundVolume?.addEventListener("input", () => updateSoundTarget((sound) => {
      sound.volume = renderer.clamp(Number(els.propSoundVolume.value) || 0, 0, 100);
      els.propSoundVolumeValue.textContent = `${sound.volume}%`;
    }));
    els.propSoundLoop?.addEventListener("change", () => updateSoundTarget((sound) => {
      sound.loop = els.propSoundLoop.checked;
    }));
    els.propSoundChoose?.addEventListener("click", () => {
      els.soundFile.value = "";
      els.soundFile.click();
    });
    els.propSoundClear?.addEventListener("click", clearSoundTarget);
    els.propFillType?.addEventListener("change", () => {
      state.fillType = els.propFillType.value === "gradient" ? "gradient" : "solid";
      if (state.fillType === "gradient") {
        showModeToast("グラデーション塗りは次の段階で追加します。");
        state.fillType = "solid";
        els.propFillType.value = "solid";
      }
    });
    els.propFillColor?.addEventListener("input", () => updateActiveColor(els.propFillColor.value, { applyToShape: false }));
    els.propFillOpacity?.addEventListener("input", () => {
      state.fillOpacity = renderer.clamp(Number(els.propFillOpacity.value) || 0, 0, 100);
      els.propFillOpacityValue.textContent = `${state.fillOpacity}%`;
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
        syncHitAreaToLayer(layer);
      }));
    });

    els.propBrightness.addEventListener("input", () => updateSelected((layer) => {
      layer.appearance.brightness = Number(els.propBrightness.value) || 1;
    }));
    els.propShapeType.addEventListener("change", () => updateSelectedShape((shape) => {
      shape.type = els.propShapeType.value || "rect";
    }));
    els.propShapeFillMode.addEventListener("change", () => updateSelectedShape((shape) => {
      shape.fillEnabled = els.propShapeFillMode.value !== "none";
    }));
    els.propShapeFill.addEventListener("input", () => updateSelectedShape((shape) => {
      shape.fill = els.propShapeFill.value;
      shape.fillEnabled = true;
    }));
    els.propShapeFill.addEventListener("focus", () => setShapeColorTarget("fill"));
    els.propShapeFill.addEventListener("click", () => setShapeColorTarget("fill"));
    els.propShapeStroke.addEventListener("input", () => updateSelectedShape((shape) => {
      shape.stroke = els.propShapeStroke.value;
      shape.strokeEnabled = true;
    }));
    els.propShapeStrokeMode.addEventListener("change", () => updateSelectedShape((shape) => {
      shape.strokeEnabled = els.propShapeStrokeMode.value !== "none";
    }));
    els.propShapeStroke.addEventListener("focus", () => setShapeColorTarget("stroke"));
    els.propShapeStroke.addEventListener("click", () => setShapeColorTarget("stroke"));
    els.propShapeStrokeWidth.addEventListener("input", () => updateSelectedShape((shape) => {
      shape.strokeWidth = renderer.clamp(Number(els.propShapeStrokeWidth.value) || 0, 0, 80);
    }));
    els.propShapeRadius.addEventListener("input", () => updateSelectedShape((shape) => {
      shape.radius = renderer.clamp(Number(els.propShapeRadius.value) || 0, 0, 50);
    }));
    els.propShapeShadow.addEventListener("change", () => updateSelected((layer) => {
      layer.appearance.shadow = els.propShapeShadow.checked ? "soft" : "none";
      layer.appearance.shadowType = layer.appearance.shadowType || "soft";
      layer.appearance.shadowSize = Number(layer.appearance.shadowSize) || 16;
      layer.appearance.shadowColor = layer.appearance.shadowColor || "rgba(0, 0, 0, 0.38)";
      layer.appearance.shadowOpacity = Number(layer.appearance.shadowOpacity ?? 38);
    }));
    els.propShapeShadowType.addEventListener("change", () => updateSelected((layer) => {
      layer.appearance.shadow = "soft";
      layer.appearance.shadowType = els.propShapeShadowType.value === "solid" ? "solid" : "soft";
    }));
    els.propShapeShadowSize.addEventListener("input", () => updateSelected((layer) => {
      layer.appearance.shadow = Number(els.propShapeShadowSize.value) > 0 ? "soft" : "none";
      layer.appearance.shadowSize = renderer.clamp(Number(els.propShapeShadowSize.value) || 0, 0, 80);
    }));
    els.propShapeShadowColor.addEventListener("input", () => updateSelected((layer) => {
      layer.appearance.shadow = "soft";
      layer.appearance.shadowColor = els.propShapeShadowColor.value;
    }));
    els.propShapeShadowOpacity.addEventListener("input", () => updateSelected((layer) => {
      layer.appearance.shadow = Number(els.propShapeShadowOpacity.value) > 0 ? "soft" : "none";
      layer.appearance.shadowOpacity = renderer.clamp(Number(els.propShapeShadowOpacity.value) || 0, 0, 100);
    }));
    els.propTextFont.addEventListener("change", () => updateSelectedTextStyle((style) => {
      style.fontFamily = els.propTextFont.value === "system" ? "" : els.propTextFont.value;
    }));
    els.propTextFontSize.addEventListener("input", () => updateSelectedTextStyle((style) => {
      style.fontSize = renderer.clamp(Number(els.propTextFontSize.value) || 48, 8, 300);
    }));
    els.propTextBold.addEventListener("click", () => updateSelectedTextStyle((style) => {
      style.weight = Number(style.weight || 400) >= 700 ? 400 : 700;
    }));
    els.propTextItalic.addEventListener("click", () => updateSelectedTextStyle((style) => {
      style.italic = !style.italic;
    }));
    els.propTextUnderline.addEventListener("click", () => updateSelectedTextStyle((style) => {
      style.underline = !style.underline;
    }));
    els.propTextColor.addEventListener("input", () => updateSelectedTextStyle((style) => {
      style.color = els.propTextColor.value;
    }));
    els.propTextStrokeMode.addEventListener("change", () => updateSelectedTextStyle((style) => {
      style.strokeEnabled = els.propTextStrokeMode.value !== "none";
      if (style.strokeEnabled && !Number(style.strokeWidth || 0)) {
        style.strokeWidth = 2;
      }
    }));
    els.propTextStrokeColor.addEventListener("input", () => updateSelectedTextStyle((style) => {
      style.strokeColor = els.propTextStrokeColor.value;
      style.strokeEnabled = true;
    }));
    els.propTextStrokeWidth.addEventListener("input", () => updateSelectedTextStyle((style) => {
      style.strokeWidth = renderer.clamp(Number(els.propTextStrokeWidth.value) || 0, 0, 24);
      style.strokeEnabled = Number(style.strokeWidth) > 0;
    }));
    els.propTextShadow.addEventListener("change", () => updateSelected((layer) => {
      layer.appearance.shadow = els.propTextShadow.checked ? "soft" : "none";
      layer.appearance.shadowType = layer.appearance.shadowType || "soft";
      layer.appearance.shadowSize = Number(layer.appearance.shadowSize) || 16;
      layer.appearance.shadowColor = layer.appearance.shadowColor || "rgba(0, 0, 0, 0.38)";
      layer.appearance.shadowOpacity = Number(layer.appearance.shadowOpacity ?? 38);
    }));
    els.propTextShadowType.addEventListener("change", () => updateSelected((layer) => {
      layer.appearance.shadow = "soft";
      layer.appearance.shadowType = els.propTextShadowType.value === "solid" ? "solid" : "soft";
    }));
    els.propTextShadowSize.addEventListener("input", () => updateSelected((layer) => {
      layer.appearance.shadow = Number(els.propTextShadowSize.value) > 0 ? "soft" : "none";
      layer.appearance.shadowSize = renderer.clamp(Number(els.propTextShadowSize.value) || 0, 0, 80);
    }));
    els.propTextShadowColor.addEventListener("input", () => updateSelected((layer) => {
      layer.appearance.shadow = "soft";
      layer.appearance.shadowColor = els.propTextShadowColor.value;
    }));
    els.propTextShadowOpacity.addEventListener("input", () => updateSelected((layer) => {
      layer.appearance.shadow = Number(els.propTextShadowOpacity.value) > 0 ? "soft" : "none";
      layer.appearance.shadowOpacity = renderer.clamp(Number(els.propTextShadowOpacity.value) || 0, 0, 100);
    }));
    els.propAnimationType.addEventListener("change", () => updateSelectedAnimation((animation) => {
      animation.type = els.propAnimationType.value;
      animation.enabled = animation.type !== "none";
    }));
    els.propAnimationTrigger.addEventListener("change", () => updateSelectedAnimation((animation) => {
      animation.trigger = els.propAnimationTrigger.value;
    }));
    els.propAnimationDuration.addEventListener("input", () => updateSelectedAnimation((animation) => {
      animation.duration = renderer.clamp(Number(els.propAnimationDuration.value) || 1, 0.1, 20);
    }));
    els.propAnimationDelay.addEventListener("input", () => updateSelectedAnimation((animation) => {
      animation.delay = renderer.clamp(Number(els.propAnimationDelay.value) || 0, 0, 20);
    }));
    els.propAnimationRepeat.addEventListener("change", () => updateSelectedAnimation((animation) => {
      animation.repeat = els.propAnimationRepeat.value;
    }));
    els.propAnimationDirection.addEventListener("change", () => updateSelectedAnimation((animation) => {
      animation.direction = els.propAnimationDirection.value;
    }));
    els.propAnimationStrength.addEventListener("input", () => updateSelectedAnimation((animation) => {
      animation.strength = renderer.clamp(Number(els.propAnimationStrength.value) || 30, 1, 100);
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
    els.renameLayer.addEventListener("click", renameSelectedLayer);
    els.deleteLayer.addEventListener("click", (event) => deleteSelected(event.currentTarget));
  }

  function renameSelectedLayer() {
    const layer = getSelectedLayer();
    if (!layer) {
      showModeToast("名前を変更するレイヤーを選択してください。");
      return;
    }
    renderAll();
    requestAnimationFrame(() => {
      const nameNode = els.layerList.querySelector(`[data-layer-rename="${CSS.escape(layer.id)}"]`);
      if (nameNode) {
        beginInlineLayerRename(nameNode, layer);
      }
    });
  }

  function groupSelectedLayers() {
    const layers = getSelectedLayers().filter((layer) => !layer.locked && layer.role !== "background");
    if (layers.length < 2) {
      showModeToast("グループ化するレイヤーを2つ以上選択してください。");
      return;
    }
    pushHistory();
    const groupId = renderer.makeId("group");
    const baseName = getGroupDisplayName(layers);
    layers.forEach((layer) => {
      layer.groupId = groupId;
      layer.groupName = baseName;
    });
    markDirty();
    renderAll();
    showModeToast(`${layers.length}個のレイヤーを「${baseName}」としてグループ化しました。`);
  }

  function getGroupDisplayName(layers) {
    const hasButton = layers.some((layer) => layer.role === "button" || layer.type === "button");
    const textLayer = layers.find((layer) => layer.type === "text" && layer.text);
    if (hasButton && textLayer?.text) {
      return `${String(textLayer.text).split(/\r?\n/)[0]}ボタン`;
    }
    return "グループ";
  }

  function ungroupSelectedLayers() {
    const groupIds = Array.from(new Set(getSelectedLayers().map((layer) => layer.groupId).filter(Boolean)));
    if (!groupIds.length) {
      showModeToast("解除するグループを選択してください。");
      return;
    }
    pushHistory();
    let count = 0;
    getCurrentPage().layers.forEach((layer) => {
      if (groupIds.includes(layer.groupId)) {
        delete layer.groupId;
        delete layer.groupName;
        count += 1;
      }
    });
    state.selectedIds = getSelectedIds();
    markDirty();
    renderAll();
    showModeToast(`${count}個のレイヤーのグループを解除しました。`);
  }

  function setViewport(viewport) {
    const nextViewport = renderer.getViewportKey(viewport);
    if (nextViewport === "desktop" && restoreSuspendedWindow()) {
      return;
    }
    const primaryPage = getPrimaryPage();
    if (nextViewport === "desktop" && state.windowMode === "image") {
      state.viewport = "desktop";
      state.pageId = primaryPage.id;
      state.primaryPageId = primaryPage.id;
      state.activeWindow = "primary";
      clearSelection();
      renderAll();
      return;
    }
    if (state.windowMode === "image") {
      suspendImageWindow();
    }
    state.windowMode = "single";
    state.windowLayout = "horizontal";
    state.secondaryWindow = null;
    state.pageId = primaryPage.id;
    state.primaryPageId = primaryPage.id;
    state.activeWindow = "primary";
    state.viewport = nextViewport;
    clearSelection();
    renderAll();
  }

  function suspendImageWindow() {
    if (state.windowMode !== "image" || !state.secondaryWindow?.pageId) {
      return;
    }
    state.suspendedWindow = {
      mode: "image",
      layout: state.windowLayout,
      primaryPageId: getPrimaryPage().id,
      secondaryWindow: Object.assign({}, state.secondaryWindow),
    };
  }

  function restoreSuspendedWindow() {
    const suspended = state.suspendedWindow;
    if (suspended?.mode !== "image" || !getPageById(suspended.secondaryWindow?.pageId)) {
      state.suspendedWindow = null;
      return false;
    }
    state.windowMode = "image";
    state.windowLayout = suspended.layout || "horizontal";
    state.primaryPageId = getPageById(suspended.primaryPageId)?.id || state.pageId;
    state.secondaryWindow = Object.assign({}, suspended.secondaryWindow);
    state.pageId = state.primaryPageId;
    state.activeWindow = "primary";
    state.viewport = "desktop";
    state.suspendedWindow = null;
    clearSelection();
    renderAll();
    showModeToast("比較ウィンドウに戻しました。");
    return true;
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

  function setTool(tool, event) {
    state.tool = tool;
    if (tool !== "pen") {
      state.markupPenMode = false;
    }
    document.querySelectorAll("[data-tool]").forEach((node) => {
      node.classList.toggle("is-active", node.dataset.tool === tool);
    });
    document.body.classList.toggle("is-eyedropper-active", tool === "eyedropper");
    document.body.classList.toggle("is-pen-active", tool === "pen");
    document.body.classList.toggle("is-clone-active", tool === "clone");
    document.body.classList.toggle("is-eraser-active", tool === "eraser");
    document.body.classList.toggle("is-fill-active", tool === "fill");
    document.body.classList.toggle("is-retouch-active", tool === "retouch");
    if (!isBrushPreviewTool(tool)) {
      hideBrushPreview();
    }
    renderPropertyMode();
    if (tool === "clone") {
      showModeToast("クローンブラシ: 右クリックでコピー元、左ドラッグで写します。", { event });
    } else if (tool === "fill") {
      showModeToast("塗りつぶし: 選択範囲またはレイヤーをクリックして塗ります。", { event });
    } else if (tool === "retouch") {
      showModeToast("レタッチ: 明るく・暗く・ソフトなどの部分補正を行うツールです。", { event });
    }
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

  function persistGridGuideSettings(options) {
    if (!options || options.skipInputs !== true) {
      state.uiSettings.gridStepX = readPositiveNumber(els.gridStepX, state.uiSettings.gridStepX || 100);
      state.uiSettings.gridStepY = readPositiveNumber(els.gridStepY, state.uiSettings.gridStepY || 100);
      state.uiSettings.guideStepX = readPositiveNumber(els.guideStepX, state.uiSettings.guideStepX || 320);
      state.uiSettings.guideStepY = readPositiveNumber(els.guideStepY, state.uiSettings.guideStepY || 180);
      state.uiSettings.snapToGrid = els.snapToGrid.checked;
      state.uiSettings.snapToGuide = els.snapToGuide.checked;
    }
    syncProjectEditorSettings();
    persistUiSettings();
    markDirty();
    renderAll();
    if (!options || options.silent !== true) {
      showModeToast("グリッド・ガイド設定を更新しました。");
    }
  }

  function readPositiveNumber(input, fallback) {
    const value = Math.round(Number(input.value));
    return Math.max(1, Number.isFinite(value) ? value : fallback);
  }

  function getSnappedPosition(x, y) {
    const settings = renderer.normalizeUiSettings(state.uiSettings);
    const intervalsX = [];
    const intervalsY = [];
    if (settings.snapToGrid) {
      intervalsX.push(settings.gridStepX);
      intervalsY.push(settings.gridStepY);
    }
    if (settings.snapToGuide) {
      intervalsX.push(settings.guideStepX);
      intervalsY.push(settings.guideStepY);
    }
    return {
      x: Math.round(snapValue(x, intervalsX)),
      y: Math.round(snapValue(y, intervalsY)),
    };
  }

  function snapValue(value, intervals) {
    if (!intervals.length) {
      return value;
    }
    return intervals.reduce((best, interval) => {
      const snapped = Math.round(value / interval) * interval;
      return Math.abs(snapped - value) < Math.abs(best - value) ? snapped : best;
    }, value);
  }

  function toggleAiCollab() {
    if (!els.aiCollabPanel) {
      return;
    }
    state.aiCollab = els.aiCollabPanel.hidden;
    els.aiCollabPanel.hidden = !state.aiCollab;
    if (state.aiCollab) {
      refreshAiCollabPanel();
      refreshAiShareHistory();
    }
    updateButtons();
    showModeToast(state.aiCollab ? "WITH AIを開きました。共有更新できます。" : "WITH AIをOFFにしました。");
  }

  function closeAiCollabPanel() {
    if (!els.aiCollabPanel) {
      return;
    }
    els.aiCollabPanel.hidden = true;
    updateButtons();
  }

  function showPcMobileForAiShare() {
    handleWindowMenuAction("pc-mobile");
    if (els.aiCollabPanel) {
      els.aiCollabPanel.hidden = false;
    }
    refreshAiCollabPanel();
    refreshAiShareHistory();
    showModeToast("PC/Mobileを並べました。確認してから共有更新できます。");
  }

  function refreshAiCollabPanel() {
    if (!els.aiPromptText || !els.aiProjectSummary) {
      return;
    }
    const data = collectAiCollabContext();
    els.aiProjectSummary.innerHTML = [
      `<span><b>ページ:</b> ${escapeHtml(data.pageName)}</span>`,
      `<span><b>表示:</b> ${escapeHtml(data.viewportLabel)} / ${escapeHtml(data.windowLabel)}</span>`,
      `<span><b>レイヤー:</b> ${data.layerCount}件 / 当たり判定 ${data.hitAreaCount}件 / メモ ${data.memoCount}件</span>`,
      `<span><b>選択中:</b> ${escapeHtml(data.selectedLabel)}</span>`,
    ].join("");
    els.aiPromptText.value = buildAiCollabPrompt(data);
    renderWithAiSafeChangeShare();
  }

  function getAiQuickNote() {
    return (els.aiQuickNote?.value || "").trim();
  }

  function collectAiCollabContext() {
    const page = getCurrentPage();
    const layers = page?.layers || [];
    const selected = getSelectedLayer();
    const viewport = state.viewport === "mobile" ? "mobile" : "desktop";
    const backgroundLayers = layers.filter((layer) => layer.role === "background");
    const hitAreas = layers.filter((layer) => layer.role === "hit-area");
    const markupLayers = layers.filter((layer) => layer.role === "markup");
    const memoLayers = layers.filter((layer) => layer.role === "memo");
    return {
      requestMode: els.aiRequestMode?.value || "layout",
      projectName: state.project?.name || "TBalance Project",
      pageName: page?.name || "未名称ページ",
      viewport,
      viewportLabel: viewport === "mobile" ? "Mobile" : "PC",
      windowLabel: getWindowModeLabel(),
      layerCount: layers.length,
      hitAreaCount: hitAreas.length,
      memoCount: memoLayers.length,
      backgroundLayers,
      hitAreas,
      markupLayers,
      memoLayers,
      selected,
      selectedLabel: selected ? `${selected.name || selected.id} (${selected.type || "layer"})` : "なし",
      selectedLayout: selected ? getCurrentLayout(selected) : null,
      layers,
    };
  }

  function getWindowModeLabel() {
    if (state.windowMode === "pc-mobile") {
      return state.windowLayout === "vertical" ? "PC/Mobile 上下表示" : "PC/Mobile 左右表示";
    }
    if (state.windowMode === "image") {
      return state.windowLayout === "vertical" ? "別ウィンドウ 上下表示" : "別ウィンドウ 左右表示";
    }
    return "単独表示";
  }

  function buildAiCollabPrompt(data) {
    const requestMap = {
      layout: "配置バランスを見て、初心者にもわかる修正案をください。",
      "hit-area": "当たり判定の位置・大きさ・リンク先が自然か確認してください。",
      mobile: "PC版とMobile版の差分を見て、配置・サイズ・見やすさの修正案をください。",
      markup: "赤ペン指示と自分メモを整理して、実装指示にまとめてください。",
      publish: "公開前チェックとして、リンク・画像容量・PC/Mobile表示の注意点を洗い出してください。",
    };
    const layerLines = data.layers.slice().reverse().map((layer, index) => {
      const layout = layer.layouts?.[data.viewport] || layer[data.viewport] || getCurrentLayout(layer);
      const role = layer.role ? ` / ${layer.role}` : "";
      const link = layer.link ? ` / link:${layer.link}` : "";
      const visibility = layer.visibilityMode ? ` / ${getLayerVisibilityLabel(layer)}` : "";
      return `${index + 1}. ${layer.name || layer.id} (${layer.type || "layer"}${role}) x:${Math.round(layout.x)} y:${Math.round(layout.y)} w:${Math.round(layout.width)} h:${Math.round(layout.height)}${visibility}${link}`;
    });
    const markupLines = data.markupLayers.map((layer) => `- ${layer.name || "指示"}: ${layer.text || layer.note || "赤ペンレイヤー"}`);
    const memoLines = data.memoLayers.map((layer) => `- ${layer.name || "自分メモ"}: ${layer.text || "自分メモ"}`);
    const selected = data.selected && data.selectedLayout
      ? `${data.selected.name || data.selected.id} / x:${Math.round(data.selectedLayout.x)} y:${Math.round(data.selectedLayout.y)} w:${Math.round(data.selectedLayout.width)} h:${Math.round(data.selectedLayout.height)}`
      : "なし";
    const quickNote = getAiQuickNote();
    return [
      "TBalanceの編集状態を見て相談したいです。",
      "",
      "【ひとことメモ】",
      quickNote || "なし",
      "",
      "【相談したいこと】",
      requestMap[data.requestMode] || requestMap.layout,
      "",
      "【現在の状態】",
      `プロジェクト: ${data.projectName}`,
      `ページ: ${data.pageName}`,
      `表示: ${data.viewportLabel} / ${data.windowLabel}`,
      `選択中: ${selected}`,
      `レイヤー数: ${data.layerCount}`,
      `当たり判定: ${data.hitAreaCount}件`,
      "",
      "【レイヤー一覧（上から順）】",
      layerLines.length ? layerLines.join("\n") : "なし",
      "",
      "【赤ペン・指示】",
      markupLines.length ? markupLines.join("\n") : "なし",
      "",
      "【自分メモ】",
      memoLines.length ? memoLines.join("\n") : "なし",
      "",
      "【お願い】",
      "操作手順が必要な場合は、TBalance上でどのボタンを押すかまで具体的に説明してください。",
    ].join("\n");
  }

  function renderWithAiSafeChangeShare() {
    if (!els.aiSafeChangeSummary || !els.aiSafeChangeDetailsPreview || !els.aiShareMessage) {
      return;
    }
    if (els.aiShareTarget && els.aiShareTarget.value !== state.withAiShare.targetAi) {
      els.aiShareTarget.value = state.withAiShare.targetAi;
    }
    const preview = getWithAiSafeChangeSharePreview();
    state.withAiShare.package = preview.package || null;
    state.withAiShare.text = preview.text || "";
    state.withAiShare.summary = preview.summary || "";
    state.withAiShare.details = preview.details || "";

    els.aiSafeChangeSummary.textContent = preview.summary;
    els.aiSafeChangeSummary.dataset.status = preview.ok ? "success" : "error";
    els.aiSafeChangeDetailsPreview.textContent = preview.details || "Safe Change Instructionを生成してください。";
    els.aiShareMessage.textContent = preview.ok
      ? (state.withAiShare.message || preview.message || "AI共有はClipboardへコピーします。")
      : (preview.message || "共有できるSafe Change Instructionがありません。");
    els.aiShareMessage.dataset.status = preview.ok ? (state.withAiShare.status || "idle") : "error";
    if (els.shareSafeChangeWithAi) {
      els.shareSafeChangeWithAi.disabled = !preview.ok;
      els.shareSafeChangeWithAi.title = preview.ok
        ? "Safe Change InstructionをAI共有用テキストとしてコピーします。"
        : preview.message;
    }
    if (els.cancelExistingWebAiShare) {
      els.cancelExistingWebAiShare.hidden = state.withAiShare.mode !== "existing-web-ai-review";
    }
    if (els.aiExistingWebImport) {
      els.aiExistingWebImport.hidden = state.withAiShare.mode !== "existing-web-ai-review";
    }
    if (els.aiExistingWebImportStatus && state.withAiShare.mode === "existing-web-ai-review" && !els.aiExistingWebImportStatus.textContent.trim()) {
      setExistingWebAiImportStatus("idle", "AI回答を貼り付けて取り込めます。");
    }
  }

  function getWithAiSafeChangeSharePreview() {
    if (state.withAiShare.mode === "existing-web-ai-review") {
      return getExistingWebAiSharePreview();
    }
    const request = buildWithAiShareRequest();
    const share = window.TBalanceWithAiShare;
    if (!share?.buildWithAiSharePackage) {
      return {
        ok: false,
        summary: "WITH AI Share module Required",
        message: "WITH AI Share moduleを読み込めていません。",
        details: "tools/tbalance/with-ai/with-ai-share.jsを確認してください。",
      };
    }
    const result = share.buildWithAiSharePackage(request);
    if (!result.ok) {
      const message = result.errors.join(" / ") || "Safe Change Instructionを共有できません。";
      return {
        ok: false,
        summary: "Safe Change Instruction Required",
        message,
        details: message,
      };
    }
    const details = formatWithAiShareDetails(result.package);
    return {
      ok: true,
      package: result.package,
      text: result.text,
      summary: result.summary,
      message: "AI共有できます。共有前に詳細を確認してください。",
      details,
    };
  }

  function buildWithAiShareRequest() {
    const instruction = state.analyzer.safeChange.json;
    const mapping = getSafeChangeInstructionMapping(instruction);
    const domResolved = mapping ? Boolean(resolveAnalyzerDomNode(mapping.domRef)) : false;
    const ambiguousMapping = mapping ? isSafeChangeMappingAmbiguous(mapping) : false;
    return {
      targetAi: els.aiShareTarget?.value || state.withAiShare.targetAi || "chatgpt",
      safeChangeInstruction: instruction,
      humanSummary: state.analyzer.safeChange.summary || "",
      mapping,
      domResolved,
      ambiguousMapping,
      sharePolicy: {
        automaticApplyAllowed: false,
        sourceMutationAllowed: false,
        aiApiCallAllowed: false,
        automaticPatchAllowed: false,
      },
    };
  }

  function getSafeChangeInstructionMapping(instruction) {
    if (!instruction?.target) {
      return null;
    }
    const target = instruction.target;
    const pageMeta = getAnalyzerManifestPageMeta();
    const mappings = getVisibleConfirmedMappings(pageMeta);
    return mappings.find((mapping) => {
      const mappingView = mapping.viewState || "";
      const targetView = target.viewState || "";
      return mapping.pageId === target.pageId
        && mapping.tbId === target.tbId
        && mapping.domRef === target.domRef
        && mappingView === targetView;
    }) || null;
  }

  function formatWithAiShareDetails(sharePackage) {
    if (!sharePackage) {
      return "";
    }
    const instruction = sharePackage.safeChangeInstruction || {};
    return JSON.stringify({
      targetAi: sharePackage.targetAi,
      project: sharePackage.project,
      page: sharePackage.page,
      target: sharePackage.target,
      userIntent: instruction.userIntent || "",
      changes: instruction.changes || [],
      allowedProperties: instruction.allowedProperties || [],
      protectedProperties: instruction.protectedProperties || [],
      doNotChange: instruction.doNotChange || [],
      validationChecks: instruction.validationChecks || [],
      sharePolicy: sharePackage.sharePolicy,
      shareScope: sharePackage.shareScope,
    }, null, 2);
  }

  async function shareSafeChangeInstructionWithAi() {
    if (!state.aiCollab) {
      setWithAiShareStatus("error", "WITH AIをONにしてからAI共有してください。");
      renderWithAiSafeChangeShare();
      return;
    }
    const preview = getWithAiSafeChangeSharePreview();
    if (!preview.ok || !preview.text) {
      setWithAiShareStatus("error", preview.message || "共有できるSafe Change Instructionがありません。");
      renderWithAiSafeChangeShare();
      return;
    }
    const targetLabel = getAiShareTargetLabel(preview.package?.targetAi || els.aiShareTarget?.value);
    const existingWebAiShare = preview.package?.type === "existing-web-ai-review" || preview.package?.type === "existing-web-ai-review-batch";
    const ok = await copyTextToClipboard(preview.text, existingWebAiShare
      ? `${targetLabel}確認用データをClipboardへコピーしました。AIへ貼り付けてください。`
      : "Safe Change InstructionをAI共有用にコピーしました。");
    if (!ok) {
      setWithAiShareStatus("error", "Clipboardへコピーできませんでした。");
      renderWithAiSafeChangeShare();
      return;
    }
    state.withAiShare.package = preview.package;
    state.withAiShare.text = preview.text;
    setWithAiShareStatus("ok", existingWebAiShare
      ? `${targetLabel}確認用データをClipboardへコピーしました。AIへ貼り付けて、回答を取り込んでください。`
      : `${targetLabel}共有用テキストをClipboardへコピーしました。`);
    if (preview.package?.type === "existing-web-ai-review" && state.existingWeb.selected?.domRef) {
      setExistingWebAiReview(state.existingWeb.selected.domRef, {
        ...(getExistingWebAiReview(state.existingWeb.selected.domRef) || {}),
        status: "shared",
        package: preview.package,
        text: preview.text,
      });
    } else if (preview.package?.type === "existing-web-ai-review-batch") {
      (preview.package.targets || []).forEach((targetPackage) => {
        if (!targetPackage.target?.domRef) {
          return;
        }
        setExistingWebAiReview(targetPackage.target.domRef, {
          ...(getExistingWebAiReview(targetPackage.target.domRef) || {}),
          status: "shared",
          package: targetPackage,
          batchPackage: preview.package,
          text: preview.text,
        });
      });
    }
    renderWithAiSafeChangeShare();
    if (existingWebAiShare) {
      refreshExistingWebVirtualLayers();
      renderAll();
    }
  }

  function setWithAiShareStatus(status, message) {
    state.withAiShare.status = status;
    state.withAiShare.message = message;
  }

  function getAiShareTargetLabel(targetAi) {
    const labels = {
      chatgpt: "ChatGPT",
      codex: "Codex",
      other: "Other AI",
    };
    return labels[targetAi] || "AI";
  }

  async function copyAiPrompt() {
    if (!els.aiPromptText) {
      return;
    }
    const text = els.aiPromptText.value;
    try {
      await navigator.clipboard.writeText(text);
      showModeToast("AI相談文をコピーしました。");
    } catch (error) {
      els.aiPromptText.focus();
      els.aiPromptText.select();
      showModeToast("コピーできない場合は、選択された文章を手動でコピーしてください。");
    }
  }

  async function copyTextToClipboard(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
      if (successMessage) {
        showModeToast(successMessage);
      }
      return true;
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        const ok = document.execCommand("copy");
        if (successMessage) {
          showModeToast(ok ? successMessage : "コピーできない場合は、選択された文章を手動でコピーしてください。");
        }
        return ok;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }

  function downloadAiPrompt() {
    if (!els.aiPromptText) {
      return;
    }
    downloadBlob(els.aiPromptText.value, `${getProjectBaseName()}_with_ai_memo.txt`, "text/plain");
  }

  async function shareAiStateToBridge() {
    if (!state.aiCollab) {
      setAiBridgeStatus("error", "WITH AI OFFです。ONにしてから共有更新してください。");
      showModeToast("WITH AIをONにしてから共有更新してください。");
      return;
    }
    const removedAiSuggestions = removeAiSuggestionLayers({ recordHistory: true, render: true });
    setAiBridgeStatus("working", removedAiSuggestions
      ? "前回のAI提案を整理して共有更新中..."
      : "共有更新中...");
    try {
      const snapshot = await getAiSharedSnapshot({ includeScreenshot: true });
      const response = await fetch(AI_BRIDGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok === false) {
        throw new Error(result.error || `Bridge returned ${response.status}`);
      }
      setAiBridgeStatus("ok", `共有更新済み: ${formatTimeForStatus(result.savedAt || snapshot.updatedAt)}`);
      await refreshAiShareHistory();
      showModeToast(removedAiSuggestions
        ? "前回の青ペン提案を消して、WITH AI共有を更新しました。"
        : "WITH AI共有を更新しました。Codexが現在の作業机を読めます。");
    } catch (error) {
      setAiBridgeStatus("error", getAiBridgeFailureMessage(error));
      showModeToast("WITH AI共有ブリッジが起動していません。Codex側で起動してください。");
    }
  }

  function getAiBridgeFailureMessage(error) {
    const message = String(error?.message || "");
    if (/Failed to fetch|NetworkError|Load failed|ブリッジに接続できません/i.test(message)) {
      return "共有失敗: WITH AI共有ブリッジが起動していません";
    }
    return `共有失敗: ${message || "ブリッジに接続できません"}`;
  }

  function getAiHistoryScopeParams() {
    const page = getCurrentPage();
    const params = new URLSearchParams();
    params.set("projectId", state.project?.id || state.project?.name || "tbalance_project");
    params.set("pageId", page?.id || state.pageId || "page");
    return params;
  }

  async function refreshAiShareHistory() {
    if (!els.aiShareHistoryList) {
      return;
    }
    els.aiShareHistoryList.textContent = "履歴を確認中...";
    try {
      const response = await fetch(`${AI_BRIDGE_HISTORY_URL}?${getAiHistoryScopeParams().toString()}`, {
        method: "GET",
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok === false) {
        throw new Error(result.error || `Bridge returned ${response.status}`);
      }
      renderAiShareHistory(result.entries || []);
    } catch (error) {
      els.aiShareHistoryList.textContent = state.editorMode === "custom"
        ? "履歴取得失敗: ブリッジ未起動"
        : "AI連携が起動していません。回答を手動で取り込むこともできます。";
    }
  }

  function renderAiShareHistory(entries) {
    if (!els.aiShareHistoryList) {
      return;
    }
    if (!entries.length) {
      els.aiShareHistoryList.textContent = "履歴なし";
      return;
    }
    els.aiShareHistoryList.innerHTML = entries.slice(0, AI_SHARE_HISTORY_LIMIT).map((entry, index) => {
      const title = `${index === 0 ? "最新" : `${index}つ前`} / ${entry.page || "ページ"}${entry.note ? ` / ${entry.note}` : ""}`;
      return `
        <button class="tb-ai-history-item" type="button" data-ai-history-restore="${escapeHtml(entry.id)}" title="${escapeAttr(title)}">
          ${escapeHtml(formatTimeForStatus(entry.savedAt))}
        </button>
      `;
    }).join("");
  }

  function handleAiHistoryClick(event) {
    const button = event.target.closest("[data-ai-history-restore]");
    if (!button) {
      return;
    }
    restoreAiShareHistory(button.dataset.aiHistoryRestore);
  }

  async function restoreAiShareHistory(historyId) {
    if (!historyId) {
      return;
    }
    const ok = confirm("この共有履歴を復元します。\n復元した状態は新しい最新版として共有履歴に追加されます。\n現在の編集内容は変更されます。よろしいですか？");
    if (!ok) {
      return;
    }
    setAiBridgeStatus("working", "共有履歴を復元中...");
    try {
      const page = getCurrentPage();
      const response = await fetch(AI_BRIDGE_RESTORE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: historyId,
          project: { id: state.project?.id || state.project?.name || "tbalance_project" },
          pageId: page?.id || state.pageId || "page",
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok === false) {
        throw new Error(result.error || `Bridge returned ${response.status}`);
      }
      const restoredProject = result.state?.restoreProject;
      if (!restoredProject) {
        throw new Error("復元用の編集データが履歴に含まれていません。");
      }
      pushHistory();
      state.project = renderer.normalizeProject(restoredProject);
      syncProjectEditorSettings();
      const restoredPageId = result.state?.pageId || state.project.pages[0]?.id;
      state.pageId = state.project.pages.some((pageItem) => pageItem.id === restoredPageId) ? restoredPageId : state.project.pages[0]?.id;
      state.primaryPageId = state.pageId;
      state.windowMode = "single";
      state.windowLayout = "horizontal";
      state.secondaryWindow = null;
      state.suspendedWindow = null;
      state.activeWindow = "primary";
      clearSelection();
      markDirty();
      renderAll();
      await shareAiStateToBridge();
      setAiBridgeStatus("ok", `共有履歴を復元しました: ${formatTimeForStatus(new Date().toISOString())}`);
      showModeToast("共有履歴を復元し、新しい最新版として保存しました。");
    } catch (error) {
      setAiBridgeStatus("error", `復元失敗: ${error?.message || "共有履歴を復元できません"}`);
      showModeToast("共有履歴の復元に失敗しました。");
    }
  }

  async function loadAiSuggestionFromBridge() {
    if (!state.aiCollab) {
      setAiBridgeStatus("error", "WITH AI OFFです。ONにしてからAI提案を読み込んでください。");
      showModeToast("WITH AIをONにしてからAI提案を読み込んでください。");
      return;
    }
    setAiBridgeStatus("working", "AI提案を確認中...");
    try {
      const response = await fetch(AI_BRIDGE_SUGGESTION_URL, {
        method: "GET",
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.ok === false) {
        throw new Error(payload.error || `Bridge returned ${response.status}`);
      }
      const count = applyAiSuggestions(payload);
      if (!count) {
        throw new Error("読み込めるAI提案がありません。");
      }
      setAiBridgeStatus("ok", `AI提案を読み込みました: ${count}件`);
      showModeToast("AI青ペン提案を画面に読み込みました。");
    } catch (error) {
      setAiBridgeStatus("error", getAiSuggestionFailureMessage(error));
      showModeToast("AI提案を読み込めませんでした。ブリッジまたは提案ファイルを確認してください。");
    }
  }

  function getAiSuggestionFailureMessage(error) {
    const message = String(error?.message || "");
    if (/Failed to fetch|NetworkError|Load failed|ブリッジに接続できません/i.test(message)) {
      return "AI提案取得失敗: WITH AI共有ブリッジが起動していません";
    }
    if (/ai-suggestion\.json is not ready|404/i.test(message)) {
      return "AI提案なし: Codex側の青ペン提案がまだありません";
    }
    return `AI提案取得失敗: ${message || "提案を読み込めません"}`;
  }

  function applyAiSuggestions(payload) {
    const suggestions = normalizeAiSuggestionPayload(payload);
    if (!suggestions.length) {
      return 0;
    }
    const page = getCurrentPage();
    if (!page) {
      return 0;
    }
    pushHistory();
    removeAiSuggestionLayers();
    const layers = [];
    suggestions.forEach((suggestion, index) => {
      if (isAiContentSuggestion(suggestion)) {
        layers.push(...createAiContentLayers(suggestion, index));
        return;
      }
      const shapeLayer = createAiSuggestionLayer(suggestion, index);
      if (shapeLayer) {
        layers.push(shapeLayer);
      }
      const textLayer = createAiSuggestionTextLayer(suggestion, index, shapeLayer);
      if (textLayer) {
        layers.push(textLayer);
      }
    });
    layers.forEach((layer) => {
      renderer.normalizeLayer(layer);
      page.layers.push(layer);
    });
    keepMarkupLayersOnTop(page);
    if (layers[0]) {
      setSingleSelection(layers[0].id);
    } else {
      clearSelection();
    }
    markDirty();
    renderAll();
    return layers.length;
  }

  function removeAiSuggestionLayers(options = {}) {
    const page = getCurrentPage();
    if (!page) {
      return 0;
    }
    const aiLayerIds = new Set((page.layers || [])
      .filter((layer) => layer.role === "markup" && layer.markupSource === "ai")
      .map((layer) => layer.id));
    if (!aiLayerIds.size) {
      return 0;
    }
    if (options.recordHistory) {
      pushHistory();
    }
    page.layers = (page.layers || []).filter((layer) => !aiLayerIds.has(layer.id));
    state.selectedIds = (Array.isArray(state.selectedIds) ? state.selectedIds : [])
      .filter((id) => !aiLayerIds.has(id));
    if (aiLayerIds.has(state.selectedId)) {
      state.selectedId = state.selectedIds[state.selectedIds.length - 1] || "";
    }
    markDirty();
    if (options.render) {
      renderAll();
    }
    return aiLayerIds.size;
  }

  function isAiContentSuggestion(suggestion) {
    const mode = String(suggestion.applyAs || suggestion.mode || "").toLowerCase();
    const kind = String(suggestion.kind || suggestion.type || suggestion.shape || "").toLowerCase();
    return ["content", "layer", "normal"].includes(mode)
      || ["speechbubble", "speech-bubble", "bubble", "吹き出し"].includes(kind);
  }

  function createAiContentLayers(suggestion, index) {
    const kind = String(suggestion.kind || suggestion.type || "").toLowerCase();
    if (!["speechbubble", "speech-bubble", "bubble", "吹き出し"].includes(kind)) {
      return [];
    }
    return createSpeechBubbleContentLayers(suggestion, index);
  }

  function createSpeechBubbleContentLayers(suggestion, index) {
    const groupId = renderer.makeId(`speech_group_${index}`);
    const text = String(suggestion.text || suggestion.note || suggestion.comment || "夜の空には、みんなの願いが輝いているよ。").trim();
    const desktopBubble = normalizeAiContentLayout(suggestion.desktop || suggestion.desktopLayout || suggestion.rect, {
      x: 690, y: 468, width: 612, height: 160, rotation: 0,
    });
    const mobileBubble = normalizeAiContentLayout(suggestion.mobile || suggestion.mobileLayout || suggestion.rect, {
      x: 282, y: 722, width: 538, height: 170, rotation: 0,
    });
    const desktopTail = normalizeAiContentLayout(suggestion.desktopTail || suggestion.tailDesktop, {
      x: 918, y: 594, width: 92, height: 76, rotation: 178,
    });
    const mobileTail = normalizeAiContentLayout(suggestion.mobileTail || suggestion.tailMobile, {
      x: 550, y: 862, width: 94, height: 86, rotation: 180,
    });
    const desktopText = normalizeAiContentLayout(suggestion.desktopText || suggestion.textDesktop, {
      x: desktopBubble.x + 44,
      y: desktopBubble.y + 34,
      width: desktopBubble.width - 88,
      height: desktopBubble.height - 58,
      rotation: 0,
    });
    const mobileText = normalizeAiContentLayout(suggestion.mobileText || suggestion.textMobile, {
      x: mobileBubble.x + 38,
      y: mobileBubble.y + 34,
      width: mobileBubble.width - 76,
      height: mobileBubble.height - 58,
      rotation: 0,
    });
    const fill = suggestion.fill || "#fff3cf";
    const stroke = suggestion.stroke || "#f0dca9";
    const shadow = suggestion.shadow || "soft";
    const bubbleLayer = {
        id: renderer.makeId(`speech_bubble_${index}`),
        type: "shape",
        name: suggestion.bubbleName || "リル吹き出し",
        groupId,
        shape: {
          type: suggestion.singleBubble ? "speechBubble" : "roundRect",
          fill,
          fillEnabled: true,
          stroke,
          strokeEnabled: true,
          strokeWidth: Number(suggestion.strokeWidth || 4),
          radius: Number(suggestion.radius || 22),
        },
        desktop: desktopBubble,
        mobile: mobileBubble,
        visibilityMode: "both",
        appearance: { opacity: 1, brightness: 1, shadow },
        constraints: { keepAspect: false, keepSquare: false, keepCircle: false },
      };
    const tailLayer = {
        id: renderer.makeId(`speech_tail_${index}`),
        type: "shape",
        name: suggestion.tailName || "リル吹き出しのしっぽ",
        groupId,
        shape: {
          type: "triangle",
          fill,
          fillEnabled: true,
          stroke,
          strokeEnabled: true,
          strokeWidth: Number(suggestion.strokeWidth || 4),
        },
        desktop: desktopTail,
        mobile: mobileTail,
        visibilityMode: "both",
        appearance: { opacity: 1, brightness: 1, shadow },
        constraints: { keepAspect: false, keepSquare: false, keepCircle: false },
      };
    const textLayer = {
        id: renderer.makeId(`speech_text_${index}`),
        type: "text",
        name: suggestion.textName || "リルのセリフ",
        groupId,
        text,
        style: {
          fontFamily: '"Noto Sans JP", "Yu Gothic", sans-serif',
          fontSize: Number(suggestion.fontSize || 38),
          weight: Number(suggestion.fontWeight || 800),
          color: suggestion.textColor || "#4f3b1f",
          align: suggestion.align || "center",
          strokeEnabled: false,
        },
        desktopStyle: { fontSize: Number(suggestion.desktopFontSize || suggestion.fontSize || 38) },
        mobileStyle: { fontSize: Number(suggestion.mobileFontSize || suggestion.fontSize || 38) },
        desktop: desktopText,
        mobile: mobileText,
        visibilityMode: "both",
        appearance: { opacity: 1, brightness: 1, shadow: "none" },
        constraints: { keepAspect: false, keepSquare: false, keepCircle: false },
      };
    return suggestion.singleBubble ? [bubbleLayer, textLayer] : [bubbleLayer, tailLayer, textLayer];
  }

  function normalizeAiContentLayout(value, fallback) {
    const source = value && typeof value === "object" ? value : {};
    return {
      x: Math.round(Number(source.x ?? fallback.x) || 0),
      y: Math.round(Number(source.y ?? fallback.y) || 0),
      width: Math.max(12, Math.round(Number(source.width ?? source.w ?? fallback.width) || fallback.width || 12)),
      height: Math.max(12, Math.round(Number(source.height ?? source.h ?? fallback.height) || fallback.height || 12)),
      rotation: Math.round(Number(source.rotation ?? fallback.rotation ?? 0) || 0),
    };
  }

  function normalizeAiSuggestionPayload(payload) {
    const source = payload?.suggestions || payload?.items || payload?.marks || payload?.layers || payload?.suggestion || payload;
    const list = Array.isArray(source) ? source : [source];
    return list
      .filter((item) => item && typeof item === "object")
      .map((item) => Object.assign({}, item));
  }

  function createAiSuggestionLayer(suggestion, index) {
    const type = normalizeAiSuggestionType(suggestion.type || suggestion.kind || suggestion.shape || "text");
    if (type === "text") {
      return null;
    }
    const viewport = normalizeAiSuggestionViewport(suggestion.viewport || suggestion.mode || suggestion.targetViewport);
    const layout = createAiSuggestionLayout(suggestion, type, viewport);
    const layouts = createAiSuggestionViewportLayouts(layout, viewport);
    const isArrow = type === "arrow";
    const isEllipse = type === "ellipse";
    return {
      id: renderer.makeId(`ai_mark_${index}`),
      type: "shape",
      name: suggestion.name || (isArrow ? "AI青ペン矢印" : isEllipse ? "AI青ペン囲み" : "AI青ペン枠"),
      role: "markup",
      markupSource: "ai",
      aiSuggestion: {
        text: suggestion.text || suggestion.note || suggestion.comment || "",
        savedAt: suggestion.savedAt || "",
      },
      shape: {
        type,
        fill: isArrow ? "rgba(47, 140, 255, 0.24)" : "rgba(47, 140, 255, 0.08)",
        fillEnabled: isArrow || suggestion.fillEnabled === true,
        stroke: suggestion.color || suggestion.stroke || "#4aa3ff",
        strokeEnabled: true,
        strokeWidth: Math.max(2, Number(suggestion.strokeWidth || suggestion.lineWidth || (isArrow ? 6 : 4))),
        radius: Number(suggestion.radius || 0),
      },
      desktop: layouts.desktop,
      mobile: layouts.mobile,
      visibilityMode: layouts.visibilityMode,
      appearance: { opacity: 1, brightness: 1, shadow: "soft" },
      constraints: { keepAspect: false, keepSquare: false, keepCircle: false },
    };
  }

  function createAiSuggestionTextLayer(suggestion, index, anchorLayer) {
    const text = String(suggestion.text || suggestion.note || suggestion.comment || "").trim();
    const explicitText = normalizeAiSuggestionType(suggestion.type || suggestion.kind || suggestion.shape || "text") === "text";
    if (!text && !explicitText) {
      return null;
    }
    const viewport = normalizeAiSuggestionViewport(suggestion.viewport || suggestion.mode || suggestion.targetViewport);
    const layout = createAiSuggestionTextLayout(suggestion, anchorLayer, viewport);
    const layouts = createAiSuggestionViewportLayouts(layout, viewport);
    return {
      id: renderer.makeId(`ai_note_${index}`),
      type: "text",
      name: suggestion.name || "AI青ペンコメント",
      role: "markup",
      markupSource: "ai",
      text: text || "AI提案",
      style: {
        fontFamily: '"Noto Sans JP", "Yu Gothic", sans-serif',
        fontSize: Math.max(18, Number(suggestion.fontSize || 34)),
        fontWeight: 800,
        italic: false,
        underline: false,
        color: "#e9f6ff",
        strokeColor: "#0b3a74",
        strokeWidth: 3,
        shadowColor: "rgba(0,0,0,0.6)",
        shadowBlur: 8,
        shadowOpacity: 70,
      },
      desktop: layouts.desktop,
      mobile: layouts.mobile,
      visibilityMode: layouts.visibilityMode,
      appearance: { opacity: 1, brightness: 1, shadow: "soft" },
      constraints: { keepAspect: false, keepSquare: false, keepCircle: false },
    };
  }

  function normalizeAiSuggestionType(type) {
    const value = String(type || "").toLowerCase();
    if (["arrow", "矢印"].includes(value)) {
      return "arrow";
    }
    if (["circle", "ellipse", "oval", "丸", "円", "楕円"].includes(value)) {
      return "ellipse";
    }
    if (["box", "rect", "rectangle", "四角", "枠"].includes(value)) {
      return "rect";
    }
    return "text";
  }

  function normalizeAiSuggestionViewport(viewport) {
    const value = String(viewport || "").toLowerCase();
    if (["mobile", "mob", "sp", "スマホ", "モバイル"].includes(value)) {
      return "mobile";
    }
    if (["both", "all", "common", "共通", "pc/mobile"].includes(value)) {
      return "both";
    }
    return "desktop";
  }

  function createAiSuggestionLayout(suggestion, type, viewport) {
    if (type === "arrow") {
      const from = getAiSuggestionPoint(suggestion.from || suggestion.start);
      const to = getAiSuggestionPoint(suggestion.to || suggestion.end || suggestion.target);
      if (from && to) {
        const centerX = (from.x + to.x) / 2;
        const centerY = (from.y + to.y) / 2;
        const width = Math.max(80, Math.abs(to.x - from.x));
        const height = Math.max(52, Math.abs(to.y - from.y), width * 0.24);
        return {
          x: Math.round(centerX - width / 2),
          y: Math.round(centerY - height / 2),
          width: Math.round(width),
          height: Math.round(height),
          rotation: Math.round(Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI),
        };
      }
    }
    const rect = suggestion.rect || suggestion.bounds || suggestion.target || suggestion;
    const page = getCurrentPage();
    const size = getPageViewportSize(page, viewport === "mobile" ? "mobile" : "desktop");
    const width = Math.max(32, Number(rect.width ?? rect.w ?? suggestion.width ?? 260));
    const height = Math.max(32, Number(rect.height ?? rect.h ?? suggestion.height ?? (type === "ellipse" ? 160 : 120)));
    const x = Number(rect.x ?? suggestion.x ?? (size.width - width) / 2);
    const y = Number(rect.y ?? suggestion.y ?? (size.height - height) / 2);
    return {
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(width),
      height: Math.round(height),
      rotation: Math.round(Number(suggestion.rotation || 0)),
    };
  }

  function createAiSuggestionTextLayout(suggestion, anchorLayer, viewport) {
    const point = getAiSuggestionPoint(suggestion.point || suggestion.position);
    if (point) {
      return createCenteredLayout(point, Math.max(220, Number(suggestion.width || 360)), Math.max(54, Number(suggestion.height || 86)));
    }
    const anchor = anchorLayer ? (anchorLayer[viewport === "mobile" ? "mobile" : "desktop"] || anchorLayer.desktop) : null;
    if (anchor) {
      return {
        x: Math.round(anchor.x + Math.min(anchor.width + 24, 420)),
        y: Math.round(anchor.y),
        width: Math.max(260, Math.min(520, Number(suggestion.width || 380))),
        height: Math.max(64, Number(suggestion.height || 92)),
        rotation: 0,
      };
    }
    const page = getCurrentPage();
    const size = getPageViewportSize(page, viewport === "mobile" ? "mobile" : "desktop");
    return createCenteredLayout({ x: size.width / 2, y: size.height / 2 }, 380, 92);
  }

  function getAiSuggestionPoint(value) {
    if (!value || typeof value !== "object") {
      return null;
    }
    const x = Number(value.x);
    const y = Number(value.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return null;
    }
    return { x, y };
  }

  function createAiSuggestionViewportLayouts(layout, viewport) {
    const safeLayout = {
      x: Math.round(layout.x),
      y: Math.round(layout.y),
      width: Math.max(12, Math.round(layout.width)),
      height: Math.max(12, Math.round(layout.height)),
      rotation: Math.round(Number(layout.rotation || 0)),
    };
    if (viewport === "both") {
      return {
        desktop: Object.assign({}, safeLayout),
        mobile: Object.assign({}, safeLayout),
        visibilityMode: "both",
      };
    }
    const inactive = createHiddenViewportLayout({ x: 0, y: 0, width: safeLayout.width, height: safeLayout.height });
    return {
      desktop: viewport === "mobile" ? inactive : safeLayout,
      mobile: viewport === "mobile" ? safeLayout : inactive,
      visibilityMode: viewport === "mobile" ? "mobile" : "desktop",
    };
  }

  function setAiBridgeStatus(status, text) {
    if (!els.aiBridgeStatus) {
      return;
    }
    els.aiBridgeStatus.dataset.status = status;
    els.aiBridgeStatus.textContent = text;
  }

  function formatTimeForStatus(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
      return value || "";
    }
    return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  function installAiBridge() {
    window.TBalanceAI = {
      version: "2026-08-18-with-ai-bridge",
      isSharing: () => Boolean(state.aiCollab),
      open: () => {
        if (!state.aiCollab) {
          toggleAiCollab();
        } else {
          if (els.aiCollabPanel) {
            els.aiCollabPanel.hidden = false;
          }
          refreshAiCollabPanel();
        }
        return window.TBalanceAI.getSnapshot({ includeScreenshot: false });
      },
      close: () => {
        closeAiCollabPanel();
        return { sharing: Boolean(state.aiCollab), panelVisible: false };
      },
      refresh: () => {
        refreshAiCollabPanel();
        return window.TBalanceAI.getSnapshot({ includeScreenshot: false });
      },
      getPrompt: () => {
        refreshAiCollabPanel();
        return els.aiPromptText?.value || buildAiCollabPrompt(collectAiCollabContext());
      },
      applyExistingWebReviewResult: applyExistingWebAiReviewResult,
      getSnapshot: getAiSharedSnapshot,
    };
  }

  async function getAiSharedSnapshot(options = {}) {
    const includeScreenshot = Boolean(options.includeScreenshot);
    const context = collectAiCollabContext();
    const selectedLayers = getSelectedLayers().map((layer) => layer.id);
    const page = getCurrentPage();
    const targets = getScreenshotTargets(page);
    const canvasSize = getPageViewportSize(page, context.viewport);
    const serializedLayers = context.layers.map((layer, index) => serializeAiLayer(layer, context.viewport, index));
    const selectedLayer = context.selected ? serializeAiLayer(context.selected, context.viewport, context.layers.indexOf(context.selected)) : null;
    const updatedAt = new Date().toISOString();
    const snapshot = {
      source: "TBalanceAI",
      version: window.TBalanceAI?.version || "unknown",
      updatedAt,
      capturedAt: updatedAt,
      sharing: Boolean(state.aiCollab),
      page: context.pageName,
      pageId: page?.id || state.pageId || "",
      mode: context.viewport,
      view: {
        viewport: context.viewport,
        viewportLabel: context.viewportLabel,
        windowMode: state.windowMode || "single",
        windowLayout: state.windowLayout || "horizontal",
        windowLabel: context.windowLabel,
        activeWindow: getActiveWindowKey(),
      },
      test: getAiTestSnapshot(),
      userNote: getAiQuickNote(),
      canvasSize: {
        width: Math.round(canvasSize.width),
        height: Math.round(canvasSize.height),
      },
      stage: renderer.normalizeStage(page?.stage),
      selectedLayer,
      layers: serializedLayers,
      hitAreas: serializedLayers.filter((layer) => layer.role === "hit-area" || layer.hitArea?.enabled),
      markup: serializedLayers.filter((layer) => layer.role === "markup"),
      memo: serializedLayers.filter((layer) => layer.role === "memo"),
      requestMode: context.requestMode,
      prompt: buildAiCollabPrompt(context),
      project: {
        id: state.project?.id || state.project?.name || "tbalance_project",
        name: context.projectName,
        pageName: context.pageName,
        viewport: context.viewport,
        windowMode: state.windowMode || "single",
        windowLayout: state.windowLayout || "horizontal",
        windowLabel: context.windowLabel,
        dirty: Boolean(state.dirty),
        autosave: state.autosaveStorage || "",
      },
      restoreProject: state.project,
      selectedLayerIds: selectedLayers,
      counts: {
        layers: context.layerCount,
        backgrounds: context.backgroundLayers.length,
        hitAreas: context.hitAreaCount,
        markup: context.markupLayers.length,
        memo: context.memoCount,
      },
      screenshot: null,
    };
    if (includeScreenshot) {
      try {
        const canvas = await renderScreenshotCanvas(targets, { skipBrokenLayers: true });
        snapshot.screenshot = {
          mime: "image/webp",
          width: canvas.width,
          height: canvas.height,
          dataUrl: canvas.toDataURL("image/webp", 0.78),
        };
      } catch (error) {
        snapshot.screenshot = {
          error: error?.message || "screenshot failed",
        };
      }
    }
    return snapshot;
  }

  function getAiTestSnapshot() {
    const activeWindow = getActiveWindowKey();
    const activeKey = activeWindow === "secondary" ? "secondary" : "primary";
    const pageIds = state.testPageIds || {};
    const externalViews = state.testExternalViews || {};
    const activeExternalView = externalViews[activeKey] || null;
    return {
      enabled: Boolean(state.preview),
      activeWindow,
      testWindow: state.testWindow || "",
      activeWindowLabel: getWindowTestLabel(activeKey),
      activePageId: pageIds[activeKey] || "",
      pageIds: {
        primary: pageIds.primary || "",
        secondary: pageIds.secondary || "",
      },
      externalViews: {
        primary: externalViews.primary || null,
        secondary: externalViews.secondary || null,
      },
      activeExternalView,
      action: state.testAction || null,
      navigation: {
        primary: Array.isArray(state.testNavigation?.primary) ? state.testNavigation.primary.slice() : [],
        secondary: Array.isArray(state.testNavigation?.secondary) ? state.testNavigation.secondary.slice() : [],
      },
    };
  }

  function serializeAiLayer(layer, viewport, index = 0) {
    const layout = getAiLayerLayout(layer, viewport);
    const desktopLayout = getAiLayerLayout(layer, "desktop");
    const mobileLayout = getAiLayerLayout(layer, "mobile");
    const opacity = Number(layer.appearance?.opacity ?? layer.opacity ?? 1);
    return {
      id: layer.id,
      name: layer.name || "",
      type: layer.type || "layer",
      role: layer.role || "",
      x: Math.round(layout.x),
      y: Math.round(layout.y),
      width: Math.round(layout.width),
      height: Math.round(layout.height),
      rotation: Math.round(layout.rotation || 0),
      opacity,
      visible: layer.visible !== false,
      locked: Boolean(layer.locked),
      zIndex: index,
      visibilityMode: layer.visibilityMode || "both",
      visibilityLabel: getLayerVisibilityLabel(layer),
      layout: {
        x: Math.round(layout.x),
        y: Math.round(layout.y),
        width: Math.round(layout.width),
        height: Math.round(layout.height),
        rotation: Math.round(layout.rotation || 0),
      },
      desktopLayout,
      mobileLayout,
      layouts: {
        desktop: desktopLayout,
        mobile: mobileLayout,
      },
      text: layer.text || "",
      link: layer.link || "",
      clickAction: layer.clickAction || null,
      hitArea: layer.hitArea || null,
      sound: hasAnySound(layer),
      imageWarning: hasImageWarning(layer),
    };
  }

  function getAiLayerLayout(layer, viewport) {
    const layout = layer.layouts?.[viewport] || layer[viewport] || renderer.getLayerLayout(layer, viewport);
    return {
      x: Math.round(layout.x),
      y: Math.round(layout.y),
      width: Math.round(layout.width),
      height: Math.round(layout.height),
      rotation: Math.round(layout.rotation || 0),
    };
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
      "公開前メモ作成",
    ];
    state.finalPreviewComplete = false;
    els.finalPreviewModal.hidden = false;
    els.finalPreviewComplete.hidden = true;
    els.finalPreviewProgress.style.width = "0%";
    els.finalPreviewStatus.textContent = "Ver.1の公開前チェックを開始しています。自動HTML生成と自動公開は未接続です。";
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
      els.finalPreviewStatus.textContent = "Ver.1の確認が完了しました。公開反映はCodexで公開用HTML/CSS/JSへ反映してからpushします。";
      els.finalPreviewComplete.hidden = false;
      state.finalPreviewComplete = true;
      updateButtons();
      showModeToast("Final Preview確認が完了しました。Publish自動公開は次段階で接続します。");
    }, 420 * (steps.length + 2));
  }

  function renderAll() {
    const page = getCurrentPage();
    normalizeHitAreaVisibility(page);
    normalizeMarkupViewportVisibility(page);
    normalizeSharedImageLayouts(page);
    applyEditorMode();
    renderPropertyMode();
    renderPageSelect();
    renderCanvas(page);
    renderProperties();
    renderStylePanel();
    renderBrushControls();
    renderRetouchControls();
    renderLayerList();
    renderSettings();
    renderSiteMapPanel();
    updateViewMenuState();
    updateButtons();
    updateStatus();
    updateCanvasScale();
    autosave();
  }

  function normalizeHitAreaVisibility(page) {
    (page?.layers || []).forEach((layer) => {
      if (layer.role === "hit-area" && layer.visibilityMode !== "hidden") {
        layer.visibilityMode = "both";
        layer.shape = Object.assign({}, layer.shape || {}, {
          fill: "rgba(48, 211, 106, 0.12)",
          fillEnabled: true,
          stroke: "#30d36a",
          strokeEnabled: true,
        });
        layer.appearance = Object.assign({}, layer.appearance || {}, {
          opacity: 0.45,
          brightness: 1,
          shadow: "none",
        });
      }
    });
  }

  function normalizeMarkupViewportVisibility(page) {
    let changed = false;
    (page?.layers || []).forEach((layer) => {
      if (layer.role !== "markup" || layer.visibilityMode === "hidden") {
        return;
      }
      const inferred = inferMarkupViewport(page, layer);
      if (inferred && layer.visibilityMode !== inferred) {
        layer.visibilityMode = inferred;
        changed = true;
      }
      if ((layer.visibilityMode === "desktop" || layer.visibilityMode === "mobile") && hasForeignCanvasLayout(page, layer, layer.visibilityMode)) {
        const inactiveViewport = layer.visibilityMode === "desktop" ? "mobile" : "desktop";
        const activeLayout = layer[layer.visibilityMode] || { x: 0, y: 0, width: 1, height: 1 };
        layer[inactiveViewport] = createHiddenViewportLayout(activeLayout);
        changed = true;
      }
    });
    if (changed) {
      markDirty();
    }
  }

  function inferMarkupViewport(page, layer) {
    const hasDesktopPaint = Boolean(layer.desktopSrc);
    const hasMobilePaint = Boolean(layer.mobileSrc);
    if (hasDesktopPaint && !hasMobilePaint) {
      return "desktop";
    }
    if (hasMobilePaint && !hasDesktopPaint) {
      return "mobile";
    }
    const desktopSize = getPageViewportSize(page, "desktop");
    const mobileSize = getPageViewportSize(page, "mobile");
    const desktopLooksMobile = layoutMatchesSize(layer.desktop, mobileSize);
    const mobileLooksDesktop = layoutMatchesSize(layer.mobile, desktopSize);
    if (desktopLooksMobile && !mobileLooksDesktop) {
      return "mobile";
    }
    if (mobileLooksDesktop && !desktopLooksMobile) {
      return "desktop";
    }
    return "";
  }

  function hasForeignCanvasLayout(page, layer, activeViewport) {
    const inactiveViewport = activeViewport === "desktop" ? "mobile" : "desktop";
    const inactiveLayout = layer[inactiveViewport];
    if (!inactiveLayout) {
      return false;
    }
    const activeSize = getPageViewportSize(page, activeViewport);
    return layoutMatchesSize(inactiveLayout, activeSize);
  }

  function layoutMatchesSize(layout, size) {
    if (!layout || !size) {
      return false;
    }
    const width = Math.round(Number(layout.width) || 0);
    const height = Math.round(Number(layout.height) || 0);
    return Math.abs(width - Math.round(Number(size.width) || 0)) <= 2
      && Math.abs(height - Math.round(Number(size.height) || 0)) <= 2;
  }

  function normalizeSharedImageLayouts(page) {
    (page?.layers || []).forEach((layer) => {
      if (layer.type !== "image" || layer.role === "background") {
        return;
      }
      const isSharedImage = Boolean(layer.src) && !layer.desktopSrc && !layer.mobileSrc;
      if (!isSharedImage || !layer.desktop || !layer.mobile) {
        return;
      }
      const mobileSize = renderer.getViewportSize("mobile");
      const mobile = layer.mobile;
      const width = Math.max(1, Number(mobile.width) || 1);
      const height = Math.max(1, Number(mobile.height) || 1);
      const entirelyOutside = mobile.x + width < 0
        || mobile.y + height < 0
        || mobile.x > mobileSize.width
        || mobile.y > mobileSize.height;
      if (entirelyOutside) {
        layer.mobile = createResponsiveLayerLayout(layer.desktop, "desktop", "mobile", Math.min(260, width), Math.min(260, height));
      }
    });
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
    if (state.existingWeb.active) {
      const option = document.createElement("option");
      option.value = state.existingWeb.pageId || "existing-web";
      option.textContent = `${state.existingWeb.label || state.existingWeb.sourcePath} / 既存Web`;
      option.selected = true;
      els.pageSelect.appendChild(option);
      return;
    }
    state.project.pages.forEach((page) => {
      const option = document.createElement("option");
      option.value = page.id;
      option.textContent = page.name;
      option.selected = page.id === state.pageId;
      els.pageSelect.appendChild(option);
    });
  }

  function beginPageNameEdit() {
    const page = getCurrentPage();
    if (!page || !els.pageNameInput) {
      return;
    }
    els.pageNameInput.value = page.name || "未命名";
    els.pageSelect.hidden = true;
    els.pageNameInput.hidden = false;
    requestAnimationFrame(() => {
      els.pageNameInput.focus();
      els.pageNameInput.select();
    });
  }

  function commitPageNameEdit() {
    if (!els.pageNameInput || els.pageNameInput.hidden) {
      return;
    }
    const page = getCurrentPage();
    const nextName = String(els.pageNameInput.value || "").trim() || "未命名";
    els.pageNameInput.hidden = true;
    els.pageSelect.hidden = false;
    if (!page) {
      return;
    }
    if (page.name !== nextName) {
      page.name = nextName;
      if (state.project.pages.length === 1) {
        state.project.name = nextName;
      }
      markDirty();
    }
    renderAll();
  }

  function cancelPageNameEdit() {
    if (!els.pageNameInput) {
      return;
    }
    els.pageNameInput.hidden = true;
    els.pageSelect.hidden = false;
    renderPageSelect();
  }

  function renderCanvas(page) {
    if (state.existingWeb.active) {
      renderExistingWebView();
      return;
    }
    renderExistingWebView();
    const primaryPage = getPrimaryPage();
    const primaryRenderPage = state.preview ? getTestPageById(state.testPageIds?.primary) || primaryPage : primaryPage;
    const activeWindow = getActiveWindowKey();
    const hideLayerControls = isPaintPointerActive();
    els.canvas.classList.toggle("is-preview", state.preview);
    els.canvas.classList.toggle("is-test-window", isWindowInTest("primary"));
    els.canvasScaler.classList.toggle("is-active-window", activeWindow === "primary");
    els.secondaryCanvasScaler.classList.toggle("is-active-window", activeWindow === "secondary");
    applyCanvasDisplaySettings();
    const mainViewport = state.windowMode === "pc-mobile" ? "desktop" : state.viewport;
    renderer.renderPage(els.canvas, primaryRenderPage, mainViewport, {
      edit: !state.preview,
      selectedId: !hideLayerControls && state.pageId === primaryRenderPage.id && getActiveWindowKey() === "primary" ? state.selectedId : "",
      selectedIds: !hideLayerControls && state.pageId === primaryRenderPage.id && getActiveWindowKey() === "primary" ? getSelectedIds() : [],
      showHitAreas: state.showHitAreas,
      test: isWindowInTest("primary"),
      onImageStatus: handleImageStatus,
      isImageWarning: hasImageWarning,
      onAction: (layer, event) => handleTestLayerAction(layer, event, "primary"),
      onSelect: (id, event) => {
        if (state.windowMode === "image" || state.windowMode === "pc-mobile") {
          activatePrimaryWindow();
        }
        if (state.tool === "eyedropper") {
          pickColorFromCanvas(event, id);
          return;
        }
        if (state.tool === "pen") {
          beginPenStroke(event);
          return;
        }
        if (state.tool === "clone") {
          beginCloneStroke(event);
          return;
        }
        if (state.tool === "eraser") {
          beginEraserStroke(event);
          return;
        }
        if (state.tool === "fill") {
          applyFillTool(event, id);
          return;
        }
        if (state.tool === "retouch") {
          beginRetouchStroke(event);
          return;
        }
        if (state.tool === "select") {
          beginRectSelection(event);
        } else if (state.tool === "text") {
          const layer = findLayer(id);
          if (layer?.type === "text") {
            beginTextEdit(id, false);
          } else {
            beginLayerPointer(id, event);
          }
        } else {
          beginLayerPointer(id, event);
        }
      },
    });
    if (!state.preview && !hideLayerControls && state.pageId === primaryRenderPage.id && getActiveWindowKey() === "primary") {
      renderRangeSelection(els.canvas, "primary");
      renderSelectionHandles();
    }
    renderCloneSourceMarker(els.canvas, primaryRenderPage, mainViewport);
    renderTestOverlay(els.canvas, "primary");
    renderSecondaryWindow(primaryPage);
  }

  function renderExistingWebView() {
    if (!els.existingWebViewer) {
      return;
    }
    const active = Boolean(state.existingWeb.active);
    els.existingWebViewer.hidden = !active;
    if (els.canvasScaler) {
      els.canvasScaler.hidden = active;
    }
    if (els.secondaryCanvasScaler) {
      els.secondaryCanvasScaler.hidden = true;
    }
    if (!active) {
      if (els.canvasViewport) {
        els.canvasViewport.classList.remove("is-existing-web-view");
      }
      return;
    }
    if (els.canvasViewport) {
      els.canvasViewport.classList.remove("is-split-view", "is-split-vertical");
      els.canvasViewport.classList.add("is-existing-web-view");
    }
    if (els.existingWebFrame) {
      const reloadToken = String(state.existingWeb.reloadToken || "");
      const needsReload = els.existingWebFrame.src !== state.existingWeb.currentUrl
        || els.existingWebFrame.dataset.reloadToken !== reloadToken;
      if (needsReload) {
        els.existingWebFrame.dataset.reloadToken = reloadToken;
        try {
          if (els.existingWebFrame.src === state.existingWeb.currentUrl && els.existingWebFrame.contentWindow?.location) {
            els.existingWebFrame.contentWindow.location.replace(state.existingWeb.currentUrl);
          } else {
            els.existingWebFrame.src = state.existingWeb.currentUrl;
          }
        } catch (error) {
          els.existingWebFrame.src = state.existingWeb.currentUrl;
        }
      }
    }
    if (els.existingWebTitle) {
      els.existingWebTitle.textContent = state.existingWeb.label || state.existingWeb.sourcePath || "既存Webページ";
    }
    if (els.existingWebMeta) {
      const adapter = adapterRegistry?.get(state.existingWeb.adapterId);
      els.existingWebMeta.textContent = [
        state.existingWeb.pageId,
        state.existingWeb.sourcePath,
        state.existingWeb.viewState ? `view:${state.existingWeb.viewState}` : "",
        `Source: ${state.existingWeb.sourceAuthority || "standard-web"}`,
        `Adapter: ${adapter?.label || "None"}`,
      ].filter(Boolean).join(" / ");
    }
    if (els.existingWebViewer) {
      els.existingWebViewer.dataset.mode = state.existingWeb.mode || "edit";
    }
    if (els.existingWebEditMode) {
      const activeEdit = state.existingWeb.mode !== "test";
      els.existingWebEditMode.classList.toggle("is-active", activeEdit);
      els.existingWebEditMode.setAttribute("aria-pressed", activeEdit ? "true" : "false");
    }
    if (els.existingWebTestMode) {
      const activeTest = state.existingWeb.mode === "test";
      els.existingWebTestMode.classList.toggle("is-active", activeTest);
      els.existingWebTestMode.setAttribute("aria-pressed", activeTest ? "true" : "false");
    }
    if (els.existingWebAudioToggle) {
      const editMode = state.existingWeb.mode !== "test";
      const muted = Boolean(state.existingWeb.audioMuted);
      els.existingWebAudioToggle.hidden = !editMode;
      els.existingWebAudioToggle.classList.toggle("is-active", editMode && muted);
      els.existingWebAudioToggle.setAttribute("aria-pressed", editMode && muted ? "true" : "false");
      els.existingWebAudioToggle.textContent = muted ? "音声OFF" : "音声ON";
      els.existingWebAudioToggle.title = muted
        ? "編集モード中のaudio/videoを一時停止・ミュートします"
        : "編集モード中もaudio/videoを許可します";
    }
    if (els.existingWebAnalyze) {
      els.existingWebAnalyze.hidden = state.editorMode !== "custom";
    }
    if (els.existingWebPageCheck) {
      const pageCheck = state.existingWeb.pageCheck || {};
      els.existingWebPageCheck.hidden = state.editorMode === "custom" || state.existingWeb.mode === "test";
      els.existingWebPageCheck.disabled = pageCheck.status === "running";
      els.existingWebPageCheck.textContent = pageCheck.status === "running"
        ? "確認中..."
        : pageCheck.status === "checked"
          ? "再確認"
          : "ページを確認";
      els.existingWebPageCheck.title = pageCheck.status === "checked"
        ? "Source変更が疑われる場合や再判定したい場合に確認します。"
        : "このページの編集可能範囲をまとめて確認します。";
    }
    if (els.existingWebCreateSafeChange) {
      els.existingWebCreateSafeChange.textContent = state.editorMode === "custom" ? "Safe Changeへ送る" : "変更を確認";
      els.existingWebCreateSafeChange.disabled = !state.existingWeb.preview?.changes?.length
        || (state.editorMode === "custom" && !state.existingWeb.selected?.mapping);
    }
    if (els.existingWebResetPreview) {
      els.existingWebResetPreview.disabled = !state.existingWeb.preview?.active;
    }
    if (els.existingWebSelectionSummary) {
      els.existingWebSelectionSummary.innerHTML = buildExistingWebSelectionSummary("compact");
    }
  }

  function renderSecondaryWindow(page) {
    const showSecondary = state.windowMode === "pc-mobile" || state.windowMode === "image";
    els.canvasViewport.classList.toggle("is-split-view", showSecondary);
    els.canvasViewport.classList.toggle("is-split-vertical", showSecondary && state.windowLayout === "vertical");
    els.secondaryCanvasScaler.hidden = !showSecondary;
    if (!showSecondary) {
      els.secondaryCanvas.innerHTML = "";
      els.secondaryCanvas.classList.remove("is-preview", "is-test-window");
      els.canvasViewport.classList.remove("is-split-vertical");
      return;
    }
    els.secondaryCanvas.classList.toggle("is-preview", state.preview);
    els.secondaryCanvas.classList.toggle("is-test-window", isWindowInTest("secondary"));
    if (state.windowMode === "pc-mobile") {
      const secondaryPage = state.preview ? getTestPageById(state.testPageIds?.secondary) || page : page;
      els.secondaryCanvas.dataset.windowLabel = "Mobile";
      renderer.renderPage(els.secondaryCanvas, secondaryPage, "mobile", {
        edit: !state.preview,
        selectedId: !isPaintPointerActive() && getActiveWindowKey() === "secondary" ? state.selectedId : "",
        selectedIds: !isPaintPointerActive() && getActiveWindowKey() === "secondary" ? getSelectedIds() : [],
        showHitAreas: state.showHitAreas,
        test: isWindowInTest("secondary"),
        onImageStatus: handleImageStatus,
        isImageWarning: hasImageWarning,
        onAction: (layer, event) => handleTestLayerAction(layer, event, "secondary"),
        onSelect: (id, event) => {
          activateSecondaryWindow();
          if (state.tool === "eyedropper") {
            pickColorFromCanvas(event, id);
            return;
          }
          if (state.tool === "pen") {
            beginPenStroke(event);
            return;
          }
          if (state.tool === "clone") {
            beginCloneStroke(event);
            return;
          }
          if (state.tool === "eraser") {
            beginEraserStroke(event);
            return;
          }
          if (state.tool === "fill") {
            applyFillTool(event, id);
            return;
          }
          if (state.tool === "retouch") {
            beginRetouchStroke(event);
            return;
          }
          if (state.tool === "select") {
            beginRectSelection(event);
          } else if (state.tool === "text") {
            const layer = findLayer(id);
            if (layer?.type === "text") {
              beginTextEdit(id, false);
            } else {
              beginLayerPointer(id, event);
            }
          } else {
            beginLayerPointer(id, event);
          }
        },
      });
      if (!state.preview && !isPaintPointerActive() && getActiveWindowKey() === "secondary") {
        renderRangeSelection(els.secondaryCanvas, "secondary");
        renderSelectionHandles(els.secondaryCanvas);
      }
      renderCloneSourceMarker(els.secondaryCanvas, secondaryPage, "mobile");
      renderTestOverlay(els.secondaryCanvas, "secondary");
      return;
    }
    if (state.windowMode === "image" && state.secondaryWindow?.pageId) {
      const imagePage = state.preview
        ? getTestPageById(state.testPageIds?.secondary) || getPageById(state.secondaryWindow.pageId)
        : getPageById(state.secondaryWindow.pageId);
      els.secondaryCanvas.dataset.windowLabel = imagePage?.name || "別ウィンドウ";
      if (!imagePage) {
        return;
      }
      renderer.renderPage(els.secondaryCanvas, imagePage, "desktop", {
        edit: !state.preview,
        selectedId: !isPaintPointerActive() && state.pageId === imagePage?.id ? state.selectedId : "",
        selectedIds: !isPaintPointerActive() && state.pageId === imagePage?.id ? getSelectedIds() : [],
        showHitAreas: false,
        test: isWindowInTest("secondary"),
        onImageStatus: handleImageStatus,
        isImageWarning: hasImageWarning,
        onAction: (layer, event) => handleTestLayerAction(layer, event, "secondary"),
        onSelect: (id, event) => {
          activateSecondaryWindow();
          if (state.tool === "pen") {
            beginPenStroke(event);
            return;
          }
          if (state.tool === "clone") {
            beginCloneStroke(event);
            return;
          }
          if (state.tool === "eraser") {
            beginEraserStroke(event);
            return;
          }
          if (state.tool === "retouch") {
            beginRetouchStroke(event);
            return;
          }
          beginLayerPointer(id, event);
        },
      });
      if (!state.preview && !isPaintPointerActive() && state.pageId === imagePage.id) {
        renderRangeSelection(els.secondaryCanvas, "secondary");
        renderSelectionHandles(els.secondaryCanvas);
      }
      renderCloneSourceMarker(els.secondaryCanvas, imagePage, "desktop");
      renderTestOverlay(els.secondaryCanvas, "secondary");
    }
  }

  function renderTestOverlay(canvas, windowKey) {
    if (!state.preview || !canvas) {
      return;
    }
    renderTestExternalView(canvas, windowKey);
    const badge = document.createElement("div");
    badge.className = "tb-test-badge";
    badge.classList.toggle("is-active", isWindowInTest(windowKey));
    badge.textContent = isWindowInTest(windowKey)
      ? `${getWindowTestLabel(windowKey)} TEST中`
      : "比較表示";
    canvas.appendChild(badge);
    if (state.testAction?.window !== windowKey) {
      return;
    }
    const result = document.createElement("div");
    result.className = "tb-test-result";
    result.innerHTML = `<strong>${escapeHtml(state.testAction.layerName)}</strong><span>${escapeHtml(state.testAction.message)}</span>`;
    canvas.appendChild(result);
  }

  function renderTestExternalView(canvas, windowKey) {
    const key = windowKey === "secondary" ? "secondary" : "primary";
    const view = state.testExternalViews?.[key];
    if (!view?.url) {
      return;
    }
    const wrap = document.createElement("div");
    wrap.className = "tb-test-external-view";
    wrap.dataset.displayMode = view.displayMode || "full";
    wrap.dataset.testViewport = view.viewport || getTestExternalViewport(windowKey);
    const toolbar = document.createElement("div");
    toolbar.className = "tb-test-external-toolbar";
    const title = document.createElement("strong");
    title.textContent = view.title || "外部ページ";
    const url = document.createElement("span");
    url.textContent = view.officialUrl || view.url;
    const open = document.createElement("a");
    open.href = view.officialUrl || view.url;
    open.target = "_blank";
    open.rel = "noopener noreferrer";
    open.textContent = "別タブで開く";
    const back = document.createElement("button");
    back.type = "button";
    back.textContent = "戻る";
    back.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      handleTestBack(null, event, windowKey);
    });
    toolbar.append(title, url, open, back);
    const frame = document.createElement("iframe");
    frame.className = "tb-test-external-frame";
    frame.src = view.url;
    frame.title = view.title || "TBalance TEST external preview";
    frame.referrerPolicy = "no-referrer-when-downgrade";
    frame.setAttribute("loading", "eager");
    applyTestFrameViewport(frame, view, windowKey);
    wrap.append(toolbar, frame);
    canvas.appendChild(wrap);
  }

  function applyTestFrameViewport(frame, view, windowKey) {
    const viewport = view.viewport || getTestExternalViewport(windowKey);
    if ((view.displayMode || "full") !== "full" || viewport !== "mobile") {
      return;
    }
    const page = getTestPageById(state.testPageIds?.[windowKey === "secondary" ? "secondary" : "primary"]) || getCurrentPage();
    const size = getPageViewportSize(page, "mobile");
    const baseWidth = 390;
    const scale = Math.max(1, (Number(size.width) || 1080) / baseWidth);
    const baseHeight = Math.max(1, (Number(size.height) || 1920) / scale);
    frame.style.width = `${baseWidth}px`;
    frame.style.height = `${baseHeight}px`;
    frame.style.transform = `scale(${scale})`;
    frame.style.transformOrigin = "top left";
  }

  function renderCloneSourceMarker(canvas, page, viewport) {
    const source = getVisibleCloneSource(page, viewport);
    if (state.tool !== "clone" || !source || !page || source.pageId !== page.id || source.viewport !== viewport) {
      return;
    }
    const marker = document.createElement("div");
    marker.className = "tb-clone-source-marker";
    marker.style.left = `${source.x}px`;
    marker.style.top = `${source.y}px`;
    marker.innerHTML = '<span></span><strong>コピー元</strong>';
    canvas.appendChild(marker);
  }

  function getVisibleCloneSource(page, viewport) {
    const pointer = state.pointer;
    if (
      pointer?.type === "clone-draw"
      && pointer.pageId === page?.id
      && pointer.viewport === viewport
      && pointer.destStart
      && pointer.sourceStart
      && pointer.last
    ) {
      return Object.assign({}, pointer.source || state.cloneSource || {}, {
        pageId: pointer.pageId,
        viewport: pointer.viewport,
        x: (Number(pointer.sourceStart.x) || 0) + ((Number(pointer.last.x) || 0) - (Number(pointer.destStart.x) || 0)),
        y: (Number(pointer.sourceStart.y) || 0) + ((Number(pointer.last.y) || 0) - (Number(pointer.destStart.y) || 0)),
      });
    }
    return state.cloneSource;
  }

  function isPaintPointerActive() {
    return state.pointer?.type === "pen-draw"
      || state.pointer?.type === "clone-draw"
      || state.pointer?.type === "eraser-draw"
      || state.pointer?.type === "retouch-draw";
  }

  function applyCanvasDisplaySettings() {
    const settings = renderer.normalizeUiSettings(state.uiSettings);
    els.canvas.classList.toggle("has-grid", settings.showGrid && !state.preview);
    els.canvas.classList.toggle("has-guides", settings.showGuides && !state.preview);
    els.canvas.style.setProperty("--tb-grid-x", `${settings.gridStepX}px`);
    els.canvas.style.setProperty("--tb-grid-y", `${settings.gridStepY}px`);
    els.canvas.style.setProperty("--tb-guide-x", `${settings.guideStepX}px`);
    els.canvas.style.setProperty("--tb-guide-y", `${settings.guideStepY}px`);
    document.querySelectorAll(".tb-ruler").forEach((ruler) => {
      ruler.hidden = settings.showRulers === false;
    });
  }

  function renderRangeSelection(targetCanvas = els.canvas, windowKey = "primary") {
    const activeWindow = getActiveWindowKey();
    let rect = null;
    let shape = state.selectionMode || "rect";
    let final = false;
    if (state.selectionRect && (state.selectionRect.window || "primary") === windowKey) {
      rect = getNormalizedRect(state.selectionRect.start, state.selectionRect.current);
      shape = state.selectionRect.shape || shape;
    } else if (state.selectionRange && state.selectionRange.window === windowKey && activeWindow === windowKey) {
      rect = state.selectionRange;
      shape = state.selectionRange.shape || shape;
      final = true;
    }
    if (!rect || rect.width < 1 || rect.height < 1) {
      return;
    }
    const box = document.createElement("div");
    box.className = "tb-rect-selection";
    box.classList.toggle("is-ellipse", shape === "ellipse");
    box.classList.toggle("is-final", final);
    box.style.left = `${rect.x}px`;
    box.style.top = `${rect.y}px`;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;
    if (shape === "ellipse") {
      box.innerHTML = `
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <ellipse cx="50" cy="50" rx="50" ry="50"></ellipse>
        </svg>
      `;
    }
    targetCanvas.appendChild(box);
    if (final) {
      const actions = document.createElement("div");
      actions.className = "tb-selection-actions";
      const canvasWidth = Number(targetCanvas.style.getPropertyValue("--tb-canvas-width")) || getPageViewportSize(getCurrentPage(), state.viewport).width;
      const left = rect.x + rect.width + 10;
      const fallbackLeft = Math.max(8, rect.x - 178);
      actions.style.left = `${left + 172 > canvasWidth ? fallbackLeft : left}px`;
      actions.style.top = `${Math.max(8, rect.y)}px`;
      actions.innerHTML = `
        <button type="button" data-selection-float-action="copy-layer">コピーする</button>
      `;
      targetCanvas.appendChild(actions);
    }
  }

  function renderSelectionHandles(targetCanvas = els.canvas) {
    if (isPaintPointerActive()) {
      return;
    }
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
    targetCanvas.appendChild(box);
  }

  function renderProperties() {
    const layer = getSelectedLayer();
    const showShapeToolProperties = !layer && state.tool === "shape";
    const showTextToolProperties = !layer && state.tool === "text";
    const showAnimationToolProperties = !layer && state.tool === "animation";
    const showSoundToolProperties = !layer && state.tool === "sound";
    const showFillToolProperties = state.tool === "fill";
    els.emptyProperties.hidden = Boolean(layer) || showShapeToolProperties || showTextToolProperties || showAnimationToolProperties || showSoundToolProperties || showFillToolProperties;
    els.properties.hidden = !layer && !showShapeToolProperties && !showTextToolProperties && !showAnimationToolProperties && !showSoundToolProperties && !showFillToolProperties;
    if (showShapeToolProperties) {
      if (!state.shapeColorTarget) {
        state.shapeColorTarget = "fill";
      }
      els.propShapeType.value = els.propShapeType.value || "rect";
      els.propShapeFillMode.value = "fill";
      els.propShapeFill.disabled = false;
      els.propShapeStrokeMode.value = "stroke";
      els.propShapeStroke.disabled = false;
      els.propShapeStrokeWidth.disabled = false;
      els.propShapeShadow.checked = false;
      els.propShapeShadowType.value = "soft";
      els.propShapeShadowSize.value = 16;
      els.propShapeShadowColor.value = "#000000";
      els.propShapeShadowOpacity.value = 38;
      els.propShapeShadowType.disabled = true;
      els.propShapeShadowSize.disabled = true;
      els.propShapeShadowColor.disabled = true;
      els.propShapeShadowOpacity.disabled = true;
      els.propShapeFill.classList.toggle("is-shape-color-target", state.shapeColorTarget === "fill");
      els.propShapeStroke.classList.toggle("is-shape-color-target", state.shapeColorTarget === "stroke");
      return;
    }
    if (showFillToolProperties) {
      renderFillFields();
      return;
    }
    if (showTextToolProperties) {
      els.propTextFont.value = "system";
      els.propTextFontSize.value = 58;
      els.propTextBold.classList.remove("is-active");
      els.propTextItalic.classList.remove("is-active");
      els.propTextUnderline.classList.remove("is-active");
      els.propTextColor.value = "#fff6db";
      els.propTextStrokeMode.value = "none";
      els.propTextStrokeColor.value = "#0b1220";
      els.propTextStrokeWidth.value = 0;
      els.propTextStrokeColor.disabled = true;
      els.propTextStrokeWidth.disabled = true;
      els.propTextShadow.checked = false;
      els.propTextShadowType.value = "soft";
      els.propTextShadowSize.value = 16;
      els.propTextShadowColor.value = "#000000";
      els.propTextShadowOpacity.value = 38;
      els.propTextShadowType.disabled = true;
      els.propTextShadowSize.disabled = true;
      els.propTextShadowColor.disabled = true;
      els.propTextShadowOpacity.disabled = true;
      return;
    }
    if (showAnimationToolProperties) {
      renderAnimationFields();
      return;
    }
    if (showSoundToolProperties) {
      renderSoundFields();
      return;
    }
    if (!layer) {
      state.shapeColorTarget = "";
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
    const shape = layer.shape || {};
    els.propShapeType.value = shape.type || "rect";
    if (layer.type === "shape" && !state.shapeColorTarget) {
      state.shapeColorTarget = "fill";
    }
    if (layer.type !== "shape") {
      state.shapeColorTarget = "";
    }
    const fillEnabled = shape.fillEnabled !== false && shape.fill !== "none";
    const strokeEnabled = shape.strokeEnabled !== false && shape.stroke !== "none" && Number(shape.strokeWidth ?? 4) > 0;
    els.propShapeFillMode.value = fillEnabled ? "fill" : "none";
    els.propShapeFill.disabled = !fillEnabled;
    els.propShapeFill.value = cssColorToHex(shape.fill || "#fff6db") || "#fff6db";
    els.propShapeStrokeMode.value = strokeEnabled ? "stroke" : "none";
    els.propShapeStroke.disabled = !strokeEnabled;
    els.propShapeStrokeWidth.disabled = !strokeEnabled;
    els.propShapeStroke.value = cssColorToHex(shape.stroke || "#2f8cff") || "#2f8cff";
    els.propShapeStrokeWidth.value = Math.round(Number(shape.strokeWidth ?? 4));
    els.propShapeRadius.value = Math.round(Number(shape.radius ?? (shape.type === "roundRect" ? 14 : 0)));
    els.propShapeShadow.checked = Boolean(appearance.shadow && appearance.shadow !== "none");
    els.propShapeShadowType.value = appearance.shadowType === "solid" ? "solid" : "soft";
    els.propShapeShadowSize.value = Math.round(Number(appearance.shadowSize ?? 16));
    els.propShapeShadowColor.value = cssColorToHex(appearance.shadowColor || "#000000") || "#000000";
    els.propShapeShadowOpacity.value = Math.round(Number(appearance.shadowOpacity ?? 38));
    els.propShapeShadowType.disabled = !els.propShapeShadow.checked;
    els.propShapeShadowSize.disabled = !els.propShapeShadow.checked;
    els.propShapeShadowColor.disabled = !els.propShapeShadow.checked;
    els.propShapeShadowOpacity.disabled = !els.propShapeShadow.checked;
    els.propShapeFill.classList.toggle("is-shape-color-target", state.shapeColorTarget === "fill");
    els.propShapeStroke.classList.toggle("is-shape-color-target", state.shapeColorTarget === "stroke");
    els.propShadow.checked = appearance.shadow && appearance.shadow !== "none";
    els.propLink.value = layer.link || "";
    const clickAction = layer.clickAction || {};
    const clickType = normalizeClickActionType(clickAction.type, layer.link || clickAction.target || "");
    els.propClickAction.value = clickType;
    els.propClickPreset.value = clickType === "page" ? getClickPresetValue(layer.link || clickAction.target || "") : "";
    els.propClickPreset.disabled = clickType !== "page";
    if (els.propClickDisplayMode) {
      els.propClickDisplayMode.value = clickAction.displayMode || "auto";
      els.propClickDisplayMode.disabled = clickType === "none";
    }
    els.transformNormal.classList.toggle("is-active", layer.transformMode === "normal");
    els.transformPerspective.classList.toggle("is-active", layer.transformMode === "perspective");
    els.transformFree.classList.toggle("is-active", layer.transformMode === "free");
    const textStyle = getActiveTextStyle(layer);
    els.propTextFont.value = textStyle.fontFamily || "system";
    els.propTextFontSize.value = Math.round(Number(textStyle.fontSize || 48));
    els.propTextBold.classList.toggle("is-active", Number(textStyle.weight || 400) >= 700);
    els.propTextItalic.classList.toggle("is-active", Boolean(textStyle.italic));
    els.propTextUnderline.classList.toggle("is-active", Boolean(textStyle.underline));
    els.propTextColor.value = cssColorToHex(textStyle.color || "#fff6db") || "#fff6db";
    const textStrokeEnabled = textStyle.strokeEnabled === true && Number(textStyle.strokeWidth || 0) > 0;
    els.propTextStrokeMode.value = textStrokeEnabled ? "stroke" : "none";
    els.propTextStrokeColor.value = cssColorToHex(textStyle.strokeColor || "#0b1220") || "#0b1220";
    els.propTextStrokeWidth.value = Math.round(Number(textStyle.strokeWidth || 0));
    els.propTextStrokeColor.disabled = !textStrokeEnabled;
    els.propTextStrokeWidth.disabled = !textStrokeEnabled;
    els.propTextShadow.checked = Boolean(appearance.shadow && appearance.shadow !== "none");
    els.propTextShadowType.value = appearance.shadowType === "solid" ? "solid" : "soft";
    els.propTextShadowSize.value = Math.round(Number(appearance.shadowSize ?? 16));
    els.propTextShadowColor.value = cssColorToHex(appearance.shadowColor || "#000000") || "#000000";
    els.propTextShadowOpacity.value = Math.round(Number(appearance.shadowOpacity ?? 38));
    els.propTextShadowType.disabled = !els.propTextShadow.checked;
    els.propTextShadowSize.disabled = !els.propTextShadow.checked;
    els.propTextShadowColor.disabled = !els.propTextShadow.checked;
    els.propTextShadowOpacity.disabled = !els.propTextShadow.checked;
    renderAnimationFields(layer);
    renderSoundFields();
    renderFillFields();
  }

  function renderPropertyMode() {
    if (!els.propertyHeader) {
      return;
    }
    if (state.tool === "sound") {
      els.propertyHeader.dataset.propertyMode = "sound";
      return;
    }
    if (state.tool === "animation") {
      els.propertyHeader.dataset.propertyMode = "animation";
      return;
    }
    if (state.tool === "pen") {
      els.propertyHeader.dataset.propertyMode = "pen";
      return;
    }
    if (state.tool === "eraser") {
      els.propertyHeader.dataset.propertyMode = "eraser";
      return;
    }
    if (state.tool === "fill") {
      els.propertyHeader.dataset.propertyMode = "fill";
      return;
    }
    if (state.tool === "retouch") {
      els.propertyHeader.dataset.propertyMode = "retouch";
      return;
    }
    const selectedLayer = getSelectedLayer();
    if (selectedLayer?.role === "pen" || selectedLayer?.shape?.type === "pen") {
      els.propertyHeader.dataset.propertyMode = "pen";
      return;
    }
    if (selectedLayer && state.tool === "click") {
      els.propertyHeader.dataset.propertyMode = "click";
      return;
    }
    if (hasClickControls(selectedLayer)) {
      els.propertyHeader.dataset.propertyMode = "click";
      return;
    }
    if (selectedLayer?.type === "shape") {
      els.propertyHeader.dataset.propertyMode = selectedLayer.role === "fill" ? "fill" : "shape";
      return;
    }
    if (selectedLayer?.type === "text") {
      els.propertyHeader.dataset.propertyMode = "text";
      return;
    }
    const knownModes = ["move", "select", "image", "text", "shape", "click", "animation", "sound", "eyedropper", "pen", "clone", "eraser", "fill", "retouch"];
    els.propertyHeader.dataset.propertyMode = knownModes.includes(state.tool) ? state.tool : "move";
  }

  function renderFillFields() {
    if (!els.propFillType) {
      return;
    }
    els.propFillType.value = state.fillType === "gradient" ? "gradient" : "solid";
    const color = normalizeHexColor(getActiveColor()) || "#fff6db";
    els.propFillColor.value = color;
    state.fillOpacity = renderer.clamp(Number(state.fillOpacity) || 100, 0, 100);
    els.propFillOpacity.value = state.fillOpacity;
    els.propFillOpacityValue.textContent = `${state.fillOpacity}%`;
  }

  function renderSoundFields() {
    const target = getSoundTarget();
    const mode = normalizeSoundMode(state.soundMode);
    const sound = getSoundSettings(target, mode);
    if (els.propSoundTarget) {
      els.propSoundTarget.value = mode === "bgm" ? "page" : "selected";
      els.propSoundTarget.disabled = mode === "bgm";
    }
    els.propSoundTrigger.value = getSoundTriggerForMode(mode);
    els.propSoundTrigger.disabled = true;
    els.propSoundFileName.textContent = sound.fileName || "未設定";
    els.propSoundFileName.classList.toggle("is-empty", !sound.fileName);
    els.propSoundVolume.value = Math.round(Number(sound.volume ?? 80));
    els.propSoundVolumeValue.textContent = `${els.propSoundVolume.value}%`;
    els.propSoundLoop.checked = Boolean(sound.loop);
  }

  function renderAnimationFields(layer) {
    const animation = getNormalizedAnimation(layer);
    els.propAnimationType.value = animation.type;
    els.propAnimationTrigger.value = animation.trigger;
    els.propAnimationDuration.value = animation.duration;
    els.propAnimationDelay.value = animation.delay;
    els.propAnimationRepeat.value = animation.repeat;
    els.propAnimationDirection.value = animation.direction;
    els.propAnimationStrength.value = Math.round(animation.strength);
    const disabled = !layer;
    [
      els.propAnimationType,
      els.propAnimationTrigger,
      els.propAnimationDuration,
      els.propAnimationDelay,
      els.propAnimationRepeat,
      els.propAnimationDirection,
      els.propAnimationStrength,
    ].forEach((input) => {
      input.disabled = disabled;
    });
  }

  function renderSettings() {
    els.rememberLastMode.checked = !state.uiSettings.alwaysStartNormal;
    els.alwaysStartNormal.checked = Boolean(state.uiSettings.alwaysStartNormal);
    els.showToolDescriptions.checked = state.uiSettings.showToolDescriptions !== false;
    els.showBeginnerHints.checked = state.uiSettings.showBeginnerHints !== false;
    els.showShortcuts.checked = state.uiSettings.showShortcuts !== false;
    els.gridStepX.value = state.uiSettings.gridStepX;
    els.gridStepY.value = state.uiSettings.gridStepY;
    els.guideStepX.value = state.uiSettings.guideStepX;
    els.guideStepY.value = state.uiSettings.guideStepY;
    els.snapToGrid.checked = Boolean(state.uiSettings.snapToGrid);
    els.snapToGuide.checked = Boolean(state.uiSettings.snapToGuide);
  }

  function updateViewMenuState() {
    const states = {
      grid: Boolean(state.uiSettings.showGrid),
      guide: Boolean(state.uiSettings.showGuides),
      ruler: Boolean(state.uiSettings.showRulers),
    };
    Object.entries(states).forEach(([action, isOn]) => {
      const button = document.querySelector(`[data-view-action="${action}"]`);
      if (!button) {
        return;
      }
      button.classList.toggle("is-on", isOn);
      button.setAttribute("aria-pressed", String(isOn));
    });
  }

  function renderStylePanel() {
    const activeColor = getActiveColor();
    els.foregroundSwatch.classList.toggle("is-active", state.activeColorSlot === "foreground");
    els.backgroundSwatch.classList.toggle("is-active", state.activeColorSlot === "background");
    els.foregroundSwatch.classList.toggle("is-transparent", state.foregroundColor === "transparent");
    els.backgroundSwatch.classList.toggle("is-transparent", state.backgroundColor === "transparent");
    els.foregroundSwatch.style.setProperty("--swatch", state.foregroundColor);
    els.backgroundSwatch.style.setProperty("--swatch", state.backgroundColor);
    els.styleColorInput.value = activeColor === "transparent" ? "#ffffff" : activeColor;
    els.styleHexInput.value = activeColor === "transparent" ? "透明" : activeColor.toUpperCase();
    if (els.propFillColor) {
      els.propFillColor.value = activeColor === "transparent" ? "#ffffff" : activeColor;
    }
    els.styleBrightness.disabled = activeColor === "transparent";
    els.styleSaturation.disabled = activeColor === "transparent";
    els.styleBrightness.value = state.colorBrightness;
    els.styleBrightnessValue.textContent = String(state.colorBrightness);
    els.styleSaturation.value = state.colorSaturation;
    els.styleSaturationValue.textContent = String(state.colorSaturation);
    const layer = getSelectedLayer();
    const opacity = layer ? Math.round((renderer.getAppearance(layer).opacity ?? 1) * 100) : 100;
    els.styleOpacity.value = opacity;
    els.styleOpacityValue.textContent = `${opacity}%`;
  }

  function renderBrushControls() {
    els.brushTip.value = state.brushTip;
    els.headerBrushTip.value = state.brushTip;
    els.eraserTip.value = state.eraserTip;
    els.headerEraserTip.value = state.eraserTip;
    els.brushSize.value = state.brushSize;
    els.headerBrushSize.value = state.brushSize;
    els.brushSizeValue.textContent = `${state.brushSize}px`;
    els.headerBrushSizeValue.textContent = `${state.brushSize}px`;
    els.eraserSize.value = state.eraserSize;
    els.headerEraserSize.value = state.eraserSize;
    els.eraserSizeValue.textContent = `${state.eraserSize}px`;
    els.headerEraserSizeValue.textContent = `${state.eraserSize}px`;
    els.brushStrength.value = state.brushStrength;
    els.headerBrushStrength.value = state.brushStrength;
    els.brushStrengthValue.textContent = `${state.brushStrength}%`;
    els.headerBrushStrengthValue.textContent = `${state.brushStrength}%`;
    els.brushOpacity.value = state.brushOpacity;
    els.headerBrushOpacity.value = state.brushOpacity;
    els.brushOpacityValue.textContent = `${state.brushOpacity}%`;
    els.headerBrushOpacityValue.textContent = `${state.brushOpacity}%`;
  }

  function updateBrushSetting(key, value) {
    if (key === "brushTip") {
      state.brushTip = ["round", "soft", "square"].includes(value) ? value : "round";
    } else if (key === "eraserTip") {
      state.eraserTip = value === "square" ? "square" : "round";
    } else {
      const ranges = {
        brushSize: [1, 120],
        brushStrength: [1, 100],
        brushOpacity: [0, 100],
        eraserSize: [1, 360],
      };
      const [min, max] = ranges[key] || [0, 100];
      state[key] = renderer.clamp(Math.round(Number(value) || min), min, max);
    }
    renderBrushControls();
  }

  function renderRetouchControls() {
    if (!els.retouchMode) {
      return;
    }
    els.retouchMode.value = state.retouchMode;
    els.retouchTip.value = state.retouchTip;
    els.retouchSize.value = state.retouchSize;
    els.retouchSizeValue.textContent = `${state.retouchSize}px`;
    els.retouchHardness.value = state.retouchHardness;
    els.retouchHardnessValue.textContent = `${state.retouchHardness}%`;
    els.retouchOpacity.value = state.retouchOpacity;
    els.retouchOpacityValue.textContent = `${state.retouchOpacity}%`;
    els.retouchStep.value = state.retouchStep;
    els.retouchStepValue.textContent = `${state.retouchStep}%`;
    els.retouchDensity.value = state.retouchDensity;
    els.retouchDensityValue.textContent = `${state.retouchDensity}%`;
  }

  function updateRetouchSetting(key, value) {
    if (key === "retouchMode") {
      const modes = ["lighten", "darken", "soften", "sharpen", "smudge", "brightness", "saturation", "hue"];
      state.retouchMode = modes.includes(value) ? value : "lighten";
    } else if (key === "retouchTip") {
      state.retouchTip = ["round", "soft", "square"].includes(value) ? value : "round";
    } else {
      const ranges = {
        retouchSize: [1, 240],
        retouchHardness: [0, 100],
        retouchOpacity: [1, 100],
        retouchStep: [1, 100],
        retouchDensity: [1, 100],
      };
      const [min, max] = ranges[key] || [0, 100];
      state[key] = renderer.clamp(Math.round(Number(value) || min), min, max);
    }
    renderRetouchControls();
  }

  function getActiveColor() {
    return state.activeColorSlot === "background" ? state.backgroundColor : state.foregroundColor;
  }

  function setActiveColorSlot(slot) {
    state.activeColorSlot = slot === "background" ? "background" : "foreground";
    state.colorAdjustBase = getActiveColor();
    state.colorBrightness = 0;
    state.colorSaturation = 0;
    renderStylePanel();
  }

  function updateActiveColor(value, options = {}) {
    const color = normalizeHexColor(value);
    if (!color) {
      renderStylePanel();
      return;
    }
    if (state.activeColorSlot === "background") {
      state.backgroundColor = color;
    } else {
      state.foregroundColor = color;
    }
    if (!options.keepAdjustment) {
      state.colorAdjustBase = color;
      state.colorBrightness = 0;
      state.colorSaturation = 0;
    }
    renderStylePanel();
    if (options.applyToShape !== false) {
      applyColorToShapeTarget(color);
    }
  }

  function setShapeColorTarget(target) {
    state.shapeColorTarget = target === "stroke" ? "stroke" : "fill";
    els.propShapeFill.classList.toggle("is-shape-color-target", state.shapeColorTarget === "fill");
    els.propShapeStroke.classList.toggle("is-shape-color-target", state.shapeColorTarget === "stroke");
  }

  function applyColorToShapeTarget(color) {
    const layer = getSelectedLayer();
    if (!state.shapeColorTarget || layer?.type !== "shape") {
      return;
    }
    updateSelectedShape((shape) => {
      shape[state.shapeColorTarget] = color;
      if (state.shapeColorTarget === "fill") {
        shape.fillEnabled = color !== "none";
      } else if (state.shapeColorTarget === "stroke") {
        shape.strokeEnabled = color !== "none";
      }
    });
  }

  function updateActiveColorBrightness(value) {
    state.colorBrightness = renderer.clamp(Math.round(Number(value) || 0), -50, 50);
    applyColorAdjustments();
  }

  function updateActiveColorSaturation(value) {
    state.colorSaturation = renderer.clamp(Math.round(Number(value) || 0), -50, 50);
    applyColorAdjustments();
  }

  function applyColorAdjustments() {
    const saturated = adjustHexSaturation(state.colorAdjustBase || getActiveColor(), state.colorSaturation);
    const nextColor = adjustHexBrightness(saturated, state.colorBrightness);
    updateActiveColor(nextColor, { keepAdjustment: true });
  }

  function normalizeHexColor(value) {
    const text = String(value || "").trim();
    if (text === "透明" || /^transparent$/i.test(text)) {
      return "transparent";
    }
    if (/^#[0-9a-f]{6}$/i.test(text)) {
      return text.toLowerCase();
    }
    if (/^[0-9a-f]{6}$/i.test(text)) {
      return `#${text.toLowerCase()}`;
    }
    return "";
  }

  function cssColorToHex(value) {
    const text = String(value || "").trim();
    const hex = normalizeHexColor(text);
    if (hex && hex !== "transparent") {
      return hex;
    }
    const rgba = text.match(/^rgba?\(([^)]+)\)$/i);
    if (!rgba) {
      return "";
    }
    const parts = rgba[1].split(",").map((part) => Number(part.trim()));
    if (parts.length < 3 || parts.slice(0, 3).some((part) => Number.isNaN(part))) {
      return "";
    }
    return rgbToHex(parts[0], parts[1], parts[2]);
  }

  function adjustHexBrightness(hex, amount) {
    const color = normalizeHexColor(hex);
    if (!color || color === "transparent") {
      return getActiveColor();
    }
    const ratio = Math.abs(amount) / 50;
    const channels = [1, 3, 5].map((index) => parseInt(color.slice(index, index + 2), 16));
    const adjusted = channels.map((channel) => {
      const target = amount >= 0 ? 255 : 0;
      return Math.round(channel + (target - channel) * ratio);
    });
    return rgbToHex(adjusted[0], adjusted[1], adjusted[2]);
  }

  function adjustHexSaturation(hex, amount) {
    const color = normalizeHexColor(hex);
    if (!color || color === "transparent") {
      return getActiveColor();
    }
    const ratio = amount / 50;
    const channels = [1, 3, 5].map((index) => parseInt(color.slice(index, index + 2), 16));
    const gray = channels[0] * 0.299 + channels[1] * 0.587 + channels[2] * 0.114;
    const adjusted = channels.map((channel) => {
      const next = amount >= 0
        ? channel + (channel - gray) * ratio
        : channel + (gray - channel) * Math.abs(ratio);
      return renderer.clamp(Math.round(next), 0, 255);
    });
    return rgbToHex(adjusted[0], adjusted[1], adjusted[2]);
  }

  function renderLayerList() {
    if (state.existingWeb.active) {
      renderExistingWebLayerPanel();
      return;
    }
    const page = getCurrentPage();
    keepMarkupLayersOnTop(page);
    els.layerList.innerHTML = "";
    page.layers.slice().reverse().forEach((layer) => {
      const row = document.createElement("div");
      const appearance = renderer.getAppearance(layer);
      row.className = "tb-layer-row";
      row.classList.toggle("is-background-layer", layer.role === "background");
      row.classList.toggle("is-hit-area-layer", layer.role === "hit-area" || Boolean(layer.hitArea?.enabled));
      row.classList.toggle("is-markup-layer", layer.role === "markup");
      row.classList.toggle("is-ai-suggestion-layer", layer.role === "markup" && layer.markupSource === "ai");
      row.classList.toggle("has-image-warning", hasImageWarning(layer));
      row.setAttribute("role", "button");
      row.tabIndex = 0;
      row.classList.toggle("is-selected", getSelectedIds().includes(layer.id));
      row.draggable = true;
      row.dataset.layerId = layer.id;
      const visible = layer.visible !== false && layer.visibilityMode !== "hidden";
      const locked = Boolean(layer.locked);
      row.innerHTML = `
        <span class="tb-layer-toggles">
          <button class="tb-layer-toggle ${visible ? "" : "is-off"}" type="button" data-layer-action="visible" title="${visible ? "表示中" : "非表示"}" aria-label="${visible ? "レイヤーを非表示にする" : "レイヤーを表示する"}">${getLayerToggleIcon(visible ? "eye" : "eyeOff")}</button>
          <button class="tb-layer-toggle ${locked ? "is-locked" : ""}" type="button" data-layer-action="lock" title="${locked ? "ロック中" : "ロックなし"}" aria-label="${locked ? "レイヤーのロックを解除する" : "レイヤーをロックする"}">${getLayerToggleIcon(locked ? "lock" : "unlock")}</button>
        </span>
        <span class="tb-layer-thumb">${createThumbHtml(layer)}</span>
        <span class="tb-layer-name"><strong data-layer-rename="${escapeHtml(layer.id)}" title="ダブルクリックで名前変更">${getLayerRoleBadge(layer)}${getLayerWarningBadge(layer)}${getLayerSoundBadge(layer)}${escapeHtml(layer.name || layer.id)}</strong><small>${escapeHtml(getLayerSubLabel(layer))}</small></span>
        <span class="tb-layer-opacity">${Math.round((appearance.opacity ?? 1) * 100)}%</span>
      `;
      bindLayerThumbnailWarning(row, layer);
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setSingleSelection(layer.id);
          renderAll();
        }
      });
      row.addEventListener("contextmenu", (event) => {
        handleLayerContextMenu(event, layer.id);
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

  function renderExistingWebLayerPanel() {
    const layers = state.existingWeb.virtualLayers?.length
      ? state.existingWeb.virtualLayers
      : refreshExistingWebVirtualLayers();
    const displayLayers = state.editorMode === "custom" ? layers : getExistingWebNormalDisplayLayers(layers);
    const selectedDomRef = state.existingWeb.selected?.domRef || "";
    const pageCheckHtml = state.editorMode === "custom" ? "" : buildExistingWebPageCheckSummary(displayLayers);
    const layerRows = displayLayers.length
      ? `<div class="tb-existing-web-virtual-list">
          ${displayLayers.map((layer) => layer.kind === "other-summary" ? `
            <div class="tb-existing-web-other-summary">
              <strong>その他・別状態 ${layer.count}件</strong>
              <small>Customで詳細DOMを確認できます。</small>
            </div>
          ` : `
            <button class="tb-existing-web-virtual-row${layer.domRef === selectedDomRef ? " is-selected" : ""}" type="button" data-existing-web-virtual-layer="${escapeAttr(layer.domRef)}" data-status="${escapeAttr(layer.status.key)}">
              <span class="tb-existing-web-virtual-main">
                <strong>${escapeHtml(layer.name)}</strong>
                <small>${escapeHtml(layer.relatedCount > 1 ? `${layer.detail} / 関連要素 ${layer.relatedCount}件` : layer.detail)}</small>
              </span>
              <span class="tb-existing-web-virtual-status">${escapeHtml(layer.status.label)}</span>
              ${layer.status.key === "warning" && state.editorMode === "custom" ? `<span class="tb-existing-web-virtual-confirm" data-existing-web-action="confirm-layer" data-existing-web-dom-ref="${escapeAttr(layer.domRef)}">確認</span>` : ""}
              ${layer.status.key === "ai-needed" ? `<span class="tb-existing-web-virtual-confirm" data-existing-web-action="ai-check" data-existing-web-dom-ref="${escapeAttr(layer.domRef)}">AIに相談</span>` : ""}
            </button>
          `).join("")}
        </div>`
      : `<p class="tb-existing-web-empty">主要DOM要素をまだ読み取れていません。ページを再読み込みしてください。</p>`;
    els.layerList.innerHTML = `
      <section class="tb-existing-web-layer-panel">
        <strong>既存Web 仮想レイヤー</strong>
        <p class="tb-existing-web-layer-note">Sourceは変更せず、iframeのDOMを選択用に表示しています。</p>
        ${pageCheckHtml}
        ${layerRows}
        ${buildExistingWebSelectionSummary(state.editorMode === "custom" ? "custom" : "normal")}
      </section>
    `;
  }

  function buildExistingWebPageCheckSummary(layers) {
    const pageCheck = state.existingWeb.pageCheck || {};
    const summary = summarizeExistingWebDisplayLayers(layers);
    const aiCount = summary.ai || 0;
    if (pageCheck.status === "running") {
      return `
        <article class="tb-existing-web-page-check" data-status="running">
          <strong>${escapeHtml(state.existingWeb.label || "既存Web")}</strong>
          <p>ページを確認しています...</p>
          <small>HTML / CSS / JS / レイヤーの関係を確認中</small>
        </article>
      `;
    }
    if (pageCheck.status === "checked") {
      return `
        <article class="tb-existing-web-page-check" data-status="checked">
          <strong>${escapeHtml(state.existingWeb.label || "既存Web")} / ページ確認済み</strong>
          <div class="tb-existing-web-page-check-counts">
            <span>編集OK ${summary.editable || 0}</span>
            <span>AI確認 ${aiCount}</span>
            <span>保護 ${summary.protected || 0}</span>
            <span>問題 ${summary.problem || 0}</span>
          </div>
          <div class="tb-existing-web-page-check-actions">
            <button type="button" data-existing-web-action="page-check">再確認</button>
            ${aiCount ? `<button type="button" data-existing-web-action="ai-check-all">まとめてAIに相談</button>` : ""}
          </div>
        </article>
      `;
    }
    return `
      <article class="tb-existing-web-page-check" data-status="${escapeAttr(pageCheck.status || "idle")}">
        <strong>${escapeHtml(state.existingWeb.label || "既存Web")}</strong>
        <p>${pageCheck.status === "changed" ? "ページが変更されています。再確認してください。" : "まだ編集範囲を確認していません。"}</p>
        <div class="tb-existing-web-page-check-actions">
          <button type="button" data-existing-web-action="page-check">ページを確認</button>
        </div>
      </article>
    `;
  }

  function getExistingWebNormalDisplayLayers(layers) {
    const groups = new Map();
    const priorityNames = ["背景", "リル", "吹き出し", "願い星を書く", "今日のほっこり", "森へ戻る"];
    layers.forEach((layer) => {
      const visible = Number(layer.bounds?.width || 0) > 0 && Number(layer.bounds?.height || 0) > 0;
      const priorityName = priorityNames.find((item) => layer.name.includes(item));
      if (priorityName && !visible && layer.status.key !== "editable" && !layer.mapping) {
        return;
      }
      const name = priorityName || (visible && layer.status.key === "editable" ? layer.name : "");
      if (!name) {
        return;
      }
      const current = groups.get(name) || { name, items: [] };
      current.items.push(layer);
      groups.set(name, current);
    });
    const groupedRefs = new Set(Array.from(groups.values()).flatMap((group) => group.items.map((item) => item.domRef)));
    const result = Array.from(groups.values()).map((group) => getExistingWebNormalGroupRepresentative(group)).sort((a, b) => {
      const pa = priorityNames.indexOf(a.name);
      const pb = priorityNames.indexOf(b.name);
      return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
    });
    const otherCount = layers.filter((layer) => !groupedRefs.has(layer.domRef)).length;
    if (otherCount) {
      result.push({ kind: "other-summary", count: otherCount });
    }
    return result;
  }

  function getExistingWebNormalGroupRepresentative(group) {
    const items = group.items || [];
    const hasReviewedProtected = items.some((item) => getExistingWebAiReview(item.domRef)?.finalCheck?.status?.key === "protected");
    const preferredStatus = items.some((item) => item.status.key === "editable")
      ? "editable"
      : hasReviewedProtected
        ? "protected"
        : items.some((item) => item.status.key === "ai-needed")
          ? "ai-needed"
          : items.some((item) => item.status.key === "protected")
            ? "protected"
            : items[0]?.status?.key || "warning";
    const candidates = items.filter((item) => item.status.key === preferredStatus);
    const representative = (candidates.length ? candidates : items).slice().sort((a, b) => getExistingWebLayerGroupRank(b) - getExistingWebLayerGroupRank(a))[0] || items[0];
    return {
      ...representative,
      name: group.name,
      relatedCount: items.length,
      status: preferredStatus === representative?.status?.key
        ? representative.status
        : { key: preferredStatus, label: getExistingWebNormalStatusLabel(preferredStatus) },
    };
  }

  function summarizeExistingWebDisplayLayers(layers) {
    return (layers || []).reduce((summary, layer) => {
      if (layer.kind === "other-summary") {
        return summary;
      }
      summary.total += 1;
      const key = layer.status?.key || "problem";
      if (key === "editable") summary.editable += 1;
      else if (key === "protected") summary.protected += 1;
      else if (key === "problem") summary.problem += 1;
      else summary.ai += 1;
      return summary;
    }, { editable: 0, ai: 0, protected: 0, problem: 0, total: 0 });
  }

  function getExistingWebNormalStatusLabel(key) {
    if (key === "editable") return "編集OK";
    if (key === "protected") return "保護";
    if (key === "problem") return "問題あり";
    if (key === "ai-needed") return "AI確認";
    return "要確認";
  }

  function getExistingWebLayerGroupRank(layer) {
    let rank = 0;
    if (layer.status.key === "editable") rank += 40;
    if (layer.status.key === "ai-needed") rank += 30;
    if (layer.status.key === "protected") rank += 20;
    if (getExistingWebAiReview(layer.domRef)?.finalCheck) rank += 60;
    if (Number(layer.bounds?.width || 0) > 0 && Number(layer.bounds?.height || 0) > 0) rank += 100;
    if (layer.domRef?.startsWith("#")) rank += 5;
    return rank + (Number(layer.score) || 0) / 1000;
  }

  function buildExistingWebSelectionSummary(detailMode = "normal") {
    if (!state.existingWeb.active) {
      return "";
    }
    const selected = state.existingWeb.selected;
    if (!selected) {
      return `<p class="tb-existing-web-empty">DOM要素を選択してください。編集モード中はクリックしてもページ本来の動作は発火しません。</p>`;
    }
    const title = getExistingWebSelectionTitle(selected);
    const selectedCheck = isExistingWebNormalFreePreviewMode()
      ? runExistingWebLayerCheck(selected.analyzerElement, selected.node, selected.mapping, selected.protectedBehavior, { level: "light" })
      : selected.check || getExistingWebCheck(selected.domRef) || runExistingWebLayerCheck(selected.analyzerElement, selected.node, selected.mapping, selected.protectedBehavior, { level: "light" });
    const editable = selected.editableProperties || [];
    const protectedItems = [
      ...(selected.mapping?.protectedProperties || []),
      ...(selected.mapping?.behaviorRef ? [selected.mapping.behaviorRef] : []),
      ...(selected.protectedBehavior ? ["adapter-protected-behavior"] : []),
    ];
    const blockedReasons = selected.blockedReasons || [];
    const preview = state.existingWeb.preview?.changes?.[0] || null;
    if (detailMode === "compact") {
      return `<span><b>選択中:</b> ${escapeHtml(title)}</span>
        <span>${escapeHtml(selectedCheck.status.label)}${editable.length ? ` / ${editable.map(getExistingWebPropertyLabel).map(escapeHtml).join(", ")}` : ""}</span>`;
    }
    if (detailMode !== "custom") {
      return buildExistingWebNormalSelectionSummary(selected, selectedCheck, preview);
    }
    const actionHtml = selected && !blockedReasons.length ? `
      <div class="tb-existing-web-action-grid">
        <button type="button" data-existing-web-action="nudge-left">左へ</button>
        <button type="button" data-existing-web-action="nudge-right">右へ</button>
        <button type="button" data-existing-web-action="nudge-up">上へ</button>
        <button type="button" data-existing-web-action="nudge-down">下へ</button>
        <button type="button" data-existing-web-action="size-smaller">縮小</button>
        <button type="button" data-existing-web-action="size-larger">拡大</button>
        <button type="button" data-existing-web-action="reset-preview">Preview解除</button>
        <button type="button" data-existing-web-action="safe-change"${preview ? "" : " disabled"}>Safe Changeへ</button>
      </div>` : "";
    const customHtml = detailMode === "custom" ? `
      <pre class="tb-existing-web-custom">${escapeHtml(JSON.stringify({
        domRef: selected.domRef,
        tag: selected.tag,
        id: selected.id,
        className: selected.className,
        bounds: selected.bounds,
        computed: selected.computed,
        pageId: selected.pageId,
        sourcePath: selected.sourcePath,
        viewState: selected.viewState,
        mapping: selected.mapping ? {
          tbId: selected.mapping.tbId,
          role: selected.mapping.role,
          editableProperties: selected.mapping.editableProperties,
          protectedProperties: selected.mapping.protectedProperties,
          behaviorRef: selected.mapping.behaviorRef,
        } : null,
        analyzerStatus: selected.analyzerStatus,
        analyzerInferred: selected.analyzerElement?.inferred || null,
        check: selected.check || null,
        aiReview: getExistingWebAiReview(selected.domRef) || null,
        preview,
      }, null, 2))}</pre>` : "";
    return `
      <article class="tb-existing-web-selection-card">
        <h3>選択中: ${escapeHtml(title)}</h3>
        <p>${escapeHtml(selected.domRef)} / ${escapeHtml(selected.pageId)} / ${escapeHtml(selected.sourcePath)}${selected.viewState ? `?${escapeHtml(selected.viewState)}` : ""}</p>
        <div class="tb-existing-web-badges">
          <span data-status="${escapeAttr(selected.analyzerStatus)}">${escapeHtml(selected.analyzerStatus)}</span>
          <span>${selected.mapping ? "Confirmed Mappingあり" : "Mappingなし"}</span>
        </div>
        <dl>
          <dt>編集できる項目</dt>
          <dd>${editable.length ? editable.map((item) => `<span>OK ${escapeHtml(item)}</span>`).join("") : "安全な編集範囲を確認できません"}</dd>
          <dt>保護 / Block</dt>
          <dd>${protectedItems.length || blockedReasons.length
            ? [...protectedItems, ...blockedReasons].map((item) => `<span>LOCK ${escapeHtml(item)}</span>`).join("")
            : "保護対象なし"}</dd>
          <dt>Preview</dt>
          <dd>${preview ? `${escapeHtml(preview.property)}: ${escapeHtml(JSON.stringify(preview.before))} -> ${escapeHtml(JSON.stringify(preview.after))}` : "未変更"}</dd>
        </dl>
        ${actionHtml}
        ${customHtml}
      </article>
    `;
  }

  function getExistingWebSelectionTitle(selected) {
    const layer = (state.existingWeb.virtualLayers || []).find((item) => item.domRef === selected.domRef);
    return layer?.name || selected.mapping?.tbId || selected.id || selected.className || selected.tag || selected.domRef;
  }

  function buildExistingWebNormalSelectionSummary(selected, check, preview) {
    const propertyChecks = check.checks || [];
    const canEdit = check.status.key === "editable";
    const needsConfirm = check.status.key === "warning" && check.level !== "confirm";
    const needsAi = check.status.key === "ai-needed";
    const aiReview = getExistingWebAiReview(selected.domRef);
    const pageChecked = state.existingWeb.pageCheck?.status === "checked";
    const impact = state.existingWeb.impactAnalysis?.target?.domRef === selected.domRef
      ? state.existingWeb.impactAnalysis
      : null;
    const actionHtml = canEdit ? `
      <div class="tb-existing-web-action-grid tb-existing-web-action-grid--normal">
        <button type="button" data-existing-web-action="nudge-left">左へ</button>
        <button type="button" data-existing-web-action="nudge-right">右へ</button>
        <button type="button" data-existing-web-action="nudge-up">上へ</button>
        <button type="button" data-existing-web-action="nudge-down">下へ</button>
        <button type="button" data-existing-web-action="size-smaller"${canExistingWebPreviewProperty(selected, "size") ? "" : " disabled"}>縮小</button>
        <button type="button" data-existing-web-action="size-larger"${canExistingWebPreviewProperty(selected, "size") ? "" : " disabled"}>拡大</button>
        <button type="button" data-existing-web-action="reset-preview">元に戻す</button>
        <button type="button" data-existing-web-action="safe-change"${preview ? "" : " disabled"}>変更を確認</button>
      </div>` : needsConfirm && !pageChecked ? `
      <div class="tb-existing-web-action-grid tb-existing-web-action-grid--normal">
        <button type="button" data-existing-web-action="page-check">ページを確認</button>
      </div>` : needsAi ? `
      <div class="tb-existing-web-action-grid tb-existing-web-action-grid--normal">
        <button type="button" data-existing-web-action="ai-check" data-existing-web-dom-ref="${escapeAttr(selected.domRef)}">AIに相談</button>
      </div>` : "";
    const aiResultHtml = aiReview?.result ? `
      <section class="tb-existing-web-ai-result" data-ai-result="${escapeAttr(aiReview.result.type || "AI_RESULT_UNKNOWN")}">
        <strong>AI確認結果</strong>
        <p>${escapeHtml(aiReview.result.normalMessage || "AIで確認できませんでした。現在は編集できません。")}</p>
      </section>` : "";
    return `
      <article class="tb-existing-web-selection-card" data-status="${escapeAttr(check.status.key)}">
        <h3>${escapeHtml(getExistingWebSelectionTitle(selected))}</h3>
        <p>${escapeHtml(getExistingWebNormalElementType(selected))}</p>
        <div class="tb-existing-web-normal-status" data-status="${escapeAttr(check.status.key)}">${escapeHtml(check.status.label)}</div>
        <p>${escapeHtml(check.message || getExistingWebNormalStatusMessage(check.status.key))}</p>
        <dl class="tb-existing-web-normal-checks">
          ${propertyChecks.map((item) => `
            <div data-check-state="${escapeAttr(item.state)}">
              <dt>${escapeHtml(item.label)}</dt>
              <dd>${escapeHtml(getExistingWebCheckStateLabel(item))}</dd>
            </div>
          `).join("")}
        </dl>
        ${preview ? `<p class="tb-existing-web-preview-note">変更内容: ${escapeHtml(formatExistingWebPreviewForNormal(preview))}</p>` : ""}
        ${impact ? buildExistingWebImpactHtml(impact) : ""}
        ${aiResultHtml}
        ${actionHtml}
      </article>
    `;
  }

  function buildExistingWebImpactHtml(impact) {
    const checks = impact?.checks || [];
    return `
      <section class="tb-existing-web-impact">
        <header>
          <strong>変更後の影響確認</strong>
          <span>${escapeHtml(impact.intent || "")}</span>
        </header>
        <dl class="tb-existing-web-normal-checks">
          ${checks.map((item) => `
            <div data-check-state="${escapeAttr(item.state)}">
              <dt>${escapeHtml(item.label)}</dt>
              <dd>${escapeHtml(item.text || getExistingWebCheckStateLabel(item))}</dd>
            </div>
          `).join("")}
        </dl>
      </section>
    `;
  }

  function getExistingWebNormalElementType(selected) {
    if (selected.tag === "img") return "画像";
    if (selected.tag === "button") return "ボタン";
    if (selected.tag === "a") return "リンク";
    if (selected.tag === "audio" || selected.tag === "video") return "音声/映像";
    if (/^h[1-6]$/.test(selected.tag)) return "見出し";
    if (selected.analyzerElement?.observed?.backgroundImage) return "背景";
    return "ページ要素";
  }

  function getExistingWebNormalStatusMessage(statusKey) {
    if (statusKey === "editable") return "見た目はRuntime Previewで変更できます。動作は変更せず維持します。";
    if (statusKey === "protected") return "この要素はページの動作と連動しています。現在は選択のみ可能です。";
    if (statusKey === "ai-needed") return "TBalance確認済み。追加確認が必要です。";
    if (statusKey === "problem") return "この要素は表示状態か参照先に問題がある可能性があります。";
    return "この要素はまだ編集範囲を確認していません。";
  }

  function getExistingWebPropertyLabel(property) {
    const labels = {
      position: "位置",
      size: "サイズ",
      width: "幅",
      height: "高さ",
      visibility: "表示",
    };
    return labels[property] || property;
  }

  function getExistingWebCheckStateLabel(item) {
    if (item.state === "ok") return "OK";
    if (item.state === "protected") return "保護";
    if (item.state === "problem") return "問題あり";
    return "要確認";
  }

  function formatExistingWebPreviewForNormal(preview) {
    if (!preview) {
      return "";
    }
    if (preview.property === "position") {
      const dx = Math.round(((preview.after?.x || 0) - (preview.before?.x || 0)) * 100) / 100;
      const dy = Math.round(((preview.after?.y || 0) - (preview.before?.y || 0)) * 100) / 100;
      return `位置を X ${dx >= 0 ? "+" : ""}${dx}px / Y ${dy >= 0 ? "+" : ""}${dy}px 移動`;
    }
    if (preview.property === "size") {
      const dw = Math.round(((preview.after?.width || 0) - (preview.before?.width || 0)) * 100) / 100;
      const dh = Math.round(((preview.after?.height || 0) - (preview.before?.height || 0)) * 100) / 100;
      return `サイズを 幅 ${dw >= 0 ? "+" : ""}${dw}px / 高さ ${dh >= 0 ? "+" : ""}${dh}px 変更`;
    }
    return `${preview.property}を変更`;
  }

  function formatExistingWebPreviewIntent(selected, preview) {
    const title = getExistingWebSelectionTitle(selected);
    if (preview?.property === "position") {
      const dx = Math.round(((preview.after?.x || 0) - (preview.before?.x || 0)) * 100) / 100;
      const dy = Math.round(((preview.after?.y || 0) - (preview.before?.y || 0)) * 100) / 100;
      return `${title}を X ${dx >= 0 ? "+" : ""}${dx}px / Y ${dy >= 0 ? "+" : ""}${dy}px 移動したい`;
    }
    if (preview?.property === "size") {
      const dw = Math.round(((preview.after?.width || 0) - (preview.before?.width || 0)) * 100) / 100;
      const dh = Math.round(((preview.after?.height || 0) - (preview.before?.height || 0)) * 100) / 100;
      return `${title}のサイズを 幅 ${dw >= 0 ? "+" : ""}${dw}px / 高さ ${dh >= 0 ? "+" : ""}${dh}px 変更したい`;
    }
    return `${title}の見た目を調整したい`;
  }

  function buildExistingWebImpactAnalysis(selected, preview) {
    const afterBounds = selected?.node?.isConnected ? getDomNodeBounds(selected.node) || selected.bounds : selected?.bounds || {};
    const beforeBounds = getExistingWebPreviewBeforeBounds(preview, afterBounds);
    const overlaps = getExistingWebImpactOverlaps(selected, afterBounds);
    const offscreen = getExistingWebOffscreenImpact(selected, afterBounds);
    const behavior = getExistingWebBehaviorImpact(selected);
    const source = selected?.mapping
      ? { state: "ready", text: "Confirmed Mappingがあります。Safe Changeへ差分を渡せます。" }
      : { state: "unknown", text: "Confirmed Mappingなし。Source反映候補化にはMapping確認が必要です。" };
    const checks = [
      { label: "表示", state: offscreen ? "warning" : "ok", text: offscreen || "画面内に表示されています" },
      { label: "重なり", state: overlaps.length ? "warning" : "ok", text: overlaps.length ? `${overlaps.slice(0, 3).map((item) => item.name).join(" / ")} と重なっています` : "主要要素との新しい重なりは見つかりません" },
      { label: "動作", state: behavior.state, text: behavior.text },
      { label: "Source反映", state: source.state, text: source.text },
    ];
    return {
      target: {
        name: getExistingWebSelectionTitle(selected),
        domRef: selected?.domRef || preview?.domRef || "",
        pageId: state.existingWeb.pageId,
        sourcePath: state.existingWeb.sourcePath,
        viewState: state.existingWeb.viewState || "",
      },
      intent: formatExistingWebPreviewIntent(selected, preview),
      change: preview ? { ...preview, beforeInline: undefined, afterInline: undefined } : null,
      beforeBounds,
      afterBounds,
      overlaps,
      behavior,
      source,
      checks,
      checkedAt: new Date().toISOString(),
    };
  }

  function getExistingWebPreviewBeforeBounds(preview, afterBounds) {
    if (preview?.property === "position") {
      return {
        ...afterBounds,
        x: Number(preview.before?.x || 0),
        y: Number(preview.before?.y || 0),
      };
    }
    if (preview?.property === "size") {
      return {
        ...afterBounds,
        width: Number(preview.before?.width || 0),
        height: Number(preview.before?.height || 0),
      };
    }
    return afterBounds;
  }

  function getExistingWebImpactOverlaps(selected, bounds) {
    if (!selected || !bounds) {
      return [];
    }
    const layers = refreshExistingWebVirtualLayers();
    return (layers || [])
      .filter((layer) => layer.domRef && layer.domRef !== selected.domRef && layer.bounds)
      .map((layer) => ({
        name: layer.name || layer.domRef,
        domRef: layer.domRef,
        overlap: getRectOverlapArea(bounds, layer.bounds),
      }))
      .filter((item) => item.overlap >= 24)
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 6);
  }

  function getRectOverlapArea(a, b) {
    const left = Math.max(Number(a.x || 0), Number(b.x || 0));
    const top = Math.max(Number(a.y || 0), Number(b.y || 0));
    const right = Math.min(Number(a.x || 0) + Number(a.width || 0), Number(b.x || 0) + Number(b.width || 0));
    const bottom = Math.min(Number(a.y || 0) + Number(a.height || 0), Number(b.y || 0) + Number(b.height || 0));
    return Math.max(0, right - left) * Math.max(0, bottom - top);
  }

  function getExistingWebOffscreenImpact(selected, bounds) {
    const doc = selected?.node?.ownerDocument;
    const view = doc?.defaultView;
    const width = Number(view?.innerWidth || doc?.documentElement?.clientWidth || 0);
    const height = Number(view?.innerHeight || doc?.documentElement?.clientHeight || 0);
    if (!width || !height || !bounds) {
      return "";
    }
    const outside = Number(bounds.x || 0) + Number(bounds.width || 0) < 0
      || Number(bounds.y || 0) + Number(bounds.height || 0) < 0
      || Number(bounds.x || 0) > width
      || Number(bounds.y || 0) > height;
    return outside ? "要素が画面外に出ています" : "";
  }

  function getExistingWebBehaviorImpact(selected) {
    if (!selected) {
      return { state: "unknown", text: "選択要素を確認できません" };
    }
    if (selected.protectedBehavior || selected.mapping?.behaviorRef || isExistingWebBehaviorProtected(selected.analyzerElement, selected.node)) {
      return { state: "warning", text: "クリック/フォーム等の動作は維持対象です。編集モードでは発火させていません。" };
    }
    return { state: "ok", text: "主要なクリック/フォーム動作は検出されていません" };
  }

  function handleLayerListClick(event) {
    const existingWebAction = event.target.closest("[data-existing-web-action]");
    if (existingWebAction && state.existingWeb.active) {
      handleExistingWebLayerAction(existingWebAction.dataset.existingWebAction || "", existingWebAction);
      return;
    }
    const existingWebLayer = event.target.closest("[data-existing-web-virtual-layer]");
    if (existingWebLayer && state.existingWeb.active) {
      selectExistingWebVirtualLayer(existingWebLayer.dataset.existingWebVirtualLayer || "");
      return;
    }
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
    const nameNode = event.target.closest("[data-layer-rename]");
    if (nameNode && getSelectedIds().includes(layerId)) {
      const layer = findLayer(layerId);
      if (layer) {
        event.preventDefault();
        event.stopPropagation();
        setSingleSelection(layerId);
        beginInlineLayerRename(nameNode, layer);
      }
      return;
    }
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      toggleLayerSelection(layerId);
    } else {
      setSingleSelection(layerId);
    }
    renderAll();
  }

  function handleLayerListDoubleClick(event) {
    const nameNode = event.target.closest("[data-layer-rename]");
    if (!nameNode) {
      return;
    }
    if (!nameNode.isConnected) {
      return;
    }
    const layer = findLayer(nameNode.dataset.layerRename);
    if (!layer) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setSingleSelection(layer.id);
    beginInlineLayerRename(nameNode, layer);
  }

  function beginInlineLayerRename(nameNode, layer) {
    const original = layer.name || "";
    const input = document.createElement("input");
    input.className = "tb-layer-name-input";
    input.type = "text";
    input.value = original || layer.id;
    input.setAttribute("aria-label", "レイヤー名");
    nameNode.replaceChildren(input);
    input.focus();
    input.select();
    let finished = false;
    const finish = (commit) => {
      if (finished) {
        return;
      }
      finished = true;
      const next = input.value.trim();
      if (commit && next && next !== original) {
        pushHistory();
        layer.name = next;
        markDirty();
      }
      renderAll();
    };
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        finish(true);
      } else if (event.key === "Escape") {
        event.preventDefault();
        finish(false);
      }
    });
    input.addEventListener("blur", () => finish(true));
  }

  function handleLayerContextMenu(event, layerId) {
    const layer = findLayer(layerId);
    if (!layer) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (!getSelectedIds().includes(layer.id)) {
      setSingleSelection(layer.id);
    }
    showLayerContextMenu(event.clientX, event.clientY, layer);
  }

  function showLayerContextMenu(x, y, layer) {
    closeLayerContextMenu();
    const menu = document.createElement("div");
    menu.className = "tb-layer-context-menu";
    menu.setAttribute("role", "menu");
    const currentLabel = state.viewport === "mobile" ? "Mobile表示中" : "PC表示中";
    const backgroundButtons = layer.role === "background" && layer.type === "image"
      ? `
        <span class="tb-layer-context-separator" aria-hidden="true"></span>
        <button type="button" data-background-replace="desktop">PC用背景に差し替え</button>
        <button type="button" data-background-replace="mobile">Mobile用背景に差し替え</button>
        <button type="button" data-background-replace="all">PC/Mobile共通背景に差し替え</button>
      `
      : "";
    const canGroup = getSelectedIds().length > 1;
    const hasGroupActions = canGroup || Boolean(layer.groupId);
    const groupButtons = hasGroupActions
      ? `
        <span class="tb-layer-context-separator" aria-hidden="true"></span>
        ${canGroup ? '<button type="button" data-layer-context-action="group">グループ化</button>' : ""}
        ${layer.groupId ? '<button type="button" data-layer-context-action="ungroup">グループ解除</button>' : ""}
      `
      : "";
    menu.innerHTML = `
      <p>${escapeHtml(layer.name || "レイヤー")}<small>${currentLabel} / ${escapeHtml(getLayerVisibilityLabel(layer))}</small></p>
      <button type="button" data-visibility-mode="both">両方で表示</button>
      <button type="button" data-visibility-mode="desktop">PCだけ表示</button>
      <button type="button" data-visibility-mode="mobile">Mobileだけ表示</button>
      <button type="button" data-visibility-mode="hidden">非表示</button>
      ${groupButtons}
      ${backgroundButtons}
    `;
    document.body.appendChild(menu);
    const rect = menu.getBoundingClientRect();
    menu.style.left = `${Math.round(renderer.clamp(x, 8, window.innerWidth - rect.width - 8))}px`;
    menu.style.top = `${Math.round(renderer.clamp(y, 8, window.innerHeight - rect.height - 8))}px`;
    menu.querySelectorAll("[data-background-replace]").forEach((button) => {
      button.addEventListener("click", () => {
        closeLayerContextMenu();
        replaceSelectedImageSource(button.dataset.backgroundReplace);
      });
    });
    menu.querySelectorAll("[data-visibility-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        closeLayerContextMenu();
        setSelectedVisibilityMode(button.dataset.visibilityMode);
      });
    });
    menu.querySelectorAll("[data-layer-context-action]").forEach((button) => {
      button.addEventListener("click", () => {
        closeLayerContextMenu();
        if (button.dataset.layerContextAction === "group") {
          groupSelectedLayers();
        } else if (button.dataset.layerContextAction === "ungroup") {
          ungroupSelectedLayers();
        }
      });
    });
    setTimeout(() => {
      document.addEventListener("pointerdown", handleLayerContextOutside, { once: true });
    }, 0);
  }

  function closeLayerContextMenu() {
    document.querySelector(".tb-layer-context-menu")?.remove();
  }

  function handleLayerContextOutside(event) {
    if (!event.target.closest(".tb-layer-context-menu")) {
      closeLayerContextMenu();
    }
  }

  function setSelectedVisibilityMode(mode) {
    const nextMode = ["both", "desktop", "mobile", "hidden"].includes(mode) ? mode : "both";
    updateSelectedLayers((layer) => {
      layer.visibilityMode = nextMode;
      layer.visible = nextMode !== "hidden";
    });
    showModeToast(`${getLayerVisibilityLabel({ visibilityMode: nextMode, visible: nextMode !== "hidden" })}にしました。`);
  }

  function getLayerVisibilityLabel(layer) {
    if (layer.visible === false || layer.visibilityMode === "hidden") {
      return "非表示";
    }
    if (layer.visibilityMode === "desktop") {
      return "PCのみ表示";
    }
    if (layer.visibilityMode === "mobile") {
      return "Mobileのみ表示";
    }
    return "両方表示";
  }

  function getLayerSubLabel(layer) {
    const typeLabel = layer.role === "background" ? "background fixed" : layer.role === "markup" ? "markup / 指示" : layer.type || "layer";
    const visibilityLabel = getLayerVisibilityLabel(layer);
    return visibilityLabel === "両方表示" ? typeLabel : `${typeLabel} / ${visibilityLabel}`;
  }

  function updateButtons() {
    document.querySelectorAll(".tb-custom-only").forEach((node) => {
      node.hidden = state.editorMode !== "custom";
    });
    updateResponsiveReplaceLabels();
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
    const existingWebUndo = state.existingWeb.active && Boolean(state.existingWeb.previewHistory?.length);
    const existingWebRedo = state.existingWeb.active && Boolean(state.existingWeb.previewFuture?.length);
    els.undoButton.disabled = !existingWebUndo && !state.history.length;
    els.redoButton.disabled = !existingWebRedo && !state.future.length;
    const hasSelection = Boolean(getSelectedLayer());
    [
      els.bringFront,
      els.moveForward,
      els.moveBackward,
      els.sendBack,
      els.renameLayer,
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

  function updateResponsiveReplaceLabels() {
    const desktopReplace = document.querySelector('[data-image-action="replace-desktop"]');
    const mobileReplace = document.querySelector('[data-image-action="replace-mobile"]');
    const commonReplace = document.querySelector('[data-image-action="replace-all"]');
    if (!desktopReplace || !mobileReplace || !commonReplace) {
      return;
    }
    if (state.viewport === "mobile") {
      desktopReplace.textContent = "PC画面へ差し替え";
      mobileReplace.textContent = "Mobile画像を差し替え";
    } else {
      desktopReplace.textContent = "PC画像を差し替え";
      mobileReplace.textContent = "Mobile画面へ差し替え";
    }
    commonReplace.textContent = "PC/Mobile共通で差し替え";
  }

  function updateStatus() {
    if (state.existingWeb.active) {
      const selected = state.existingWeb.selected;
      els.statusText.textContent = selected
        ? `DOM: ${selected.mapping?.tbId || selected.domRef}`
        : "既存Web: DOM要素を選択してください";
      els.rotationStatus.textContent = state.existingWeb.mode === "test"
        ? "TEST: 元ページの動作を確認"
        : "編集: click/button/linkを抑止";
      updateCanvasSizeLabel();
      els.saveState.textContent = state.autosaveError || (state.dirty ? "未保存の変更があります" : state.autosaveStorage || "保存済み");
      updateSizeStatus();
      return;
    }
    const selectedCount = getSelectedIds().length;
    const layer = getSelectedLayer();
    if (selectedCount > 1) {
      els.statusText.textContent = `選択中: ${selectedCount} レイヤー`;
      els.rotationStatus.textContent = "複数選択";
    } else if (!layer) {
      els.statusText.textContent = "ID: - / 名前: -";
      els.rotationStatus.textContent = "リンク: -";
    } else {
      els.statusText.textContent = `ID: ${layer.id || "-"} / 名前: ${layer.name || "-"}`;
      if (layer.type === "image") {
        const src = getLayerImageSource(layer, state.viewport);
        const warning = hasImageWarning(layer);
        const imageInfo = getRenderedImageInfo(layer.id);
        els.rotationStatus.textContent = warning
          ? "画像を表示できません。差し替えてください。"
          : `画像OK: ${src ? "読み込み元あり" : "読み込み元なし"}${imageInfo ? ` / ${imageInfo}` : ""}${getLayerImageScopeInfo(layer)}`;
      } else {
        els.rotationStatus.textContent = `リンク: ${layer.link || "-"}`;
      }
    }
    updateCanvasSizeLabel();
    els.saveState.textContent = state.autosaveError || (state.dirty ? "未保存の変更があります" : state.autosaveStorage || "保存済み");
    updateSizeStatus();
  }

  function updateCanvasSizeLabel() {
    if (!els.canvasSizeLabel) {
      return;
    }
    if (state.existingWeb.active) {
      els.canvasSizeLabel.textContent = `Existing Web: ${state.existingWeb.sourcePath}${state.existingWeb.viewState ? `?${state.existingWeb.viewState}` : ""}`;
      return;
    }
    const page = getCurrentPage();
    if (!page) {
      els.canvasSizeLabel.textContent = "Canvas: -";
      return;
    }
    if (state.windowMode === "pc-mobile") {
      const desktop = getPageViewportSize(page, "desktop");
      const mobile = getPageViewportSize(page, "mobile");
      els.canvasSizeLabel.textContent = `Canvas: PC ${Math.round(desktop.width)} × ${Math.round(desktop.height)} / Mobile ${Math.round(mobile.width)} × ${Math.round(mobile.height)}`;
      return;
    }
    const current = getPageViewportSize(page, state.viewport);
    const label = state.viewport === "mobile" ? "Mobile" : "PC";
    els.canvasSizeLabel.textContent = `Canvas: ${label} ${Math.round(current.width)} × ${Math.round(current.height)}`;
  }

  function updateSizeStatus() {
    if (!els.sizeStatus || !state.project) {
      return;
    }
    const editBytes = estimateEditDataBytes(state.project);
    const publishBytes = estimatePublishBytes(state.project);
    els.sizeStatus.textContent = `編集データ: ${formatBytes(editBytes)} / 推奨50MB　公開予測: ${formatBytes(publishBytes)} / 推奨10MB`;
    els.sizeStatus.dataset.editLevel = getSizeLevel(editBytes, 25, 50);
    els.sizeStatus.dataset.publishLevel = getSizeLevel(publishBytes, 5, 10);
  }

  function estimateEditDataBytes(project) {
    try {
      return new Blob([JSON.stringify(project)]).size;
    } catch (error) {
      return JSON.stringify(project || {}).length * 2;
    }
  }

  function estimatePublishBytes(project) {
    const sources = new Set();
    (project.pages || []).forEach((page) => {
      (page.layers || []).forEach((layer) => {
        if (layer.visible === false || layer.visibilityMode === "hidden" || layer.type !== "image") {
          return;
        }
        [layer.src, layer.desktopSrc, layer.mobileSrc].forEach((src) => {
          if (src) {
            sources.add(src);
          }
        });
      });
    });
    let bytes = 0;
    sources.forEach((src) => {
      bytes += estimateDataUrlBytes(src);
    });
    return Math.round(bytes * 0.55);
  }

  function estimateDataUrlBytes(src) {
    const value = String(src || "");
    if (!value.startsWith("data:")) {
      return value.length;
    }
    const comma = value.indexOf(",");
    const payload = comma >= 0 ? value.slice(comma + 1) : value;
    return Math.floor(payload.length * 0.75);
  }

  function formatBytes(bytes) {
    const value = Math.max(0, Number(bytes) || 0);
    if (value >= 1024 * 1024) {
      return `${(value / (1024 * 1024)).toFixed(1)}MB`;
    }
    return `${Math.max(1, Math.round(value / 1024))}KB`;
  }

  function getSizeLevel(bytes, warnMb, dangerMb) {
    const mb = bytes / (1024 * 1024);
    if (mb >= dangerMb) {
      return "danger";
    }
    if (mb >= warnMb) {
      return "warn";
    }
    return "safe";
  }

  function handleImageStatus(layerId, status, viewportKey) {
    if (!layerId) {
      return;
    }
    const key = getImageWarningKey(layerId, viewportKey);
    const hasWarning = status === "error";
    const current = Boolean(state.imageWarnings[key]);
    if (!hasWarning && current) {
      return;
    }
    if (current === hasWarning) {
      return;
    }
    if (hasWarning) {
      state.imageWarnings[key] = true;
    } else {
      delete state.imageWarnings[key];
    }
    renderCanvas(getCurrentPage());
    renderLayerList();
    updateStatus();
    updateCanvasScale();
  }

  function bindLayerThumbnailWarning(row, layer) {
    if (!layer || layer.type !== "image") {
      return;
    }
    const thumb = row.querySelector(".tb-layer-thumb img");
    if (!thumb) {
      return;
    }
    thumb.addEventListener("error", () => {
      handleImageStatus(layer.id, "error", state.viewport);
    }, { once: true });
  }

  function getImageWarningKey(layerId, viewportKey) {
    return `${renderer.getViewportKey(viewportKey || state.viewport)}:${layerId}`;
  }

  function clearImageWarnings(layerId, scope) {
    if (!layerId) {
      return;
    }
    if (scope === "desktop") {
      delete state.imageWarnings[getImageWarningKey(layerId, "desktop")];
    } else if (scope === "mobile") {
      delete state.imageWarnings[getImageWarningKey(layerId, "mobile")];
    } else {
      delete state.imageWarnings[getImageWarningKey(layerId, "desktop")];
      delete state.imageWarnings[getImageWarningKey(layerId, "mobile")];
    }
  }

  function getRenderedImageInfo(layerId) {
    const selector = `.tb-layer[data-layer-id="${cssEscape(layerId)}"] img`;
    const img = document.querySelector(selector);
    if (!img) {
      return "";
    }
    const layerNode = img.closest(".tb-layer");
    const style = layerNode ? window.getComputedStyle(layerNode) : null;
    const visibilityInfo = style
      ? ` / op:${style.opacity} disp:${style.display} clip:${style.clipPath === "none" ? "none" : "on"}`
      : "";
    if (!img.complete) {
      return "読み込み中";
    }
    return `${img.naturalWidth || 0}x${img.naturalHeight || 0}${visibilityInfo}`;
  }

  function getLayerImageScopeInfo(layer) {
    if (!layer || layer.type !== "image") {
      return "";
    }
    const flags = [];
    if (layer.desktopSrc) {
      flags.push("PC画像");
    }
    if (layer.mobileSrc) {
      flags.push("Mobile画像");
    }
    if (!flags.length && layer.src) {
      flags.push("共通画像");
    }
    return flags.length ? ` / ${flags.join("+")}` : "";
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") {
      return window.CSS.escape(String(value || ""));
    }
    return String(value || "").replace(/["\\]/g, "\\$&");
  }

  function updateCanvasScale() {
    const mainViewport = state.windowMode === "pc-mobile" ? "desktop" : state.viewport;
    const primaryPage = getPrimaryPage();
    const size = getPageViewportSize(primaryPage, mainViewport);
    const secondaryViewport = state.windowMode === "pc-mobile" ? "mobile" : "desktop";
    const secondaryPage = state.windowMode === "image" && state.secondaryWindow?.pageId
      ? getPageById(state.secondaryWindow.pageId)
      : primaryPage;
    const secondarySize = getPageViewportSize(secondaryPage, secondaryViewport);
    const rect = els.canvasViewport.getBoundingClientRect();
    const hasSecondary = state.windowMode === "pc-mobile" || state.windowMode === "image";
    const availableWidth = Math.max(1, rect.width - (hasSecondary ? 120 : 76));
    const availableHeight = Math.max(1, rect.height - 76);
    const verticalSplit = hasSecondary && state.windowLayout === "vertical";
    const paneWidth = hasSecondary && !verticalSplit ? availableWidth / 2 : availableWidth;
    const paneHeight = verticalSplit ? availableHeight / 2 : availableHeight;
    const primaryFit = Math.max(0.05, Math.min(paneWidth / size.width, paneHeight / size.height));
    const secondaryFit = Math.max(0.05, Math.min(paneWidth / secondarySize.width, paneHeight / secondarySize.height));
    const primaryScale = resolveWindowScale("primary", primaryFit);
    const secondaryScale = resolveWindowScale("secondary", secondaryFit);
    const activeKey = getActiveWindowKey();
    const activeScale = activeKey === "secondary" ? secondaryScale : primaryScale;
    const activeZoom = getWindowZoom(activeKey);
    state.fitScale = primaryFit;
    els.canvasScaler.style.width = `${Math.round(size.width * primaryScale)}px`;
    els.canvasScaler.style.height = `${Math.round(size.height * primaryScale)}px`;
    els.canvasScaler.style.transform = `scale(${primaryScale})`;
    els.secondaryCanvasScaler.style.width = `${Math.round(secondarySize.width * secondaryScale)}px`;
    els.secondaryCanvasScaler.style.height = `${Math.round(secondarySize.height * secondaryScale)}px`;
    els.secondaryCanvasScaler.style.transform = `scale(${secondaryScale})`;
    els.zoomPercent.textContent = `${Math.round(activeScale * 100)}%`;
    els.zoomLabel.textContent = activeZoom === "fit" ? "Fit" : `${Math.round(activeScale * 100)}%`;
  }

  function stepZoom(delta) {
    const activeKey = getActiveWindowKey();
    const currentZoom = getWindowZoom(activeKey);
    const current = currentZoom === "fit" ? state.windowFitScale?.[activeKey] || state.fitScale : Number(currentZoom) || 1;
    setWindowZoom(activeKey, renderer.clamp(current + delta, 0.1, 2));
    updateCanvasScale();
  }

  function resolveWindowScale(key, fitScale) {
    const windowKey = key === "secondary" ? "secondary" : "primary";
    state.windowFitScale = state.windowFitScale || {};
    state.windowFitScale[windowKey] = fitScale;
    const zoom = getWindowZoom(windowKey);
    return zoom === "fit" ? fitScale : Number(zoom) || 1;
  }

  function beginLayerPointer(id, event) {
    if (state.preview) {
      return;
    }
    if (state.tool === "note") {
      event.preventDefault();
      event.stopPropagation();
      addMemoAtPoint(getCanvasPoint(event), getCanvasViewportFromEvent(event));
      return;
    }
    if (state.tool === "eyedropper") {
      pickColorFromCanvas(event, id);
      return;
    }
    if (state.tool === "select") {
      beginRectSelection(event);
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const layer = findLayer(id);
    if (!layer) {
      return;
    }
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      toggleLayerSelection(id);
      renderAll();
      return;
    }
    if (!getSelectedIds().includes(id)) {
      setSingleSelection(id);
    } else {
      state.selectedId = id;
    }
    if (layer.locked) {
      renderAll();
      return;
    }
    pushHistory();
    const layout = getCurrentLayout(layer);
    const point = getCanvasPoint(event);
    const handle = event.target.closest("[data-handle]");
    const selectedOrigins = {};
    getSelectedLayers().forEach((selectedLayer) => {
      selectedOrigins[selectedLayer.id] = Object.assign({}, getCurrentLayout(selectedLayer));
    });
    state.pointer = {
      id,
      type: handle ? handle.dataset.handle : "move",
      start: point,
      origin: Object.assign({}, layout),
      selectedOrigins,
      originCorners: renderer.clone(layer.corners || createDefaultCorners()),
      center: {
        x: layout.x + layout.width / 2,
        y: layout.y + layout.height / 2,
      },
    };
    renderAll();
  }

  async function beginPenStroke(event) {
    if (state.preview) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (state.windowMode === "image" || state.windowMode === "pc-mobile") {
      const canvas = event.target.closest(".tb-canvas");
      if (canvas === els.secondaryCanvas) {
        activateSecondaryWindow();
      } else {
        activatePrimaryWindow();
      }
    }
    const page = getCurrentPage();
    const viewport = getCanvasViewportFromEvent(event);
    const point = getCanvasPoint(event);
    const strokeWidth = getEffectiveBrushWidth();
    pushHistory();
    const reusableLayer = state.markupPenMode ? findReusableMarkupPenLayer(page, viewport) : findReusablePenLayer(page, viewport);
    const layer = reusableLayer || createPaintLayer(viewport, state.markupPenMode ? {
      name: "赤ペン指示",
      role: "markup",
      paintMode: "markup-pen",
    } : {});
    if (!reusableLayer) {
      page.layers.push(layer);
      keepMarkupLayersOnTop(page);
    }
    const surface = await preparePaintSurface(layer, viewport);
    setSingleSelection(layer.id);
    state.pointer = {
      id: layer.id,
      type: "pen-draw",
      viewport,
      pageId: page.id,
      last: point,
      surface,
      strokeStyle: createPenStrokeStyle(strokeWidth),
    };
    drawPaintLine(surface, point, point, state.pointer.strokeStyle);
    updatePaintLayerFromSurface(layer, viewport, surface);
    markDirty();
    renderAll();
  }

  function handleCanvasPointerDown(event) {
    if (state.preview) {
      return;
    }
    if (state.tool === "note" && event.target.closest(".tb-canvas") === els.canvas) {
      addMemoAtPoint(getCanvasPoint(event), getCanvasViewportFromEvent(event));
      return;
    }
    if (event.target !== els.canvas) {
      return;
    }
    if (event.target.closest("[data-selection-float-action]")) {
      return;
    }
    if (state.windowMode === "image" || state.windowMode === "pc-mobile") {
      activatePrimaryWindow();
    }
    if (state.tool === "eyedropper") {
      pickColorFromCanvas(event, "");
      return;
    }
    if (state.tool === "pen") {
      beginPenStroke(event);
      return;
    }
    if (state.tool === "clone") {
      beginCloneStroke(event);
      return;
    }
    if (state.tool === "eraser") {
      beginEraserStroke(event);
      return;
    }
    if (state.tool === "fill") {
      applyFillTool(event, "");
      return;
    }
    if (state.tool === "retouch") {
      beginRetouchStroke(event);
      return;
    }
    if (state.tool === "select") {
      beginRectSelection(event);
    } else {
      clearSelection();
      renderAll();
    }
  }

  function handleClonePointerCapture(event) {
    if (state.preview || state.tool !== "clone") {
      return;
    }
    if (!event.target.closest(".tb-canvas")) {
      return;
    }
    if (event.target.closest("[data-selection-float-action]")) {
      return;
    }
    beginCloneStroke(event);
  }

  function getEffectiveBrushWidth() {
    const strength = renderer.clamp(Number(state.brushStrength) || 70, 1, 100) / 100;
    return Math.max(1, Math.round((Number(state.brushSize) || 16) * (0.45 + strength * 0.55)));
  }

  function getEffectiveEraserRadius() {
    return Math.max(0.5, Number(state.eraserSize || 12) / 2);
  }

  function isBrushPreviewTool(tool = state.tool) {
    return tool === "pen" || tool === "clone" || tool === "eraser" || tool === "retouch";
  }

  function getBrushPreviewDiameter() {
    if (state.tool === "eraser") {
      return getEffectiveEraserRadius() * 2;
    }
    if (state.tool === "retouch") {
      return Math.max(1, Number(state.retouchSize) || 32);
    }
    return getEffectiveBrushWidth();
  }

  function ensureBrushPreview() {
    let preview = document.querySelector(".tb-brush-preview");
    if (!preview) {
      preview = document.createElement("div");
      preview.className = "tb-brush-preview";
      preview.setAttribute("aria-hidden", "true");
      document.body.appendChild(preview);
    }
    return preview;
  }

  function hideBrushPreview() {
    const preview = document.querySelector(".tb-brush-preview");
    if (preview) {
      preview.classList.remove("is-visible");
    }
  }

  function updateBrushPreview(event) {
    if (!isBrushPreviewTool()) {
      hideBrushPreview();
      return;
    }
    const canvas = event.target.closest?.(".tb-canvas");
    if (!canvas) {
      hideBrushPreview();
      return;
    }
    const rect = canvas.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
      hideBrushPreview();
      return;
    }
    const viewportKey = getCanvasViewportFromEvent(event);
    const size = renderer.getViewportSize(viewportKey);
    const scale = ((rect.width / size.width) + (rect.height / size.height)) / 2;
    const diameter = Math.max(4, Math.round(getBrushPreviewDiameter() * scale));
    const preview = ensureBrushPreview();
    preview.dataset.tool = state.tool;
    preview.dataset.tip = state.tool === "eraser" ? state.eraserTip : state.tool === "retouch" ? state.retouchTip : state.brushTip;
    preview.style.width = `${diameter}px`;
    preview.style.height = `${diameter}px`;
    preview.style.left = `${event.clientX}px`;
    preview.style.top = `${event.clientY}px`;
    preview.classList.add("is-visible");
  }

  function getPenStrokeColor() {
    const color = getActiveColor();
    return color === "transparent" ? "#fff6db" : color;
  }

  function createPaintLayer(viewport, options = {}) {
    const size = renderer.getViewportSize(viewport);
    const layout = { x: 0, y: 0, width: size.width, height: size.height, rotation: 0 };
    const inactiveLayout = Object.assign({}, layout);
    const layer = {
      id: renderer.makeId("layer"),
      type: "image",
      name: options.name || "ペン描画",
      role: options.role || "pen",
      src: "",
      desktopSrc: "",
      mobileSrc: "",
      visible: true,
      locked: false,
      visibilityMode: viewport === "mobile" ? "mobile" : "desktop",
      desktop: viewport === "desktop" ? layout : inactiveLayout,
      mobile: viewport === "mobile" ? layout : inactiveLayout,
      appearance: {
        opacity: 1,
        brightness: 1,
        shadow: "none",
      },
      constraints: { keepAspect: false, keepSquare: false, keepCircle: false },
      hitArea: { enabled: false, visible: false, x: 0, y: 0, width: layout.width, height: layout.height },
      corners: createDefaultCorners(),
      transformMode: "normal",
      paint: {
        mode: options.paintMode || "pixel",
      },
    };
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    layer[viewport === "mobile" ? "mobileSrc" : "desktopSrc"] = canvas.toDataURL("image/png");
    renderer.normalizeLayer(layer);
    return layer;
  }

  function createClonePaintLayer(viewport) {
    return createPaintLayer(viewport, {
      name: "クローン描画",
      role: "clone",
      paintMode: "clone",
    });
  }

  function getPaintCacheKey(layerId, viewport) {
    return `${layerId}:${viewport === "mobile" ? "mobile" : "desktop"}`;
  }

  function getPaintLayerSrc(layer, viewport) {
    if (viewport === "mobile") {
      return layer.mobileSrc || layer.src || layer.desktopSrc || "";
    }
    return layer.desktopSrc || layer.src || layer.mobileSrc || "";
  }

  async function preparePaintSurface(layer, viewport) {
    const viewportKey = viewport === "mobile" ? "mobile" : "desktop";
    const cacheKey = getPaintCacheKey(layer.id, viewportKey);
    const size = renderer.getViewportSize(viewportKey);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d");
    const src = getPaintLayerSrc(layer, viewportKey);
    const layout = viewportKey === "mobile" ? layer.mobile : layer.desktop;
    if (src) {
      try {
        const image = await loadScreenshotImage(src);
        context.drawImage(
          image,
          Math.round(Number(layout.x) || 0),
          Math.round(Number(layout.y) || 0),
          Math.max(1, Math.round(Number(layout.width) || image.naturalWidth || image.width || 1)),
          Math.max(1, Math.round(Number(layout.height) || image.naturalHeight || image.height || 1)),
        );
      } catch (error) {
        // If an old paint source cannot be loaded, keep a blank paint surface.
      }
    }
    const surface = { canvas, context };
    state.paintSurfaces.set(cacheKey, surface);
    return surface;
  }

  function drawPaintLine(surface, from, to, style) {
    const ctx = surface.context;
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = renderer.clamp(Number(style.opacity ?? 1), 0, 1);
    ctx.strokeStyle = style.color || getPenStrokeColor();
    ctx.lineWidth = Math.max(1, Number(style.width) || 1);
    ctx.lineCap = style.tip === "square" ? "butt" : "round";
    ctx.lineJoin = style.tip === "square" ? "miter" : "round";
    if (Math.hypot(to.x - from.x, to.y - from.y) < 0.5) {
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      if (style.tip === "square") {
        const size = ctx.lineWidth;
        ctx.rect(from.x - size / 2, from.y - size / 2, size, size);
      } else {
        ctx.arc(from.x, from.y, ctx.lineWidth / 2, 0, Math.PI * 2);
      }
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function erasePaintLine(surface, from, to, radius, tip = state.eraserTip) {
    const ctx = surface.context;
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = Math.max(1, Number(radius) * 2 || 1);
    ctx.lineCap = tip === "square" ? "butt" : "round";
    ctx.lineJoin = tip === "square" ? "miter" : "round";
    if (Math.hypot(to.x - from.x, to.y - from.y) < 0.5) {
      ctx.beginPath();
      if (tip === "square") {
        const size = Math.max(1, Number(radius) * 2 || 1);
        ctx.rect(from.x - size / 2, from.y - size / 2, size, size);
      } else {
        ctx.arc(from.x, from.y, Math.max(0.5, Number(radius) || 0.5), 0, Math.PI * 2);
      }
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function stampCloneBrush(pointer, destination) {
    const ctx = pointer.surface.context;
    const radius = Math.max(1, Number(pointer.radius) || 1);
    const sourceX = pointer.sourceStart.x + (destination.x - pointer.destStart.x);
    const sourceY = pointer.sourceStart.y + (destination.y - pointer.destStart.y);
    const sourceCanvas = pointer.sourceCanvas;
    const sourceLeft = Math.max(0, sourceX - radius);
    const sourceTop = Math.max(0, sourceY - radius);
    const sourceRight = Math.min(sourceCanvas.width, sourceX + radius);
    const sourceBottom = Math.min(sourceCanvas.height, sourceY + radius);
    const sourceWidth = Math.max(0, sourceRight - sourceLeft);
    const sourceHeight = Math.max(0, sourceBottom - sourceTop);
    if (!sourceWidth || !sourceHeight) {
      return;
    }
    const destinationLeft = destination.x - radius + (sourceLeft - (sourceX - radius));
    const destinationTop = destination.y - radius + (sourceTop - (sourceY - radius));
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = renderer.clamp(Number(pointer.opacity ?? 1), 0, 1);
    ctx.beginPath();
    if (pointer.tip === "square") {
      ctx.rect(destination.x - radius, destination.y - radius, radius * 2, radius * 2);
    } else {
      ctx.arc(destination.x, destination.y, radius, 0, Math.PI * 2);
    }
    ctx.clip();
    ctx.drawImage(
      sourceCanvas,
      sourceLeft,
      sourceTop,
      sourceWidth,
      sourceHeight,
      destinationLeft,
      destinationTop,
      sourceWidth,
      sourceHeight,
    );
    ctx.restore();
  }

  function drawCloneLine(pointer, from, to) {
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const step = Math.max(1, Math.round(Math.max(2, pointer.radius * 0.45)));
    const steps = Math.max(1, Math.ceil(distance / step));
    for (let index = 0; index <= steps; index += 1) {
      const t = index / steps;
      stampCloneBrush(pointer, {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
      });
    }
  }

  function updatePaintLayerFromSurface(layer, viewport, surface) {
    const viewportKey = viewport === "mobile" ? "mobile" : "desktop";
    const bounds = getCanvasAlphaBounds(surface.canvas);
    const layout = viewportKey === "mobile" ? layer.mobile : layer.desktop;
    if (!bounds) {
      const blank = document.createElement("canvas");
      blank.width = 1;
      blank.height = 1;
      layout.width = 1;
      layout.height = 1;
      layer[viewportKey === "mobile" ? "mobileSrc" : "desktopSrc"] = blank.toDataURL("image/png");
      layer.src = layer.src || blank.toDataURL("image/png");
      return;
    }
    const crop = document.createElement("canvas");
    crop.width = bounds.width;
    crop.height = bounds.height;
    crop.getContext("2d").drawImage(surface.canvas, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height);
    layout.x = bounds.x;
    layout.y = bounds.y;
    layout.width = bounds.width;
    layout.height = bounds.height;
    layout.rotation = 0;
    const dataUrl = crop.toDataURL("image/png");
    layer[viewportKey === "mobile" ? "mobileSrc" : "desktopSrc"] = dataUrl;
    if (!layer.src) {
      layer.src = dataUrl;
    }
  }

  function getCanvasAlphaBounds(canvas) {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const { width, height } = canvas;
    const data = context.getImageData(0, 0, width, height).data;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 2) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    if (maxX < minX || maxY < minY) {
      return null;
    }
    const pad = 2;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(width - 1, maxX + pad);
    maxY = Math.min(height - 1, maxY + pad);
    return {
      x: minX,
      y: minY,
      width: Math.max(1, maxX - minX + 1),
      height: Math.max(1, maxY - minY + 1),
    };
  }

  function createPenLayerFromPoints(points, viewport, strokeWidth) {
    const bounds = getPenBounds(points, strokeWidth);
    const layout = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      rotation: 0,
    };
    const inactiveLayout = { x: layout.x, y: layout.y, width: layout.width, height: layout.height, rotation: 0 };
    const layer = {
      id: renderer.makeId("layer"),
      type: "shape",
      name: "ペン線",
      role: "pen",
      visible: true,
      locked: false,
      visibilityMode: viewport === "mobile" ? "mobile" : "desktop",
      shape: {
        type: "pen",
        points: normalizePenPoints(points, bounds),
        strokes: [
          Object.assign(createPenStrokeStyle(strokeWidth), {
            points: normalizePenPoints(points, bounds),
          }),
        ],
        fill: "none",
        fillEnabled: false,
        stroke: getPenStrokeColor(),
        strokeEnabled: true,
        strokeWidth,
        brushTip: state.brushTip,
      },
      desktop: viewport === "desktop" ? layout : inactiveLayout,
      mobile: viewport === "mobile" ? layout : inactiveLayout,
      appearance: {
        opacity: renderer.clamp(Number(state.brushOpacity) || 0, 0, 100) / 100,
        brightness: 1,
        shadow: "none",
      },
      constraints: { keepAspect: false, keepSquare: false, keepCircle: false },
      hitArea: { enabled: false, visible: false, x: 0, y: 0, width: layout.width, height: layout.height },
      corners: createDefaultCorners(),
      transformMode: "normal",
    };
    renderer.normalizeLayer(layer);
    return layer;
  }

  function updatePenStroke(event) {
    const pointer = state.pointer;
    const page = getPageById(pointer.pageId);
    const layer = page?.layers.find((item) => item.id === pointer.id);
    if (!layer) {
      return;
    }
    const point = getCanvasPoint(event);
    const last = pointer.last;
    if (last && Math.hypot(point.x - last.x, point.y - last.y) < 1) {
      return;
    }
    if (pointer.surface) {
      drawPaintLine(pointer.surface, last || point, point, pointer.strokeStyle);
      updatePaintLayerFromSurface(layer, pointer.viewport, pointer.surface);
    } else {
      pointer.points = pointer.points || [last || point];
      pointer.points.push(point);
      applyPenStrokesToLayer(layer, (pointer.strokes || []).concat([createAbsolutePenStroke(pointer.points, pointer.strokeStyle)]), pointer.viewport);
    }
    pointer.last = point;
    markDirty();
    renderAll();
  }

  function findReusableCloneLayer(page, viewport) {
    const layers = (page.layers || []).slice().reverse();
    return layers.find((layer) => {
      if (layer.type !== "image" || layer.role !== "clone" || layer.paint?.mode !== "clone") {
        return false;
      }
      if (layer.locked) {
        return false;
      }
      return layer.visibilityMode === "common"
        || (viewport === "mobile" && layer.visibilityMode === "mobile")
        || (viewport !== "mobile" && layer.visibilityMode === "desktop");
    });
  }

  function ensureClonePaintLayer(page, viewport) {
    const reusableLayer = findReusableCloneLayer(page, viewport);
    if (reusableLayer) {
      return { layer: reusableLayer, created: false };
    }
    const layer = createClonePaintLayer(viewport);
    page.layers.push(layer);
    keepMarkupLayersOnTop(page);
    return { layer, created: true };
  }

  function setCloneSource(event) {
    if (state.preview) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (state.windowMode === "image" || state.windowMode === "pc-mobile") {
      const canvas = event.target.closest(".tb-canvas");
      if (canvas === els.secondaryCanvas) {
        activateSecondaryWindow();
      } else {
        activatePrimaryWindow();
      }
    }
    const point = getCanvasPoint(event);
    const page = getCurrentPage();
    const viewport = getCanvasViewportFromEvent(event);
    const sourceLayer = findCloneSourceLayerAtPoint(page, viewport, point);
    pushHistory();
    const { layer, created } = ensureClonePaintLayer(page, viewport);
    setSingleSelection(layer.id);
    state.cloneSource = {
      pageId: page.id,
      viewport,
      x: point.x,
      y: point.y,
      layerId: sourceLayer?.id || "",
    };
    if (created) {
      markDirty();
    }
    renderAll();
    showModeToast(created ? "コピー元を設定し、クローン描画レイヤーを作成しました。左ドラッグで写せます。" : "コピー元を設定しました。左ドラッグで写せます。", { event });
  }

  async function beginCloneStroke(event) {
    if (state.preview) {
      return;
    }
    if (event.button === 2) {
      setCloneSource(event);
      return;
    }
    if (event.button && event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (state.windowMode === "image" || state.windowMode === "pc-mobile") {
      const canvas = event.target.closest(".tb-canvas");
      if (canvas === els.secondaryCanvas) {
        activateSecondaryWindow();
      } else {
        activatePrimaryWindow();
      }
    }
    const page = getCurrentPage();
    const viewport = getCanvasViewportFromEvent(event);
    const source = state.cloneSource;
    if (!source || source.pageId !== page.id || source.viewport !== viewport) {
      showModeToast("クローンブラシ: 先にこの画面で右クリックしてコピー元を指定してください。", { event });
      return;
    }
    try {
      const point = getCanvasPoint(event);
      pushHistory();
      const { layer } = ensureClonePaintLayer(page, viewport);
      const stampedLayer = await stampCloneFromSourceLayer(page, viewport, source, point, layer);
      if (stampedLayer) {
        setSingleSelection(stampedLayer.id);
        state.pointer = {
          id: stampedLayer.id,
          type: "clone-draw",
          mode: "stamp",
          viewport,
          pageId: page.id,
          source,
          destStart: point,
          sourceStart: { x: source.x, y: source.y },
          last: point,
          radius: Math.max(1, Math.round(getEffectiveBrushWidth() / 2)),
        };
        markDirty();
        renderAll();
        showModeToast("クローンを貼り付けました。ドラッグすると続けて写せます。", { event });
        return;
      }
      const sourceCanvas = await renderScreenshotCanvas([{ page, viewport }], {
        excludeLayerIds: [layer.id],
        excludeRoles: ["clone"],
        skipBrokenLayers: true,
      });
      const surface = await preparePaintSurface(layer, viewport);
      setSingleSelection(layer.id);
      state.pointer = {
        id: layer.id,
        type: "clone-draw",
        viewport,
        pageId: page.id,
        last: point,
        destStart: point,
        sourceStart: { x: source.x, y: source.y },
        sourceCanvas,
        surface,
        radius: Math.max(1, Math.round(getEffectiveBrushWidth() / 2)),
        opacity: renderer.clamp(Number(state.brushOpacity) || 0, 0, 100) / 100,
        tip: state.brushTip,
      };
      stampCloneBrush(state.pointer, point);
      updatePaintLayerFromSurface(layer, viewport, surface);
      markDirty();
      renderAll();
      showModeToast("クローンを描画しました。ドラッグすると続けて写せます。", { event });
    } catch (error) {
      console.error("Clone brush failed", error);
      const message = error?.name === "SecurityError"
        ? "画像の読み取り権限で止まりました。画像をもう一度TBalanceへ読み込んでから試してください。"
        : error?.message || "画像を確認してください。";
      showModeToast(`クローン描画に失敗しました: ${message}`, { event });
    }
  }

  function findCloneSourceLayerAtPoint(page, viewport, point) {
    const layers = (page.layers || []).slice();
    for (let index = layers.length - 1; index >= 0; index -= 1) {
      const layer = layers[index];
      if (layer.role === "clone" || layer.role === "hit-area" || layer.role === "markup") {
        continue;
      }
      if (layer.type !== "image" || !getLayerImageSource(layer, viewport)) {
        continue;
      }
      if (!isLayerVisibleInViewport(layer, viewport)) {
        continue;
      }
      const layout = renderer.getLayerLayout(layer, viewport);
      if (
        point.x >= layout.x
        && point.x <= layout.x + layout.width
        && point.y >= layout.y
        && point.y <= layout.y + layout.height
      ) {
        return layer;
      }
    }
    return null;
  }

  function isLayerVisibleInViewport(layer, viewport) {
    if (!layer || layer.visible === false || layer.visibilityMode === "hidden") {
      return false;
    }
    if (layer.visibilityMode === "desktop") {
      return viewport !== "mobile";
    }
    if (layer.visibilityMode === "mobile") {
      return viewport === "mobile";
    }
    return true;
  }

  async function stampCloneFromSourceLayer(page, viewport, source, destination, cloneLayer) {
    const sourceLayer = page.layers.find((layer) => layer.id === source.layerId) || findCloneSourceLayerAtPoint(page, viewport, source);
    const src = getLayerImageSource(sourceLayer, viewport);
    if (!sourceLayer || !src) {
      return null;
    }
    const image = await loadScreenshotImage(src);
    const crop = getCloneImageCrop(sourceLayer, viewport, source, destination, image);
    if (!crop) {
      return null;
    }
    cloneLayer.type = "image";
    cloneLayer.name = cloneLayer.name || "クローン描画";
    cloneLayer.role = "clone";
    cloneLayer.paint = {
      mode: "clone",
      sourceLayerId: sourceLayer.id,
    };
    delete cloneLayer.crop;
    cloneLayer.stamps = Array.isArray(cloneLayer.stamps) ? cloneLayer.stamps : [];
    cloneLayer.stamps.push({
      id: renderer.makeId("stamp"),
      viewport: viewport === "mobile" ? "mobile" : "desktop",
      src,
      tip: state.brushTip === "square" ? "square" : "round",
      source: crop.source,
      destination: crop.destination,
    });
    cloneLayer.src = src;
    const size = renderer.getViewportSize(viewport);
    const canvasLayout = { x: 0, y: 0, width: size.width, height: size.height, rotation: 0 };
    if (viewport === "mobile") {
      cloneLayer.mobileSrc = src;
      cloneLayer.mobile = canvasLayout;
    } else {
      cloneLayer.desktopSrc = src;
      cloneLayer.desktop = canvasLayout;
    }
    cloneLayer.visibilityMode = viewport === "mobile" ? "mobile" : "desktop";
    cloneLayer.appearance = Object.assign({}, renderer.getAppearance(cloneLayer), { opacity: 1, brightness: 1 });
    cloneLayer.constraints = { keepAspect: true, keepSquare: false, keepCircle: false };
    renderer.normalizeLayer(cloneLayer);
    return cloneLayer;
  }

  function getCloneImageCrop(layer, viewport, sourcePoint, destinationPoint, image) {
    const layout = renderer.getLayerLayout(layer, viewport);
    const radius = Math.max(1, Math.round(getEffectiveBrushWidth() / 2));
    const naturalWidth = image.naturalWidth || image.width || 1;
    const naturalHeight = image.naturalHeight || image.height || 1;
    const boxWidth = Math.max(1, Number(layout.width) || naturalWidth);
    const boxHeight = Math.max(1, Number(layout.height) || naturalHeight);
    const fit = layer.role === "background" ? "cover" : "contain";
    const scale = fit === "cover"
      ? Math.max(boxWidth / naturalWidth, boxHeight / naturalHeight)
      : Math.min(boxWidth / naturalWidth, boxHeight / naturalHeight);
    const renderedWidth = naturalWidth * scale;
    const renderedHeight = naturalHeight * scale;
    const offsetX = (boxWidth - renderedWidth) / 2;
    const offsetY = (boxHeight - renderedHeight) / 2;
    const imageX = ((sourcePoint.x - layout.x) - offsetX) / scale;
    const imageY = ((sourcePoint.y - layout.y) - offsetY) / scale;
    if (!Number.isFinite(imageX) || !Number.isFinite(imageY)) {
      return null;
    }
    const cropRadius = radius / scale;
    const sourceLeft = renderer.clamp(imageX - cropRadius, 0, naturalWidth);
    const sourceTop = renderer.clamp(imageY - cropRadius, 0, naturalHeight);
    const sourceRight = renderer.clamp(imageX + cropRadius, 0, naturalWidth);
    const sourceBottom = renderer.clamp(imageY + cropRadius, 0, naturalHeight);
    const sourceWidth = Math.max(1, sourceRight - sourceLeft);
    const sourceHeight = Math.max(1, sourceBottom - sourceTop);
    const destinationWidth = Math.max(1, Math.round(sourceWidth * scale));
    const destinationHeight = Math.max(1, Math.round(sourceHeight * scale));
    return {
      source: {
        x: sourceLeft,
        y: sourceTop,
        width: sourceWidth,
        height: sourceHeight,
      },
      destination: {
        x: Math.round(destinationPoint.x - destinationWidth / 2),
        y: Math.round(destinationPoint.y - destinationHeight / 2),
        width: destinationWidth,
        height: destinationHeight,
        rotation: 0,
      },
    };
  }

  function getMovingCloneSource(pointer, destinationPoint) {
    const baseSource = pointer.source || {};
    const destStart = pointer.destStart || destinationPoint;
    const sourceStart = pointer.sourceStart || baseSource;
    return Object.assign({}, baseSource, {
      x: (Number(sourceStart.x) || 0) + (destinationPoint.x - destStart.x),
      y: (Number(sourceStart.y) || 0) + (destinationPoint.y - destStart.y),
    });
  }

  async function updateCloneStroke(event) {
    const pointer = state.pointer;
    const page = getPageById(pointer.pageId);
    const layer = page?.layers.find((item) => item.id === pointer.id);
    if (!layer) {
      return;
    }
    const point = getCanvasPoint(event);
    const last = pointer.last || point;
    if (Math.hypot(point.x - last.x, point.y - last.y) < 0.5) {
      return;
    }
    if (pointer.mode === "stamp") {
      const step = Math.max(4, Math.round(Math.max(2, pointer.radius * 0.75)));
      const distance = Math.hypot(point.x - last.x, point.y - last.y);
      if (distance < step) {
        return;
      }
      try {
        const steps = Math.max(1, Math.floor(distance / step));
        for (let index = 1; index <= steps; index += 1) {
          const t = index / steps;
          const stampPoint = {
            x: last.x + (point.x - last.x) * t,
            y: last.y + (point.y - last.y) * t,
          };
          const movingSource = getMovingCloneSource(pointer, stampPoint);
          await stampCloneFromSourceLayer(page, pointer.viewport, movingSource, stampPoint, layer);
        }
        pointer.last = point;
        markDirty();
        renderAll();
      } catch (error) {
        console.error("Clone drag failed", error);
        showModeToast("クローンの連続描画に失敗しました。コピー元をもう一度指定してください。", { event });
      }
      return;
    }
    drawCloneLine(pointer, last, point);
    updatePaintLayerFromSurface(layer, pointer.viewport, pointer.surface);
    pointer.last = point;
    markDirty();
    renderAll();
  }

  async function beginEraserStroke(event) {
    if (state.preview) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (state.windowMode === "image" || state.windowMode === "pc-mobile") {
      const canvas = event.target.closest(".tb-canvas");
      if (canvas === els.secondaryCanvas) {
        activateSecondaryWindow();
      } else {
        activatePrimaryWindow();
      }
    }
    const page = getCurrentPage();
    const viewport = getCanvasViewportFromEvent(event);
    const point = getCanvasPoint(event);
    const layer = findErasablePenLayerAtPoint(page, viewport, point);
    if (!layer) {
      const blockedLayer = findLayerAtPoint(point);
      if (blockedLayer && blockedLayer.role !== "pen" && blockedLayer.shape?.type !== "pen") {
        showModeToast(`消しゴム: 「${blockedLayer.name || "このレイヤー"}」は消せません。ペン線専用です。`, { event });
      } else {
        showModeToast("消しゴム: 消せるペン線がありません。", { event });
      }
      return;
    }
    pushHistory();
    const surface = layer.type === "image" ? await preparePaintSurface(layer, viewport) : null;
    setSingleSelection(layer.id);
    state.pointer = {
      id: layer.id,
      type: "eraser-draw",
      viewport,
      pageId: page.id,
      last: point,
      radius: getEffectiveEraserRadius(),
      tip: state.eraserTip,
      surface,
    };
    if (surface) {
      erasePaintLine(surface, point, point, state.pointer.radius, state.pointer.tip);
      updatePaintLayerFromSurface(layer, viewport, surface);
    } else {
      erasePenAtPoint(layer, viewport, point, state.pointer.radius);
    }
    markDirty();
    renderAll();
  }

  async function beginRetouchStroke(event) {
    if (state.preview) {
      return;
    }
    if (event.button && event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (state.windowMode === "image" || state.windowMode === "pc-mobile") {
      const canvas = event.target.closest(".tb-canvas");
      if (canvas === els.secondaryCanvas) {
        activateSecondaryWindow();
      } else {
        activatePrimaryWindow();
      }
    }
    const page = getCurrentPage();
    const viewport = getCanvasViewportFromEvent(event);
    const point = getCanvasPoint(event);
    const layer = findRetouchTargetLayer(page, viewport, point);
    if (!layer) {
      showModeToast("レタッチ: 画像・図形・線レイヤー上で使えます。", { event });
      return;
    }
    try {
      pushHistory();
      let surface;
      if (layer.type !== "image") {
        if (state.editorMode !== "normal") {
          setSingleSelection(layer.id);
          const applied = applyVectorRetouchLayer(layer);
          if (applied) {
            markDirty();
            renderAll();
            showModeToast("ベクターの色を調整しました。部分レタッチはNormalで画像化して使えます。", { event });
          } else {
            showModeToast("このベクターには色調整だけ使えます。ぼかしは画像化してから使います。", { event });
          }
          return;
        }
        const ok = window.confirm("この図形・線を画像化してレタッチしますか？\n画像化すると、触った範囲だけ明るく/暗く/ぼかしできます。\nあとから図形の種類や線の点編集には戻せません。");
        if (!ok) {
          showModeToast("画像化をキャンセルしました。", { event });
          return;
        }
        surface = await rasterizeLayerForRetouch(layer, viewport);
      } else {
        surface = await preparePaintSurface(layer, viewport);
      }
      setSingleSelection(layer.id);
      state.pointer = {
        id: layer.id,
        type: "retouch-draw",
        viewport,
        pageId: page.id,
        last: point,
        surface,
        radius: Math.max(1, Number(state.retouchSize || 32) / 2),
        tip: state.retouchTip,
        mode: state.retouchMode,
        hardness: renderer.clamp(Number(state.retouchHardness) || 0, 0, 100) / 100,
        opacity: renderer.clamp(Number(state.retouchOpacity) || 0, 0, 100) / 100,
        step: renderer.clamp(Number(state.retouchStep) || 18, 1, 100),
        density: renderer.clamp(Number(state.retouchDensity) || 70, 1, 100) / 100,
      };
      stampRetouchBrush(state.pointer, point);
      updatePaintLayerFromSurface(layer, viewport, surface);
      markDirty();
      renderAll();
    } catch (error) {
      console.error("Retouch failed", error);
      showModeToast("レタッチ補正に失敗しました。画像をもう一度読み込んでから試してください。", { event });
    }
  }

  function updateRetouchStroke(event) {
    const pointer = state.pointer;
    const page = getPageById(pointer.pageId);
    const layer = page?.layers.find((item) => item.id === pointer.id);
    if (!layer || !pointer.surface) {
      return;
    }
    const point = getCanvasPoint(event);
    const last = pointer.last || point;
    const distance = Math.hypot(point.x - last.x, point.y - last.y);
    const spacing = Math.max(1, pointer.radius * (pointer.step / 100));
    if (distance < Math.min(1, spacing)) {
      return;
    }
    const steps = Math.max(1, Math.ceil(distance / spacing));
    for (let index = 1; index <= steps; index += 1) {
      const t = index / steps;
      stampRetouchBrush(pointer, {
        x: last.x + (point.x - last.x) * t,
        y: last.y + (point.y - last.y) * t,
      });
    }
    pointer.last = point;
    updatePaintLayerFromSurface(layer, pointer.viewport, pointer.surface);
    markDirty();
    renderAll();
  }

  function findRetouchTargetLayer(page, viewport, point) {
    const selected = getSelectedLayer();
    if (isRetouchableLayer(selected, viewport) && isPointInsideLayer(selected, viewport, point)) {
      return selected;
    }
    const layers = page.layers || [];
    for (let index = layers.length - 1; index >= 0; index -= 1) {
      const layer = layers[index];
      if (!isRetouchableLayer(layer, viewport) || !isPointInsideLayer(layer, viewport, point)) {
        continue;
      }
      return layer;
    }
    return null;
  }

  function isRetouchableLayer(layer, viewport) {
    if (!layer || layer.locked) {
      return false;
    }
    if (layer.role === "hit-area" || layer.role === "markup") {
      return false;
    }
    if (!isLayerVisibleInViewport(layer, viewport)) {
      return false;
    }
    if (layer.type === "image") {
      return Boolean(getPaintLayerSrc(layer, viewport));
    }
    return layer.type === "shape" || layer.type === "text" || layer.type === "button";
  }

  function isPointInsideLayer(layer, viewport, point) {
    const layout = renderer.getLayerLayout(layer, viewport);
    return point.x >= layout.x
      && point.x <= layout.x + layout.width
      && point.y >= layout.y
      && point.y <= layout.y + layout.height;
  }

  async function rasterizeLayerForRetouch(layer, viewport) {
    const viewportKey = viewport === "mobile" ? "mobile" : "desktop";
    const size = renderer.getViewportSize(viewportKey);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d");
    await drawLayerToContext(context, layer, viewportKey);
    const originalRole = layer.role;
    const originalName = layer.name || "レタッチ画像";
    layer.type = "image";
    layer.name = originalName;
    layer.role = originalRole === "background" ? "background" : "retouch";
    layer.paint = { mode: "retouch" };
    layer.src = "";
    layer.desktopSrc = viewportKey === "desktop" ? "" : (layer.desktopSrc || "");
    layer.mobileSrc = viewportKey === "mobile" ? "" : (layer.mobileSrc || "");
    delete layer.shape;
    delete layer.text;
    delete layer.style;
    renderer.normalizeLayer(layer);
    const surface = { canvas, context };
    updatePaintLayerFromSurface(layer, viewportKey, surface);
    return preparePaintSurface(layer, viewportKey);
  }

  function applyVectorRetouchLayer(layer) {
    const mode = state.retouchMode;
    if (mode === "soften" || mode === "sharpen" || mode === "smudge") {
      return false;
    }
    const amount = renderer.clamp((Number(state.retouchOpacity) || 45) / 100 * (Number(state.retouchDensity) || 70) / 100, 0.01, 1);
    const adjust = (color) => adjustRetouchColor(color, mode, amount);
    let changed = false;
    const assign = (object, key) => {
      if (!object || !object[key]) {
        return;
      }
      const next = adjust(object[key]);
      if (next && next !== object[key]) {
        object[key] = next;
        changed = true;
      }
    };
    if (layer.type === "shape") {
      const shape = layer.shape || {};
      if (shape.fillEnabled !== false) {
        assign(shape, "fill");
      }
      if (shape.strokeEnabled !== false) {
        assign(shape, "stroke");
      }
      if (Array.isArray(shape.strokes)) {
        shape.strokes.forEach((stroke) => assign(stroke, "color"));
      }
      return changed;
    }
    if (layer.type === "text" || layer.type === "button") {
      layer.style = layer.style || {};
      assign(layer.style, "color");
      assign(layer.style, "strokeColor");
      assign(layer.style, "background");
      assign(layer.style, "borderColor");
      return changed;
    }
    return false;
  }

  function adjustRetouchColor(color, mode, amount) {
    const hex = cssColorToHex(color);
    if (!hex || hex === "transparent") {
      return "";
    }
    const rgb = hexToRgb(hex);
    if (!rgb) {
      return "";
    }
    if (mode === "darken") {
      return rgbToHex(
        mixChannel(rgb.r, 0, amount * 0.42),
        mixChannel(rgb.g, 0, amount * 0.42),
        mixChannel(rgb.b, 0, amount * 0.42),
      );
    }
    if (mode === "saturation" || mode === "hue") {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      if (mode === "saturation") {
        hsl.s = renderer.clamp(hsl.s + amount * 0.32, 0, 1);
      } else {
        hsl.h = (hsl.h + amount * 0.06) % 1;
      }
      const next = hslToRgb(hsl.h, hsl.s, hsl.l);
      return rgbToHex(next.r, next.g, next.b);
    }
    const lift = mode === "brightness" ? 0.36 : 0.48;
    return rgbToHex(
      mixChannel(rgb.r, 255, amount * lift),
      mixChannel(rgb.g, 255, amount * lift),
      mixChannel(rgb.b, 255, amount * lift),
    );
  }

  function hexToRgb(hex) {
    const normalized = normalizeHexColor(hex);
    if (!normalized || normalized === "transparent") {
      return null;
    }
    return {
      r: parseInt(normalized.slice(1, 3), 16),
      g: parseInt(normalized.slice(3, 5), 16),
      b: parseInt(normalized.slice(5, 7), 16),
    };
  }

  function rgbToHex(red, green, blue) {
    return `#${[red, green, blue].map((value) => {
      const next = renderer.clamp(Math.round(value), 0, 255);
      return next.toString(16).padStart(2, "0");
    }).join("")}`;
  }

  function stampRetouchBrush(pointer, center) {
    const ctx = pointer.surface.context;
    const radius = Math.max(1, Math.round(pointer.radius));
    const left = Math.max(0, Math.floor(center.x - radius));
    const top = Math.max(0, Math.floor(center.y - radius));
    const right = Math.min(pointer.surface.canvas.width, Math.ceil(center.x + radius));
    const bottom = Math.min(pointer.surface.canvas.height, Math.ceil(center.y + radius));
    const width = right - left;
    const height = bottom - top;
    if (width <= 0 || height <= 0) {
      return;
    }
    const imageData = ctx.getImageData(left, top, width, height);
    const data = imageData.data;
    const source = new Uint8ClampedArray(data);
    const amountBase = renderer.clamp(pointer.opacity * pointer.density, 0.01, 1);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const absoluteX = left + x;
        const absoluteY = top + y;
        const mask = getRetouchMask(absoluteX, absoluteY, center, radius, pointer);
        if (mask <= 0) {
          continue;
        }
        const offset = (y * width + x) * 4;
        if (source[offset + 3] <= 0) {
          continue;
        }
        applyRetouchPixel(data, source, offset, x, y, width, height, pointer, amountBase * mask);
      }
    }
    ctx.putImageData(imageData, left, top);
  }

  function getRetouchMask(x, y, center, radius, pointer) {
    if (pointer.tip === "square") {
      return 1;
    }
    const distance = Math.hypot(x - center.x, y - center.y);
    if (distance > radius) {
      return 0;
    }
    if (pointer.tip === "soft") {
      return Math.max(0, 1 - distance / radius);
    }
    const hardEdge = radius * renderer.clamp(pointer.hardness || 0.6, 0, 1);
    if (distance <= hardEdge) {
      return 1;
    }
    return renderer.clamp(1 - (distance - hardEdge) / Math.max(1, radius - hardEdge), 0, 1);
  }

  function applyRetouchPixel(data, source, offset, x, y, width, height, pointer, amount) {
    const mode = pointer.mode;
    const red = source[offset];
    const green = source[offset + 1];
    const blue = source[offset + 2];
    if (mode === "soften" || mode === "smudge" || mode === "sharpen") {
      const blurRadius = mode === "sharpen"
        ? 1
        : Math.max(2, Math.min(14, Math.round((Number(pointer.radius) || 16) * 0.18)));
      const avg = getNeighborAverage(source, x, y, width, height, blurRadius);
      if (mode === "sharpen") {
        data[offset] = renderer.clamp(red + (red - avg.r) * amount * 1.8, 0, 255);
        data[offset + 1] = renderer.clamp(green + (green - avg.g) * amount * 1.8, 0, 255);
        data[offset + 2] = renderer.clamp(blue + (blue - avg.b) * amount * 1.8, 0, 255);
      } else {
        const blurAmount = renderer.clamp(amount * (mode === "soften" ? 1.65 : 1.1), 0, 1);
        data[offset] = mixChannel(red, avg.r, blurAmount);
        data[offset + 1] = mixChannel(green, avg.g, blurAmount);
        data[offset + 2] = mixChannel(blue, avg.b, blurAmount);
      }
      return;
    }
    if (mode === "darken") {
      data[offset] = mixChannel(red, 0, amount * 0.42);
      data[offset + 1] = mixChannel(green, 0, amount * 0.42);
      data[offset + 2] = mixChannel(blue, 0, amount * 0.42);
      return;
    }
    if (mode === "saturation" || mode === "hue") {
      const hsl = rgbToHsl(red, green, blue);
      if (mode === "saturation") {
        hsl.s = renderer.clamp(hsl.s + amount * 0.32, 0, 1);
      } else {
        hsl.h = (hsl.h + amount * 0.06) % 1;
      }
      const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
      data[offset] = rgb.r;
      data[offset + 1] = rgb.g;
      data[offset + 2] = rgb.b;
      return;
    }
    const lift = mode === "brightness" ? 0.36 : 0.48;
    data[offset] = mixChannel(red, 255, amount * lift);
    data[offset + 1] = mixChannel(green, 255, amount * lift);
    data[offset + 2] = mixChannel(blue, 255, amount * lift);
  }

  function mixChannel(from, to, amount) {
    return renderer.clamp(Math.round(from + (to - from) * renderer.clamp(amount, 0, 1)), 0, 255);
  }

  function getNeighborAverage(source, x, y, width, height, radius = 1) {
    let red = 0;
    let green = 0;
    let blue = 0;
    let count = 0;
    const sampleRadius = Math.max(1, Math.round(radius));
    const offsets = [-sampleRadius, 0, sampleRadius];
    offsets.forEach((dy) => {
      offsets.forEach((dx) => {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
          return;
        }
        const offset = (ny * width + nx) * 4;
        red += source[offset];
        green += source[offset + 1];
        blue += source[offset + 2];
        count += 1;
      });
    });
    return {
      r: red / Math.max(1, count),
      g: green / Math.max(1, count),
      b: blue / Math.max(1, count),
    };
  }

  function rgbToHsl(red, green, blue) {
    const r = red / 255;
    const g = green / 255;
    const b = blue / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) {
        h = (g - b) / d + (g < b ? 6 : 0);
      } else if (max === g) {
        h = (b - r) / d + 2;
      } else {
        h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return { h, s, l };
  }

  function hslToRgb(h, s, l) {
    if (s === 0) {
      const value = Math.round(l * 255);
      return { r: value, g: value, b: value };
    }
    const hueToRgb = (p, q, t) => {
      let next = t;
      if (next < 0) next += 1;
      if (next > 1) next -= 1;
      if (next < 1 / 6) return p + (q - p) * 6 * next;
      if (next < 1 / 2) return q;
      if (next < 2 / 3) return p + (q - p) * (2 / 3 - next) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return {
      r: Math.round(hueToRgb(p, q, h + 1 / 3) * 255),
      g: Math.round(hueToRgb(p, q, h) * 255),
      b: Math.round(hueToRgb(p, q, h - 1 / 3) * 255),
    };
  }

  function updateEraserStroke(event) {
    const pointer = state.pointer;
    const page = getPageById(pointer.pageId);
    const layer = page?.layers.find((item) => item.id === pointer.id);
    if (!layer) {
      return;
    }
    const point = getCanvasPoint(event);
    if (pointer.surface) {
      erasePaintLine(pointer.surface, pointer.last, point, pointer.radius, pointer.tip);
      updatePaintLayerFromSurface(layer, pointer.viewport, pointer.surface);
    } else {
      erasePenBetweenPoints(layer, pointer.viewport, pointer.last, point, pointer.radius);
    }
    pointer.last = point;
    markDirty();
    renderAll();
  }

  function findErasablePenLayerAtPoint(page, viewport, point) {
    const layers = page.layers || [];
    for (let index = layers.length - 1; index >= 0; index -= 1) {
      const layer = layers[index];
      if (!canReusePenLayer(layer, viewport)) {
        continue;
      }
      const layout = viewport === "mobile" ? layer.mobile : layer.desktop;
      const pad = Math.max(12, Number(layer.shape?.strokeWidth || 4) * 2);
      if (point.x >= layout.x - pad && point.x <= layout.x + layout.width + pad && point.y >= layout.y - pad && point.y <= layout.y + layout.height + pad) {
        return layer;
      }
    }
    return null;
  }

  function erasePenBetweenPoints(layer, viewport, from, to, radius) {
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(distance / Math.max(4, radius * 0.5)));
    for (let index = 0; index <= steps; index += 1) {
      const t = index / steps;
      erasePenAtPoint(layer, viewport, {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
      }, radius);
    }
  }

  function erasePenAtPoint(layer, viewport, point, radius) {
    const strokes = getPenLayerAbsoluteStrokes(layer, viewport);
    const erased = [];
    strokes.forEach((stroke) => {
      const strokeRadius = Math.max(0.5, Number(radius) || 0.5) + Math.max(0, Number(stroke.width) || 1) / 2;
      let current = [];
      const points = stroke.points || [];
      points.forEach((strokePoint, index) => {
        const previous = points[index - 1];
        const hit = previous
          ? doesStrokeSegmentHitEraser(previous, strokePoint, point, strokeRadius, state.eraserTip)
          : isPointInsideEraser(strokePoint, point, strokeRadius, state.eraserTip);
        if (hit || isPointInsideEraser(strokePoint, point, strokeRadius, state.eraserTip)) {
          if (current.length >= 2) {
            erased.push(Object.assign({}, stroke, { points: current }));
          }
          current = [];
          if (!isPointInsideEraser(strokePoint, point, strokeRadius, state.eraserTip)) {
            current.push(strokePoint);
          }
          return;
        }
        current.push(strokePoint);
      });
      if (current.length >= 2) {
        erased.push(Object.assign({}, stroke, { points: current }));
      }
    });
    if (!erased.length) {
      layer.shape.strokes = [];
      layer.shape.points = [];
      layer.shape.stroke = getPenStrokeColor();
      return;
    }
    applyPenStrokesToLayer(layer, erased, viewport);
  }

  function doesStrokeSegmentHitEraser(from, to, center, radius, tip = state.eraserTip) {
    if (tip === "square") {
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      const steps = Math.max(1, Math.ceil(distance / Math.max(2, radius * 0.35)));
      for (let index = 0; index <= steps; index += 1) {
        const t = index / steps;
        if (isPointInsideEraser({
          x: from.x + (to.x - from.x) * t,
          y: from.y + (to.y - from.y) * t,
        }, center, radius, tip)) {
          return true;
        }
      }
      return false;
    }
    return distanceToSegment(center, from, to) <= radius;
  }

  function isPointInsideEraser(point, center, radius, tip = state.eraserTip) {
    if (tip === "square") {
      return Math.abs(point.x - center.x) <= radius && Math.abs(point.y - center.y) <= radius;
    }
    return Math.hypot(point.x - center.x, point.y - center.y) <= radius;
  }

  function distanceToSegment(point, from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const lengthSq = dx * dx + dy * dy;
    if (!lengthSq) {
      return Math.hypot(point.x - from.x, point.y - from.y);
    }
    const t = renderer.clamp(((point.x - from.x) * dx + (point.y - from.y) * dy) / lengthSq, 0, 1);
    const nearest = {
      x: from.x + dx * t,
      y: from.y + dy * t,
    };
    return Math.hypot(point.x - nearest.x, point.y - nearest.y);
  }

  function finishPenStroke() {
    const pointer = state.pointer;
    const page = getPageById(pointer.pageId);
    const layer = page?.layers.find((item) => item.id === pointer.id);
    if (!layer) {
      return;
    }
    if (pointer.surface) {
      updatePaintLayerFromSurface(layer, pointer.viewport, pointer.surface);
      showModeToast("ペン描画レイヤーを更新しました。");
      markDirty();
      renderAll();
      return;
    }
    if (pointer.points.length === 1) {
      const point = pointer.points[0];
      pointer.points.push({ x: point.x + 0.1, y: point.y + 0.1 });
    }
    applyPenStrokesToLayer(layer, (pointer.strokes || []).concat([createAbsolutePenStroke(pointer.points, pointer.strokeStyle)]), pointer.viewport);
    showModeToast("ペン線レイヤーを作成しました。");
    markDirty();
    renderAll();
  }

  function applyPenPointsToLayer(layer, points, viewport, strokeWidth) {
    applyPenStrokesToLayer(layer, [createAbsolutePenStroke(points, createPenStrokeStyle(strokeWidth))], viewport);
  }

  function applyPenStrokesToLayer(layer, strokes, viewport) {
    const allPoints = strokes.flatMap((stroke) => stroke.points || []).filter(Boolean);
    const maxWidth = Math.max(1, ...strokes.map((stroke) => Number(stroke.width) || Number(layer.shape?.strokeWidth) || 1));
    const bounds = getPenBounds(allPoints, maxWidth);
    const layout = viewport === "mobile" ? layer.mobile : layer.desktop;
    layout.x = bounds.x;
    layout.y = bounds.y;
    layout.width = bounds.width;
    layout.height = bounds.height;
    layout.rotation = 0;
    layer.shape = Object.assign({}, layer.shape || {}, {
      type: "pen",
      points: normalizePenPoints(strokes[strokes.length - 1]?.points || [], bounds),
      strokes: strokes.map((stroke) => Object.assign({}, stroke, {
        points: normalizePenPoints(stroke.points || [], bounds),
      })),
      stroke: strokes[strokes.length - 1]?.color || getPenStrokeColor(),
      strokeWidth: strokes[strokes.length - 1]?.width || maxWidth,
      brushTip: strokes[strokes.length - 1]?.tip || state.brushTip,
      fillEnabled: false,
      strokeEnabled: true,
    });
  }

  function createPenStrokeStyle(strokeWidth) {
    return {
      color: getPenStrokeColor(),
      width: Math.max(1, Number(strokeWidth) || 1),
      tip: state.brushTip,
      opacity: renderer.clamp(Number(state.brushOpacity) || 0, 0, 100) / 100,
    };
  }

  function createAbsolutePenStroke(points, style) {
    return Object.assign({}, style, {
      points: points.map((point) => ({ x: point.x, y: point.y })),
    });
  }

  function findReusablePenLayer(page, viewport) {
    const selected = getSelectedLayer();
    if (canReusePenLayer(selected, viewport)) {
      return selected;
    }
    const layers = page.layers || [];
    for (let index = layers.length - 1; index >= 0; index -= 1) {
      if (canReusePenLayer(layers[index], viewport)) {
        return layers[index];
      }
    }
    return null;
  }

  function findReusableMarkupPenLayer(page, viewport) {
    const selected = getSelectedLayer();
    if (canReuseMarkupPenLayer(selected, viewport)) {
      return selected;
    }
    const layers = page.layers || [];
    for (let index = layers.length - 1; index >= 0; index -= 1) {
      if (canReuseMarkupPenLayer(layers[index], viewport)) {
        return layers[index];
      }
    }
    return null;
  }

  function canReusePenLayer(layer, viewport) {
    if (!layer || layer.role !== "pen" || layer.locked) {
      return false;
    }
    if (layer.type !== "image" && layer.shape?.type !== "pen") {
      return false;
    }
    return layer.visibilityMode === (viewport === "mobile" ? "mobile" : "desktop");
  }

  function canReuseMarkupPenLayer(layer, viewport) {
    if (!layer || layer.role !== "markup" || layer.locked) {
      return false;
    }
    if (layer.type !== "image" || layer.paint?.mode !== "markup-pen") {
      return false;
    }
    return layer.visibilityMode === (viewport === "mobile" ? "mobile" : "desktop");
  }

  function getPenLayerAbsoluteStrokes(layer, viewport) {
    const layout = viewport === "mobile" ? layer.mobile : layer.desktop;
    const strokes = Array.isArray(layer.shape?.strokes) && layer.shape.strokes.length
      ? layer.shape.strokes
      : [Object.assign(createPenStrokeStyle(layer.shape?.strokeWidth || 4), { points: layer.shape?.points || [] })];
    return strokes.map((stroke) => {
      const points = Array.isArray(stroke.points) ? stroke.points : Array.isArray(stroke) ? stroke : [];
      return Object.assign({
        color: stroke.color || layer.shape?.stroke || "#fff6db",
        width: Number(stroke.width || layer.shape?.strokeWidth || 4),
        tip: stroke.tip || layer.shape?.brushTip || "round",
        opacity: Number(stroke.opacity ?? renderer.getAppearance(layer).opacity ?? 1),
      }, {
        points: points.map((point) => ({
          x: layout.x + (renderer.clamp(Number(point.x) || 0, 0, 100) / 100) * Math.max(1, layout.width),
          y: layout.y + (renderer.clamp(Number(point.y) || 0, 0, 100) / 100) * Math.max(1, layout.height),
        })),
      });
    }).filter((stroke) => stroke.points.length);
  }

  function getPenBounds(points, strokeWidth) {
    const padding = Math.max(8, Math.ceil((Number(strokeWidth) || 1) * 1.5));
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return {
      x: Math.floor(minX - padding),
      y: Math.floor(minY - padding),
      width: Math.max(1, Math.ceil(maxX - minX + padding * 2)),
      height: Math.max(1, Math.ceil(maxY - minY + padding * 2)),
    };
  }

  function normalizePenPoints(points, bounds) {
    return points.map((point) => ({
      x: renderer.clamp(((point.x - bounds.x) / Math.max(1, bounds.width)) * 100, 0, 100),
      y: renderer.clamp(((point.y - bounds.y) / Math.max(1, bounds.height)) * 100, 0, 100),
    }));
  }

  function handleSecondaryCanvasPointerDown(event) {
    if (state.preview || !event.target.closest("#secondaryCanvas")) {
      return;
    }
    if (event.target.closest("[data-selection-float-action]")) {
      return;
    }
    if (state.windowMode !== "image" && state.windowMode !== "pc-mobile") {
      return;
    }
    activateSecondaryWindow();
    if (state.tool === "eyedropper") {
      pickColorFromCanvas(event, "");
      return;
    }
    if (state.tool === "pen") {
      beginPenStroke(event);
      return;
    }
    if (state.tool === "clone") {
      beginCloneStroke(event);
      return;
    }
    if (state.tool === "eraser") {
      beginEraserStroke(event);
      return;
    }
    if (state.tool === "fill") {
      applyFillTool(event, "");
      return;
    }
    if (state.tool === "note") {
      addMemoAtPoint(getCanvasPoint(event), getCanvasViewportFromEvent(event));
      return;
    }
    if (state.tool === "select") {
      beginRectSelection(event);
      return;
    }
    renderAll();
  }

  function handleSelectionFloatAction(event) {
    const button = event.target.closest("[data-selection-float-action]");
    if (!button) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    handleSelectionRangeAction(button.dataset.selectionFloatAction);
  }

  function handleSelectionContextMenu(event) {
    if (state.tool === "clone") {
      setCloneSource(event);
      return;
    }
    if (!state.selectionRange) {
      return;
    }
    const canvas = event.currentTarget === els.secondaryCanvas ? els.secondaryCanvas : els.canvas;
    const point = getCanvasPoint(event);
    const range = state.selectionRange;
    const windowKey = canvas === els.secondaryCanvas ? "secondary" : "primary";
    const inside = range.window === windowKey
      && point.x >= range.x
      && point.x <= range.x + range.width
      && point.y >= range.y
      && point.y <= range.y + range.height;
    if (!inside) {
      return;
    }
    event.preventDefault();
    state.selectionRange = null;
    state.selectionRect = null;
    renderAll();
    showModeToast("選択範囲を解除しました。");
  }

  function beginRectSelection(event) {
    event.preventDefault();
    event.stopPropagation();
    const point = getCanvasPoint(event);
    const windowKey = getActiveWindowKey();
    const viewportKey = getCanvasViewportFromEvent(event);
    state.selectionRect = {
      start: point,
      current: point,
      shape: state.selectionMode === "ellipse" ? "ellipse" : "rect",
      mode: state.selectionMode || "rect",
      window: windowKey,
      viewport: viewportKey,
      pageId: getCurrentPage().id,
    };
    state.selectionRange = null;
    state.pointer = {
      type: "rect-select",
      start: point,
      window: windowKey,
    };
    clearSelection();
    renderAll();
  }

  function handlePointerMove(event) {
    updateBrushPreview(event);
    if (handleExistingWebDragMove(event)) {
      return;
    }
    if (state.panelResize) {
      const rect = els.rightPanel.getBoundingClientRect();
      const next = renderer.clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0.26, 0.72);
      document.documentElement.style.setProperty("--inspector-height", `${Math.round(next * 100)}%`);
      return;
    }
    if (!state.pointer) {
      return;
    }
    if (state.pointer.type === "pen-draw") {
      updatePenStroke(event);
      return;
    }
    if (state.pointer.type === "clone-draw") {
      void updateCloneStroke(event);
      return;
    }
    if (state.pointer.type === "eraser-draw") {
      updateEraserStroke(event);
      return;
    }
    if (state.pointer.type === "retouch-draw") {
      updateRetouchStroke(event);
      return;
    }
    if (state.pointer.type === "rect-select") {
      if (!state.selectionRect) {
        return;
      }
      state.selectionRect.current = getCanvasPoint(event);
      renderAll();
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
      const snapped = getSnappedPosition(state.pointer.origin.x + dx, state.pointer.origin.y + dy);
      const moveDx = snapped.x - state.pointer.origin.x;
      const moveDy = snapped.y - state.pointer.origin.y;
      const selectedOrigins = state.pointer.selectedOrigins || {};
      const selectedIds = Object.keys(selectedOrigins);
      if (selectedIds.length > 1 && selectedIds.includes(layer.id)) {
        selectedIds.forEach((id) => {
          const selectedLayer = findLayer(id);
          const origin = selectedOrigins[id];
          if (!selectedLayer || selectedLayer.locked || !origin) {
            return;
          }
          const selectedLayout = getCurrentLayout(selectedLayer);
          selectedLayout.x = Math.round(origin.x + moveDx);
          selectedLayout.y = Math.round(origin.y + moveDy);
        });
      } else {
        layout.x = snapped.x;
        layout.y = snapped.y;
      }
    } else if (state.pointer.type.startsWith("corner-")) {
      moveCorner(layer, state.pointer.type.replace("corner-", ""), point);
    } else if (state.pointer.type.startsWith("resize-")) {
      resizeLayerFromHandle(layer, state.pointer.type.replace("resize-", ""), dx, dy, event);
    } else if (state.pointer.type === "rotate") {
      layout.rotation = Math.round(Math.atan2(point.y - state.pointer.center.y, point.x - state.pointer.center.x) * 180 / Math.PI + 90);
    }
    syncHitAreaToLayer(layer);
    markDirty();
    renderAll();
  }

  function endPointer() {
    if (endExistingWebDrag()) {
      return;
    }
    if (state.pointer?.type === "pen-draw") {
      finishPenStroke();
    }
    if (state.pointer?.type === "eraser-draw") {
      showModeToast("ペン線を消しました。");
    }
    if (state.pointer?.type === "clone-draw") {
      showModeToast("クローン描画を更新しました。");
    }
    if (state.pointer?.type === "retouch-draw") {
      showModeToast("レタッチ補正を適用しました。");
    }
    if (state.pointer?.type === "rect-select") {
      finishRectSelection();
    }
    state.pointer = null;
    state.panelResize = null;
  }

  function finishRectSelection() {
    if (!state.selectionRect) {
      return;
    }
    const rect = getNormalizedRect(state.selectionRect.start, state.selectionRect.current);
    const selectionMeta = state.selectionRect;
    state.selectionRect = null;
    if (rect.width < 4 && rect.height < 4) {
      renderAll();
      return;
    }
    if ((selectionMeta.mode || state.selectionMode) === "layer") {
      const layer = findTopLayerInRect(rect);
      setSingleSelection(layer ? layer.id : "");
    } else {
      state.selectionRange = Object.assign({}, rect, {
        shape: selectionMeta.shape || "rect",
        window: selectionMeta.window || getActiveWindowKey(),
        viewport: selectionMeta.viewport || state.viewport,
        pageId: selectionMeta.pageId || getCurrentPage().id,
      });
      showModeToast("範囲を選択しました。コピーできます。");
    }
    renderAll();
  }

  function handleDoubleClick(event) {
    const layerNode = event.target.closest("[data-layer-id]");
    const layer = layerNode ? findLayer(layerNode.dataset.layerId) : null;
    if (!layer || (layer.type !== "text" && layer.type !== "button")) {
      return;
    }
    if (layer.type === "text") {
      event.preventDefault();
      event.stopPropagation();
      beginTextEdit(layer.id, false);
      return;
    }
    const value = prompt("テキストを入力", layer.text || "");
    if (value !== null) {
      updateSelected((selected) => {
        selected.text = value;
      });
    }
  }

  function beginTextEdit(layerId, selectAll) {
    const layer = findLayer(layerId);
    if (!layer || layer.type !== "text" || layer.locked) {
      return;
    }
    setSingleSelection(layerId);
    state.editingTextId = layerId;
    const textSelector = `.tb-layer[data-layer-id="${CSS.escape(layerId)}"] .tb-layer-text`;
    const textNode = els.canvas.querySelector(textSelector) || els.secondaryCanvas.querySelector(textSelector);
    if (!textNode) {
      renderAll();
      requestAnimationFrame(() => beginTextEdit(layerId, selectAll));
      return;
    }
    pushHistory();
    textNode.contentEditable = "true";
    textNode.spellcheck = false;
    textNode.classList.add("is-editing-text");
    textNode.addEventListener("pointerdown", stopTextEditPointer);
    textNode.addEventListener("keydown", handleTextEditKey);
    textNode.addEventListener("input", () => {
      layer.text = textNode.innerText.replace(/\n$/, "");
      markDirty();
      renderProperties();
      updateStatus();
    });
    textNode.addEventListener("blur", () => finishTextEdit(textNode, layer), { once: true });
    textNode.focus();
    if (selectAll) {
      selectNodeText(textNode);
    }
  }

  function stopTextEditPointer(event) {
    event.stopPropagation();
  }

  function handleTextEditKey(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.currentTarget.blur();
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "enter") {
      event.preventDefault();
      event.currentTarget.blur();
    }
  }

  function finishTextEdit(textNode, layer) {
    layer.text = textNode.innerText.replace(/\n$/, "") || "テキスト";
    state.editingTextId = "";
    markDirty();
    renderAll();
  }

  function selectNodeText(node) {
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function handleKeys(event) {
    if (event.key === "Escape") {
      closeToolMenus();
    }
    const activeTag = document.activeElement?.tagName;
    const inInput = activeTag === "INPUT" || activeTag === "SELECT" || activeTag === "TEXTAREA" || Boolean(document.activeElement?.isContentEditable);
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
    importImageFile(file, getCanvasPoint(event));
  }

  function handleImageFile(event) {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const size = getPageViewportSize(getCurrentPage(), state.viewport);
      importImageFile(file, { x: size.width * 0.5, y: size.height * 0.5 });
    }
    event.target.value = "";
  }

  function handlePaste(event) {
    const file = Array.from(event.clipboardData?.files || []).find((item) => item.type.startsWith("image/"));
    if (!file) {
      return;
    }
    event.preventDefault();
    const size = getPageViewportSize(getCurrentPage(), state.viewport);
    importImageFile(file, { x: size.width * 0.5, y: size.height * 0.5 });
  }

  function importImageFile(file, point) {
    showImageOpenModeDialog(file, (mode) => {
      if (mode === "window") {
        openImageInSecondaryWindow(file);
        return;
      }
      if (mode === "canvas") {
        addImageFile(file, point, "original");
      }
    });
  }

  function showImageOpenModeDialog(file, onChoose) {
    closeImageOpenModeDialog();
    const dialog = document.createElement("div");
    dialog.className = "tb-image-open-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-label", "画像の開き方");
    dialog.innerHTML = `
      <strong>画像をどう開きますか？</strong>
      <p>${escapeHtml(file.name || "画像")}</p>
      <div class="tb-image-open-actions">
        <button type="button" data-image-open-mode="canvas">現在のキャンバスに配置</button>
        <button type="button" data-image-open-mode="window">別ウィンドウで開く</button>
        <button type="button" data-image-open-mode="cancel">やめる</button>
      </div>
    `;
    document.body.appendChild(dialog);
    dialog.querySelectorAll("[data-image-open-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.dataset.imageOpenMode;
        closeImageOpenModeDialog();
        if (mode !== "cancel") {
          onChoose(mode);
        }
      });
    });
    setTimeout(() => {
      document.addEventListener("pointerdown", handleImageOpenOutside, { once: true });
    }, 0);
  }

  function closeImageOpenModeDialog() {
    document.querySelector(".tb-image-open-dialog")?.remove();
  }

  function handleImageOpenOutside(event) {
    if (!event.target.closest(".tb-image-open-dialog")) {
      closeImageOpenModeDialog();
    }
  }

  function openImageInSecondaryWindow(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || "");
      getImageNaturalSize(src).then((naturalSize) => {
        const pageId = renderer.makeId("window");
        const layerId = renderer.makeId("layer");
        const canvasSize = createReferenceCanvasSize(naturalSize);
        const layerLayout = centerLayerInCanvas(naturalSize, canvasSize);
        state.primaryPageId = state.primaryPageId || state.pageId;
        state.project.pages.push({
          id: pageId,
          name: file.name || "別ウィンドウ画像",
          desktop: { width: canvasSize.width, height: canvasSize.height },
          mobile: { width: canvasSize.width, height: canvasSize.height },
          layers: [{
            id: layerId,
            type: "image",
            name: file.name || "別ウィンドウ画像",
            src,
            visible: true,
            locked: false,
            desktop: layerLayout,
            mobile: Object.assign({}, layerLayout),
            appearance: { opacity: 1, brightness: 1, shadow: "none" },
            constraints: { keepAspect: true, keepSquare: false, keepCircle: false },
          }],
        });
        state.windowMode = "image";
        state.secondaryWindow = {
          pageId,
        };
        state.pageId = pageId;
        state.activeWindow = "secondary";
        setSingleSelection(layerId);
        markDirty();
        renderAll();
        showModeToast("画像を別ウィンドウで開きました。");
      });
    };
    reader.readAsDataURL(file);
  }

  function getImageNaturalSize(src) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        resolve({
          width: Math.max(1, image.naturalWidth || DEFAULT_DROP_SIZE.width),
          height: Math.max(1, image.naturalHeight || DEFAULT_DROP_SIZE.height),
        });
      };
      image.onerror = () => {
        resolve(DEFAULT_DROP_SIZE);
      };
      image.src = src;
    });
  }

  function createReferenceCanvasSize(size) {
    const width = Math.max(320, Math.ceil(size.width + 96));
    const height = Math.max(240, Math.ceil(size.height + 96));
    return { width, height };
  }

  function centerLayerInCanvas(layerSize, canvasSize) {
    return {
      x: Math.round((canvasSize.width - layerSize.width) / 2),
      y: Math.round((canvasSize.height - layerSize.height) / 2),
      width: layerSize.width,
      height: layerSize.height,
      rotation: 0,
    };
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
    const desktopLayout = createCenteredLayout(point, DEFAULT_DROP_SIZE.width, DEFAULT_DROP_SIZE.height);
    const mobileLayout = createResponsiveLayerLayout(desktopLayout, "desktop", "mobile", 260, 260);
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
      desktop: desktopLayout,
      mobile: mobileLayout,
      appearance: { opacity: 1, brightness: 1, shadow: "soft" },
      constraints: { keepAspect: true, keepSquare: false, keepCircle: false },
    }, { history: false });
  }

  function createResponsiveLayerLayout(sourceLayout, sourceViewport, targetViewport, targetWidth, targetHeight) {
    const sourceSize = renderer.getViewportSize(sourceViewport);
    const targetSize = renderer.getViewportSize(targetViewport);
    const centerX = (Number(sourceLayout.x) || 0) + (Number(sourceLayout.width) || 1) / 2;
    const centerY = (Number(sourceLayout.y) || 0) + (Number(sourceLayout.height) || 1) / 2;
    const xRatio = centerX / sourceSize.width;
    const yRatio = centerY / sourceSize.height;
    const width = Math.min(targetWidth, Math.max(80, targetSize.width * 0.32));
    const height = Math.min(targetHeight, Math.max(80, targetSize.height * 0.16));
    return createCenteredLayout({
      x: renderer.clamp(Math.round(targetSize.width * xRatio), width / 2, targetSize.width - width / 2),
      y: renderer.clamp(Math.round(targetSize.height * yRatio), height / 2, targetSize.height - height / 2),
    }, Math.round(width), Math.round(height));
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
    const size = getPageViewportSize(getCurrentPage(), state.viewport);
    return addLayer({
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

  function activateTextTool() {
    setTool("text");
    const current = getSelectedLayer();
    if (current?.type === "text") {
      renderAll();
      requestAnimationFrame(() => beginTextEdit(current.id, isPlaceholderTextLayer(current)));
      return;
    }
    const placeholder = getCurrentPage().layers.find((layer) => layer.type === "text" && isPlaceholderTextLayer(layer));
    if (placeholder) {
      setSingleSelection(placeholder.id);
      showModeToast("未編集のテキストレイヤーを選択しました。");
      renderAll();
      requestAnimationFrame(() => beginTextEdit(placeholder.id, true));
      return;
    }
    const id = addTextLayer();
    requestAnimationFrame(() => beginTextEdit(id, true));
  }

  function activateAnimationTool() {
    setTool("animation");
    const layer = getSelectedLayer();
    if (!layer) {
      showModeToast("動き・演出を設定するレイヤーを選択してください。");
    }
    renderAll();
  }

  function activateSoundTool() {
    setTool("sound");
    renderAll();
    showModeToast(getSoundModeLabel(state.soundMode) + "を設定できます。");
  }

  function getSoundTarget() {
    if (state.soundMode === "bgm" || els.propSoundTarget?.value === "page") {
      return getCurrentPage();
    }
    return getSelectedLayer();
  }

  function normalizeSoundMode(mode) {
    return ["bgm", "hover", "click", "show"].includes(mode) ? mode : "click";
  }

  function getSoundModeLabel(mode) {
    const labels = {
      bgm: "BGM",
      hover: "ホバー音",
      click: "クリック音",
      show: "表示音",
    };
    return labels[normalizeSoundMode(mode)];
  }

  function getNormalizedSound(sound) {
    return Object.assign({
      enabled: false,
      trigger: "click",
      fileName: "",
      src: "",
      volume: 80,
      loop: false,
    }, sound || {});
  }

  function getSoundSettings(target, mode = state.soundMode) {
    if (!target) {
      return getNormalizedSound();
    }
    const soundMode = normalizeSoundMode(mode);
    if (soundMode === "click" && target.sound && !target.sounds?.click) {
      return getNormalizedSound(target.sound);
    }
    return getNormalizedSound(target.sounds?.[soundMode]);
  }

  function updateSoundTarget(mutator) {
    const target = getSoundTarget();
    if (!target) {
      showModeToast("サウンドを設定する対象を選んでください。");
      return;
    }
    pushHistory();
    const mode = normalizeSoundMode(state.soundMode);
    target.sounds = Object.assign({}, target.sounds || {});
    target.sounds[mode] = getNormalizedSound(target.sounds[mode] || (mode === "click" ? target.sound : null));
    mutator(target.sounds[mode], target);
    target.sounds[mode].trigger = getSoundTriggerForMode(mode);
    target.sounds[mode].enabled = Boolean(target.sounds[mode].src || target.sounds[mode].fileName);
    if (mode === "click") {
      target.sound = target.sounds[mode];
    }
    markDirty();
    renderAll();
  }

  function clearSoundTarget() {
    const target = getSoundTarget();
    if (!target) {
      return;
    }
    pushHistory();
    const mode = normalizeSoundMode(state.soundMode);
    target.sounds = Object.assign({}, target.sounds || {}, { [mode]: getNormalizedSound() });
    if (mode === "click") {
      target.sound = getNormalizedSound();
    }
    markDirty();
    renderAll();
    showModeToast(`${getSoundModeLabel(mode)}を外しました。`);
  }

  function handleSoundFile(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateSoundTarget((sound) => {
        sound.enabled = true;
        sound.fileName = file.name;
        sound.src = String(reader.result || "");
        sound.trigger = getSoundTriggerForMode(state.soundMode);
        sound.volume = renderer.clamp(Number(els.propSoundVolume.value) || 80, 0, 100);
        sound.loop = Boolean(els.propSoundLoop.checked);
      });
      showModeToast(`${file.name} を${getSoundModeLabel(state.soundMode)}に設定しました。`);
    };
    reader.readAsDataURL(file);
  }

  function getSoundTriggerForMode(mode) {
    const soundMode = normalizeSoundMode(mode);
    if (soundMode === "hover") {
      return "hover";
    }
    if (soundMode === "bgm" || soundMode === "show") {
      return "load";
    }
    return "click";
  }

  function isPlaceholderTextLayer(layer) {
    return layer.type === "text" && (layer.text || "") === "テキスト" && (layer.name || "") === "メッセージ";
  }

  function addImageButtonLayer(template) {
    const activeViewport = getActiveViewportKey();
    const page = getCurrentPage();
    const size = getPageViewportSize(page, activeViewport);
    const desktopSize = getPageViewportSize(page, "desktop");
    const mobileSize = getPageViewportSize(page, "mobile");
    const width = 260;
    const height = 82;
    const layout = createCenteredLayout({ x: size.width / 2, y: size.height / 2 }, width, height);
    const desktopLayout = activeViewport === "desktop"
      ? layout
      : createCenteredLayout({ x: desktopSize.width / 2, y: desktopSize.height / 2 }, width, height);
    const mobileLayout = activeViewport === "mobile"
      ? layout
      : createCenteredLayout({ x: mobileSize.width / 2, y: mobileSize.height / 2 }, width, height);
    const id = addLayer({
      type: "image",
      role: "button",
      name: template.label,
      fileName: template.fileName,
      src: template.src,
      originalSrc: template.src,
      link: "#back",
      clickAction: { type: "page", target: "#back" },
      desktop: desktopLayout,
      mobile: mobileLayout,
      visibilityMode: "both",
      appearance: { opacity: 1, brightness: 1, shadow: "none" },
      hitArea: { enabled: true, visible: true, x: 0, y: 0, width, height },
      constraints: { keepAspect: true, keepSquare: false, keepCircle: false },
    });
    syncHitAreaToLayer(findLayer(id));
    showModeToast(`${template.label} を配置しました。クリック動作で移動先を設定できます。`);
  }

  function addButtonLayer() {
    const size = getPageViewportSize(getCurrentPage(), getActiveViewportKey());
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
    const size = getPageViewportSize(getCurrentPage(), state.viewport);
    addLayer({
      type: "button",
      name: "自分メモ",
      role: "memo",
      text: "自分メモ",
      desktop: createCenteredLayout({ x: size.width / 2, y: size.height / 2 }, 420, 170),
      mobile: createCenteredLayout({ x: size.width / 2, y: size.height / 2 }, 560, 210),
      appearance: { opacity: 1, brightness: 1, shadow: "soft" },
      constraints: { keepAspect: false, keepSquare: false, keepCircle: false },
    });
  }

  function addMemoAtPoint(point, viewport) {
    const viewportKey = viewport === "mobile" ? "mobile" : "desktop";
    const memoWidth = viewportKey === "mobile" ? 360 : 300;
    const memoHeight = viewportKey === "mobile" ? 136 : 112;
    const layout = createCenteredLayout(point, memoWidth, memoHeight);
    const size = renderer.getViewportSize(viewportKey);
    layout.x = Math.max(0, Math.min(size.width - memoWidth, layout.x));
    layout.y = Math.max(0, Math.min(size.height - memoHeight, layout.y));
    const inactiveSize = renderer.getViewportSize(viewportKey === "mobile" ? "desktop" : "mobile");
    const inactiveLayout = createCenteredLayout({ x: inactiveSize.width / 2, y: inactiveSize.height / 2 }, memoWidth, memoHeight);
    const id = addLayer({
      type: "text",
      name: "自分メモ",
      role: "memo",
      text: "自分メモ",
      desktop: viewportKey === "desktop" ? layout : inactiveLayout,
      mobile: viewportKey === "mobile" ? layout : inactiveLayout,
      style: {
        fontSize: viewportKey === "mobile" ? 34 : 28,
        color: "#3f3510",
        align: "center",
        weight: 800,
        fontFamily: '"Noto Sans JP", "Yu Gothic", sans-serif',
      },
      appearance: { opacity: 1, brightness: 1, shadow: "soft" },
      constraints: { keepAspect: false, keepSquare: false, keepCircle: false },
    });
    setTool("move");
    requestAnimationFrame(() => beginTextEdit(id, true));
  }

  function activateMarkupLayer() {
    const page = getCurrentPage();
    const existing = page.layers.find((layer) => layer.role === "markup");
    if (existing) {
      setSingleSelection(existing.id);
      keepMarkupLayersOnTop(page);
      renderAll();
      showModeToast("指示メモレイヤーを選択しました。");
      return;
    }
    addBubbleGroup();
    showModeToast("指示メモレイヤーを作成しました。");
  }

  function addShapeLayer(shapeType) {
    const size = getPageViewportSize(getCurrentPage(), state.viewport);
    const square = ["ellipse", "rect", "roundRect", "diamond"].includes(shapeType);
    addLayer({
      type: "shape",
      name: getShapeName(shapeType),
      shape: {
        type: shapeType,
        fill: shapeType === "marker" ? "rgba(255, 214, 86, 0.42)" : "rgba(255, 246, 219, 0.18)",
        fillEnabled: !["line", "pen"].includes(shapeType),
        stroke: shapeType === "pen" ? "#fff6db" : "#2f8cff",
        strokeEnabled: true,
        strokeWidth: shapeType === "marker" ? 18 : 4,
      },
      desktop: createCenteredLayout({ x: size.width / 2, y: size.height / 2 }, shapeType === "line" ? 420 : 220, square ? 220 : 140),
      mobile: createCenteredLayout({ x: size.width / 2, y: size.height / 2 }, shapeType === "line" ? 520 : 280, square ? 280 : 180),
      appearance: { opacity: 1, brightness: 1, shadow: "none" },
      constraints: { keepAspect: false, keepSquare: false, keepCircle: false },
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
    const page = getCurrentPage();
    page.layers.push(layer);
    keepMarkupLayersOnTop(page);
    setSingleSelection(layer.id);
    markDirty();
    renderAll();
    return layer.id;
  }

  function getButtonTemplateLabel(fileName) {
    const base = String(fileName || "").replace(/\.[^.]+$/, "");
    if (base.startsWith("back_buttan")) {
      return `戻る ${base.replace("back_buttan", "").replace(/^_/, "").toUpperCase() || "1"}`;
    }
    if (base.startsWith("forest_go_buttan")) {
      return `森へ ${base.replace("forest_go_buttan", "").replace(/^_/, "").toUpperCase() || "1"}`;
    }
    if (base.startsWith("buttan_k")) {
      return `角丸 ${base.replace("buttan_k", "")}`;
    }
    if (base.startsWith("buttan_m")) {
      return `丸型 ${base.replace("buttan_m", "")}`;
    }
    return base;
  }

  function addLayerToPage(page, seed, options) {
    if (!page) {
      return "";
    }
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
    page.layers.push(layer);
    keepMarkupLayersOnTop(page);
    state.pageId = page.id;
    setSingleSelection(layer.id);
    markDirty();
    renderAll();
    return layer.id;
  }

  function keepMarkupLayersOnTop(page = getCurrentPage()) {
    const regular = [];
    const markup = [];
    (page.layers || []).forEach((layer) => {
      if (layer.role === "markup") {
        markup.push(layer);
      } else {
        regular.push(layer);
      }
    });
    page.layers = regular.concat(markup);
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

  function applyFillTool(event, layerId = "") {
    if (state.preview) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (state.windowMode === "image" || state.windowMode === "pc-mobile") {
      const canvas = event.target.closest(".tb-canvas");
      if (canvas === els.secondaryCanvas) {
        activateSecondaryWindow();
      } else {
        activatePrimaryWindow();
      }
    }
    const viewport = getCanvasViewportFromEvent(event);
    const page = getCurrentPage();
    const range = getFillableSelectionRange(page, viewport);
    if (range) {
      createFillLayerForRange(page, range, event);
      return;
    }
    const point = getCanvasPoint(event);
    const targetLayer = layerId ? findLayer(layerId) : getSelectedLayer() || findLayerAtPoint(point);
    if (!targetLayer) {
      showModeToast("塗りつぶし: 先に選択範囲かレイヤーを選んでください。", { event });
      return;
    }
    fillLayerArea(page, targetLayer, viewport, event);
  }

  function getFillableSelectionRange(page, viewport) {
    const range = state.selectionRange;
    if (!range || !page || range.pageId !== page.id || range.viewport !== viewport || range.width < 4 || range.height < 4) {
      return null;
    }
    return getValidSelectionRange();
  }

  function getFillToolColor() {
    return normalizeHexColor(els.propFillColor?.value) || normalizeHexColor(getActiveColor()) || "#fff6db";
  }

  function getFillToolOpacity() {
    return renderer.clamp(Number(state.fillOpacity) || 100, 0, 100) / 100;
  }

  function createFillLayerForRange(page, range, event) {
    const color = getFillToolColor();
    const opacity = getFillToolOpacity();
    const layout = createRangeLayout(range);
    state.selectionRange = null;
    state.selectionRect = null;
    addLayerToPage(page, {
      type: "shape",
      role: "fill",
      name: range.shape === "ellipse" ? "楕円範囲の塗り" : "選択範囲の塗り",
      shape: {
        type: range.shape === "ellipse" ? "ellipse" : "rect",
        fill: color,
        fillEnabled: true,
        stroke: "none",
        strokeEnabled: false,
        strokeWidth: 0,
      },
      desktop: range.viewport === "desktop" ? layout : createHiddenViewportLayout(range),
      mobile: range.viewport === "mobile" ? layout : createHiddenViewportLayout(range),
      visibilityMode: range.viewport === "mobile" ? "mobile" : "desktop",
      appearance: { opacity, brightness: 1, shadow: "none" },
      constraints: { keepAspect: false, keepSquare: false, keepCircle: range.shape === "ellipse" },
    });
    showModeToast("選択範囲を塗りつぶしました。", { event });
  }

  function fillLayerArea(page, layer, viewport, event) {
    const color = getFillToolColor();
    const opacity = getFillToolOpacity();
    if (layer.type === "shape") {
      pushHistory();
      layer.shape = Object.assign({}, layer.shape || {}, {
        fill: color,
        fillEnabled: true,
      });
      layer.appearance = Object.assign({}, renderer.getAppearance(layer), { opacity });
      setSingleSelection(layer.id);
      markDirty();
      renderAll();
      showModeToast("図形の内側を塗りつぶしました。", { event });
      return;
    }
    const layout = Object.assign({}, renderer.getLayerLayout(layer, viewport));
    const shapeType = layer.shape?.type === "ellipse" ? "ellipse" : "rect";
    addLayerToPage(page, {
      type: "shape",
      role: "fill",
      name: `${layer.name || "レイヤー"} の塗り`,
      shape: {
        type: shapeType,
        fill: color,
        fillEnabled: true,
        stroke: "none",
        strokeEnabled: false,
        strokeWidth: 0,
      },
      desktop: viewport === "desktop" ? layout : Object.assign({}, layout),
      mobile: viewport === "mobile" ? layout : Object.assign({}, layout),
      visibilityMode: viewport === "mobile" ? "mobile" : "desktop",
      appearance: { opacity, brightness: 1, shadow: "none" },
      constraints: { keepAspect: false, keepSquare: false, keepCircle: shapeType === "ellipse" },
    });
    showModeToast("選択レイヤーの範囲を塗りつぶしました。", { event });
  }

  function handleSelectionRangeAction(action) {
    if (action === "clear") {
      state.selectionRange = null;
      state.selectionRect = null;
      renderAll();
      showModeToast("選択範囲を解除しました。");
      return;
    }
    if (!state.selectionRange) {
      showModeToast("先に四角範囲または丸・楕円範囲をドラッグしてください。");
      return;
    }
    if (action === "copy-layer") {
      copySelectionRangeToLayer();
      return;
    }
  }

  async function copySelectionRangeToLayer() {
    const range = getValidSelectionRange();
    if (!range) {
      return;
    }
    const page = getPageById(range.pageId);
    if (!page) {
      showModeToast("選択範囲のページが見つかりません。");
      return;
    }
    try {
      const sourceCanvas = await renderScreenshotCanvas([{ page, viewport: range.viewport }]);
      const crop = document.createElement("canvas");
      crop.width = Math.max(1, Math.round(range.width));
      crop.height = Math.max(1, Math.round(range.height));
      const ctx = crop.getContext("2d");
      if (range.shape === "ellipse") {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(crop.width / 2, crop.height / 2, crop.width / 2, crop.height / 2, 0, 0, Math.PI * 2);
        ctx.clip();
      }
      ctx.drawImage(sourceCanvas, range.x, range.y, range.width, range.height, 0, 0, crop.width, crop.height);
      if (range.shape === "ellipse") {
        ctx.restore();
      }
      const src = crop.toDataURL("image/png");
      const layout = createRangeLayout(range);
      const layerId = addLayerToPage(page, {
        type: "image",
        name: range.shape === "ellipse" ? "楕円範囲コピー" : "選択範囲コピー",
        fileName: "selection_copy.png",
        src,
        desktop: range.viewport === "desktop" ? layout : createHiddenViewportLayout(range),
        mobile: range.viewport === "mobile" ? layout : createHiddenViewportLayout(range),
        visibilityMode: range.viewport === "mobile" ? "mobile" : "desktop",
        appearance: { opacity: 1, brightness: 1, shadow: "none" },
        constraints: { keepAspect: true, keepSquare: false, keepCircle: range.shape === "ellipse" },
      });
      state.selectionRange = null;
      setTool("move");
      setSingleSelection(layerId);
      renderAll();
      showModeToast("選択範囲を画像レイヤーにしました。");
    } catch (error) {
      showModeToast("範囲コピーに失敗しました。画像の読み込み元を確認してください。");
    }
  }

  function getValidSelectionRange() {
    const range = state.selectionRange;
    if (!range || range.width < 4 || range.height < 4) {
      showModeToast("先に四角範囲または丸・楕円範囲をドラッグしてください。");
      return null;
    }
    return Object.assign({}, range, {
      x: Math.round(range.x),
      y: Math.round(range.y),
      width: Math.max(1, Math.round(range.width)),
      height: Math.max(1, Math.round(range.height)),
      viewport: range.viewport === "mobile" ? "mobile" : "desktop",
      shape: range.shape === "ellipse" ? "ellipse" : "rect",
    });
  }

  function createRangeLayout(range) {
    return {
      x: Math.round(range.x),
      y: Math.round(range.y),
      width: Math.max(1, Math.round(range.width)),
      height: Math.max(1, Math.round(range.height)),
      rotation: 0,
    };
  }

  function createHiddenViewportLayout(range) {
    return {
      x: Math.round(range.x),
      y: Math.round(range.y),
      width: Math.max(1, Math.round(range.width)),
      height: Math.max(1, Math.round(range.height)),
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

  function resizeLayerFromHandle(layer, handle, dx, dy, event) {
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

    const shapeType = layer.shape?.type || "";
    const shapeShortcutLock = layer.type === "shape" &&
      cornerHandle &&
      ["rect", "roundRect", "ellipse"].includes(shapeType) &&
      Boolean(event?.shiftKey || event?.ctrlKey || event?.metaKey);
    if (layer.constraints?.keepSquare || layer.constraints?.keepCircle || shapeShortcutLock) {
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
    const canvas = event.target.closest(".tb-canvas") || els.canvas;
    const rect = canvas.getBoundingClientRect();
    const viewportKey = getCanvasViewportFromEvent(event);
    const size = renderer.getViewportSize(viewportKey);
    const scaleX = rect.width / size.width;
    const scaleY = rect.height / size.height;
    return {
      x: (event.clientX - rect.left) / scaleX,
      y: (event.clientY - rect.top) / scaleY,
    };
  }

  function getCanvasViewportFromEvent(event) {
    const canvas = event.target.closest(".tb-canvas") || els.canvas;
    if (canvas === els.secondaryCanvas) {
      return state.windowMode === "pc-mobile" ? "mobile" : "desktop";
    }
    return state.windowMode === "pc-mobile" ? "desktop" : state.viewport;
  }

  function pickColorFromCanvas(event, layerId) {
    event.preventDefault();
    event.stopPropagation();
    const point = getCanvasPoint(event);
    const layer = layerId ? findLayer(layerId) : findLayerAtPoint(point);
    const color = resolveSampleColor(layer, event, point) || "#10151b";
    updateActiveColor(color);
    showModeToast(`スポイト: ${color.toUpperCase()} をメイン色にしました。`);
  }

  function findLayerAtPoint(point) {
    const layers = getCurrentPage().layers || [];
    for (let index = layers.length - 1; index >= 0; index -= 1) {
      const layer = layers[index];
      if (!isLayerVisibleInCurrentViewport(layer)) {
        continue;
      }
      const layout = getCurrentLayout(layer);
      if (!layout) {
        continue;
      }
      if (
        point.x >= layout.x &&
        point.x <= layout.x + layout.width &&
        point.y >= layout.y &&
        point.y <= layout.y + layout.height
      ) {
        return layer;
      }
    }
    return null;
  }

  function resolveSampleColor(layer, event, point) {
    const pixelColor = sampleImagePixel(layer, event, point);
    if (pixelColor) {
      return pixelColor;
    }
    if (!layer) {
      return "#10151b";
    }
    if (layer.type === "text") {
      return normalizeHexColor(layer.style?.color) || "#fff6db";
    }
    if (layer.type === "shape") {
      return normalizeHexColor(layer.shape?.fill) || normalizeHexColor(layer.shape?.stroke) || "#51c4f0";
    }
    if (layer.type === "button") {
      return normalizeHexColor(layer.style?.background) || normalizeHexColor(layer.style?.color) || "#fff6db";
    }
    return normalizeHexColor(layer.style?.background) || "#10151b";
  }

  function sampleImagePixel(layer, event, point) {
    if (!layer || layer.type !== "image" || !getLayerImageSource(layer, state.viewport)) {
      return "";
    }
    const image = event.target.closest(".tb-layer")?.querySelector("img");
    if (!image || !image.complete || !image.naturalWidth || !image.naturalHeight) {
      return "";
    }
    const layout = getCurrentLayout(layer);
    const x = renderer.clamp(Math.floor(((point.x - layout.x) / Math.max(1, layout.width)) * image.naturalWidth), 0, image.naturalWidth - 1);
    const y = renderer.clamp(Math.floor(((point.y - layout.y) / Math.max(1, layout.height)) * image.naturalHeight), 0, image.naturalHeight - 1);
    const sampler = document.createElement("canvas");
    sampler.width = image.naturalWidth;
    sampler.height = image.naturalHeight;
    const context = sampler.getContext("2d", { willReadFrequently: true });
    try {
      context.drawImage(image, 0, 0);
      const [red, green, blue, alpha] = context.getImageData(x, y, 1, 1).data;
      if (alpha === 0) {
        return "";
      }
      return rgbToHex(red, green, blue);
    } catch (_error) {
      return "";
    }
  }

  function rgbToHex(red, green, blue) {
    return `#${[red, green, blue].map((value) => Number(value).toString(16).padStart(2, "0")).join("")}`;
  }

  function getNormalizedRect(start, end) {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    return {
      x,
      y,
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
    };
  }

  function findTopLayerInRect(selectionRect) {
    const layers = getCurrentPage().layers || [];
    for (let index = layers.length - 1; index >= 0; index -= 1) {
      const layer = layers[index];
      if (!isLayerVisibleInCurrentViewport(layer) || layer.locked || layer.role === "background") {
        continue;
      }
      const layout = getCurrentLayout(layer);
      const layerRect = {
        x: Number(layout.x) || 0,
        y: Number(layout.y) || 0,
        width: Math.max(1, Number(layout.width) || 1),
        height: Math.max(1, Number(layout.height) || 1),
      };
      if (rectsIntersect(selectionRect, layerRect)) {
        return layer;
      }
    }
    return null;
  }

  function isLayerVisibleInCurrentViewport(layer) {
    if (!layer || layer.visible === false || layer.visibilityMode === "hidden") {
      return false;
    }
    const viewport = getActiveViewportKey();
    if (layer.visibilityMode === "desktop") {
      return viewport === "desktop";
    }
    if (layer.visibilityMode === "mobile") {
      return viewport === "mobile";
    }
    return true;
  }

  function rectsIntersect(a, b) {
    return a.x < b.x + b.width
      && a.x + a.width > b.x
      && a.y < b.y + b.height
      && a.y + a.height > b.y;
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

  function updateSelectedShape(mutator) {
    updateSelected((layer) => {
      if (layer.type !== "shape") {
        return;
      }
      layer.shape = Object.assign({}, layer.shape || {});
      mutator(layer.shape, layer);
    });
  }

  function updateSelectedTextStyle(mutator) {
    updateSelected((layer) => {
      if (layer.type !== "text") {
        return;
      }
      const style = ensureViewportTextStyle(layer, getActiveViewportKey());
      mutator(style, layer);
    });
  }

  function getTextStyleForViewport(layer, viewportKey) {
    const key = renderer.getViewportKey(viewportKey);
    return Object.assign({}, DEFAULT_TEXT_STYLE, layer?.style || {}, layer?.[`${key}Style`] || {});
  }

  function getActiveTextStyle(layer) {
    return getTextStyleForViewport(layer, getActiveViewportKey());
  }

  function ensureViewportTextStyle(layer, viewportKey) {
    const key = `${renderer.getViewportKey(viewportKey)}Style`;
    layer.style = Object.assign({}, layer.style || {});
    if (!layer[key]) {
      layer[key] = Object.assign({}, layer.style);
    } else {
      layer[key] = Object.assign({}, layer[key]);
    }
    return layer[key];
  }

  function updateSelectedAnimation(mutator) {
    updateSelected((layer) => {
      layer.animation = getNormalizedAnimation(layer);
      mutator(layer.animation, layer);
    });
  }

  function getNormalizedAnimation(layer) {
    const animation = Object.assign({
      enabled: false,
      type: "none",
      trigger: "load",
      duration: 1,
      delay: 0,
      repeat: "once",
      direction: "up",
      strength: 30,
    }, layer?.animation || {});
    animation.type = ["none", "fadeIn", "fadeOut", "zoomIn", "slideIn", "pop", "float", "blink", "rotate"].includes(animation.type) ? animation.type : "none";
    animation.trigger = ["load", "click", "hover"].includes(animation.trigger) ? animation.trigger : "load";
    animation.repeat = animation.repeat === "loop" ? "loop" : "once";
    animation.direction = ["up", "down", "left", "right", "center"].includes(animation.direction) ? animation.direction : "up";
    animation.duration = renderer.clamp(Number(animation.duration) || 1, 0.1, 20);
    animation.delay = renderer.clamp(Number(animation.delay) || 0, 0, 20);
    animation.strength = renderer.clamp(Number(animation.strength) || 30, 1, 100);
    animation.enabled = animation.type !== "none" && animation.enabled !== false;
    return animation;
  }

  function updateSelectedLayers(mutator) {
    const layers = getSelectedLayers();
    if (!layers.length) {
      return;
    }
    pushHistory();
    layers.forEach((layer) => {
      mutator(layer);
      renderer.normalizeLayer(layer);
    });
    markDirty();
    renderAll();
  }

  function setSelectedOpacity(value) {
    updateSelected((layer) => {
      layer.appearance.opacity = renderer.clamp(value, 0, 100) / 100;
    });
  }

  function duplicateSelectedLayer() {
    const layers = getSelectedLayers();
    if (!layers.length) {
      return;
    }
    pushHistory();
    const page = getCurrentPage();
    const copiedIds = [];
    layers.forEach((layer) => {
      const copy = renderer.clone(layer);
      copy.id = renderer.makeId("layer");
      copy.name = `${layer.name || "レイヤー"} コピー`;
      copy.role = "";
      ["desktop", "mobile"].forEach((key) => {
        if (copy[key]) {
          copy[key].x = Math.round((copy[key].x || 0) + 24);
          copy[key].y = Math.round((copy[key].y || 0) + 24);
        }
      });
      renderer.normalizeLayer(copy);
      page.layers.push(copy);
      copiedIds.push(copy.id);
    });
    state.selectedIds = copiedIds;
    state.selectedId = copiedIds[copiedIds.length - 1] || "";
    markDirty();
    renderAll();
  }

  function alignSelectedLayer(mode) {
    const layers = getSelectedLayers();
    if (!layers.length) {
      return;
    }
    const size = getPageViewportSize(getCurrentPage(), state.viewport);
    const layouts = layers.map((layer) => getCurrentLayout(layer));
    const bounds = layouts.reduce((acc, layout) => ({
      left: Math.min(acc.left, layout.x),
      top: Math.min(acc.top, layout.y),
      right: Math.max(acc.right, layout.x + layout.width),
      bottom: Math.max(acc.bottom, layout.y + layout.height),
    }), { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });
    const target = layers.length > 1 ? bounds : { left: 0, top: 0, right: size.width, bottom: size.height };
    const centerX = (target.left + target.right) / 2;
    const centerY = (target.top + target.bottom) / 2;
    updateSelectedLayers((selected) => {
      const layout = getCurrentLayout(selected);
      if (mode === "top") {
        layout.y = Math.round(target.top);
      } else if (mode === "bottom") {
        layout.y = Math.round(target.bottom - layout.height);
      } else if (mode === "left") {
        layout.x = Math.round(target.left);
      } else if (mode === "right") {
        layout.x = Math.round(target.right - layout.width);
      } else if (mode === "v-center") {
        layout.y = Math.round(centerY - layout.height / 2);
      } else if (mode === "h-center") {
        layout.x = Math.round(centerX - layout.width / 2);
      }
    });
  }

  function setSelectedLayerState(action) {
    if (!getSelectedLayers().length) {
      return;
    }
    updateSelectedLayers((selected) => {
      if (action === "show") {
        selected.visible = true;
        selected.visibilityMode = selected.visibilityMode === "hidden" ? "both" : selected.visibilityMode || "both";
      } else if (action === "hide") {
        selected.visible = false;
        selected.visibilityMode = "hidden";
      } else if (action === "lock") {
        selected.locked = true;
      } else if (action === "unlock") {
        selected.locked = false;
      }
    });
  }

  function resetSelectedColors() {
    updateSelectedLayers((layer) => {
      layer.appearance.opacity = 1;
      layer.appearance.brightness = 1;
      if (layer.type === "text") {
        ensureViewportTextStyle(layer, getActiveViewportKey()).color = "#fff6db";
      } else if (layer.type === "button") {
        layer.style = Object.assign({}, layer.style || {}, { color: "#fff6db" });
      } else if (layer.type === "shape") {
        layer.shape = Object.assign({}, layer.shape || {}, {
          fill: "rgba(255, 246, 219, 0.18)",
          stroke: "#2f8cff",
        });
      }
    });
  }

  function applyActiveColor(target) {
    const color = getActiveColor();
    if (!getSelectedLayers().length) {
      showModeToast("レイヤーを選択してください。");
      return;
    }
    updateSelectedLayers((layer) => {
      if (layer.type === "shape") {
        layer.shape = Object.assign({}, layer.shape || {});
        if (target === "stroke") {
          layer.shape.stroke = color;
        } else {
          layer.shape.fill = color;
        }
      } else if (layer.type === "text") {
        ensureViewportTextStyle(layer, getActiveViewportKey()).color = color;
      } else if (layer.type === "button") {
        layer.style = Object.assign({}, layer.style || {});
        if (target === "stroke") {
          layer.style.borderColor = color;
        } else if (target === "background" || target === "fill") {
          layer.style.background = color;
        } else {
          layer.style.color = color;
        }
      } else if (target === "background") {
        layer.style = Object.assign({}, layer.style || {}, { background: color });
      }
    });
  }

  function getSelectedImageLayer() {
    const layer = getSelectedLayer();
    return layer?.type === "image" ? layer : null;
  }

  function replaceSelectedImageSource(scope, options = {}) {
    const layer = getSelectedImageLayer();
    if (!layer) {
      showModeToast("画像レイヤーを選択してください。");
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const src = String(reader.result || "");
        getImageNaturalSize(src).then((naturalSize) => {
          updateSelected((selected) => {
            if (selected.id !== layer.id || selected.type !== "image") {
              return;
            }
            selected.fileName = file.name;
            selected.name = selected.name || file.name;
            selected.originalSrc = selected.originalSrc || src;
            if (scope === "desktop") {
              selected.desktopSrc = src;
            } else if (scope === "mobile") {
              selected.mobileSrc = src;
            } else {
              selected.src = src;
              selected.desktopSrc = src;
              selected.mobileSrc = src;
              selected.originalSrc = src;
            }
            applyReplacementLayout(selected, scope, naturalSize);
          });
          clearImageWarnings(layer.id, scope);
          markDirty();
          autosave().then(() => updateStatus());
          const label = scope === "desktop" ? "PC画像" : scope === "mobile" ? "Mobile画像" : "PC/Mobile共通画像";
          showModeToast(`${label}を差し替えました。`);
          if (options.switchViewport === "desktop" || options.switchViewport === "mobile") {
            switchViewportAfterReplace(options.switchViewport);
          }
        });
      };
      reader.readAsDataURL(file);
    }, { once: true });
    input.click();
  }

  function switchViewportAfterReplace(viewport) {
    const nextViewport = renderer.getViewportKey(viewport);
    const primaryPage = getPrimaryPage();
    if (state.windowMode === "image") {
      suspendImageWindow();
    }
    state.windowMode = "single";
    state.windowLayout = "horizontal";
    state.secondaryWindow = null;
    state.pageId = primaryPage.id;
    state.primaryPageId = primaryPage.id;
    state.activeWindow = "primary";
    state.viewport = nextViewport;
    clearSelection();
    renderAll();
  }

  function applyReplacementLayout(layer, scope, naturalSize) {
    if (layer.role !== "background") {
      return;
    }
    const targets = scope === "all" ? ["desktop", "mobile"] : [scope];
    targets.forEach((viewportKey) => {
      const size = renderer.getViewportSize(viewportKey);
      const layout = layer[viewportKey] || {};
      layout.x = 0;
      layout.y = 0;
      layout.width = size.width;
      layout.height = size.height;
      layout.rotation = 0;
      layer[viewportKey] = layout;
    });
    layer.constraints = Object.assign({}, layer.constraints || {}, { keepAspect: false });
  }

  function rotateSelectedImage(delta) {
    updateSelected((layer) => {
      if (layer.type !== "image") {
        return;
      }
      const layout = getCurrentLayout(layer);
      layout.rotation = Math.round((Number(layout.rotation) || 0) + delta);
    });
  }

  function flipSelectedImage(axis) {
    updateSelected((layer) => {
      if (layer.type !== "image") {
        return;
      }
      if (axis === "x") {
        layer.flipX = !layer.flipX;
      } else {
        layer.flipY = !layer.flipY;
      }
    });
  }

  function restoreSelectedImageOriginalSize(layer) {
    const src = getLayerImageSource(layer, state.viewport) || layer.originalSrc;
    if (!src) {
      showModeToast("原寸サイズを確認できませんでした。");
      return;
    }
    const image = new Image();
    image.onload = () => {
      updateSelected((selected) => {
        if (selected.id !== layer.id) {
          return;
        }
        const layout = getCurrentLayout(selected);
        const centerX = layout.x + layout.width / 2;
        const centerY = layout.y + layout.height / 2;
        layout.width = image.naturalWidth;
        layout.height = image.naturalHeight;
        layout.x = Math.round(centerX - layout.width / 2);
        layout.y = Math.round(centerY - layout.height / 2);
      });
    };
    image.onerror = () => showModeToast("原寸サイズを確認できませんでした。");
    image.src = src;
  }

  function getLayerImageSource(layer, viewport) {
    if (!layer || layer.type !== "image") {
      return "";
    }
    const viewportKey = renderer.getViewportKey(viewport);
    if (viewportKey === "mobile") {
      return layer.mobileSrc || layer.src || layer.desktopSrc || "";
    }
    return layer.desktopSrc || layer.src || layer.mobileSrc || "";
  }

  function toggleLayerState(id, action) {
    const layer = findLayer(id);
    if (!layer) {
      return;
    }
    pushHistory();
    setSingleSelection(id);
    if (action === "visible") {
      const hidden = layer.visible === false || layer.visibilityMode === "hidden";
      layer.visible = hidden;
      layer.visibilityMode = hidden ? "both" : "hidden";
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
    const size = getPageViewportSize(getCurrentPage(), state.viewport);
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
    setSingleSelection(layer.id);
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
    setSingleSelection(draggedId);
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

  function deleteSelected(anchor) {
    const page = getCurrentPage();
    const ids = getSelectedIds();
    if (!ids.length) {
      return;
    }
    const layers = page.layers.filter((layer) => ids.includes(layer.id));
    const hasBackground = layers.some((layer) => layer.role === "background");
    const message = hasBackground
      ? "背景固定レイヤーを削除すると、PC/Mobile両方から背景レイヤーが消えます。削除していいですか？"
      : layers.length > 1
        ? `選択中の${layers.length}個のレイヤーを削除していいですか？`
        : `「${layers[0]?.name || layers[0]?.id || "選択中のレイヤー"}」レイヤーを削除していいですか？`;
    showLayerDeleteConfirm(message, anchor, () => performDeleteSelected(ids));
  }

  function performDeleteSelected(ids) {
    const page = getCurrentPage();
    pushHistory();
    page.layers = page.layers.filter((layer) => !ids.includes(layer.id));
    clearSelection();
    markDirty();
    renderAll();
  }

  function showLayerDeleteConfirm(message, anchor, onConfirm) {
    closeLayerDeleteConfirm();
    const popover = document.createElement("div");
    popover.className = "tb-layer-delete-confirm";
    popover.setAttribute("role", "dialog");
    popover.setAttribute("aria-label", "レイヤー削除確認");
    popover.innerHTML = `
      <p>${escapeHtml(message)}</p>
      <div>
        <button type="button" data-delete-confirm="cancel">キャンセル</button>
        <button type="button" data-delete-confirm="ok">削除</button>
      </div>
    `;
    document.body.appendChild(popover);
    const target = getDeleteConfirmAnchor(anchor);
    positionDeleteConfirm(popover, target);
    popover.querySelector('[data-delete-confirm="cancel"]').addEventListener("click", closeLayerDeleteConfirm);
    popover.querySelector('[data-delete-confirm="ok"]').addEventListener("click", () => {
      closeLayerDeleteConfirm();
      onConfirm();
    });
    setTimeout(() => {
      document.addEventListener("pointerdown", handleDeleteConfirmOutside, { once: true });
    }, 0);
  }

  function getDeleteConfirmAnchor(anchor) {
    if (anchor && typeof anchor.getBoundingClientRect === "function") {
      return anchor;
    }
    return els.layerList.querySelector(".tb-layer-row.is-selected") || els.deleteLayer;
  }

  function positionDeleteConfirm(popover, anchor) {
    const rect = anchor.getBoundingClientRect();
    const popRect = popover.getBoundingClientRect();
    const left = renderer.clamp(rect.left - popRect.width - 10, 8, window.innerWidth - popRect.width - 8);
    const top = renderer.clamp(rect.top + rect.height / 2 - popRect.height / 2, 8, window.innerHeight - popRect.height - 8);
    popover.style.left = `${Math.round(left)}px`;
    popover.style.top = `${Math.round(top)}px`;
  }

  function closeLayerDeleteConfirm() {
    document.querySelector(".tb-layer-delete-confirm")?.remove();
  }

  function handleDeleteConfirmOutside(event) {
    if (!event.target.closest(".tb-layer-delete-confirm")) {
      closeLayerDeleteConfirm();
    }
  }

  function openProjectFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    file.text().then((text) => {
      if (looksLikeHtmlDocument(text, file.name)) {
        throw new Error("not-tbalance-html");
      }
      const parsed = renderer.normalizeProject(JSON.parse(text));
      applyOpenedFileName(parsed, file.name);
      pushHistory();
      state.existingWeb.active = false;
      state.project = parsed;
      state.uiSettings = resolveUiSettings(parsed);
      state.editorMode = getStartupMode(parsed);
      syncProjectEditorSettings();
      state.pageId = parsed.pages[0].id;
      state.primaryPageId = state.pageId;
      state.windowMode = "single";
      state.windowLayout = "horizontal";
      state.secondaryWindow = null;
      state.suspendedWindow = null;
      state.activeWindow = "primary";
      state.imageWarnings = {};
      clearSelection();
      markDirty();
      renderAll();
    }).catch((error) => {
      const message = error.message === "not-tbalance-html"
        ? "これはTBalanceファイルではありません。\n既存HTML/CSS/JSページは「ファイル → 既存Webプロジェクトを開く」を使用してください。"
        : `TBalanceファイルを開けませんでした。\n.tbalance またはTBalance JSONファイルを選択してください。`;
      alert(message);
    });
    event.target.value = "";
  }

  function looksLikeHtmlDocument(text, fileName = "") {
    const lowerName = String(fileName || "").toLowerCase();
    const head = String(text || "").trimStart().slice(0, 120).toLowerCase();
    return lowerName.endsWith(".html")
      || lowerName.endsWith(".htm")
      || head.startsWith("<!doctype")
      || head.startsWith("<html");
  }

  async function createNewProject(options) {
    if (!confirm("新規プロジェクトを作成すると、現在の編集画面は閉じられます。\n\n直前の編集データは内部バックアップに保存してから新規作成します。\n続けますか？")) {
      return false;
    }
    await saveBeforeNewBackup();
    pushHistory();
    resetToBlankProject(options);
    showModeToast("直前データをバックアップして、新規キャンバスを作成しました。");
    return true;
  }

  async function closeProject() {
    if (isUntitledProject()) {
      if (confirm("このプロジェクトはまだ名前が付いていません。\n閉じる前に名前を付けて保存しますか？")) {
        const saved = saveProjectAs();
        if (!saved) {
          return;
        }
      } else if (!confirm("保存せずに閉じますか？\n直前データは内部バックアップに保存します。")) {
        return;
      }
    } else if (!confirm("現在の編集画面を閉じます。\n直前データは内部バックアップに保存します。\n本当に閉じますか？")) {
      return;
    }
    await saveBeforeNewBackup();
    pushHistory();
    resetToBlankProject();
    showModeToast("直前データをバックアップして、編集画面を閉じました。");
  }

  function resetToBlankProject(options) {
    state.existingWeb.active = false;
    state.project = renderer.createBlankProject(options);
    state.project.name = options?.name || "未命名";
    if (state.project.pages?.[0]) {
      state.project.pages[0].name = options?.pageName || options?.name || "未命名";
    }
    state.uiSettings = resolveUiSettings(state.project);
    state.editorMode = getStartupMode(state.project);
    syncProjectEditorSettings();
    state.pageId = state.project.pages[0].id;
    state.primaryPageId = state.pageId;
    state.viewport = options?.activeViewport === "mobile" ? "mobile" : "desktop";
    state.windowMode = "single";
    state.windowLayout = "horizontal";
    state.secondaryWindow = null;
    state.suspendedWindow = null;
    state.activeWindow = "primary";
    state.imageWarnings = {};
    clearSelection();
    state.dirty = false;
    renderAll();
  }

  function applyOpenedFileName(project, fileName) {
    const title = getProjectTitleFromFileName(fileName);
    if (!title) {
      return;
    }
    project.name = title;
    if (project.pages?.[0]) {
      project.pages[0].name = title;
    }
  }

  function getProjectTitleFromFileName(fileName) {
    return String(fileName || "")
      .replace(/\.tbalance(?:\.json)?$/i, "")
      .replace(/\.json$/i, "")
      .trim();
  }

  function downloadProject(kind) {
    syncProjectEditorSettings();
    const project = renderer.normalizeProject(state.project);
    const payload = JSON.stringify(project, null, 2);
    const baseName = sanitizeFileName(project.name || project.pages?.[0]?.name || "TeaMerry");
    downloadBlob(payload, kind === "json" ? `${baseName}.tbalance.json` : `${baseName}.tbalance`, "application/json");
    state.dirty = false;
    renderAll();
  }

  function sanitizeFileName(value) {
    const name = String(value || "TeaMerry").trim().replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_");
    return name || "TeaMerry";
  }

  function saveProjectAs() {
    const name = prompt("保存ファイル名", getProjectBaseName());
    if (name === null) {
      return false;
    }
    const baseName = normalizeDownloadBaseName(name || "TeaMerry");
    syncProjectEditorSettings();
    const project = renderer.normalizeProject(state.project);
    project.name = baseName;
    if (project.pages?.[0]) {
      project.pages[0].name = baseName;
    }
    downloadBlob(JSON.stringify(project, null, 2), `${baseName}.tbalance`, "application/json");
    state.project.name = baseName;
    if (state.project.pages?.[0]) {
      state.project.pages[0].name = baseName;
    }
    state.dirty = false;
    renderAll();
    return true;
  }

  function exportStandaloneHtml() {
    const name = prompt("HTML書き出しファイル名", `${getProjectBaseName()}_export`);
    if (name === null) {
      return;
    }
    const html = buildStandaloneExportHtml(renderer.normalizeProject(state.project));
    downloadBlob(html, `${normalizeDownloadBaseName(name || "TBalance_export")}.html`, "text/html");
    showModeToast("HTMLを書き出しました。");
  }

  async function captureCanvasScreenshot() {
    try {
      const page = getPrimaryPage() || getCurrentPage();
      if (!page) {
        return;
      }
      const captures = getScreenshotTargets(page);
      const canvas = await renderScreenshotCanvas(captures);
      canvas.toBlob((blob) => {
        if (!blob) {
          alert("スクリーンショットを作成できませんでした。");
          return;
        }
        const suffix = captures.length > 1 ? "pc_mobile" : captures[0].viewport;
        const fileName = `${getProjectBaseName()}_${suffix}_screenshot.png`;
        downloadBlob(blob, fileName, "image/png");
        showModeToast("キャンバスのスクリーンショットを保存しました。");
      }, "image/png");
    } catch (error) {
      alert(`スクリーンショットを作成できませんでした。\n${error.message}`);
    }
  }

  function getScreenshotTargets(page) {
    if (state.windowMode === "pc-mobile") {
      return [
        { page, viewport: "desktop" },
        { page, viewport: "mobile" },
      ];
    }
    return [{ page, viewport: state.viewport }];
  }

  async function renderScreenshotCanvas(targets, options = {}) {
    const gap = targets.length > 1 ? 48 : 0;
    const sizes = targets.map((target) => getPageViewportSize(target.page, target.viewport));
    const horizontal = state.windowLayout !== "vertical";
    const width = horizontal
      ? sizes.reduce((sum, size) => sum + size.width, 0) + gap * Math.max(0, targets.length - 1)
      : Math.max(...sizes.map((size) => size.width));
    const height = horizontal
      ? Math.max(...sizes.map((size) => size.height))
      : sizes.reduce((sum, size) => sum + size.height, 0) + gap * Math.max(0, targets.length - 1);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#10151b";
    ctx.fillRect(0, 0, width, height);
    let offsetX = 0;
    let offsetY = 0;
    for (let index = 0; index < targets.length; index += 1) {
      const target = targets[index];
      const size = sizes[index];
      await drawPageToContext(ctx, target.page, target.viewport, offsetX, offsetY, options);
      if (horizontal) {
        offsetX += size.width + gap;
      } else {
        offsetY += size.height + gap;
      }
    }
    return canvas;
  }

  function getPageViewportSize(page, viewport) {
    const fallback = renderer.getViewportSize(viewport);
    return Object.assign({}, fallback, page?.[renderer.getViewportKey(viewport)] || {});
  }

  async function drawPageToContext(ctx, page, viewport, offsetX, offsetY, options = {}) {
    const key = renderer.getViewportKey(viewport);
    const size = getPageViewportSize(page, key);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.fillStyle = getStageCanvasFill(page);
    ctx.fillRect(0, 0, size.width, size.height);
    ctx.beginPath();
    ctx.rect(0, 0, size.width, size.height);
    ctx.clip();
    const layers = (page.layers || []).slice().sort((a, b) => getScreenshotLayerRank(a) - getScreenshotLayerRank(b));
    for (const layer of layers) {
      if (options.excludeLayerIds?.includes(layer.id) || options.excludeRoles?.includes(layer.role)) {
        continue;
      }
      if (!isScreenshotLayerVisible(layer, key)) {
        continue;
      }
      try {
        await drawLayerToContext(ctx, layer, key);
      } catch (error) {
        if (!options.skipBrokenLayers) {
          throw error;
        }
      }
    }
    ctx.restore();
  }

  function getStageCanvasFill(page) {
    const stage = renderer.normalizeStage(page?.stage);
    if (stage.backgroundType === "white") {
      return "#ffffff";
    }
    if (stage.backgroundType === "solid") {
      return stage.backgroundColor || "#ffffff";
    }
    return "#10151b";
  }

  function getScreenshotLayerRank(layer) {
    if (layer?.role === "background") {
      return 0;
    }
    if (layer?.role === "markup") {
      return 2;
    }
    return 1;
  }

  function isScreenshotLayerVisible(layer, viewport) {
    if (layer.visible === false || layer.visibilityMode === "hidden") {
      return false;
    }
    if (layer.visibilityMode === "desktop") {
      return viewport === "desktop";
    }
    if (layer.visibilityMode === "mobile") {
      return viewport === "mobile";
    }
    return true;
  }

  async function drawLayerToContext(ctx, layer, viewport) {
    const layout = renderer.getLayerLayout(layer, viewport);
    const appearance = renderer.getAppearance(layer);
    ctx.save();
    ctx.translate(layout.x + layout.width / 2, layout.y + layout.height / 2);
    ctx.rotate((Number(layout.rotation) || 0) * Math.PI / 180);
    ctx.scale(layer.flipX ? -1 : 1, layer.flipY ? -1 : 1);
    ctx.globalAlpha = renderer.clamp(appearance.opacity ?? 1, 0, 1);
    ctx.filter = `brightness(${Number(appearance.brightness || 1)})`;
    if (appearance.shadow && appearance.shadow !== "none") {
      ctx.shadowColor = colorToCanvasShadow(appearance.shadowColor || "#000000", appearance.shadowOpacity ?? 38);
      ctx.shadowBlur = appearance.shadowType === "solid" ? 0 : Number(appearance.shadowSize ?? 16);
      ctx.shadowOffsetX = Math.round(Number(appearance.shadowSize ?? 16) / 3);
      ctx.shadowOffsetY = Math.round(Number(appearance.shadowSize ?? 16) / 3);
    }
    const x = -layout.width / 2;
    const y = -layout.height / 2;
    if (layer.type === "text") {
      drawTextLayer(ctx, layer, viewport, x, y, layout.width, layout.height);
    } else if (layer.type === "button") {
      drawButtonLayer(ctx, layer, x, y, layout.width, layout.height);
    } else if (layer.type === "shape") {
      drawShapeLayer(ctx, layer, x, y, layout.width, layout.height);
    } else {
      await drawImageLayer(ctx, layer, viewport, x, y, layout.width, layout.height);
    }
    ctx.restore();
  }

  function colorToCanvasShadow(color, opacity) {
    const alpha = renderer.clamp(Number(opacity ?? 38) / 100, 0, 1);
    const hex = cssColorToHex(color || "#000000") || "#000000";
    const value = hex.replace("#", "");
    return `rgba(${parseInt(value.slice(0, 2), 16)}, ${parseInt(value.slice(2, 4), 16)}, ${parseInt(value.slice(4, 6), 16)}, ${alpha})`;
  }

  async function drawImageLayer(ctx, layer, viewport, x, y, width, height) {
    const src = getLayerImageSource(layer, viewport);
    if (!src) {
      return;
    }
    const img = await loadScreenshotImage(src);
    if (Array.isArray(layer.stamps) && layer.stamps.length) {
      await drawCloneStampLayer(ctx, layer, viewport, x, y);
      return;
    }
    if (layer.crop) {
      const crop = layer.crop;
      ctx.drawImage(
        img,
        Number(crop.x) || 0,
        Number(crop.y) || 0,
        Math.max(1, Number(crop.width) || img.naturalWidth || img.width || 1),
        Math.max(1, Number(crop.height) || img.naturalHeight || img.height || 1),
        x,
        y,
        width,
        height,
      );
      return;
    }
    const imageRatio = img.naturalWidth / img.naturalHeight;
    const boxRatio = width / height;
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
    ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
  }

  async function drawCloneStampLayer(ctx, layer, viewport, x, y) {
    const key = renderer.getViewportKey(viewport);
    for (const stamp of layer.stamps || []) {
      if (stamp.viewport && stamp.viewport !== key) {
        continue;
      }
      if (!stamp.src || !stamp.source || !stamp.destination) {
        continue;
      }
      const img = await loadScreenshotImage(stamp.src);
      const source = stamp.source;
      const destination = stamp.destination;
      const destX = x + (Number(destination.x) || 0);
      const destY = y + (Number(destination.y) || 0);
      const destWidth = Math.max(1, Number(destination.width) || 1);
      const destHeight = Math.max(1, Number(destination.height) || 1);
      const useRoundTip = stamp.tip !== "square";
      if (useRoundTip) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(destX + destWidth / 2, destY + destHeight / 2, destWidth / 2, destHeight / 2, 0, 0, Math.PI * 2);
        ctx.clip();
      }
      ctx.drawImage(
        img,
        Number(source.x) || 0,
        Number(source.y) || 0,
        Math.max(1, Number(source.width) || img.naturalWidth || img.width || 1),
        Math.max(1, Number(source.height) || img.naturalHeight || img.height || 1),
        destX,
        destY,
        destWidth,
        destHeight,
      );
      if (useRoundTip) {
        ctx.restore();
      }
    }
  }

  function loadScreenshotImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("画像を読み込めませんでした。"));
      img.src = src;
    });
  }

  function drawTextLayer(ctx, layer, viewport, x, y, width, height) {
    const style = getTextStyleForViewport(layer, viewport);
    ctx.font = `${style.italic ? "italic " : ""}${Number(style.weight || 600)} ${Number(style.fontSize || 48)}px ${style.fontFamily || "system-ui, sans-serif"}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = style.align === "center" ? "center" : style.align === "right" ? "right" : "left";
    const lines = String(layer.text || "テキスト").split(/\r?\n/);
    const lineHeight = Number(style.fontSize || 48) * 1.24;
    const startY = y + height / 2 - ((lines.length - 1) * lineHeight) / 2;
    const textX = style.align === "center" ? x + width / 2 : style.align === "right" ? x + width : x;
    lines.forEach((line, index) => {
      const textY = startY + index * lineHeight;
      if (style.strokeEnabled && Number(style.strokeWidth || 0) > 0) {
        ctx.lineWidth = Number(style.strokeWidth || 0) * 2;
        ctx.strokeStyle = style.strokeColor || "#0b1220";
        ctx.strokeText(line, textX, textY);
      }
      ctx.fillStyle = style.color || "#fff6db";
      ctx.fillText(line, textX, textY);
    });
  }

  function drawButtonLayer(ctx, layer, x, y, width, height) {
    const style = Object.assign({ color: "#fff6db", background: "rgba(0,0,0,.34)", borderColor: "rgba(255,255,255,.75)", fontSize: 28, weight: 700 }, layer.style || {});
    drawRoundRect(ctx, x, y, width, height, height / 2);
    ctx.fillStyle = style.background;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = style.borderColor;
    ctx.stroke();
    ctx.fillStyle = style.color;
    ctx.font = `${Number(style.weight || 700)} ${Number(style.fontSize || 28)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(layer.text || "ボタン", x + width / 2, y + height / 2);
  }

  function drawShapeLayer(ctx, layer, x, y, width, height) {
    const shape = layer.shape || {};
    const type = shape.type || "rect";
    if (type === "pen" || type === "marker") {
      drawPenShapeLayer(ctx, shape, x, y, width, height);
      return;
    }
    const fillEnabled = shape.fillEnabled !== false && shape.fill !== "none";
    const strokeEnabled = shape.strokeEnabled !== false && shape.stroke !== "none" && Number(shape.strokeWidth ?? 4) > 0;
    ctx.beginPath();
    createShapePath(ctx, type, x, y, width, height, Number(shape.radius || 0));
    if (fillEnabled) {
      ctx.fillStyle = shape.fill || "#fff6db";
      ctx.fill();
    }
    if (strokeEnabled) {
      ctx.lineWidth = Number(shape.strokeWidth ?? 4);
      ctx.strokeStyle = shape.stroke || "#2f8cff";
      ctx.stroke();
    }
  }

  function drawPenShapeLayer(ctx, shape, x, y, width, height) {
    const strokes = getPenShapeStrokes(shape);
    if (!strokes.length) {
      return;
    }
    const baseAlpha = ctx.globalAlpha;
    strokes.forEach((strokeItem) => {
      const points = Array.isArray(strokeItem) ? strokeItem : strokeItem.points;
      if (!Array.isArray(points) || !points.length) {
        return;
      }
      const widthValue = Number(strokeItem.width || shape.strokeWidth || 4);
      const tip = strokeItem.tip || shape.brushTip || "round";
      ctx.lineWidth = widthValue;
      ctx.lineCap = tip === "square" ? "butt" : "round";
      ctx.lineJoin = tip === "square" ? "miter" : "round";
      ctx.strokeStyle = strokeItem.color || shape.stroke || "#fff6db";
      ctx.globalAlpha = baseAlpha * renderer.clamp(Number(strokeItem.opacity ?? 1), 0, 1);
      if (tip === "soft") {
        ctx.shadowColor = strokeItem.color || shape.stroke || "#fff6db";
        ctx.shadowBlur = Math.max(2, widthValue * 0.45);
      }
      ctx.beginPath();
      points.forEach((point, index) => {
        const px = x + (renderer.clamp(Number(point.x) || 0, 0, 100) / 100) * width;
        const py = y + (renderer.clamp(Number(point.y) || 0, 0, 100) / 100) * height;
        if (index === 0) {
          ctx.moveTo(px, py);
          return;
        }
        const previous = points[index - 1];
        const prevX = x + (renderer.clamp(Number(previous.x) || 0, 0, 100) / 100) * width;
        const prevY = y + (renderer.clamp(Number(previous.y) || 0, 0, 100) / 100) * height;
        ctx.quadraticCurveTo(prevX, prevY, (prevX + px) / 2, (prevY + py) / 2);
      });
      if (points.length === 1) {
        const point = points[0];
        const px = x + (renderer.clamp(Number(point.x) || 0, 0, 100) / 100) * width;
        const py = y + (renderer.clamp(Number(point.y) || 0, 0, 100) / 100) * height;
        ctx.lineTo(px + 0.1, py + 0.1);
      }
      ctx.stroke();
      ctx.globalAlpha = baseAlpha;
      ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = baseAlpha;
    ctx.shadowBlur = 0;
  }

  function getPenShapeStrokes(shape) {
    if (Array.isArray(shape.strokes) && shape.strokes.length) {
      return shape.strokes;
    }
    return Array.isArray(shape.points) && shape.points.length ? [shape.points] : [];
  }

  function createShapePath(ctx, type, x, y, width, height, radius) {
    if (type === "ellipse") {
      ctx.ellipse(x + width / 2, y + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, Math.PI * 2);
      return;
    }
    if (type === "triangle") {
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
      ctx.closePath();
      return;
    }
    if (type === "diamond") {
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x + width, y + height / 2);
      ctx.lineTo(x + width / 2, y + height);
      ctx.lineTo(x, y + height / 2);
      ctx.closePath();
      return;
    }
    if (type === "arrow") {
      ctx.moveTo(x, y + height * 0.38);
      ctx.lineTo(x + width * 0.62, y + height * 0.38);
      ctx.lineTo(x + width * 0.62, y + height * 0.18);
      ctx.lineTo(x + width, y + height / 2);
      ctx.lineTo(x + width * 0.62, y + height * 0.82);
      ctx.lineTo(x + width * 0.62, y + height * 0.62);
      ctx.lineTo(x, y + height * 0.62);
      ctx.closePath();
      return;
    }
    if (type === "line") {
      ctx.moveTo(x, y + height / 2);
      ctx.lineTo(x + width, y + height / 2);
      return;
    }
    drawRoundRect(ctx, x, y, width, height, type === "roundRect" ? radius : 0);
  }

  function drawRoundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(Math.abs(radius || 0), Math.abs(width) / 2, Math.abs(height) / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }

  function downloadBlob(content, fileName, type) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: `${type};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function getProjectBaseName() {
    const page = getPrimaryPage() || getCurrentPage();
    return normalizeDownloadBaseName(state.project?.name || page?.name || "TeaMerry");
  }

  function isUntitledProject() {
    const page = getPrimaryPage() || getCurrentPage();
    const name = String(state.project?.name || page?.name || "").trim();
    return !name || name === "未命名" || name === "トップページ";
  }

  function normalizeDownloadBaseName(value) {
    return String(value || "TeaMerry")
      .replace(/\.(tbalance|json|html?)$/i, "")
      .replace(/[\\/:*?"<>|]+/g, "_")
      .trim() || "TeaMerry";
  }

  function buildStandaloneExportHtml(project) {
    const page = project.pages?.[0] || renderer.normalizeProject().pages[0];
    const desktopSize = Object.assign({ width: 1920, height: 1080 }, page.desktop || {});
    const mobileSize = Object.assign({ width: 1080, height: 1920 }, page.mobile || {});
    const stageBackground = getExportStageBackground(page);
    const layersHtml = (page.layers || []).map((layer) => buildExportLayerHtml(layer)).join("\n");
    return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(page.name || "TBalance Export")}</title>
  <style>
    :root { --stage-w: ${desktopSize.width}px; --stage-h: ${desktopSize.height}px; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #05080c; color: #fff; font-family: "Noto Sans JP", system-ui, sans-serif; }
    .tb-stage { position: relative; width: min(100vw, var(--stage-w)); aspect-ratio: ${desktopSize.width} / ${desktopSize.height}; overflow: hidden; background: ${stageBackground}; }
    .tb-layer { position: absolute; overflow: hidden; transform-origin: center; }
    .tb-layer.tb-shape { overflow: visible; }
    .tb-layer.tb-hit-area { background: rgba(0, 0, 0, 0.001); }
    .tb-layer img { width: 100%; height: 100%; object-fit: contain; display: block; pointer-events: none; }
    .tb-layer-role-background img { object-fit: cover; }
    .tb-text, .tb-button { display: grid; width: 100%; height: 100%; align-items: center; white-space: pre-line; }
    .tb-button { justify-items: center; border-radius: 999px; border: 2px solid rgba(255,255,255,.75); background: rgba(0,0,0,.34); text-decoration: none; color: inherit; }
    .tb-shape svg { width: 100%; height: 100%; display: block; overflow: visible; }
    ${buildExportLayerCss(page.layers || [], "desktop")}
    @media (max-width: 720px) {
      :root { --stage-w: ${mobileSize.width}px; --stage-h: ${mobileSize.height}px; }
      .tb-stage { aspect-ratio: ${mobileSize.width} / ${mobileSize.height}; }
      ${buildExportLayerCss(page.layers || [], "mobile")}
    }
  </style>
</head>
<body>
  <main class="tb-stage" aria-label="${escapeAttr(page.name || "TBalance Export")}">
${layersHtml}
  </main>
</body>
</html>`;
  }

  function getExportStageBackground(page) {
    const stage = renderer.normalizeStage(page?.stage);
    if (stage.backgroundType === "transparent") {
      return "transparent";
    }
    if (stage.backgroundType === "white") {
      return "#ffffff";
    }
    return stage.backgroundColor || "#ffffff";
  }

  function buildExportLayerHtml(layer) {
    const visibilityClass = layer.visibilityMode === "desktop" ? " tb-only-desktop" : layer.visibilityMode === "mobile" ? " tb-only-mobile" : layer.visibilityMode === "hidden" || layer.visible === false ? " tb-hidden" : "";
    const hitAreaClass = layer.role === "hit-area" ? " tb-hit-area" : "";
    const roleClass = layer.role ? ` tb-layer-role-${escapeAttr(layer.role)}` : "";
    const className = `tb-layer tb-layer-${escapeAttr(layer.id)}${visibilityClass}${hitAreaClass}${roleClass} tb-layer-type-${escapeAttr(layer.type || "image")}`;
    const tag = layer.link ? "a" : "div";
    const href = layer.link ? ` href="${escapeAttr(layer.link)}"` : "";
    if (layer.type === "text") {
      return `    <div class="${className}"><div class="tb-text">${escapeHtml(layer.text || "")}</div></div>`;
    }
    if (layer.type === "button") {
      return `    <${tag} class="${className} tb-button"${href}>${escapeHtml(layer.text || "")}</${tag}>`;
    }
    if (layer.type === "shape") {
      return `    <${tag} class="${className} tb-shape"${href}>${buildExportShapeSvg(layer)}</${tag}>`;
    }
    const src = getLayerImageSource(layer, "desktop") || getLayerImageSource(layer, "mobile");
    return `    <${tag} class="${className}"${href}><picture>${layer.mobileSrc ? `<source media="(max-width: 720px)" srcset="${escapeAttr(layer.mobileSrc)}">` : ""}<img src="${escapeAttr(src)}" alt="${escapeAttr(layer.name || "")}"></picture></${tag}>`;
  }

  function buildExportLayerCss(layers, viewportKey) {
    return layers.map((layer, index) => {
      const layout = Object.assign({ x: 0, y: 0, width: 100, height: 100, rotation: 0 }, layer[viewportKey] || {});
      const appearance = renderer.getAppearance(layer);
      const style = getTextStyleForViewport(layer, viewportKey);
      const shape = layer.shape || {};
      return `.tb-layer-${cssEscapeIdent(layer.id)} { left: ${(layout.x || 0).toFixed(2)}px; top: ${(layout.y || 0).toFixed(2)}px; width: ${Math.max(1, layout.width || 1).toFixed(2)}px; height: ${Math.max(1, layout.height || 1).toFixed(2)}px; z-index: ${index + 1}; opacity: ${renderer.clamp(appearance.opacity ?? 1, 0, 1)}; transform: rotate(${Number(layout.rotation) || 0}deg) scale(${layer.flipX ? -1 : 1}, ${layer.flipY ? -1 : 1}); filter: brightness(${Number(appearance.brightness || 1)}); ${buildExportShadowCss(appearance)} }
      .tb-layer-${cssEscapeIdent(layer.id)}.tb-only-desktop { display: ${viewportKey === "desktop" ? "block" : "none"}; }
      .tb-layer-${cssEscapeIdent(layer.id)}.tb-only-mobile { display: ${viewportKey === "mobile" ? "block" : "none"}; }
      .tb-layer-${cssEscapeIdent(layer.id)}.tb-hidden { display: none; }
      .tb-layer-${cssEscapeIdent(layer.id)} .tb-text { color: ${style.color || "#fff6db"}; font-size: ${Number(style.fontSize || 48)}px; font-weight: ${Number(style.weight || 600)}; font-style: ${style.italic ? "italic" : "normal"}; text-decoration: ${style.underline ? "underline" : "none"}; text-align: ${style.align || "left"}; font-family: ${style.fontFamily || "system-ui, sans-serif"}; line-height: 1.22; white-space: pre-wrap; word-break: keep-all; overflow-wrap: anywhere; }
      .tb-layer-${cssEscapeIdent(layer.id)}.tb-button { color: ${style.color || "#fff6db"}; background: ${style.background || "rgba(0,0,0,.34)"}; border-color: ${style.borderColor || "rgba(255,255,255,.75)"}; font-size: ${Number(style.fontSize || 28)}px; font-weight: ${Number(style.weight || 700)}; }
      .tb-layer-${cssEscapeIdent(layer.id)} [data-shape-fill] { fill: ${layer.role === "hit-area" ? "transparent" : shape.fillEnabled === false ? "none" : shape.fill || "rgba(255,246,219,.18)"}; }
      .tb-layer-${cssEscapeIdent(layer.id)} [data-shape-stroke] { stroke: ${layer.role === "hit-area" ? "transparent" : shape.strokeEnabled === false ? "none" : shape.stroke || "#2f8cff"}; stroke-width: ${Number(shape.strokeWidth ?? 4)}; }`;
    }).join("\n");
  }

  function buildExportShadowCss(appearance) {
    if (!appearance.shadow || appearance.shadow === "none") {
      return "";
    }
    const alpha = renderer.clamp(Number(appearance.shadowOpacity ?? 38) / 100, 0, 1);
    const blur = appearance.shadowType === "solid" ? 0 : Number(appearance.shadowSize ?? 16);
    return `box-shadow: ${Math.round(Number(appearance.shadowSize ?? 16) / 3)}px ${Math.round(Number(appearance.shadowSize ?? 16) / 3)}px ${blur}px rgba(0,0,0,${alpha});`;
  }

  function buildExportShapeSvg(layer) {
    const shape = layer.shape || {};
    const type = shape.type || "rect";
    const flushToBounds = layer.role === "fill" || layer.role === "hit-area";
    if (type === "ellipse") {
      const radius = flushToBounds ? "50" : "48";
      return `<svg viewBox="0 0 100 100" preserveAspectRatio="none"><ellipse data-shape-fill data-shape-stroke cx="50" cy="50" rx="${radius}" ry="${radius}"/></svg>`;
    }
    if (type === "triangle") {
      return '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><polygon data-shape-fill data-shape-stroke points="50,4 96,96 4,96"/></svg>';
    }
    if (type === "diamond") {
      return '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><polygon data-shape-fill data-shape-stroke points="50,4 96,50 50,96 4,50"/></svg>';
    }
    if (type === "arrow") {
      return '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><path data-shape-fill data-shape-stroke d="M8 40h56V20l30 30-30 30V60H8Z"/></svg>';
    }
    if (type === "speechBubble") {
      return '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><path data-shape-fill data-shape-stroke d="M15 8 H85 Q96 8 96 20 V68 Q96 80 85 80 H57 L50 95 L43 80 H15 Q4 80 4 68 V20 Q4 8 15 8 Z"/></svg>';
    }
    if (type === "line") {
      return '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><line data-shape-stroke x1="4" y1="50" x2="96" y2="50" stroke-linecap="round"/></svg>';
    }
    if (type === "pen" || type === "marker") {
      const paths = getPenShapeStrokes(shape)
        .map((strokeItem) => {
          const points = Array.isArray(strokeItem) ? strokeItem : strokeItem.points;
          const path = buildPenExportPath(points);
          return path ? Object.assign({}, strokeItem, { path }) : null;
        })
        .filter(Boolean);
      const pathNodes = (paths.length ? paths : [{ path: "M8 62 C22 22, 38 88, 54 46 S82 18, 94 52" }])
        .map((strokeItem) => {
          const tip = strokeItem.tip || shape.brushTip || "round";
          const strokeColor = strokeItem.color || shape.stroke || "#fff6db";
          const strokeWidth = Number(strokeItem.width || shape.strokeWidth || 4);
          const strokeOpacity = renderer.clamp(Number(strokeItem.opacity ?? 1), 0, 1);
          return `<path d="${escapeAttr(strokeItem.path)}" fill="none" stroke="${escapeAttr(strokeColor)}" stroke-width="${strokeWidth}" stroke-opacity="${strokeOpacity}" stroke-linecap="${tip === "square" ? "butt" : "round"}" stroke-linejoin="${tip === "square" ? "miter" : "round"}"/>`;
        })
        .join("");
      return `<svg viewBox="0 0 100 100" preserveAspectRatio="none">${pathNodes}</svg>`;
    }
    const radius = Math.max(0, Math.min(48, Number(shape.radius ?? (type === "roundRect" ? 14 : 0))));
    const rectBounds = flushToBounds
      ? { x: 0, y: 0, size: 100 }
      : { x: 3, y: 3, size: 94 };
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="none"><rect data-shape-fill data-shape-stroke x="${rectBounds.x}" y="${rectBounds.y}" width="${rectBounds.size}" height="${rectBounds.size}" rx="${radius}" ry="${radius}"/></svg>`;
  }

  function buildPenExportPath(points) {
    if (!Array.isArray(points) || !points.length) {
      return "";
    }
    const safe = points.map((point) => ({
      x: renderer.clamp(Number(point.x) || 0, 0, 100),
      y: renderer.clamp(Number(point.y) || 0, 0, 100),
    }));
    if (safe.length === 1) {
      return `M${safe[0].x} ${safe[0].y} l0.1 0.1`;
    }
    let d = `M${safe[0].x} ${safe[0].y}`;
    for (let index = 1; index < safe.length - 1; index += 1) {
      const current = safe[index];
      const next = safe[index + 1];
      d += ` Q${current.x} ${current.y} ${(current.x + next.x) / 2} ${(current.y + next.y) / 2}`;
    }
    const last = safe[safe.length - 1];
    return `${d} L${last.x} ${last.y}`;
  }

  function cssEscapeIdent(value) {
    return String(value || "layer").replace(/[^a-zA-Z0-9_-]/g, "_");
  }

  function pushHistory() {
    state.history.push(JSON.stringify(state.project));
    if (state.history.length > HISTORY_LIMIT) {
      state.history.shift();
    }
    state.future = [];
  }

  function undo() {
    if (undoExistingWebPreview()) {
      return;
    }
    if (state.existingWeb.active) {
      return;
    }
    if (!state.history.length) {
      return;
    }
    state.future.push(JSON.stringify(state.project));
    state.project = renderer.normalizeProject(JSON.parse(state.history.pop()));
    state.pageId = state.project.pages.find((page) => page.id === state.pageId)?.id || state.project.pages[0].id;
    normalizeWindowPages();
    clearSelection();
    markDirty();
    renderAll();
  }

  function redo() {
    if (redoExistingWebPreview()) {
      return;
    }
    if (state.existingWeb.active) {
      return;
    }
    if (!state.future.length) {
      return;
    }
    state.history.push(JSON.stringify(state.project));
    state.project = renderer.normalizeProject(JSON.parse(state.future.pop()));
    state.pageId = state.project.pages.find((page) => page.id === state.pageId)?.id || state.project.pages[0].id;
    normalizeWindowPages();
    clearSelection();
    markDirty();
    renderAll();
  }

  function markDirty() {
    state.dirty = true;
  }

  async function saveBeforeNewBackup() {
    if (!state.project) {
      return;
    }
    try {
      syncProjectEditorSettings();
      const payload = JSON.stringify({
        savedAt: new Date().toISOString(),
        project: renderer.normalizeProject(state.project),
      });
      await saveProjectStoreValue(PROJECT_BEFORE_NEW_KEY, payload);
      try {
        localStorage.setItem(BEFORE_NEW_STORAGE_KEY, payload);
      } catch (error) {
        localStorage.setItem(BEFORE_NEW_STORAGE_KEY, JSON.stringify({
          savedAt: new Date().toISOString(),
          name: state.project.name || "TBalance",
          storedIn: "indexedDB",
        }));
      }
    } catch (error) {
      alert("直前データの内部バックアップに失敗しました。\n先に「保存」で .tbalance ファイルを書き出してください。");
      throw error;
    }
  }

  async function autosave() {
    try {
      syncProjectEditorSettings();
      const payload = JSON.stringify(state.project);
      await saveProjectStoreValue(PROJECT_DB_KEY, payload);
      state.autosaveStorage = "自動保存済み";
      try {
        localStorage.setItem(STORAGE_KEY, payload);
      } catch (error) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(createAutosaveSummary(state.project)));
      }
      state.autosaveError = "";
    } catch (error) {
      state.autosaveError = "自動保存できません。保存ボタンで.tbalance保存してください。";
    }
  }

  async function loadAutosave() {
    const largeAutosave = await loadLargeAutosave();
    if (largeAutosave) {
      return largeAutosave;
    }
    try {
      const text = localStorage.getItem(STORAGE_KEY);
      return text ? renderer.normalizeProject(JSON.parse(text)) : null;
    } catch (error) {
      return null;
    }
  }

  function createAutosaveSummary(project) {
    return {
      format: "tbalance",
      version: project?.version || "0.1.0",
      projectId: project?.projectId || "teamerry",
      name: project?.name || "TeaMerry",
      autosaveStoredIn: "indexedDB",
      savedAt: new Date().toISOString(),
    };
  }

  function openProjectDatabase() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("IndexedDB is not available."));
        return;
      }
      const request = window.indexedDB.open(PROJECT_DB_NAME, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(PROJECT_DB_STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("IndexedDB open failed."));
    });
  }

  async function saveLargeAutosave(payload) {
    return saveProjectStoreValue(PROJECT_DB_KEY, payload);
  }

  async function saveProjectStoreValue(key, payload) {
    try {
      const db = await openProjectDatabase();
      await new Promise((resolve, reject) => {
        const transaction = db.transaction(PROJECT_DB_STORE, "readwrite");
        transaction.objectStore(PROJECT_DB_STORE).put(payload, key);
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error || new Error("IndexedDB save failed."));
      });
      db.close();
    } catch (error) {
      state.autosaveError = "自動保存できません。保存ボタンで.tbalance保存してください。";
    }
  }

  async function loadLargeAutosave() {
    try {
      const db = await openProjectDatabase();
      const text = await new Promise((resolve, reject) => {
        const transaction = db.transaction(PROJECT_DB_STORE, "readonly");
        const request = transaction.objectStore(PROJECT_DB_STORE).get(PROJECT_DB_KEY);
        request.onsuccess = () => resolve(request.result || "");
        request.onerror = () => reject(request.error || new Error("IndexedDB load failed."));
      });
      db.close();
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

  function showModeToast(message, options = {}) {
    window.clearTimeout(showModeToast.timer);
    els.modeToast.classList.remove("is-visible");
    els.modeToast.classList.remove("is-pointer");
    els.modeToast.style.left = "";
    els.modeToast.style.top = "";
    els.modeToast.style.transition = "";
    void els.modeToast.offsetWidth;
    els.modeToast.textContent = message;
    if (options.event) {
      const margin = 12;
      const width = 280;
      const x = renderer.clamp(options.event.clientX + 16, margin, window.innerWidth - width - margin);
      const y = renderer.clamp(options.event.clientY + 16, margin, window.innerHeight - 72);
      els.modeToast.style.transition = "none";
      els.modeToast.style.left = `${x}px`;
      els.modeToast.style.top = `${y}px`;
      els.modeToast.classList.add("is-pointer");
      void els.modeToast.offsetWidth;
      els.modeToast.style.transition = "";
    } else {
      els.modeToast.style.left = "";
      els.modeToast.style.top = "";
      els.modeToast.classList.remove("is-pointer");
    }
    void els.modeToast.offsetWidth;
    els.modeToast.classList.add("is-visible");
    showModeToast.timer = window.setTimeout(() => {
      els.modeToast.classList.remove("is-visible");
      els.modeToast.classList.remove("is-pointer");
      els.modeToast.style.left = "";
      els.modeToast.style.top = "";
    }, 2600);
  }

  function getCurrentPage() {
    return state.project.pages.find((page) => page.id === state.pageId) || state.project.pages[0];
  }

  function getPrimaryPage() {
    return getPageById(state.primaryPageId) || getCurrentPage();
  }

  function getPageById(pageId) {
    return state.project.pages.find((page) => page.id === pageId) || null;
  }

  function normalizeWindowPages() {
    state.primaryPageId = getPageById(state.primaryPageId)?.id || state.pageId;
    if (state.windowMode === "image" && !getPageById(state.secondaryWindow?.pageId)) {
      state.windowMode = "single";
      state.secondaryWindow = null;
      state.activeWindow = "primary";
    }
    if (state.suspendedWindow && !getPageById(state.suspendedWindow.secondaryWindow?.pageId)) {
      state.suspendedWindow = null;
    }
    if (state.windowMode !== "image" && state.windowMode !== "pc-mobile") {
      state.activeWindow = "primary";
    }
  }

  function findLayer(id) {
    return getCurrentPage().layers.find((layer) => layer.id === id) || null;
  }

  function getSelectedIds() {
    const ids = Array.isArray(state.selectedIds) && state.selectedIds.length ? state.selectedIds : (state.selectedId ? [state.selectedId] : []);
    return ids.filter((id, index) => id && ids.indexOf(id) === index && Boolean(findLayer(id)));
  }

  function getSelectedLayers() {
    return getSelectedIds().map((id) => findLayer(id)).filter(Boolean);
  }

  function getSelectedLayer() {
    return state.selectedId ? findLayer(state.selectedId) : null;
  }

  function setSingleSelection(id) {
    state.selectedId = id || "";
    state.selectedIds = id ? expandSelectionWithGroup([id]) : [];
  }

  function clearSelection() {
    setSingleSelection("");
  }

  function toggleLayerSelection(id) {
    if (!id) {
      return;
    }
    const ids = getSelectedIds();
    if (ids.includes(id)) {
      const layer = findLayer(id);
      const groupId = layer?.groupId || "";
      const next = ids.filter((selectedId) => {
        const selectedLayer = findLayer(selectedId);
        return groupId ? selectedLayer?.groupId !== groupId : selectedId !== id;
      });
      state.selectedIds = next;
      state.selectedId = next[next.length - 1] || "";
    } else {
      state.selectedIds = expandSelectionWithGroup(ids.concat(id));
      state.selectedId = id;
    }
  }

  function expandSelectionWithGroup(ids) {
    const page = getCurrentPage();
    const expanded = new Set(ids.filter(Boolean));
    ids.forEach((id) => {
      const layer = findLayer(id);
      if (!layer?.groupId) {
        return;
      }
      (page.layers || []).forEach((candidate) => {
        if (candidate.groupId === layer.groupId) {
          expanded.add(candidate.id);
        }
      });
    });
    return Array.from(expanded);
  }

  function selectLayersBy(predicate) {
    const ids = getCurrentPage().layers
      .filter((layer) => predicate(layer))
      .map((layer) => layer.id);
    state.selectedIds = ids;
    state.selectedId = ids[ids.length - 1] || "";
    renderAll();
    showModeToast(ids.length ? `${ids.length}個のレイヤーを選択しました。` : "該当するレイヤーはありません。");
  }

  function invertSelection() {
    const current = getSelectedIds();
    const ids = getCurrentPage().layers
      .filter((layer) => layer.role !== "background" && !current.includes(layer.id))
      .map((layer) => layer.id);
    state.selectedIds = ids;
    state.selectedId = ids[ids.length - 1] || "";
    renderAll();
    showModeToast(ids.length ? `${ids.length}個のレイヤーを選択しました。` : "選択を解除しました。");
  }

  function selectLayerByOrder(direction) {
    const layers = getCurrentPage().layers.filter((layer) => layer.role !== "background");
    const layer = direction === "front" ? layers[layers.length - 1] : layers[0];
    setSingleSelection(layer?.id || "");
    renderAll();
    showModeToast(layer ? `${layer.name || layer.id} を選択しました。` : "選択できるレイヤーはありません。");
  }

  function getCurrentLayout(layer) {
    return layer[getActiveViewportKey()];
  }

  function getActiveViewportKey() {
    if (state.windowMode === "pc-mobile") {
      return getActiveWindowKey() === "secondary" ? "mobile" : "desktop";
    }
    return state.viewport;
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
    if (layer.groupId) {
      return '<span class="tb-layer-group-badge" title="グループ" aria-label="グループ">G</span>';
    }
    if (layer.role === "markup") {
      return getMarkupViewportBadge(layer);
    }
    if (layer.role === "hit-area" || layer.hitArea?.enabled) {
      return '<span class="tb-hit-area-badge" title="当たり判定" aria-label="当たり判定"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v4M12 16v4M4 12h4M16 12h4"/><circle cx="12" cy="12" r="4.2"/><path d="M12 12l4.8 4.8"/></svg></span>';
    }
    if (layer.role !== "background") {
      return "";
    }
    return '<span class="tb-background-badge" title="背景固定" aria-label="背景固定"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M7 15l3-3 2 2 3-4 2 5"/><path d="M9 3h6"/></svg></span>';
  }

  function getMarkupViewportBadge(layer) {
    const mode = layer.visibilityMode || "both";
    if (mode === "desktop") {
      return '<span class="tb-markup-viewport-badge tb-markup-viewport-badge--pc" title="PC用の赤ペン指示" aria-label="PC用の赤ペン指示">PC</span>';
    }
    if (mode === "mobile") {
      return '<span class="tb-markup-viewport-badge tb-markup-viewport-badge--mobile" title="Mobile用の赤ペン指示" aria-label="Mobile用の赤ペン指示">Mob</span>';
    }
    if (mode === "hidden" || layer.visible === false) {
      return '<span class="tb-markup-viewport-badge tb-markup-viewport-badge--hidden" title="非表示の赤ペン指示" aria-label="非表示の赤ペン指示">OFF</span>';
    }
    return '<span class="tb-markup-viewport-badge tb-markup-viewport-badge--both" title="PC/Mobile共通の赤ペン指示" aria-label="PC/Mobile共通の赤ペン指示">共通</span>';
  }

  function getLayerWarningBadge(layer) {
    if (!hasImageWarning(layer)) {
      return "";
    }
    return '<span class="tb-layer-warning-badge" title="画像を表示できません" aria-label="画像を表示できません">!</span>';
  }

  function getLayerSoundBadge(layer) {
    if (!hasAnySound(layer)) {
      return "";
    }
    return '<span class="tb-layer-list-sound-badge" title="サウンド設定あり" aria-label="サウンド設定あり">♪</span>';
  }

  function hasAnySound(target) {
    if (!target) {
      return false;
    }
    const sounds = Object.assign({}, target.sounds || {});
    if (target.sound && !sounds.click) {
      sounds.click = target.sound;
    }
    return Object.values(sounds).some((sound) => Boolean(sound?.enabled && (sound.src || sound.fileName)));
  }

  function hasImageWarning(layer) {
    if (!layer || layer.type !== "image") {
      return false;
    }
    return !getLayerImageSource(layer, state.viewport) || Boolean(state.imageWarnings[getImageWarningKey(layer.id, state.viewport)]);
  }

  function createThumbHtml(layer) {
    const imageSrc = getLayerImageSource(layer, state.viewport);
    if (layer.type === "image" && imageSrc) {
      return `<img src="${escapeAttr(imageSrc)}" alt="">`;
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
