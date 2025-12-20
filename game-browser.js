const game = document.getElementById("game");
const player = document.getElementById("player");
const heartsEl = document.getElementById("hearts");
const distanceEl = document.getElementById("distance");
const gameoverEl = document.getElementById("gameover");
const finalDistanceEl = document.getElementById("finalDistance");

let playerX = 0;
let speed = 4;
let distance = 0;
let lives = 3;
let obstacles = [];
let running = true;
let lastObstacleTime = 0;

const keys = {};

// 入力検知
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

  const img = Math.random() < 0.5
    ? "enemy1ver2.png"
    : "enemy2ver2.png";

  obs.style.backgroundImage = `url("${img}")`;

  const margin = 40;
  const maxX = game.clientWidth - 56 - margin * 2;
  obs.style.left = margin + Math.random() * maxX + "px";

  game.appendChild(obs);
  obstacles.push({ el: obs, y: -80 });
  lastObstacleTime = ts; // 生成時間を記録
}

function updateUI() {
  heartsEl.textContent = "❤️".repeat(Math.max(0, lives));
  distanceEl.textContent = Math.floor(distance) + "m";
}

function loop(ts) {
  if (!running) return;

  // 1. プレイヤー移動
  if (keys["ArrowLeft"] || keys["a"]) playerX -= 7;
  if (keys["ArrowRight"] || keys["d"]) playerX += 7;

  playerX = Math.max(0, Math.min(game.clientWidth - player.offsetWidth, playerX));
  player.style.left = playerX + "px";

  // 2. 距離とスピード
  distance += 0.15;
  speed = 4 + Math.floor(distance / 100);

  // 3. 敵生成 (前回の生成から300ms以上経過したら)
  if (ts - lastObstacleTime > 300) {
    createObstacle(ts);
  }

  const p = player.getBoundingClientRect();

  // 4. 敵の更新と当たり判定 (逆順ループで安全に削除)
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.y += speed;
    o.el.style.top = o.y + "px";

    const r = o.el.getBoundingClientRect();
    const hit = 10; // 当たり判定の調整

    if (
      p.left + hit < r.right - hit &&
      p.right - hit > r.left + hit &&
      p.top + hit < r.bottom - hit &&
      p.bottom - hit > r.top + hit
    ) {
      lives--;
      o.el.remove();
      obstacles.splice(i, 1);

      if (lives <= 0) {
        running = false;
        finalDistanceEl.textContent = Math.floor(distance);
        gameoverEl.style.display = "flex";
      }
      continue;
    }

    // 画面外へ消えた敵の削除
    if (o.y > game.clientHeight + 100) {
      o.el.remove();
      obstacles.splice(i, 1);
    }
  }

  updateUI();
  requestAnimationFrame(loop);
}