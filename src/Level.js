// Level.js
// Created by Jami Couch

// Level extends Container and contains all the state information necessary to render the level

var BLOCK_SIZE = 70;

// Constructor
function Level() {
	this.initialize();
}

Level.prototype = new createjs.Container();

Level.prototype.Container_initialize = Level.prototype.initialize;

Level.prototype.initialize = function () {
	this.Container_initialize();
	
	this.completed = false;
	
	this.layers = new Array();
	this.objects = new Array();
	
	this.width = BLOCK_SIZE * 20;
	this.height = BLOCK_SIZE * 10;
	
	this.gravity = 1000;
	
	// generate background
	var background = new createjs.Container();
	background.width = this.width;
	background.height = this.height;
	this.layers.push(background);
	
	var y = background.height - BLOCK_SIZE * 0.8;
	var img;
	for (var x = 70 * Math.random() * 5; x < this.width; x += 70 + 70 * Math.random() * 5) {
		img = new createjs.Bitmap(preload.getResult((Math.random() > 0.5 ? "hill-short" : "hill-long")));
		background.addChild(img);
		img.x = x;
		img.y = y - img.image.height;
	}
	
	background = new createjs.Container();
	background.width = this.width * 0.8;
	background.height = this.height;
	this.layers.push(background);
	
	y = BLOCK_SIZE * 2;
	for (var x = 70 * Math.random() * 5; x < background.width; x += 70 + 70 * Math.random() * 5) {
		img = new createjs.Bitmap(preload.getResult("cloud-" + parseInt((Math.random() * 3 + 1).toString())));
		background.addChild(img);
		img.x = x;
		img.y = y - img.image.height + Math.random() * BLOCK_SIZE;
	}
	
	// object layer
	this.objlayer = new createjs.Container();
	this.objlayer.width = this.width;
	this.objlayer.height = this.height;
	this.layers.push(this.objlayer);
	
	this.player = new Player(preload);
	this.objlayer.addChild(this.player);
	this.addObject(this.player);
	
	this.player.x = this.player.width;
	this.player.y = 0;
	
	for (var x = 0; x < this.width; x += BLOCK_SIZE) {
		var testblock = new Block(preload.getResult("ground"));
		
		this.objlayer.addChild(testblock);
		testblock.x = x;
		testblock.y = this.height - testblock.height;
		
		this.addObject(testblock);
	}
	
	for (var i=0; i < this.layers.length; i++) {
		this.addChild(this.layers[i]);
	}
}

Level.prototype.tick = function tick(delta) {
	
	for (var i=0; i<this.objects.length; i++) {
		var obj = this.objects[i];
		
		if (obj.update) obj.update(delta);
		
		obj.vY += this.gravity * delta;
		
		obj.y += obj.vY * delta;
		
		// TODO fix this
		if (obj.y + obj.height > this.height) {
			obj.y = this.height - obj.height;
			obj.vY = 0;
			if (obj.collideGround) obj.collideGround();
		} 
		
		if (obj.x < 0) obj.x = 0;
		if (obj.x + obj.width > this.width) {
			if (obj == this.player) {
				if (obj.x + obj.width * 0.5 > this.width)
					this.completed = true;
			} else obj.x = this.width - obj.width;
		}
		for (var j=i+1; j<this.objects.length; j++) {
			var other = this.objects[j];
			
			if (this.collideRect(obj, other)) {
				var move, nomove;
				if (obj === this.player) { 
					move = obj;
					nomove = other;
				}
				
				if (move && nomove) {
					// figure out which way to move these guys
					var dx, dy;
					
					var dx_left = nomove.x - (move.x + move.width);
					var dx_right = (nomove.x + nomove.width) - move.x;
					
					dx = dx_left;
					if (Math.abs(dx_left) > Math.abs(dx_right)) dx = dx_right;
					
					var dy_top = nomove.y - (move.y + move.height);
					var dy_bot = (nomove.y + nomove.height) - move.y;
					dy = dy_top;
					if (Math.abs(dy_top) > Math.abs(dy_bot)) dy = dy_bot;
					
					if (Math.abs(dy) <= Math.abs(dx) || Math.abs(dy < 5)) {
						move.y += dy;
						if (move.collideGround) move.collideGround();
					} else {
						move.x += dx;
					}
				}
			} 
		}
		
	}
	
	// update backgrounds
	for (var i=0; i<this.layers.length; i++) {
		if (this.layers[i].width !== this.width) {
			// parallax!
			if (player.x < canvasWidth * 0.5) this.layers[i].x = 0;
			else if (player.x > this.width - canvasWidth * 0.5) this.layers[i].x = this.width - this.layers[i].width;
			else this.layers[i].x = (player.x - canvasWidth * 0.5) / (this.width - canvasWidth) * (this.width - this.layers[i].width);
		}
	}
}

Level.prototype.collideRect = function (obj1, obj2) {
	return !(obj1.x + obj1.width < obj2.x ||
			 obj1.x > obj2.x + obj2.width ||
			 obj1.y + obj1.height < obj2.y ||
			 obj1.y > obj2.y + obj2.height);
}

Level.prototype.addObject = function addObject(obj) {
	this.objects.push(obj);
	if (!obj.vX) obj.vX = 0;
	if (!obj.vY) obj.vY = 0;
}
