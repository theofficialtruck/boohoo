import { game, interact, keys, squeak, startGame, nextNight, update, END_DELAY, NIGHTS } from './game'
import { draw } from './draw'

const canvas = document.querySelector<HTMLCanvasElement>('#screen')!
const ctx = canvas.getContext('2d')!
const menuButton = document.querySelector<HTMLButtonElement>('#start')!

// the one button does whatever the current screen needs
function pressMenu() {
  if (game.screen === 'title') {
    game.screen = 'instructions'
  } else if (game.screen === 'instructions') {
    startGame()
  } else if (endingDone() && game.screen === 'won') {
    nextNight()
  } else if (endingDone()) {
    startGame()
  }
}

// let the ending play out before offering another go
function endingDone() {
  return (game.screen === 'won' || game.screen === 'lost') && game.endTimer > END_DELAY
}

// show the button with the right label, or hide it while playing
function updateMenuButton() {
  let label = ''
  if (game.screen === 'title') label = 'Start'
  if (game.screen === 'instructions') label = 'Play'
  if (endingDone()) label = 'Try again'
  
  if (endingDone() && game.screen === 'won') {
    label = game.night < NIGHTS.length ? 'Next night' : 'Play again'
  }

  menuButton.hidden = label === ''
  if (menuButton.textContent !== label) {
    menuButton.textContent = label
  }
}

menuButton.addEventListener('click', () => {
  pressMenu()
  // otherwise Enter would "click" it again next time
  menuButton.blur()
})

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true

  if (e.key === 'Enter' && !e.repeat && game.screen !== 'playing') {
    pressMenu()
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
  updateMenuButton()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
