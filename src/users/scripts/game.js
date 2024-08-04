let zombieIndex = 1;

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const groundY = (canvasHeight / 2) + 150;

/* ZOMBIE  */
let zombieX = 50;
let zombieY = groundY - 450;
const zombieWidth = 200;
const zombieHeight = 327;
let zombieSpeedY = 1;
const gravity = 0.38;
const jumpPower = -15.5;
let isJumping = true;
let isAttacking = false;
const cropIndex = 100;
let zombieSpeed = 7;
const ghostScore = 500;

/* OBSTACLES */
let obstacles = [];
let ghostObstacles = [];
let ghostActive = false;
const obstacleImages = [];
const numObstacleImages = 7;
const obstacleWidth = 120;
const obstacleHeight = 140;
const ghostWidth = 150;
const ghostHeight = 200;
const initialObstacleSpeed = 8;
let obstacleSpeed = initialObstacleSpeed;

/* GAME */
let score = 0;
let tokens = 0;
let multiplier = 1;
let gameOver = false;
let gameStarted = false;
const spawnSensitivity = 0.75;
let lastTap = 0;

/* TIME */
let lastObstacleSpawnTime = Date.now();
let lastGhostSpawnTime = Date.now();

/* IMAGES */
const zombieRunImages = [];
const zombieJumpImages = [];
const zombieIdleImages = [];
const zombieAttackImages = [];

function loadImageArray(basePath, count, array) {
    for (let i = 1; i <= count; i++) {
        const img = new Image();
        img.src = `${basePath}(${i}).png`;
        array.push(img);
    }
}

loadImageArray(`static/assets/sprites/${zombieIndex}/Run`, 8, zombieRunImages);
loadImageArray(`static/assets/sprites/${zombieIndex}/Jump`, 15, zombieJumpImages);
loadImageArray(`static/assets/sprites/${zombieIndex}/Idle${zombieIndex}`, 10, zombieIdleImages);
loadImageArray(`static/assets/sprites/${zombieIndex}/Attack`, 8, zombieAttackImages);

const backgroundImage = new Image();
backgroundImage.src = '/static/assets/img/BackgroundGameOut-1.jpg';

const groundImage = new Image();
groundImage.src = '/static/assets/img/Background-1.jpg';

for (let i = 1; i <= numObstacleImages; i++) {
    const img = new Image();
    img.src = `/static/assets/sprites/obs/${i}.png`;
    obstacleImages.push(img);
}

const ghostImages = [];
for (let i = 0; i <= 3; i++) {
    const img = new Image();
    img.src = `/static/assets/sprites/ghost/${i}.png`;
    ghostImages.push(img);
}

function loadImages(images) {
    return Promise.all(images.map(image => {
        return new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = () => reject(new Error(`Failed to load image: ${image.src}`));
        });
    }));
}

let currentFrame = 0;
const frameSpeed = 5;
let frameCount = 0;

let groundX = 0;
const groundSpeed = 4;

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
}

function drawGround() {
    const groundWidth = groundImage.width;
    const groundHeight = groundImage.height;

    groundX -= groundSpeed;
    if (groundX <= -groundWidth) {
        groundX = 0;
    }

    ctx.drawImage(groundImage, groundX, groundY - groundHeight, groundWidth, groundHeight);
    ctx.drawImage(groundImage, groundX + groundWidth, groundY - groundHeight, groundWidth, groundHeight);
}

function drawZombie() {
    frameCount++;
    if (frameCount >= frameSpeed) {
        frameCount = 0;
        const currentImages = isJumping ? zombieJumpImages : isAttacking ? zombieAttackImages : zombieRunImages;
        currentFrame = (currentFrame + 1) % (currentImages.length || 1);
    }

    const currentImages = isJumping ? zombieJumpImages : isAttacking ? zombieAttackImages : zombieRunImages;
    const currentImage = currentImages[currentFrame];

    if (currentImage && currentImage.width && currentImage.height) {
        const originalWidth = currentImage.width;
        const cropWidth = originalWidth - cropIndex;
        const cropHeight = currentImage.height;
        const cropX = 0;

        ctx.drawImage(
            currentImage,
            cropX,
            0,
            cropWidth,
            cropHeight,
            zombieX,
            zombieY,
            zombieWidth,
            zombieHeight
        );
    } else {
        console.warn('currentImage is undefined or invalid:', currentImage);
    }
}

function drawObstacles() {
    obstacles.forEach((obstacle) => {
        const obstacleImg = obstacleImages[obstacle.imgIndex];
        ctx.drawImage(obstacleImg, obstacle.x, groundY - obstacleHeight - 170, obstacleWidth, obstacleHeight);
    });

    ghostObstacles.forEach((ghost) => {
        if (ghostImages.length > 0) {
            ghost.frameCount++;
            if (ghost.frameCount >= frameSpeed) {
                ghost.frameCount = 0;
                ghost.frameIndex = (ghost.frameIndex + 1) % ghostImages.length;
            }
            const ghostImg = ghostImages[ghost.frameIndex];
            ctx.drawImage(ghostImg, ghost.x, ghost.y, ghostWidth, ghostHeight);
        }
    });
}

