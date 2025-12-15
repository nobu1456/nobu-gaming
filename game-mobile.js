const game = document.getElementById("game");
const player = document.getElementById("player");

let gameWidth = window.innerWidth;
let gameHeight = window.innerHeight;

let playerX = gameWidth / 2;
let isTouching = false;

let obstacles = [];
let speed = 4;
let distance = 0;
let lives = 3;
let gameOver = false;

/* ========= プレイヤー ========= */
function updatePlayer() {
  player.style.left = playerX - player.offsetWidth / 2 + "px";
}
updatePlayer();

/* ========= タッチ操作 ========= */
document.addEventListener(
  "touchstart",
  (e) => {
    isTouching = true;
    moveByTouch(e);
  },
  { passive: false }
);

document.addEventListener(
  "touchmove",
  (e) => {
    if (!isTouching) return;
    e.preventDefault();
    moveByTouch(e);
  },
  { passive: false }
);

document.addEventListener("touchend", () => {
  isTouching = false;
});

function moveByTouch(e) {
  const touchX = e.touches[0].clientX;
  playerX = Math.max(
    player.offsetWidth / 2,
    Math.min(gameWidth - player.offsetWidth / 2, touchX)
  );
  updatePlayer();
}

/* ========= 障害物 ========= */
function createObstacle() {
  const obs = document.createElement("div");
  obs.className = "obstacle";
  obs.style.left = Math.random() * (gameWidth - 40) + "px";
  obs.style.top = "-60px";
  game.appendChild(obs);
  obstacles.push(obs);
}

setInterval(() => {
  if (!gameOver) createObstacle();
}, 800);

/* ========= ゲームループ ========= */
function gameLoop() {
  if (gameOver) return;

  distance += 0.1;
  document.getElementById("distance").textContent =
    Math.floor(distance) + " m";

  obstacles.forEach((obs, i) => {
    let top = obs.offsetTop + speed;
    obs.style.top = top + "px";

    // 当たり判定
    if (
      top + obs.offsetHeight > player.offsetTop &&
      obs.offsetLeft < player.offsetLeft + player.offsetWidth &&
      obs.offsetLeft + obs.offsetWidth > player.offsetLeft
    ) {
      obs.remove();
      obstacles.splice(i, 1);
      lives--;
      if (lives <= 0) {
        gameOver = true;
        document.getElementById("gameover").style.display = "block";
      }
    }

    // 画面外
    if (top > gameHeight) {
      obs.remove();
      obstacles.splice(i, 1);
    }
  });

  // 難易度上昇
  if (Math.floor(distance) % 100 === 0) speed += 0.002;

  requestAnimationFrame(gameLoop);
}

gameLoop();

/* ========= リサイズ ========= */
window.addEventListener("resize", () => {
  gameWidth = window.innerWidth;
  gameHeight = window.innerHeight;
});
