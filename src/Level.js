// Level.js
// Created by Jami Couch

// Level extends Container and contains all the state information necessary to render the level

var BLOCK_SIZE = 70;
var TERMINAL_VEL = 500;

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
	
	this.levelScore = 0;
	this.maxprogress = 0;
	
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
	this.addObject(this.player);
	
	this.resetPlayer();
	
	for (var x = 0; x < this.width; x += BLOCK_SIZE) {
		var testblock = new Block(preload.getResult("ground"));
		
		testblock.x = x;
		testblock.y = this.height - testblock.height;
		
		this.addObject(testblock);
	}
	
	for (var i=0; i < this.layers.length; i++) {
		this.addChild(this.layers[i]);
	}
	
	// add a test enemy
	var test = new Enemy(ENEMY_SLIME);
	this.addObject(test);
	test.x = BLOCK_SIZE * 10;
	test.y = this.height - BLOCK_SIZE * 3;
	
	// add a test enemy
	var test = new Enemy(ENEMY_FLY);
	this.addObject(test);
	test.x = BLOCK_SIZE * 12;
	test.y = this.height - BLOCK_SIZE * 3;
	
	// add a test coin
	test = new Coin();
	this.addObject(test);
	test.x = BLOCK_SIZE * 8;
	test.y = BLOCK_SIZE * 7;
}

Level.prototype.tick = function tick(delta) {
	// update objects
	for (var i=0; i<this.objects.length; i++) {
		var obj = this.objects[i];
		
		if (obj.update) obj.update(delta);
		
		// gravity
		if (!obj.nogravity) 
			obj.vY += this.gravity * delta;
		
		if (obj.vY > TERMINAL_VEL) obj.vY = TERMINAL_VEL;
		
		// adjust Y position
		obj.y += obj.vY * delta;
		
		if (obj.y + obj.height > this.height) {
			obj.y = this.height - obj.height;
			obj.vY = 0;
			if (obj.collideGround) obj.collideGround();
		} 
		
		// adjust X position
		obj.x += obj.vX * delta;
		
		if (obj.x < 0) {
			obj.x = 0;
			if (obj.collideSide) obj.collideSide();
		}
		if (obj.x + obj.width > this.width) {
			if (obj == this.player) {
				if (obj.x + obj.width * 0.5 > this.width)
					this.completed = true;
			} else obj.x = this.width - obj.width;
			if (obj.collideSide) obj.collideSide();
		}
		
		// collision detection
		for (var j=i+1; j<this.objects.length; j++) {
			var other = this.objects[j];
			
			if (this.collideRect(obj, other)) {
				// if either object is not allowed to collide, don't collide
				if ((obj.canCollide && !obj.canCollide(other)) ||
					(other.canCollide && !other.canCollide(obj))) {
					continue;
				}
				
				// if either object returns false from collide, don't continue the collision
				var obj_result = obj.collide && !obj.collide(other);
				var other_result = other.collide && !other.collide(obj);
				if (obj_result || other_result) {
					continue;
				}
				
				var move, nomove;
				if (obj === this.player) { 
					move = obj;
					nomove = other;
				} else if (other === this.player) {
					move = other;
					nomove = obj;
				} else if (obj instanceof Block && !(other instanceof Block)) {
					move = other;
					nomove = obj;
					
				} else if (other instanceof Block && !(obj instanceof Block)) {
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
					
					if (Math.abs(dy) <= Math.abs(dx) || (dy < 0 && dy > -5)) {
						move.y += dy;
						if (nomove instanceof Enemy) console.log(dy);
						if (dy < 0 && move.vY > 0) {
							move.vY = 0;
						
							if (move.collideGround) move.collideGround();
						}
						
						if (dy > 0 && move.vY < 0) move.vY = 0;
					} else {
						move.x += dx;
						
						move.vX = 0;
						
						if (move.collideSide) move.collideSide();
						if (nomove.collideSide) nomove.collideSide();
					}
				}
			} 
		}
	}
	
	// remove things that need removing
	for (var i=0; i<this.objects.length; i++) {
		if (this.objects[i].isRemove) {
			this.removeObject(this.objects[i]);
			i--;
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
	
	// update level score
	if (this.player.x + this.player.width * 0.5 > this.maxprogress) this.maxprogress = this.player.x + this.player.width;
	this.levelScore = this.maxprogress;
}

Level.prototype.collideRect = function (obj1, obj2) {
	return !(obj1.x + obj1.width < obj2.x ||
			 obj1.x > obj2.x + obj2.width ||
			 obj1.y + obj1.height < obj2.y ||
			 obj1.y > obj2.y + obj2.height);
}

Level.prototype.addObject = function addObject(obj) {
	this.objects.push(obj);
	if (this.objlayer) this.objlayer.addChild(obj);
	if (!obj.vX) obj.vX = 0;
	if (!obj.vY) obj.vY = 0;
}

Level.prototype.removeObject = function removeObject(obj) {
	this.objlayer.removeChild(obj);
	this.objects.splice(this.objects.indexOf(obj), 1);
}

Level.prototype.resetPlayer = function resetPlayer() {
	this.player.resetStates();
	this.player.x = this.player.width;
	this.player.y = 0;
}
