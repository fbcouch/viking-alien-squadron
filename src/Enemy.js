// Enemy.js
// created by Jami Couch

var ENEMY_SLIME = 0;
var ENEMY_FLY = 1;

// constructor
function Enemy(type) {
	var normal, moving, dead;
	switch (type) {
		case ENEMY_SLIME:
			normal = preload.getResult("slime");
			break;
		case ENEMY_FLY:
			normal = preload.getResult("fly");
			break;
	}
	var spriteSheet = new createjs.SpriteSheet({
		images: [normal],
		frames: {width: normal.width, height: normal.height / 4, regX: normal.width / 2, regY: 0},
		animations: {
			move: [0, 1, "move", 3],
			dead: 2,
		},
	});
	createjs.SpriteSheetUtils.addFlippedFrames(spriteSheet, true, false, false);
	
	this.initialize(spriteSheet, type);
}

Enemy.prototype = new createjs.BitmapAnimation();

Enemy.prototype.BitmapAnimation_initialize = Enemy.prototype.initialize;

Enemy.prototype.initialize = function (spriteSheet, type) {
	this.BitmapAnimation_initialize(spriteSheet);
	
	this.width = this.spriteSheet.getFrame(0).rect.width;
	this.height = this.spriteSheet.getFrame(0).rect.height;
	this.regX = -1 * this.width / 2;
	this.regY = 0;
	
	this.type = type;
	
	this.isDead = false;
	this.facingRight = false;
	
	this.moveSpeed = 100;
	
	if (this.type === ENEMY_FLY) {
		this.nogravity = true;
	}
	
	this.gotoAndPlay((this.facingRight ? "move_h" : "move"));
}

Enemy.prototype.update = function (delta) {
	// behavior
	switch (this.type) {
		case ENEMY_SLIME:
			this.vX = this.moveSpeed * (this.facingRight ? 1 : -1);
		break;
		case ENEMY_FLY:
			if (!this.moving) {
				this.tweenMove();
				this.moving = true;
			}
		break;
	}
	
	if (this.animation !== (this.facingRight ? "move_h" : "move"))
		this.gotoAndPlay((this.facingRight ? "move_h" : "move"));
	
	if (this.isDead) {
		this.gotoAndStop("dead");
	}
}

Enemy.prototype.collideSide = function () {
	switch (this.type) {
		case ENEMY_SLIME:
			this.facingRight = !this.facingRight;
			break;
		case ENEMY_FLY:
		default:
			break;
	}
}

Enemy.prototype.collideGround = function () {
	switch (this.type) {
		case ENEMY_FLY:
			
			break;
		case ENEMY_SLIME:
		default:
			break;
	}
}

Enemy.prototype.tweenMove = function () {
	createjs.Tween.get(this).wait(500)
		.to({y: this.y + ((this.goingDown ? 1 : -1) * BLOCK_SIZE * 4)}, 
			(BLOCK_SIZE * 4) / this.moveSpeed * 1000, 
			createjs.Ease.Linear)
		.call(this.tweenMove);
		
	this.goingDown = !this.goingDown;
}
