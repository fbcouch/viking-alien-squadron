// Level.js
// Created by Jami Couch

// Level extends Container and contains all the state information necessary to render the level

// Constructor
function Level() {
	this.layers = [];
	
	this.player = new Player(preload);
	this.addChild(this.player);
}

Level.prototype = new createjs.Container();
