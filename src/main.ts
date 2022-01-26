import './style.css';
import rocketImage from './img/rocket.svg';
import monsterImage from './img/monster.svg';
import { Circle, Position, Rectangle, Velocity } from './types';

const scoreEl = document.querySelector<HTMLDivElement>('#scoreEl')!
const resultEl = document.querySelector<HTMLHeadingElement>("#result")!
resultEl.classList.add('hide');
const canvas = document.querySelector<HTMLCanvasElement>('canvas')!
canvas.width = 1024
canvas.height = 576

const ctx = canvas.getContext('2d')!
const INVADER_WIDTH = 32.75
const INVADER_HEIGHT = 37.5
let score = 0;


ctx.fillStyle = "#000000"
ctx.fillRect(0, 0, canvas.width, canvas.height)

const game = {
  over: false,
  active: true
}

const keys = {
  left: { pressed: false },
  right: { pressed: false },
  space: { pressed: false }
}

class Player {
  position: Position = {
    x: 0,
    y: 0
  }
  height = 100;
  width = 100;
  velocity: Velocity = {
    x: 0,
    y: 0
  }
  rotation = 0
  image: HTMLImageElement = new Image();
  constructor() {
    this.image.src = rocketImage;
    this.image.onload = () => {
      this.height = this.image.height / 5;
      this.width = this.image.width / 5;
      this.position.x = canvas.width / 2 - this.width / 2;
      this.position.y = canvas.height - this.height - 10;
    }
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = game.over ? 0 : 1;
    ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2)
    ctx.rotate(this.rotation);
    ctx.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2)
    ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    ctx.restore();
  }
  update() {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
  }
  shoot(projectiles: Projectile[]) {
    projectiles.push(new Projectile({
      position: { x: this.position.x + this.width / 2, y: this.position.y },
      color: 'yellow',
      radius: 4,
      velocity: { x: 0, y: 10 }
    }))
  }
}

class Projectile {
  position: Position
  radius: number
  color: string
  velocity: Velocity
  constructor({ color, velocity, position, radius }: Circle) {
    this.position = position;
    this.color = color;
    this.velocity = velocity;
    this.radius = radius;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath()
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.closePath()
  }
  update() {
    this.draw();
    this.position.y -= this.velocity.y
  }
}

class Invader {
  position: Position;
  velocity: Velocity;
  height = 100;
  width = 100;
  image: HTMLImageElement = new Image();
  constructor({ position, velocity }: Rectangle) {
    this.position = position;
    this.velocity = velocity;
    this.image.src = monsterImage;
    this.image.onload = () => {
      this.height = INVADER_HEIGHT;
      this.width = INVADER_WIDTH;
    }
  }
  draw() {
    ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
  }
  update() {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
  }
  shoot(projectiles: Projectile[]) {
    projectiles.push(new Projectile({
      position: { x: this.position.x + this.width / 2, y: this.position.y },
      color: 'white',
      radius: 5,
      velocity: { x: 0, y: -5 }
    }))
  }
}

class Grid {
  position: Position;
  velocity: Velocity;
  height = 100;
  width = 100;
  invaders: Invader[] = [];
  columns: number
  rows: number
  constructor() {
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };

    this.columns = Math.floor(Math.random() * 10 + 5);
    this.rows = Math.floor(Math.random() * 5) + 2;
    for (let i = 0; i < this.columns; i++) {
      this.height += INVADER_HEIGHT;
      for (let j = 0; j < this.rows; j++) {
        this.width += INVADER_WIDTH;
        this.invaders.push(new Invader({
          velocity: {
            x: 5,
            y: 0
          },
          position: {
            x: i * INVADER_WIDTH,
            y: j * INVADER_HEIGHT
          }
        }));
      }
    }
  }
}

class Particle {
  position: Position
  velocity: Velocity
  radius: number
  opacity: number
  color: string
  fade: boolean;
  constructor({ position, velocity, radius, opacity, color, fade }: Circle) {
    this.position = position
    this.velocity = velocity
    this.radius = radius
    this.opacity = opacity || 1
    this.color = color || 'white'
    this.fade = fade || true
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.beginPath()
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.closePath()
    ctx.restore();
  }
  update() {
    this.draw();
    this.position.y -= this.velocity.y
    this.position.x -= this.velocity.x
    if (this.fade) {
      if (this.opacity) {
        this.opacity = this.opacity - 0.02
      } else {
        this.opacity = 0
      };
    }
  }
}

