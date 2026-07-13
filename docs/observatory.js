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
  const fairyImage = document.getElementById("fairyImage");
  const fairyBalloon = document.getElementById("fairyBalloon");
  const forestWhisper = document.getElementById("forestWhisper");
  const forestWhisperText = document.getElementById("forestWhisperText");
  const bottleMailButton = document.getElementById("bottleMailButton");
  const wishStarButton = document.getElementById("wishStarButton");
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
  const driftBottleNotice = document.getElementById("driftBottleNotice");
  const driftBottleModal = document.getElementById("driftBottleModal");
  const driftBottleDialog = driftBottleModal && driftBottleModal.querySelector(".drift-bottle-dialog");
  const driftBottleSender = document.getElementById("driftBottleSender");
  const driftBottleBody = document.getElementById("driftBottleBody");
  const driftBottleClose = document.getElementById("driftBottleClose");
  const views = [bottleWriteView, wishWriteView, bottleHokkoriView, wishHokkoriView, wishLanternView, bottleFlushView].filter(Boolean);
  const bottleLimitText = "🍃 ボトルに入るお手紙は100文字まで。少しだけ短くして、もう一度届けてみてくださいね。";
  const driftBottleJsonPath = "./data/export/drift_bottle_messages.json";
  const driftBottleSeenKey = "teaMerryDriftBottleSeen";
  const driftBottleMessageIdKey = "teaMerryDriftBottleMessageId";
  const driftBottleRecentKey = "teaMerryDriftBottleRecentIds";
  const driftBottleArrivalChance = 0.4;
  const wishLanternTalkDuration = 2800;
  const wishLanternPauseDuration = 350;
  const wishLanternLiluFrames = [
    "./assets/images/lilu/present/lilu_full_present_normal.webp",
    "./assets/images/lilu/present/lilu_full_present_mouth_open.webp",
    "./assets/images/lilu/present/lilu_full_present_mouth_round.webp",
    "./assets/images/lilu/present/lilu_full_present_mouth_smaile.webp",
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

  const fairies = [
    {
      name: "リル",
      image: "./assets/images/observatory/fairies/Lilu_v01.webp",
      alt: "リル",
      dayMessages: [
        "ここでは、ボトルメールを書いて森へ流せるんだよ。"
      ],
      nightMessages: [
        "夜の星風テラスでは、願い星を書いて空へ届けられるんだよ。"
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
    ? "夜の星風テラスでは、願い星を書いて空へ届けられるんだよ。"
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
      fairyBalloon.textContent = dialogueText || selectedMessage;
    } catch (error) {
      console.warn("[TeaMerry Observatory] Dialogue Engine character dialogue failed:", error);
      fairyBalloon.textContent = selectedMessage;
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

  function normalizeDriftBottleMessage(message = {}) {
    return {
      id: String(message.id || "").trim(),
      displayName: String(message.displayName || "おさんぽさん").trim() || "おさんぽさん",
      text: String(message.text || "").trim(),
      enabled: message.enabled === true,
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

    driftBottleArrival.hidden = true;
    driftBottleArrival.classList.remove("is-visible");
  }

  function markDriftBottleSeen() {
    try {
      window.sessionStorage.setItem(driftBottleSeenKey, "true");
    } catch (error) {
      // Session memory is optional.
    }
  }

  function openDriftBottleMessage() {
    if (!openDriftBottleMessage.current || !driftBottleModal) {
      return;
    }

    openDriftBottleMessage.lastFocus = document.activeElement;
    const message = openDriftBottleMessage.current;

    if (driftBottleSender) {
      driftBottleSender.textContent = message.displayName || "おさんぽさん";
    }

    if (driftBottleBody) {
      driftBottleBody.textContent = message.text;
    }

    driftBottleModal.classList.add("is-active");
    driftBottleModal.setAttribute("aria-hidden", "false");
    hideDriftBottleArrival();
    markDriftBottleSeen();
    window.setTimeout(() => {
      if (driftBottleDialog) {
        driftBottleDialog.focus();
      }
    }, 0);
  }

  function closeDriftBottleMessage() {
    if (!driftBottleModal) {
      return;
    }

    const wasActive = driftBottleModal.classList.contains("is-active");
    driftBottleModal.classList.remove("is-active");
    driftBottleModal.setAttribute("aria-hidden", "true");

    if (wasActive && openDriftBottleMessage.lastFocus && typeof openDriftBottleMessage.lastFocus.focus === "function") {
      openDriftBottleMessage.lastFocus.focus();
    }
  }

  function showDriftBottleArrival(message) {
    if (!driftBottleArrival || !driftBottleButton || !message) {
      return;
    }

    openDriftBottleMessage.current = message;
    rememberDriftBottleId(message.id);
    driftBottleArrival.hidden = false;
    driftBottleArrival.classList.add("is-visible");

    if (driftBottleNotice) {
      driftBottleNotice.textContent = "ボトルメールが届いたよ";
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
  }

  function closeViews() {
    closeBottlePrivacyModal();
    closeWishPrivacyModal();
    closeDriftBottleMessage();
    stopWishLanternSequence();
    showView(null);
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
    showView(bottleFlushView);

    if (!bottleFlushVideo) {
      closeViews();
      return;
    }

    bottleFlushVideo.currentTime = 0;
    const playPromise = bottleFlushVideo.play();
    if (playPromise) {
      playPromise.catch(closeViews);
    }
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
          playPromise.catch(() => {});
        }
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

  if (wishStarButton) {
    wishStarButton.addEventListener("click", () => showView(wishWriteView));
  }

  if (driftBottleButton) {
    driftBottleButton.addEventListener("click", openDriftBottleMessage);
  }

  if (driftBottleClose) {
    driftBottleClose.addEventListener("click", closeDriftBottleMessage);
  }

  if (driftBottleModal) {
    driftBottleModal.addEventListener("click", (event) => {
      if (event.target === driftBottleModal) {
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
    bottleFlushVideo.addEventListener("ended", closeViews);
  }

  if (wishLanternVideo) {
    wishLanternVideo.addEventListener("ended", closeViews);
  }

  scheduleDriftBottleArrival();
});
