let firstClick = true;
const MAX_FIRST_OPEN = 1000000000;
let firstExploredCount = 0;
let revealedcount = 0;

const boardElement = document.getElementById("board");
const loseScreen = document.getElementById("lose-screen");
const winScreen = document.getElementById("win-screen");
const diffscreen = document.getElementById("diff-screen");

const easybtn = document.getElementById("easy-btn");
const mediumbtn = document.getElementById("medium-btn");
const hardbtn = document.getElementById("hard-btn");

let gameOver = false;
let gameWin = false;

let rows;
let cols;
let mineCount;
let totalSafeCells;

let board = [];
let cells = [];

/* Difficulty buttons */
easybtn.addEventListener("click", () => {
  setDifficulty(10, 10, 16);
});

mediumbtn.addEventListener("click", () => {
  setDifficulty(16, 16, 45);
});

hardbtn.addEventListener("click", () => {
  setDifficulty(16, 30, 76);
});

/* Restart and cancel buttons */
/* You have duplicate restart-btn and cancel-btn IDs in HTML,
   so querySelectorAll is safer here. */
document.querySelectorAll("#restart-btn").forEach(btn => {
  btn.addEventListener("click", () => location.reload());
});

document.querySelectorAll("#cancel-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    loseScreen.classList.add("hidden");
    winScreen.classList.add("hidden");
  });
});

/* Set difficulty first, then start game */
function setDifficulty(selectedRows, selectedCols, selectedMineCount) {
  rows = selectedRows;
  cols = selectedCols;
  mineCount = selectedMineCount;
  totalSafeCells = rows * cols - mineCount;

  diffscreen.classList.add("hidden");

  startGame();
}

/* Start/restart game setup */
function startGame() {
  firstClick = true;
  firstExploredCount = 0;
  revealedcount = 0;
  gameOver = false;
  gameWin = false;

  boardElement.innerHTML = "";

  boardElement.style.gridTemplateColumns = `repeat(${cols}, 4rem)`;

  createCells();
  createBoard();
  placeMines();
  connectCellsToBoard();
  addCellEvents();
}

/* Create HTML cells */
function createCells() {
  for (let i = 0; i < rows * cols; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell", "image");
    boardElement.appendChild(cell);
  }

  cells = document.querySelectorAll(".cell");
}

/* Create empty board array */
function createBoard() {
  board = [];

  for (let r = 0; r < rows; r++) {
    board[r] = [];

    for (let c = 0; c < cols; c++) {
      board[r][c] = 0;
    }
  }
}

/* Place mines randomly */
function placeMines() {
  let minesPlaced = 0;

  while (minesPlaced < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);

    if (board[r][c] !== "M") {
      board[r][c] = "M";
      minesPlaced++;
    }
  }
}

/* Add row/col data to every cell */
function connectCellsToBoard() {
  cells.forEach((cell, index) => {
    const r = Math.floor(index / cols);
    const c = index % cols;

    cell.dataset.row = r;
    cell.dataset.col = c;
  });
}

/* Add click and right-click events */
function addCellEvents() {
  cells.forEach(cell => {
    cell.addEventListener("click", () => handleClick(cell));

    cell.addEventListener("contextmenu", e => {
      e.preventDefault();

      if (
        !cell.classList.contains("revealed") &&
        !gameOver
      ) {
        cell.classList.toggle("flag");
      }
    });
  });
}

/* Click handling */
function handleClick(cell) {
  if (gameOver) return;

  if (
    cell.classList.contains("revealed") ||
    cell.classList.contains("flag")
  ) {
    return;
  }

  const r = Number(cell.dataset.row);
  const c = Number(cell.dataset.col);

  firstExploredCount = 0;

  /* First click is safe */
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

/* Reveal one cell */
function revealCell(cell) {
  if (cell.classList.contains("revealed")) return;

  revealedcount++;

  const r = Number(cell.dataset.row);
  const c = Number(cell.dataset.col);
  const count = countAdjacentMines(r, c);

  cell.classList.add("revealed");
  cell.classList.remove("image");
  cell.classList.remove("flag");

  if (count > 0) {
    cell.classList.add(`number-${count}`);
    checkWin();
    return;
  }

  cell.classList.add("explored");

  if (firstExploredCount >= MAX_FIRST_OPEN) return;

  firstExploredCount++;

  revealEmptyNeighbors(r, c);
  checkWin();
}

/* Reveal empty neighboring cells */
function revealEmptyNeighbors(r, c) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr;
      const nc = c + dc;

      if (
        nr < 0 ||
        nr >= rows ||
        nc < 0 ||
        nc >= cols
      ) {
        continue;
      }

      const neighbor = document.querySelector(
        `.cell[data-row="${nr}"][data-col="${nc}"]`
      );

      if (!neighbor) continue;

      if (
        neighbor.classList.contains("revealed") ||
        neighbor.classList.contains("flag")
      ) {
        continue;
      }

      revealCell(neighbor);
    }
  }
}

/* Count adjacent mines */
function countAdjacentMines(r, c) {
  let count = 0;

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr;
      const nc = c + dc;

      if (
        nr >= 0 &&
        nr < rows &&
        nc >= 0 &&
        nc < cols &&
        board[nr][nc] === "M"
      ) {
        count++;
      }
    }
  }

  return count;
}

/* Reveal all mines */
function revealAllMines() {
  cells.forEach(cell => {
    const r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);

    if (board[r][c] === "M") {
      // cell.classList.remove("image");
      cell.classList.add("mine");
    }
  });
}

/* Move mine away from first click */
function moveMine(fromR, fromC) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] !== "M" && !(r === fromR && c === fromC)) {
        board[r][c] = "M";
        board[fromR][fromC] = 0;
        return;
      }
    }
  }
}

/* Clear mines around first click */
function clearMinesAround(r, c) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr;
      const nc = c + dc;

      if (
        nr >= 0 &&
        nr < rows &&
        nc >= 0 &&
        nc < cols &&
        board[nr][nc] === "M"
      ) {
        moveMine(nr, nc);
      }
    }
  }
}

/* Check win */
function checkWin() {
  console.log(revealedcount);

  if (revealedcount === totalSafeCells && !gameOver) {
    gameWin = true;
    gameOver = true;

    revealAllMines();

    setTimeout(() => {
      winScreen.classList.remove("hidden");
    }, 200);
  }
}