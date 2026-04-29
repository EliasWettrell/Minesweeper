let element = document.getElementById("board")

element.classList.add("board")

for(let index = 0; index < 100; index++) {
    const div= document.createElement("div");
    
    div.classList.add("cell");
    div.classList.add("image")
    element.appendChild(div);
}