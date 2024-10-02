// Vår canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Spelvariabler
let player, invaders, bullets, invaderBullets;
let playerSpeed = 30;
let bulletSpeed = 7;
let invaderSpeed = 1;
let gameOver = false;
let score = 0;
let maxInvaders = 20;  // Max antal invaders
let invaderCount = 0;  // Hur många invaders som skapats
let invaderInterval = 3000;  // Tid mellan varje invader
let lastInvaderTime = 0;  // Håller reda på tid för senaste invadern

// Ljud
const shootSound = new Audio('shoot.wav');
const explosionSound = new Audio('explosion.wav');

// Skapa spelaren
class Player {
  constructor() {
    this.width = 50;
    this.height = 20;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - this.height - 10;
    this.color = 'green';
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  move(direction) {
    this.x += direction * playerSpeed;
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
  }
}

// Skapa invaders
class Invader {
  constructor(x, y) {
    this.width = 40;
    this.height = 20;
    this.x = x;
    this.y = y;
    this.color = 'red';
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.y += invaderSpeed;
  }
}

// Hantera bullets
class Bullet {
  constructor(x, y, direction) {
    this.width = 5;
    this.height = 10;
    this.x = x;
    this.y = y;
    this.direction = direction;
  }

  draw() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.y += this.direction * bulletSpeed;
  }
}

// Skapa en invader åt gången
function createInvader() {
  const x = Math.random() * (canvas.width - 40); // Slumpa X-position
  const y = -20;  // Starta invader ovanför skärmen
  return new Invader(x, y);
}

// Initiera spelet
function init() {
  player = new Player();
  invaders = [];
  bullets = [];
  invaderBullets = [];
  gameOver = false;
  score = 0;
  invaderCount = 0;
  lastInvaderTime = 0;
}

// Uppdatera spelet
function update(timestamp) {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Rita spelaren
  player.draw();

  // Skapa invaders en i taget baserat på intervall
  if (timestamp - lastInvaderTime > invaderInterval && invaderCount < maxInvaders) {
    invaders.push(createInvader());
    lastInvaderTime = timestamp;
    invaderCount++;
  }

  // Rita och uppdatera invaders
  invaders.forEach((invader, index) => {
    invader.update();
    invader.draw();

    if (invader.y + invader.height >= player.y) {
      gameOver = true;  // Spelet är över om en invader når spelaren
    }

    // Kollision med bullets
    bullets.forEach((bullet, bulletIndex) => {
      if (
        bullet.x < invader.x + invader.width &&
        bullet.x + bullet.width > invader.x &&
        bullet.y < invader.y + invader.height &&
        bullet.y + bullet.height > invader.y
      ) {
        invaders.splice(index, 1);  // Ta bort invader
        bullets.splice(bulletIndex, 1);  // Ta bort bullet
        explosionSound.play();
        score += 10;
      }
    });
  });

  // Rita och uppdatera bullets
  bullets.forEach((bullet, index) => {
    bullet.update();
    bullet.draw();

    if (bullet.y < 0) {
      bullets.splice(index, 1);  // Ta bort bullet om den lämnar skärmen
    }
  });

  // Visa poäng
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 20);

  // Om spelet är över
  if (gameOver) {
    ctx.fillStyle = 'red';
    ctx.font = '40px Arial';
    ctx.fillText('GAME OVER', canvas.width / 2 - 120, canvas.height / 2);
  }

  // Spelet slutar om alla invaders är besegrade
  if (invaderCount === maxInvaders && invaders.length === 0) {
    gameOver = true;
  }
}

// Hantera input för spelaren
document.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowLeft') {
    player.move(-1);
  } else if (e.code === 'ArrowRight') {
    player.move(1);
  } else if (e.code === 'Space') {
    shootSound.play();
    bullets.push(new Bullet(player.x + player.width / 2 - 2.5, player.y, -1));
  }
});

// Spelloop som körs med requestAnimationFrame
function gameLoop(timestamp) {
  update(timestamp);
  requestAnimationFrame(gameLoop);
}

init();
gameLoop();
