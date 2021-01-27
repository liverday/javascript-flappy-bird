const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let frames = 0;
const sprite = new Image();
sprite.src = "assets/img/sprite.png";

const audios = {
    flap: new Audio('assets/audio/sfx_flap.wav'),
    die: new Audio('assets/audio/sfx_die.wav'),
    hit: new Audio('assets/audio/sfx_hit.wav'),
    point: new Audio('assets/audio/sfx_point.wav'),
    swooshing: new Audio('assets/audio/sfx_swooshing.wav')
}

const gameState = {
    getReady: 0,
    game: 1,
    over: 2,
    current: 0
}

const DEGREE = Math.PI / 180;

const startButton = {
    x: 120,
    y: 263,
    width: 83,
    height: 29
}

document.addEventListener('click', function (evt) {
    switch (gameState.current) {
        case gameState.getReady:
            gameState.current = gameState.game;
            break;
        case gameState.game:
            bird.flap();
            break;
        case gameState.over:
            const rect = canvas.getBoundingClientRect();
            const clickX = evt.clientX - rect.left;
            const clickY = evt.clientY - rect.top;

            if (
                clickX > startButton.x &&
                clickX <= startButton.x + startButton.width &&
                clickY > startButton.y &&
                clickY <= startButton.y + startButton.height
            ) {
                gameState.current = gameState.getReady;
                bird.reset();
                pipes.reset();
                score.reset();
                audios.swooshing.play();
            }

            break;
    }
});

const background = {
    spriteX: 0,
    spriteY: 0,
    width: 275,
    height: 226,
    x: 0,
    y: canvas.height - 226,

    draw() {
        ctx.drawImage(sprite, this.spriteX, this.spriteY, this.width, this.height, this.x, this.y, this.width, this.height);
        ctx.drawImage(sprite, this.spriteX, this.spriteY, this.width, this.height, this.x + this.width, this.y, this.width, this.height);
    }
}

const foreground = { 
    spriteX: 276,
    spriteY: 0,
    width: 224,
    height: 112,
    x: 0,
    y: canvas.height - 112,
    deltaX: 2,

    draw() {
        ctx.drawImage(sprite, this.spriteX, this.spriteY, this.width, this.height, this.x, this.y, this.width, this.height);
        ctx.drawImage(sprite, this.spriteX, this.spriteY, this.width, this.height, this.x + this.width, this.y, this.width, this.height);
    },
    
    update() {
        if (gameState.current == gameState.game) {
            this.x = (this.x - this.deltaX) % (this.width / 2);
        }
    }
}

const bird = {
    animations: [
        { spriteX: 276, spriteY: 112},
        { spriteX: 276, spriteY: 139},
        { spriteX: 276, spriteY: 164},
        { spriteX: 276, spriteY: 139},
    ],
    width: 34, 
    height: 26,
    x: 50,
    y: 150,
    radius: 12,

    frame: 0,

    speed: 0,
    gravity: 0.25,
    jump: 4.6,

    rotation: 0,

    draw() {
        let actualBirdFrame = this.animations[this.frame];
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, actualBirdFrame.spriteX, actualBirdFrame.spriteY, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    },

    flap() {
        audios.flap.play();
        this.speed = -this.jump;    
    },

    update() {
        const period = gameState.current == gameState.getReady ? 10 : 5;
        this.frame += frames % period == 0 ? 1 : 0;
        this.frame = this.frame % this.animations.length;

        if (gameState.current == gameState.getReady) {
            this.y = 150;
            this.rotation = 0 * DEGREE;
        } else {
            this.speed += this.gravity;
            this.y += this.speed;
            
            if (this.y + this.height / 2  >= canvas.height - foreground.height) {
                this.y = canvas.height - foreground.height;
                if (gameState.current == gameState.game) {
                    audios.die.play();
                    gameState.current = gameState.over;
                }
            }

            if (this.speed >= this.jump) {
                this.rotation = 90 * DEGREE;
                this.frame = 1;
            } else {
                this.rotation = - 25 * DEGREE;
            }
        }
    },

    reset() {
        this.speed = 0;
    }
}

