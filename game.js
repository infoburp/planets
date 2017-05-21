function distanceb(x1, y1, x2, y2){
  return Math.sqrt( Math.pow((x1 -x2),2) + Math.pow((y1 - y2),2));
}

function setToFixedVelocity(vec_x ,vec_y, fixedVelocity){
  z = (fixedVelocity) / (Math.pow((vec_x*vec_x)+(vec_y*vec_y),1/2));
  obj = {"x": vec_x*z, "y": vec_y*z}
  return obj
}

function Ball(x,y,xvel,yvel, radius)
{
    this.x=x;
    this.y=y;
    this.xvel=xvel/radius;
    this.yvel=yvel/radius;
    this.radius=radius;
    this.mass=radius;//Math.pow(radius,2) * Math.PI;
}
var $myCanvas = $('#canvas');
$myCanvas.width = window.innerWidth;
console.log($myCanvas.width)
$myCanvas.height = window.innerHeight;
console.log($myCanvas.height)

var canvas = document.getElementsByTagName('canvas')[0];
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

var height = window.innerHeight;
var width = window.innerWidth;
var radius = 16;
var ballvelx = 8;
var ballvely = 8;
var pad = 16;
var n = 64;
var balls = new Array();
while (balls.length<n){
	var new_radius = Math.random()*radius+1;
	new_x = Math.floor((Math.random()*width));
	new_y = Math.floor((Math.random()*height));
	new_xvel = 0;//(Math.random() * 100) / (new_radius * 4);
	new_yvel = 0;//(Math.random() * 100) / (new_radius * 4);
	var new_ball = new Ball(new_x,new_y,new_xvel,new_yvel, new_radius);
    var count = 0;
    balls.forEach(function(other_ball){
    		distance = Math.sqrt(
						((new_ball.x - other_ball.x) * (new_ball.x - other_ball.x)) +
						((new_ball.y - other_ball.y) * (new_ball.y - other_ball.y))
					);
					if (distance < new_ball.radius + other_ball.radius)
						count++

    });

    if (new_ball.x > width - pad - new_ball.radius || new_ball.x < pad + new_ball.radius || new_ball.y > width - pad - new_ball.radius || new_ball.y < pad + new_ball.radius)
    	count++;
    if (count == 0){
    	balls.push(new_ball);
    }
    
}
function RGB2Color(r,g,b)
{
	return 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')';
}

function collide(){
	balls.forEach(function( ball ) {
		balls.forEach(function( other_ball ){
			if(ball != other_ball){
				if(ball.x + ball.radius + other_ball.radius > other_ball.x 
				&& ball.x < other_ball.x + ball.radius + other_ball.radius
				&& ball.y + ball.radius + other_ball.radius > other_ball.y 
				&& ball.y < other_ball.y + ball.radius + other_ball.radius)
				{
				    //AABBs are overlapping
				    distance = Math.sqrt(
						((ball.x - other_ball.x) * (ball.x - other_ball.x)) +
						((ball.y - other_ball.y) * (ball.y - other_ball.y))
					);
					if (distance < ball.radius + other_ball.radius)
					{
					    //balls have collided
					    collisionPointX = 
						 ((ball.x * other_ball.radius) + (other_ball.x * ball.radius)) 
						 / (ball.radius + other_ball.radius);
						 
						collisionPointY = 
						 ((ball.y * other_ball.radius) + (other_ball.y * ball.radius)) 
						 / (ball.radius + other_ball.radius);

						newVelX1 = (ball.xvel * (ball.mass - other_ball.mass) + (2 * other_ball.mass * other_ball.xvel)) / (ball.mass + other_ball.mass);
						newVelY1 = (ball.yvel * (ball.mass - other_ball.mass) + (2 * other_ball.mass * other_ball.yvel)) / (ball.mass + other_ball.mass);
						newVelX2 = (other_ball.xvel * (other_ball.mass - ball.mass) + (2 * ball.mass * ball.xvel)) / (ball.mass + other_ball.mass);
						newVelY2 = (other_ball.yvel * (other_ball.mass - ball.mass) + (2 * ball.mass * ball.yvel)) / (ball.mass + other_ball.mass);
						
						ball.xvel = newVelX1;
						other_ball.xvel = newVelX2;
						ball.yvel = newVelY1;
						other_ball.yvel = newVelY2;

						ball.x = ball.x + newVelX1;
						ball.y = ball.y + newVelY1;
						other_ball.x = other_ball.x + newVelX2;
						other_ball.y = other_ball.y + newVelY2;

						ball.xvel *= 0.9;
						other_ball.xvel *= 0.9;
						ball.yvel *= 0.9;
						other_ball.yvel *= 0.9;
					}
				}
			}
		});
    });
}
function gravitate(){
	for(i=0;i<balls.length;i++){
		for(a=0;a<balls.length;a++){
		  //gravity interaction
		  if(i != a){
		    distance = Math.round(distanceb(balls[i].x,balls[i].y,balls[a].x,balls[a].y)*100)/100 + 100;
		    gravityConst = balls[i].mass * balls[i].mass/(distance * distance);
		    /*
		    if(gravityConst > 1){
		      gravityConst = 1;
		    }*/
		    newGvecx = balls[a].x - balls[i].x;
		    newGvecy = balls[a].y - balls[i].y;
		    deltaGvecx = setToFixedVelocity(newGvecx ,newGvecy, gravityConst).x;
		    deltaGvecy = setToFixedVelocity(newGvecx ,newGvecy, gravityConst).y;
		    deltaVecx = balls[i].xvel + deltaGvecx;
		    deltaVecy = balls[i].yvel + deltaGvecy;
		    balls[i].xvel = deltaVecx;
		    balls[i].yvel = deltaVecy;
		  }
		}
	}
}
function update(){
	balls.forEach(function( ball ) {
			ball.x += ball.xvel;
		ball.y += ball.yvel;
		if (ball.x >= width - (ball.radius + pad) || ball.x <= (ball.radius + pad)){
			ball.xvel = -ball.xvel;
		}
		if (ball.y >= height - (ball.radius + pad) || ball.y <= (ball.radius + pad)){
			ball.yvel = -ball.yvel;
		}
	});
	
	
}

function draw(){
	$myCanvas.clearCanvas();
	balls.forEach(function( ball ) {
		$myCanvas.drawArc({
			  strokeStyle: 'grey',
			  strokeWidth: 2,
			  x: ball.x, y: ball.y,
			  radius: ball.radius,
			  // start and end angles in degrees
			  start: 0, end: 360
			});
	});

}
var FPS = 60;
setInterval(function() {
	update();
  	draw();
  	gravitate();
  	collide();
}, 1000/FPS);