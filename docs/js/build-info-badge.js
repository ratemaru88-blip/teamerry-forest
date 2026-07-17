(function () {
  const params = new URLSearchParams(window.location.search);

  if (params.get("debug") !== "1") {
    return;
  }

  const currentScript = document.currentScript;
  const scriptUrl = currentScript ? new URL(currentScript.src, window.location.href) : null;
  const cacheVersion = scriptUrl ? scriptUrl.searchParams.get("v") : "";
  const buildInfoUrl = new URL("./data/build-info.json", window.location.href);

  if (cacheVersion) {
    buildInfoUrl.searchParams.set("v", cacheVersion);
  }

  function createBadge(info) {
    const badge = document.createElement("aside");
    badge.className = "teamerry-build-badge";
    badge.setAttribute("aria-label", "TeaMerry Forest 公開バージョン情報");

    const site = info.site || "TeaMerry Forest";
    const version = info.version || "unknown";
    const commit = info.commit || "unknown";
    const summary = info.summary || "更新内容未設定";

    badge.innerHTML = [
      `<strong>${escapeHtml(site)}</strong>`,
      `<span>公開バージョン ${escapeHtml(version)}</span>`,
      `<span>commit ${escapeHtml(commit)}</span>`,
      `<span>${escapeHtml(summary)}</span>`,
    ].join("");

    const style = document.createElement("style");
    style.textContent = `
      .teamerry-build-badge {
        position: fixed;
        right: max(10px, env(safe-area-inset-right));
        bottom: max(10px, env(safe-area-inset-bottom));
        z-index: 10000;
        box-sizing: border-box;
        display: grid;
        gap: 2px;
        width: min(260px, calc(100vw - 20px));
        padding: 8px 10px;
        border: 1px solid rgba(255, 239, 196, 0.28);
        border-radius: 10px;
        background: rgba(35, 28, 20, 0.74);
        color: rgba(255, 247, 220, 0.92);
        font-family: "Kiwi Maru", "Zen Maru Gothic", system-ui, sans-serif;
        font-size: 11px;
        line-height: 1.45;
        letter-spacing: 0;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.48);
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.28);
        pointer-events: none;
      }

      .teamerry-build-badge strong,
      .teamerry-build-badge span {
        display: block;
        overflow-wrap: anywhere;
      }

      .teamerry-build-badge strong {
        color: #fff4cb;
        font-size: 12px;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(badge);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  fetch(buildInfoUrl.href, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Build info load failed: ${response.status}`);
      }
      return response.json();
    })
    .then(createBadge)
    .catch(() => {
      createBadge({
        site: "TeaMerry Forest",
        version: "unknown",
        commit: "unknown",
        summary: "公開バージョン情報を読み込めませんでした",
      });
    });
})();
