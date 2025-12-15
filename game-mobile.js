const game = document.getElementById("game");
const player = document.getElementById("player");

let gameWidth = window.innerWidth;
let playerX = gameWidth / 2;
let isTouching = false;

// 初期位置
function updatePlayer() {
  player.style.left = playerX - player.offsetWidth / 2 + "px";
}
updatePlayer();

// タッチ開始
document.addEventListener(
  "touchstart",
  (e) => {
    isTouching = true;
    moveByTouch(e);
  },
  { passive: false }
);

// タッチ移動
document.addEventListener(
  "touchmove",
  (e) => {
    if (!isTouching) return;
    e.preventDefault(); // ★超重要：スクロール無効
    moveByTouch(e);
  },
  { passive: false }
);

// タッチ終了
document.addEventListener("touchend", () => {
  isTouching = false;
});

// 指の位置でプレイヤーを動かす
function moveByTouch(e) {
  const touchX = e.touches[0].clientX;
  playerX = Math.max(
    player.offsetWidth / 2,
    Math.min(gameWidth - player.offsetWidth / 2, touchX)
  );
  updatePlayer();
}

// 画面回転・リサイズ対応
window.addEventListener("resize", () => {
  gameWidth = window.innerWidth;
});
