
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
	
	this.jumpVel = -500;
	this.moveSpeed = 200;
	this.facingRight = true;
	
	this.isJumping = true;
	this.coins = 0;
	
	this.gotoAndStop((this.facingRight ? "walk" : "walk_h"));
}

Player.prototype.update = function (delta) {
	if (jumpDown && this.canJump()) {
		this.vY = this.jumpVel;
		this.isJumping = true;
	}
	
	if (this.isJumping) this.gotoAndStop((this.facingRight ? "jump" : "jump_h"));
	
	if (leftDown && !rightDown) {
    	this.facingRight = false;
    	this.x -= this.moveSpeed * delta;
    	if ((this.paused || this.currentAnimation != "walk_h") && !this.isJumping) this.gotoAndPlay("walk_h");
    } else if (rightDown && !leftDown) {
    	this.facingRight = true;
    	this.x += this.moveSpeed * delta;
    	if ((this.paused || this.currentAnimation != "walk") && !this.isJumping) this.gotoAndPlay("walk");
	} else {
    	if (!this.isJumping) this.gotoAndStop((this.facingRight ? "walk" : "walk_h"));
    }
}

Player.prototype.collideGround = function() {
	this.isJumping = false;
}

Player.prototype.canJump = function() {
	return !this.isJumping;
}

Player.prototype.resetStates = function() {
	this.isJumping = false;
	this.nogravity = false;
	this.facingRight = true;
	
	this.gotoAndStop((this.facingRight ? "walk" : "walk_h"));
}
