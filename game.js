const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const presenceEl = document.getElementById("presence");
const zoneNameEl = document.getElementById("zoneName");
const messageBox = document.getElementById("messageBox");
const startScreen = document.getElementById("startScreen");
const winScreen = document.getElementById("winScreen");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const perfumeImg = new Image();
perfumeImg.src = "assets/perfume.png";

let W, H, gameStarted = false, won = false, score = 0, messageTimer = 0;
const keys = {};
const player = { x: 520, y: 520, r: 18, speed: 4.2, glow: 0 };

const world = { width: 1800, height: 1300 };
const camera = { x: 0, y: 0 };

const zones = [
  { name: "Centro", x: 0, y: 0, w: 620, h: 430 },
  { name: "Zona Neón", x: 620, y: 0, w: 600, h: 430 },
  { name: "Puente", x: 1220, y: 0, w: 580, h: 430 },
  { name: "Parque", x: 0, y: 430, w: 620, h: 420 },
  { name: "Tienda", x: 620, y: 430, w: 600, h: 420 },
  { name: "Barrio", x: 1220, y: 430, w: 580, h: 420 }
];

const perfumes = [
  { x: 220, y: 210, got: false, text: "+ Confianza" },
  { x: 515, y: 700, got: false, text: "+ Estilo" },
  { x: 850, y: 190, got: false, text: "+ Presencia" },
  { x: 1040, y: 640, got: false, text: "+ Carisma" },
  { x: 1460, y: 250, got: false, text: "+ Energía" },
  { x: 1600, y: 780, got: false, text: "+ Seguridad" },
  { x: 330, y: 1040, got: false, text: "+ Actitud" },
  { x: 760, y: 1070, got: false, text: "+ Elegancia" },
  { x: 1180, y: 1080, got: false, text: "+ Misterio" },
  { x: 1570, y: 1110, got: false, text: "+ Venom" }
];

const npcs = [
  { x: 360, y: 330, vx: 1, vy: 0, phrase: "Escuché hablar de Venom." },
  { x: 940, y: 330, vx: 0, vy: 1, phrase: "Dicen que hay 10 frascos escondidos." },
  { x: 1320, y: 690, vx: -1, vy: 0, phrase: "¿Ya encontraste todos?" },
  { x: 690, y: 850, vx: 1, vy: 0, phrase: "La ciudad cambia cuando juntás Venom." }
];

const cars = [
  { x: 100, y: 505, vx: 3.2, color: "#242a33" },
  { x: 950, y: 505, vx: -2.6, color: "#10131b" },
  { x: 1390, y: 250, vy: 2.9, color: "#202020" },
  { x: 1390, y: 920, vy: -2.4, color: "#161a20" }
];

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

document.querySelectorAll("#mobileControls button").forEach(btn => {
  const key = btn.dataset.key;

  const press = (e) => {
    e.preventDefault();
    keys[key] = true;
  };

  const release = (e) => {
    e.preventDefault();
    keys[key] = false;
  };

  btn.addEventListener("touchstart", press, { passive: false });
  btn.addEventListener("touchend", release, { passive: false });
  btn.addEventListener("touchcancel", release, { passive: false });

  btn.addEventListener("pointerdown", press);
  btn.addEventListener("pointerup", release);
  btn.addEventListener("pointerleave", release);
});

startBtn.onclick = () => { startScreen.classList.remove("active"); gameStarted = true; showMessage("Recolectá los 10 perfumes Venom."); };
restartBtn.onclick = () => location.reload();

function showMessage(text) {
  messageBox.textContent = text;
  messageBox.classList.add("show");
  messageTimer = 150;
}

function updateCamera() {
  camera.x = Math.max(0, Math.min(world.width - W, player.x - W / 2));
  camera.y = Math.max(0, Math.min(world.height - H, player.y - H / 2));
}

function drawWorld() {
  ctx.fillStyle = won ? "#07101b" : "#0a0b0f";
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  ctx.fillStyle = "#14161c";
  ctx.fillRect(0, 0, world.width, world.height);

  zones.forEach((z, i) => {
    ctx.fillStyle = i % 2 ? "#101722" : "#111318";
    ctx.fillRect(z.x, z.y, z.w, z.h);
    ctx.fillStyle = "rgba(255,255,255,.08)";
    ctx.font = "28px monospace";
    ctx.fillText(z.name.toUpperCase(), z.x + 26, z.y + 48);
  });

  drawRoad(0, 470, world.width, 120);
  drawRoad(1340, 0, 120, world.height);
  drawRoad(0, 910, world.width, 100);
  drawRoad(560, 0, 100, world.height);

  drawBuildings();
  drawPark();
  drawBridge();
  drawNeon();
  ctx.restore();
}

function drawRoad(x, y, w, h) {
  ctx.fillStyle = "#1e2027";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(255,255,255,.22)";
  ctx.setLineDash([28, 28]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (w > h) { ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); }
  else { ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); }
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawBuildings() {
  const buildings = [
    [80,80,160,100], [300,80,170,120], [740,80,170,120], [970,80,190,110],
    [80,650,220,150], [710,650,190,140], [970,670,160,130], [1500,610,190,160],
    [90,1080,180,130], [930,1120,180,120], [1450,1040,230,150]
  ];
  buildings.forEach((b, idx) => {
    ctx.fillStyle = idx % 2 ? "#0e0f14" : "#181a22";
    ctx.fillRect(...b);
    ctx.fillStyle = "rgba(95,216,255,.35)";
    for (let x = b[0] + 18; x < b[0] + b[2] - 12; x += 38) {
      for (let y = b[1] + 18; y < b[1] + b[3] - 12; y += 34) ctx.fillRect(x, y, 14, 10);
    }
  });
}
function drawPark() {
  ctx.fillStyle = "#0f2418";
  ctx.fillRect(55, 675, 430, 140);
  ctx.fillRect(150, 1010, 300, 180);
  ctx.fillStyle = "#153b24";
  for (let i = 0; i < 18; i++) { ctx.beginPath(); ctx.arc(80 + i * 68, 760 + (i%3)*150, 22, 0, Math.PI*2); ctx.fill(); }
}
function drawBridge() {
  ctx.fillStyle = "#182333";
  ctx.fillRect(1230, 70, 500, 95);
  ctx.fillStyle = "rgba(95,216,255,.15)";
  ctx.fillRect(1230, 170, 500, 60);
}
function drawNeon() {
  ctx.strokeStyle = won ? "rgba(255,255,255,.55)" : "rgba(95,216,255,.35)";
  ctx.lineWidth = 5;
  ctx.strokeRect(715, 245, 380, 100);
  ctx.fillStyle = won ? "rgba(255,255,255,.2)" : "rgba(95,216,255,.18)";
  ctx.fillRect(720, 250, 370, 90);
}

