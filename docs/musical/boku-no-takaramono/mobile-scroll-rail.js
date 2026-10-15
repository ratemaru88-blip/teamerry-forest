(() => {
  "use strict";
  const viewport = document.getElementById("viewport");
  const content = document.getElementById("content");
  if (!viewport || !content) return;
  const mobile = matchMedia("(max-width: 720px)");
  const rail = document.createElement("div");
  rail.className = "musical-scroll-rail";
  rail.hidden = true;
  rail.tabIndex = 0;
  rail.setAttribute("role", "scrollbar");
  rail.setAttribute("aria-label", "ページを縦にスクロール");
  rail.setAttribute("aria-orientation", "vertical");
  rail.setAttribute("aria-controls", "viewport");
  rail.setAttribute("aria-valuemin", "0");
  const thumb = document.createElement("span");
  thumb.className = "musical-scroll-rail__thumb";
  thumb.setAttribute("aria-hidden", "true");
  rail.append(thumb);
  document.body.append(rail);
  let drag = null;
  const maximum = () => Math.max(0, viewport.scrollHeight - viewport.clientHeight);
  const enabled = () => mobile.matches && content.dataset.viewport === "mobile" && maximum() > 0;
  const stop = () => {
    const pointerId = drag?.pointerId;
    drag = null;
    rail.classList.remove("is-dragging");
    if (pointerId !== undefined && rail.hasPointerCapture(pointerId)) rail.releasePointerCapture(pointerId);
  };
  function update() {
    rail.hidden = !enabled();
    if (rail.hidden) { stop(); return; }
    const max = maximum(), height = rail.clientHeight;
    const thumbHeight = Math.min(height, Math.max(44, height * viewport.clientHeight / viewport.scrollHeight));
    thumb.style.height = thumbHeight + "px";
    thumb.style.transform = "translateY(" + (height - thumbHeight) * Math.max(0, Math.min(1, viewport.scrollTop / max)) + "px)";
    rail.setAttribute("aria-valuemax", String(max));
    rail.setAttribute("aria-valuenow", String(Math.round(viewport.scrollTop)));
    rail.setAttribute("aria-valuetext", Math.round(viewport.scrollTop / max * 100) + "%");
  }
  rail.addEventListener("pointerdown", event => {
    if (!enabled() || !event.isPrimary || event.button !== 0) return;
    event.preventDefault(); event.stopPropagation();
    update();
    // Preserve the current position even when the track, not the thumb, is touched.
    drag = { pointerId: event.pointerId, y: event.clientY, scrollTop: viewport.scrollTop,
      ratio: maximum() / Math.max(1, rail.clientHeight - thumb.offsetHeight) };
    rail.setPointerCapture(event.pointerId);
    rail.classList.add("is-dragging");
  });
  rail.addEventListener("pointermove", event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    viewport.scrollTop = Math.max(0, Math.min(maximum(), drag.scrollTop + (event.clientY - drag.y) * drag.ratio));
  }, { passive: false });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) rail.addEventListener(type, event => {
    if (drag?.pointerId === event.pointerId) stop();
  });
  rail.addEventListener("keydown", event => {
    if (!enabled()) return;
    const positions = { ArrowDown: viewport.scrollTop + 48, ArrowUp: viewport.scrollTop - 48,
      PageDown: viewport.scrollTop + viewport.clientHeight * .9, PageUp: viewport.scrollTop - viewport.clientHeight * .9,
      Home: 0, End: maximum() };
    if (!(event.key in positions)) return;
    event.preventDefault(); event.stopPropagation();
    stop(); viewport.scrollTop = positions[event.key];
  });
  viewport.addEventListener("scroll", update, { passive: true });
  window.addEventListener("blur", stop);
  window.addEventListener("pagehide", stop);
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
  window.addEventListener("resize", () => { stop(); update(); });
  mobile.addEventListener("change", () => { stop(); update(); });
  new ResizeObserver(update).observe(content);
  new ResizeObserver(update).observe(viewport);
  new MutationObserver(update).observe(content, { attributes: true, attributeFilter: ["data-viewport"] });
  update();
})();
