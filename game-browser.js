const game = document.getElementById("game");
const player = document.getElementById("player");
const heartsEl = document.getElementById("hearts");
const distanceEl = document.getElementById("distance");
const gameoverEl = document.getElementById("gameover");
const finalDistanceEl = document.getElementById("finalDistance");
const rewardNotice = document.getElementById("rewardNotice");

let playerX = 0;
let speed = 4;
let distance = 0;
let lives = 3;
let obstacles = [];
let running = true;
let lastObstacleTime = 0;
let isInvincible = false;

const keys = {};

// キーボード入力管理
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

// 初期化
window.addEventListener("load", () => {
  playerX = (game.clientWidth - player.offsetWidth) / 2;
  player.style.left = playerX + "px";
  requestAnimationFrame(loop);
});

function createObstacle(ts) {
  const obs = document.createElement("div");
  obs.className = "obstacle";

  // 画像のランダム選択
  const img = Math.random() < 0.5 ? "enemy1ver2.png" : "enemy2ver2.png";
  obs.style.backgroundImage = `url("${img}")`;

  // 出現位置の計算（端に寄りすぎないようマージンを確保）
  const margin = 30;
  const maxX = game.clientWidth - 64 - margin * 2;
  obs.style.left = margin + Math.random() * maxX + "px";

  game.appendChild(obs);
  obstacles.push({ el: obs, y: -80 });
  lastObstacleTime = ts;
}

function updateUI() {
  heartsEl.textContent = "❤️".repeat(Math.max(0, lives));
  distanceEl.textContent = Math.floor(distance) + "m";
}

function triggerInvincible() {
  isInvincible = true;
  player.classList.add("invincible");
  setTimeout(() => {
    isInvincible = false;
    player.classList.remove("invincible");
  }, 1200); // 1.2秒間無敵
}

function gameOver() {
  running = false;
  finalDistanceEl.textContent = Math.floor(distance);
  gameoverEl.style.display = "flex";
  
  // 500m以上で景品案内を表示
  if (distance >= 500) {
    rewardNotice.textContent = "★ 500m達成！景品を獲得しました！ ★";
    rewardNotice.style.display = "block";
  }
}

function loop(ts) {
  if (!running) return;

  // 1. プレイヤー移動（左右）
  if (keys["ArrowLeft"] || keys["a"]) playerX -= 8;
  if (keys["ArrowRight"] || keys["d"]) playerX += 8;

  // 画面外はみ出し防止
  playerX = Math.max(0, Math.min(game.clientWidth - player.offsetWidth, playerX));
  player.style.left = playerX + "px";

  // 2. スコア更新と難易度上昇
  distance += 0.15;
  speed = 4 + Math.floor(distance / 100); // 100mごとに加速

  // 3. 障害物の生成
  // 最初の一回目と、一定時間（難易度に応じて短縮）ごとに生成
  const spawnInterval = Math.max(250, 500 - (distance / 10)); 
  if (ts - lastObstacleTime > spawnInterval) {
    createObstacle(ts);
  }

  // 4. 障害物の更新と当たり判定
  const pRect = player.getBoundingClientRect();

  // 配列を逆順にループすることで、削除時のインデックスズレを防止
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.y += speed;
    o.el.style.top = o.y + "px";

    const oRect = o.el.getBoundingClientRect();
    
    // 当たり判定の調整（見た目より少し小さめに設定して理不尽さをなくす）
    const paddingX = 40; 
    const paddingY = 25;

    if (!isInvincible &&
        pRect.left + paddingX < oRect.right - paddingX &&
        pRect.right - paddingX > oRect.left + paddingX &&
        pRect.top + paddingY < oRect.bottom - paddingY &&
        pRect.bottom - paddingY > oRect.top + paddingY) {
      
      lives--;
      o.el.remove();
      obstacles.splice(i, 1);
      
      if (lives <= 0) {
        gameOver();
      } else {
        triggerInvincible();
      }
      continue;
    }

    // 画面外に出た障害物を削除
    if (o.y > game.clientHeight + 100) {
      o.el.remove();
      obstacles.splice(i, 1);
    }
  }

  updateUI();
  requestAnimationFrame(loop);
}