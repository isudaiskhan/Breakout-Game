const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ball properties
let ballRadius = 12;
let x, y, dx, dy;

// Paddle properties
const paddleHeight = 12;
const paddleWidth = 125; // Smaller paddle width
let paddleX;

// Brick properties
let brickRowCount;
let brickColumnCount;
let brickWidth = 85;
let brickHeight = 30;
let brickPadding = 15;
let brickOffsetTop = 50;
let brickOffsetLeft = 30;

const bricks = [];

// Score tracking
let score = 0;

// Game status tracking
let gameRunning = true;

// Game over elements
const gameOverDiv = document.getElementById("gameOver");
const restartButton = document.getElementById("restartButton");

// Initially hide the game over message and restart button
gameOverDiv.classList.add("hidden");
restartButton.classList.add("hidden");

// Function to set brick properties based on screen size
function setBrickProperties() {
    const screenWidth = window.innerWidth;

    if (screenWidth <= 400) { // For very small screens
        brickRowCount = 3;
        brickColumnCount = 3;
    } else if (screenWidth <= 450) { // For small screens
        brickRowCount = 3;
        brickColumnCount = 4;
    } else { // For larger screens
        brickRowCount = 4;
        brickColumnCount = 7;
    }

    // Initialize the bricks array
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = window.innerHeight * 0.8; // Adjust height to 80% of the viewport height
    setBrickProperties();
    resetGame();
}

function resetGame() {
    // Ball initial position and speed
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 3;
    dy = -3;

    // Paddle initial position
    paddleX = (canvas.width - paddleWidth) / 2;

    // Reset bricks
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r].status = 1;
        }
    }

    // Reset score
    score = 0;
    gameRunning = true;
    draw();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Mouse and touch event handlers
document.addEventListener("mousemove", mouseMoveHandler);
document.addEventListener("click", clickHandler);
canvas.addEventListener("touchmove", touchMoveHandler);
canvas.addEventListener("touchstart", touchStartHandler);

restartButton.addEventListener("click", restartGame);

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

function clickHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

function touchMoveHandler(e) {
    const touch = e.touches[0];
    const relativeX = touch.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
    e.preventDefault(); // Prevent scrolling when touching
}

function touchStartHandler(e) {
    const touch = e.touches[0];
    const relativeX = touch.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function collisionDetection() {
    let bricksLeft = 0;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status == 1) {
                bricksLeft++;
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                }
            }
        }
    }

    if (bricksLeft === 0) {
        youWin();
        return;
    }

    // Collision detection with the paddle and game over check
    if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            gameOver();
            return;
        }
    }
}

function youWin() {
    // Stop the game
    gameRunning = false;

    // Clear the canvas and display the winning message
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Determine font size based on canvas width
    let fontSize = canvas.width < 500 ? 27 : 36;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "#0095DD";
    ctx.textAlign = "center";
    ctx.fillText("Congratulations You Win!", canvas.width / 2, canvas.height / 2);

    // Show the restart button
    gameOverDiv.classList.remove("hidden");
    restartButton.classList.remove("hidden");
}

function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
}




function draw() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    collisionDetection();

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            gameOver();
            return;
        }
    }

    x += dx;
    y += dy;

    requestAnimationFrame(draw);
}

function gameOver() {
    // Stop the game
    gameRunning = false;

    // Display game over message and stop the game
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "36px Arial";
    ctx.fillStyle = "#FF0000";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);

    // Show the restart button
    gameOverDiv.classList.remove("hidden");
    restartButton.classList.remove("hidden");
}

function restartGame() {
    // Hide the game over message and restart button
    gameOverDiv.classList.add("hidden");
    restartButton.classList.add("hidden");

    // Reset the game state
    resetGame();
}

// Initial draw call to start the game loop
draw();