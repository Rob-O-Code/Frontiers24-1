let allWords = [];
let placeableWords = {};
const body = document.body;

// Returns a random integer between min and max
//   [min, min+1, min+2, ... , max-1, max]
function randInt(min, max) {
    let rand = Math.random();
    rand = rand * (max - min + 1);
    rand = rand + min;
    rand = Math.floor(rand);
    return rand;
}

function randomBackgroundColor() {
    let random = randInt(135, 225);
    let colorString = `hsl(${random},80%,90%)`;
    body.style.backgroundColor = colorString;
}

// TODO: write function isWord(word)

// For checking word:  json.hasOwnProperty("programming")
// For array of words: let arr = Object.keys(json)
// For a random word:  let word = arr[randInt(0, arr.length - 1)];
const DIR = {HORIZONTAL: 0, VERTICAL: 1}
const OVERLAP = {ANY: 0, REQUIRED: 1}
const randomWord = document.getElementById("random-word");
const guessField = document.getElementById("guess-field");
const feedbackText = document.getElementById("feedback-text");

let RMAX = 5;
let CMAX = 5;
let WMAX = Math.max(RMAX, CMAX);
let secretBoard = [[]];

function generateBoard(words) {
    let board = [[]];
    let wordArr = [];
    let word = "";
    for (let a1 = 0; a1 < 1000; a1++) {
        board = [...Array(RMAX)].map(e => Array(CMAX).fill(""));
        // Place RMAX-letter word vertically
        word = words[RMAX][randInt(0, words[RMAX].length-1)];
        board = placeAnywhere(board, word, OVERLAP.ANY, DIR.VERTICAL);
        // Place CMAX-letter word horizontally
        let newBoard = null;
        for (let a2 = 0; a2 < 1000; a2++) {
            wordArr = words[CMAX];
            word = wordArr[randInt(0, wordArr.length-1)];
            newBoard = placeAnywhere(board, word, OVERLAP.REQUIRED, DIR.HORIZONTAL);
            if (newBoard !== null) break;
        }
        if (newBoard == null) continue;
        board = newBoard;
        // Place 2 more words
        for (let n = 4; n >= 3; n--) {
            let boardBackup = JSON.stringify(board);
            for (let a2 = 0; a2 < 1000; a2++) {
                wordArr = words[n];
                word = wordArr[randInt(0, wordArr.length-1)];
                newBoard = placeAnywhere(board, word, OVERLAP.REQUIRED);
                if (newBoard !== null) {
                    if (validateBoard(newBoard).valid) break;
                    board = JSON.parse(boardBackup);
                }
            }
            if (newBoard == null) continue;
            board = newBoard;
        }
        if (newBoard == null) continue;
        board = newBoard;

        break;
    }
    printBoard(board);
    return board;
}

function placeAnywhere(board, word, overlap, dir) {
    let newBoard = null;
    if (dir == undefined) {
        if (Math.random() < 0.5) {
            newBoard = placeAnywhere(board, word, overlap, DIR.HORIZONTAL);
            if (newBoard == null)
                newBoard = placeAnywhere(board, word, overlap, DIR.VERTICAL);
        } else {
            newBoard = placeAnywhere(board, word, overlap, DIR.VERTICAL);
            if (newBoard == null)
                newBoard = placeAnywhere(board, word, overlap, DIR.HORIZONTAL);
        }
        return newBoard;
    }
    let rRand = Math.floor(Math.random() * board.length);
    let cRand = Math.floor(Math.random() * board[0].length);
    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[0].length; c++) {
            let row = (r + rRand) % board.length;
            let col = (c + cRand) % board.length;
            newBoard = placeWord(board, word, row, col, dir, overlap);
            if (newBoard !== null) break;
        }
        if (newBoard !== null) break;
    }
    return newBoard;
}

function placeWord(board, word, r, c, dir, overlap) {
    if (c >= board[0].length) return null;
    if (r >= board.length) return null;
    if (dir === DIR.HORIZONTAL) {
        if (c + word.length > board[0].length) return null;
        let ol = false;
        for (let i = 0; i < word.length; i++) {
            if (board[r][c+i] == "") continue;
            if (board[r][c+i] == word[i]) {
                ol = true;
                continue;
            }
            return null;
        }
        if (overlap == OVERLAP.REQUIRED && !ol) return null;
        for (let i = 0; i < word.length; i++) {
            board[r][c+i] = word[i];
        }
        return board;
    } else if (dir === DIR.VERTICAL) {
        if (r + word.length > board.length) return null;
        let ol = false;
        for (let i = 0; i < word.length; i++) {
            if (board[r+i][c] == "") continue;
            if (board[r+i][c] == word[i]) {
                ol = true;
                continue;
            }
            return null;
        }
        if (overlap == OVERLAP.REQUIRED && !ol) return null;
        for (let i = 0; i < word.length; i++) {
            board[r+i][c] = word[i];
        }
        return board;
    }
    return null;
}

function validateBoard(board, minLength) {
    if (minLength === undefined) minLength = 2;
    let wordList = [];
    let valid = true;
    // Validate rows
    for (let r = 0; r < board.length; r++) {
        let word = "";
        for (let c = 0; c < board[0].length; c++) {
            let letter = board[r][c];
            if (letter == "") {
                if (word.length >= minLength) {
                    let isWord = allWords.indexOf(word) >= 0;
                    wordList.push({word: word, valid: isWord, row: r, col: c-word.length, dir:DIR.HORIZONTAL});
                    valid &= isWord;
                }
                word = "";
            } else {
                word += letter;
            }
        }
        if (word.length >= minLength) {
            let isWord = allWords.indexOf(word) >= 0;
            wordList.push({word: word, valid: isWord, row: r, col: board[0].length-word.length, dir:DIR.HORIZONTAL});
            valid &= isWord;
        }
    }
    // Validate columns
    for (let c = 0; c < board[0].length; c++) {
        let word = "";
        for (let r = 0; r < board.length; r++) {
            let letter = board[r][c];
            if (letter == "") {
                if (word.length >= minLength) {
                    let isWord = allWords.indexOf(word) >= 0;
                    wordList.push({word: word, valid: isWord, row: r-word.length, col: c, dir:DIR.VERTICAL});
                    valid &= isWord;
                }
                word = "";
            } else {
                word += letter;
            }
        }
        if (word.length >= minLength) {
            let isWord = allWords.indexOf(word) >= 0;
            wordList.push({word: word, valid: isWord, row: board.length-word.length, col: c, dir:DIR.VERTICAL});
            valid &= isWord;
        }
    }
    return {valid: valid, wordList: wordList};
}
// '[["r","","","","f"],["e","","","","l"],["b","e","l","g","a"],["o","","i","","g"],["r","u","n","",""],["n","","","",""]]'

function printBoard(board) {
    for (let row = 0; row < board.length; row++) {
        let line = `${row} |`;
        for (let col = 0; col < board[0].length; col++) {
            line += board[row][col];
            if (board[row][col] === "") {
                line += " ";
            }
        }
        line += "|";
        console.log(line);
    }
}