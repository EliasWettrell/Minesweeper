let firstClick = true;
const MAX_FIRST_OPEN = 1000000000;
let firstExploredCount = 0; // ✅ FIX 1

const rows = 25;
const cols = 25;
const mineCount = 100;

const boardElement = document.getElementById("board");
const loseScreen = document.getElementById("lose-screen");
const restartBtn = document.getElementById("restart-btn");
const cancelBtn = document.getElementById("cancel-btn");

let gameOver = false;

/* ========================
   SKAPA HTML-RUTOR
======================== */
for (let i = 0; i < rows * cols; i++) {
  const cell = document.createElement("div");
  cell.classList.add("cell", "image");
  boardElement.appendChild(cell);
}

const cells = document.querySelectorAll(".cell");

/* ========================
   SKAPA SPELPLAN
======================== */
let board = [];
for (let r = 0; r < rows; r++) {
  board[r] = [];
  for (let c = 0; c < cols; c++) {
    board[r][c] = 0;
  }
}

/* ========================
   PLACERA MINOR
======================== */
let minesPlaced = 0;
while (minesPlaced < mineCount) {
  const r = Math.floor(Math.random() * rows);
  const c = Math.floor(Math.random() * cols);
  if (board[r][c] !== "M") {
    board[r][c] = "M";
    minesPlaced++;
  }
}

/* ========================
   KOPPLA CELLER ↔ POSITION
======================== */
cells.forEach((cell, index) => {
  const r = Math.floor(index / cols);
  const c = index % cols;
  cell.dataset.row = r;
  cell.dataset.col = c;
});

/* ========================
   EVENTLYSSNARE
======================== */
cells.forEach(cell => {
  cell.addEventListener("click", () => handleClick(cell));
  cell.addEventListener("contextmenu", e => {
    e.preventDefault();
    if (!cell.classList.contains("revealed") && !gameOver) {
      cell.classList.toggle("flag");
    }
  });
});

restartBtn.addEventListener("click", () => location.reload());
cancelBtn.addEventListener("click", () => {
  loseScreen.classList.add("hidden");
});

/* ========================
   KLICK-HANTERING
======================== */
function handleClick(cell) {
  if (gameOver) return;

  if (
    cell.classList.contains("revealed") ||
    cell.classList.contains("flag")
  ) return;

  const r = Number(cell.dataset.row);
  const c = Number(cell.dataset.col);

  // ✅ FIX 3 – reset flood varje klick
  firstExploredCount = 0;

  // Första klicket är säkert
  if (firstClick) {
    if (board[r][c] === "M") {
      moveMine(r, c);
    }

    clearMinesAround(r, c);
    firstClick = false;
  }

  if (board[r][c] === "M") {
    gameOver = true;
    revealAllMines();
    setTimeout(() => {
      loseScreen.classList.remove("hidden");
    }, 300);
    return;
  }

  revealCell(cell);
}

/* ========================
   REVEAL CELL
======================== */
function revealCell(cell) {
  if (cell.classList.contains("revealed")) return;

  const r = Number(cell.dataset.row);
  const c = Number(cell.dataset.col);
  const count = countAdjacentMines(r, c);

  cell.classList.add("revealed");
  cell.classList.remove("image");

  if (count > 0) {
    cell.classList.add(`number-${count}`);
    return;
  }

  // ✅ FIX 2 – markera först
  cell.classList.add("explored");

  // ✅ stoppa efter att rutan räknas
  if (firstExploredCount >= MAX_FIRST_OPEN) return;

  firstExploredCount++;
  revealEmptyNeighbors(r, c);
}

/* ========================
   FLOOD FILL
======================== */
function revealEmptyNeighbors(r, c) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr;
      const nc = c + dc;

      if (
        nr < 0 || nr >= rows ||
        nc < 0 || nc >= cols
      ) continue;

      const neighbor = document.querySelector(
        `.cell[data-row="${nr}"][data-col="${nc}"]`
      );

      if (!neighbor) continue;

      if (
        neighbor.classList.contains("revealed") ||
        neighbor.classList.contains("flag")
      ) continue;

      revealCell(neighbor);
    }
  }
}

/* ========================
   RÄKNA GRANNMINOR
======================== */
function countAdjacentMines(r, c) {
  let count = 0;

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr;
      const nc = c + dc;

      if (
        nr >= 0 && nr < rows &&
        nc >= 0 && nc < cols &&
        board[nr][nc] === "M"
      ) {
        count++;
      }
    }
  }

  return count;
}

/* ========================
   VISA MINOR
======================== */
function revealAllMines() {
  cells.forEach(cell => {
    const r = cell.dataset.row;
    const c = cell.dataset.col;

    if (board[r][c] === "M") {
      cell.classList.add("mine");
    }
  });
}

/* ========================
   FLYTTA MINA
======================== */
function moveMine(fromR, fromC) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] !== "M") {
        board[r][c] = "M";
        board[fromR][fromC] = 0;
        return;
      }
    }
  }
}

function clearMinesAround(r, c) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr;
      const nc = c + dc;

      if (
        nr >= 0 && nr < rows &&
        nc >= 0 && nc < cols &&
        board[nr][nc] === "M"
      ) {
        moveMine(nr, nc);
      }
    }
  }
}