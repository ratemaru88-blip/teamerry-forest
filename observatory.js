document.addEventListener("DOMContentLoaded", () => {
  const observatory = document.getElementById("observatory");
  const fairyImage = document.getElementById("fairyImage");
  const fairyBalloon = document.getElementById("fairyBalloon");

  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 18;

  if (isNight) {
    observatory.classList.add("is-night");
  }

  const fairies = [
    {
      name: "リル",
      image: "./assets/images/observatory/Lilu_v01.webp",
      alt: "リル",
      dayMessages: [
        "あれ？ なにか届いてるよ。",
        "風が瓶を運んできたみたい。",
        "小さな便り、読んでみる？"
      ],
      nightMessages: [
        "星が少し増えた気がする。",
        "今日は空がよく見えるね。",
        "願いごと、そっと書いてみる？"
      ]
    },
    {
      name: "ベリー",
      image: "./assets/images/observatory/Berry_v01.webp",
      alt: "ベリー",
      dayMessages: [
        "面白そうな瓶があるよ！",
        "今日は風が元気だね。",
        "誰かの便り、流れてくるかな？"
      ],
      nightMessages: [
        "願いごと、星まで届くかな？",
        "夜のテラス、ちょっとわくわくするね。",
        "あの星、こっち見てるみたい！"
      ]
    },
    {
      name: "レモン",
      image: "./assets/images/observatory/Lemon_v01.webp",
      alt: "レモン",
      dayMessages: [
        "きっといい便りが届くよ。",
        "瓶を流したら、風にまかせよう。",
        "今日は遠くまで見えるね。"
      ],
      nightMessages: [
        "叶うといいね。",
        "星にお願いしてみよう。",
        "明日もいい日になるといいね。"
      ]
    }
  ];

  const selectedFairy = fairies[Math.floor(Math.random() * fairies.length)];
  const messages = isNight ? selectedFairy.nightMessages : selectedFairy.dayMessages;
  const selectedMessage = messages[Math.floor(Math.random() * messages.length)];

  fairyImage.src = selectedFairy.image;
  fairyImage.alt = selectedFairy.alt;
  fairyBalloon.textContent = selectedMessage;
});