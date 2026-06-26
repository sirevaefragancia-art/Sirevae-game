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
let hitCooldown = false;

const keys = {};

const player = {
  x: 120,
  y: 120,
  size: 34,
  speed: 4,
  perfumes: 0,
  lives: 3,
  glow: 0
};

const perfumes = [
  { x: 180, y: 140, taken: false },
  { x: 420, y: 170, taken: false },
  { x: 720, y: 130, taken: false },
  { x: 250, y: 360, taken: false },
  { x: 560, y: 330, taken: false },
  { x: 900, y: 350, taken: false },
  { x: 150, y: 560, taken: false },
  { x: 430, y: 540, taken: false },
  { x: 760, y: 550, taken: false },
  { x: 1050, y: 520, taken: false }
];

const enemies = [
  { x: 320, y: 260, size: 36, speed: 2, dir: 1, axis: "x", min: 220, max: 520 },
  { x: 700, y: 250, size: 36, speed: 2.4, dir: 1, axis: "y", min: 120, max: 470 },
  { x: 980, y: 220, size: 36, speed: 2.8, dir: 1, axis: "x", min: 760, max: 1160 }
];

const buildings = [
  { x: 70, y: 220, w: 130, h: 160 },
  { x: 280, y: 70, w: 150, h: 120 },
  { x: 530, y: 190, w: 140, h: 160 },
  { x: 830, y: 80, w: 170, h: 140 },
  { x: 1040, y: 260, w: 150, h: 180 },
  { x: 300, y: 430, w: 160, h: 130 },
  { x: 620, y: 460, w: 150, h: 120 },
  { x: 910, y: 500, w: 160, h: 120 }
];

document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

document.querySelectorAll("#mobileControls button").forEach(btn => {
  btn.addEventListener("touchstart", e => {
    e.preventDefault();
    keys[btn.dataset.key] = true;
  });

  btn.addEventListener("touchend", e => {
    e.preventDefault();
    keys[btn.dataset.key] = false;
  });
});

startBtn.addEventListener("click", () => {
  gameStarted = true;
  startScreen.classList.remove("active");

  if (music) {
    music.volume = 0.35;
    music.play().catch(() => {});
  }
});

restartBtn.addEventListener("click", () => {
  location.reload();
});

function drawCity() {
  ctx.fillStyle = "#070b14";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#152033";
  ctx.lineWidth = 34;

  for (let y = 100; y < canvas.height; y += 180) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  for (let x = 120; x < canvas.width; x += 240) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  buildings.forEach(b => {
    ctx.fillStyle = "#101827";
    ctx.fillRect(b.x, b.y, b.w, b.h);

    ctx.strokeStyle = "#263c5c";
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x, b.y, b.w, b.h);

    ctx.fillStyle = "#5fd8ff";
    for (let i = 12; i < b.w - 10; i += 28) {
      for (let j = 14; j < b.h - 10; j += 32) {
        ctx.fillRect(b.x + i, b.y + j, 9, 12);
      }
    }
  });

  ctx.fillStyle = "#00ff8855";
  ctx.font = "bold 28px Arial";
  ctx.fillText("SIREVAE", 40, canvas.height - 35);
}

function drawPlayer() {
  ctx.save();

  if (player.glow > 0) {
    ctx.shadowColor = "#00ff88";
    ctx.shadowBlur = 25;
    player.glow--;
  }

  const x = player.x;
  const y = player.y;

  ctx.strokeStyle = "white";
  ctx.lineWidth = 4;
  ctx.fillStyle = "white";

  // cabeza
  ctx.beginPath();
  ctx.arc(x + 17, y + 10, 11, 0, Math.PI * 2);
  ctx.stroke();

  // ojos
  ctx.fillStyle = "#00ff88";
  ctx.beginPath();
  ctx.arc(x + 13, y + 8, 2, 0, Math.PI * 2);
  ctx.arc(x + 21, y + 8, 2, 0, Math.PI * 2);
  ctx.fill();

  // cuerpo
  ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.moveTo(x + 17, y + 22);
  ctx.lineTo(x + 17, y + 48);
  ctx.stroke();

  // brazos
  ctx.beginPath();
  ctx.moveTo(x + 17, y + 30);
  ctx.lineTo(x + 2, y + 42);
  ctx.moveTo(x + 17, y + 30);
  ctx.lineTo(x + 32, y + 42);
  ctx.stroke();

  // piernas
  ctx.beginPath();
  ctx.moveTo(x + 17, y + 48);
  ctx.lineTo(x + 5, y + 68);
  ctx.moveTo(x + 17, y + 48);
  ctx.lineTo(x + 29, y + 68);
  ctx.stroke();

  ctx.restore();
}

function drawPerfumes() {
  perfumes.forEach(p => {
    if (p.taken) return;

    ctx.save();
    ctx.shadowColor = "#00ff88";
    ctx.shadowBlur = 18;

    ctx.fillStyle = "#00ff88";
    ctx.fillRect(p.x, p.y + 8, 22, 34);

    ctx.fillStyle = "#dfffee";
    ctx.fillRect(p.x + 5, p.y, 12, 10);

    ctx.fillStyle = "#001b10";
    ctx.font = "bold 8px Arial";
    ctx.fillText("V", p.x + 8, p.y + 28);

    ctx.restore();
  });
}

function drawEnemies() {
  enemies.forEach(e => {
    ctx.save();
    ctx.shadowColor = "#ff004c";
    ctx.shadowBlur = 18;

    ctx.fillStyle = "#21000c";
    ctx.beginPath();
    ctx.arc(e.x + 18, e.y + 18, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ff004c";
    ctx.beginPath();
    ctx.arc(e.x + 10, e.y + 14, 4, 0, Math.PI * 2);
    ctx.arc(e.x + 26, e.y + 14, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function movePlayer() {
  if (keys["arrowup"] || keys["w"]) player.y -= player.speed;
  if (keys["arrowdown"] || keys["s"]) player.y += player.speed;
  if (keys["arrowleft"] || keys["a"]) player.x -= player.speed;
  if (keys["arrowright"] || keys["d"]) player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - 40, player.x));
  player.y = Math.max(0, Math.min(canvas.height - 70, player.y));
}

function moveEnemies() {
  enemies.forEach(e => {
    if (e.axis === "x") {
      e.x += e.speed * e.dir;
      if (e.x < e.min || e.x > e.max) e.dir *= -1;
    } else {
      e.y += e.speed * e.dir;
      if (e.y < e.min || e.y > e.max) e.dir *= -1;
    }
  });
}

function collision(a, b, bw, bh) {
  return (
    a.x < b.x + bw &&
    a.x + 34 > b.x &&
    a.y < b.y + bh &&
    a.y + 68 > b.y
  );
}

function checkPerfumes() {
  perfumes.forEach(p => {
    if (!p.taken && collision(player, p, 22, 42)) {
      p.taken = true;
      player.perfumes++;
      player.speed += 0.12;
      player.glow = 35;

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
  if (hitCooldown) return;

  enemies.forEach(e => {
    if (collision(player, e, e.size, e.size)) {
      hitCooldown = true;

      player.x = 120;
      player.y = 120;

      if (hitSound) {
        hitSound.currentTime = 0;
        hitSound.play().catch(() => {});
      }

      setTimeout(() => {
        hitCooldown = false;
      }, 900);
    }
  });
}

function checkWin() {
  if (player.perfumes === perfumes.length) {
    gameStarted = false;
    winScreen.classList.add("active");
  }
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawCity();

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

  requestAnimationFrame(loop);
}

loop();