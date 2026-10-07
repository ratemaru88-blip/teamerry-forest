(function () {
  "use strict";
  const section = document.createElement("dialog");
  section.id = "musical-feedback";
  section.className = "tm-feedback tm-feedback-dialog";
  section.setAttribute("aria-labelledby", "tm-feedback-title");
  section.innerHTML = `<form class="tm-feedback__form">
    <div class="tm-feedback__heading"><h2 id="tm-feedback-title">「ぼくの宝物」の感想</h2><button type="button" class="tm-feedback__close" aria-label="感想フォームを閉じる">&times;</button></div>
    <label for="tm-feedback-name">名前（任意）</label>
    <input id="tm-feedback-name" name="name" maxlength="80" autocomplete="nickname">
    <label for="tm-feedback-message">感想</label>
    <textarea id="tm-feedback-message" name="message" rows="4" maxlength="300" required></textarea>
    <output class="tm-feedback__counter" for="tm-feedback-message">0 / 300</output>
    <button type="submit">感想を送る</button>
    <p class="tm-submission-status" role="status"></p>
  </form>`;
  document.body.appendChild(section);
  const form = section.querySelector("form"), input = form.elements.message;
  const name = form.elements.name, button = form.querySelector("button[type=submit]");
  const status = form.querySelector("[role=status]"), counter = form.querySelector("output");
  let pending = false;
  let trigger;
  window.TeaMerryMusicalFeedback = Object.freeze({
    open(element) {
      trigger = element || document.activeElement;
      if (!section.open) section.showModal();
      input.focus();
    },
  });
  const close = () => { if (!pending) section.close(); };
  form.querySelector(".tm-feedback__close").addEventListener("click", close);
  section.addEventListener("cancel", event => { if (pending) event.preventDefault(); });
  section.addEventListener("click", event => { if (event.target === section) close(); });
  section.addEventListener("close", () => { if (trigger?.isConnected) trigger.focus({ preventScroll: true }); });
  document.addEventListener("click", event => {
    const link = event.target.closest('a[href="#musical-feedback"]');
    if (link) { event.preventDefault(); window.TeaMerryMusicalFeedback.open(link); }
  });
  input.addEventListener("input", () => { counter.textContent = `${input.value.length} / 300`; });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (pending) return;
    pending = true; button.disabled = true; input.readOnly = true; name.readOnly = true;
    status.textContent = "送信中…";
    try {
      await window.TeaMerrySubmissions.send("musical_feedback", name.value, input.value, "boku-no-takaramono");
      status.textContent = "感想が届きました。大切に読ませていただきます。";
      input.value = ""; counter.textContent = "0 / 300";
    } catch (error) { status.textContent = error.message; }
    finally { pending = false; button.disabled = false; input.readOnly = false; name.readOnly = false; }
  });
})();
