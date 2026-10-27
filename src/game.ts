import {playCombo, playLamp, playRattle, playRoll, playScream, playSqueak, playSunrise, playThud, playWake,} from './sound'

export const WIDTH = 960
export const HEIGHT = 540
const GHOST_SPEED = 130
const SPRINT_SPEED = 260
const REACH = 60

// detection goes from 0 to 100, and at 100 they wake up
const ACTION_NOISE = 85
// below this line another action won't push it to 100
export const SAFE_DETECTION = 100 - ACTION_NOISE
const MESSAGE_TIME = 1.6
// how long an ending plays before you can try again
export const END_DELAY = 1.5

// the sleeper's face
export const HEAD_X = 852
export const HEAD_Y = 286

// middle of the lamp shade
export const LAMP_X = 495
export const LAMP_Y = 264

const TOY_FLOOR_Y = 425
export const BALL_Y = 458
export const BALL_RADIUS = 12

// each night is a little bit harder than the one before. 
// energy is how many scares you get, fade is how fast detection level decreases every second
// combo is the seconds needed to chain a combo, sprint is how fast the detection level increases from sprinting
// repeat is the many points you get for doing the same thing twice in a row
// sunrise is how many seconds until the sun comes up, 0 means no clock
export const NIGHTS = [
  { energy: 8, fade: 25, combo: 4, sprint: 20, repeat: 6, sunrise: 0 },
  { energy: 8, fade: 25, combo: 4, sprint: 20, repeat: 6, sunrise: 100 },
  { energy: 8, fade: 25, combo: 4, sprint: 20, repeat: 6, sunrise: 85 },
  { energy: 7, fade: 18, combo: 4, sprint: 20, repeat: 6, sunrise: 85 },
  { energy: 7, fade: 18, combo: 4, sprint: 20, repeat: 6, sunrise: 80 },
  { energy: 7, fade: 18, combo: 4, sprint: 20, repeat: 6, sunrise: 80 },
  { energy: 7, fade: 18, combo: 4, sprint: 20, repeat: 6, sunrise: 75 },
  { energy: 6, fade: 18, combo: 2.5, sprint: 30, repeat: 6, sunrise: 70 },
  { energy: 6, fade: 18, combo: 2.5, sprint: 30, repeat: 0, sunrise: 65 },
  { energy: 6, fade: 18, combo: 2.5, sprint: 30, repeat: 0, sunrise: 60 },
]

export const game = {
  screen: 'title', // 'title' | 'instructions' | 'playing' | 'won' | 'lost'
  night: 1, // 1 to 10
  timeLeft: 0, // seconds until sunrise
  loseReason: '', // 'too soon' | 'no energy' | 'out of time'
  endTimer: 0, // seconds since the round ended
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
  energy: 0,
  humanState: 'sleeping', // 'sleeping' | 'stirring' | 'awake' | 'scared'
  detection: 0,
  comboTimer: 0, // seconds left to chain a combo after they settle
  lastAction: '',

  message: '',
  messageTimer: 0,
}

export function currentNight() {
  return NIGHTS[game.night - 1]
}

export const keys: Record<string, boolean> = {}

export function startGame() {
  game.screen = 'playing'
  game.loseReason = ''
  game.endTimer = 0
  game.ghostX = 120
  game.ghostY = 240
  game.ghostLean = 0
  game.lampFlicker = 0

  game.toyState = 'shelf'
  game.toyX = 118
  game.toyY = 157
  game.toyVX = 0
  game.toyVY = 0
  game.toyAngle = 0
  game.toyWobble = 0

  game.ballX = 330
  game.ballSpeed = 0
  game.ballSpin = 0

  game.squeakTimer = 0

  game.scare = 0
  game.energy = currentNight().energy
  game.timeLeft = currentNight().sunrise
  game.humanState = 'sleeping'
  game.detection = 0
  game.comboTimer = 0
  game.lastAction = ''

  game.message = ''
  game.messageTimer = 0
}

export function nextNight() {
  if (game.night < NIGHTS.length) {
    game.night += 1
  }
  startGame()
}

function showMessage(text: string) {
  game.message = text
  game.messageTimer = MESSAGE_TIME
}

function wakeUpTooSoon() {
  playWake()
  game.humanState = 'awake'
  game.screen = 'lost'
  game.loseReason = 'too soon'
}

