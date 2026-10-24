import { game, startGame, update } from './game'
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
  if (e.key === 'Enter' && game.screen === 'title') {
    start()
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
