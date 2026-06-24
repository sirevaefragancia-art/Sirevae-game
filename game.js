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

const SHOP_LINK = "https://14diuj-yr.myshopify.com/";

let W = 0, H = 0;
let gameStarted = false;
let won = false;
let score = 0;
let messageTimer = 0;

const keys = { w:false, a:false, s:false, d:false, arrowup:false, arrowdown:false, arrowleft:false, arrowright:false };
const world = { width: 1800, height: 1300 };
const camera = { x: 0, y: 0 };
const player = { x: 520, y: 520, r: 20, speed: 4.4, direction: 0 };

const perfumeImg = new Image();
perfumeImg.src = "assets/perfume.png";

const zones = [
  { name: "Centro", x: 0, y: 0, w: 620, h: 430 },
  { name: "Zona Neón", x: 620, y: 0, w: 600, h: 430 },
  { name: "Puente", x: 1220, y: 0, w: 580, h: 430 },
  { name: "Parque", x: 0, y: 430, w: 620, h: 420 },
  { name: "Tienda", x: 620, y: 430, w: 600, h: 420 },
  { name: "Barrio", x: 1220, y: 430, w: 580, h: 420 },
  { name: "Distrito Venom", x: 0, y: 850, w: 1800, h: 450 }
];

const perfumes = [
  { x: 230, y: 205, got: false, text: "+ Confianza" },
  { x: 500, y: 705, got: false, text: "+ Estilo" },
  { x: 850, y: 190, got: false, text: "+ Presencia" },
  { x: 1040, y: 645, got: false, text: "+ Carisma" },
  { x: 1460, y: 250, got: false, text: "+ Energía" },
  { x: 1600, y: 780, got: false, text: "+ Seguridad" },
  { x: 330, y: 1040, got: false, text: "+ Actitud" },
  { x: 760, y: 1070, got: false, text: "+ Elegancia" },
  { x: 1180, y: 1080, got: false, text: "+ Misterio" },
  { x: 1570, y: 1110, got: false, text: "+ Venom" }
];

const npcs = [
  { x: 360, y: 330, vx: 1.0, vy: 0, phrase: "Escuché hablar de Venom." },
  { x: 940, y: 330, vx: 0, vy: 0.9, phrase: "Hay 10 frascos escondidos." },
  { x: 1320, y: 690, vx: -0.9, vy: 0, phrase: "¿Ya encontraste todos?" },
  { x: 690, y: 850, vx: 1.1, vy: 0, phrase: "La ciudad cambia con Venom." }
];

const cars = [
  { x: 120, y: 530, vx: 3.0, vy: 0, color: "#20242e" },
  { x: 980, y: 530, vx: -2.5, vy: 0, color: "#10131b" },
  { x: 1400, y: 260, vx: 0, vy: 2.7, color: "#222" },
  { x: 1400, y: 920, vx: 0, vy: -2.3, color: "#161a20" }
];

