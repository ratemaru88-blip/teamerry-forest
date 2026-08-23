const TM_DISPLAY_NAME_KEY = "teaMerryDisplayName";
const TM_RETURN_SOURCE_KEY = "teaMerryReturnSource";
const TM_RETURN_SOURCE_OBSERVATORY = "observatory";

function getForestDisplayName() {
  try {
    return window.localStorage.getItem(TM_DISPLAY_NAME_KEY) || "おさんぽさん";
  } catch (error) {
    return "おさんぽさん";
  }
}

function updateWriterNames() {
  document.querySelectorAll("#writerName, #bottleWriterName, #wishWriterName, .writer-name").forEach((element) => {
    element.textContent = getForestDisplayName();
  });
}

window.TeaMerryForestName = {
  getDisplayName: getForestDisplayName,
  updateWriterNames,
};
window.getForestDisplayName = getForestDisplayName;

document.addEventListener("DOMContentLoaded", () => {
  const observatory = document.getElementById("observatory");
  const observatoryStage = document.querySelector(".observatory-stage");
  const fairyImage = document.getElementById("fairyImage");
  const fairyBalloon = document.getElementById("fairyBalloon");
  const forestWhisper = document.getElementById("forestWhisper");
  const forestWhisperText = document.getElementById("forestWhisperText");
  const bottleMailButton = document.getElementById("bottleMailButton");
  const hokkoriButton = document.getElementById("hokkoriButton");
  const hokkoriNightButton = document.getElementById("hokkoriNightButton");
  const wishStarButton = document.getElementById("wishStarButton");
  const bottleHokkoriButton = document.getElementById("bottleHokkoriButton");
  const wishHokkoriButton = document.getElementById("wishHokkoriButton");
  const bottleWriteView = document.getElementById("bottleWriteView");
  const wishWriteView = document.getElementById("wishWriteView");
  const bottleHokkoriView = document.getElementById("bottleHokkoriView");
  const wishHokkoriView = document.getElementById("wishHokkoriView");
  const wishLanternView = document.getElementById("wishLanternView");
  const wishLanternVideo = document.getElementById("wishLanternVideo");
  const bottleFlushView = document.getElementById("bottleFlushView");
  const bottleFlushVideo = document.getElementById("bottleFlushVideo");
  const bottleWriterName = document.getElementById("bottleWriterName");
  const wishWriterName = document.getElementById("wishWriterName");
  const bottlePrivacyModal = document.getElementById("bottlePrivacyModal");
  const wishPrivacyModal = document.getElementById("wishPrivacyModal");
  const bottleMessageInput = document.getElementById("bottleMessageInput");
  const wishMessageInput = document.getElementById("wishMessageInput");
  const bottleLimitMessage = document.getElementById("bottleLimitMessage");
  const forestBackLink = document.querySelector(".forest-back");
  const driftBottleArrival = document.getElementById("driftBottleArrival");
  const driftBottleButton = document.getElementById("driftBottleButton");
  const driftBottleModal = document.getElementById("driftBottleModal");
  const driftBottleDialog = driftBottleModal && driftBottleModal.querySelector(".drift-bottle-letter-stage");
  const driftBottleSender = document.getElementById("driftBottleSender");
  const driftBottleBody = document.getElementById("driftBottleBody");
  const driftBottleClose = document.getElementById("driftBottleClose");
  const driftBottleReceive = document.getElementById("driftBottleReceive");
  const driftBottleReceiveVideo = document.getElementById("driftBottleReceiveVideo");
  const hokkoriBoardLetters = document.getElementById("hokkoriBoardLetters");
  const hokkoriBoardEmpty = document.getElementById("hokkoriBoardEmpty");
  const hokkoriBoardCharacters = document.querySelector(".hokkori-board__characters");
  const wishHokkoriStars = document.getElementById("wishHokkoriStars");
  const wishHokkoriCharacters = document.getElementById("wishHokkoriCharacters");
  const views = [bottleWriteView, wishWriteView, bottleHokkoriView, wishHokkoriView, wishLanternView, bottleFlushView].filter(Boolean);
  const bottleLimitText = "🍃 ボトルに入るお手紙は100文字まで。少しだけ短くして、もう一度届けてみてくださいね。";
  const driftBottleJsonPath = "./data/export/drift_bottle_messages.json";
  const lillActionReactionsJsonPath = "./data/export/lill_action_reactions.json";
  const wishStarTsvPath = "./data/wish_star/TeaMerry_Wish_Star_Master_v01.tsv";
  const observatoryDayBgmPath = "./assets/audio/bgm/observatory_days_se_v01.mp3";
  const observatoryNightBgmPath = "./assets/audio/bgm/observatory_night_se_v01.mp3";
  const driftBottleArrivalSePath = "./assets/audio/sfx/bottle_water_landing_v01.mp3";
  const driftBottleArrivalText = "あっ、ボトルメールが流れ着いたみたい！";
  const driftBottleSeenKey = "teaMerryDriftBottleSeen";
  const driftBottleMessageIdKey = "teaMerryDriftBottleMessageId";
  const driftBottleRecentKey = "teaMerryDriftBottleRecentIds";
  const driftBottleArrivalChance = 0.4;
  const driftBottleArrivalAudio = typeof Audio === "function" ? new Audio(driftBottleArrivalSePath) : null;
  const observatoryBgmAudio = document.getElementById("observatoryBgmAudio");
  const driftBottleModalCloseDuration = 520;
  let observatoryVideoFallbackTimer = null;
  let observatoryVideoReturnFocus = null;
  let driftBottleModalCloseTimer = null;
  let wishHokkoriMessagesPromise = null;
  let lillActionReactionsPromise = null;
  let lillReactionState = null;
  let lillReactionAdvanceLocked = false;
  let pendingLillReactionCategory = null;
  let letterOpenSource = null;
  const lastReactionSetIdByCategory = {};
  const wishLanternTalkDuration = 2800;
  const wishLanternPauseDuration = 350;
  const wishLanternLiluFrames = [
    "./assets/images/lilu/present/lilu_full_present_normal.webp",
    "./assets/images/lilu/present/lilu_full_present_mouth_open.webp",
    "./assets/images/lilu/present/lilu_full_present_mouth_round.webp",
    "./assets/images/lilu/present/lilu_full_present_mouth_smaile.webp",
  ];
  const hokkoriFairies = [
    { src: "./assets/images/forest_fairy/aco_v01.webp", alt: "アコ" },
    { src: "./assets/images/forest_fairy/berry_v01.webp", alt: "ベリー" },
    { src: "./assets/images/forest_fairy/curly_v01.webp", alt: "カーリー" },
    { src: "./assets/images/forest_fairy/lavi_v01.webp", alt: "ラヴィ" },
    { src: "./assets/images/forest_fairy/lemon_v01.webp", alt: "レモン" },
    { src: "./assets/images/forest_fairy/miiru_v01.webp", alt: "ミール" },
    { src: "./assets/images/forest_fairy/tiara_v01.webp", alt: "ティアラ" },
  ];
  const wishHokkoriFallbacks = [
    {
      id: "wish-fallback-1",
      displayName: "おさんぽさん",
      text: "今日の小さな願いが、星のすきまにそっと届きますように。",
      handwritingTemplate: "round",
    },
    {
      id: "wish-fallback-2",
      displayName: "おさんぽさん",
      text: "眠る前のひと息が、明日の光になりますように。",
      handwritingTemplate: "quiet",
    },
    {
      id: "wish-fallback-3",
      displayName: "おさんぽさん",
      text: "誰かのやさしい気持ちが、夜空でまたたきますように。",
      handwritingTemplate: "child",
    },
  ];
  const wishLanternTypes = [
    {
      src: "./assets/images/observatory/rantan/lantern_wood_closed.webp",
      message: "木星のランタンが出た。<br>ミントが好きなやつ",
      weight: 60,
    },
    {
      src: "./assets/images/observatory/rantan/lantern_mercury_closed.webp",
      message: "水星ランタンが出た。<br>小さな願いがすばやく届きそう",
      weight: 22,
    },
    {
      src: "./assets/images/observatory/rantan/lantern_neptune_closed.webp",
      message: "海王星ランタンが出た。<br>深い青の願いが静かに光る",
      weight: 14,
    },
    {
      src: "./assets/images/observatory/rantan/lantern_niji_closed.webp",
      message: "虹色ランタンが出た。<br>めったに出ない特別な光",
      weight: 2,
    },
    {
      src: "./assets/images/observatory/rantan/lantern_saturn_closed.webp",
      message: "土星ランタンが出た。<br>輪っかの星が願いを守ってくれる",
      weight: 2,
    },
  ];

  if (driftBottleArrivalAudio) {
    driftBottleArrivalAudio.volume = 0.45;
    driftBottleArrivalAudio.preload = "auto";
  }

  updateWriterNames();

  forestBackLink?.addEventListener("click", () => {
    try {
      window.sessionStorage.setItem(TM_RETURN_SOURCE_KEY, TM_RETURN_SOURCE_OBSERVATORY);
    } catch (error) {
      // The URL marker still handles the return when session storage is unavailable.
    }
  });

  const requestedTime = new URLSearchParams(window.location.search).get("time");
  const hour = new Date().getHours();
  const isNight = requestedTime === "night" || (requestedTime !== "day" && (hour < 6 || hour >= 18));

  if (isNight) {
    observatory.classList.add("is-night");
  }

  startObservatoryBgm();

  function startObservatoryBgm() {
    if (!observatoryBgmAudio) {
      return;
    }
    observatoryBgmAudio.src = isNight ? observatoryNightBgmPath : observatoryDayBgmPath;
    observatoryBgmAudio.loop = true;
    observatoryBgmAudio.volume = 0.16;
    observatoryBgmAudio.preload = "auto";
    window.TeaMerryObservatoryBgm = {
      audio: observatoryBgmAudio,
      mode: isNight ? "night" : "day",
      path: observatoryBgmAudio.src,
    };

    const play = () => {
      observatoryBgmAudio.play().catch(() => {
        document.addEventListener("pointerdown", play, { once: true });
        document.addEventListener("click", play, { once: true });
        document.addEventListener("keydown", play, { once: true });
      });
    };

    play();
  }

  const fairies = [
    {
      name: "リル",
      image: "./assets/images/observatory/fairies/Lilu_v01.webp",
      alt: "リル",
      dayMessages: [
        "ここでは、ボトルメールを書いて森へ流せるんだよ。"
      ],
      nightMessages: [
        "夜の空には、みんなの願いが輝いているよ。"
      ]
    },
    {
      name: "ベリー",
      image: "./assets/images/observatory/fairies/Berry_v01.webp",
      alt: "ベリー",
      dayMessages: [
        "面白そうな瓶があるよ！",
        "今日は風が元気だね。",
        "誰かの便り、流れてくるかな？"
      ],
      nightMessages: [
        "願いごと、星まで届くかな？",
        "夜のテラス、ちょっとわくわくするね。",
        "あの星、こっち見てるみたい！"
      ]
    },
    {
      name: "レモン",
      image: "./assets/images/observatory/fairies/Lemon_v01.webp",
      alt: "レモン",
      dayMessages: [
        "きっといい便りが届くよ。",
        "瓶を流したら、風にまかせよう。",
        "今日は遠くまで見えるね。"
      ],
      nightMessages: [
        "叶うといいね。",
        "星にお願いしてみよう。",
        "明日もいい日になるといいね。"
      ]
    }
  ];

  const selectedFairy = fairies.find((fairy) => fairy.name === "リル") || fairies[0];
  const messages = isNight ? selectedFairy.nightMessages : selectedFairy.dayMessages;
  const selectedMessage = isNight
    ? "夜の空には、みんなの願いが輝いているよ。"
    : "ここでは、ボトルメールを書いて森へ流せるんだよ。";
  const forestWhispers = isNight
    ? [
      "星のあいだを、静かな願いが流れていきます。",
      "夜風が、テラスの灯りをそっと揺らしています。",
      "遠い星にも、小さな声は届くかもしれません。"
    ]
    : [
      "風が、星風テラスの小さな便りを運んでいます。",
      "雲のすきまから、森の光がこぼれています。",
      "ここでは、書きかけの気持ちも風に預けられます。"
    ];

  fairyImage.src = selectedFairy.image;
  fairyImage.alt = selectedFairy.alt;

  async function setInitialFairyMessage() {
    if (!fairyBalloon) {
      return;
    }

    if (lillReactionState) {
      return;
    }

    if (typeof window.pickCharacterDialogue !== "function") {
      fairyBalloon.textContent = selectedMessage;
      return;
    }

    try {
      const dialogueText = await window.pickCharacterDialogue({
        character: "リル",
        place: "星風テラス",
        section: "導入",
        conditionTags: ["入室", isNight ? "夜" : "昼"],
        time: isNight ? "夜" : "昼"
      });
      if (!lillReactionState) {
        fairyBalloon.textContent = dialogueText || selectedMessage;
      }
    } catch (error) {
      console.warn("[TeaMerry Observatory] Dialogue Engine character dialogue failed:", error);
      if (!lillReactionState) {
        fairyBalloon.textContent = selectedMessage;
      }
    }
  }

  setInitialFairyMessage();

  function showForestWhisper(message) {
    if (!forestWhisper || !forestWhisperText) {
      return;
    }

    forestWhisperText.textContent = message;
    forestWhisper.classList.add("is-visible");
    forestWhisper.setAttribute("aria-hidden", "false");
    window.clearTimeout(showForestWhisper.timer);
    showForestWhisper.timer = window.setTimeout(() => {
      forestWhisper.classList.remove("is-visible");
      forestWhisper.setAttribute("aria-hidden", "true");
    }, 5200);
  }

  function getFallbackWhisper() {
    return forestWhispers[Math.floor(Math.random() * forestWhispers.length)];
  }

  async function pickDialogueEngineForestWhisper() {
    if (typeof window.pickForestWhisper !== "function") {
      return null;
    }

    try {
      return await window.pickForestWhisper({
        place: "星風テラス",
        time: isNight ? "夜" : "昼"
      });
    } catch (error) {
      console.warn("[TeaMerry Observatory] Dialogue Engine whisper failed:", error);
      return null;
    }
  }

  async function showEventReaction(eventContext) {
    if (typeof window.pickForestWhisper !== "function") {
      return;
    }

    try {
      const text = await window.pickForestWhisper({
        place: "星風テラス",
        time: isNight ? "夜" : "昼",
        eventContext,
        eventOnly: true
      });

      if (text) {
        showForestWhisper(text);
      }
    } catch (error) {
      console.warn("[TeaMerry Observatory] Dialogue Engine event reaction failed:", error);
    }
  }

  function normalizeDriftBottleHandwritingTemplate(value) {
    const template = String(value || "quiet")
      .split("（", 1)[0]
      .split("(", 1)[0]
      .trim()
      .toLowerCase();
    return ["quiet", "round", "careful", "faded", "child"].includes(template) ? template : "quiet";
  }

  function normalizeDriftBottleMessage(message = {}) {
    const text = String(message.message || message.text || "").trim();

    return {
      id: String(message.id || "").trim(),
      displayName: String(message.displayName || "おさんぽさん").trim() || "おさんぽさん",
      text,
      handwritingTemplate: normalizeDriftBottleHandwritingTemplate(message.handwritingTemplate),
      enabled: message.enabled !== false,
    };
  }

  async function loadDriftBottleMessages() {
    try {
      const response = await fetch(driftBottleJsonPath);
      if (!response.ok) {
        throw new Error(`Drift bottle JSON load failed: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data && data.messages)
        ? data.messages.map(normalizeDriftBottleMessage).filter((message) => message.enabled && message.text)
        : [];
    } catch (error) {
      console.warn("[TeaMerry Observatory] Drift bottle messages failed:", error);
      return [];
    }
  }

  async function loadDriftBottleRawMessages() {
    try {
      const response = await fetch(driftBottleJsonPath);
      if (!response.ok) {
        throw new Error(`Drift bottle JSON load failed: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data && data.messages) ? data.messages : [];
    } catch (error) {
      console.error("[TeaMerry Observatory] Today hokkori messages failed:", error);
      return [];
    }
  }

  function showLillSpeech(message) {
    if (fairyBalloon && message) {
      fairyBalloon.textContent = message;
    }
  }

  function normalizeLillActionReactionSet(set = {}) {
    const setId = String(set.setId || "").trim();
    const lines = Array.isArray(set.lines)
      ? set.lines.map((line) => String(line || "").trim()).filter(Boolean)
      : [];

    return setId && lines.length === 3 ? { setId, lines } : null;
  }

  async function loadLillActionReactions() {
    if (!lillActionReactionsPromise) {
      lillActionReactionsPromise = fetch(lillActionReactionsJsonPath)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Lill action reactions JSON load failed: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          const reactions = data && data.reactions && typeof data.reactions === "object"
            ? data.reactions
            : {};

          return Object.fromEntries(
            Object.entries(reactions).map(([category, sets]) => [
              category,
              Array.isArray(sets)
                ? sets.map(normalizeLillActionReactionSet).filter(Boolean)
                : [],
            ])
          );
        })
        .catch((error) => {
          console.warn("[TeaMerry] リルの行動後リアクションを読み込めませんでした。", error);
          return {};
        });
    }

    return lillActionReactionsPromise;
  }

  function pickLillActionReactionSet(category, sets) {
    if (!sets.length) {
      return null;
    }

    const lastSetId = lastReactionSetIdByCategory[category];
    const candidates = sets.length > 1
      ? sets.filter((set) => set.setId !== lastSetId)
      : sets;
    const selected = candidates[Math.floor(Math.random() * candidates.length)] || sets[0];
    lastReactionSetIdByCategory[category] = selected.setId;
    return selected;
  }

  async function startLillActionReaction(category) {
    const reactions = await loadLillActionReactions();
    const sets = Array.isArray(reactions[category]) ? reactions[category] : [];
    const selected = pickLillActionReactionSet(category, sets);

    if (!selected) {
      lillReactionState = null;
      return false;
    }

    lillReactionState = {
      category,
      setId: selected.setId,
      currentIndex: 0,
      lines: [...selected.lines],
    };
    showLillSpeech(lillReactionState.lines[0]);
    return true;
  }

  function advanceLillActionReaction() {
    if (!lillReactionState || lillReactionAdvanceLocked) {
      return false;
    }

    lillReactionAdvanceLocked = true;
    window.setTimeout(() => {
      lillReactionAdvanceLocked = false;
    }, 180);

    const nextIndex = lillReactionState.currentIndex + 1;
    if (nextIndex < lillReactionState.lines.length) {
      lillReactionState.currentIndex = nextIndex;
      showLillSpeech(lillReactionState.lines[nextIndex]);
      return true;
    }

    lillReactionState = null;
    setInitialFairyMessage();
    return true;
  }

  function queueLillActionReaction(category) {
    pendingLillReactionCategory = category;
  }

  function consumePendingLillActionReaction() {
    if (!pendingLillReactionCategory) {
      return;
    }

    const category = pendingLillReactionCategory;
    pendingLillReactionCategory = null;
    startLillActionReaction(category);
  }

  function parseWishStarTsv(text = "") {
    const lines = String(text).replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
    const headers = lines.shift();

    if (!headers) {
      return [];
    }

    const headerNames = headers.split("\t").map((header) => header.trim());
    const getValue = (columns, name) => {
      const index = headerNames.indexOf(name);
      return index >= 0 ? String(columns[index] || "").trim() : "";
    };

    return lines
      .map((line) => {
        const columns = line.split("\t");
        const textValue = getValue(columns, "願いごと本文");
        const enabled = getValue(columns, "願い星対象").toUpperCase() !== "FALSE";

        return {
          id: getValue(columns, "ID"),
          displayName: getValue(columns, "呼び名 （空欄＝おさんぽさん）") || "おさんぽさん",
          text: textValue,
          handwritingTemplate: normalizeDriftBottleHandwritingTemplate(getValue(columns, "筆跡テンプレート")),
          enabled,
        };
      })
      .filter((message) => message.enabled && message.text);
  }

  async function loadWishHokkoriMessages() {
    if (!wishHokkoriMessagesPromise) {
      wishHokkoriMessagesPromise = fetch(wishStarTsvPath)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Wish star TSV load failed: ${response.status}`);
          }
          return response.text();
        })
        .then(parseWishStarTsv)
        .catch((error) => {
          console.warn("[TeaMerry Observatory] Wish hokkori TSV failed:", error);
          return [];
        });
    }

    return wishHokkoriMessagesPromise;
  }

  function getWishHokkoriDateKey(targetDate = new Date()) {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(targetDate);
  }

  function pickDailyWishHokkoriMessages(messages, targetDate = new Date()) {
    const source = Array.isArray(messages) && messages.length ? messages : wishHokkoriFallbacks;
    const dateKey = getWishHokkoriDateKey(targetDate);

    return [...source]
      .map((message) => ({
        message,
        score: hashDriftBottleString(`${dateKey}:${message.id || message.text}`),
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(({ message }) => message);
  }

  function readSessionJson(key, fallback) {
    try {
      const parsed = JSON.parse(window.sessionStorage.getItem(key) || "null");
      return parsed == null ? fallback : parsed;
    } catch (error) {
      return fallback;
    }
  }

  function writeSessionJson(key, value) {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Session memory is optional.
    }
  }

  function getRecentDriftBottleIds() {
    const ids = readSessionJson(driftBottleRecentKey, []);
    return Array.isArray(ids) ? ids.map(String).filter(Boolean) : [];
  }

  function rememberDriftBottleId(id) {
    if (!id) {
      return;
    }

    const recentIds = getRecentDriftBottleIds().filter((recentId) => recentId !== id);
    recentIds.unshift(id);
    writeSessionJson(driftBottleRecentKey, recentIds.slice(0, 12));

    try {
      window.sessionStorage.setItem(driftBottleMessageIdKey, id);
    } catch (error) {
      // Session memory is optional.
    }
  }

  async function pickDriftBottleMessage() {
    const messages = await loadDriftBottleMessages();
    if (!messages.length) {
      return null;
    }

    const recentIds = new Set(getRecentDriftBottleIds());
    const freshMessages = messages.filter((message) => !recentIds.has(message.id));
    return (freshMessages.length ? freshMessages : messages)[Math.floor(Math.random() * (freshMessages.length || messages.length))];
  }

  function hideDriftBottleArrival() {
    if (!driftBottleArrival) {
      return;
    }

    driftBottleArrival.hidden = false;
    driftBottleArrival.classList.remove("is-visible");
    driftBottleArrival.classList.add("is-dismissed");

    if (driftBottleButton) {
      driftBottleButton.tabIndex = -1;
    }
  }

  function playDriftBottleArrivalSe() {
    if (!driftBottleArrivalAudio) {
      return;
    }

    try {
      driftBottleArrivalAudio.pause();
      driftBottleArrivalAudio.currentTime = 0;
      const playPromise = driftBottleArrivalAudio.play();
      if (playPromise) {
        playPromise.catch(() => {});
      }
    } catch (error) {
      // Browser autoplay rules may block this before a user gesture.
    }
  }

  function showLilDriftBottleArrivalMessage() {
    if (!fairyBalloon) {
      return;
    }

    window.clearTimeout(showLilDriftBottleArrivalMessage.timer);
    const previousMessage = fairyBalloon.textContent || selectedMessage;
    fairyBalloon.textContent = driftBottleArrivalText;

    showLilDriftBottleArrivalMessage.timer = window.setTimeout(() => {
      if (!lillReactionState && fairyBalloon.textContent === driftBottleArrivalText) {
        fairyBalloon.textContent = previousMessage || selectedMessage;
      }
    }, 4600);
  }

  function markDriftBottleSeen() {
    try {
      window.sessionStorage.setItem(driftBottleSeenKey, "true");
    } catch (error) {
      // Session memory is optional.
    }
  }

  function getDriftBottleLetterSizeClass(text = "") {
    const length = Array.from(String(text).trim()).length;

    if (length <= 80) {
      return "is-short";
    }

    if (length <= 120) {
      return "is-medium";
    }

    if (length <= 160) {
      return "is-long";
    }

    return "is-extra-long";
  }

  function hashDriftBottleString(value = "") {
    let hash = 2166136261;
    const source = String(value);

    for (let index = 0; index < source.length; index += 1) {
      hash ^= source.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
  }

  function createDriftBottleSeededRandom(seed) {
    let state = seed >>> 0;

    return () => {
      state += 0x6D2B79F5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function getDriftBottleHandwritingClass(message = {}) {
    return `handwriting-${normalizeDriftBottleHandwritingTemplate(message.handwritingTemplate)}`;
  }

  function getDriftBottleLineTarget(sizeClass, handwritingClass) {
    const isMobileLayout = window.matchMedia("(max-width: 768px), (hover: none) and (pointer: coarse)").matches;
    const baseTargets = isMobileLayout
      ? { "is-short": 13, "is-medium": 14, "is-long": 15, "is-extra-long": 17 }
      : { "is-short": 14, "is-medium": 16, "is-long": 18, "is-extra-long": 20 };
    const handwritingOffset = {
      "handwriting-quiet": -1,
      "handwriting-round": 1,
      "handwriting-careful": -2,
      "handwriting-faded": 0,
      "handwriting-child": 1,
    };

    return Math.max(8, (baseTargets[sizeClass] || 14) + (handwritingOffset[handwritingClass] || 0));
  }

  function isInsideDriftBottleProtectedWord(text, breakIndex) {
    const protectedWords = ["ありませんでした", "分かりませんでした", "なりました", "思いました", "しています", "いいのか", "のか", "よく", "でした", "ます", "ません", "ので", "けれど", "から", "ため"];

    return protectedWords.some((word) => {
      let searchFrom = 0;
      let wordIndex = text.indexOf(word, searchFrom);

      while (wordIndex !== -1) {
        if (breakIndex > wordIndex && breakIndex < wordIndex + word.length) {
          return true;
        }

        searchFrom = wordIndex + 1;
        wordIndex = text.indexOf(word, searchFrom);
      }

      return false;
    });
  }

  function isForbiddenDriftBottleBreak(chars, breakIndex) {
    if (breakIndex <= 0 || breakIndex >= chars.length) {
      return true;
    }

    const noLineStart = "、。！？!?）」』】〉》ぁぃぅぇぉゃゅょっか";
    const noLineEnd = "（「『【〈《";
    const singleParticles = "がをにへではとも";
    const before = chars[breakIndex - 1];
    const after = chars[breakIndex];

    if (noLineStart.includes(after) || noLineEnd.includes(before)) {
      return true;
    }

    if (singleParticles.includes(after) && breakIndex + 1 < chars.length && !"、。！？!?".includes(chars[breakIndex + 1])) {
      return true;
    }

    return isInsideDriftBottleProtectedWord(chars.join(""), breakIndex);
  }

  function scoreDriftBottleBreak(chars, breakIndex, targetLength) {
    const before = chars[breakIndex - 1];
    const previousTwo = chars.slice(Math.max(0, breakIndex - 2), breakIndex).join("");
    const previousThree = chars.slice(Math.max(0, breakIndex - 3), breakIndex).join("");
    const sentenceEnd = "。！？!?";
    const comma = "、，,";
    const particles = ["から", "まで", "より", "ので", "けれど", "ため", "には", "ても", "では", "が", "を", "に", "へ", "で", "と", "も", "は", "の"];
    let score = -Math.abs(targetLength - breakIndex) * 1.2;

    if (sentenceEnd.includes(before)) {
      score += breakIndex > targetLength * 1.45 ? -20 : 120;
    } else if (comma.includes(before)) {
      score += 95;
    }

    if (particles.includes(previousThree)) {
      score += 74;
    } else if (particles.includes(previousTwo)) {
      score += 68;
    } else if (particles.includes(before)) {
      score += 54;
    }

    if (before === " " || before === "　") {
      score += 46;
    }

    return score;
  }

  function findDriftBottleLineBreak(chars, targetLength) {
    const minBreak = Math.max(4, Math.floor(targetLength * 0.58));
    const preferredMax = Math.min(chars.length - 1, Math.ceil(targetLength * 1.3));
    const extendedMax = Math.min(chars.length - 1, Math.ceil(targetLength * 1.58));
    let bestBreak = null;
    let bestScore = -Infinity;

    for (let index = minBreak; index <= extendedMax; index += 1) {
      if (isForbiddenDriftBottleBreak(chars, index)) {
        continue;
      }

      const score = scoreDriftBottleBreak(chars, index, targetLength) - (index > preferredMax ? (index - preferredMax) * 8 : 0);

      if (score > bestScore) {
        bestScore = score;
        bestBreak = index;
      }
    }

    if (bestBreak !== null) {
      return bestBreak;
    }

    for (let index = Math.min(targetLength, chars.length - 1); index < chars.length; index += 1) {
      if (!isForbiddenDriftBottleBreak(chars, index)) {
        return index;
      }
    }

    for (let index = Math.min(targetLength, chars.length - 1); index >= 1; index -= 1) {
      if (!isForbiddenDriftBottleBreak(chars, index)) {
        return index;
      }
    }

    return Math.min(targetLength, chars.length);
  }

  function splitDriftBottleLetterLines(text = "", sizeClass, handwritingClass, random) {
    const target = getDriftBottleLineTarget(sizeClass, handwritingClass);
    const lines = [];
    const paragraphs = String(text).trim().split(/\n+/);

    paragraphs.forEach((paragraph, paragraphIndex) => {
      let chars = Array.from(paragraph.trim());

      while (chars.length) {
        if (chars.length <= Math.ceil(target * 1.18)) {
          lines.push(chars.join(""));
          break;
        }

        const lineTarget = Math.max(7, target + Math.round(random() * 4) - 2);
        const breakIndex = findDriftBottleLineBreak(chars, lineTarget);
        lines.push(chars.slice(0, breakIndex).join("").trim());
        chars = chars.slice(breakIndex);
      }

      if (paragraphIndex < paragraphs.length - 1) {
        lines.push("");
      }
    });

    return lines.filter((line, index, source) => line || index < source.length - 1);
  }

  function renderDriftBottleLetterBody(message = {}) {
    if (!driftBottleBody) {
      return;
    }

    const text = String(message.text || "").trim();
    const sizeClass = getDriftBottleLetterSizeClass(text);
    const handwritingClass = getDriftBottleHandwritingClass(message);
    const content = driftBottleBody.closest(".drift-bottle-letter-content");
    const removableClasses = [
      "is-short",
      "is-medium",
      "is-long",
      "is-extra-long",
      "handwriting-quiet",
      "handwriting-round",
      "handwriting-careful",
      "handwriting-faded",
      "handwriting-child",
    ];
    const random = createDriftBottleSeededRandom(hashDriftBottleString(`${message.id || ""}:${text}:lines`));
    const lines = splitDriftBottleLetterLines(text, sizeClass, handwritingClass, random);

    driftBottleBody.classList.remove(...removableClasses);
    driftBottleBody.classList.add(sizeClass, handwritingClass);
    driftBottleBody.textContent = "";

    if (content) {
      content.classList.remove(...removableClasses);
      content.classList.add(sizeClass, handwritingClass);
      content.style.removeProperty("--fit-font-adjust");
    }

    lines.forEach((line, index) => {
      const lineElement = document.createElement("span");
      lineElement.className = "letter-line";
      lineElement.textContent = line;

      if (!line) {
        lineElement.classList.add("letter-line--blank");
      }

      const lineRandom = createDriftBottleSeededRandom(hashDriftBottleString(`${message.id || text}:line:${index}`));
      const variation = {
        "handwriting-quiet": { indent: 5, indentStart: -2, font: 1, rotate: 0.18, opacityMin: 0.86, opacityRange: 0.08 },
        "handwriting-round": { indent: 7, indentStart: -2, font: 1, rotate: 0.22, opacityMin: 0.88, opacityRange: 0.08 },
        "handwriting-careful": { indent: 4, indentStart: -1, font: 0.7, rotate: 0.08, opacityMin: 0.9, opacityRange: 0.05 },
        "handwriting-faded": { indent: 8, indentStart: -3, font: 1.2, rotate: 0.24, opacityMin: 0.82, opacityRange: 0.12 },
        "handwriting-child": { indent: 10, indentStart: -3, font: 2.2, rotate: 0.3, opacityMin: 0.86, opacityRange: 0.1 },
      }[handwritingClass] || { indent: 6, indentStart: -2, font: 1, rotate: 0.2, opacityMin: 0.88, opacityRange: 0.08 };
      lineElement.style.setProperty("--line-indent", `${Math.round(lineRandom() * variation.indent + variation.indentStart)}px`);
      lineElement.style.setProperty("--line-font-delta", `${((lineRandom() - 0.5) * variation.font).toFixed(2)}px`);
      lineElement.style.setProperty("--line-rotate", `${(lineRandom() * variation.rotate - variation.rotate / 2).toFixed(3)}deg`);
      lineElement.style.setProperty("--line-opacity", `${Math.min(0.96, variation.opacityMin + lineRandom() * variation.opacityRange).toFixed(2)}`);
      lineElement.style.setProperty("--line-gap", `${Math.round(lineRandom() * 3 - 1)}px`);
      driftBottleBody.appendChild(lineElement);
    });
  }

  function fitDriftBottleLetterToPaper() {
    if (!driftBottleBody) {
      return;
    }

    const content = driftBottleBody.closest(".drift-bottle-letter-content");
    if (!content) {
      return;
    }

    const isLetterOverflowing = () => {
      const contentRect = content.getBoundingClientRect();
      const hasWideLine = Array.from(driftBottleBody.querySelectorAll(".letter-line")).some((line) => {
        const lineRect = line.getBoundingClientRect();
        return lineRect.left < contentRect.left - 5 || lineRect.right > contentRect.right + 1;
      });

      return hasWideLine || driftBottleBody.scrollHeight > driftBottleBody.clientHeight + 1;
    };

    let adjust = 0;
    content.style.setProperty("--fit-font-adjust", "0px");

    while (isLetterOverflowing() && adjust > -6) {
      adjust -= 1;
      content.style.setProperty("--fit-font-adjust", `${adjust}px`);
    }
  }

  function setDriftBottleBackgroundInteractivity(isModalOpen) {
    if (!driftBottleModal || !driftBottleModal.parentElement) {
      return;
    }

    Array.from(driftBottleModal.parentElement.children).forEach((element) => {
      if (element === driftBottleModal) {
        return;
      }

      if (isModalOpen) {
        if (!element.hasAttribute("data-drift-bottle-aria-hidden")) {
          element.setAttribute("data-drift-bottle-aria-hidden", element.getAttribute("aria-hidden") || "");
        }
        element.setAttribute("aria-hidden", "true");
        if ("inert" in element) {
          element.inert = true;
        }
        return;
      }

      if (element.hasAttribute("data-drift-bottle-aria-hidden")) {
        const previousValue = element.getAttribute("data-drift-bottle-aria-hidden");
        if (previousValue) {
          element.setAttribute("aria-hidden", previousValue);
        } else {
          element.removeAttribute("aria-hidden");
        }
        element.removeAttribute("data-drift-bottle-aria-hidden");
      }

      if ("inert" in element) {
        element.inert = false;
      }
    });
  }

  function showDriftBottleMessageModal() {
    if (!openDriftBottleMessage.current || !driftBottleModal) {
      return;
    }

    const message = openDriftBottleMessage.current;

    if (driftBottleSender) {
      driftBottleSender.textContent = `${message.displayName || "おさんぽさん"}より`;
    }

    renderDriftBottleLetterBody(message);

    window.clearTimeout(driftBottleModalCloseTimer);
    driftBottleModal.hidden = false;
    driftBottleModal.classList.remove("is-closing");
    driftBottleModal.setAttribute("aria-hidden", "false");
    setDriftBottleBackgroundInteractivity(true);
    window.requestAnimationFrame(() => {
      driftBottleModal.classList.add("is-active");
    });
    window.setTimeout(() => {
      fitDriftBottleLetterToPaper();

      if (driftBottleDialog) {
        driftBottleDialog.focus();
      }
    }, 0);
  }

  function openHokkoriBottleMessage(message, triggerElement) {
    if (!message || !driftBottleModal) {
      console.error("[TeaMerry Observatory] Drift bottle letter UI is not available for hokkori.");
      return;
    }

    if (driftBottleModal.classList.contains("is-active") || playDriftBottleReceiveAnimation.isPlaying) {
      return;
    }

    openDriftBottleMessage.current = {
      id: String(message.id || "").trim(),
      displayName: String(message.displayName || "おさんぽさん").trim() || "おさんぽさん",
      text: String(message.text || "").trim(),
      handwritingTemplate: normalizeDriftBottleHandwritingTemplate(message.handwritingTemplate),
    };
    openDriftBottleMessage.lastFocus = triggerElement || document.activeElement;
    letterOpenSource = "hokkori";
    showDriftBottleMessageModal();
  }

  function stopDriftBottleReceiveAnimation() {
    if (driftBottleReceiveVideo) {
      driftBottleReceiveVideo.pause();
      driftBottleReceiveVideo.currentTime = 0;
    }

    if (driftBottleReceive) {
      driftBottleReceive.hidden = true;
      driftBottleReceive.classList.remove("is-active", "is-ending");
      driftBottleReceive.setAttribute("aria-hidden", "true");
    }
  }

  function playDriftBottleReceiveAnimation(onComplete) {
    if (!driftBottleReceive || !driftBottleReceiveVideo) {
      onComplete();
      return;
    }

    if (playDriftBottleReceiveAnimation.isPlaying) {
      return;
    }

    playDriftBottleReceiveAnimation.isPlaying = true;

    let isFinished = false;
    let fallbackTimer = null;

    const finish = () => {
      if (isFinished) {
        return;
      }

      isFinished = true;
      window.clearTimeout(fallbackTimer);
      driftBottleReceiveVideo.removeEventListener("ended", finish);
      driftBottleReceiveVideo.removeEventListener("error", finish);
      playDriftBottleReceiveAnimation.isPlaying = false;
      driftBottleReceive.classList.add("is-ending");
      window.setTimeout(() => {
        stopDriftBottleReceiveAnimation();
        onComplete();
      }, 320);
    };

    driftBottleReceive.hidden = false;
    driftBottleReceive.classList.remove("is-ending");
    driftBottleReceive.classList.add("is-active");
    driftBottleReceive.setAttribute("aria-hidden", "false");

    driftBottleReceiveVideo.removeEventListener("ended", finish);
    driftBottleReceiveVideo.removeEventListener("error", finish);
    driftBottleReceiveVideo.addEventListener("ended", finish, { once: true });
    driftBottleReceiveVideo.addEventListener("error", finish, { once: true });

    try {
      driftBottleReceiveVideo.currentTime = 0;
      const playPromise = driftBottleReceiveVideo.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(finish);
      }
    } catch (error) {
      finish();
    }

    fallbackTimer = window.setTimeout(finish, 12000);
  }

  function openDriftBottleMessage() {
    if (!openDriftBottleMessage.current || !driftBottleModal) {
      return;
    }

    if (driftBottleModal.classList.contains("is-active") || playDriftBottleReceiveAnimation.isPlaying) {
      return;
    }

    openDriftBottleMessage.lastFocus = document.activeElement;
    letterOpenSource = "driftBottle";
    hideDriftBottleArrival();
    markDriftBottleSeen();
    playDriftBottleReceiveAnimation(showDriftBottleMessageModal);
  }

  function closeDriftBottleMessage() {
    if (!driftBottleModal) {
      return;
    }

    const wasActive = driftBottleModal.classList.contains("is-active");
    const wasClosing = driftBottleModal.classList.contains("is-closing");
    if (!wasActive && !wasClosing) {
      return;
    }

    window.clearTimeout(driftBottleModalCloseTimer);
    const shouldStartDriftReaction = wasActive && letterOpenSource === "driftBottle";
    letterOpenSource = null;
    driftBottleModal.classList.remove("is-active");
    driftBottleModal.classList.add("is-closing");
    driftBottleModal.setAttribute("aria-hidden", "true");

    driftBottleModalCloseTimer = window.setTimeout(() => {
      driftBottleModal.classList.remove("is-closing");
      driftBottleModal.hidden = true;
      setDriftBottleBackgroundInteractivity(false);

      if (wasActive && openDriftBottleMessage.lastFocus && typeof openDriftBottleMessage.lastFocus.focus === "function") {
        openDriftBottleMessage.lastFocus.focus();
      }

      if (shouldStartDriftReaction) {
        startLillActionReaction("漂着ボトルメールを見たあと");
      }
    }, driftBottleModalCloseDuration);
  }

  function showDriftBottleArrival(message) {
    if (!driftBottleArrival || !driftBottleButton || !message) {
      return;
    }

    openDriftBottleMessage.current = message;
    rememberDriftBottleId(message.id);
    driftBottleArrival.hidden = false;
    driftBottleArrival.classList.remove("is-dismissed");
    driftBottleArrival.classList.add("is-visible");
    driftBottleButton.removeAttribute("tabindex");
    playDriftBottleArrivalSe();
    showLilDriftBottleArrivalMessage();
  }

  function setHokkoriEmptyState(isEmpty) {
    if (hokkoriBoardEmpty) {
      hokkoriBoardEmpty.hidden = !isEmpty;
    }

    if (hokkoriBoardLetters) {
      hokkoriBoardLetters.hidden = isEmpty;
    }
  }

  function createHokkoriLetterButton(item, index) {
    const button = document.createElement("button");
    const handwritingClass = `handwriting-${normalizeDriftBottleHandwritingTemplate(item.handwritingTemplate)}`;
    button.type = "button";
    button.className = `hokkori-letter hokkori-letter--${index + 1} ${handwritingClass}`;
    button.setAttribute("aria-label", `${item.displayName || "おさんぽさん"}さんの今日のほっこりを読む`);

    const body = document.createElement("span");
    body.className = "hokkori-letter__body";
    body.textContent = item.preview || item.text;

    const sender = document.createElement("span");
    sender.className = "hokkori-letter__sender";
    sender.textContent = `${item.displayName || "おさんぽさん"}より`;

    button.append(body, sender);
    button.addEventListener("click", () => openHokkoriBottleMessage(item, button));
    return button;
  }

  function renderRandomHokkoriFairies(container, variant = "board") {
    if (!container || !hokkoriFairies.length) {
      return;
    }

    const count = Math.min(Math.random() < 0.5 ? 1 : 2, hokkoriFairies.length);
    const selected = [...hokkoriFairies].sort(() => Math.random() - 0.5).slice(0, count);
    container.textContent = "";

    selected.forEach((fairy, index) => {
      const image = document.createElement("img");
      image.className = `hokkori-fairy hokkori-fairy--${variant}-${index + 1}`;
      image.src = fairy.src;
      image.alt = "";
      image.loading = "lazy";
      container.appendChild(image);
    });
  }

  function createWishHokkoriStarButton(item, index) {
    const button = document.createElement("button");
    const displayName = String(item.displayName || "おさんぽさん").trim() || "おさんぽさん";
    const text = String(item.text || "").trim();
    const preview = Array.from(text).length > 24 ? `${Array.from(text).slice(0, 24).join("")}…` : text;

    button.type = "button";
    button.className = `wish-hokkori-star wish-hokkori-star--${index + 1}`;
    button.setAttribute("aria-label", `${displayName}の願いごとを読む`);

    const name = document.createElement("span");
    name.className = "wish-hokkori-star__name";
    name.textContent = displayName;

    const body = document.createElement("span");
    body.className = "wish-hokkori-star__body";
    body.textContent = preview;

    button.append(name, body);
    button.addEventListener("click", () => openHokkoriBottleMessage(item, button));
    return button;
  }

  async function renderWishHokkoriStars(targetDate) {
    if (!wishHokkoriStars) {
      return;
    }

    wishHokkoriStars.textContent = "";

    const messages = pickDailyWishHokkoriMessages(await loadWishHokkoriMessages(), targetDate || new Date());
    messages.forEach((message, index) => {
      wishHokkoriStars.appendChild(createWishHokkoriStarButton(message, index));
    });
  }

  async function renderTodayHokkoriBoard(targetDate) {
    if (!hokkoriBoardLetters || !bottleHokkoriView) {
      return null;
    }

    if (!window.TeaMerryTodayHokkori || typeof window.TeaMerryTodayHokkori.getTodayHokkori !== "function") {
      console.error("[TeaMerry Observatory] Today hokkori selector is not loaded.");
      setHokkoriEmptyState(true);
      return null;
    }

    const rawMessages = await loadDriftBottleRawMessages();

    try {
      const result = window.TeaMerryTodayHokkori.getTodayHokkori(rawMessages, targetDate || new Date());
      hokkoriBoardLetters.textContent = "";
      result.items.forEach((item, index) => {
        hokkoriBoardLetters.appendChild(createHokkoriLetterButton(item, index));
      });
      renderRandomHokkoriFairies(hokkoriBoardCharacters, "board");
      setHokkoriEmptyState(!result.items.length);
      renderTodayHokkoriBoard.latest = result;
      return result;
    } catch (error) {
      console.error("[TeaMerry Observatory] Today hokkori render failed:", error);
      hokkoriBoardLetters.textContent = "";
      setHokkoriEmptyState(true);
      return null;
    }
  }

  async function scheduleDriftBottleArrival() {
    if (isNight || !driftBottleArrival || !driftBottleButton) {
      return;
    }

    try {
      if (window.sessionStorage.getItem(driftBottleSeenKey) === "true") {
        return;
      }
    } catch (error) {
      // Session memory is optional.
    }

    const forceArrival = new URLSearchParams(window.location.search).get("driftBottle") === "1";
    if (!forceArrival && Math.random() >= driftBottleArrivalChance) {
      return;
    }

    const delay = forceArrival ? 800 : 3000 + Math.floor(Math.random() * 3000);
    window.setTimeout(async () => {
      if (views.some((view) => view.classList.contains("is-active"))) {
        return;
      }

      const message = await pickDriftBottleMessage();
      showDriftBottleArrival(message);
    }, delay);
  }

  window.TeaMerryObservatoryDriftBottle = {
    loadDriftBottleMessages,
    pickDriftBottleMessage,
    showDriftBottleArrival,
    hideDriftBottleArrival,
    openDriftBottleMessage,
    openHokkoriBottleMessage,
    renderTodayHokkoriBoard,
  };

  window.setTimeout(async () => {
    const text = await pickDialogueEngineForestWhisper();

    if (text) {
      showForestWhisper(text);
    } else {
      showForestWhisper(getFallbackWhisper());
    }
  }, 900);

  function getObservatoryDisplayName() {
    let displayName = (
      window.TeaMerryForestName &&
      typeof window.TeaMerryForestName.getDisplayName === "function" &&
      window.TeaMerryForestName.getDisplayName()
    ) || "おさんぽさん";

    try {
      if (!window.localStorage.getItem(TM_DISPLAY_NAME_KEY) && displayName === "さんぽさん") {
        displayName = "おさんぽさん";
      }
    } catch (error) {
      displayName = displayName || "おさんぽさん";
    }

    return displayName || "おさんぽさん";
  }

  [bottleWriterName, wishWriterName].forEach((element) => {
    if (element) {
      element.textContent = getObservatoryDisplayName();
    }
  });

  function showView(targetView) {
    views.forEach((view) => {
      const isActive = view === targetView;
      view.classList.toggle("is-active", isActive);
      view.setAttribute("aria-hidden", String(!isActive));
    });

    const textInput = targetView && targetView.querySelector(".observatory-view__text");
    if (textInput) {
      textInput.focus();
    }

    if (targetView === bottleHokkoriView) {
      const hokkoriDate = new URLSearchParams(window.location.search).get("hokkoriDate");
      renderTodayHokkoriBoard(hokkoriDate ? new Date(`${hokkoriDate}T12:00:00+09:00`) : undefined);
    } else if (targetView === wishHokkoriView) {
      renderWishHokkoriStars();
      renderRandomHokkoriFairies(wishHokkoriCharacters, "wish");
    }
  }

  function isAnyViewActive() {
    return views.some((view) => view.classList.contains("is-active"))
      || (driftBottleModal && driftBottleModal.classList.contains("is-active"));
  }

  function isHokkoriBackgroundClick() {
    return false;
  }
  function openCurrentHokkoriView() {
    showView(bottleHokkoriView);
    renderHokkoriView(bottleHokkoriView, "bottle");
  }

  function setVideoReturnFocus(element) {
    observatoryVideoReturnFocus = element || null;
  }

  function restoreVideoReturnFocus() {
    if (!observatoryVideoReturnFocus || !observatoryVideoReturnFocus.isConnected) {
      observatoryVideoReturnFocus = null;
      return;
    }

    try {
      observatoryVideoReturnFocus.focus({ preventScroll: true });
    } catch (error) {
      observatoryVideoReturnFocus.focus();
    }

    observatoryVideoReturnFocus = null;
  }

  function scheduleVideoFallback(duration = 16000) {
    window.clearTimeout(observatoryVideoFallbackTimer);
    observatoryVideoFallbackTimer = window.setTimeout(() => {
      closeViews();
      consumePendingLillActionReaction();
    }, duration);
  }

  function getJstDateKey() {
    const formatter = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    return formatter.format(new Date()).replace(/\//g, "-");
  }

  function hashString(value = "") {
    let hash = 2166136261;
    const source = String(value);

    for (let index = 0; index < source.length; index += 1) {
      hash ^= source.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
  }

  function pickSeededItems(items, count, seedKey) {
    return [...items]
      .map((item) => ({
        item,
        score: hashString(`${seedKey}:${item.id || item.text}`),
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, count)
      .map((entry) => entry.item);
  }

  function readLocalHokkoriMessages(key) {
    try {
      return JSON.parse(window.localStorage.getItem(key) || "[]")
        .filter((message) => message && message.public !== false && String(message.text || "").trim())
        .map((message, index) => ({
          id: `local-${key}-${message.createdAt || index}`,
          displayName: String(message.displayName || message.sender || message.writer || "おさんぽさん").trim() || "おさんぽさん",
          text: String(message.text || "").trim(),
          category: key.includes("Wish") ? "願い" : "ボトルメール",
          todayHokkori: true,
          enabled: true,
        }));
    } catch (error) {
      return [];
    }
  }

  async function loadTodayHokkoriMessages(type) {
    const localKey = type === "wish" ? "teaMerryWishMessages" : "teaMerryBottleMessages";
    const localMessages = readLocalHokkoriMessages(localKey);

    try {
      const response = await fetch(driftBottleJsonPath);
      if (!response.ok) {
        throw new Error(`Hokkori JSON load failed: ${response.status}`);
      }

      const data = await response.json();
      const messages = Array.isArray(data && data.messages) ? data.messages : [];
      const filteredMessages = messages
        .filter((message) => message && message.enabled !== false && String(message.text || "").trim())
        .filter((message) => {
          if (type === "wish") {
            return message.category === "願い" || message.hokkoriSlot === "願い";
          }

          return message.todayHokkori === true && message.category !== "願い";
        });

      return [...localMessages, ...filteredMessages].map((message) => ({
        id: String(message.id || message.text || ""),
        displayName: String(message.displayName || "おさんぽさん").trim() || "おさんぽさん",
        text: String(message.text || "").trim(),
        category: String(message.category || "").trim(),
      }));
    } catch (error) {
      console.warn("[TeaMerry Observatory] Today hokkori messages failed:", error);
      return localMessages;
    }
  }

  function openHokkoriDetail(message, type) {
    const modal = document.createElement("div");
    modal.className = "hokkori-detail-modal is-active";
    modal.setAttribute("role", "presentation");
    modal.innerHTML = `
      <div class="hokkori-detail-dialog" role="dialog" aria-modal="true" tabindex="-1">
        <p class="hokkori-detail-title">${type === "wish" ? "今日の願い星" : "今日のほっこり"}</p>
        <p class="hokkori-detail-sender"></p>
        <p class="hokkori-detail-body"></p>
        <button type="button" class="hokkori-detail-close">閉じる</button>
      </div>
    `;

    modal.querySelector(".hokkori-detail-sender").textContent = message.displayName || "おさんぽさん";
    modal.querySelector(".hokkori-detail-body").textContent = message.text;

    const closeModal = () => modal.remove();
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
    modal.querySelector(".hokkori-detail-close").addEventListener("click", closeModal);
    document.body.appendChild(modal);
    modal.querySelector(".hokkori-detail-dialog").focus();
  }

  async function renderHokkoriView(view, type) {
    if (!view) {
      return;
    }

    let board = view.querySelector(".hokkori-board");
    if (!board) {
      board = document.createElement("div");
      board.className = "hokkori-board";
      view.appendChild(board);
    }

    board.textContent = "読み込み中...";
    const messages = await loadTodayHokkoriMessages(type);
    const selectedMessages = pickSeededItems(messages, 3, `${type}-${getJstDateKey()}`);
    board.textContent = "";

    if (!selectedMessages.length) {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "hokkori-empty";
      emptyMessage.textContent = "今日のほっこりは、まだ届いていません。";
      board.appendChild(emptyMessage);
      return;
    }

    selectedMessages.forEach((message, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `hokkori-card hokkori-card--${type}`;
      button.setAttribute("aria-label", `${type === "wish" ? "願い星" : "手紙"}${index + 1}を開く`);
      button.innerHTML = `
        <span class="hokkori-card__marker" aria-hidden="true"></span>
        <span class="hokkori-card__sender"></span>
        <span class="hokkori-card__text"></span>
      `;
      button.querySelector(".hokkori-card__sender").textContent = message.displayName || "おさんぽさん";
      button.querySelector(".hokkori-card__text").textContent = message.text;
      button.addEventListener("click", () => openHokkoriDetail(message, type));
      board.appendChild(button);
    });
  }

  function closeViews() {
    window.clearTimeout(observatoryVideoFallbackTimer);
    closeBottlePrivacyModal();
    closeWishPrivacyModal();
    closeDriftBottleMessage();
    stopWishLanternSequence();
    showView(null);
    restoreVideoReturnFocus();
  }

  function openBottlePrivacyModal() {
    if (!bottlePrivacyModal) {
      startBottleFlush();
      return;
    }

    bottlePrivacyModal.classList.add("is-active");
    bottlePrivacyModal.setAttribute("aria-hidden", "false");
  }

  function closeBottlePrivacyModal() {
    if (!bottlePrivacyModal) {
      return;
    }

    bottlePrivacyModal.classList.remove("is-active");
    bottlePrivacyModal.setAttribute("aria-hidden", "true");
  }

  function openWishPrivacyModal() {
    if (!wishPrivacyModal) {
      startWishLanternSequence();
      return;
    }

    wishPrivacyModal.classList.add("is-active");
    wishPrivacyModal.setAttribute("aria-hidden", "false");
  }

  function closeWishPrivacyModal() {
    if (!wishPrivacyModal) {
      return;
    }

    wishPrivacyModal.classList.remove("is-active");
    wishPrivacyModal.setAttribute("aria-hidden", "true");
  }

  function saveBottleMessage(isPublic) {
    const senderName = (bottleWriterName && bottleWriterName.textContent.trim()) || "おさんぽさん";
    const entry = {
      text: bottleMessageInput ? bottleMessageInput.value : "",
      public: isPublic,
      writer: senderName,
      sender: senderName,
      author: senderName,
      displayName: senderName,
      createdAt: new Date().toISOString(),
    };

    try {
      const key = "teaMerryBottleMessages";
      const messages = JSON.parse(window.localStorage.getItem(key) || "[]").map((message) => {
        const existingSender = message.sender || message.writer || message.author || message.displayName || "おさんぽさん";
        return {
          ...message,
          writer: message.writer || existingSender,
          sender: message.sender || existingSender,
          author: message.author || existingSender,
          displayName: message.displayName || existingSender,
        };
      });
      messages.push(entry);
      window.localStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      window.TeaMerryLastBottleMessage = entry;
    }
  }

  function resetBottleMessageInput() {
    if (!bottleMessageInput) {
      return;
    }

    bottleMessageInput.value = "";
    updateCounter(bottleMessageInput);
    hideBottleLimitMessage();
  }

  function saveWishMessage(isPublic) {
    const senderName = (wishWriterName && wishWriterName.textContent.trim()) || "おさんぽさん";
    const entry = {
      text: wishMessageInput ? wishMessageInput.value : "",
      public: isPublic,
      writer: senderName,
      sender: senderName,
      author: senderName,
      displayName: senderName,
      createdAt: new Date().toISOString(),
    };

    try {
      const key = "teaMerryWishMessages";
      const messages = JSON.parse(window.localStorage.getItem(key) || "[]").map((message) => {
        const existingSender = message.sender || message.writer || message.author || message.displayName || "おさんぽさん";
        return {
          ...message,
          writer: message.writer || existingSender,
          sender: message.sender || existingSender,
          author: message.author || existingSender,
          displayName: message.displayName || existingSender,
        };
      });
      messages.push(entry);
      window.localStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      window.TeaMerryLastWishMessage = entry;
    }
  }

  function resetWishMessageInput() {
    if (!wishMessageInput) {
      return;
    }

    wishMessageInput.value = "";
    updateCounter(wishMessageInput);
  }

  function showBottleLimitMessage() {
    if (!bottleLimitMessage) {
      return;
    }

    bottleLimitMessage.textContent = bottleLimitText;
    bottleLimitMessage.classList.add("is-visible");
    window.clearTimeout(showBottleLimitMessage.timer);
    showBottleLimitMessage.timer = window.setTimeout(hideBottleLimitMessage, 5200);
  }

  function hideBottleLimitMessage() {
    if (!bottleLimitMessage) {
      return;
    }

    bottleLimitMessage.classList.remove("is-visible");
  }

  function getNextBottleValue(input, insertedText) {
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || start;
    return `${input.value.slice(0, start)}${insertedText}${input.value.slice(end)}`;
  }

  function enforceBottleLimit(event) {
    if (!bottleMessageInput || event.target !== bottleMessageInput) {
      return;
    }

    const maxLength = Number(bottleMessageInput.maxLength) || 100;
    const insertedText = event.data || "";
    if (!insertedText || getNextBottleValue(bottleMessageInput, insertedText).length <= maxLength) {
      return;
    }

    event.preventDefault();
    showBottleLimitMessage();
  }

  function enforceBottlePasteLimit(event) {
    if (!bottleMessageInput || event.target !== bottleMessageInput) {
      return;
    }

    const pastedText = event.clipboardData && event.clipboardData.getData("text");
    if (!pastedText) {
      return;
    }

    const maxLength = Number(bottleMessageInput.maxLength) || 100;
    const nextValue = getNextBottleValue(bottleMessageInput, pastedText);
    if (nextValue.length <= maxLength) {
      return;
    }

    event.preventDefault();
    const start = bottleMessageInput.selectionStart || 0;
    const end = bottleMessageInput.selectionEnd || start;
    const availableLength = Math.max(0, maxLength - (bottleMessageInput.value.length - (end - start)));
    const clippedText = pastedText.slice(0, availableLength);
    bottleMessageInput.value = `${bottleMessageInput.value.slice(0, start)}${clippedText}${bottleMessageInput.value.slice(end)}`;
    bottleMessageInput.setSelectionRange(start + clippedText.length, start + clippedText.length);
    updateCounter(bottleMessageInput);
    showBottleLimitMessage();
  }

  function startBottleFlush() {
    closeBottlePrivacyModal();
    queueLillActionReaction("ボトルメールを出したあと");
    setVideoReturnFocus(bottleMailButton);
    showView(bottleFlushView);

    if (!bottleFlushVideo) {
      closeViews();
      consumePendingLillActionReaction();
      return;
    }

    bottleFlushVideo.currentTime = 0;
    const playPromise = bottleFlushVideo.play();
    if (playPromise) {
      playPromise.catch(() => {
        closeViews();
        consumePendingLillActionReaction();
      });
    }
    scheduleVideoFallback();
  }

  function stopWishLanternSequence() {
    window.clearTimeout(startWishLanternSequence.timer);
    window.clearTimeout(startWishLanternSequence.videoTimer);
    window.clearInterval(startWishLanternSequence.mouthTimer);

    const scene = wishLanternView && wishLanternView.querySelector(".wish-lantern-scene");
    const liluImage = wishLanternView && wishLanternView.querySelector(".wish-lantern-lilu");
    if (scene) {
      scene.classList.remove("is-speaking", "is-pausing", "is-playing");
    }

    if (liluImage) {
      liluImage.src = wishLanternLiluFrames[0];
    }

    if (wishLanternVideo) {
      wishLanternVideo.pause();
      wishLanternVideo.currentTime = 0;
    }
  }

  function pickWishLanternType() {
    const totalWeight = wishLanternTypes.reduce((sum, lantern) => sum + lantern.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const lantern of wishLanternTypes) {
      roll -= lantern.weight;
      if (roll <= 0) {
        return lantern;
      }
    }

    return wishLanternTypes[0];
  }

  function startWishLanternSequence() {
    closeWishPrivacyModal();
    queueLillActionReaction("願い星を飛ばしたあと");
    setVideoReturnFocus(wishStarButton);
    showView(wishLanternView);
    stopWishLanternSequence();

    const scene = wishLanternView && wishLanternView.querySelector(".wish-lantern-scene");
    const liluImage = wishLanternView && wishLanternView.querySelector(".wish-lantern-lilu");
    const lanternItem = wishLanternView && wishLanternView.querySelector(".wish-lantern-item");
    const lanternMessage = document.getElementById("wishLanternMessage");
    const lantern = pickWishLanternType();

    if (lanternItem) {
      lanternItem.src = lantern.src;
    }

    if (lanternMessage) {
      lanternMessage.innerHTML = lantern.message;
    }

    if (scene) {
      scene.classList.add("is-speaking");
    }

    if (liluImage) {
      let frameIndex = 0;
      liluImage.src = wishLanternLiluFrames[frameIndex];
      startWishLanternSequence.mouthTimer = window.setInterval(() => {
        frameIndex = (frameIndex + 1) % wishLanternLiluFrames.length;
        liluImage.src = wishLanternLiluFrames[frameIndex];
      }, 260);
    }

    startWishLanternSequence.timer = window.setTimeout(() => {
      window.clearInterval(startWishLanternSequence.mouthTimer);

      if (liluImage) {
        liluImage.src = "./assets/images/lilu/present/lilu_full_present_mouth_smaile.webp";
      }

      if (scene) {
        scene.classList.remove("is-speaking");
        scene.classList.add("is-pausing");
      }

      startWishLanternSequence.videoTimer = window.setTimeout(() => {
        if (scene) {
          scene.classList.remove("is-pausing");
          scene.classList.add("is-playing");
        }

        if (!wishLanternVideo) {
          return;
        }

        wishLanternVideo.currentTime = 0;
        const playPromise = wishLanternVideo.play();
        if (playPromise) {
          playPromise.catch(() => {
            closeViews();
            consumePendingLillActionReaction();
          });
        }
        scheduleVideoFallback();
      }, wishLanternPauseDuration);
    }, wishLanternTalkDuration);
  }

  function updateCounter(input) {
    const counter = document.querySelector(`[data-counter-for="${input.id}"]`);
    if (!counter) {
      return;
    }

    counter.textContent = `${input.value.length}/${input.maxLength}`;
  }

  document.querySelectorAll(".observatory-view__text").forEach((input) => {
    updateCounter(input);
    input.addEventListener("input", () => updateCounter(input));
  });

  if (bottleMessageInput) {
    bottleMessageInput.addEventListener("beforeinput", enforceBottleLimit);
    bottleMessageInput.addEventListener("paste", enforceBottlePasteLimit);
    bottleMessageInput.addEventListener("input", () => {
      if (bottleMessageInput.value.length < bottleMessageInput.maxLength) {
        hideBottleLimitMessage();
      }
    });
  }

  if (bottleMailButton) {
    bottleMailButton.addEventListener("click", () => showView(bottleWriteView));
  }

  [hokkoriButton, hokkoriNightButton].forEach((button) => {
    if (button) {
      button.addEventListener("click", () => openCurrentHokkoriView());
    }
  });

  if (observatoryStage) {
    observatoryStage.addEventListener("click", (event) => {
      if (isHokkoriBackgroundClick(event)) {
        openCurrentHokkoriView();
      }
    });
  }

  if (wishStarButton) {
    wishStarButton.addEventListener("click", () => showView(wishWriteView));
  }

  if (bottleHokkoriButton) {
    bottleHokkoriButton.addEventListener("click", () => {
      showView(bottleHokkoriView);
      renderHokkoriView(bottleHokkoriView, "bottle");
    });
  }

  if (wishHokkoriButton) {
    wishHokkoriButton.addEventListener("click", () => {
      showView(bottleHokkoriView);
      renderHokkoriView(bottleHokkoriView, "bottle");
    });
  }

  if (driftBottleButton) {
    driftBottleButton.addEventListener("click", openDriftBottleMessage);
  }

  [fairyImage, fairyBalloon].forEach((element) => {
    if (element) {
      element.addEventListener("click", advanceLillActionReaction);
    }
  });

  if (driftBottleClose) {
    driftBottleClose.addEventListener("click", closeDriftBottleMessage);
  }

  if (driftBottleModal) {
    driftBottleModal.addEventListener("click", (event) => {
      if (!event.target.closest(".drift-bottle-letter-paper")) {
        closeDriftBottleMessage();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && driftBottleModal && driftBottleModal.classList.contains("is-active")) {
      closeDriftBottleMessage();
    }
  });

  document.querySelectorAll("[data-observatory-back]").forEach((button) => {
    button.addEventListener("click", closeViews);
  });

  document.querySelectorAll("[data-bottle-flush]").forEach((button) => {
    button.addEventListener("click", openBottlePrivacyModal);
  });

  document.querySelectorAll("[data-bottle-public]").forEach((button) => {
    button.addEventListener("click", () => {
      const isPublic = button.dataset.bottlePublic === "true";
      saveBottleMessage(isPublic);
      showEventReaction({
        event: "bottle_mail_sent",
        public: String(isPublic)
      });
      resetBottleMessageInput();
      startBottleFlush();
    });
  });

  document.querySelectorAll("[data-wish-lantern]").forEach((button) => {
    button.addEventListener("click", openWishPrivacyModal);
  });

  document.querySelectorAll("[data-wish-public]").forEach((button) => {
    button.addEventListener("click", () => {
      const isPublic = button.dataset.wishPublic === "true";
      saveWishMessage(isPublic);
      showEventReaction({
        event: "wish_star_sent",
        public: String(isPublic)
      });
      resetWishMessageInput();
      startWishLanternSequence();
    });
  });

  document.querySelectorAll("[data-bottle-privacy-cancel]").forEach((button) => {
    button.addEventListener("click", closeBottlePrivacyModal);
  });

  document.querySelectorAll("[data-wish-privacy-cancel]").forEach((button) => {
    button.addEventListener("click", closeWishPrivacyModal);
  });

  if (bottleFlushVideo) {
    bottleFlushVideo.addEventListener("ended", () => {
      closeViews();
      consumePendingLillActionReaction();
    });
    bottleFlushVideo.addEventListener("error", () => {
      closeViews();
      consumePendingLillActionReaction();
    });
  }

  if (wishLanternVideo) {
    wishLanternVideo.addEventListener("ended", () => {
      closeViews();
      consumePendingLillActionReaction();
    });
    wishLanternVideo.addEventListener("error", () => {
      closeViews();
      consumePendingLillActionReaction();
    });
  }

  renderRandomHokkoriFairies(wishHokkoriCharacters, "wish");
  renderWishHokkoriStars();

  const initialViewParams = new URLSearchParams(window.location.search);
  if (initialViewParams.get("wish") === "1") {
    showView(wishWriteView);
  } else if (initialViewParams.get("bottle") === "1") {
    showView(bottleWriteView);
  } else if (initialViewParams.get("hokkori") === "1") {
    showView(bottleHokkoriView);
    renderHokkoriView(bottleHokkoriView, "bottle");
  }

  scheduleDriftBottleArrival();
});
