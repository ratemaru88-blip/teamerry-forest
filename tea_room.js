document.addEventListener("DOMContentLoaded", () => {
  const notices = [
    {
      id: "starwind-terrace",
      number: 1,
      title: "星風テラスのお知らせ",
      summary: "昼はボトルメールを出せるよ。夜は願い星を飛ばせます。",
      body: "星風テラスでは、昼にボトルメール、夜に願い星を届けられます。森のどこかへ届く小さな便りを、そっと風に預けてみてください。",
      image: "./assets/images/広告_お知らせ/星風テラス_お知らせ.webp",
      isNew: true,
    },
    {
      id: "wish-lantern",
      number: 2,
      title: "願い星ランタン",
      summary: "木星・水星などのランタンが、ときどき現れます。",
      body: "願い星を書くと、リルがランタンに入れて夜空へ送ります。どのランタンになるかは、その時の星の気分しだいです。",
      image: "./assets/images/ui/observatory_ui.webp",
      isNew: false,
    },
    {
      id: "forest-secrets",
      number: 3,
      title: "森のひみつ",
      summary: "この森は時間や季節によって、少しずつ姿を変えます。",
      body: "朝と夜、霧の日、星が近い日。TeaMerry Forestには、訪れるたびに少し違う気配があります。小さな変化を見つけたら、また掲示板でもお知らせします。",
      image: "./assets/images/tea_room/tea_room_pc_bg.webp",
      isNew: false,
    },
    {
      id: "future-events",
      number: 4,
      title: "今後のイベント予定",
      summary: "丸広場のランタン祭りや、流星群の夜などを準備しています。",
      body: "森のみんなで楽しめる小さな催しを準備中です。ランタン祭り、流星群の夜、季節のお茶会など、決まりしだいここに貼り出します。",
      image: "./assets/images/広告_お知らせ/maroudo_tearoom_notice_board_replaced.png",
      isNew: false,
    },
    {
      id: "in-production",
      number: 5,
      title: "制作中のお知らせ",
      summary: "TeaMerryが制作中のミュージカル『ぼくの宝物』の予告です。",
      body: "TeaMerryが制作中のミュージカル『ぼくの宝物』を少しずつ準備しています。森の中でも、制作の小さな便りをお届けしていきます。",
      image: "./assets/images/ui/maroudo_tearoom_ui.webp",
      isNew: false,
    },
  ];

  const hotspotLayer = document.getElementById("teaNoticeHotspots");
  const modal = document.getElementById("teaNoticeModal");
  const dialog = modal?.querySelector(".tea-notice-modal__dialog");
  const closeButton = document.getElementById("teaNoticeModalClose");
  const modalNumber = document.getElementById("teaNoticeModalNumber");
  const modalTitle = document.getElementById("teaNoticeModalTitle");
  const modalImage = document.getElementById("teaNoticeModalImage");
  const modalBody = document.getElementById("teaNoticeModalBody");
  let lastFocusedNotice = null;

  const hotspotPositions = {
    "starwind-terrace": {
      pc: { x: 7.7, y: 22.6, w: 21.5, h: 26.6 },
      mobile: { x: 14.4, y: 17.1, w: 71.3, h: 10 },
    },
    "wish-lantern": {
      pc: { x: 31.4, y: 22.6, w: 24.1, h: 26.6 },
      mobile: { x: 14.4, y: 29.6, w: 71.3, h: 10 },
    },
    "forest-secrets": {
      pc: { x: 58.3, y: 22.6, w: 28, h: 26.6 },
      mobile: { x: 14.4, y: 42.1, w: 71.3, h: 10 },
    },
    "future-events": {
      pc: { x: 7.7, y: 53, w: 27.3, h: 24.3 },
      mobile: { x: 14.4, y: 54.6, w: 71.3, h: 10 },
    },
    "in-production": {
      pc: { x: 38.1, y: 53, w: 24.7, h: 24.3 },
      mobile: { x: 14.4, y: 67.1, w: 71.3, h: 10 },
    },
  };

  function setPercentStyle(button, name, value) {
    button.style.setProperty(name, `${value}%`);
  }

  function createNoticeButton(notice) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tea-notice-hotspot";
    button.dataset.noticeId = notice.id;
    button.setAttribute("aria-label", `${notice.number}. ${notice.title}の詳細を開く`);
    button.textContent = notice.title;

    const position = hotspotPositions[notice.id];
    if (position) {
      setPercentStyle(button, "--pc-x", position.pc.x);
      setPercentStyle(button, "--pc-y", position.pc.y);
      setPercentStyle(button, "--pc-w", position.pc.w);
      setPercentStyle(button, "--pc-h", position.pc.h);
      setPercentStyle(button, "--mobile-x", position.mobile.x);
      setPercentStyle(button, "--mobile-y", position.mobile.y);
      setPercentStyle(button, "--mobile-w", position.mobile.w);
      setPercentStyle(button, "--mobile-h", position.mobile.h);
    }

    button.addEventListener("click", () => openNoticeModal(notice, button));
    return button;
  }

  function renderNotices() {
    if (hotspotLayer) {
      notices.forEach((notice) => {
        hotspotLayer.appendChild(createNoticeButton(notice));
      });
    }
  }

  function openNoticeModal(notice, trigger) {
    if (!modal || !dialog || !modalNumber || !modalTitle || !modalImage || !modalBody) {
      return;
    }

    lastFocusedNotice = trigger;
    modalNumber.textContent = `${notice.number}`;
    modalTitle.textContent = notice.title;
    modalImage.src = notice.image;
    modalImage.alt = notice.title;
    modalBody.textContent = notice.body;

    modal.classList.add("is-active");
    modal.setAttribute("aria-hidden", "false");
    dialog.setAttribute("aria-modal", "true");
    closeButton?.focus();
  }

  function closeNoticeModal() {
    if (!modal || !dialog) {
      return;
    }

    modal.classList.remove("is-active");
    modal.setAttribute("aria-hidden", "true");
    dialog.setAttribute("aria-modal", "false");

    if (lastFocusedNotice) {
      lastFocusedNotice.focus();
      lastFocusedNotice = null;
    }
  }

  renderNotices();

  closeButton?.addEventListener("click", closeNoticeModal);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeNoticeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal?.classList.contains("is-active")) {
      closeNoticeModal();
    }
  });
});
