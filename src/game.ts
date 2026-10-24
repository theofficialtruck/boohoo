export const WIDTH = 960
export const HEIGHT = 540
const GHOST_SPEED = 130
const REACH = 60
const STIR_TIME = 3
export const START_ENERGY = 8

// middle of the lamp shade
export const LAMP_X = 495
export const LAMP_Y = 243

const TOY_FLOOR_Y = 425
export const BALL_Y = 458
export const BALL_RADIUS = 12

export const game = {
  screen: 'title', // 'title' | 'playing'
  time: 0,
  ghostX: 0,
  ghostY: 0,
  ghostLean: 0,
  lampFlicker: 0, // seconds of flickering left

  // the toy's x/y is the bottom of its feet
  toyState: 'shelf', // 'shelf' | 'falling' | 'floor'
  toyX: 0,
  toyY: 0,
  toyVX: 0,
  toyVY: 0,
  toyAngle: 0,
  toyWobble: 0,

  ballX: 0,
  ballSpeed: 0,
  ballSpin: 0,

  squeakTimer: 0,

  scare: 0, // 0 to 100
  energy: START_ENERGY,
  humanState: 'sleeping', // 'sleeping' | 'stirring'
  stirTimer: 0,
}

export const keys: Record<string, boolean> = {}

export function startGame() {
  game.screen = 'playing'
  game.ghostX = 120
  game.ghostY = 240
  game.ghostLean = 0
  game.lampFlicker = 0

  game.toyState = 'shelf'
  game.toyX = 110
  game.toyY = 104
  game.toyVX = 0
  game.toyVY = 0
  game.toyAngle = 0
  game.toyWobble = 0

  game.ballX = 330
  game.ballSpeed = 0
  game.ballSpin = 0

  game.squeakTimer = 0

  game.scare = 0
  game.energy = START_ENERGY
  game.humanState = 'sleeping'
  game.stirTimer = 0
}

// every action that actually happens ends up here
function scareAction() {
  game.scare = Math.min(100, game.scare + 15)
  game.energy -= 1
  game.humanState = 'stirring'
  game.stirTimer = STIR_TIME
}

function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x2 - x1, y2 - y1)
}

export function nearbyObject() {
  if (distance(game.ghostX, game.ghostY, LAMP_X, LAMP_Y) < REACH) {
    return 'lamp'
  }
  if (distance(game.ghostX, game.ghostY, game.toyX, game.toyY - 15) < REACH) {
    return 'toy'
  }
  if (distance(game.ghostX, game.ghostY, game.ballX, BALL_Y) < REACH) {
    return 'ball'
  }
  return ''
}

export function interact() {
  if (game.energy <= 0) {
    return
  }

  const thing = nearbyObject()

  if (thing === 'lamp' && game.lampFlicker <= 0) {
    game.lampFlicker = 1.2
    scareAction()
  }

  if (thing === 'toy') {
    if (game.toyState === 'shelf') {
      // little hop off the edge, then gravity does the rest
      game.toyState = 'falling'
      game.toyVX = 45
      game.toyVY = -150
      scareAction()
    } else if (game.toyState === 'floor' && game.toyWobble <= 0) {
      game.toyWobble = 0.8
      scareAction()
    }
  }

  if (thing === 'ball' && game.ballSpeed === 0) {
    // push the ball away from the ghost
    game.ballSpeed = game.ghostX <= game.ballX ? 300 : -300
    scareAction()
  }
}

export function squeak() {
  if (game.energy <= 0) {
    return
  }

  if (game.squeakTimer <= 0) {
    game.squeakTimer = 0.7
    scareAction()
  }
}

export function update(dt: number) {
  game.time += dt

  if (game.screen !== 'playing') {
    return
  }

  if (game.lampFlicker > 0) {
    game.lampFlicker -= dt
  }
  if (game.toyWobble > 0) {
    game.toyWobble -= dt
  }
  if (game.squeakTimer > 0) {
    game.squeakTimer -= dt
  }

  if (game.humanState === 'stirring') {
    game.stirTimer -= dt
    if (game.stirTimer <= 0) {
      game.humanState = 'sleeping'
    }
  }

  if (game.toyState === 'falling') {
    game.toyVY += 900 * dt
    game.toyX += game.toyVX * dt
    game.toyY += game.toyVY * dt
    game.toyAngle += 5 * dt

    if (game.toyY >= TOY_FLOOR_Y) {
      game.toyY = TOY_FLOOR_Y
      game.toyAngle = Math.PI / 2
      game.toyState = 'floor'
      game.toyWobble = 0.5
    }
  }

  if (game.ballSpeed !== 0) {
    game.ballX += game.ballSpeed * dt
    game.ballSpin += (game.ballSpeed * dt) / BALL_RADIUS
    game.ballSpeed -= game.ballSpeed * 1.4 * dt

    // bounce off the walls
    if (game.ballX < 20) {
      game.ballX = 20
      game.ballSpeed = -game.ballSpeed * 0.6
    }
    if (game.ballX > WIDTH - 20) {
      game.ballX = WIDTH - 20
      game.ballSpeed = -game.ballSpeed * 0.6
    }

    if (Math.abs(game.ballSpeed) < 8) {
      game.ballSpeed = 0
    }
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
