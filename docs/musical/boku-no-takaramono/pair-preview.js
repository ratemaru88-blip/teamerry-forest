(async function () {
  "use strict";
  const stage = document.getElementById("stage");
  const content = document.getElementById("content");
  const viewport = document.getElementById("viewport");
  const forced = new URLSearchParams(location.search).get("view");
  try {
    const response = await fetch("feedback-flow.tbalance", { cache: "no-store" });
    if (!response.ok) throw new Error("検証用ファイルを読み込めません");
    const project = TBalanceRenderer.normalizeProject(await response.json());
    const page = project.pages[0];
    let active;
    function fit() {
      const key = forced === "pc" ? "desktop" : forced === "mobile" ? "mobile" :
        (window.innerWidth <= 720 ? "mobile" : "desktop");
      const changed = active !== key;
      const previousY = changed ? 0 : viewport.scrollTop / (Number(content.dataset.scale) || 1);
      if (changed) {
        active = key;
        TBalanceRenderer.renderPage(stage, page, key, { project, test: true,
          onAction: (layer, event) => {
            event.preventDefault();
            const action = layer.clickAction || {};
            const target = action.target || layer.link;
            if (target === "#musical-feedback") {
              window.TeaMerryMusicalFeedback.open(event.currentTarget);
              return;
            }
            if (target && target !== "#" && ["page", "external"].includes(action.type)) {
              const url = new URL(target, location.href);
              if (action.type === "page" && target === "../../index.html") {
                location.assign(url.href);
                return;
              }
              if (["http:", "https:"].includes(url.protocol)) window.open(url.href, "_blank", "noopener");
            }
          },
        });
      }
      const frame = TBalanceScrollLayout.frameSize(page, key);
      const scale = key === "mobile" ? Math.min(viewport.clientWidth, 390) / frame.width :
        Math.min(viewport.clientWidth / frame.width, viewport.clientHeight / frame.height);
      content.dataset.scale = String(scale);
      content.dataset.viewport = key;
      content.style.width = frame.width * scale + "px";
      content.style.height = page[key].height * scale + "px";
      stage.style.transform = "scale(" + scale + ")";
      viewport.scrollTop = previousY * scale;
    }
    fit();
    window.addEventListener("resize", fit);
    document.documentElement.dataset.ready = "true";
  } catch (error) {
    const message = document.getElementById("error");
    message.hidden = false;
    message.textContent = error.message;
    console.error(error);
  }
})();
