var WIDTH;
var HEIGHT;
var canvas;
var ctx;
var canvasName;
var drawInterval;

var g;
var pxs = new Array();
var maxPixies = 50;
var rint = 50;

var clouds = new Array();
var maxClouds = 1;

var lineMinLength = 50;
var lineMaxLength = 200;

var planet;

$(document).ready(function() {
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	canvas = document.getElementById('canvas_Menu');
	ctx = canvas.getContext('2d');
	canvasName = canvas.id;

	initCanvas();
});

function initCanvas() {
	$(canvas).attr('width', WIDTH).attr('height',HEIGHT);

	for(var i = 0; i < maxPixies; i++) {
		pxs[i] = new Circle();
		pxs[i].reset();
	}

	clouds[0] = new Cloud(200, 100, 8, 25, "#453959");
	clouds[1] = new Cloud(WIDTH/2 + 400, -100, 24, 25, "#453959");
	//clouds[2] = new Cloud(WIDTH-200, HEIGHT - 400, 10, 25, "#453959");
	clouds[2] = new Cloud(WIDTH/2 - 500, HEIGHT - 300, 4, 25, "#453959");
  
  	for(var i = 0; i < clouds.length; i++) {
		clouds[i].reset();
	}

	planet = new Image();
	planet.onload = function() {
		drawInterval = setInterval(draw,rint);
	}
	planet.src = "images/planet.svg";
}

$(window).resize(function() {
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	$(canvas).attr('width', WIDTH).attr('height',HEIGHT);
});

function changeCanvas(newCanvas) {
	canvas = document.getElementById(newCanvas);
	ctx = canvas.getContext('2d');
	canvasName = canvas.id;

	clearInterval(drawInterval);
	initCanvas();
}

function draw() {
	ctx.clearRect(0,0,WIDTH,HEIGHT);
  
  	for(var i = 0; i < clouds.length; i++) {
		clouds[i].draw();
	}

	for(var i = 0; i < pxs.length; i++) {
		pxs[i].fade();
		pxs[i].move();
		pxs[i].draw();
	}

	if(canvasName == "canvas_Menu") ctx.drawImage(planet, WIDTH/2 - 50, HEIGHT/2 - 50);
}

function Circle() {
	this.s = {
		// duree de vie max
		ttl:8000,
		// vitesse deplacement lateral
		xmax:1,
		ymax:1,
		// rayon max
		rmax:4,
		// remaining decay time
		rt:1,
		// position par defaut
		xdef:WIDTH / 2,
		ydef:HEIGHT / 2,
		// options
		random:true,
		blink:true
	};

	this.reset = function() {
		// position
		this.x = (this.s.random ? WIDTH*Math.random() : this.s.xdef);
		this.y = (this.s.random ? HEIGHT*Math.random() : this.s.ydef);
		// speed
		this.dx = (Math.random()*this.s.xmax) * (Math.random() < .5 ? -1 : 1);
		this.dy = (Math.random()*this.s.ymax) * (Math.random() < .5 ? -1 : 1);

		// taille rayon
		this.r = ((this.s.rmax-1)*Math.random()) + 1;
		// total decay time = (max lifetime / refresh rate) * (radius / max radius)
		this.hl = (this.s.ttl/rint)*(this.r/this.s.rmax);
		// remaining decay time
		this.rt = Math.random()*this.hl;
		// decay step
		this.s.rt = Math.random()+1;

		// position colorstop degrade
		this.stop = Math.random()*.2+.4;
	}

	this.fade = function() {
		this.rt += this.s.rt;
	}

	this.draw = function() {
		if(this.s.blink && (this.rt <= 0 || this.rt >= this.hl)) this.s.rt = this.s.rt*-1;
		else if(this.rt >= this.hl) this.reset();

		// this.rt/this.hl = current decay time
		var newo = 1 - (this.rt/this.hl);

		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
		ctx.closePath();

    // outside gradient radius = radius * new opacity
		/*var cr = this.r*newo;
		g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, (cr <= 0 ? 1 : cr));
		g.addColorStop(0, 'rgba(255,255,255,'+newo+')');
		g.addColorStop(this.stop, 'rgba(255,255,255,'+(newo*.25)+')');
		g.addColorStop(1, 'rgba(255,255,255,0)');
		ctx.fillStyle = g;*/
    ctx.fillStyle= 'rgba(255,255,255,'+newo+')';

		ctx.fill();
	}

	this.move = function() {
		// move according to current decay time and speed
		this.x += (this.rt/this.hl)*this.dx;
		this.y += (this.rt/this.hl)*this.dy;

		// change direction when reached the edge
		if(this.x > WIDTH || this.x < 0) this.dx *= -1;
		if(this.y > HEIGHT || this.y < 0) this.dy *= -1;
	}

	this.getX = function() { return this.x; }
	this.getY = function() { return this.y; }
}

