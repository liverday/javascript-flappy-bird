const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let frames = 0;
const sprite = new Image();
sprite.src = "assets/img/sprite.png";

const gameState = {
    getReady: 0,
    game: 1,
    over: 2,
    current: 0
}

document.addEventListener('click', function () {
    switch (gameState.current) {
        case gameState.getReady:
            gameState.current = gameState.game;
            break;
        case gameState.game:
            bird.flap();
            break;
        case gameState.over:
            gameState.current = gameState.getReady;
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

    draw() {
        ctx.drawImage(sprite, this.spriteX, this.spriteY, this.width, this.height, this.x, this.y, this.width, this.height);
        ctx.drawImage(sprite, this.spriteX, this.spriteY, this.width, this.height, this.x + this.width, this.y, this.width, this.height);
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

    frame: 0,

    draw() {
        let actualBirdFrame = this.animations[this.frame];
        
        ctx.drawImage(sprite, actualBirdFrame.spriteX, actualBirdFrame.spriteY, this.width, this.height, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
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
    y: 120,

    draw() {
        if (gameState.current == gameState.over) {
            ctx.drawImage(sprite, this.spriteX, this.spriteY, this.width, this.height, this.x, this.y, this.width, this.height);
        }
    }
}

function draw() {
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    background.draw();
    foreground.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
}

function update() {

}

function loop() {
    update();
    draw();
    frames++;

    requestAnimationFrame(loop);
}

loop();