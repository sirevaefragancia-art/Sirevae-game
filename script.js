const player = document.getElementById("player");
const game = document.getElementById("game");
const papers = document.querySelectorAll(".paper");
const dialog = document.getElementById("dialog");
const dialogText = document.getElementById("dialogText");
const closeDialog = document.getElementById("closeDialog");

const leftBtn = document.getElementById("left");
const rightBtn = document.getElementById("right");

let playerX = 80;
let speed = 6;
let movingLeft = false;
let movingRight = false;
let canMove = true;

function updateGame() {
  if (canMove) {
    if (movingRight) playerX += speed;
    if (movingLeft) playerX -= speed;
  }

  if (playerX < 20) playerX = 20;
  if (playerX > 2350) playerX = 2350;

  player.style.left = playerX + "px";

  game.scrollTo({
    left: playerX - 120,
    behavior: "auto"
  });

  checkPapers();

  requestAnimationFrame(updateGame);
}

function checkPapers() {
  papers.forEach((paper) => {
    const paperX = paper.offsetLeft;

    if (
      Math.abs(playerX - paperX) < 45 &&
      !paper.classList.contains("read")
    ) {
      paper.classList.add("read");
      paper.style.opacity = "0.3";
      showDialog(paper.dataset.text);
    }
  });
}

function showDialog(text) {
  canMove = false;
  dialogText.textContent = text;
  dialog.style.display = "flex";
}

closeDialog.addEventListener("click", () => {
  dialog.style.display = "none";
  canMove = true;
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
    movingRight = true;
  }

  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
    movingLeft = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
    movingRight = false;
  }

  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
    movingLeft = false;
  }
});

rightBtn.addEventListener("touchstart", () => movingRight = true);
rightBtn.addEventListener("touchend", () => movingRight = false);

leftBtn.addEventListener("touchstart", () => movingLeft = true);
leftBtn.addEventListener("touchend", () => movingLeft = false);

rightBtn.addEventListener("mousedown", () => movingRight = true);
rightBtn.addEventListener("mouseup", () => movingRight = false);

leftBtn.addEventListener("mousedown", () => movingLeft = true);
leftBtn.addEventListener("mouseup", () => movingLeft = false);

updateGame();