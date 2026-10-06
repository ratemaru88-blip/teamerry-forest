(function () {
  "use strict";
  function mount(node, pair, { enabled = true, radius = 32, eventRoot = null, replaceImages = true, pointerTypes = ["mouse"] } = {}) {
    const old = node.querySelector("[data-scratch]");
    if (old) return old.scratchDispose;
    const canvas = document.createElement("canvas");
    canvas.dataset.scratch = "loading";
    canvas.setAttribute("aria-label", "マウスを動かすと色が現れる画像");
    Object.assign(canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%", pointerEvents: eventRoot ? "none" : enabled ? "auto" : "none", touchAction: "pan-y" });
    node.appendChild(canvas);
    const color = new Image(), mono = new Image();
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let active = true, previous = null;
    const load = image => new Promise((resolve, reject) => { image.onload = resolve; image.onerror = () => reject(new Error("スクラッチ画像を読み込めません")); });
    const ready = Promise.all([load(color), load(mono)]);
    color.src = pair.color; mono.src = pair.mono;
    ready.then(() => {
      if (!active) return;
      if (color.naturalWidth !== mono.naturalWidth || color.naturalHeight !== mono.naturalHeight) throw new Error("カラー／モノクロ画像の寸法が一致しません");
      canvas.width = mono.naturalWidth; canvas.height = mono.naturalHeight;
      // Both layers use exactly the same stretch transform; no independent crop.
      if (replaceImages) node.querySelectorAll("img").forEach(img => { img.src = pair.color; img.style.objectFit = "fill"; });
      ctx.drawImage(mono, 0, 0);
      canvas.dataset.scratch = "ready";
    }).catch(error => { canvas.dataset.scratch = "error"; canvas.setAttribute("aria-label", error.message); console.error(error); });
    function move(event) {
      if (!enabled || canvas.dataset.scratch !== "ready" || !pointerTypes.includes(event.pointerType)) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height || event.clientX < rect.left || event.clientX > rect.right
        || event.clientY < rect.top || event.clientY > rect.bottom) { previous = null; return; }
      const point = { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = radius * 2;
      ctx.beginPath();
      ctx.moveTo(previous?.x ?? point.x, previous?.y ?? point.y);
      ctx.lineTo(point.x, point.y); ctx.stroke();
      ctx.beginPath(); ctx.arc(point.x, point.y, radius, 0, Math.PI * 2); ctx.fill();
      previous = point;
      canvas.dataset.strokes = String(Number(canvas.dataset.strokes || 0) + 1);
    }
    const leave = () => { previous = null; };
    const events = eventRoot || canvas;
    const down = (event) => { previous = null; if (event.pointerType !== "mouse") move(event); };
    events.addEventListener("pointermove", move, { capture: true, passive: true });
    events.addEventListener("pointerdown", down, { capture: true, passive: true });
    events.addEventListener("pointercancel", leave, true);
    events.addEventListener("pointerup", leave, true);
    events.addEventListener("pointerleave", leave);
    const dispose = () => {
      active = false;
      events.removeEventListener("pointermove", move, true);
      events.removeEventListener("pointerdown", down, true);
      events.removeEventListener("pointercancel", leave, true);
      events.removeEventListener("pointerup", leave, true);
      events.removeEventListener("pointerleave", leave);
      canvas.remove();
    };
    canvas.scratchDispose = dispose;
    return dispose;
  }
  const resolvePair = (pair, viewport) => pair.viewports?.[viewport] || pair;
  window.TakaramonoScratch = { mount, resolvePair };
})();
