export const WIDTH = 960
export const HEIGHT = 540
const GHOST_SPEED = 130

export const game = {
  screen: 'title', // 'title' | 'playing'
  time: 0,
  ghostX: 0,
  ghostY: 0,
  ghostLean: 0,
}

export const keys: Record<string, boolean> = {}

export function startGame() {
  game.screen = 'playing'
  game.ghostX = 120
  game.ghostY = 240
  game.ghostLean = 0
}

export function update(dt: number) {
  game.time += dt

  if (game.screen !== 'playing') {
    return
  }

  let dx = 0
  let dy = 0
  if (keys['arrowleft'] || keys['a']) dx -= 1
  if (keys['arrowright'] || keys['d']) dx += 1
  if (keys['arrowup'] || keys['w']) dy -= 1
  if (keys['arrowdown'] || keys['s']) dy += 1

  // don't go faster diagonally
  if (dx !== 0 && dy !== 0) {
    dx *= 0.7
    dy *= 0.7
  }

  game.ghostX += dx * GHOST_SPEED * dt
  game.ghostY += dy * GHOST_SPEED * dt

  // keep the ghost in the room
  game.ghostX = Math.max(16, Math.min(WIDTH - 16, game.ghostX))
  game.ghostY = Math.max(28, Math.min(HEIGHT - 22, game.ghostY))

  // lean into the movement, then ease back upright
  game.ghostLean += (dx * 0.25 - game.ghostLean) * Math.min(dt * 8, 1)
}
