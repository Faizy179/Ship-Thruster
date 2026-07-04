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
