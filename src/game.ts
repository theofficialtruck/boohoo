export const game = {
  screen: 'title', // 'title' | 'playing'
  time: 0,
}

export function startGame() {
  game.screen = 'playing'
}

export function update(dt: number) {
  game.time += dt
}