function drawCloud(startX, startY, lineNb, radius, style) {
	var testCloud = new Cloud(startX, startY, lineNb, radius, style);
	testCloud.reset();
	testCloud.draw();
};

function Cloud(startX, startY, lineNb, radius, style) {
	this.init = function(startX, startY, lineNb, radius, style) {
		this.currentX = startX;
		this.currentY = startY;
		this.lineNb = lineNb;
		this.radius = radius;
		this.style = style;

		this.strokeLength = new Array();
		this.strokeX = new Array();
		this.strokeX_back = new Array();
    	this.strokeY = new Array();
		this.strokeY_back = new Array();

		this.lineMinSpace = this.radius * 4;
	}

	this.reset = function() {
		for(var i = 0; i < this.lineNb-1; i++) {
			var lineLength = parseInt(Math.random() * lineMaxLength);
			lineLength = lineLength < lineMinLength ? lineMinLength : lineLength;
			this.currentX = i % 2 == 0 ? this.currentX - lineLength : this.currentX + lineLength;

			this.strokeLength[i] = lineLength;
			this.strokeX[i] = this.currentX;
      
      		this.currentY += this.radius * 2;
      		this.strokeY[i] = this.currentY;
		}

		for(var i = 0; i < this.lineNb-1; i++) {
			var lineLength = parseInt(Math.random() * lineMaxLength);
			if(i % 2 == 0) {
				if(i == 0)
					lineLength = parseInt(Math.random() * lineMaxLength * 2) + (this.strokeLength[this.lineNb-2 - i] + this.lineMinSpace);

				else {
					lineLength = lineLength <= (this.strokeLength[this.lineNb-2 - i] + this.lineMinSpace) ?
			  					 (this.strokeLength[this.lineNb-2 - i] + this.lineMinSpace) : lineLength;

					var totalLength = this.strokeLength[this.lineNb-1 - i] + (this.currentX - this.strokeX[this.lineNb-1 - i]) + lineLength;
					lineLength = totalLength > (lineMaxLength * 2) ? this.lineMinSpace : lineLength;
				}

				this.currentX += lineLength;
			}
			else {
				lineLength = (this.currentX - lineLength) < (this.strokeX[lineNb-2 - i] + this.lineMinSpace) ? 0 : lineLength;
				this.currentX -= lineLength;
			}

			this.strokeX_back[i] = this.currentX;
      
     		this.strokeY_back[i] = this.currentY;
      		this.currentY -= this.radius * 2;
		}
	}

	this.draw = function() {
		ctx.fillStyle = this.style;
		ctx.beginPath();
		
		for(var i = 0; i < this.lineNb-1; i++) {
			ctx.arc(this.strokeX[i], this.strokeY[i],this.radius,Math.PI*1.5,Math.PI*2.5, (i % 2 == 0 ? true : false));
		}

		for(var i = 0; i < this.lineNb-1; i++) {
				ctx.arc(this.strokeX_back[i], this.strokeY_back[i],this.radius,Math.PI*2.5,Math.PI*1.5, (i % 2 == 0 ? true : false));
		}

		ctx.closePath();
		ctx.fill();
	}

	this.init(startX, startY, lineNb, radius, style);
}