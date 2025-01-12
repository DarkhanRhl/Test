'use client'

import { useEffect, useRef, useState } from 'react';
import { useGameDimensions } from '../hooks/useGameDimensions';
import { GameState, Score, GameAssets } from '../types';
import { Bird } from './Bird';
import { ScreenShake } from '../effects/ScreenShake';
import { ASSETS } from '../utils/assets';
import { Pipe } from './Pipe';

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const birdRef = useRef<Bird | null>(null);
  const dimensions = useGameDimensions();
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState<Score>({ current: 0, best: 0 });
  const scoreRef = useRef<Score>({ current: 0, best: 0 });
  const [assets, setAssets] = useState<GameAssets | null>(null);
  const pipesRef = useRef<Pipe[]>([]);
  const lastPipeSpawnTime = useRef(0);
  const currentPipeInterval = useRef(getRandomInterval());
  const groundScrollRef = useRef(0);
  const backgroundScrollRef = useRef(0);

  // Load assets
  useEffect(() => {
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          console.log(`Successfully loaded: ${src}`);
          resolve(img);
        };
        img.onerror = (e) => {
          console.error(`Failed to load image: ${src}`, e);
          reject(new Error(`Failed to load image: ${src}`));
        };
        img.src = src;
      });
    };

    Promise.all([
      loadImage(ASSETS.bird.floatingFall),
      loadImage(ASSETS.bird.jump),
      loadImage(ASSETS.bird.wallHit),
      loadImage(ASSETS.background.grayColumn),
      loadImage(ASSETS.background.ground),
      loadImage(ASSETS.background.bg),
    ]).then(([birdFloat, birdJump, wallHit, pipe, ground, background]) => {
      setAssets({
        birdFloat,
        birdJump,
        wallHit,
        pipe,
        ground,
        background
      });
    }).catch(error => {
      console.error('Failed to load assets:', error);
    });
  }, []);

  // Initialize game
  useEffect(() => {
    if (!canvasRef.current || !assets) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    // Set canvas size
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Initialize game objects
    birdRef.current = new Bird(
      assets.birdFloat,
      assets.birdJump,
      assets.wallHit,
      canvas.width / 3,
      canvas.height * 0.4  // Start higher up
    );
    
    const screenShake = new ScreenShake();

    // Game variables
    let animationFrameId: number;
    let lastTime = 0;

    // Game loop
    function gameLoop(timestamp: number) {
      const deltaTime = (timestamp - lastTime) / 16; // Normalize to ~60fps
      lastTime = timestamp;

      // Clear canvas
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update scroll positions (always scroll, even in menu)
      backgroundScrollRef.current -= 0.5; // Slowest
      groundScrollRef.current -= 2; // Same speed as pipes

      // Reset scroll positions when they go off screen
      if (backgroundScrollRef.current <= -canvas.width) backgroundScrollRef.current = 0;
      if (groundScrollRef.current <= -canvas.width) groundScrollRef.current = 0;

      // Draw scrolling background
      if (assets?.background) {
        // Draw background twice for seamless scrolling
        ctx.drawImage(
          assets.background,
          backgroundScrollRef.current,
          0,
          canvas.width,
          canvas.height
        );
        ctx.drawImage(
          assets.background,
          backgroundScrollRef.current + canvas.width,
          0,
          canvas.width,
          canvas.height
        );
      }

      // Apply screen shake
      ctx.save();
      const shake = screenShake.getOffset();
      ctx.translate(shake.x, shake.y);

      if (gameState === 'playing') {
        // Update bird and pipes only when playing
        if (birdRef.current) {
          birdRef.current.update(deltaTime);
        }

        // Update pipes with random intervals
        if (timestamp - lastPipeSpawnTime.current > currentPipeInterval.current) {
          pipesRef.current.push(new Pipe(assets!.pipe, canvas.width, canvas.height));
          lastPipeSpawnTime.current = timestamp;
          // Set new random interval for next pipe
          currentPipeInterval.current = getRandomInterval();
        }

        // Update and check collisions
        pipesRef.current = pipesRef.current.filter(pipe => {
          pipe.update();
          
          // Score update BEFORE collision check
          if (birdRef.current && !pipe.passed && pipe.checkPassed(birdRef.current)) {
              const newScore = scoreRef.current.current + 1;
              scoreRef.current = {
                  current: newScore,
                  best: Math.max(scoreRef.current.best, newScore)
              };
              setScore(scoreRef.current);
          }
          
          // Collision check after score update
          if (birdRef.current && pipe.checkCollision(birdRef.current, canvas.height)) {
              screenShake.trigger(15);
              setGameState('gameOver');
          }

          return pipe.x > -pipe.width;
        });
      }

      // Draw pipes
      pipesRef.current.forEach(pipe => pipe.draw(ctx));

      // Draw bird
      if (birdRef.current) {
        birdRef.current.draw(ctx, gameState === 'gameOver');
      }

      // Draw scrolling ground
      if (assets) {
        const groundHeight = 100;
        const groundY = canvas.height - groundHeight;
        
        // Draw ground twice for seamless scrolling
        ctx.drawImage(
          assets.ground,
          groundScrollRef.current,
          groundY,
          canvas.width,
          groundHeight
        );
        ctx.drawImage(
          assets.ground,
          groundScrollRef.current + canvas.width,
          groundY,
          canvas.width,
          groundHeight
        );

        // Ground collision check
        if (gameState === 'playing' && birdRef.current) {
          if (birdRef.current.y > groundY - birdRef.current.height / 2) {
            screenShake.trigger(15);
            setGameState('gameOver');
          }
        }
      }

      // Draw ground hitbox
      if (assets) {
        const groundHeight = 100;
        const groundY = canvas.height - groundHeight;
        
        // Draw ground hitbox
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            0,
            groundY,
            canvas.width,
            groundHeight
        );
      }

      ctx.restore();

      // Draw score
      if (gameState === 'playing' || gameState === 'gameOver') {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.font = 'bold 48px Arial';
        const scoreText = scoreRef.current.current.toString();
        const metrics = ctx.measureText(scoreText);
        const scoreX = canvas.width/2 - metrics.width/2;
        const scoreY = 80;
        
        // Draw text stroke
        ctx.strokeText(scoreText, scoreX, scoreY);
        // Draw text fill
        ctx.fillText(scoreText, scoreX, scoreY);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    }

    // Start game loop
    gameLoop(0);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions, assets, gameState]);

  // Handle interactions
  const handleInteraction = () => {
    if (gameState === 'menu') {
      // Reset everything
      pipesRef.current = [];
      lastPipeSpawnTime.current = 0;
      if (canvasRef.current && assets && birdRef.current) {
        birdRef.current.y = canvasRef.current.height * 0.4;
        birdRef.current.velocity = 0;
      }
      setGameState('playing');
    } else if (gameState === 'playing' && birdRef.current) {
      birdRef.current.jump();
    } else {
      // Game over reset
      pipesRef.current = [];
      lastPipeSpawnTime.current = 0;
      if (canvasRef.current && assets) {
        birdRef.current = new Bird(
          assets.birdFloat,
          assets.birdJump,
          assets.wallHit,
          canvasRef.current.width / 3,
          canvasRef.current.height * 0.4
        );
      }
      scoreRef.current = { ...scoreRef.current, current: 0 };
      setScore(scoreRef.current);
      setGameState('menu');
    }
  };

  // Add this function to get a random interval between 1.5 and 3 seconds
  function getRandomInterval(): number {
    return Math.random() * (3000 - 1500) + 1500; // Random between 1.5s and 3s
  }

  // Update scoreRef whenever score state changes
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  if (!assets) {
    return <div>Loading assets...</div>;
  }

  return (
    <div className="game-container" style={{ 
      width: '100vw', 
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      <canvas
        ref={canvasRef}
        onClick={handleInteraction}
        style={{
          touchAction: 'none',
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />
      {gameState !== 'playing' && (
        <div className="game-overlay" style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: 'white',
          fontSize: '24px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          {gameState === 'menu' ? (
            <div>Tap to Start</div>
          ) : (
            <>
              <div>Game Over</div>
              <div>Score: {score.current}</div>
              <div>Best: {score.best}</div>
              <div>Tap to Restart</div>
            </>
          )}
        </div>
      )}
    </div>
  );
} 