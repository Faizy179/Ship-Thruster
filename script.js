const canvas = document.getElementById("main-cavas");
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

function updateLogic(){
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
            enemy.x = Math.cos(angleToPlayere) *enemy.speed; 
            enemy.y = Math.sin(angleToPlayere) * enemy.speed;
        }
    );
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
function gameLoop(){
    console.log("Game is running");
    delta+= (currentTime - lastTime) / timePerFrame;
    lastTime = currentTime;
    if(delta > 10){
        delta  = 1;
    }
    while(delta >= 1){
        updateLogic();
        delta--;
    }
    render(delta);
    requestAnimationFrame(gameLoop);
}


enemies.push({ x: 50, y: 50, radius: 12, speed: 2, color: "red" });
requestAnimationFrame(gameLoop);