const player = new Player();
const projectiles: Projectile[] = [];
const invaderProjectiles: Projectile[] = [];
const grids: Grid[] = []
const particles: Particle[] = []
const background: Particle[] = []
for (let i = 0; i < 100; i++) {
  background.push(new Particle({
    position: { x: Math.random() * canvas.width, y: Math.random() * canvas.height },
    velocity: { x: 0, y: -3 },
    color: 'white',
    radius: Math.random() * 2,
    fade: false
  }));
}
let frames = 0;
let gridGenerationGap = 0;
function animate() {
  if (!game.active) return;
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  background.forEach(bg => {
    if (bg.position.y >= canvas.height) {
      bg.position.y = 0;
    }
    bg.update()
  })
  player.update();

  grids.forEach((grid, gIndex) => {
    if (grid.invaders.length > 0) {
      grid.invaders.forEach((invader, iIndex) => {
        if (invader.position.y + INVADER_HEIGHT >= canvas.height) {
          setTimeout(() => {
            grid.invaders.splice(iIndex, 1);
          }, 0)
        } else {
          invader.update();
          invader.velocity.y = 0;

          if (grid.invaders[0].position.x + INVADER_WIDTH * grid.columns >= canvas.width || grid.invaders[0].position.x <= 0) {
            invader.velocity.x = -invader.velocity.x;
            invader.velocity.y = INVADER_HEIGHT
          }

          // collision
          projectiles.forEach((projectile, pIndex) => {
            if (invader.position.x + invader.width >= projectile.position.x + projectile.radius &&
              invader.position.x <= projectile.position.x - projectile.radius &&
              invader.position.y + invader.height >= projectile.position.y + projectile.radius &&
              invader.position.y <= projectile.position.y - projectile.radius) {
              for (let i = 0; i < 50; i++) {
                particles.push(new Particle({
                  position: { x: invader.position.x, y: invader.position.y },
                  velocity: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 },
                  color: 'red',
                  radius: Math.random() * 3,
                  fade: true
                }));
              }
              setTimeout(() => {
                grid.invaders.splice(iIndex, 1);
                projectiles.splice(pIndex, 1);
              }, 0)
              // update score
              score += 100;
              scoreEl.innerHTML = score.toString();
            }
          });
        }
      });

      if (frames % 100 === 0) {
        const randomIndex = Math.floor(Math.random() * grid.invaders.length);
        grid.invaders[randomIndex].shoot(invaderProjectiles);
        frames = 0;
      }
    }

    if (grid.invaders.length <= 0) {
      setTimeout(() => {
        grids.splice(gIndex, 1);
      }, 0);

    }
  });

  particles.forEach((particle, particleIndex) => {
    if (particle.opacity <= 0) {
      setTimeout(() => {
        particles.splice(particleIndex, 1)
      }, 0);
    } else {
      particle.update();
    }
  });

  projectiles.forEach((projectile, pIndex) => {
    if (projectile.position.y + projectile.radius >= 0) {
      projectile.update()
    } else {
      projectiles.splice(pIndex, 1);
    }
  });

  invaderProjectiles.forEach((iProjectile, pIndex) => {
    if (iProjectile.position.y + iProjectile.radius >= 0) {
      iProjectile.update();
    } else {
      invaderProjectiles.splice(pIndex, 1);
    }
    if (player.position.x + player.width >= iProjectile.position.x + iProjectile.radius &&
      player.position.x <= iProjectile.position.x - iProjectile.radius &&
      player.position.y + player.height >= iProjectile.position.y + iProjectile.radius &&
      player.position.y <= iProjectile.position.y - iProjectile.radius) {

      for (let i = 0; i < 50; i++) {
        particles.push(new Particle({
          position: { x: player.position.x + player.width / 2, y: player.position.y + player.height / 2 },
          velocity: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 },
          color: '#b80e39',
          radius: Math.random() * 3,
          fade: true
        }));
      }
      game.over = true;
      setTimeout(() => {
        showResult('you lose')
        invaderProjectiles.splice(pIndex, 1)
      }, 0)
      setTimeout(() => {
        game.active = false;
      }, 3000);
    }
  });

  if (score > 10000) {
    showResult('You Win!');
    game.active = false;
    game.over = true;
  }

  if (keys.right.pressed && player.position.x + player.width <= canvas.width) {
    player.velocity.x = 5;
    player.rotation = 0.3
  } else if (keys.left.pressed && player.position.x >= 0) {
    player.velocity.x = -5;
    player.rotation = -0.3
  } else {
    player.velocity.x = 0;
    player.rotation = 0
  }

  if (gridGenerationGap % Math.floor(Math.random() * 500 + 300) === 0 || grids.length <= 0) {
    grids.push(new Grid());
    gridGenerationGap = 0
  }

  frames++;
  gridGenerationGap++;
}

animate();

function showResult(text: string) {
  resultEl.innerHTML = text;
  resultEl.classList.remove('hide');
}

function keyDownFn({ key }: KeyboardEvent) {
  if (game.over) return
  switch (key) {
    case 'a':
    case 'ArrowLeft':
      keys.left.pressed = true;
      break;
    case 'd':
    case 'ArrowRight':
      keys.right.pressed = true;
      break;
    case ' ':
      keys.space.pressed = true;
      player.shoot(projectiles);
      break;
  }
}

function keyUpFn({ key }: KeyboardEvent) {
  switch (key) {
    case 'a':
    case 'ArrowLeft':
      keys.left.pressed = false;
      break;
    case 'd':
    case 'ArrowRight':
      keys.right.pressed = false;
      break;
    case ' ':
      keys.space.pressed = false;
      break;
  }
}

addEventListener('keydown', keyDownFn)
addEventListener('keyup', keyUpFn)
