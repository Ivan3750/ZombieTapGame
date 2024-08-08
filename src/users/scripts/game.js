let zombieIndex = 1;
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Resize the canvas based on the window size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const groundY = canvasHeight / 2 + 150;

/* ZOMBIE */
let zombieX = 50;
let zombieY = groundY - 450;
const zombieWidth = 200 * 0.55;
const zombieHeight = 327 * 0.6;
let zombieSpeedY = -2;
const gravity = 0.38;
const jumpPower = -14.5;
let isJumping = true;
let isAttacking = false;
const cropIndex = 100;
let zombieSpeed = 1;
const ghostScore = 500;

/* OBSTACLES */
let obstacles = [];
let ghostObstacles = [];
let ghostActive = false;
const obstacleImages = [];
const numObstacleImages = 7;
const obstacleWidth = 120 * 0.6;
const obstacleHeight = 140 * 0.6;
const ghostWidth = 150 * 0.6;
const ghostHeight = 200 * 0.6;
const initialObstacleSpeed = 5;
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

/* IMAGES */
const zombieRunImages = [];
const zombieJumpImages = [];
const zombieIdleImages = [];
const zombieAttackImages = [];

// Load images for animations
function loadImageArray(basePath, count, array) {
  for (let i = 1; i <= count; i++) {
    const img = new Image();
    img.src = `${basePath} (${i}).png`;
    array.push(img);
  }
}

loadImageArray(`../../assets/sprites/${zombieIndex}/Run`, 8, zombieRunImages);
loadImageArray(
  `../../assets/sprites/${zombieIndex}/Jump`,
  15,
  zombieJumpImages
);
loadImageArray(
  `../../assets/sprites/${zombieIndex}/Idle ${zombieIndex}`,
  10,
  zombieIdleImages
);
loadImageArray(
  `../../assets/sprites/${zombieIndex}/Attack`,
  8,
  zombieAttackImages
);

const backgroundImage = new Image();
backgroundImage.src = "../../assets/img/BackgroundGameOut-1.jpg";

const groundImage = new Image();
groundImage.src = "../../assets/img/Background-1.jpg";

for (let i = 1; i <= numObstacleImages; i++) {
  const img = new Image();
  img.src = `../../assets/sprites/obs/${i}.png`;
  obstacleImages.push(img);
}

const ghostImages = [];
for (let i = 0; i <= 3; i++) {
  const img = new Image();
  img.src = `../../assets/sprites/ghost/${i}.png`;
  ghostImages.push(img);
}

// Load all images before starting the game
function loadImages(images) {
  return Promise.all(
    images.map(
      (image) =>
        new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = () =>
            reject(new Error(`Failed to load image: ${image.src}`));
        })
    )
  );
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

  ctx.drawImage(
    groundImage,
    groundX,
    groundY - groundHeight,
    groundWidth,
    groundHeight
  );
  ctx.drawImage(
    groundImage,
    groundX + groundWidth,
    groundY - groundHeight,
    groundWidth,
    groundHeight
  );
}

function drawZombie() {
  frameCount++;
  if (frameCount >= frameSpeed) {
    frameCount = 0;
    const currentImages = isJumping
      ? zombieJumpImages
      : isAttacking
      ? zombieAttackImages
      : zombieRunImages;
    currentFrame = (currentFrame + 1) % (currentImages.length || 1);
  }

  const currentImages = isJumping
    ? zombieJumpImages
    : isAttacking
    ? zombieAttackImages
    : zombieRunImages;
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
    console.warn("currentImage is undefined or invalid:", currentImage);
  }
}

