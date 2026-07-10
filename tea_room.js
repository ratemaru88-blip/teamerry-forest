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

  const grid = document.getElementById("teaNoticeGrid");
  const mobileList = document.getElementById("teaMobileNoticeList");
  const modal = document.getElementById("teaNoticeModal");
  const dialog = modal?.querySelector(".tea-notice-modal__dialog");
  const closeButton = document.getElementById("teaNoticeModalClose");
  const modalNumber = document.getElementById("teaNoticeModalNumber");
  const modalTitle = document.getElementById("teaNoticeModalTitle");
  const modalImage = document.getElementById("teaNoticeModalImage");
  const modalBody = document.getElementById("teaNoticeModalBody");
  let lastFocusedNotice = null;

  function createNoticeButton(notice, variant) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tea-notice-card tea-notice-card--${variant}`;
    button.dataset.noticeId = notice.id;
    button.setAttribute("aria-label", `${notice.number}. ${notice.title}の詳細を開く`);

    button.innerHTML = `
      <span class="tea-notice-card__pin" aria-hidden="true"></span>
      ${notice.isNew ? '<span class="tea-notice-card__new">NEW</span>' : ""}
      <span class="tea-notice-card__number" aria-hidden="true">${notice.number}</span>
      <span class="tea-notice-card__copy">
        <strong>${notice.title}</strong>
        <span>${notice.summary}</span>
      </span>
      <img class="tea-notice-card__image" src="${notice.image}" alt="">
    `;

    button.addEventListener("click", () => openNoticeModal(notice, button));
    return button;
  }

  function renderNotices() {
    if (grid) {
      notices.forEach((notice) => {
        grid.appendChild(createNoticeButton(notice, "board"));
      });
    }

    if (mobileList) {
      notices.forEach((notice) => {
        mobileList.appendChild(createNoticeButton(notice, "mobile"));
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
