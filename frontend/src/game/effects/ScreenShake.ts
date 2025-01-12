export class ScreenShake {
    private intensity: number = 0;
    private decay: number = 0.9;
    private offsetX: number = 0;
    private offsetY: number = 0;

    public trigger(intensity: number = 15): void {
        this.intensity = intensity;
    }

    public update(): void {
        if (this.intensity > 0) {
            this.offsetX = (Math.random() - 0.5) * this.intensity;
            this.offsetY = (Math.random() - 0.5) * this.intensity;
            this.intensity *= this.decay;
            
            if (this.intensity < 0.5) {
                this.intensity = 0;
                this.offsetX = 0;
                this.offsetY = 0;
            }
        }
    }

    public getOffset(): { x: number; y: number } {
        return { x: this.offsetX, y: this.offsetY };
    }
} 