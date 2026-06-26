import { Vector2 } from '../utils/Vector2';

export class Asteroid {
  public position: Vector2;
  public velocity: Vector2;
  public radius: number;
  public rotation: number = 0;
  private rotationSpeed: number;
  private vertices: number[] = [];
  public health: number;
  public maxHealth: number;
  public resourceType: string;
  public resourceYield: number;

  constructor(x: number, y: number, radius: number) {
    this.position = new Vector2(x, y);
    
    // Random drift
    const speed = Math.random() * 20 + 5;
    const angle = Math.random() * Math.PI * 2;
    this.velocity = new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed);
    
    this.radius = radius;
    this.rotationSpeed = (Math.random() - 0.5) * 2; // -1 to 1 rad/s
    
    this.maxHealth = radius * 2;
    this.health = this.maxHealth;

    // Determine resources based on size/randomness
    const types = ['Iron', 'Titanium', 'Crystal', 'Gold'];
    this.resourceType = types[Math.floor(Math.random() * types.length)];
    this.resourceYield = Math.floor(radius / 5);

    this.generateShape();
  }

  private generateShape() {
    const numPoints = Math.floor(Math.random() * 4) + 6; // 6 to 9 points
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      // Random variance in radius
      const r = this.radius * (0.8 + Math.random() * 0.4); 
      this.vertices.push(Math.cos(angle) * r);
      this.vertices.push(Math.sin(angle) * r);
    }
  }

  public update(dt: number) {
    this.position = this.position.add(this.velocity.mult(dt));
    this.rotation += this.rotationSpeed * dt;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);

    // Styling based on resource type
    ctx.lineWidth = 2;
    ctx.fillStyle = '#020617'; // Background color
    ctx.shadowBlur = 10;
    
    switch (this.resourceType) {
      case 'Iron':
        ctx.strokeStyle = '#9ca3af'; // Gray
        ctx.shadowColor = '#9ca3af';
        break;
      case 'Titanium':
        ctx.strokeStyle = '#3b82f6'; // Blue
        ctx.shadowColor = '#3b82f6';
        break;
      case 'Crystal':
        ctx.strokeStyle = '#d946ef'; // Fuchsia
        ctx.shadowColor = '#d946ef';
        break;
      case 'Gold':
        ctx.strokeStyle = '#fbbf24'; // Gold/Amber
        ctx.shadowColor = '#fbbf24';
        break;
      default:
        ctx.strokeStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
    }

    ctx.beginPath();
    ctx.moveTo(this.vertices[0], this.vertices[1]);
    for (let i = 2; i < this.vertices.length; i += 2) {
      ctx.lineTo(this.vertices[i], this.vertices[i + 1]);
    }
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();

    // Draw health bar if damaged
    if (this.health < this.maxHealth) {
      ctx.rotate(-this.rotation); // un-rotate to draw health bar horizontally
      const barWidth = this.radius;
      const barHeight = 4;
      ctx.fillStyle = '#ef4444'; // Red
      ctx.fillRect(-barWidth / 2, -this.radius - 15, barWidth, barHeight);
      ctx.fillStyle = '#10b981'; // Green
      ctx.fillRect(-barWidth / 2, -this.radius - 15, barWidth * (this.health / this.maxHealth), barHeight);
    }

    ctx.restore();
  }
}
