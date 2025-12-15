const game = document.getElementById("game");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const gameoverEl = document.getElementById("gameover");
const finalScoreEl = document.getElementById("finalScore");

let playerX = window.innerWidth / 2;
const speed = 6;
const keys = { left: false, right: false };

let obstacles = [];
let frame = 0;
let score = 0;
let level = 1;
let life = 3;
let invincible = false;
let isGameOver = false;

// ===== HUD =====
const lifeEl = document.createElement("div");
lifeEl.style.position = "fixed";
lifeEl.style.top = "36px";
lifeEl.style.left = "12px";
lifeEl.textContent = "❤️❤️❤️";
document.body.appendChild(lifeEl);

// ===== 景品通知 =====
const rewardNotice = document.createElement("div");
rewardNotice.style.position = "fixed";
rewardNotice.style.top = "50%";
rewardNotice.style.left = "50%";
rewardNotice.style.transform = "translate(-50%, -50%)";
rewardNotice.style.padding = "20px 28px";
rewardNotice.style.background = "rgba(0,0,0,.85)";
rewardNotice.style.border = "2px solid gold";
rewardNotice.style.color = "gold";
rewardNotice.style.fontSize = "18px";
rewardNotice.style.display = "none";
rewardNotice.textContent = "🎁 新しい景品が解放されました！";
document.body.appendChild(rewardNotice);

// ===== 入力 =====
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowRight") keys.right = true;
});
document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;
});

// ===== 難易度 =====
function getDifficulty() {
  return {
    obstacleSpeed: 3 + level * 0.8,
    spawnInterval: Math.max(14, 70 - level * 6),
    maxObstacles: 2 + Math.floor(level * 0.8),
  };
}

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

// ===== 景品解放 =====
function unlockReward(distance) {
  const key = `reward_${distance}`;
  if (localStorage.getItem(key)) return;

  localStorage.setItem(key, "true");

  rewardNotice.style.display = "block";
  setTimeout(() => {
    rewardNotice.style.display = "none";
  }, 1800);
}

// ===== メイン =====
function gameLoop() {
  if (isGameOver) return;

  if (keys.left) playerX -= speed;
  if (keys.right) playerX += speed;

  const half = player.offsetWidth / 2;
  playerX = Math.max(half, Math.min(window.innerWidth - half, playerX));
  player.style.left = playerX + "px";

  score += 0.12;
  const displayScore = Math.floor(score);
  scoreEl.textContent = displayScore;

  level = Math.floor(displayScore / 100) + 1;
  const diff = getDifficulty();

  if (frame % diff.spawnInterval === 0 && obstacles.length < diff.maxObstacles) {
    createObstacle();
  }

  obstacles.forEach(obs => {
    obs.y += diff.obstacleSpeed;
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

  // ===== 500m刻み解放 =====
  if (displayScore % 500 === 0 && displayScore > 0) {
    unlockReward(displayScore);
  }

  frame++;
  requestAnimationFrame(gameLoop);
}

gameLoop();
