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



function gameLoop(){

}

if (a === b){
    console.log("A = B");
}
enemies.push({ x: 50, y: 50, radius: 12, speed: 2, color: "red" });
requestAnimationFrame(gameLoop);
