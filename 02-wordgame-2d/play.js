const guessBoard = document.getElementById("guess-board");
const guessHistory = document.getElementById("guess-history");

let letters = [[]];
let rSelected = 0;
let cSelected = 0;
const MOVE = {CLICK: 0, UP: 1, DOWN: 2, LEFT: 3, RIGHT: 4};
let lastMove = MOVE.CLICK;

let popularWords = [];

function setSelectedLetter() {
    for (let ele of document.getElementsByClassName("selected")) {
        ele.classList.remove("selected");
    }
    letters[rSelected][cSelected].classList.add("selected");
}

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

/**
 * Test if a string is a single, lower-case letter
 * @param {string} str a string
 * @returns true if str is a single, lower-case letter
 */
function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function makeGuess() {
    let guess = [[]];
    let valid = true;
    for (let r = 0; r < RMAX; r++) {
        guess[r] = [];
        for (let c = 0; c < CMAX; c++) {
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
    
    let guessInfo = validateBoard(guess, 3);
    for (let wordInfo of guessInfo.wordList) {
        if (!wordInfo.valid) {
            for (let i = 0; i < wordInfo.word.length; i++) {
                let letterPos = getLetterPos(wordInfo, i);
                letters[letterPos.row][letterPos.col].classList.add("misspell");
            }
        }
    }
    if (!guessInfo.valid) return;
    for (let r = 0; r < RMAX; r++) {
        guess[r] = [];
        for (let c = 0; c < CMAX; c++) {
            letters[r][c].classList.remove("correct");
            letters[r][c].classList.remove("inword-h");
            letters[r][c].classList.remove("inword-v");
            letters[r][c].classList.remove("inboard");
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

/**
 * Find the position of a certain letter within a word on the board
 * @param {wordInfo} wordInfo a wordInfo
 * @param {number} letterIndex the position of the letter in the word
 * @returns the position of the letter on the board as a {row: , col: }
 */
function getLetterPos(wordInfo, letterIndex) {
    if (wordInfo.dir == DIR.HORIZONTAL)
        return {row: wordInfo.row, col: wordInfo.col+letterIndex};
    if (wordInfo.dir == DIR.VERTICAL)
        return {row: wordInfo.row+letterIndex, col: wordInfo.col};
    return null;
}

/**
 * Save a small copy of the current gameboard
 * NOTE: only uses gameboard; doesn't use other records
 */
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