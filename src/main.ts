import { game, interact, keys, squeak, startGame, update } from './game'
import { draw } from './draw'

const canvas = document.querySelector<HTMLCanvasElement>('#screen')!
const ctx = canvas.getContext('2d')!
const startButton = document.querySelector<HTMLButtonElement>('#start')!

function start() {
  startGame()
  startButton.hidden = true
}

startButton.addEventListener('click', start)

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true

  if (e.key === 'Enter' && game.screen === 'title') {
    start()
  }

  // e.repeat is true while the key is held, so one press means one action
  if (e.key.toLowerCase() === 'e' && !e.repeat && game.screen === 'playing') {
    interact()
  }

  if (e.key.toLowerCase() === 'q' && !e.repeat && game.screen === 'playing') {
    squeak()
  }
})

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false
})

// otherwise a key held while switching windows stays stuck down
window.addEventListener('blur', () => {
  for (const key in keys) {
    keys[key] = false
  }
})

let lastTime = performance.now()

function loop(now: number) {
  // cap dt so coming back to the tab doesn't jump everything forward
  const dt = Math.min((now - lastTime) / 1000, 0.05)
  lastTime = now

  update(dt)
  draw(ctx)
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
