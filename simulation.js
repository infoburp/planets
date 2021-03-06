$(function(){
    function Planet(x, y, type){
        this.x = x;
        this.y = y;
        this.px = x;
        this.py = y;
        this.ax = 0;
        this.ay = 0;
        this.type = type;
        switch (type){
            case 'sand':
                this.density = 1;
                this.radius = 1;
                this.color = 'sandybrown';
                break;
            case 'rock':
                this.density = 1.5;
                this.radius = 1;
                this.color = 'dimgrey';
                break;
            case 'water':
                this.density = 0.8;
                this.radius = 1;
                this.color = 'midnightblue';
                break;
            case 'plant':
                this.density = 0.7;
                this.radius = 1;
                this.color = 'yellowgreen';
                break;
            case 'gas':
                this.density = 0.1;
                this.radius = 1;
                this.color = 'skyblue'
                break;
        }
        this.mass = (Math.PI * this.radius * this.radius) * this.density;
        this.paused = false;
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
            context.fillStyle = this.color;
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
            random = Math.random();
            if (random>0.6)
                var type='sand';
            else if (random>0.25&&random<=0.6)
                var type='rock';
            else if (random>0.05&&random<=0.25)
                var type='water';
            else if (random<=0.05)
                var type='plant';
            var x0 = context.canvas.width/2;
            var y0 = context.canvas.height/2;
            var a=2*Math.PI*Math.random()
            var r=Math.sqrt(Math.random())
            if (spawn_type == 'circular'){
                var x=(spawn_radius*r)*Math.cos(a)+x0
                var y=(spawn_radius*r)*Math.sin(a)+y0
            }
            else if (spawn_type == 'rectangular'){
                var x = Math.random() * (context.canvas.width-50);
                var y = Math.random() * (context.canvas.height-50);
            }
            var planet = new Planet(x,y,type);
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
                        var factor = (length-target)/length;
                        planet1.x -= x*factor*0.5*(1/planet1.mass);
                        planet1.y -= y*factor*0.5*(1/planet1.mass);
                        planet2.x += x*factor*0.5*(1/planet2.mass);
                        planet2.y += y*factor*0.5*(1/planet2.mass);
                        if(preserve_impulse){
                            var v1x = planet1.x - planet1.px;
                            var v1y = planet1.y - planet1.py;
                            var v2x = planet2.x - planet2.px;
                            var v2y = planet2.y - planet2.py;
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
            context.strokeStyle = 'rgba(255, 255, 255, 1.0)';
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
                        if (distance<20){
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
        }
        function blackhole(){
            for(i=0;i<planets.length;i++){
            //gravity interaction
                distance = Math.round(distanceBetween(planets[i].x,planets[i].y,canvas.width/2,canvas.height/2)*100)/100 + 100;
                gravityConst = (planets[i].mass * 4) * (planets[i].mass * 4)/(distance * distance);
                newGvecx = canvas.width/2 - planets[i].x;
                newGvecy = canvas.height/2 - planets[i].y;
                deltaGvecx = setToFixedVelocity(newGvecx ,newGvecy, gravityConst).x;
                deltaGvecy = setToFixedVelocity(newGvecx ,newGvecy, gravityConst).y;
                planets[i].ax += deltaGvecx;
                planets[i].ay += deltaGvecy;
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
                
                gravity();
                blackhole();
                collide(false);
                inertia(delta);
                border_collide_preserve_impulse();
                border_collide();
                collide(true);
                accelerate(delta);
                
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
            
        })[0];
    canvas.style.cursor='crosshair';
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
    $('#sand').on( "click", function() {
        palette = 'sand';
        $('#palette').css("background-color","sandybrown");
    });
    $('#water').on( "click", function() {
        palette = 'water'
        $('#palette').css("background-color","midnightblue");
    });
    $('#rock').on( "click", function() {
        palette = 'rock'
        $('#palette').css("background-color","dimgrey");
    });
    $('#plant').on( "click", function() {
        palette = 'plant'
        $('#palette').css("background-color","yellowgreen");
    });
    var mouseDown = 0;
    document.body.onmousedown = function() { 
      ++mouseDown;
    }
    document.body.onmouseup = function() {
      --mouseDown;
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var context = canvas.getContext('2d');
    var palette = 'sand';
    var num_planets = 1024;
    var spawn_radius = Math.min(canvas.width/2,canvas.height/2) - (Math.min(canvas.width/2,canvas.height/2)/8);
    var spawn_type = 'rectangular';
    var simulation = new Simulation(context);
    paused = false;
    simulation.start();
    canvas.onmousemove = handleMouseMove;
    function handleMouseMove(event) {
        var dot, eventDoc, doc, body, pageX, pageY;
        event = event || window.event;
        if (event.pageX == null && event.clientX != null) {
            eventDoc = (event.target && event.target.ownerDocument) || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;
            event.pageX = event.clientX +
              (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
              (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
              (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
              (doc && doc.clientTop  || body && body.clientTop  || 0 );   
        }
        if (mouseDown){
            var offset = $('#canvas').offset();
            var x = event.pageX - offset.left;
            var y = event.pageY - offset.top;
            simulation.planets.push(new Planet(
                x,
                y,
                palette
            ));
        }
    }
});