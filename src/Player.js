
// constructor
function Player(playerSpriteSheet) {
	this.initialize(playerSpriteSheet);
}

Player.prototype = new createjs.BitmapAnimation();

Player.prototype.BitmapAnimation_initialize = Player.prototype.initialize;

Player.prototype.initialize = function (playerSpriteSheet) {
	this.BitmapAnimation_initialize(playerSpriteSheet);
	
	this.width = this.spriteSheet.getFrame(0).rect.width;
	this.height = this.spriteSheet.getFrame(0).rect.height;
}