
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
	
	this.jumpVel = -650;
	this.moveSpeed = 250;
	this.facingRight = true;
	
	this.isJumping = true;
	this.isBopped = false;
	this.coins = 0;
	
	this.collideRect = {x: 14, y: 0, width: 44, height: this.height};
	
	this.gotoAndStop((this.facingRight ? "walk" : "walk_h"));
}

Player.prototype.update = function (delta) {
	if (this.isBopped) return;
	
	if (jumpDown && this.canJump()) {
		this.jump();
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
	if (this.isBopped) this.vX = 0;
	this.isBopped = false;
}

Player.prototype.canJump = function() {
	return !this.isJumping;
}

Player.prototype.jump = function() {
	this.vY = this.jumpVel;
	this.isJumping = true;
}

Player.prototype.bop = function(right) {
	this.isBopped = true;
	this.isJumping = true;
	this.vY = -200;
	this.vX = 200 * (right ? 1 : -1);
	this.facingRight = right;
}

Player.prototype.resetStates = function() {
	this.isJumping = true;
	this.isBopped = false;
	this.nogravity = false;
	this.facingRight = true;
	this.isDead = false;
	this.vX = this.vY = 0;
	this.gotoAndStop((this.facingRight ? "walk" : "walk_h"));
}
