const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const message = document.getElementById("message");
const startBtn = document.getElementById("startBtn");
const shopBtn = document.getElementById("shopBtn");

// CAMBIÁ ESTE LINK POR EL DE TU PRODUCTO EN SHOPIFY
const shopLink = "https://TU-TIENDA.myshopify.com/products/venom-for-her";

let width;
let height;
let running = false;
let won = false;
let score = 0;
let keys = {};

const player = {
  x: 160,
  y: 160,
  r: 18,
  speed: 4.2,
  face: 0
};

const perfume = {
  x: 220,
  y: 220,
  r: 16
};

const obstacles = [
  { x: 120, y: 160, w: 110, h: 42 },
  { x: 430, y: 115, w: 95, h: 95 },
  { x: 280, y: 340, w: 150, h: 45 },
  { x: 650, y: 300, w: 120, h: 80 }
];

function resize() {
  const rect = canvas.getBoundingClientRect();
  width = Math.floor(rect.width);
  height = Math.floor(rect.height);
  canvas.width = width;
  canvas.height = height;

  player.x = Math.min(player.x, width - 40);
  player.y = Math.min(player.y, height - 40);
  placePerfume();
}

window.addEventListener("resize", resize);

startBtn.addEventListener("click", () => {
  running = true;
  won = false;
  score = 0;
  scoreText.textContent = "0 / 5";
  message.textContent = "Juntá los perfumes. En PC usá WASD o flechas.";
  startBtn.classList.add("hidden");
  shopBtn.classList.add("hidden");
  player.x = width / 2;
  player.y = height / 2;
  placePerfume();
});

shopBtn.addEventListener("click", () => {
  window.location.href = shopLink;
});

document.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

document.querySelectorAll(".controls button").forEach((btn) => {
  const dir = btn.dataset.dir;

  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    keys[dir] = true;
  }, { passive: false });

  btn.addEventListener("touchend", (e) => {
    e.preventDefault();
    keys[dir] = false;
  }, { passive: false });

  btn.addEventListener("mousedown", () => keys[dir] = true);
  btn.addEventListener("mouseup", () => keys[dir] = false);
  btn.addEventListener("mouseleave", () => keys[dir] = false);
});

function drawBackground() {
  ctx.fillStyle = "#13131f";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#25253a";
  ctx.lineWidth = 2;

  for (let x = 0; x < width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y < height; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "#3b3b55";
  ctx.setLineDash([18, 18]);
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawObstacles() {
  ctx.fillStyle = "#272738";
  obstacles.forEach((o) => {
    const ox = Math.min(o.x, width - o.w - 20);
    const oy = Math.min(o.y, height - o.h - 20);

    ctx.fillRect(ox, oy, o.w, o.h);
    ctx.fillStyle = "#34344a";
    ctx.fillRect(ox + 8, oy + 8, o.w - 16, o.h - 16);
    ctx.fillStyle = "#272738";
  });
}

function drawPerfume() {
  ctx.save();
  ctx.translate(perfume.x, perfume.y);

  ctx.fillStyle = "#c084fc";
  ctx.fillRect(-10, -9, 20, 28);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-6, -17, 12, 8);

  ctx.fillStyle = "#0b0b0f";
  ctx.font = "bold 8px Arial";
  ctx.textAlign = "center";
  ctx.fillText("V", 0, 9);

  ctx.restore();
}

function drawSkeleton() {
  const x = player.x;
  const y = player.y;

  ctx.save();
  ctx.translate(x, y);

  // sombra
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(0, 28, 25, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // cabeza
  ctx.fillStyle = "#f5f5f5";
  ctx.beginPath();
  ctx.arc(0, -18, 17, 0, Math.PI * 2);
  ctx.fill();

  // ojos
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(-6, -20, 3.5, 0, Math.PI * 2);
  ctx.arc(6, -20, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // boca
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-6, -9);
  ctx.lineTo(6, -9);
  ctx.stroke();

  // huesos
  ctx.strokeStyle = "#f5f5f5";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 32);

  ctx.moveTo(-18, 8);
  ctx.lineTo(18, 8);

  ctx.moveTo(0, 32);
  ctx.lineTo(-14, 52);

  ctx.moveTo(0, 32);
  ctx.lineTo(14, 52);

  ctx.stroke();

  ctx.restore();
}

function movePlayer() {
  if (!running || won) return;

  let dx = 0;
  let dy = 0;

  if (keys["arrowup"] || keys["w"] || keys["up"]) dy -= 1;
  if (keys["arrowdown"] || keys["s"] || keys["down"]) dy += 1;
  if (keys["arrowleft"] || keys["a"] || keys["left"]) dx -= 1;
  if (keys["arrowright"] || keys["d"] || keys["right"]) dx += 1;

  if (dx !== 0 || dy !== 0) {
    const length = Math.hypot(dx, dy);
    dx = (dx / length) * player.speed;
    dy = (dy / length) * player.speed;
    player.face += 0.12;
  }

  const nextX = player.x + dx;
  const nextY = player.y + dy;

  player.x = Math.max(24, Math.min(width - 24, nextX));
  player.y = Math.max(62, Math.min(height - 24, nextY));
}

function checkCollision() {
  if (!running || won) return;

  const d = Math.hypot(player.x - perfume.x, player.y - perfume.y);

  if (d < player.r + perfume.r + 8) {
    score++;
    scoreText.textContent = `${score} / 5`;

    if (score >= 5) {
      won = true;
      running = false;
      message.textContent = "¡Desbloqueaste VENOM! Tocá el botón y descubrilo.";
      shopBtn.classList.remove("hidden");
    } else {
      message.textContent = "Bien. Seguí juntando perfumes Venom.";
      placePerfume();
    }
  }
}

function placePerfume() {
  if (!width || !height) return;

  perfume.x = 50 + Math.random() * Math.max(80, width - 100);
  perfume.y = 95 + Math.random() * Math.max(80, height - 190);
}

function loop() {
  drawBackground();
  drawObstacles();
  movePlayer();
  drawPerfume();
  drawSkeleton();
  checkCollision();

  if (!running && !won) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, width, height);
  }

  requestAnimationFrame(loop);
}

resize();
loop();
