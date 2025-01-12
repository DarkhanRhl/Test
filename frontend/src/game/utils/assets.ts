// Import all assets using Vite's import.meta.url
const assetPath = (path: string) => new URL(`../../assets/${path}`, import.meta.url).href;

export const ASSETS = {
  bird: {
    floatingFall: assetPath('bird/floating_fall.png'),
    jump: assetPath('bird/jump.png'),
    wallHit: assetPath('bird/wall_hit.png'),
  },
  background: {
    grayColumn: assetPath('background/gray_column.png'),
    ground: assetPath('background/ground.png'),
    bg: assetPath('background/bg-1.png'),
  }
}; 