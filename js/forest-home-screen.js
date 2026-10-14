(() => {
  "use strict";
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, String(value)); } catch { /* Optional guidance remains usable without storage. */ } };
  // Read before forest.js updates the existing visit timestamp.
  const returning = Number(read("teaMerryLastVisitAt")) > 0;
  const dismissedKey = "teaMerryHomeScreenDismissedAt";
  const installedKey = "teaMerryHomeScreenAdded";
  const display = matchMedia("(display-mode: standalone)");
  const mobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = () => display.matches || navigator.standalone === true;
  let deferred = null, shown = false, active = null;
  const close = () => {
    if (!active) return;
    active.actor.classList.remove("has-home-screen");
    active.bubble.querySelector(".forest-home-actions")?.remove();
    active = null;
  };
  const finish = () => { const current = active; close(); window.TeaMerryForestGuideSpeech?.hide(); current?.bubble.setAttribute("aria-hidden", "true"); };
  const added = () => { write(installedKey, "true"); deferred = null; finish(); };
  if (standalone()) write(installedKey, "true");
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferred = event;
  });
  window.addEventListener("appinstalled", added);
  display.addEventListener("change", () => { if (standalone()) added(); });
  const button = (text, action) => {
    const el = document.createElement("button");
    el.type = "button"; el.textContent = text;
    el.addEventListener("pointerdown", event => event.stopPropagation());
    el.addEventListener("keydown", event => event.stopPropagation());
    el.addEventListener("click", action);
    return el;
  };
  function offer({ data, actor, bubble, now, enteredAt, lastInteraction, moving, line }) {
    const config = data.homeScreen;
    if (!config || shown || !returning || !mobileDevice || !matchMedia("(max-width: 759px)").matches
      || standalone() || read(installedKey) === "true" || moving || !enteredAt
      || now - enteredAt < config.delayMs || now - lastInteraction < config.quietMs
      || (line && (line.trigger === "entry" || line.targetArea))
      || Date.now() - Number(read(dismissedKey) || 0) < config.dismissDays * 86400000) return false;
    if (!window.TeaMerryForestGuideSpeech.show(config.text, 90000)) return false;
    shown = true;
    active = { actor, bubble };
    actor.classList.add("has-home-screen");
    bubble.setAttribute("aria-hidden", "false");
    const actions = document.createElement("div");
    actions.className = "forest-home-actions";
    const dismiss = () => { write(dismissedKey, Date.now()); finish(); };
    const accept = async () => {
      write(dismissedKey, Date.now());
      const event = deferred;
      deferred = null;
      if (event) {
        finish();
        try {
          // The browser confirmation is invoked only from this explicit click.
          await event.prompt();
          await event.userChoice;
        } catch { /* A dismissed/unavailable browser prompt can be tried on a later visit. */ }
        return;
      }
      bubble.replaceChildren(document.createTextNode(ios ? config.iosText : config.androidText));
      const done = document.createElement("div");
      done.className = "forest-home-actions";
      done.append(button(config.doneText, finish));
      bubble.append(done);
    };
    actions.append(button(config.acceptText, accept), button(config.dismissText, dismiss));
    bubble.append(actions);
    return true;
  }
  window.TeaMerryForestHomeScreen = Object.freeze({ offer, close });
})();
