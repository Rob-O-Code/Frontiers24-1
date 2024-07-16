const gameboard = document.getElementById("gameboard");
const cpucheck = document.getElementById("cpucheck");
const ctx = gameboard.getContext("2d");
const STATE = {STARTUP: 0, PLAYING: 1};

let state = STATE.STARTUP;

let boardWidth = 500;
let boardHeight = 500;
let paddleWidth = 25;
let paddleLength = 100;
let ballRadius = 12.5;
let paddleVelocity = 5;

let ball;
let paddleL;
let paddleR;
let scoreL = 0;
let scoreR = 0;

function clearBoard() {
    ctx.fillStyle = "grey";
    ctx.fillRect(0, 0, boardWidth, boardHeight);
}

function draw() {
    clearBoard();
    ball.draw(ctx);
    paddleL.draw(ctx);
    paddleR.draw(ctx);
}

function resetGame() {
    clearInterval(intervalID);
    ball = new Ball(boardWidth/2, boardHeight/2, 1, -1, ballRadius, "hotpink");
    paddleL = new Paddle(0, 0, paddleLength, paddleWidth, SIDE.LEFT, "red");
    paddleR = new Paddle(boardWidth-paddleWidth, 0, paddleLength, paddleWidth, SIDE.RIGHT, "green");
    nextTick();
}

let intervalID;
function nextTick() {
    switch (state) {
        case STATE.STARTUP:
            state = STATE.PLAYING;
            break;
        case STATE.PLAYING:
            state = play();
            break;
    }
    draw();
    intervalID = setTimeout(nextTick, 10);
}

function play() {
    paddleL.move(false, ball);
    paddleR.move(false, ball);
    ball.move();
    // Add serving the ball?
    // If a player wins, stop the game...
    return STATE.PLAYING;
}