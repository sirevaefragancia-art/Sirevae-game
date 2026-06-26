const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const winScreen = document.getElementById("winScreen");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const music = document.getElementById("music");
const pickupSound = document.getElementById("pickupSound");
const hitSound = document.getElementById("hitSound");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameStarted = false;

const player = {
  x: 100,
  y: 100,
  size: 30,
  speed: 4,
  perfumes: 0,
  lives: 3
};

const keys = {};

const perfumes = [
  { x: 200, y: 150, taken: false },
  { x: 400, y: 300, taken: false },
  { x: 600, y: 200, taken: false },
  { x: 250, y: 450, taken: false },
  { x: 700, y: 400, taken: false },
  { x: 900, y: 200, taken: false },
  { x: 1000, y: 500, taken: false },
  { x: 500, y: 550, taken: false },
  { x: 850, y: 100, taken: false },
  { x: 1200, y: 350, taken: false }
];

const enemies = [
  { x: 300, y: 300, size: 35, speed: 2 },
  { x: 700, y: 150, size: 35, speed: 2.3 },
  { x: 900, y: 450, size: 35, speed: 2.5 }
];

document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

document.querySelectorAll("#mobileControls button").forEach(btn => {
  btn.addEventListener("touchstart", () => keys[btn.dataset.key] = true);
  btn.addEventListener("touchend", () => keys[btn.dataset.key] = false);
});

startBtn.addEventListener("click", () => {
  gameStarted = true;
  startScreen.classList.remove("active");

  if (music) {
    music.volume = 0.4;
    music.play().catch(() => {});
  }
});

restartBtn.addEventListener("click", () => {
  location.reload();
});

function drawPlayer() {
  ctx.fillStyle = "white";
  ctx.fillRect(player.x, player.y, player.size, player.size);
}

function drawPerfumes() {
  ctx.fillStyle = "#00ff88";
  perfumes.forEach(p => {
    if (!p.taken) {
      ctx.fillRect(p.x, p.y, 20, 35);
    }
  });
}

function drawEnemies() {
  ctx.fillStyle = "red";
  enemies.forEach(e => {
    ctx.fillRect(e.x, e.y, e.size, e.size);
  });
}

function movePlayer() {
  if (keys["arrowup"] || keys["w"]) player.y -= player.speed;
  if (keys["arrowdown"] || keys["s"]) player.y += player.speed;
  if (keys["arrowleft"] || keys["a"]) player.x -= player.speed;
  if (keys["arrowright"] || keys["d"]) player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));
}

function moveEnemies() {
  enemies.forEach(enemy => {
    if (enemy.x < player.x) enemy.x += enemy.speed;
    if (enemy.x > player.x) enemy.x -= enemy.speed;
    if (enemy.y < player.y) enemy.y += enemy.speed;
    if (enemy.y > player.y) enemy.y -= enemy.speed;
  });
}

function collision(a, b, bw, bh) {
  return (
    a.x < b.x + bw &&
    a.x + a.size > b.x &&
    a.y < b.y + bh &&
    a.y + a.size > b.y
  );
}

function checkPerfumes() {
  perfumes.forEach(p => {
    if (!p.taken && collision(player, p, 20, 35)) {
      p.taken = true;
      player.perfumes++;
      player.speed += 0.2;

      document.getElementById("score").textContent = player.perfumes;
      document.getElementById("presence").textContent = player.perfumes * 10;

      if (pickupSound) {
        pickupSound.currentTime = 0;
        pickupSound.play().catch(() => {});
      }
    }
  });
}

function checkEnemies() {
  enemies.forEach(enemy => {
    if (collision(player, enemy, enemy.size, enemy.size)) {
      player.x = 100;
      player.y = 100;

      if (hitSound) {
        hitSound.currentTime = 0;
        hitSound.play().catch(() => {});
      }
    }
  });
}

function checkWin() {
  if (player.perfumes === perfumes.length) {
    gameStarted = false;
    winScreen.classList.add("active");
  }
}

function drawUI() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Perfumes: " + player.perfumes + "/10", 20, 30);
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameStarted) {
    movePlayer();
    moveEnemies();
    checkPerfumes();
    checkEnemies();
    checkWin();
  }

  drawPerfumes();
  drawEnemies();
  drawPlayer();
  drawUI();

  requestAnimationFrame(loop);
}

loop();