function resize() {
  W = canvas.width = window.innerWidth * devicePixelRatio;
  H = canvas.height = window.innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  W = window.innerWidth;
  H = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

function setKey(key, value) {
  const k = String(key || "").toLowerCase();
  if (k in keys) keys[k] = value;
}

window.addEventListener("keydown", e => setKey(e.key, true));
window.addEventListener("keyup", e => setKey(e.key, false));

function connectMobileControls() {
  document.querySelectorAll("#mobileControls button").forEach(btn => {
    const key = btn.dataset.key;
    const press = e => { e.preventDefault(); setKey(key, true); };
    const release = e => { e.preventDefault(); setKey(key, false); };
    btn.addEventListener("touchstart", press, { passive: false });
    btn.addEventListener("touchend", release, { passive: false });
    btn.addEventListener("touchcancel", release, { passive: false });
    btn.addEventListener("pointerdown", press);
    btn.addEventListener("pointerup", release);
    btn.addEventListener("pointerleave", release);
  });
}
connectMobileControls();

startBtn.addEventListener("click", startGame);
startBtn.addEventListener("touchstart", e => { e.preventDefault(); startGame(); }, { passive:false });
restartBtn.addEventListener("click", () => location.reload());

function startGame() {
  startScreen.classList.remove("active");
  gameStarted = true;
  won = false;
  showMessage("Recolectá los 10 perfumes Venom.");
}

function showMessage(text) {
  messageBox.textContent = text;
  messageBox.classList.add("show");
  messageTimer = 150;
}

function updateCamera() {
  camera.x = Math.max(0, Math.min(world.width - W, player.x - W / 2));
  camera.y = Math.max(0, Math.min(world.height - H, player.y - H / 2));
}

function updatePlayer() {
  let dx = 0, dy = 0;
  if (keys.w || keys.arrowup) dy -= 1;
  if (keys.s || keys.arrowdown) dy += 1;
  if (keys.a || keys.arrowleft) dx -= 1;
  if (keys.d || keys.arrowright) dx += 1;
  if (dx || dy) {
    const len = Math.hypot(dx, dy);
    player.x += (dx / len) * player.speed;
    player.y += (dy / len) * player.speed;
    player.direction = Math.atan2(dy, dx);
  }
  player.x = Math.max(35, Math.min(world.width - 35, player.x));
  player.y = Math.max(55, Math.min(world.height - 55, player.y));
}

function updateCollectibles() {
  perfumes.forEach(p => {
    if (!p.got && Math.hypot(player.x - p.x, player.y - p.y) < 52) {
      p.got = true;
      score += 1;
      scoreEl.textContent = score;
      presenceEl.textContent = score * 10;
      showMessage(p.text);
      if (score === perfumes.length) win();
    }
  });
}

function updateNPCs() {
  npcs.forEach(n => {
    n.x += n.vx; n.y += n.vy;
    if (n.x < 100 || n.x > world.width - 100) n.vx *= -1;
    if (n.y < 100 || n.y > world.height - 100) n.vy *= -1;
    if (gameStarted && Math.hypot(player.x - n.x, player.y - n.y) < 65 && messageTimer < 20) showMessage(n.phrase);
  });
}

function updateCars() {
  cars.forEach(c => {
    c.x += c.vx; c.y += c.vy;
    if (c.x > world.width + 80) c.x = -80;
    if (c.x < -80) c.x = world.width + 80;
    if (c.y > world.height + 80) c.y = -80;
    if (c.y < -80) c.y = world.height + 80;
  });
}

function updateZone() {
  const z = zones.find(z => player.x >= z.x && player.x <= z.x + z.w && player.y >= z.y && player.y <= z.y + z.h);
  if (z) zoneNameEl.textContent = z.name;
}

function win() {
  if (won) return;
  won = true;
  player.speed = 5.2;
  showMessage("VENOM DESBLOQUEADO: modo presencia activado.");
  setTimeout(() => winScreen.classList.add("active"), 900);
}

function drawWorld() {
  ctx.fillStyle = won ? "#07111d" : "#0a0b0f";
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  ctx.fillStyle = "#14161c";
  ctx.fillRect(0, 0, world.width, world.height);

  zones.forEach((z, i) => {
    ctx.fillStyle = i % 2 ? "#101722" : "#111318";
    ctx.fillRect(z.x, z.y, z.w, z.h);
    ctx.fillStyle = "rgba(255,255,255,.075)";
    ctx.font = "bold 28px monospace";
    ctx.fillText(z.name.toUpperCase(), z.x + 24, z.y + 48);
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
  ctx.fillStyle = "#1f2229";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(255,255,255,.22)";
  ctx.lineWidth = 4;
  ctx.setLineDash([28, 28]);
  ctx.beginPath();
  if (w > h) { ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); }
  else { ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); }
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawBuildings() {
  const buildings = [[80,80,160,100],[300,80,170,120],[740,80,170,120],[970,80,190,110],[80,650,220,150],[710,650,190,140],[970,670,160,130],[1500,610,190,160],[90,1080,180,130],[930,1120,180,120],[1450,1040,230,150]];
  buildings.forEach((b, idx) => {
    ctx.fillStyle = idx % 2 ? "#0d0f14" : "#181a22";
    ctx.fillRect(b[0], b[1], b[2], b[3]);
    ctx.fillStyle = "rgba(95,216,255,.35)";
    for (let x = b[0] + 18; x < b[0] + b[2] - 12; x += 38) {
      for (let y = b[1] + 18; y < b[1] + b[3] - 12; y += 34) ctx.fillRect(x, y, 15, 11);
    }
  });
}

function drawPark() {
  ctx.fillStyle = "#0d2517";
  ctx.fillRect(55, 675, 430, 140);
  ctx.fillRect(150, 1010, 300, 180);
  ctx.fillStyle = "#153b24";
  for (let i = 0; i < 18; i++) {
    ctx.beginPath();
    ctx.arc(80 + i * 68, 760 + (i % 3) * 150, 23, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBridge() {
  ctx.fillStyle = "#182333";
  ctx.fillRect(1230, 70, 500, 95);
  ctx.fillStyle = "rgba(95,216,255,.15)";
  ctx.fillRect(1230, 170, 500, 60);
}

function drawNeon() {
  ctx.strokeStyle = won ? "rgba(255,255,255,.65)" : "rgba(95,216,255,.42)";
  ctx.lineWidth = 6;
  ctx.strokeRect(715, 245, 380, 100);
  ctx.fillStyle = won ? "rgba(255,255,255,.20)" : "rgba(95,216,255,.18)";
  ctx.fillRect(720, 250, 370, 90);
}

function drawPerfumes() {
  perfumes.forEach(p => {
    if (p.got) return;
    const pulse = 1 + Math.sin(Date.now() / 170) * 0.08;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.shadowColor = "#5fd8ff";
    ctx.shadowBlur = 22;
    if (perfumeImg.complete && perfumeImg.naturalWidth > 0) ctx.drawImage(perfumeImg, -20 * pulse, -32 * pulse, 40 * pulse, 64 * pulse);
    else {
      ctx.fillStyle = "#5fd8ff";
      ctx.fillRect(-12, -24, 24, 48);
      ctx.fillStyle = "#fff";
      ctx.fillText("V", -4, 5);
    }
    ctx.restore();
  });
}

function drawCars() {
  cars.forEach(c => {
    ctx.save();
    ctx.translate(c.x, c.y);
    if (c.vy) ctx.rotate(Math.PI / 2);
    ctx.fillStyle = c.color;
    ctx.fillRect(-28, -15, 56, 30);
    ctx.fillStyle = "rgba(95,216,255,.55)";
    ctx.fillRect(-12, -11, 24, 9);
    ctx.restore();
  });
}

function drawNPCs() {
  npcs.forEach(n => {
    ctx.fillStyle = "#c8c8c8";
    ctx.fillRect(n.x - 8, n.y - 18, 16, 34);
    ctx.fillStyle = "#222";
    ctx.fillRect(n.x - 9, n.y + 15, 7, 17);
    ctx.fillRect(n.x + 2, n.y + 15, 7, 17);
  });
}

function drawSkeleton() {
  ctx.save();
  ctx.translate(player.x, player.y);
  const walk = Math.sin(Date.now() / 120) * 3;
  ctx.shadowColor = won ? "#ffffff" : "#5fd8ff";
  ctx.shadowBlur = won ? 28 : 10;
  ctx.fillStyle = "#d8d0bf";
  ctx.beginPath();
  ctx.arc(0, -25, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#050505";
  ctx.beginPath();
  ctx.arc(-6, -28, 4.5, 0, Math.PI * 2);
  ctx.arc(6, -28, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = won ? "#10243a" : "#030303";
  ctx.fillRect(-16, -8, 32, 36);
  ctx.strokeStyle = "#d8d0bf";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-17, 0); ctx.lineTo(-29, 25 + walk);
  ctx.moveTo(17, 0); ctx.lineTo(29, 25 - walk);
  ctx.stroke();
  ctx.fillStyle = "#09090b";
  ctx.fillRect(-14, 26, 10, 31 + walk);
  ctx.fillRect(4, 26, 10, 31 - walk);
  ctx.fillStyle = "#f4f4f4";
  ctx.fillRect(-18, 56 + walk, 16, 8);
  ctx.fillRect(2, 56 - walk, 16, 8);
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(27, 19, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMiniMap() {
  const mw = 120, mh = 86, x = W - mw - 16, y = H - mh - 16;
  ctx.fillStyle = "rgba(0,0,0,.65)";
  ctx.fillRect(x, y, mw, mh);
  ctx.strokeStyle = "rgba(95,216,255,.5)";
  ctx.strokeRect(x, y, mw, mh);
  ctx.fillStyle = "#5fd8ff";
  ctx.fillRect(x + player.x / world.width * mw - 2, y + player.y / world.height * mh - 2, 4, 4);
  ctx.fillStyle = "#fff";
  perfumes.forEach(p => { if (!p.got) ctx.fillRect(x + p.x / world.width * mw - 1, y + p.y / world.height * mh - 1, 2, 2); });
}

function loop() {
  if (gameStarted && !won) {
    updatePlayer();
    updateCollectibles();
    updateNPCs();
    updateCars();
    updateZone();
  } else {
    updateNPCs();
    updateCars();
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
  drawMiniMap();

  if (messageTimer > 0) messageTimer--;
  else messageBox.classList.remove("show");

  requestAnimationFrame(loop);
}
loop();
