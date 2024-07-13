const guessBoard = document.getElementById("guess-board");
let letters = [[]];
let rSelected = 0;
let cSelected = 0;
const MOVE = {CLICK: 0, UP: 1, DOWN: 2, LEFT: 3, RIGHT: 4};
let lastMove = MOVE.CLICK;

function loadGame() {
    fetch('./enable1.txt')
        .then(response => response.text())
        .then(text => {
            allWords = text.split('\n');
            console.log('Words loaded!');
        })
        .catch(error => {
            console.error('Error fetching words: ', error);
        })
        .then(wordsLoaded)
        .catch(error => {
            console.error('Error loading game: ', error);
        });
    randomBackgroundColor();
    initBoard();
}

function wordsLoaded() {
    placeableWords = {};
    for (let i = 2; i <= WMAX; i++) {
        placeableWords[i] = [];
    }
    for (const w of allWords) {
        if (w.length > 1 && w.length <= WMAX)
            placeableWords[w.length].push(w);
    }
    secretBoard = generateBoard(placeableWords);
    loadBoard(secretBoard);
    setSelectedLetter();
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

function loadBoard(board) {
    for (let r = 0; r < RMAX; r++) {
        for (let c = 0; c < CMAX; c++) {
            letters[r][c].classList.remove("blank")
            if (board[r][c] == "")
                letters[r][c].classList.add("blank")
        }
    }
}

function setSelectedLetter() {
    for (let ele of document.getElementsByClassName("selected")) {
        ele.classList.remove("selected");
    }
    letters[rSelected][cSelected].classList.add("selected");
}

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
            letters[rSelected][cSelected].innerHTML = "";
            letters[rSelected][cSelected].classList.remove("correct");
            letters[rSelected][cSelected].classList.remove("inword");
            letters[rSelected][cSelected].classList.remove("inboard");
            letters[rSelected][cSelected].classList.remove("misspell");
            for (let i = rSelected+1; i < RMAX && secretBoard[i][cSelected] != ""; i++)
                letters[i][cSelected].classList.remove("misspell");
            for (let i = cSelected+1; i < CMAX && secretBoard[rSelected][i] != ""; i++)
                letters[rSelected][i].classList.remove("misspell");
            for (let i = rSelected-1; i >= 0 && secretBoard[i][cSelected] != ""; i--)
                letters[i][cSelected].classList.remove("misspell");
            for (let i = cSelected-1; i >= 0 && secretBoard[rSelected][i] != ""; i--)
                letters[rSelected][i].classList.remove("misspell");
            // oh lord
            break;
        case "Delete":
            letters[rSelected][cSelected].innerHTML = "";
            letters[rSelected][cSelected].classList.remove("correct");
            letters[rSelected][cSelected].classList.remove("inword");
            letters[rSelected][cSelected].classList.remove("inboard");
            letters[rSelected][cSelected].classList.remove("misspell");
            for (let i = rSelected+1; i < RMAX && secretBoard[i][cSelected] != ""; i++)
                letters[i][cSelected].classList.remove("misspell");
            for (let i = cSelected+1; i < CMAX && secretBoard[rSelected][i] != ""; i++)
                letters[rSelected][i].classList.remove("misspell");
            for (let i = rSelected-1; i >= 0 && secretBoard[i][cSelected] != ""; i--)
                letters[i][cSelected].classList.remove("misspell");
            for (let i = cSelected-1; i >= 0 && secretBoard[rSelected][i] != ""; i--)
                letters[rSelected][i].classList.remove("misspell");
            break;
        case "Enter":
            makeGuess();
            break;
        default:
            return;
    }
    setSelectedLetter();
})

