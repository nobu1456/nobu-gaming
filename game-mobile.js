const game = document.getElementById("game");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const gameoverEl = document.getElementById("gameover");
const finalScoreEl = document.getElementById("finalScore");

let playerX = window.innerWidth / 2;
const speed = 6;

let obstacles = [];
let frame = 0;
let score = 0;
let life = 3;
let invincible = false;
let isGameOver = false;

// ===== タッチ入力 =====
let touchX = null;

document.addEventListener("touchstart", e => {
  touchX = e.touches[0].clientX;
});

document.addEventListener("touchmove", e => {
  const currentX = e.touches[0].clientX;
  const diff = currentX - touchX;
  playerX += diff * 0.2; // ← ここが操作感
  touchX = currentX;
});

// ===== ライフ =====
const lifeEl = document.createElement("div");
lifeEl.style.position = "fixed";
lifeEl.style.top = "36px";
lifeEl.style.left = "12px";
lifeEl.textContent = "❤️❤️❤️";
lifeEl.style.color = "#fff";
document.body.appendChild(lifeEl);

// ===== 障害物 =====
function createObstacle() {
  const obs = document.createElement("div");
  obs.className = "obstacle";

  const lanes = 6;
  const laneW = window.innerWidth / lanes;
  const lane = Math.floor(Math.random() * lanes);

  obs.style.left = lane * laneW + laneW / 2 - 20 + "px";
  game.appendChild(obs);

  obstacles.push({ el: obs, y: -40 });
}

// ===== 判定 =====
function isColliding(a, b) {
  const ar = a.getBoundingClientRect();
  const br = b.getBoundingClientRect();
  return !(
    ar.right < br.left ||
    ar.left > br.right ||
    ar.bottom < br.top ||
    ar.top > br.bottom
  );
}

// ===== ダメージ =====
function takeDamage() {
  if (invincible) return;

  life--;
  lifeEl.textContent = "❤️".repeat(life);
  invincible = true;
  player.style.opacity = "0.5";

  setTimeout(() => {
    invincible = false;
    player.style.opacity = "1";
  }, 900);

  if (life <= 0) gameOver();
}

// ===== 終了 =====
function gameOver() {
  isGameOver = true;
  finalScoreEl.textContent = Math.floor(score);
  gameoverEl.style.display = "flex";
}

// ===== メインループ =====
function gameLoop() {
  if (isGameOver) return;

  const half = player.offsetWidth / 2;
  playerX = Math.max(half, Math.min(window.innerWidth - half, playerX));
  player.style.left = playerX + "px";

  score += 0.12;
  scoreEl.textContent = Math.floor(score);

  if (frame % 40 === 0) createObstacle();

  obstacles.forEach(obs => {
    obs.y += 4;
    obs.el.style.top = obs.y + "px";

    if (isColliding(player, obs.el)) {
      takeDamage();
      obs.el.remove();
      obs.y = window.innerHeight + 100;
    }
  });

  obstacles = obstacles.filter(obs => {
    if (obs.y > window.innerHeight) {
      obs.el.remove();
      return false;
    }
    return true;
  });

  frame++;
  requestAnimationFrame(gameLoop);
}

gameLoop();
