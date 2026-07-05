const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d");

const player = {
    x: canvas.width/2,
    y:canvas.height/2,
    radius:15,
    speed:5,
    angle:0,
    spinSpeed:0.04,
    color:"cyan"
}
let  enemies = [];
let isThrusting = false;
let isGameOver = false;
let lastSpacePress = 0;
let bullets = [];
let lastShotTime = 0;
let lastSpawnTime = 0;
let lastFireTime = 0;
let enemiesKilled = 0;
let maxEnemies = 3;
const SHOOT_COOLDOWN = 700; //0.7 second cooldown
const SPAWN_COOLDOWN = 2500; //2.5 second cooldown
let keyDownTime = 0;
let particles = [];
const stars = [];
const HITBOX_INCREASE = 8;
let highScore = localStorage.getItem("shipThrusterHighScore") || 0;
const shootSound = new Audio ("shoot.mp3");
const boomSound = new Audio ("bangSmall.wav");
const gameOverSound  = new Audio("gameOver.mp3");
shootSound.volume = 0.2;
for(let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5, // Tiny dots
        alpha: Math.random() // Random starting brightness
    });
}
document.addEventListener(
    "keydown",(e) => {
        if(e.code === "Space"){
            if(isGameOver){
                resetGame()
                return;
            }
            if(e.repeat){
                return;
            }
            bullets.push({
                x: player.x,
                y: player.y,
                radius: 5,
                speed: 10,
                angle: player.angle, 
                color: "yellow"
            }
             );
             playSound(shootSound);
            lastFireTime = performance.now();
            isThrusting = true; 
        }
    }
);

document.addEventListener(
    "keyup",(e) => {
        if(e.code === "Space"){
            isThrusting = false;
            const keyUpTime = performance.now();

        }
    }
);

