# Viking Alien Squadron
# (c) 2013 Jami Couch
# Source is released under Apache License v2.0

window.VAS or= {}

window.VAS.Coin = class Coin extends createjs.Bitmap
  constructor: ->
    @initialize preload.getResult('coin')
    
    @height = @image.height
    @width = @image.width
    
    @nogravity = true
    @collideRect = 
      x: 0
      y: 0
      width: @width
      height: @height
      
  collide: (obj) ->
    if obj not instanceof VAS.Player then return
    
    @isRemove = true
    obj.coins++
    false