function drawObstacles() {
  obstacles.forEach((obstacle) => {
    const obstacleImg = obstacleImages[obstacle.imgIndex];
    ctx.drawImage(
      obstacleImg,
      obstacle.x,
      groundY - obstacleHeight - 170,
      obstacleWidth,
      obstacleHeight
    );
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

  // Update jumping logic
  if (isJumping) {
    zombieSpeedY += gravity;
    zombieY += zombieSpeedY;
    if (zombieY >= groundY - zombieHeight - 150) {
      zombieY = groundY - zombieHeight - 150;
      isJumping = false;
    }
  }

  // Update obstacles position
  obstacles.forEach((obstacle) => {
    obstacle.x -= obstacleSpeed;
  });

  // Update ghost obstacles position
  ghostObstacles.forEach((ghost) => {
    ghost.x -= obstacleSpeed;
  });

  // Check collision with obstacles
  obstacles.forEach((obstacle) => {
    if (
      checkCollision(
        zombieX,
        zombieY,
        obstacle.x,
        groundY - obstacleHeight - 170,
        obstacleWidth,
        obstacleHeight
      )
    ) {
      gameOver = true;
    }
  });

  // Check collision with ghosts
  ghostObstacles.forEach((ghost) => {
    if (checkCollision(zombieX, zombieY, ghost.x, ghost.y, ghostWidth, ghostHeight)) {
      if (isAttacking) {
        ghost.isHit = true;
      } else {
        gameOver = true;
      }
    }
  });

  // Remove off-screen obstacles and ghosts
  obstacles = obstacles.filter((obstacle) => obstacle.x + obstacleWidth > 0);
  ghostObstacles = ghostObstacles.filter((ghost) => {
    if (ghost.x + ghostWidth <= 0 || ghost.isHit) {
      ghostActive = false;
      return false;
    }
    return true;
  });

  // Update score
  score += multiplier * 0.1;

  // Increase speed as the score increases
  if (Math.floor(score) % 100 === 0) {
    obstacleSpeed += 0.1;
    zombieSpeed += 0.1;
  }

  // Spawn new obstacles or ghosts
  spawnEntities();
}

function draw() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawBackground();
  drawGround();

  if (gameOver) {
    gameOverScreen();
    
  const user = window.Telegram.WebApp.initDataUnsafe.user;

  if (user) {
    fetch(`api/users/${user.id}/addmoney`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ money: tokens }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error("Error:", data.error);
        } else {
          console.log("Money added:", data);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
      });
  } else {
    console.error("User data not found.");
  }
    return;
  }

  drawZombie();
  drawObstacles();

  const scoreImg = new Image();
  const tokensImg = new Image();

  scoreImg.src = "../../assets/icons/rocket.png";
  tokensImg.src = "../../assets/icons/coin.png";

  Promise.all([
    new Promise((resolve) => (scoreImg.onload = resolve)),
    new Promise((resolve) => (tokensImg.onload = resolve)),
  ]).then(() => {
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const centerX = canvas.width / 2;
    const imageY = 20;
    const imageHeight = 30;

    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 10;

    const spacing = 60;

    ctx.drawImage(scoreImg, centerX - 190, imageY, imageHeight, imageHeight);
    ctx.fillText(
      `${Math.floor(score)}`,
      centerX - 190 + imageHeight + spacing / 2,
      imageY + imageHeight / 2
    );

    ctx.drawImage(
      tokensImg,
      centerX - 190 + imageHeight + spacing,
      imageY,
      imageHeight,
      imageHeight
    );
    ctx.fillText(
      `${tokens}`,
      centerX - 190 + imageHeight + spacing + imageHeight + spacing / 2,
      imageY + imageHeight / 2
    );

    ctx.shadowColor = "transparent";
  });
}

function checkCollision(
  zombieX,
  zombieY,
  obstacleX,
  obstacleY,
  obstacleWidth,
  obstacleHeight
) {
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
}

// Spawn a new obstacle
function spawnObstacle() {
  const imgIndex = Math.floor(Math.random() * numObstacleImages);
  const x = canvasWidth;
  obstacles.push({ x, imgIndex });
}

// Spawn a new ghost
function spawnGhost() {
  const x = canvasWidth;
  const y = groundY - ghostHeight - 170;
  ghostObstacles.push({ x, y, frameIndex: 0, frameCount: 0, isHit: false });
}

// Decide whether to spawn a ghost or an obstacle
function spawnEntities() {
  const now = Date.now();
  const obstacleSpawnInterval = 2200; // Adjust spawn interval as needed
  if (now - lastObstacleSpawnTime > obstacleSpawnInterval) {
    if (score > ghostScore) {
      if (Math.random() > spawnSensitivity) {
        spawnGhost();
      } else {
        spawnObstacle();
      }
    } else {
      spawnObstacle();
    }
    lastObstacleSpawnTime = now;
  }
}

// Display the game over screen
function gameOverScreen() {
  ctx.font = "40px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Game Over", canvasWidth / 2, canvasHeight / 2 - 50);
  ctx.font = "40px Arial";
  ctx.fillText(`Score: ${Math.floor(score)}`, canvasWidth / 2, canvasHeight / 2 + 10);


  setTimeout(() => {
    window.location.href = "/";
  }, 1000);
}

// Restart the game
function restartGame() {
  window.removeEventListener("click", restartGame);
  resetGame();
  startGame();
}

// Start the game after loading all images
function startGame() {
  loadImages([
    backgroundImage,
    groundImage,
    ...obstacleImages,
    ...ghostImages,
    ...zombieRunImages,
    ...zombieJumpImages,
    ...zombieIdleImages,
    ...zombieAttackImages,
  ])
    .then(() => {
      gameStarted = true;
      window.addEventListener("click", restartGame);
      setInterval(gameLoop, 1000 / 60);
    })
    .catch((error) => {
      console.error("Error loading images:", error);
    });
}

// Main game loop
function gameLoop() {
  if (!gameOver) {
    update();
    draw();
  } else {
    gameOverScreen();
  }
}

startGame();
document.addEventListener("keydown", handleKeyDown);

const DOUBLE_TAP_DELAY = 300; // Delay for double tap in milliseconds
let tapTimeout;

window.addEventListener("touchend", handleTouchEnd);

// Handle keyboard input
function handleKeyDown(event) {
  if ((event.key === "ArrowUp" || event.key === " ") && !isJumping) {
    jump();
  }
  if (event.key === "a") {
    attack();
  }
}

// Handle touch input
function handleTouchEnd() {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTap;

  clearTimeout(tapTimeout); // Clear the previous timer

  if (tapLength < DOUBLE_TAP_DELAY && tapLength > 0) {
    attack();
  } else {
    tapTimeout = setTimeout(() => {
      jump();
    }, DOUBLE_TAP_DELAY);
  }

  lastTap = currentTime;
}

// Make the zombie jump
function jump() {
  zombieSpeedY = jumpPower;
  isJumping = true;
  tokens += 1 + Math.floor(score / 400);
}

// Make the zombie attack
function attack() {
  isAttacking = true;
  setTimeout(() => {
    isAttacking = false;
  }, 500);
}
