import { useEffect, useState } from 'react';

export const useGameDimensions = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Use the full viewport height and maintain aspect ratio
      const gameWidth = Math.min(width, height * (2/3));
      const gameHeight = height;
      setDimensions({ 
        width: gameWidth,
        height: gameHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return dimensions;
}; 