document.addEventListener("keypress", (event) => {
    if (secretBoard[rSelected][cSelected] == "") return;
    if (isLetter(event.key)) {
        if (letters[rSelected][cSelected].innerHTML != event.key.toUpperCase()) {
            letters[rSelected][cSelected].innerHTML = event.key.toUpperCase();
            letters[rSelected][cSelected].classList.remove("correct");
            letters[rSelected][cSelected].classList.remove("inword");
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
    } else if (event.key === " ") {
        // Flip to other word
    }
});

function checkSurroundings() {
    var s = {};
    // BLANK = grey tile
    s.aboveBlank = rSelected == 0 || secretBoard[rSelected-1][cSelected] == "";
    s.leftBlank  = cSelected == 0 || secretBoard[rSelected][cSelected-1] == "";
    s.belowBlank = rSelected == RMAX-1 || secretBoard[rSelected+1][cSelected] == "";
    s.rightBlank = cSelected == CMAX-1 || secretBoard[rSelected][cSelected+1] == "";

    // EMPTY = white tile
    s.aboveEmpty = !s.aboveBlank && letters[rSelected-1][cSelected].innerHTML == "";
    s.leftEmpty  = !s.leftBlank && letters[rSelected][cSelected-1].innerHTML == "";
    s.belowEmpty = !s.belowBlank && letters[rSelected+1][cSelected].innerHTML == "";
    s.rightEmpty = !s.rightBlank && letters[rSelected][cSelected+1].innerHTML == "";

    s.aboveFilled = !(s.aboveBlank || s.aboveEmpty);
    s.leftFilled = !(s.leftBlank || s.leftEmpty);
    s.belowFilled = !(s.belowBlank || s.belowEmpty);
    s.rightFilled = !(s.rightBlank || s.rightEmpty);
    return s;
}

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function makeGuess() {
    let guess = [[]];
    let valid = true;
    for (let r = 0; r < RMAX; r++) {
        guess[r] = [];
        for (let c = 0; c < CMAX; c++) {
            letters[r][c].classList.remove("correct");
            letters[r][c].classList.remove("inword");
            letters[r][c].classList.remove("inboard");
            letters[r][c].classList.remove("missing");
            letters[r][c].classList.remove("misspell");
            guess[r][c] = letters[r][c].innerHTML.toLowerCase();
            letters[r][c].style.animation = 'none';
            letters[r][c].offsetHeight;
            letters[r][c].style.animation = null;
            if (secretBoard[r][c] != "" && guess[r][c] == "") {
                letters[r][c].classList.add("missing");
                valid = false;
            }
        }
    }
    if (!valid) {console.log("BLANKS"); return;}
    for (let row of letters)
        for (let box of row)
            if (!box.classList.contains("blank"))
                box.classList.add("misspell");
    
    let guessInfo = validateBoard(guess, 3);
    console.log(guessInfo);
    for (let wordInfo of guessInfo.wordList) {
        if (wordInfo.valid) {
            for (let i = 0; i < wordInfo.word.length; i++) {
                let letterPos = getLetterPos(wordInfo, i);
                letters[letterPos.row][letterPos.col].classList.remove("misspell");
            }
        }
    }
    if (!guessInfo.valid) {console.log("MISSPELLS"); return;}
    let secretInfo = validateBoard(secretBoard, 3);
    // ASSUME: secretInfo and guessInfo have aligned wordInfo
    for (let w = 0; w < secretInfo.wordList.length; w++) {
        let guessWord = guessInfo.wordList[w].word;
        let secretWord = secretInfo.wordList[w].word;
        secretInfo.wordList[w].unguessed = ""; // store copy of all letters
        for (let i = 0; i < secretWord.length; i++) { // CORRECT
            if (guessWord[i] == secretWord[i]) {
                let letterPos = getLetterPos(secretInfo.wordList[w], i);
                letters[letterPos.row][letterPos.col].classList.add("correct");
            } else secretInfo.wordList[w].unguessed += secretWord[i];
        }
        for (let i = 0; i < secretWord.length; i++) { // RIGHT LETTER, RIGHT WORD, WRONG PLACE
            if (guessWord[i] == secretWord[i]) continue;
            if (secretInfo.wordList[w].unguessed.indexOf(guessWord[i]) >= 0) {
                let letterPos = getLetterPos(secretInfo.wordList[w], i);
                letters[letterPos.row][letterPos.col].classList.add("inword");
                secretInfo.wordList[w].unguessed.replace(guessWord[i], "");
            }
        }
    }
    let unguessed = "";
    for (let wInfo of secretInfo.wordList) {
        unguessed += wInfo.unguessed;
    }
    for (let w = 0; w < secretInfo.wordList.length; w++) {
        let guessWord = guessInfo.wordList[w].word;
        let secretWord = secretInfo.wordList[w].word;
        for (let i = 0; i < secretWord.length; i++) { // RIGHT LETTER, WRONG PLACE
            if (guessWord[i] == secretWord[i]) continue;
            let letterPos = getLetterPos(secretInfo.wordList[w], i);
            if (letters[letterPos.row][letterPos.col].classList.contains("inword")) continue;
            if (unguessed.indexOf(guessWord[i]) >= 0) {
                letters[letterPos.row][letterPos.col].classList.add("inboard");
                unguessed.replace(guessWord[i], "");
            }
        }
    }
}

function getLetterPos(wordInfo, letter) {
    if (wordInfo.dir == DIR.HORIZONTAL)
        return {row: wordInfo.row, col: wordInfo.col+letter};
    if (wordInfo.dir == DIR.VERTICAL)
        return {row: wordInfo.row+letter, col: wordInfo.col};
}