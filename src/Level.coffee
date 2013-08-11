# Viking Alien Squadron
# (c) 2013 Jami Couch
# Source is released under Apache License v2.0

window.VAS or= {}
root = exports ? this
preload = null

window.VAS.Level = class Level extends createjs.Container
  
  @BLOCK_SIZE = 70
  @TERMINAL_VEL = 500
  
  constructor: (@leveldef) ->
    @initialize()
    
    preload = root.preload
    
    @completed = false
    
    @layers = []
    @objects = []
    @statics = []
    
    @width = Level.BLOCK_SIZE * 20
    @height = Level.BLOCK_SIZE * 10
    
    @gravity = 1000
    
    @levelScore = @maxprogress = 0
    
    @createLevel()
    
    @addChild @layers[i] for i in [0...@layers.length]
    
  createLevel: () ->
    # generate background
    if @leveldef?
      @width = @leveldef.data[0].length * Level.BLOCK_SIZE
      @height = @leveldef.data.length * Level.BLOCK_SIZE
      
      background = new createjs.Container
      background.width = @width
      background.height = @height
      @layers.push background
      
      y = background.height - Level.BLOCK_SIZE * 0.5
      img = {}
      x = 70 * Math.random() * 5
      while x < @width
        img = new createjs.Bitmap preload.getResult(if Math.random() > 0.5 then 'hill-short' else 'hill-long')
        background.addChild img
        img.x = x
        img.y = y - img.image.height
        x += (70 * Math.random() * 5)
      
      background = new createjs.Container
      background.width = @width * 0.8
      background.height = @height
      @layers.push background
      
      y = Level.BLOCK_SIZE * 2
      x = 70 * Math.random() * 5
      while x < @width
        img = new createjs.Bitmap preload.getResult("cloud-#{parseInt Math.random() * 3 + 1}")
        background.addChild img
        img.x = x
        img.y = y - img.image.height + Math.random() * Level.BLOCK_SIZE
        x += (70 * Math.random() * 5)
      
      background = new createjs.Container
      background.width = @width * 0.9
      background.height = @height
      @layers.push background
      
      water = preload.getResult 'water'
      for x in [0..background.width] by Level.BLOCK_SIZE
        img = new createjs.Bitmap water
        background.addChild img
        img.x = x
        img.y = @height - water.height
      
      # object layer
      @objlayer = new createjs.Container
      @objlayer.width = @width
      @objlayer.height = @height
      @layers.push @objlayer
      
      @player = new VAS.Player preload
      @addObject @player
      
      @resetPlayer()
      
      if @leveldef?
        for y in [0...@height / Level.BLOCK_SIZE]
          if y >= @leveldef.data.length then continue
          for x in [0...@width / Level.BLOCK_SIZE]
            if x >= @leveldef.data[y].length then continue
            obj = {}
            switch @leveldef.data[y][x]
              # statics
              when 'g'
                obj = new VAS.Block preload.getResult('ground')
                @addStatic obj
              when 'b'
                obj = new VAS.Block preload.getResult('block')
                @addStatic obj
              when 'r'
                obj = new VAS.Block preload.getResult('crate')
                @addStatic obj
              # objects
              when 'c'
                @addObject obj = new VAS.Coin
              when 'f'
                @addObject obj = new VAS.Enemy(VAS.Enemy.ENEMY_FLY)
              when 's'
                @addObject obj = new VAS.Enemy(VAS.Enemy.ENEMY_SLIME)
            if obj?
              obj.x = x * Level.BLOCK_SIZE + (Level.BLOCK_SIZE - obj.width) / 2
              obj.y = y * Level.BLOCK_SIZE
      else
        @generateRandomLevel()
  
  generateRandomLevel: ->
    x = 0
    while x < @width
      testBlock = new VAS.Block preload.getResult 'ground'
      testBlock.x = x
      testBlock.y = @height - testBlock.height
      x += Level.BLOCK_SIZE * (1 + parseInt(Math.random() * 3))
    
    test = new VAS.Enemy VAS.Enemy.ENEMY_SLIME
    @addObject test
    test.x = Level.BLOCK_SIZE * 10
    test.y = @height - Level.BLOCK_SIZE * 3
    
    test = new VAS.Enemy VAS.Enemy.ENEMY_FLY
    @addObject test
    test.x = Level.BLOCK_SIZE * 12
    test.y = @height - Level.BLOCK_SIZE * 2
    
    test = new VAS.Coin
    @addObject test
    test.x = Level.BLOCK_SIZE * 8
    test.y = Level.BLOCK_SIZE * 7
    
    test = new VAS.Block preload.getResult('crate')
    @addObject test
    test.x = Level.BLOCK_SIZE * 3
    test.y = Level.BLOCK_SIZE * 7
    
  tick: (delta) ->
    for obj in @objects
      obj.update? delta
      
      if not obj.nogravity then obj.vY += @gravity * delta
      
      if obj.vY > Level.TERMINAL_VEL then obj.vY = Level.TERMINAL_VEL
      
      obj.y += obj.vY * delta
      
      if (obj.y + obj.height > @height and not obj.isDead)
        if obj instanceof VAS.Player or obj instanceof VAS.Enemy
          obj.isDead = true
        else
          obj.y = @height - obj.height
          obj.vY = 0
      else if obj.isDead and obj.y > @height
        if obj instanceof VAS.Player then @resetPlayer() else obj.isRemove = true
      
      if obj.isDead then continue
      
      obj.x += obj.vX * delta
      
      if obj.x < 0
        obj.x = 0
        obj.collideSide?()
      if obj.x + obj.width > @width
        if obj is @player
          @completed = true if obj.x + obj.width * 0.5 > @width
        else
          obj.x = @width - obj.width
        obj.collideSide?()
      
      for other in @objects[@objects.indexOf(obj)+1..]
        if @collideRect obj, other
          continue if ((obj.canCollide? and not obj.canCollide other) or
            (other.canCollide? and not other.canCollide obj)) 
          
          obj_result = obj.collide? and not obj.collide other
          other_result = other.collide? and not other.collide obj
          continue if obj_result or other_result
          
          move = nomove = null
          if obj is @player
            move = obj
            nomove = other
          else if other is @player
            move = other
            nomove = obj
          else if obj instanceof VAS.Block and other not instanceof VAS.Block
            move = other
            nomove = obj
          else if other instanceof VAS.Block and obj not instanceof VAS.Block
            move = obj
            nomove = other
          
          @doCollide move, nomove
    
    @removeObject obj for obj in @objects when obj?.isRemove
    
    #collide with statics
    for obj in @objects
      continue if obj.isDead
      
      for st in @statics
        if @collideRect obj, st
          continue if obj.canCollide? and not obj.canCollide st
          
          obj_result = obj.collide? and not obj.collide st
          static_result = st.collide? and not st.collide obj
          continue if obj_result or static_result
          
          @doCollide obj, st
    
    @removeStatic st for st in @statics when st.isRemove
    
    # update backgrounds
    for layer in @layers when layer.width isnt @width
      if @player.x < canvasWidth * 0.5
        layer.x = 0
      else if @player.x > @width - canvasWidth * 0.5
        layer.x = @width - layer.width
      else
        layer.x = (@player.x - canvasWidth * 0.5) / (@width - canvasWidth) * (@width - layer.width)
    
    # update level score
    @maxprogress = @player.x + @player.width * 0.5 if @player.x + @player.width * 0.5 > @maxprogress
    @levelScore = @maxprogress
      
  doCollide: (move, nomove) ->
    return if not move? or not nomove?
    
    dx = dy = 0
    
    dx_left = nomove.x + nomove.collideRect.x - (move.x + move.collideRect.x + move.collideRect.width)
    dx_right = (nomove.x + nomove.collideRect.x + nomove.collideRect.width) - (move.x + move.collideRect.x)
    
    dx = dx_left
    dx = dx_right if (Math.abs(dx_left) > Math.abs(dx_right)) 
    
    dy_top = nomove.y + nomove.collideRect.y - (move.y + move.collideRect.y + move.collideRect.height)
    dy_bot = (nomove.y + nomove.collideRect.y + nomove.collideRect.height) - (move.y + move.collideRect.y)
    dy = dy_top
    dy = dy_bot if (Math.abs(dy_top) > Math.abs(dy_bot)) 
    
    if (Math.abs(dy) <= Math.abs(dx) or (dy < 0 and dy > -5))
      move.y += dy
      
      if (dy < 0 and move.vY > 0)
        move.vY = 0;
        move.collideGround?()
      
      move.vY = 0 if (dy > 0 and move.vY < 0) 
    else
      move.x += dx
      move.vX = 0
      
      move.collideSide?();
      nomove.collideSide?();
    
  collideRect: (obj1, obj2) ->
    if not obj1.collideRect?
      obj1.collideRect =
        x: 0
        y: 0
        width: obj1.width
        height: obj1.height
    if not obj2.collideRect?
      obj2.collideRect =
        x: 0
        y: 0
        width: obj2.width
        height: obj2.height
    not (obj1.x + obj1.collideRect.x + obj1.collideRect.width < obj2.x + obj2.collideRect.x or
      obj1.x + obj1.collideRect.x > obj2.x + obj2.collideRect.x + obj2.collideRect.width or
      obj1.y + obj1.collideRect.y + obj1.collideRect.height < obj2.y + obj2.collideRect.y or
      obj1.y + obj1.collideRect.y > obj2.y + obj2.collideRect.y + obj2.collideRect.height)

  addObject: (obj) ->
    @objects.push obj
    @objlayer?.addChild obj
    obj.vX = 0 if not obj.vX?
    obj.vY = 0 if not obj.vY?
    
  removeObject: (obj) ->
    @objlayer.removeChild obj
    @objects.splice @objects.indexOf(obj), 1
    
  addStatic: (obj) ->
    @statics.push obj
    @objlayer?.addChild obj
    
  removeStatic: (obj) ->
    @objlayer.removeChild obj
    @statics.splice @statics.indexOf(obj), 1
  
  resetPlayer: ->
    @player.resetStates()
    @player.x = @player.width
    @player.y = 0