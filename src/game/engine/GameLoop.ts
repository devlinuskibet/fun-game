import { InputManager } from './InputManager';
import { Player } from '../entities/Player';
import { Starfield } from '../systems/Starfield';
import { Vector2 } from '../utils/Vector2';

export class GameLoop {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number = 0;
  private lastTime: number = 0;
  
  private inputManager: InputManager;
  private player: Player;
  private starfield: Starfield;

  // Camera focuses on player
  private cameraPos: Vector2;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error("Could not get 2D context");
    this.ctx = context;

    this.inputManager = new InputManager();
    
    // Spawn player at origin
    this.player = new Player(0, 0);
    this.cameraPos = new Vector2(0, 0);

    this.starfield = new Starfield(canvas.width, canvas.height, 300);
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.starfield.resize(width, height);
  }

  public start() {
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop() {
    cancelAnimationFrame(this.animationFrameId);
    this.inputManager.destroy();
  }

  private loop = (time: number) => {
    // Delta time in seconds
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    // Cap dt to prevent huge jumps if tab is inactive
    const safeDt = Math.min(dt, 0.1);

    this.update(safeDt);
    this.draw();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    this.player.update(dt, this.inputManager);

    // Update Camera to follow player smoothly or exactly
    // Here we make camera center on player exactly
    this.cameraPos.x = this.player.position.x - this.canvas.width / 2;
    this.cameraPos.y = this.player.position.y - this.canvas.height / 2;
  }

  private draw() {
    // Clear background
    this.ctx.fillStyle = '#020617';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Starfield (uses cameraPos for parallax)
    this.starfield.draw(this.ctx, this.cameraPos);

    // Apply Camera Transform for game world entities
    this.ctx.save();
    this.ctx.translate(-this.cameraPos.x, -this.cameraPos.y);

    // Draw Player
    this.player.draw(this.ctx);

    this.ctx.restore();
  }
}
