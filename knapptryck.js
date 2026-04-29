
// vänster
document.addEventListener("click", function (e) {
    const cell = e.target;

    if (cell.classList.contains("cell")) {
        cell.classList.add("revealed");
    }
});

// högerklick
const cells = document.querySelectorAll(".cell");

cells.forEach(cell => {
    cell.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        cell.classList.toggle("flag");
    });
});
