import { Vector2 } from '../utils/Vector2';

export class Enemy {
  public position: Vector2;
  public velocity: Vector2;
  public radius: number = 15;
  public health: number = 40;
  public maxHealth: number = 40;
  
  private speed: number = 150;
  private rotation: number = 0;
  
  private shootCooldown: number = 0;
  private shootRate: number = 1.5; // Shoots every 1.5 seconds

  constructor(x: number, y: number) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);
  }

  public update(dt: number, playerPos: Vector2, onShoot: (pos: Vector2, angle: number) => void) {
    // Basic AI: Chase Player
    const dir = playerPos.sub(this.position);
    const dist = dir.mag();
    
    if (dist > 0) {
      this.rotation = Math.atan2(dir.y, dir.x);
      
      // Stop moving if close enough to shoot, otherwise chase
      if (dist > 250) {
        this.velocity = dir.normalize().mult(this.speed);
      } else if (dist < 150) {
        // Back away if too close
        this.velocity = dir.normalize().mult(-this.speed * 0.5);
      } else {
        // Strafe or slow down
        this.velocity = this.velocity.mult(0.9);
      }
    }

    this.position = this.position.add(this.velocity.mult(dt));

    // Shooting AI
    if (this.shootCooldown > 0) {
      this.shootCooldown -= dt;
    }

    // Only shoot if within range and cooldown is ready
    if (dist < 400 && this.shootCooldown <= 0) {
      // Shoot towards player with slight inaccuracy
      const inaccuracy = (Math.random() - 0.5) * 0.2;
      const noseX = this.position.x + Math.cos(this.rotation) * this.radius;
      const noseY = this.position.y + Math.sin(this.rotation) * this.radius;
      onShoot(new Vector2(noseX, noseY), this.rotation + inaccuracy);
      this.shootCooldown = this.shootRate;
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);

    // Hostile Drone Styling
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ef4444'; // Red glow
    ctx.strokeStyle = '#ef4444';
    ctx.fillStyle = '#020617';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(15, 0); // Nose
    ctx.lineTo(-10, 15); // Right wing
    ctx.lineTo(-5, 0); // Center back
    ctx.lineTo(-10, -15); // Left wing
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    // Eye/Core
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#fca5a5';
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw health bar if damaged
    if (this.health < this.maxHealth) {
      ctx.rotate(-this.rotation); // un-rotate
      const barWidth = this.radius * 2;
      const barHeight = 4;
      ctx.fillStyle = '#9ca3af'; // Gray background
      ctx.fillRect(-barWidth / 2, -this.radius - 15, barWidth, barHeight);
      ctx.fillStyle = '#ef4444'; // Red health
      ctx.fillRect(-barWidth / 2, -this.radius - 15, barWidth * (this.health / this.maxHealth), barHeight);
    }

    ctx.restore();
  }
}
