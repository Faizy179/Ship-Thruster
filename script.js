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
const SHOOT_COOLDOWN = 700; //0.7 second cooldown
const SPAWN_COOLDOWN = 2000; //2 second cooldown
let keyDownTime = 0;
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
            keyDownTime = performance.now();
            isThrusting = true;
        }
    }
);

document.addEventListener(
    "keyup",(e) => {
        if(e.code === "Space"){
            isThrusting = false;
            const keyUpTime = performance.now();
            if(keyUpTime -keyDownTime < 200){
                bullets.push({
                    x: player.x,
                    y: player.y,
                    radius: 5,
                    speed: 10,
                    angle: player.angle, 
                    color: "yellow"
                }
             );
             lastFireTime = performance.now();
            }
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
            enemy.x += Math.cos(angleToPlayere) *enemy.speed; 
            enemy.y += Math.sin(angleToPlayere) * enemy.speed;
        }
    );
    /*
    if((currentTime - lastShotTime) >= SHOOT_COOLDOWN && enemies.length >0){
        let nearestEnemy = enemies[0];
        let minDistanc = Infinity;
        enemies.forEach(
            enemy => {
                const dist = Math.hypot(player.x-enemy.x,player.y-enemy.y);
                if(dist < minDistanc){
                    minDistanc = dist;
                    nearestEnemy = enemy;
                }
            }
        );
        const angleToEnemey = Math.atan2(nearestEnemy.y-player.y, nearestEnemy.x-player.x);
        bullets.push(
            {
                x: player.x,
                y: player.y,
                radius: 5,
                speed:10,
                angle: angleToEnemey,
                color: "yellow"
            }
        );
        lastShotTime = currentTime;
    }
*/
    if((currentTime-lastSpawnTime) >=SPAWN_COOLDOWN){
        const randomAngle = Math.random()*Math.PI*2;
        const spawnDistance = 600;
        const spawnX = (canvas.width/2) + Math.cos(randomAngle) *spawnDistance;
        const spawnY = (canvas.height/2) + Math.sin(randomAngle)*spawnDistance;
        enemies.push(
            {
                x:spawnX,
                y:spawnY,
                radius:12,
                speed:1.5,
                color:"red"
            }
        );
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
            isGameOver = true;
            break;
        }
    }
    for(let i= bullets.length-1; i>=0; i--){
        for(let j = enemies.length-1; j>=0;j--){
            const b = bullets[i];
            const e = enemies[j];
            const dist = Math.hypot(b.x-e.x,b.y-e.y);
            if(dist < b.radius+e.radius){
                bullets.splice(i,1);
                enemies.splice(j,1);
                break;
            }
        }
    }
}
function render(interp){
    ctx.clearRect(0,0,canvas.width,canvas.height);
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
}
let lastTime = performance.now();
let delta = 0;
let Fps = 60;
const timePerFrame = 1000/Fps;
function gameLoop(currentTime){
    if(isGameOver){
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

    delta = 0;
    isThrusting = false
    isGameOver = false;
    enemies = [];
    bullets = [];
    lastSpawnTime = performance.now();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);