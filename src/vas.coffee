# Viking Alien Squadron
# (c) 2013 Jami Couch
# Source is released under Apache License v2.0

root = exports ? this

KEYCODE_ENTER = 13
KEYCODE_SPACE = 32
KEYCODE_UP = 38
KEYCODE_LEFT = 37
KEYCODE_RIGHT = 39
KEYCODE_W = 87
KEYCODE_A = 65
KEYCODE_D = 68

canvas = {}
stage = {}

canvasWidth = canvasHeight = 0

player = {}
currentLevel = {}
baseScore = {}
level = 0
levelArray = []

root.keystatus = keystatus = 
  leftDown: false
  rightDown: false
  jumpDown: false

messageField = {}
preload = {}

scoreField = {}
levelField = {}

document.onkeydown = handleKeyDown
document.onkeyup = handleKeyUp

init = () ->
  console.log 'game init'
  
  canvas = document.getElementById "gameCanvas"
  canvas.style.background = '#93F'
  stage = new createjs.Stage canvas
  
  root.canvasWidth = canvasWidth = canvas.width
  root.canvasHeight = canvasHeight = canvas.height
  
  messageField = new createjs.Text 'Loading', 'bold 30px sans-serif', '#FFF'
  messageField.maxWidth = 1000
  messageField.textAlign = 'center'
  messageField.x = canvasWidth / 2
  messageField.y = canvasHeight / 2
  
  stage.addChild messageField
  stage.update()
  
  manifest = [
      {id: "player", src:"assets/character/front.png"},
      {id: "player-face-right", src: "assets/character/side.png"},
      {id: "player-jump", src: "assets/character/jump.png"},
      {id: "player-walk-anim", src: "assets/character/sheet/walk_sheet.png"},
      {id: "ground", src: "assets/ground.png"},
      {id: "ground-cave", src: "assets/ground_cave.png"},
      {id: "block", src: "assets/block.png"},
      {id: "bonus", src: "assets/bonus.png"},
      {id: "bonus-used", src: "assets/bonus_used.png"},
      {id: "bush", src: "assets/bush.png"},
      {id: "cloud-1", src: "assets/cloud_1.png"},
      {id: "cloud-2", src: "assets/cloud_2.png"},
      {id: "cloud-3", src: "assets/cloud_3.png"},
      {id: "coin", src: "assets/coin.png"},
      {id: "crate", src: "assets/crate.png"},
      {id: "fence", src: "assets/fence.png"},
      {id: "fence-broken", src: "assets/fence_broken.png"},
      {id: "grass", src: "assets/grass.png"},
      {id: "hill-long", src: "assets/hill_long.png"},
      {id: "hill-short", src: "assets/hill_short.png"},
      {id: "shroom", src: "assets/shroom.png"},
      {id: "spikes", src: "assets/spikes.png"},
      {id: "water", src: "assets/water.png"},
      {id: "fly", src: "assets/enemies/fly.png"},
      {id: "slime", src: "assets/enemies/slime.png"},
    ]
  
  root.preload = new createjs.LoadQueue()
  preload = root.preload
  preload.addEventListener 'complete', doneLoading
  preload.addEventListener 'progress', updateLoading
  preload.loadManifest manifest
  
  document.onkeydown = handleKeyDown
  document.onkeyup = handleKeyUp
  
tick = (event) ->
  delta = event.delta / 1000
  if not event.delta?
    return
  
  console.log "FPS: #{1 / delta}"
  
  currentLevel.tick delta
  
  currentLevel.x = -1 * player.x + canvasWidth * 0.5
  currentLevel.x = 0 if currentLevel.x > 0
  currentLevel.x = -1 * (currentLevel.width - canvasWidth) if currentLevel.x < -1 * (currentLevel.width - canvasWidth)
  
  if currentLevel.completed
    score = baseScore + currentLevel.levelScore
    level = (level + 1) % levelArray.length
    restart()
    baseScore = score
  
  scoreField.text = "Score: #{parseInt(baseScore + currentLevel.levelScore)}"
  levelField.text = "Level: #{parseInt(level + 1)}"
  
  stage.update()

