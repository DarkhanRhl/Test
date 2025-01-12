export type GameState = 'menu' | 'playing' | 'gameOver';

export interface Score {
  current: number;
  best: number;
}

export interface GameAssets {
  birdFloat: HTMLImageElement;
  birdJump: HTMLImageElement;
  wallHit: HTMLImageElement;
  pipe: HTMLImageElement;
  ground: HTMLImageElement;
  background: HTMLImageElement;
} 