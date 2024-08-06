const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 20;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const canvasSize = canvasWidth / box; // Number of boxes along the width/height

let snake = [];
snake[0] = { x: 9 * box, y: 10 * box };

let food = generateFood();

let d = 'RIGHT'; // Initialize direction to 'RIGHT'
let score = 0;

document.addEventListener('keydown', direction);

function direction(event) {
    if (event.keyCode === 37 && d !== 'RIGHT') d = 'LEFT';
    if (event.keyCode === 38 && d !== 'DOWN') d = 'UP';
    if (event.keyCode === 39 && d !== 'LEFT') d = 'RIGHT';
    if (event.keyCode === 40 && d !== 'UP') d = 'DOWN';
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawBorders(); // Draw the border around the canvas

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? 'green' : 'lightgreen';
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    // Draw food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, box, box);

    // Draw score
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, box, box);

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
    } else {
        snake.pop(); // Remove last segment of the snake
    }

    snake.unshift(newHead); // Add new head to the snake

    // Check for collision with walls or self
    if (snakeX < 0 || snakeX >= canvasWidth || snakeY < 0 || snakeY >= canvasHeight || collision(newHead, snake)) {
        clearInterval(game); // End game
        alert('Game Over! Your score: ' + score);
    }
}

function collision(head, array) {
    for (let i = 1; i < array.length; i++) { // Start from 1 to skip the head
        if (head.x === array[i].x && head.y === array[i].y) {
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
    do {
        collision = false;
        // Ensure the food is within the bounds of the canvas
        foodX = Math.floor(Math.random() * (canvasWidth / box)) * box;
        foodY = Math.floor(Math.random() * (canvasHeight / box)) * box;

        // Check if food position overlaps with any part of the snake
        for (let i = 0; i < snake.length; i++) {
            if (foodX === snake[i].x && foodY === snake[i].y) {
                collision = true;
                break;
            }
        }
    } while (collision); // Repeat until a non-colliding position is found

    return { x: foodX, y: foodY };
}

// Start the game
const game = setInterval(draw, 100);
