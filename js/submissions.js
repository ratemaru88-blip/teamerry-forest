(function () {
  "use strict";
  const types = new Set(["musical_feedback", "bottle_mail", "wish_star"]);
  const drafts = new Map();
  let inFlight = false;
  let volatileClientId;
  const id = () => window.crypto.randomUUID();
  function clientId() {
    try {
      let value = window.localStorage.getItem("teaMerrySubmissionClientId");
      if (!value) window.localStorage.setItem("teaMerrySubmissionClientId", value = id());
      return value;
    } catch (_) { return volatileClientId || (volatileClientId = id()); }
  }
  async function send(type, name, message, workId = "") {
    if (!types.has(type) || typeof message !== "string" || !message.trim() || message.length > 300) {
      throw new Error("本文を1〜300文字で入力してください。");
    }
    if (typeof name !== "string" || name.length > 80) throw new Error("名前は80文字以内で入力してください。");
    const config = window.TeaMerrySubmissionConfig || {};
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(config.endpoint || "")) {
      throw new Error("現在、送信受付の準備中です。入力を残して、しばらくしてからお試しください。");
    }
    if (inFlight) throw new Error("送信中です。少しお待ちください。");
    const key = JSON.stringify([type, name, message, workId]);
    const requestId = drafts.get(key) || id();
    drafts.set(key, requestId);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), config.timeoutMs || 20000);
    inFlight = true;
    try {
      const response = await fetch(config.endpoint, {
        method: "POST", mode: "cors", redirect: "follow", credentials: "omit",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify({ type, name, message, workId, requestId, clientId: clientId() }),
        signal: controller.signal,
      });
      if (!response.ok || response.type === "opaque") throw new Error("保存結果を確認できませんでした。入力は残っています。");
      const result = await response.json();
      if (result.requestId !== requestId || result.ok !== true) {
        throw new Error(result.code === "rate_limited"
          ? "少し時間をおいてから、もう一度お送りください。"
          : "保存を確認できませんでした。本文を確認して、もう一度お試しください。");
      }
      drafts.delete(key);
      return result;
    } catch (error) {
      console.error("[TeaMerry submissions]", error.name, error.message);
      if (error.name === "AbortError") throw new Error("保存結果を確認できませんでした。入力を残したまま再送できます。");
      throw error;
    } finally { window.clearTimeout(timer); inFlight = false; }
  }
  function notice(message) {
    let node = document.getElementById("tm-submission-notice");
    if (!node) {
      node = document.createElement("p"); node.id = "tm-submission-notice";
      node.className = "tm-submission-notice"; node.setAttribute("role", "status");
      document.body.appendChild(node);
    }
    node.textContent = message; node.hidden = false;
    window.clearTimeout(notice.timer);
    notice.timer = window.setTimeout(() => { node.hidden = true; }, 7000);
  }
  window.TeaMerrySubmissions = Object.freeze({ send, notice });
})();