// every action that actually happens ends up here
function scareAction(name: string) {
  game.detection += ACTION_NOISE
  if (game.detection >= 100) {
    wakeUpTooSoon()
    return
  }

  let points = 13
  if (name === game.lastAction) {
    points = currentNight().repeat
    showMessage("They're getting used to that...")
  } else if (game.comboTimer > 0 && game.lastAction === 'lamp' && name === 'ball') {
    points += 15
    showMessage('Spooky combo!')
    playCombo()
  } else if (game.comboTimer > 0 && game.lastAction === 'toy' && name === 'squeak') {
    points += 15
    showMessage('Spooky combo!')
    playCombo()
  }

  game.scare = Math.min(100, game.scare + points)
  game.energy -= 1
  game.lastAction = name
  game.humanState = 'stirring'
  game.comboTimer = 0
}

function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x2 - x1, y2 - y1)
}

export function nearbyObject() {
  // the bed only matters once the meter is full
  if (game.scare >= 100 && distance(game.ghostX, game.ghostY, HEAD_X, HEAD_Y - 20) < REACH + 10) {
    return 'bed'
  }
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
  const thing = nearbyObject()

  // the final scare is free, but still has to wait for them to settle
  if (thing === 'bed') {
    if (game.humanState === 'stirring') {
      wakeUpTooSoon()
    } else {
      playScream()
      game.humanState = 'scared'
      game.screen = 'won'
    }
    return
  }

  if (game.energy <= 0) {
    return
  }

  if (thing === 'lamp' && game.lampFlicker <= 0) {
    game.lampFlicker = 1.2
    playLamp()
    scareAction('lamp')
  }

  if (thing === 'toy') {
    if (game.toyState === 'shelf') {
      // little hop off the edge, then gravity does the rest
      game.toyState = 'falling'
      game.toyVX = 45
      game.toyVY = -150
      scareAction('toy')
    } else if (game.toyState === 'floor' && game.toyWobble <= 0) {
      game.toyWobble = 0.8
      playRattle()
      scareAction('toy')
    }
  }

  if (thing === 'ball' && game.ballSpeed === 0) {
    // push the ball away from the ghost
    game.ballSpeed = game.ghostX <= game.ballX ? 300 : -300
    playRoll()
    scareAction('ball')
  }
}

export function squeak() {
  if (game.energy <= 0) {
    return
  }

  if (game.squeakTimer <= 0) {
    game.squeakTimer = 0.7
    playSqueak()
    scareAction('squeak')
  }
}

export function update(dt: number) {
  game.time += dt

  if (game.screen === 'title' || game.screen === 'instructions') {
    return
  }

  if (game.screen === 'won' || game.screen === 'lost') {
    game.endTimer += dt
  }

  // objects keep animating after the round ends so nothing freezes mid air
  if (game.lampFlicker > 0) {
    game.lampFlicker -= dt
  }
  if (game.toyWobble > 0) {
    game.toyWobble -= dt
  }
  if (game.squeakTimer > 0) {
    game.squeakTimer -= dt
  }
  if (game.messageTimer > 0) {
    game.messageTimer -= dt
  }
  if (game.comboTimer > 0) {
    game.comboTimer -= dt
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
      playThud()
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

  // the rest only happens while the round is still going
  if (game.screen !== 'playing') {
    return
  }

  if (currentNight().sunrise > 0) {
    game.timeLeft -= dt
    if (game.timeLeft <= 0) {
      game.timeLeft = 0
      game.humanState = 'sleeping'
      game.screen = 'lost'
      game.loseReason = 'out of time'
      playSunrise()
      return
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

  const sprinting = keys['shift'] && (dx !== 0 || dy !== 0)
  const speed = sprinting ? SPRINT_SPEED : GHOST_SPEED
  game.ghostX += dx * speed * dt
  game.ghostY += dy * speed * dt

  // keep the ghost in the room
  game.ghostX = Math.max(16, Math.min(WIDTH - 16, game.ghostX))
  game.ghostY = Math.max(28, Math.min(HEIGHT - 22, game.ghostY))

  // lean into the movement, then ease back upright
  game.ghostLean += (dx * 0.25 - game.ghostLean) * Math.min(dt * 8, 1)

  // sprinting is noisy, otherwise the noise slowly fades
  if (sprinting) {
    game.detection += currentNight().sprint * dt
  } else {
    game.detection = Math.max(0, game.detection - currentNight().fade * dt)
  }

  if (game.detection >= 100) {
    wakeUpTooSoon()
  } else if (game.humanState === 'sleeping' && game.detection >= SAFE_DETECTION) {
    game.humanState = 'stirring'
  } else if (game.humanState === 'stirring' && game.detection < SAFE_DETECTION) {
    game.humanState = 'sleeping'
    game.comboTimer = currentNight().combo

    // out of actions and the meter isn't full, so the night is over
    if (game.energy <= 0 && game.scare < 100) {
      game.screen = 'lost'
      game.loseReason = 'no energy'
      playSunrise()
    }
  }
}
