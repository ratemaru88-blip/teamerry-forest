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
  const embedded = window.parent !== window;
  if (!embedded && matchMedia("(min-width: 760px)").matches) {
    const forest = new URL("../index.html", source);
    forest.searchParams.set("omikuji", "1");
    location.replace(forest);
    return;
  }
  const $ = id => document.getElementById(id);
  const mobile = matchMedia("(max-width: 759px)");
  let config, data, ui, sound, pending, activeFairy, drawTimer = 0, peekTimer = 0, peekStart = 0;
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
    let previous = "";
    try { previous = localStorage.getItem("teaMerryOmikujiLastFairy") || ""; } catch {}
    const candidates = config.fairies.filter(fairy => fairy.id !== previous);
    const fairy = selectFortune(candidates.length ? candidates : config.fairies);
    activeFairy = fairy;
    $("peekFairy").src = fairy.image;
    $("peekFairy").dataset.characterId = fairy.id;
    $("peekFairy").hidden = false;
    try { localStorage.setItem("teaMerryOmikujiLastFairy", fairy.id); } catch {}
    if (!mobile.matches || suspended) return;
    peekStart = setTimeout(() => {
      $("peekFairy").classList.add("is-peeking");
      peekTimer = setTimeout(hideFairy, config.peekDurationMs);
    }, 80);
  }
  function entry() {
    if (!config || !data) return;
    drawing = false; pending = null; remaining = 0;
    clearTimeout(drawTimer); drawTimer = 0; silence();
    $("drawView").hidden = false; $("resultView").hidden = true;
    document.body.classList.remove("is-result");
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
    $("resultFairy").src = activeFairy.image;
    $("resultFairy").dataset.characterId = activeFairy.id;
    $("resultFairy").alt = activeFairy.name + "がおみくじを届けてくれました";
    $("resultView").dataset.resultId = result.resultId;
    $("drawView").hidden = true; $("resultView").hidden = false;
    document.body.classList.add("is-result");
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
    $("drawStatus").textContent = "";
    $("drawButton").classList.add("is-shaking");
    silence();
    sound.play().catch(() => {});
    scheduleReveal(config.drawDelayMs);
  }
  function pause() {
    suspended = true; hideFairy(); silence();
    document.body.classList.add("is-suspended");
    if (drawTimer) { remaining = Math.max(0, due - performance.now()); clearTimeout(drawTimer); drawTimer = 0; }
    $("drawButton").classList.remove("is-shaking");
  }
  function resume() {
    suspended = document.hidden;
    document.body.classList.toggle("is-suspended", suspended);
    if (!suspended && drawing && pending && !drawTimer) scheduleReveal(remaining);
  }
  async function load() {
    $("drawButton").disabled = true; $("retryLoad").hidden = true;
    try {
      const response = await fetch(new URL("../data/omikuji/config.json?v=2026.10.13-overlay-03", source));
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
      $("drawSign").src = config.assets.drawSign;
      $("drawLabel").textContent = ui.draw; $("drawButton").setAttribute("aria-label", ui.draw);
      $("againButton").setAttribute("aria-label", ui.again);
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
  const mapDialog = $("omikujiMap");
  $("mapButton").addEventListener("click", async () => {
    silence();
    mapDialog.showModal();
    if ($("mapDestinations").children.length) return;
    $("mapStatus").textContent = "準備中…";
    try {
      // Read the authoritative portal list without running Forest scripts or audio.
      const response = await fetch(new URL("../index.html", source));
      if (!response.ok) throw new Error("Map unavailable");
      const forest = new DOMParser().parseFromString(await response.text(), "text/html");
      const links = [...forest.querySelectorAll(".forest-portal, #fixedObservatoryPortal")];
      if (!links.length) throw new Error("Map destinations unavailable");
      const fragment = document.createDocumentFragment();
      for (const portal of links) {
        const link = document.createElement("a");
        link.className = "map-destination";
        const url = new URL(portal.getAttribute("href"), response.url);
        if (!["https:", "http:"].includes(url.protocol)) continue;
        link.href = url.href;
        const original = portal.querySelector("img");
        if (original) {
          const image = document.createElement("img");
          image.src = new URL(original.getAttribute("src"), response.url).href;
          image.alt = "";
          link.append(image);
        }
        const label = document.createElement("span");
        label.textContent = (portal.getAttribute("aria-label") || "森の入口").replace(/へ$/, "");
        link.append(label);
        fragment.append(link);
      }
      $("mapDestinations").replaceChildren(fragment);
      $("mapStatus").textContent = "";
    } catch {
      $("mapStatus").textContent = "案内図の行き先を読み込めませんでした。閉じて、もう一度開いてください。";
    }
  });
  $("closeMap").addEventListener("click", () => mapDialog.close());
  mapDialog.addEventListener("close", () => $("mapButton").focus({preventScroll:true}));
  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); else resume(); });
  window.addEventListener("pagehide", pause); window.addEventListener("pageshow", resume);
  mobile.addEventListener("change", () => { if (!mobile.matches) hideFairy(); });
  document.querySelectorAll('a[href="./index.html"]').forEach(link => link.addEventListener("click", pause));
  window.TeaMerryOmikuji = Object.freeze({stop:pause});
  if (embedded) {
    const returnToForest = () => {
      pause();
      window.parent.postMessage({type:"teamerry:omikuji-close"}, location.origin);
    };
    document.querySelectorAll('a[href="./index.html"]').forEach(link => link.addEventListener("click", event => {
      event.preventDefault();
      returnToForest();
    }));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !mapDialog.open) { event.preventDefault(); returnToForest(); }
    });
    $("mapDestinations").addEventListener("click", event => {
      const link = event.target.closest("a");
      if (link) { pause(); link.target = "_top"; }
    });
  }
  load();
})();
