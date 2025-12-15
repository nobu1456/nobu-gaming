// ================================
// スマホ版ゲーム 完全動作版
// GAME OVER改良 + 景品開放通知込み
// ================================

const game = document.getElementById("game");
const player = document.getElementById("player");
const distanceEl = document.getElementById("distance");
const lifeEl = document.getElementById("life");
const notice = document.getElementById("notice");

let gameOver = false;
let playerX = game.clientWidth / 2;
let speed = 4;
let distance = 0;
let life = 3;

const obstacles = [];
let lastObstacleTime = 0;
const unlocked = new Set();

// ================================
// タッチ操作
// ================================
let touchX = null;

function handleTouch(e) {
  const touch = e.touches[0];
  const rect = game.getBoundingClientRect();
  touchX = touch.clientX - rect.left;
}

game.addEventListener("touchstart", handleTouch, { passive: true });
game.addEventListener("touchmove", handleTouch, { passive: true });
game.addEventListener("touchend", () => (touchX = null));

// ================================
// 障害物生成
// ================================
function createObstacle() {
  const obs = document.createElement("div");
  obs.className = "obstacle";
  obs.style.left = Math.random() * (game.clientWidth - 40) + "px";
  obs.style.top = "-60px";
  game.appendChild(obs);
  obstacles.push({ el: obs, y: -60 });
}

// ================================
// 景品開放通知
// ================================
function checkReward() {
  const m = Math.floor(distance / 500) * 500;
  if (m >= 500 && !unlocked.has(m)) {
    unlocked.add(m);
    showRewardNotice(m);
  }
}

function showRewardNotice(m) {
  const msg = document.createElement("div");
  msg.textContent = `🎁 ${m}m 景品開放！`;
  msg.style.cssText = `
    position:fixed;
    bottom:20px;
    left:50%;
    transform:translateX(-50%);
    background:#222;
    color:#fff;
    padding:12px 20px;
    border-radius:20px;
    font-size:16px;
    z-index:30;
    opacity:0;
    transition:all .3s;
  `;
  document.body.appendChild(msg);

  requestAnimationFrame(() => {
    msg.style.opacity = "1";
    msg.style.bottom = "60px";
  });

  setTimeout(() => {
    msg.style.opacity = "0";
    msg.style.bottom = "20px";
    setTimeout(() => msg.remove(), 400);
  }, 2000);
}

// ================================
// GAME OVER
// ================================
function endGame() {
  gameOver = true;
  notice.style.display = "block";
  notice.innerHTML = `
    <div style="text-align:center">
      <div style="font-size:36px;margin-bottom:12px">GAME OVER</div>
      <div style="font-size:18px;margin-bottom:20px">
        距離：${Math.floor(distance)} m
      </div>
      <div style="display:flex;gap:12px;justify-content:center">
        <button onclick="location.reload()">RETRY</button>
        <button onclick="location.href='reward.html'">景品</button>
        <button onclick="location.href='game-start.html'">HOME</button>
      </div>
    </div>
  `;
}

// ================================
// メインループ
// ================================
function gameLoop(timestamp) {
  if (gameOver) return;

  // 距離
  distance += speed * 0.1;
  distanceEl.textContent = Math.floor(distance) + " m";

  // 難易度
  if (Math.floor(distance) % 100 === 0) speed += 0.01;

  // 景品チェック
  checkReward();

  // 障害物生成
  if (!lastObstacleTime || timestamp - lastObstacleTime > 800) {
    createObstacle();
    lastObstacleTime = timestamp;
  }

  // プレイヤー移動
  if (touchX !== null) {
    playerX += (touchX - playerX) * 0.2;
    player.style.left = playerX - player.offsetWidth / 2 + "px";
  }

  // 障害物処理
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.y += speed;
    o.el.style.top = o.y + "px";

    const p = player.getBoundingClientRect();
    const r = o.el.getBoundingClientRect();

    if (
      p.left < r.right &&
      p.right > r.left &&
      p.top < r.bottom &&
      p.bottom > r.top
    ) {
      o.el.remove();
      obstacles.splice(i, 1);
      life--;
      lifeEl.textContent = "❤️".repeat(life);
      if (life <= 0) {
        endGame();
        return;
      }
      continue;
    }

    if (o.y > game.clientHeight) {
      o.el.remove();
      obstacles.splice(i, 1);
    }
  }

  requestAnimationFrame(gameLoop);
}

// ================================
// START
// ================================
requestAnimationFrame(gameLoop);
