# Viking Alien Squadron
# (c) 2013 Jami Couch
# Source is released under Apache License v2.0

window.VAS or= {}

window.VAS.Block = class Block extends createjs.Bitmap
  constructor: (image) ->
    @initialize image
    @height = @image.height
    @width = @image.width
    @nogravity = true
    @collideRect = 
      x: 0
      y: 0
      width: @width
      height: @height