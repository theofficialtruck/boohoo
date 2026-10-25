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
const BLANKET = '#454a94'
const SKY = '#0a0f2c'
const MOON = '#d6e4ff'
const SKIN = '#b9b3d9'
const HAIR = '#2a2350'
const LAVENDER = '#c9b8f7'
const GHOST_EYE = '#1b1640'
const LAMP_LIGHT = '#ffd97a'
const BALL = '#7d8ad8'

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
    // 0 to 1, peaks in the middle of the squeak
    const squish = game.squeakTimer > 0 ? Math.sin((game.squeakTimer / 0.7) * Math.PI) : 0
    drawGhost(ctx, game.ghostX, game.ghostY, game.ghostLean, 1, squish)
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

// shrinks away while there's still time to chain a combo
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

// big pulsing BOO! over the sleeper once the meter is full
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
  ctx.fillText(game.message, WIDTH / 2, 40)
}

// placeholder ending until the proper end screens are in
function drawEnd(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(8, 11, 30, 0.6)'
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

  // one little wisp per action left
  for (let i = 0; i < START_ENERGY; i++) {
    const x = 30 + i * 18
    const y = 54
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

  circle(ctx, BALL, game.ballX, BALL_Y, BALL_RADIUS)

  // stripe across the middle so you can see it spin
  ctx.save()
  ctx.translate(game.ballX, BALL_Y)
  ctx.rotate(game.ballSpin)
  rect(ctx, MOON, -BALL_RADIUS, -2, BALL_RADIUS * 2, 4)
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

// little "E" key floating over the ghost's head, or "wait..." while the human stirs
function drawPrompt(ctx: CanvasRenderingContext2D) {
  const x = game.ghostX
  const y = game.ghostY - 46 + Math.sin(game.time * 3) * 4

  if (game.humanState === 'stirring') {
    ctx.fillStyle = LAVENDER
    ctx.font = 'italic 600 14px "Segoe UI", system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('wait...', x, y)
    return
  }

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
  // puff up wide and short when squeaking
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

  // body, with three hem points that sway out of step
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

  // eyes look where it's going
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

  // moonlight from the window, slowly shimmering
  ctx.fillStyle = `rgba(214, 228, 255, ${0.07 + Math.sin(game.time * 1.3) * 0.02})`
  ctx.beginPath()
  ctx.moveTo(250, 255)
  ctx.lineTo(380, 255)
  ctx.lineTo(610, HEIGHT)
  ctx.lineTo(370, HEIGHT)
  ctx.closePath()
  ctx.fill()

  drawBed(ctx)
  drawZs(ctx)
}

function drawWindow(ctx: CanvasRenderingContext2D) {
  rect(ctx, SLATE, 240, 60, 150, 195)
  rect(ctx, SKY, 250, 70, 130, 175)

  for (const [x, y] of [[268, 95], [300, 190], [360, 210], [275, 160]]) {
    rect(ctx, MOON, x, y, 2, 2)
  }
  circle(ctx, MOON, 340, 115, 22)
  circle(ctx, SKY, 351, 107, 19)

  rect(ctx, SLATE, 312, 70, 6, 175)
  rect(ctx, SLATE, 250, 155, 130, 6)
  rect(ctx, SLATE_LIGHT, 230, 250, 170, 10)
}

function drawRug(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = INDIGO
  ctx.beginPath()
  ctx.ellipse(330, 470, 160, 30, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = SLATE
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.ellipse(330, 470, 130, 21, 0, 0, Math.PI * 2)
  ctx.stroke()
}

function drawShelf(ctx: CanvasRenderingContext2D) {
  rect(ctx, INDIGO, 40, 110, 140, 280)
  rect(ctx, SHADOW, 50, 120, 120, 260)
  rect(ctx, INDIGO_LIGHT, 40, 104, 140, 8)

  for (const y of [180, 260, 330]) {
    rect(ctx, INDIGO_LIGHT, 50, y, 120, 8)
  }

  // books
  rect(ctx, SLATE, 56, 210, 14, 50)
  rect(ctx, SLATE_LIGHT, 72, 220, 12, 40)
  rect(ctx, BLANKET, 86, 205, 16, 55)
  rect(ctx, SLATE, 104, 225, 10, 35)
  rect(ctx, SLATE_LIGHT, 120, 288, 18, 42)
  rect(ctx, BLANKET, 140, 296, 14, 34)
  rect(ctx, SLATE, 60, 350, 50, 30)
}

function drawNightstand(ctx: CanvasRenderingContext2D) {
  rect(ctx, INDIGO, 450, 316, 90, 74)
  rect(ctx, INDIGO_LIGHT, 444, 308, 102, 10)
  rect(ctx, SHADOW, 458, 334, 74, 3)
  circle(ctx, SLATE_LIGHT, 495, 352, 4)
}

function drawLamp(ctx: CanvasRenderingContext2D) {
  // blinks on and off unevenly while flickering
  const lampOn = game.lampFlicker > 0 && Math.sin(game.lampFlicker * 30) > -0.2

  if (lampOn) {
    circle(ctx, 'rgba(255, 217, 122, 0.12)', LAMP_X, LAMP_Y + 20, 130)
    ctx.fillStyle = 'rgba(255, 217, 122, 0.25)'
    ctx.beginPath()
    ctx.moveTo(470, 260)
    ctx.lineTo(520, 260)
    ctx.lineTo(546, 308)
    ctx.lineTo(444, 308)
    ctx.closePath()
    ctx.fill()
  }

  rect(ctx, SLATE, 480, 298, 30, 10)
  rect(ctx, SLATE, 493, 258, 4, 40)
  ctx.fillStyle = lampOn ? LAMP_LIGHT : SLATE_LIGHT
  ctx.beginPath()
  ctx.moveTo(468, 260)
  ctx.lineTo(522, 260)
  ctx.lineTo(510, 226)
  ctx.lineTo(480, 226)
  ctx.closePath()
  ctx.fill()
}

function drawBed(ctx: CanvasRenderingContext2D) {
  const stirring = game.humanState === 'stirring'
  // slow breathing when asleep, restless tossing when stirring
  const breath = stirring ? Math.sin(game.time * 14) * 3 : Math.sin(game.time * 1.6) * 3
  const toss = stirring ? Math.sin(game.time * 7) * 4 : 0

  rect(ctx, INDIGO, 900, 190, 45, 205)
  rect(ctx, INDIGO_LIGHT, 900, 184, 45, 10)
  rect(ctx, INDIGO, 580, 270, 35, 125)
  rect(ctx, INDIGO_LIGHT, 580, 264, 35, 10)
  rect(ctx, INDIGO, 590, 340, 315, 40)
  rect(ctx, SHADOW, 610, 380, 12, 14)
  rect(ctx, SHADOW, 880, 380, 12, 14)
  rect(ctx, SLATE_LIGHT, 615, 302, 285, 40)

  ctx.fillStyle = '#a6b0d2'
  ctx.beginPath()
  ctx.roundRect(830, 280, 66, 26, 12)
  ctx.fill()

  circle(ctx, HAIR, 858 + toss, 279, 21)
  circle(ctx, SKIN, 846 + toss, 286, 19)
  ctx.strokeStyle = HAIR
  ctx.lineWidth = 2
  ctx.beginPath()
  if (stirring) {
    // scrunched up eyes and a grumpy little mouth
    ctx.moveTo(832 + toss, 285)
    ctx.lineTo(841 + toss, 282)
    ctx.moveTo(829 + toss, 295)
    ctx.lineTo(836 + toss, 294)
    ctx.stroke()

    ctx.fillStyle = MOON
    ctx.font = '900 26px "Segoe UI", system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('!', 846, 238)
  } else if (game.humanState === 'awake') {
    // eyes wide open, not impressed
    ctx.moveTo(829, 295)
    ctx.lineTo(837, 295)
    ctx.stroke()
    circle(ctx, HAIR, 834, 284, 2.5)
    circle(ctx, HAIR, 843, 283, 2.5)
  } else {
    // closed eyes and a snoring mouth
    ctx.arc(837, 283, 4, 0.2, Math.PI - 0.2)
    ctx.stroke()
    circle(ctx, HAIR, 832, 294, 2.5 + breath * 0.3)
  }

  ctx.fillStyle = BLANKET
  ctx.beginPath()
  ctx.moveTo(612, 352)
  ctx.lineTo(612, 305)
  ctx.quadraticCurveTo(650, 284 - breath, 700, 290 - breath)
  ctx.quadraticCurveTo(765, 268 - breath * 1.5, 830, 298)
  ctx.lineTo(832, 352)
  ctx.closePath()
  ctx.fill()
  rect(ctx, SLATE_LIGHT, 812, 296, 20, 56)
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
