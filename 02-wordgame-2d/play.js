const guessBoard = document.getElementById("guess-board");
let letters = [[]];
let rSelected = 0;
let cSelected = 0;
const MOVE = {CLICK: 0, UP: 1, DOWN: 2, LEFT: 3, RIGHT: 4};
let lastMove = MOVE.CLICK;

let popularWords = [];

function loadGame() {
    Promise.all([fetch('./enable1.txt')
        .then(response => response.text())
        .then(text => {
            allWords = text.split('\n');
            console.log('Words loaded!');
        })
        .catch(error => {
            console.error('Error fetching words: ', error);
        }),
        fetch('./popular.txt')
            .then(response => response.text())
            .then(text => {
                popularWords = text.split('\n');
                console.log('Words loaded!');
            })
            .catch(error => {
                console.error('Error fetching popular: ', error);
            })])
        .then(initBoard)
        .then(wordsLoaded)
        .catch(error => {
            console.error('Error loading game: ', error);
        });
    randomBackgroundColor();
    initKeyboard();
}

const keyboardRow1 = document.getElementById("keyboard-row1");
const keyboardRow2 = document.getElementById("keyboard-row2");
const keyboardRow3 = document.getElementById("keyboard-row3");
function initKeyboard() {
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

function wordsLoaded() {
    placeableWords = {};
    for (let i = 2; i <= WMAX; i++) {
        placeableWords[i] = [];
    }
    for (const w of popularWords) {
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
})

function deleteLetter(isBackspace) {
    letters[rSelected][cSelected].innerHTML = "";
    letters[rSelected][cSelected].classList.remove("correct");
    letters[rSelected][cSelected].classList.remove("inword-h");
    letters[rSelected][cSelected].classList.remove("inword-v");
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
}

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
        // Flip to other word
    }
}

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
            letters[r][c].classList.remove("inword-h");
            letters[r][c].classList.remove("inword-v");
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
    if (!valid) return;
    for (let row of letters)
        for (let box of row)
            if (!box.classList.contains("blank"))
                box.classList.add("misspell");
    
    let guessInfo = validateBoard(guess, 3);
    for (let wordInfo of guessInfo.wordList) {
        if (wordInfo.valid) {
            for (let i = 0; i < wordInfo.word.length; i++) {
                let letterPos = getLetterPos(wordInfo, i);
                letters[letterPos.row][letterPos.col].classList.remove("misspell");
            }
        }
    }
    if (!guessInfo.valid) return;
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
                if (secretInfo.wordList[w].dir == DIR.HORIZONTAL)
                    letters[letterPos.row][letterPos.col].classList.add("inword-h");
                else if (secretInfo.wordList[w].dir == DIR.VERTICAL)
                    letters[letterPos.row][letterPos.col].classList.add("inword-v");
                
                secretInfo.wordList[w].unguessed = secretInfo.wordList[w].unguessed.replace(guessWord[i], "");
            }
        }
    }
    let unguessed = "";
    let allLetters = "";
    for (let wInfo of secretInfo.wordList) {
        unguessed += wInfo.unguessed;
        allLetters += wInfo.word;
    }
    for (let w = 0; w < secretInfo.wordList.length; w++) {
        let guessWord = guessInfo.wordList[w].word;
        let secretWord = secretInfo.wordList[w].word;
        for (let i = 0; i < secretWord.length; i++) { // RIGHT LETTER, WRONG PLACE
            if (guessWord[i] == secretWord[i]) continue;
            let letterPos = getLetterPos(secretInfo.wordList[w], i);
            if (letters[letterPos.row][letterPos.col].classList.contains("inword-h")) continue;
            if (letters[letterPos.row][letterPos.col].classList.contains("inword-v")) continue;
            if (unguessed.indexOf(guessWord[i]) >= 0) {
                letters[letterPos.row][letterPos.col].classList.add("inboard");
                unguessed = unguessed.replace(guessWord[i], "");
            } else if (allLetters.indexOf(guessWord[i]) < 0) {
                const k = document.getElementById(`keyboard-${guessWord[i]}`);
                k.classList.add("notinboard");
            }
        }
    } // TODO: letter in two words counted twice in unguessed

    saveHistory();
}

function getLetterPos(wordInfo, letter) {
    if (wordInfo.dir == DIR.HORIZONTAL)
        return {row: wordInfo.row, col: wordInfo.col+letter};
    if (wordInfo.dir == DIR.VERTICAL)
        return {row: wordInfo.row+letter, col: wordInfo.col};
}

const guessHistory = document.getElementById("guess-history");

function saveHistory() {
    var hBoard = document.createElement("div");
    hBoard.classList.add("history-board");

    for (var boardRow of guessBoard.children) {
        var hRow = document.createElement("div");
        for (var boardLetter of boardRow.children) {
            var hLetter = document.createElement("div");
            hLetter.innerHTML = boardLetter.innerHTML;
            hLetter.classList = boardLetter.classList;
            hLetter.classList.remove("letter");
            hLetter.classList.add("history-letter");
            hRow.appendChild(hLetter);
        }
        hBoard.appendChild(hRow);
    }

    guessHistory.prepend(hBoard);
}