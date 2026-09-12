(function () {
  "use strict";

  const renderer = window.TBalanceRenderer;
  const STORAGE_KEY = "tbalance.autosave.v0.1";
  const BEFORE_NEW_STORAGE_KEY = "tbalance.beforeNewBackup.v0.1";
  const UI_SETTINGS_KEY = "tbalance.uiSettings.v0.1";
  const RUNTIME_STATE_KEY = "tbalance.runtimeState.v0.1";
  const PROJECT_DB_NAME = "tbalance-project-store";
  const PROJECT_DB_STORE = "projects";
  const PROJECT_DB_KEY = "autosave";
  const PROJECT_BEFORE_NEW_KEY = "before-new-backup";
  const AI_BRIDGE_URL = "http://127.0.0.1:8787/api/tbalance/share";
  const AI_BRIDGE_HISTORY_URL = "http://127.0.0.1:8787/api/tbalance/history";
  const AI_BRIDGE_RESTORE_URL = "http://127.0.0.1:8787/api/tbalance/history/restore";
  const AI_BRIDGE_SUGGESTION_URL = "http://127.0.0.1:8787/api/tbalance/suggestion";
  const SAFETY_AI_REVIEW_URL = "http://127.0.0.1:8787/api/tbalance/safety-ai/review";
  const SOURCE_WRITER_URL = "http://127.0.0.1:8787/api/tbalance/source-writer";
  const NATIVE_ASSETS_URL = "http://127.0.0.1:8787/api/tbalance/native-assets";
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
    activeSceneIds: {},
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
    nativeBehaviorRuntime: null,
    nativeBehaviorDiagnostics: [],
    nativeBehaviorDataCache: new Map(),
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
      runtimeMappings: [],
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
      workflow: {
        status: "clean",
        tab: "layers",
        analysisSignature: "",
        applySignature: "",
        aiReviewSignature: "",
        message: "",
        lastResult: null,
      },
      inspectorExpanded: false,
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
    nativeAssets: {
      status: "idle",
      message: "画像ライブラリーを読み込んでいます。",
      registryLoaded: false,
      storageAvailable: false,
      libraryOpen: false,
      selectedAssetId: "",
      pendingFileIntent: "canvas",
      recentAssetIds: [],
      duplicateNotice: null,
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
    nativeSceneSwitch: $("nativeSceneSwitch"),
    nativeSceneSelect: $("nativeSceneSelect"),
    addNativeScene: $("addNativeScene"),
    renameNativeScene: $("renameNativeScene"),
    nativeSceneScope: $("nativeSceneScope"),
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
    imageLibraryTool: $("imageLibraryTool"),
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
    layerTab: $("layerTab"),
    propertyTab: $("propertyTab"),
    styleTab: $("styleTab"),
    propertyPane: $("propertyPane"),
    nativeTestClockControls: $("nativeTestClockControls"),
    nativeTestClockTime: $("nativeTestClockTime"),
    nativeTestClockApply: $("nativeTestClockApply"),
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
    nativeBehaviorPanel: $("nativeBehaviorPanel"),
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
    nativeAssetPanel: $("nativeAssetPanel"),
    nativeAssetLibraryModal: $("nativeAssetLibraryModal"),
    closeNativeAssetLibrary: $("closeNativeAssetLibrary"),
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
    await loadNativeAssetRegistryFromBridge();
    ensureNativeProjectBehaviorConnections();
    state.uiSettings = resolveUiSettings(state.project);
    state.editorMode = getStartupMode(state.project);
    syncProjectEditorSettings();
    restoreProjectRuntimeState(state.project);
    ensureActiveSceneForPage(getCurrentPage());
    bindEvents();
    installAiBridge();
    renderAll();
  }

  function restoreProjectRuntimeState(project) {
    const storedRuntime = loadProjectRuntimeState(project);
    const runtime = Object.assign({}, project?.editorRuntime || {}, storedRuntime || {});
    const fallbackPageId = project?.pages?.[0]?.id || "";
    const restoredPageId = getExistingProjectPageId(project, runtime.pageId || runtime.primaryPageId || fallbackPageId);
    state.pageId = restoredPageId || fallbackPageId;
    state.primaryPageId = getExistingProjectPageId(project, runtime.primaryPageId || state.pageId) || state.pageId;
    state.viewport = runtime.viewport === "mobile" ? "mobile" : "desktop";
    state.activeSceneIds = isPlainObject(runtime.activeSceneIds) ? Object.assign({}, runtime.activeSceneIds) : {};
  }

  function syncProjectRuntimeState() {
    if (!state.project || state.existingWeb.active) {
      return;
    }
    const runtime = {
      pageId: getExistingProjectPageId(state.project, state.pageId) || state.project.pages?.[0]?.id || "",
      primaryPageId: getExistingProjectPageId(state.project, state.primaryPageId) || state.pageId || state.project.pages?.[0]?.id || "",
      viewport: state.viewport === "mobile" ? "mobile" : "desktop",
      activeSceneIds: Object.assign({}, state.activeSceneIds || {}),
    };
    state.project.editorRuntime = Object.assign({}, state.project.editorRuntime || {}, runtime);
    saveProjectRuntimeState(runtime);
  }

  function saveProjectRuntimeState(runtime) {
    try {
      localStorage.setItem(RUNTIME_STATE_KEY, JSON.stringify(Object.assign({
        projectId: getProjectIdentity(state.project),
        savedAt: new Date().toISOString(),
      }, runtime || {})));
    } catch (error) {
      // Autosave still carries editorRuntime; this tiny snapshot is a fast reload hint.
    }
  }

  function loadProjectRuntimeState(project) {
    try {
      const text = localStorage.getItem(RUNTIME_STATE_KEY);
      const runtime = text ? JSON.parse(text) : null;
      if (!runtime || !isRuntimeStateForProject(runtime, project)) {
        return null;
      }
      return runtime;
    } catch (error) {
      return null;
    }
  }

  function getProjectIdentity(project) {
    return String(project?.projectId || project?.id || project?.name || "tbalance-project");
  }

  function isRuntimeStateForProject(runtime, project) {
    if (!project) {
      return false;
    }
    if (!runtime.projectId || runtime.projectId === getProjectIdentity(project)) {
      return true;
    }
    return Boolean(getExistingProjectPageId(project, runtime.pageId || runtime.primaryPageId));
  }

  function getExistingProjectPageId(project, pageId) {
    const id = String(pageId || "");
    return (project?.pages || []).find((page) => page.id === id || page.pageId === id)?.id || "";
  }

  function isPlainObject(value) {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
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
    els.nativeSceneSelect?.addEventListener("change", () => setActiveScene(els.nativeSceneSelect.value));
    els.addNativeScene?.addEventListener("click", addNativeScene);
    els.renameNativeScene?.addEventListener("click", renameActiveNativeScene);
    els.pageSelect.addEventListener("change", () => {
      state.pageId = els.pageSelect.value;
      state.primaryPageId = state.pageId;
      state.windowMode = "single";
      state.windowLayout = "horizontal";
      state.secondaryWindow = null;
      state.suspendedWindow = null;
      state.activeWindow = "primary";
      ensureActiveSceneForPage(getCurrentPage());
      syncProjectRuntimeState();
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
    els.existingWebCreateSafeChange?.addEventListener("click", () => {
      handleExistingWebMainAction();
    });
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
    if (els.imageFile) {
      els.imageFile.accept = "image/*,video/webm,.webm";
    }
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
    document.addEventListener("click", (event) => {
      if (!state.existingWeb.active || !event.target?.closest?.(".tb-color-head button")) {
        return;
      }
      state.existingWeb.inspectorExpanded = false;
      els.rightPanel?.classList.remove("is-existing-web-inspector-expanded");
      renderAll();
    });
    els.cancelExistingWebAiShare?.addEventListener("click", cancelExistingWebAiShare);
    els.pasteExistingWebAiResult?.addEventListener("click", pasteExistingWebAiResultFromClipboard);
    els.applyExistingWebAiResult?.addEventListener("click", () => importExistingWebAiReviewResult());
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
    els.previewButton.addEventListener("click", handleGlobalTestButton);
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
    els.imageLibraryTool?.addEventListener("click", openNativeAssetLibrary);
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
    ensureAmbientSoundModeButton();
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
    els.layerTab?.addEventListener("click", () => setInspectorTab("layer"));
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
    els.nativeAssetPanel?.addEventListener("click", handleNativeAssetPanelClick);
    els.nativeAssetPanel?.addEventListener("change", handleNativeAssetPanelChange);
    els.nativeAssetPanel?.addEventListener("dragover", handleNativeAssetLibraryDragOver);
    els.nativeAssetPanel?.addEventListener("drop", handleNativeAssetLibraryDrop);
    els.closeNativeAssetLibrary?.addEventListener("click", closeNativeAssetLibrary);
    els.propertyPane?.addEventListener("click", handleNativeBehaviorPanelClick);
    els.propertyPane?.addEventListener("change", handleNativeBehaviorPanelChange);
    els.propertyHeader?.addEventListener("click", handleNativeBehaviorPanelClick);
    els.propertyHeader?.addEventListener("change", handleNativeBehaviorPanelChange);
    els.nativeTestClockApply?.addEventListener("click", applyNativeTestClock);
    window.addEventListener("message", handleTBalanceNativeEventMessage);
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
    ensureNewCanvasSlugInput();
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

  function ensureAmbientSoundModeButton() {
    const menu = document.querySelector('[data-tool-menu="sound"]');
    if (!menu || menu.querySelector('[data-sound-mode="ambient"]')) {
      return;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.soundMode = "ambient";
    button.textContent = "Ambient";
    menu.insertBefore(button, menu.querySelector('[data-sound-mode="click"]') || null);
  }

  function ensureNewCanvasSlugInput() {
    if (document.getElementById("newCanvasSlug")) {
      return;
    }
    const nameLabel = els.newCanvasName?.closest("label");
    if (!nameLabel) {
      return;
    }
    nameLabel.firstChild.textContent = "ページ名";
    const slugLabel = document.createElement("label");
    slugLabel.className = "tb-new-canvas-name";
    slugLabel.textContent = "Web名";
    const input = document.createElement("input");
    input.id = "newCanvasSlug";
    input.type = "text";
    input.placeholder = "page-001";
    input.spellcheck = false;
    slugLabel.appendChild(input);
    nameLabel.insertAdjacentElement("afterend", slugLabel);
  }

  function openNewCanvasDialog() {
    ensureNewCanvasSlugInput();
    const page = getCurrentPage();
    const size = getPageViewportSize(page, state.viewport);
    const title = "";
    els.newCanvasName.value = title;
    const slugInput = document.getElementById("newCanvasSlug");
    if (slugInput) {
      const nextIndex = Math.max(1, (state.project?.pages?.length || 0) + 1);
      slugInput.value = `page-${String(nextIndex).padStart(3, "0")}`;
    }
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
    const created = await createNewPage(options);
    if (!created) {
      return;
    }
    closeNewCanvasDialog();
    if (options.startMode === "image") {
      window.setTimeout(() => {
        state.nativeAssets.pendingFileIntent = "canvas";
        els.imageFile?.click();
      }, 80);
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
    const name = String(els.newCanvasName?.value || "").trim();
    if (!name) {
      showModeToast("ページ名を入力してください。");
      els.newCanvasName?.focus();
      return null;
    }
    const slugInput = document.getElementById("newCanvasSlug");
    const nextIndex = Math.max(1, (state.project?.pages?.length || 0) + 1);
    const slug = normalizePageSlug(slugInput?.value || "", nextIndex);
    if (slugInput) {
      slugInput.value = slug;
    }
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
      slug,
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
    state.analyzer.runtimeMappings = [];
    if (info.adapterId && info.adapterId !== state.analyzer.adapterId) {
      setAnalyzerAdapter(info.adapterId);
    }
    if (options.openContext === "site-map") {
      closeSiteMapPanel();
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
      openContext: options.openContext || info.openContext || "direct",
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
      workflow: createExistingWebWorkflowState("clean"),
      inspectorExpanded: false,
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

  function normalizePageSlug(value, index = 1) {
    const fallback = `page-${String(index).padStart(3, "0")}`;
    return window.TBalanceNativeSchema?.slugify?.(value, fallback) || fallback;
  }

  function splitExistingWebTarget(raw, targetState = null) {
    const value = String(raw || "").trim();
    try {
      const url = new URL(value, getExistingWebBaseUrl());
      const base = new URL(getExistingWebBaseUrl(), window.location.href);
      const sourcePath = url.origin === base.origin
        ? decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html"
        : url.pathname.split("/").filter(Boolean).pop() || "index.html";
      return {
        sourcePath,
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
    const returnToSiteMap = state.existingWeb.openContext === "site-map";
    resetExistingWebPreview({ skipRender: true });
    uninstallExistingWebSelection();
    state.existingWeb.active = false;
    renderAll();
    if (returnToSiteMap) {
      openSiteMapPanel();
    }
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
      doc.addEventListener("pointercancel", handleExistingWebPointerCancel, true);
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
    doc.removeEventListener("pointercancel", handleExistingWebPointerCancel, true);
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
        outline: 0 !important;
        box-shadow: none !important;
      }
      .__tb_existing_web_preview {
        outline: 2px dashed rgba(251, 191, 36, 0.92) !important;
        outline-offset: 4px !important;
      }
      .__tb_existing_web_selected.__tb_existing_web_preview {
        outline: 0 !important;
        outline-offset: 0 !important;
      }
      .__tb_existing_web_transform_box {
        position: fixed !important;
        z-index: 2147483646 !important;
        box-sizing: border-box !important;
        border: 0 !important;
        outline: 2px solid #2f8cff !important;
        outline-offset: 0 !important;
        pointer-events: none !important;
        cursor: move !important;
        filter: drop-shadow(0 0 4px rgba(3, 7, 18, 0.72)) !important;
      }
      .__tb_existing_web_handle {
        position: absolute !important;
        width: 12px !important;
        height: 12px !important;
        border-radius: 2px !important;
        border: 1px solid #ffffff !important;
        background: #2f8cff !important;
        box-shadow: 0 1px 3px rgba(3, 7, 18, 0.34) !important;
        pointer-events: auto !important;
      }
      .__tb_existing_web_move_edge {
        position: absolute !important;
        pointer-events: auto !important;
        cursor: move !important;
      }
      .__tb_existing_web_move_edge[data-tb-existing-web-edge="top"] {
        left: 0 !important;
        top: -5px !important;
        width: 100% !important;
        height: 10px !important;
      }
      .__tb_existing_web_move_edge[data-tb-existing-web-edge="right"] {
        right: -5px !important;
        top: 0 !important;
        width: 10px !important;
        height: 100% !important;
      }
      .__tb_existing_web_move_edge[data-tb-existing-web-edge="bottom"] {
        left: 0 !important;
        bottom: -5px !important;
        width: 100% !important;
        height: 10px !important;
      }
      .__tb_existing_web_move_edge[data-tb-existing-web-edge="left"] {
        left: -5px !important;
        top: 0 !important;
        width: 10px !important;
        height: 100% !important;
      }
      .__tb_existing_web_rotate_arm {
        position: absolute !important;
        left: 50% !important;
        top: -46px !important;
        width: 1px !important;
        height: 46px !important;
        transform: translateX(-50%) !important;
        background: rgba(47, 140, 255, 0.9) !important;
        pointer-events: none !important;
        box-shadow: none !important;
      }
      .__tb_existing_web_handle[data-tb-existing-web-handle="rotate"] {
        left: 50% !important;
        top: -52px !important;
        width: 12px !important;
        height: 12px !important;
        border-radius: 50% !important;
        transform: translateX(-50%) !important;
        cursor: grab !important;
      }
      .__tb_existing_web_transform_box.__tb_existing_web_transform_box--top_clamped .__tb_existing_web_rotate_arm {
        top: 0 !important;
        height: 30px !important;
      }
      .__tb_existing_web_transform_box.__tb_existing_web_transform_box--top_clamped .__tb_existing_web_handle[data-tb-existing-web-handle="rotate"] {
        top: 16px !important;
      }
      .__tb_existing_web_handle[data-tb-existing-web-handle="nw"] {
        left: 0 !important;
        top: 0 !important;
        transform: translate(-50%, -50%) !important;
        cursor: nwse-resize !important;
      }
      .__tb_existing_web_handle[data-tb-existing-web-handle="ne"] {
        left: 100% !important;
        top: 0 !important;
        transform: translate(-50%, -50%) !important;
        cursor: nesw-resize !important;
      }
      .__tb_existing_web_handle[data-tb-existing-web-handle="e"] {
        left: 100% !important;
        top: 50% !important;
        transform: translate(-50%, -50%) !important;
        cursor: ew-resize !important;
      }
      .__tb_existing_web_handle[data-tb-existing-web-handle="se"] {
        left: 100% !important;
        top: 100% !important;
        transform: translate(-50%, -50%) !important;
        cursor: nwse-resize !important;
      }
      .__tb_existing_web_handle[data-tb-existing-web-handle="s"] {
        left: 50% !important;
        top: 100% !important;
        transform: translate(-50%, -50%) !important;
        cursor: ns-resize !important;
      }
      .__tb_existing_web_handle[data-tb-existing-web-handle="sw"] {
        left: 0 !important;
        top: 100% !important;
        transform: translate(-50%, -50%) !important;
        cursor: nesw-resize !important;
      }
      .__tb_existing_web_handle[data-tb-existing-web-handle="w"] {
        left: 0 !important;
        top: 50% !important;
        transform: translate(-50%, -50%) !important;
        cursor: ew-resize !important;
      }
      .__tb_existing_web_handle[data-tb-existing-web-handle="n"] {
        left: 50% !important;
        top: 0 !important;
        transform: translate(-50%, -50%) !important;
        cursor: ns-resize !important;
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
    const handle = event.target?.closest?.(".__tb_existing_web_handle");
    if (handle) {
      const handleType = handle.dataset.tbExistingWebHandle || "";
      if (handleType === "rotate") {
        beginExistingWebRotateDrag(event);
      } else {
        beginExistingWebResizeDrag(event, handleType);
      }
      return;
    }
    if (event.target?.closest?.(".__tb_existing_web_transform_box")) {
      beginExistingWebMoveDrag(event, state.existingWeb.selected);
      return;
    }
    const selection = selectExistingWebElement(resolveExistingWebSelectableNode(event.target, event.clientX, event.clientY));
    if (!selection || !canExistingWebPreviewProperty(selection, "position")) {
      renderAll();
      return;
    }
    beginExistingWebMoveDrag(event, selection);
  }

  function beginExistingWebMoveDrag(event, selection) {
    if (!selection || !selection.node?.isConnected || !canExistingWebPreviewProperty(selection, "position")) {
      renderAll();
      return;
    }
    const beforeBounds = getDomNodeBounds(selection.node) || selection.bounds;
    const frameMetrics = getExistingWebFrameMetrics();
    const startPoint = getExistingWebNormalizedPointerPoint(event, frameMetrics);
    if (!beforeBounds || !startPoint) {
      renderAll();
      return;
    }
    state.existingWeb.drag = {
      type: "move",
      domRef: selection.domRef,
      pointerId: event.pointerId,
      captureTarget: event.target || null,
      frameMetrics,
      startFrameX: startPoint.frameX,
      startFrameY: startPoint.frameY,
      beforeBounds: { ...beforeBounds },
      beforeInline: captureExistingWebInlineStyle(selection.node),
    };
    event.target?.setPointerCapture?.(event.pointerId);
  }

  function handleExistingWebClick(event) {
    if (!state.existingWeb.active || state.existingWeb.mode !== "edit") {
      return;
    }
    stopExistingWebNativeAction(event);
    if (event.target?.closest?.(".__tb_existing_web_transform_box")) {
      renderExistingWebTransformBox();
      return;
    }
    selectExistingWebElement(resolveExistingWebSelectableNode(event.target, event.clientX, event.clientY));
    renderAll();
  }

  function handleExistingWebPointerMove(event) {
    if (handleExistingWebDragMove(event)) {
      stopExistingWebNativeAction(event);
    }
  }

  function handleExistingWebPointerUp(event) {
    if (endExistingWebDrag(event)) {
      stopExistingWebNativeAction(event);
    }
  }

  function handleExistingWebPointerCancel(event) {
    if (cancelExistingWebDrag(event)) {
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
    const delta = getExistingWebDragDelta(event, drag);
    if (!delta) {
      return false;
    }
    const selected = state.existingWeb.selected;
    if (!selected || selected.domRef !== drag.domRef || !selected.node?.isConnected) {
      state.existingWeb.drag = null;
      return false;
    }
    if (drag.type === "resize") {
      const next = getExistingWebResizeBounds(drag, delta.x, delta.y, selected);
      drag.lastBounds = { ...next };
      applyExistingWebPreviewBounds(selected, next, drag.beforeInline, drag.beforeBounds);
    } else if (drag.type === "rotate") {
      const nextRotation = getExistingWebRotateAngle(event, drag);
      drag.lastRotation = nextRotation;
      applyExistingWebPreviewRotation(selected, nextRotation, drag.beforeInline);
    } else {
      drag.lastDelta = { ...delta };
      applyExistingWebPreviewPosition(selected, drag.beforeBounds.x + delta.x, drag.beforeBounds.y + delta.y, drag.beforeInline, drag.beforeBounds);
    }
    renderExistingWebTransformBox();
    return true;
  }

  function endExistingWebDrag(event = null) {
    if (!state.existingWeb.drag) {
      return false;
    }
    releaseExistingWebPointerCapture(event, state.existingWeb.drag);
    const selected = state.existingWeb.selected;
    if (selected?.node?.isConnected) {
      selected.bounds = getDomNodeBounds(selected.node) || selected.bounds;
      const property = state.existingWeb.drag.type === "resize"
        ? "size"
        : state.existingWeb.drag.type === "rotate"
          ? "rotation"
          : "position";
      recordExistingWebPreviewChange(property, state.existingWeb.drag.beforeBounds, selected.bounds, "runtime-confirmed", {
        domRef: selected.domRef,
        beforeInline: state.existingWeb.drag.beforeInline,
        afterInline: captureExistingWebInlineStyle(selected.node),
        beforeRotation: state.existingWeb.drag.beforeRotation,
        afterRotation: getExistingWebCurrentRotation(selected.node),
        userEdit: getExistingWebUserEditFromDrag(state.existingWeb.drag),
      });
    }
    state.existingWeb.drag = null;
    renderAll();
    return true;
  }

  function cancelExistingWebDrag(event = null) {
    if (!state.existingWeb.drag) {
      return false;
    }
    releaseExistingWebPointerCapture(event, state.existingWeb.drag);
    state.existingWeb.drag = null;
    renderExistingWebTransformBox();
    return true;
  }

  function releaseExistingWebPointerCapture(event, drag) {
    const pointerId = event?.pointerId ?? drag?.pointerId;
    if (pointerId == null || !drag?.captureTarget?.releasePointerCapture) {
      return;
    }
    try {
      drag.captureTarget.releasePointerCapture(pointerId);
    } catch (error) {
      // Pointer capture may already be released by the browser.
    }
  }

  function getExistingWebDragDelta(event, drag) {
    if (drag.pointerId != null && event.pointerId != null && drag.pointerId !== event.pointerId) {
      return null;
    }
    const point = getExistingWebNormalizedPointerPoint(event, drag.frameMetrics);
    if (!point) {
      return null;
    }
    return {
      x: Math.round((point.frameX - drag.startFrameX) * 100) / 100,
      y: Math.round((point.frameY - drag.startFrameY) * 100) / 100,
    };
  }

  function getExistingWebRotateAngle(event, drag) {
    const point = getExistingWebNormalizedPointerPoint(event, drag.frameMetrics);
    if (!point) {
      return drag.beforeRotation || 0;
    }
    const currentAngle = getExistingWebAngle(drag.centerFrameX, drag.centerFrameY, point.frameX, point.frameY);
    return normalizeExistingWebAngle(Number(drag.beforeRotation || 0) + currentAngle - Number(drag.startAngle || 0));
  }

  function getExistingWebAngle(centerX, centerY, pointX, pointY) {
    return Math.atan2(Number(pointY || 0) - Number(centerY || 0), Number(pointX || 0) - Number(centerX || 0)) * 180 / Math.PI;
  }

  function normalizeExistingWebAngle(angle) {
    const normalized = ((Number(angle || 0) % 360) + 540) % 360 - 180;
    return Math.round(normalized * 100) / 100;
  }

  function getExistingWebFrameMetrics() {
    const frame = els.existingWebFrame;
    const doc = getExistingWebDocument();
    const frameView = doc?.defaultView || null;
    const rect = frame?.getBoundingClientRect?.();
    const viewportWidth = Number(frameView?.innerWidth || doc?.documentElement?.clientWidth || rect?.width || 1);
    const viewportHeight = Number(frameView?.innerHeight || doc?.documentElement?.clientHeight || rect?.height || 1);
    const scaleX = rect?.width ? rect.width / Math.max(1, viewportWidth) : 1;
    const scaleY = rect?.height ? rect.height / Math.max(1, viewportHeight) : 1;
    return {
      frameView,
      rectLeft: Number(rect?.left || 0),
      rectTop: Number(rect?.top || 0),
      scaleX: Number.isFinite(scaleX) && scaleX > 0 ? scaleX : 1,
      scaleY: Number.isFinite(scaleY) && scaleY > 0 ? scaleY : 1,
    };
  }

  function getExistingWebNormalizedPointerPoint(event, metrics = getExistingWebFrameMetrics()) {
    if (!event || !metrics) {
      return null;
    }
    const eventView = event.view || event.target?.ownerDocument?.defaultView || null;
    if (eventView === metrics.frameView) {
      return {
        frameX: Number(event.clientX || 0),
        frameY: Number(event.clientY || 0),
        source: "iframe",
      };
    }
    if (eventView === window || event.target?.ownerDocument === document) {
      return {
        frameX: Math.round(((Number(event.clientX || 0) - metrics.rectLeft) / metrics.scaleX) * 100) / 100,
        frameY: Math.round(((Number(event.clientY || 0) - metrics.rectTop) / metrics.scaleY) * 100) / 100,
        source: "parent",
      };
    }
    return null;
  }

  function beginExistingWebResizeDrag(event, handle) {
    const selected = state.existingWeb.selected;
    if (!selected || !selected.node?.isConnected || !canExistingWebPreviewProperty(selected, "size")) {
      return;
    }
    const beforeBounds = getDomNodeBounds(selected.node) || selected.bounds;
    const frameMetrics = getExistingWebFrameMetrics();
    const startPoint = getExistingWebNormalizedPointerPoint(event, frameMetrics);
    if (!beforeBounds || !startPoint) {
      return;
    }
    state.existingWeb.drag = {
      type: "resize",
      handle,
      domRef: selected.domRef,
      pointerId: event.pointerId,
      captureTarget: event.target || null,
      frameMetrics,
      startFrameX: startPoint.frameX,
      startFrameY: startPoint.frameY,
      beforeBounds: { ...beforeBounds },
      beforeInline: captureExistingWebInlineStyle(selected.node),
      aspectRatio: beforeBounds?.width && beforeBounds?.height ? beforeBounds.width / beforeBounds.height : 1,
      keepAspectRatio: isExistingWebAspectRatioLocked(selected.node),
    };
    event.target.setPointerCapture?.(event.pointerId);
  }

  function beginExistingWebRotateDrag(event) {
    const selected = state.existingWeb.selected;
    if (!selected || !selected.node?.isConnected || !canExistingWebPreviewProperty(selected, "rotation")) {
      return;
    }
    const beforeBounds = getDomNodeBounds(selected.node) || selected.bounds;
    const frameMetrics = getExistingWebFrameMetrics();
    const startPoint = getExistingWebNormalizedPointerPoint(event, frameMetrics);
    if (!beforeBounds || !startPoint) {
      return;
    }
    const center = {
      x: Number(beforeBounds.x || 0) + Number(beforeBounds.width || 0) / 2,
      y: Number(beforeBounds.y || 0) + Number(beforeBounds.height || 0) / 2,
    };
    state.existingWeb.drag = {
      type: "rotate",
      domRef: selected.domRef,
      pointerId: event.pointerId,
      captureTarget: event.target || null,
      frameMetrics,
      startFrameX: startPoint.frameX,
      startFrameY: startPoint.frameY,
      centerFrameX: center.x,
      centerFrameY: center.y,
      startAngle: getExistingWebAngle(center.x, center.y, startPoint.frameX, startPoint.frameY),
      beforeRotation: getExistingWebCurrentRotation(selected.node),
      beforeBounds: { ...beforeBounds },
      beforeInline: captureExistingWebInlineStyle(selected.node),
    };
    event.target?.setPointerCapture?.(event.pointerId);
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
    const bounds = getDomNodeBounds(node) || element?.observed?.bounds || {};
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
        message: "この要素はRuntime Previewで位置・サイズ・回転を確認できます。",
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
    const props = ["position", "rotation"];
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
    const props = ["position", "rotation"];
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
    return ["position", "size", "rotation"];
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
      { label: "回転", state: editable.has("rotation") ? "ok" : protectedSet.has("rotation") ? "protected" : "warning", text: editable.has("rotation") ? "変更できます" : protectedSet.has("rotation") ? "保護" : unknownReason },
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
      renderExistingWebTransformBox();
    }
  }

  function clearExistingWebSelectionClass(doc) {
    doc.querySelectorAll?.(".__tb_existing_web_selected, .__tb_existing_web_preview").forEach((node) => {
      node.classList.remove("__tb_existing_web_selected", "__tb_existing_web_preview");
    });
    removeExistingWebTransformBox(doc);
  }

  function removeExistingWebTransformBox(doc = getExistingWebDocument()) {
    doc?.querySelectorAll?.(".__tb_existing_web_transform_box").forEach((node) => node.remove());
  }

  function renderExistingWebTransformBox() {
    const doc = getExistingWebDocument();
    const selected = state.existingWeb.selected;
    if (!doc || state.existingWeb.mode !== "edit" || !selected?.node?.isConnected) {
      removeExistingWebTransformBox(doc);
      return;
    }
    removeExistingWebTransformBox(doc);
    const bounds = getDomNodeBounds(selected.node) || selected.bounds;
    if (!bounds || Number(bounds.width || 0) <= 0 || Number(bounds.height || 0) <= 0) {
      return;
    }
    const box = doc.createElement("div");
    box.className = "__tb_existing_web_transform_box";
    if (Number(bounds.y || 0) < 58) {
      box.classList.add("__tb_existing_web_transform_box--top_clamped");
    }
    box.style.left = `${Math.round(Number(bounds.x || 0) * 100) / 100}px`;
    box.style.top = `${Math.round(Number(bounds.y || 0) * 100) / 100}px`;
    box.style.width = `${Math.round(Number(bounds.width || 0) * 100) / 100}px`;
    box.style.height = `${Math.round(Number(bounds.height || 0) * 100) / 100}px`;
    box.setAttribute("aria-hidden", "true");
    ["top", "right", "bottom", "left"].forEach((edge) => {
      const line = doc.createElement("span");
      line.className = "__tb_existing_web_move_edge";
      line.dataset.tbExistingWebEdge = edge;
      box.appendChild(line);
    });
    const rotateArm = doc.createElement("span");
    rotateArm.className = "__tb_existing_web_rotate_arm";
    box.appendChild(rotateArm);
    const rotateHandle = doc.createElement("span");
    rotateHandle.className = "__tb_existing_web_handle";
    rotateHandle.dataset.tbExistingWebHandle = "rotate";
    box.appendChild(rotateHandle);
    ["nw", "n", "ne", "e", "se", "s", "sw", "w"].forEach((handle) => {
      const dot = doc.createElement("span");
      dot.className = "__tb_existing_web_handle";
      dot.dataset.tbExistingWebHandle = handle;
      box.appendChild(dot);
    });
    doc.body?.appendChild(box);
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
    return (mapping.editableProperties || []).filter((property) => ["position", "size", "width", "height", "rotation"].includes(property) && !protectedProperties.has(property));
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

  function applyExistingWebPreviewPosition(selection, viewportX, viewportY, beforeInline, referenceBounds = null) {
    const node = selection?.node;
    if (!node) {
      return;
    }
    const computed = getExistingWebComputed(node);
    if (!["absolute", "fixed", "relative"].includes(computed.positionType) && !isExistingWebNormalFreePreviewMode()) {
      return;
    }
    const baseBounds = referenceBounds || selection.bounds || getDomNodeBounds(node) || {};
    const dx = Math.round((viewportX - baseBounds.x) * 100) / 100;
    const dy = Math.round((viewportY - baseBounds.y) * 100) / 100;
    const baseTranslate = parseExistingWebTranslate(beforeInline?.translate);
    node.style.translate = `${Math.round((baseTranslate.x + dx) * 100) / 100}px ${Math.round((baseTranslate.y + dy) * 100) / 100}px`;
    node.classList.add("__tb_existing_web_preview");
    state.existingWeb.preview.active = true;
    state.existingWeb.preview.beforeInline = beforeInline;
  }

  function applyExistingWebPreviewBounds(selection, bounds, beforeInline, referenceBounds = null) {
    const node = selection?.node;
    if (!node || !bounds) {
      return;
    }
    applyExistingWebPreviewPosition(selection, bounds.x, bounds.y, beforeInline, referenceBounds);
    node.style.width = `${Math.max(1, Math.round(Number(bounds.width || 1) * 100) / 100)}px`;
    node.style.height = `${Math.max(1, Math.round(Number(bounds.height || 1) * 100) / 100)}px`;
    node.classList.add("__tb_existing_web_preview");
    state.existingWeb.preview.active = true;
    state.existingWeb.preview.beforeInline = beforeInline;
  }

  function applyExistingWebPreviewRotation(selection, rotation, beforeInline) {
    const node = selection?.node;
    if (!node) {
      return;
    }
    node.style.rotate = `${normalizeExistingWebAngle(rotation)}deg`;
    node.classList.add("__tb_existing_web_preview");
    state.existingWeb.preview.active = true;
    state.existingWeb.preview.beforeInline = beforeInline;
  }

  function getExistingWebResizeBounds(drag, dx, dy, selection) {
    const start = drag.beforeBounds || selection?.bounds || {};
    const handle = drag.handle || "se";
    const minSize = 8;
    let left = Number(start.x || 0);
    let top = Number(start.y || 0);
    let width = Number(start.width || minSize);
    let height = Number(start.height || minSize);
    if (handle.includes("e")) {
      width += dx;
    }
    if (handle.includes("s")) {
      height += dy;
    }
    if (handle.includes("w")) {
      left += dx;
      width -= dx;
    }
    if (handle.includes("n")) {
      top += dy;
      height -= dy;
    }
    width = Math.max(minSize, width);
    height = Math.max(minSize, height);
    if (drag.keepAspectRatio) {
      const ratio = Number(drag.aspectRatio || 1) || 1;
      const dominant = Math.abs(width - Number(start.width || width)) >= Math.abs(height - Number(start.height || height))
        ? "width"
        : "height";
      if (dominant === "width") {
        height = width / ratio;
      } else {
        width = height * ratio;
      }
      if (handle.includes("w")) {
        left = Number(start.x || 0) + Number(start.width || width) - width;
      }
      if (handle.includes("n")) {
        top = Number(start.y || 0) + Number(start.height || height) - height;
      }
    }
    return {
      x: Math.round(left * 100) / 100,
      y: Math.round(top * 100) / 100,
      width: Math.round(width * 100) / 100,
      height: Math.round(height * 100) / 100,
    };
  }

  function isExistingWebAspectRatioLocked(node) {
    const tag = String(node?.tagName || "").toLowerCase();
    return ["img", "video", "svg", "canvas", "picture"].includes(tag);
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
    applyExistingWebPreviewPosition(selected, before.x + dx, before.y + dy, beforeInline, before);
    selected.bounds = getDomNodeBounds(selected.node) || before;
    recordExistingWebPreviewChange("position", before, selected.bounds, "runtime-confirmed", {
      domRef: selected.domRef,
      beforeInline,
      afterInline: captureExistingWebInlineStyle(selected.node),
      userEdit: {
        type: "move",
        deltaX: roundExistingWebNumber(dx),
        deltaY: roundExistingWebNumber(dy),
      },
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
    const ratio = before.width && before.height ? before.width / before.height : 1;
    const nextWidth = Math.max(1, Math.round((before.width + dw) * 100) / 100);
    const nextHeight = isExistingWebAspectRatioLocked(selected.node)
      ? Math.max(1, Math.round((nextWidth / Math.max(ratio, 0.01)) * 100) / 100)
      : Math.max(1, Math.round((before.height + dh) * 100) / 100);
    applyExistingWebPreviewBounds(selected, { ...before, width: nextWidth, height: nextHeight }, beforeInline, before);
    selected.bounds = getDomNodeBounds(selected.node) || before;
    recordExistingWebPreviewChange("size", before, selected.bounds, "runtime-confirmed", {
      domRef: selected.domRef,
      beforeInline,
      afterInline: captureExistingWebInlineStyle(selected.node),
      userEdit: {
        type: "resize",
        widthDelta: roundExistingWebNumber(nextWidth - before.width),
        heightDelta: roundExistingWebNumber(nextHeight - before.height),
      },
    });
    renderAll();
  }

  function roundExistingWebNumber(value) {
    return Math.round((Number(value || 0)) * 100) / 100;
  }

  function getExistingWebUserEditFromDrag(drag = {}) {
    if (drag.type === "move") {
      const delta = drag.lastDelta || { x: 0, y: 0 };
      return {
        type: "move",
        deltaX: roundExistingWebNumber(delta.x),
        deltaY: roundExistingWebNumber(delta.y),
      };
    }
    if (drag.type === "resize") {
      const before = drag.beforeBounds || {};
      const after = drag.lastBounds || before;
      return {
        type: "resize",
        widthDelta: roundExistingWebNumber(Number(after.width || 0) - Number(before.width || 0)),
        heightDelta: roundExistingWebNumber(Number(after.height || 0) - Number(before.height || 0)),
      };
    }
    if (drag.type === "rotate") {
      return {
        type: "rotate",
        rotationDelta: normalizeExistingWebAngle(Number(drag.lastRotation ?? drag.beforeRotation ?? 0) - Number(drag.beforeRotation || 0)),
      };
    }
    return null;
  }

  function normalizeExistingWebUserEdit(property, userEdit, beforeBounds = {}, afterBounds = {}, options = {}) {
    if (userEdit?.type) {
      return { ...userEdit };
    }
    if (property === "position") {
      return {
        type: "move",
        deltaX: roundExistingWebNumber(Number(afterBounds.x || 0) - Number(beforeBounds.x || 0)),
        deltaY: roundExistingWebNumber(Number(afterBounds.y || 0) - Number(beforeBounds.y || 0)),
      };
    }
    if (property === "size") {
      return {
        type: "resize",
        widthDelta: roundExistingWebNumber(Number(afterBounds.width || 0) - Number(beforeBounds.width || 0)),
        heightDelta: roundExistingWebNumber(Number(afterBounds.height || 0) - Number(beforeBounds.height || 0)),
      };
    }
    if (property === "rotation") {
      return {
        type: "rotate",
        rotationDelta: normalizeExistingWebAngle(Number(options.afterRotation || 0) - Number(options.beforeRotation || 0)),
      };
    }
    return {
      type: property || "unknown",
    };
  }

  function getExistingWebIntentBefore(property, beforeBounds = {}, options = {}) {
    if (property === "size") {
      return { width: beforeBounds.width, height: beforeBounds.height };
    }
    if (property === "rotation") {
      return { rotation: normalizeExistingWebAngle(options.beforeRotation || 0) };
    }
    return { x: beforeBounds.x, y: beforeBounds.y };
  }

  function getExistingWebIntentAfter(property, before, userEdit = {}, afterBounds = {}, options = {}) {
    if (property === "size") {
      return {
        width: roundExistingWebNumber(Number(before.width || 0) + Number(userEdit.widthDelta || 0)),
        height: roundExistingWebNumber(Number(before.height || 0) + Number(userEdit.heightDelta || 0)),
      };
    }
    if (property === "rotation") {
      return { rotation: normalizeExistingWebAngle(Number(before.rotation || 0) + Number(userEdit.rotationDelta || 0)) };
    }
    if (property === "position") {
      return {
        x: roundExistingWebNumber(Number(before.x || 0) + Number(userEdit.deltaX || 0)),
        y: roundExistingWebNumber(Number(before.y || 0) + Number(userEdit.deltaY || 0)),
      };
    }
    return afterBounds || before || {};
  }

  function buildExistingWebObservedVisualChange(property, beforeBounds = {}, afterBounds = {}, options = {}) {
    if (property === "size") {
      return {
        type: "resize",
        widthDelta: roundExistingWebNumber(Number(afterBounds.width || 0) - Number(beforeBounds.width || 0)),
        heightDelta: roundExistingWebNumber(Number(afterBounds.height || 0) - Number(beforeBounds.height || 0)),
      };
    }
    if (property === "rotation") {
      return {
        type: "rotate",
        rotationDelta: normalizeExistingWebAngle(Number(options.afterRotation || 0) - Number(options.beforeRotation || 0)),
      };
    }
    return {
      type: "move",
      deltaX: roundExistingWebNumber(Number(afterBounds.x || 0) - Number(beforeBounds.x || 0)),
      deltaY: roundExistingWebNumber(Number(afterBounds.y || 0) - Number(beforeBounds.y || 0)),
    };
  }

  function buildExistingWebRuntimeDynamicDrift(property, userEdit = {}, observed = {}) {
    if (property === "position") {
      const deltaX = roundExistingWebNumber(Number(observed.deltaX || 0) - Number(userEdit.deltaX || 0));
      const deltaY = roundExistingWebNumber(Number(observed.deltaY || 0) - Number(userEdit.deltaY || 0));
      return {
        type: "move",
        deltaX,
        deltaY,
        source: (Math.abs(deltaX) >= 0.01 || Math.abs(deltaY) >= 0.01) ? "animation-or-runtime-motion" : "none",
      };
    }
    if (property === "size") {
      const widthDelta = roundExistingWebNumber(Number(observed.widthDelta || 0) - Number(userEdit.widthDelta || 0));
      const heightDelta = roundExistingWebNumber(Number(observed.heightDelta || 0) - Number(userEdit.heightDelta || 0));
      return {
        type: "resize",
        widthDelta,
        heightDelta,
        source: (Math.abs(widthDelta) >= 0.01 || Math.abs(heightDelta) >= 0.01) ? "animation-or-runtime-motion" : "none",
      };
    }
    if (property === "rotation") {
      const rotationDelta = normalizeExistingWebAngle(Number(observed.rotationDelta || 0) - Number(userEdit.rotationDelta || 0));
      return {
        type: "rotate",
        rotationDelta,
        source: Math.abs(rotationDelta) >= 0.01 ? "animation-or-runtime-motion" : "none",
      };
    }
    return {
      type: property || "unknown",
      source: "none",
    };
  }

  function recordExistingWebPreviewChange(property, beforeBounds, afterBounds, beforeSource, options = {}) {
    const userEdit = normalizeExistingWebUserEdit(property, options.userEdit, beforeBounds, afterBounds, options);
    const before = getExistingWebIntentBefore(property, beforeBounds, options);
    const after = getExistingWebIntentAfter(property, before, userEdit, afterBounds, options);
    const observedVisualChange = buildExistingWebObservedVisualChange(property, beforeBounds, afterBounds, options);
    const runtimeDynamicDrift = buildExistingWebRuntimeDynamicDrift(property, userEdit, observedVisualChange);
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
      userEdit,
      observedVisualChange,
      runtimeDynamicDrift,
      beforeSource,
      beforeInline: options.beforeInline || state.existingWeb.preview?.beforeInline || null,
      afterInline: options.afterInline || (selected?.node ? captureExistingWebInlineStyle(selected.node) : null),
      coordinateContext: "iframe-viewport-css-px",
    };
    state.existingWeb.preview.changes = [change];
    state.existingWeb.impactAnalysis = null;
    pushExistingWebPreviewHistory(change);
    markExistingWebWorkflowDirty();
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

  function createExistingWebWorkflowState(status = "clean") {
    return {
      status,
      tab: "layers",
      analysisSignature: "",
      applySignature: "",
      aiReviewSignature: "",
      aiReviewRequestId: "",
      aiReviewStatus: "",
      message: "",
      lastResult: null,
    };
  }

  function getExistingWebWorkflow() {
    if (!state.existingWeb.workflow) {
      state.existingWeb.workflow = createExistingWebWorkflowState("clean");
    }
    return state.existingWeb.workflow;
  }

  function recoverExistingWebWorkflowStateFromRuntime() {
    if (!state.existingWeb.active) {
      return createExistingWebWorkflowState("clean");
    }
    const workflow = getExistingWebWorkflow();
    const count = getExistingWebPreviewChangeCount();
    if (!count) {
      return workflow.status === "clean" ? workflow : createExistingWebWorkflowState("clean");
    }
    const signature = getExistingWebPreviewSignature();
    const preflight = state.analyzer.safeApply?.preflight || null;
    const eligibility = getExistingWebWorkflowEligibility(workflow.status, count);
    const busy = ["analyzing", "ai_reviewing", "ai_response_imported", "applying"].includes(workflow.status);
    if (busy) {
      return workflow;
    }
    if (preflight?.ok && eligibility.readyCount > 0) {
      const nextStatus = eligibility.readyCount >= count ? "ready_to_apply" : "mixed_ready";
      const nextMessage = nextStatus === "ready_to_apply"
        ? `変更確認済み: ${eligibility.readyCount}件を反映できます。`
        : `${count}件中${eligibility.readyCount}件を反映できます。${eligibility.pendingCount}件は要確認です。`;
      if (workflow.status !== nextStatus || workflow.applySignature !== signature) {
        state.existingWeb.workflow = {
          ...workflow,
          status: nextStatus,
          analysisSignature: signature,
          applySignature: signature,
          message: workflow.message && workflow.status === nextStatus ? workflow.message : nextMessage,
        };
      }
      return state.existingWeb.workflow;
    }
    if (["ready_to_apply", "mixed_ready"].includes(workflow.status)) {
      state.existingWeb.workflow = {
        ...workflow,
        status: "dirty",
        analysisSignature: "",
        applySignature: "",
        message: "確認結果を再利用できません。変更を再確認してください。",
      };
      return state.existingWeb.workflow;
    }
    if (!workflow.status || workflow.status === "clean") {
      state.existingWeb.workflow = {
        ...workflow,
        status: "dirty",
        message: "未確認の変更があります。変更を確認してください。",
      };
      return state.existingWeb.workflow;
    }
    return workflow;
  }

  function getExistingWebPreviewChangeCount() {
    return getExistingWebWorkflowChanges().length;
  }

  function getExistingWebPreviewSignature() {
    return JSON.stringify(getExistingWebWorkflowChanges().map((change) => ({
      domRef: change.domRef || "",
      property: change.property || "",
      before: change.before || null,
      after: change.after || null,
      afterInline: change.afterInline || null,
    })));
  }

  function getExistingWebWorkflowChanges() {
    const byKey = new Map();
    (state.existingWeb.previewHistory || []).forEach((change) => {
      if (!change?.domRef || !change.property) {
        return;
      }
      const key = `${change.domRef}\u0001${change.property}`;
      const existing = byKey.get(key);
      byKey.set(key, {
        ...(existing || change),
        domRef: change.domRef,
        property: change.property,
        before: existing?.before || change.before,
        after: change.after,
        beforeSource: existing?.beforeSource || change.beforeSource,
        beforeInline: existing?.beforeInline || change.beforeInline,
        afterInline: change.afterInline || existing?.afterInline || null,
        coordinateContext: change.coordinateContext || existing?.coordinateContext || "",
      });
    });
    return Array.from(byKey.values()).filter((change) => {
      const before = change.before || {};
      const after = change.after || {};
      return Object.keys({ ...before, ...after }).some((key) => Math.abs((Number(after[key]) || 0) - (Number(before[key]) || 0)) >= 0.5);
    });
  }

  function markExistingWebWorkflowDirty(message = "") {
    const workflow = recoverExistingWebWorkflowStateFromRuntime();
    const count = getExistingWebPreviewChangeCount();
    if (!count) {
      state.existingWeb.workflow = {
        ...workflow,
        status: "clean",
        analysisSignature: "",
        applySignature: "",
        aiReviewSignature: "",
        aiReviewRequestId: "",
        aiReviewStatus: "",
        message: message || "",
        lastResult: null,
      };
      return;
    }
    state.existingWeb.workflow = {
      ...workflow,
      status: "dirty",
      analysisSignature: "",
      applySignature: "",
      aiReviewSignature: "",
      aiReviewRequestId: "",
      aiReviewStatus: "",
      message: message || `${count}件の変更があります。`,
      lastResult: null,
    };
  }

  function setExistingWebWorkflowReviewRequired(message = "") {
    const workflow = getExistingWebWorkflow();
    state.existingWeb.workflow = {
      ...workflow,
      status: "review_required",
      analysisSignature: getExistingWebPreviewSignature(),
      applySignature: "",
      aiReviewSignature: "",
      aiReviewRequestId: "",
      aiReviewStatus: "",
      message: message || "変更確認は完了しましたが、Source反映には追加確認が必要です。",
    };
  }

  function setExistingWebWorkflowAiReviewing(message = "", requestId = "") {
    const workflow = getExistingWebWorkflow();
    const signature = getExistingWebPreviewSignature();
    state.existingWeb.workflow = {
      ...workflow,
      status: "ai_reviewing",
      analysisSignature: workflow.analysisSignature || signature,
      applySignature: "",
      aiReviewSignature: signature,
      aiReviewRequestId: requestId,
      aiReviewStatus: "running",
      message: message || "AIで確認中...",
    };
  }

  function setExistingWebWorkflowAiImported(message = "") {
    const workflow = getExistingWebWorkflow();
    state.existingWeb.workflow = {
      ...workflow,
      status: "ai_response_imported",
      applySignature: "",
      aiReviewStatus: "revalidating",
      message: message || "AI回答をTBalanceで再確認中です。",
    };
  }

  function setExistingWebWorkflowManualReviewRequired(message = "", details = null) {
    const workflow = getExistingWebWorkflow();
    state.existingWeb.workflow = {
      ...workflow,
      status: "manual_review_required",
      analysisSignature: getExistingWebPreviewSignature(),
      applySignature: "",
      aiReviewStatus: "blocked",
      message: message || "この変更は自動で安全確認できませんでした。",
      lastResult: details || workflow.lastResult || null,
    };
  }

  function setExistingWebWorkflowReadyToApply(message = "") {
    const workflow = getExistingWebWorkflow();
    const signature = getExistingWebPreviewSignature();
    state.existingWeb.workflow = {
      ...workflow,
      status: "ready_to_apply",
      analysisSignature: signature,
      applySignature: signature,
      aiReviewSignature: workflow.aiReviewSignature || "",
      aiReviewRequestId: workflow.aiReviewRequestId || "",
      aiReviewStatus: workflow.aiReviewStatus === "running" ? "revalidated" : workflow.aiReviewStatus || "",
      message: message || "変更確認済みです。Sourceへ反映できます。",
    };
  }

  function setExistingWebWorkflowMixedReady(message = "") {
    const workflow = getExistingWebWorkflow();
    const signature = getExistingWebPreviewSignature();
    state.existingWeb.workflow = {
      ...workflow,
      status: "mixed_ready",
      analysisSignature: signature,
      applySignature: signature,
      aiReviewSignature: workflow.aiReviewSignature || "",
      aiReviewRequestId: workflow.aiReviewRequestId || "",
      aiReviewStatus: workflow.aiReviewStatus || "",
      message: message || "反映可能な変更があります。要確認の変更は反映しません。",
    };
  }

  function setExistingWebWorkflowClean(message = "") {
    const workflow = getExistingWebWorkflow();
    state.existingWeb.workflow = {
      ...workflow,
      status: "clean",
      analysisSignature: "",
      applySignature: "",
      aiReviewSignature: "",
      aiReviewRequestId: "",
      aiReviewStatus: "",
      message,
      lastResult: null,
    };
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
    markExistingWebWorkflowDirty("Undo後のPreview状態を再確認してください。");
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
    markExistingWebWorkflowDirty("Redo後のPreview状態を再確認してください。");
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
    setExistingWebWorkflowClean("Preview変更を解除しました。");
    applyExistingWebSelectionClass();
    refreshExistingWebVirtualLayers();
    if (!options.skipRender) {
      renderAll();
    }
  }

  async function handleExistingWebMainAction() {
    if (!state.existingWeb.active) {
      return;
    }
    if (state.editorMode === "custom") {
      sendExistingWebPreviewToSafeChange();
      return;
    }
    const workflow = getExistingWebWorkflow();
    if (["ready_to_apply", "mixed_ready"].includes(workflow.status)) {
      await applyExistingWebWorkflowToSource();
      return;
    }
    if (workflow.status === "analyzing" || workflow.status === "ai_reviewing" || workflow.status === "ai_response_imported") {
      return;
    }
    await analyzeExistingWebWorkflowChanges();
  }

  async function analyzeExistingWebWorkflowChanges() {
    const changes = getExistingWebWorkflowChanges();
    const count = changes.length;
    if (!count) {
      showModeToast("先に編集内容をPreviewしてください。");
      setExistingWebWorkflowClean();
      renderAll();
      return;
    }
    const workflow = getExistingWebWorkflow();
    state.existingWeb.workflow = {
      ...workflow,
      status: "analyzing",
      message: `${count}件の変更を確認中です。`,
    };
    renderAll();
    const resolution = count === 1
      ? await prepareExistingWebSingleWorkflowResolution(changes[0])
      : await prepareExistingWebBatchWorkflowResolution(changes);
    state.existingWeb.impactAnalysis = buildExistingWebWorkflowImpactAnalysis(resolution, changes);
    if (resolution?.ok) {
      setExistingWebWorkflowReadyToApply(`変更確認済み: ${count}件を反映できます。`);
    } else if (resolution?.status === "mixed_ready") {
      setExistingWebWorkflowMixedReady(resolution.message || "反映可能な変更があります。要確認の変更は反映しません。");
    } else {
      await runExistingWebAutomaticSafetyReview(changes, resolution);
    }
    showModeToast(`変更後の影響を確認しました: ${count}件`);
    renderAll();
  }

  async function prepareExistingWebSingleWorkflowResolution(change) {
    const selected = selectExistingWebElementForWorkflowChange(change);
    if (!selected) {
      return { ok: false, status: "blocked", reason: "missing-selection", message: "変更対象を確認できません。", change };
    }
    const resolution = await prepareExistingWebOnDemandApplyCandidate(selected, change);
    return {
      ...resolution,
      batch: false,
      changes: [{ change, selected, resolution }],
    };
  }

  async function prepareExistingWebBatchWorkflowResolution(changes) {
    clearSafePatchCandidate(false);
    clearSafeApplyState(false);
    const items = [];
    const candidates = [];
    const approvedSignatures = {};
    for (const change of changes) {
      const selected = selectExistingWebElementForWorkflowChange(change);
      if (!selected) {
        const resolution = { ok: false, status: "blocked", reason: "missing-selection", message: "変更対象を確認できません。", change };
        items.push({ change, selected: null, resolution });
        continue;
      }
      const resolution = await prepareExistingWebOnDemandApplyCandidate(selected, change, { skipPreflight: true, skipClear: true });
      items.push({ change, selected, resolution });
      const candidate = resolution.patchResult?.candidate || null;
      if (resolution.ok && candidate?.status === "ready-for-review") {
        candidate.review = {
          status: "approved",
          approvedAt: new Date().toISOString(),
          rejectedAt: null,
          approvedSignature: candidate.signature,
        };
        candidates.push(candidate);
        approvedSignatures[candidate.signature] = candidate.signature;
      }
    }
    const blocked = items.filter((item) => !item.resolution?.ok);
    if (blocked.length) {
      if (candidates.length && window.TBalanceSafeApply?.runBatchApplyPreflight) {
        const client = getSafeApplyClient();
        const preflight = await window.TBalanceSafeApply.runBatchApplyPreflight({
          candidates,
          approvedSignatures,
          sourceWriterClient: client,
          createSignature: window.TBalanceSafePatch?.createCandidateSignature,
        });
        state.analyzer.safeApply.preflight = preflight?.ok ? preflight : null;
        state.analyzer.safeApply.result = preflight || null;
        state.analyzer.safeApply.diffText = preflight?.diffText || "";
        setSafeApplyStatus(
          preflight?.ok ? (preflight.status || "ready-to-apply") : (preflight?.status || "failed"),
          preflight?.ok
            ? `${candidates.length}件だけ反映可能です。要確認の変更は反映しません。`
            : preflight?.message || "反映可能な変更のPreflightが通りませんでした。",
        );
      }
      return {
        ok: false,
        batch: true,
        status: state.analyzer.safeApply.preflight?.ok ? "mixed_ready" : "review_required",
        reason: blocked[0].resolution?.reason || "batch-review-required",
        message: state.analyzer.safeApply.preflight?.ok
          ? `${items.length}件中${candidates.length}件を反映できます。${blocked.length}件は要確認です。`
          : `${items.length}件中${blocked.length}件に確認が必要です。`,
        changes: items,
        candidates,
        approvedSignatures,
        batchPreflight: state.analyzer.safeApply.preflight || null,
        summary: { total: items.length, safe: state.analyzer.safeApply.preflight?.ok ? candidates.length : 0, blocked: blocked.length },
      };
    }
    if (!window.TBalanceSafeApply?.runBatchApplyPreflight) {
      return {
        ok: false,
        batch: true,
        status: "preflight-blocked",
        reason: "batch-apply-unavailable",
        message: "Batch Apply moduleを読み込めていません。",
        changes: items,
        summary: { total: items.length, safe: items.length, blocked: 0 },
      };
    }
    const client = getSafeApplyClient();
    const preflight = await window.TBalanceSafeApply.runBatchApplyPreflight({
      candidates,
      approvedSignatures,
      sourceWriterClient: client,
      createSignature: window.TBalanceSafePatch?.createCandidateSignature,
    });
    state.analyzer.safeApply.preflight = preflight.ok ? preflight : null;
    state.analyzer.safeApply.result = preflight;
    state.analyzer.safeApply.diffText = preflight.diffText || "";
    setSafeApplyStatus(preflight.status || "failed", preflight.message || "Batch Preflightを完了しました。");
    return {
      ok: Boolean(preflight?.ok),
      batch: true,
      status: preflight?.status || "preflight-blocked",
      reason: preflight?.reason || "",
      message: preflight?.message || "",
      changes: items,
      candidates,
      approvedSignatures,
      batchPreflight: preflight,
      summary: {
        total: items.length,
        safe: preflight?.ok ? items.length : 0,
        blocked: preflight?.ok ? 0 : 1,
      },
    };
  }

  function selectExistingWebElementForWorkflowChange(change) {
    const node = getExistingWebNodeByDomRef(change?.domRef);
    if (!node) {
      return null;
    }
    return selectExistingWebElement(node);
  }

  async function applyExistingWebWorkflowToSource() {
    const workflow = getExistingWebWorkflow();
    const signature = getExistingWebPreviewSignature();
    if (!signature || workflow.applySignature !== signature) {
      markExistingWebWorkflowDirty("Previewが再編集されています。変更を再確認してください。");
      renderAll();
      return;
    }
    const activePreflightBeforeConfirm = state.analyzer.safeApply?.preflight;
    const count = activePreflightBeforeConfirm?.batchApplyVersion
      ? Number(activePreflightBeforeConfirm.summary?.totalCandidates || activePreflightBeforeConfirm.operations?.length || 0)
      : getExistingWebPreviewChangeCount();
    if (!count) {
      setExistingWebWorkflowReviewRequired("反映できる変更はありません。");
      renderAll();
      return;
    }
    const ok = window.confirm([
      "変更を反映しますか？",
      "",
      `${count}件の変更をローカルのWebファイルに反映します。`,
      "HTML/CSSなどのファイルが変更されます。",
      "",
      `変更対象: ${count}件`,
    ].join("\n"));
    if (!ok) {
      renderAll();
      return;
    }
    state.existingWeb.workflow = {
      ...workflow,
      status: "applying",
      message: "Safe ApplyでSourceへ反映中です。",
    };
    renderAll();
    const existingPreflight = state.analyzer.safeApply?.preflight;
    if (!existingPreflight?.ok) {
      const preflight = await runSafeApplyPreflight();
      if (!preflight?.ok) {
        setExistingWebWorkflowReviewRequired("Apply Preflightが通りませんでした。Sourceは変更していません。");
        renderAll();
        return;
      }
    }
    const activePreflight = state.analyzer.safeApply?.preflight;
    const result = activePreflight?.batchApplyVersion
      ? await applySafePatchBatch({ skipUserConfirm: true })
      : await applySafePatchCandidate({ skipUserConfirm: true });
    state.existingWeb.workflow.lastResult = result;
    if (result?.ok) {
      acceptExistingWebAppliedBaseline(result, activePreflight);
      showModeToast("変更をローカルSourceへ反映しました。");
    } else {
      setExistingWebWorkflowReviewRequired(result?.message || "Safe Applyに失敗しました。Source状態を確認してください。");
    }
    renderAll();
  }

  function acceptExistingWebAppliedBaseline(result = null, preflight = null) {
    const appliedKeys = getExistingWebAppliedChangeKeys(result, preflight);
    if (appliedKeys.size) {
      state.existingWeb.previewHistory = (state.existingWeb.previewHistory || []).filter((change) => !appliedKeys.has(getExistingWebChangeKey(change)));
      state.existingWeb.previewFuture = (state.existingWeb.previewFuture || []).filter((change) => !appliedKeys.has(getExistingWebChangeKey(change)));
      syncExistingWebPreviewStateFromHistory();
      state.existingWeb.impactAnalysis = null;
      state.existingWeb.drag = null;
      if (state.existingWeb.previewHistory.length) {
        state.existingWeb.workflow = {
          ...createExistingWebWorkflowState("review_required"),
          message: `${appliedKeys.size}件反映済み。${state.existingWeb.previewHistory.length}件は要確認です。`,
          lastResult: result,
        };
      } else {
        state.existingWeb.workflow = {
          ...createExistingWebWorkflowState("clean"),
          message: "反映済みSourceを新しいBaselineとして扱います。",
          lastResult: result,
        };
      }
      applyExistingWebSelectionClass();
      refreshExistingWebVirtualLayers();
      return;
    }
    state.existingWeb.preview = {
      active: false,
      changes: [],
    };
    state.existingWeb.previewHistory = [];
    state.existingWeb.previewFuture = [];
    state.existingWeb.impactAnalysis = null;
    state.existingWeb.drag = null;
    state.existingWeb.workflow = {
      ...createExistingWebWorkflowState("clean"),
      message: "反映済みSourceを新しいBaselineとして扱います。",
      lastResult: result,
    };
    applyExistingWebSelectionClass();
    refreshExistingWebVirtualLayers();
  }

  function getExistingWebChangeKey(change = {}) {
    return `${change.domRef || ""}\u0001${change.property || ""}`;
  }

  function getExistingWebAppliedChangeKeys(result = null, preflight = null) {
    const keys = new Set();
    (Array.isArray(preflight?.operations) ? preflight.operations : []).forEach((operation) => {
      const domRef = operation?.target?.domRef || "";
      const property = getExistingWebVisualPropertyForCssProperty(operation?.property || "");
      if (domRef && property) {
        keys.add(`${domRef}\u0001${property}`);
      }
    });
    (Array.isArray(result?.appliedChanges) ? result.appliedChanges : []).forEach((change) => {
      if (change?.domRef && change?.property) {
        keys.add(getExistingWebChangeKey(change));
      }
    });
    return keys;
  }

  async function prepareExistingWebOnDemandApplyCandidate(selected, change, options = {}) {
    if (!options.skipClear) {
      clearSafePatchCandidate(false);
      clearSafeApplyState(false);
    }
    if (!selected?.node || !change) {
      return { ok: false, status: "blocked", reason: "missing-selection", message: "変更対象を確認できません。" };
    }
    if (change.property === "rotation") {
      return { ok: false, status: "blocked", reason: "unsupported-property", message: "回転のSource反映はv0.1では自動化しません。" };
    }
    const mapping = selected.mapping || buildExistingWebRuntimeMappingCandidate(selected, change);
    if (!mapping) {
      return { ok: false, status: "blocked", reason: "runtime-mapping-unresolved", message: "変更対象のDOMを一意に確認できません。" };
    }
    const safeChangeResult = buildExistingWebRuntimeSafeChange(selected, mapping, change);
    if (!safeChangeResult.ok) {
      return {
        ok: false,
        status: "blocked",
        reason: "safe-change-blocked",
        message: safeChangeResult.errors?.join(" / ") || "Safe Change Instructionを作れません。",
        safeChangeResult,
        mapping,
      };
    }
    const instruction = safeChangeResult.instruction;
    const patchResult = buildExistingWebRuntimeSafePatchCandidate(instruction, mapping, change, options.sourceResolutionOverride || null);
    if (!patchResult.ok) {
      return {
        ok: false,
        status: patchResult.candidate?.status || "blocked",
        reason: patchResult.candidate?.blockReason?.code || "safe-patch-blocked",
        message: patchResult.candidate?.blockReason?.message || "Patch Candidateを安全に作れません。",
        safeChangeResult,
        patchResult,
        mapping,
      };
    }
    if (options.skipPreflight) {
      return {
        ok: true,
        status: "ready-for-review",
        reason: "",
        message: "Sourceの変更箇所を一意に確認できました。",
        safeChangeResult,
        patchResult,
        preflight: null,
        mapping,
      };
    }
    approveSafePatchCandidate();
    const preflight = await runSafeApplyPreflight();
    if (!preflight?.ok) {
      return {
        ok: false,
        status: preflight?.status || "preflight-blocked",
        reason: preflight?.reason || "preflight-blocked",
        message: preflight?.message || "Apply Preflightが通りません。",
        safeChangeResult,
        patchResult,
        preflight,
        mapping,
      };
    }
    return {
      ok: true,
      status: "ready-to-apply",
      reason: "",
      message: "Sourceの変更箇所を一意に確認できました。",
      safeChangeResult,
      patchResult,
      preflight,
      mapping,
    };
  }

  function buildExistingWebRuntimeMappingCandidate(selected, change) {
    const domRef = selected?.domRef || "";
    const node = selected?.node || getExistingWebNodeByDomRef(domRef);
    if (!domRef || !node) {
      return null;
    }
    const pageMeta = getAnalyzerManifestPageMeta();
    const tbId = sanitizeTbId(
      node.id
        ? node.id
        : domRef.replace(/^[#.]/, "").replace(/[^a-zA-Z0-9_-]+/g, "-"),
      "runtime-target",
    );
    const mapping = {
      mappingId: `runtime_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      runtimeOnly: true,
      source: "on-demand-source-resolution",
      pageId: pageMeta.pageId,
      page: {
        path: state.existingWeb.currentUrl || "",
        sourcePath: state.existingWeb.sourcePath || pageMeta.sourcePath,
        viewState: state.existingWeb.viewState || pageMeta.currentViewState || "",
      },
      sourceAuthority: "standard-web",
      tbId,
      domRef,
      selectorQuality: getSelectorQuality(domRef),
      role: selected.analyzerElement?.inferred?.roleCandidate || getExistingWebNormalElementType(selected),
      editableProperties: [change.property],
      protectedProperties: getExistingWebRuntimeProtectedProperties(selected, change),
      behaviorRef: getExistingWebBehaviorImpact(selected)?.state === "protected" ? "existing-behavior" : null,
      viewState: state.existingWeb.viewState || pageMeta.currentViewState || "",
      confirmed: false,
      confirmedBy: "runtime",
      confirmedAt: "",
    };
    state.analyzer.runtimeMappings = [
      ...(state.analyzer.runtimeMappings || []).filter((item) => item.mappingId !== mapping.mappingId),
      mapping,
    ].slice(-20);
    return mapping;
  }

  function getExistingWebRuntimeProtectedProperties(selected, change) {
    const protectedProperties = new Set(selected?.protectedProperties || []);
    ["click", "submit", "href", "src", "structure", "text", "behavior"].forEach((property) => protectedProperties.add(property));
    protectedProperties.delete(change?.property);
    return Array.from(protectedProperties);
  }

  function resolveExistingWebRuntimeDomNode(domRef) {
    if (!state.existingWeb.active) {
      return resolveAnalyzerDomNode(domRef);
    }
    return getExistingWebNodeByDomRef(domRef);
  }

  function buildExistingWebRuntimeSafeChange(selected, mapping, change) {
    if (!window.TBalanceSafeChange?.buildSafeChangeInstruction) {
      return { ok: false, errors: ["Safe Change moduleを読み込めていません。"] };
    }
    const protectedBehavior = getExistingWebProtectedBehavior(mapping) || selected?.protectedBehavior || null;
    const observed = change?.coordinateContext ? { coordinateContext: change.coordinateContext } : {};
    const result = window.TBalanceSafeChange.buildSafeChangeInstruction({
      projectId: getAnalyzerManifestPageMeta().projectId,
      sourcePath: mapping.page?.sourcePath || state.existingWeb.sourcePath,
      sourceAuthority: mapping.sourceAuthority || "standard-web",
      viewState: mapping.viewState || state.existingWeb.viewState || "",
      mapping,
      userIntent: formatExistingWebPreviewIntent(selected, change),
      domResolved: Boolean(resolveExistingWebRuntimeDomNode(mapping.domRef)),
      ambiguousMapping: false,
      protectedBehavior,
      changes: [{
        property: change.property,
        before: change.before,
        after: change.after,
        beforeSource: change.beforeSource || "runtime-confirmed",
        ...(observed.coordinateContext ? { coordinateContext: observed.coordinateContext } : {}),
      }],
    });
    if (result.ok) {
      state.analyzer.safeChange.targetMappingId = mapping.mappingId;
      state.analyzer.safeChange.property = change.property;
      state.analyzer.safeChange.intent = formatExistingWebPreviewIntent(selected, change);
      state.analyzer.safeChange.beforeSource = change.beforeSource || "runtime-confirmed";
      state.analyzer.safeChange.beforeText = JSON.stringify(change.before);
      state.analyzer.safeChange.afterText = JSON.stringify(change.after);
      state.analyzer.safeChange.json = result.instruction;
      state.analyzer.safeChange.summary = result.summary;
      setSafeChangeStatus(result.warnings?.length ? "warning" : "success", result.warnings?.length ? result.warnings.join(" / ") : "On-demand Source Resolution用のSafe Change Instructionを生成しました。");
    }
    return result;
  }

  function buildExistingWebRuntimeSafePatchCandidate(instruction, mapping, change, sourceResolutionOverride = null) {
    if (!window.TBalanceSafePatch?.buildPatchCandidate) {
      return { ok: false, candidate: { status: "blocked", blockReason: { code: "safe-patch-unavailable", message: "Safe Patch moduleを読み込めていません。" } } };
    }
    const sourceResolution = sourceResolutionOverride || resolveSafePatchSource(instruction, mapping, instruction?.changes?.[0] || change);
    const result = window.TBalanceSafePatch.buildPatchCandidate({
      instruction,
      mapping,
      pageMeta: getAnalyzerManifestPageMeta(),
      domResolved: Boolean(resolveExistingWebRuntimeDomNode(mapping.domRef)),
      ambiguousMapping: false,
      currentObserved: { ok: true, value: change.before },
      sourceResolution,
    });
    state.analyzer.safePatch.candidate = result.candidate;
    state.analyzer.safePatch.diffText = result.diffText;
    state.analyzer.safePatch.summary = buildSafePatchSummary(result.candidate);
    state.analyzer.safePatch.signature = result.signature;
    state.analyzer.safePatch.reviewStatus = "pending";
    state.analyzer.safePatch.approvedSignature = "";
    setSafePatchStatus(result.ok ? "pending" : result.candidate.status, result.ok ? "Patch Candidateを生成しました。Applyはまだ行いません。" : `Patch Candidate blocked: ${result.candidate.blockReason?.code || "unknown"}`);
    return result;
  }

  function getExistingWebReviewRequiredMessage(resolution) {
    const reason = resolution?.reason || resolution?.status || "";
    if (reason === "multiple-source-candidates") {
      return "この変更は自動では安全に反映できません。この要素の見た目を複数の設定が管理しています。";
    }
    if (reason === "source-location-unresolved") {
      return "この変更は自動では安全に反映できません。変更元のCSS設定を一意に特定できません。";
    }
    if (reason === "layout-dependency") {
      return "この変更は自動では安全に反映できません。周囲のレイアウトとの関係確認が必要です。";
    }
    if (reason === "unsupported-property") {
      return "この変更は自動では安全に反映できません。この種類の変更はv0.1では確認対象外です。";
    }
    if (reason === "preflight-blocked" || /preflight/i.test(reason)) {
      return "変更確認は完了しましたが、反映直前の安全確認を通過できませんでした。Sourceは変更していません。";
    }
    return resolution?.message || "変更確認は完了しましたが、自動反映には追加確認が必要です。";
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

  async function prepareExistingWebWorkflowAiReview() {
    const changes = getExistingWebWorkflowChanges();
    if (!changes.length) {
      markExistingWebWorkflowDirty("AI確認する変更がありません。");
      renderAll();
      return;
    }
    const workflow = getExistingWebWorkflow();
    if (workflow.analysisSignature && workflow.analysisSignature !== getExistingWebPreviewSignature()) {
      markExistingWebWorkflowDirty("Previewが再編集されています。変更を再確認してください。");
      renderAll();
      return;
    }
    const packageData = await buildFreshExistingWebWorkflowAiReviewPackage(changes);
    state.withAiShare.mode = "existing-web-ai-review";
    state.withAiShare.package = packageData;
    state.withAiShare.text = formatExistingWebAiReviewText(packageData);
    state.withAiShare.summary = `AI確認: 変更 ${changes.length}件`;
    state.withAiShare.details = JSON.stringify(packageData, null, 2);
    state.withAiShare.status = "idle";
    state.withAiShare.message = "AIに共有する内容を確認してから、AIと共有してください。";
    setExistingWebWorkflowAiReviewing("AIで確認中...");
    state.aiCollab = true;
    if (els.aiCollabPanel) {
      els.aiCollabPanel.hidden = false;
    }
    refreshAiCollabPanel();
    showModeToast("AI確認用Packageを準備しました。");
    renderAll();
  }

  async function buildFreshExistingWebWorkflowAiReviewPackage(changes) {
    const packageData = buildExistingWebWorkflowAiReviewPackage(changes);
    await refreshExistingWebAiReviewPackageSourceDeclarations(packageData);
    return packageData;
  }

  function buildExistingWebWorkflowAiReviewPackage(changes) {
    const requestRevision = createExistingWebAiRequestId(getExistingWebWorkflowAiRevisionSeed(changes));
    const targets = changes.map((change) => {
      const selected = selectExistingWebElementForWorkflowChange(change);
      const check = selected
        ? selected.check || getExistingWebCheck(selected.domRef) || runExistingWebLayerCheck(selected.analyzerElement, selected.node, selected.mapping, selected.protectedBehavior, { level: "confirm" })
        : null;
      const resolution = getExistingWebImpactResolutionForChange(change);
      return buildExistingWebAiReviewTargetPackage(selected, check, change, resolution, requestRevision);
    }).filter(Boolean);
    const base = {
      type: targets.length > 1 ? "existing-web-ai-review-batch" : "existing-web-ai-review",
      workflowReview: true,
      requestId: requestRevision,
      targetAi: "codex-local",
      project: { name: state.project?.name || "TBalance Project" },
      page: {
        pageId: state.existingWeb.pageId,
        sourcePath: state.existingWeb.sourcePath,
        viewState: state.existingWeb.viewState || "",
        pageViewState: state.existingWeb.viewState || "",
        currentUrl: state.existingWeb.currentUrl,
        sourceAuthority: state.existingWeb.sourceAuthority || "standard-web",
        adapterId: state.existingWeb.adapterId || state.analyzer.adapterId || "none",
        sourceFingerprint: getExistingWebFingerprint(),
        requestRevision,
      },
      viewport: getExistingWebAiViewportContext(),
      targets,
      userIntent: targets.length > 1
        ? "今回の複数Visual変更を、Partial Applyせず全件安全にSource反映できる候補へ整理したい。"
        : targets[0]?.userIntent || "今回のVisual変更を安全にSource反映できる候補へ整理したい。",
      responseFormat: buildExistingWebWorkflowAiResponseFormat(targets, requestRevision),
      safetyPolicy: {
        automaticApplyAllowed: false,
        sourceMutationAllowed: false,
        autoPromoteFromAiOnly: false,
        requiresTBalanceRevalidation: true,
        partialApplyAllowed: false,
      },
    };
    if (targets.length === 1) {
      base.target = targets[0].target;
      base.tbalanceAssessment = targets[0].tbalanceAssessment;
      base.cssContext = targets[0].cssContext;
      base.sourceProvenance = targets[0].sourceProvenance;
      base.protectedBehavior = targets[0].protectedBehavior;
      base.aiResultContract = ["safe-candidate", "needs-review"];
    }
    return base;
  }

  function buildExistingWebAiReviewTargetPackage(selected, check, change, resolution, requestId = "") {
    if (!selected || !change) {
      return null;
    }
    const computed = selected.computed || getExistingWebComputed(selected.node);
    const observed = selected.analyzerElement?.observed || {};
    const sourceSummary = summarizeExistingWebSourceResolution(resolution);
    const visualState = buildExistingWebAiVisualState(selected, change, computed);
    const sourceDeclarations = buildExistingWebAiSourceDeclarations(selected, change, resolution);
    return {
      requestId,
      target: {
        name: getExistingWebSelectionTitle(selected),
        domRef: selected.domRef,
        changeId: getExistingWebPreviewChangeId(change),
        tag: selected.tag,
        id: selected.id,
        className: selected.className,
        role: selected.analyzerElement?.inferred?.roleCandidate || "",
        bounds: selected.bounds,
        mappingCandidate: selected.mapping ? {
          tbId: selected.mapping.tbId,
          domRef: selected.mapping.domRef,
          role: selected.mapping.role,
          editableProperties: selected.mapping.editableProperties,
          protectedProperties: selected.mapping.protectedProperties,
          behaviorRef: selected.mapping.behaviorRef,
        } : null,
      },
      userIntent: formatExistingWebPreviewIntent(selected, change),
      userEdit: change.userEdit || null,
      visualChange: {
        property: change.property,
        before: change.before,
        after: change.after,
        beforeSource: change.beforeSource || "runtime-confirmed",
        coordinateContext: change.coordinateContext || "iframe-viewport-css-px",
        semanticDiff: formatExistingWebPreviewForNormal(change),
      },
      observedRuntime: {
        observedVisualChange: change.observedVisualChange || null,
        runtimeDynamicDrift: change.runtimeDynamicDrift || null,
      },
      visualState,
      pageViewState: state.existingWeb.viewState || "",
      viewport: getExistingWebAiViewportContext(selected.node),
      runtimePreview: {
        runtimePreviewOnly: true,
        previewMechanism: getExistingWebPreviewMechanism(change),
        sourceUnchanged: true,
      },
      visualEvidence: {
        computed: {
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          positionType: computed.positionType,
          left: computed.left,
          top: computed.top,
          width: computed.width,
          height: computed.height,
          transform: computed.transform,
          rotate: computed.rotate,
        },
        bounds: selected.bounds,
        backgroundImage: observed.backgroundImage || "",
      },
      sourceProvenance: {
        status: resolution?.status || "review_required",
        reason: resolution?.reason || "",
        message: resolution?.message || getExistingWebReviewRequiredMessage(resolution),
        sourceResolution: sourceSummary,
        sourceCandidates: getExistingWebResolutionCandidates(resolution),
        sourceDeclarations,
      },
      behaviorEvidence: getExistingWebBehaviorEvidence(selected),
      protectedBehavior: selected.protectedBehavior || getExistingWebProtectedBehavior(selected.mapping) || null,
      doNotChange: [
        "click behavior",
        "navigation",
        "form behavior",
        "animation",
        "other protected behavior",
      ],
      tbalanceAssessment: {
        status: check?.status || { key: "review_required", label: "確認が必要" },
        propertyChecks: check?.checks || [],
        editableProperties: check?.editableProperties || [],
        protectedProperties: check?.protectedProperties || [],
        blockedReasons: check?.blockedReasons || [],
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
      ask: {
        sourcePath: "変更すべきSource File",
        selector: "変更すべきSelector",
        property: "変更すべきCSS property",
        before: "SOURCE_DECLARATION.sourceValue と一致する現在Source上のBefore値",
        after: "Visual Intentに合うAfter値。Runtime Preview値をSource値と混同しないこと。",
        reason: "そこが最も安全な理由",
        preserve: "変更してはいけない関連設定",
      },
    };
  }

  function getExistingWebAiViewportContext(node = null) {
    const win = node?.ownerDocument?.defaultView || state.existingWeb.frame?.contentWindow || null;
    const viewportMode = state.viewport === "mobile" ? "mobile" : "desktop";
    return {
      viewportMode,
      viewportWidth: Math.round(Number(win?.innerWidth || state.existingWeb.frame?.clientWidth || 0)),
      viewportHeight: Math.round(Number(win?.innerHeight || state.existingWeb.frame?.clientHeight || 0)),
    };
  }

  function buildExistingWebAiVisualState(selected, change, computed = {}) {
    const beforeInline = change.beforeInline || {};
    const afterInline = change.afterInline || {};
    return {
      changeId: getExistingWebPreviewChangeId(change),
      property: change.property || "",
      userEdit: change.userEdit || null,
      beforeVisual: buildExistingWebAiVisualSnapshot(change.before, beforeInline, computed, change),
      afterPreview: buildExistingWebAiVisualSnapshot(change.after, afterInline, computed, change),
      delta: buildExistingWebAiVisualDelta(change),
      observedVisualChange: change.observedVisualChange || null,
      runtimeDynamicDrift: change.runtimeDynamicDrift || null,
      coordinateContext: change.coordinateContext || "iframe-viewport-css-px",
      originalSourceUnchanged: true,
      selectedBounds: selected?.bounds || null,
    };
  }

  function buildExistingWebAiVisualSnapshot(value = {}, inline = {}, computed = {}, change = {}) {
    const translate = parseExistingWebTranslate(inline.translate || "");
    return {
      x: Number.isFinite(Number(value.x)) ? Number(value.x) : null,
      y: Number.isFinite(Number(value.y)) ? Number(value.y) : null,
      width: Number.isFinite(Number(value.width)) ? Number(value.width) : null,
      height: Number.isFinite(Number(value.height)) ? Number(value.height) : null,
      rotation: Number.isFinite(Number(value.rotation)) ? Number(value.rotation) : null,
      translateX: translate.x,
      translateY: translate.y,
      computedLeft: inline.left || computed.left || "",
      computedTop: inline.top || computed.top || "",
      inlineTransform: inline.transform || "",
      inlineTranslate: inline.translate || "",
      beforeSource: change.beforeSource || "runtime-confirmed",
    };
  }

  function buildExistingWebAiVisualDelta(change = {}) {
    if (change.userEdit?.type === "move") {
      return {
        x: roundExistingWebNumber(change.userEdit.deltaX),
        y: roundExistingWebNumber(change.userEdit.deltaY),
      };
    }
    if (change.userEdit?.type === "resize") {
      return {
        width: roundExistingWebNumber(change.userEdit.widthDelta),
        height: roundExistingWebNumber(change.userEdit.heightDelta),
      };
    }
    if (change.userEdit?.type === "rotate") {
      return {
        rotation: normalizeExistingWebAngle(change.userEdit.rotationDelta),
      };
    }
    const before = change.before || {};
    const after = change.after || {};
    const delta = {};
    ["x", "y", "width", "height", "rotation"].forEach((key) => {
      if (Number.isFinite(Number(before[key])) && Number.isFinite(Number(after[key]))) {
        delta[key] = Math.round((Number(after[key]) - Number(before[key])) * 100) / 100;
      }
    });
    return delta;
  }

  function getExistingWebPreviewChangeId(change = {}) {
    return createStableHash([
      change.domRef || "",
      change.property || "",
      JSON.stringify(change.before || {}),
      JSON.stringify(change.after || {}),
      getExistingWebPreviewSignature(),
    ].join("\n"));
  }

  function getExistingWebPreviewMechanism(change = {}) {
    if (change.afterInline?.translate && change.afterInline.translate !== change.beforeInline?.translate) {
      return "translate";
    }
    if (change.afterInline?.transform && change.afterInline.transform !== change.beforeInline?.transform) {
      return "transform";
    }
    if (change.afterInline?.rotate && change.afterInline.rotate !== change.beforeInline?.rotate) {
      return "rotate";
    }
    if (change.afterInline?.left !== change.beforeInline?.left || change.afterInline?.top !== change.beforeInline?.top) {
      return "inline-position";
    }
    if (change.afterInline?.width !== change.beforeInline?.width || change.afterInline?.height !== change.beforeInline?.height) {
      return "inline-size";
    }
    return "runtime-inline-style";
  }

  function buildExistingWebAiSourceDeclarations(selected, change, resolution) {
    const node = selected?.node || getExistingWebNodeByDomRef(selected?.domRef);
    const declarations = getPatchCssDeclarationsForChange(change.property, change);
    const candidates = declarations.flatMap((declaration) => (
      node ? findCssDeclarationSourcesForReview(node, declaration.cssProperty) : []
    ));
    const active = candidates.filter((candidate) => candidate.activeAtCurrentViewport);
    const inactive = candidates.filter((candidate) => !candidate.activeAtCurrentViewport);
    const winning = active.find((candidate) => candidate.winningDeclaration) || null;
    return {
      runtimePreviewOnly: true,
      sourceUnchanged: true,
      requestedProperties: declarations.map((declaration) => declaration.cssProperty),
      sourceResolutionStatus: resolution?.status || "review_required",
      sourceResolutionReason: resolution?.reason || "",
      sourceDeclarations: candidates.map(formatExistingWebAiSourceDeclaration),
      activeMatchedRules: active.map(formatExistingWebAiSourceDeclaration),
      inactiveResponsiveRules: inactive.filter((candidate) => candidate.mediaQuery).map(formatExistingWebAiSourceDeclaration),
      inlineStyle: candidates.filter((candidate) => candidate.kind === "inline-style").map(formatExistingWebAiSourceDeclaration),
      cssVariables: [],
      animationTransformRules: getExistingWebAiAnimationTransformRules(selected),
      winningDeclaration: winning ? formatExistingWebAiSourceDeclaration(winning) : null,
    };
  }

  async function refreshExistingWebAiReviewPackageSourceDeclarations(packageData) {
    const targets = Array.isArray(packageData?.targets)
      ? packageData.targets
      : packageData?.target
        ? [packageData]
        : [];
    const sourcePaths = new Set();
    targets.forEach((targetPackage) => {
      collectExistingWebAiSourceDeclarationItems(targetPackage).forEach((item) => {
        const sourcePath = normalizeExistingWebSourcePath(item.sourcePath || item.path || "");
        if (sourcePath && sourcePath.toLowerCase().endsWith(".css") && item.sourceType !== "inline-style") {
          sourcePaths.add(sourcePath);
        }
      });
    });
    const sourceSnapshots = {};
    for (const sourcePath of sourcePaths) {
      sourceSnapshots[sourcePath] = await readExistingWebFreshSource(sourcePath);
    }
    targets.forEach((targetPackage) => {
      refreshExistingWebAiTargetSourceDeclarations(targetPackage, sourceSnapshots);
    });
    const revisionParts = Object.entries(sourceSnapshots)
      .map(([sourcePath, snapshot]) => `${sourcePath}:${snapshot?.sha256 || snapshot?.errorCode || "unread"}`)
      .sort();
    const sourceSnapshotRevision = revisionParts.length ? createStableHash(revisionParts.join("|")) : "";
    const page = packageData.page || {};
    packageData.page = {
      ...page,
      sourceSnapshotRevision,
      sourceSnapshotFingerprint: sourceSnapshotRevision,
      sourceFiles: Object.fromEntries(Object.entries(sourceSnapshots).map(([sourcePath, snapshot]) => [sourcePath, {
        path: sourcePath,
        sha256: snapshot?.sha256 || "",
        ok: Boolean(snapshot?.ok),
        errorCode: snapshot?.errorCode || "",
      }])),
    };
    packageData.sourceSnapshotRevision = sourceSnapshotRevision;
    packageData.sourceSnapshotFingerprint = sourceSnapshotRevision;
    if (packageData.responseFormat) {
      packageData.responseFormat = {
        ...packageData.responseFormat,
        sourceSnapshotRevision,
        sourceSnapshotFingerprint: sourceSnapshotRevision,
      };
    }
    return packageData;
  }

  function collectExistingWebAiSourceDeclarationItems(targetPackage = {}) {
    const provenance = targetPackage.sourceProvenance || {};
    const declarations = provenance.sourceDeclarations || {};
    const items = [];
    [
      declarations.sourceDeclarations,
      declarations.activeMatchedRules,
      declarations.inactiveResponsiveRules,
      declarations.inlineStyle,
      declarations.winningDeclaration ? [declarations.winningDeclaration] : [],
    ].forEach((list) => {
      (Array.isArray(list) ? list : []).forEach((item) => {
        if (item && typeof item === "object") {
          items.push(item);
        }
      });
    });
    return items;
  }

  function refreshExistingWebAiTargetSourceDeclarations(targetPackage, sourceSnapshots) {
    const items = collectExistingWebAiSourceDeclarationItems(targetPackage);
    items.forEach((item) => {
      refreshExistingWebAiSourceDeclarationItem(item, sourceSnapshots);
    });
    const provenance = targetPackage.sourceProvenance || {};
    const declarations = provenance.sourceDeclarations || {};
    const sourceFreshness = summarizeExistingWebSourceDeclarationFreshness(items);
    const hasFreshSource = sourceFreshness.fresh > 0 || sourceFreshness.refreshed > 0;
    targetPackage.sourceProvenance = {
      ...provenance,
      status: hasFreshSource ? "fresh-source-declarations" : provenance.status,
      reason: hasFreshSource ? "" : provenance.reason,
      message: hasFreshSource ? "Source declarations were re-read from current local source immediately before AI review." : provenance.message,
      sourceResolution: hasFreshSource ? {
        status: "fresh-source-declarations",
        reason: "",
        message: "Current local source declarations are the canonical before values for this AI review package.",
      } : provenance.sourceResolution,
      sourceDeclarations: {
        ...declarations,
        sourceFreshness,
      },
    };
  }

  function refreshExistingWebAiSourceDeclarationItem(item, sourceSnapshots) {
    const sourcePath = normalizeExistingWebSourcePath(item.sourcePath || item.path || "");
    const snapshot = sourceSnapshots[sourcePath];
    const previousSourceValue = item.sourceValue || item.value || "";
    item.sourceSnapshotPath = sourcePath;
    item.sourceSnapshotRevision = snapshot?.sha256 || "";
    item.sourceFingerprint = snapshot?.sha256 || "";
    if (!snapshot?.ok) {
      item.sourceFreshness = {
        status: "unreadable",
        errorCode: snapshot?.errorCode || "source-read-failed",
        message: snapshot?.message || "Sourceを再読込できませんでした。",
      };
      return item;
    }
    const declaration = findCssDeclarationInFreshSource(snapshot.content || "", {
      selector: item.selector || "",
      property: item.property || "",
      media: item.mediaQuery || item.media || "",
    });
    if (!declaration) {
      item.sourceFreshness = {
        status: "missing-declaration",
        message: "現在Sourceからselector/propertyを確認できませんでした。",
      };
      return item;
    }
    item.sourceValue = declaration.value;
    item.media = declaration.media || "";
    item.mediaQuery = declaration.media || "";
    item.sourceFreshness = {
      status: "fresh-source",
      currentSourceValue: declaration.value,
      changedFromCachedSnapshot: Boolean(previousSourceValue && previousSourceValue !== declaration.value),
    };
    return item;
  }

  function summarizeExistingWebSourceDeclarationFreshness(items = []) {
    const summary = {
      total: items.length,
      fresh: 0,
      refreshed: 0,
      unreadable: 0,
      missing: 0,
    };
    items.forEach((item) => {
      const status = item?.sourceFreshness?.status || "";
      if (status === "fresh-source") summary.fresh += 1;
      else if (status === "refreshed-from-source") summary.refreshed += 1;
      else if (status === "unreadable") summary.unreadable += 1;
      else if (status === "missing-declaration") summary.missing += 1;
    });
    return summary;
  }

  function formatExistingWebAiSourceDeclaration(candidate = {}) {
    return {
      sourcePath: candidate.sourcePath || candidate.path || "",
      selector: candidate.selector || "",
      property: candidate.property || "",
      sourceValue: candidate.value || "",
      media: candidate.media || "",
      mediaQuery: candidate.mediaQuery || candidate.media || "",
      mediaMatchesCurrentViewport: Boolean(candidate.mediaMatchesCurrentViewport),
      activeAtCurrentViewport: Boolean(candidate.activeAtCurrentViewport),
      specificity: candidate.specificity || [0, 0, 0],
      cascadeOrder: Number(candidate.cascadeOrder || 0),
      overridden: Boolean(candidate.overridden),
      sourceType: candidate.kind || "stylesheet-rule",
      priority: candidate.priority || "",
    };
  }

  async function readExistingWebFreshSource(sourcePath) {
    const normalizedPath = normalizeExistingWebSourcePath(sourcePath);
    if (!normalizedPath || !normalizedPath.toLowerCase().endsWith(".css")) {
      return { ok: false, path: normalizedPath, errorCode: "unsupported-source-type", message: "CSS Sourceだけ再読込できます。" };
    }
    try {
      const response = await fetch(`${SOURCE_WRITER_URL}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: normalizedPath }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        return {
          ok: false,
          path: normalizedPath,
          errorCode: payload?.errorCode || `http-${response.status}`,
          message: payload?.error || payload?.message || "Sourceを再読込できませんでした。",
        };
      }
      return {
        ok: true,
        path: normalizeExistingWebSourcePath(payload.path || normalizedPath),
        sha256: payload.sha256 || "",
        revision: payload.sha256 || "",
        content: String(payload.content || ""),
      };
    } catch (error) {
      return {
        ok: false,
        path: normalizedPath,
        errorCode: "source-read-failed",
        message: error?.message || String(error || ""),
      };
    }
  }

  async function readExistingWebFreshCssDeclaration(sourceChange) {
    const sourcePath = normalizeExistingWebSourcePath(sourceChange?.sourcePath || sourceChange?.path || "");
    const snapshot = await readExistingWebFreshSource(sourcePath);
    if (!snapshot.ok) {
      return { ok: false, snapshot, reason: snapshot.errorCode || "source-read-failed", message: snapshot.message || "Sourceを再読込できませんでした。" };
    }
    const declaration = findCssDeclarationInFreshSource(snapshot.content || "", {
      selector: sourceChange.selector || "",
      property: sourceChange.property || "",
      media: sourceChange.media || sourceChange.mediaQuery || "",
    });
    if (!declaration) {
      return {
        ok: false,
        snapshot,
        reason: "source-declaration-not-found",
        message: "現在SourceからAI候補のselector/propertyを確認できません。",
      };
    }
    return { ok: true, snapshot, declaration };
  }

  function findCssDeclarationInFreshSource(cssText, query = {}) {
    const selector = normalizeCssSelectorText(query.selector);
    const property = String(query.property || "").trim().toLowerCase();
    const media = normalizeCssMediaText(query.media || "");
    if (!selector || !property) {
      return null;
    }
    const rules = parseCssSourceRules(cssText);
    const exactMatches = rules.filter((rule) => (
      normalizeCssSelectorText(rule.selector) === selector
      && rule.declarations.some((declaration) => declaration.property === property)
      && normalizeCssMediaText(rule.media) === media
    ));
    const matches = exactMatches.length ? exactMatches : rules.filter((rule) => (
      cssSelectorListContains(rule.selector, selector)
      && rule.declarations.some((declaration) => declaration.property === property)
      && normalizeCssMediaText(rule.media) === media
    ));
    const rule = matches[matches.length - 1] || null;
    const declaration = rule?.declarations.find((item) => item.property === property);
    return declaration ? { selector: rule.selector, property, value: declaration.value, priority: declaration.priority || "", media: rule.media || "" } : null;
  }

  function parseCssSourceRules(cssText, mediaText = "") {
    const text = String(cssText || "").replace(/\/\*[\s\S]*?\*\//g, "");
    const rules = [];
    let cursor = 0;
    while (cursor < text.length) {
      const open = text.indexOf("{", cursor);
      if (open === -1) {
        break;
      }
      const head = text.slice(cursor, open).trim();
      const close = findMatchingCssBrace(text, open);
      if (close === -1) {
        break;
      }
      const body = text.slice(open + 1, close);
      if (/^@(media|supports)\b/i.test(head)) {
        const condition = head.replace(/^@(media|supports)\s*/i, "").trim();
        rules.push(...parseCssSourceRules(body, condition || mediaText));
      } else if (!head.startsWith("@")) {
        rules.push({
          selector: head,
          media: mediaText || "",
          declarations: parseCssDeclarationsFromSourceBlock(body),
        });
      }
      cursor = close + 1;
    }
    return rules;
  }

  function findMatchingCssBrace(text, openIndex) {
    let depth = 0;
    for (let index = openIndex; index < text.length; index += 1) {
      const char = text[index];
      if (char === "{") {
        depth += 1;
      } else if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          return index;
        }
      }
    }
    return -1;
  }

  function parseCssDeclarationsFromSourceBlock(block) {
    return String(block || "").split(";").map((entry) => {
      const colon = entry.indexOf(":");
      if (colon === -1) {
        return null;
      }
      const property = entry.slice(0, colon).trim().toLowerCase();
      let value = entry.slice(colon + 1).trim();
      const important = /\s*!important\s*$/i.test(value);
      value = value.replace(/\s*!important\s*$/i, "").trim();
      return property ? { property, value, priority: important ? "important" : "" } : null;
    }).filter(Boolean);
  }

  function normalizeCssSelectorText(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
  }

  function normalizeCssMediaText(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
  }

  function cssSelectorListContains(selectorList, selector) {
    const normalized = normalizeCssSelectorText(selector);
    return String(selectorList || "").split(",").some((part) => normalizeCssSelectorText(part) === normalized);
  }

  function getExistingWebAiAnimationTransformRules(selected) {
    const computed = selected?.computed || (selected?.node ? getExistingWebComputed(selected.node) : {});
    return {
      hasComputedTransform: Boolean(computed.transform),
      transform: computed.transform || "",
      rotate: computed.rotate || "",
      note: computed.transform ? "transform is currently active; avoid overwriting animation/transform without exact provenance." : "",
    };
  }

  function buildExistingWebWorkflowAiResponseFormat(targets, requestRevision) {
    return {
      schemaVersion: "1.0",
      requestId: requestRevision,
      pageId: state.existingWeb.pageId,
      sourcePath: state.existingWeb.sourcePath,
      viewState: state.existingWeb.viewState || "",
      pageViewState: state.existingWeb.viewState || "",
      viewportMode: state.viewport === "mobile" ? "mobile" : "desktop",
      sourceFingerprint: getExistingWebFingerprint(),
      requestRevision,
      status: "safe-candidate|unresolved|unsafe",
      targets: targets.map((item) => ({
        domRef: item.target.domRef,
        changeId: item.visualState?.changeId || "",
        status: "safe-candidate|unresolved|unsafe",
        sourceChanges: [{
          sourcePath: "css/example.css",
          sourceType: "stylesheet-rule",
          selector: "#target",
          property: "left",
          before: "10px",
          after: "20px",
          media: "",
        }],
        sourceChange: {
          sourcePath: "css/example.css",
          sourceType: "stylesheet-rule",
          selector: "#target",
          property: "left",
          before: "10px",
          after: "20px",
          media: "",
        },
        preserve: ["animation", "click behavior", "navigation"],
        reason: "",
        confidence: "high|medium|low",
      })),
    };
  }

  function getExistingWebWorkflowAiRevisionSeed(changes = getExistingWebWorkflowChanges()) {
    return `workflow:${getExistingWebPreviewSignature()}:${changes.map((change) => change.domRef || "").join("|")}`;
  }

  function getExistingWebImpactResolutionForChange(change) {
    const impact = state.existingWeb.impactAnalysis;
    if (!impact) {
      return null;
    }
    if (impact.batch) {
      const item = (impact.items || []).find((entry) => entry.domRef === change.domRef && entry.preview?.property === change.property);
      return item?.sourceResolution || item || null;
    }
    return impact.sourceResolution || impact.resolution || impact;
  }

  function getExistingWebResolutionCandidates(resolution) {
    const candidate = resolution?.patchResult?.candidate || resolution?.candidate || null;
    const direct = resolution?.candidates || candidate?.blockReason?.candidates || candidate?.validationChecks?.sourceResolution?.candidates;
    if (Array.isArray(direct)) {
      return direct;
    }
    return [];
  }

  function getExistingWebBehaviorEvidence(selected) {
    const tag = String(selected?.tag || "").toLowerCase();
    return {
      clickableTag: ["a", "button", "input", "select", "textarea", "summary", "details"].includes(tag),
      href: selected?.node?.getAttribute?.("href") || "",
      formAction: selected?.node?.getAttribute?.("action") || "",
      hasInlineHandler: Array.from(selected?.node?.attributes || []).some((attr) => /^on/i.test(attr.name)),
      protectedBehavior: Boolean(selected?.protectedBehavior),
    };
  }

  async function runExistingWebAutomaticSafetyReview(changes, localResolution) {
    const reviewable = canUseAutomaticSafetyReview(localResolution);
    if (!reviewable.ok) {
      setExistingWebWorkflowManualReviewRequired(reviewable.message || getExistingWebReviewRequiredMessage(localResolution), {
        localResolution,
        reason: reviewable.reason,
      });
      return null;
    }
    const packageData = await buildFreshExistingWebWorkflowAiReviewPackage(changes);
    const requestId = packageData.page?.requestRevision || createExistingWebAiRequestId(getExistingWebWorkflowAiRevisionSeed(changes));
    const signature = getExistingWebPreviewSignature();
    setExistingWebWorkflowAiReviewing("AIで確認中...", requestId);
    renderAll();
    try {
      const response = await fetch(SAFETY_AI_REVIEW_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "codex-local",
          requestId,
          pageId: packageData.page?.pageId || state.existingWeb.pageId,
          revision: packageData.page?.requestRevision || requestId,
          fingerprint: packageData.page?.sourceFingerprint || getExistingWebFingerprint(),
          sourceSnapshotRevision: packageData.page?.sourceSnapshotRevision || "",
          sourceSnapshotFingerprint: packageData.page?.sourceSnapshotFingerprint || "",
          reviewPackage: packageData,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        const promoted = await promoteExistingWebReadySubsetFromResolution(localResolution, changes, payload?.message || "AI補助確認を利用できませんでした。");
        if (promoted) {
          return payload || null;
        }
        setExistingWebWorkflowManualReviewRequired(payload?.message || "AI補助確認を利用できませんでした。", {
          localResolution,
          providerResult: payload,
        });
        return payload || null;
      }
      const workflow = getExistingWebWorkflow();
      if (workflow.aiReviewRequestId !== requestId || workflow.aiReviewSignature !== signature || signature !== getExistingWebPreviewSignature()) {
        markExistingWebWorkflowDirty("AI確認中にPreviewが変更されました。変更を再確認してください。");
        return payload;
      }
      const result = await applyExistingWebAiReviewResult(payload.response || payload, {
        providerResult: payload,
        localResolution,
        forceWorkflowRevalidation: true,
      });
      if (!result?.ok) {
        setExistingWebWorkflowManualReviewRequired(result?.message || "この変更は自動で安全確認できませんでした。", {
          localResolution,
          providerResult: payload,
          revalidation: result?.revalidation || result,
          safetyAiDiagnostic: result?.safetyAiDiagnostic || buildExistingWebSafetyAiDiagnostic({
            providerResult: payload,
            localResolution,
            revalidation: result?.revalidation || result,
          }),
        });
      } else {
        const aiResolution = buildExistingWebResolutionFromAiRevalidation(result.revalidation, changes);
        if (aiResolution) {
          state.existingWeb.impactAnalysis = buildExistingWebWorkflowImpactAnalysis(aiResolution, changes);
        }
      }
      return result;
    } catch (error) {
      const promoted = await promoteExistingWebReadySubsetFromResolution(localResolution, changes, "AI補助確認を利用できませんでした。");
      if (promoted) {
        return null;
      }
      setExistingWebWorkflowManualReviewRequired("AI補助確認を利用できませんでした。", {
        localResolution,
        error: error?.message || String(error || ""),
      });
      return null;
    } finally {
      renderAll();
    }
  }

  async function promoteExistingWebReadySubsetFromResolution(localResolution, changes, fallbackMessage = "") {
    const items = getExistingWebFinalResolutionItems(localResolution, changes);
    const summary = summarizeExistingWebFinalResolutionItems(items, changes?.length || items.length);
    const ready = getExistingWebReadyItemsForPreflight(items);
    if (!ready.candidates.length || !window.TBalanceSafeApply?.runBatchApplyPreflight) {
      return false;
    }
    const preflight = localResolution?.batchPreflight?.ok && Number(localResolution.batchPreflight.summary?.totalCandidates || localResolution.batchPreflight.operations?.length || 0) === ready.candidates.length
      ? localResolution.batchPreflight
      : await window.TBalanceSafeApply.runBatchApplyPreflight({
          candidates: ready.candidates,
          approvedSignatures: ready.approvedSignatures,
          sourceWriterClient: getSafeApplyClient(),
          createSignature: window.TBalanceSafePatch?.createCandidateSignature,
        });
    if (!preflight?.ok) {
      return false;
    }
    state.analyzer.safeApply.preflight = preflight;
    state.analyzer.safeApply.result = preflight;
    state.analyzer.safeApply.diffText = preflight.diffText || "";
    const normalizedResolution = {
      ...localResolution,
      status: summary.ready >= summary.total ? "ready_to_apply" : "mixed_ready",
      ok: summary.ready >= summary.total,
      summary: {
        total: summary.total,
        safe: summary.ready,
        review: summary.review,
        blocked: summary.review + summary.blocked,
      },
      batchPreflight: preflight,
    };
    state.existingWeb.impactAnalysis = buildExistingWebWorkflowImpactAnalysis(normalizedResolution, changes);
    if (summary.ready >= summary.total) {
      setExistingWebWorkflowReadyToApply(`${summary.ready}件を反映できます。`);
    } else {
      setExistingWebWorkflowMixedReady(localResolution.message || fallbackMessage || "反映可能な変更があります。要確認の変更は反映しません。");
    }
    renderAll();
    return true;
  }

  function getExistingWebFinalResolutionItems(resolution, changes = []) {
    const rawItems = Array.isArray(resolution?.changes) ? resolution.changes : [];
    if (rawItems.length) {
      return rawItems.map((item) => ({
        change: item.change || changes.find((change) => change?.domRef === item.domRef || change?.domRef === item.target?.domRef) || null,
        selected: item.selected || null,
        resolution: item.resolution || item,
      }));
    }
    return (changes || []).map((change) => ({
      change,
      selected: selectExistingWebElementForWorkflowChange(change),
      resolution: resolution || {},
    }));
  }

  function getExistingWebFinalItemCandidate(item) {
    return item?.candidate
      || item?.resolution?.patchResult?.candidate
      || item?.resolution?.candidate
      || null;
  }

  function isExistingWebFinalItemReady(item) {
    const resolution = item?.resolution || item || {};
    const status = String(resolution.status || item?.status || "").replace(/_/g, "-");
    return Boolean(
      resolution.ok
      || item?.ok
      || ["ready-for-review", "ready-to-apply", "safe", "safe-candidate"].includes(status)
    );
  }

  function summarizeExistingWebFinalResolutionItems(items = [], fallbackTotal = 0) {
    const total = Number(fallbackTotal || items.length || 0);
    let ready = 0;
    let blocked = 0;
    let review = 0;
    items.forEach((item) => {
      if (isExistingWebFinalItemReady(item)) {
        ready += 1;
        return;
      }
      const resolution = item?.resolution || item || {};
      const status = String(resolution.status || item?.status || "");
      if (status === "blocked" || resolution.reason === "protected-property" || resolution.reason === "safe-change-blocked") {
        blocked += 1;
      } else {
        review += 1;
      }
    });
    const missing = Math.max(0, total - items.length);
    return { total, ready, review: review + missing, blocked };
  }

  function getExistingWebReadyItemsForPreflight(items = []) {
    const candidates = [];
    const approvedSignatures = {};
    items.forEach((item) => {
      if (!isExistingWebFinalItemReady(item)) {
        return;
      }
      const candidate = getExistingWebFinalItemCandidate(item);
      if (!candidate || candidate.status !== "ready-for-review") {
        return;
      }
      candidate.review = {
        ...(candidate.review || {}),
        status: "approved",
        approvedAt: candidate.review?.approvedAt || new Date().toISOString(),
        rejectedAt: null,
        approvedSignature: candidate.signature,
      };
      candidates.push(candidate);
      if (candidate.signature) {
        approvedSignatures[candidate.signature] = candidate.signature;
      }
    });
    return { candidates, approvedSignatures };
  }

  function canUseAutomaticSafetyReview(resolution) {
    if (!resolution) {
      return { ok: true };
    }
    const reason = resolution.reason || resolution.status || "";
    if (["protected-property", "safe-change-blocked", "missing-selection", "runtime-mapping-unresolved"].includes(reason)) {
      return { ok: false, reason, message: getExistingWebReviewRequiredMessage(resolution) };
    }
    if (resolution.batch) {
      const items = resolution.changes || [];
      const unsafe = items.find((item) => {
        const itemReason = item.resolution?.reason || item.resolution?.status || "";
        return ["protected-property", "safe-change-blocked", "missing-selection", "runtime-mapping-unresolved"].includes(itemReason);
      });
      if (unsafe) {
        return { ok: false, reason: unsafe.resolution?.reason || unsafe.resolution?.status || "blocked", message: getExistingWebReviewRequiredMessage(unsafe.resolution) };
      }
    }
    return { ok: true };
  }

  function buildExistingWebResolutionFromAiRevalidation(revalidation, changes) {
    if (!revalidation?.ok) {
      return null;
    }
    const items = Array.isArray(revalidation.items) ? revalidation.items : [];
    if (changes.length > 1) {
      const mappedChanges = changes.map((change) => {
        const item = items.find((entry) => entry.change?.domRef === change.domRef && entry.change?.property === change.property) || {};
        const resolution = item.ok === false
          ? {
              ok: false,
              status: item.status || "review_required",
              reason: item.reason || "ai-revalidation-required",
              message: item.message || item.reason || "この変更は追加確認が必要です。",
            }
          : item.resolution || { ok: true, status: "ready-to-apply", message: "AI候補を再検証済みです。" };
        return {
          change,
          selected: item.selected || selectExistingWebElementForWorkflowChange(change),
          resolution,
        };
      });
      const finalSummary = summarizeExistingWebFinalResolutionItems(mappedChanges, changes.length);
      return {
        ok: true,
        batch: true,
        status: finalSummary.ready >= finalSummary.total ? "ready_to_apply" : "mixed_ready",
        message: revalidation.message || "AI候補をTBalanceで再確認しました。",
        changes: mappedChanges,
        batchPreflight: revalidation.preflight || null,
        summary: {
          total: finalSummary.total,
          safe: finalSummary.ready,
          review: finalSummary.review,
          blocked: finalSummary.review + finalSummary.blocked,
        },
      };
    }
    const item = items[0] || {};
    return {
      ok: true,
      batch: false,
      status: "ready-to-apply",
      message: revalidation.message || "AI候補をTBalanceで再確認しました。",
      changes: [{
        change: changes[0],
        selected: item.selected || selectExistingWebElementForWorkflowChange(changes[0]),
        resolution: item.resolution || { ok: true, status: "ready-to-apply", preflight: revalidation.preflight || null },
      }],
      preflight: revalidation.preflight || null,
    };
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
        packageData.workflowReview
          ? "TBalance Existing Web のVisual Preview変更を、Source反映候補としてAI確認したいです。"
          : "TBalance Existing Web のAI確認が必要な要素だけをまとめて確認したいです。",
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
        packageData.workflowReview
          ? "各対象について、変更してよいSource file / selector / CSS property / before / after を返してください。"
          : "各対象について position / width / height / click behavior をproperty単位で見てください。",
        "USER_INTENT / userEdit が、ユーザーが実際に行った編集操作の正本です。",
        "OBSERVED_RUNTIME / observedVisualChange には既存animation等のruntime motionが混ざる場合があります。",
        "SOURCE_DECLARATIONS / sourceValue は送信直前にローカルSource Fileを再読込したliteral値です。computedStyleやRuntime Preview値ではありません。",
        "userEditに含まれないruntime motionをSource変更Intentとして扱わないでください。",
        "既存animation / transition / click behavior / navigation は保持してください。",
        "AIの回答だけで自動許可はしません。TBalance側でSource候補・Before値・Safe Patch/Apply Preflightを再検証します。",
        "回答は共有データ内の responseFormat と同じJSON形式だけで返してください。",
        "",
        "【共有データ】",
        JSON.stringify(packageData, null, 2),
      ].join("\n");
    }
    const isWorkflowReview = Boolean(packageData.workflowReview);
    return [
      isWorkflowReview
        ? "TBalance Existing Web のVisual Preview変更を、Source反映候補としてAI確認したいです。"
        : "TBalance Existing Web の選択要素だけをAI確認したいです。",
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
      isWorkflowReview
        ? "変更してよいSource file / selector / CSS property / before / after を返してください。"
        : "position / width / height / click behavior をproperty単位で見てください。",
      "USER_INTENT / userEdit が、ユーザーが実際に行った編集操作の正本です。",
      "OBSERVED_RUNTIME / observedVisualChange には既存animation等のruntime motionが混ざる場合があります。",
      "SOURCE_DECLARATIONS / sourceValue は送信直前にローカルSource Fileを再読込したliteral値です。computedStyleやRuntime Preview値ではありません。",
      "userEditに含まれないruntime motionをSource変更Intentとして扱わないでください。",
      "既存animation / transition / click behavior / navigation は保持してください。",
      "AIの回答だけで自動許可はしません。TBalance側でSource候補・Before値・Safe Patch/Apply Preflightを再検証します。",
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
        message: "Existing Webで対象を選択すると、WITH AI相談用のContextを作成できます。",
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

  async function importExistingWebAiReviewResult() {
    const text = els.aiExistingWebResultText?.value || "";
    setExistingWebAiImportStatus("idle", "AI回答をTBalanceで確認中です。");
    try {
      const result = await applyExistingWebAiReviewResult(text);
      setExistingWebAiImportStatus(result.ok ? "ok" : "error", result.message || (result.ok ? "AI回答を取り込みました。" : "AI回答を取り込めませんでした。"));
      if (result.ok) {
        showModeToast(result.message || "AI回答をTBalanceで再照合しました。");
      }
    } catch (error) {
      const message = error?.message || String(error || "");
      console.warn("Existing Web AI result import failed", error);
      setExistingWebAiImportStatus("error", message || "AI回答を取り込めませんでした。");
    }
  }

  function setExistingWebAiImportStatus(status, message) {
    if (!els.aiExistingWebImportStatus) {
      return;
    }
    els.aiExistingWebImportStatus.dataset.status = status;
    els.aiExistingWebImportStatus.textContent = message;
  }

  async function applyExistingWebAiReviewResult(input = {}, options = {}) {
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
    const requiresSourceRevalidation = Boolean(options.forceWorkflowRevalidation) || isExistingWebWorkflowAiReviewActive(normalized);
    if (requiresSourceRevalidation) {
      setExistingWebWorkflowAiImported("AI回答をTBalanceで再確認中です。");
    }
    const applied = normalized.targets.map((target) => reconcileExistingWebAiTarget(target, normalized)).filter(Boolean);
    if (!applied.length) {
      if (requiresSourceRevalidation) {
        const safetyAiDiagnostic = buildExistingWebSafetyAiDiagnostic({
          providerResult: options.providerResult,
          normalized,
          localResolution: options.localResolution,
          revalidation: {
            ok: false,
            reason: "missing-reconcilable-target",
            message: "取り込めるAI確認対象がありませんでした。",
          },
        });
        setExistingWebWorkflowManualReviewRequired("AI回答を自動確認できませんでした。", { normalized, safetyAiDiagnostic });
      }
      return { ok: false, message: "取り込めるAI確認対象がありませんでした。" };
    }
    const revalidation = requiresSourceRevalidation
      ? awaitMaybeExistingWebAiRevalidation(normalized, applied)
      : { ok: true, skipped: true, message: `AI回答を${applied.length}件取り込み、TBalanceで再照合しました。` };
    refreshExistingWebVirtualLayers();
    if (state.existingWeb.selected) {
      applyExistingWebCheckToSelection(state.existingWeb.selected);
    }
    renderAll();
    const editableCount = applied.reduce((sum, item) => sum + (item.finalCheck.editableProperties?.length || 0), 0);
    if (!revalidation.ok) {
      const rejectionMessage = revalidation.message
        || revalidation.reason
        || revalidation.items?.find?.((item) => !item.ok)?.message
        || revalidation.items?.find?.((item) => !item.ok)?.reason
        || "AI候補を安全に確認できませんでした。";
      const safetyAiDiagnostic = buildExistingWebSafetyAiDiagnostic({
        providerResult: options.providerResult,
        normalized,
        localResolution: options.localResolution,
        revalidation,
      });
      setExistingWebWorkflowManualReviewRequired(rejectionMessage, {
        normalized,
        applied,
        revalidation,
        safetyAiDiagnostic,
      });
      renderAll();
      return {
        ok: false,
        result: "AI_REVIEW_REJECTED",
        targets: applied.length,
        editableProperties: editableCount,
        revalidation,
        safetyAiDiagnostic,
        message: rejectionMessage,
      };
    }
    if (requiresSourceRevalidation) {
      if (revalidation.status === "mixed_ready") {
        setExistingWebWorkflowMixedReady(revalidation.message || "反映可能なAI候補があります。要確認の変更は反映しません。");
      } else {
        setExistingWebWorkflowReadyToApply(revalidation.message || "AI候補をTBalanceで再確認しました。変更を反映できます。");
      }
      renderAll();
    }
    return {
      ok: true,
      result: requiresSourceRevalidation ? "AI_REVIEW_REVALIDATED" : "AI_REVIEW_IMPORTED",
      targets: applied.length,
      editableProperties: editableCount,
      revalidation,
      message: requiresSourceRevalidation
        ? `AI回答を${applied.length}件取り込み、TBalanceで再検証しました。`
        : `AI回答を${applied.length}件取り込みました。`,
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
      requestId: String(root.requestId || root.page?.requestId || payload.requestId || payload.response?.requestId || ""),
      status: String(root.status || root.result || ""),
      pageId: root.pageId || root.page?.pageId || "",
      sourcePath: normalizeExistingWebSourcePath(root.sourcePath || root.page?.sourcePath || ""),
      viewState: normalizeExistingWebViewState(root.viewState || root.page?.viewState || ""),
      sourceFingerprint: String(root.sourceFingerprint || root.page?.sourceFingerprint || ""),
      sourceSnapshotRevision: String(root.sourceSnapshotRevision || root.page?.sourceSnapshotRevision || ""),
      sourceSnapshotFingerprint: String(root.sourceSnapshotFingerprint || root.page?.sourceSnapshotFingerprint || ""),
      requestRevision: String(root.requestRevision || root.page?.requestRevision || ""),
      targets: targets.map((target) => normalizeExistingWebAiReviewTarget(target, root)).filter((target) => target.domRef),
      raw: payload,
    };
  }

  function normalizeExistingWebAiReviewTarget(target = {}, root = {}) {
    const properties = target.properties && typeof target.properties === "object"
      ? target.properties
      : buildExistingWebAiPropertiesFromLegacy(target);
    const sourceChanges = normalizeExistingWebAiSourceChanges(target.sourceChanges || target.sourceChange || target.sourcePatch || root.sourceChanges || root.sourceChange || null);
    if (!Object.keys(properties || {}).length && sourceChanges.length && /^safe-candidate$/i.test(target.status || target.result || root.status || "")) {
      sourceChanges.forEach((sourceChange) => {
        const visualProperty = getExistingWebVisualPropertyForCssProperty(sourceChange.property);
        if (visualProperty) {
          properties[visualProperty] = { result: "ok", reason: target.reason || sourceChange.reason || "AI Source候補あり" };
        }
      });
    }
    return {
      domRef: String(target.domRef || target.target?.domRef || ""),
      changeId: String(target.changeId || target.id || target.target?.changeId || ""),
      name: String(target.name || target.target?.name || ""),
      status: String(target.status || target.result || root.status || ""),
      sourceChange: sourceChanges[0] || null,
      sourceChanges,
      preserve: Array.isArray(target.preserve) ? target.preserve.map(String) : [],
      reason: String(target.reason || root.reason || ""),
      confidence: String(target.confidence || root.confidence || ""),
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

  function normalizeExistingWebAiSourceChange(sourceChange) {
    if (!sourceChange || typeof sourceChange !== "object") {
      return null;
    }
    const sourcePath = normalizeExistingWebSourcePath(sourceChange.sourcePath || sourceChange.path || "");
    const selector = String(sourceChange.selector || "").trim();
    const property = String(sourceChange.property || sourceChange.cssProperty || "").trim();
    if (!sourcePath || !selector || !property) {
      return null;
    }
    return {
      sourcePath,
      sourceType: sourceChange.sourceType || sourceChange.kind || "stylesheet-rule",
      selector,
      property,
      before: String(sourceChange.before ?? sourceChange.currentValue ?? ""),
      after: String(sourceChange.after ?? sourceChange.nextValue ?? ""),
      media: sourceChange.media || "",
      reason: String(sourceChange.reason || ""),
    };
  }

  function normalizeExistingWebAiSourceChanges(value) {
    const list = Array.isArray(value) ? value : value ? [value] : [];
    return list.map(normalizeExistingWebAiSourceChange).filter(Boolean);
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
    const expectedRevision = getExpectedExistingWebAiRequestRevision(normalized.targets.map((target) => target.domRef), normalized);
    if (normalized.requestRevision && normalized.requestRevision !== expectedRevision) {
      return { ok: false, message: "AI回答の依頼Revisionが現在の確認内容と一致しません。AI確認をやり直してください。" };
    }
    return { ok: true };
  }

  function getExpectedExistingWebAiRequestRevision(domRefs, normalized = {}) {
    if (isExistingWebWorkflowAiReviewActive(normalized)) {
      return createExistingWebAiRequestId(getExistingWebWorkflowAiRevisionSeed());
    }
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

  function isExistingWebWorkflowAiReviewActive(normalized = {}) {
    const workflow = getExistingWebWorkflow();
    const packageData = state.withAiShare.package || {};
    return Boolean(
      getExistingWebPreviewChangeCount()
      && (
        packageData.workflowReview
        || normalized.raw?.workflowReview
        || normalized.raw?.response?.workflowReview
        || workflow.aiReviewSignature
        || ["review_required", "ai_reviewing", "ai_response_imported"].includes(workflow.status)
      )
    );
  }

  async function awaitMaybeExistingWebAiRevalidation(normalized, applied) {
    try {
      return await revalidateExistingWebAiSourceCandidates(normalized, applied);
    } catch (error) {
      const message = error?.message || String(error || "");
      console.warn("Existing Web AI revalidation failed", error);
      return {
        ok: false,
        status: "review_required",
        reason: "ai-revalidation-error",
        message: message || "AI候補をTBalanceで再確認できませんでした。",
      };
    }
  }

  async function revalidateExistingWebAiSourceCandidates(normalized, applied) {
    const changes = getExistingWebWorkflowChanges();
    if (!changes.length) {
      return { ok: false, reason: "missing-preview", message: "Preview変更がありません。変更をやり直してください。" };
    }
    const workflow = getExistingWebWorkflow();
    const currentSignature = getExistingWebPreviewSignature();
    if (workflow.aiReviewSignature && workflow.aiReviewSignature !== currentSignature) {
      markExistingWebWorkflowDirty("AI確認後にPreviewが再編集されています。変更を再確認してください。");
      return {
        ok: false,
        reason: "stale-ai-response",
        message: "AI確認後に変更内容が変わっています。変更を再確認してください。",
        diagnostic: {
          checks: [{ code: "stale-signature", label: "stale signature", ok: false, message: "AI確認時と現在のPreview signatureが一致しません。" }],
          firstFailedCheck: "stale-signature",
          reasonCode: "ai-stale-response",
        },
      };
    }
    const byDomRef = new Map(changes.map((change) => [change.domRef, change]));
    const candidates = [];
    const approvedSignatures = {};
    const items = [];
    for (const target of normalized.targets) {
      const change = byDomRef.get(target.domRef);
      const appliedTarget = applied.find((item) => item.domRef === target.domRef);
      const item = await revalidateExistingWebAiTargetSourceCandidate(target, change, appliedTarget);
      items.push(item);
      if (item.ok && item.candidate) {
        candidates.push(item.candidate);
        approvedSignatures[item.candidate.signature] = item.candidate.signature;
      }
    }
    const blocked = items.filter((item) => !item.ok);
    const firstBlocked = blocked[0] || null;
    if (blocked.length || candidates.length !== changes.length) {
      if (candidates.length && window.TBalanceSafeApply?.runBatchApplyPreflight) {
        const preflight = await window.TBalanceSafeApply.runBatchApplyPreflight({
          candidates,
          approvedSignatures,
          sourceWriterClient: getSafeApplyClient(),
          createSignature: window.TBalanceSafePatch?.createCandidateSignature,
        });
        state.analyzer.safeApply.preflight = preflight?.ok ? preflight : null;
        state.analyzer.safeApply.result = preflight || null;
        state.analyzer.safeApply.diffText = preflight?.diffText || "";
        setSafeApplyStatus(
          preflight?.ok ? (preflight.status || "ready-to-apply") : (preflight?.status || "failed"),
          preflight?.ok
            ? `${candidates.length}件だけ反映可能です。要確認の変更は反映しません。`
            : preflight?.message || "反映可能なAI候補のPreflightが通りませんでした。",
        );
        if (preflight?.ok) {
          return {
            ok: true,
            status: "mixed_ready",
            message: `${changes.length}件中${candidates.length}件を反映できます。${blocked.length || changes.length - candidates.length}件は要確認です。`,
            items,
            preflight,
            summary: { total: changes.length, safe: candidates.length, blocked: blocked.length || changes.length - candidates.length },
          };
        }
      }
      return {
        ok: false,
        status: "review_required",
        reason: firstBlocked?.reason || "partial-ai-candidate",
        message: firstBlocked?.message || firstBlocked?.reason || "AI候補を全件安全に確認できませんでした。Partial Applyは行いません。",
        items,
        diagnostic: buildExistingWebAiRevalidationDiagnostic(normalized, changes, items, firstBlocked),
      };
    }
    if (candidates.length > 1) {
      if (!window.TBalanceSafeApply?.runBatchApplyPreflight) {
        return { ok: false, reason: "batch-apply-unavailable", message: "Batch Apply Preflightを実行できません。" };
      }
      const preflight = await window.TBalanceSafeApply.runBatchApplyPreflight({
        candidates,
        approvedSignatures,
        sourceWriterClient: getSafeApplyClient(),
        createSignature: window.TBalanceSafePatch?.createCandidateSignature,
      });
      state.analyzer.safeApply.preflight = preflight.ok ? preflight : null;
      state.analyzer.safeApply.result = preflight;
      state.analyzer.safeApply.diffText = preflight.diffText || "";
      setSafeApplyStatus(preflight.status || "failed", preflight.message || "AI候補のBatch Preflightを完了しました。");
      if (!preflight.ok) {
        return {
          ok: false,
          reason: preflight.reason || "preflight-blocked",
          message: preflight.message || "AI候補のPreflightが通りませんでした。",
          items,
          preflight,
          diagnostic: buildExistingWebAiRevalidationDiagnostic(normalized, changes, items, {
            reason: preflight.reason || "preflight-blocked",
            message: preflight.message || "AI候補のPreflightが通りませんでした。",
            preflight,
          }),
        };
      }
      return { ok: true, status: "ready_to_apply", message: "AI候補をTBalanceで再確認しました。変更を反映できます。", items, preflight };
    }
    state.analyzer.safePatch.candidate = candidates[0];
    state.analyzer.safePatch.signature = candidates[0].signature;
    state.analyzer.safePatch.reviewStatus = "approved";
    state.analyzer.safePatch.approvedSignature = candidates[0].signature;
    const preflight = await runSafeApplyPreflight();
    if (!preflight?.ok) {
      return {
        ok: false,
        reason: preflight?.reason || "preflight-blocked",
        message: preflight?.message || "AI候補のPreflightが通りませんでした。",
        items,
          preflight,
          diagnostic: buildExistingWebAiRevalidationDiagnostic(normalized, changes, items, {
            reason: preflight?.reason || "preflight-blocked",
            message: preflight?.message || "AI候補のPreflightが通りませんでした。",
            preflight,
          }),
        };
      }
    return { ok: true, status: "ready_to_apply", message: "AI候補をTBalanceで再確認しました。変更を反映できます。", items, preflight };
  }

  async function revalidateExistingWebAiTargetSourceCandidate(target, change, appliedTarget) {
    const checks = [];
    const fail = (reason, message, extra = {}) => ({
      ok: false,
      reason,
      message,
      target,
      change,
      diagnostic: {
        checks: [...checks, { code: reason, label: getExistingWebAiCheckLabel(reason), ok: false, message }],
        firstFailedCheck: reason,
        reasonCode: getExistingWebAiRejectReasonCode(reason),
        ...extra,
      },
    });
    if (!change) {
      return fail("stale-ai-response", "AI回答の対象変更が現在のPreviewにありません。");
    }
    const expectedChangeId = getExistingWebPreviewChangeId(change);
    if (!target.changeId) {
      return fail("change-id-mismatch", "AI回答にchangeIdがありません。");
    }
    if (target.changeId !== expectedChangeId) {
      return fail("change-id-mismatch", "AI回答のchangeIdが現在のPreview変更と一致しません。");
    }
    checks.push({ code: "change-match", label: "changeId", ok: true, message: target.changeId });
    if (!/^safe-candidate$/i.test(target.status || "") && (target.sourceChange || target.sourceChanges?.length)) {
      return fail("ai-status-not-safe", "AI回答がsafe-candidateではありません。");
    }
    checks.push({ code: "target-status", label: "target status", ok: true, message: target.status || "" });
    if (!target.sourceChanges?.length) {
      return fail("missing-source-change", "AI回答にSource候補がありません。");
    }
    checks.push({ code: "source-change-present", label: "sourceChange", ok: true, message: `${target.sourceChanges.length}件` });
    const selected = selectExistingWebElementForWorkflowChange(change);
    if (!selected) {
      return fail("missing-selection", "変更対象のDOMを確認できません。");
    }
    checks.push({ code: "dom-selection", label: "DOM", ok: true, message: selected.domRef || "" });
    if (!appliedTarget?.finalCheck?.editableProperties?.includes(change.property)) {
      return fail("property-not-revalidated", "AI回答後もこの変更Propertyは安全確認できませんでした。");
    }
    checks.push({ code: "property-revalidated", label: "property", ok: true, message: change.property || "" });
    const sourceResolution = await buildExistingWebAiSourceResolution(selected, change, target.sourceChanges);
    if (sourceResolution.status !== "resolved") {
      return fail(sourceResolution.reason || sourceResolution.status, sourceResolution.message || "AI候補のSourceを確認できません。", { sourceResolution });
    }
    (sourceResolution.diagnostic?.checks || []).forEach((check) => checks.push(check));
    const resolution = await prepareExistingWebOnDemandApplyCandidate(selected, change, {
      skipPreflight: true,
      skipClear: true,
      sourceResolutionOverride: sourceResolution,
    });
    const candidate = resolution.patchResult?.candidate || null;
    if (!resolution.ok || candidate?.status !== "ready-for-review") {
      return fail(resolution.reason || "safe-patch-blocked", resolution.message || "AI候補をSafe Patch Candidateにできません。", { resolution });
    }
    checks.push({ code: "safe-patch-candidate", label: "Safe Patch", ok: true, message: candidate.status || "" });
    candidate.review = {
      status: "approved",
      approvedAt: new Date().toISOString(),
      rejectedAt: null,
      approvedSignature: candidate.signature,
    };
    return {
      ok: true,
      target,
      change,
      selected,
      sourceResolution,
      resolution,
      candidate,
      diagnostic: { checks, firstFailedCheck: "", reasonCode: "" },
    };
  }

  async function buildExistingWebAiSourceResolution(selected, change, sourceChanges) {
    const node = selected?.node || getExistingWebNodeByDomRef(selected?.domRef);
    if (!node) {
      return { status: "unresolved", reason: "missing-dom", message: "対象DOMが見つかりません。" };
    }
    const operations = [];
    const checks = [];
    for (const sourceChange of sourceChanges || []) {
      const validation = await validateExistingWebAiSourceChange(node, selected, change, sourceChange);
      if (!validation.ok) {
        return validation.result;
      }
      (validation.diagnostic?.checks || []).forEach((check) => checks.push(check));
      operations.push(buildExistingWebAiPatchOperation(selected, change, sourceChange, validation.fresh || null));
    }
    if (!operations.length) {
      return { status: "unresolved", reason: "missing-source-change", message: "AI回答にSource候補がありません。" };
    }
    return {
      status: "resolved",
      sourceLocation: operations.map((operation) => operation.sourceRef),
      operations,
      resolvedCandidates: operations.map((operation) => operation.resolvedCandidate).filter(Boolean),
      source: "ai-candidate-revalidated",
      diagnostic: { checks },
    };
  }

  async function validateExistingWebAiSourceChange(node, selected, change, sourceChange) {
    const checks = [];
    const fail = (reason, message) => ({
      ok: false,
      result: {
        status: ["source-path-mismatch", "invalid-selector", "selector-not-unique", "invalid-before-after", "before-mismatch", "source-read-failed", "source-declaration-not-found"].includes(reason) ? "unresolved" : "unsupported",
        reason,
        message,
        diagnostic: {
          checks: [...checks, { code: reason, label: getExistingWebAiCheckLabel(reason), ok: false, message }],
          firstFailedCheck: reason,
          reasonCode: getExistingWebAiRejectReasonCode(reason),
        },
      },
    });
    if (sourceChange.sourceType && sourceChange.sourceType !== "stylesheet-rule") {
      return fail("unsupported-source-type", "v0.1ではstylesheet rule以外のAI候補は自動反映しません。");
    }
    checks.push({ code: "source-type", label: "source type", ok: true, message: sourceChange.sourceType || "stylesheet-rule" });
    if (normalizeExistingWebSourcePath(sourceChange.sourcePath) !== normalizeExistingWebSourcePath(state.existingWeb.sourcePath)
      && !String(sourceChange.sourcePath || "").toLowerCase().endsWith(".css")) {
      return fail("source-path-mismatch", "AI候補のSource Pathを確認できません。");
    }
    checks.push({ code: "source-path", label: "source file", ok: true, message: sourceChange.sourcePath || "" });
    let matches = [];
    try {
      matches = Array.from(node.ownerDocument.querySelectorAll(sourceChange.selector || ""));
    } catch (error) {
      return fail("invalid-selector", "AI候補のSelectorを解釈できません。");
    }
    if (matches.length !== 1 || matches[0] !== node) {
      return fail("selector-not-unique", "AI候補のSelectorが対象DOMを一意に指していません。");
    }
    checks.push({ code: "selector-unique", label: "selector unique", ok: true, message: sourceChange.selector || "" });
    const visualProperty = getExistingWebVisualPropertyForCssProperty(sourceChange.property);
    if (visualProperty !== change.property) {
      return fail("property-mismatch", "AI候補のPropertyが今回の変更内容と一致しません。");
    }
    checks.push({ code: "property-match", label: "property", ok: true, message: sourceChange.property || "" });
    if (getExistingWebRuntimeProtectedProperties(selected, change).includes(sourceChange.property)) {
      return fail("protected-property", "AI候補が保護Propertyを変更しようとしています。");
    }
    checks.push({ code: "protected-behavior", label: "protected behavior", ok: true, message: "preserved" });
    if (!sourceChange.before || !sourceChange.after || sourceChange.before === sourceChange.after) {
      return fail("invalid-before-after", "AI候補のBefore/Afterが不正です。");
    }
    checks.push({ code: "before-after", label: "before/after", ok: true, message: `${sourceChange.before} -> ${sourceChange.after}` });
    const fresh = await readExistingWebFreshCssDeclaration(sourceChange);
    if (!fresh.ok) {
      return fail(fresh.reason || "source-read-failed", fresh.message || "現在Sourceを再確認できません。");
    }
    checks.push({
      code: "fresh-source-read",
      label: "fresh source",
      ok: true,
      message: `${fresh.snapshot.path || sourceChange.sourcePath} @ ${String(fresh.snapshot.sha256 || "").slice(0, 12)}`,
    });
    if (String(fresh.declaration.value) !== String(sourceChange.before)) {
      return fail(
        "before-mismatch",
        `AI候補のBefore値が現在Sourceと一致しません。Source=${fresh.declaration.value} / AI=${sourceChange.before}`,
      );
    }
    checks.push({ code: "fresh-before-match", label: "before match", ok: true, message: fresh.declaration.value });
    return { ok: true, diagnostic: { checks }, fresh };
  }

  function buildExistingWebSafetyAiDiagnostic({ providerResult = null, normalized = null, localResolution = null, revalidation = null } = {}) {
    const providerDiagnostics = providerResult?.diagnostics || {};
    const response = normalized || normalizeExistingWebAiReviewResult(providerResult?.response || providerResult || {});
    const revalidationDiagnostic = normalizeExistingWebAiRevalidationDiagnostic(revalidation, response);
    return {
      provider: {
        providerId: providerDiagnostics.providerId || providerResult?.provider || "codex-local",
        requestId: providerDiagnostics.requestId || providerResult?.requestId || response.requestId || "",
        exitCode: typeof providerDiagnostics.exitCode === "number" ? providerDiagnostics.exitCode : null,
        timedOut: Boolean(providerDiagnostics.timedOut),
        durationMs: Number(providerDiagnostics.durationMs || 0),
        jsonlParseSuccess: Boolean(providerDiagnostics.jsonlParseSuccess),
        finalAgentMessageFound: Boolean(providerDiagnostics.finalAgentMessageFound),
        structuredResponseValidationSuccess: Boolean(providerDiagnostics.structuredResponseValidationSuccess),
        responseParseSuccess: Boolean(providerDiagnostics.responseParseSuccess),
        responseParseMessage: String(providerDiagnostics.responseParseMessage || ""),
        responseValidationMessage: String(providerDiagnostics.responseValidationMessage || ""),
        stderr: String(providerDiagnostics.stderr || "").slice(0, 4000),
      },
      response: summarizeExistingWebAiStructuredResponse(response),
      revalidation: revalidationDiagnostic,
      localAnalysis: summarizeExistingWebLocalResolution(localResolution),
      candidateRelation: describeExistingWebAiCandidateRelation(response, localResolution, revalidationDiagnostic),
    };
  }

  function summarizeExistingWebAiStructuredResponse(normalized = {}) {
    return {
      status: normalized.status || "",
      requestId: normalized.requestId || "",
      pageId: normalized.pageId || "",
      sourcePath: normalized.sourcePath || "",
      viewState: normalized.viewState || "",
      reason: normalized.reason || "",
      confidence: normalized.confidence || "",
      targets: (normalized.targets || []).map((target) => ({
        changeId: target.changeId || target.id || "",
        domRef: target.domRef || "",
        status: target.status || "",
        sourceChanges: target.sourceChanges || (target.sourceChange ? [target.sourceChange] : []),
        preserve: target.preserve || [],
        risk: target.risk || target.riskLevel || "",
        reason: target.reason || "",
        confidence: target.confidence || "",
      })),
    };
  }

  function normalizeExistingWebAiRevalidationDiagnostic(revalidation = null, normalized = {}) {
    const direct = revalidation?.diagnostic || {};
    const items = revalidation?.items || [];
    const itemChecks = items.flatMap((item) => item.diagnostic?.checks || item.sourceResolution?.diagnostic?.checks || []);
    const checks = [
      { code: "request-id", label: "requestId", ok: Boolean(normalized.requestId), message: normalized.requestId || "missing" },
      { code: "page-id", label: "pageId", ok: !normalized.pageId || normalized.pageId === state.existingWeb.pageId, message: normalized.pageId || "not provided" },
      { code: "source-path", label: "sourcePath", ok: !normalized.sourcePath || normalizeExistingWebSourcePath(normalized.sourcePath) === normalizeExistingWebSourcePath(state.existingWeb.sourcePath), message: normalized.sourcePath || "not provided" },
      { code: "view-state", label: "viewState", ok: (normalized.viewState || "") === (state.existingWeb.viewState || ""), message: normalized.viewState || "common" },
      ...itemChecks,
      ...(direct.checks || []),
    ];
    const firstFailed = checks.find((check) => !check.ok);
    const reason = revalidation?.reason || direct.firstFailedCheck || firstFailed?.code || "";
    return {
      ok: Boolean(revalidation?.ok),
      reason: reason || "",
      reasonCode: direct.reasonCode || getExistingWebAiRejectReasonCode(reason),
      firstFailedCheck: direct.firstFailedCheck || firstFailed?.code || reason || "",
      message: revalidation?.message || "",
      checks,
      preflightComparison: direct.preflightComparison || summarizeExistingWebPreflightComparison(revalidation?.preflight),
    };
  }

  function buildExistingWebAiRevalidationDiagnostic(normalized, changes, items, firstBlocked) {
    const preflight = firstBlocked?.preflight || null;
    const checks = [
      { code: "request-id", label: "requestId", ok: Boolean(normalized.requestId), message: normalized.requestId || "missing" },
      { code: "page-id", label: "pageId", ok: !normalized.pageId || normalized.pageId === state.existingWeb.pageId, message: normalized.pageId || "not provided" },
      { code: "source-path", label: "sourcePath", ok: !normalized.sourcePath || normalizeExistingWebSourcePath(normalized.sourcePath) === normalizeExistingWebSourcePath(state.existingWeb.sourcePath), message: normalized.sourcePath || "not provided" },
      { code: "view-state", label: "viewState", ok: (normalized.viewState || "") === (state.existingWeb.viewState || ""), message: normalized.viewState || "common" },
      { code: "change-count", label: "changeId", ok: (items || []).length === (changes || []).length, message: `${(items || []).length}/${(changes || []).length}` },
      ...(items || []).flatMap((item) => item.diagnostic?.checks || item.sourceResolution?.diagnostic?.checks || []),
      ...(preflight?.validation?.checks || []).map((check) => ({
        code: `preflight-${check.id || check.code || "check"}`,
        label: check.id || check.code || "preflight",
        ok: check.status === "passed" || check.ok === true,
        message: check.message || "",
      })),
    ];
    const firstFailed = checks.find((check) => !check.ok);
    const reason = firstBlocked?.reason || firstFailed?.code || "";
    return {
      checks,
      firstFailedCheck: firstFailed?.code || reason,
      reasonCode: getExistingWebAiRejectReasonCode(reason),
      preflightComparison: summarizeExistingWebPreflightComparison(preflight),
    };
  }

  function summarizeExistingWebPreflightComparison(preflight = null) {
    if (!preflight) {
      return null;
    }
    const entries = [];
    const addEntry = (entry = {}) => {
      const operation = entry.operation || {};
      const sourceRef = operation.sourceRef || operation.source || {};
      const resolution = entry.resolution || {};
      entries.push({
        domRef: operation.target?.domRef || entry.candidate?.target?.domRef || "",
        changeId: operation.resolvedCandidate?.changeId || "",
        candidateId: operation.resolvedCandidate?.candidateId || "",
        sourcePath: sourceRef.sourcePath || sourceRef.path || preflight.sourcePath || "",
        selector: sourceRef.selector || "",
        media: sourceRef.media || operation.source?.media || "",
        property: operation.property || "",
        expectedBefore: operation.before || "",
        actualBefore: resolution.declaration?.value || "",
        after: operation.after || "",
        authority: operation.resolvedCandidate?.authority || sourceRef.authority || "",
        sourceFingerprint: operation.resolvedCandidate?.sourceSnapshotFingerprint || sourceRef.sourceSnapshotFingerprint || "",
      });
    };
    if (preflight.entry) {
      addEntry(preflight.entry);
    }
    if (preflight.operation) {
      addEntry({ operation: preflight.operation, resolution: preflight.resolution || {} });
    }
    return {
      reason: preflight.reason || "",
      status: preflight.status || "",
      sourcePath: preflight.sourcePath || "",
      entries,
    };
  }

  function summarizeExistingWebLocalResolution(resolution = null) {
    if (!resolution) {
      return null;
    }
    const candidates = getExistingWebResolutionCandidates(resolution);
    return {
      ok: Boolean(resolution.ok),
      status: resolution.status || "",
      reason: resolution.reason || "",
      message: resolution.message || "",
      multipleCandidateMessage: /複数/.test(resolution.message || "") ? resolution.message : "",
      sourceCandidates: candidates.map((candidate) => ({
        sourcePath: candidate.sourcePath || candidate.path || candidate.source?.path || "",
        selector: candidate.selector || candidate.source?.selector || "",
        property: candidate.property || candidate.cssProperty || "",
        value: candidate.value || candidate.before || candidate.currentValue || "",
      })),
    };
  }

  function describeExistingWebAiCandidateRelation(response = {}, localResolution = null, revalidation = {}) {
    const aiSources = (response.targets || []).flatMap((target) => target.sourceChanges || []);
    const localSources = getExistingWebResolutionCandidates(localResolution);
    if (!aiSources.length) {
      return "CodexはSource候補を返していません。";
    }
    if (!localSources.length) {
      return `Codexは${aiSources.length}件のSource候補を返しましたが、Local Analysis側には一意なSource候補がありません。`;
    }
    return `Codex候補 ${aiSources.length}件 / Local候補 ${localSources.length}件 / Revalidation: ${revalidation.reasonCode || revalidation.reason || "-"}`;
  }

  function getExistingWebAiCheckLabel(code) {
    const labels = {
      "stale-ai-response": "stale",
      "change-id-mismatch": "changeId",
      "ai-status-not-safe": "status",
      "missing-source-change": "sourceChange",
      "missing-selection": "DOM",
      "property-not-revalidated": "property",
      "unsupported-source-type": "source type",
      "source-path-mismatch": "source file",
      "invalid-selector": "selector",
      "selector-not-unique": "selector unique",
      "property-mismatch": "property",
      "protected-property": "protected behavior",
      "invalid-before-after": "before/after",
      "source-read-failed": "fresh source",
      "source-declaration-not-found": "source declaration",
      "before-mismatch": "before match",
      "safe-patch-blocked": "Safe Patch",
      "preflight-blocked": "Preflight",
    };
    return labels[code] || code || "check";
  }

  function getExistingWebAiRejectReasonCode(reason) {
    const map = {
      "stale-ai-response": "ai-stale-response",
      "change-id-mismatch": "ai-change-id-mismatch",
      "ai-status-not-safe": "ai-status-not-safe",
      "missing-source-change": "ai-source-location-unresolved",
      "missing-selection": "ai-source-location-unresolved",
      "property-not-revalidated": "ai-after-intent-mismatch",
      "unsupported-source-type": "ai-source-type-unsupported",
      "source-path-mismatch": "ai-source-path-mismatch",
      "invalid-selector": "ai-selector-invalid",
      "selector-not-unique": "ai-selector-not-unique",
      "property-mismatch": "ai-after-intent-mismatch",
      "protected-property": "ai-protected-behavior-conflict",
      "invalid-before-after": "ai-before-mismatch",
      "source-read-failed": "ai-source-read-failed",
      "source-declaration-not-found": "ai-source-location-unresolved",
      "before-mismatch": "ai-before-mismatch",
      "safe-patch-blocked": "ai-source-location-unresolved",
      "preflight-blocked": "ai-before-mismatch",
      "partial-ai-candidate": "ai-source-location-unresolved",
    };
    return map[reason] || (reason ? `ai-${reason}` : "");
  }

  function getExistingWebVisualPropertyForCssProperty(cssProperty) {
    const property = String(cssProperty || "").toLowerCase();
    if (property === "left" || property === "top" || property === "right" || property === "bottom" || property === "translate") return "position";
    if (property === "width" || property === "height") return "size";
    if (property === "display" || property === "visibility" || property === "opacity") return "visibility";
    return property;
  }

  function buildExistingWebAiPatchOperation(selected, change, sourceChange, fresh = null) {
    const pageMeta = getAnalyzerManifestPageMeta();
    const tbId = selected.mapping?.tbId || sanitizeTbId(selected.id || selected.domRef.replace(/^[#.]/, ""), "runtime-target");
    const sourceFingerprint = fresh?.snapshot?.sha256 || sourceChange.sourceFingerprint || sourceChange.sourceSnapshotFingerprint || "";
    const sourcePath = sourceChange.sourcePath;
    const sourceType = sourceChange.sourceType || "stylesheet-rule";
    const media = sourceChange.media || "";
    const resolvedCandidate = {
      authority: "ai-revalidated",
      changeId: getExistingWebPreviewChangeId(change),
      candidateId: `${getExistingWebPreviewChangeId(change)}:${sourcePath}:${sourceChange.selector}:${media}:${sourceChange.property}`,
      sourcePath,
      sourceType,
      selector: sourceChange.selector,
      media,
      property: sourceChange.property,
      before: sourceChange.before,
      after: sourceChange.after,
      sourceFingerprint,
      sourceSnapshotFingerprint: sourceFingerprint,
    };
    return {
      type: "set-css-declaration",
      target: {
        pageId: state.existingWeb.pageId || pageMeta.pageId,
        sourcePath: state.existingWeb.sourcePath || pageMeta.sourcePath,
        viewState: state.existingWeb.viewState || pageMeta.currentViewState || "",
        tbId,
        domRef: selected.domRef,
      },
      sourceRef: {
        sourceType,
        sourcePath,
        selector: sourceChange.selector,
        property: sourceChange.property,
        currentValue: sourceChange.before,
        media: media || null,
        sourceFingerprint,
        sourceSnapshotFingerprint: sourceFingerprint,
        authority: "ai-revalidated",
      },
      source: {
        kind: sourceType,
        path: sourcePath,
        selector: sourceChange.selector,
        media,
      },
      property: sourceChange.property,
      before: sourceChange.before,
      after: sourceChange.after,
      priority: "",
      resolvedCandidate,
    };
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
    if (aiOk.has("rotation") && runtimeEditable.has("rotation") && !protectedProperties.has("rotation")) {
      editableProperties.push("rotation");
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
        label: "回転",
        state: editable.has("rotation") ? "ok" : protectedSet.has("rotation") ? "protected" : "warning",
        text: editable.has("rotation") ? "AI確認済み" : protectedSet.has("rotation") ? "保護" : reasonFor("rotation") || cautions?.[0] || "編集できません",
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
    if (["rotation", "rotate", "angle", "deg", "回転", "角度"].includes(key)) return "rotation";
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
    if (action === "safe-change") handleExistingWebMainAction();
    if (action === "safe-change-retry") analyzeExistingWebWorkflowChanges();
    if (action === "workflow-tab") setExistingWebWorkflowTab(actionSource?.dataset?.existingWebWorkflowTab || "layers");
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
      rotate: style.rotate === "none" ? "" : style.rotate,
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
      translate: node.style.translate,
      rotate: node.style.rotate,
    };
  }

  function restoreExistingWebInlineStyle(node, inline) {
    ["position", "left", "top", "width", "height", "transform", "translate", "rotate"].forEach((key) => {
      node.style[key] = inline?.[key] || "";
    });
  }

  function parseExistingWebTranslate(value) {
    const raw = String(value || "").trim();
    if (!raw || raw === "none") {
      return { x: 0, y: 0 };
    }
    const parts = raw.split(/\s+/);
    return {
      x: parseCssPx(parts[0], 0),
      y: parseCssPx(parts[1], 0),
    };
  }

  function parseExistingWebRotate(value) {
    const raw = String(value || "").trim();
    if (!raw || raw === "none") {
      return 0;
    }
    if (raw.endsWith("rad")) {
      return normalizeExistingWebAngle(parseCssPx(raw, 0) * 180 / Math.PI);
    }
    if (raw.endsWith("turn")) {
      return normalizeExistingWebAngle(parseCssPx(raw, 0) * 360);
    }
    return normalizeExistingWebAngle(parseCssPx(raw, 0));
  }

  function getExistingWebCurrentRotation(node) {
    if (!node) {
      return 0;
    }
    const inlineRotate = node.style.rotate;
    if (inlineRotate) {
      return parseExistingWebRotate(inlineRotate);
    }
    const computedRotate = node.ownerDocument?.defaultView?.getComputedStyle(node)?.rotate || "";
    return parseExistingWebRotate(computedRotate);
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
    const mappings = [
      ...(state.analyzer.confirmedMappings || []),
      ...(state.analyzer.runtimeMappings || []),
    ];
    return mappings.find((mapping) => (
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

  async function applySafePatchCandidate(options = {}) {
    const preflight = state.analyzer.safeApply.preflight;
    if (!preflight?.ok) {
      setSafeApplyStatus("preflight-blocked", "先にApply Preflightを成功させてください。");
      renderSafeApplyPanel();
      return null;
    }
    const change = preflight.sourceChange || {};
    const ok = options.skipUserConfirm ? true : window.confirm([
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

  async function applySafePatchBatch(options = {}) {
    const preflight = state.analyzer.safeApply.preflight;
    if (!preflight?.ok || !preflight.batchApplyVersion) {
      setSafeApplyStatus("preflight-blocked", "先にBatch Apply Preflightを成功させてください。");
      renderSafeApplyPanel();
      return null;
    }
    const ok = options.skipUserConfirm ? true : window.confirm([
      "SAFE BATCH APPLY",
      "",
      "この変更は実Source Fileを書き換えます。",
      "",
      `変更: ${preflight.summary?.totalCandidates || preflight.operations?.length || 0}件`,
      `ファイル: ${preflight.summary?.sourceFiles || preflight.sourceFiles?.length || 0}件`,
      "",
      "このBatch変更を適用しますか？",
    ].join("\n"));
    if (!ok) {
      const cancelled = {
        ok: false,
        safeApplyVersion: "0.1",
        batchApplyVersion: "0.1",
        status: "cancelled",
        message: "UserがBatch Safe Applyをキャンセルしました。Source Writer Writeは呼び出していません。",
        candidateSignatures: preflight.candidateSignatures || [],
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
    setSafeApplyStatus("applying", "Source Writer Bridge経由でBatchを実Sourceへ適用中です。");
    renderSafeApplyPanel();
    const result = await window.TBalanceSafeApply.applyApprovedBatch({
      preflight,
      sourceWriterClient: client,
    });
    state.analyzer.safeApply.result = result;
    state.analyzer.safeApply.preflight = null;
    setSafeApplyStatus(result.status || "failed", result.message || "Batch Safe Applyを完了しました。");
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
      const userEdit = change.userEdit?.type === "move" ? change.userEdit : null;
      const declarations = [];
      const deltaX = userEdit ? Number(userEdit.deltaX || 0) : Number(after.x) - Number(before.x);
      const deltaY = userEdit ? Number(userEdit.deltaY || 0) : Number(after.y) - Number(before.y);
      if (Number.isFinite(deltaX) && Math.abs(deltaX) >= 0.01) {
        declarations.push({ cssProperty: "left", delta: deltaX, unit: "px" });
      }
      if (Number.isFinite(deltaY) && Math.abs(deltaY) >= 0.01) {
        declarations.push({ cssProperty: "top", delta: deltaY, unit: "px" });
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
    const parentStyle = node.parentElement ? win.getComputedStyle(node.parentElement) : null;
    if (parentStyle && ["flex", "inline-flex", "grid", "inline-grid"].includes(parentStyle.display)) {
      return true;
    }
    return false;
  }

  function findUniqueCssDeclarationSource(node, cssProperty) {
    const candidates = findCssDeclarationSourcesForReview(node, cssProperty);
    const activeCandidates = candidates.filter((candidate) => candidate.activeAtCurrentViewport);
    if (activeCandidates.length === 1) {
      return { status: "resolved", source: activeCandidates[0], candidates };
    }
    if (activeCandidates.length > 1) {
      return {
        status: "multiple",
        reason: "multiple-source-candidates",
        message: `${cssProperty} のCSS宣言候補が複数あります。`,
        candidates: activeCandidates,
        inactiveCandidates: candidates.filter((candidate) => !candidate.activeAtCurrentViewport),
      };
    }
    return {
      status: "unresolved",
      reason: "source-location-unresolved",
      message: `${cssProperty} の直接CSS宣言を見つけられません。`,
    };
  }

  function findCssDeclarationSourcesForReview(node, cssProperty) {
    const candidates = [];
    const inlineValue = node.style?.getPropertyValue(cssProperty);
    if (inlineValue) {
      candidates.push({
        kind: "inline-style",
        path: getAnalyzerManifestPageMeta().sourcePath,
        sourcePath: getAnalyzerManifestPageMeta().sourcePath,
        selector: getInlinePatchSelector(node),
        property: cssProperty,
        value: inlineValue.trim(),
        priority: node.style.getPropertyPriority(cssProperty) || "",
        media: "",
        mediaQuery: "",
        mediaMatchesCurrentViewport: true,
        activeAtCurrentViewport: true,
        specificity: [1, 0, 0],
        cascadeOrder: 1000000 + candidates.length,
        overridden: false,
      });
    }
    candidates.push(...findStylesheetDeclarationSources(node, cssProperty));
    return annotateCssDeclarationCascade(candidates);
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
        sourcePath: getStylesheetSourcePath(sheet),
        selector: rule.selectorText,
        property: cssProperty,
        value: rule.style.getPropertyValue(cssProperty).trim(),
        priority: rule.style.getPropertyPriority(cssProperty) || "",
        media: mediaText || "",
        mediaQuery: mediaText || "",
        mediaMatchesCurrentViewport: doesCssMediaMatchCurrentViewport(node, mediaText),
        activeAtCurrentViewport: doesCssMediaMatchCurrentViewport(node, mediaText),
        specificity: estimateCssSpecificity(rule.selectorText),
        cascadeOrder: sources.length,
        overridden: false,
      });
    });
  }

  function annotateCssDeclarationCascade(candidates) {
    const active = candidates.filter((candidate) => candidate.activeAtCurrentViewport);
    const winning = active[active.length - 1] || null;
    return candidates.map((candidate) => ({
      ...candidate,
      winningDeclaration: candidate === winning,
      overridden: Boolean(candidate.activeAtCurrentViewport && winning && candidate !== winning),
    }));
  }

  function doesCssMediaMatchCurrentViewport(node, mediaText = "") {
    const media = String(mediaText || "").trim();
    if (!media) {
      return true;
    }
    try {
      return Boolean(node.ownerDocument.defaultView.matchMedia(media).matches);
    } catch (error) {
      return false;
    }
  }

  function estimateCssSpecificity(selectorText = "") {
    const selector = String(selectorText || "").split(",")[0] || "";
    const ids = (selector.match(/#[\w-]+/g) || []).length;
    const classes = (selector.match(/(\.[\w-]+|\[[^\]]+\]|:[\w-]+)/g) || []).length;
    const elements = (selector.replace(/#[\w-]+|(\.[\w-]+|\[[^\]]+\]|:[\w-]+)|[*>+~(),]/g, " ").trim().split(/\s+/).filter(Boolean) || []).length;
    return [ids, classes, elements];
  }

  function buildCssPatchOperation(instruction, mapping, change, declaration, sourceResult) {
    const source = sourceResult.source;
    const before = source.value;
    let after = declaration.exactValue;
    if (!after && Number.isFinite(Number(declaration.delta))) {
      const parsed = parseCssLengthValue(before);
      if (!parsed.ok) {
        return null;
      }
      if (parsed.unit === "%") {
        const basis = getCssPercentDeltaBasis(mapping, declaration.cssProperty);
        if (!basis) {
          return null;
        }
        after = `${roundPatchNumber(parsed.value + (Number(declaration.delta) / basis) * 100)}%`;
      } else {
        after = `${roundPatchNumber(parsed.value + declaration.delta)}${parsed.unit}`;
      }
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

  function parseCssLengthValue(value) {
    const match = String(value || "").trim().match(/^(-?\d+(?:\.\d+)?)(px|%)$/i);
    if (!match) {
      return { ok: false };
    }
    return { ok: true, value: Number(match[1]), unit: match[2] };
  }

  function getCssPercentDeltaBasis(mapping, cssProperty) {
    const node = resolveExistingWebRuntimeDomNode(mapping?.domRef);
    if (!node) {
      return 0;
    }
    const property = String(cssProperty || "").toLowerCase();
    const basisNode = node.offsetParent || node.parentElement || node.ownerDocument?.documentElement;
    const rect = basisNode?.getBoundingClientRect?.();
    if (property === "left" || property === "right" || property === "width") {
      return Number(rect?.width || node.ownerDocument?.documentElement?.clientWidth || 0);
    }
    if (property === "top" || property === "bottom" || property === "height") {
      return Number(rect?.height || node.ownerDocument?.documentElement?.clientHeight || 0);
    }
    return 0;
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
        openExistingWebPage(page, { openContext: "site-map" });
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
    openExistingWebPage(page, { openContext: "site-map" });
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
      state.nativeAssets.pendingFileIntent = "canvas";
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
    stopNativeBehaviorRuntime();
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
    if (state.preview) {
      startNativeBehaviorRuntime();
    }
    window.clearTimeout(toggleTestMode.timer);
    showModeToast(state.preview
      ? `${getWindowTestLabel(state.testWindow)}だけTEST中です。反対側は比較表示です。`
      : "TESTを終了しました。");
    renderAll();
  }

  function isWindowInTest(windowKey) {
    return Boolean(state.preview) && (state.testWindow || "primary") === (windowKey === "secondary" ? "secondary" : "primary");
  }

  function getNativeTestRuntimeSceneId(page, windowKey = "primary") {
    if (!state.preview || !isWindowInTest(windowKey) || state.nativeBehaviorRuntime?.page?.id !== page?.id) {
      return getActiveSceneId(page);
    }
    return state.nativeBehaviorRuntime.sceneId || getActiveSceneId(page);
  }

  async function startNativeBehaviorRuntime() {
    stopNativeBehaviorRuntime();
    if (!state.preview || state.existingWeb.active) {
      return;
    }
    const page = getTestPageById(getTestCurrentPageId(state.testWindow || "primary")) || getCurrentPage();
    if (!page || !window.TBalanceNativeBehaviors) {
      return;
    }
    ensureNativeProjectBehaviorConnections();
    window.TBalanceNativeBehaviors.normalizePage(page);
    await preloadNativeBehaviorDataSources(page);
    if (!state.preview || state.existingWeb.active || page.id !== (getTestPageById(getTestCurrentPageId(state.testWindow || "primary")) || getCurrentPage())?.id) {
      return;
    }
    state.nativeBehaviorDiagnostics = [];
    state.nativeBehaviorRuntime = window.TBalanceNativeBehaviors.createRuntime({
      page,
      project: state.project,
      initialSceneId: getActiveSceneId(page),
      fetchDataSource: (dataSourceId) => getNativeBehaviorDataSource(dataSourceId),
      onOpenFlow: (flowId, behavior) => {
        const label = flowId === "wish-star" ? "願い星を書く" : flowId === "bottle-mail" ? "ボトルメールを書く" : "投稿Flow";
        const context = state.nativeBehaviorActionContext || {};
        const windowKey = context.windowKey || state.testWindow || "primary";
        const target = getClickTargetForNativeFlow(flowId);
        if (target) {
          state.testExternalViews = state.testExternalViews || { primary: null, secondary: null };
          const key = windowKey === "secondary" ? "secondary" : "primary";
          const frameUrl = getTeaMerryLocalTestUrl(target, {
            page,
            sceneId: state.nativeBehaviorRuntime?.sceneId || getActiveSceneId(page),
            windowKey,
          });
          state.testExternalViews[key] = {
            url: frameUrl,
            officialUrl: target,
            title: label,
            displayMode: getTestExternalDisplayMode(target, windowKey, null),
            displayModeSetting: "auto",
            viewport: getTestExternalViewport(windowKey),
            updatedAt: Date.now(),
          };
        }
        showModeToast(`TEST: ${label} を表示します。`);
        state.testAction = {
          window: windowKey,
          layerId: behavior?.trigger?.targetRef || "",
          layerName: label,
          message: target ? `${label}へ移動` : "投稿Flow入口（送信は未実行）",
          updatedAt: Date.now(),
        };
        return true;
      },
      onPlaySound: (action) => playNativeBehaviorSound(action),
      onSceneChange: (sceneId) => {
        state.testRuntimeSceneId = sceneId;
        renderAll();
      },
      onRuntimeTextChange: () => {
        if (!state.deferNativeRuntimeRender) {
          renderAll();
        }
      },
      onDiagnostic: (diagnostic) => {
        state.nativeBehaviorDiagnostics.push(diagnostic);
        showModeToast(diagnostic.message || "動作を実行できませんでした。");
      },
    });
    state.nativeBehaviorRuntime.firePageOpen?.();
  }

  function stopNativeBehaviorRuntime() {
    state.nativeBehaviorRuntime?.cleanup?.();
    renderer.cleanupRuntimeAudio?.();
    state.nativeBehaviorRuntime = null;
    state.nativeBehaviorDiagnostics = [];
    state.nativeBehaviorDataCache = new Map();
    state.testRuntimeSceneId = "";
  }

  function playNativeBehaviorSound(action = {}) {
    const sound = resolveNativeBehaviorSound(action);
    if (!sound) {
      return false;
    }
    renderer.playRuntimeSound?.(sound, state.project);
    return true;
  }

  function resolveNativeBehaviorSound(action = {}) {
    const direct = getNormalizedSound(action.sound);
    if (direct.src || direct.assetRef || direct.assetId) {
      return direct;
    }
    const soundRef = String(action.soundRef || action.assetRef || action.assetId || "");
    if (soundRef) {
      const asset = window.TBalanceNativeAssets?.findAsset?.(state.project, soundRef);
      if (asset) {
        return getNormalizedSound({
          enabled: true,
          assetRef: asset.assetId || soundRef,
          assetId: asset.assetId || soundRef,
          fileName: asset.displayName || asset.fileName || soundRef,
          volume: direct.volume,
          loop: direct.loop,
        });
      }
    }
    const targetRef = String(action.targetRef || action.layerId || "");
    const layer = targetRef ? findLayer(targetRef) : null;
    if (layer) {
      const sounds = Object.assign({}, layer.sounds || {});
      if (layer.sound && !sounds.click) {
        sounds.click = layer.sound;
      }
      const mode = normalizeSoundMode(action.soundMode || action.mode || "click");
      const sound = getNormalizedSound(sounds[mode]);
      return sound.src || sound.assetRef || sound.assetId ? sound : null;
    }
    return null;
  }

  function getNativeBehaviorDataSource(dataSourceId) {
    const cached = state.nativeBehaviorDataCache?.get?.(dataSourceId);
    if (cached) {
      return cached;
    }
    const source = window.TBalanceNativeDataSources?.findDataSource?.(state.project, dataSourceId);
    if (!source) {
      return { status: "missing", code: "missing-data-source", items: [] };
    }
    if (source.provider !== "inline") {
      return { status: "unresolved", code: "project-json-reader-unavailable", dataSource: source, items: [] };
    }
    return source.items?.length
      ? { status: "ok", dataSource: source, items: source.items }
      : { status: "empty", code: "empty-data-source", dataSource: source, items: [] };
  }

  async function preloadNativeBehaviorDataSources(page) {
    state.nativeBehaviorDataCache = new Map();
    const ids = new Set((page?.dataSourceRefs || []).filter(Boolean));
    (page?.behaviors || []).forEach((behavior) => {
      (behavior.actions || []).forEach((action) => {
        if (action.dataSourceRef) {
          ids.add(action.dataSourceRef);
        }
      });
    });
    const resolver = window.TBalanceNativeDataSources;
    if (!resolver || !ids.size) {
      return;
    }
    await Promise.all(Array.from(ids).map(async (dataSourceId) => {
      const source = resolver.findDataSource?.(state.project, dataSourceId);
      if (!source) {
        state.nativeBehaviorDataCache.set(dataSourceId, { status: "missing", code: "missing-data-source", items: [] });
        return;
      }
      if (source.provider === "inline") {
        state.nativeBehaviorDataCache.set(dataSourceId, source.items?.length
          ? { status: "ok", dataSource: source, items: source.items }
          : { status: "empty", code: "empty-data-source", dataSource: source, items: [] });
        return;
      }
      const result = await resolver.resolveDataSource(state.project, dataSourceId, {
        fetchJson: fetchProjectJsonForNativeBehavior,
      });
      state.nativeBehaviorDataCache.set(dataSourceId, result);
    }));
  }

  async function fetchProjectJsonForNativeBehavior(relativePath) {
    const normalized = window.TBalanceNativeDataSources?.normalizeProjectRelativePath?.(relativePath) || "";
    if (!normalized) {
      const error = new Error("Project JSON path is invalid.");
      error.code = "invalid-relative-path";
      throw error;
    }
    const url = window.location.protocol.startsWith("http")
      ? `${window.location.origin}/${normalized}`
      : new URL(`../../${normalized}`, window.location.href).href;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      const error = new Error(`Project JSONを読み込めません: ${response.status}`);
      error.code = "read-failed";
      throw error;
    }
    return response.json();
  }

  function runNativeClickBehavior(layer, windowKey, event) {
    if (!state.preview || !state.nativeBehaviorRuntime || state.nativeBehaviorRuntime.page?.id !== getTestCurrentPageId(windowKey)) {
      return false;
    }
    let handled = false;
    state.nativeBehaviorActionContext = { windowKey, event };
    try {
      handled = state.nativeBehaviorRuntime.handleClick?.(layer.id);
    } finally {
      state.nativeBehaviorActionContext = null;
    }
    if (handled) {
      setTestActionMessage(layer, windowKey, "標準動作を実行しました", event);
      renderAll();
      return true;
    }
    return false;
  }

  function dispatchNativeTestEvent(eventName) {
    const result = dispatchNativeEvent(eventName);
    if (result.status === "inactive") {
      showModeToast("TEST中だけ送信完了イベントを確認できます。");
      return;
    }
    showModeToast(result.handled ? "送信後の台詞を表示しました。" : "対応する送信後イベントがありません。");
    renderAll();
  }

  function dispatchNativeEvent(eventName, payload = {}, options = {}) {
    if (!state.preview || !state.nativeBehaviorRuntime) {
      return { status: "inactive", handled: false };
    }
    const previousDefer = state.deferNativeRuntimeRender;
    state.deferNativeRuntimeRender = options.render === false || previousDefer;
    let handled = false;
    try {
      handled = Boolean(state.nativeBehaviorRuntime.dispatchEvent?.(eventName, payload));
    } finally {
      state.deferNativeRuntimeRender = previousDefer;
    }
    if (options.render !== false) {
      renderAll();
    }
    return { status: "ok", eventName: String(eventName || ""), handled };
  }

  function handleTBalanceNativeEventMessage(event) {
    const data = event?.data;
    if (!isTBalanceNativeEventMessage(data) || !isTrustedNativeTestEventSource(event)) {
      return;
    }
    dispatchNativeEvent(data.eventName, isPlainObject(data.payload) ? data.payload : {}, { render: false });
  }

  function isTBalanceNativeEventMessage(data) {
    const eventName = String(data?.eventName || "");
    return isPlainObject(data)
      && data.type === "tbalance-native-event"
      && ["bottle-mail-sent", "wish-star-sent"].includes(eventName);
  }

  function isTrustedNativeTestEventSource(event) {
    if (!state.preview || !state.nativeBehaviorRuntime) {
      return false;
    }
    if (event.origin !== window.location.origin) {
      return false;
    }
    return Array.from(document.querySelectorAll(".tb-test-external-frame"))
      .some((frame) => frame.contentWindow && frame.contentWindow === event.source);
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
      "#bottle-mail": "ボトルメールを書く",
      "#forest-map": "森の地図",
      "#back": "戻る",
    };
    return labels[target] || target || "未設定";
  }

  function ensureNativeProjectBehaviorConnections() {
    if (!state.project || state.existingWeb.active) {
      return false;
    }
    window.TBalanceNativeDataSources?.normalizeProject?.(state.project);
    let changed = false;
    (state.project.pages || []).forEach((page) => {
      if (ensureTeaMerryObservatorySpeechBubble(page)) {
        changed = true;
      }
      if (ensureTeaMerryObservatoryNativeFlow(page)) {
        changed = true;
      }
    });
    return changed;
  }

  function ensureTeaMerryObservatoryNativeFlow(page) {
    if (!page || !Array.isArray(page.layers) || state.existingWeb.active) {
      return false;
    }
    const pageName = normalizeTextKey(`${page.name || page.displayName || ""} ${page.slug || ""}`);
    if (!pageName.includes("星風テラス") && !pageName.includes("observatory")) {
      return false;
    }
    window.TBalanceNativeScenes?.normalizePage?.(page);
    window.TBalanceNativeBehaviors?.normalizePage?.(page);
    const dayScene = findSceneByName(page, "昼") || page.scenes?.[0] || null;
    const nightScene = findSceneByName(page, "夜") || page.scenes?.find((scene) => scene.sceneId !== dayScene?.sceneId) || null;
    const liluLayer = findLayerByNameInPage(page, ["lilu", "リル"], (layer) => layer.type === "image" && layer.role !== "background");
    const dialogueText = findLayerByNameInPage(page, ["リルセリフ", "リルの台詞"], (layer) => layer.type === "text");
    const bubbleLayer = findLayerByNameInPage(page, ["リル吹き出し本体", "hukidasi", "吹き出し"], (layer) => layer.type === "shape" || layer.type === "image");
    const postHitArea = findLayerByNameInPage(page, ["投稿を書く"], (layer) => layer.role === "hit-area" || layer.hitArea?.enabled);
    if (!dayScene || !nightScene || !liluLayer || !dialogueText || !postHitArea || !window.TBalanceNativeBehaviors || !window.TBalanceNativeDataSources) {
      return false;
    }
    let changed = false;
    const dialogueSource = ensureProjectJsonDataSource({
      dataSourceId: "ds_teamerry_observatory_dialogue",
      displayName: "星風テラス 入室台詞",
      relativePath: "data/export/dialogue.json",
      selector: "dialogues",
      kind: "dialogue-list",
    });
    const bottleSource = ensureProjectJsonDataSource({
      dataSourceId: "ds_teamerry_observatory_bottle_after",
      displayName: "ボトルメール送信後",
      relativePath: "data/export/lill_action_reactions.json",
      selector: "reactions.ボトルメールを出したあと",
      kind: "dialogue-sequence-list",
    });
    const wishSource = ensureProjectJsonDataSource({
      dataSourceId: "ds_teamerry_observatory_wish_after",
      displayName: "願い星送信後",
      relativePath: "data/export/lill_action_reactions.json",
      selector: "reactions.願い星を飛ばしたあと",
      kind: "dialogue-sequence-list",
    });
    [dialogueSource, bottleSource, wishSource].forEach((source) => {
      if (!page.dataSourceRefs?.includes(source.dataSourceId)) {
        page.dataSourceRefs = Array.from(new Set([...(page.dataSourceRefs || []), source.dataSourceId]));
        changed = true;
      }
    });
    const advanceRefs = [liluLayer.id].filter(Boolean);
    const behaviorSeeds = [
      {
        behaviorId: "bhv_teamerry_observatory_page_open_day",
        displayName: "昼の入室台詞",
        trigger: { type: "pageOpen", fireOnce: true },
        conditions: [{ type: "sceneIs", sceneId: dayScene.sceneId }],
        actions: [{
          type: "showRandomDialogue",
          dataSourceRef: dialogueSource.dataSourceId,
          targetRef: dialogueText.id,
          filter: { character: "リル", place: "星風テラス", section: "導入", conditions: ["入室", "昼"] },
          fallbackText: "昼の星風テラスでは、書いたボトルメールを森へそっと流せるよ。",
          excludePrevious: true,
        }],
      },
      {
        behaviorId: "bhv_teamerry_observatory_page_open_night",
        displayName: "夜の入室台詞",
        trigger: { type: "pageOpen", fireOnce: true },
        conditions: [{ type: "sceneIs", sceneId: nightScene.sceneId }],
        actions: [{
          type: "showRandomDialogue",
          dataSourceRef: dialogueSource.dataSourceId,
          targetRef: dialogueText.id,
          filter: { character: "リル", place: "星風テラス", section: "導入", conditions: ["入室", "夜"] },
          fallbackText: "夜の星風テラスでは、願い星を書いて空へ届けられるんだよ。",
          excludePrevious: true,
        }],
      },
      {
        behaviorId: "bhv_teamerry_observatory_bottle_flow",
        displayName: "ボトルメールを書く",
        trigger: { type: "click", targetRef: postHitArea.id },
        conditions: [{ type: "sceneIs", sceneId: dayScene.sceneId }],
        actions: [{ type: "openFlow", flowId: "bottle-mail", targetRef: postHitArea.id }],
      },
      {
        behaviorId: "bhv_teamerry_observatory_wish_flow",
        displayName: "願い星を書く",
        trigger: { type: "click", targetRef: postHitArea.id },
        conditions: [{ type: "sceneIs", sceneId: nightScene.sceneId }],
        actions: [{ type: "openFlow", flowId: "wish-star", targetRef: postHitArea.id }],
      },
      {
        behaviorId: "bhv_teamerry_observatory_bottle_after",
        displayName: "ボトルメール送信後TEST",
        trigger: { type: "event", eventName: "bottle-mail-sent" },
        conditions: [{ type: "sceneIs", sceneId: dayScene.sceneId }],
        actions: [{
          type: "showDialogueSequence",
          dataSourceRef: bottleSource.dataSourceId,
          targetRef: dialogueText.id,
          advanceRefs,
          excludePrevious: true,
        }],
      },
      {
        behaviorId: "bhv_teamerry_observatory_wish_after",
        displayName: "願い星送信後TEST",
        trigger: { type: "event", eventName: "wish-star-sent" },
        conditions: [{ type: "sceneIs", sceneId: nightScene.sceneId }],
        actions: [{
          type: "showDialogueSequence",
          dataSourceRef: wishSource.dataSourceId,
          targetRef: dialogueText.id,
          advanceRefs,
          excludePrevious: true,
        }],
      },
    ];
    behaviorSeeds.forEach((seed) => {
      const existing = (page.behaviors || []).find((behavior) => behavior.behaviorId === seed.behaviorId || behavior.id === seed.behaviorId);
      const normalized = window.TBalanceNativeBehaviors.normalizeBehavior(Object.assign({ enabled: true }, seed));
      if (!normalized) {
        return;
      }
      if (existing) {
        const before = JSON.stringify({
          trigger: existing.trigger,
          conditions: existing.conditions,
          actions: existing.actions,
        });
        const after = JSON.stringify({
          trigger: normalized.trigger,
          conditions: normalized.conditions,
          actions: normalized.actions,
        });
        if (before !== after || existing.displayName !== normalized.displayName || existing.enabled === false) {
          existing.trigger = normalized.trigger;
          existing.conditions = normalized.conditions;
          existing.actions = normalized.actions;
          existing.enabled = true;
          existing.displayName = normalized.displayName;
          changed = true;
        }
        return;
      }
      page.behaviors.push(normalized);
      changed = true;
    });
    page.metadata = Object.assign({}, page.metadata || {}, {
      teamerryNativeFlow: {
        connected: true,
        pageId: page.id || page.pageId || "",
        daySceneId: dayScene.sceneId,
        nightSceneId: nightScene.sceneId,
        liluLayerId: liluLayer.id,
        dialogueTextLayerId: dialogueText.id,
        bubbleGroupId: dialogueText.groupId || bubbleLayer?.groupId || "",
        postHitAreaId: postHitArea.id,
      },
    });
    return changed;
  }

  function ensureProjectJsonDataSource({ dataSourceId, displayName, relativePath, selector, kind }) {
    window.TBalanceNativeDataSources?.normalizeProject?.(state.project);
    const registry = state.project.dataSourceRegistry;
    const existing = registry.dataSources.find((source) => source.dataSourceId === dataSourceId || source.id === dataSourceId);
    if (existing) {
      existing.provider = "project-json";
      existing.source = Object.assign({}, existing.source || {}, { relativePath, selector });
      existing.kind = kind || existing.kind || "dialogue-list";
      existing.displayName = existing.displayName || displayName;
      return existing;
    }
    const source = window.TBalanceNativeDataSources.normalizeDataSource({
      dataSourceId,
      displayName,
      provider: "project-json",
      kind,
      source: { relativePath, selector },
      mapping: { idField: "id", textField: "text" },
    });
    registry.dataSources.push(source);
    state.project.dataSources = registry.dataSources;
    return source;
  }

  function ensureTeaMerryObservatorySpeechBubble(page) {
    if (!page || !Array.isArray(page.layers) || state.existingWeb.active) {
      return false;
    }
    const pageName = normalizeTextKey(`${page.name || page.displayName || ""} ${page.slug || ""}`);
    if (!pageName.includes("星風テラス") && !pageName.includes("observatory")) {
      return false;
    }
    window.TBalanceNativeScenes?.normalizePage?.(page);
    const imageBubble = findLayerByNameInPage(page, ["hukidasi", "吹き出し"], (layer) => layer.type === "image" && layer.visibilityMode !== "hidden");
    const backupBubble = findLayerByNameInPage(page, ["リル吹き出し画像バックアップ"], (layer) => layer.type === "image");
    const textLayer = findLayerByNameInPage(page, ["リルセリフ", "リルの台詞"], (layer) => layer.type === "text");
    if (!textLayer) {
      return false;
    }
    const existingBody = page.layers.find((layer) => layer.metadata?.teamerrySpeechBubblePart === "body");
    const existingTail = page.layers.find((layer) => layer.metadata?.teamerrySpeechBubblePart === "tail");
    if (!imageBubble && (!existingBody || !existingTail)) {
      return false;
    }
    const sourceBubble = imageBubble || backupBubble || existingBody || textLayer;
    const groupId = textLayer.groupId || existingBody?.groupId || existingTail?.groupId || imageBubble?.groupId || `group_lil_speech_${page.id || page.pageId || "page"}`;
    const groupName = "リル吹き出しセット";
    const bodyId = `${groupId}_body`;
    const tailId = `${groupId}_tail`;
    let changed = false;
    const body = existingBody || page.layers.find((layer) => layer.id === bodyId)
      || createSpeechBubbleShapeLayer(bodyId, "リル吹き出し本体", "roundRect", groupId, groupName, sourceBubble);
    const tail = existingTail || page.layers.find((layer) => layer.id === tailId)
      || createSpeechBubbleShapeLayer(tailId, "リル吹き出ししっぽ", "triangle", groupId, groupName, sourceBubble);
    if (!page.layers.includes(body)) {
      page.layers.push(body);
      changed = true;
    }
    if (!page.layers.includes(tail)) {
      page.layers.push(tail);
      changed = true;
    }
    changed = normalizeSpeechBubbleShapeStyle(body, false) || changed;
    changed = normalizeSpeechBubbleShapeStyle(tail, true) || changed;
    const beforeTextName = textLayer.name;
    textLayer.name = "リルセリフ";
    textLayer.displayName = "リルセリフ";
    textLayer.role = "dialogue-text";
    textLayer.groupId = groupId;
    textLayer.groupName = groupName;
    textLayer.metadata = Object.assign({}, textLayer.metadata || {}, { dialogueTarget: "lil-speech", speechBubbleAutoLayout: true });
    textLayer.style = Object.assign({}, textLayer.style || {}, { color: "#4e2213", align: "center", weight: 700, lineHeight: 1.35 });
    applySpeechBubbleTextTypography(textLayer, "desktop", getSpeechBubbleManualScale(textLayer));
    applySpeechBubbleTextTypography(textLayer, "mobile", getSpeechBubbleManualScale(textLayer));
    changed = changed || beforeTextName !== textLayer.name;
    if (applySpeechBubbleLayoutsFromAnchor(body, tail, textLayer, imageBubble || body)) {
      changed = true;
    }
    if (imageBubble) {
      imageBubble.name = imageBubble.name === "hukidasi" ? "リル吹き出し画像バックアップ" : imageBubble.name;
      imageBubble.displayName = imageBubble.name;
      imageBubble.visibilityMode = "hidden";
      imageBubble.visible = false;
      imageBubble.metadata = Object.assign({}, imageBubble.metadata || {}, {
        backupFor: "リル吹き出しセット",
        originalGroupId: imageBubble.groupId || "",
        originalGroupName: imageBubble.groupName || "",
        replacedBy: [body.id, tail.id, textLayer.id],
      });
      delete imageBubble.groupId;
      delete imageBubble.groupName;
      changed = true;
    }
    sortSpeechBubbleLayers(page, groupId, imageBubble?.id || backupBubble?.id || "", body.id, tail.id, textLayer.id);
    return changed;
  }

  function createSpeechBubbleShapeLayer(id, name, shapeType, groupId, groupName, sourceLayer) {
    const isTail = shapeType === "triangle";
    return {
      id,
      layerId: id,
      type: "shape",
      role: isTail ? "dialogue-tail" : "dialogue-bubble",
      name,
      displayName: name,
      visible: true,
      locked: false,
      link: "",
      groupId,
      groupName,
      hitArea: { enabled: false, visible: false, x: 0, y: 0, width: 1, height: 1 },
      corners: createDefaultCorners(),
      transformMode: "normal",
      shape: {
        type: shapeType,
        fill: "rgba(255, 249, 224, 0.96)",
        fillEnabled: true,
        stroke: "rgba(116, 72, 35, 0.42)",
        strokeEnabled: true,
        strokeWidth: isTail ? 2 : 2,
        radius: isTail ? 8 : 46,
      },
      desktop: Object.assign({}, sourceLayer.desktop || sourceLayer.base || {}),
      mobile: Object.assign({}, sourceLayer.mobile || sourceLayer.viewportOverrides?.mobile || sourceLayer.desktop || sourceLayer.base || {}),
      base: Object.assign({}, sourceLayer.base || sourceLayer.desktop || {}),
      viewportOverrides: {},
      sceneOverrides: {},
      sceneViewportOverrides: {},
      appearance: { opacity: 1, brightness: 1, shadow: "soft", shadowType: "soft", shadowSize: 12, shadowColor: "rgba(64, 38, 15, 0.25)", shadowOpacity: 25 },
      constraints: { keepAspect: false, keepSquare: false, keepCircle: false },
      metadata: {
        teamerrySpeechBubblePart: isTail ? "tail" : "body",
        speechBubbleAutoLayout: true,
      },
    };
  }

  function normalizeSpeechBubbleShapeStyle(layer, isTail) {
    if (!layer || layer.type !== "shape") {
      return false;
    }
    const nextShape = Object.assign({}, layer.shape || {}, {
      type: isTail ? "triangle" : "roundRect",
      fill: "rgba(255, 249, 224, 0.96)",
      fillEnabled: true,
      stroke: "rgba(116, 72, 35, 0.42)",
      strokeEnabled: true,
      strokeWidth: 2,
      radius: isTail ? 8 : 46,
    });
    const before = JSON.stringify(layer.shape || {});
    layer.shape = nextShape;
    return before !== JSON.stringify(nextShape);
  }

  function applySpeechBubbleLayoutsFromAnchor(body, tail, textLayer, anchorLayer) {
    let changed = false;
    const applyForScope = (target, anchorLayout, textLayout = null, viewportId = "desktop") => {
      if (!anchorLayout) {
        return;
      }
      const textValue = getSpeechBubbleTextValue(textLayer);
      const layouts = calculateSpeechBubbleLayouts(anchorLayout, textValue, viewportId, getSpeechBubbleManualScale(textLayer));
      const nextBody = layouts.body;
      const nextTail = layouts.tail;
      const nextText = layouts.text;
      applySpeechBubbleTextTypography(textLayer, viewportId, getSpeechBubbleManualScale(textLayer));
      changed = assignSpeechBubbleLayout(target.body, nextBody) || changed;
      changed = assignSpeechBubbleLayout(target.tail, nextTail) || changed;
      changed = assignSpeechBubbleLayout(target.text, Object.assign({}, nextText, {
        rotation: Number(textLayout?.rotation ?? nextText.rotation) || 0,
      })) || changed;
    };
    const baseBody = getNativeLayerScopeTarget(body, { type: "base", viewportId: "desktop" });
    const baseTail = getNativeLayerScopeTarget(tail, { type: "base", viewportId: "desktop" });
    const baseText = getNativeLayerScopeTarget(textLayer, { type: "base", viewportId: "desktop" });
    applyForScope({ body: baseBody, tail: baseTail, text: baseText }, anchorLayer.base || anchorLayer.desktop, textLayer.base || textLayer.desktop, "desktop");
    if (anchorLayer.viewportOverrides?.mobile || textLayer.viewportOverrides?.mobile || body.viewportOverrides?.mobile) {
      const bodyMobile = getNativeLayerScopeTarget(body, { type: "viewport", viewportId: "mobile" });
      const tailMobile = getNativeLayerScopeTarget(tail, { type: "viewport", viewportId: "mobile" });
      const textMobile = getNativeLayerScopeTarget(textLayer, { type: "viewport", viewportId: "mobile" });
      const mobileImage = window.TBalanceNativeScenes?.resolveLayerState?.(anchorLayer, "mobile", "") || anchorLayer.mobile;
      const mobileText = window.TBalanceNativeScenes?.resolveLayerState?.(textLayer, "mobile", "") || textLayer.mobile;
      applyForScope({ body: bodyMobile, tail: tailMobile, text: textMobile }, mobileImage, mobileText, "mobile");
    }
    Object.keys(Object.assign({}, anchorLayer.sceneOverrides || {}, textLayer.sceneOverrides || {}, body.sceneOverrides || {})).forEach((sceneId) => {
      const bodyScene = getNativeLayerScopeTarget(body, { type: "scene", sceneId, viewportId: "desktop" });
      const tailScene = getNativeLayerScopeTarget(tail, { type: "scene", sceneId, viewportId: "desktop" });
      const textScene = getNativeLayerScopeTarget(textLayer, { type: "scene", sceneId, viewportId: "desktop" });
      const sceneImage = window.TBalanceNativeScenes?.resolveLayerState?.(anchorLayer, "desktop", sceneId) || anchorLayer.sceneOverrides?.[sceneId];
      const sceneText = window.TBalanceNativeScenes?.resolveLayerState?.(textLayer, "desktop", sceneId) || textLayer.sceneOverrides?.[sceneId];
      applyForScope({ body: bodyScene, tail: tailScene, text: textScene }, sceneImage, sceneText, "desktop");
    });
    Object.keys(Object.assign({}, anchorLayer.sceneViewportOverrides || {}, textLayer.sceneViewportOverrides || {}, body.sceneViewportOverrides || {})).forEach((sceneId) => {
      const viewportKeys = Object.assign({}, anchorLayer.sceneViewportOverrides?.[sceneId] || {}, textLayer.sceneViewportOverrides?.[sceneId] || {}, body.sceneViewportOverrides?.[sceneId] || {});
      Object.keys(viewportKeys).forEach((viewportId) => {
        const viewport = renderer.getViewportKey(viewportId);
        const bodySceneViewport = getNativeLayerScopeTarget(body, { type: "sceneViewport", sceneId, viewportId: viewport });
        const tailSceneViewport = getNativeLayerScopeTarget(tail, { type: "sceneViewport", sceneId, viewportId: viewport });
        const textSceneViewport = getNativeLayerScopeTarget(textLayer, { type: "sceneViewport", sceneId, viewportId: viewport });
        const sceneViewportImage = window.TBalanceNativeScenes?.resolveLayerState?.(anchorLayer, viewport, sceneId) || anchorLayer.sceneViewportOverrides?.[sceneId]?.[viewportId];
        const sceneViewportText = window.TBalanceNativeScenes?.resolveLayerState?.(textLayer, viewport, sceneId) || textLayer.sceneViewportOverrides?.[sceneId]?.[viewportId];
        applyForScope({ body: bodySceneViewport, tail: tailSceneViewport, text: textSceneViewport }, sceneViewportImage, sceneViewportText, viewport);
      });
    });
    renderer.normalizeLayer(body);
    renderer.normalizeLayer(tail);
    renderer.normalizeLayer(textLayer);
    return changed;
  }

  function prepareNativeSpeechBubbleRenderPage(page, viewportId, sceneId) {
    if (!page || state.existingWeb.active || state.nativeBehaviorRuntime?.page?.id !== page.id) {
      return page;
    }
    const runtimeTextLayers = (page.layers || []).filter((layer) => {
      if (layer.type !== "text" || layer.role !== "dialogue-text") {
        return false;
      }
      const runtimeText = state.nativeBehaviorRuntime?.getRuntimeText?.(layer.id);
      return runtimeText && runtimeText !== layer.text;
    });
    if (!runtimeTextLayers.length) {
      return page;
    }
    const renderPage = cloneNativePageForSpeechBubble(page);
    runtimeTextLayers.forEach((sourceTextLayer) => {
      const textLayer = renderPage.layers.find((layer) => layer.id === sourceTextLayer.id);
      const runtimeText = state.nativeBehaviorRuntime?.getRuntimeText?.(sourceTextLayer.id);
      reflowSpeechBubbleForTextLayer(renderPage, textLayer, runtimeText, viewportId, sceneId);
    });
    return renderPage;
  }

  function cloneNativePageForSpeechBubble(page) {
    if (typeof structuredClone === "function") {
      return structuredClone(page);
    }
    return JSON.parse(JSON.stringify(page));
  }

  function reflowSpeechBubbleForTextLayer(page, textLayer, textValue = "", viewportId = getActiveViewportKey(), sceneId = getActiveSceneId(page)) {
    if (!page || !textLayer || textLayer.type !== "text" || textLayer.role !== "dialogue-text") {
      return false;
    }
    const groupId = textLayer.groupId || "";
    const body = (page.layers || []).find((layer) => layer.role === "dialogue-bubble" && (layer.groupId === groupId || layer.metadata?.teamerrySpeechBubblePart === "body"));
    const tail = (page.layers || []).find((layer) => layer.role === "dialogue-tail" && (layer.groupId === groupId || layer.metadata?.teamerrySpeechBubblePart === "tail"));
    if (!body || !tail) {
      return false;
    }
    const viewport = renderer.getViewportKey(viewportId);
    const scope = window.TBalanceNativeScenes?.getWriteScope?.(page, viewport, sceneId || "") || { type: "base", viewportId: "desktop" };
    const anchorLayout = window.TBalanceNativeScenes?.resolveLayerState?.(body, viewport, sceneId || "")
      || body[viewport]
      || body.base
      || body.desktop
      || {};
    const manualScale = getSpeechBubbleManualScale(textLayer);
    const layouts = calculateSpeechBubbleLayouts(anchorLayout, textValue || getSpeechBubbleTextValue(textLayer), viewport, manualScale);
    applySpeechBubbleTextTypography(textLayer, viewport, manualScale);
    const bodyTarget = getNativeLayerScopeTarget(body, scope);
    const tailTarget = getNativeLayerScopeTarget(tail, scope);
    const textTarget = getNativeLayerScopeTarget(textLayer, scope);
    let changed = false;
    changed = assignSpeechBubbleLayout(bodyTarget, layouts.body) || changed;
    changed = assignSpeechBubbleLayout(tailTarget, layouts.tail) || changed;
    changed = assignSpeechBubbleLayout(textTarget, layouts.text) || changed;
    return changed;
  }

  function createSpeechBubbleBodyLayout(anchorLayout = {}, textValue = "", viewportId = "desktop") {
    return calculateSpeechBubbleLayouts(anchorLayout, textValue, viewportId).body;
  }

  function createSpeechBubbleTailLayout(bodyLayout = {}, anchorLayout = {}, viewportId = "desktop") {
    return calculateSpeechBubbleLayouts(bodyLayout, "", viewportId).tail;
  }

  function createSpeechBubbleTextLayout(bodyLayout, textValue = "", viewportId = "desktop") {
    return calculateSpeechBubbleLayouts(bodyLayout, textValue, viewportId).text;
  }

  function calculateSpeechBubbleLayouts(anchorLayout = {}, textValue = "", viewportId = "desktop", manualScale = 1) {
    const metrics = estimateSpeechBubbleMetrics(textValue, viewportId, manualScale);
    const anchorWidth = Math.max(1, Number(anchorLayout.width) || metrics.width);
    const anchorHeight = Math.max(1, Number(anchorLayout.height) || metrics.height);
    const centerX = Number(anchorLayout.x || 0) + anchorWidth / 2;
    const centerY = Number(anchorLayout.y || 0) + Math.min(anchorHeight / 2, metrics.height / 2 + 8);
    const body = {
      x: Math.round(centerX - metrics.width / 2),
      y: Math.round(centerY - metrics.height / 2),
      width: metrics.width,
      height: metrics.height,
      rotation: Number(anchorLayout.rotation) || 0,
      visible: true,
      opacity: 1,
    };
    const tailJoinOverlap = renderer.clamp(metrics.tailHeight * 0.28, 5, 8);
    const tail = {
      x: Math.round(body.x + body.width * 0.43 - metrics.tailWidth / 2),
      y: Math.round(body.y + body.height - tailJoinOverlap),
      width: metrics.tailWidth,
      height: metrics.tailHeight,
      rotation: 180,
      visible: true,
      opacity: 1,
    };
    const text = {
      x: Math.round(body.x + metrics.paddingX),
      y: Math.round(body.y + metrics.paddingY),
      width: Math.max(120, Math.round(body.width - metrics.paddingX * 2)),
      height: Math.max(44, Math.round(body.height - metrics.paddingY * 2)),
      rotation: body.rotation,
      visible: true,
      opacity: 1,
    };
    return { body, tail, text };
  }

  function getSpeechBubbleTextValue(textLayer) {
    return String(textLayer?.text || textLayer?.content || "こんにちは").trim() || "こんにちは";
  }

  function getSpeechBubbleLayoutConfig(viewportId = "desktop") {
    const isMobile = renderer.getViewportKey(viewportId) === "mobile";
    return isMobile
      ? { fontSize: 17, lineHeight: 1.35, paddingX: 30, paddingY: 18, minWidth: 300, maxWidth: 430, maxTextWidth: 320, minHeight: 96, tailWidth: 32, tailHeight: 18 }
      : { fontSize: 20, lineHeight: 1.35, paddingX: 44, paddingY: 22, minWidth: 380, maxWidth: 590, maxTextWidth: 390, minHeight: 120, tailWidth: 40, tailHeight: 22 };
  }

  function getSpeechBubbleManualScale(layer) {
    const scale = Number(layer?.metadata?.speechBubbleManualScale);
    return Number.isFinite(scale) && scale > 0 ? renderer.clamp(scale, 0.35, 3) : 1;
  }

  function applySpeechBubbleTextTypography(textLayer, viewportId = "desktop", manualScale = 1) {
    if (!textLayer || textLayer.type !== "text") {
      return;
    }
    const viewport = renderer.getViewportKey(viewportId);
    const config = getSpeechBubbleLayoutConfig(viewport);
    const scale = renderer.clamp(Number(manualScale) || 1, 0.35, 3);
    const styleKey = `${viewport}Style`;
    const color = viewport === "mobile" ? "#53230e" : "#4e2213";
    textLayer[styleKey] = Object.assign({}, textLayer[styleKey] || {}, {
      fontSize: Math.max(8, Math.round(config.fontSize * scale * 10) / 10),
      color,
      align: "center",
      weight: 700,
      lineHeight: config.lineHeight,
      fontFamily: viewport === "desktop" ? "'Meiryo', sans-serif" : textLayer[styleKey]?.fontFamily,
    });
  }

  function estimateSpeechBubbleMetrics(textValue, viewportId = "desktop", manualScale = 1) {
    const config = getSpeechBubbleLayoutConfig(viewportId);
    const scale = renderer.clamp(Number(manualScale) || 1, 0.35, 3);
    Object.assign(config, {
      fontSize: config.fontSize * scale,
      paddingX: config.paddingX * scale,
      paddingY: config.paddingY * scale,
      minWidth: config.minWidth * scale,
      maxWidth: config.maxWidth * scale,
      maxTextWidth: config.maxTextWidth * scale,
      minHeight: config.minHeight * scale,
      tailWidth: config.tailWidth * scale,
      tailHeight: config.tailHeight * scale,
    });
    const text = String(textValue || "こんにちは").replace(/\r\n?/g, "\n");
    const maxTextWidth = Math.max(120, Math.min(config.maxWidth - config.paddingX * 2, config.maxTextWidth || config.maxWidth));
    const fullWidthChar = config.fontSize * 0.94;
    const halfWidthChar = config.fontSize * 0.56;
    const estimateSegmentWidth = (segment) => Array.from(segment || "").reduce((sum, ch) => {
      return sum + (/[\u0000-\u00ff]/.test(ch) ? halfWidthChar : fullWidthChar);
    }, 0);
    let lineCount = 0;
    let widest = 0;
    text.split("\n").forEach((rawLine) => {
      const line = rawLine || " ";
      const width = Math.max(fullWidthChar, estimateSegmentWidth(line));
      const wrappedLines = Math.max(1, Math.ceil(width / maxTextWidth));
      lineCount += wrappedLines;
      widest = Math.max(widest, Math.min(width, maxTextWidth));
    });
    const width = Math.round(Math.min(config.maxWidth, Math.max(config.minWidth, widest + config.paddingX * 2)));
    const textHeight = lineCount * config.fontSize * config.lineHeight;
    const height = Math.round(Math.max(config.minHeight, textHeight + config.paddingY * 2));
    return Object.assign({}, config, { width, height, lineCount });
  }

  function assignSpeechBubbleLayout(target, nextLayout) {
    if (!target || !nextLayout) {
      return false;
    }
    let changed = false;
    ["x", "y", "width", "height", "rotation", "visible", "opacity"].forEach((key) => {
      if (target[key] !== nextLayout[key]) {
        target[key] = nextLayout[key];
        changed = true;
      }
    });
    return changed;
  }

  function sortSpeechBubbleLayers(page, groupId, backupId, bodyId, tailId, textId) {
    const order = new Map([[backupId, 0], [bodyId, 1], [tailId, 2], [textId, 3]]);
    const indexed = (page.layers || []).map((layer, index) => ({ layer, index }));
    indexed.sort((a, b) => {
      const ao = order.has(a.layer.id) ? order.get(a.layer.id) : null;
      const bo = order.has(b.layer.id) ? order.get(b.layer.id) : null;
      if (ao == null && bo == null) {
        return a.index - b.index;
      }
      if (ao == null) {
        return -1;
      }
      if (bo == null) {
        return 1;
      }
      return ao - bo;
    });
    page.layers = indexed.map((item) => item.layer);
    (page.layers || []).forEach((layer) => {
      if (layer.groupId === groupId) {
        layer.groupName = "リル吹き出しセット";
      }
    });
  }

  function findSceneByName(page, name) {
    const key = normalizeTextKey(name);
    return (page?.scenes || []).find((scene) => normalizeTextKey(scene.displayName || scene.name || "").includes(key)) || null;
  }

  function findLayerByNameInPage(page, names, predicate = () => true) {
    const keys = names.map(normalizeTextKey);
    return (page?.layers || []).find((layer) => {
      const key = normalizeTextKey(`${layer.name || ""} ${layer.displayName || ""}`);
      return keys.some((name) => key.includes(name)) && predicate(layer);
    }) || null;
  }

  function normalizeTextKey(value) {
    return String(value || "").trim().toLowerCase();
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
    if (layerTarget === "#bottle-mail") {
      return "https://ratemaru88-blip.github.io/teamerry-forest/observatory.html?bottle=1";
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
    if (name.includes("ボトルメール") || name.includes("投稿を書く") || name.includes("投稿")) {
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
      id: "bottle-mail",
      label: "ボトルメールを書く",
      url: "https://ratemaru88-blip.github.io/teamerry-forest/observatory.html?bottle=1",
      aliases: ["ボトルメールを書く", "ボトルメール", "bottlemail", "bottle", "#bottle-mail"],
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

  function getTeaMerryLocalTestUrl(value, context = {}) {
    const urlContext = {
      ...context,
      viewport: context.viewport || getTestExternalViewport(context.windowKey),
    };
    const adapterResult = adapterRegistry?.get("teamerry")?.resolveTestUrl?.(value, {
      baseUrl: window.location.href,
      currentUrl: window.location.href,
      origin: window.location.origin,
      viewport: urlContext.viewport,
    });
    if (adapterResult?.status === "resolved" && adapterResult.url) {
      return applyTeaMerryTestContextToUrl(adapterResult.url, value, urlContext);
    }
    const link = getTeaMerryPageLink(value);
    const raw = String(link?.url || value || "").trim();
    if (!raw || !isTeamerryPageUrl(raw)) {
      return raw;
    }
    try {
      const parsed = new URL(raw, "https://ratemaru88-blip.github.io/teamerry-forest/");
      const fileName = parsed.pathname.replace(/^\/teamerry-forest\//, "") || "index.html";
      const localUrl = new URL(`../../${fileName}${parsed.search}${parsed.hash}`, window.location.href).toString();
      return applyTeaMerryTestContextToUrl(localUrl, raw, urlContext);
    } catch (error) {
      return raw;
    }
  }

  function applyTeaMerryTestContextToUrl(urlValue, sourceValue = "", context = {}) {
    try {
      const url = new URL(urlValue, window.location.href);
      if (!isTeaMerryObservatoryTestUrl(url, sourceValue)) {
        return url.toString();
      }
      const sceneTime = getTeaMerrySceneTimeParam(context.page || getCurrentPage(), context.sceneId);
      if (sceneTime) {
        url.searchParams.set("time", sceneTime);
      }
      return url.toString();
    } catch (error) {
      return urlValue;
    }
  }

  function isTeaMerryObservatoryTestUrl(url, sourceValue = "") {
    const path = String(url?.pathname || "").replace(/\/+$/, "");
    if (path.endsWith("/observatory.html")) {
      return true;
    }
    try {
      const sourceUrl = new URL(sourceValue, "https://ratemaru88-blip.github.io/teamerry-forest/");
      return String(sourceUrl.pathname || "").replace(/\/+$/, "").endsWith("/observatory.html");
    } catch (error) {
      return false;
    }
  }

  function getTeaMerrySceneTimeParam(page = getCurrentPage(), sceneId = getActiveSceneId(page)) {
    if (!page || !sceneId) {
      return "";
    }
    const scene = (page.scenes || []).find((item) => item.sceneId === sceneId) || null;
    const key = normalizeTextKey(`${scene?.displayName || ""} ${scene?.name || ""} ${scene?.slug || ""} ${scene?.id || ""}`);
    if (key.includes("夜") || key.includes("night")) {
      return "night";
    }
    if (key.includes("昼") || key.includes("day")) {
      return "day";
    }
    return "";
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
      bottlemail: ["ボトルメールを書く", "ボトルメール", "bottlemail", "bottle"],
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
      startNativeBehaviorRuntime();
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
    const frameUrl = isTeamerryPageUrl(url) ? getTeaMerryLocalTestUrl(url, {
      page: getTestPageById(getTestCurrentPageId(windowKey)) || getCurrentPage(),
      sceneId: getNativeTestRuntimeSceneId(getTestPageById(getTestCurrentPageId(windowKey)) || getCurrentPage(), windowKey),
      windowKey,
    }) : url;
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
    if (runNativeClickBehavior(layer, windowKey, event)) {
      return;
    }
    const action = getLayerAction(layer);
    if (action.type === "none") {
      return;
    }
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

  function getNativeFlowIdForClickTarget(value) {
    const target = getTestLayerTarget(null, String(value || "").trim());
    if (target === "#wish-star") {
      return "wish-star";
    }
    if (target === "#bottle-mail") {
      return "bottle-mail";
    }
    const link = getTeaMerryPageLink(value);
    if (link?.id === "wishstar") {
      return "wish-star";
    }
    if (link?.id === "bottle-mail") {
      return "bottle-mail";
    }
    return "";
  }

  function getClickTargetForNativeFlow(flowId) {
    if (flowId === "wish-star") {
      return "https://ratemaru88-blip.github.io/teamerry-forest/observatory.html?wish=1";
    }
    if (flowId === "bottle-mail") {
      return "https://ratemaru88-blip.github.io/teamerry-forest/observatory.html?bottle=1";
    }
    return "";
  }

  function isSceneScopedNativeClickLayer(layer, page = getCurrentPage()) {
    if (!layer || !page || state.existingWeb.active) {
      return false;
    }
    const pageName = normalizeTextKey(`${page.name || page.displayName || ""} ${page.slug || ""}`);
    const layerName = normalizeTextKey(`${layer.name || layer.displayName || ""}`);
    return (pageName.includes("星風テラス") || pageName.includes("observatory"))
      && (layer.role === "hit-area" || layer.hitArea?.enabled)
      && (layerName.includes("投稿を書く") || layerName.includes("投稿"));
  }

  function getSceneScopedNativeClickBehavior(layer, sceneId = getActiveSceneId(getCurrentPage()), page = getCurrentPage()) {
    if (!isSceneScopedNativeClickLayer(layer, page) || !sceneId) {
      return null;
    }
    window.TBalanceNativeBehaviors?.normalizePage?.(page);
    return (page.behaviors || []).find((behavior) => {
      if (behavior.enabled === false || behavior.trigger?.type !== "click" || behavior.trigger?.targetRef !== layer.id) {
        return false;
      }
      const sceneCondition = (behavior.conditions || []).find((condition) => condition.type === "sceneIs");
      return sceneCondition?.sceneId === sceneId && (behavior.actions || []).some((action) => action.type === "openFlow");
    }) || null;
  }

  function getSceneScopedNativeClickAction(layer, sceneId = getActiveSceneId(getCurrentPage()), page = getCurrentPage()) {
    const behavior = getSceneScopedNativeClickBehavior(layer, sceneId, page);
    const flowId = behavior?.actions?.find((action) => action.type === "openFlow")?.flowId || "";
    const target = getClickTargetForNativeFlow(flowId);
    return target ? { type: "page", target, flowId, behavior } : null;
  }

  function setSceneScopedNativeClickAction(layer, target, sceneId = getActiveSceneId(getCurrentPage()), page = getCurrentPage()) {
    const flowId = getNativeFlowIdForClickTarget(target);
    if (!isSceneScopedNativeClickLayer(layer, page) || !sceneId || !flowId || !window.TBalanceNativeBehaviors) {
      return false;
    }
    window.TBalanceNativeBehaviors.normalizePage?.(page);
    const displayName = flowId === "wish-star" ? "願い星を書く" : "ボトルメールを書く";
    let behavior = getSceneScopedNativeClickBehavior(layer, sceneId, page);
    if (!behavior) {
      behavior = window.TBalanceNativeBehaviors.normalizeBehavior({
        behaviorId: `bhv_${layer.id}_${sceneId}_${flowId}`.replace(/[^\w-]/g, "_"),
        displayName,
        trigger: { type: "click", targetRef: layer.id },
        conditions: [{ type: "sceneIs", sceneId }],
        actions: [{ type: "openFlow", flowId, targetRef: layer.id }],
      });
      page.behaviors = page.behaviors || [];
      page.behaviors.push(behavior);
    }
    behavior.displayName = displayName;
    behavior.enabled = true;
    behavior.conditions = [{ type: "sceneIs", sceneId }];
    behavior.actions = [{ type: "openFlow", flowId, targetRef: layer.id }];
    layer.hitArea = Object.assign({}, layer.hitArea || {}, { enabled: true });
    return true;
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
        if (setSceneScopedNativeClickAction(layer, value)) {
          return;
        }
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
      if (nextType === "page" && els.propClickPreset.value && setSceneScopedNativeClickAction(layer, els.propClickPreset.value)) {
        return;
      }
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
      if (value && setSceneScopedNativeClickAction(layer, value)) {
        const scoped = getSceneScopedNativeClickAction(layer);
        els.propClickAction.value = "page";
        els.propLink.value = scoped?.target || value;
        return;
      }
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
    const layer = tab === "layer";
    if (state.existingWeb.active && !layer) {
      state.existingWeb.inspectorExpanded = true;
      els.rightPanel?.classList.add("is-existing-web-inspector-expanded");
    } else if (state.existingWeb.active && layer) {
      state.existingWeb.inspectorExpanded = false;
      els.rightPanel?.classList.remove("is-existing-web-inspector-expanded");
    }
    const style = tab === "style";
    const property = tab === "property";
    els.rightPanel?.classList.toggle("is-layer-tab-active", layer);
    els.layerTab?.classList.toggle("is-active", layer);
    els.propertyTab.classList.toggle("is-active", property);
    els.styleTab.classList.toggle("is-active", style);
    els.layerTab?.setAttribute("aria-selected", String(layer));
    els.propertyTab.setAttribute("aria-selected", String(property));
    els.styleTab.setAttribute("aria-selected", String(style));
    els.propertyPane.hidden = !property;
    els.stylePane.hidden = !style;
    els.propertyPane.classList.toggle("is-active", property);
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
    if (state.withAiShare.mode === "existing-web-ai-review" && state.withAiShare.text) {
      els.aiPromptText.value = state.withAiShare.text;
    } else {
      els.aiPromptText.value = buildAiCollabPrompt(data);
    }
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
    renderNativeSceneSwitch();
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
    document.body.dataset.existingWebActive = state.existingWeb.active ? "true" : "false";
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

  function getActiveSceneId(page = getCurrentPage()) {
    if (!page || state.existingWeb.active) {
      return "";
    }
    window.TBalanceNativeScenes?.normalizePage?.(page);
    if (!page.scenes?.length) {
      return "";
    }
    const current = state.activeSceneIds?.[page.id];
    const scene = page.scenes.find((item) => item.sceneId === current && item.enabled !== false)
      || page.scenes.find((item) => item.sceneId === page.defaultSceneId && item.enabled !== false)
      || page.scenes.find((item) => item.enabled !== false)
      || page.scenes[0];
    state.activeSceneIds[page.id] = scene?.sceneId || "";
    return state.activeSceneIds[page.id] || "";
  }

  function ensureActiveSceneForPage(page = getCurrentPage()) {
    return getActiveSceneId(page);
  }

  function setActiveScene(sceneId) {
    const page = getCurrentPage();
    if (!page || !page.scenes?.some((scene) => scene.sceneId === sceneId)) {
      return;
    }
    state.activeSceneIds[page.id] = sceneId;
    if (state.preview && state.nativeBehaviorRuntime?.page?.id === page.id) {
      state.nativeBehaviorRuntime.sceneId = sceneId;
      state.testRuntimeSceneId = sceneId;
    }
    clearSelection();
    renderAll();
  }

  function addNativeScene() {
    if (state.existingWeb.active) {
      return;
    }
    const page = getCurrentPage();
    if (!page) {
      return;
    }
    const defaultName = page.scenes?.length ? "夜" : "昼";
    const name = prompt("シーン名", defaultName);
    if (name === null) {
      return;
    }
    pushHistory();
    const scene = window.TBalanceNativeScenes?.addScene?.(page, name) || null;
    if (!scene) {
      return;
    }
    state.activeSceneIds[page.id] = scene.sceneId;
    markDirty();
    renderAll();
    showModeToast(`${scene.displayName} シーンを追加しました。`);
  }

  function renameActiveNativeScene() {
    const page = getCurrentPage();
    const sceneId = getActiveSceneId(page);
    const scene = page?.scenes?.find((item) => item.sceneId === sceneId);
    if (!scene) {
      showModeToast("名前を変更するシーンがありません。");
      return;
    }
    const name = prompt("シーン名", scene.displayName || "シーン");
    if (name === null) {
      return;
    }
    pushHistory();
    window.TBalanceNativeScenes?.renameScene?.(page, sceneId, name);
    markDirty();
    renderAll();
  }

  function renderNativeSceneSwitch() {
    if (!els.nativeSceneSwitch || state.existingWeb.active) {
      if (els.nativeSceneSwitch) {
        els.nativeSceneSwitch.hidden = true;
      }
      return;
    }
    const page = getCurrentPage();
    window.TBalanceNativeScenes?.normalizePage?.(page);
    const scenes = page?.scenes || [];
    els.nativeSceneSwitch.hidden = false;
    els.nativeSceneSelect.hidden = !scenes.length;
    els.renameNativeScene.disabled = !scenes.length;
    els.nativeSceneSelect.innerHTML = "";
    if (scenes.length) {
      const activeSceneId = getActiveSceneId(page);
      scenes.forEach((scene) => {
        const option = document.createElement("option");
        option.value = scene.sceneId;
        option.textContent = scene.displayName || "シーン";
        option.selected = scene.sceneId === activeSceneId;
        els.nativeSceneSelect.appendChild(option);
      });
    }
    const activeScene = scenes.find((scene) => scene.sceneId === getActiveSceneId(page));
    const scope = window.TBalanceNativeScenes?.getWriteScope?.(page, getActiveViewportKey(), activeScene?.sceneId || "");
    const labels = {
      base: "共通",
      viewport: "Viewport差分",
      scene: "Scene差分",
      sceneViewport: "Scene×Viewport差分",
    };
    const viewportLabel = getActiveViewportKey() === "mobile" ? "Mobile" : "PC";
    els.nativeSceneScope.textContent = scenes.length
      ? `${viewportLabel} / ${activeScene?.displayName || "Scene"} / ${labels[scope?.type] || "共通"}`
      : `${viewportLabel} / Sceneなし`;
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
    const primarySceneId = getNativeTestRuntimeSceneId(primaryRenderPage, "primary");
    ensureBackgroundLayersFitViewport(primaryRenderPage, mainViewport, primarySceneId);
    const primaryDisplayPage = prepareNativeSpeechBubbleRenderPage(primaryRenderPage, mainViewport, primarySceneId);
    renderer.renderPage(els.canvas, primaryDisplayPage, mainViewport, {
      edit: !state.preview,
      project: state.project,
      sceneId: primarySceneId,
      selectedId: !hideLayerControls && state.pageId === primaryRenderPage.id && getActiveWindowKey() === "primary" ? state.selectedId : "",
      selectedIds: !hideLayerControls && state.pageId === primaryRenderPage.id && getActiveWindowKey() === "primary" ? getSelectedIds() : [],
      showHitAreas: state.showHitAreas,
      test: isWindowInTest("primary"),
      getRuntimeText: (layerId) => state.nativeBehaviorRuntime?.page?.id === primaryRenderPage.id ? state.nativeBehaviorRuntime.getRuntimeText?.(layerId) : null,
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
      if (els.rightPanel) {
        els.rightPanel.classList.remove("is-existing-web-inspector-expanded");
      }
      return;
    }
    if (els.rightPanel) {
      els.rightPanel.classList.toggle("is-existing-web-inspector-expanded", Boolean(state.existingWeb.inspectorExpanded));
    }
    if (els.canvasViewport) {
      els.canvasViewport.classList.remove("is-split-view", "is-split-vertical");
      els.canvasViewport.classList.add("is-existing-web-view");
    }
    if (els.existingWebFrame) {
      applyExistingWebFrameViewport();
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
      els.existingWebEditMode.hidden = state.editorMode !== "custom";
      els.existingWebEditMode.classList.toggle("is-active", activeEdit);
      els.existingWebEditMode.setAttribute("aria-pressed", activeEdit ? "true" : "false");
    }
    if (els.existingWebTestMode) {
      const activeTest = state.existingWeb.mode === "test";
      els.existingWebTestMode.hidden = true;
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
      els.existingWebPageCheck.hidden = state.editorMode !== "custom" || state.existingWeb.mode === "test";
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
      const workflow = getExistingWebWorkflow();
      const changeCount = getExistingWebPreviewChangeCount();
      const workflowStatus = changeCount ? workflow.status : "clean";
      els.existingWebCreateSafeChange.hidden = state.editorMode !== "custom";
      els.existingWebCreateSafeChange.textContent = state.editorMode === "custom"
        ? "Safe Changeへ送る"
        : workflowStatus === "ready_to_apply"
          ? "変更を反映"
          : "変更を確認";
      els.existingWebCreateSafeChange.disabled = state.editorMode === "custom"
        ? (!state.existingWeb.preview?.changes?.length || !state.existingWeb.selected?.mapping)
        : !["dirty", "ready_to_apply", "review_required"].includes(workflowStatus);
    }
    if (els.existingWebResetPreview) {
      els.existingWebResetPreview.hidden = true;
      els.existingWebResetPreview.disabled = !state.existingWeb.preview?.active;
    }
    if (els.existingWebBackToCanvas) {
      const fromSiteMap = state.existingWeb.openContext === "site-map" || Boolean(state.siteMap.open);
      els.existingWebBackToCanvas.textContent = fromSiteMap ? "← SITE MAPへ戻る" : "Webページを閉じる";
      els.existingWebBackToCanvas.title = fromSiteMap
        ? "既存Webページを閉じてSITE MAPへ戻ります。未反映PreviewはSourceへ書き込みません。"
        : "既存Webページを閉じます。未反映PreviewはSourceへ書き込みません。";
    }
    if (els.existingWebSelectionSummary) {
      els.existingWebSelectionSummary.innerHTML = buildExistingWebSelectionSummary("compact");
    }
  }

  function applyExistingWebFrameViewport() {
    const frame = els.existingWebFrame;
    const viewer = els.existingWebViewer;
    if (!frame || !viewer) {
      return;
    }
    const viewport = state.viewport === "mobile" ? "mobile" : "desktop";
    const size = getExistingWebLayoutViewportSize(viewport);
    const viewerRect = viewer.getBoundingClientRect();
    const toolbar = viewer.querySelector(".tb-existing-web-toolbar");
    const summary = viewer.querySelector(".tb-existing-web-selection-summary");
    const toolbarHeight = toolbar?.getBoundingClientRect?.().height || 0;
    const summaryHeight = summary?.getBoundingClientRect?.().height || 0;
    const availableWidth = Math.max(1, viewerRect.width - 2);
    const availableHeight = Math.max(1, viewerRect.height - toolbarHeight - summaryHeight - 2);
    const scale = Math.max(0.05, Math.min(availableWidth / size.width, availableHeight / size.height));
    frame.style.width = `${size.width}px`;
    frame.style.height = `${size.height}px`;
    frame.style.transform = `scale(${scale})`;
    frame.style.transformOrigin = "top left";
    frame.dataset.viewportMode = viewport;
    frame.dataset.layoutWidth = String(size.width);
    frame.dataset.layoutHeight = String(size.height);
    frame.dataset.visualScale = String(scale);
    viewer.dataset.viewportMode = viewport;
    viewer.style.setProperty("--existing-web-layout-width", `${size.width}px`);
    viewer.style.setProperty("--existing-web-layout-height", `${size.height}px`);
    viewer.style.setProperty("--existing-web-visual-scale", String(scale));
  }

  function getExistingWebLayoutViewportSize(viewport) {
    if (viewport === "mobile") {
      return {
        width: 390,
        height: 844,
      };
    }
    const page = getPrimaryPage() || getCurrentPage();
    const size = getPageViewportSize(page, "desktop");
    return {
      width: Math.max(1, Math.round(Number(size.width) || 1920)),
      height: Math.max(1, Math.round(Number(size.height) || 1080)),
    };
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
      const secondarySceneId = getNativeTestRuntimeSceneId(secondaryPage, "secondary");
      ensureBackgroundLayersFitViewport(secondaryPage, "mobile", secondarySceneId);
      const secondaryDisplayPage = prepareNativeSpeechBubbleRenderPage(secondaryPage, "mobile", secondarySceneId);
      els.secondaryCanvas.dataset.windowLabel = "Mobile";
      renderer.renderPage(els.secondaryCanvas, secondaryDisplayPage, "mobile", {
        edit: !state.preview,
        project: state.project,
        sceneId: secondarySceneId,
        selectedId: !isPaintPointerActive() && getActiveWindowKey() === "secondary" ? state.selectedId : "",
        selectedIds: !isPaintPointerActive() && getActiveWindowKey() === "secondary" ? getSelectedIds() : [],
        showHitAreas: state.showHitAreas,
        test: isWindowInTest("secondary"),
        getRuntimeText: (layerId) => state.nativeBehaviorRuntime?.page?.id === secondaryPage.id ? state.nativeBehaviorRuntime.getRuntimeText?.(layerId) : null,
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
        project: state.project,
        sceneId: getActiveSceneId(imagePage),
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
    frame.setAttribute("allow", "autoplay");
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
    const transformLayers = getSelectionTransformLayers(layer);
    const layout = transformLayers.length > 1 ? getLayersBoundingBox(transformLayers) : getCurrentLayout(layer);
    if (!layout) {
      return;
    }
    const box = document.createElement("div");
    box.className = "tb-selection-box";
    box.style.left = `${layout.x}px`;
    box.style.top = `${layout.y}px`;
    box.style.width = `${Math.max(1, layout.width)}px`;
    box.style.height = `${Math.max(1, layout.height)}px`;
    box.style.transform = `rotate(${transformLayers.length > 1 ? 0 : Number(layout.rotation) || 0}deg)`;
    box.dataset.layerId = layer.id;
    box.classList.toggle("is-group-transform", transformLayers.length > 1);
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
    renderNativePageBehaviorSummary(layer);
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
    const sceneScopedClick = getSceneScopedNativeClickAction(layer);
    els.propLink.value = sceneScopedClick?.target || layer.link || "";
    const clickAction = sceneScopedClick || layer.clickAction || {};
    const clickType = normalizeClickActionType(clickAction.type, sceneScopedClick?.target || layer.link || clickAction.target || "");
    els.propClickAction.value = clickType;
    els.propClickPreset.value = clickType === "page" ? getClickPresetValue(sceneScopedClick?.target || layer.link || clickAction.target || "") : "";
    els.propClickPreset.disabled = clickType !== "page";
    if (els.propClickDisplayMode) {
      els.propClickDisplayMode.value = clickAction.displayMode || "auto";
      els.propClickDisplayMode.disabled = clickType === "none";
    }
    renderNativeBehaviorPanel(layer);
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

  function renderNativePageBehaviorSummary(layer) {
    const page = getCurrentPage();
    window.TBalanceNativeBehaviors?.normalizePage?.(page);
    const clockBehaviors = (page?.behaviors || []).filter((behavior) => behavior.trigger?.type === "clock");
    const eventBehaviors = (page?.behaviors || []).filter((behavior) => behavior.trigger?.type === "event");
    if (els.nativeTestClockControls) {
      els.nativeTestClockControls.hidden = !state.preview || state.existingWeb.active || !clockBehaviors.length;
    }
    if (!els.emptyProperties || layer || state.existingWeb.active) {
      return;
    }
    if (!clockBehaviors.length && !eventBehaviors.length) {
      els.emptyProperties.textContent = "レイヤー未選択";
      return;
    }
    els.emptyProperties.innerHTML = `
      <strong>ページの標準動作</strong>
      ${clockBehaviors.map((behavior) => `<span>🕒 ${escapeHtml(window.TBalanceNativeBehaviors?.summarizeBehavior?.(behavior, { page }) || behavior.displayName || "時刻動作")}</span>`).join("")}
      ${eventBehaviors.map((behavior) => `<button type="button" data-native-behavior-test-event="${escapeAttr(behavior.trigger.eventName || "")}" ${state.preview ? "" : "disabled"}>${escapeHtml(behavior.displayName || window.TBalanceNativeBehaviors?.summarizeBehavior?.(behavior, { page }) || "イベントTEST")}</button>`).join("")}
    `;
  }

  function applyNativeTestClock() {
    if (!state.preview || !state.nativeBehaviorRuntime) {
      showModeToast("TEST中だけ時刻をシミュレーションできます。");
      return;
    }
    const time = els.nativeTestClockTime?.value || "16:01";
    state.nativeBehaviorRuntime.setClockTime?.(time);
    showModeToast(`TEST時刻を ${time} にしました。`);
    renderAll();
  }

  function renderNativeBehaviorPanel(layer = getSelectedLayer()) {
    if (!els.nativeBehaviorPanel) {
      return;
    }
    if (state.existingWeb.active || !layer) {
      els.nativeBehaviorPanel.innerHTML = "";
      return;
    }
    const page = getCurrentPage();
    window.TBalanceNativeBehaviors?.normalizePage?.(page);
    const related = getNativeBehaviorsForLayer(page, layer.id);
    const conflict = hasLegacyClickAction(layer) && related.some((behavior) => behavior.trigger?.type === "click");
    if (state.editorMode !== "custom" || state.tool !== "click") {
      els.nativeBehaviorPanel.innerHTML = "";
      return;
    }
    const summaries = related.length
      ? related.map((behavior) => `
          <div class="tb-native-behavior-row">
            <span>⚡ ${escapeHtml(window.TBalanceNativeBehaviors?.summarizeBehavior?.(behavior, { page }) || behavior.displayName || "動作あり")}</span>
            <label class="tb-check tb-ribbon-check">ON<input type="checkbox" data-native-behavior-toggle="${escapeAttr(behavior.behaviorId)}" ${behavior.enabled !== false ? "checked" : ""}></label>
          </div>
        `).join("")
      : "";
    els.nativeBehaviorPanel.innerHTML = `
      <div class="tb-native-behavior-head">
        <strong>標準動作</strong>
        ${conflict ? `<span class="tb-native-behavior-warning">既存クリック動作あり</span>` : ""}
      </div>
      ${summaries}
      <div class="tb-native-behavior-actions">
        <button type="button" data-native-behavior-action="random-dialogue">クリックで台詞</button>
        <button type="button" data-native-behavior-action="clock-scene">16:00 → 現在Scene</button>
      </div>
    `;
  }

  function getNativeBehaviorsForLayer(page, layerId) {
    return (page?.behaviors || []).filter((behavior) => {
      return behavior.trigger?.targetRef === layerId
        || (behavior.actions || []).some((action) => action.targetRef === layerId);
    });
  }

  function hasLegacyClickAction(layer) {
    return Boolean(layer?.link || (layer?.clickAction?.type && layer.clickAction.type !== "none"));
  }

  function handleNativeBehaviorPanelClick(event) {
    const button = event.target.closest("[data-native-behavior-action], [data-native-behavior-test-event]");
    if (!button || state.existingWeb.active) {
      return;
    }
    const action = button.dataset.nativeBehaviorAction;
    if (button.dataset.nativeBehaviorTestEvent) {
      dispatchNativeTestEvent(button.dataset.nativeBehaviorTestEvent);
      return;
    }
    if (action === "random-dialogue") {
      addNativeRandomDialogueBehavior();
    }
    if (action === "clock-scene") {
      addNativeClockSceneBehavior();
    }
  }

  function handleNativeBehaviorPanelChange(event) {
    const input = event.target.closest("[data-native-behavior-toggle]");
    if (!input || state.existingWeb.active) {
      return;
    }
    const page = getCurrentPage();
    const behavior = (page?.behaviors || []).find((item) => item.behaviorId === input.dataset.nativeBehaviorToggle);
    if (!behavior) {
      return;
    }
    pushHistory();
    behavior.enabled = Boolean(input.checked);
    markDirty();
    renderAll();
  }

  function addNativeRandomDialogueBehavior() {
    const page = getCurrentPage();
    const layer = getSelectedLayer();
    if (!page || !layer || state.existingWeb.active) {
      return;
    }
    pushHistory();
    window.TBalanceNativeBehaviors?.normalizePage?.(page);
    window.TBalanceNativeDataSources?.normalizeProject?.(state.project);
    const dataSource = createInlineDialogueDataSource(`${layer.name || "Layer"} 台詞`);
    state.project.dataSourceRegistry.dataSources.push(dataSource);
    const target = ensureDialogueTextLayer(page, layer);
    const sceneId = getActiveSceneId(page);
    page.dataSourceRefs = Array.from(new Set([...(page.dataSourceRefs || []), dataSource.dataSourceId]));
    page.behaviors.push(window.TBalanceNativeBehaviors.normalizeBehavior({
      displayName: `${layer.name || "Layer"} クリック台詞`,
      trigger: { type: "click", targetRef: layer.id },
      conditions: sceneId ? [{ type: "sceneIs", sceneId }] : [],
      actions: [{
        type: "showRandomDialogue",
        dataSourceRef: dataSource.dataSourceId,
        targetRef: target.id,
        textField: "text",
        excludePrevious: true,
      }],
      enabled: true,
    }));
    markDirty();
    renderAll();
    showModeToast("クリックすると台詞をランダム表示する標準動作を追加しました。");
  }

  function createInlineDialogueDataSource(displayName) {
    return window.TBalanceNativeDataSources.normalizeDataSource({
      displayName,
      kind: "dialogue-list",
      provider: "inline",
      mapping: { idField: "id", textField: "text" },
      items: [
        { id: "line-1", text: "今夜は、願いを書いて星のランタンにそっと預けられるよ。" },
        { id: "line-2", text: "星風が静かな日は、願いごとが遠くまで届きやすいんだ。" },
        { id: "line-3", text: "同じ言葉にならないように、次の台詞を選ぶね。" },
      ],
    });
  }

  function ensureDialogueTextLayer(page, sourceLayer) {
    const existing = (page.layers || []).find((layer) => layer.type === "text" && layer.role === "dialogue-text");
    if (existing) {
      return existing;
    }
    const activeViewport = getActiveViewportKey();
    const layout = getCurrentLayout(sourceLayer);
    const desktop = activeViewport === "desktop"
      ? { x: Math.round(layout.x), y: Math.max(0, Math.round(layout.y - 120)), width: Math.max(420, Math.round(layout.width * 1.6)), height: 90, rotation: 0 }
      : { x: 160, y: 220, width: 760, height: 140, rotation: 0 };
    const mobile = activeViewport === "mobile"
      ? { x: Math.round(layout.x), y: Math.max(0, Math.round(layout.y - 170)), width: Math.max(640, Math.round(layout.width * 1.4)), height: 150, rotation: 0 }
      : { x: 160, y: 220, width: 760, height: 140, rotation: 0 };
    const id = window.TBalanceNativeId?.createStableId("layer") || renderer.makeId("layer");
    const layer = {
      id,
      layerId: id,
      type: "text",
      role: "dialogue-text",
      name: "台詞テキスト",
      text: "TESTで台詞が表示されます",
      desktop,
      mobile,
      style: { fontSize: activeViewport === "mobile" ? 42 : 34, color: "#3b2a16", align: "center", weight: 700 },
      appearance: { opacity: 1, brightness: 1, shadow: "soft" },
      constraints: { keepAspect: false, keepSquare: false, keepCircle: false },
    };
    page.layers.push(layer);
    renderer.normalizeLayer(layer);
    return layer;
  }

  function addNativeClockSceneBehavior() {
    const page = getCurrentPage();
    const sceneId = getActiveSceneId(page);
    if (!page || !sceneId || state.existingWeb.active) {
      showModeToast("切り替え先Sceneを選んでください。");
      return;
    }
    pushHistory();
    window.TBalanceNativeBehaviors?.normalizePage?.(page);
    const scene = page.scenes.find((item) => item.sceneId === sceneId);
    page.behaviors.push(window.TBalanceNativeBehaviors.normalizeBehavior({
      displayName: `16:00 → ${scene?.displayName || "Scene"}`,
      trigger: { type: "clock", evaluateOnLoad: true, intervalSeconds: 60 },
      conditions: [{ type: "timeAtOrAfter", time: "16:00", timeZone: "browser-local" }],
      actions: [{ type: "setScene", sceneId }],
      enabled: true,
    }));
    markDirty();
    renderAll();
    showModeToast(`16:00以降に ${scene?.displayName || "Scene"} へ切り替える標準動作を追加しました。`);
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
      els.propSoundTarget.value = ["bgm", "ambient"].includes(mode) ? "page" : "selected";
      els.propSoundTarget.disabled = ["bgm", "ambient"].includes(mode);
    }
    els.propSoundTrigger.value = getSoundTriggerForMode(mode);
    els.propSoundTrigger.disabled = true;
    els.propSoundFileName.textContent = sound.fileName || "未設定";
    els.propSoundFileName.classList.toggle("is-empty", !sound.fileName);
    renderSoundScopeNote(target, mode, sound);
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

  function renderNativeAssetPanel() {
    if (!els.nativeAssetPanel) {
      return;
    }
    if (state.existingWeb.active) {
      state.nativeAssets.libraryOpen = false;
      if (els.nativeAssetLibraryModal) {
        els.nativeAssetLibraryModal.hidden = true;
      }
    }
    if (!state.nativeAssets.libraryOpen) {
      els.nativeAssetPanel.innerHTML = "";
      return;
    }
    const assets = window.TBalanceNativeAssets?.normalizeAssets?.(state.project?.assets || []) || [];
    const categories = window.TBalanceNativeAssets?.CATEGORIES || {};
    const groups = Object.keys(categories).map((category) => ({
      category,
      label: window.TBalanceNativeAssets?.getCategoryLabel?.(category) || category,
      assets: assets.filter((asset) => asset.category === category),
    }));
    const selectedAsset = assets.find((asset) => asset.assetId === state.nativeAssets.selectedAssetId) || assets[0] || null;
    if (selectedAsset && state.nativeAssets.selectedAssetId !== selectedAsset.assetId) {
      state.nativeAssets.selectedAssetId = selectedAsset.assetId;
    }
    const selectedLayer = getSelectedImageLayer();
    const recentAssets = getRecentNativeAssets(assets);
    els.nativeAssetPanel.innerHTML = `
      <div class="tb-native-asset-library-drop">
        <button type="button" data-native-asset-action="import">＋ 画像を追加</button>
        <span>画像・WebMをここへDropして追加</span>
      </div>
      ${renderNativeAssetStatus()}
      <div class="tb-native-asset-library-body">
        <section class="tb-native-asset-browser">
          ${groups.map((group) => `
            <section class="tb-native-asset-group">
              <h3>${escapeHtml(group.label)}</h3>
              <div class="tb-native-asset-grid">
                ${group.assets.length ? group.assets.map((asset) => renderNativeAssetCard(asset)).join("") : `<p class="tb-native-asset-empty">まだありません。</p>`}
              </div>
            </section>
          `).join("")}
          <section class="tb-native-asset-group">
            <h3>最近使った画像</h3>
            <div class="tb-native-asset-grid">
              ${recentAssets.length ? recentAssets.map((asset) => renderNativeAssetCard(asset)).join("") : `<p class="tb-native-asset-empty">まだありません。</p>`}
            </div>
          </section>
        </section>
        <aside class="tb-native-asset-detail">
          ${selectedAsset ? renderNativeAssetDetail(selectedAsset, selectedLayer) : `<p class="tb-native-asset-empty">画像を追加すると、ここに詳細が表示されます。</p>`}
        </aside>
      </div>
    `;
  }

  function renderNativeAssetCard(asset) {
    const src = window.TBalanceNativeAssets?.resolveAssetSrc?.(asset) || "";
    const size = asset.width && asset.height ? `${asset.width} × ${asset.height}` : "サイズ未取得";
    const selected = state.nativeAssets.selectedAssetId === asset.assetId;
    return `
      <article class="tb-native-asset-card${selected ? " is-selected" : ""}" data-native-asset-id="${escapeAttr(asset.assetId)}">
        <button type="button" class="tb-native-asset-thumb" data-native-asset-action="select" title="画像を選択">
          ${renderNativeAssetPreviewMedia(asset, src)}
        </button>
        <div>
          <strong>${escapeHtml(asset.displayName || asset.name || "画像")}</strong>
          <small>${escapeHtml(window.TBalanceNativeAssets?.getCategoryLabel?.(asset.category) || "未分類")} / ${escapeHtml(size)}</small>
        </div>
      </article>
    `;
  }

  function renderNativeAssetCategoryOptions(selectedCategory) {
    const categories = window.TBalanceNativeAssets?.CATEGORIES || {};
    return Object.keys(categories).map((category) => `
      <option value="${escapeAttr(category)}"${category === selectedCategory ? " selected" : ""}>${escapeHtml(categories[category].label || category)}</option>
    `).join("");
  }

  function getNativeAssetDuplicateGroup(asset) {
    if (!asset?.contentHash) {
      return [];
    }
    const hash = asset.contentHash;
    return (state.project?.assets || []).filter((item) => item.contentHash && item.contentHash === hash);
  }

  function renderNativeAssetDetail(asset, selectedLayer) {
    const src = window.TBalanceNativeAssets?.resolveAssetSrc?.(asset) || "";
    const size = asset.width && asset.height ? `${asset.width} × ${asset.height}` : "サイズ未取得";
    const duplicateCount = getNativeAssetDuplicateGroup(asset).length;
    return `
      <div class="tb-native-asset-preview">
        ${renderNativeAssetPreviewMedia(asset, src)}
      </div>
      <strong>${escapeHtml(asset.displayName || asset.name || "画像")}</strong>
      <small>${escapeHtml(window.TBalanceNativeAssets?.getCategoryLabel?.(asset.category) || "未分類")} / ${escapeHtml(size)}</small>
      ${duplicateCount > 1 ? `<p class="tb-native-asset-warning">同じ画像が${duplicateCount}件登録されています。</p>` : ""}
      <label class="tb-native-asset-category">分類
        <select data-native-asset-action="category" data-native-asset-id="${escapeAttr(asset.assetId)}">
          ${renderNativeAssetCategoryOptions(asset.category)}
        </select>
      </label>
      <div class="tb-native-asset-detail-actions">
        ${selectedLayer ? `<button type="button" data-native-asset-action="replace-selected" data-native-asset-id="${escapeAttr(asset.assetId)}">このレイヤーの画像にする</button>` : ""}
        <button type="button" data-native-asset-action="add" data-native-asset-id="${escapeAttr(asset.assetId)}">新しいレイヤーとして追加</button>
        <button type="button" data-native-asset-action="rename" data-native-asset-id="${escapeAttr(asset.assetId)}">名前を変更</button>
      </div>
    `;
  }

  function renderNativeAssetStatus() {
    if (state.nativeAssets.duplicateNotice) {
      const notice = state.nativeAssets.duplicateNotice;
      const currentLabel = window.TBalanceNativeAssets?.getCategoryLabel?.(notice.currentCategory) || "未分類";
      const requestedLabel = window.TBalanceNativeAssets?.getCategoryLabel?.(notice.requestedCategory) || currentLabel;
      const canChange = notice.requestedCategory && notice.requestedCategory !== notice.currentCategory;
      return `
        <section class="tb-native-asset-message" data-status="notice">
          <strong>この画像はすでに画像ライブラリーにあります</strong>
          <p>現在の分類: ${escapeHtml(currentLabel)}</p>
          <div>
            <button type="button" data-native-asset-action="use-duplicate" data-native-asset-id="${escapeAttr(notice.assetId)}">この画像を使う</button>
            ${canChange ? `<button type="button" data-native-asset-action="change-duplicate-category" data-native-asset-id="${escapeAttr(notice.assetId)}" data-native-asset-category="${escapeAttr(notice.requestedCategory)}">分類を${escapeHtml(requestedLabel)}に変更</button>` : ""}
          </div>
        </section>
      `;
    }
    if (state.nativeAssets.status === "error") {
      return `
        <section class="tb-native-asset-message" data-status="error">
          <strong>⚠ 画像をライブラリーに保存できません</strong>
          <p>${escapeHtml(getNativeAssetStatusText())}</p>
          <div>
            <button type="button" data-native-asset-action="help">起動方法を見る</button>
            <button type="button" data-native-asset-action="retry">再試行</button>
          </div>
        </section>
      `;
    }
    return `<p class="tb-native-asset-status" data-status="${escapeAttr(state.nativeAssets.status || "idle")}">${escapeHtml(getNativeAssetStatusText())}</p>`;
  }

  function getNativeAssetStatusText() {
    if (state.nativeAssets.status === "error") {
      return state.nativeAssets.message || "画像は現在のページには表示されていますが、Projectの画像ライブラリーにはまだ保存されていません。TBalanceの保存サービスを起動してから再試行してください。";
    }
    if (state.nativeAssets.status === "ok") {
      return state.nativeAssets.message || "画像ライブラリーを読み込みました。";
    }
    if (state.nativeAssets.status === "working") {
      return state.nativeAssets.message || "画像ライブラリーへ追加しています。";
    }
    return "画像を追加すると、このProjectの画像ライブラリーで再利用できます。";
  }

  function renderNativeAssetPreviewMedia(asset, src) {
    if (!src) {
      return `<span>?</span>`;
    }
    if (isNativeVideoAsset(asset)) {
      return `<video src="${escapeAttr(src)}" muted playsinline preload="metadata" aria-label="${escapeAttr(asset.displayName || asset.name || "動画")}"></video>`;
    }
    return `<img src="${escapeAttr(src)}" alt="">`;
  }

  function isNativeVideoAsset(asset) {
    return String(asset?.mediaType || "").toLowerCase() === "video/webm";
  }

  function handleNativeAssetPanelClick(event) {
    const button = event.target.closest("[data-native-asset-action]");
    if (!button) {
      return;
    }
    const action = button.dataset.nativeAssetAction || "";
    const card = button.closest("[data-native-asset-id]");
    const assetId = button.dataset.nativeAssetId || card?.dataset.nativeAssetId || "";
    if (action === "import") {
      state.nativeAssets.pendingFileIntent = "library";
      els.imageFile?.click();
    } else if (action === "select") {
      state.nativeAssets.selectedAssetId = assetId;
      if (state.nativeAssets.duplicateNotice?.assetId !== assetId) {
        state.nativeAssets.duplicateNotice = null;
      }
      renderNativeAssetPanel();
    } else if (action === "add") {
      addNativeAssetLayer(assetId);
    } else if (action === "replace-selected") {
      replaceSelectedLayerWithNativeAsset(assetId);
    } else if (action === "rename") {
      renameNativeAsset(assetId);
    } else if (action === "retry") {
      retryNativeAssetSave();
    } else if (action === "help") {
      showModeToast("保存サービスを起動してから、画像をもう一度追加してください。");
    } else if (action === "use-duplicate") {
      state.nativeAssets.selectedAssetId = assetId;
      state.nativeAssets.duplicateNotice = null;
      rememberNativeAsset(assetId);
      renderNativeAssetPanel();
    } else if (action === "change-duplicate-category") {
      updateNativeAssetCategory(assetId, button.dataset.nativeAssetCategory || "uncategorized");
    }
  }

  function handleNativeAssetPanelChange(event) {
    const control = event.target.closest("[data-native-asset-action='category']");
    if (!control) {
      return;
    }
    updateNativeAssetCategory(control.dataset.nativeAssetId || "", control.value);
  }

  function openNativeAssetLibrary() {
    if (state.existingWeb.active) {
      showModeToast("Existing Web編集中は、現在の安全ワークフローを優先します。");
      return;
    }
    state.nativeAssets.libraryOpen = true;
    if (els.nativeAssetLibraryModal) {
      els.nativeAssetLibraryModal.hidden = false;
    }
    loadNativeAssetRegistryFromBridge().finally(() => {
      renderNativeAssetPanel();
    });
    setTool("move");
    renderNativeAssetPanel();
  }

  function closeNativeAssetLibrary() {
    state.nativeAssets.libraryOpen = false;
    if (els.nativeAssetLibraryModal) {
      els.nativeAssetLibraryModal.hidden = true;
    }
    renderNativeAssetPanel();
  }

  function finishNativeAssetPlacement() {
    closeNativeAssetLibrary();
    window.requestAnimationFrame?.(() => {
      els.canvas?.focus?.({ preventScroll: true });
    });
  }

  function handleNativeAssetLibraryDragOver(event) {
    if (!state.nativeAssets.libraryOpen) {
      return;
    }
    event.preventDefault();
  }

  function handleNativeAssetLibraryDrop(event) {
    if (!state.nativeAssets.libraryOpen) {
      return;
    }
    event.preventDefault();
    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    if (!file || !isNativeAssetFileAllowed(file)) {
      return;
    }
    addImageToNativeAssetLibrary(file);
  }

  async function addImageToNativeAssetLibrary(file) {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || "");
      const result = await importFileToProjectAsset(file, dataUrl, { placement: "library" });
      if (result?.asset?.assetId) {
        state.nativeAssets.selectedAssetId = result.asset.assetId;
        rememberNativeAsset(result.asset.assetId);
      }
      markDirty();
      renderAll();
      if (result?.formal) {
        const label = window.TBalanceNativeAssets?.getCategoryLabel?.(result.asset?.category) || "画像";
        const message = result.status === "duplicate-reused"
          ? "✓ 画像ライブラリー内の既存画像を使います"
          : `✓ ${label}として画像ライブラリーに追加しました`;
        showModeToast(message);
      }
    };
    reader.readAsDataURL(file);
  }

  function retryNativeAssetSave() {
    state.nativeAssets.pendingFileIntent = "library";
    els.imageFile?.click();
  }

  function getRecentNativeAssets(assets) {
    const byId = new Map(assets.map((asset) => [asset.assetId, asset]));
    return (state.nativeAssets.recentAssetIds || []).map((assetId) => byId.get(assetId)).filter(Boolean).slice(0, 8);
  }

  function rememberNativeAsset(assetId) {
    if (!assetId) {
      return;
    }
    state.nativeAssets.recentAssetIds = [assetId].concat((state.nativeAssets.recentAssetIds || []).filter((id) => id !== assetId)).slice(0, 12);
  }

  async function updateNativeAssetCategory(assetId, category) {
    const asset = window.TBalanceNativeAssets?.findAsset?.(state.project, assetId);
    const nextCategory = window.TBalanceNativeAssets?.normalizeCategory?.(category) || "uncategorized";
    if (!asset) {
      showModeToast("画像が見つかりません。");
      return;
    }
    if (asset.category === nextCategory) {
      state.nativeAssets.duplicateNotice = null;
      renderNativeAssetPanel();
      return;
    }
    const normalized = window.TBalanceNativeAssets?.upsertAsset?.(state.project, Object.assign({}, asset, {
      category: nextCategory,
    }));
    state.nativeAssets.selectedAssetId = normalized?.assetId || asset.assetId;
    state.nativeAssets.duplicateNotice = null;
    state.nativeAssets.status = "ok";
    state.nativeAssets.message = `分類を${window.TBalanceNativeAssets?.getCategoryLabel?.(nextCategory) || "未分類"}に変更しました。`;
    if (state.nativeAssets.storageAvailable) {
      try {
        const result = await postNativeAssetRequest("/update", {
          projectId: getNativeProjectId(),
          assetId,
          category: nextCategory,
        });
        window.TBalanceNativeAssets?.mergeProjectRegistry?.(state.project, result.registry);
      } catch (error) {
        state.nativeAssets.status = "error";
        state.nativeAssets.message = "分類は画面上で変更しましたが、画像ライブラリーへの保存はまだ完了していません。保存サービスを起動してから再試行してください。";
      }
    }
    markDirty();
    renderAll();
  }

  function addNativeAssetLayer(assetId) {
    const asset = window.TBalanceNativeAssets?.findAsset?.(state.project, assetId);
    if (!asset) {
      showModeToast("画像が見つかりません。");
      return;
    }
    const size = getPageViewportSize(getCurrentPage(), state.viewport);
    const width = asset.width ? Math.min(asset.width, 360) : DEFAULT_DROP_SIZE.width;
    const height = asset.height ? Math.min(asset.height, 260) : DEFAULT_DROP_SIZE.height;
    const layout = createCenteredLayout({ x: size.width / 2, y: size.height / 2 }, width, height);
    const inactiveViewport = state.viewport === "mobile" ? "desktop" : "mobile";
    const inactiveLayout = createResponsiveLayerLayout(layout, state.viewport, inactiveViewport, 260, 260);
    addLayer({
      type: "image",
      name: asset.displayName || asset.name || "画像",
      fileName: asset.originalName || "",
      assetRef: asset.assetId,
      assetId: asset.assetId,
      src: "",
      desktop: state.viewport === "desktop" ? layout : inactiveLayout,
      mobile: state.viewport === "mobile" ? layout : inactiveLayout,
      appearance: { opacity: 1, brightness: 1, shadow: "soft" },
      constraints: { keepAspect: true, keepSquare: false, keepCircle: false },
    });
    rememberNativeAsset(asset.assetId);
    finishNativeAssetPlacement();
    showModeToast(`${asset.displayName || "画像"} をページに追加しました。`);
  }

  function addNativeBackgroundAssetLayer(asset) {
    const page = getCurrentPage();
    const desktopSize = getPageViewportSize(page, "desktop");
    const mobileSize = getPageViewportSize(page, "mobile");
    const layerId = window.TBalanceNativeId?.createStableId("layer") || renderer.makeId("layer");
    const layer = {
      type: "image",
      role: "background",
      name: "背景",
      fileName: asset.originalName || "",
      src: "",
      locked: true,
      desktop: createFullCanvasLayout(desktopSize),
      mobile: createFullCanvasLayout(mobileSize),
      base: createFullCanvasLayout(desktopSize),
      viewportOverrides: {},
      sceneOverrides: {},
      sceneViewportOverrides: {},
      appearance: { opacity: 1, brightness: 1, shadow: "none" },
      constraints: { keepAspect: false, keepSquare: false, keepCircle: false },
    };
    const sceneId = getActiveSceneId(page);
    const viewport = getActiveViewportKey();
    const scope = window.TBalanceNativeScenes?.getWriteScope?.(page, viewport, sceneId) || { type: viewport === "mobile" ? "viewport" : "base", viewportId: viewport };
    const target = getNativeLayerScopeTarget(layer, scope);
    target.assetRef = asset.assetId;
    target.assetId = asset.assetId;
    addLayer(Object.assign({ id: layerId, layerId }, layer));
    rememberNativeAsset(asset.assetId);
    showModeToast(`背景画像を${getCurrentLayerImageScopeLabel()}へ設定しました。`);
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

  function getNativeLayerScopeTarget(layer, scope) {
    if (scope.type === "base") {
      layer.base = Object.assign({}, layer.base || {});
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

  function getCurrentBackgroundImageLayer() {
    return (getCurrentPage()?.layers || []).find((layer) => layer.type === "image" && layer.role === "background") || null;
  }

  function replaceSelectedLayerWithNativeAsset(assetId) {
    const asset = window.TBalanceNativeAssets?.findAsset?.(state.project, assetId);
    const layer = getSelectedImageLayer();
    if (!asset || !layer) {
      showModeToast("画像レイヤーを選択してください。");
      return;
    }
    updateSelected((selected) => {
      if (selected.id !== layer.id || selected.type !== "image") {
        return;
      }
      selected.fileName = asset.originalName || asset.displayName || selected.fileName || "";
      selected.name = selected.name || asset.displayName || asset.name || "画像";
      selected.constraints = Object.assign({ keepAspect: true, keepSquare: false, keepCircle: false }, selected.constraints || {});
      const layout = getCurrentLayout(selected);
      layout.assetRef = asset.assetId;
      layout.assetId = asset.assetId;
      if (selected.role === "background") {
        fitBackgroundLayoutToCurrentScope(selected, layout);
      }
    });
    clearImageWarnings(layer.id, getActiveViewportKey());
    rememberNativeAsset(asset.assetId);
    finishNativeAssetPlacement();
    showModeToast(`選択中のレイヤー画像を${getCurrentLayerImageScopeLabel()}へ設定しました。`);
  }

  function getCurrentLayerImageScopeLabel() {
    const page = getCurrentPage();
    const viewport = getActiveViewportKey() === "mobile" ? "Mobile" : "PC";
    const sceneId = getActiveSceneId(page);
    const scene = page?.scenes?.find((item) => item.sceneId === sceneId);
    return `${scene?.displayName || "共通"} / ${viewport}`;
  }

  function fitBackgroundLayoutToCurrentScope(layer, layout = getCurrentLayout(layer)) {
    if (!layer || layer.role !== "background" || !layout) {
      return;
    }
    const size = getPageViewportSize(getCurrentPage(), getActiveViewportKey());
    fitBackgroundLayoutToSize(layer, layout, size);
  }

  function ensureBackgroundLayersFitViewport(page, viewport, sceneId = "") {
    if (!page || state.existingWeb.active) {
      return;
    }
    (page.layers || []).forEach((layer) => {
      if (layer.type !== "image" || layer.role !== "background") {
        return;
      }
      const layout = window.TBalanceNativeScenes?.getWritableLayerState?.(layer, page, viewport, sceneId)
        || layer[renderer.getViewportKey(viewport)];
      fitBackgroundLayoutToSize(layer, layout, getPageViewportSize(page, viewport));
    });
  }

  function fitBackgroundLayoutToSize(layer, layout, size) {
    if (!layout) {
      return;
    }
    layout.x = 0;
    layout.y = 0;
    layout.width = Math.max(1, Math.round(Number(size.width) || 1));
    layout.height = Math.max(1, Math.round(Number(size.height) || 1));
    layout.rotation = 0;
    layer.constraints = Object.assign({}, layer.constraints || {}, { keepAspect: false });
  }

  async function renameNativeAsset(assetId) {
    const asset = window.TBalanceNativeAssets?.findAsset?.(state.project, assetId);
    if (!asset) {
      return;
    }
    const nextName = prompt("画像名", asset.displayName || asset.name || "");
    if (nextName === null || !nextName.trim()) {
      return;
    }
    const beforeId = asset.assetId;
    const beforePath = asset.storage?.relativePath || asset.relativePath || "";
    const normalized = window.TBalanceNativeAssets.upsertAsset(state.project, Object.assign({}, asset, {
      displayName: nextName.trim(),
      name: nextName.trim(),
    }));
    if (state.nativeAssets.storageAvailable) {
      try {
        await postNativeAssetRequest("/update", {
          projectId: getNativeProjectId(),
          assetId: beforeId,
          displayName: nextName.trim(),
        });
      } catch (error) {
        state.nativeAssets.status = "error";
        state.nativeAssets.message = "画像名は画面上で変更しましたが、画像ライブラリーへの保存はまだ完了していません。保存サービスを起動してから再試行してください。";
      }
    }
    if (normalized.assetId !== beforeId || (normalized.storage?.relativePath || normalized.relativePath || "") !== beforePath) {
      console.warn("Native Asset rename should not change identity or file path.");
    }
    markDirty();
    renderAll();
  }

  function renderLayerList() {
    renderNativeAssetPanel();
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
    const workflow = getExistingWebWorkflow();
    const workflowHtml = buildExistingWebWorkflowPanel();
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
                ${state.editorMode === "custom" ? `<small>${escapeHtml(layer.relatedCount > 1 ? `${layer.detail} / 関連要素 ${layer.relatedCount}件` : layer.detail)}</small>` : ""}
              </span>
              ${state.editorMode === "custom"
                ? `<span class="tb-existing-web-virtual-status">${escapeHtml(layer.status.label)}</span>`
                : `<span class="tb-existing-web-virtual-status">${escapeHtml(getExistingWebLayerPreviewMarker(layer))}</span>`}
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
        ${workflowHtml}
        ${state.editorMode === "custom" || workflow.tab === "layers" ? pageCheckHtml : ""}
        ${state.editorMode === "custom" || workflow.tab === "layers" ? layerRows : ""}
        ${state.editorMode === "custom" || workflow.tab === "adjust" ? buildExistingWebSelectionSummary(state.editorMode === "custom" ? "custom" : "normal") : ""}
        ${state.editorMode !== "custom" && workflow.tab === "analysis" ? buildExistingWebAnalysisPanel() : ""}
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

  function setExistingWebWorkflowTab(tabName) {
    const workflow = getExistingWebWorkflow();
    const safeTab = ["layers", "adjust", "analysis"].includes(tabName) ? tabName : "layers";
    state.existingWeb.workflow = {
      ...workflow,
      tab: safeTab,
    };
    renderAll();
  }

  function handleGlobalTestButton() {
    if (state.existingWeb.active) {
      const nextMode = state.existingWeb.mode === "test" ? "edit" : "test";
      setExistingWebMode(nextMode);
      showModeToast(nextMode === "test"
        ? "Existing Web TEST中です。ページ本来の動作を確認できます。"
        : "Existing Web編集に戻りました。");
      return;
    }
    toggleTestMode();
  }

  function buildExistingWebWorkflowPanel() {
    if (state.editorMode === "custom") {
      return "";
    }
    const workflow = recoverExistingWebWorkflowStateFromRuntime();
    const count = getExistingWebPreviewChangeCount();
    const status = count ? workflow.status : "clean";
    const eligibility = getExistingWebWorkflowEligibility(status, count);
    const readyCount = eligibility.readyCount;
    const pendingCount = eligibility.pendingCount;
    const statusLabel = status === "dirty"
      ? `変更あり ${count}件`
    : status === "analyzing"
        ? `${count}件の変更を確認中`
        : status === "ready_to_apply"
          ? `変更確認済み ${readyCount || count}件`
          : status === "mixed_ready"
            ? `反映可能 ${readyCount}件 / 要確認 ${pendingCount}件`
          : status === "review_required"
            ? getExistingWebReviewStatusLabel(workflow, count)
            : status === "manual_review_required"
              ? "要確認"
            : status === "applying"
              ? "反映中"
              : status === "ai_reviewing"
                ? "AIで確認中"
                : status === "ai_response_imported"
                  ? "AI回答を確認中"
              : "変更なし";
    const buttonLabel = status === "ready_to_apply"
      ? "変更を反映"
      : status === "mixed_ready"
        ? `確認済み${readyCount}件を反映`
      : status === "review_required"
        ? "変更を確認"
      : status === "manual_review_required"
          ? "要確認だけ再試行"
        : status === "ai_reviewing"
          ? "変更を確認"
          : "変更を確認";
    const canApply = eligibility.canApply;
    const canRetry = ["dirty", "review_required", "manual_review_required"].includes(status);
    const disabled = canApply ? false : !canRetry;
    const primaryAction = "safe-change";
    const nextText = getExistingWebWorkflowNextActionText(status, eligibility, workflow);
    const retryLabel = pendingCount === 1 ? "要確認1件だけ再試行" : `要確認${pendingCount}件だけ再試行`;
    const tabs = [
      ["layers", "レイヤー"],
      ["adjust", "調整"],
      ["analysis", "分析"],
    ];
    return `
      <section class="tb-existing-web-workflow" data-workflow-state="${escapeAttr(status)}">
        <div class="tb-existing-web-workflow-tabs" role="tablist" aria-label="Standard Web編集">
          ${tabs.map(([key, label]) => `
            <button type="button" class="${workflow.tab === key ? "is-active" : ""}" data-existing-web-action="workflow-tab" data-existing-web-workflow-tab="${escapeAttr(key)}">${escapeHtml(label)}</button>
          `).join("")}
        </div>
        <div class="tb-existing-web-main-action">
          <span class="tb-existing-web-main-status">${escapeHtml(statusLabel)}</span>
          <button type="button" data-existing-web-action="${primaryAction}" class="${["ready_to_apply", "mixed_ready"].includes(status) ? "is-apply" : ""}"${disabled ? " disabled" : ""}>${escapeHtml(buttonLabel)}</button>
        </div>
        ${nextText ? `<p class="tb-existing-web-next-action">${escapeHtml(nextText)}</p>` : ""}
        <div class="tb-existing-web-secondary-actions">
          ${status === "manual_review_required" ? `<button type="button" data-existing-web-action="workflow-tab" data-existing-web-workflow-tab="analysis">詳細を見る</button>` : ""}
          ${status === "mixed_ready" && pendingCount > 0 ? `<button type="button" data-existing-web-action="safe-change-retry">${escapeHtml(retryLabel)}</button>` : ""}
          <button type="button" data-existing-web-action="reset-preview"${count ? "" : " disabled"}>変更をすべて元に戻す</button>
        </div>
        ${workflow.message ? `<p>${escapeHtml(workflow.message)}</p>` : ""}
      </section>
    `;
  }

  function getExistingWebWorkflowEligibility(status = "", count = getExistingWebPreviewChangeCount()) {
    const preflight = state.analyzer.safeApply?.preflight || null;
    const preflightReadyCount = preflight?.ok
      ? Number(preflight.summary?.totalCandidates || preflight.operations?.length || 0)
      : 0;
    const impact = state.existingWeb.impactAnalysis || null;
    const impactReadyCount = Number(impact?.summary?.safe || 0);
    const impactReviewCount = Number(impact?.summary?.review || 0);
    const itemReadyCount = Array.isArray(impact?.items)
      ? impact.items.filter((item) => item?.status === "safe" || item?.resolution?.ok).length
      : 0;
    const readyCount = preflightReadyCount || impactReadyCount || itemReadyCount || (status === "ready_to_apply" ? count : 0);
    const pendingCount = Math.max(0, count - readyCount);
    return {
      status,
      totalCount: count,
      readyCount,
      reviewCount: impactReviewCount || (["review_required", "manual_review_required", "mixed_ready"].includes(status) ? pendingCount : 0),
      blockedCount: Number(impact?.summary?.blocked || 0),
      pendingCount,
      preflightPassed: Boolean(preflight?.ok),
      canApply: ["ready_to_apply", "mixed_ready"].includes(status) && readyCount > 0,
      applyBatchId: preflight?.batchApplyVersion ? (preflight.candidateSignatures || []).join("|") : (preflight?.candidateSignature || ""),
    };
  }

  function getExistingWebWorkflowNextActionText(status, eligibility, workflow) {
    if (status === "ready_to_apply") {
      return `${eligibility.readyCount || eligibility.totalCount}件を反映できます。次の操作: 変更を反映`;
    }
    if (status === "mixed_ready") {
      return `${eligibility.readyCount}件は反映できます。${eligibility.pendingCount}件は確認が必要です。`;
    }
    if (status === "manual_review_required" || status === "review_required") {
      return eligibility.readyCount > 0
        ? `${eligibility.readyCount}件は反映できます。要確認の変更は反映しません。`
        : (workflow.message || "確認できませんでした。要確認の変更を再試行できます。");
    }
    if (status === "ai_reviewing" || status === "ai_response_imported" || status === "analyzing") {
      return "確認が終わるまでお待ちください。";
    }
    return "";
  }

  function getExistingWebReviewStatusLabel(workflow, count) {
    const match = String(workflow.message || "").match(/(\d+)件中(\d+)件/);
    if (match) {
      return `${match[1]}件中${match[2]}件に確認が必要`;
    }
    return count ? `${count}件に確認が必要` : "要確認";
  }

  function getExistingWebWorkflowReadyCount() {
    const preflight = state.analyzer.safeApply?.preflight;
    if (preflight?.ok) {
      return Number(preflight.summary?.totalCandidates || preflight.operations?.length || 0);
    }
    const impact = state.existingWeb.impactAnalysis;
    if (impact?.summary) {
      return Number(impact.summary.safe || 0);
    }
    return getExistingWebWorkflow().status === "ready_to_apply" ? getExistingWebPreviewChangeCount() : 0;
  }

  function buildExistingWebAnalysisPanel() {
    const impact = state.existingWeb.impactAnalysis;
    const workflow = getExistingWebWorkflow();
    if (!impact) {
      return `<p class="tb-existing-web-empty">${escapeHtml(workflow.message || "分析結果はまだありません。変更後に「変更を確認」を押してください。")}</p>`;
    }
    if (impact.batch) {
      return `
        <article class="tb-existing-web-selection-card tb-existing-web-analysis-card">
          <h3>変更後の影響分析</h3>
          <p>${escapeHtml(impact.intent || "")}</p>
          ${buildExistingWebBatchImpactHtml(impact)}
          ${["ready_to_apply", "mixed_ready"].includes(workflow.status)
            ? `<p class="tb-existing-web-preview-note">Sourceへ反映できます。反映前に確認Dialogを表示します。</p>`
            : `<p class="tb-existing-web-preview-note">${escapeHtml(workflow.message || "Source反映には追加確認が必要です。")}</p>`}
          ${["ready_to_apply", "mixed_ready"].includes(workflow.status) ? "" : buildExistingWebSafetyAiDiagnosticHtml(workflow.lastResult?.safetyAiDiagnostic)}
        </article>
      `;
    }
    return `
      <article class="tb-existing-web-selection-card tb-existing-web-analysis-card">
        <h3>変更後の影響分析</h3>
        <p>${escapeHtml(impact.intent || "")}</p>
        ${buildExistingWebImpactHtml(impact)}
        ${["ready_to_apply", "mixed_ready"].includes(workflow.status)
          ? `<p class="tb-existing-web-preview-note">Sourceへ反映できます。反映前に確認Dialogを表示します。</p>`
          : `<p class="tb-existing-web-preview-note">${escapeHtml(workflow.message || "Source反映には追加確認が必要です。")}</p>`}
        ${["ready_to_apply", "mixed_ready"].includes(workflow.status) ? "" : buildExistingWebSafetyAiDiagnosticHtml(workflow.lastResult?.safetyAiDiagnostic)}
      </article>
    `;
  }

  function buildExistingWebSafetyAiDiagnosticHtml(diagnostic) {
    if (!diagnostic) {
      return "";
    }
    const provider = diagnostic.provider || {};
    const response = diagnostic.response || {};
    const revalidation = diagnostic.revalidation || {};
    const targets = response.targets || [];
    const checks = revalidation.checks || [];
    return `
      <details class="tb-existing-web-safety-ai-diagnostic" open>
        <summary>Safety AI Diagnostic</summary>
        <dl class="tb-existing-web-normal-checks">
          <div data-check-state="${provider.exitCode === 0 ? "ok" : "warning"}">
            <dt>Codex</dt>
            <dd>${escapeHtml(`exitCode:${provider.exitCode ?? "-"} / ${provider.finalAgentMessageFound ? "final messageあり" : "final messageなし"} / ${provider.durationMs || 0}ms`)}</dd>
          </div>
          <div data-check-state="${provider.structuredResponseValidationSuccess ? "ok" : "warning"}">
            <dt>Schema</dt>
            <dd>${escapeHtml(provider.structuredResponseValidationSuccess ? "valid" : provider.responseValidationMessage || provider.responseParseMessage || "invalid")}</dd>
          </div>
          <div data-check-state="${revalidation.ok ? "ok" : "warning"}">
            <dt>Reject</dt>
            <dd>${escapeHtml(`${revalidation.firstFailedCheck || "-"} / ${revalidation.reasonCode || "-"}`)}</dd>
          </div>
        </dl>
        ${targets.map((target) => `
          <section class="tb-existing-web-ai-result" data-ai-result="AI_RESULT_UNKNOWN">
            <strong>${escapeHtml(target.domRef || "target")} / ${escapeHtml(target.status || response.status || "-")}</strong>
            ${(target.sourceChanges || []).map((sourceChange) => `
              <p>${escapeHtml([
                sourceChange.sourcePath || "-",
                sourceChange.selector || "-",
                sourceChange.property || "-",
                `${sourceChange.before || "-"} -> ${sourceChange.after || "-"}`,
              ].join(" / "))}</p>
            `).join("") || "<p>Source候補なし</p>"}
            <p>${escapeHtml(`reason: ${target.reason || response.reason || "-"} / confidence: ${target.confidence || response.confidence || "-"}`)}</p>
          </section>
        `).join("")}
        ${checks.length ? `<dl class="tb-existing-web-normal-checks">
          ${checks.map((check) => `
            <div data-check-state="${check.ok ? "ok" : "warning"}">
              <dt>${escapeHtml(check.label || check.code || "check")}</dt>
              <dd>${escapeHtml(`${check.ok ? "OK" : "FAIL"}${check.message ? ` / ${check.message}` : ""}`)}</dd>
            </div>
          `).join("")}
        </dl>` : ""}
        <pre class="tb-existing-web-custom">${escapeHtml(JSON.stringify(diagnostic, null, 2))}</pre>
      </details>
    `;
  }

  function buildExistingWebWorkflowImpactAnalysis(resolution, changes) {
    if (!resolution?.batch) {
      const item = resolution?.changes?.[0] || {};
      return buildExistingWebImpactAnalysis(item.selected || state.existingWeb.selected, item.change || changes?.[0], resolution);
    }
    const items = (resolution.changes || []).map((item) => {
      const selected = item.selected;
      const change = item.change;
      const itemResolution = item.resolution || {};
      return {
        title: selected ? getExistingWebSelectionTitle(selected) : change?.domRef || "変更",
        domRef: change?.domRef || selected?.domRef || "",
        preview: change,
        status: isExistingWebFinalItemReady(item) ? "safe" : "review_required",
        message: isExistingWebFinalItemReady(item) ? "反映可能" : getExistingWebReviewRequiredMessage(itemResolution),
        source: summarizeExistingWebSourceResolution(itemResolution),
      };
    });
    const finalSummary = summarizeExistingWebFinalResolutionItems(getExistingWebFinalResolutionItems(resolution, changes), changes.length);
    return {
      batch: true,
      intent: `変更 ${changes.length}件`,
      status: resolution.status || (resolution.ok ? "ready_to_apply" : "review_required"),
      summary: {
        total: finalSummary.total,
        safe: finalSummary.ready,
        review: finalSummary.review,
        blocked: finalSummary.review + finalSummary.blocked,
      },
      items,
      preflight: resolution.batchPreflight || null,
      message: resolution.message || "",
    };
  }

  function buildExistingWebBatchImpactHtml(impact) {
    const summary = impact.summary || {};
    const blockedCount = Number(summary.blocked || 0);
    const safeCount = Number(summary.safe || 0);
    return `
      <section class="tb-existing-web-impact">
        <header>
          <strong>変更 ${Number(summary.total || impact.items?.length || 0)}件</strong>
          <span>${safeCount}件反映可能${blockedCount ? ` / ${blockedCount}件要確認` : ""}</span>
        </header>
        <dl class="tb-existing-web-normal-checks">
          ${(impact.items || []).map((item) => `
            <div data-check-state="${item.status === "safe" ? "ok" : "warning"}">
              <dt>${escapeHtml(item.title || item.domRef || "変更")}</dt>
              <dd>${escapeHtml(item.status === "safe" ? `${formatExistingWebPreviewForNormal(item.preview)} / ${item.message}` : item.message)}</dd>
            </div>
          `).join("")}
        </dl>
        ${impact.preflight?.diffText ? `<pre class="tb-existing-web-custom">${escapeHtml(impact.preflight.diffText)}</pre>` : ""}
      </section>
    `;
  }

  function getExistingWebLayerPreviewMarker(layer) {
    const changed = (state.existingWeb.previewHistory || []).some((change) => change.domRef === layer.domRef)
      || (state.existingWeb.preview?.changes || []).some((change) => change.domRef === layer.domRef);
    if (changed) return "●";
    if (layer.status?.key === "protected") return "LOCK";
    if (layer.status?.key === "problem") return "!";
    return "";
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
        <button type="button" data-existing-web-action="reset-preview">変更をすべて元に戻す</button>
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
        <button type="button" data-existing-web-action="reset-preview">変更をすべて元に戻す</button>
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
      rotation: "回転",
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
      const dx = roundExistingWebNumber(preview.userEdit?.type === "move" ? preview.userEdit.deltaX : ((preview.after?.x || 0) - (preview.before?.x || 0)));
      const dy = roundExistingWebNumber(preview.userEdit?.type === "move" ? preview.userEdit.deltaY : ((preview.after?.y || 0) - (preview.before?.y || 0)));
      return `位置を X ${dx >= 0 ? "+" : ""}${dx}px / Y ${dy >= 0 ? "+" : ""}${dy}px 移動`;
    }
    if (preview.property === "size") {
      const dw = roundExistingWebNumber(preview.userEdit?.type === "resize" ? preview.userEdit.widthDelta : ((preview.after?.width || 0) - (preview.before?.width || 0)));
      const dh = roundExistingWebNumber(preview.userEdit?.type === "resize" ? preview.userEdit.heightDelta : ((preview.after?.height || 0) - (preview.before?.height || 0)));
      return `サイズを 幅 ${dw >= 0 ? "+" : ""}${dw}px / 高さ ${dh >= 0 ? "+" : ""}${dh}px 変更`;
    }
    if (preview.property === "rotation") {
      const rotation = normalizeExistingWebAngle(preview.userEdit?.type === "rotate" ? preview.userEdit.rotationDelta : ((preview.after?.rotation || 0) - (preview.before?.rotation || 0)));
      return `回転を ${rotation >= 0 ? "+" : ""}${rotation}° 変更`;
    }
    return `${preview.property}を変更`;
  }

  function formatExistingWebPreviewIntent(selected, preview) {
    const title = getExistingWebSelectionTitle(selected);
    if (preview?.property === "position") {
      const dx = roundExistingWebNumber(preview.userEdit?.type === "move" ? preview.userEdit.deltaX : ((preview.after?.x || 0) - (preview.before?.x || 0)));
      const dy = roundExistingWebNumber(preview.userEdit?.type === "move" ? preview.userEdit.deltaY : ((preview.after?.y || 0) - (preview.before?.y || 0)));
      return `${title}を X ${dx >= 0 ? "+" : ""}${dx}px / Y ${dy >= 0 ? "+" : ""}${dy}px 移動したい`;
    }
    if (preview?.property === "size") {
      const dw = roundExistingWebNumber(preview.userEdit?.type === "resize" ? preview.userEdit.widthDelta : ((preview.after?.width || 0) - (preview.before?.width || 0)));
      const dh = roundExistingWebNumber(preview.userEdit?.type === "resize" ? preview.userEdit.heightDelta : ((preview.after?.height || 0) - (preview.before?.height || 0)));
      return `${title}のサイズを 幅 ${dw >= 0 ? "+" : ""}${dw}px / 高さ ${dh >= 0 ? "+" : ""}${dh}px 変更したい`;
    }
    if (preview?.property === "rotation") {
      const rotation = normalizeExistingWebAngle(preview.userEdit?.type === "rotate" ? preview.userEdit.rotationDelta : ((preview.after?.rotation || 0) - (preview.before?.rotation || 0)));
      return `${title}を ${rotation >= 0 ? "+" : ""}${rotation}° 回転したい`;
    }
    return `${title}の見た目を調整したい`;
  }

  function buildExistingWebImpactAnalysis(selected, preview, resolution = null) {
    const afterBounds = selected?.node?.isConnected ? getDomNodeBounds(selected.node) || selected.bounds : selected?.bounds || {};
    const beforeBounds = getExistingWebPreviewBeforeBounds(preview, afterBounds);
    const overlaps = getExistingWebImpactOverlaps(selected, afterBounds);
    const offscreen = getExistingWebOffscreenImpact(selected, afterBounds);
    const behavior = getExistingWebBehaviorImpact(selected);
    const source = getExistingWebImpactSourceState(selected, resolution);
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
      sourceResolution: resolution ? summarizeExistingWebSourceResolution(resolution) : null,
      checks,
      checkedAt: new Date().toISOString(),
    };
  }

  function getExistingWebImpactSourceState(selected, resolution = null) {
    if (resolution?.preflight?.ok || resolution?.ok) {
      const operation = resolution.preflight?.operation || resolution.patchResult?.candidate?.operations?.[0] || null;
      const sourceRef = operation?.sourceRef || {};
      return {
        state: "ok",
        text: sourceRef.sourcePath
          ? `${sourceRef.sourcePath} の ${sourceRef.selector || "-"} / ${operation.property || "-"} を一意に確認しました`
          : "Sourceの変更箇所を一意に確認しました",
      };
    }
    if (resolution) {
      return {
        state: "warning",
        text: getExistingWebReviewRequiredMessage(resolution),
      };
    }
    if (selected?.mapping) {
      return { state: "ready", text: "Confirmed Mappingがあります。Safe Changeへ差分を渡せます。" };
    }
    return { state: "unknown", text: "変更確認時に、この変更対象だけSourceを調査します。" };
  }

  function summarizeExistingWebSourceResolution(resolution) {
    const operation = resolution?.preflight?.operation || resolution?.patchResult?.candidate?.operations?.[0] || null;
    const sourceRef = operation?.sourceRef || {};
    return {
      status: resolution?.status || "",
      reason: resolution?.reason || "",
      message: resolution?.message || "",
      runtimeMapping: resolution?.mapping ? {
        runtimeOnly: Boolean(resolution.mapping.runtimeOnly),
        pageId: resolution.mapping.pageId,
        domRef: resolution.mapping.domRef,
        tbId: resolution.mapping.tbId,
      } : null,
      sourceRef: operation ? {
        sourcePath: sourceRef.sourcePath || "",
        selector: sourceRef.selector || "",
        property: operation.property || "",
        before: operation.before,
        after: operation.after,
      } : null,
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
        setLayerOnlySelection(layerId);
        beginInlineLayerRename(nameNode, layer);
      }
      return;
    }
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      toggleLayerSelection(layerId);
    } else {
      setLayerOnlySelection(layerId);
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
    setLayerOnlySelection(layer.id);
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
    els.previewButton.classList.toggle("is-active", state.preview || (state.existingWeb.active && state.existingWeb.mode === "test"));
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
      if (els.saveState) {
        els.saveState.textContent = state.autosaveError || (state.dirty ? "未保存の変更があります" : state.autosaveStorage || "保存済み");
      }
      updateSizeStatus();
      return;
    }
    const selectedCount = getSelectedIds().length;
    const layer = getSelectedLayer();
    if (selectedCount > 1) {
      els.statusText.textContent = `選択中: ${selectedCount} レイヤー`;
      els.rotationStatus.textContent = getSelectionSoundStatusText(getSelectedIds()) || "複数選択";
    } else if (!layer) {
      els.statusText.textContent = "ID: - / 名前: -";
      els.rotationStatus.textContent = getPageSoundStatusText(getCurrentPage());
    } else {
      els.statusText.textContent = `ID: ${layer.id || "-"} / 名前: ${layer.name || "-"}`;
      const soundText = getLayerSoundStatusText(layer);
      if (layer.type === "image") {
        const src = getLayerImageSource(layer, state.viewport);
        const warning = hasImageWarning(layer);
        const imageInfo = getRenderedImageInfo(layer.id);
        els.rotationStatus.textContent = warning
          ? "画像を表示できません。差し替えてください。"
          : `画像OK: ${src ? "読み込み元あり" : "読み込み元なし"}${imageInfo ? ` / ${imageInfo}` : ""}${getLayerImageScopeInfo(layer)}${soundText ? ` / ${soundText}` : ""}`;
      } else {
        els.rotationStatus.textContent = `リンク: ${layer.link || "-"}${soundText ? ` / ${soundText}` : ""}`;
      }
    }
    updateCanvasSizeLabel();
    if (els.saveState) {
      els.saveState.textContent = state.autosaveError || (state.dirty ? "未保存の変更があります" : state.autosaveStorage || "保存済み");
    }
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
    const review = state.viewport === "mobile" && page.metadata?.mobileLayoutReview?.status === "review-required"
      ? " / 配置確認"
      : "";
    els.canvasSizeLabel.textContent = `Canvas: ${label} ${Math.round(current.width)} × ${Math.round(current.height)}${review}`;
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
    const thumb = row.querySelector(".tb-layer-thumb img, .tb-layer-thumb video");
    if (!thumb) {
      return;
    }
    thumb.addEventListener("error", () => {
      handleImageStatus(layer.id, "error", state.viewport);
    }, { once: true });
    if (thumb.tagName === "VIDEO") {
      thumb.addEventListener("loadeddata", () => {
        handleImageStatus(layer.id, "ok", state.viewport);
      }, { once: true });
    }
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
    const selector = `.tb-layer[data-layer-id="${cssEscape(layerId)}"] img, .tb-layer[data-layer-id="${cssEscape(layerId)}"] video`;
    const media = document.querySelector(selector);
    if (!media) {
      return "";
    }
    const layerNode = media.closest(".tb-layer");
    const style = layerNode ? window.getComputedStyle(layerNode) : null;
    const visibilityInfo = style
      ? ` / op:${style.opacity} disp:${style.display} clip:${style.clipPath === "none" ? "none" : "on"}`
      : "";
    if (media.tagName === "VIDEO") {
      if (media.readyState < 2) {
        return "読み込み中";
      }
      return `${media.videoWidth || 0}x${media.videoHeight || 0}${visibilityInfo}`;
    }
    if (!media.complete) {
      return "読み込み中";
    }
    return `${media.naturalWidth || 0}x${media.naturalHeight || 0}${visibilityInfo}`;
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
    const selectedIds = getSelectedIds();
    const selectedGroupCount = layer.groupId
      ? selectedIds.filter((selectedId) => findLayer(selectedId)?.groupId === layer.groupId).length
      : 0;
    if (!selectedIds.includes(id) || (layer.groupId && selectedGroupCount <= 1)) {
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
    const transformLayers = getSelectionTransformLayers(layer);
    const transformOrigin = transformLayers.length > 1 ? getLayersBoundingBox(transformLayers) : layout;
    const selectedOrigins = {};
    const speechScaleOrigins = {};
    transformLayers.forEach((selectedLayer) => {
      selectedOrigins[selectedLayer.id] = Object.assign({}, getCurrentLayout(selectedLayer));
      if (selectedLayer.metadata?.speechBubbleAutoLayout) {
        speechScaleOrigins[selectedLayer.id] = getSpeechBubbleManualScale(selectedLayer);
      }
    });
    state.pointer = {
      id,
      type: handle ? handle.dataset.handle : "move",
      start: point,
      origin: Object.assign({}, transformOrigin || layout),
      selectedOrigins,
      speechScaleOrigins,
      originCorners: renderer.clone(layer.corners || createDefaultCorners()),
      center: {
        x: (transformOrigin || layout).x + (transformOrigin || layout).width / 2,
        y: (transformOrigin || layout).y + (transformOrigin || layout).height / 2,
      },
    };
    state.pointer.startAngle = Math.atan2(point.y - state.pointer.center.y, point.x - state.pointer.center.x);
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
      id: window.TBalanceNativeId?.createStableId("layer") || renderer.makeId("layer"),
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
      id: window.TBalanceNativeId?.createStableId("layer") || renderer.makeId("layer"),
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
      const selectedOrigins = state.pointer.selectedOrigins || {};
      const selectedIds = Object.keys(selectedOrigins);
      if (selectedIds.length > 1 && selectedIds.includes(layer.id)) {
        resizeSelectionGroupFromHandle(state.pointer.type.replace("resize-", ""), dx, dy, event);
      } else {
        resizeLayerFromHandle(layer, state.pointer.type.replace("resize-", ""), dx, dy, event);
      }
    } else if (state.pointer.type === "rotate") {
      const selectedOrigins = state.pointer.selectedOrigins || {};
      const selectedIds = Object.keys(selectedOrigins);
      if (selectedIds.length > 1 && selectedIds.includes(layer.id)) {
        rotateSelectionGroup(point);
      } else {
        layout.rotation = Math.round(Math.atan2(point.y - state.pointer.center.y, point.x - state.pointer.center.x) * 180 / Math.PI + 90);
      }
    }
    getSelectionTransformLayers(layer).forEach(syncHitAreaToLayer);
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
    reflowSpeechBubbleForTextLayer(getCurrentPage(), layer);
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
      const intent = state.nativeAssets.pendingFileIntent || "canvas";
      state.nativeAssets.pendingFileIntent = "canvas";
      if (intent === "library") {
        addImageToNativeAssetLibrary(file);
      } else if (!file.type.startsWith("image/") && guessNativeAssetMediaType(file.name) === "video/webm") {
        state.nativeAssets.pendingFileIntent = "library";
        showModeToast("WebMは画像ライブラリーへ追加してから背景に設定してください。");
        addImageToNativeAssetLibrary(file);
      } else {
        const size = getPageViewportSize(getCurrentPage(), state.viewport);
        importImageFile(file, { x: size.width * 0.5, y: size.height * 0.5 });
      }
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
        const pageId = window.TBalanceNativeId?.createStableId("page") || renderer.makeId("window");
        const layerId = window.TBalanceNativeId?.createStableId("layer") || renderer.makeId("layer");
        const canvasSize = createReferenceCanvasSize(naturalSize);
        const layerLayout = centerLayerInCanvas(naturalSize, canvasSize);
        state.primaryPageId = state.primaryPageId || state.pageId;
        state.project.pages.push({
          pageId,
          id: pageId,
          displayName: file.name || "別ウィンドウ画像",
          name: file.name || "別ウィンドウ画像",
          slug: normalizePageSlug(file.name || "", (state.project.pages?.length || 0) + 1),
          sourceAuthority: "tbalance",
          desktop: { width: canvasSize.width, height: canvasSize.height },
          mobile: { width: canvasSize.width, height: canvasSize.height },
          viewports: {
            desktop: { width: canvasSize.width, height: canvasSize.height },
            mobile: { width: canvasSize.width, height: canvasSize.height },
          },
          layers: [{
            layerId,
            id: layerId,
            displayName: file.name || "別ウィンドウ画像",
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

  function getNativeAssetNaturalSize(src, file = null) {
    const mediaType = file?.type || guessNativeAssetMediaType(file?.name || "");
    if (mediaType === "video/webm") {
      return getVideoNaturalSize(src);
    }
    return getImageNaturalSize(src);
  }

  function getVideoNaturalSize(src) {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const done = (size = DEFAULT_DROP_SIZE) => {
        video.removeAttribute("src");
        video.load?.();
        resolve(size);
      };
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;
      video.onloadedmetadata = () => done({
        width: Math.max(1, video.videoWidth || DEFAULT_DROP_SIZE.width),
        height: Math.max(1, video.videoHeight || DEFAULT_DROP_SIZE.height),
      });
      video.onerror = () => done(DEFAULT_DROP_SIZE);
      video.src = src;
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
    reader.onload = async () => {
      const originalSrc = String(reader.result || "");
      const importResult = await importFileToProjectAsset(file, originalSrc, { placement: "canvas" });
      if (backgroundMode === "transparent") {
        createTransparentPng(originalSrc).then((transparentSrc) => {
          addDroppedImageLayer(file, point, originalSrc, transparentSrc, true, importResult);
        }).catch(() => {
          addDroppedImageLayer(file, point, originalSrc, originalSrc, false, importResult);
        });
      } else {
        addDroppedImageLayer(file, point, originalSrc, originalSrc, false, importResult);
      }
    };
    reader.readAsDataURL(file);
  }

  async function loadNativeAssetRegistryFromBridge() {
    if (!state.project) {
      return;
    }
    try {
      const response = await fetch(`${NATIVE_ASSETS_URL}/registry?projectId=${encodeURIComponent(getNativeProjectId())}`, {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      if (!result.ok || !result.registry) {
        throw new Error(result.error || "Registry unavailable");
      }
      const currentAssets = Array.isArray(state.project.assets) ? state.project.assets : [];
      if ((result.registry.assets || []).length || !currentAssets.length) {
        window.TBalanceNativeAssets?.mergeProjectRegistry?.(state.project, result.registry);
      } else {
        state.project.assetRegistry = Object.assign({}, state.project.assetRegistry || {}, {
          registryPath: result.registry.storage?.registryPath || window.TBalanceNativeAssets?.REGISTRY_PATH || "",
          storageRoot: result.registry.storage?.root || window.TBalanceNativeAssets?.ASSET_ROOT || "assets",
        });
      }
      state.nativeAssets.status = "ok";
      state.nativeAssets.message = "画像ライブラリーを読み込みました。";
      state.nativeAssets.registryLoaded = true;
      state.nativeAssets.storageAvailable = true;
    } catch (error) {
      state.project.assets = window.TBalanceNativeAssets?.normalizeAssets?.(state.project.assets || []) || state.project.assets || [];
      state.nativeAssets.status = "idle";
      state.nativeAssets.message = "画像ライブラリーの保存サービスが起動していません。画像追加時は現在のページ内だけで使える一時画像として扱います。";
      state.nativeAssets.storageAvailable = false;
    }
  }

  async function importFileToProjectAsset(file, dataUrl, options = {}) {
    const assetId = window.TBalanceNativeId?.createStableId("asset") || renderer.makeId("asset");
    const category = inferNativeAssetCategory(file, options);
    const naturalSize = await getNativeAssetNaturalSize(dataUrl, file);
    if (!isNativeAssetMediaTypeAllowed(file.type, file.name)) {
      state.nativeAssets.status = "error";
      state.nativeAssets.message = "この形式は画像ライブラリーへ保存できません。PNG / JPEG / WebP / WebM を選んでください。";
      return createPendingEmbeddedAsset(file, dataUrl, assetId, category, naturalSize);
    }
    try {
      state.nativeAssets.status = "working";
      state.nativeAssets.message = "画像ライブラリーへ追加しています。";
      renderNativeAssetPanel();
      const result = await postNativeAssetRequest("/import", {
        projectId: getNativeProjectId(),
        assetId,
        displayName: stripFileExtension(file.name || "画像"),
        category,
        fileName: file.name || "asset.png",
        originalName: file.name || "",
        mediaType: file.type || guessNativeAssetMediaType(file.name),
        width: naturalSize.width,
        height: naturalSize.height,
        dataUrl,
      });
      if (!result.ok || !result.asset) {
        throw new Error(result.error || "Asset import failed");
      }
      window.TBalanceNativeAssets?.mergeProjectRegistry?.(state.project, result.registry);
      const asset = window.TBalanceNativeAssets?.upsertAsset?.(state.project, result.asset) || result.asset;
      state.nativeAssets.status = "ok";
      if (result.status === "duplicate-reused") {
        const currentCategory = asset.category || "uncategorized";
        state.nativeAssets.duplicateNotice = {
          assetId: asset.assetId,
          currentCategory,
          requestedCategory: category,
        };
        state.nativeAssets.message = "同じ画像があるため、画像ライブラリー内の既存画像を再利用します。";
      } else {
        state.nativeAssets.duplicateNotice = null;
        state.nativeAssets.message = "画像ライブラリーに追加しました。";
      }
      state.nativeAssets.registryLoaded = true;
      state.nativeAssets.storageAvailable = true;
      return { asset, src: "", formal: true, status: result.status };
    } catch (error) {
      const asset = createPendingEmbeddedAsset(file, dataUrl, assetId, category, naturalSize);
      window.TBalanceNativeAssets?.upsertAsset?.(state.project, asset);
      state.nativeAssets.status = "error";
      state.nativeAssets.message = "画像は現在のページには表示されていますが、Projectの画像ライブラリーにはまだ保存されていません。TBalanceの保存サービスが起動していません。保存サービスを起動してから再試行してください。";
      return { asset, src: dataUrl, formal: false };
    }
  }

  function createPendingEmbeddedAsset(file, dataUrl, assetId, category, naturalSize) {
    return window.TBalanceNativeAssets?.normalizeAsset?.({
      assetId,
      id: assetId,
      displayName: stripFileExtension(file.name || "画像"),
      mediaType: file.type || guessNativeAssetMediaType(file.name),
      category,
      storage: { mode: "embedded" },
      storageStatus: "pending",
      originalName: file.name || "",
      legacySrc: dataUrl,
      contentHash: "",
      width: naturalSize.width,
      height: naturalSize.height,
      status: "pending-formal-storage",
    }) || { assetId, id: assetId, displayName: file.name || "画像", legacySrc: dataUrl };
  }

  async function postNativeAssetRequest(path, payload) {
    const response = await fetch(`${NATIVE_ASSETS_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result.error || `HTTP ${response.status}`);
    }
    return result;
  }

  function getNativeProjectId() {
    state.project = renderer.normalizeProject(state.project);
    return state.project.projectId || state.project.projectRef?.projectId || "sample-project";
  }

  function inferNativeAssetCategory(file, options = {}) {
    const layer = options.selectedLayer || getSelectedImageLayer();
    if (layer?.role === "background") return "background";
    if (layer && /button|ui|icon|link|menu|nav|ボタン/.test(`${layer.name || ""} ${layer.role || ""} ${layer.type || ""}`.toLowerCase())) return "ui";
    if (layer && /fairy|lilu|character|char|リル|キャラ/.test(`${layer.name || ""} ${layer.role || ""}`.toLowerCase())) return "character";
    const name = String(file?.name || "").toLowerCase();
    if (/fairy|lilu|character|char|リル|キャラ/.test(name)) return "character";
    if (/background|forest|scene|bg|背景/.test(name)) return "background";
    if (/button|icon|ui|logo|ボタン/.test(name)) return "ui";
    if (/effect|light|spark|particle|エフェクト/.test(name)) return "effect";
    return "uncategorized";
  }

  function isNativeAssetMediaTypeAllowed(mediaType, fileName) {
    return ["image/png", "image/jpeg", "image/webp", "video/webm"].includes(mediaType || guessNativeAssetMediaType(fileName));
  }

  function isNativeAssetFileAllowed(file) {
    return isNativeAssetMediaTypeAllowed(file?.type, file?.name);
  }

  function guessNativeAssetMediaType(fileName = "") {
    const lower = String(fileName || "").toLowerCase();
    if (lower.endsWith(".png")) return "image/png";
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
    if (lower.endsWith(".webp")) return "image/webp";
    if (lower.endsWith(".webm")) return "video/webm";
    if (lower.endsWith(".svg")) return "image/svg+xml";
    return "";
  }

  function stripFileExtension(fileName) {
    return String(fileName || "画像").replace(/\.[^.]+$/, "");
  }

  function addDroppedImageLayer(file, point, originalSrc, activeSrc, transparent, importResult = null) {
    const assetId = importResult?.asset?.assetId || window.TBalanceNativeId?.createStableId("asset") || renderer.makeId("asset");
    const desktopLayout = createCenteredLayout(point, DEFAULT_DROP_SIZE.width, DEFAULT_DROP_SIZE.height);
    const mobileLayout = createResponsiveLayerLayout(desktopLayout, "desktop", "mobile", 260, 260);
    pushHistory();
    state.project.assets = Array.isArray(state.project.assets) ? state.project.assets : [];
    if (!importResult?.asset) {
      window.TBalanceNativeAssets?.upsertAsset?.(state.project, {
        id: assetId,
        assetId,
        displayName: file.name,
        fileName: file.name,
        storage: { mode: "embedded" },
        legacySrc: originalSrc,
        originalSrc,
        transparentSrc: transparent ? activeSrc : "",
        generatedFileName: transparent ? `${file.name.replace(/\.[^.]+$/, "")}_transparent.png` : "",
      });
    }
    addLayer({
      type: "image",
      name: transparent ? `${file.name.replace(/\.[^.]+$/, "")} 透過PNG` : file.name,
      fileName: file.name,
      assetId,
      assetRef: assetId,
      src: importResult?.formal ? "" : activeSrc,
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
    if (["bgm", "ambient"].includes(state.soundMode) || els.propSoundTarget?.value === "page") {
      return getPageSoundTarget(getCurrentPage(), { create: true });
    }
    return getSelectedLayer();
  }

  function getPageSoundTarget(page = getCurrentPage(), options = {}) {
    if (!page) {
      return page;
    }
    const sceneId = getActiveSceneId(page);
    const defaultSceneId = window.TBalanceNativeScenes?.getDefaultSceneId?.(page) || page.defaultSceneId || "";
    if (!sceneId || sceneId === defaultSceneId) {
      return page;
    }
    if (options.create === false) {
      return page.sceneOverrides?.[sceneId] || null;
    }
    page.sceneOverrides = Object.assign({}, page.sceneOverrides || {});
    page.sceneOverrides[sceneId] = Object.assign({}, page.sceneOverrides[sceneId] || {});
    return page.sceneOverrides[sceneId];
  }

  function normalizeSoundMode(mode) {
    return ["bgm", "ambient", "hover", "click", "show"].includes(mode) ? mode : "click";
  }

  function getSoundModeLabel(mode) {
    const labels = {
      bgm: "BGM",
      ambient: "Ambient",
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
      assetRef: "",
      assetId: "",
      volume: 80,
      loop: false,
    }, sound || {});
  }

  function getSoundSettings(target, mode = state.soundMode) {
    if (!target) {
      return getNormalizedSound();
    }
    const soundMode = normalizeSoundMode(mode);
    if (soundMode === "ambient") {
      return getAmbientSummarySound(target);
    }
    if (soundMode === "click" && target.sound && !target.sounds?.click) {
      return getNormalizedSound(target.sound);
    }
    return getNormalizedSound(target.sounds?.[soundMode]);
  }

  function getAmbientSounds(target) {
    return Array.isArray(target?.sounds?.ambient)
      ? target.sounds.ambient.map(getNormalizedSound).filter((sound) => sound.enabled && (sound.fileName || sound.src || sound.assetRef || sound.assetId))
      : [];
  }

  function getAmbientSummarySound(target) {
    const ambient = getAmbientSounds(target);
    if (!ambient.length) {
      return getNormalizedSound({ loop: true });
    }
    const names = ambient.map((sound) => sound.fileName || sound.assetRef || sound.assetId || "Ambient").join(" / ");
    return getNormalizedSound(Object.assign({}, ambient[ambient.length - 1], {
      fileName: ambient.length > 1 ? `${ambient.length}件: ${names}` : names,
      enabled: true,
    }));
  }

  function renderSoundScopeNote(target, mode, sound) {
    if (!els.propSoundFileName) {
      return;
    }
    let note = document.getElementById("propSoundScopeNote");
    if (!note) {
      note = document.createElement("span");
      note.id = "propSoundScopeNote";
      note.className = "tb-sound-scope-note";
      els.propSoundFileName.insertAdjacentElement("afterend", note);
    }
    const label = ["bgm", "ambient"].includes(mode)
      ? getPageSoundScopeLabel(getCurrentPage())
      : getLayerSoundScopeLabel(getSelectedLayer(), mode);
    note.textContent = sound?.fileName
      ? `${label}に設定済み`
      : `${label}は未設定`;
    note.dataset.status = sound?.fileName ? "set" : "empty";
  }

  function getPageSoundScopeLabel(page = getCurrentPage()) {
    const sceneName = getActiveSceneName(page);
    return `${sceneName}の${normalizeSoundMode(state.soundMode) === "ambient" ? "Ambient" : "ページBGM"}`;
  }

  function getLayerSoundScopeLabel(layer, mode = state.soundMode) {
    const name = layer?.name || "選択レイヤー";
    return `${name}の${getSoundModeLabel(mode)}`;
  }

  function getActiveSceneName(page = getCurrentPage()) {
    if (!page || state.existingWeb.active) {
      return "ページ";
    }
    const sceneId = getActiveSceneId(page);
    const scene = (page.scenes || []).find((item) => item.sceneId === sceneId);
    return scene?.displayName || scene?.name || "現在Scene";
  }

  function getPageSoundStatusText(page = getCurrentPage()) {
    if (!page || state.existingWeb.active) {
      return "音: -";
    }
    const target = getPageSoundTarget(page, { create: false }) || page;
    const bgm = getSoundSettings(target, "bgm");
    const ambient = getAmbientSounds(target);
    const sceneName = getActiveSceneName(page);
    const parts = [];
    parts.push(bgm.enabled && bgm.fileName ? `BGM ${bgm.fileName}` : "BGM 未設定");
    parts.push(ambient.length ? `Ambient ${ambient.length}件` : "Ambient 0件");
    return `音: ${sceneName}: ${parts.join(" / ")}`;
  }

  function getLayerSoundStatusText(layer) {
    const sounds = getEnabledSoundEntries(layer);
    if (!sounds.length) {
      return "";
    }
    return `音: ${sounds.map(({ mode, sound }) => `${getSoundModeLabel(mode)} ${sound.fileName || "設定済み"}`).join(" / ")}`;
  }

  function getSelectionSoundStatusText(layerIds) {
    const layers = layerIds
      .map((id) => findLayer(id))
      .filter(Boolean);
    const soundCount = layers.reduce((count, layer) => count + getEnabledSoundEntries(layer).length, 0);
    return soundCount ? `音: ${soundCount}件のサウンド設定あり` : "";
  }

  function getEnabledSoundEntries(target) {
    const sounds = Object.assign({}, target?.sounds || {});
    if (target?.sound && !sounds.click) {
      sounds.click = target.sound;
    }
    return ["bgm", "show", "click", "hover"]
      .map((mode) => ({ mode, sound: getNormalizedSound(sounds[mode]) }))
      .filter(({ sound }) => sound.enabled && (sound.fileName || sound.src || sound.assetRef || sound.assetId));
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
    if (mode === "ambient") {
      const ambient = getAmbientSounds(target);
      const sound = getNormalizedSound({ loop: true, trigger: "load" });
      mutator(sound, target);
      sound.trigger = "load";
      sound.enabled = Boolean(sound.src || sound.fileName || sound.assetRef || sound.assetId);
      if (sound.enabled) {
        target.sounds.ambient = ambient.concat(sound);
      } else {
        target.sounds.ambient = ambient.map((item, index) => {
          if (index !== ambient.length - 1) {
            return item;
          }
          const copy = getNormalizedSound(item);
          mutator(copy, target);
          copy.trigger = "load";
          copy.enabled = Boolean(copy.src || copy.fileName || copy.assetRef || copy.assetId);
          return copy;
        }).filter((item) => item.enabled);
      }
      markDirty();
      renderAll();
      return;
    }
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
    if (mode === "ambient") {
      target.sounds = Object.assign({}, target.sounds || {}, { ambient: [] });
      markDirty();
      renderAll();
      showModeToast("Ambientをすべて外しました。");
      return;
    }
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
    if (soundMode === "bgm" || soundMode === "ambient" || soundMode === "show") {
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
      id: window.TBalanceNativeId?.createStableId("layer") || renderer.makeId("layer"),
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
      id: window.TBalanceNativeId?.createStableId("layer") || renderer.makeId("layer"),
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

  function getSelectionTransformLayers(anchorLayer = getSelectedLayer()) {
    const selected = getSelectedLayers().filter((layer) => layer && !layer.locked);
    if (selected.length <= 1) {
      return anchorLayer && !anchorLayer.locked ? [anchorLayer] : [];
    }
    const anchorGroup = anchorLayer?.groupId || "";
    if (!anchorGroup) {
      return selected;
    }
    const grouped = selected.filter((layer) => layer.groupId === anchorGroup);
    return grouped.length > 1 ? grouped : selected;
  }

  function getLayersBoundingBox(layers) {
    const layouts = (layers || []).map((layer) => getCurrentLayout(layer)).filter(Boolean);
    if (!layouts.length) {
      return null;
    }
    const left = Math.min(...layouts.map((layout) => Number(layout.x) || 0));
    const top = Math.min(...layouts.map((layout) => Number(layout.y) || 0));
    const right = Math.max(...layouts.map((layout) => (Number(layout.x) || 0) + Math.max(1, Number(layout.width) || 1)));
    const bottom = Math.max(...layouts.map((layout) => (Number(layout.y) || 0) + Math.max(1, Number(layout.height) || 1)));
    return {
      x: Math.round(left),
      y: Math.round(top),
      width: Math.max(1, Math.round(right - left)),
      height: Math.max(1, Math.round(bottom - top)),
      rotation: 0,
    };
  }

  function resizeSelectionGroupFromHandle(handle, dx, dy, event) {
    const origin = state.pointer?.origin || {};
    const selectedOrigins = state.pointer?.selectedOrigins || {};
    const west = handle.includes("w");
    const east = handle.includes("e");
    const north = handle.includes("n");
    const south = handle.includes("s");
    const originX = Number(origin.x) || 0;
    const originY = Number(origin.y) || 0;
    const originWidth = Math.max(1, Number(origin.width) || 1);
    const originHeight = Math.max(1, Number(origin.height) || 1);
    let nextX = originX;
    let nextY = originY;
    let nextWidth = originWidth;
    let nextHeight = originHeight;
    if (east) nextWidth = nextWidth + dx;
    if (south) nextHeight = nextHeight + dy;
    if (west) {
      nextWidth = nextWidth - dx;
      nextX = originX + dx;
    }
    if (north) {
      nextHeight = nextHeight - dy;
      nextY = originY + dy;
    }
    const cornerHandle = (north || south) && (east || west);
    const horizontalOnly = (east || west) && !(north || south);
    const verticalOnly = (north || south) && !(east || west);
    const widthScale = Math.abs(nextWidth) / originWidth;
    const heightScale = Math.abs(nextHeight) / originHeight;
    let uniformScale = Math.max(0.08, cornerHandle ? Math.max(widthScale, heightScale) : horizontalOnly ? widthScale : verticalOnly ? heightScale : Math.max(widthScale, heightScale));
    if (event?.shiftKey || event?.ctrlKey || event?.metaKey) {
      uniformScale = Math.max(0.08, Math.max(widthScale, heightScale));
    }
    nextWidth = Math.max(12, originWidth * uniformScale);
    nextHeight = Math.max(12, originHeight * uniformScale);
    if (west) {
      nextX = originX + originWidth - nextWidth;
    } else if (!east) {
      nextX = originX + (originWidth - nextWidth) / 2;
    } else {
      nextX = originX;
    }
    if (north) {
      nextY = originY + originHeight - nextHeight;
    } else if (!south) {
      nextY = originY + (originHeight - nextHeight) / 2;
    } else {
      nextY = originY;
    }
    const scaleX = uniformScale;
    const scaleY = uniformScale;
    Object.keys(selectedOrigins).forEach((id) => {
      const layer = findLayer(id);
      const layerOrigin = selectedOrigins[id];
      if (!layer || layer.locked || !layerOrigin) {
        return;
      }
      const layout = getCurrentLayout(layer);
      layout.x = Math.round(nextX + (Number(layerOrigin.x) - (Number(origin.x) || 0)) * scaleX);
      layout.y = Math.round(nextY + (Number(layerOrigin.y) - (Number(origin.y) || 0)) * scaleY);
      layout.width = Math.max(12, Math.round((Number(layerOrigin.width) || 1) * scaleX));
      layout.height = Math.max(12, Math.round((Number(layerOrigin.height) || 1) * scaleY));
      if (layer.type === "text") {
        scaleTextLayerForGroupTransform(layer, Math.min(scaleX, scaleY));
      }
      syncSpeechBubbleManualScale(layer, scaleX, scaleY);
    });
  }

  function rotateSelectionGroup(point) {
    const center = state.pointer?.center || { x: 0, y: 0 };
    const selectedOrigins = state.pointer?.selectedOrigins || {};
    const angle = Math.atan2(point.y - center.y, point.x - center.x);
    const startAngle = Number(state.pointer?.startAngle) || 0;
    const delta = angle - startAngle;
    const degrees = Math.round(delta * 180 / Math.PI);
    const cos = Math.cos(delta);
    const sin = Math.sin(delta);
    Object.keys(selectedOrigins).forEach((id) => {
      const layer = findLayer(id);
      const layerOrigin = selectedOrigins[id];
      if (!layer || layer.locked || !layerOrigin) {
        return;
      }
      const layout = getCurrentLayout(layer);
      const childCenterX = Number(layerOrigin.x) + Number(layerOrigin.width) / 2;
      const childCenterY = Number(layerOrigin.y) + Number(layerOrigin.height) / 2;
      const relX = childCenterX - center.x;
      const relY = childCenterY - center.y;
      const nextCenterX = center.x + relX * cos - relY * sin;
      const nextCenterY = center.y + relX * sin + relY * cos;
      layout.x = Math.round(nextCenterX - Number(layerOrigin.width) / 2);
      layout.y = Math.round(nextCenterY - Number(layerOrigin.height) / 2);
      layout.rotation = Math.round((Number(layerOrigin.rotation) || 0) + degrees);
    });
  }

  function scaleTextLayerForGroupTransform(layer, scale) {
    const factor = Math.max(0.08, Number(scale) || 1);
    const viewport = getActiveViewportKey();
    if (layer?.metadata?.speechBubbleAutoLayout) {
      const baseScale = Number(state.pointer?.speechScaleOrigins?.[layer.id]) || getSpeechBubbleManualScale(layer);
      applySpeechBubbleTextTypography(layer, viewport, renderer.clamp(baseScale * factor, 0.35, 3));
      return;
    }
    const style = ensureViewportTextStyle(layer, viewport);
    if (!state.pointer.textStyleOrigins) {
      state.pointer.textStyleOrigins = {};
    }
    const key = `${layer.id}:${viewport}`;
    if (!state.pointer.textStyleOrigins[key]) {
      state.pointer.textStyleOrigins[key] = {
        fontSize: Number(style.fontSize) || Number(layer.style?.fontSize) || 48,
        lineHeight: Number(style.lineHeight) || Number(layer.style?.lineHeight) || 1.22,
      };
    }
    const origin = state.pointer.textStyleOrigins[key];
    style.fontSize = Math.max(6, Math.round(origin.fontSize * factor * 10) / 10);
    style.lineHeight = origin.lineHeight;
  }

  function syncSpeechBubbleManualScale(layer, scaleX, scaleY) {
    if (!layer?.groupId || !layer.metadata?.speechBubbleAutoLayout) {
      return;
    }
    const localFactor = Math.max(0.08, (Math.abs(Number(scaleX) || 1) + Math.abs(Number(scaleY) || 1)) / 2);
    const baseScale = Number(state.pointer?.speechScaleOrigins?.[layer.id]) || getSpeechBubbleManualScale(layer);
    const factor = renderer.clamp(baseScale * localFactor, 0.35, 3);
    const groupLayers = getCurrentPage().layers.filter((candidate) => candidate.groupId === layer.groupId);
    groupLayers.forEach((candidate) => {
      candidate.metadata = Object.assign({}, candidate.metadata || {}, {
        speechBubbleManualScale: factor,
      });
    });
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
      copy.id = window.TBalanceNativeId?.createStableId("layer") || renderer.makeId("layer");
      copy.layerId = copy.id;
      copy.name = `${layer.name || "レイヤー"} コピー`;
      copy.displayName = copy.name;
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

  function getLayerImageSource(layer, viewport, sceneId = "") {
    if (!layer || layer.type !== "image") {
      return "";
    }
    const viewportKey = renderer.getViewportKey(viewport);
    const effective = window.TBalanceNativeScenes?.resolveLayerState?.(layer, viewportKey, sceneId || getActiveSceneId(getCurrentPage())) || {};
    const assetLayer = Object.assign({}, layer, {
      assetRef: effective.assetRef || layer.assetRef,
      assetId: effective.assetId || effective.assetRef || layer.assetId,
    });
    const resolved = window.TBalanceNativeAssets?.resolveLayerAssetSrc?.(state.project, assetLayer, viewportKey);
    if (resolved) {
      return resolved;
    }
    if (viewportKey === "mobile") {
      return layer.mobileSrc || layer.src || layer.desktopSrc || "";
    }
    return layer.desktopSrc || layer.src || layer.mobileSrc || "";
  }

  function getLayerMediaType(layer, viewport, sceneId = "") {
    if (!layer || layer.type !== "image") {
      return "";
    }
    const viewportKey = renderer.getViewportKey(viewport);
    const effective = window.TBalanceNativeScenes?.resolveLayerState?.(layer, viewportKey, sceneId || getActiveSceneId(getCurrentPage())) || {};
    const assetRef = effective.assetRef || effective.assetId || layer.assetRef || layer.assetId;
    const asset = window.TBalanceNativeAssets?.findAsset?.(state.project, assetRef);
    return String(asset?.mediaType || "").toLowerCase();
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
    file.text().then(async (text) => {
      if (looksLikeHtmlDocument(text, file.name)) {
        throw new Error("not-tbalance-html");
      }
      const parsed = renderer.normalizeProject(JSON.parse(text));
      applyOpenedFileName(parsed, file.name);
      pushHistory();
      state.existingWeb.active = false;
      state.project = parsed;
      await loadNativeAssetRegistryFromBridge();
      ensureNativeProjectBehaviorConnections();
      state.uiSettings = resolveUiSettings(parsed);
      state.editorMode = getStartupMode(parsed);
      syncProjectEditorSettings();
      restoreProjectRuntimeState(parsed);
      ensureActiveSceneForPage(getCurrentPage());
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
        : error.code === "unsupported-native-schema"
          ? `このTBalanceファイルは現在のバージョンでは開けません。\nSchema: ${error.schemaVersion || "unknown"}`
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

  async function createNewPage(options) {
    if (!state.project) {
      state.project = renderer.createBlankProject({ name: "新規TBalance", pageName: options?.pageName || options?.name || "新しいページ" });
    }
    pushHistory();
    state.project = renderer.normalizeProject(state.project);
    const page = window.TBalanceNativeSchema?.createPage({
      displayName: options?.pageName || options?.name,
      slug: options?.slug,
      desktop: options?.desktop,
      mobile: options?.mobile,
      stage: options?.stage,
      index: (state.project.pages?.length || 0) + 1,
    }) || {
      id: window.TBalanceNativeId?.createStableId("page") || renderer.makeId("page"),
      name: options?.pageName || options?.name || "新しいページ",
      desktop: options?.desktop,
      mobile: options?.mobile,
      stage: options?.stage,
      layers: [],
    };
    const normalized = renderer.normalizeProject(Object.assign({}, state.project, {
      pages: (state.project.pages || []).concat([page]),
    }));
    touchNativeMetadata(normalized, page.pageId || page.id);
    state.existingWeb.active = false;
    state.project = normalized;
    state.uiSettings = resolveUiSettings(state.project);
    state.editorMode = getStartupMode(state.project);
    syncProjectEditorSettings();
    state.pageId = page.pageId || page.id;
    state.primaryPageId = state.pageId;
    ensureActiveSceneForPage(getCurrentPage());
    state.viewport = options?.activeViewport === "mobile" ? "mobile" : "desktop";
    state.windowMode = "single";
    state.windowLayout = "horizontal";
    state.secondaryWindow = null;
    state.suspendedWindow = null;
    state.activeWindow = "primary";
    state.imageWarnings = {};
    clearSelection();
    markDirty();
    renderAll();
    showModeToast(`${page.displayName || page.name || "新しいページ"} を作成しました。`);
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
    state.activeSceneIds = {};
    ensureActiveSceneForPage(getCurrentPage());
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
    if (!project.name && !project.displayName) {
      project.name = title;
      project.displayName = title;
    }
    if (project.pages?.[0] && !project.pages[0].name && !project.pages[0].displayName) {
      project.pages[0].name = title;
      project.pages[0].displayName = title;
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
    const project = normalizeStateProjectForPersistence({ touchUpdatedAt: true });
    const pageDoc = createNativePageDocument(project);
    const payload = JSON.stringify(pageDoc, null, 2);
    const page = pageDoc.page || project.pages?.[0] || {};
    const baseName = sanitizeFileName(page.displayName || page.name || project.displayName || project.name || "TeaMerry");
    downloadBlob(payload, kind === "json" ? `${baseName}.tbalance.json` : `${baseName}.tbalance`, "application/json");
    state.dirty = false;
    renderAll();
  }

  function createNativePageDocument(project) {
    const currentPage = (project.pages || []).find((page) => page.id === state.pageId || page.pageId === state.pageId) || project.pages?.[0] || {};
    return window.TBalanceNativeSchema?.createPageDocument?.(project, currentPage) || project;
  }

  function normalizeStateProjectForPersistence(options = {}) {
    state.project = renderer.normalizeProject(state.project);
    syncProjectRuntimeState();
    if (options.touchUpdatedAt) {
      touchNativeMetadata(state.project, state.pageId);
    }
    return state.project;
  }

  function touchNativeMetadata(project, pageId = "") {
    const now = window.TBalanceNativeSchema?.nowIso?.() || new Date().toISOString();
    project.metadata = Object.assign({}, project.metadata || {});
    project.metadata.createdAt = project.metadata.createdAt || now;
    project.metadata.updatedAt = now;
    const page = (project.pages || []).find((item) => item.id === pageId || item.pageId === pageId);
    if (page) {
      page.metadata = Object.assign({}, page.metadata || {});
      page.metadata.createdAt = page.metadata.createdAt || now;
      page.metadata.updatedAt = now;
    }
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
    const project = normalizeStateProjectForPersistence({ touchUpdatedAt: true });
    const pageDoc = createNativePageDocument(project);
    downloadBlob(JSON.stringify(pageDoc, null, 2), `${baseName}.tbalance`, "application/json");
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
        { page, viewport: "desktop", sceneId: getActiveSceneId(page) },
        { page, viewport: "mobile", sceneId: getActiveSceneId(page) },
      ];
    }
    return [{ page, viewport: state.viewport, sceneId: getActiveSceneId(page) }];
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
      await drawPageToContext(ctx, target.page, target.viewport, offsetX, offsetY, Object.assign({}, options, { sceneId: target.sceneId || options.sceneId || "" }));
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
    const key = renderer.getViewportKey(viewport);
    return Object.assign({}, fallback, page?.[key] || page?.viewports?.[key] || {});
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
      if (!isScreenshotLayerVisible(layer, key, options.sceneId || "")) {
        continue;
      }
      try {
        await drawLayerToContext(ctx, layer, key, options.sceneId || "");
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

  function isScreenshotLayerVisible(layer, viewport, sceneId = "") {
    const effective = window.TBalanceNativeScenes?.resolveLayerState?.(layer, viewport, sceneId) || layer;
    if (effective.visible === false || (!layer.base && layer.visible === false) || layer.visibilityMode === "hidden") {
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

  async function drawLayerToContext(ctx, layer, viewport, sceneId = "") {
    const layout = window.TBalanceNativeScenes?.resolveLayerState?.(layer, viewport, sceneId) || renderer.getLayerLayout(layer, viewport);
    const appearance = Object.assign({}, renderer.getAppearance(layer));
    if (Object.prototype.hasOwnProperty.call(layout, "opacity")) {
      appearance.opacity = layout.opacity;
    }
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
      await drawImageLayer(ctx, layer, viewport, x, y, layout.width, layout.height, sceneId);
    }
    ctx.restore();
  }

  function colorToCanvasShadow(color, opacity) {
    const alpha = renderer.clamp(Number(opacity ?? 38) / 100, 0, 1);
    const hex = cssColorToHex(color || "#000000") || "#000000";
    const value = hex.replace("#", "");
    return `rgba(${parseInt(value.slice(0, 2), 16)}, ${parseInt(value.slice(2, 4), 16)}, ${parseInt(value.slice(4, 6), 16)}, ${alpha})`;
  }

  async function drawImageLayer(ctx, layer, viewport, x, y, width, height, sceneId = "") {
    const src = getLayerImageSource(layer, viewport, sceneId);
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
      syncProjectRuntimeState();
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
    return state.project.pages.find((page) => page.id === pageId || page.pageId === pageId || page.legacyId === pageId) || null;
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
    const layer = id ? findLayer(id) : null;
    if (layer?.role === "hit-area") {
      state.showHitAreas = true;
    }
  }

  function setLayerOnlySelection(id) {
    state.selectedId = id || "";
    state.selectedIds = id ? [id] : [];
    const layer = id ? findLayer(id) : null;
    if (layer?.role === "hit-area") {
      state.showHitAreas = true;
    }
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
    const page = getCurrentPage();
    const viewport = getActiveViewportKey();
    const sceneId = getActiveSceneId(page);
    const layout = window.TBalanceNativeScenes?.getWritableLayerState?.(layer, page, viewport, sceneId)
      || layer[viewport];
    if (layer?.role === "background") {
      fitBackgroundLayoutToSize(layer, layout, getPageViewportSize(page, viewport));
    }
    return layout;
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
      if (getLayerMediaType(layer, state.viewport) === "video/webm") {
        return `<video src="${escapeAttr(imageSrc)}" muted playsinline preload="metadata" aria-label="${escapeAttr(layer.name || "動画")}"></video>`;
      }
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

  window.TBalanceNativeRuntime = {
    dispatchEvent: dispatchNativeEvent,
    dispatchLayerClick: (layerId) => {
      if (!state.preview || !state.nativeBehaviorRuntime) {
        return { status: "inactive", handled: false };
      }
      const handled = Boolean(state.nativeBehaviorRuntime.handleClick?.(layerId));
      renderAll();
      return { status: "ok", layerId: String(layerId || ""), handled };
    },
    isActive: () => Boolean(state.preview && state.nativeBehaviorRuntime),
  };

  start();
})();
