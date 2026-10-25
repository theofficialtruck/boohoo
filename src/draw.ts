import {
  game,
  WIDTH,
  HEIGHT,
  LAMP_X,
  LAMP_Y,
  BALL_Y,
  BALL_RADIUS,
  START_ENERGY,
  COMBO_TIME,
  HEAD_X,
  HEAD_Y,
  END_DELAY,
  SAFE_DETECTION,
  nearbyObject,
} from './game'

const FLOOR_Y = 390

const NIGHT = '#151b3d'
const FLOOR = '#0f1431'
const FLOOR_LINE = '#161c40'
const SHADOW = '#1d2252'
const INDIGO = '#2b3068'
const INDIGO_LIGHT = '#3a4080'
const SLATE = '#4a5579'
const SLATE_LIGHT = '#66729a'
const SKY = '#0a0f2c'
const MOON = '#d6e4ff'
const SKIN = '#b9b3d9'
const HAIR = '#2a2350'
const LAVENDER = '#c9b8f7'
const GHOST_EYE = '#1b1640'
const LAMP_LIGHT = '#ffd97a'
const DAWN = '#f2b48f'

// furniture is from the Glitch CC0 pack, the objects on the shelf are Kenney puzzle tiles
function loadImage(file: string) {
  const img = new Image()
  img.src = 'images/' + file
  return img
}

const windowImg = loadImage('window.svg')
const rugImg = loadImage('rug.svg')
const bookcaseImg = loadImage('bookcase.svg')
const nightstandImg = loadImage('nightstand.svg')
const lampImg = loadImage('lamp.svg')
const bedImg = loadImage('bed.png')
const sunImg = loadImage('sun.png')
const moonImg = loadImage('moon.png')
const ballImg = loadImage('ball.png')
const objectImgs = [
  loadImage('object_blue.png'),
  loadImage('object_green.png'),
  loadImage('object_red.png'),
  loadImage('object_pink.png'),
  loadImage('object_yellow.png'),
]

// the pictures are in daylight colors so dim them for night
function drawDark(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  ctx.save()
  ctx.filter = 'brightness(0.55)'
  ctx.drawImage(img, x, y, w, h)
  ctx.restore()
}

