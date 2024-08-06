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

let d = 'RIGHT'; // Initialize direction to 'RIGHT'
let nextDirection = 'RIGHT'; // Queue direction changes
let score = 0;

document.addEventListener('keydown', direction);
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

function direction(event) {
    if (event.keyCode === 37 && d !== 'RIGHT') nextDirection = 'LEFT'; // Left arrow key
    if (event.keyCode === 38 && d !== 'DOWN') nextDirection = 'UP';   // Up arrow key
    if (event.keyCode === 39 && d !== 'LEFT') nextDirection = 'RIGHT'; // Right arrow key
    if (event.keyCode === 40 && d !== 'UP') nextDirection = 'DOWN';   // Down arrow key
}

let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(event) {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

function handleTouchMove(event) {
    const touch = event.touches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;

    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && d !== 'LEFT') nextDirection = 'RIGHT';
        if (dx < 0 && d !== 'RIGHT') nextDirection = 'LEFT';
    } else {
        if (dy > 0 && d !== 'UP') nextDirection = 'DOWN';
        if (dy < 0 && d !== 'DOWN') nextDirection = 'UP';
    }

    touchStartX = touchEndX;
    touchStartY = touchEndY;
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

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? 'green' : 'lightgreen';
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    // Draw food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, box, box);

    // Update score display
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = 'Score: ' + score;

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
        console.log(`Food eaten! New score: ${score}`);
    } else {
        snake.pop(); // Remove last segment of the snake
    }

    snake.unshift(newHead); // Add new head to the snake

    // Check for collision with walls or self
    if (collisionWithWalls(newHead) || collisionWithSelf(newHead)) {
        clearInterval(game); // End game
        console.log('Game Over!');
        alert('Game Over! Your score: ' + score);
    }

    // Debugging output
    console.log(`Snake Head Position: (${newHead.x}, ${newHead.y})`);
    console.log(`Food Position: (${food.x}, ${food.y})`);
    console.log(`Snake Length: ${snake.length}`);
}

function collisionWithWalls(head) {
    // Adjusted to check if the entire head is out of bounds
    const collision = head.x < 0 || head.x >= canvasWidth || head.y < 0 || head.y >= canvasHeight;
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
    } while (collision); // Repeat until a non-colliding position is found

    console.log(`Generated Food Position: (${foodX}, ${foodY})`);
    return { x: foodX, y: foodY };
}

// Start the game
const game = setInterval(draw, 100);
