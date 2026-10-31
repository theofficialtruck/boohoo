import { game, interact, keys, squeak, startGame, nextNight, update, END_DELAY, NIGHTS, skipNight, loadProgress } from './game'
import { draw } from './draw'

const canvas = document.querySelector<HTMLCanvasElement>('#screen')!
const ctx = canvas.getContext('2d')!
const menuButton = document.querySelector<HTMLButtonElement>('#start')!
const restartButton = document.querySelector<HTMLButtonElement>('#restart')!
const pauseButton = document.querySelector<HTMLButtonElement>('#pause')!
const pauseMenu = document.querySelector<HTMLDivElement>('#pauseMenu')!
const nightList = document.querySelector<HTMLDivElement>('#nightList')!

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
function updateMenuButton() { //
  let label = ''
  if (game.screen === 'title') label = 'Start'
  if (game.screen === 'instructions') label = game.night > 1 ? 'Play night ' + game.night : 'Play'
  if (endingDone()) label = 'Try again'
  
  if (endingDone() && game.screen === 'won') {
    label = game.night < NIGHTS.length ? 'Next night' : 'Replay night 10'
    if (game.night === 0) label = 'Start the game'
  }

  menuButton.hidden = label === ''
  if (menuButton.textContent !== label) {
    menuButton.textContent = label
  }

  restartButton.hidden = !((endingDone() && game.screen === 'won') || game.screen === 'instructions')
  let restartLabel = game.night < NIGHTS.length ? 'Try again' : 'Back to night 1'
  if (game.screen === 'instructions') restartLabel = 'Tutorial'
  if (restartButton.textContent !== restartLabel) {
    restartButton.textContent = restartLabel
  }

  pauseButton.hidden = game.screen !== 'playing'
}

menuButton.addEventListener('click', () => {
  pressMenu()
  // otherwise Enter would "click" it again next time
  menuButton.blur()
})

restartButton.addEventListener('click', () => {
  if (game.screen === 'instructions') {
    game.night = 0
  } else if (game.night === NIGHTS.length) {
    game.night = 1
  }
  startGame()
  restartButton.blur()
})

function openPause() {
  game.paused = true
  pauseMenu.hidden = false

  nightList.innerHTML = ''
  if (game.best === 0) {
    nightList.textContent = 'none yet'
  }
  for (let night = 1; night <= game.best; night++) {
    const button = document.createElement('button')
    button.textContent = String(night)
    button.addEventListener('click', () => {
      playNight(night)
    })
    nightList.appendChild(button)
  }
}

function closePause() {
  game.paused = false
  pauseMenu.hidden = true
}

function togglePause() {
  if (game.paused) {
    closePause()
  } else {
    openPause()
  }
}

function playNight(night: number) {
  closePause()
  game.night = night
  startGame()
}

pauseButton.addEventListener('click', () => {
  togglePause()
  pauseButton.blur()
})

document.querySelector('#continue')!.addEventListener('click', closePause)
document.querySelector('#retry')!.addEventListener('click', () => playNight(game.night))
document.querySelector('#restartAll')!.addEventListener('click', () => playNight(1))

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true

  if (e.key === 'Enter' && !e.repeat && game.screen !== 'playing') {
    pressMenu()
  }

  if (e.key === 'Escape' && !e.repeat && game.screen === 'playing') {
    togglePause()
  }

  // e.repeat is true while the key is held, so one press means one action
  if (e.key.toLowerCase() === 'e' && !e.repeat && game.screen === 'playing' && !game.paused) {
    interact()
  }

  if (e.key.toLowerCase() === 'q' && !e.repeat && game.screen === 'playing' && !game.paused) {
    squeak()
  }

  if (e.key === '`' && !e.repeat) {
    game.devMenu = !game.devMenu
  }

  if (game.devMenu && e.key === '1' && !e.repeat) {
    skipNight()
  }

  if (game.devMenu && e.key === '2' && !e.repeat) {
    game.noLimits = !game.noLimits
  }

  if (game.devMenu && e.key === '3' && !e.repeat) {
    const night = Number(prompt('Go to which night? (1-10)'))
    if (night >= 1 && night <= NIGHTS.length) {
      game.night = Math.floor(night)
      startGame()
    }
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

loadProgress()
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
