const TM_DISPLAY_NAME_KEY = "teaMerryDisplayName";

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
  const views = [bottleWriteView, wishWriteView, bottleHokkoriView, wishHokkoriView, wishLanternView, bottleFlushView].filter(Boolean);
  const bottleLimitText = "🍃 ボトルに入るお手紙は100文字まで。少しだけ短くして、もう一度届けてみてくださいね。";

  updateWriterNames();

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
        "あれ？ なにか届いてるよ。",
        "風が瓶を運んできたみたい。",
        "小さな便り、読んでみる？"
      ],
      nightMessages: [
        "星が少し増えた気がする。",
        "今日は空がよく見えるね。",
        "願いごと、そっと書いてみる？"
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

  const selectedFairy = fairies[Math.floor(Math.random() * fairies.length)];
  const messages = isNight ? selectedFairy.nightMessages : selectedFairy.dayMessages;
  const selectedMessage = messages[Math.floor(Math.random() * messages.length)];
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
  fairyBalloon.textContent = selectedMessage;

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

  window.setTimeout(() => {
    const whisper = forestWhispers[Math.floor(Math.random() * forestWhispers.length)];
    showForestWhisper(whisper);
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

    const scene = wishLanternView && wishLanternView.querySelector(".wish-lantern-scene");
    if (scene) {
      scene.classList.remove("is-playing");
    }

    if (wishLanternVideo) {
      wishLanternVideo.pause();
      wishLanternVideo.currentTime = 0;
    }
  }

  function startWishLanternSequence() {
    closeWishPrivacyModal();
    showView(wishLanternView);
    stopWishLanternSequence();

    startWishLanternSequence.timer = window.setTimeout(() => {
      const scene = wishLanternView && wishLanternView.querySelector(".wish-lantern-scene");
      if (scene) {
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
    }, 3000);
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

  document.querySelectorAll("[data-observatory-back]").forEach((button) => {
    button.addEventListener("click", closeViews);
  });

  document.querySelectorAll("[data-bottle-flush]").forEach((button) => {
    button.addEventListener("click", openBottlePrivacyModal);
  });

  document.querySelectorAll("[data-bottle-public]").forEach((button) => {
    button.addEventListener("click", () => {
      saveBottleMessage(button.dataset.bottlePublic === "true");
      resetBottleMessageInput();
      startBottleFlush();
    });
  });

  document.querySelectorAll("[data-wish-lantern]").forEach((button) => {
    button.addEventListener("click", openWishPrivacyModal);
  });

  document.querySelectorAll("[data-wish-public]").forEach((button) => {
    button.addEventListener("click", () => {
      saveWishMessage(button.dataset.wishPublic === "true");
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
});
