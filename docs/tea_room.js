document.addEventListener("DOMContentLoaded", () => {
  const BOARD_VERSION = "2026.07.18-01";
  const DATA_URL = `./data/maroudo_board/maroudo_board_current.json?v=${BOARD_VERSION}`;
  const renderer = window.TeaMerryMaroudoBoard;
  const stage = document.querySelector(".tea-notice-board__stage");
  const modal = document.getElementById("teaNoticeModal");
  const dialog = modal?.querySelector(".tea-notice-modal__dialog");
  const closeButton = document.getElementById("teaNoticeModalClose");
  const modalNumber = document.getElementById("teaNoticeModalNumber");
  const modalTitle = document.getElementById("teaNoticeModalTitle");
  const modalImage = document.getElementById("teaNoticeModalImage");
  const modalBody = document.getElementById("teaNoticeModalBody");
  const modeQuery = window.matchMedia ? window.matchMedia(renderer?.VIEWPORT_QUERY || "(max-width: 768px)") : null;
  let boardData = null;
  let lastFocusedNotice = null;

  function renderCurrentBoard() {
    if (!renderer || !stage || !boardData) {
      return;
    }
    renderer.renderBoard(stage, boardData, {
      mode: renderer.getMode(),
      onItemAction: handleBoardAction,
    });
  }

  function handleBoardAction(detail) {
    if (!detail || !detail.item) {
      return;
    }
    if (detail.action === "link" && detail.link) {
      if (detail.openInNewTab) {
        window.open(detail.link, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = detail.link;
      }
      return;
    }
    if (detail.action === "detailImage" && detail.detailImage) {
      openNoticeModal({
        title: detail.item.name || detail.item.alt || "森のお知らせ",
        image: detail.detailImage,
        alt: detail.item.alt || detail.item.name || "",
        body: "",
        imageOnly: true,
      }, document.activeElement);
    }
  }

  function openNoticeModal(notice, trigger) {
    if (!modal || !dialog || !modalNumber || !modalTitle || !modalImage || !modalBody) {
      return;
    }

    lastFocusedNotice = trigger instanceof HTMLElement ? trigger : null;
    modalNumber.textContent = "";
    modalTitle.textContent = notice.title || "";
    modalImage.src = notice.image || "";
    modalImage.alt = notice.alt || notice.title || "";
    modalBody.textContent = notice.body || "";

    dialog.classList.toggle("tea-notice-modal__dialog--image", Boolean(notice.imageOnly));
    modal.classList.add("is-active");
    modal.setAttribute("aria-hidden", "false");
    dialog.setAttribute("aria-modal", "true");
    document.body.classList.add("maroudo-modal-open");
    closeButton?.focus();
  }

  function closeNoticeModal() {
    if (!modal || !dialog) {
      return;
    }

    modal.classList.remove("is-active");
    modal.setAttribute("aria-hidden", "true");
    dialog.setAttribute("aria-modal", "false");
    dialog.classList.remove("tea-notice-modal__dialog--image");
    document.body.classList.remove("maroudo-modal-open");

    if (lastFocusedNotice) {
      lastFocusedNotice.focus();
      lastFocusedNotice = null;
    }
  }

  if (!renderer) {
    console.warn("[TeaMerry] 掲示板レンダラーを読み込めませんでした。");
    return;
  }

  fetch(DATA_URL, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Board data load failed: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      boardData = data;
      renderCurrentBoard();
    })
    .catch((error) => {
      console.warn("[TeaMerry] 掲示板データを読み込めませんでした。", error);
      boardData = {
        meta: {
          displayDate: "",
          boardVersion: "unknown",
          updatedAt: "",
          status: "unknown",
          commit: "",
          summary: "掲示板データを読み込めませんでした",
        },
        canvas: renderer.DEFAULT_CANVAS,
        items: [],
      };
      renderCurrentBoard();
    });

  if (modeQuery) {
    modeQuery.addEventListener("change", renderCurrentBoard);
  }

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
