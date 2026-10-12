(() => {
  "use strict";
  const camera = window.TeaMerryForestNavigation;
  if (!camera) return;
  const mobile = matchMedia("(max-width: 759px)");
  const modal = document.getElementById("nameModal");
  const seenKey = "teaMerryMobileNavigationSeenV1";
  const speed = 240; // Screen pixels per second, independent of refresh rate.
  // Lucide Map, X and ChevronUp icons (ISC license).
  const icon = (paths) => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
  const mapIcon = icon('<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/>');
  const chevron = icon('<path d="m18 15-6-6-6 6"/>');
  const closeIcon = icon('<path d="m18 6-12 12M6 6l12 12"/>');
  const overlay = document.createElement("nav");
  overlay.className = "forest-mobile-navigation";
  overlay.setAttribute("aria-label", "森の移動");
  overlay.innerHTML = `<button class="forest-map-button" type="button" title="森の案内図" aria-haspopup="dialog" aria-controls="forestMapDialog">${mapIcon}<span>案内図</span></button>
    <div class="forest-navigation-stick" role="group" tabindex="0" aria-label="森の移動スティック" title="森の移動">
      ${["up", "down", "left", "right"].map(direction => `<span class="forest-stick-direction forest-stick-direction--${direction}" aria-hidden="true">${chevron}</span>`).join("")}
      <span class="forest-stick-knob" aria-hidden="true"></span>
    </div>`;
  document.body.append(overlay);
  const stick = overlay.querySelector(".forest-navigation-stick");
  const mapButton = overlay.querySelector(".forest-map-button");
  const dialog = document.createElement("dialog");
  dialog.id = "forestMapDialog";
  dialog.className = "forest-map-dialog";
  dialog.setAttribute("aria-labelledby", "forestMapTitle");
  dialog.innerHTML = `<header class="forest-map-heading"><h2 id="forestMapTitle">森の案内図</h2><button class="forest-map-close" type="button" title="閉じる" aria-label="閉じる">${closeIcon}</button></header>
    <div class="forest-map-content">
      <figure class="forest-map-overview" aria-label="森の全体地図">
        <img class="forest-map-image" src="./assets/backgrounds/forest-guide-evening.webp" width="960" height="540" loading="lazy" alt="夕日の映る湖と川を囲む森。左に温泉と茶房、右に洞窟と星風のテラスがあります。">
        <div class="forest-map-markers"></div>
      </figure>
      <p class="forest-map-note">時間とともに、森の表情が変わります。</p>
      <div class="forest-map-destinations"></div>
    </div>`;
  const destinations = dialog.querySelector(".forest-map-destinations");
  const markers = dialog.querySelector(".forest-map-markers");
  const numbers = ["①", "②", "③", "④", "⑤", "⑥", "⑦"];
  const mapPortals = [...document.querySelectorAll(".forest-portal, #fixedObservatoryPortal")];
  const updateMarkers = () => {
    const world = document.getElementById("stage");
    mapPortals.forEach((portal, index) => {
      const style = getComputedStyle(portal);
      // The floating observatory link is camera-relative; use its existing world anchor.
      const x = portal.id === "fixedObservatoryPortal" ? 1560 : parseFloat(style.left);
      const y = portal.id === "fixedObservatoryPortal" ? 220 : parseFloat(style.top);
      const marker = markers.children[index];
      marker.style.setProperty("--map-x", `${x / world.offsetWidth * 100}%`);
      marker.style.setProperty("--map-y", `${y / world.offsetHeight * 100}%`);
    });
  };
  // Reuse actual portal URLs and artwork instead of maintaining a second route list.
  for (const [index, portal] of mapPortals.entries()) {
    const link = document.createElement("a");
    link.href = portal.getAttribute("href");
    link.className = "forest-map-card";
    link.dataset.mapNumber = String(index + 1);
    const number = document.createElement("span");
    number.className = "forest-map-number";
    number.textContent = numbers[index];
    link.append(number);
    const image = portal.querySelector("img");
    if (image) {
      const thumbnail = document.createElement("img");
      thumbnail.src = image.getAttribute("src");
      thumbnail.alt = "";
      link.append(thumbnail);
    }
    const label = document.createElement("span");
    label.className = "forest-map-card-name";
    label.textContent = (portal.getAttribute("aria-label") || "森の入口").replace(/へ$/, "");
    if (label.textContent === "フォーチュンクッキー") {
      label.replaceChildren(document.createTextNode("フォーチュン"), document.createElement("wbr"), document.createTextNode("クッキー"));
    }
    link.append(label);
    destinations.append(link);
    const marker = document.createElement("span");
    marker.className = "forest-map-marker";
    marker.dataset.mapNumber = String(index + 1);
    marker.textContent = numbers[index];
    marker.setAttribute("aria-label", `${index + 1} ${label.textContent}`);
    markers.append(marker);
  }
  document.body.append(dialog);
  let pointer = null;
  let frame = 0;
  let lastTime = 0;
  let direction = { x: 0, y: 0 };
  let guideTimer = 0;
  const keys = new Set();
  const blocked = () => !mobile.matches || dialog.open || (modal && !modal.classList.contains("hidden"));
  const stop = () => {
    const previous = pointer;
    pointer = null;
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    direction = { x: 0, y: 0 };
    keys.clear();
    stick.classList.remove("is-active");
    stick.style.removeProperty("--knob-x");
    stick.style.removeProperty("--knob-y");
    if (previous !== null && stick.hasPointerCapture(previous)) stick.releasePointerCapture(previous);
  };
  const tick = (now) => {
    if (blocked()) { stop(); return; }
    const elapsed = lastTime ? Math.min((now - lastTime) / 1000, .05) : 0;
    lastTime = now;
    camera.move(direction.x * speed * elapsed, direction.y * speed * elapsed);
    frame = requestAnimationFrame(tick);
  };
  const start = () => {
    stick.classList.add("is-active");
    if (!frame) frame = requestAnimationFrame(tick);
  };
  const updatePointer = (event) => {
    const rect = stick.getBoundingClientRect();
    const dx = event.clientX - rect.left - rect.width / 2;
    const dy = event.clientY - rect.top - rect.height / 2;
    const distance = Math.hypot(dx, dy);
    const radius = rect.width * .24;
    const ratio = distance ? Math.min(1, radius / distance) : 0;
    stick.style.setProperty("--knob-x", `${dx * ratio}px`);
    stick.style.setProperty("--knob-y", `${dy * ratio}px`);
    direction = distance < rect.width * .1 ? { x: 0, y: 0 } : { x: dx / distance, y: dy / distance };
  };
  stick.addEventListener("pointerdown", event => {
    if (blocked() || pointer !== null || event.button !== 0) return;
    event.preventDefault();
    pointer = event.pointerId;
    keys.clear();
    stick.setPointerCapture(pointer);
    updatePointer(event);
    start();
  });
  stick.addEventListener("pointermove", event => {
    if (event.pointerId === pointer) updatePointer(event);
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
    stick.addEventListener(type, event => { if (event.pointerId === pointer) stop(); });
  }
  const keyboardDirection = () => {
    const x = Number(keys.has("ArrowRight")) - Number(keys.has("ArrowLeft"));
    const y = Number(keys.has("ArrowDown")) - Number(keys.has("ArrowUp"));
    const length = Math.hypot(x, y);
    direction = length ? { x: x / length, y: y / length } : { x: 0, y: 0 };
    stick.style.setProperty("--knob-x", `${direction.x * stick.clientWidth * .24}px`);
    stick.style.setProperty("--knob-y", `${direction.y * stick.clientWidth * .24}px`);
  };
  stick.addEventListener("keydown", event => {
    if (blocked() || pointer !== null || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    keys.add(event.key);
    keyboardDirection();
    start();
  });
  stick.addEventListener("keyup", event => {
    if (!keys.has(event.key)) return;
    event.preventDefault();
    keys.delete(event.key);
    if (!keys.size) stop(); else keyboardDirection();
  });
  stick.addEventListener("blur", stop);
  window.addEventListener("blur", stop);
  window.addEventListener("pagehide", stop);
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
  document.addEventListener("pointerdown", event => {
    if (pointer !== null && !stick.contains(event.target)) stop();
  }, true);
  window.addEventListener("resize", stop);
  mapButton.addEventListener("click", () => {
    if (blocked()) return;
    stop();
    updateMarkers();
    dialog.querySelector(".forest-map-content").scrollTop = 0;
    dialog.showModal();
    overlay.classList.add("is-map-open");
    mapButton.setAttribute("aria-expanded", "true");
  });
  dialog.querySelector(".forest-map-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    overlay.classList.remove("is-map-open");
    mapButton.setAttribute("aria-expanded", "false");
    mapButton.focus();
  });
  dialog.addEventListener("click", event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  let wasNameOpen = modal && !modal.classList.contains("hidden");
  let originalNameCopy = null;
  let mobileNameCopy = "";
  const syncNameCopy = (nameOpen) => {
    const message = document.getElementById("nameModalMessage");
    if (!message) return;
    if (!mobile.matches) {
      if (originalNameCopy !== null && message.textContent === mobileNameCopy) message.innerHTML = originalNameCopy;
      originalNameCopy = null;
      return;
    }
    if (!nameOpen || document.getElementById("forestNameInput")?.hidden) return;
    if (message.textContent !== mobileNameCopy) originalNameCopy = message.innerHTML;
    const story = modal.dataset.storyStep === "name";
    mobileNameCopy = (story ? "じゃあ、この森で呼んでほしい名前を教えてね。" : "この森で呼んでほしい名前を教えてね。")
      + "\nお散歩だけなら、「おさんぽさん」でもだいじょうぶ。\n登録じゃないから、気楽に遊んでいってね。"
      + (story ? "" : "\nまたいつでも、ふらっと来てね。");
    message.textContent = mobileNameCopy;
  };
  const showGuide = () => {
    clearTimeout(guideTimer);
    guideTimer = setTimeout(() => {
      if (blocked()) return;
      document.querySelector(".mobile-walker")?.setAttribute("aria-hidden", "false");
      document.querySelector(".mobile-walker__bubble")?.setAttribute("role", "status");
      camera.showGuide();
      try { localStorage.setItem(seenKey, "1"); } catch { /* Storage may be unavailable. */ }
    }, 500);
  };
  const sync = () => {
    const nameOpen = modal && !modal.classList.contains("hidden");
    syncNameCopy(nameOpen);
    overlay.classList.toggle("is-blocked", Boolean(nameOpen));
    if (nameOpen || !mobile.matches) stop();
    if (!mobile.matches) {
      if (dialog.open) dialog.close();
      document.querySelector(".mobile-walker")?.setAttribute("aria-hidden", "true");
    } else if (!nameOpen) {
      let seen = false;
      try { seen = localStorage.getItem(seenKey) === "1"; } catch { /* Keep the first guide available. */ }
      if (wasNameOpen || !seen) showGuide();
    }
    wasNameOpen = nameOpen;
  };
  if (modal) new MutationObserver(sync).observe(modal, { attributes: true, attributeFilter: ["class", "data-mode", "data-story-step"] });
  mobile.addEventListener("change", sync);
  sync();
})();
