var KEYCODE_ENTER = 13;		//useful keycode
var KEYCODE_SPACE = 32;		//useful keycode
var KEYCODE_UP = 38;		//useful keycode
var KEYCODE_LEFT = 37;		//useful keycode
var KEYCODE_RIGHT = 39;		//useful keycode
var KEYCODE_W = 87;			//useful keycode
var KEYCODE_A = 65;			//useful keycode
var KEYCODE_D = 68;			//useful keycode

var canvas;
var stage;

var canvasWidth;
var canvasHeight;

// gamestate

var player, playerFacingRight = true;
var playerMoveSpeed = 100;
var playerWalkSheet, playerWalkAnim;

var currentLevel;

// input
var leftDown = false, rightDown = false, jumpDown = false;

// preload
var messageField;
var preload;

var scoreField;

// event handlers
document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

function init() {
    console.log("game init");
    
    canvas = document.getElementById("gameCanvas");
    canvas.style.background = "#93f";
    stage = new createjs.Stage(canvas);
    
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    
    messageField = new createjs.Text("Loading", "bold 30px sans-serif", "#FFFFFF");
    messageField.maxWidth = 1000;
    messageField.textAlign = "center";
    messageField.x = canvasWidth / 2;
    messageField.y = canvasHeight / 2;
    
    stage.addChild(messageField);
    stage.update();
    
    var manifest = [
    	{id: "player", src:"assets/character/front.png"},
    	{id: "player-face-right", src: "assets/character/side.png"},
    	{id: "player-jump", src: "assets/character/jump.png"},
    	{id: "player-walk-anim", src: "assets/character/sheet/walk_sheet.png"},
    ];
    
    preload = new createjs.LoadQueue();
    preload.addEventListener("complete", doneLoading);
    preload.addEventListener("progress", updateLoading);
    preload.loadManifest(manifest);
}

function tick(event) {
	var delta = event.delta / 1000;
	if (!event.delta) return;
	
    //console.log("tick: " + delta);
    
    currentLevel.tick(delta);
    
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
    
    currentLevel.x = - player.x + canvasWidth * 0.5;
    // clamp view to level bounds
    if (currentLevel.x > 0) currentLevel.x = 0;
    if (currentLevel.x < -1 * (currentLevel.width - canvasWidth)) currentLevel.x = -1 * (currentLevel.width - canvasWidth);
    
    stage.update();
}

function restart() {
	
	currentLevel = new Level();
	
	player = currentLevel.player;
	
	stage.removeAllChildren();
	scoreField.text = (0).toString();
	stage.addChild(scoreField);
	
	jumpDown = leftDown = rightDown = false;
	
	stage.clear();
	stage.addChild(currentLevel);
	
	if (!createjs.Ticker.hasEventListener("tick")) {
		createjs.Ticker.addEventListener("tick", tick);
	}
}

function handleClick() {
	canvas.onclick = null;
	stage.removeChild(messageField);
	
	restart();
}

function watchRestart() {
	stage.addChild(messageField);
	stage.update();
	canvas.onclick = handleClick;
}

//allow for WASD and arrow control scheme
function handleKeyDown(e) {
	//cross browser issues exist
	if(!e){ var e = window.event; }
	switch(e.keyCode) {
		case KEYCODE_A:
		case KEYCODE_LEFT:	
		    leftDown = true;
		    return false;
		case KEYCODE_D:
		case KEYCODE_RIGHT: 
			rightDown = true;
			return false;
		case KEYCODE_SPACE:	
		case KEYCODE_W:
		case KEYCODE_UP:	
			jumpDown = true; 
			return false;
		case KEYCODE_ENTER:	 
			if(canvas.onclick == handleClick) { handleClick(); }    
			return false;
	}
}

function handleKeyUp(e) {
	//cross browser issues exist
	if(!e){ var e = window.event; }
	switch(e.keyCode) {
		case KEYCODE_A:
		case KEYCODE_LEFT:	
			leftDown = false; 
			break;
		case KEYCODE_D:
		case KEYCODE_RIGHT: 
			rightDown = false; 
			break;
		case KEYCODE_SPACE:	
		case KEYCODE_W:
		case KEYCODE_UP:	
			jumpDown = false; 
			break;
	}
}

function updateLoading() {
	messageField.test = "Loading " + (preload.progress*100|0) + "%";
	stage.update();
}

function doneLoading() {
	scoreField = new createjs.Text("0", "bold 30px sans-serif", "#FFFFFF");
	scoreField.textAlign = "right";
	scoreField.x = canvasWidth - 10;
	scoreField.y = 22;
	scoreField.maxWidth = 1000;
	
	messageField.text = "Welcome: click to play";
	
	watchRestart();
}
