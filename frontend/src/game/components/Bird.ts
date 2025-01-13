export class Bird {
    private floatSprite: HTMLImageElement;
    private jumpSprite: HTMLImageElement;
    private hitSprite: HTMLImageElement;
    private frameWidth: number = 64; // 256/4 for jump animation
    private currentFrame: number = 0;
    private isJumping: boolean = false;
    private animationSpeed: number = 100; // milliseconds
    private lastFrameTime: number = 0;
    
    public x: number;
    public y: number;
    public width: number = 100;  // Increased size for all sprites
    public height: number = 100; // Increased size for all sprites
    public velocity: number = 0;
    public gravity: number = 0.12;
    public jumpForce: number = -18; // Keep the high jump
    private maxVelocity: number = 4;
    
    constructor(
        floatSprite: HTMLImageElement,
        jumpSprite: HTMLImageElement,
        hitSprite: HTMLImageElement,
        x: number,
        y: number
    ) {
        this.floatSprite = floatSprite;
        this.jumpSprite = jumpSprite;
        this.hitSprite = hitSprite;
        this.x = x;
        this.y = y;
    }

    public jump(): void {
        this.velocity = -18;
    }

    public update(deltaTime: number): void {
        // Physics with proper deltaTime scaling
        this.velocity += this.gravity;
        this.y += this.velocity;

        // Clamp velocity
        this.velocity = Math.min(Math.max(this.velocity, -this.maxVelocity), this.maxVelocity);

        // Animation logic
        if (this.isJumping) {
            const now = performance.now();
            const elapsed = now - this.lastFrameTime;
            
            if (elapsed >= this.animationSpeed) {
                this.lastFrameTime = now;
                this.currentFrame++;
                
                if (this.currentFrame >= 4) {
                    this.currentFrame = 0;
                    this.isJumping = false;
                }
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // Draw the bird sprite as normal
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.velocity * 0.04);

        // Draw the sprite (always use normal sprite)
        const sprite = this.isJumping ? this.jumpSprite : this.floatSprite;
        ctx.drawImage(
            sprite,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );

        ctx.restore();
    }
} 