function rect(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

function circle(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, r: number) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

export function draw(ctx: CanvasRenderingContext2D) {
  drawRoom(ctx)

  if (game.screen === 'title') {
    // darken the room a bit so the title stands out
    ctx.fillStyle = 'rgba(8, 11, 30, 0.4)'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    drawTitle(ctx)
    drawGhost(ctx, 130, 440, Math.sin(game.time) * 0.15, 2.4, 0)
  }

  if (game.screen === 'instructions') {
    drawInstructions(ctx)
  }

  if (game.screen === 'playing' || game.screen === 'won' || game.screen === 'lost') {
    drawToy(ctx)
    drawBall(ctx)
    let squish = game.squeakTimer > 0 ? Math.sin((game.squeakTimer / 0.7) * Math.PI) : 0
    if (game.screen === 'won' && game.endTimer < 0.6) {
      squish = Math.sin((game.endTimer / 0.6) * Math.PI) * 2
    }

    ctx.save()
    if (game.loseReason === 'no energy') {
      ctx.globalAlpha = Math.max(0, 1 - game.endTimer / END_DELAY)
    }
    drawGhost(ctx, game.ghostX, game.ghostY, game.ghostLean, 1, squish)
    ctx.restore()
    drawBoo(ctx)
  }

  if (game.screen === 'playing') {
    drawComboRing(ctx)
    drawFinalPrompt(ctx)
    drawPrompt(ctx)
    drawMessage(ctx)
    drawHud(ctx)
  }

  if (game.screen === 'won' || game.screen === 'lost') {
    drawEnd(ctx)
  }
}

function drawInstructions(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(8, 11, 30, 0.7)'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '900 44px "Arial Rounded MT Bold", "Segoe UI Black", "Arial Black", sans-serif'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 10
  ctx.strokeStyle = INDIGO
  ctx.strokeText('How to haunt', WIDTH / 2, 85)
  ctx.fillStyle = LAVENDER
  ctx.fillText('How to haunt', WIDTH / 2, 85)

  const rows = [
    ['Arrows / WASD', 'float around'],
    ['E', 'move whatever is nearby'],
    ['Q', 'tiny "boo"'],
    ['Shift', 'sprint, but it fills the detection bar'],
    ['BOO', 'must E at the bed when this comes up'],
  ]

  // keys on the left, what they do on the right
  for (let i = 0; i < rows.length; i++) {
    const y = 140 + i * 34
    ctx.font = '700 18px "Segoe UI", system-ui, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillStyle = LAVENDER
    ctx.fillText(rows[i][0], 370, y)
    ctx.font = '400 18px "Segoe UI", system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillStyle = MOON
    ctx.fillText(rows[i][1], 392, y)
  }
}

function drawComboRing(ctx: CanvasRenderingContext2D) {
  if (game.comboTimer <= 0) {
    return
  }

  const left = game.comboTimer / COMBO_TIME
  ctx.strokeStyle = `rgba(201, 184, 247, ${0.3 + left * 0.5})`
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(game.ghostX, game.ghostY + Math.sin(game.time * 3) * 4, 18 + left * 24, 0, Math.PI * 2)
  ctx.stroke()
}

function drawFinalPrompt(ctx: CanvasRenderingContext2D) {
  if (game.scare < 100 || game.humanState !== 'sleeping') {
    return
  }

  const pulse = 1 + Math.sin(game.time * 6) * 0.08
  ctx.save()
  ctx.translate(HEAD_X, HEAD_Y - 110)
  ctx.scale(pulse, pulse)
  ctx.font = '900 30px "Arial Rounded MT Bold", "Segoe UI Black", "Arial Black", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 8
  ctx.strokeStyle = INDIGO
  ctx.strokeText('BOO!', 0, 0)
  ctx.fillStyle = LAVENDER
  ctx.fillText('BOO!', 0, 0)
  ctx.restore()
}

function drawMessage(ctx: CanvasRenderingContext2D) {
  if (game.messageTimer <= 0) {
    return
  }

  // fade out over the last bit
  const alpha = Math.min(1, game.messageTimer / 0.4)
  ctx.fillStyle = `rgba(201, 184, 247, ${alpha})`
  ctx.font = '700 22px "Segoe UI", system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  // to the right of the wisps so they don't overlap
  ctx.fillText(game.message, 650, 40)
}

function drawEnd(ctx: CanvasRenderingContext2D) {
  if (game.loseReason === 'no energy') {
    ctx.fillStyle = `rgba(242, 180, 143, ${Math.min(game.endTimer / END_DELAY, 1) * 0.12})`
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
  }

  // let the reaction play, then fade the words in
  const fade = Math.min(Math.max((game.endTimer - (END_DELAY - 0.5)) / 0.5, 0), 1)
  if (fade <= 0) {
    return
  }

  ctx.save()
  ctx.globalAlpha = fade
  ctx.fillStyle = 'rgba(8, 11, 30, 0.5)'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  let title = 'Out of spooks'
  let line = 'The sun is coming up.'
  if (game.screen === 'won') {
    title = 'BOO!'
    line = 'You scared them!'
  } else if (game.loseReason === 'too soon') {
    title = 'Too soon!'
    line = 'They woke up and saw a tiny ghost'
  }

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '900 72px "Arial Rounded MT Bold", "Segoe UI Black", "Arial Black", sans-serif'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 12
  ctx.strokeStyle = INDIGO
  ctx.strokeText(title, WIDTH / 2, 230)
  ctx.fillStyle = LAVENDER
  ctx.fillText(title, WIDTH / 2, 230)

  ctx.fillStyle = MOON
  ctx.font = '600 20px "Segoe UI", system-ui, sans-serif'
  ctx.fillText(line, WIDTH / 2, 300)
  ctx.restore()
}

function drawHud(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = LAVENDER
  ctx.font = '700 12px "Segoe UI", system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('SCARE', 24, 27)

  rect(ctx, SHADOW, 76, 21, 180, 12)
  rect(ctx, LAVENDER, 76, 21, (180 * game.scare) / 100, 12)
  ctx.strokeStyle = INDIGO_LIGHT
  ctx.lineWidth = 2
  ctx.strokeRect(76, 21, 180, 12)

  ctx.fillStyle = LAVENDER
  ctx.fillText('DETECT', 24, 49)
  rect(ctx, SHADOW, 76, 43, 180, 12)
  rect(ctx, MOON, 76, 43, (180 * Math.min(game.detection, 100)) / 100, 12)
  ctx.strokeRect(76, 43, 180, 12)
  rect(ctx, LAVENDER, 76 + (180 * SAFE_DETECTION) / 100, 39, 2, 20)

  // one little wisp per action left
  for (let i = 0; i < START_ENERGY; i++) {
    const x = 280 + i * 18
    const y = 37
    ctx.fillStyle = i < game.energy ? LAVENDER : INDIGO_LIGHT
    ctx.beginPath()
    ctx.moveTo(x, y - 9)
    ctx.lineTo(x + 5, y + 1)
    ctx.arc(x, y + 2, 5, 0, Math.PI)
    ctx.closePath()
    ctx.fill()
  }
}

function drawToy(ctx: CanvasRenderingContext2D) {
  const wobble = game.toyWobble > 0 ? Math.sin(game.toyWobble * 40) * 0.25 * game.toyWobble : 0

  ctx.save()
  ctx.translate(game.toyX, game.toyY)
  ctx.rotate(game.toyAngle + wobble)

  // a little wind up robot, drawn upwards from its feet
  rect(ctx, SLATE, -7, -6, 5, 6)
  rect(ctx, SLATE, 2, -6, 5, 6)
  rect(ctx, SLATE_LIGHT, -9, -20, 18, 14)
  rect(ctx, SLATE_LIGHT, -7, -31, 14, 11)
  circle(ctx, MOON, -3, -26, 1.8)
  circle(ctx, MOON, 3, -26, 1.8)
  rect(ctx, SLATE, -1, -36, 2, 5)
  circle(ctx, LAMP_LIGHT, 0, -37, 2.2)
  rect(ctx, SLATE, 9, -15, 4, 3)
  rect(ctx, SLATE, 12, -18, 2, 9)

  ctx.restore()
}

function drawBall(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(5, 8, 22, 0.5)'
  ctx.beginPath()
  ctx.ellipse(game.ballX, BALL_Y + BALL_RADIUS, 13, 4, 0, 0, Math.PI * 2)
  ctx.fill()

  // spin the picture so the stripe shows it rolling
  ctx.save()
  ctx.translate(game.ballX, BALL_Y)
  ctx.rotate(game.ballSpin)
  ctx.drawImage(ballImg, -BALL_RADIUS, -BALL_RADIUS, BALL_RADIUS * 2, BALL_RADIUS * 2)
  ctx.restore()
}

// the ghost's tiny "boo" drifting up and fading
function drawBoo(ctx: CanvasRenderingContext2D) {
  if (game.squeakTimer <= 0) {
    return
  }

  const p = 1 - game.squeakTimer / 0.7
  ctx.fillStyle = `rgba(201, 184, 247, ${1 - p})`
  ctx.font = '600 13px "Segoe UI", system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('boo.', game.ghostX + 14, game.ghostY - 22 - p * 22)
}

// little "E" key floating over the ghost's head
function drawPrompt(ctx: CanvasRenderingContext2D) {
  const x = game.ghostX
  const y = game.ghostY - 46 + Math.sin(game.time * 3) * 4

  if (nearbyObject() === '') {
    return
  }

  ctx.fillStyle = NIGHT
  ctx.strokeStyle = LAVENDER
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(x - 13, y - 13, 26, 26, 6)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = LAVENDER
  ctx.font = '700 16px "Segoe UI", system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('E', x, y + 1)
}

function drawGhost(ctx: CanvasRenderingContext2D, x: number, y: number, lean: number, size: number, squish: number) {
  const t = game.time
  const bob = Math.sin(t * 3) * 4 * size
  const look = lean * 10

  ctx.save()
  ctx.translate(x, y + bob)
  ctx.rotate(lean)
  ctx.scale(size * (1 + squish * 0.2), size * (1 - squish * 0.15))

  circle(ctx, 'rgba(201, 184, 247, 0.12)', 0, 0, 28)

  // little curl on top
  const curl = Math.sin(t * 6) * 2
  ctx.strokeStyle = LAVENDER
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(0, -14)
  ctx.quadraticCurveTo(-4 + curl, -24, 3 + curl, -25)
  ctx.stroke()

  ctx.fillStyle = LAVENDER
  ctx.beginPath()
  ctx.moveTo(0, -16)
  ctx.bezierCurveTo(10, -16, 13, -2, 14, 12)
  ctx.lineTo(9 + Math.sin(t * 5) * 2, 21)
  ctx.lineTo(4.5, 14)
  ctx.lineTo(Math.sin(t * 5 + 1) * 2, 21)
  ctx.lineTo(-4.5, 14)
  ctx.lineTo(-9 + Math.sin(t * 5 + 2) * 2, 21)
  ctx.lineTo(-14, 12)
  ctx.bezierCurveTo(-13, -2, -10, -16, 0, -16)
  ctx.fill()

  for (const eyeX of [-5, 5]) {
    ctx.fillStyle = GHOST_EYE
    ctx.beginPath()
    ctx.ellipse(eyeX + look, -3, 3, 4.5, 0, 0, Math.PI * 2)
    ctx.fill()
    circle(ctx, MOON, eyeX + look + 1, -5, 1.2)
  }
  circle(ctx, GHOST_EYE, look * 0.6, 6, 2 + squish * 2)

  ctx.restore()
}

function drawRoom(ctx: CanvasRenderingContext2D) {
  rect(ctx, NIGHT, 0, 0, WIDTH, FLOOR_Y)
  rect(ctx, FLOOR, 0, FLOOR_Y, WIDTH, HEIGHT - FLOOR_Y)

  ctx.strokeStyle = FLOOR_LINE
  ctx.lineWidth = 3
  for (const y of [425, 465, 510]) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(WIDTH, y)
    ctx.stroke()
  }
  rect(ctx, INDIGO, 0, FLOOR_Y - 10, WIDTH, 10)

  drawWindow(ctx)
  drawRug(ctx)
  drawShelf(ctx)
  drawNightstand(ctx)
  drawLamp(ctx)

  drawBed(ctx)
  drawZs(ctx)
}

