import { game, WIDTH, HEIGHT } from './game'

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
    drawGhost(ctx, 130, 440, Math.sin(game.time) * 0.15, 2.4)
  }

  if (game.screen === 'playing') {
    drawGhost(ctx, game.ghostX, game.ghostY, game.ghostLean, 1)
  }
}

function drawGhost(ctx: CanvasRenderingContext2D, x: number, y: number, lean: number, size: number) {
  const t = game.time
  const bob = Math.sin(t * 3) * 4 * size
  const look = lean * 10

  ctx.save()
  ctx.translate(x, y + bob)
  ctx.rotate(lean)
  ctx.scale(size, size)

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
  circle(ctx, GHOST_EYE, look * 0.6, 6, 2)

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

  // lamp
  rect(ctx, SLATE, 480, 298, 30, 10)
  rect(ctx, SLATE, 493, 258, 4, 40)
  ctx.fillStyle = SLATE_LIGHT
  ctx.beginPath()
  ctx.moveTo(468, 260)
  ctx.lineTo(522, 260)
  ctx.lineTo(510, 226)
  ctx.lineTo(480, 226)
  ctx.closePath()
  ctx.fill()
}

function drawBed(ctx: CanvasRenderingContext2D) {
  const breath = Math.sin(game.time * 1.6) * 3

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

  circle(ctx, HAIR, 858, 279, 21)
  circle(ctx, SKIN, 846, 286, 19)
  // closed eyes and a snoring mouth
  ctx.strokeStyle = HAIR
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(837, 283, 4, 0.2, Math.PI - 0.2)
  ctx.stroke()
  circle(ctx, HAIR, 832, 294, 2.5 + breath * 0.3)

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
