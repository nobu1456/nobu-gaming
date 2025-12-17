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
let running = false;
let lastObstacleTime = 0;

const keys = {};

window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

function createObstacle() {
  const obs = document.createElement("div");
  obs.className = "obstacle";

  const img = Math.random() < 0.5
    ? "enemy1ver2.png"
    : "enemy2ver2.png";

  obs.style.backgroundImage = `url("${img}")`;

  const margin = 40;
  const maxX = game.clientWidth - 64 - margin * 2;
  obs.style.left = margin + Math.random() * maxX + "px";

  game.appendChild(obs);
  obstacles.push({ el: obs, y: -80 });
}

function updateUI() {
  heartsEl.textContent = "❤️".repeat(lives);
  distanceEl.textContent = Math.floor(distance) + "m";
}

function loop(ts) {
  if (!running) return;

  // プレイヤー移動
  if (keys["ArrowLeft"] || keys["a"]) playerX -= 7;
  if (keys["ArrowRight"] || keys["d"]) playerX += 7;

  playerX = Math.max(
    0,
    Math.min(game.clientWidth - player.offsetWidth, playerX)
  );
  player.style.left = playerX + "px";

  // 距離とスピード
  distance += 0.15;
  speed = 4 + Math.floor(distance / 100);

  // 障害物生成
  if (ts - lastObstacleTime > 300) {
    createObstacle();
    lastObstacleTime = ts;
  }

  const p = player.getBoundingClientRect();

  obstacles.forEach((o, i) => {
    o.y += speed;
    o.el.style.top = o.y + "px";

    const r = o.el.getBoundingClientRect();
    const hit = 10;

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
    }

    if (o.y > game.clientHeight + 100) {
      o.el.remove();
      obstacles.splice(i, 1);
    }
  });

  updateUI();
  requestAnimationFrame(loop);
}

/* ===== 起動処理 ===== */
window.addEventListener("load", () => {
  // サイズ確定後に初期化
  playerX = (game.clientWidth - player.offsetWidth) / 2;
  player.style.left = playerX + "px";

  running = true;
  requestAnimationFrame(loop);
});