function drawWindow(ctx: CanvasRenderingContext2D) {
  drawDark(ctx, windowImg, 238, 60, 155, 195)

  // the glass in the picture is grey, so paint the night over the three panes
  ctx.save()
  ctx.beginPath()
  ctx.rect(256, 79, 53, 70)
  ctx.rect(321, 79, 53, 70)
  ctx.rect(256, 162, 118, 71)
  ctx.clip()

  rect(ctx, SKY, 250, 70, 130, 170)
  for (const [x, y] of [[268, 95], [300, 190], [360, 210], [275, 120], [333, 172]]) {
    rect(ctx, MOON, x, y, 2, 2)
  }
  ctx.drawImage(moonImg, 325, 91, 42, 43)

  // out of time: the sky warms up and the sun peeks over the sill
  if (game.loseReason === 'no energy') {
    const dawn = Math.min(game.endTimer / END_DELAY, 1)
    ctx.globalAlpha = dawn * 0.9
    rect(ctx, DAWN, 250, 70, 130, 170)
    ctx.globalAlpha = 1
    ctx.drawImage(sunImg, 285, 232 - dawn * 60, 60, 60)
  }
  ctx.restore()
}

function drawRug(ctx: CanvasRenderingContext2D) {
  drawDark(ctx, rugImg, 165, 418, 330, 93)
}

