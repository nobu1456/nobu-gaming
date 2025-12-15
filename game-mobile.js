// === スマホ版ゲーム本体（完全動作版） ===

const game = document.getElementById("game");
const player = document.getElementById("player");
const distanceEl = document.getElementById("distance");
const lifeEl = document.getElementById("life");
const notice = document.getElementById("notice");

let gameStarted = false;
let gameOver = false;

let playerX = 150;
let speed = 4;
let distance = 0;
let life = 3;

const obstacles = [];
let lastObstacleTime = 0;

// =============================
// 初期設定
// =============================
player.style.left = playerX + "px";

function startGame() {
  if (gameStarted) return;
  gameStarted = true;
  requestAnimationFrame(gameLoop);
}

// =============================
// タッチ操作（超重要）
// =============================
let touchX = null;

function handleTouch(e) {
  const touch = e.touches[0];
  const rect = game.getBoundingClientRect();
  touchX = touch.clientX - rect.left;
}

game.addEventListener("touchstart", handleTouch, { passive: false });
game.addEventListener("touchmove", handleTouch, { passive: false });

game.addEventListener("touchend", () => {
  touchX = null;
});

// =============================
// 障害物生成
// =============================
function createObstacle() {
  const obs = document.createElement("div");
  obs.className = "obstacle";
  obs.style.left = Math.random() * (game.clientWidth - 40) + "px";
  obs.style.top = "-60px";
  game.appendChild(obs);

  obstacles.push({ el: obs, y: -60 });
}

// =============================
// メインループ
// =============================
function gameLoop(timestamp) {
  if (gameOver) return;

  // 距離
  distance += speed * 0.1;
  distanceEl.textContent = Math.floor(distance) + " m";

  // スピード・難易度
  if (Math.floor(distance) % 100 === 0) {
    speed += 0.01;
  }

  // 障害物生成
  if (timestamp - lastObstacleTime > 800) {
    createObstacle();
    lastObstacleTime = timestamp;
  }

  // プレイヤー移動
  if (touchX !== null) {
    playerX += (touchX - playerX) * 0.15;
    player.style.left = playerX + "px";
  }

  // 障害物更新
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.y += speed;
    o.el.style.top = o.y + "px";

    // 当たり判定
    const pRect = player.getBoundingClientRect();
    const oRect = o.el.getBoundingClientRect();

    if (
      pRect.left < oRect.right &&
      pRect.right > oRect.left &&
      pRect.top < oRect.bottom &&
      pRect.bottom > oRect.top
    ) {
      game.removeChild(o.el);
      obstacles.splice(i, 1);
      life--;
      lifeEl.textContent = "❤️".repeat(life);

      if (life <= 0) {
        endGame();
        return;
      }
      continue;
    }

    // 画面外
    if (o.y > game.clientHeight) {
      game.removeChild(o.el);
      obstacles.splice(i, 1);
    }
  }

  requestAnimationFrame(gameLoop);
}

// =============================
// ゲームオーバー
// =============================
function endGame() {
  gameOver = true;
  notice.style.display = "block";
  notice.textContent = "GAME OVER";
}

// =============================
// 自動スタート（スマホ用）
// =============================
startGame();
