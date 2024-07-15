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
        .then(startGame)
        .catch(error => {
            console.error('Error loading game: ', error);
        });
    randomBackgroundColor();
    initKeyboard();
}

function startGame() {
    placeableWords = {};
    for (let i = 2; i <= WMAX; i++) {
        placeableWords[i] = [];
    }
    for (const w of popularWords) {
        if (w.length > 1 && w.length <= WMAX)
            placeableWords[w.length].push(w);
    }
    secretBoard = generateBoard(placeableWords);
    for (let r = 0; r < RMAX; r++) {
        for (let c = 0; c < CMAX; c++) {
            letters[r][c].classList.remove("blank")
            if (secretBoard[r][c] == "")
                letters[r][c].classList.add("blank")
        }
    }
    setSelectedLetter();
}
