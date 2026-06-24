import { Vector2 } from '../utils/Vector2';

export class Projectile {
  public position: Vector2;
  public velocity: Vector2;
  public life: number = 2.0; // Seconds before it despawns
  public damage: number = 20;
  public radius: number = 3;
  public isEnemy: boolean;

  constructor(x: number, y: number, angle: number, speed: number = 800, isEnemy: boolean = false) {
    this.position = new Vector2(x, y);
    this.isEnemy = isEnemy;
    
    let finalSpeed = speed;

    // Enemy projectiles are red, player's are cyan
    if (isEnemy) {
      this.damage = 10;
      finalSpeed = speed * 0.6; // slower
    }

    this.velocity = new Vector2(Math.cos(angle) * finalSpeed, Math.sin(angle) * finalSpeed);
  }

  public update(dt: number) {
    this.position = this.position.add(this.velocity.mult(dt));
    this.life -= dt;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    const color = this.isEnemy ? '#ef4444' : '#06b6d4';
    ctx.fillStyle = color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;

    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
