const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d");
const player = {
    x: canvas.width/2,
    y:canvas.height/2,
    radius:15,
    speed:5,
    angle:0,
    spinSpeed:0.05,
    color:"cyan"
}
let  enemies = [];
let isThrusting = false;
let bullets = [];
let lastShotTime = 0;
const SHOOT_COOLDOWN = 1000; //1 second cooldown


document.addEventListener(
    "keydown",(e) => {
        if(e.code === "Space"){
            isThrusting = true;
        }
    }
);

document.addEventListener(
    "keyup",(e) => {
        if(e.code === "Space"){
            isThrusting = false;
        }
    }
);

function updateLogic(currentTime){
    if(isThrusting){
        player.x += Math.cos(player.angle) * player.speed;
        player.y += Math.sin(player.angle) *player.speed;
    }
    else{
        player.angle+=player.spinSpeed
    }
    player.x = Math.max(player.radius,Math.min(canvas.width-player.radius,player.x)); 
    player.y = Math.max(player.radius,Math.min(canvas.height - player.radius, player.y));

    //enemy logic
    enemies.forEach(
        enemy =>{
            const  angleToPlayere  = Math.atan2((player.y-enemy.y),(player.x-enemy.x));
            enemy.x += Math.cos(angleToPlayere) *enemy.speed; 
            enemy.y += Math.sin(angleToPlayere) * enemy.speed;
        }
    );
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
    bullets.forEach(
        bullet =>{
            bullet.x += Math.cos(bullet.angle) *bullet.speed;
            bullet.y += Math.sin(bullet.angle) * bullet.speed;
        }
    );
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
    console.log("Game is running");
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

enemies.push({ x: 50, y: 50, radius: 12, speed: 2, color: "red" });
requestAnimationFrame(gameLoop);
