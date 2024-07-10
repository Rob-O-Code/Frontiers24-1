// This is the JavaScript code
// GUIDELINES:
//  1. Give every variable/const smallest scope
//  2. Grab HTML elements by tag and store in const
//  3. Put all other code inside functions

const colorField = document.getElementById("color-field");
const fontSizeField = document.getElementById("font-size-field");
const clickButton = document.getElementById("click-button");
const text = document.getElementById("text");
const checkbox = document.getElementById("checkbox");
const flipButton = document.getElementById("flip-button");
const body = document.body;
// let (or var) to declare variables

function colorChange() {
    body.style.backgroundColor = colorField.value;
}

function fontChange() {
    text.style.fontSize = `${fontSizeField.value}px`;
}

function buttonPress() {
    text.innerHTML = "Wow! You pressed the <span id='rand-text'>button</span>!";
    const randColor = document.getElementById("rand-text");
    
    let random = randInt(0, 359);
    console.log(`Random number is ${random}`);
    let colorString = `hsl(${random},100%,50%)`;
    console.log(colorString);
    randColor.style.color = colorString;
    clickButton.style.backgroundColor = colorString;
}

function checkboxChange() {
    let checked = checkbox.checked;
    console.log(`The checkbox has this state: ${checked}`);

    if (checked) {
        body.style.outlineStyle = "solid";
    } else {
        body.style.outlineStyle = "none";
    }
}

function flipPress() {
    flipButton.style.animation = 'none';
    flipButton.offsetHeight;
    flipButton.style.animation = null;
    flipButton.style.animationPlayState = "running";
}

function randInt(min, max) {
    let rand = Math.random();
    rand = rand * (max - min + 1);
    rand = rand + min;
    rand = Math.floor(rand);
    return rand;
}

