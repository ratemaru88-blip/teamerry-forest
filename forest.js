(() => {
  const scene = document.querySelector(".forest-scene");
  const viewport = document.querySelector(".forest-stage");
  const stage = document.getElementById("stage");
  const map = document.querySelector(".map-content");
  const drops = document.querySelectorAll(".hidden-drop");
  const toast = document.querySelector(".forest-toast");
  const narration = document.querySelector(".forest-narration");
  const tapEffects = document.querySelector(".tap-effects");
  const mintGuide = document.querySelector(".mint-guide");
  const mapAtmosphere = document.querySelector(".map-atmosphere");
  const creatures = document.querySelector(".forest-creatures");
  const driftLayer = document.querySelector(".forest-drift");
  const milkyWay = document.querySelector(".forest-milkyway");
  const moon = document.querySelector(".forest-moon");
  const forestBgVideos = Array.from(document.querySelectorAll("[data-bg-video]"));
  const debugPanel = document.querySelector(".debug-panel");
  const mobileWalker = document.querySelector(".mobile-walker");
  const mobileWalkerBubble = document.querySelector(".mobile-walker__bubble");
  const fixedObservatoryPortal = document.getElementById("fixedObservatoryPortal");
  const kakaoWalker = document.querySelector(".kakao-walker");
  const kakaoWalkerImage = document.querySelector(".kakao-walker__image");
  const nameModal = document.getElementById("nameModal");
  const forestNameInput = document.getElementById("forestNameInput");
  const reuseForestNameButton = document.getElementById("reuseForestName");
  const saveForestNameButton = document.getElementById("saveForestName");
  const skipForestNameButton = document.getElementById("skipForestName");

  const TM_NAME_KEY = "teaMerryForestName";
  const TM_DISPLAY_NAME_KEY = "teaMerryDisplayName";
  const TM_NAME_DONE_KEY = "teaMerryNameDone";

  const getStoredItem = (key) => {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  };

  const setStoredItem = (key, value) => {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      return false;
    }

    return true;
  };

  function getForestDisplayName() {
    const displayName = getStoredItem(TM_DISPLAY_NAME_KEY);
    return displayName && displayName !== "さんぽさん" ? displayName : "おさんぽさん";
  }

  function persistForestName(forestName, displayName) {
    setStoredItem(TM_NAME_KEY, forestName);
    setStoredItem(TM_DISPLAY_NAME_KEY, displayName);
    setStoredItem(TM_NAME_DONE_KEY, "true");
    updateWriterNames();

    window.dispatchEvent(new CustomEvent("teaMerryForestNameChange", {
      detail: {
        forestName,
        displayName,
      },
    }));
  }

  function saveForestName(name) {
    const trimmed = String(name || "").trim();
    const forestName = trimmed || "おさんぽ";
    const displayName = trimmed ? `${trimmed}さん` : "おさんぽさん";

    persistForestName(forestName, displayName);
  }

  function saveWalkOnlyName() {
    persistForestName("おさんぽ", "おさんぽさん");
  }

  function updateWriterNames() {
    document.querySelectorAll("#writerName, .writer-name").forEach((element) => {
      element.textContent = getForestDisplayName();
    });
  }

  function getForestWelcomeMessage() {
    return `ようこそ、${getForestDisplayName()}。一緒に森をお散歩しましょう。`;
  }

  function announceForestWelcome() {
    const message = getForestWelcomeMessage();

    if (narration) {
      narration.textContent = message;
      narration.classList.add("is-visible");
      window.clearTimeout(announceForestWelcome.narrationTimer);
      announceForestWelcome.narrationTimer = window.setTimeout(() => {
        narration.classList.remove("is-visible");
      }, 6200);
    }

    if (mobileWalker && mobileWalkerBubble) {
      mobileWalkerBubble.textContent = message;
      mobileWalker.classList.add("has-speech");
      window.clearTimeout(announceForestWelcome.walkerTimer);
      announceForestWelcome.walkerTimer = window.setTimeout(() => {
        mobileWalker.classList.remove("has-speech");
      }, 6200);
    }
  }

  function closeNameModal({ announceWelcome = true } = {}) {
    nameModal?.classList.add("hidden");

    if (announceWelcome) {
      window.setTimeout(announceForestWelcome, 220);
    }
  }

  function getStoredForestNameForInput() {
    const storedForestName = getStoredItem(TM_NAME_KEY) || "";
    const storedDisplayName = getStoredItem(TM_DISPLAY_NAME_KEY) || "";

    if (storedForestName === "おさんぽ" && (storedDisplayName === "おさんぽさん" || storedDisplayName === "さんぽさん")) {
      return "";
    }

    return storedForestName;
  }

  function placeCaretAtNameEnd() {
    if (!forestNameInput) {
      return;
    }

    forestNameInput.focus();
    const end = forestNameInput.value.length;
    forestNameInput.setSelectionRange(end, end);
  }

  function updateSaveForestNameButton() {
    if (!saveForestNameButton || !forestNameInput) {
      return;
    }

    const currentName = forestNameInput.value.trim();
    const canSave = Boolean(currentName);

    saveForestNameButton.disabled = !canSave;
  }

  function setNameModalMode(mode) {
    const hasStoredName = Boolean(getStoredItem(TM_NAME_DONE_KEY));
    const isConfirmMode = mode === "confirm" && hasStoredName;
    const storedForestName = getStoredForestNameForInput();

    if (reuseForestNameButton) {
      reuseForestNameButton.classList.toggle("hidden", !isConfirmMode);
    }

    if (saveForestNameButton) {
      saveForestNameButton.textContent = "この名前で決まり";
    }

    if (nameModal) {
      nameModal.dataset.mode = isConfirmMode ? "confirm" : "initial";
    }

    const title = document.getElementById("nameModalTitle");
    const message = document.getElementById("nameModalMessage");

    if (title) {
      title.textContent = "ようこそ、TeaMerryへ。";
    }

    if (message) {
      message.innerHTML = "この森で呼んでほしい名前を教えてね。<br>（あとからいつでも変えられるよ。）";
    }

    if (forestNameInput) {
      forestNameInput.placeholder = "";
      forestNameInput.value = isConfirmMode ? storedForestName : "";
    }

    updateSaveForestNameButton();
  }

  function showNameModal(mode = "initial") {
    if (!nameModal) {
      return;
    }

    setNameModalMode(mode);
    nameModal.classList.remove("hidden");
    window.setTimeout(placeCaretAtNameEnd, 80);
  }

  function showNameModalIfNeeded() {
    if (!nameModal) {
      return;
    }

    showNameModal(getStoredItem(TM_NAME_DONE_KEY) ? "confirm" : "initial");
  }

  function setupForestNameModal() {
    updateWriterNames();
    showNameModalIfNeeded();

    reuseForestNameButton?.addEventListener("click", () => {
      if (!getStoredForestNameForInput()) {
        saveWalkOnlyName();
      } else {
        setStoredItem(TM_NAME_DONE_KEY, "true");
        updateWriterNames();
      }
      closeNameModal();
    });

    saveForestNameButton?.addEventListener("click", () => {
      if (saveForestNameButton.disabled) {
        return;
      }

      saveForestName(forestNameInput?.value || "");
      closeNameModal();
    });

    skipForestNameButton?.addEventListener("click", () => {
      saveWalkOnlyName();
      closeNameModal();
    });

    forestNameInput?.addEventListener("input", updateSaveForestNameButton);

    forestNameInput?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || saveForestNameButton?.disabled) {
        return;
      }

      saveForestName(forestNameInput.value);
      closeNameModal();
    });
  }

  window.TeaMerryForestName = {
    getDisplayName: getForestDisplayName,
    save: saveForestName,
    showNameModal: () => showNameModal(getStoredItem(TM_NAME_DONE_KEY) ? "confirm" : "initial"),
    updateWriterNames,
  };
  window.getForestDisplayName = getForestDisplayName;

  setupForestNameModal();

  if (!scene || !map) {
    return;
  }

  const state = {
    enabled: false,
    dragging: false,
    pointerId: null,
    minX: 0,
    minY: 0,
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  };

  const observatoryPortalAnchor = {
    x: 1560,
    y: 220,
    width: 44,
  };

  const syncFixedObservatoryPortal = () => {
    if (!fixedObservatoryPortal) {
      return;
    }

    const size = getViewportSize();
    const portalWidth = Math.max(34, Math.min(48, observatoryPortalAnchor.width * stageScale));
    const left = state.x + observatoryPortalAnchor.x * stageScale;
    const top = state.y + observatoryPortalAnchor.y * stageScale;
    const isVisible = (
      left >= 0 &&
      left + portalWidth <= size.width &&
      top >= 0 &&
      top <= size.height
    );

    fixedObservatoryPortal.style.setProperty("display", isVisible ? "block" : "none", "important");
    fixedObservatoryPortal.style.setProperty("left", `${left}px`, "important");
    fixedObservatoryPortal.style.setProperty("top", `${top}px`, "important");
    fixedObservatoryPortal.style.setProperty("right", "auto", "important");
    fixedObservatoryPortal.style.setProperty("width", `${portalWidth}px`, "important");
  };

  const isCoarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const mobileWalkerQuery = window.matchMedia("(max-width: 759px)");
  const kakaoWalkerQuery = window.matchMedia("(min-width: 760px)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const randomBetween = (min, max) => min + Math.random() * (max - min);
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const backgroundSlots = {
    day: {
      label: "昼",
      src: "./assets/backgrounds/決定稿_Webｍ/forest_day_v02.webm",
    },
    "evening-a": {
      label: "夕方前",
      src: "./assets/backgrounds/決定稿_Webｍ/forest_evening_A_v02..webm",
    },
    "evening-b": {
      label: "夕焼け",
      src: "./assets/backgrounds/決定稿_Webｍ/forest_evening_B_v02.webm",
    },
    night: {
      label: "夜",
      src: "./assets/backgrounds/決定稿_Webｍ/forest_night_v02.webm",
    },
  };
  let visibleBackgroundIndex = 0;
  const worldSize = {
    width: 1920,
    height: 1080,
  };
  let stageScale = 1;

  const getViewportSize = () => {
    const rect = viewport ? viewport.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };

    return {
      width: rect.width || window.innerWidth,
      height: rect.height || window.innerHeight,
    };
  };

  const getScaledWorldSize = () => ({
    width: worldSize.width * stageScale,
    height: worldSize.height * stageScale,
  });

  const timePresets = {
    day: { mist: 0.06, glow: 0 },
    "evening-a": { mist: 0.1, glow: 0.04 },
    "evening-b": { mist: 0.12, glow: 0.07 },
    night: { mist: 0.08, glow: 0.1 },
  };
  const moonPhases = {
    crescent: {
      src: "./assets/images/effects　/moon.small.crescent2.png",
      size: 66,
      opacity: 0.64,
    },
    half: {
      src: "./assets/images/effects　/moon.halt1.png",
      size: 90,
      opacity: 0.68,
    },
    full: {
      src: "./assets/images/effects　/moon.hull.png",
      size: 108,
      opacity: 0.72,
    },
    super: {
      src: "./assets/images/effects　/moon.big.full.png",
      size: 160,
      opacity: 0.78,
    },
  };

  const narrationLines = [
    "今日は霧が深いようです。",
    "湖が静かな日です。",
    "森が少し眠たそうです。",
    "どこかで羽音がしました。",
    "川の音が、少し近く聞こえます。",
    "木々の影がゆっくり伸びています。",
  ];

  const bottleMessages = [
    "イベントのお知らせが届いています。\n本文DATAはこれから入ります。",
    "作者からのお知らせが届いています。\n本文DATAはこれから入ります。",
    "妖精からのお手紙が届いています。\n本文DATAはこれから入ります。",
  ];

  const birdPerches = [
    { x: 79.5, y: 85.5, scale: 0.78 },
    { x: 83.5, y: 86.5, scale: 0.84 },
    { x: 87.2, y: 85.8, scale: 0.76 },
    { x: 81.6, y: 91.2, scale: 0.82 },
    { x: 85.8, y: 90.5, scale: 0.8 },
  ];

  const groundBirdSites = [
    { area: "e01-plaza-left", x: 1504, y: 944, spreadX: 72, spreadY: 24, scale: 0.86 },
    { area: "e01-plaza-center", x: 1608, y: 936, spreadX: 96, spreadY: 30, scale: 0.94 },
    { area: "e01-plaza-right", x: 1720, y: 946, spreadX: 78, spreadY: 24, scale: 0.9 },
  ];

  const bottleDesignWidth = 1920;
  const bottleDesignHeight = 1080;
  const bottleMapWidth = 1536;
  const bottleMapHeight = 1024;
  const toBottleMapPoint = (x, y) => ({
    x: x * bottleMapWidth / bottleDesignWidth,
    y: y * bottleMapHeight / bottleDesignHeight,
  });
  const bottleRouteStart = toBottleMapPoint(1180, 650);
  const bottleRouteEnd = toBottleMapPoint(1165, 710);
  const bottleRoutes = [
    {
      name: "waterline",
      startX: bottleRouteStart.x,
      startY: bottleRouteStart.y,
      midX: (bottleRouteStart.x + bottleRouteEnd.x) / 2,
      midY: (bottleRouteStart.y + bottleRouteEnd.y) / 2,
      endX: bottleRouteEnd.x,
      endY: bottleRouteEnd.y,
      startTilt: -13,
      midTilt: -7,
      endTilt: -3,
    },
  ];

  let currentBird = null;
  const groundBirds = new Set();
  let audioReady = false;
  let audioContext = null;
  let riverStarted = false;
  let activeTimeName = "";
  let soundscape = null;
  const debugState = {
    timeOverride: "",
    toggles: {
      mist: false,
      walker: true,
    },
    fastMode: false,
    mintGuideFastMode: false,
    timers: {
      ambient: 0,
      bird: 0,
      bottle: 0,
      narration: 0,
      onsenNotice: 0,
    },
  };

  const walkerState = {
    enabled: false,
    x: 0,
    y: window.innerHeight * 0.5,
    targetX: 0,
    targetY: window.innerHeight * 0.5,
    lastScrollY: window.scrollY || 0,
    lastTime: performance.now(),
    lastDirection: 0,
    directionChanges: [],
    stopTimer: 0,
    speechTimer: 0,
    centerTimer: 0,
    guideTimers: [],
    raf: 0,
  };

  const kakaoWalkerAssets = {
    walk: {
      up: [
        "./assets/images/events/kakao_walk/kakao_back_A1.webp",
      ],
      down: [
        "./assets/images/events/kakao_walk/kakao_front_A1.webp",
        "./assets/images/events/kakao_walk/kakao_front_left1.webp",
        "./assets/images/events/kakao_walk/kakao_front_A1.webp",
        "./assets/images/events/kakao_walk/kakao_front_right_1.webp",
      ],
      left: [
        "./assets/images/events/kakao_walk/kakao_left_1.webp",
        "./assets/images/events/kakao_walk/kakao_left_2.webp",
      ],
      right: [
        "./assets/images/events/kakao_walk/kakao_right_1.webp",
        "./assets/images/events/kakao_walk/kakao_right_2.webp",
      ],
    },
    bento: [
      "./assets/images/events/kakao_walk/kakao_bentou_A1.webp",
      "./assets/images/events/kakao_walk/kakao_bentou_A2.webp",
    ],
    nap: [
      "./assets/images/events/kakao_walk/kakao_napping_A1.webp",
      "./assets/images/events/kakao_walk/kakao_napping_A2.webp",
      "./assets/images/events/kakao_walk/kakao_napping_A3.webp",
    ],
  };

  const kakaoWalkPath = [
    { x: 285, y: 956 },
    { x: 352, y: 928 },
    { x: 438, y: 908 },
    { x: 525, y: 866 },
    { x: 584, y: 820 },
    { x: 610, y: 778 },
    { x: 566, y: 748 },
    { x: 505, y: 736 },
    { x: 552, y: 706 },
    { x: 632, y: 684 },
  ];

  const kakaoWalkerState = {
    enabled: false,
    mode: "walk",
    x: kakaoWalkPath[0].x,
    y: kakaoWalkPath[0].y,
    pointIndex: 0,
    direction: 1,
    lastTime: 0,
    raf: 0,
    restTimer: 0,
    frameTimer: 0,
    wakeTimer: 0,
    frameIndex: 0,
    walkFrameIndex: 0,
    walkFrameElapsed: 0,
    walkFrameDelay: 360,
    walkDirection: "down",
  };

  const centerCamera = () => {
    const size = getViewportSize();
    const scaledWorld = getScaledWorldSize();

    state.x = (size.width - scaledWorld.width) / 2;
    state.y = (size.height - scaledWorld.height) / 2;
  };

  const getCameraForWorldPoint = (worldX, worldY) => {
    const size = getViewportSize();

    return {
      x: size.width / 2 - worldX * stageScale,
      y: size.height / 2 - worldY * stageScale,
    };
  };

  const clampState = () => {
    const size = getViewportSize();
    const scaledWorld = getScaledWorldSize();
    const minX = Math.min(size.width - scaledWorld.width, 0);
    const minY = Math.min(size.height - scaledWorld.height, 0);

    state.minX = minX;
    state.minY = minY;
    state.x = Math.min(0, Math.max(minX, state.x));
    state.y = Math.min(0, Math.max(minY, state.y));
  };

  const renderMap = () => {
    clampState();
    const cameraX = `${state.x}px`;
    const cameraY = `${state.y}px`;

    document.documentElement.style.setProperty("--camera-x", cameraX);
    document.documentElement.style.setProperty("--camera-y", cameraY);
    syncFixedObservatoryPortal();
  };

  const resizeStage = () => {
    stageScale = Math.max(
      1,
      Math.max(window.innerWidth / worldSize.width, window.innerHeight / worldSize.height)
    );

    document.documentElement.style.setProperty("--stage-scale", stageScale);

    if (stage) {
      stage.style.transform = `scale(${stageScale})`;
    }

    if (state.enabled) {
      clampState();
      renderMap();
    }
  };

  const easeInOutCubic = (value) => (
    value < 0.5
      ? 4 * value * value * value
      : 1 - Math.pow(-2 * value + 2, 3) / 2
  );

  const animateCameraTo = ({ x, y, duration = 1200, onComplete }) => {
    const startX = state.x;
    const startY = state.y;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = easeInOutCubic(progress);

      state.x = startX + (x - startX) * eased;
      state.y = startY + (y - startY) * eased;
      renderMap();

      if (progress < 1) {
        window.requestAnimationFrame(tick);
        return;
      }

      if (typeof onComplete === "function") {
        onComplete();
      }
    };

    window.requestAnimationFrame(tick);
  };

  const initializeCamera = () => {
    centerCamera();
    state.enabled = true;
    renderMap();

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.body.classList.add("intro-finished");
      });
    });
  };

  const showToast = (message) => {
    if (!toast) {
      return;
    }

    toast.textContent = message;
    toast.classList.remove("is-actionable");
    toast.dataset.cameraTarget = "";
    toast.classList.add("is-visible");

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
      toast.classList.remove("is-actionable");
      toast.dataset.cameraTarget = "";
    }, 3600);
  };

  const cameraTargets = {
    onsen: { x: 80, y: 200, message: "温泉の方で何かが始まったようです" },
    shrine: { x: 735, y: 515, message: "祠のあたりで小さな光が揺れています" },
    fortune: { x: 528, y: 290, message: "おみくじの看板がきらりと光りました" },
  };

  const moveCameraToWorldPoint = (worldX, worldY, duration = 1300) => {
    const next = getCameraForWorldPoint(worldX, worldY);
    animateCameraTo({ x: next.x, y: next.y, duration });
  };

  const revealWorldPointForTest = (worldX, worldY) => {
    if (!state.enabled) {
      state.enabled = true;
      document.body.classList.add("intro-finished");
    }

    moveCameraToWorldPoint(worldX, worldY, reduceMotion ? 1 : 700);
  };

  const showCameraNotice = (targetName) => {
    if (!toast || !cameraTargets[targetName]) {
      return;
    }

    const target = cameraTargets[targetName];

    toast.textContent = target.message;
    toast.dataset.cameraTarget = targetName;
    toast.classList.add("is-visible", "is-actionable");

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("is-visible", "is-actionable");
      toast.dataset.cameraTarget = "";
    }, 6400);
  };

  const getCurrentBackgroundName = () => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();

    if (minutes >= 6 * 60 && minutes < 16 * 60 + 30) {
      return "day";
    }

    if (minutes >= 16 * 60 + 30 && minutes < 17 * 60 + 30) {
      return "evening-a";
    }

    if (minutes >= 17 * 60 + 30 && minutes < 18 * 60) {
      return "evening-b";
    }

    return "night";
  };

  const playBackgroundVideo = (video) => {
    if (!video || reduceMotion) {
      return;
    }

    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  const updateForestBgVideo = (timeName) => {
    const slot = backgroundSlots[timeName];

    if (!slot || forestBgVideos.length === 0) {
      return;
    }

    const visibleVideo = forestBgVideos[visibleBackgroundIndex] || forestBgVideos[0];

    if (visibleVideo && visibleVideo.dataset.currentSrc === slot.src) {
      playBackgroundVideo(visibleVideo);
      return;
    }

    const nextIndex = forestBgVideos.length > 1
      ? (visibleBackgroundIndex + 1) % forestBgVideos.length
      : visibleBackgroundIndex;
    const nextVideo = forestBgVideos[nextIndex];

    if (!nextVideo) {
      return;
    }

    if (nextVideo.dataset.currentSrc !== slot.src) {
      nextVideo.dataset.currentSrc = slot.src;
      nextVideo.src = slot.src;
      nextVideo.load();
    }

    playBackgroundVideo(nextVideo);
    nextVideo.classList.add("is-visible");

    if (visibleVideo && visibleVideo !== nextVideo) {
      visibleVideo.classList.remove("is-visible");
    }

    visibleBackgroundIndex = nextIndex;
  };

  const getTodayKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const isSuperMoonDay = () => {
    const today = getTodayKey();
    const storageKey = `teamerrySuperMoon:${today}`;

    try {
      const saved = window.localStorage.getItem(storageKey);

      if (saved) {
        return saved === "1";
      }

      const active = Math.random() < 0.04;
      window.localStorage.setItem(storageKey, active ? "1" : "0");

      return active;
    } catch (error) {
      return false;
    }
  };

  const getMoonPhaseName = () => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();

    if (minutes >= 19 * 60 + 30 || minutes < 6 * 60) {
      return "full";
    }

    if (minutes >= 18 * 60) {
      return "half";
    }

    if (minutes >= 17 * 60 + 30) {
      return "crescent";
    }

    return "";
  };

  const updateMilkyWayEffect = (timeName) => {
    if (!milkyWay) {
      return;
    }

    milkyWay.classList.toggle("is-visible", timeName === "night");
  };

  const showSuperMoonNotice = () => {
    const today = getTodayKey();
    const storageKey = `teamerrySuperMoonNotice:${today}`;

    try {
      if (window.localStorage.getItem(storageKey) === "1") {
        return;
      }

      window.localStorage.setItem(storageKey, "1");
    } catch (error) {
      // The notice can still appear without storage.
    }

    showToast("今日はスーパームーンです。月がとても大きく見えます。");
    showNarration("今日はスーパームーンです。森の影まで、少し明るく見えます。");
  };

  const updateMoonEffect = () => {
    if (!moon) {
      return;
    }

    const phaseName = getMoonPhaseName();

    if (!phaseName) {
      moon.classList.remove("is-visible", "is-super");
      return;
    }

    const superMoon = isSuperMoonDay();
    const phase = moonPhases[superMoon ? "super" : phaseName];

    if (moon.dataset.currentSrc !== phase.src) {
      moon.dataset.currentSrc = phase.src;
      moon.src = phase.src;
    }

    moon.style.setProperty("--moon-size", `${phase.size}px`);
    moon.style.setProperty("--moon-opacity", phase.opacity);
    moon.classList.toggle("is-super", superMoon);
    moon.classList.add("is-visible");

    if (superMoon) {
      showSuperMoonNotice();
    }
  };

  const showDebugMoon = (phaseName = "full") => {
    if (!moon || !moonPhases[phaseName]) {
      return;
    }

    const phase = moonPhases[phaseName];
    moon.dataset.currentSrc = phase.src;
    moon.src = phase.src;
    moon.style.setProperty("--moon-size", `${phase.size}px`);
    moon.style.setProperty("--moon-opacity", phase.opacity);
    moon.classList.toggle("is-super", phaseName === "super");
    moon.classList.add("is-visible");
  };

  const showDebugMilkyWay = () => {
    if (!milkyWay) {
      return;
    }

    milkyWay.classList.add("is-visible");
  };

  const applyTimePreset = (forcedName = debugState.timeOverride) => {
    const automaticName = getCurrentBackgroundName();
    const name = timePresets[forcedName] ? forcedName : automaticName;
    const preset = timePresets[name];
    activeTimeName = name;
    updateForestBgVideo(name);

    scene.classList.remove("forest-time--day", "forest-time--evening-a", "forest-time--evening-b", "forest-time--night");
    scene.classList.add(`forest-time--${name}`);
    scene.style.setProperty("--mist-opacity", debugState.toggles.mist ? Math.max(preset.mist, 0.18) : preset.mist);
    scene.style.setProperty("--glow-boost", preset.glow);
    updateMilkyWayEffect(name);
    updateMoonEffect();
    updateSoundscape();
  };

  const createSoundscape = () => {
    if (soundscape) {
      return;
    }

    soundscape = {
      river: new Audio("./assets/sounds/river_sound1.mp3"),
      bird: new Audio("./assets/sounds/カッコウの鳴き声.mp3"),
    };
    soundscape.river.loop = true;
    soundscape.river.preload = "auto";
    soundscape.river.volume = 0.018;
    soundscape.bird.volume = 0.035;
  };

  const startRiverSound = () => {
    createSoundscape();

    if (!soundscape || !soundscape.river) {
      return;
    }

    soundscape.river.loop = true;
    const playPromise = soundscape.river.play();
    riverStarted = true;

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        riverStarted = false;
      });
    }
  };

  const ensureAudio = () => {
    createSoundscape();

    if (audioReady) {
      startRiverSound();
      return;
    }

    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (AudioCtor) {
      audioContext = new AudioCtor();

      if (audioContext.state === "suspended" && typeof audioContext.resume === "function") {
        audioContext.resume().catch(() => {});
      }
    }

    audioReady = true;
    startRiverSound();
    updateSoundscape();
  };

  const playForestSound = (name) => {
    if (!soundscape || reduceMotion) {
      return;
    }

    const sound = soundscape[name];
    if (!sound) {
      return;
    }

    sound.currentTime = 0;
    sound.play().catch(() => {});
  };

  const updateSoundscape = () => {
    if (!soundscape) {
      return;
    }

    soundscape.river.volume = 0.018;
  };

  const playSoftTone = (frequency, duration = 0.18, volume = 0.018) => {
    if (!audioContext || reduceMotion) {
      return;
    }

    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + duration + 0.04);
  };

  const showNarration = (message = pick(narrationLines)) => {
    if (!narration) {
      return;
    }

    narration.textContent = message;
    narration.classList.add("is-visible");
    window.clearTimeout(showNarration.timer);
    showNarration.timer = window.setTimeout(() => {
      narration.classList.remove("is-visible");
    }, 5200);
  };

  const mintGuideLines = {
    general: [
      "こんにちは。",
      "今日はどこへ行ってみる？",
      "気になる場所を押してみてね。",
      "まろうどのティールームで一息ついていく？",
      "忘れじの洞窟にはエルダーがいるよ。",
      "星風のテラスでは風の便りが届くんだ。",
      "金のどんぐりを見つけたら触ってみてね。",
      "光る雫は森の小さな出来事だよ。",
      "ゆっくりしていってね。",
      "森のみんなも待ってるよ。",
    ],
    fast: [
      "森は逃げないよ。ゆっくり見ていってね。",
      "気になる場所を押してみてね。",
    ],
    direction: [
      "今日はどこへ行ってみる？",
      "森の中をゆっくり見てみよう。",
    ],
  };

  const getSeasonalMintLine = () => {
    const month = new Date().getMonth() + 1;

    if (month >= 3 && month <= 5) {
      return "花の香りが増えてきたね。";
    }
    if (month >= 6 && month <= 8) {
      return "今日は鳥たちが元気だよ。";
    }
    if (month >= 9 && month <= 11) {
      return "どんぐりがたくさん落ちてるね。";
    }
    return "少し静かな森だね。";
  };

  const pickMintGuideLine = () => pick([
    ...mintGuideLines.general,
    getSeasonalMintLine(),
  ]);

  const isMobileWalkerActive = () => Boolean(mobileWalker && mobileWalkerQuery.matches && debugState.toggles.walker);

  const setMintGuideSpeech = (message) => {
    if (!mobileWalker || !mobileWalkerBubble) {
      return;
    }

    mobileWalkerBubble.textContent = message;
    mobileWalker.classList.add("has-speech");
    window.clearTimeout(walkerState.speechTimer);
    walkerState.speechTimer = window.setTimeout(() => {
      mobileWalker.classList.remove("has-speech");
    }, reduceMotion ? 1400 : 2300);
  };

  const setWalkerClass = (name, active) => {
    if (mobileWalker) {
      mobileWalker.classList.toggle(name, active);
    }
  };

  const clearMintGuideTimers = () => {
    walkerState.guideTimers.forEach((timer) => window.clearTimeout(timer));
    walkerState.guideTimers = [];
  };

  const clearMintIdleState = () => {
    ["is-resting", "is-waking"].forEach((name) => setWalkerClass(name, false));
  };

  const showMintIdleGuide = () => {
    if (!walkerState.enabled || !mobileWalker) {
      return;
    }

    clearMintIdleState();
    setWalkerClass("is-walking", false);
    setWalkerClass("is-running", false);
    setMintGuideSpeech(pickMintGuideLine());
  };

  const getMintGuideDelay = () => debugState.mintGuideFastMode ? 1200 : 7000;

  const scheduleMintGuide = () => {
    if (!walkerState.enabled) {
      return;
    }

    clearMintGuideTimers();
    walkerState.guideTimers = [
      window.setTimeout(showMintIdleGuide, getMintGuideDelay()),
    ];
  };

  const wakeWalkerForScroll = () => {
    if (!walkerState.enabled) {
      return;
    }

    clearMintGuideTimers();
    clearMintIdleState();
  };

  const syncWalkerEnabled = () => {
    const active = isMobileWalkerActive();
    walkerState.enabled = active;
    document.body.classList.toggle("mobile-walker-enabled", active);
    document.body.classList.toggle("mobile-walker-disabled", mobileWalkerQuery.matches && !debugState.toggles.walker);

    if (!active) {
      clearMintGuideTimers();
      clearMintIdleState();
    }

    if (active && !walkerState.raf) {
      walkerState.targetY = window.innerHeight * 0.5;
      walkerState.y = walkerState.targetY;
      walkerState.lastScrollY = window.scrollY || 0;
      walkerState.lastTime = performance.now();
      walkerState.raf = window.requestAnimationFrame(updateWalkerFrame);
      scheduleMintGuide();
    }
  };

  const updateWalkerTargetFromScroll = (speed = 0) => {
    if (!walkerState.enabled) {
      return;
    }

    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    const range = reduceMotion ? 28 : 86;
    walkerState.targetY = window.innerHeight * 0.43 + progress * range;

    if (speed > 1.65 && !reduceMotion) {
      setWalkerClass("is-running", true);
      setWalkerClass("is-walking", false);
    } else {
      setWalkerClass("is-running", false);
      setWalkerClass("is-walking", true);
    }
  };

  function updateWalkerFrame() {
    if (!walkerState.enabled || !mobileWalker) {
      walkerState.raf = 0;
      return;
    }

    const follow = reduceMotion ? 0.32 : mobileWalker.classList.contains("is-running") ? 0.2 : 0.11;
    walkerState.x += (walkerState.targetX - walkerState.x) * follow;
    walkerState.y += (walkerState.targetY - walkerState.y) * follow;
    mobileWalker.style.setProperty("--walker-x", `${walkerState.x.toFixed(1)}px`);
    mobileWalker.style.setProperty("--walker-y", `${walkerState.y.toFixed(1)}px`);
    walkerState.raf = window.requestAnimationFrame(updateWalkerFrame);
  }

  const finishWalkerScroll = () => {
    if (!walkerState.enabled || !mobileWalker) {
      return;
    }

    setWalkerClass("is-running", false);
    setWalkerClass("is-walking", false);
    setWalkerClass("is-sweating", true);
    setMintGuideSpeech(pick(mintGuideLines.fast));
    window.setTimeout(() => setWalkerClass("is-sweating", false), 1900);
    scheduleMintGuide();
  };

  const triggerWalkerAngry = () => {
    if (!walkerState.enabled || !mobileWalker) {
      return;
    }

    setWalkerClass("is-angry", true);
    setWalkerClass("is-running", false);
    setMintGuideSpeech(pick(mintGuideLines.direction));
    window.setTimeout(() => setWalkerClass("is-angry", false), 1800);
  };

  const triggerWalkerFast = () => {
    if (!walkerState.enabled) {
      return;
    }

    setWalkerClass("is-running", true);
    clearMintGuideTimers();
    clearMintIdleState();
    setMintGuideSpeech(pick(mintGuideLines.fast));
    window.clearTimeout(walkerState.stopTimer);
    walkerState.stopTimer = window.setTimeout(finishWalkerScroll, reduceMotion ? 500 : 1200);
  };

  const moveWalkerToSide = (side) => {
    if (!walkerState.enabled) {
      return;
    }

    const distance = reduceMotion ? 18 : 42;
    walkerState.targetX = side === "left" ? -distance : distance;
    setWalkerClass("is-walking", true);
    clearMintGuideTimers();
    clearMintIdleState();
    setMintGuideSpeech(pick(mintGuideLines.direction));
    window.clearTimeout(walkerState.centerTimer);
    walkerState.centerTimer = window.setTimeout(() => {
      walkerState.targetX = 0;
      setWalkerClass("is-walking", false);
    }, reduceMotion ? 500 : 1300);
  };

  const handleWalkerScroll = () => {
    if (!walkerState.enabled) {
      return;
    }

    const now = performance.now();
    const currentY = window.scrollY || 0;
    const delta = currentY - walkerState.lastScrollY;
    const elapsed = Math.max(16, now - walkerState.lastTime);
    const speed = Math.abs(delta) / elapsed;
    const direction = delta === 0 ? 0 : delta > 0 ? 1 : -1;

    if (Math.abs(delta) > 1) {
      wakeWalkerForScroll();
      clearMintGuideTimers();
    }

    updateWalkerTargetFromScroll(speed);

    if (direction && walkerState.lastDirection && direction !== walkerState.lastDirection && speed > 0.7) {
      walkerState.directionChanges.push(now);
      walkerState.directionChanges = walkerState.directionChanges.filter((time) => now - time < 2400);
      if (walkerState.directionChanges.length >= 3) {
        walkerState.directionChanges = [];
        triggerWalkerAngry();
      }
    }

    if (speed > 1.65) {
      triggerWalkerFast();
    }

    if (direction) {
      walkerState.lastDirection = direction;
    }

    walkerState.lastScrollY = currentY;
    walkerState.lastTime = now;
    window.clearTimeout(walkerState.stopTimer);
    walkerState.stopTimer = window.setTimeout(finishWalkerScroll, reduceMotion ? 260 : 760);
  };

  const isKakaoWalkerActive = () => Boolean(kakaoWalker && kakaoWalkerImage && kakaoWalkerQuery.matches && !reduceMotion);

  const setKakaoImage = (src) => {
    if (kakaoWalkerImage && kakaoWalkerImage.getAttribute("src") !== src) {
      kakaoWalkerImage.src = src;
    }
  };

  const getKakaoDirection = (from, to) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx >= 0 ? "right" : "left";
    }

    return dy >= 0 ? "down" : "up";
  };

  const setKakaoWalkImage = (direction, elapsedMs) => {
    const frames = kakaoWalkerAssets.walk[direction] || kakaoWalkerAssets.walk.down;

    if (kakaoWalkerState.walkDirection !== direction) {
      kakaoWalkerState.walkDirection = direction;
      kakaoWalkerState.walkFrameIndex = 0;
      kakaoWalkerState.walkFrameElapsed = 0;
      kakaoWalkerState.walkFrameDelay = randomBetween(320, 400);
    } else if (frames.length > 1) {
      kakaoWalkerState.walkFrameElapsed += elapsedMs;

      if (kakaoWalkerState.walkFrameElapsed >= kakaoWalkerState.walkFrameDelay) {
        kakaoWalkerState.walkFrameElapsed = 0;
        kakaoWalkerState.walkFrameIndex = (kakaoWalkerState.walkFrameIndex + 1) % frames.length;
        kakaoWalkerState.walkFrameDelay = randomBetween(320, 400);
      }
    }

    setKakaoImage(frames[kakaoWalkerState.walkFrameIndex % frames.length]);
  };

  const setKakaoMode = (mode) => {
    if (!kakaoWalker) {
      return;
    }

    kakaoWalkerState.mode = mode;
    if (mode === "walk") {
      window.clearInterval(kakaoWalkerState.frameTimer);
      kakaoWalkerState.frameTimer = 0;
      kakaoWalkerState.walkFrameElapsed = 0;
    }
    kakaoWalker.classList.toggle("is-walking", mode === "walk");
    kakaoWalker.classList.toggle("is-bento", mode === "bento");
    kakaoWalker.classList.toggle("is-nap", mode === "nap");
    kakaoWalker.classList.toggle("is-wake", mode === "wake");
  };

  const clearKakaoTimers = () => {
    window.clearTimeout(kakaoWalkerState.restTimer);
    window.clearInterval(kakaoWalkerState.frameTimer);
    window.clearTimeout(kakaoWalkerState.wakeTimer);
    kakaoWalkerState.restTimer = 0;
    kakaoWalkerState.frameTimer = 0;
    kakaoWalkerState.wakeTimer = 0;
  };

  const scheduleKakaoRest = () => {
    if (!kakaoWalkerState.enabled) {
      return;
    }

    window.clearTimeout(kakaoWalkerState.restTimer);
    kakaoWalkerState.restTimer = window.setTimeout(() => {
      startKakaoRest(Math.random() < 0.54 ? "bento" : "nap");
    }, randomBetween(16000, 26000));
  };

  const startKakaoFrameLoop = (frames, interval) => {
    kakaoWalkerState.frameIndex = 0;
    setKakaoImage(frames[0]);
    window.clearInterval(kakaoWalkerState.frameTimer);
    kakaoWalkerState.frameTimer = window.setInterval(() => {
      kakaoWalkerState.frameIndex = (kakaoWalkerState.frameIndex + 1) % frames.length;
      setKakaoImage(frames[kakaoWalkerState.frameIndex]);
    }, interval);
  };

  const wakeKakaoWalker = () => {
    if (!kakaoWalkerState.enabled) {
      return;
    }

    window.clearInterval(kakaoWalkerState.frameTimer);
    kakaoWalkerState.frameTimer = 0;
    setKakaoMode("wake");
    setKakaoImage(kakaoWalkerAssets.walk.down[0]);
    kakaoWalkerState.wakeTimer = window.setTimeout(() => {
      setKakaoMode("walk");
      kakaoWalkerState.lastTime = performance.now();
      scheduleKakaoRest();
    }, 900);
  };

  function startKakaoRest(kind) {
    if (!kakaoWalkerState.enabled || kakaoWalkerState.mode !== "walk") {
      scheduleKakaoRest();
      return;
    }

    setKakaoMode(kind);

    if (kind === "bento") {
      startKakaoFrameLoop(kakaoWalkerAssets.bento, 760);
      kakaoWalkerState.wakeTimer = window.setTimeout(wakeKakaoWalker, randomBetween(5200, 7200));
    } else {
      startKakaoFrameLoop(kakaoWalkerAssets.nap, 920);
      kakaoWalkerState.wakeTimer = window.setTimeout(wakeKakaoWalker, randomBetween(7600, 9800));
    }
  }

  function updateKakaoWalkerFrame(now) {
    if (!kakaoWalkerState.enabled || !kakaoWalker) {
      kakaoWalkerState.raf = 0;
      return;
    }

    if (kakaoWalkerState.mode === "walk") {
      const from = kakaoWalkPath[kakaoWalkerState.pointIndex];
      const nextIndex = kakaoWalkerState.pointIndex + kakaoWalkerState.direction;
      const to = kakaoWalkPath[nextIndex];

      if (to) {
        const elapsed = Math.min(90, Math.max(0, now - kakaoWalkerState.lastTime)) / 1000;
        const speed = 14;
        const dx = to.x - kakaoWalkerState.x;
        const dy = to.y - kakaoWalkerState.y;
        const distance = Math.hypot(dx, dy);
        const step = speed * elapsed;
        const walkDirection = getKakaoDirection(from, to);

        setKakaoWalkImage(walkDirection, elapsed * 1000);

        if (distance <= step) {
          kakaoWalkerState.x = to.x;
          kakaoWalkerState.y = to.y;
          kakaoWalkerState.pointIndex = nextIndex;

          if (kakaoWalkerState.pointIndex === 0 || kakaoWalkerState.pointIndex === kakaoWalkPath.length - 1) {
            kakaoWalkerState.direction *= -1;
          }
        } else if (distance > 0) {
          kakaoWalkerState.x += dx / distance * step;
          kakaoWalkerState.y += dy / distance * step;
        }
      }
    }

    kakaoWalker.style.setProperty("--kakao-x", `${kakaoWalkerState.x.toFixed(1)}px`);
    kakaoWalker.style.setProperty("--kakao-y", `${kakaoWalkerState.y.toFixed(1)}px`);
    kakaoWalkerState.lastTime = now;
    kakaoWalkerState.raf = window.requestAnimationFrame(updateKakaoWalkerFrame);
  }

  const syncKakaoWalker = () => {
    const active = isKakaoWalkerActive();
    kakaoWalkerState.enabled = active;

    if (!kakaoWalker) {
      return;
    }

    kakaoWalker.classList.toggle("is-active", active);

    if (!active) {
      clearKakaoTimers();
      setKakaoMode("walk");
      return;
    }

    if (!kakaoWalkerState.raf) {
      kakaoWalkerState.lastTime = performance.now();
      setKakaoMode("walk");
      setKakaoImage(kakaoWalkerAssets.walk.down[0]);
      kakaoWalkerState.raf = window.requestAnimationFrame(updateKakaoWalkerFrame);
      scheduleKakaoRest();
    }
  };

  const addAmbientParticle = () => {
    if (!mapAtmosphere || reduceMotion) {
      return;
    }

    const kind = pick(["spark", "leaf", "shimmer", "ripple", "glow"]);
    const particle = document.createElement("span");
    const watery = kind === "shimmer" || kind === "ripple";
    const size = watery ? randomBetween(38, 86) : randomBetween(16, 48);

    particle.className = `ambient-particle ambient-particle--${kind}`;
    particle.style.setProperty("--ambient-x", `${watery ? randomBetween(45, 84) : randomBetween(8, 92)}%`);
    particle.style.setProperty("--ambient-y", `${watery ? randomBetween(56, 73) : randomBetween(18, 76)}%`);
    particle.style.setProperty("--ambient-size", `${size}px`);
    particle.style.setProperty("--ambient-opacity", watery ? randomBetween(0.13, 0.26) : randomBetween(0.08, 0.2));
    particle.style.setProperty("--ambient-duration", `${randomBetween(5.8, 11.5)}s`);
    particle.style.setProperty("--ambient-drift-x", `${randomBetween(-34, 34)}px`);
    particle.style.setProperty("--ambient-drift-y", `${randomBetween(-28, 18)}px`);
    mapAtmosphere.append(particle);
    particle.addEventListener("animationend", () => particle.remove(), { once: true });
  };

  const getDebugDelay = (normalMin, normalMax, fastMin, fastMax) => {
    return debugState.fastMode
      ? randomBetween(fastMin, fastMax)
      : randomBetween(normalMin, normalMax);
  };

  const setDebugTimer = (name, callback, delay) => {
    window.clearTimeout(debugState.timers[name]);
    debugState.timers[name] = window.setTimeout(callback, delay);
  };

  const restartTimedEvents = () => {
    Object.keys(debugState.timers).forEach((name) => {
      window.clearTimeout(debugState.timers[name]);
      debugState.timers[name] = 0;
    });

    scheduleAmbient(debugState.fastMode ? 800 : 2600);
    scheduleNarration(debugState.fastMode ? 3000 : 9000);
    scheduleBird(debugState.fastMode ? 5000 : 14000);
    scheduleBottle(debugState.fastMode ? 5200 : 18000);
    setDebugTimer("onsenNotice", () => showCameraNotice("onsen"), debugState.fastMode ? 7000 : 18000);
  };

  const scheduleAmbient = (delay = getDebugDelay(2400, 7600, 900, 1800)) => {
    setDebugTimer("ambient", () => {
      addAmbientParticle();
      scheduleAmbient();
    }, delay);
  };

  const setBirdFrame = (bird, frame) => {
    const image = bird.querySelector("img");
    if (image) {
      image.src = `./assets/images/events/birds/character/${frame}`;
    }
  };

  const flyAwayBird = (bird = currentBird) => {
    if (!bird || bird.classList.contains("is-flying")) {
      return;
    }

    window.clearInterval(bird.lookTimer);
    window.clearInterval(bird.flyTimer);
    bird.classList.add("is-flying");
    bird.style.setProperty("--bird-fly-x", `${randomBetween(-140, 160)}px`);
    bird.style.setProperty("--bird-fly-y", `${randomBetween(-130, -72)}px`);
    playSoftTone(520, 0.1, 0.012);

    const frames = ["bird-fly-1.webp", "bird-fly-2.webp", "bird-fly-3.webp"];
    let frame = 0;
    bird.flyTimer = window.setInterval(() => {
      setBirdFrame(bird, frames[frame % frames.length]);
      frame += 1;
    }, 180);

    window.setTimeout(() => {
      window.clearInterval(bird.flyTimer);
      bird.remove();
      if (currentBird === bird) {
        currentBird = null;
      }
    }, 2700);
  };

  const spawnBird = () => {
    if (!creatures || currentBird || reduceMotion) {
      return;
    }

    const perch = pick(birdPerches);
    const bird = document.createElement("button");
    const image = document.createElement("img");
    bird.type = "button";
    bird.className = "forest-bird";
    bird.tabIndex = -1;
    bird.style.setProperty("--bird-x", `${perch.x}%`);
    bird.style.setProperty("--bird-y", `${perch.y}%`);
    bird.style.setProperty("--bird-scale", perch.scale);
    image.src = "./assets/images/events/birds/character/bird-idle.webp";
    image.alt = "";
    bird.append(image);
    creatures.append(bird);
    currentBird = bird;
    playSoftTone(880, 0.16, 0.008);
    playForestSound("bird");

    bird.lookTimer = window.setInterval(() => {
      setBirdFrame(bird, pick([
        "bird-idle.webp",
        "bird-look-left.webp",
        "bird-look-right.webp",
        "bird-upward.webp",
        "bird-downward1.webp",
      ]));
    }, randomBetween(1400, 2800));

    bird.addEventListener("pointerenter", () => flyAwayBird(bird));
    bird.addEventListener("click", (event) => {
      event.preventDefault();
      flyAwayBird(bird);
    });

    window.setTimeout(() => flyAwayBird(bird), randomBetween(9000, 17000));
  };

  const flyAwayGroundBird = (bird) => {
    if (!bird || bird.classList.contains("is-flying")) {
      return;
    }

    window.clearTimeout(bird.leaveTimer);
    bird.classList.add("is-flying");
    bird.style.setProperty("--ground-bird-fly-x", `${randomBetween(-180, 180)}px`);
    bird.style.setProperty("--ground-bird-fly-y", `${randomBetween(-180, -104)}px`);
    playSoftTone(560, 0.08, 0.008);

    window.setTimeout(() => {
      groundBirds.delete(bird);
      bird.remove();
    }, 1800);
  };

  const spawnGroundBirdFlock = () => {
    if (!creatures || reduceMotion || groundBirds.size >= 6) {
      return;
    }

    const site = pick(groundBirdSites);
    const count = Math.min(6 - groundBirds.size, Math.floor(randomBetween(2, 5)));

    for (let i = 0; i < count; i += 1) {
      const bird = document.createElement("button");
      const body = document.createElement("span");
      const head = document.createElement("span");
      const crumb = document.createElement("span");
      const offsetX = randomBetween(-site.spreadX, site.spreadX);
      const offsetY = randomBetween(-site.spreadY, site.spreadY);
      const direction = Math.random() < 0.5 ? -1 : 1;
      const scale = site.scale * randomBetween(0.82, 1.12);

      bird.type = "button";
      bird.className = "forest-ground-bird";
      bird.tabIndex = -1;
      bird.setAttribute("aria-label", "餌をついばむ鳥");
      bird.style.setProperty("--ground-bird-x", `${site.x + offsetX}px`);
      bird.style.setProperty("--ground-bird-y", `${site.y + offsetY}px`);
      bird.style.setProperty("--ground-bird-scale", scale);
      bird.style.setProperty("--ground-bird-direction", direction);
      bird.style.setProperty("--ground-bird-delay", `${i * 170 + Math.abs(offsetX) * 2}ms`);
      bird.style.setProperty("--ground-bird-hop", `${randomBetween(3, 8)}px`);

      body.className = "forest-ground-bird__body";
      head.className = "forest-ground-bird__head";
      crumb.className = "forest-ground-bird__crumb";
      bird.append(body, head, crumb);
      creatures.append(bird);
      groundBirds.add(bird);

      bird.addEventListener("pointerenter", () => flyAwayGroundBird(bird));
      bird.addEventListener("click", (event) => {
        event.preventDefault();
        flyAwayGroundBird(bird);
      });

      bird.leaveTimer = window.setTimeout(() => {
        flyAwayGroundBird(bird);
      }, randomBetween(10500, 19000) + i * 280);
    }
  };

  const scheduleBird = (delay = getDebugDelay(24000, 62000, 3000, 5200)) => {
    setDebugTimer("bird", () => {
      if (Math.random() < 0.62) {
        spawnGroundBirdFlock();
      } else if (Math.random() < 0.72) {
        spawnBird();
      }
      scheduleBird();
    }, delay);
  };

  const showBottleLetter = (message) => {
    let letter = document.querySelector(".forest-letter");
    if (!letter) {
      letter = document.createElement("p");
      letter.className = "forest-letter";
      scene.append(letter);
    }

    letter.textContent = message;
    letter.classList.add("is-visible");
    showNarration(message);
    window.clearTimeout(showBottleLetter.timer);
    showBottleLetter.timer = window.setTimeout(() => {
      letter.classList.remove("is-visible");
    }, 6600);
  };

  const spawnBottle = (routeName = "", isTest = false) => {
    if (!driftLayer) {
      return;
    }

    driftLayer.querySelectorAll(".bottle-mail").forEach((activeBottle) => activeBottle.remove());

    const route = bottleRoutes.find((item) => item.name === routeName) || bottleRoutes[0];
    if (isTest) {
      revealWorldPointForTest(route.endX, route.endY);
    }

    const bottle = document.createElement("button");
    bottle.type = "button";
    bottle.className = "bottle-mail";
    bottle.setAttribute("aria-label", "流れてきたボトルメールを読む");
    bottle.style.setProperty("--bottle-start-x", `${route.startX}px`);
    bottle.style.setProperty("--bottle-start-y", `${route.startY}px`);
    bottle.style.setProperty("--bottle-mid-x", `${route.midX - route.startX}px`);
    bottle.style.setProperty("--bottle-mid-y", `${route.midY - route.startY}px`);
    bottle.style.setProperty("--bottle-early-x", `${(route.midX - route.startX) * 0.54}px`);
    bottle.style.setProperty("--bottle-early-y", `${(route.midY - route.startY) * 0.48}px`);
    bottle.style.setProperty("--bottle-end-x", `${route.endX - route.startX}px`);
    bottle.style.setProperty("--bottle-end-y", `${route.endY - route.startY}px`);
    bottle.style.setProperty("--bottle-start-tilt", `${route.startTilt}deg`);
    bottle.style.setProperty("--bottle-mid-tilt", `${route.midTilt}deg`);
    bottle.style.setProperty("--bottle-end-tilt", `${route.endTilt}deg`);
    bottle.style.setProperty("--bottle-duration", `${reduceMotion ? 4 : isTest ? 7 : randomBetween(16, 23)}s`);
    driftLayer.append(bottle);

    bottle.addEventListener("click", (event) => {
      event.preventDefault();
      if (!bottle.classList.contains("is-arrived")) {
        return;
      }
      bottle.classList.add("is-opening");
      showBottleLetter(pick(bottleMessages));
      playSoftTone(660, 0.2, 0.012);
      window.setTimeout(() => bottle.remove(), 780);
    });
    bottle.addEventListener("animationend", () => {
      bottle.classList.add("is-arrived");
      bottle.setAttribute("aria-label", "漂着したボトルメールを開く");
      showToast("ボトルメールが流れ着きました。");
    }, { once: true });
  };

  const scheduleBottle = (delay = getDebugDelay(36000, 86000, 5000, 7600)) => {
    setDebugTimer("bottle", () => {
      if (Math.random() < 0.64) {
        spawnBottle();
      }
      scheduleBottle();
    }, delay);
  };

  const scheduleNarration = (delay = getDebugDelay(26000, 74000, 3000, 5000)) => {
    setDebugTimer("narration", () => {
      if (Math.random() < 0.78) {
        showNarration();
      }
      scheduleNarration();
    }, delay);
  };

  const addScreenEffect = (className, x, y) => {
    if (!tapEffects) {
      return;
    }

    const effect = document.createElement("span");
    effect.className = className;
    effect.style.setProperty("--effect-x", `${x}px`);
    effect.style.setProperty("--effect-y", `${y}px`);
    tapEffects.append(effect);

    effect.addEventListener("animationend", () => {
      effect.remove();
    }, { once: true });
  };

  const showMemoryEvent = (x, y) => {
    const sequence = [
      ["memory-event-effect memory-event-effect--glow", 0],
      ["memory-event-effect memory-event-effect--sparkle", 120],
      ["memory-event-effect memory-event-effect--ripple", 240],
      ["memory-event-effect memory-event-effect--fog", 420],
    ];

    sequence.forEach(([className, delay]) => {
      window.setTimeout(() => {
        addScreenEffect(className, x, y);
      }, delay);
    });
  };

  const updateDebugButtons = () => {
    if (!debugPanel) {
      return;
    }

    debugPanel.querySelectorAll("[data-debug-time]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.debugTime === debugState.timeOverride);
    });

    debugPanel.querySelectorAll("[data-debug-toggle]").forEach((button) => {
      const name = button.dataset.debugToggle;
      const active = Boolean(debugState.toggles[name]);
      const label = {
        mist: "霧",
        walker: "Walker",
      }[name] || name;
      button.setAttribute("aria-pressed", active ? "true" : "false");
      button.textContent = `${label} ${active ? "ON" : "OFF"}`;
    });
  };

  const setupDebugPanel = () => {
    if (!debugPanel) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    let panelSetting = "";
    try {
      if (params.get("debug") === "1") {
        window.localStorage.removeItem("teamerryForestDebugPanel");
      }
      panelSetting = window.localStorage.getItem("teamerryForestDebugPanel") || "";
    } catch (error) {
      panelSetting = "";
    }

    if (params.get("debug") === "0" || panelSetting === "off") {
      document.body.classList.add("debug-panel-hidden");
    }

    debugPanel.querySelectorAll("[data-debug-time]").forEach((button) => {
      button.addEventListener("click", () => {
        debugState.timeOverride = button.dataset.debugTime || "";
        applyTimePreset();
        updateDebugButtons();
        showToast(`${button.textContent}に切り替えました。`);
      });
    });

    debugPanel.querySelectorAll("[data-debug-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const name = button.dataset.debugToggle;
        debugState.toggles[name] = !debugState.toggles[name];
        applyTimePreset();
        syncWalkerEnabled();
        updateDebugButtons();
      });
    });

    const fastInput = debugPanel.querySelector("[data-debug-fast]");
    if (fastInput) {
      fastInput.addEventListener("change", () => {
        debugState.fastMode = fastInput.checked;
        restartTimedEvents();
        showToast(debugState.fastMode ? "時間差イベントを高速化しました。" : "時間差イベントを通常速度に戻しました。");
      });
    }

    const idleFastInput = debugPanel.querySelector("[data-debug-idle-fast]");
    if (idleFastInput) {
      idleFastInput.addEventListener("change", () => {
        debugState.mintGuideFastMode = idleFastInput.checked;
        scheduleMintGuide();
        showToast(debugState.mintGuideFastMode ? "ミントの案内タイマーを短縮しました。" : "ミントの案内タイマーを通常速度に戻しました。");
      });
    }

    const hideButton = debugPanel.querySelector("[data-debug-hide]");
    if (hideButton) {
      hideButton.addEventListener("click", () => {
        document.body.classList.add("debug-panel-hidden");
        try {
          window.localStorage.setItem("teamerryForestDebugPanel", "off");
        } catch (error) {
          // The query parameter still supports production hiding when storage is unavailable.
        }
      });
    }

    const birdButton = debugPanel.querySelector('[data-debug-action="bird"]');
    if (birdButton) {
      birdButton.addEventListener("click", () => {
        spawnBird();
        spawnGroundBirdFlock();
      });
    }

    const moonButton = debugPanel.querySelector('[data-debug-action="moon"]');
    if (moonButton) {
      moonButton.addEventListener("click", () => {
        showDebugMoon("full");
        showToast("月レイヤーを表示しました。");
      });
    }

    const superMoonButton = debugPanel.querySelector('[data-debug-action="super-moon"]');
    if (superMoonButton) {
      superMoonButton.addEventListener("click", () => {
        showDebugMoon("super");
        showToast("今日はスーパームーンです。月がとても大きく見えます。");
      });
    }

    const milkyWayButton = debugPanel.querySelector('[data-debug-action="milkyway"]');
    if (milkyWayButton) {
      milkyWayButton.addEventListener("click", () => {
        showDebugMilkyWay();
        showToast("天の川レイヤーを表示しました。");
      });
    }

    const bottleButton = debugPanel.querySelector('[data-debug-action="bottle"]');
    if (bottleButton) {
      bottleButton.addEventListener("click", () => {
        spawnBottle("waterline", true);
        showToast("ボトルメールを流しました。");
      });
    }

    const memoryEffectButton = debugPanel.querySelector('[data-debug-action="memory-effect"]');
    if (memoryEffectButton) {
      memoryEffectButton.addEventListener("click", () => {
        showMemoryEvent(window.innerWidth / 2, window.innerHeight / 2);
        showToast("雫エフェクトを表示しました。");
      });
    }

    const soundButton = debugPanel.querySelector('[data-debug-action="se"]');
    if (soundButton) {
      soundButton.addEventListener("click", () => {
        ensureAudio();
        playForestSound("river");
      });
    }

    const fastScrollButton = debugPanel.querySelector('[data-debug-action="fast-scroll"]');
    if (fastScrollButton) {
      fastScrollButton.addEventListener("click", () => {
        syncWalkerEnabled();
        triggerWalkerFast();
      });
    }

    const angryButton = debugPanel.querySelector('[data-debug-action="angry"]');
    if (angryButton) {
      angryButton.addEventListener("click", () => {
        syncWalkerEnabled();
        triggerWalkerAngry();
      });
    }

    const sideMoveButton = debugPanel.querySelector('[data-debug-action="side-move"]');
    if (sideMoveButton) {
      sideMoveButton.addEventListener("click", () => {
        syncWalkerEnabled();
        moveWalkerToSide(walkerState.targetX <= 0 ? "right" : "left");
      });
    }

    const kakaoRunButton = debugPanel.querySelector('[data-debug-action="kakao-run"]');
    if (kakaoRunButton) {
      kakaoRunButton.addEventListener("click", () => {
        syncKakaoWalker();
        if (kakaoWalkerState.enabled) {
          clearKakaoTimers();
          setKakaoMode("walk");
          kakaoWalkerState.lastTime = performance.now();
          scheduleKakaoRest();
        }
      });
    }

    const kakaoLunchButton = debugPanel.querySelector('[data-debug-action="kakao-lunch"]');
    if (kakaoLunchButton) {
      kakaoLunchButton.addEventListener("click", () => {
        syncKakaoWalker();
        if (kakaoWalkerState.enabled) {
          clearKakaoTimers();
          setKakaoMode("walk");
          startKakaoRest("bento");
        }
      });
    }

    const kakaoSleepButton = debugPanel.querySelector('[data-debug-action="kakao-sleep"]');
    if (kakaoSleepButton) {
      kakaoSleepButton.addEventListener("click", () => {
        syncKakaoWalker();
        if (kakaoWalkerState.enabled) {
          clearKakaoTimers();
          setKakaoMode("walk");
          startKakaoRest("nap");
        }
      });
    }

    const wakeButton = debugPanel.querySelector('[data-debug-action="wake-up"]');
    if (wakeButton) {
      wakeButton.addEventListener("click", () => {
        syncKakaoWalker();
        wakeKakaoWalker();
      });
    }

    updateDebugButtons();
  };

  resizeStage();
  initializeCamera();

  scene.addEventListener("pointerdown", (event) => {
    ensureAudio();

    if (!state.enabled || event.target.closest(".tm-name-modal") || event.target.closest(".debug-panel") || event.target.closest(".forest-portal") || event.target.closest("#fixedObservatoryPortal") || event.target.closest(".hidden-drop") || event.target.closest(".bottle-mail") || event.target.closest(".forest-bird")) {
      return;
    }

    if (isCoarsePointer) {
      addScreenEffect("tap-ripple", event.clientX, event.clientY);
    }

    if (isMobileWalkerActive()) {
      wakeWalkerForScroll();
      clearMintGuideTimers();
    }

    state.dragging = true;
    state.pointerId = event.pointerId;
    state.startX = event.clientX;
    state.startY = event.clientY;
    state.originX = state.x;
    state.originY = state.y;
    scene.classList.add("is-dragging");
    scene.setPointerCapture(event.pointerId);
  });

  scene.addEventListener("pointermove", (event) => {
    if (currentBird && event.pointerType === "mouse") {
      const rect = currentBird.getBoundingClientRect();
      const birdX = rect.left + rect.width / 2;
      const birdY = rect.top + rect.height / 2;
      const distance = Math.hypot(event.clientX - birdX, event.clientY - birdY);

      if (distance < 72) {
        flyAwayBird(currentBird);
      }
    }

    if (event.pointerType === "mouse" && groundBirds.size) {
      groundBirds.forEach((bird) => {
        if (bird.classList.contains("is-flying")) {
          return;
        }

        const rect = bird.getBoundingClientRect();
        const birdX = rect.left + rect.width / 2;
        const birdY = rect.top + rect.height / 2;
        const distance = Math.hypot(event.clientX - birdX, event.clientY - birdY);

        if (distance < 82) {
          flyAwayGroundBird(bird);
        }
      });
    }

    if (!state.dragging || event.pointerId !== state.pointerId) {
      return;
    }

    state.x = state.originX + event.clientX - state.startX;
    state.y = state.originY + event.clientY - state.startY;
    renderMap();

  });

  const endDrag = (event) => {
    if (!state.dragging || event.pointerId !== state.pointerId) {
      return;
    }

    state.dragging = false;
    state.pointerId = null;
    scene.classList.remove("is-dragging");
  };

  scene.addEventListener("pointerup", endDrag);
  scene.addEventListener("pointercancel", endDrag);
  scene.addEventListener("lostpointercapture", () => {
    state.dragging = false;
    state.pointerId = null;
    scene.classList.remove("is-dragging");
  });

  window.addEventListener("resize", () => {
    resizeStage();

    if (!state.enabled) {
      return;
    }

    syncWalkerEnabled();
    syncKakaoWalker();
    updateWalkerTargetFromScroll();
  });

  window.addEventListener("load", resizeStage);

  window.addEventListener("scroll", handleWalkerScroll, { passive: true });

  if (toast) {
    toast.addEventListener("click", () => {
      const target = cameraTargets[toast.dataset.cameraTarget];

      if (!target) {
        return;
      }

      toast.classList.remove("is-visible", "is-actionable");
      toast.dataset.cameraTarget = "";
      moveCameraToWorldPoint(target.x, target.y);
    });
  }

  document.querySelectorAll(".forest-portal").forEach((portal) => {
    portal.addEventListener("pointerdown", () => {
      if (!isMobileWalkerActive()) {
        return;
      }

      const rect = portal.getBoundingClientRect();
      const side = rect.left + rect.width / 2 < window.innerWidth / 2 ? "left" : "right";
      moveWalkerToSide(side);
    }, { passive: true });
  });

  document.querySelectorAll("[data-coming-soon]").forEach((button) => {
    button.addEventListener("click", () => {
      alert("森の奥はまだ準備中のようです");
    });
  });

  const onsenPortal = document.querySelector(".forest-portal--onsen");
  if (onsenPortal) {
    onsenPortal.addEventListener("pointerenter", () => {
      showCameraNotice("onsen");
    });
  }

  drops.forEach((drop) => {
    drop.addEventListener("click", (event) => {
      showMemoryEvent(event.clientX, event.clientY);
      showToast("雫の中に、小さな森の記憶が映っています。");
    });
  });

  setupDebugPanel();
  applyTimePreset();
  startRiverSound();
  syncWalkerEnabled();
  syncKakaoWalker();
  updateWalkerTargetFromScroll();
  const handleWalkerMediaChange = () => {
    syncWalkerEnabled();
    updateWalkerTargetFromScroll();
  };
  if (typeof mobileWalkerQuery.addEventListener === "function") {
    mobileWalkerQuery.addEventListener("change", handleWalkerMediaChange);
  } else if (typeof mobileWalkerQuery.addListener === "function") {
    mobileWalkerQuery.addListener(handleWalkerMediaChange);
  }
  const handleKakaoWalkerMediaChange = () => {
    syncKakaoWalker();
  };
  if (typeof kakaoWalkerQuery.addEventListener === "function") {
    kakaoWalkerQuery.addEventListener("change", handleKakaoWalkerMediaChange);
  } else if (typeof kakaoWalkerQuery.addListener === "function") {
    kakaoWalkerQuery.addListener(handleKakaoWalkerMediaChange);
  }
  window.setInterval(applyTimePreset, 60 * 1000);

  ["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
    window.addEventListener(eventName, ensureAudio, { once: true, passive: true });
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && soundscape && !riverStarted) {
      startRiverSound();
    }
  });

  restartTimedEvents();

  if (mintGuide && isFinePointer && !reduceMotion) {
    const mint = {
      active: false,
      following: false,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
    };

    const followMint = () => {
      mint.x += (mint.targetX - mint.x) * 0.075;
      mint.y += (mint.targetY - mint.y) * 0.075;
      mintGuide.style.transform = `translate3d(${mint.x + 14}px, ${mint.y + 16}px, 0)`;
      window.requestAnimationFrame(followMint);
    };

    window.addEventListener("pointermove", (event) => {
      if (event.pointerType && event.pointerType !== "mouse") {
        return;
      }

      mint.targetX = event.clientX;
      mint.targetY = event.clientY;

      if (!mint.active) {
        mint.active = true;
        mint.x = event.clientX;
        mint.y = event.clientY;
        mintGuide.classList.add("is-active");
        if (!mint.following) {
          mint.following = true;
          window.requestAnimationFrame(followMint);
        }
      }
    }, { passive: true });

    const blinkMint = () => {
      mintGuide.classList.add("is-blinking");
      window.setTimeout(() => {
        mintGuide.classList.remove("is-blinking");
      }, 150);
      window.setTimeout(blinkMint, 4200 + Math.random() * 2600);
    };

    window.setTimeout(blinkMint, 2800);
  }
})();
