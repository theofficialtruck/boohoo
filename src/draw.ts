import { game } from './game'

export const WIDTH = 960
export const HEIGHT = 540

const NIGHT = '#151b3d'
const FLOOR = '#0f1431'
const INDIGO = '#2b3068'
const MOON = '#d6e4ff'
const LAVENDER = '#c9b8f7'

export function draw(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = NIGHT
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  ctx.fillStyle = FLOOR
  ctx.fillRect(0, 400, WIDTH, HEIGHT - 400)

  if (game.screen === 'title') {
    drawTitle(ctx)
  }
}

function drawTitle(ctx: CanvasRenderingContext2D) {
  // crescent moon: a full circle with a night-colored circle over it
  ctx.fillStyle = MOON
  ctx.beginPath()
  ctx.arc(790, 105, 44, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = NIGHT
  ctx.beginPath()
  ctx.arc(810, 92, 38, 0, Math.PI * 2)
  ctx.fill()

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
