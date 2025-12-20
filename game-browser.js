(function() {
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

    window.addEventListener("keydown", e => { keys[e.key] = true; });
    window.addEventListener("keyup", e => { keys[e.key] = false; });

    function init() {
        playerX = (game.clientWidth - player.offsetWidth) / 2;
        player.style.left = playerX + "px";
        requestAnimationFrame(loop);
    }

    function createObstacle(ts) {
        const obs = document.createElement("div");
        obs.className = "obstacle";
        
        // 画像のランダム選択
        const img = Math.random() < 0.5 ? "enemy1ver2.png" : "enemy2ver2.png";
        obs.style.backgroundImage = `url("${img}")`;
        
        // ★ 以前追加していた赤い背景色 (background-color) を削除しました

        const margin = 40;
        const maxX = game.clientWidth - 56 - margin * 2;
        obs.style.left = (margin + Math.random() * maxX) + "px";

        game.appendChild(obs);
        obstacles.push({ el: obs, y: -80 });
        lastObstacleTime = ts;
    }

    function updateUI() {
        heartsEl.textContent = "❤️".repeat(Math.max(0, lives));
        distanceEl.textContent = Math.floor(distance) + "m";
    }

    function loop(ts) {
        if (!running) return;

        // プレイヤー移動
        if (keys["ArrowLeft"] || keys["a"]) playerX -= 7;
        if (keys["ArrowRight"] || keys["d"]) playerX += 7;

        playerX = Math.max(0, Math.min(game.clientWidth - player.offsetWidth, playerX));
        player.style.left = playerX + "px";

        // スコアと難易度
        distance += 0.15;
        speed = 4 + Math.floor(distance / 100);

        // 敵の生成
        if (ts - lastObstacleTime > 350) {
            createObstacle(ts);
        }

        const p = player.getBoundingClientRect();

        for (let i = obstacles.length - 1; i >= 0; i--) {
            const o = obstacles[i];
            o.y += speed;
            o.el.style.top = o.y + "px";

            const r = o.el.getBoundingClientRect();
            
            // 当たり判定の絞り込み（12px分内側で判定）
            const hit = 12;

            if (p.left + hit < r.right - hit &&
                p.right - hit > r.left + hit &&
                p.top + hit < r.bottom - hit &&
                p.bottom - hit > r.top + hit) {
                
                lives--;
                updateUI();
                
                o.el.remove();
                obstacles.splice(i, 1);

                if (lives <= 0) {
                    running = false;
                    finalDistanceEl.textContent = Math.floor(distance);
                    gameoverEl.style.display = "flex";
                }
                continue;
            }

            if (o.y > game.clientHeight + 100) {
                o.el.remove();
                obstacles.splice(i, 1);
            }
        }

        updateUI();
        requestAnimationFrame(loop);
    }

    window.addEventListener("load", init);
})();