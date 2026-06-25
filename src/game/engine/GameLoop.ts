import { InputManager } from './InputManager';
import { Player } from '../entities/Player';
import { Asteroid } from '../entities/Asteroid';
import { Projectile } from '../entities/Projectile';
import { Enemy } from '../entities/Enemy';
import { Starfield } from '../systems/Starfield';
import { ProceduralGeneration } from '../systems/ProceduralGeneration';
import { ParticleSystem } from '../systems/ParticleSystem';
import { audioManager } from '../systems/AudioManager';
import { checkCircleCollision } from '../utils/Collision';
import { Vector2 } from '../utils/Vector2';
import { useGameStore } from '@/store/useGameStore';

export class GameLoop {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number = 0;
  private lastTime: number = 0;
  
  private inputManager: InputManager;
  private player: Player;
  private starfield: Starfield;
  
  private asteroids: Asteroid[] = [];
  private projectiles: Projectile[] = [];
  private enemies: Enemy[] = [];
  
  private proceduralGen: ProceduralGeneration;
  private particleSystem: ParticleSystem;

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
    this.proceduralGen = new ProceduralGeneration();
    this.particleSystem = new ParticleSystem();
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

  public reset() {
    this.player.position = new Vector2(0, 0);
    this.player.velocity = new Vector2(0, 0);
    this.player.acceleration = new Vector2(0, 0);
    this.player.rotation = 0;
    this.asteroids = [];
    this.projectiles = [];
    this.enemies = [];
    this.cameraPos = new Vector2(0, 0);
    this.particleSystem = new ParticleSystem();
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
    // If player is dead, skip updates
    const store = useGameStore.getState();
    if (store.stats.health <= 0) {
      if (store.gameState !== 'GAME_OVER') {
        if ((store.stats.score || 0) > (store.stats.highScore || 0)) store.updateStats({ highScore: store.stats.score });
        store.setGameState('GAME_OVER');
      }
      return;
    }

    const speedMult = store.stats.speedMultiplier ?? 1;
    const dmgMult = store.stats.damageMultiplier ?? 1;

    const worldMousePos = this.cameraPos.add(this.inputManager.mousePos);
    this.player.update(dt, this.inputManager, worldMousePos, speedMult);
    
    this.player.shoot((pos, angle) => {
      const p = new Projectile(pos.x, pos.y, angle, 800, false);
      p.damage *= dmgMult;
      this.projectiles.push(p);
      audioManager.playLaser();
    }, dt, this.inputManager);

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(dt);
      
      let destroyed = false;

      // Check collision with player
      if (p.isEnemy && checkCircleCollision(p.position, p.radius, this.player.position, 15)) {
        let remainingDamage = p.damage;
        
        // Damage shields first
        if (store.stats.shield > 0) {
          if (store.stats.shield >= remainingDamage) {
            store.updateStats({ shield: store.stats.shield - remainingDamage });
            remainingDamage = 0;
          } else {
            remainingDamage -= store.stats.shield;
            store.updateStats({ shield: 0 });
          }
          this.particleSystem.emitExplosion(p.position.x, p.position.y, '#06b6d4', 10); // Shield hit effect
        }
        
        // Damage health
        if (remainingDamage > 0) {
          store.updateStats({ health: Math.max(0, store.stats.health - remainingDamage) });
          this.particleSystem.emitExplosion(p.position.x, p.position.y, '#ef4444', 15); // Hull hit effect
        }

        destroyed = true;
      }

      if (destroyed || p.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }

    // Procedural Gen
    this.proceduralGen.update(this.player.position, this.asteroids, this.enemies);

    // Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      
      e.update(dt, this.player.position, (pos, angle) => {
        this.projectiles.push(new Projectile(pos.x, pos.y, angle, 800, true));
        audioManager.playLaser();
      });

      // Check collision with player projectiles
      let destroyed = false;
      for (let j = this.projectiles.length - 1; j >= 0; j--) {
        const p = this.projectiles[j];
        if (!p.isEnemy && checkCircleCollision(e.position, e.radius, p.position, p.radius)) {
          e.health -= p.damage;
          this.projectiles.splice(j, 1);
          this.particleSystem.emitExplosion(p.position.x, p.position.y, '#f59e0b', 5);
          
          if (e.health <= 0) {
            destroyed = true;
            this.particleSystem.emitExplosion(e.position.x, e.position.y, '#ef4444', 30);
            audioManager.playExplosion();
            break;
          }
        }
      }

      if (destroyed) {
        // Collect credits for destroying enemies
        store.addCredits(50);
        store.updateStats({ score: (store.stats.score || 0) + 100 });
        this.enemies.splice(i, 1);
      }
    }

    // Update asteroids and check collisions
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const a = this.asteroids[i];
      a.update(dt);
      
      // Check collision with projectiles
      let destroyed = false;
      for (let j = this.projectiles.length - 1; j >= 0; j--) {
        const p = this.projectiles[j];
        // Both player and enemy can shoot asteroids
        if (checkCircleCollision(a.position, a.radius, p.position, p.radius)) {
          a.health -= p.damage;
          this.projectiles.splice(j, 1); 
          this.particleSystem.emitExplosion(p.position.x, p.position.y, '#9ca3af', 5);
          
          if (a.health <= 0) {
            destroyed = true;
            this.particleSystem.emitExplosion(a.position.x, a.position.y, '#10b981', 20);
            audioManager.playExplosion();
            break;
          }
        }
      }
      
      if (destroyed) {
        store.updateInventory(a.resourceType, a.resourceYield);
        store.updateStats({ score: (store.stats.score || 0) + 10 });
        this.asteroids.splice(i, 1);
      }
    }

    // Update particles
    this.particleSystem.update(dt);

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

    // Draw Asteroids
    for (const a of this.asteroids) {
      a.draw(this.ctx);
    }

    // Draw Enemies
    for (const e of this.enemies) {
      e.draw(this.ctx);
    }

    // Draw Projectiles
    for (const p of this.projectiles) {
      p.draw(this.ctx);
    }

    // Draw Particles
    this.particleSystem.draw(this.ctx);

    // Draw Player
    // Hide player if dead
    if (useGameStore.getState().stats.health > 0) {
      this.player.draw(this.ctx);
    }

    this.ctx.restore();
  }
}
