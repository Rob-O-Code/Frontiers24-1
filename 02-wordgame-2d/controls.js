document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "ArrowLeft":
            if (--cSelected < 0) cSelected = 0;
            else lastMove = MOVE.LEFT;
            break;
        case "ArrowUp":
            if (--rSelected < 0) rSelected = 0;
            else lastMove = MOVE.UP;
            break;
        case "ArrowRight":
            if (++cSelected >= CMAX) cSelected = CMAX-1;
            else lastMove = MOVE.RIGHT;
            break;
        case "ArrowDown":
            if (++rSelected >= RMAX) rSelected = RMAX-1;
            else lastMove = MOVE.DOWN;
            break;
        case "Backspace":
            deleteLetter(true);
            break;
        case "Delete":
            deleteLetter(false);
            break;
        case "Enter":
            makeGuess();
            break;
        default:
            return;
    }
    setSelectedLetter();
});

document.addEventListener("keypress", (event) => keyPress(event.key));
    
function keyPress(key) {
    if (secretBoard[rSelected][cSelected] == "") return;
    if (isLetter(key)) {
        if (letters[rSelected][cSelected].innerHTML != key.toUpperCase()) {
            letters[rSelected][cSelected].innerHTML = key.toUpperCase();
            letters[rSelected][cSelected].classList.remove("correct");
            letters[rSelected][cSelected].classList.remove("inword-h");
            letters[rSelected][cSelected].classList.remove("inword-v");
            letters[rSelected][cSelected].classList.remove("inboard");
            letters[rSelected][cSelected].classList.remove("missing");
            letters[rSelected][cSelected].classList.remove("misspell");
            for (let i = rSelected+1; i < RMAX && secretBoard[i][cSelected] != ""; i++)
                letters[i][cSelected].classList.remove("misspell");
            for (let i = cSelected+1; i < CMAX && secretBoard[rSelected][i] != ""; i++)
                letters[rSelected][i].classList.remove("misspell");
            for (let i = rSelected-1; i >= 0 && secretBoard[i][cSelected] != ""; i--)
                letters[i][cSelected].classList.remove("misspell");
            for (let i = cSelected-1; i >= 0 && secretBoard[rSelected][i] != ""; i--)
                letters[rSelected][i].classList.remove("misspell");

        }
        let move;
        let s = checkSurroundings();

        if (s.belowBlank && s.rightBlank) {
            console.log("Going somewhere else...");
        } else if (s.belowBlank) { // Can only go right
            if (s.leftEmpty && !s.aboveBlank) console.log("Going somewhere else...");
            else move = MOVE.RIGHT;
        } else if (s.rightBlank) { // Can only go down
            if (s.aboveEmpty && !s.leftBlank) console.log("Going somewhere else...");
            else move = MOVE.DOWN;
        } else { // Could go both ways...
            if (s.aboveBlank && s.leftBlank) console.log("Not sure...");
            else if (!s.aboveFilled && s.leftBlank) move = MOVE.RIGHT;
            else if (!s.leftFilled && s.aboveBlank) move = MOVE.DOWN;
            else if (s.aboveEmpty && s.leftFilled) move = MOVE.RIGHT;
            else if (s.leftEmpty && s.aboveFilled) move = MOVE.DOWN;
            else if (s.leftFilled && s.rightEmpty && s.belowFilled) move = MOVE.RIGHT;
            else if (s.aboveFilled && s.belowEmpty && s.rightFilled) move = MOVE.DOWN;
            else if (s.aboveFilled && s.leftBlank && s.belowFilled && s.rightEmpty) move = MOVE.RIGHT;
            else if (s.leftFilled && s.aboveBlank && s.rightFilled && s.rightEmpty) move = MOVE.RIGHT;
            else if (lastMove == MOVE.RIGHT) move = MOVE.RIGHT;
            else if (lastMove == MOVE.DOWN) move = MOVE.DOWN;
            else console.log("Going somewhere else... ig?");
        }
        if (move == MOVE.RIGHT) cSelected++;
        else if (move == MOVE.DOWN) rSelected++;
        lastMove = move;
        setSelectedLetter();
    } else if (key === " ") {
        // Flip to other word?
    }
}