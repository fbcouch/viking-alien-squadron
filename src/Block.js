// Block.js
// Created by Jami Couch

// constructor
function Block(image) {
	this.initialize(image);
}

Block.prototype = new createjs.Bitmap();

Block.prototype.Bitmap_initialize = Block.prototype.initialize;

Block.prototype.initialize = function (image) {
	this.Bitmap_initialize(image);
	
	this.height = this.image.height;
	this.width = this.image.width;
	
	this.nogravity = true;
}