restart = () ->
  baseScore = 0
  currentLevel = new Level levelArray[level]
  
  player = currentLevel.player
  
  stage.removeAllChildren()
  scoreField.text = '0'
  stage.addChild scoreField
  stage.addChild levelField
  
  jumpDown = leftDown = rightDown = false
  
  stage.clear()
  stage.addChild currentLevel
  
  if not createjs.Ticker.hasEventListener('tick')
    createjs.Ticker.addEventListener('tick', tick)
    
handleClick = () ->
  canvas.onclick = null
  stage.removeChild messageField
  
  restart()
  
watchRestart = () ->
  stage.addChild messageField
  stage.update()
  canvas.onclick = handleClick
  
handleKeyDown = (e) ->
  e = window.event if not e
  switch e.keyCode
    when KEYCODE_A, KEYCODE_LEFT then keystatus.leftDown = true
    when KEYCODE_D, KEYCODE_RIGHT then keystatus.rightDown = true
    when KEYCODE_SPACE, KEYCODE_W, KEYCODE_UP then keystatus.jumpDown = true
    when KEYCODE_ENTER then handleClick() if canvas.onclick is handleClick
  false
  
handleKeyUp = (e) ->
  e = window.event if not e
  switch e.keyCode
    when KEYCODE_A, KEYCODE_LEFT then keystatus.leftDown = false
    when KEYCODE_D, KEYCODE_RIGHT then keystatus.rightDown = false
    when KEYCODE_SPACE, KEYCODE_W, KEYCODE_UP then keystatus.jumpDown = false
    when KEYCODE_ENTER then handleClick() if canvas.onclick is handleClick
  false

updateLoading = () ->
  messageField.text = "Loading #{preload.progress*100|0}%"
  stage.update()
  
doneLoading = ->
  scoreField = new createjs.Text '0', 'bold 30px sans-serif', '#FFF'
  scoreField.textAlign = 'right'
  scoreField.x = canvasWidth - 10
  scoreField.y = 22
  scoreField.maxWidth = 1000
  
  levelField = new createjs.Text 'Level 0', 'bold 30px sans-serif', '#FFF'
  levelField.x = 10
  levelField.y = 22
  
  messageField.text = 'Welcome: click to play'
  
  watchRestart()
  
levelArray = 
[
  {
    id: "lvl1",
    data: [
      "                                                                                                             ",
      "                                                 c c c                                               ccc     ",
      "                                                                                                    c   c    ",
      "     bbb                                         bbbbbb                                                      ",
      "               c                                                                                   r         ",
      "             c   c                                         f           c     c                    rr         ",
      "    bbbbb                          c       bbbb          bbbb          c     c                   rrr         ",
      "             r   r    b cc  b      f                                   c     c     bcccb        rrrr         ",
      "             r   r    b    sb            rs     r                   f     f     f  b s b       rrrrr         ",
      "gggggggggggggg   ggggggggggggggggg   gggggggggggg      gggggggggggggggggggggggggggggggggggggggggggggggggggggg",
    ],
  },
  {
    id: "lvl2",
    data: [
      "                                                                                                             ",
      "                         c     ccc                                                                    ccc    ",
      "                              c   c                                 ccc                              c   c   ",
      "                                                             bb   c  s  c                                    ",
      "                   b    bbbbb                           bb        bbbbbbb                          r         ",
      "         c    b                   bbb   b   b   b    b                                            rr         ",
      "         b                                                  b                bbbbbbb             rrr         ",
      "              ccccc                                        bb                                   rrrr     f   ",
      "      b       bbbbb                         ccccc       b                             bbbb     rrrrr         ",
      "gggg  b                                     bbbbb    b                                         ggggg     gggg",
    ],
  },
];

init()
