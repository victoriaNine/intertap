//===============================
// BGCANVAS
//
var bgCanvas = (function() {
//===============================
	var WIDTH;
	var HEIGHT;
	var canvas;
	var ctx;
	var canvasName;
	var drawInterval;

	var g;
	var pxs;
	var maxPixies;
	var rint = 50;

	var clouds;

	var lineMinLength = 50,
		lineMaxLength = 300;

	var planet, gas, moon, craters, meteor,
		planet_x, planet_y, planet_rotate = 0, planet_dirRotate = 1, gas_x, gas_y,
		moon_x, moon_y, craters_x, craters_y,
		meteor_x, meteor_y, meteorFalling = false, meteorDelay = -1;


	$(document).ready(function() {
		WIDTH = window.innerWidth;
		HEIGHT = window.innerHeight;
		canvas = document.getElementById('canvas_Menu');
		ctx = canvas.getContext('2d');
		canvasName = canvas.id;

		planet = new Image();
		planet.src = "images/planet.svg";

		gas = new Image();
		gas.src = "images/gas.svg";

		moon = new Image();
		moon.src = "images/moon.svg";

		craters = new Image();
		craters.src = "images/craters.svg";

		meteor = new Image();
		meteor.src = "images/meteor.svg";
	});

	function init(onResize) {
		$(canvas).attr('width', WIDTH).attr('height',HEIGHT);

		clouds = new Array();
		clouds[0] = new Cloud(WIDTH/2, -50, 24, 25, "#453959");
	  	for(var i = 0; i < clouds.length; i++) {
			clouds[i].init();
		}

		pxs = new Array();
		maxPixies = !phonecheck() ? 50 : 25;
		for(var i = 0; i < maxPixies; i++) {
			pxs[i] = new Circle();
			pxs[i].reset();
		}

		setPositions();
		if(!onResize) drawInterval = setInterval(draw,rint);
	}

	$(window).resize(function() {
		WIDTH = window.innerWidth;
		HEIGHT = window.innerHeight;

		if(!mobilecheck()) init(true);
	});

	function changeCanvas(newCanvas) {
		canvas = document.getElementById(newCanvas);
		ctx = canvas.getContext('2d');
		canvasName = canvas.id;

		clearInterval(drawInterval);
		init();
	}

	function setPositions() {
		planet_x = phonecheck() ? WIDTH/2 : WIDTH/2 - 100;
		planet_y = phonecheck() ? HEIGHT/2 - 25 : HEIGHT/2 - 50;
		gas_x = planet_x;
		gas_y = planet_y + 50;

		moon_x = phonecheck() ? WIDTH/2 - (moon.width + 100) : WIDTH/2 - moon.width;
		moon_y = phonecheck() ? HEIGHT - (moon.height + 50) : HEIGHT - moon.height + 50;
		craters_x = moon_x;
		craters_y = moon_y + 50;
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

		if(!meteorFalling && meteorDelay == -1) {
			meteor_x = parseInt(Math.random() * WIDTH) - meteor.width;
			meteor_y = parseInt(Math.random() * HEIGHT) - meteor.height;

			Math.random() < .5 ? meteor_y = -meteor.height : meteor_x = -meteor.width;
			meteorDelay = (parseInt(Math.random() * 15 + 5) * 1000);
		}
		if(meteorFalling) {
			ctx.drawImage(meteor, meteor_x, meteor_y);
			meteor_x += 1.25;
			meteor_y += 1.25;

			if(meteor_x > (WIDTH+meteor.width) || meteor_y > (HEIGHT+meteor.height))
				meteorFalling = false;
		}
		if(meteorDelay > -1) {
			setTimeout(function() {
				meteorFalling = true;
				meteorDelay = -1;

			}, meteorDelay);
		}

		if(canvasName == "canvas_Menu") {
			var maxRotate = 5;
			var percentRotate = 100 - (Math.abs(planet_rotate) * 100) / maxRotate;
			
			ctx.save();
			ctx.translate(planet_x + planet.width/2, planet_y + planet.height/2);
			ctx.rotate(planet_rotate*Math.PI/180);
			planet_rotate += planet_dirRotate * .1 * ((percentRotate / 100) + maxRotate / 20);
			if(Math.abs(planet_rotate) >= maxRotate) planet_dirRotate *= -1;

			ctx.translate(-(planet_x + planet.width/2), -(planet_y + planet.height/2));
			ctx.drawImage(planet, planet_x, planet_y);

			ctx.save();
			drawPlanetMask(ctx, planet_x, planet_y);
			ctx.clip();

			ctx.save();
			ctx.rotate(20*Math.PI/180);
			ctx.drawImage(gas, gas_x - (gas.width / 2 + 180), gas_y - gas.height);
			ctx.restore();
			ctx.restore();
			ctx.restore();

			gas_x++;
			if(gas_x >= planet_x + gas.width / 2) gas_x = planet_x;
		}
		if(canvasName == "canvas_Play") {
			ctx.drawImage(moon, moon_x, moon_y);

			ctx.save();
			ctx.beginPath();
			ctx.arc(moon_x + moon.width/2, moon_y + moon.height/2, (moon.width / 2), 0, Math.PI*2);
			ctx.closePath();
			ctx.clip();

			ctx.drawImage(craters, craters_x, craters_y);
			ctx.restore();

			craters_x--;
			if(craters_x <= moon_x - craters.width / 2) craters_x = moon_x;
		}
	}

	function drawPlanetMask(ctx, startX, startY) {
		ctx.save();
		ctx.lineCap = 'butt';
		ctx.lineJoin = 'miter';
		ctx.miterLimit = 4;
		ctx.translate(startX,startY);
		ctx.beginPath();
		ctx.moveTo(158.808,266.189);
		ctx.bezierCurveTo(181.284,346.279,251.244,408.04600000000005,339.012,415.92100000000005);
		ctx.bezierCurveTo(394.269,420.87600000000003,446.379,403.55400000000003,486.485,371.37800000000004);
		ctx.bezierCurveTo(434.803,364.499,377.559,351.64200000000005,318.497,332.69800000000004);
		ctx.bezierCurveTo(259.207,313.686,204.968,290.758,158.808,266.189);
		ctx.moveTo(557.531,160.302);
		ctx.bezierCurveTo(536.777,77.555,465.635,13.124,375.865,5.072);
		ctx.bezierCurveTo(318.496,-0.07399999999999984,264.51800000000003,18.801,223.845,53.379000000000005);
		ctx.bezierCurveTo(205.49099999999999,68.983,189.84199999999998,87.77700000000002,177.824,109.018);
		ctx.bezierCurveTo(164.90300000000002,131.853,156.185,157.508,152.77700000000002,185.03);
		ctx.bezierCurveTo(183.73600000000002,219.06799999999998,248.81900000000002,256.105,328.636,281.702);
		ctx.bezierCurveTo(418.01300000000003,310.361,500.70500000000004,316.609,542.7660000000001,301.098);
		ctx.bezierCurveTo(551.854,282.522,558.253,262.313,561.4250000000001,240.91000000000003);
		ctx.bezierCurveTo(562.0100000000001,236.95300000000003,562.5010000000001,232.961,562.8620000000001,228.92600000000002);
		ctx.bezierCurveTo(564.99,205.238,563.01,182.136,557.531,160.302);
		ctx.closePath();
		ctx.restore();
	};

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
			this.dx = (Math.random()*this.s.xmax) * 1//(Math.random() < .5 ? -1 : 1);
			this.dy = (Math.random()*this.s.ymax) * 1//(Math.random() < .5 ? -1 : 1);

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
			var newo = 1;// - (this.rt/this.hl);

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
			if(this.x > (WIDTH+this.r) || this.x < 0) this.reset();//this.dx *= -1;
			if(this.y > (HEIGHT+this.r) || this.y < 0) this.reset();//this.dy *= -1;
		}

		this.getX = function() { return this.x; }
		this.getY = function() { return this.y; }
	}

	function Cloud(startX, startY, lineNb, radius, style) {
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

		this.init = function() {
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

				  		var totalLength = this.currentX + lineLength + (this.strokeLength[this.lineNb-1 - i] - this.strokeX[this.lineNb-1 - i]);
						lineLength = totalLength > (lineMaxLength * 2) ? this.lineMinSpace : lineLength;
					}

					this.currentX += lineLength;
				}
				else {
					var maxLength = this.currentX - (this.strokeX[this.lineNb-1 - i] + this.strokeLength[this.lineNb-1 - i] + this.lineMinSpace);
					lineLength = parseInt(Math.random() * maxLength);
					lineLength = lineLength < 0 ? 0 : lineLength;
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
	}

	return {
		changeCanvas:changeCanvas
	}
})();