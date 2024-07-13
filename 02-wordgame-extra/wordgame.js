let allWords = [];
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

function loadGame() {
    fetch('./enable1.txt')
        .then(response => response.text())
        .then(text => {
            allWords = text.split('\n');
            console.log('Words loaded!');
            wordsLoaded();
        })
        .catch(error => {
            console.error('Error fetching words: ', error);
        });
    randomBackgroundColor();
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
const randomWord = document.getElementById("random-word");
const guessField = document.getElementById("guess-field");
const feedbackText = document.getElementById("feedback-text");
let wordLength = 5;
let fiveLetterWords = [];
let secret = '';
function wordsLoaded() {
    let randomIndex = randInt(0, allWords.length-1);
    randomWord.innerHTML = allWords[randomIndex];

    for (let i = 0; i < allWords.length; i++) {
        let word = allWords[i];
        if (word.length != 5) continue;
        fiveLetterWords.push(word);
    }
    
    randomIndex = randInt(0, fiveLetterWords.length-1);
    secret = fiveLetterWords[randomIndex].toLowerCase();
}

function changeGuess() {
    let guess = guessField.value.toLowerCase();

    // SKIP if guess is less than 5 letters
    if (guess.length < 5) return;

    // SKIP and empty input if guess is more than 5 letters
    if (guess.length > 5) {
        guessField.value = "";
        return;
    }
    console.log(`Guess: "${guess}" and Secret: "${secret}"`);

    // SKIP and empty input if guess is NOT a word
    if (allWords.indexOf(guess) < 0) {
        feedbackText.innerHTML = `"${guess}" is not a word. Try again.<br>`+ feedbackText.innerHTML;
        guessField.value = "";
        return;
    }

    makeGuess(guess);
}

function makeGuess(guess) {
    // Create list of missed letters
    let missedLetters = ""
    for (let i = 0; i < wordLength; i++) {
        if (guess[i] != secret[i]) {
            missedLetters += secret[i];
        }
    }

    // Add letter tiles to word
    let decoratedGuess = "";
    for (let i = 0; i < wordLength; i++) {
        if (guess[i] == secret[i]) {
            decoratedGuess += `<span class="letter correct">${guess[i]}</span>`;
        } else if (missedLetters.indexOf(guess[i]) >= 0) {
            decoratedGuess += `<span class="letter partial">${guess[i]}</span>`;
            missedLetters = missedLetters.replace(guess[i], "");
        } else {
            decoratedGuess += `<span class="letter">${guess[i]}</span>`;
        }
    }

    feedbackText.innerHTML = `<span>${decoratedGuess}</span><br>` + feedbackText.innerHTML;
    guessField.value = "";


}