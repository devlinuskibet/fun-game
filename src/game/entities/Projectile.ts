import { Vector2 } from '../utils/Vector2';

export class Projectile {
  public position: Vector2;
  public velocity: Vector2;
  public life: number = 2.0; // Seconds before it despawns
  public damage: number = 20;
  public radius: number = 3;

  constructor(x: number, y: number, angle: number, speed: number = 800) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  public update(dt: number) {
    this.position = this.position.add(this.velocity.mult(dt));
    this.life -= dt;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = '#06b6d4'; // Cyan
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#06b6d4';

    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
