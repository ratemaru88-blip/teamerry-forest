(() => {
  "use strict";
  class GuideVisit {
    constructor(data, now = 0, previousIdleId = "", platform = "mobile") {
      this.data = data;
      this.platform = platform;
      this.used = new Set();
      this.count = 0;
      this.idleCount = 0;
      this.lastSpeech = -Infinity;
      this.lastInteraction = now;
      this.lastMovement = -Infinity;
      this.walkingMs = 0;
      this.previousIdleId = previousIdleId;
      this.cooldown = data.cooldownMs;
    }
    interact(now) { this.lastInteraction = now; }
    move(now, elapsed = 1000) {
      this.interact(now);
      this.lastMovement = now;
      this.walkingMs += Math.min(1000, Math.max(0, elapsed));
    }
    pause(now) {
      this.lastInteraction = now;
      this.lastMovement = -Infinity;
      if (this.count) this.lastSpeech = now;
    }
    choose(now, { ready = true, moving = false, areas = [] } = {}) {
      if (!ready || this.count >= this.data.maxPerVisit) return null;
      let trigger;
      if (!this.count) { if (moving) return null; trigger = "entry"; }
      else {
        if (now - this.lastSpeech < this.cooldown) return null;
        if (areas.length && now - this.lastInteraction >= 2500 && this.data.dialogue.some(line => line.targetArea && areas.includes(line.targetArea) && !this.used.has(line.id))) trigger = "walking";
        else if (this.walkingMs >= this.data.walkingAfterMs && now - this.lastMovement <= this.data.recentWalkingMs) trigger = "walking";
        else if (!moving && this.idleCount < this.data.idleLimit && now - this.lastInteraction >= this.data.idleAfterMs) trigger = "idle";
        else return null;
      }
      const candidates = this.data.dialogue.filter(line => line.guideCharacterId === this.data.guideCharacterId
        && line.trigger === trigger && !this.used.has(line.id) && (!line.platform || line.platform === this.platform)
        && (!line.targetArea || areas.includes(line.targetArea)));
      candidates.sort((a,b) => {
        if (trigger === "idle") {
          const difference = Number(a.id === this.previousIdleId) - Number(b.id === this.previousIdleId);
          if (difference) return difference;
        }
        return b.priority - a.priority;
      });
      return candidates[0] || null;
    }
    record(line, now) {
      this.used.add(line.id);
      this.count += 1;
      this.lastSpeech = now;
      this.cooldown = Math.max(this.data.cooldownMs, line.cooldownMs || 0);
      if (line.trigger === "idle") this.idleCount += 1;
    }
    snapshot() { return { count: this.count, used: [...this.used], idleCount: this.idleCount, walkingMs: this.walkingMs }; }
  }
  if (typeof module !== "undefined" && module.exports) module.exports = { GuideVisit };
  if (typeof window === "undefined") return;
  const source = document.currentScript.src;
  const mobile = matchMedia("(max-width: 759px)");
  let actor = document.querySelector(mobile.matches ? ".mobile-walker" : ".mint-guide");
  let bubble = actor?.querySelector(mobile.matches ? ".mobile-walker__bubble" : ".mint-guide__bubble");
  const speech = window.TeaMerryForestGuideSpeech;
  if (!actor || !bubble || !speech) return;
  const modal = document.getElementById("nameModal");
  const map = document.getElementById("forestMapDialog");
  const idleKey = "teaMerryGuideLastIdleId";
  let visit = null, loading = null, previousCamera = null, lastTick = performance.now();
  let wasReady = false, inputPointer = null, lastPointer = null, entryDue = 0, enteredAt = 0;
  let pointerMovedAt = -Infinity;
  const movementKeys = new Set();
  let pageVisible = true;
  let heartbeat = 0;
  const ready = () => !document.hidden && pageVisible
    && (!modal || modal.classList.contains("hidden")) && !map?.open
    && !document.querySelector("dialog[open]")
    && document.body.classList.contains("intro-finished");
  const hide = () => {
    window.TeaMerryForestHomeScreen?.close();
    speech.hide();
    bubble.textContent = "";
    bubble.setAttribute("aria-hidden", "true");
    actor.removeAttribute("data-dialogue-id");
  };
  const readIdle = () => { try { return localStorage.getItem(idleKey) || ""; } catch { return ""; } };
  const load = () => {
    if (loading) return;
    loading = fetch(new URL("../data/forest-guide.json?v=2026.10.14-home-01", source)).then(response => {
      if (!response.ok) throw new Error("Guide data unavailable");
      return response.json();
    }).then(data => {
      if (!data.characters?.[data.guideCharacterId] || !Array.isArray(data.dialogue)
        || data.maxPerVisit < 1 || data.maxPerVisit > 24 || data.cooldownMs < 45000
        || new Set(data.dialogue.map(line => line.id)).size !== data.dialogue.length
        || data.dialogue.some(line => typeof line.id !== "string" || typeof line.text !== "string")) throw new Error("Invalid guide data");
      const character = data.characters[data.guideCharacterId];
      actor.querySelector("img").src = character.image;
      actor.dataset.guideCharacterId = data.guideCharacterId;
      visit = new GuideVisit(data, performance.now(), readIdle(), mobile.matches ? "mobile" : "pc");
      refresh();
    }).catch(error => { console.warn(error.message); });
  };
  const areas = () => {
    const visible = (x,y) => x >= 0 && x <= innerWidth && y >= 0 && y <= innerHeight
      && (mobile.matches || (lastPointer && Math.hypot(x-lastPointer.x,y-lastPointer.y) < 110));
    const result = [];
    const shrine = document.querySelector(".forest-portal--shrine")?.getBoundingClientRect();
    if (shrine && visible(shrine.x + shrine.width / 2, shrine.y + shrine.height / 2)) result.push("shrine");
    const game = document.querySelector(".forest-portal--game")?.getBoundingClientRect();
    if (game && visible(game.x + game.width / 2, game.y + game.height / 2)) result.push("game");
    const observatory = document.getElementById("fixedObservatoryPortal")?.getBoundingClientRect();
    if (observatory && visible(observatory.x + observatory.width / 2, observatory.y + observatory.height / 2)) result.push("observatory");
    return result;
  };
  function refresh() {
    const now = performance.now(), active = ready();
    if (!document.hidden && pageVisible) {
      if (!heartbeat) heartbeat = setInterval(tick, 1000);
    } else {
      clearInterval(heartbeat);
      heartbeat = 0;
    }
    document.body.classList.toggle("mobile-guide-active", active && mobile.matches);
    actor.setAttribute("aria-hidden", String(!active));
    bubble.setAttribute("role", "status");
    bubble.setAttribute("aria-hidden", String(!active || !actor.classList.contains("has-speech")));
    if (active && !wasReady) { entryDue = now + 700; if (!enteredAt) enteredAt = now; previousCamera = null; visit?.pause(now); }
    if (!active && wasReady) { hide(); visit?.pause(now); }
    wasReady = active;
    if (active) load();
  }
  function tick() {
    refresh();
    const now = performance.now(), elapsed = now - lastTick;
    lastTick = now;
    if (!ready() || !visit || actor.classList.contains("has-speech")) return;
    const camera = window.TeaMerryForestNavigation.snapshot();
    if (previousCamera && Math.hypot(camera.x - previousCamera.x, camera.y - previousCamera.y) > 1) {
      visit.move(now, elapsed);
    }
    previousCamera = camera;
    window.TeaMerryForestHomeScreen?.close();
    const moving = inputPointer !== null || movementKeys.size > 0 || now - pointerMovedAt < 2000;
    const line = now >= entryDue ? visit.choose(now, { moving, areas: areas() }) : null;
    if (visit.count && window.TeaMerryForestHomeScreen?.offer({
      data: visit.data, actor, bubble, now, enteredAt, lastInteraction: visit.lastInteraction, moving, line
    })) { visit.lastSpeech = now; return; }
    if (!line) return;
    const name = window.getForestDisplayName?.() || "おさんぽさん";
    bubble.setAttribute("aria-hidden", "false");
    if (!speech.show(line.text.replaceAll("{displayName}", name), visit.data.speechDurationMs)) return;
    visit.record(line, now);
    actor.dataset.dialogueId = line.id;
    if (line.trigger === "idle") {
      try { localStorage.setItem(idleKey, line.id); } catch { /* Private mode still has visit-local limits. */ }
    }
  }
  const interact = (hideSpeech = false) => { visit?.interact(performance.now()); if (mobile.matches && hideSpeech) hide(); };
  document.addEventListener("pointerdown", event => {
    if (event.target.closest(".forest-home-actions")) return;
    interact(true);
    if (ready() && event.target.closest(".forest-scene, .forest-navigation-stick")) {
      inputPointer = event.pointerId;
      lastPointer = { x: event.clientX, y: event.clientY };
    }
  }, true);
  document.addEventListener("pointermove", event => {
    if (!mobile.matches) {
      const now = performance.now();
      if (lastPointer && Math.hypot(event.clientX-lastPointer.x,event.clientY-lastPointer.y)>2) {
        visit?.move(now, Math.min(1000, now-pointerMovedAt));
        pointerMovedAt = now;
      }
      lastPointer = {x:event.clientX,y:event.clientY};
      interact();
      return;
    }
    if (event.pointerId !== inputPointer) return;
    if (lastPointer && Math.hypot(event.clientX - lastPointer.x, event.clientY - lastPointer.y) > 2) interact();
    lastPointer = { x: event.clientX, y: event.clientY };
  }, true);
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) document.addEventListener(type, event => {
    if (event.pointerId === inputPointer) { inputPointer = null; lastPointer = null; }
  }, true);
  document.addEventListener("keydown", event => {
    if (event.target.closest(".forest-home-actions")) return;
    interact(!event.repeat);
    if (ready() && ["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key)) movementKeys.add(event.key);
  });
  document.addEventListener("keyup", event => movementKeys.delete(event.key));
  const pause = () => {
    inputPointer = null; movementKeys.clear(); previousCamera = null;
    hide(); visit?.pause(performance.now()); refresh();
  };
  window.addEventListener("blur", () => { pageVisible = false; pause(); });
  window.addEventListener("focus", () => { pageVisible = true; refresh(); });
  window.addEventListener("pagehide", () => { pageVisible = false; pause(); });
  window.addEventListener("pageshow", () => { pageVisible = true; refresh(); });
  document.addEventListener("visibilitychange", pause);
  mobile.addEventListener("change", () => {
    pause();
    actor = document.querySelector(mobile.matches ? ".mobile-walker" : ".mint-guide");
    bubble = actor.querySelector(mobile.matches ? ".mobile-walker__bubble" : ".mint-guide__bubble");
    if (visit) visit.platform = mobile.matches ? "mobile" : "pc";
    refresh();
  });
  window.addEventListener("teaMerryForestGuideEntry", refresh);
  if (modal) new MutationObserver(refresh).observe(modal, { attributes: true, attributeFilter: ["class"] });
  if (map) new MutationObserver(refresh).observe(map, { attributes: true, attributeFilter: ["open"] });
  window.TeaMerryMobileGuide = Object.freeze({ snapshot: () => visit?.snapshot() || null });
  refresh();
})();
