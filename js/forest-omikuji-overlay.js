(() => {
  "use strict";
  const desktop = matchMedia("(min-width: 760px)");
  const portal = document.querySelector(".forest-portal--shrine");
  if (!portal) return;
  const dialog = document.createElement("dialog");
  dialog.className = "forest-omikuji-dialog";
  dialog.setAttribute("aria-labelledby", "forestOmikujiTitle");
  dialog.innerHTML = '<header class="forest-omikuji-heading"><span id="forestOmikujiTitle">森のおみくじ</span><button class="forest-omikuji-close" type="button" title="森へ戻る" aria-label="森へ戻る"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m18 6-12 12M6 6l12 12"/></svg></button></header>';
  document.body.append(dialog);
  let frame = null;
  function close() {
    if (frame) {
      // Stop only the embedded omikuji before destroying its document.
      frame.contentWindow?.TeaMerryOmikuji?.stop();
      frame.remove();
      frame = null;
    }
    if (dialog.open) dialog.close();
    const url = new URL(location.href);
    if (url.searchParams.has("omikuji")) {
      url.searchParams.delete("omikuji");
      history.replaceState(null, "", url);
    }
    portal.focus({preventScroll:true});
  }
  function open() {
    if (!desktop.matches || dialog.open) return;
    frame = document.createElement("iframe");
    frame.className = "forest-omikuji-frame";
    frame.title = "森のおみくじ";
    const url = new URL(portal.href);
    url.searchParams.set("embedded", "1");
    frame.src = url.href;
    dialog.append(frame);
    dialog.showModal();
  }
  portal.addEventListener("click", event => {
    if (!desktop.matches || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    open();
  });
  dialog.querySelector("button").addEventListener("click", close);
  dialog.addEventListener("cancel", event => { event.preventDefault(); close(); });
  window.addEventListener("message", event => {
    if (event.origin === location.origin && event.source === frame?.contentWindow
      && event.data?.type === "teamerry:omikuji-close") close();
  });
  desktop.addEventListener("change", () => {
    if (desktop.matches || !dialog.open) return;
    close();
    location.assign(portal.href);
  });
  window.addEventListener("pagehide", () => { frame?.contentWindow?.TeaMerryOmikuji?.stop(); });
  // Direct desktop links return to the real Forest, respecting the existing welcome dialog.
  if (new URLSearchParams(location.search).get("omikuji") === "1") {
    const name = document.getElementById("nameModal");
    const ready = () => {
      if (name && !name.classList.contains("hidden")) return;
      observer?.disconnect();
      open();
    };
    const observer = name ? new MutationObserver(ready) : null;
    observer?.observe(name, {attributes:true, attributeFilter:["class"]});
    ready();
  }
})();
