# Viking Alien Squadron
# (c) 2013 Jami Couch
# Source is released under Apache License v2.0

root = exports ? this
window.VAS or= {}

keystatus = {}

window.VAS.Player = class Player extends createjs.BitmapAnimation
  constructor: (preload) ->
    playerSpriteSheet = new createjs.SpriteSheet {
      images: [preload.getResult('player-walk-anim'), preload.getResult('player-jump')]
      frames: { width: 72, height: 97, regX: 36, regY: 0 }
      animations: {
        walk: [0, 10]
        jump: 15
      }
    }
    createjs.SpriteSheetUtils.addFlippedFrames playerSpriteSheet, true, false, false
    @init playerSpriteSheet
    keystatus = root.keystatus
    
  init: (playerSpriteSheet) ->
    @initialize playerSpriteSheet
    
    @width = @spriteSheet.getFrame(0).rect.width
    @height = @spriteSheet.getFrame(0).rect.height
    @regX = -36
    @regY = 0
    
    @jumpVel = -675
    @moveSpeed = 250
    @facingRight = true
    
    @isJumping = true
    @isBopped = false
    @coins = 0
    
    @collideRect = 
      x: 14
      y: 0
      width: 44
      height: @height
    
    @gotoAndStop if @facingRight then 'walk' else 'walk_h'
    
  update: (delta) ->
    if @isBopped 
      return
    @jump() if keystatus.jumpDown and @canJump()
    
    if @isJumping
      @gotoAndStop if @facingRight then 'jump' else 'jump_h'
      
    if keystatus.leftDown and not keystatus.rightDown
      @facingRight = false
      @x -= @moveSpeed * delta
      @gotoAndPlay('walk_h') if (@paused or @currentAnimation is not 'walk_h') and not @isJumping
    else if keystatus.rightDown and not keystatus.leftDown
      @facingRight = true
      @x += @moveSpeed * delta
      @gotoAndPlay('walk') if (@paused or @currentAnimation is not 'walk') and not @isJumping
    else
      @gotoAndStop(if @facingRight then 'walk' else 'walk_h') if not @isJumping
  
  collideGround: ->
    @isJumping = false
    @vX = 0 if @isBopped
    @isBopped = false
  
  canJump: ->
    not @isJumping and @vY is 0
  
  jump: ->
    @vY = @jumpVel
    @isJumping = true
  
  bop: (@facingRight) ->
    @isBopped = true
    @isJumping = true
    @vY = -250
    @vX = 350 * if @facingRight then 1 else -1
    
  resetStates: ->
    @isJumping = @facingRight = true
    @isBopped = @nogravity = @isDead = false
    @vX = @vY = 0
    @gotoAndStop if @facingRight then 'walk' else 'walk_h'
