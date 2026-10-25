function play(file: string, volume = 0.6) {
  const sound = new Audio('sounds/' + file)
  sound.volume = volume
  sound.play().catch(() => {})
}

export function playSqueak() {
  play('squeak.ogg', 1)
}

export function playScream() {
  play('scream.ogg', 0.5)
}

export function playLamp() {
  play('lamp.ogg')
}

export function playThud() {
  play('thud.ogg')
}

export function playRattle() {
  play('rattle.ogg')
}

export function playRoll() {
  play('roll.ogg', 0.5)
}

export function playCombo() {
  play('combo.ogg', 0.5)
}

export function playWake() {
  play('wake.ogg', 0.5)
}

export function playSunrise() {
  play('sunrise.ogg', 0.5)
}
