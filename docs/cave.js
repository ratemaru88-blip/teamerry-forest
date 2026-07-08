const elder = document.getElementById("elder");
const elderBubble = document.getElementById("elderBubble");
const ledgerButton = document.getElementById("ledgerButton");
const ledgerImage = document.getElementById("ledgerImage");

const elderIdle = "assets/images/cave/elder_idle.webp";
const elderBlink = "assets/images/cave/elder_blink.webp";

const ledgerIdle = "assets/images/cave/ledger_cave_idle.webp";
const ledgerGlow = "assets/images/cave/ledger_cave_glow.webp";

const elderLines = [
  "よう、客人。",
  "この書には、森の者たちと",
  "忘れられぬ出来事が記されておる。",
];

function typeElderMessage() {
  if (!elderBubble) return;

  elderBubble.textContent = "";
  elderBubble.classList.add("is-typing");
  const cursor = document.createElement("span");
  cursor.className = "typing-cursor";
  elderBubble.append(cursor);

  let lineIndex = 0;
  let characterIndex = 0;

  const typeNextCharacter = () => {
    const currentLine = elderLines[lineIndex];

    if (characterIndex < currentLine.length) {
      cursor.remove();
      elderBubble.append(currentLine[characterIndex]);
      elderBubble.append(cursor);
      characterIndex += 1;
      setTimeout(typeNextCharacter, 70);
      return;
    }

    lineIndex += 1;
    characterIndex = 0;

    if (lineIndex < elderLines.length) {
      cursor.remove();
      elderBubble.append(document.createElement("br"));
      elderBubble.append(cursor);
      setTimeout(typeNextCharacter, 180);
      return;
    }

    cursor.remove();
    elderBubble.classList.remove("is-typing");
  };

  setTimeout(typeNextCharacter, 450);
}

function blinkElder() {
  if (!elder) return;

  elder.src = elderBlink;

  setTimeout(() => {
    elder.src = elderIdle;
  }, 320);
}

setInterval(blinkElder, 6500);

typeElderMessage();

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
