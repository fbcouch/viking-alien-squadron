
// constructor
function Player(preload) {
	var playerSpriteSheet = new createjs.SpriteSheet({
		images: [preload.getResult("player-walk-anim"), preload.getResult("player-jump")],
		frames: {width: 72, height: 97, regX: 36, regY: 0},
		animations: {
			walk: [0, 10],
			jump: 15,
		},
	});
	createjs.SpriteSheetUtils.addFlippedFrames(playerSpriteSheet, true, false, false);
	
	this.jumpVel = -300;
	
	this.initialize(playerSpriteSheet);
}

Player.prototype = new createjs.BitmapAnimation();

Player.prototype.BitmapAnimation_initialize = Player.prototype.initialize;

Player.prototype.initialize = function (playerSpriteSheet) {
	this.BitmapAnimation_initialize(playerSpriteSheet);
	
	this.width = this.spriteSheet.getFrame(0).rect.width;
	this.height = this.spriteSheet.getFrame(0).rect.height;
	this.regX = -36;
	this.regY = 0;
}

Player.prototype.update = function (delta) {
	if (jumpDown && this.paused) this.vY = this.jumpVel;
	
	if (leftDown && !rightDown) {
    	playerFacingRight = false;
    	player.x -= playerMoveSpeed * delta;
    	if (player.paused) player.gotoAndPlay("walk_h");
    } else if (rightDown && !leftDown) {
    	playerFacingRight = true;
    	player.x += playerMoveSpeed * delta;
    	if (player.paused) player.gotoAndPlay("walk");
	} else if (jumpDown) {
		if (player.paused) player.gotoAndStop((playerFacingRight ? "jump" : "jump_h"));
    } else {
    	player.gotoAndStop((playerFacingRight ? "walk" : "walk_h"));
    }
}
