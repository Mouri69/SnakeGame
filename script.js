const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 20;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const canvasSizeX = canvasWidth / box; // Number of boxes along the width
const canvasSizeY = canvasHeight / box; // Number of boxes along the height

let snake = [];
snake[0] = { x: 9 * box, y: 10 * box };

let food = generateFood();
let specialFood = null; // Initialize with no special food

let d = 'RIGHT'; // Initialize direction to 'RIGHT'
let nextDirection = 'RIGHT'; // Queue direction changes
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameSpeed = 100; // Default speed
let slowDownDuration = 0; // Duration for slow down effect
let extraLife = 0; // Counter for extra lives
let lives = 1; // Initial number of lives

document.getElementById('high-score').textContent = 'High Score: ' + highScore;
document.getElementById('score').textContent = 'Score: ' + score;
console.log(`Lives: ${lives}`); // Log initial number of lives

document.addEventListener('keydown', direction);
document.getElementById('restart-button').addEventListener('click', restartGame);

function direction(event) {
    if (event.keyCode === 37 && d !== 'RIGHT') nextDirection = 'LEFT'; // Left arrow key
    if (event.keyCode === 38 && d !== 'DOWN') nextDirection = 'UP';   // Up arrow key
    if (event.keyCode === 39 && d !== 'LEFT') nextDirection = 'RIGHT'; // Right arrow key
    if (event.keyCode === 40 && d !== 'UP') nextDirection = 'DOWN';   // Down arrow key
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawBorders(); // Draw the border around the canvas

    // Update direction if it's different from the current direction
    if (nextDirection !== d) {
        // Prevent immediate reversal
        if (
            (d === 'LEFT' && nextDirection !== 'RIGHT') ||
            (d === 'RIGHT' && nextDirection !== 'LEFT') ||
            (d === 'UP' && nextDirection !== 'DOWN') ||
            (d === 'DOWN' && nextDirection !== 'UP')
        ) {
            d = nextDirection;
        }
    }

    // Update snake position
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (d === 'LEFT') snakeX -= box;
    if (d === 'UP') snakeY -= box;
    if (d === 'RIGHT') snakeX += box;
    if (d === 'DOWN') snakeY += box;

    const newHead = {
        x: snakeX,
        y: snakeY
    };

    // Check for collision with food
    if (snakeX === food.x && snakeY === food.y) {
        food = generateFood(); // Generate a new food position
        score++;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            document.getElementById('high-score').textContent = 'High Score: ' + highScore;
        }
        console.log(`Food eaten! New score: ${score}`);
        // Grow the snake by adding the new head, without removing the tail
        snake.unshift(newHead);
    } else {
        // Move the snake: Add new head and remove the tail
        snake.unshift(newHead);
        snake.pop();
    }

    // Check for collision with special food
    if (specialFood && snakeX === specialFood.x && snakeY === specialFood.y) {
        if (specialFood.type === 'slowDown') {
            slowDownDuration = 5000; // Slow down effect duration in milliseconds
            gameSpeed = 300; // Slow down the speed
            console.log(`Slow Down Food eaten! Game speed: ${gameSpeed}`);
            showFlashEffect('blue'); // Flash blue for slow down food
            showUIEffect('Speed Reduced!'); // Show UI effect
        } else if (specialFood.type === 'extraLife') {
            if (lives < 2) {
                lives++;
                console.log(`Extra Life Food eaten! Lives: ${lives}`);
            } else {
                console.log('Extra Life Food eaten but lives are already maxed out!');
            }
            score++;
            console.log(`Score: ${score}`);
            showFlashEffect('yellow'); // Flash yellow for extra life food
            showUIEffect('Extra Life!'); // Show UI effect
        }
        specialFood = null; // Remove special food after it's eaten
    }

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        if (slowDownDuration > 0 && (i === 0 || i === snake.length - 1)) {
            ctx.fillStyle = 'blue'; // Change color to blue for head and tail during slow down
        } else {
            ctx.fillStyle = i === 0 ? 'green' : 'lightgreen';
        }
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    // Draw food
    ctx.fillStyle = food.color;
    ctx.fillRect(food.x, food.y, box, box);

    // Draw special food
    if (specialFood) {
        ctx.fillStyle = specialFood.color;
        ctx.fillRect(specialFood.x, specialFood.y, box, box);
    }

    // Draw score
    document.getElementById('score').textContent = 'Score: ' + score;

    // Check for collision with walls or self
    if (collisionWithWalls(newHead) || collisionWithSelf(newHead)) {
        lives--; // Reduce lives on collision
        if (lives <= 0) {
            clearInterval(game); // End game
            console.log('Game Over!');
            alert('Game Over! Your score: ' + score);
        } else {
            console.log(`Collision detected. Lives remaining: ${lives}`);
            if (lives > 0) {
                // Continue game with remaining lives
                setTimeout()
            }
        }
    }

    // Handle slow down effect
    if (slowDownDuration > 0) {
        slowDownDuration -= 100; // Decrease duration
        if (slowDownDuration <= 0) {
            gameSpeed = 100; // Restore speed
            console.log('Speed back to normal');
            showFlashEffect('transparent'); // Clear the flash effect
            specialFood = generateSpecialFood(); // Generate new special food
        }
    }

    // Periodically generate special food
    if (Math.random() < 0.01) { // Adjust probability as needed
        if (!specialFood) {
            specialFood = generateSpecialFood();
        }
    }
}

