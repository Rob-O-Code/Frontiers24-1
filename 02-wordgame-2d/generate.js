/**
 * Generates a random letter board given a collection of words
 * @param {string} words dictionary of arrays of words, sorted by word length
 * @returns 2d-array of single-character/empty strings representing the board
 */
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

/**
 * Attempt all placements of a word on a board randomly
 * @param {*} board 2d-array of single-character strings
 * @param {*} word a string
 * @param {OVERLAP} overlap OVERLAY.REQUIRED if a letter must overlap an existing letter
 * @param {DIR} dir the direction of the word
 * @returns 
 */
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

/**
 * Place a word on a board with given location and direction, return null if fail
 * @param {*} board 2d-array of single-character strings
 * @param {*} word a string
 * @param {*} r the row of the first letter in word
 * @param {*} c the column of the first letter of the word
 * @param {DIR} dir the direction of the word
 * @param {OVERLAP} overlap OVERLAY.REQUIRED if a letter must overlap an existing letter
 * @returns the board if successful, null if unsuccessful
 */
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