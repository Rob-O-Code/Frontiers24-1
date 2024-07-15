function initKeyboard() {
    const keyboardRow1 = document.getElementById("keyboard-row1");
    const keyboardRow2 = document.getElementById("keyboard-row2");
    const keyboardRow3 = document.getElementById("keyboard-row3");
    const ROW1 = "qwertyuiop";
    const ROW2 = "asdfghjkl";
    const ROW3 = "zxcvbnm";

    var backspaceDiv = document.createElement("div");
    backspaceDiv.classList.add("keyboard-backspace");
    backspaceDiv.innerHTML = "←";
    backspaceDiv.onclick = () => {deleteLetter(true);}
    keyboardRow3.appendChild(backspaceDiv);

    for (const [kR, ROW] of [[keyboardRow1, ROW1], [keyboardRow2, ROW2], [keyboardRow3, ROW3]]) {
        for (const c of ROW) {
            var keyDiv = document.createElement("div");
            keyDiv.id = `keyboard-${c}`;
            keyDiv.classList.add("keyboard-key");
            keyDiv.innerHTML = c.toUpperCase();
            keyDiv.onclick = () => {keyPress(c);}
            kR.appendChild(keyDiv);
        }
    }

    var enterDiv = document.createElement("div");
    enterDiv.classList.add("keyboard-enter");
    enterDiv.innerHTML = "enter";
    enterDiv.onclick = () => {makeGuess();}
    keyboardRow3.appendChild(enterDiv);
}

function initBoard() {
    for (let r = 0; r < RMAX; r++) {
        var row = document.createElement("div");
        letters[r] = [];
        for (let c = 0; c < CMAX; c++) {
            var box = document.createElement("div");
            box.classList.add("letter");
            box.classList.add("blank");
            box.onclick = () => {
                lastMove = MOVE.CLICK;
                rSelected = r;
                cSelected = c;
                setSelectedLetter();
            };
            letters[r][c] = box;
            row.appendChild(box);
        }
        guessBoard.appendChild(row);
    }
}

function randomBackgroundColor() {
    let random = randInt(135, 225);
    let colorString = `hsl(${random},80%,90%)`;
    body.style.backgroundColor = colorString;
}