const pipes = {
    bottom: {
        spriteX: 502,
        spriteY: 0,
    },
    top: {
        spriteX: 553,
        spriteY: 0
    },
    width: 53,
    height: 400,
    gap: 85,
    deltaX: 2,
    maxYPos: -150,

    positions: [],

    draw() {
        for (let i = 0; i < this.positions.length; i++) { 
            const actualPipe = this.positions[i];
            const topPipeY = actualPipe.y;
            const bottomPipeY = actualPipe.y + this.height + this.gap;

            ctx.drawImage(sprite, this.top.spriteX, this.top.spriteY, this.width, this.height, actualPipe.x, topPipeY, this.width, this.height);
            ctx.drawImage(sprite, this.bottom.spriteX, this.bottom.spriteY, this.width, this.height, actualPipe.x, bottomPipeY, this.width, this.height);
        }
    },

    update() {
        if (gameState.current !== gameState.game) return;

        if (frames % 100 == 0) {
            this.positions.push({
                x: canvas.width,
                y: this.maxYPos * (Math.random() + 1)
            });
        }

        for (let i = 0; i < this.positions.length; i++) {
            const actualPipe = this.positions[i];
            const bottomPipeY = actualPipe.y + this.gap + this.height;

            if (
                bird.x + bird.radius > actualPipe.x &&
                bird.x - bird.radius < actualPipe.x + this.width &&
                bird.y + bird.radius > actualPipe.y &&
                bird.y - bird.radius < actualPipe.y + this.height
            ) {
                audios.hit.play();
                gameState.current = gameState.over;
            }

            if (
                bird.x + bird.radius > actualPipe.x &&
                bird.x - bird.radius < actualPipe.x + this.width &&
                bird.y + bird.radius > bottomPipeY &&
                bird.y - bird.radius < bottomPipeY + this.height
            ) {
                audios.hit.play();
                gameState.current = gameState.over;
            }

            actualPipe.x -= this.deltaX;

            if (actualPipe.x + this.width <= 0) {
                this.positions.shift();
                score.value++;
                audios.point.play();
            }
        }
    },

    reset() {
        this.positions = [];
    }
}

const score = {
    best: parseInt(localStorage.getItem('@javascript-flappy-bird/best')) || 0,
    value: 0,
    
    draw() {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';

        if (gameState.current == gameState.game) {
            ctx.lineWith = 2;
            ctx.font = '35px Teko';
            ctx.fillText(this.value, canvas.width / 2, 50);
            ctx.strokeText(this.value, canvas.width / 2, 50);
        } else if (gameState.current == gameState.over) {
            this.best = Math.max(this.best, this.value);
            localStorage.setItem('@javascript-flappy-bird/best', this.best);

            ctx.font = '25px Teko';
            ctx.fillText(this.value, 225, 186);
            ctx.strokeText(this.value, 225, 186);
            ctx.fillText(this.best, 225, 228);
            ctx.strokeText(this.best, 225, 228);
        }
    },

    reset() {
        this.value = 0;
    }
}

const getReady = {
    spriteX: 0,
    spriteY: 228,
    width: 173,
    height: 152,
    x: canvas.width/2 - 173/2,
    y: 80,

    draw() {
        if (gameState.current == gameState.getReady) {
            ctx.drawImage(sprite, this.spriteX, this.spriteY, this.width, this.height, this.x, this.y, this.width, this.height);
        }
    }
}

const gameOver = {
    spriteX: 175,
    spriteY: 228,
    width: 225,
    height: 200,
    x: canvas.width/2 - 225/2,
    y: 90,

    draw() {
        if (gameState.current == gameState.over) {
            ctx.drawImage(sprite, this.spriteX, this.spriteY, this.width, this.height, this.x, this.y, this.width, this.height);
        }
    }
}

const medals = {
    copper: {
        spriteX: 359,
        spriteY: 157
    },
    silver: {
        spriteX: 302,
        spriteY: 111,
    },
    gold: {
        spriteX: 302,
        spriteY: 157
    },
    platinum: {
        spriteX: 359,
        spriteY: 111,
    },
    width: 45,
    height: 45,
    x: canvas.width / 2 - 175 / 2,
    y: 176,

    draw() {
        if (gameState.current === gameState.over) {
            let medal;
            if (score.value > 10 && score.value < 20) {
                medal = 'copper';
            } else if (score.value > 20 && score.value < 30) {
                medal = 'silver';
            } else if (score.value > 30 && score.value < 40) {
                medal = 'gold';
            } else if (score.value > 40) {
                medal = 'platinum';
            }
            
            if (medal) {
                const { spriteX, spriteY } = this[medal];
                ctx.drawImage(sprite, spriteX, spriteY, this.width, this.height, this.x, this.y, this.width, this.height)
            }
        }
    }
}

function draw() {
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    background.draw();
    pipes.draw();
    foreground.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
    medals.draw();
}

function update() {
    bird.update();
    pipes.update();
    foreground.update();
}

function loop() {
    update();
    draw();
    frames++;

    requestAnimationFrame(loop);
}

loop();