function collisionWithWalls(head) {
    // Adjusted to check if the entire head is out of bounds
    const collision = head.x < 0 || head.x + box > canvasWidth || head.y < 0 || head.y + box > canvasHeight;
    if (collision) {
        console.log('Collision with walls detected!');
    }
    return collision;
}

function collisionWithSelf(head) {
    for (let i = 1; i < snake.length; i++) { // Start from 1 to skip the head
        if (head.x === snake[i].x && head.y === snake[i].y) {
            console.log('Collision with self detected!');
            return true;
        }
    }
    return false;
}

function drawBorders() {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
}

function generateFood() {
    let foodX, foodY, collision;
    const borderBuffer = box; // Buffer space from the edge to avoid collision issues

    do {
        collision = false;
        // Adjust range to avoid spawning food too close to the borders
        foodX = Math.floor(Math.random() * (canvasSizeX - 2)) * box + borderBuffer;
        foodY = Math.floor(Math.random() * (canvasSizeY - 2)) * box + borderBuffer;

        // Check if food position overlaps with any part of the snake
        for (let i = 0; i < snake.length; i++) {
            if (foodX === snake[i].x && foodY === snake[i].y) {
                collision = true;
                break;
            }
        }
    } while (collision);

    return {
        x: foodX,
        y: foodY,
        color: 'red' // Normal food is red
    };
}

function generateSpecialFood() {
    let foodX, foodY, borderBuffer = box; // Buffer space from the edge to avoid collision issues

    do {
        foodX = Math.floor(Math.random() * (canvasSizeX - 2)) * box + borderBuffer;
        foodY = Math.floor(Math.random() * (canvasSizeY - 2)) * box + borderBuffer;
    } while (snake.some(segment => segment.x === foodX && segment.y === foodY));

    return {
        x: foodX,
        y: foodY,
        color: Math.random() < 0.5 ? 'blue' : 'yellow', // Blue for slow down, yellow for extra life
        type: Math.random() < 0.5 ? 'slowDown' : 'extraLife' // Randomly select the type
    };
}

function showFlashEffect(color) {
    const flashOverlay = document.createElement('div');
    flashOverlay.style.position = 'absolute';
    flashOverlay.style.top = '0';
    flashOverlay.style.left = '0';
    flashOverlay.style.width = '100%';
    flashOverlay.style.height = '100%';
    flashOverlay.style.backgroundColor = color;
    flashOverlay.style.opacity = '0.5';
    flashOverlay.style.pointerEvents = 'none'; // Avoid blocking game interaction
    document.body.appendChild(flashOverlay);
    setTimeout(() => {
        document.body.removeChild(flashOverlay);
    }, 500); // Duration of the flash effect
}

function showUIEffect(effectText) {
    const effectElement = document.createElement('div');
    effectElement.style.position = 'absolute';
    effectElement.style.top = '50%';
    effectElement.style.left = '50%';
    effectElement.style.transform = 'translate(-50%, -50%)';
    effectElement.style.fontSize = '24px';
    effectElement.style.fontWeight = 'bold';
    effectElement.style.color = 'white';
    effectElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    effectElement.style.padding = '10px';
    effectElement.style.borderRadius = '5px';
    effectElement.textContent = effectText;
    document.body.appendChild(effectElement);
    setTimeout(() => {
        document.body.removeChild(effectElement);
    }, 1000); // Duration of the effect display
}

function restartGame() {
    snake = [{ x: 9 * box, y: 10 * box }];
    d = 'RIGHT';
    nextDirection = 'RIGHT';
    score = 0;
    lives = 1; // Reset lives on restart
    document.getElementById('score').textContent = 'Score: ' + score;
    document.getElementById('high-score').textContent = 'High Score: ' + highScore;
    gameSpeed = 100; // Reset speed
    slowDownDuration = 0; // Reset slow down effect
    specialFood = generateSpecialFood(); // Generate special food when restarting
    clearInterval(game);
    game = setInterval(draw, gameSpeed);
}

let game = setInterval(draw, gameSpeed);