// x, y, size and color of each object, just placed by eye
const objects = [
  [80, 210, 22, 0],
  [103, 211, 21, 2],
  [126, 209, 23, 4],
  [85, 255, 22, 1],
  [108, 256, 21, 3],
  [88, 312, 22, 2],
  [111, 313, 21, 0],
  [112, 292, 21, 4],
]

function drawShelf(ctx: CanvasRenderingContext2D) {
  drawDark(ctx, bookcaseImg, 30, 131, 180, 261)

  for (const [x, y, size, color] of objects) {
    drawDark(ctx, objectImgs[color], x, y, size, size)
  }
}

function drawNightstand(ctx: CanvasRenderingContext2D) {
  drawDark(ctx, nightstandImg, 440, 300, 110, 90)
}

function drawLamp(ctx: CanvasRenderingContext2D) {
  const lampOn = game.lampFlicker > 0 && Math.sin(game.lampFlicker * 30) > -0.2

  if (lampOn) {
    circle(ctx, 'rgba(255, 217, 122, 0.12)', LAMP_X, LAMP_Y + 20, 130)
    ctx.fillStyle = 'rgba(255, 217, 122, 0.25)'
    ctx.beginPath()
    ctx.moveTo(470, 283)
    ctx.lineTo(520, 283)
    ctx.lineTo(540, 322)
    ctx.lineTo(450, 322)
    ctx.closePath()
    ctx.fill()
  }

  if (lampOn) {
    ctx.drawImage(lampImg, 463, 246, 64, 83)
  } else {
    drawDark(ctx, lampImg, 463, 246, 64, 83)
  }
}

