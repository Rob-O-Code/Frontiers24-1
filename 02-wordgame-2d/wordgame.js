const DIR = {HORIZONTAL: 0, VERTICAL: 1}
const OVERLAP = {ANY: 0, REQUIRED: 1}

let allWords = [];
let placeableWords = {};
const body = document.body;

/**
 * Generates a random integer in the closed bounds
 * @param {number} min the lower bound, a possible choice
 * @param {number} max the upper bound, a possible choice
 * @returns a pseudorandom integer
 */
function randInt(min, max) {
    let rand = Math.random();
    rand = rand * (max - min + 1);
    rand = rand + min;
    rand = Math.floor(rand);
    return rand;
}

const randomWord = document.getElementById("random-word");
const guessField = document.getElementById("guess-field");
const feedbackText = document.getElementById("feedback-text");

const RMAX = 5;
const CMAX = 5;
const WMAX = Math.max(RMAX, CMAX);
let secretBoard = [[]];

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