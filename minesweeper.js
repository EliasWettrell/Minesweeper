// Vänta tills sidan är laddad
document.addEventListener("DOMContentLoaded", () => {

    // Hämta spel-container
    const game = document.getElementById("game");
  
    // Storlek på spelplan
    const size = 10;
  
    // 2D-array (speldata)
    const board = [];
  
    // Skapa spelplan (data)
    for (let y = 0; y < size; y++) {
      board[y] = [];
  
      for (let x = 0; x < size; x++) {
        board[y][x] = {
          revealed: false
        };
      }
    }
  
    // Rita ut rutnät
    function drawBoard() {
      game.innerHTML = "";
  
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
  
          const cell = document.createElement("div");
          cell.classList.add("cell");
  
          // Klick på ruta
          cell.addEventListener("click", () => {
            revealCell(x, y);
          });
  
          game.appendChild(cell);
        }
      }
    }
  
    // Vad som händer när man klickar
    function revealCell(x, y) {
      board[y][x].revealed = true;
      updateUI();
    }
  
    // Uppdatera det visuella
    function updateUI() {
      const cells = document.querySelectorAll(".cell");
  
      cells.forEach((el, index) => {
        const x = index % size;
        const y = Math.floor(index / size);
  
        if (board[y][x].revealed) {
          el.style.background = "#eee";
          el.textContent = "✓";
        }
      });
    }
  
    // Starta spelet
    drawBoard();
  
  });