function drawPerfumes() {
  perfumes.forEach(p => {
    if (p.got) return;
    const pulse = 1 + Math.sin(Date.now()/180) * .08;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.shadowColor = "#5fd8ff";
    ctx.shadowBlur = 18;
    if (perfumeImg.complete) ctx.drawImage(perfumeImg, -18*pulse, -28*pulse, 36*pulse, 56*pulse);
    else { ctx.fillStyle = "#5fd8ff"; ctx.fillRect(-12, -22, 24, 44); }
    ctx.restore();
  });
}

function drawSkeleton() {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.shadowColor = won ? "#ffffff" : "#5fd8ff";
  ctx.shadowBlur = won ? 24 : 8;
  ctx.fillStyle = "#d8d0bf"; ctx.beginPath(); ctx.arc(0, -23, 16, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(-6, -25, 4, 0, Math.PI*2); ctx.arc(6, -25, 4, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = won ? "#101e2d" : "#050505"; ctx.fillRect(-15, -8, 30, 34);
  ctx.strokeStyle = "#d8d0bf"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-17, 0); ctx.lineTo(-28, 27); ctx.moveTo(17, 0); ctx.lineTo(28, 27); ctx.stroke();
  ctx.fillStyle = "#0a0a0d"; ctx.fillRect(-13, 25, 10, 30); ctx.fillRect(3, 25, 10, 30);
  ctx.fillStyle = "#f5f5f5"; ctx.fillRect(-16, 55, 14, 7); ctx.fillRect(2, 55, 14, 7);
  ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(27, 21, 5, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function updatePlayer() {
  let dx = 0, dy = 0;
console.log("Moviendo jugador");
  if (keys.w || keys.arrowup) dy -= 1;
  if (keys.s || keys.arrowdown) dy += 1;
  if (keys.a || keys.arrowleft) dx -= 1;
  if (keys.d || keys.arrowright) dx += 1;
  if (dx || dy) { const len = Math.hypot(dx, dy); player.x += dx/len*player.speed; player.y += dy/len*player.speed; }
  player.x = Math.max(30, Math.min(world.width - 30, player.x));
  player.y = Math.max(45, Math.min(world.height - 45, player.y));
}

function updateCollectibles() {
  perfumes.forEach(p => {
    if (!p.got && Math.hypot(player.x - p.x, player.y - p.y) < 42) {
      p.got = true; score++; scoreEl.textContent = score; presenceEl.textContent = Math.round(score * 10);
      showMessage(p.text);
      if (score === perfumes.length) win();
    }
  });
}

function drawNPCs() {
  npcs.forEach(n => {
    n.x += n.vx; n.y += n.vy;
    if (n.x < 120 || n.x > world.width - 120) n.vx *= -1;
    if (n.y < 120 || n.y > world.height - 120) n.vy *= -1;
    ctx.fillStyle = "#c8c8c8"; ctx.fillRect(n.x-8, n.y-16, 16, 32);
    ctx.fillStyle = "#222"; ctx.fillRect(n.x-9, n.y+16, 7, 16); ctx.fillRect(n.x+2, n.y+16, 7, 16);
    if (Math.hypot(player.x - n.x, player.y - n.y) < 70) showMessage(n.phrase);
  });
}
function drawCars() {
  cars.forEach(c => {
    c.x += c.vx || 0; c.y += c.vy || 0;
    if (c.x > world.width + 80) c.x = -80; if (c.x < -90) c.x = world.width + 80;
    if (c.y > world.height + 80) c.y = -80; if (c.y < -90) c.y = world.height + 80;
    ctx.fillStyle = c.color; ctx.fillRect(c.x-26, c.y-14, 52, 28);
    ctx.fillStyle = "rgba(95,216,255,.5)"; ctx.fillRect(c.x-12, c.y-10, 24, 8);
  });
}

function updateZone() {
  const z = zones.find(z => player.x >= z.x && player.x <= z.x+z.w && player.y >= z.y && player.y <= z.y+z.h);
  if (z) zoneNameEl.textContent = z.name;
}
function win() {
  won = true;
  player.speed = 4.2;
  showMessage("VENOM DESBLOQUEADO: modo presencia activado.");

  setTimeout(() => {
    window.location.href = "https://14diuj-yr.myshopify.com/";
  }, 2000);
}

function loop() {
  if (gameStarted && !won) {
    updatePlayer();
    updateCollectibles();
    updateZone();
  }

  updateCamera();
  drawWorld();

  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  drawCars();
  drawPerfumes();
  drawNPCs();
  drawSkeleton();

  ctx.restore();

  if (messageTimer > 0) {
    messageTimer--;
  } else {
    messageBox.classList.remove("show");
  }

  requestAnimationFrame(loop);
}

loop();