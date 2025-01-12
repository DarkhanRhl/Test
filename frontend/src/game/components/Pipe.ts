import { Bird } from './Bird';

export class Pipe {
    public x: number;
    public y: number = 0;
    public width: number = 80;
    public speed: number = 2;
    public passed: boolean = false;
    private sprite: HTMLImageElement;
    private gapY: number = 0;  // Y position of the gap center
    private static BIRD_HEIGHT = 100;
    private static GAP_SIZE = Pipe.BIRD_HEIGHT * 1.8; // Reduced from 4x to 2.5x bird height
    private static PIPE_HEIGHT = 500;  // Fixed height for the pipe sprite

    constructor(sprite: HTMLImageElement, canvasWidth: number, canvasHeight: number) {
        this.sprite = sprite;
        this.x = canvasWidth;

        const groundHeight = 100;
        const minGapY = Pipe.GAP_SIZE;  // Minimum gap position from top
        const maxGapY = canvasHeight - groundHeight - Pipe.GAP_SIZE;  // Maximum gap position from bottom
        
        // Set the gap position randomly between min and max
        this.gapY = Math.random() * (maxGapY - minGapY) + minGapY;
    }

    public update(): void {
        this.x -= this.speed;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const gapHalfSize = Pipe.GAP_SIZE / 2;
        
        // Draw top pipe (coming down from top)
        ctx.save();
        ctx.translate(this.x, this.gapY - gapHalfSize);  // Position at gap top
        ctx.rotate(Math.PI);  // Rotate to point downward
        ctx.drawImage(
            this.sprite,
            -this.width/2,  // Center horizontally
            0,              // Start at rotation point
            this.width,
            Pipe.PIPE_HEIGHT  // Use full pipe height
        );
        ctx.restore();

        // Draw bottom pipe (coming up from bottom)
        ctx.drawImage(
            this.sprite,
            this.x - this.width/2,  // Center horizontally
            this.gapY + gapHalfSize,  // Position at gap bottom
            this.width,
            Pipe.PIPE_HEIGHT  // Use full pipe height
        );

        // Draw hitboxes for debugging
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        
        // Top pipe hitbox
        ctx.strokeRect(
            this.x - this.width/2 + 15,
            0,
            this.width - 30,
            this.gapY - gapHalfSize
        );
        
        // Bottom pipe hitbox
        ctx.strokeRect(
            this.x - this.width/2 + 15,
            this.gapY + gapHalfSize,
            this.width - 30,
            ctx.canvas.height - (this.gapY + gapHalfSize)
        );
    }

    public checkCollision(bird: Bird, canvasHeight: number): boolean {
        const hitboxPadding = 15;
        const birdLeft = bird.x - bird.width/3;
        const birdRight = bird.x + bird.width/3;
        const birdTop = bird.y - bird.height/3;
        const birdBottom = bird.y + bird.height/3;

        const pipeLeft = this.x - this.width/2 + hitboxPadding;
        const pipeRight = this.x + this.width/2 - hitboxPadding;

        // Get gap boundaries
        const gapTop = this.gapY - Pipe.GAP_SIZE/2;
        const gapBottom = this.gapY + Pipe.GAP_SIZE/2;

        // Check if bird is within pipe x-bounds
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Check if bird is outside gap y-bounds
            if (birdTop < gapTop || birdBottom > gapBottom) {
                return true;
            }
        }

        return false;
    }

    public checkPassed(bird: Bird): boolean {
        // Check if bird has passed the pipe's center (not the edge)
        if (!this.passed && bird.x > this.x) {  // Changed from this.x + this.width/2
            this.passed = true;
            return true;
        }
        return false;
    }
} 