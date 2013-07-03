// Level.js
// Created by Jami Couch

// Level extends Container and contains all the state information necessary to render the level

// Constructor
function Level() {
	this.initialize();
	this.layers = new Array();
	this.objects = new Array();
	
	this.width = 2048;
	this.height = 768;
	
	this.player = new Player(preload);
	this.addChild(this.player);
	this.addObject(this.player);
	
	this.player.x = this.player.width;
	this.player.y = 0;
	
	this.gravity = 150;
}

Level.prototype = new createjs.Container();

Level.prototype.Container_initialize = Level.prototype.initialize;

Level.prototype.initialize = function () {
	this.Container_initialize();
}

Level.prototype.tick = function tick(delta) {
	for (var i=0; i<this.objects.length; i++) {
		var obj = this.objects[i];
		
		obj.update(delta);
		
		obj.vY += this.gravity * delta;
		
		obj.y += obj.vY * delta;
		
		// TODO fix this
		if (obj.y + obj.height > this.height) {
			obj.y = this.height - obj.height;
			obj.vY = 0;
		} 
		
		if (obj.x < 0) obj.x = 0;
		if (obj.x + obj.width > this.width) obj.x = this.width - obj.width;
		
	}
}

Level.prototype.addObject = function addObject(obj) {
	this.objects.push(obj);
	if (!obj.vX) obj.vX = 0;
	if (!obj.vY) obj.vY = 0;
}