function drawBed(ctx: CanvasRenderingContext2D) {
  const state = game.humanState
  const stirring = state === 'stirring'
  // snoring when asleep, restless tossing when stirring
  const breath = Math.sin(game.time * 1.6) * 3
  const toss = stirring ? Math.sin(game.time * 7) * 4 : 0

  // how far they've sat up at the end
  let lift = 0
  if (state === 'awake') lift = Math.min(game.endTimer * 120, 28)
  if (state === 'scared') lift = Math.min(game.endTimer * 500, 60)
  const shake = state === 'scared' ? Math.sin(game.time * 60) * 2 : 0

  // middle of the face
  const hx = HEAD_X + toss + shake
  const hy = HEAD_Y - lift

  ctx.drawImage(bedImg, 580, 184, 371, 215)

  // pajama top shows once they sit up
  if (lift > 0) {
    rect(ctx, SLATE, hx - 18, hy + 12, 36, lift + 10)
  }

  circle(ctx, HAIR, hx + 12, hy - 7, 21)
  circle(ctx, SKIN, hx, hy, 19)

  ctx.strokeStyle = HAIR
  ctx.lineWidth = 2
  ctx.fillStyle = MOON
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.beginPath()

  if (stirring) {
    // scrunched up eyes and a grumpy little mouth
    ctx.moveTo(hx - 14, hy - 1)
    ctx.lineTo(hx - 5, hy - 4)
    ctx.moveTo(hx - 17, hy + 9)
    ctx.lineTo(hx - 10, hy + 8)
    ctx.stroke()
    ctx.font = '900 26px "Segoe UI", system-ui, sans-serif'
    ctx.fillText('!', HEAD_X, HEAD_Y - 48)
  } else if (state === 'awake') {
    // woke up, saw a tiny ghost, and laughed
    ctx.arc(hx - 12, hy + 4, 5, 0.2, Math.PI - 0.2)
    ctx.stroke()
    circle(ctx, HAIR, hx - 12, hy - 2, 2.5)
    circle(ctx, HAIR, hx - 3, hy - 3, 2.5)
    if (game.endTimer > 0.3) {
      ctx.fillStyle = MOON
      ctx.font = 'italic 600 18px "Segoe UI", system-ui, sans-serif'
      ctx.fillText('pfft', hx - 10, hy - 42)
    }
  } else if (state === 'scared') {
    // huge eyes, huge mouth
    circle(ctx, MOON, hx - 12, hy - 3, 5)
    circle(ctx, MOON, hx - 1, hy - 4, 5)
    circle(ctx, HAIR, hx - 12, hy - 3, 1.6)
    circle(ctx, HAIR, hx - 1, hy - 4, 1.6)
    circle(ctx, HAIR, hx - 9, hy + 9, 6)
    ctx.fillStyle = MOON
    ctx.font = '900 26px "Segoe UI", system-ui, sans-serif'
    ctx.fillText('!!', hx, hy - 46)
  } else {
    // closed eyes and a snoring mouth
    ctx.arc(hx - 9, hy - 3, 4, 0.2, Math.PI - 0.2)
    ctx.stroke()
    circle(ctx, HAIR, hx - 14, hy + 8, 2.5 + breath * 0.3)
  }
}

function drawZs(ctx: CanvasRenderingContext2D) {
  if (game.humanState !== 'sleeping') {
    return
  }

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let i = 0; i < 3; i++) {
    const p = (game.time * 0.4 + i / 3) % 1
    const x = 815 - p * 50 + Math.sin(game.time * 2 + i) * 5
    const y = 255 - p * 100
    ctx.font = `700 ${14 + p * 16}px "Segoe UI", system-ui, sans-serif`
    ctx.fillStyle = `rgba(214, 228, 255, ${1 - p})`
    ctx.fillText('z', x, y)
  }
}

function drawTitle(ctx: CanvasRenderingContext2D) {
  ctx.font = '900 128px "Arial Rounded MT Bold", "Segoe UI Black", "Arial Black", sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 16
  ctx.strokeStyle = INDIGO

  const title = 'BooHoo'
  let x = WIDTH / 2 - ctx.measureText(title).width / 2

  // each letter bobs a little behind the one before it
  for (let i = 0; i < title.length; i++) {
    const letter = title[i]
    const y = 210 + Math.sin(game.time * 2.5 - i * 0.7) * 8
    ctx.strokeText(letter, x, y)
    ctx.fillStyle = i < 3 ? LAVENDER : MOON
    ctx.fillText(letter, x, y)
    x += ctx.measureText(letter).width
  }
}
