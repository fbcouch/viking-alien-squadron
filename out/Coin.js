// Coin.js
// Created by Jami Couch

// constructor
function Coin() {
	this.initialize();
}

Coin.prototype = new createjs.Bitmap();

Coin.prototype.Bitmap_initialize = Coin.prototype.initialize;

Coin.prototype.initialize = function() {
	this.Bitmap_initialize(preload.getResult("coin"));
	
	this.height = this.image.height;
	this.width = this.image.width;
	
	this.nogravity = true;
	
	this.collideRect = {x: 0, y: 0, width: this.width, height: this.height};
}

Coin.prototype.collide = function (obj) {
	if (obj instanceof VAS.Player) {
		this.isRemove = true;
		obj.coins++;
		return false;
	}
	
	return true;
}
