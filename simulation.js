$(function(){
    function Planet(x, y, radius){
        this.x = x;
        this.y = y;
        this.px = x;
        this.py = y;
        this.ax = 0;
        this.ay = 0;
        this.radius = radius;
        this.mass = Math.PI * radius * radius;
    }
    Planet.prototype = {
        accelerate: function(delta){
            this.x += this.ax * delta * delta;
            this.y += this.ay * delta * delta;
            this.ax = 0;
            this.ay = 0;
        },
        inertia: function(delta){
            var x = this.x*2 - this.px;
            var y = this.y*2 - this.py;
            this.px = this.x;
            this.py = this.y;
            this.x = x;
            this.y = y;
        },
        draw: function(context){
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
            context.fill();
        },
    }
    function Simulation(context){
        var planets = this.planets = [];
        var width = context.canvas.width;
        var height = context.canvas.height;
        var damping = 0.01;
        var interval;
        while(planets.length < num_planets){
            var planet = new Planet(
                Math.random() * (context.canvas.width-50) + 25,
                Math.random() * (context.canvas.height-50) + 25,
                Math.random() * 2 + 3
            );
            var collides = false;
            for(var i=0, l=planets.length; i<l; i++){
                var other = planets[i];
                var x = other.x - planet.x;
                var y = other.y - planet.y;
                var length = Math.sqrt(x*x+y*y);
                if(length < other.radius + planet.radius){
                    collides = true;
                    break;
                }
            }
            if(!collides){
                planets.push(planet);
            }
        }      
        function distanceBetween(x1, y1, x2, y2){
            return Math.sqrt( Math.pow((x1 -x2),2) + Math.pow((y1 - y2),2));
        }
        function setToFixedVelocity(vec_x ,vec_y, fixedVelocity){
            z = (fixedVelocity) / (Math.pow((vec_x*vec_x)+(vec_y*vec_y),1/2));
            obj = {"x": vec_x*z, "y": vec_y*z}
            return obj
        }
        function collide(preserve_impulse){
            for(var i=0, l=planets.length; i<l; i++){
                var planet1 = planets[i];
                for(var j=i+1; j<l; j++){
                    var planet2 = planets[j];
                    var x = planet1.x - planet2.x;
                    var y = planet1.y - planet2.y;
                    var slength = x*x+y*y;
                    var length = Math.sqrt(slength);
                    var target = planet1.radius + planet2.radius;
                    if(length < target){
                        var v1x = planet1.x - planet1.px;
                        var v1y = planet1.y - planet1.py;
                        var v2x = planet2.x - planet2.px;
                        var v2y = planet2.y - planet2.py;
                        var factor = (length-target)/length;
                        planet1.x -= x*factor*0.5;
                        planet1.y -= y*factor*0.5;
                        planet2.x += x*factor*0.5;
                        planet2.y += y*factor*0.5;
                        if(preserve_impulse){
                            var f1 = (damping*(x*v1x+y*v1y))/slength;
                            var f2 = (damping*(x*v2x+y*v2y))/slength;
                            v1x += f2*x-f1*x;
                            v2x += f1*x-f2*x;
                            v1y += f2*y-f1*y;
                            v2y += f1*y-f2*y;
                            planet1.px = planet1.x - v1x;
                            planet1.py = planet1.y - v1y;
                            planet2.px = planet2.x - v2x;
                            planet2.py = planet2.y - v2y;
                        }
                    }
                }
            }
        }
        function border_collide_preserve_impulse(){
            for(var i=0, l=planets.length; i<l; i++){
                var planet = planets[i];
                var radius = planet.radius;
                var x = planet.x;
                var y = planet.y;
                if(x-radius < 0){
                    var vx = (planet.px - planet.x)*damping;
                    planet.x = radius;
                    planet.px = planet.x - vx;
                }
                else if(x + radius > width){
                    var vx = (planet.px - planet.x)*damping;
                    planet.x = width-radius;
                    planet.px = planet.x - vx;
                }
                if(y-radius < 0){
                    var vy = (planet.py - planet.y)*damping;
                    planet.y = radius;
                    planet.py = planet.y - vy;
                }
                else if(y + radius > height){
                    var vy = (planet.py - planet.y)*damping;
                    planet.y = height-radius;
                    planet.py = planet.y - vy;
                }
            }
        }
        
        function border_collide(){
            for(var i=0, l=planets.length; i<l; i++){
                var planet = planets[i];
                var radius = planet.radius;
                var x = planet.x;
                var y = planet.y;
                if(x-radius < 0){
                    planet.x = radius;
                }
                else if(x + radius > width){
                    planet.x = width-radius;
                }
                if(y-radius < 0){
                    planet.y = radius;
                }
                else if(y + radius > height){
                    planet.y = height-radius;
                }
            }
        }
        function draw(){
            context.clearRect(0, 0, width, height);
            context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            context.fillStyle = 'rgba(234, 151, 43, 1.0)';
            for(var i=0, l=planets.length; i<l; i++){
                planets[i].draw(context);
            }
        }
        function gravity(){
            for(i=0;i<planets.length;i++){
                for(a=0;a<planets.length;a++){
                    //gravity interaction
                    if(i != a){
                        distance = Math.round(distanceBetween(planets[i].x,planets[i].y,planets[a].x,planets[a].y)*100)/100 + 100;
                        gravityConst = planets[i].mass * planets[i].mass/(distance * distance);
                        newGvecx = planets[a].x - planets[i].x;
                        newGvecy = planets[a].y - planets[i].y;
                        deltaGvecx = setToFixedVelocity(newGvecx ,newGvecy, gravityConst).x;
                        deltaGvecy = setToFixedVelocity(newGvecx ,newGvecy, gravityConst).y;
                        planets[i].ax += deltaGvecx;
                        planets[i].ay += deltaGvecy;
                    }
                }
            }
        }
        function accelerate(delta){
            for(var i=0, l=planets.length; i<l; i++){
                planets[i].accelerate(delta);
            }
        }     
        function inertia(delta){
            for(var i=0, l=planets.length; i<l; i++){
                planets[i].inertia(delta);
            }
        }
        function step(){
            var steps = 2;
            var delta = 1/steps;
            for(var i=0; i<steps; i++){
                accelerate(delta);
                collide(false);
                border_collide();
                inertia(delta);
                collide(true);
                border_collide_preserve_impulse();
                gravity();
            }
            draw();
        }
        this.start = function(){
            interval = setInterval(function(){
                step();
            }, 30);
        }
        this.stop = function(){
            if(interval){
                clearInterval(interval);
                interval = null;
            }
        }
        draw();
    }
    var canvas = $('#canvas')
        .click(function(event){
            var offset = $(this).offset();
            var x = event.pageX - offset.left;
            var y = event.pageY - offset.top;
            simulation.planets.push(new Planet(
                x,
                y,
                Math.random() * 2 + 2
            ));
        })[0];
    $('#paused').on( "click", function() {    
        if (paused == false)
        {
            simulation.stop();
            paused = true;
        }
        else if (paused == true)
        {
            simulation.start();
            paused = false;
        }
    });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var context = canvas.getContext('2d');
    var num_planets = 16;
    var simulation = new Simulation(context);
    paused = false;
    simulation.start();
});