function updateLogic(currentTime){
    if(isThrusting){
        player.x += Math.cos(player.angle) * player.speed;
        player.y += Math.sin(player.angle) *player.speed;
    }
    else if(currentTime-lastFireTime > 200){
        player.angle+=player.spinSpeed
    }
    if (player.x > canvas.width + player.radius) {
        player.x = -player.radius; 
    } else if (player.x < -player.radius) {
        player.x = canvas.width + player.radius;
    }

    if (player.y > canvas.height + player.radius) {
        player.y = -player.radius;
    } else if (player.y < -player.radius) {
        player.y = canvas.height + player.radius;
    }
    //enemy logic
    enemies.forEach(
        enemy =>{
            const  angleToPlayere  = Math.atan2((player.y-enemy.y),(player.x-enemy.x));
            enemy.vx += Math.cos(angleToPlayere) *0.05; 
            enemy.vy += Math.sin(angleToPlayere) * 0.05;
            const currentSpeed = Math.hypot(enemy.vx,enemy.vy);
            if(currentSpeed > enemy.maxSpeed){
                enemy.vx = (enemy.vx/currentSpeed) *enemy.maxSpeed;
                enemy.vy = (enemy.vy/currentSpeed) * enemy.maxSpeed;
            }
            enemy.x+=enemy.vx;
            enemy.y+=enemy.vy;
        }
    );
    if((currentTime-lastSpawnTime) >=SPAWN_COOLDOWN){
        if(enemies.length <maxEnemies){
            const randomAngle = Math.random()*Math.PI*2;
            const spawnDistance = 600;
            const spawnX = (canvas.width/2) + Math.cos(randomAngle) *spawnDistance;
            const spawnY = (canvas.height/2) + Math.sin(randomAngle)*spawnDistance;
            enemies.push(
                {
                    x:spawnX,
                    y:spawnY,
                    vx:0.0,
                    vy:0.0,
                    radius:12,
                    maxSpeed:1.5,
                    color:"red"
                }
            );  
        }

        lastSpawnTime = currentTime;
    }
    bullets.forEach(
        bullet =>{
            bullet.x += Math.cos(bullet.angle) *bullet.speed;
            bullet.y += Math.sin(bullet.angle) * bullet.speed;
        }
    );
    for (let i = 0; i < enemies.length; i++){
        const e = enemies[i];
        const dist = Math.hypot(player.x-e.x,player.y-e.y);
        if(dist < (player.radius + e.radius)){

            playSound(gameOverSound);
            isGameOver = true;
            break;
        }
    }
    for(let i= bullets.length-1; i>=0; i--){
        for(let j = enemies.length-1; j>=0;j--){
            const b = bullets[i];
            const e = enemies[j];
            const dist = Math.hypot(b.x-e.x,b.y-e.y);
            if(dist < b.radius+e.radius + HITBOX_INCREASE){
                for(let k =0; k <15; k++){
                    particles.push(
                        {
                            x: e.x,
                            y:e.y,
                            vx:(Math.random()-0.5)*5,
                            vy: (Math.random()-0.5)*5,
                            life: 1.0,
                            color:e.color
                        }
                    );
                }
                bullets.splice(i,1);
                enemies.splice(j,1);
                enemiesKilled++;
                maxEnemies = 3 +Math.floor(enemiesKilled/5);//max enemies increases by one per five enemies killed
                playSound(boomSound);
                break;
            }
        }
    }
    for(let i = particles.length-1; i >= 0; i--){
        let p = particles[i];
        p.x+=p.vx;
        p.y+=p.vy;

        p.life-=0.02;
        if(p.life <= 0){
            particles.splice(i,1);
        }
    }
}
function render(interp){
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    stars.forEach(
        star =>{
            star.alpha+= (Math.random()-0.5)*0.05;
            star.alpha = Math.max(0.1,Math.min(1,star.alpha));
            ctx.fillStyle=`rgba(255, 255, 255, ${star.alpha})`;
            ctx.beginPath();
            ctx.arc(star.x,star.y,star.radius,0,Math.PI*2);
            ctx.fill();
        }
    );
    particles.forEach(
        particle =>{
            ctx.globalAlpha = Math.max(0,particle.life);
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x,particle.y,2,0,Math.PI*2);
            ctx.fill();
        }
    );
    ctx.globalAlpha=1;
    enemies.forEach(
        enemy => {
            ctx.fillStyle = enemy.color;
            ctx.beginPath();
            ctx.arc(enemy.x,enemy.y,enemy.radius,0,(Math.PI * 2));
            ctx.fill();
        }
    );
    bullets.forEach(
        bullet => {
            ctx.fillStyle = bullet.color;
            ctx.beginPath();
            ctx.arc(bullet.x,bullet.y,bullet.radius,0,Math.PI*2);
            ctx.fill();
        }
    );
    ctx.save();
    ctx.translate(player.x,player.y);
    ctx.rotate(player.angle);

    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(20,0);
    ctx.lineTo(-10,10);
    ctx.lineTo(-10,-10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "white";
    ctx.font = "20px monospace";
    ctx.textAlign = "left";
    ctx.fillText("SCORE: " +enemiesKilled,20,40);
    ctx.fillStyle = "gold";
    ctx.fillText("HIGH SCORE: " + highScore,20,70);
}
let lastTime = performance.now();
let delta = 0;
let Fps = 60;
const timePerFrame = 1000/Fps;
function gameLoop(currentTime){
    if(isGameOver){
        if(enemiesKilled > highScore){
            highScore = enemiesKilled;
            localStorage.setItem("shipThrusterHighScore",highScore);
                
        }
        renderGameOver();
        return;
    }
    delta+= (currentTime - lastTime) / timePerFrame;
    lastTime = currentTime;
    if(delta > 10){
        delta  = 1;
    }
    while(delta >= 1){
        updateLogic(currentTime);
        delta--;
    }
    render(delta);
    requestAnimationFrame(gameLoop);
}
function renderGameOver(){
    ctx.fillStyle = "red";
    ctx.font = "50px monospace";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = "white";
    ctx.font = "20px monospace";
    ctx.fillText("press SPACE to try again", canvas.width / 2, (canvas.height / 2) + 40);
}
function resetGame(){
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.angle = 0;
    enemiesKilled = 0;
    maxEnemies = 3;
    delta = 0;
    isThrusting = false
    isGameOver = false;
    enemies = [];
    bullets = [];
    particles = [];
    lastSpawnTime = performance.now();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}
function playSound(sound){
    sound.currentTime = 0;
    sound.play();
}
requestAnimationFrame(gameLoop);