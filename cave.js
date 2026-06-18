const elder = document.getElementById("elder");
const ledgerButton = document.getElementById("ledgerButton");
const ledgerImage = document.getElementById("ledgerImage");

const elderIdle = "assets/images/cave/elder_idle.webp";
const elderBlink = "assets/images/cave/elder_blink.webp";

const ledgerIdle = "assets/images/cave/ledger_cave_idle.webp";
const ledgerGlow = "assets/images/cave/ledger_cave_glow.webp";

function blinkElder() {
  if (!elder) return;

  elder.src = elderBlink;

  setTimeout(() => {
    elder.src = elderIdle;
  }, 320);
}

setInterval(blinkElder, 6500);

if (ledgerButton && ledgerImage) {
  ledgerButton.addEventListener("click", () => {
    ledgerButton.disabled = true;
    ledgerButton.classList.add("is-opening");
    ledgerImage.src = ledgerGlow;

    setTimeout(() => {
      document.body.classList.add("is-ledger-transition");
    }, 650);

    setTimeout(() => {
      window.location.href = "ledger.html";
    }, 1250);
  });
}
