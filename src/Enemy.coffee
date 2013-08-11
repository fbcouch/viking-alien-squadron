# Viking Alien Squadron
# (c) 2013 Jami Couch
# Source is released under Apache License v2.0

window.VAS or= {}

window.VAS.Enemy = class Enemy extends createjs.BitmapAnimation
  @ENEMY_SLIME: 0
  @ENEMY_FLY: 1
  
  COLLIDERECTS = [
    {x: 5, y: 0, width: 42, height: 28},
    {x: 15, y: 0, width: 36, height: 32},
  ]
  
  constructor: (@type) ->
    normal = {}
    switch @type
      when Enemy.ENEMY_SLIME then normal = preload.getResult 'slime'
      when Enemy.ENEMY_FLY then normal = preload.getResult 'fly'
    console.log normal
    spriteSheet = new createjs.SpriteSheet {
      images: [normal]
      frames: {
        width: normal.width
        height: normal.height / 4
        regX: normal.width / 2
        regY: 0
      }
      animations: {
        move: [0, 1, 'move', 3]
        dead: 2
      }
    }
    createjs.SpriteSheetUtils.addFlippedFrames spriteSheet, true, false, false
    
    @initialize spriteSheet
    
    @width = @spriteSheet.getFrame(0).rect.width
    @height = @spriteSheet.getFrame(0).rect.height
    @regX = -1 * @width / 2
    @regY = 0
    
    @isDead = @facingRight = false
    @moveSpeed = 100
    
    if @type is Enemy.ENEMY_FLY
      @nogravity = true
      @pausetime = 500
      @pausetimer = 0
      @movetimer = 0
      @goingDown = true
      
    @collideRect =
      x: if type < COLLIDERECTS.length then COLLIDERECTS[type].x else 0
      y: if type < COLLIDERECTS.length then COLLIDERECTS[type].y else 0
      width: if type < COLLIDERECTS.length then COLLIDERECTS[type].width else @width
      height: if type < COLLIDERECTS.length then COLLIDERECTS[type].height else @height
    
    @gotoAndPlay if @facingRight then 'move_h' else 'move'
  
  update: (delta) ->
    switch @type
      when Enemy.ENEMY_SLIME then @vX = @moveSpeed * (if @facingRight then 1 else -1)
      when Enemy.ENEMY_FLY then @tweenMove delta
      
    if @animation isnt (if @facingRight then 'move_h' else 'move')
      @gotoAndPlay (if @facingRight then 'move_h' else 'move')
    
    if @isDead then @gotoAndStop 'dead'
    
  collideSide: ->
    if @type is Enemy.ENEMY_SLIME then @facingRight = not @facingRight
    
  collideGround: ->
  
  canCollide: (other) ->
    not @isDead
    
  collide: (other) ->
    if other instanceof VAS.Player
      dx = dy = 0
      if @y + @height * 0.5 > other.y + other.height * 0.5
        dy = other.y + other.height - @y
      else
        dy = other.y - @y - @height
      
      if @x + @width * 0.5 > other.x + other.width * 0.5
        dx = @x - other.x - other.width
      else
        dx = @x + @width - other.x
        
      if Math.abs(dy) < Math.abs(dx)
        if dy > 0 and other.vY > 0
          @die()
          other.jump()
        else
          other.bop dx >= 0
      else
        other.bop dx >= 0
      false
    true
    
  tweenMove: (delta) ->
    if @isDead then return
    
    @pausetimer -= delta * 1000
    @movetimer -= delta * 1000
    
    if @pausetimer <= 0 and @movetimer <= 0
      @movetimer = 3000
      @pausetimer = 500
      @goingDown = not @goingDown
    else
      @vY = 0
    
    if @movetimer <= 0
      @pausetimer = @pausetime
    else
      @vY = @moveSpeed * if @goingDown then 1 else -1
  
  die: ->
    @isDead = true
    @nogravity = false
    @vY = -200
