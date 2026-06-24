import { Vector2 } from '../utils/Vector2';
import { InputManager } from '../engine/InputManager';

interface Particle {
  pos: Vector2;
  vel: Vector2;
  life: number;
  maxLife: number;
  color: string;
}

export class Player {
  public position: Vector2;
  public velocity: Vector2;
  public acceleration: Vector2;
  public rotation: number = 0;

  private topSpeed: number = 500; // pixels per second
  private thrustPower: number = 800;
  private rotationSpeed: number = Math.PI * 1.5; // rad per second
  private friction: number = 0.98; // applied per frame, could be time based

  private engineParticles: Particle[] = [];

  constructor(x: number, y: number) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);
    this.acceleration = new Vector2(0, 0);
  }

  public update(dt: number, input: InputManager) {
    // Rotation
    if (input.isKeyDown('KeyA') || input.isKeyDown('ArrowLeft')) {
      this.rotation -= this.rotationSpeed * dt;
    }
    if (input.isKeyDown('KeyD') || input.isKeyDown('ArrowRight')) {
      this.rotation += this.rotationSpeed * dt;
    }

    // Thrust
    this.acceleration = new Vector2(0, 0);
    let isThrusting = false;
    
    if (input.isKeyDown('KeyW') || input.isKeyDown('ArrowUp')) {
      const thrust = new Vector2(Math.cos(this.rotation), Math.sin(this.rotation));
      this.acceleration = thrust.mult(this.thrustPower);
      isThrusting = true;
    }

    // Apply Boost
    if (isThrusting && input.isKeyDown('Space')) {
      this.acceleration = this.acceleration.mult(2);
    }

    // Physics integration
    this.velocity = this.velocity.add(this.acceleration.mult(dt));
    
    // Apply friction (space drifting)
    this.velocity = this.velocity.mult(Math.pow(this.friction, dt * 60)); 
    this.velocity = this.velocity.limit(input.isKeyDown('Space') ? this.topSpeed * 1.5 : this.topSpeed);

    this.position = this.position.add(this.velocity.mult(dt));

    // Particle logic
    if (isThrusting) {
      this.emitEngineParticles();
    }
    this.updateParticles(dt);
  }

  private emitEngineParticles() {
    // Emit from the back of the ship
    const backX = this.position.x - Math.cos(this.rotation) * 15;
    const backY = this.position.y - Math.sin(this.rotation) * 15;
    
    // Spread angle slightly
    const angle = this.rotation + Math.PI + (Math.random() - 0.5) * 0.5;
    const speed = 100 + Math.random() * 100;

    this.engineParticles.push({
      pos: new Vector2(backX, backY),
      vel: new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed),
      life: 0.5 + Math.random() * 0.3,
      maxLife: 0.8,
      color: `hsla(190, 100%, 60%, 1)` // Cyan-ish
    });
  }

  private updateParticles(dt: number) {
    for (let i = this.engineParticles.length - 1; i >= 0; i--) {
      const p = this.engineParticles[i];
      p.pos = p.pos.add(p.vel.mult(dt));
      p.life -= dt;
      if (p.life <= 0) {
        this.engineParticles.splice(i, 1);
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    // Draw Particles
    ctx.save();
    for (const p of this.engineParticles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, 2 + alpha * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Draw Ship
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);

    // Modern geometric ship with glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#4F46E5';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#020617';

    ctx.beginPath();
    ctx.moveTo(20, 0); // Nose
    ctx.lineTo(-15, 15); // Right Wing
    ctx.lineTo(-10, 0); // Back center
    ctx.lineTo(-15, -15); // Left Wing
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();

    // Draw cockpit/core
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#06B6D4';
    ctx.fillStyle = '#06B6D4';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
