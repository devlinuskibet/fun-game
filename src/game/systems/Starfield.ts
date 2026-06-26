import { Vector2 } from '../utils/Vector2';

interface Star {
  pos: Vector2;
  size: number;
  alpha: number;
  parallaxDepth: number; // 0 to 1, where 1 is furthest back (moves slowest)
  color?: string;
}

export class Starfield {
  private stars: Star[] = [];
  private width: number;
  private height: number;

  constructor(width: number, height: number, numStars: number = 200) {
    this.width = width;
    this.height = height;
    this.generateStars(numStars);
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    // We could regenerate or just let stars wrap around the new bounds
  }

  private generateStars(numStars: number) {
    for (let i = 0; i < numStars; i++) {
      this.stars.push({
        pos: new Vector2(Math.random() * this.width, Math.random() * this.height),
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        parallaxDepth: Math.random(),
        color: Math.random() > 0.9 ? '#bfdbfe' : '#ffffff',
      });
    }
  }

  public draw(ctx: CanvasRenderingContext2D, cameraPos: Vector2) {
    ctx.save();
    ctx.fillStyle = '#ffffff';

    for (const star of this.stars) {
      // Calculate position with parallax effect relative to camera
      // Parallax depth 1 means it moves very little (far away)
      // Parallax depth 0 means it moves a lot (close)
      const parallaxFactor = star.parallaxDepth * 0.8; 
      
      let x = star.pos.x - (cameraPos.x * parallaxFactor);
      let y = star.pos.y - (cameraPos.y * parallaxFactor);

      // Wrap around screen bounds so we have infinite stars
      x = ((x % this.width) + this.width) % this.width;
      y = ((y % this.height) + this.height) % this.height;

      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = star.color || '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
