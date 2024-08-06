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
let specialFood = generateSpecialFood();

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
        } else if (specialFood.type === 'extraLife') {
            if (lives < 2) {
                lives++;
                console.log(`Extra Life Food eaten! Lives: ${lives}`);
            } else {
                console.log('Extra Life Food eaten but lives are already maxed out!');
            }
            score++;
            console.log(`Score: ${score}`);
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
        if (lives > 1) {
            lives--; // Reduce lives and continue game
            console.log(`Collision detected. Lives remaining: ${lives}`);
        } else {
            clearInterval(game); // End game
            console.log('Game Over!');
            alert('Game Over! Your score: ' + score);
        }
    }

    // Handle slow down effect
    if (slowDownDuration > 0) {
        slowDownDuration -= 100; // Decrease duration
        if (slowDownDuration <= 0) {
            gameSpeed = 100; // Restore speed
            console.log('Speed back to normal');
            specialFood = generateSpecialFood(); // Generate new special food
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
    } while (collision); // Repeat until a non-colliding position is found

    return {
        x: foodX,
        y: foodY,
        color: 'red' // Normal food color
    };
}

function generateSpecialFood() {
    if (Math.random() < 0.5) { // 50% chance for special food to appear
        let foodX, foodY;
        const borderBuffer = box;

        // Ensure special food does not overlap with snake
        do {
            foodX = Math.floor(Math.random() * (canvasSizeX - 2)) * box + borderBuffer;
            foodY = Math.floor(Math.random() * (canvasSizeY - 2)) * box + borderBuffer;
        } while (snake.some(segment => segment.x === foodX && segment.y === foodY));

        // Randomly assign type and color for special food
        const foodType = Math.random() < 0.5 ? 'slowDown' : 'extraLife';
        const foodColor = foodType === 'slowDown' ? 'blue' : 'yellow';

        return {
            x: foodX,
            y: foodY,
            color: foodColor,
            type: foodType
        };
    }
    return null;
}


function restartGame() {
    clearInterval(game); // Clear the existing game interval
    snake = [{ x: 9 * box, y: 10 * box }];
    food = generateFood();
    specialFood = generateSpecialFood();
    d = 'RIGHT';
    nextDirection = 'RIGHT';
    score = 0;
    lives = 1; // Reset lives to initial value
    extraLife = 0; // Reset extra life count
    console.log(`Lives: ${lives}`); // Log reset lives count
    game = setInterval(draw, gameSpeed); // Restart the game with the current speed
}

// Start the game
let game = setInterval(draw, gameSpeed);

// Generate special food every 10 seconds
setInterval(() => {
    specialFood = generateSpecialFood();
}, 10000);