function update() {
    if (gameOver) return;

    if (isJumping) {
        zombieSpeedY += gravity;
        zombieY += zombieSpeedY;
        if (zombieY >= groundY - zombieHeight - 150) {
            zombieY = groundY - zombieHeight - 150;
            isJumping = false;
        }
    }

    obstacles.forEach((obstacle) => {
        obstacle.x -= obstacleSpeed;
    });

    ghostObstacles.forEach((ghost) => {
        ghost.x -= obstacleSpeed;
    });

    obstacles.forEach((obstacle) => {
        if (checkCollision(zombieX, zombieY, obstacle.x, groundY - obstacleHeight - 170, obstacleWidth, obstacleHeight)) {
            gameOver = true;
        }
    });

    ghostObstacles.forEach((ghost) => {
        if (checkCollision(zombieX, zombieY, ghost.x, ghost.y, ghostWidth, ghostHeight)) {
            if (isAttacking) {
                ghost.isHit = true;
            } else {
                gameOver = true;
            }
        }
    });

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacleWidth > 0);
    ghostObstacles = ghostObstacles.filter(ghost => {
        if (ghost.x + ghostWidth <= 0 || ghost.isHit) {
            ghostActive = false;
            return false;
        }
        return true;
    });

    score += multiplier * 0.1;

    if (Math.floor(score) % 100 === 0) {
        obstacleSpeed += 0.1;
        zombieSpeed += 0.1;
    }

    spawnEntities();
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawBackground();
    drawGround();

    if (gameOver) {
        gameOverScreen();
        return;
    }

    drawZombie();
    drawObstacles();

    const scoreImg = new Image();
    const tokensImg = new Image();

    scoreImg.src = '/static/assets/icons/rocket.png';
    tokensImg.src = '/static/assets/icons/coin.png';

    Promise.all([
        new Promise(resolve => scoreImg.onload = resolve),
        new Promise(resolve => tokensImg.onload = resolve)
    ]).then(() => {
        ctx.font = '60px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const centerX = canvas.width / 2;
        const imageY = 20;
        const imageHeight = 80;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;

        const spacing = 150;

        ctx.drawImage(scoreImg, centerX - 190, imageY, imageHeight, imageHeight);
        ctx.fillText(`${Math.floor(score)}`, centerX - 190 + imageHeight + spacing / 2, imageY + imageHeight / 2);

        ctx.drawImage(tokensImg, centerX - 190 + imageHeight + spacing, imageY, imageHeight, imageHeight);
        ctx.fillText(`${tokens}`, centerX - 190 + imageHeight + spacing + imageHeight + spacing / 2, imageY + imageHeight / 2);

        ctx.shadowColor = 'transparent';
    });
}

function checkCollision(zombieX, zombieY, obstacleX, obstacleY, obstacleWidth, obstacleHeight) {
    return (
        zombieX < obstacleX + obstacleWidth &&
        zombieX + zombieWidth > obstacleX &&
        zombieY < obstacleY + obstacleHeight &&
        zombieY + zombieHeight > obstacleY
    );
}

function resetGame() {
    zombieX = 50;
    zombieY = groundY - zombieHeight - 150;
    zombieSpeedY = 0;
    obstacles = [];
    ghostObstacles = [];
    ghostActive = false;
    score = 0;
    tokens = 0;
    obstacleSpeed = initialObstacleSpeed;
    gameOver = false;
    gameStarted = false;
    lastObstacleSpawnTime = Date.now();
    lastGhostSpawnTime = Date.now();
}

function spawnObstacle() {
    const imgIndex = Math.floor(Math.random() * numObstacleImages);
    const x = canvasWidth;
    obstacles.push({ x, imgIndex });
}

function spawnGhost() {
    const x = canvasWidth;
    const y = groundY - ghostHeight - 170;
    ghostObstacles.push({ x, y, frameIndex: 0, frameCount: 0, isHit: false });
}

function spawnEntities() {
    const now = Date.now();
    let intervalIndex = Math.floor((Math.random() * 2200) + 1750);
    const obstacleSpawnInterval = intervalIndex; 
    if (now - lastObstacleSpawnTime > obstacleSpawnInterval) {
        if (score > ghostScore && Math.random() > spawnSensitivity) {
            spawnGhost();
        } else {
            spawnObstacle();
        }
        lastObstacleSpawnTime = now;
    }
}

function gameOverScreen() {
    ctx.font = '80px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Game Over', canvasWidth / 2, canvasHeight / 2 - 50);
    ctx.font = '80px Arial';
    ctx.fillText(`Score: ${Math.floor(score)}`, canvasWidth / 2, canvasHeight / 2 + 50);
    setTimeout(() => {
        window.location.href = "/";
    }, 3000);
    console.log(tokens);
}

function restartGame() {
    window.removeEventListener('click', restartGame);
    resetGame();
    startGame();
}

function startGame() {
    loadImages([backgroundImage, groundImage, ...obstacleImages, ...ghostImages, ...zombieRunImages, ...zombieJumpImages, ...zombieIdleImages, ...zombieAttackImages])
        .then(() => {
            gameStarted = true;
            window.addEventListener('click', restartGame);
            requestAnimationFrame(gameLoop);
        })
        .catch(error => {
            console.error('Error loading images:', error);
        });
}

function gameLoop() {
    if (!gameOver) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    } else {
        gameOverScreen();
    }
}

startGame();

document.addEventListener('keydown', (event) => {
    if ((event.key === 'ArrowUp' || event.key === ' ') && !isJumping) {
        zombieSpeedY = jumpPower;
        isJumping = true;
        tokens += 1 + Math.floor(score / 400);
    }
    if (event.key === 'a') {
        isAttacking = true;
        setTimeout(() => {
            isAttacking = false;
        }, 500);
    }
});

window.addEventListener('touchend', () => {
    let currentTime = new Date().getTime();
    let tapLength = currentTime - lastTap;
    if (tapLength < 600 && tapLength > 0) {
        isAttacking = true;
        setTimeout(() => {
            isAttacking = false;
        }, 500);
    }
    lastTap = currentTime;
});
