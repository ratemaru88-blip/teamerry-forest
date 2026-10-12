(() => {
  "use strict";
  function selectFortune(results, random = Math.random) {
    if (!Array.isArray(results) || !results.length) throw new Error("No fortunes");
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error("Invalid random value");
    return results[Math.floor(value * results.length)];
  }
  if (typeof module !== "undefined" && module.exports) module.exports = { selectFortune };
  if (typeof window === "undefined") return;
  const source = document.currentScript.src;
  const $ = id => document.getElementById(id);
  const mobile = matchMedia("(max-width: 759px)");
  let config, data, ui, sound, pending, drawTimer = 0, peekTimer = 0, peekStart = 0;
  let drawing = false, remaining = 0, due = 0, suspended = document.hidden;
  function silence() {
    if (!sound) return;
    sound.pause();
    try { sound.currentTime = 0; } catch {}
  }
  function hideFairy() {
    clearTimeout(peekTimer); clearTimeout(peekStart);
    $("peekFairy").classList.remove("is-peeking");
  }
  function peek() {
    hideFairy();
    if (!mobile.matches || suspended) return;
    let previous = "";
    try { previous = localStorage.getItem("teaMerryOmikujiLastFairy") || ""; } catch {}
    const candidates = config.fairies.filter(fairy => fairy.id !== previous);
    const fairy = selectFortune(candidates.length ? candidates : config.fairies);
    $("peekFairy").src = fairy.image;
    $("peekFairy").dataset.characterId = fairy.id;
    $("peekFairy").hidden = false;
    try { localStorage.setItem("teaMerryOmikujiLastFairy", fairy.id); } catch {}
    peekStart = setTimeout(() => {
      $("peekFairy").classList.add("is-peeking");
      peekTimer = setTimeout(hideFairy, config.peekDurationMs);
    }, 350);
  }
  function entry() {
    if (!config || !data) return;
    drawing = false; pending = null; remaining = 0;
    clearTimeout(drawTimer); drawTimer = 0; silence();
    $("drawView").hidden = false; $("resultView").hidden = true;
    $("drawButton").disabled = false;
    $("drawButton").classList.remove("is-shaking");
    $("drawLabel").textContent = ui.draw; $("drawStatus").textContent = "";
    peek();
  }
  function reveal() {
    drawTimer = 0;
    if (suspended || !pending) return;
    const result = pending;
    $("resultTitle").textContent = result.title;
    $("mainText").textContent = result.main;
    $("loveLabel").textContent = ui.love;
    $("moneyLabel").textContent = ui.money;
    $("itemLabel").textContent = ui.item;
    $("loveText").textContent = result.love.replace(/★/g, ui.leaf);
    $("moneyText").textContent = result.work.replace(/★/g, ui.leaf);
    $("itemText").textContent = result.item;
    $("characterLine").textContent = result.quip;
    $("resultCharacter").src = config.legacyCharacters[result.char];
    $("resultView").dataset.resultId = result.resultId;
    $("drawView").hidden = true; $("resultView").hidden = false;
    $("resultView").classList.remove("is-revealing");
    void $("resultView").offsetWidth;
    $("resultView").classList.add("is-revealing");
    drawing = false; pending = null; silence();
    window.scrollTo(0, 0); $("resultTitle").focus({preventScroll:true});
  }
  function scheduleReveal(delay) {
    clearTimeout(drawTimer);
    remaining = delay; due = performance.now() + delay;
    drawTimer = setTimeout(reveal, delay);
  }
  function draw() {
    if (drawing || !data || suspended) return;
    drawing = true; pending = selectFortune(data.results);
    hideFairy();
    $("drawButton").disabled = true;
    $("drawLabel").textContent = ui.drawing;
    $("drawStatus").textContent = "";
    $("drawButton").classList.add("is-shaking");
    silence();
    sound.play().catch(() => {});
    scheduleReveal(config.drawDelayMs);
  }
  function pause() {
    suspended = true; hideFairy(); silence();
    if (drawTimer) { remaining = Math.max(0, due - performance.now()); clearTimeout(drawTimer); drawTimer = 0; }
    $("drawButton").classList.remove("is-shaking");
  }
  function resume() {
    suspended = document.hidden;
    if (!suspended && drawing && pending && !drawTimer) scheduleReveal(remaining);
  }
  async function load() {
    $("drawButton").disabled = true; $("retryLoad").hidden = true;
    try {
      const response = await fetch(new URL("../data/omikuji/config.json?v=2026.10.12-phase1-01", source));
      if (!response.ok) throw new Error("Config unavailable");
      config = await response.json();
      const requested = new URLSearchParams(location.search).get("lang");
      const locale = config.availableLocales.includes(requested) ? requested : config.defaultLocale;
      ui = config.ui[locale]; document.documentElement.lang = locale;
      const resultResponse = await fetch(new URL("../data/omikuji/" + locale + ".json?v=2026.10.12-phase1-01", source));
      if (!resultResponse.ok) throw new Error("Results unavailable");
      data = await resultResponse.json();
      if (!data.results?.length || data.results.some(result => !config.legacyCharacters[result.char]
        || ["title","main","love","work","item","quip"].some(key => typeof result[key] !== "string"))) throw new Error("Invalid result data");
      sound = new Audio(config.assets.shakeSound); sound.preload = "auto";
      $("drawLabel").textContent = ui.draw; $("drawButton").setAttribute("aria-label", ui.draw);
      $("againButton").querySelector("span").textContent = ui.again;
      entry();
    } catch (error) {
      $("drawStatus").textContent = ui?.error || "おみくじの準備ができませんでした。";
      $("retryLoad").hidden = false;
      console.warn(error.message);
    }
  }
  $("drawButton").addEventListener("click", draw);
  $("againButton").addEventListener("click", () => { entry(); $("drawButton").focus({preventScroll:true}); window.scrollTo(0, 0); });
  $("retryLoad").addEventListener("click", load);
  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); else resume(); });
  window.addEventListener("pagehide", pause); window.addEventListener("pageshow", resume);
  mobile.addEventListener("change", () => { if (!mobile.matches) hideFairy(); });
  document.querySelectorAll('a[href="./index.html"]').forEach(link => link.addEventListener("click", pause));
  load();
})();
